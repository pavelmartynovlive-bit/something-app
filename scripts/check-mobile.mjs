import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  for (const [name, options, blockGPU] of [
    ['iPhone Chrome, no WebGL', { ...devices['iPhone 13'], userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1' }, true],
    ['Android Chrome', { ...devices['Pixel 7'] }, false],
  ]) {
    const context = await browser.newContext(options), page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (blockGPU) await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        if (kind.toLowerCase().includes('webgl')) return null;
        return getContext.call(this, kind, ...args);
      };
    });
    // Hold image downloads to verify that a slow mobile connection has a
    // visible loading screen rather than an unexplained blank canvas.
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/assets/**/*.png', async route => { await gate; await route.continue(); });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#loading', { state: 'visible' });
    assert.match(await page.locator('#loading-title').textContent(), /Загружаем/);
    release();
    await page.waitForSelector('#loading', { state: 'hidden' });
    await page.evaluate(async () => {
      window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
      game.loop.stop(); window.mobileNow = performance.now();
      window.mobileTick = (n = 1) => { for (let i = 0; i < n; i++) game.headlessStep(mobileNow += 1000 / 60, 1000 / 60); };
      mobileTick(4);
    });
    assert.equal(await page.locator('#game canvas').count(), 1);
    if (blockGPU) {
      assert.equal(await page.evaluate(() => game.renderer.type), 1, 'iPhone runs on Canvas without a WebGL context');
      assert.ok(await page.evaluate(() => {
        const canvas = game.canvas, context = canvas.getContext('2d');
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data, colors = new Set();
        for (let i = 0; i < pixels.length; i += 1024) colors.add(`${pixels[i]}:${pixels[i + 1]}:${pixels[i + 2]}`);
        return colors.size > 30;
      }), 'iPhone canvas contains the painted winter scene, not just its background color');
    }
    const bounds = await page.locator('#game canvas').boundingBox();
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height * .65);
    await page.evaluate(() => mobileTick(6));
    assert.ok(await page.evaluate(() => game.scene.getScene('play').tanya.body.velocity.y < 0), `${name}: tap jumps`);
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height * .65);
    await page.evaluate(() => mobileTick());
    assert.equal(await page.evaluate(() => game.scene.getScene('play').boostsUsed), 1, `${name}: second tap boosts`);
    assert.ok(await page.locator('#hint').isHidden());
    await page.setViewportSize({ width: 844, height: 390 });
    await page.evaluate(() => mobileTick(3));
    assert.ok(await page.evaluate(() => game.scene.getScene('play').physics.world.isPaused), `${name}: rotation pauses`);
    await page.setViewportSize(options.viewport);
    await page.evaluate(() => mobileTick(3));
    assert.ok(await page.evaluate(() => !game.scene.getScene('play').physics.world.isPaused), `${name}: portrait resumes`);
    assert.deepEqual(errors, []);
    console.log(`PASS: ${name}: slow loading, playable scene, tap/boost, portrait/landscape recovery`);
    await context.close();
  }
  const context = await browser.newContext(devices['iPhone 13']), page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let fail = true;
  await page.route('**/assets/collectibles/food.png', route => fail ? route.abort() : route.continue());
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('#loading-retry', { state: 'visible' });
  assert.match(await page.locator('#loading-title').textContent(), /Не удалось/);
  fail = false;
  await page.locator('#loading-retry').click();
  await page.waitForSelector('#loading', { state: 'hidden' });
  assert.deepEqual(errors, []);
  console.log('PASS: failed image download shows retry; retry loads a playable scene');
  await context.close();
} finally { await browser.close(); }
