# Level V3 — local tuning and recovery audit (2026-10-17)

Synced and read GAME_DESIGN.md, LEVEL_REFERENCES.md and the prior LEVEL_AUDIT.md
in full before edits. Base: origin/main `6f369e88dc074aa4761fd956ae57cc7b794cfef8`.
This pass preserves V3's ten-phrase macro, filled-ground silhouette, portrait
camera, physics, early boost and resource-with-threshold food model. No new
terrain motif, hazard type, progression system or empty connector was added.

[Development overview](docs/level-v3-overview.svg) ·
[Measured summary](docs/level-v3-validation.json)

## Full playthroughs

Actual Phaser scene, real keyboard requests, deterministic 60Hz stepping at
390×844 portrait. Full runs retain all hazards, damage, physics and drain.
Only the low-energy policy starts at zero. No teleport, disabled collision,
injected food or energy after the start, or manual recovery call in full runs.
Separate isolated contact probes reposition actors to measure exact transitions.
These are automated playthroughs, not manual phone tests.

| Run | Seconds | Food | Final energy | Hits | Bench | Lipton | Boosts | Falls / returns | Longest input / cue gap (s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| normal | 42.12 | 97 | 31.31 | 0 | 0 | 1 | 3 | 0 / 0 | 2.10 |
| collector | 41.17 | 105 | 33.35 | 0 | 0 | 1 | 5 | 0 / 0 | 2.00 |
| low-energy | 55.85 | 89 | 3.37 | 0 | 1 | 0 | 3 | 0 / 0 | 4.40 |
| intentional-collision | 46.20 | 91 | 0.00 | 6 | 0 | 1 | 3 | 0 / 0 | 2.00 |
| pit-fall | 48.52 | 98 | 16.85 | 1 | 0 | 1 | 3 | 4 / 4 | 2.10 |
| platform-miss | 42.10 | 90 | 31.34 | 0 | 0 | 1 | 3 | 0 / 0 | 2.00 |
| no-recovery | 42.10 | 94 | 9.34 | 0 | 0 | 0 | 3 | 0 / 0 | 2.00 |
| bench | 44.52 | 95 | 41.77 | 0 | 1 | 0 | 3 | 0 / 0 | 3.80 |

Normal uses the three mandatory boosts and Lipton. Collector also takes the
optional high rewards. Platform-miss takes the first short surface, then misses
the next two and lands safely on the underlying ramp. Pit-fall deliberately
skips each of the four pit jumps once, then retries with normal inputs. Its
one bird hit is from that deliberately failed final approach, not respawning.
The six-hit collision run skips three granny, two scooter and one bird avoidance.
All eight runs feed the cat; collector reaches the better ending.

Energy calibration: no recovery **9.34**, Lipton **31.31**, bench **41.77**.
Drain 2.15/s, Lipton +22, bench 2.5s ×12.8/s =32. Bench time suppresses baseline
drain, so the two routes differ in both recovered energy and duration. The
zero-start run completes with 3.37 energy after using the ordinary bench.

## Same ten phrases, local changes

| Existing phrase / x | Clean duration | Local result and action |
| --- | ---: | --- |
| 1. Gap / island, 100–1100 | 4.12s | First notch widened 50→70px. Standard jump → landing → +25px rise. No enemy. Failure automatically returns to 240. |
| 2. Tall ledge, 1100–1900 | 2.98s | Original 135px boost ledge retained. Granny A at 1820–1840 changes the high landing into an immediate readable standard jump before the ramp. |
| 3. Downhill / birds, 1900–2520 | 2.58s | Original actual slope and single bird encounter retained. Jump off granny → follow ramp → delay bird jump. A cue now goes over granny into the descending food line. |
| 4. Unequal surfaces, 2520–3940 | 5.92s | Widths 240/160/200, heights 365/330/390, unequal gaps 60/80. Land → promptly read next jump; optional boost reward above the last surface. Sloped ground catches misses. |
| 5. Boost gap, 3940–4820 | 3.20s | Original 270px gap and long parabola retained. Standard jump fails; boost clears with margin at both energy states. Safe anchor 4110 before takeoff. |
| 6. Scooter lane, 4820–5740 | 3.83s | Original roadway / descent retained. Scooter A launches at 4990 from 5640: see → wait → late standard jump → lower landing. No extra box or enemy here. |
| 7. Ground cascade, 5740–6670 | 3.87s | Short interruption 40→60px. Landing → granny B at 6300–6320 → jump into next drop. Granny has a different height / landing context from A. |
| 8. Recovery pocket, 6670–7400 | 3.05s | Bottle moved to 6970,y435; bench to 7200,y545. Jump for airborne +22 OR stay low for timed +32. 230px horizontal separation; taking one dims/disables the other. No incidental bottle during sitting. |
| 9. Filled ascent, 7400–8870 | 5.75s | Original unequal solid 40/60/135px rises retained. Normal / optional boost → mandatory tall boost. No traversable underside. |
| 10. Final combination, 8870–10580 | 6.82s | Original high drop / birds / gap / granny / cat retained. Scooter B is embedded after the drop; visible before launch at 9150. Birds and 40px final notch shifted +100px locally for a grounded interval after scooter landing. Granny C remains 10230–10250. Cat finish and total length unchanged. |

No new continuous upper route or climb/reward/descend template was introduced.
The new hazards reuse existing movement transitions; they are not separated by
new flat corridors. Food moved locally to match the shortened surfaces, granny
avoidance, scooter landing and the two recovery trajectories; no filler added.
Minimum **80**, bonus **103** remain physically achieved by the measured budgets:
normal97, platform fallback90, no-recovery94, collector105. The normal route has
69 at recovery exit and 83 after the late ascent, so the minimum stays relevant
until late in the run. UI remains `Корм: X` / `Котику нужно: 80`.

## Exact geometry and physics

- Granny encounters: **3**; scooters: **2**; pigeon groups: **2**.
- Small/medium pits: **70px at420**, **60px at6040**, **40px at9600**.
- Large boost pit: **270px at4280**.
- Pit floors: y505 /565 /568 /535; depths65 /140 /63 /65 respectively.
- Floating surfaces: **240 /160 /200px**, at2860 /3160 /3400.
- Normal standard: height107.33, reach192px, flight0.80s.
- Tired standard: height85.17, reach119px, flight0.70s.
- Normal boost (150ms second tap): height214.55, reach391.83px, flight1.17s.
- Tired boost: height194.75, reach350px, flight1.13s.
- Boost window40–280ms, coyote130ms and buffer150ms unchanged.

These are measured same-height jump envelopes, not an invented tile standard.
Direct scene probes additionally validate each actual rise, gap and platform.
Small-gap foot landing margin: at least46px normal /24.67px tired across sampled
launch offsets. Large-gap margin: at least61.67px normal /47.67px tired for second
taps at100/150/220ms. Both standard jumps demonstrably fail the large gap.
135px ledges have ~79.6px normal /59.7px tired vertical boost headroom. The
60px standard rise has ~47.3 /25.2px vertical headroom; tired launch-offset probes
still land, with the smallest full-foot margin14.17px. Other ordinary rises are
24/25/40px. No mandatory rise or boosted gap sits on its measured physical limit.

## Hazard readability / visual collision

Portrait framing and zoom remain unchanged (340 world px across; zoom1.147 at
390×844). No dynamic camera zoom. Both scooters use the existing visible danger
mask; no collision-mask expansion. Grannies / birds retain the existing masks.
All dangerous mask pixels are inside the drawn art in alpha-mask probes.
One-way platform undersides retain light surfaces / arrows / noncolliding posts.

Full-sprite visibility → actual avoidance tap in the clean trace:

- Granny A **0.60s**, B **0.79s**, C **0.73s**.
- Scooter A **0.91s**, B **0.54s**.

Visibility boundary is linearly interpolated between 10Hz trajectory samples;
these are approximate staging windows, not a measured human reaction time.
Granny A is read on the high landing, B after the notch landing, C after the
late final sequence. Scooter B contrasts with A by following the high drop.
No scooter requires boost. Full low-energy run avoids all five encounters.

## Fall / ground fix and anchors

Old slope contact ran only once per render despite multiple fixed physics steps.
A fast downward crossing could overwrite the useful previous position before
that check. The regression fixture reproduces 309–336px penetration at15/20/30fps.
Contact now resolves against the same analytic surface used for drawing after
**each physics step**, including hazard actors. It follows supported ramps and
sweeps landings from above, without lifting a side-on body onto a tall wall.

Arcade `Body.reset` also omits the configured collider offset immediately after
reset. Return now synchronizes body position, previous positions, sprite and
camera in the same operation. Replay unregisters the old world-step listener.

Entering a notch below its lip or falling below y650 freezes the body for600ms,
then automatically returns to the most recent confirmed grounded anchor. No
button, level restart, food reset, energy reset, or additional fall damage.
Collider feet are exactly on the anchor surface, vertical speed zero; ordinary
auto-run and normal drain resume. Buffered jump / boost state is cleared.
A brief 800ms hit grace prevents an immediate recovery-frame repeat hit; it does
not reset or remove hazards. The whole failed-pit run retains their live state.

Explicit anchors: **100,240,1220,2660,4110,5880,7320,8140,9240**. All are solid,
outside pits and dangerous masks, with forward room. Each tested at both energy
states: correct camera immediately, no overlap, preserved resources and forward
progress. The final anchor activates only after the second scooter has passed
leftward in actual play. Every pit is tested at both energies and all four are
missed/recovered sequentially in one complete run. No return softlock remains.

Validation includes40 slope cases at15/20/30/60/120fps,46 solid-surface drop
cases,18 anchor cases and8 automatic pit-return cases. All pass with no solid
ground penetration. Sludge is drawn on the actual lower pit floor and included
in the debug overview; intended holes visibly differ from solid ground.

## Density limitations and manual testing

No full empty viewport in 10Hz samples of any full run. This is a sampled
functional check, not proof of perceived density on a phone. No connector or
level-length extension was added. The underlying scooter anticipation lane is
still the deliberate longest flat stretch; macro composition is preserved.

Longest no-new-input/no-new-visible-decision-cue interval: **2.10s normal**,
**2.00s collector**, **4.40s zero-start**, **3.80s bench**. Raw input gaps are
reported separately in the JSON: a flight, descent or visible anticipation can
have no taps while still demanding attention. Auto-food pickup never counts as
an input/decision. Rest and frozen return time are included, not subtracted.
The normal2.1s remains above the aspirational1.5s; no further structural change
was made to disguise this. Three-layer heuristic is only ~47% of normal samples;
it uses arbitrary distance bands and is not a perceptual certification. Phone
playtesting must judge readability / density, especially high landings.

Normal duration42.12s remains below the historical45–55s target. This pass does
not extend the level to pad time. Food budgets and energy targets above are
measured; phone balance approval is pending.

## Reproduce / stop

With `npm run dev` running:

```sh
npm run test:level
npm run test:presentation
npm run level:overview
node scripts/report-v3.mjs
npm run build
```

Individual tests cover jump envelopes, eight full policies, terrain contacts,
coyote/buffer, one-way surfaces, touch boost, endings, recovery and pocket
exclusivity. TypeScript / production build / offline cache generation and A/B/C
HUD/orientation checks pass. Raw traces are in `/tmp/tanya-v3-*`; the compact
committed JSON and SVG are development artifacts, not player UI.

**Stop here for manual phone playtesting. No further autonomous V3 redesign.**
