// Deterministic 60Hz playthroughs of the actual Phaser scene and real tap/Space input.
// Policy uses visible terrain/hazards and authored optional food trajectories; no teleporting in full runs.
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: Number(process.env.AUDIT_WIDTH || 844), height: Number(process.env.AUDIT_HEIGHT || 390) }, hasTouch: process.env.AUDIT_TOUCH === '1' });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(process.env.LEVEL_URL || 'http://localhost:5173');
  await page.waitForFunction(() => !!document.querySelector('canvas'));
  await page.evaluate(async () => {
    window.game = (await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
    const c = await import('/src/settings.ts'), t = await import('/src/terrain.ts');
    window.cfg = c.settings; window.sections = c.levelSections; window.rewards = c.rewardJumps; window.choices = c.routeChoices; window.decisions = c.rhythmDecisions; window.terrain = t;
  });
  await page.waitForFunction(() => game.isRunning && game.scene.getScene('play')?.tanya?.body);
  await page.evaluate(() => {
    game.loop.stop(); window.simTime = performance.now();
    window.tick = (n = 1) => { for (let i = 0; i < n; i++) { simTime += 1000 / 60; game.headlessStep(simTime, 1000 / 60); } };
    window.key = d => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    window.restart = () => { key(false); game.scene.start('play'); tick(4); const s = game.scene.getScene('play'); s.hit = Object.getPrototypeOf(s).hit; s.respawn = Object.getPrototypeOf(s).respawn; return s; };
  });
  const result = await page.evaluate(() => {
    const metrics = [];
    for (const tired of [false, true]) {
      const s = restart(); if (tired) s.changeEnergy(-100); tick(2);
      const b = s.tanya.body; let min = b.bottom; key(true); tick(); key(false); const start = s.time.now, x = s.tanya.x; let air = false;
      for (let i = 0; i < 100; i++) { tick(); min = Math.min(min, b.bottom); air ||= b.bottom < cfg.floorY - 1; if (air && b.blocked.down) { metrics.push({ tired, height: cfg.floorY - min, seconds: (s.time.now - start) / 1000, reach: s.tanya.x - x }); break; } }
    }
    const transitions = [];
    // Independently validate all mandatory step-ups, at both speeds and across a timing window.
    for (const tr of terrain.terrainTransitions.filter(t => t.rise > 0)) {
      const samples = [];
      for (const tired of [false, true]) for (const lead of tired ? [35, 45, 55] : [105, 125, 145]) {
        const s = restart(); for (const p of s.pigeons) p.sprite.destroy(); s.pigeons = []; for (const g of s.grannies) g.sprite.destroy(); s.grannies = []; for (const sc of s.scooters) sc.sprite.destroy(); s.scooters = [];
        s.tanya.body.reset(tr.x - lead - (tired ? 6 : 11), tr.fromY - 26); if (tired) s.changeEnergy(-100); tick(2);
        key(true); tick(); key(false); let blocked = 0, landed = false, landingX = null;
        for (let f = 0; f < 85; f++) { tick(); blocked += Number(s.tanya.body.blocked.right); if (s.tanya.x > tr.x + 20 && s.tanya.body.blocked.down && Math.abs(s.tanya.body.bottom - tr.toY) < 2) { landed = true; landingX ??= s.tanya.x; } }
        samples.push({ tired, lead, landed, blocked, landingX, fullFootLandingMargin: landingX === null ? null : landingX - tr.x - 12 });
      }
      transitions.push({ ...tr, tiredHeightMargin: metrics[1].height - tr.rise, samples });
    }
    const runs = [];
    for (const mode of ['natural', 'ground', 'collector', 'low-energy', 'mistake', 'locked-zero']) {
      const s = restart(), start = s.time.now; const hits = [], jumps = [], rests = [], bottles = [], decisionEvents = [], trajectory = [], waits = [], collected = [];
      const framingSamples = [], hazardReadings = [], foodReadings = []; const seenHazards = new Set();
      let resets = 0, prevVy = 0, prevRest = 0, thresholdTime = null, bonusTime = null, attemptedMiss = false, maxCameraStep = 0;
      const usedRewards = new Set(), usedDecisions = new Set(), usedChoices = new Set();
      const baseHit = Object.getPrototypeOf(s).hit; s.hit = function(d) { const accepted = baseHit.call(this, d); if (accepted) hits.push({ x: this.tanya.x, time: (this.time.now - start) / 1000, damage: d }); return accepted; };
      const baseReset = Object.getPrototypeOf(s).respawn; s.respawn = function() { resets++; baseReset.call(this); };
      if (mode === 'low-energy' || mode === 'locked-zero') s.changeEnergy(-100);
      if (mode === 'locked-zero') for (const body of s.physics.world.staticBodies.entries) if (body.gameObject.texture?.key === 'lipton') body.enable = false;
      const stats = sections.map(section => ({ name: section.name, seconds: 0, food: 0, hits: 0, benches: 0, jumps: 0, groundSeconds: 0, upperSeconds: 0, airborneSeconds: 0, minEnergy: 100 }));
      let lastPi = -1, excursionStart = null; const excursions = [], landings = []; let stopped = 0;
      for (let frame = 0; frame < 60 * 300 && !s.finished; frame++) {
        if (mode === 'locked-zero') s.changeEnergy(-100);
        const x = s.tanya.x, b = s.tanya.body, grounded = b.blocked.down, tired = s.exhausted;
        const pi = grounded ? cfg.routePlatforms.findIndex(p => Math.abs(b.bottom - p.y) < 3 && x >= p.x - 12 && x <= p.x + p.width + 12) : -1;
        const ground = grounded && pi < 0;
        const si = Math.max(0, sections.findLastIndex(section => x >= section.start)), stat = stats[si];
        let jump = false;
        if (ground && !s.restRemaining) {
          jump ||= terrain.terrainTransitions.some(t => t.rise > 0 && !(mode === 'mistake' && t.x === 2200 && x < 2140) && t.x - x < (tired ? 45 : 125) && t.x > x - 12);
          jump ||= cfg.interruptions.some(g => g.start - x < (tired ? 38 : 100) && g.start > x - 12 && !(mode === 'mistake' && g.start === 2140));
          jump ||= s.grannies.some(g => g.sprite.x - x > -12 && g.sprite.x - x < (tired ? 70 : 120));
          jump ||= s.pigeons.some(g => Math.abs(g.perchY - b.bottom) < 4 && g.sprite.x - x > 0 && g.sprite.x - x < (tired ? 40 : 100) && g.sprite.y > g.perchY - 100);
          jump ||= s.scooters.some(g => !(mode === 'mistake' && g.spawnX === 11970) && g.sprite.x - x > 0 && g.sprite.x - x < (tired ? 85 : 160));
          const rest = mode === 'low-energy' || mode === 'mistake' || mode === 'locked-zero';
          jump ||= !rest && cfg.benches.some(bx => bx - x > 0 && bx - x < (tired ? 100 : 140));
          for (const rx of rewards) {
            const target = rx + (tired ? 70 : 0);
            if (!usedRewards.has(rx) && x >= target && x < target + 20) { jump = true; usedRewards.add(rx); }
          }
          if (mode === 'mistake' && !attemptedMiss && x >= choices[0].entrance - 280 && x < choices[0].entrance - 250) { jump = true; attemptedMiss = true; }
          const takeUpper = mode === 'collector' || (mode === 'natural' && si === 2);
          if (takeUpper && !tired && choices.some(c => c.entrance - x > 0 && c.entrance - x < 110)) jump = true;
        }
        if (pi >= 0) {
          const p = cfg.routePlatforms[pi];
          jump ||= s.pigeons.some(g => g.perchY === p.y && g.sprite.x - x > 0 && g.sprite.x - x < 115 && g.sprite.y > p.y - 100);
          if (pi === 1 && x >= p.x + p.width - 80) jump = true;
        }
        for (const d of [...decisions, ...choices.map(c => ({ x: c.x, kind: 'route-choice' }))]) if (!usedDecisions.has(d.x) && x >= d.x && (!d.targetX || (d.kind === 'read-approaching-scooter' ? s.scooters[1].sprite.body.left : d.targetX) <= s.cameras.main.scrollX + s.cameras.main.width / s.cameras.main.zoom)) { usedDecisions.add(d.x); decisionEvents.push({ x, time: (s.time.now - start) / 1000, kind: d.kind }); }
        const energy = s.energy, food = s.foodCount, nh = hits.length, cam = s.cameras.main.scrollY;
        if (jump) key(true); tick(); key(false);
        const time = (s.time.now - start) / 1000;
        const camera = s.cameras.main, left = camera.scrollX, top = camera.scrollY;
        const vw = camera.width / camera.zoom, vh = camera.height / camera.zoom;
        const bounds = sprite => ({ left: sprite.x - sprite.displayWidth / 2, right: sprite.x + sprite.displayWidth / 2, top: sprite.y - sprite.displayHeight / 2, bottom: sprite.y + sprite.displayHeight / 2 });
        const onScreen = r => r.right > left && r.left < left + vw && r.bottom > top && r.top < top + vh;
        const hazards = [...s.scooters.map((g,i)=>({sprite:g.sprite,id:`scooter:${i}`})), ...s.pigeons.map((g,i)=>({sprite:g.sprite,id:`pigeon:${i}`})), ...s.grannies.map((g,i)=>({sprite:g.sprite,id:`granny:${i}`}))];
        for (const h of hazards) {
          const r = bounds(h.sprite);
          for (const full of [false,true]) {
            const id = h.id + (full ? ':full' : ':edge');
            if (!seenHazards.has(id) && h.sprite.x > s.tanya.x && onScreen(r) && (!full || (r.left >= left && r.right <= left+vw && r.top >= top && r.bottom <= top+vh))) {
              seenHazards.add(id); hazardReadings.push({id,time,x:s.tanya.x,distance:h.sprite.x-s.tanya.x});
            }
          }
        }
        const foreground = [s.tanya, ...hazards.map(h=>h.sprite), ...s.physics.world.staticBodies.entries.filter(b=>['food','lipton','bench'].includes(b.gameObject.texture?.key)).map(b=>b.gameObject)].map(bounds).filter(onScreen);
        if (frame % 20 === 0) {
          const intervals=foreground.map(r=>[Math.max(left,r.left),Math.min(left+vw,r.right)]).sort((a,b)=>a[0]-b[0]);
          let occupied=0,end=left;for(const [a,b] of intervals){occupied+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}
          framingSamples.push({time,zoom:camera.zoom,width:camera.width,height:camera.height,worldWidth:vw,worldHeight:vh,lookAhead:left+vw-s.tanya.x,skyFraction:Math.max(0,Math.min(...foreground.map(r=>r.top))-top)/vh,objectFreeColumns:1-occupied/vw,tanyaHeight:56*camera.zoom,tanyaWidth:40*camera.zoom,groundFraction:(terrain.groundYAt(s.tanya.x)-top)/vh});
        }
        if (b.velocity.y < 0 && prevVy >= 0) {
          const food = s.physics.world.staticBodies.entries.filter(b=>b.gameObject.texture?.key==='food').map(b=>bounds(b.gameObject)).filter(r=>r.left>x && r.left<x+300);
          foodReadings.push({time,x,upcoming:food.length,visible:food.filter(onScreen).length,clippedAbove:food.filter(r=>r.top<top).length});
        }
        stat.seconds += 1 / 60; stat.food += s.foodCount - food; stat.hits += hits.length - nh; stat.minEnergy = Math.min(stat.minEnergy, s.energy);
        if (ground) stat.groundSeconds += 1 / 60; else if (pi >= 0) stat.upperSeconds += 1 / 60; else stat.airborneSeconds += 1 / 60;
        if (b.velocity.y < 0 && prevVy >= 0) { jumps.push({ x, y: b.bottom, time, section: si }); stat.jumps++; }
        if (s.restRemaining > 0 && !prevRest) { rests.push({ x, time }); stat.benches++; }
        if (s.energy > energy + 1 && !s.restRemaining) bottles.push({ x: s.tanya.x, time });
        if (s.foodCount > food) collected.push({ x: s.tanya.x, time, count: s.foodCount - food });
        if (pi >= 0 && lastPi < 0) { const entry = jumps.findLast(j => j.time < time); excursionStart ??= { pi, time: entry?.time ?? time, x: entry?.x ?? x }; landings.push({ pi, x, time }); }
        if (ground && excursionStart) { excursions.push({ ...excursionStart, end: time, seconds: time - excursionStart.time }); excursionStart = null; }
        lastPi = pi;
        maxCameraStep = Math.max(maxCameraStep, Math.abs(cam - s.cameras.main.scrollY));
        if (s.tanya.x - x < .05 && !s.restRemaining && !s.finished) { stopped++; if (stopped === 6) waits.push({ x, time }); } else stopped = 0;
        if (thresholdTime === null && s.foodCount >= cfg.requiredFood) thresholdTime = time;
        if (bonusTime === null && s.foodCount >= cfg.bonusFood) bonusTime = time;
        if (frame % 3 === 0) trajectory.push({ x: s.tanya.x, y: b.bottom - 25, time, section: si, energy: s.energy, grounded: b.blocked.down });
        prevVy = b.velocity.y; prevRest = s.restRemaining;
      }
      const duration = (s.time.now - start) / 1000;
      const inputs = [{ time: 0, x: 100 }, ...jumps, ...rests, { time: duration, x: s.tanya.x }].sort((a,b) => a.time - b.time);
      const meaningful = [...inputs, ...decisionEvents].sort((a,b) => a.time - b.time);
      const gaps = meaningful.slice(1).map((a,i) => ({ seconds: a.time - meaningful[i].time, from: meaningful[i].x, to: a.x }));
      runs.push({ mode, seconds: duration, food: s.foodCount, energy: s.energy, finished: s.finished, success: s.foodCount >= cfg.requiredFood, thresholdTime, bonusTime, hits, rests, bottles, resets, waits, jumps, decisions: decisionEvents, longestInputGap: Math.max(...inputs.slice(1).map((a,i) => a.time - inputs[i].time)), longestDecisionGap: Math.max(...gaps.map(g => g.seconds)), gaps, excursions, landings, stats, trajectory, collected, maxCameraStep, attemptedMiss, framingSamples, hazardReadings, foodReadings });
    }
    const s = restart(), rects = s.physics.world.staticBodies.entries.filter(b => b.gameObject.type === 'Rectangle');
    const mismatches = rects.filter(b => { const r = b.gameObject.getBounds(); return Math.abs(r.x-b.x)>.01 || Math.abs(r.y-b.y)>.01 || Math.abs(r.width-b.width)>.01 || Math.abs(r.height-b.height)>.01; });
    return { metrics, transitions, runs, geometry: { edgeMismatches: mismatches.length, minimumClearance: Math.min(...cfg.routePlatforms.map(p => terrain.groundYAt(p.x)-p.y-cfg.platformThickness)), upperSections: cfg.routePlatforms.map(p => sections.findIndex(s => p.x >= s.start && p.x < s.end) + 1), safePocketDepth: Math.max(...cfg.interruptions.map(g=>g.depth)) }, foodTargets: { minimum: cfg.requiredFood, bonus: cfg.bonusFood }, totalFood: cfg.food.length };
  });
  await writeFile(process.env.AUDIT_OUTPUT || '/tmp/tanya-ground-first-audit.json', JSON.stringify({ ...result, errors }, null, 2));
  console.log(JSON.stringify({ metrics: result.metrics, geometry: result.geometry, foodTargets: result.foodTargets, transitions: result.transitions.map(({samples,...t})=>({...t,passed:samples.every(s=>s.landed&&!s.blocked)})), runs: result.runs.map(({trajectory,collected,jumps,decisions,gaps,framingSamples,hazardReadings,foodReadings,...run})=>run) }, null, 2));
  assert.equal(errors.length, 0); assert.equal(result.geometry.edgeMismatches, 0);
  assert.deepEqual(result.geometry.upperSections, [3,7]);
  for (const tr of result.transitions) assert.ok(tr.samples.every(s => s.landed && !s.blocked), `transition ${tr.x} timing margin`);
  for (const r of result.runs) { assert.ok(r.finished, `${r.mode}: finish`); assert.equal(r.resets, 0); if (['natural','ground','collector','low-energy','locked-zero'].includes(r.mode)) { assert.equal(r.hits.length, 0, `${r.mode}: collision`); assert.equal(r.waits.length, 0, `${r.mode}: forced wait`); } }
  if (!process.env.GEOMETRY_ONLY) {
    for (const r of result.runs.filter(r=>['natural','ground','collector'].includes(r.mode))) { assert.ok(r.seconds>=60&&r.seconds<=90); assert.equal(r.rests.length,0); assert.ok(r.success); assert.ok(r.longestDecisionGap<=3.1,`${r.mode}: sparse rhythm`); assert.ok(r.thresholdTime/r.seconds>.70,`${r.mode}: goal completed too early`); }
    const ground=result.runs.find(r=>r.mode==='ground'), collector=result.runs.find(r=>r.mode==='collector');
    assert.ok(ground.food>=result.foodTargets.minimum+8); assert.ok(ground.food<result.foodTargets.bonus); assert.ok(collector.food>=result.foodTargets.bonus+3); assert.equal(collector.excursions.length,2); assert.ok(collector.excursions.every(e=>e.seconds>=1.5&&e.seconds<=2.6));
    assert.ok(result.runs.find(r=>r.mode==='low-energy').success); const mistake=result.runs.find(r=>r.mode==='mistake'); assert.ok(mistake.attemptedMiss&&mistake.hits.length>=1&&mistake.success);
  }
} finally { await browser.close(); }
