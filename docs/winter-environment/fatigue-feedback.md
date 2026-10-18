# Fatigue feedback — 2026-10-18

Targeted phone-feedback change on the existing V3 layout. No terrain, food, hazards, camera, drain or recovery amounts changed. Supersedes the boost-speed note in clearance-and-fatigue.md.

- Energy >20: existing 240px/s run and 350px/s boost.
- Energy 1–20: 204px/s run (-15%), 297.5px/s boost, yellow bar, persistent “Скоро Таня устанет”.
- Energy 0: running AND boosted horizontal speed stay at85px/s. No double-tap speed escape.
- Exhausted boost slows vertical flight too: local gravity92.8834, target apex200px. At150ms second tap: height198.65px / reach337.17px / flight3.967s. The existing270px pit stays reachable without altering its geometry.
- Standard exhausted jump stays85.17px high /59.5px reach /0.7s. Normal standard/boost envelopes remain107.33/214.55px high and192/391.83px reach.
- Fatigue during flight scales velocities and local gravity together, retaining the committed spatial arc. Recovery affects speed after landing; landing, bench, respawn and replay clear the gravity override. Other physics bodies are untouched.

## Actual browser checks

Phaser/Arcade at60Hz,390×844 portrait. Real keyboard presses, collisions, drain, pickups and automatic recovery. Scripted policies are not manual phone playtesting. Exhausted bird avoidance now uses an earlier visible boosted trajectory; low-energy final bird/gap combination uses boost. This changes the test inputs, not the level.

| Policy | Seconds | Food | Energy | Hits | Bench | Lipton | Boosts | Falls / returns |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| normal | 41.90 | 102 | 16.40 | 0 | 0 | 3 | 4 | 0 / 0 |
| collector | 41.78 | 103 | 4.73 | 0 | 0 | 2 | 6 | 0 / 0 |
| low-energy | 89.60 | 89 | 8.25 | 0 | 1 | 3 | 10 | 0 / 0 |
| intentional-collision | 82.90 | 90 | 0.00 | 8 | 0 | 2 | 7 | 0 / 0 |
| pit-fall | 50.58 | 103 | 0.00 | 1 | 0 | 3 | 4 | 4 / 4 |
| platform-miss | 41.90 | 89 | 16.40 | 0 | 0 | 3 | 4 | 0 / 0 |
| bench | 44.13 | 100 | 53.44 | 0 | 1 | 3 | 4 | 0 / 0 |

All seven policies finish with enough food. Clean normal, collector, zero-start and bench runs have no hits/falls. Zero-start remains substantially slower by design. All sampled viewports retain meaningful visible elements; slow flights and rest deliberately increase input intervals. Do not interpret that as a new pacing improvement.

Checks passed:

- `node scripts/check-fatigue.mjs`: boundaries100/20.1/20/10/0, yellow state/text, zero boost speed cap, normal-boost→low/zero transitions, airborne recovery, grounded restoration, respawn/replay.
- `node scripts/measure-jumps.mjs`:20 real trajectories, early window and rejected late taps.
- `node scripts/audit-v3.mjs`: seven strict full-run policies, food budgets, upper landings, zero empty viewports, intentional pit returns.
- `node scripts/validate-collisions.mjs`: required rises/gaps at both energies, one-way contacts, coyote/buffer, hazard timing/masks, bench and endings. Probe budgets increased to7s for the slower flight; success assertions retained.
- `node scripts/validate-recovery.mjs`:18 anchors,40 ramp/frame-rate probes,46 solid drop probes, recovery pocket.
- `node scripts/validate-scooter-lanes.mjs`: all three lanes at15/30/60fps.
- `node scripts/check-presentation.mjs`: A/B/C HUD, orientation/resize and touch.
- `npm run build`: TypeScript, production build and25-file PWA cache. Existing large-bundle warning remains.

Data: [fatigue-validation.json](fatigue-validation.json). Stop for manual phone testing: especially the intentionally floatier exhausted boost. No further level changes or publication are part of this pass.
