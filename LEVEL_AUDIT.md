# Tanya Cat Runner — approved ground-first revision

## Scope and method

Workspace fetched latest `origin/main` and is based on `64fbe2a` (Add level reference principles). GAME_DESIGN.md and LEVEL_REFERENCES.md were read in full before edits. The prototype target remains **60–90 seconds**. Existing single-tap jump, energy, Lipton, bench, hazards and Model B endings are preserved.

These are automated playthroughs, not claims about human playtest enjoyment. They step the actual Phaser Arcade scene at 60Hz and dispatch real Space events. Full runs do not teleport Tanya, grant food, or change movement. The low-energy run starts at zero; the mistake run deliberately omits a gap jump, attempts an upper entry too early, hits a scooter and chooses the bench. Separate interaction tests may isolate actors or set positions.

Geometry was implemented and tested with no food first. Only then were food arcs, landing/descent clusters and rewards authored. Thresholds were selected after measuring coherent route budgets.

## Seven authored gameplay phrases

Solid terrain is filled from its visible surface down to y=660. The baseline is y=440. Heights below are relative to that baseline; positive heights are raised ground. The lower route does not pass under terraces. Only sections 3 and 7 have one-way elevated geometry.

| Section / x range | Clean time | Finger / attention rhythm (3–5 phrases) | Ground profile, hazards and route tradeoff | Food N/G/C |
| --- | ---: | --- | --- | ---: |
| 1. Земля готовит посадку / 100–3400 | 9.95s | read arc + jump rise → land → choose walk-off → jump shallow interruption → airborne reward | 0 → +24 → 0 → −24 pocket → 0. First teaching jump has no hazard. | 19 / 19 / 19 |
| 2. Спуск меняет момент / 3400–6700 | 10.00s | walk off + read flock → delay bird jump → jump ground ledge → jump birds at new height → choose exit reward | 0 → −20 → +20 → 0. Birds are on low and raised street; no awning. | 22 / 22 / 22 |
| 3. Пересечь и выбрать / 6700–10330 | 11.00s | jump interruption → granny jump + Lipton → choose brief bird detour / stay grounded → common reward → descend and exit pocket | Shared gap and granny BEFORE fork. One 520px awning at +80, its own flock and extra tap; missing it returns to clear ground. Then −20 street pocket. | 41 / 29 / 41 |
| 4. Посадка меняет встречу / 10330–13630 | 10.00s | jump raised street → read and time scooter → land reward → jump off or walk off → low-ground reward | 0 → +24 encounter street → 0. Separate entry jump and scooter; scooter is visible after a safe landing. | 22 / 22 / 22 |
| 5. Продолжить или восстановиться / 13630–16600 | 9.00s | read energy → Lipton jump OR grounded bench → land/rest → exit pocket → prepare climb | 0 → −24 recovery pocket → 0. Bottle BEFORE seat. Jumping skips 2.5s rest; seat gives more recovery and ground food, misses the bottle. | 16 / 16 / 16 |
| 6. Городской перепад / 16600–19980 | 10.25s | read filled rise + jump → second ground rise → crest bird jump → one safe walk-off → read oncoming traffic | 0 → +44 → +80 → 0. NO lower passage, NO one-way platforms. Only multi-rise phrase; crest flock is jumped after landing. | 19 / 19 / 19 |
| 7. Вернуться, выбрать, покормить / 19980–23860 | 11.53s | shared scooter jump → Lipton decision → choose short edge-timed bonus / grounded bypass → common reward + shallow interruption → cat | Traffic BEFORE fork. One 340px ledge at +80: land, then edge-timed second tap for high food. Safe fall loses reward. Last pocket is −24. | 26 / 26 / 35 |

N = natural mixed route (first detour), G = ground-focused, C = collector (both detours). These are achieved budgets, not a 100% collectible total.

Full rhythm: **rise → land → drop → interruption → delayed birds → ledge birds → gap → granny/recovery → brief bird bonus → ground reunion → raised-street scooter → descent choice → recovery choice → solid terrace → higher ground + birds → one descent → shared scooter → edge-timed bonus → ground interruption → cat**.

No boxes remain in this authored layout. There is no repeated box/wait grammar, no repeated canopy chain and no traversable lower path beneath section 6. The two bonus detours differ: perched bird timing in section 3, short landing plus edge reward in section 7. Both require extra execution for extra food; neither removes the shared ground hazards. Ground-only remains viable.

The unique terrace episode lasts about 4.8 seconds on normal speed. This is raised **ground**, not a bonus upper excursion. The post-crest single fall has a visible safe landing and separate scooter anticipation.

## Food model and measured budgets

HUD: `Корм: X`, `Котику нужно: 128`. No X / world-total count. New thresholds: **128 feeding / 170 bonus**.

- Ground-focused: 153 (+25 feeding margin).
- Natural, one detour: 165 (+37 feeding margin, below bonus).
- Coherent collector, both detours: 174 (+4 bonus margin).
- Low-energy with recovery: 140 (+12 feeding margin).
- Intentional mistakes: 144 (+16 feeding margin).

Minimum reached at 54.05s (75% of run) on natural/collector routes, 60.30s (84%) on ground. Collector reaches bonus at 69.38s, in the final section. The second detour/execution matters: merely finishing, or taking only the first bonus, does not automatically get the feast.

Food clusters are authored individually in `src/food-layout.ts`, each with a documented movement purpose. They trace rising jumps, delayed bird arcs, safe landings, walk-off descents, recovery choice and optional high arcs. Ground/upper and bench/bypass rewards may be mutually exclusive, as allowed by Model B. These budgets are reproducible examples, not proven maxima. Below minimum explains the shortfall and offers replay; feeding and feast use distinct existing cat endings.

## Five full runs

| Run | Time, s | Food | Finish energy | Collisions | Bench uses | Lipton | Longest input/decision interval, s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Natural (first detour) | 71.73 | 165 | 22.40 | 0 | 0 | 3 | 3.03 |
| Ground-focused | 71.73 | 153 | 22.40 | 0 | 0 | 3 | 3.03 |
| Collector (both detours) | 71.73 | 174 | 22.40 | 0 | 0 | 3 | 3.03 |
| Low energy (zero at start) | 98.42 | 140 | 20.93 | 0 | 1 | 2 | 5.57 |
| Intentional mistakes | 74.62 | 144 | 43.03 | 1 | 1 | 2 | 6.22 |

All five feed the cat. All clean/low-energy runs have zero forced geometry waits, collisions or resets. The clean runs skip the bench; low-energy/mistake runs use it once. The mistake run registers the intended 12-energy scooter hit and safely misses both the first interruption trajectory and the first upper entry. There are no respawns.

### Results by section

Cells give **time / food / collisions / bench uses**. Normal and collector differ in food/routing, not travel duration. The seven clean durations above apply to all three clean runs.

| Section | Natural | Ground | Collector | Low-energy | Mistake |
| --- | --- | --- | --- | --- | --- |
| 1 | 9.95s / 19 / 0 / 0 | 9.95s / 19 / 0 / 0 | 9.95s / 19 / 0 / 0 | 17.28s / 16 / 0 / 0 | 9.95s / 15 / 0 / 0 |
| 2 | 10.00s / 22 / 0 / 0 | 10.00s / 22 / 0 / 0 | 10.00s / 22 / 0 / 0 | 17.37s / 18 / 0 / 0 | 10.00s / 22 / 0 / 0 |
| 3 | 11.00s / 41 / 0 / 0 | 11.00s / 29 / 0 / 0 | 11.00s / 41 / 0 / 0 | 13.07s / 27 / 0 / 0 | 11.00s / 30 / 0 / 0 |
| 4 | 10.00s / 22 / 0 / 0 | 10.00s / 22 / 0 / 0 | 10.00s / 22 / 0 / 0 | 15.65s / 20 / 0 / 0 | 10.45s / 18 / 1 / 0 |
| 5 | 9.00s / 16 / 0 / 0 | 9.00s / 16 / 0 / 0 | 9.00s / 16 / 0 / 0 | 13.28s / 14 / 0 / 1 | 11.45s / 14 / 0 / 1 |
| 6 | 10.25s / 19 / 0 / 0 | 10.25s / 19 / 0 / 0 | 10.25s / 19 / 0 / 0 | 10.23s / 19 / 0 / 0 | 10.23s / 19 / 0 / 0 |
| 7 | 11.53s / 26 / 0 / 0 | 11.53s / 26 / 0 / 0 | 11.53s / 35 / 0 / 0 | 11.53s / 26 / 0 / 0 | 11.53s / 26 / 0 / 0 |

### Clean-run flow and limits of instrumentation

Meaningful intervals count actual jumps, recovery activation, explicit route commitments, intentional descent choices, and the first readable terrace/traffic cue. Terrace and traffic anticipation are counted only once their target is within the real camera view; automatic food/bottle pickups do not reset the metric. Run start/end are included. The same routes were checked at 844×390 and the narrower 667×390 landscape viewport.

Longest clean input-or-decision interval: **3.03s**, section 3's pocket exit to section 4's raised-street entry. The final ground approach is included (2.92s); it is not hidden by an automatic pickup. There is no forced clean bench, wait or stop.

Longest interval between taps/rest activations alone: **5.03s** in clean runs. This includes the intentional crest walk-off, visible landing and reading the next scooter. Whether those decisions feel active enough needs phone playtesting; a log does not measure attention.

Low-energy: **5.57s** between meaningful events, **8.15s** between inputs alone. Slower running stretches the scooter-to-descent phrase. Mistake: **6.22s** because the scooter tap was deliberately omitted; bench-related interval 4.83s includes the intentional 2.5s rest. These longer fatigue/failure intervals are reported rather than silently counted as food interactions. No further design pass was made after final validation.

Extra artificial diagnostic: continuously force zero energy and disable bottles. Tanya reaches the cat in 126.95s, with 126 food, no collisions or resets. The 128 requirement correctly produces the two-food shortfall/replay ending. This tests absence of terrain soft-lock, not a promised winning run without recovery.

## Measured jump envelope and every mandatory transition

Normal: **107.33px apex, 0.80s flight, 264px horizontal reach**. Tired: **85.17px, 0.70s, 133px**. Coyote remains 130ms, buffer 150ms. A committed airborne speed stays fixed until landing. No hold jump or double-tap boost.

Each solid step-up was isolated and tested at three normal leads (105/125/145px) and three tired leads (35/45/55px). All 60 samples landed without contacting the vertical face. The following margins are measured outcomes, not a tile-grid standard. Foot margin is how far the entire 24px-wide body landed past the edge in the worst tired sample.

| Position x | Rise | Tired apex margin | Worst tired full-foot landing margin | Filled landing span |
| --- | ---: | ---: | ---: | ---: |
| 600 | 24px | 61.17px | 56.83px | 720px |
| 2200 | 24px | 61.17px | 56.83px | 1510px |
| 4930 | 40px | 45.17px | 50.50px | 1140px |
| 6910 | 24px | 61.17px | 56.83px | 2340px |
| 9800 | 20px | 65.17px | 60.00px | 1000px |
| 10800 | 24px | 61.17px | 56.83px | 1860px |
| 15360 | 24px | 61.17px | 56.83px | 1940px |
| 17300 | 44px | 41.17px | 47.33px | 600px |
| 17900 | 36px | 49.17px | 50.50px | 970px |
| 22980 | 24px | 61.17px | 56.83px | 1030px |

- Clean interruption jumps: x=2140, 6850, 22920, each 60px wide, with a safe floor 24px below. At the intended tired lead of ~38px, crossing with the entire body needs 38 + 60 + 12 = 110px, leaving **23px** inside measured 133px reach. They are not mandatory for survival: all three missed jumps were tested by dropping to y=464 and jumping back out without reset.
- Smallest required rising landing span is 600px; required upward landing full-foot margin is at least 47.33px even across the tested tired timing window. Steps are not combined with a hazard at the same mandatory landing point.
- Optional +80px awnings are deliberately not required at zero energy (only 5.17px tired apex margin). Their misses fall to clear ground. They are never part of the mandatory tired route.
- Upper excursions, measured from takeoff to return to ground: **section 3: 2.27s; section 7: 2.05s**. Longest is 2.27s. Standing-time alone is not used to understate them.

## Visual-collision and hazard validation

- All visible terrain/awning rectangle edges match their static physics rectangles: zero mismatches.
- Section 6 terraces fill down to y=660; no phantom flat floor, decorative terrace underside or fake lower opening.
- Both pass-under routes are flat and clear, with 68px underside-to-ground clearance. Tanya's physical height is 50px; visible silhouette about 54px, leaving 18px physical / ~14px visual clearance. No box or hazard sits under either low ceiling.
- One-way awnings have a translucent/open underside, strong top edge, arrows and background posts. Tested upward passage and descending landing; support posts do not collide.
- Scooter/granny/pigeon danger masks have zero pixels outside the visible placeholder silhouettes. Visible birds remain dangerous during flight; upper birds are not triggered by a runner below the awning.
- Scooters now follow actual terrain via gravity and ground collision, keeping wheels on the raised encounter surface rather than sinking/hovering. No unavoidable tired collision: safe input leads tested at 85, 105, 130, 155, 180, 205px. Late 65/75px taps do hit the scooter, rather than its visible rider becoming harmless.
- At 667×375, scooter first visibility is about 480px away on the normal test and 552px when tired. Time from first visibility to the representative 160/85px tap is **0.60s normal / 1.18s tired**. Both encounters follow a safe ground landing, not a blind drop.
- Missed upper entry, omitted upper bird jump and omitted final ledge tap all return safely to ground. Missing the bird tap registers bird damage; omitting the edge tap loses food, proving the upper rewards carry an execution cost.
- Zero-energy bench bypass takes the preceding bottle without resting; grounded rest skips it. Bench resume/reset uses the local terrain height. Sensors never create artificial ground for midair jumps.
- Coyote cutoff, buffered landing, touch, ArrowUp, three endings, replay reset and mobile HUD bounds pass.

## Reproduce / stop for phone testing

Start `npm run dev`, then run `npm run test:level` and `npm run build`. `LEVEL_URL`/`CHROMIUM_PATH` choose server/browser; `AUDIT_WIDTH=667` repeats full runs in narrower landscape. Detailed full traces: `/tmp/tanya-ground-first-audit.json`, phone-width trace `/tmp/tanya-phone-ground-audit.json`, isolated checks `/tmp/tanya-ground-collision-audit.json`.

Build validates TypeScript, production bundle and offline PWA manifest/cache. Existing Phaser bundle-size advisory remains. Automated checks cannot establish subjective tap comfort, attention or fun.

**Stop here for manual phone playtesting.** Focus on the delayed bird taps, two short upper challenges, the bench/Lipton choice, readable terrain edges, and longer tired-state breathing spaces. Do not perform another autonomous level-design iteration before that feedback.
