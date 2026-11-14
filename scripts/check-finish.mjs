import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:5173/');
  await page.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    window.cfg = (await import('/src/settings.ts')).settings;
    window.floorAt = (await import('/src/settings.ts')).groundYAt;
  });
  await page.waitForFunction(() => game.scene.getScene('play')?.tanya?.body);
  const results = await page.evaluate(() => {
    game.loop.stop(); let now = performance.now();
    const key = down => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    const tick = delta => game.headlessStep(now += delta, delta);
    const results = [], catX = cfg.levelWidth - 150;
    for (const fps of [15, 60, 120]) for (const mode of ['boost', 'jump', 'run', 'tired-boost']) for (const food of [cfg.requiredFood - 1, cfg.requiredFood, cfg.bonusFood]) {
      const delta = 1000 / fps;
      key(false); game.scene.start('play'); for (let i = 0; i < 4; i++) tick(delta);
      const scene = game.scene.getScene('play'), body = scene.tanya.body;
      // Start on the final safe stretch, then use ordinary jump/boost inputs.
      const x = catX - 140, floor = floorAt(x);
      // Isolate finish scoring from the packet at this test spawn point.
      for (const pickup of [...scene.physics.world.staticBodies.entries]) {
        if (pickup.gameObject.texture?.key === 'food' && pickup.gameObject.x >= x - 40) pickup.gameObject.destroy();
      }
      body.reset(x, floor - 26);
      body.position.set(x - body.halfWidth, floor - body.height);
      body.prev.copy(body.position); body.prevFrame.copy(body.position); body.updateCenter();
      body.blocked.down = body.touching.down = true;
      if (mode === 'tired-boost') scene.changeEnergy(-100);
      tick(delta);
      scene.foodCount = food;
      const prematurelyFinished = scene.finished;
      if (mode !== 'run') key(true);
      tick(delta); key(false);
      let frames = 0, boosted = false;
      while (!scene.finished && frames++ < fps * 8) {
        if (mode.includes('boost') && !boosted && frames * delta >= 80) { key(true); boosted = true; }
        tick(delta); key(false);
      }
      const finishX = scene.tanya.x, falls = scene.falls, recoveries = scene.recoveries;
      const airborne = !body.blocked.down;
      for (let i = 0; i < fps * 4.5; i++) { key(i % 2 === 0); tick(delta); } key(false);
      results.push({ fps, mode, food, finalFood: scene.foodCount, prematurelyFinished, finished: scene.finished, finishX,
        airborne, boosts: scene.boostsUsed, falls, recoveries,
        stable: scene.tanya.x === finishX && scene.falls === falls && scene.recoveries === recoveries,
        endingVisible: !document.querySelector('#ending').hidden, title: document.querySelector('#end-title').textContent });
    }
    game.scene.start('play'); for (let i = 0; i < 4; i++) tick(1000 / 60);
    const scene = game.scene.getScene('play');
    return { results, restart: { finished: scene.finished, food: scene.foodCount, x: scene.tanya.x, endingHidden: document.querySelector('#ending').hidden } };
  });
  for (const row of results.results) {
    const label = `${row.mode}, ${row.fps}fps, food=${row.food}`;
    assert.ok(!row.prematurelyFinished, `no finish before the cat: ${label}`);
    assert.ok(row.finished, `finish cannot be jumped over: ${label}`);
    assert.ok(row.finishX < 10730 && row.stable && row.endingVisible, `stay in level and show ending: ${label}`);
    assert.equal(row.falls, 0, `no end-of-level fall: ${label}`);
    assert.equal(row.recoveries, 0, `no end-of-level recovery: ${label}`);
    if (row.food >= 80) assert.ok(!row.airborne, `successful finale grounds Tanya: ${label}`);
    assert.equal(row.finalFood, row.food, `preserve food count: ${label}`);
    if (row.mode.includes('boost')) assert.equal(row.boosts, 1, `actual boost: ${label}`);
    if (row.mode !== 'run' && row.food < 80) assert.ok(row.airborne, `finish during the jump: ${label}`);
    assert.equal(row.title, row.food < 80 ? 'Котику не хватило корма' : row.food >= 103 ? 'Кошачий пир! 🐈🎉' : 'Котик накормлен ❤️', `preserve food outcomes: ${label}`);
  }
  assert.ok(!results.restart.finished && results.restart.food === 0 && results.restart.x < 150 && results.restart.endingHidden);
  assert.deepEqual(errors, []);
  console.log(`PASS: ${results.results.length} finish cases (run, jump, boost, tired boost; 15/60/120fps; all food outcomes), no runaway/recovery, stable ending and explicit restart`);
} finally { await browser.close(); }
