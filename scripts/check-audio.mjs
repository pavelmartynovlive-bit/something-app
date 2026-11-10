import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Synthetic signal is served only by this test's route, never saved as a game asset.
const fixture = Buffer.alloc(44 + 4410 * 2);
fixture.write('RIFF'); fixture.writeUInt32LE(fixture.length - 8, 4); fixture.write('WAVEfmt ', 8);
fixture.writeUInt32LE(16, 16); fixture.writeUInt16LE(1, 20); fixture.writeUInt16LE(1, 22);
fixture.writeUInt32LE(44100, 24); fixture.writeUInt32LE(88200, 28); fixture.writeUInt16LE(2, 32);
fixture.writeUInt16LE(16, 34); fixture.write('data', 36); fixture.writeUInt32LE(fixture.length - 44, 40);
for (let i = 0; i < 4410; i++) fixture.writeInt16LE(Math.round(Math.sin(i * .06) * 1000), 44 + i * 2);
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--autoplay-policy=user-gesture-required'] });
try {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/assets/audio/sfx/*.wav', route => route.fulfill({ contentType: 'audio/wav', body: fixture }));
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('#loading', { state: 'hidden' });
  await page.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    window.audio = (await import('/src/audio-manager.ts')).audioManager;
    game.loop.stop();
  });
  await page.waitForFunction(() => audio.buffers.size === 14);
  // A real touch event unlocks AudioContext; no test-only force-resume.
  await page.tap('#game canvas', { position: { x: 100, y: 180 } });
  await page.waitForFunction(() => audio.unlocked && audio.context.state === 'running');
  const result = await page.evaluate(() => {
    const scene = game.scene.getScene('play'), methods = Object.getOwnPropertyNames(Object.getPrototypeOf(audio)).filter(n => n.startsWith('play') && n !== 'play');
    const calls = [];
    for (const name of methods) { const original = audio[name].bind(audio); audio[name] = (...args) => { calls.push(name); return original(...args); }; }
    const body = scene.tanya.body;
    const tick = () => game.headlessStep(performance.now(), 1000 / 60);
    const count = method => calls.filter(n => n === method).length;
    // Airborne movement below thresholds is silent; a real descent gets one sound.
    scene.observeLanding(false, { bottom: 400 }); scene.time.now += 180;
    scene.observeLanding(true, { bottom: 410 });
    const microLanding = count('playLanding');
    scene.observeLanding(false, { bottom: 400 }); scene.time.now += 180;
    scene.observeLanding(true, { bottom: 440 }); scene.observeLanding(true, { bottom: 440 });
    const realLanding = count('playLanding');
    // Valid jump sounds once; the boost does not falsely count as a new takeoff.
    scene.lastGround = scene.time.now; scene.bufferedJump = scene.time.now;
    scene.update(scene.time.now, 16); const jumps = count('playJump');
    // Kill-zone arrival, not beginFall().
    scene.beginFall(); const pitAtStart = count('playPitFall');
    body.y = scene.fallZone.killY - body.height - 10; scene.updatePitFall();
    const pitAbove = count('playPitFall');
    body.y = scene.fallZone.killY - body.height + 1; scene.updatePitFall();
    scene.respawn();
    // Per-event WeakSets survive repeated physics callbacks and remain separate per kind.
    audio.resetRun(); const token = {};
    audio.playFoodPickup(token); audio.playFoodPickup(token);
    const foodVoices = [...audio.voices].filter(v => v.kind === 'food').length;
    audio.playPigeonTakeoff(token); audio.playPigeonTakeoff(token);
    const pigeonVoices = [...audio.voices].filter(v => v.kind === 'pigeon').length;
    audio.playGrannyHit(); audio.playGrannyHit();
    const grannyVoices = [...audio.voices].filter(v => v.kind === 'granny').length;
    audio.playScooterHit(); audio.playScooterHit();
    const scooterVoices = [...audio.voices].filter(v => v.kind === 'scooter').length;
    const ranges = [...audio.voices].map(v => [v.source.detune.value, v.gain.gain.value]);
    const uiVoices = () => [...audio.voices].filter(v => v.kind === 'ui').length;
    audio.playUIClick(); audio.resetRun(); const uiSurvivesReplay = uiVoices();
    return { microLanding, realLanding, jumps, pitAtStart, pitAbove, respawn: count('playRespawn'),
      pit: count('playPitFall'), foodVoices, pigeonVoices, grannyVoices, scooterVoices, ranges, uiSurvivesReplay };
  });
  assert.equal(result.microLanding, 0); assert.equal(result.realLanding, 1); assert.equal(result.jumps, 1);
  assert.equal(result.pitAtStart, 0); assert.equal(result.pitAbove, 0); assert.equal(result.pit, 1); assert.equal(result.respawn, 1);
  for (const key of ['foodVoices', 'pigeonVoices', 'grannyVoices', 'scooterVoices', 'uiSurvivesReplay']) assert.equal(result[key], 1, key);
  assert.ok(result.ranges.every(([detune, volume]) => Math.abs(detune) <= 25 && volume > 0 && volume < .5));
  assert.deepEqual(errors, []);
  // Replay the actual level with and without AudioManager: every simulation frame agrees.
  const replayInputs = JSON.parse(readFileSync('scripts/fixtures/collectible-inputs.json', 'utf8'));
  const replay = await page.evaluate(inputs => {
    let clock = performance.now();
    const tick = () => game.headlessStep(clock += 1000 / 60, 1000 / 60);
    const key = down => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    const names = Object.getOwnPropertyNames(Object.getPrototypeOf(audio)).filter(n => n.startsWith('play') && n !== 'play');
    const original = Object.fromEntries(names.map(n => [n, audio[n]]));
    const run = enabled => {
      const calls = [];
      for (const name of names) audio[name] = enabled ? (...args) => { calls.push(name); return original[name].apply(audio, args); } : () => {};
      key(false); game.scene.start('play'); for (let i = 0; i < 4; i++) tick();
      const scene = game.scene.getScene('play'), start = scene.time.now, frames = [];
      let index = 0;
      for (let i = 0; i < 10000 && !scene.finished; i++) {
        if (inputs[index] && (scene.time.now - start) / 1000 >= inputs[index].time - 1e-6) { key(true); index++; }
        tick(); key(false);
        frames.push([scene.tanya.x, scene.tanya.y, scene.energy, scene.foodCount, scene.liptonUses, scene.benchUses,
          scene.falls, scene.recoveries, scene.boostsUsed, scene.finished]);
      }
      return { frames, finished: scene.finished, calls };
    };
    const silent = run(false), audible = run(true);
    return { silent, audible };
  }, replayInputs);
  assert.ok(replay.silent.finished && replay.audible.finished);
  assert.deepEqual(replay.audible.frames, replay.silent.frames, 'SFX never change gameplay');
  for (const event of ['playJump', 'playLanding', 'playFoodPickup', 'playLiptonPickup', 'playPigeonTakeoff', 'playCatMeow'])
    assert.ok(replay.audible.calls.includes(event), event);
  console.log(`PASS: ${replay.audible.frames.length} identical gameplay frames with audio enabled/disabled and real level event hooks`);
  // Optional audio 404/corrupt response and a stalled download never block startup.
  const missing = await context.newPage(), missingErrors = [];
  missing.on('pageerror', e => missingErrors.push(e.message));
  await missing.route('**/assets/audio/sfx/*.wav', async route => {
    if (route.request().url().endsWith('/jump.wav')) return route.fulfill({ status: 404, body: '' });
    if (route.request().url().endsWith('/snow_land.wav')) return route.fulfill({ contentType: 'audio/wav', body: 'invalid WAV' });
    if (route.request().url().endsWith('/food_pickup.wav')) return; // request intentionally held
    return route.fulfill({ contentType: 'audio/wav', body: fixture });
  });
  await missing.goto('http://localhost:5173/');
  await missing.waitForSelector('#loading', { state: 'hidden' });
  await missing.tap('#game canvas', { position: { x: 100, y: 180 } });
  await missing.waitForFunction(async () => {
    const { audioManager } = await import('/src/audio-manager.ts');
    return audioManager.buffers.size === 11;
  });
  assert.deepEqual(missingErrors, []);
  await missing.close();
  // Real supplied/processed assets, without audio route fixtures.
  const actual = await context.newPage();
  const actualErrors = []; actual.on('pageerror', e => actualErrors.push(e.message));
  await actual.goto('http://localhost:5173/');
  await actual.waitForSelector('#loading', { state: 'hidden' });
  await actual.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    window.audio = (await import('/src/audio-manager.ts')).audioManager; game.loop.stop();
  });
  await actual.waitForFunction(() => audio.buffers.size === 14);
  await actual.tap('#game canvas', { position: { x: 100, y: 180 } });
  await actual.waitForFunction(() => audio.unlocked && audio.context.state === 'running');
  const processed = JSON.parse(readFileSync('art-assets/audio/processing.json', 'utf8')).files;
  const decoded = await actual.evaluate(async files => {
    const decoded = [];
    for (const name of Object.keys(files)) {
      const response = await fetch(`/assets/audio/sfx/${name}.wav`);
      const bytes = await response.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const buffer = await audio.context.decodeAudioData(bytes);
      decoded.push({ name, duration: buffer.duration, channels: buffer.numberOfChannels,
        hash: [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('') });
    }
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(audio)).filter(n => n.startsWith('play') && n !== 'play');
    for (const method of methods) {
      audio.resetRun(); audio[method]({});
      if (![...audio.voices].some(v => method === 'playUIClick' ? v.kind === 'ui' : v.kind !== 'ui')) throw Error(`No actual voice for ${method}`);
    }
    return decoded;
  }, processed);
  assert.equal(decoded.length, 18);
  for (const file of decoded) {
    assert.ok(Math.abs(file.duration - processed[file.name].durationSeconds) < .0002);
    assert.equal(file.channels, 1); assert.equal(file.hash, processed[file.name].sha256);
  }
  assert.deepEqual(actualErrors, []);
  await actual.close();
  console.log('PASS: all 18 actual WAVs decode with expected hashes/durations; all 13 public event methods start real Web Audio voices.');
  console.log('PASS: real Web Audio decoding/gesture unlock in iPhone Chromium emulation; 14 runtime clips; landing thresholds; kill-zone timing; event dedupe/cooldowns; missing/corrupt/stalled audio does not block startup. Safari/Brave hardware remains unverified.');
} finally { await browser.close(); }
