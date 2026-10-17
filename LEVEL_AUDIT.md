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
