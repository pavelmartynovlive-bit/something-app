# Level V2 — implementation and measured audit

## Scope, source and method

Latest `origin/main` was fetched and matched `9f73496` before changes. GAME_DESIGN.md, LEVEL_REFERENCES.md and the previous LEVEL_AUDIT.md were read in full. The user's Level V2 replaces the former six-scene map with the ten specified timed phrases below. This is implementation of that map, not a new proposed structure.

Geometry was validated with no food first, including actual normal and zero-energy trajectories. Food was then authored as movement notation, route budgets measured, and only then thresholds chosen. Gameplay code in src/main.ts, controls, hazard masks, textures, energy values and portrait camera code are unchanged. No camera-scale animation, new mechanic, hold-jump, boost, lethal pit or new hazard was added.

Automated runs step the real Phaser Arcade scene at 60Hz and send real Space input. Full runs do not teleport, award food or grant energy. Low-energy starts at zero. The intentional-error policy misses the first gap timing, attempts the upper entry too early, omits the scooter jump and chooses rest. Separate interaction tests position actors or remove unrelated hazards. These are reproducible automated results, not claims about human phone enjoyment.

## Implemented phrase map

Nominal time ranges are staging labels. A jump naturally starts before the next surface/section boundary; for example the island entry tap occurs just before 8s, and the first unequal-island tap just before 31s. Telemetry food below is bucketed by x position, not reassigned to hide such overlaps.

| Phrase / nominal position | Actual clean time | Action grammar | Terrain, hazards and decision | Food notation | Food N / G / C |
| --- | ---: | --- | --- | --- | ---: |
| 1. Разрыв и низкий остров / 0–4s / 100–1420 | 3.95s | gap → island landing → second jump to higher ground | 50px shallow interruption → 300px low island → +20 ground; no enemy | two linked arcs, island landing, low trail into bowl | 20 / 20 / 20 |
| 2. Птичья чаша / 4–8s / 1420–2740 | 4.00s | walk off → see flock → wait → jump → bowl landing → exit jump | shallow bowl with one flock, then +24 exit; flock beyond the forced landing | low descending notation first, delayed arc, bowl landing and exit | 24 / 24 / 24 |
| 3. Остров и бабушка / 8–12s / 2740–4060 | 4.00s | jump to raised island → immediately read granny → granny jump → descend | 40px safe gap → raised 340px island → short descending ground; granny at x3020 | landing immediately becomes granny arc, then descending notation | 15 / 15 / 15 |
| 4. Единственный верхний бонус / 12–17s / 4060–5710 | 5.00s | choose ground OR first short upper landing → immediate second jump → safe return | only true alternate route: 240px / 170px surfaces at y370 / y346; clear ground underneath | small low group; upper entry, short landing, higher reward and safe fall | 8 / 8 / 26 |
| 5. Лесенка вниз / 17–22s / 5710–7360 | 5.00s | step down → step down → do NOT jump → jump interruption | two visible down steps, then separate 50px shallow interruption; no enemies | descending diagonal turns into jump arc, then far landing | 15 / 15 / 15 |
| 6. Самокат под эстакадой / 22–27s / 7360–9010 | 5.00s | +24 rise → settled landing → see scooter → wait → late edge jump → lower landing | raised roadway and 64px drop; scooter below; no extra hazard or reward jump | entry arc, settled landing/anticipation, late edge arc and lower landing | 21 / 21 / 21 |
| 7. Карман восстановления / 27–31s / 9010–10330 | 4.00s | descend → read energy → Lipton jump OR stay low for bench → continue | single shallow recovery pocket; bench and one bottle; next ascent revealed before exit | fast airborne trajectory differs from grounded/rest reward | 18 / 15 / 18 |
| 8. Три неравные высоты / 31–36s / 10330–11980 | 5.00s | longer ascent → shorter second takeoff window → short lower island → ground | unequal filled islands 330 / 210 / 140px; +24, then +28, then down; safe gap floor | first ascent, compact high reward, changing descending trail | 19 / 20 / 19 |
| 9. Спуск, птицы и разрыв / 36–41s / 11980–13630 | 5.00s | land/drop → see birds → delay tap → jump → grounded landing → quick second jump | one flock at x12290, then separate safe interruption at x12700; no extra corridor | S-like rise/landing/rise notation linking the two actions | 25 / 24 / 25 |
| 10. Бабушка и кот / 41–46s / 13630–15030 | 4.03s | rise → safe landing → read granny → jump → final food → descend → cat | short +24 rise, granny at x14380, shallow final descent; no scooter/recovery/platform | final rise/granny arcs and low descent toward the visible cat | 18 / 18 / 18 |

N = fast main/lower route with Lipton; G = no-bonus ground/rest choice; C = same shared hazards plus both surfaces of the sole upper detour. There is only one detour, not one detour per upper surface. The unequal islands are solid ground filled to y660, with no traversable lower route beneath them.

Full rhythm: **jump → jump → descend / wait / birds → island landing / immediate granny jump → short risk/reward detour → descend / descend / interruption → rise / settle / wait / late scooter jump down → recovery choice → longer / shorter / descend → birds / landing / separate interruption → rise / granny / cat**.

No third onboarding reward jump, no upper chain of three platforms, no Lipton outside recovery, no enemy in the descending staircase/recovery, and no extra final scooter or upper route. The old long canopy/climb/reward/descend template was not restored. Two-jump phrases intentionally recur in 1/3/8 as explicitly specified, but their height ordering, landing situation, purpose and terrain silhouette differ.

## Coherent food budgets and Model B

HUD remains `Корм: X`, `Котику нужно: Y`, never X / world-total. Measured thresholds: **150 feeding / 194 feast**. They were chosen after the new geometry and food pass; previous 100/132 and 128/170 were not carried forward.

| Route | Food | Feeding margin | Minimum reached | Feast reached |
| --- | ---: | ---: | ---: | --- |
| Normal clean / fast | 183 | +33 | 37.33s (83%) | no |
| No bonus / ground + rest | 180 | +30 | 40.43s (85%) | no |
| Collector / both upper surfaces | 201 | +51 | 32.47s (72%) | 43.30s |
| Low energy / zero at start | 163 | +13 | 66.17s (96%) | no |
| Intentional errors | 169 | +19 | 43.40s (91%) | no |

The normal route has 33 items of feeding margin; collector adds 18 through the two-step upper detour. Feast requires 11 more than the observed normal budget and the collector has seven items of feast margin. Merely finishing or taking the bench does not grant feast. Minimum remains relevant until the later level, including the collector. Recovery-route food can be mutually exclusive, so the world item count is not advertised as 100% completion. Below minimum, normal feeding and feast retain the existing distinct endings/replay behavior.

Every cluster has an authored purpose in src/food-layout.ts: ascent, landing, low/no-tap descent, delayed timing, route invitation, optional reward or final approach. No food is generated by iterating repeated platform templates, and no standalone food-only reward jump was added.

## Five required full runs

| Run | Time | Food | Final energy | Accepted collisions | Bench uses | Lipton | Longest input/visible-decision interval |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal clean / fast | 44.98s | 183 | 31.90 | 0 | 0 | 1 | 4.63s |
| No bonus / ground + rest | 47.43s | 180 | 65.40 | 0 | 1 | 0 | 4.63s |
| Collector / both upper surfaces | 44.98s | 201 | 31.90 | 0 | 0 | 1 | 4.63s |
| Low energy / zero at start | 68.77s | 163 | 23.47 | 0 | 1 | 0 | 7.98s |
| Intentional errors | 47.87s | 169 | 52.53 | 1 | 1 | 0 | 4.63s |

Additional diagnostic: energy forced to zero every frame, bottles disabled, bench jumped rather than used: **78.08s, 157 food, zero final energy, zero collisions, zero benches, zero blocked waits and zero resets**. This verifies continuous reachability without requiring recovery. All five requested runs finish; all full runs have zero resets and zero unplanned blocked waits. The intentional-error run takes one scooter collision (12 energy plus existing slow), loses food and recovers at the bench.

### Flow: what these numbers mean

The 44.98s result is approximately 45 seconds, inside the requested approximate 45–50s direction. Ground/rest takes about 2.45s longer. The slower zero-energy portion is not artificially accelerated to force its total into the clean-run target.

Meaningful-event measurements include actual jumps/rest choices plus authored cues **only when their actual target is within the current camera look-ahead**. Food pickups themselves are never counted as input. These are visible opportunities, not proof that a human made or noticed a decision.

The longest clean interval is **4.63s**, x3130→4659: descending after the first granny until the actual upper entrance becomes visible. It becomes **7.98s** at tired speed. An earlier diagnostic counted a tiny intermediate ground edge as the bonus reveal; the final measurement explicitly uses the platform itself, so that misleading shorter result is discarded.

Separately, the longest **tap-only** interval is **11.18s** on the normal/ground route (19.40s during the initial tired portion): first granny → decline bonus → descending staircase → interruption. Collector reduces the tap-only maximum to 5.87s because it takes both upper jumps. This is the no-tap behavior of the supplied lower-route/staircase grammar, not evidence that the whole time requires active decisions. It is a remaining phone-playtest risk; no unapproved hazard or reward jump was added to hide it.

Clean runs never need to stop for geometry. The optional bench is the only deliberate stop. Zero-energy bench bypass separately clears the marked seat and collects Lipton; grounded rest gives stronger recovery, misses the bottle and resumes automatically.

## Portrait composition and empty-space measurements

Viewport: 390×844, 340 world px wide, zoom **1.1470588**. Zoom is identical in every sampled frame of every run. No camera, sprite scale, collision size or orientation change was introduced for V2.

Every simulation frame records visible categories: current terrain interaction, upcoming terrain change, food, hazard, recovery, route, goal. Terrain edges must be inside the actual viewport; objects must overlap it in both dimensions. Current interaction and next-change categories use different sides of Tanya, avoiding counting the same future edge twice. Screens with neither a terrain edge nor an interactive object/route/goal are classified as empty; background decoration does not rescue them.

| Run | Longest visible empty interval | Frames with at least two categories | Longest interval with fewer than two |
| --- | ---: | ---: | ---: |
| Normal clean / fast | 0.00s | 91.4% | 0.67s |
| No bonus / ground + rest | 0.00s | 91.8% | 0.67s |
| Collector / both upper surfaces | 0.00s | 91.4% | 0.67s |
| Low energy / zero at start | 0.00s | 90.6% | 1.18s |
| Intentional errors | 0.00s | 91.9% | 0.67s |

These categorical metrics include small real terrain changes (some connecting grades are 2–8px). They establish that the frame contains changing physical geometry/items, not that every small grade has equal perceptual importance. Readability and whether the lower route still feels passive require a phone test. They should not be confused with a human attention measurement.

Longest traversed flat: **600px / 1.82s normal**, the specifically allowed scooter anticipation roadway. All other traversed constant-height surfaces are **340px or less**. Adjacent equal-height spans are merged before measuring; section labels cannot hide a long flat. The start/end are clipped to the portion actually traversed before feeding.

## Terrain-window and repetition audit

The audit compares adjacent **3/4/5-second** windows at **0.5-second phase offsets**: 222 adjacent comparisons, **zero repeated pairs**, maximum identical consecutive sequence **one window**. Signatures use signed terrain height changes and visible upper-surface widths/heights, not hazard sprite types. Equal signatures would be flagged even if enemy types differed.

All sampled neighboring windows differ structurally. This is a finite structural check, not a claim that every possible continuous-time screenshot is perceptually unique. It cannot certify that 2px contour changes are memorable. Section map, terrain data and phone screenshots remain the qualitative check. No repeated giant upper highway or repeated climb/reward/descend chain was introduced. The only true alternate route is phrase 4; phrase 8 is the expressly requested unequal solid-ground sequence.

## Upper detour and scooter visibility

The sole upper excursion takes **2.12s**, from the actual entry tap until returning to ground. Surface widths **240/170px**, y370/y346, with 40px between surfaces. Entry → first landing → second tap → second landing → safe fall, with no third upper jump. Shared hazards remain on the main flow before/after it; higher reward requires extra timing and can be lost by falling. Ground bypass remains unobstructed, with underside clearances **68/94px**, body height 50px and art height 56px. Posts remain nonblocking background supports.

Scooter: unchanged speed 210px/s, spawn x8460 on the lower street, natural collision at the visible roadway face x8240 stops its center at x8274. Road rises 24px, then drops 64px to the safe lower landing. The entry jump finishes before the late scooter jump. No invisible stop, spawn timer, altered speed or temporary camera zoom is used.

Fully visible scooter → intended edge jump: **0.57s normal / 1.22s tired**. Isolated 20px-before-edge input provides about 0.50s normal; 10px-before about 0.53s. Six sampled tap positions, 40px before through 10px after the edge, clear at both speeds. Omitting the jump produces a real hit at either speed. The scooter may have stopped against the face before commitment; the test does not misdescribe it as a continuous unobstructed flat-road crossing.

## Measured mandatory jump margins

| Metric | Normal | Tired |
| --- | ---: | ---: |
| Maximum height (px) | 107.33 | 85.17 |
| Level-ground duration (s) | 0.80 | 0.70 |
| Level-ground reach (px) | 264.00 | 133.00 |

Required same-ground step-ups are 20/24px. Gap landings rise by 0/20/28px relative to the departure street. Worst required height margin is **79.33px normal / 57.17px tired**. Recovering from the deepest relative exit (the 52px rise out of the unequal-island safety pocket) still leaves 55.33/33.17px; recovery from all five pocket bottoms is tested at both speeds.

“Full-foot landing margin” is center beyond the landing edge minus body half-width 12px, at the first landing. Rise tests stop at that landing rather than incorrectly treating the next required obstacle as a failure of the previous jump. Gap tests require landing on the intended finite surface at its real height, with room remaining before its far edge; they do not accept overshooting and landing somewhere lower later.

| Mandatory step x | Height | Worst normal landing margin | Worst tired landing margin |
| --- | ---: | ---: | ---: |
| 750 | 20 | 90.50 | 60.00 |
| 2140 | 24 | 90.50 | 56.83 |
| 7640 | 24 | 90.50 | 56.83 |
| 10330 | 24 | 90.50 | 56.83 |
| 14100 | 24 | 90.50 | 56.83 |

Rise leads sampled: normal 105/125/145px, tired 35/45/55px. All clear without side contact. Gap leads sampled: normal 80/100/120px, tired 28/38/48px.

| Gap x | Width | Landing rise | Worst normal near-edge margin | Worst tired near-edge margin | Worst normal room before far edge | Worst tired room before far edge |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 400 | 50 | 0 | 82.00 | 23.33 | 154.00 | 232.67 |
| 2740 | 40 | 20 | 75.50 | 27.00 | 200.50 | 269.00 |
| 6690 | 50 | 0 | 82.00 | 23.33 | 154.00 | 232.67 |
| 10660 | 40 | 28 | 70.00 | 23.83 | 76.00 | 142.17 |
| 12700 | 50 | 0 | 82.00 | 23.33 | 154.00 | 232.67 |

The narrow taller island therefore retains at least 76px of far-edge room on normal samples and 142px tired, rather than relying on a maximal jump. The 140px lower island requires no new jump. No arbitrary tile grid or movement constant was introduced.

Both granny jumps and bird sequences clear in the normal and permanently-zero full runs. Isolated normal bird inputs 85/100/115px clear; tired 30/40 clear both flocks. A deliberately earlier tired final-flock tap at 50px takes 6 energy and continues, as an expected mistiming; it is not silently counted as a passing avoidance test. Static granny danger reaches about 54px above street, below the 107/85px apex; actual moving collision avoidance is checked through full runs rather than inferred solely from that apex.

Scooter drop extends airtime: sampled tired landings retain over 20px beyond the visible scooter with the full body clear, normal margins are larger. Full coyote/buffer behavior is retained; energy changing in flight does not alter committed horizontal speed.

## Collision, interaction and presentation checks

- Zero visible rectangle edge / actual body mismatches.
- All terrain islands are filled to y660; no fake underpass or unsupported collision slab.
- All five missed interruptions and both failed upper jumps safely continue, with zero resets. Pocket-bottom exits pass normal and tired tests.
- One-way upward passage and downward landing pass. Both roof undersides/edges allow the visible lower passage; supports do not block it. No boxes are present.
- Scooter/granny/individual-pigeon hazard rectangles have zero transparent-pixel violations against the existing art. Flying pigeons remain visibly dangerous.
- Seat sensor still matches the marked 24px part of the bench; tired bypass collects the bottle without rest, grounded choice rests and misses it.
- Coyote (5 frames yes / 12 no), pre-landing buffer, touch, Space/ArrowUp, replay reset, three endings, HUD bounds and portrait rotation guards pass.
- Build passes. Presentation A/B/C still shares the same world/physics; portrait C remains active by default and scale stays stable throughout every run.

## Reproduce / stop condition

With the Vite dev server running: `npm run test:level`, `npm run test:presentation`, `npm run build`. Actual run evidence: `/tmp/tanya-ground-first-audit.json`; collision/interactions: `/tmp/tanya-ground-collision-audit.json`. CHROMIUM_PATH selects a browser executable. Playwright uses system Chromium if available.

Implementation is frozen for manual portrait-phone playtesting. In particular, evaluate the 4.63s descent-to-choice interval and 11.18s tap-free lower bypass/staircase, tiny connecting grade readability, delayed bird timing, two upper landings, scooter anticipation, recovery choice and the last food requirement. No further autonomous structure change or polish is included after these tests.
