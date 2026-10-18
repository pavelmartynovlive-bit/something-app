# Current audit — collectible trust and platform purpose (2026-10-18)

> Character presentation updated afterwards: see [Tanya integration](docs/tanya/README.md). Level layout and the following food budgets remain unchanged; current heroine captures are in docs/tanya.

This is a focused refinement of the existing V3, not a new layout. Read the full
GAME_DESIGN.md, LEVEL_REFERENCES.md, previous audit and scene/data first. Preserve
all27 ground spans, four pits, ten phrases,10730px length, enemies, portrait
camera and §31 fatigue/jump/recovery mechanics. Remove only one redundant aerial
island; reposition only food and the late Lipton by8px vertically. No new system.
Older numbers below the historical divider are superseded by this report.

## Audit before implementation

| Place | Food promise | Actual outcome / problem | Implemented correction |
| --- | --- | --- | --- |
| Opening375–1040 | Gap, granny avoidance, small rise | Main cues work;1050 island is unexplained and cannot catch the ordinary ascent jump | Keep the three authored groups; remove1050 island |
| High ledge1320–1830 | Early boost, high landing, granny reward | Coherent tested path | Preserve |
| Downhill2020–2640 | Descend, birds jump, continue collecting | Bird reward flows into an upper takeoff without showing the lower reward first | End in a grounded landing/common breadcrumb, then split |
| Bonus entrance2680–2950 | One high arc looks like the only continuation | Lower reward begins too late; choosing an upper route is not clearly advertised | Low403px and rising310px branches start at the same2680 coordinate, visible before takeoff |
| Upper2960–3550 | Zig-zag and high food | Landings and common return are poorly identified | Separate landing sweeps, high skill reward and downward return |
| Long pit / roadway | Boost crossing, then sparse scooter timing | No conflicting alternate route; tested coherent | Preserve the distinct parabola and timing markers |
| Cascade5765–6460 | Drop, gap, granny reward | Coherent tested movement, no late route split | Preserve |
| Bench6880–7390 | Follow an early high arc | Natural collection bypasses rest; rest looks like abandoning the prescribed path | Grounded common approach; low seat markers vs a late, separate optional hop; shared exit |
| Middle terrace8020–8190 | High bonus food | No clear reward for a perch landing; bottle just out of standing reach | Low scooter timing markers, actual landing reward, Lipton270→278 so standing contact works |
| Final climb / descent / cat | Rise, hazard timing, final landing | Coherent tested movement, no additional branch needed | Preserve existing varying patterns |

## Every separate aerial platform

| Platform (x / top / width) | Function before | Decision / function now | Verified |
| --- | --- | --- | --- |
|1050 /315 /110 | No clear reward; ordinary preceding jump cannot reach it | **Remove**; ground rise remains exactly as before | No remaining collider or island art |
|2860 /317 /120 | Entry to optional high line | **Keep**: boosted entry landing, explicit landing reward, next short jump | Collector and zero-start land here |
|3040 /261 /80 | Intermediate short surface | **Keep**: changes altitude and prepares third landing; food marks sweep/landing | Collector and zero-start land here |
|3190 /205 /100 | Final high surface | **Keep**: skill reward launch and readable descent to common ground | Collector and zero-start land here |
|8130 /348 /100 | Unclear perch near scooter / bottle | **Keep, give clear reward**: catches scooter jump, rewards landing, reaches Lipton without another tap | Coherent runs plus isolated standing-pickup control |

Widths/heights/positions of all four retained surfaces are unchanged. The upper
three require more execution than simply remaining on the ramp. Misses still
fall onto continuous ground. The middle perch rewards an existing hazard jump;
it does not introduce another compulsory reward jump or another platform chain.
Each retained surface also has an explicit developer-facing `role` in settings.

## Food / recovery composition after the pass

- Bird landing2550/2580 ends at common2610/2640 breadcrumbs.
- At2680 the food separates immediately: low ramp2680–2820, rising boost
  2680–2950. The lower route earns its own compact2940–3020 group.
- Upper path: first landing2950, second short sweep2995–3105, third high
  landing3170–3270, skill reward3300–3470, descent3510/3550. That descent
  returns before the shared granny3690; it does not promise another upper road.
- Bench: grounded6880/6940/7010 approach;7130/7170 seat approach; optional
  late-hop7170/7210/7260 group;7350/7390 common exit. No early obligatory arc.
  At low energy, staying low triggers the existing2.5s/+36 rest. The fast player
  deliberately hops the seat and earns the separate airborne group. No Lipton
  is added nearby; earlier and later bottles remain4590 and8190.
- Middle terrace:8020/8060 low timing markers prepare the existing scooter jump;
  8080/8140/8190 food rewards its flight/landing instead of an unrelated high arc.
  Late Lipton stays at8190, lowered270→278. A standing player on348px top now
  overlaps its bottom304px, rather than missing the former296px bottom by2px.
- Other food patterns are preserved: opening arc, granny crest, vertical boost,
  downhill diagonal, long parabola, sparse timing markers, ground cascade,
  rising staircase and final landing groups. No generic food-arc generator.

## Actual portrait-camera checks

390×844 touch viewport, actual smooth camera records from the full input run.
No idealized camera positioning is used for these assertions or screenshots.

- Upper entry atx2624: viewport2584.93–2924.93. Four low and four rising food
  cues are fully visible before the first tap;64.93px of the120px first landing
  is already visible. The whole later chain is not claimed to be on screen.
- Bench on common approach atx7012: viewport6973.10–7313.10. Full bench plus
  at least two packets on EACH alternative are visible before the fast-hop
  takeoff near7140. Staying low reaches rest naturally.
- Middle perch: its entire100px landing is visible before the actual scooter
  jump atx8039.5 (viewport8000.43–8340.43), including the nearby bottle/reward.

Screenshots replay real collector inputs through Phaser without teleporting
Tanya, terrain or camera: [platform choice](docs/collectible-trust/platform-choice.png),
[first landing](docs/collectible-trust/first-landing.png),
[high reward](docs/collectible-trust/high-reward.png),
[return](docs/collectible-trust/return-to-ground.png),
[bench reveal](docs/collectible-trust/bench-reveal.png),
[bench choice](docs/collectible-trust/bench-choice.png),
[Lipton perch](docs/collectible-trust/lipton-perch.png).
These verify visible cues, not a human's perception or first-play understanding.
Manual phone testing is still required, especially the partially revealed first
platform and the quick upper landings.

## Full runs and food budget

Actual60Hz Phaser physics, ordinary inputs, collisions, energy drain, pickups,
bench and automatic recovery. Natural is an automated first-play approximation:
its controller reads only currently visible terrain/food/actors and does not use
the authored takeoff-coordinate list. Safe/collector/zero-start are explicit
route policies. None substitutes for a new human player's phone playtest.

| Run | Seconds | Food | Final energy | Hits / falls | Bench | Lipton |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Natural, visible cues |44.12|98|53.49|0 /0|1|3|
| Safe ground-first |44.52|98|52.35|0 /0|1|3|
| Collector, upper route |41.92|111|16.35|0 /0|0|3|
| Zero-start, bench recovery |89.60|93|8.25|0 /0|1|3|

**118 placed; minimum80; bonus103.** Natural98 is83.1% of placed food and18 above
feeding minimum. Collector111 is13 more than natural and reaches the bonus.
Natural first reaches80 aroundx8450 /35.8s, so feeding remains relevant late.
The four coherent routes together collect every one of the118 unique positions;
there are no never-reached packets in their union. This is NOT a claim that118
can be collected on one run: the upper and lower branches contain alternatives.
The UI still shows only `Корм: X` and `Котику нужно:80`; the initial HTML fallback now also says80 rather than the historical128.

The natural/ground route no longer requires refusing an earlier packet to learn
about a later platform. Upper food is a visibly separate option. The safe route
has no precision-platform requirement and sufficient margin over the minimum.
The upper route pays more for entry boost / quick landings / extra execution.

## Validation / reproduce

With Vite running:

```sh
npm run test:collectible-trust
node scripts/validate-collisions.mjs
npm run test:fatigue
npm run test:environment
npm run level:overview
npm run build
```

Strict full audit also retains intentional-hit, intentional-pit-fall, platform-
miss and bench policies: nine complete runs in total. Four deliberate pit misses
still produce four returns; missed optional surfaces fail forward. Required
normal/tired transitions, boost gaps, coyote/buffer, one-way contacts, hazard
masks/timing, bench and endings pass. Fatigue transition/speed tests still pass.
The Lipton perch test has an actual negative control: standing pickup at old270
fails, at278 succeeds, both with zero boosts. Production/TypeScript/PWA build
passes; existing large-bundle warning remains.

[Machine-readable current results](docs/collectible-trust/validation.json) ·
[Current overview](docs/level-v3-overview.svg).
No new mechanics, neutral connector, hazard or ground-template repetition.
Stop after this refinement for manual phone testing. No publication is claimed.

---

## Historical V3 audit (superseded exact geometry / budgets below)

# Level V3 — density, distributed energy and scooter fix (2026-10-17)

Base synced to origin/main `a28c29240d974e1258bf734bf4732b01c18654a2`.
Read GAME_DESIGN.md, LEVEL_REFERENCES.md and the previous audit in full first.
The user approved local additions, half-length aerial platforms and distributed
Lipton. This overrides the older single-pocket / mutually exclusive recovery rule.

V3's ten phrases, ground spans, pits, macro silhouette, overall length, portrait
camera, standard jump, early boost, coyote/buffer and food model are retained.
No new system or hazard type. All new geometry consists of local short surfaces.

[Updated section silhouette](docs/level-v3-overview.svg) ·
[Measured results](docs/level-v3-validation.json)

## Local map (same sections)

| Section | Clean duration | Changes / preserved movement |
| --- | ---: | --- |
| 1. Разрыв / низкий остров | 4.12s | Первый разрыв и +25px земля сохранены. Бабушка на740–760 добавляет действие после приземления. Короткая110px опора на1050,y350 подхватывает следующий обычный прыжок; усталая Таня может пройти снизу. |
| 2. Высокий уступ | 2.98s | 135px boost-уступ и бабушка1820–1840 сохранены. Lipton1580,y205 лежит на уже существующей высокой траектории. |
| 3. Склон / птицы | 2.58s | Настоящий наклон и одна стая2500 сохранены. Не превращены в набор ступеней или платформ. |
| 4. Неравные опоры | 5.92s | Три прежние опоры укорочены ровно вдвое:120/80/100. Начала2860/3040/3230, поверхности365/330/390, промежутки60/110. Бабушка3690–3710 встроена в возврат на наклонную землю. Промах безопасно ловит земля. |
| 5. Большой разрыв | 3.18s | 270px boost-разрыв сохранён. Lipton4590,y345 награждает выход из длинного полёта. Все точки возврата работают. |
| 6. Самокатная дорога | 3.83s | Самокат перенесён с нижнего кармана на ровную дорогу y401: spawn5360, старт приТане5190, выход4860. Ожидание → поздний обычный прыжок → прежний спуск. |
| 7. Каскад вниз | 3.88s | 60px разрыв, приземление к бабушке6300–6320 и следующий спуск сохранены; враг не добавлен в слепую точку. |
| 8. Отдых | 3.03s | Одна лавочка7200: остаться внизу и восстановить36 за2.5s OR перепрыгнуть сиденье и продолжить. Старый соседний Lipton убран; ближайшие бутылки далеко в предыдущей/следующей фразе. Участок остаётся намеренной передышкой. |
| 9. Подъём | 5.77s | Прежние40/60/135px цельные подъёмы. Новый самокат8160 движется по ровной средней террасе, короткая100px опора8130,y370 даёт компактное приземление. Поздний Lipton8190,y270 доступен на подходящей траектории; затем высокий boost-уступ. |
| 10. Финальная связка | 6.80s | Прежний высокий сброс → самокат9360 → птицы9590 /40px разрыв → бабушка10230 → кот. Его самокат тоже удаляется до стены. Никакого нового коридора или верхнего шоссе. |

Ground remains the spine. The three-surface line reconnects to the ramp within
~2.7s (collector~2.8s). Additional single accents catch an existing jump; misses
return to ground. The new lower granny and scooter encounters add timings at
existing transitions, not additional road length. Food moved locally to guide
the shortened zig-zag, new granny jumps, live scooter timing and bench bypass.

## Bugs and enemy lifecycle

The old first scooter spawned on the lower465px surface and ran left into the
64px vertical roadway wall. Its velocity kept pointing into that wall, so it
remained visibly stuck. It now spawns on the level401px roadway itself.

All three scooters have explicit flat movement lanes, including full sprite
clearance, and retire before the next pit/wall. A blocked-direction fallback
also retires an actor rather than leaving it wedged. Retiring stops velocity,
disables its physics body and hides the sprite. Disabled actors are excluded
from damage checks, so removal cannot leave an invisible hazard.

| Context | Spawn / launch-player-x | Travel lane | Approx. full visibility → tap |
| --- | --- | --- | ---: |
| roadway → lower landing | 5360 /5190 | 4860–5380 | 0.64s |
| middle ascent terrace → short surface | 8160 /7990 | 7940–8380 | 0.64s |
| final high drop → birds / gap | 9360 /9150 | 8910–9480 | 0.55s |

Nine isolated actual-physics lifecycle tests (3 enemies ×15/30/60fps) prove flat
lanes, no wall contact, no penetration, continued motion after launch, and exit
before geometry. They include the exact scenario that previously trapped A.
Granny full-body anticipation is0.60–0.78s in the normal trace. Reaction figures
interpolate10Hz samples; they are staging estimates, not human playtest results.
Exact encounters: **5 grannies,3 scooters,2 pigeon groups**.

Automatic600ms pit return and slope contact fixes remain intact. One anchor moved
8140→8280 so the new scooter spawn / short surface cannot overlap recovery.
All9 anchors are tested at both energy states with exact feet/camera alignment,
resource preservation and resumed forward motion. There is no manual return UI.

## Energy and recovery

Drain **2.15→2.85/s** (~33% faster). Fatigue physics and collision damage unchanged.
Zero energy still slows Tanya without death or a softlock. No idle regeneration.
Without any pickup,100 energy lasts approximately35.1 active seconds (100/2.85),
shorter than the42.1s clean run: recovery is useful rather than cosmetic.

Three small **+12 Lipton** pickups:

1. **1580,y205** — first high boosted landing, roughly5.8s.
2. **4590,y345** — boosted long-gap exit, roughly17.9s.
3. **8190,y270** — late middle-ascent trajectory, roughly32.7s on the normal line.

One strong bench remains at**7200**, roughly29s:2.5s stop restores**36**.
The old bottle at6970 is removed. Horizontal bench/bottle separation is2610px
from the earlier bottle and990px from the later one, so none overlap the same
micro-decision. Taking an early Lipton no longer globally disables the bench;
resting no longer disables later bottles. A used bench still triggers only once.
All bottles are single-use, including after recovery. No pickup occurs while
sitting because the next bottle is far down the level.

Normal takes3 small bottles, skips the bench, finishes**15.83** energy. Collector
chooses a different high trajectory, misses the last bottle, finishes**6.30** with
2 bottles. This is a real energy/routing trade-off. The bench route takes3 bottles
and pays2.42s additional run time for **52.35** finish energy. Even all recoveries
do not erase the resource to100. Zero-start policy needs the bench and finishes
with**10.00**. Lipton remains useful throughout; bench is distinctly stronger.

## Full-run validation

Actual Phaser60Hz browser scene,390×844 portrait. Full runs retain collisions,
draining, hazards and pickups; only low-energy starts at0. Real keyboard presses
and ordinary automatic pit return. Isolated contact tests reposition actors and
are reported separately. No manual phone test is claimed.

| Run | Seconds | Food | Final energy | Hits | Bench / Lipton | Boosts | Falls / returns | Longest input / new-cue gap(s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| normal | 42.10 | 98 | 15.83 | 0 | 0 / 3 | 3 | 0 / 0 | 2.20 |
| collector | 41.23 | 103 | 6.30 | 0 | 0 / 2 | 5 | 0 / 0 | 2.20 |
| low-energy | 52.50 | 92 | 10.00 | 0 | 1 / 3 | 3 | 0 / 0 | 4.40 |
| intentional-collision | 50.77 | 89 | 0.00 | 8 | 0 / 2 | 4 | 0 / 0 | 3.10 |
| pit-fall | 48.70 | 98 | 0.00 | 1 | 0 / 3 | 3 | 4 / 4 | 2.20 |
| platform-miss | 42.12 | 90 | 15.78 | 0 | 0 / 3 | 3 | 0 / 0 | 2.20 |
| bench | 44.52 | 96 | 52.35 | 0 | 1 / 3 | 3 | 0 / 0 | 3.80 |

All seven reach the cat with enough food; collector reaches the103 bonus ending.
Minimum80 /bonus103 remain unchanged and verified by actual coherent routes.
No X/total food promise. Normal98, collector103, platform-miss90. Normal has not
met the feeding minimum at recovery exit; it remains relevant on the late ascent.

The normal/zero-start policies land on all three120/80/100px surfaces with actual
physics; no boost is required for that optional chain. Collector uses optional
boost to take the high food. A miss safely lands on the ramp. All four pits are
missed once and recovered in one complete run. Intentional collisions register8
hits and still finish; no enemy is unavoidable in the clean policies.

Every full run has0 sampled full-empty viewports at10Hz. This was already0 in the
previous pass, so this is preservation, not a claimed reduction from a nonzero
count. The normal policy now has26 presses including boosts, versus23 before.
Longest raw tap gap3.68s (previous3.92); longest input/new-visible-cue gap2.20s
(previous2.10). The latter lies around the deliberate recovery approach; do not
call it solved or count auto-food pickups as inputs. Zero-start max4.40s includes
rest. Perceived density still needs phone testing. No extra connector was added.

Three-layer heuristic~52% (previous~47%) uses arbitrary distance bands; it is not
a perceptual certification. There is still intentional anticipation and recovery
space. Clean duration42.10s remains below the older45–55s target; the route was
not stretched to pad duration.

## Physics / collision regression

Movement unchanged: normal standard107.33px height /192px reach; tired85.17 /119.
At150ms early second tap: normal boost214.55 /391.83, tired194.75 /350.
Coyote130ms, buffer150ms, boost40–280ms unchanged.

Original small pits70/60/40, large270, ground rises24/25/40/60/135 unchanged.
At sampled launch offsets, small-gap full-foot margin >=46 normal /24.67 tired;
large-gap boost margin >=61.67 /47.67. Both ordinary jumps fail the big gap as
intended. Mandatory135px boosts retain~79.6 /59.7px vertical headroom.
The new short platform openings have65px and75px ground clearance for the50px
body, no lower box or solid support collision. Undersides remain one-way and
visually light; drawn top edges match colliders.

Checks pass:36 required-rise probes,18 small-gap probes,8 long-gap probes,
5 isolated vertical one-way contacts,8 pit returns,18 anchors,40 ramp/frame-rate
cases and46 solid drop cases; coyote/buffer, key-repeat/late/third-tap rejection,
visible hazard alpha masks, touch boost and all three food endings.

One-way fixtures now hold x only in the isolated collision probe so short
surfaces can be tested vertically; real horizontal reach is verified separately
by the full normal and tired chain runs. The old-contact regression now wraps
Phaser's actual cached scene callback: old once-per-render contact still misses
at15/30fps, while the per-substep resolver passes all15–120fps cases. This avoids
mistaking a moving fixture's missed short platform for a collision regression.

Production build / TypeScript / offline-cache generation and presentation tests
(A/B/C, HUD bounds, orientation guard, touch, unchanged collider size) pass.

## Reproduce / stop

With Vite running:

```sh
npm run test:level
npm run test:presentation
npm run level:overview
node scripts/report-v3.mjs
npm run build
```

The overview now labels sections without horizontal text compression and shows
all5 platforms,3 scooter lanes,5 grannies,2 birds,3 bottles, bench, pits, sludge,
anchors and food. It is a development artifact, not new player UI.
Raw traces: `/tmp/tanya-v3-*`; committed JSON contains the compact results.

**Stop for manual phone playtesting; no further autonomous V3 redesign.**


## Latest phone spacing / fatigue update

Approved short pits140/120/80; floating underside clearance≥64.4 (actual≥65),
ascending tops317/261/205, tired speed85. See
[measured report](docs/winter-environment/clearance-and-fatigue.md) and
[current run results](docs/winter-environment/gameplay-validation.json).
Older exact platform/gap/tired-speed numbers above are historical.


## Latest fatigue feedback — 2026-10-18

Zero-energy boost no longer bypasses85px/s fatigue;1–20 energy gives15% slower running and a yellow persistent warning. Geometry and resource balance unchanged. See [fatigue-feedback.md](docs/winter-environment/fatigue-feedback.md) for current envelopes, seven strict full-run results and regression checks. Earlier330px/s tired-boost numbers are historical. Manual phone playtesting remains pending.

## Character animation integration (presentation-only)

The approved20-frame Tanya sheet is now driven by a separate non-physics visual
Sprite. Level data, jump/boost, fatigue, collision bodies and camera are unchanged.
Exact source rectangles and one-time uniform scale/foot registration avoid sheet
padding affecting collision or character scale. Real grounded/velocity state
controls takeoff, rise, fall and short interruptible landing. Bench uses idle;
zero-energy run cadence follows85px/s. See docs/tanya/README.md for all6 FPS ranges.

Nine actual60Hz full runs before and after integration match food, energy, hits,
bench/Lipton use, boosts, falls and returns exactly; elapsed times differ only by
floating-point rounding. Natural44.12s/98food, collector41.90s/111food,
zero-start89.60s/93food, pit-fall4/4 recoveries. All20 sole baselines measure0px
error against the foot anchor; repeated jump can interrupt landing immediately.
No level refinement is part of this change. Manual phone testing remains pending.


## Contextual interactions pass

No terrain/layout, hazards, pickups, jump/boost, run speed or food/energy tuning
was redesigned. Three interactions changed: bench has sit/seated/stand with
fixed body/seat anchors; pit falls physically descend before an invisible220ms
respawn pause; granny/scooter reactions replace alpha blinking with the existing
shared1400ms invulnerability. Seated-only recovery integrates the original36
energy over the same2.5s stop, removing previous frame-overshoot rounding.
Bench-only framing now keeps the prop/heroine fully in portrait view.
Normal and collector runs remain41.90s/111food/16.395energy with no hits/falls.
Natural44.10s/98food; zero-start89.60s/93food. Deliberate pit run51.02s,
4falls/4returns; added time is actual descent rather than frozen-air feedback.
Source scene geometry and ordinary24×50 player body are unchanged.
Validation:6actual small/large/narrow-pit falls at both energies, bench at
30/60/120fps, actual danger-shape contacts with both enemies, cross-hazard
cooldown, jump during hit,18safe-anchor scenarios,40ramp cases and46solid drops.
See docs/tanya/contextual-integration.md and context-validation.json.
