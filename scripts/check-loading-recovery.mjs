import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // Accelerate only the stalled resource's real browser XHR timeout in this test.
  await page.addInitScript(() => {
    const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (...args) { this.testSky = String(args[1]).endsWith('/sky.png'); return open.apply(this, args); };
    XMLHttpRequest.prototype.send = function (...args) { if (this.testSky) this.timeout = Math.min(this.timeout || Infinity, 400); return send.apply(this, args); };
  });
  let skyRequests = 0, failAll = false, allow = false;
  await page.route('**/assets/backgrounds/winter/sky.png', route => {
    skyRequests++;
    if (allow || (!failAll && skyRequests > 1)) return route.continue();
    // Leave the request stalled, not aborted: test the real timeout path.
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#loading', { state: 'hidden' });
  assert.equal(skyRequests, 2, 'one timed-out request gets one automatic retry');
  failAll = true; skyRequests = 0;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#loading-retry', { state: 'visible' });
  assert.equal(skyRequests, 2, 'persistent stalls stop after the bounded retry');
  assert.match(await page.locator('#loading-detail').textContent(), /sky\.png/);
  allow = true;
  await page.locator('#loading-retry').click();
  await page.waitForSelector('#loading', { state: 'hidden' });
  assert.deepEqual(errors, []);
  await context.close();

  const production = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'allow' });
  const p = await production.newPage();
  let release; const gate = new Promise(resolve => { release = resolve; });
  await p.route('**/assets/**/*.png', async route => { await gate; await route.continue(); });
  await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#loading', { state: 'visible' });
  assert.equal(await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0,
    'offline precache must not start while critical art is still loading');
  release();
  await p.waitForSelector('#loading', { state: 'hidden' });
  await p.evaluate(() => navigator.serviceWorker.ready);
  assert.equal(await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 1);
  await production.close();
  console.log('PASS: stalled PNG automatically retries; persistent stall shows filename/retry; retry recovers; offline installation starts only after playable scene.');
} finally { await browser.close(); }
