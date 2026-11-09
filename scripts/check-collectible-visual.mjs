// Replay ordinary inputs with procedural art and the actual uploaded PNGs.
// Compare pickup bodies and physics/rewards on every frame, including restart.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const inputs = JSON.parse(readFileSync(new URL('./fixtures/collectible-inputs.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const errors = [];
  const failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto('http://localhost:5173');
  await page.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    const visualUrl = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === '/src/collectible-visual.ts').name;
    window.visual = await import(visualUrl);
  });
  await page.waitForFunction(() => game.scene.getScene('play')?.tanya?.body);
  assert.equal(await page.locator('#game canvas').count(), 1, 'inspect the running game without creating a second instance');
  const result = await page.evaluate(inputs => {
    game.loop.stop();
    let now = performance.now();
    const tick = () => game.headlessStep(now += 1000 / 60, 1000 / 60);
    const key = down => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    const replay = () => {
      key(false); game.scene.start('play'); for (let i = 0; i < 4; i++) tick();
      const scene = game.scene.getScene('play'), start = scene.time.now;
      const bodies = scene.physics.world.staticBodies.entries.filter(b => ['food', 'lipton'].includes(b.gameObject.texture?.key))
        .map(b => [b.gameObject.texture.key, b.x, b.y, b.width, b.height]);
      const frames = []; let index = 0;
      for (let i = 0; i < 10000 && !scene.finished; i++) {
        if (inputs[index] && (scene.time.now - start) / 1000 >= inputs[index].time - 1e-6) { key(true); index++; }
        tick(); key(false);
        frames.push([scene.tanya.x, scene.tanya.y, scene.energy, scene.foodCount, scene.liptonUses, scene.falls, scene.boostsUsed]);
      }
      return { bodies, frames, finished: scene.finished };
    };
    const apply = visual.CollectibleVisual.apply;
    visual.CollectibleVisual.apply = () => {};
    const before = replay();
    const baselineFrames = game.scene.getScene('play').physics.world.staticBodies.entries
      .filter(b => ['food', 'lipton'].includes(b.gameObject.texture?.key)).map(b => b.gameObject.frame.name);
    visual.CollectibleVisual.apply = apply;
    const after = replay();
    const scene = game.scene.getScene('play');
    const assets = Object.entries(visual.collectibleArt).map(([kind, art]) => {
      const source = scene.textures.get(art.sourceKey).getSourceImage();
      const display = scene.textures.get(art.displayKey).getSourceImage();
      return { kind, width: source.width, height: source.height, displayWidth: display.width, displayHeight: display.height };
    });
    const applied = scene.physics.world.staticBodies.entries.filter(b => ['food', 'lipton'].includes(b.gameObject.texture?.key))
      .every(b => b.gameObject.frame.name === 'png');
    const sourceCounts = ['food', 'lipton'].map(kind => scene.textures.get(kind).source.length);
    const restarted = replay();
    const restartCounts = ['food', 'lipton'].map(kind => scene.textures.get(kind).source.length);
    // Exercise rendering as well as headless physics with the new frame sources.
    game.step(now, 0);
    const depths = scene.physics.world.staticBodies.entries.filter(b => ['food', 'lipton'].includes(b.gameObject.texture?.key))
      .every(b => b.gameObject.depth === (b.gameObject.texture.key === 'lipton' ? 6 : 5));
    return { before, after, restarted, assets, baselineFrames, applied, depths, sourceCounts, restartCounts };
  }, inputs);
  assert.deepEqual(result.assets, [
    { kind: 'food', width: 1312, height: 1199, displayWidth: 36, displayHeight: 40 },
    { kind: 'lipton', width: 713, height: 2206, displayWidth: 42, displayHeight: 52 },
  ], 'uploaded original PNGs load and normalize into the original frame dimensions');
  assert.ok(result.applied);
  assert.ok(result.baselineFrames.length > 0 && result.baselineFrames.every(frame => frame === '__BASE'), `baseline uses procedural frames: ${JSON.stringify(result.baselineFrames)}`);
  assert.ok(result.depths, 'bottles draw in front of overlapping packets');
  assert.ok(result.before.finished && result.after.finished && result.restarted.finished);
  assert.deepEqual(result.after, result.before, 'PNG frames preserve every pickup body and every replay frame');
  assert.deepEqual(result.restarted, result.before, 'scene restart preserves gameplay');
  assert.deepEqual(result.restartCounts, result.sourceCounts, 'restart does not add duplicate sources');
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  console.log(`PASS: actual food/Lipton PNGs, ${result.before.bodies.length} unchanged pickup bodies, ${result.before.frames.length} identical gameplay frames, rendering and restart`);
} finally { await browser.close(); }
