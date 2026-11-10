import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const files = JSON.parse(readFileSync('art-assets/audio/processing.json', 'utf8')).files;
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--autoplay-policy=user-gesture-required'] });
try {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.PRODUCTION_URL || 'http://localhost:4173/');
  await page.waitForSelector('#loading', { state: 'hidden' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const cache = await page.evaluate(async () => {
    const keys = await caches.keys(), urls = (await Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(r => r.url)))).flat();
    return { audio: urls.filter(u => /\/audio\/sfx\/.*\.wav$/.test(u)), sources: urls.filter(u => u.includes('/audio/source/')) };
  });
  assert.equal(cache.audio.length, 18); assert.equal(cache.sources.length, 0);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('#loading', { state: 'hidden' });
  const result = await page.evaluate(async names => {
    const context = new AudioContext(), files = [];
    for (const name of names) {
      const response = await fetch(new URL(`assets/audio/sfx/${name}.wav`, document.baseURI));
      if (!response.ok) throw Error(`Missing offline SFX ${name}`);
      const bytes = await response.arrayBuffer();
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const buffer = await context.decodeAudioData(bytes);
      files.push({ name, duration: buffer.duration, hash: [...new Uint8Array(hash)].map(v => v.toString(16).padStart(2, '0')).join('') });
    }
    await context.close(); return files;
  }, Object.keys(files));
  for (const file of result) {
    assert.equal(file.hash, files[file.name].sha256);
    assert.ok(Math.abs(file.duration - files[file.name].durationSeconds) < .0002);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: production startup/offline reload; all 18 actual SFX cached, decoded and hash-verified; original editing sources excluded from precache.');
} finally { await browser.close(); }
