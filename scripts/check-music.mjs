import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--autoplay-policy=user-gesture-required'] });
try {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('#loading', { state: 'hidden' });
  await page.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    window.music = (await import('/src/music-player.ts')).musicPlayer;
    window.audio = (await import('/src/audio-manager.ts')).audioManager;
    game.loop.stop();
  });
  assert.equal(await page.evaluate(() => !!music.voice), false, 'no autoplay before trusted interaction');
  await page.tap('#music-open');
  await page.waitForFunction(() => music.voice?.id === 'pixel-meadow-calm');
  const expected = [['pixel-meadow-calm',48],['pixel-meadow',48],['bitcade-overworld',51.2]];
  for (const [id, duration] of expected) {
    await page.selectOption('#music-track', id);
    await page.waitForFunction(id => music.voice?.id === id, id);
    const voice = await page.evaluate(() => ({ loop:music.voice.source.loop, duration:music.voice.source.buffer.duration, state:audio.audioContext.state }));
    assert.equal(voice.loop, true); assert.equal(voice.state, 'running');
    assert.ok(Math.abs(voice.duration-duration)<.03, `${id} loop length`);
  }
  // Rapid change while a different selection is pending must finish on the last choice.
  await page.selectOption('#music-track', 'pixel-meadow');
  await page.selectOption('#music-track', 'bitcade-overworld');
  await page.selectOption('#music-track', 'pixel-meadow-calm');
  await page.waitForFunction(() => music.voice?.id === 'pixel-meadow-calm');
  const jumps = await page.evaluate(() => game.scene.getScene('play').jumpStartedAt);
  await page.locator('#music-volume').focus(); await page.keyboard.press('Space');
  await page.evaluate(() => game.headlessStep(performance.now(), 16));
  assert.equal(await page.evaluate(() => game.scene.getScene('play').jumpStartedAt), jumps, 'music keyboard controls do not jump');
  await page.locator('#music-volume').fill('22'); await page.locator('#music-volume').dispatchEvent('input');
  await page.tap('#music-enabled');
  assert.equal(await page.evaluate(() => !!music.voice), false);
  await page.waitForFunction(() => audio.buffers.size === 14);
  assert.ok(await page.evaluate(() => { audio.resetRun(); audio.playJump(); return audio.voices.size > 0; }), 'music mute does not mute SFX');
  await page.reload(); await page.waitForSelector('#loading', { state: 'hidden' });
  assert.equal(await page.locator('#music-track').inputValue(), 'pixel-meadow-calm');
  assert.equal(await page.locator('#music-volume').inputValue(), '22');
  assert.equal(await page.locator('#music-enabled').getAttribute('aria-pressed'), 'false');
  await page.tap('#music-open'); await page.tap('#music-enabled');
  await page.waitForFunction(async () => (await import('/src/music-player.ts')).musicPlayer.voice?.id === 'pixel-meadow-calm');
  await page.screenshot({ path:'work/music-player-mobile.png' });
  assert.deepEqual(errors, []); await context.close();

  // Decode real MP3 fallbacks (Safari compatibility path), not synthetic test audio.
  const fallback = await browser.newContext({ ...devices['iPhone 13'] });
  const f = await fallback.newPage(), mp3Requests=[];
  await f.route('**/assets/audio/music/*.ogg', route => route.fulfill({contentType:'audio/ogg',body:'unsupported codec test'}));
  f.on('request', req => { if (/\/music\/.*\.mp3$/.test(req.url())) mp3Requests.push(req.url()); });
  await f.goto('http://localhost:5173/'); await f.waitForSelector('#loading', {state:'hidden'});
  await f.evaluate(async()=>{ window.music=(await import('/src/music-player.ts')).musicPlayer; });
  await f.tap('#music-open');
  for(const [id,duration] of expected) {
    await f.selectOption('#music-track',id);
    await f.waitForFunction(id=>music.voice?.id===id,id);
    assert.ok(Math.abs(await f.evaluate(()=>music.voice.source.buffer.duration)-duration)<.03, `${id} MP3 gapless duration`);
  }
  assert.equal(mp3Requests.length,3); await fallback.close();

  const missing = await browser.newContext({ ...devices['iPhone 13'] }), m=await missing.newPage();
  await m.route('**/assets/audio/music/*', route=>route.abort());
  await m.goto('http://localhost:5173/'); await m.waitForSelector('#loading',{state:'hidden'});
  await m.tap('#music-open');
  await m.waitForFunction(()=>document.querySelector('#music-status').textContent.includes('не загрузился'));
  assert.equal(await m.locator('#game canvas').count(),1); await missing.close();
  console.log('PASS: 3 actual looping tracks; gesture unlock; last selection wins; independent music mute/volume; persisted settings; real MP3 fallback durations; missing music never blocks startup.');
} finally { await browser.close(); }
