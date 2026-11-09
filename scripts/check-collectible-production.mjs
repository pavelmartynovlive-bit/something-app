import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const pack = JSON.parse(readFileSync('art-assets/winter-npc-hud-pack/manifest.json', 'utf8'));
const expected = [
  { file: 'collectibles/food.png', width: 1312, height: 1199 },
  { file: 'collectibles/lipton.png', width: 713, height: 2206 },
  ...pack.assets.map(a => ({ file: `${a.name.startsWith('hud-') ? 'hud' : 'npcs'}/${a.file}`, width: a.width, height: a.height })),
];
const files = expected.map(a => a.file);
const hashes = files.map(file => createHash('sha256').update(readFileSync(`public/assets/${file}`)).digest('hex'));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const context = await browser.newContext({ ...devices['iPhone 13'], userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1' });
  const page = await context.newPage(), errors = [], failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto(process.env.PRODUCTION_URL || 'http://localhost:4173/');
  await page.waitForSelector('canvas');
  await page.waitForSelector('#loading', { state: 'hidden' });
  await page.waitForFunction(() => document.querySelector('#distance').textContent.includes('%'));
  assert.ok(await page.evaluate(() => !!document.querySelector('canvas').getContext('2d')), 'iPhone production uses the compatible Canvas renderer');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const cached = await page.evaluate(async files => Promise.all(files.map(async file => {
    const response = await caches.match(new URL(`assets/${file}`, document.baseURI).href);
    if (!response) throw Error(`PNG missing from offline cache: ${file}`);
    const blob = await response.blob(), image = await createImageBitmap(blob);
    return { file, width: image.width, height: image.height };
  })), files);
  assert.deepEqual(cached, expected);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('canvas');
  await page.waitForSelector('#loading', { state: 'hidden' });
  const offlineHashes = await page.evaluate(async files => Promise.all(files.map(async file => {
    const response = await fetch(new URL(`assets/${file}`, document.baseURI));
    if (!response.ok) throw Error(`Offline PNG unavailable: ${file}`);
    const hash = await crypto.subtle.digest('SHA-256', await response.arrayBuffer());
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  })), files);
  assert.deepEqual(offlineHashes, hashes, 'offline originals are byte-for-byte identical');
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  console.log(`PASS: ${files.length} production PNGs (collectibles, NPCs and HUD), offline startup and original SHA-256 hashes`);
} finally { await browser.close(); }
