# Six portrait set pieces — implementation and measured audit

## Scope and method

Based on latest fetched `origin/main` at `330b737`. GAME_DESIGN.md and LEVEL_REFERENCES.md were read in full before implementation; the existing LEVEL_AUDIT.md was inspected. The user's approved six-scene, portrait, approximately-45-second brief supersedes the former seven-section / 60–90-second target. The result is **41.55 seconds** on clean runs; no filler was added to reach 45.

Geometry was first validated without food. Food was then authored against the actual actions, and Model B thresholds selected from coherent route budgets. Movement, fixed single-tap jump, fatigue, damage, recovery values, controls and placeholder art remain unchanged. Camera C is now the default. It has **no dynamic scale change**.

Playthroughs step the real Phaser Arcade scene at 60Hz and dispatch actual Space key events. Full runs neither teleport nor grant food/energy. Low-energy starts at zero; intentional errors omit the first gap jump, attempt the sole upper entry too early, omit the scooter jump, and use the bench. Isolated interaction tests may position actors or remove unrelated hazards. These are automated validations, not human phone playtests.

## Six authored set pieces

Times and food are telemetry by x range. Anticipatory takeoffs may occur just before a section boundary (in particular the causeway entry jump); this is continuous terrain, not six rooms.

| Scene / world x | Clean time | Finger / attention rhythm | Recognizable terrain and hazard context | Food N / G / C |
| --- | ---: | --- | --- | ---: |
| 1. Две кромки / 100–1740 | 4.93s | read arc → jump interruption → land → second tap onto ledge → short walk-off | 50px interruption with floor 24px below; low +24 solid ledge; no enemies | 18 / 18 / 18 |
| 2. Птичья чаша / 1740–4000 | 6.85s | walk off → see birds → delay tap → jump flock → land → jump bowl exit | broad shallow U bowl, floor 24px lower; only this scene uses a bowl | 21 / 21 / 21 |
| 3. Единственный козырёк / 4000–6050 | 6.20s | shared granny jump → choose → ground passage OR upper landing → timed edge tap → safe fall | one supported 400px awning at +80; clear lower passage; no hazard can be bypassed by choosing upper | 19 / 17 / 26 |
| 4. Эстакада и встречный / 6050–8350 | 6.97s | rise/settle → read lower street and scooter → wait for edge → late jump → lower landing | filled +32 causeway, one 64px drop; no playable underside; oncoming scooter meets visible road face | 18 / 18 / 18 |
| 5. Карман отдыха / 8350–9700 | 4.10s | read drop/energy → Lipton jump OR remain low for bench → release | one-way descent to broad low plaza, not a second U bowl; no exit step immediately after seat | 11 / 11 / 11 |
| 6. Горка к коту / 9700–13900 | 12.50s | jump first rise → land → jump second rise → choose walk-off / high descent → birds+interruption in one jump → land → granny jump → cat | two FILLED 32px terraces, one 64px drop, shallow 40px interruption, safe final approach; no roof or platform chain | 41 / 41 / 43 |

N = ordinary mixed route (enter awning, walk off without edge reward); G = ground-only; C = awning with edge tap plus optional airborne descent from final ground crest. The crest is solid ground, **not another upper detour**.

Full action rhythm: **gap → ledge → fall / delayed birds → bowl exit → shared granny → sole short choice → causeway / anticipate / late scooter jump down → recovery choice → two filled rises / one descent → birds + interruption → separate granny tap → cat**.

Removed: the previous seven-section skeleton, second awning, extra intermediate pockets, second scooter, extra repeated bird phrases, two out-of-pocket bottles and all standalone reward jumps. The only two-rise phrase appears once, in the final hill. Flat releases have explicit roles (reading the bowl exit, choice, scooter anticipation, rest, cat), rather than being extended to achieve a duration target. Scene 4 has a longer readable approach on purpose.

## Food: actual route budgets, not a fictitious total

HUD: `Корм: X`, `Котику нужно: 100`. Thresholds are **100 feeding / 132 feast**; historical 128/170 targets are discarded. Below minimum explains the shortfall and offers replay; normal feeding and feast use distinct cat endings. No X / all-items total is displayed.

| Coherent route | Food | Feeding margin | Feeding reached | Bonus |
| --- | ---: | ---: | ---: | --- |
| Normal clean | 128 | +28 | 33.30s (80%) | not reached |
| Ground-only / no bonus | 126 | +26 | 33.53s (81%) | not reached |
| Collector | 137 | +37 | 31.57s (76%) | at 39.90s |
| Low-energy (zero at start) | 110 | +10 | 61.22s (95%) | not reached |
| Intentional errors | 113 | +13 | 40.93s (92%) | not reached |

The collector's 137 is achieved in one continuous run, with five items above the feast requirement. Entering the awning alone does not grant feast: its edge tap rewards extra execution. Ground-only still feeds the cat with margin, while reaching the minimum remains late. The diagnostic permanently-zero route collects 105; this is an adversarial reachability check, not normal balance.

Food purposes by scene:
1. Arc over interruption; next arc rises onto solid ledge; descending cluster releases the tap.
2. Fall notation before delayed bird arc; bowl landing; exit arc and settled landing.
3. Shared granny arc/landing; modest lower cluster; upper invitation, short landing and edge arc returning to street.
4. Rise arc and landing; short grounded lead-in to the **edge**, then late arc over the scooter and down to the lower street. No early high arc invites an unsafe jump when the scooter first appears.
5. Downward entry; airborne path toward Lipton; grounded seat reward. One jump both takes fast recovery and skips rest.
6. Two actual ground rises and landings; alternatives from the same crest (walk-off cluster / higher airborne descent); combined birds-gap arc; separate final granny arc and cat approach.

Cluster purposes and explicit positions are in src/food-layout.ts. They are not generated by traversing platform arrays or filling empty stretches.

## Five required full runs

| Run | Time | Food | Final energy | Accepted collisions | Bench | Lipton | Longest input/visible-decision gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal clean | 41.55s | 128 | 38.77 | 0 | 0 | 1 | 3.58s |
| Collector | 41.55s | 137 | 38.77 | 0 | 0 | 1 | 3.58s |
| Ground-only / no bonus | 41.55s | 126 | 38.77 | 0 | 0 | 1 | 3.58s |
| Low-energy (zero at start) | 64.37s | 110 | 27.63 | 0 | 1 | 0 | 5.92s |
| Intentional errors | 44.45s | 113 | 59.37 | 1 | 1 | 0 | 5.25s |

Additional permanently-zero diagnostic: 74.55s, 105 food, zero final energy, zero collisions, one bench (energy forced back to zero), zero resets. Every full run reaches the cat without a reset. Normal/collector/ground/low-energy contain zero unplanned blocked waits. Intentional errors incur one scooter hit for 12 energy plus existing slow, then use the bench.

### Flow and honest limits

Input/decision gaps use real jump/rest events plus authored **visible** route, landing or recovery reveals. A target beyond the camera's current look-ahead is not counted yet. Automatic food collection is never counted as input. Decisions are opportunities, not proof that a human noticed them.

The longest clean gap is **3.58s**, from the causeway entry takeoff near x5930 to the visible edge reveal near x7118. This includes the jump/landing and intentional approach/anticipation. A pure tap-only measurement is longer: **5.58s** on ground-only, because choosing to stay down does not require a tap. Both numbers are retained rather than hiding the distinction.

With zero initial energy, the longest gap is **5.92s**, between the bowl exit and the next granny jump. The lower speed stretches that existing recovery-pressure phrase. In the intentional-error run the maximum is **5.25s**, including the deliberate 2.5s bench rest and exit/reveal. These longer low-energy intervals remain phone-playtest questions; this implementation does not silently redesign them after validation.

There are no compulsory bench stops. Zero-energy bench bypass separately clears the seat and collects Lipton; remaining grounded activates rest and misses the bottle. The collector's sole upper excursion lasts **2.23s** (ordinary entry/walk-off 1.90s), measured from takeoff to returning to ground. Missing entry or skipping the edge tap loses rewards and returns to a clear lower route. No repeated climb/reward/descend phrase was recreated across scenes.

## Stable portrait scooter staging

Phone test viewport 390×844; world width 340, zoom **1.1470588**, unchanged for every frame of every run. Portrait at other screen widths scales once with the viewport, not with hazard proximity. Vertical follow is the existing smooth offset.

The scooter starts at x7630 on the lower street (y472), runs left at the existing 210px/s, and meets the visible filled causeway face x7410. Ordinary ground collision stops it at center x7444. No hidden barrier, freeze timer, altered speed, actor scaling or camera animation was introduced. The intended jump is at the road edge near x7400, landing on the lower street beyond the scooter. Without jumping, both normal and tired tests take a real scooter hit.

Full-run full-sprite visibility → intended tap: **0.57s normal**, **1.22s tired**. Isolated tests with tap 20px before the edge give 0.50s / 1.15s; 10px before gives 0.53s / 1.20s. From 40px before through 10px after the edge, all six sampled jump timings clear at both speeds. More time is not claimed by counting food cues as scooter visibility. The scooter may already be stopped against the face when the player commits; that is the actual staging, not an uninterrupted flat-road crossing.

## Measured jump envelope and mandatory margins

| Measurement | Normal | Tired |
| --- | ---: | ---: |
| Maximum height | 107.33 | 85.17 |
| Level-ground duration | 0.80 | 0.70 |
| Level-ground horizontal reach | 264.00 | 133.00 |

Heights/reaches are world px, durations seconds. These are discrete 60Hz measurements, not a made-up tile grid. Actor body remains 24×50; art 40×56. Mandatory rises are only 24 or 32px, leaving 83.33/61.17px and 75.33/53.17px height margin respectively.

“Landing margin” below is measured at the first full-foot landing: center beyond the landing edge minus body half-width 12px. Values are the worst of three tested takeoff leads (normal 105/125/145, tired 35/45/55). This is a sampled safety window, not a claimed exhaustive human timing limit.

| Required rise x | Rise | Normal height margin | Tired height margin | Worst normal landing margin | Worst tired landing margin |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1160 | 24 | 83.33 | 61.17 | 90.50 | 56.83 |
| 3060 | 24 | 83.33 | 61.17 | 90.50 | 56.83 |
| 6050 | 32 | 75.33 | 53.17 | 85.00 | 53.67 |
| 10450 | 32 | 75.33 | 53.17 | 85.00 | 53.67 |
| 11100 | 32 | 75.33 | 53.17 | 85.00 | 53.67 |

Short interruptions are validated as actual full trajectories from the preceding street, separately from rise tests. This avoids placing a takeoff inside solid ground when a pocket is shorter than a standard lead.

| Interruption | Width / safety depth | Worst normal landing margin | Worst tired landing margin |
| --- | --- | ---: | ---: |
| x520 | 50 / 24 | 82.00 | 23.33 |
| x12590 | 40 / 24 | 92.00 | 33.33 |

Gap takeoff leads sampled: normal 80/100/120, tired 28/38/48. All clear without side contact or dipping below the takeoff surface. Missed interruptions have a real safe bottom; jumping out from each bottom is tested at both speeds. A very short interruption can also be crossed by a small safe dip without reaching its bottom; a floor hit is not falsely required for fail-forward.

The final flock+interruption uses a later tap at tired speed. Both actual full-run and isolated bird timing tests pass without unavoidable hits. Sampled bird jump leads: normal 85/100/115 to the moving flock, tired first flock 30/40/50, tired final flock 0/10/20. Granny clearances are exercised in all normal and zero-energy full runs. No required jump needs the optional 80px awning; it is below normal apex by 27.33px but is intentionally not the tired main route.

The 64px scooter drop extends flight. The most conservative of six tested scooter taps lands with the full body **187px beyond visible danger at normal speed / 40.67px tired**. At the intended 10px-before-edge tap the margins are 214.5 / 69.17px. Filled terrain landings are hundreds of pixels wide; no mandatory needle-width landing exists.

## Visual-collision validation

- Zero rectangle visual-edge/body-edge mismatches across all ground and one-way surfaces.
- Terraces extend to y660: no traversable underside, fake ledge or invisible parallel path.
- Only one upper platform, in scene 3. Top edge, translucent underside and arrows retain existing one-way notation. Upward passage and descending landing both tested; side/underside never block.
- Ground-to-awning underside clearance **68px**, versus body height 50px and art 56px. The clear lower route contains no boxes or hidden hazards. Support posts are background elements with no body.
- No boxes remain; therefore no box-under-roof ambiguity or drawn-passable solid crate.
- Scooter, pigeon and granny damage rectangles remain entirely inside opaque silhouette pixels (zero transparent-area violations). Scooter rider/stem/deck/wheels and individual visible birds retain their existing masks; flying birds do not become invisibly harmless.
- Bench trigger matches the marked 24px seat, not the entire 90px prop; airborne passage does not trigger a stop.
- Coyote tests: 5 frames after leaving a surface still jump; 12 do not. Buffered pre-landing tap fires. Changing energy during flight preserves committed horizontal speed until landing.
- Touch, Space/ArrowUp, all three endings and replay reset pass. A/B/C debugging views retain identical world physics. Portrait HUD bounds, orientation pause/resume and manifest pass.

## Reproduce and next step

Run a Vite dev server, then `npm run test:level`, `npm run test:presentation`, and `npm run build`. Browser executable may be supplied with CHROMIUM_PATH. JSON evidence is written to `/tmp/tanya-ground-first-audit.json` and `/tmp/tanya-ground-collision-audit.json`; presentation screenshots and UI records also go to /tmp.

Next step is manual **portrait phone playtesting**: delayed bird taps, sole bonus entry/edge timing, lower-street scooter reveal, recovery choice, tired reach and final food outcomes. Automated Chromium checks do not establish Safari timing or subjective rhythm quality. No further autonomous level-design iteration follows these results.
