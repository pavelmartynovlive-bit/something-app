// Compare world outcomes, not camera-dependent visibility/attention annotations.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const [baselinePath, ...paths] = process.argv.slice(2);
assert.ok(baselinePath && paths.length, 'Usage: node scripts/compare-presentation.mjs baseline.json other.json ...');
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
function same(a, b, path) {
  if (typeof a === 'number' && typeof b === 'number') {
    assert.ok(Math.abs(a - b) < 1e-8, `${path}: ${a} differs from ${b}`);
  } else if (a && typeof a === 'object') {
    assert.deepEqual(Object.keys(a), Object.keys(b), path);
    for (const key of Object.keys(a)) same(a[key], b[key], `${path}.${key}`);
  } else assert.equal(a, b, path);
}
for (const path of paths) {
  const result = JSON.parse(await readFile(path, 'utf8'));
  same(baseline.metrics, result.metrics, `${path}: jump metrics`);
  same(baseline.foodTargets, result.foodTargets, `${path}: food thresholds`);
  same(baseline.geometry, result.geometry, `${path}: geometry`);
  assert.equal(baseline.runs.length, result.runs.length);
  for (let i = 0; i < baseline.runs.length; i++) {
    for (const key of ['mode', 'seconds', 'food', 'energy', 'finished', 'success', 'hits', 'rests', 'bottles', 'resets', 'waits', 'jumps', 'trajectory', 'excursions', 'landings']) {
      same(baseline.runs[i][key], result.runs[i][key], `${path}:${baseline.runs[i].mode}.${key}`);
    }
  }
  console.log(`PASS: all ${result.runs.length} full runs match world outcomes in ${path}`);
}
