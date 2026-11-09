import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const inputs = JSON.parse(readFileSync(new URL('./fixtures/collectible-inputs.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('#loading', { state: 'hidden' });
  await page.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    const url = performance.getEntriesByType('resource').find(e => new URL(e.name).pathname === '/src/npc-visual.ts').name;
    window.npc = (await import(url)).NpcVisual;
    window.hazardShapes = (await import('/src/hazard-shapes.ts')).hazardShapes;
  });
  const result = await page.evaluate(inputs => {
    game.loop.stop(); let now = performance.now();
    const tick = () => game.headlessStep(now += 1000 / 60, 1000 / 60);
    const key = down => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    const restart = () => { key(false); game.scene.start('play'); for (let i = 0; i < 4; i++) tick(); return game.scene.getScene('play'); };
    const hazards = scene => [...scene.grannies, ...scene.scooters, ...scene.pigeons].map(a => a.sprite);
    const replay = () => {
      const scene = restart(), start = scene.time.now;
      const bodies = hazards(scene).map(a => [a.texture.key, a.width, a.height, a.body.width, a.body.height, a.body.offset.x, a.body.offset.y]);
      const frames = []; let index = 0;
      for (let i = 0; i < 10000 && !scene.finished; i++) {
        if (inputs[index] && (scene.time.now - start) / 1000 >= inputs[index].time - 1e-6) { key(true); index++; }
        tick(); key(false);
        frames.push([scene.tanya.x, scene.tanya.y, scene.energy, scene.foodCount, scene.liptonUses,
          scene.falls, scene.recoveries, scene.boostsUsed,
          ...hazards(scene).flatMap(a => [a.body.x, a.body.y, a.body.velocity.x, a.body.velocity.y, a.body.enable])]);
      }
      return { bodies, frames, finished: scene.finished };
    };
    const attach = npc.attach; npc.attach = () => undefined;
    const before = replay(); npc.attach = attach;
    const after = replay();
    const impacts = enabled => {
      npc.attach = enabled ? attach : () => undefined;
      return ['granny', 'scooter', 'pigeons'].map(kind => {
        const scene = restart(), actor = (kind === 'granny' ? scene.grannies : kind === 'scooter' ? scene.scooters : scene.pigeons)[0].sprite;
        const rect = hazardShapes[kind][0], body = scene.tanya.body;
        const x = actor.body.x - actor.body.offset.x + rect.x + rect.width / 2;
        const y = actor.body.y - actor.body.offset.y + rect.y + rect.height / 2;
        scene.tanya.setPosition(x, y); body.position.set(x - body.halfWidth, y - body.halfHeight); body.updateCenter();
        const energy = scene.energy; scene.updateNewObjects(0);
        return { kind, damage: Math.round(energy - scene.energy), width: actor.body.width, height: actor.body.height };
      });
    };
    const originalImpacts = impacts(false), pngImpacts = impacts(true); npc.attach = attach;
    const scene = restart(), flock = scene.pigeons[0];
    const visual = scene.npcVisuals.find(v => v.images.length === 3);
    const poseNames = () => visual.images.map(i => i.texture.key);
    flock.flying = false; visual.sync(); const grounded = poseNames();
    flock.flying = true; flock.lowFlightRemaining = .7; visual.sync(); const startled = poseNames();
    flock.lowFlightRemaining = 0; visual.sync(); const takeoff = poseNames();
    const scooter = scene.npcVisuals.find(v => v.state === 'scooter');
    scene.scooters[0].sprite.body.enable = false; scooter.sync();
    const retiredHidden = scooter.images.every(i => !i.visible);
    scene.changeEnergy(9 - scene.energy); scene.foodCount = 28; scene.updateHud();
    const hud = { state: document.querySelector('#hud-art').dataset.state, energy: document.querySelector('#energy-value').textContent,
      food: document.querySelector('#food-count').textContent, aria: document.querySelector('.energy-track').getAttribute('aria-valuenow'),
      buttons: document.querySelectorAll('#hud button').length };
    const repeated = [];
    for (let i = 0; i < 4; i++) {
      const s = restart();
      repeated.push({ textures: s.textures.getTextureKeys().length,
        images: s.children.list.filter(o => o.getData('npcVisual')).length,
        listeners: s.events.listenerCount('prerender'),
        oversizedSources: s.textures.getTextureKeys().filter(k => k.startsWith('npc:') && k.endsWith(':source')).length });
    }
    return { before, after, originalImpacts, pngImpacts, grounded, startled, takeoff, retiredHidden, hud, repeated };
  }, inputs);
  assert.ok(result.before.finished && result.after.finished);
  assert.deepEqual(result.after, result.before, 'NPC artwork preserves every hazard body, motion and gameplay replay frame');
  assert.deepEqual(result.pngImpacts, result.originalImpacts, 'new NPC drawings preserve actual collision damage');
  assert.deepEqual(result.pngImpacts.map(i => i.damage), [15, 12, 6]);
  assert.ok(result.grounded.includes('npc:pigeon-standing') && result.grounded.includes('npc:pigeon-walking'));
  assert.ok(result.startled.every(k => k === 'npc:pigeon-startled'));
  assert.ok(result.takeoff.includes('npc:pigeon-takeoff'));
  assert.ok(result.retiredHidden, 'disabled scooter cannot leave visible artwork');
  assert.deepEqual(result.hud, { state: 'low', energy: '9', food: 'Корм: 28', aria: '9', buttons: 0 });
  assert.ok(result.repeated.every(r => r.images === 14 && r.oversizedSources === 0));
  assert.ok(result.repeated.every(r => JSON.stringify(r) === JSON.stringify(result.repeated[0])), 'no restart texture/image/listener growth');
  assert.deepEqual(errors, []);
  console.log(`PASS: ${result.before.frames.length} identical replay frames, 10 unchanged hazard bodies, all four pigeon states, live two-block HUD and stable restarts`);
} finally { await browser.close(); }
