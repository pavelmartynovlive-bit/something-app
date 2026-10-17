# Winter environment integration — 2026-10-17

> Current spacing and fatigue: [clearances / wider pits / zero-energy85px/s](clearance-and-fatigue.md).
> Earlier phone-feedback changes: [floating islands, pit rubbish, no lamps or billboards](phone-feedback.md).
> Presentation numbers below describe the original integration; use the linked update for the current state.

Base: `28b0ab1`. Read current GAME_DESIGN.md in full, LEVEL_REFERENCES.md, the
scene, terrain, settings and PNG metadata before editing. Existing Level V3 is
the sole geometry source. This pass changes rendering, not the level.

## Before / after architecture

`src/terrain.ts` defines 27 filled spans, including four analytic ramps and four
pit bottoms. `src/main.ts` creates 23 flat-ground static rectangles, five one-way
platform rectangles and the unchanged 24×32 bench overlap region. Ground/ramp
contact also uses `resolveTerrainContacts` after each fixed physics step.

Those collision bodies remain exactly the same, with the same groups, callbacks,
one-way flags, offsets and analytic contact. Their old drawings are hidden.
`WinterEnvironment` reads settings and creates **52 visual-only objects** with no
physics bodies: terrain, slush, platforms, scenery and one bench image. It never
calls a physics factory or writes to settings. The invisible original bench
sprite keeps its `bench` texture (90×44), world position and overlap body.

Original PNGs are copied unchanged from `art-assets/winter-environment-kit` to
`public/assets/environment/winter`. The loader uses BASE_URL for GitHub Pages.
The source kit stays independent; the public copy is the runtime asset set.

## Asset map and adaptation

| PNG | Actual use | Adaptation |
| --- | --- | --- |
| ground_snow_basic | All ordinary filled ground | Repeated central wall material; normalized snow band along existing tops |
| cliff_tall | High ledge / high filled spans, including descent from high ground | Separate repeated wall and fixed 20px snow band; no scaling of an entire tall block |
| platform_short | Existing 110 /120px platforms | Crop padding; normalize to exact width and existing 12px thickness |
| platform_floating_small | Existing 80 /100 /100px platforms | Same; no extension of landing width |
| slope_snow | All four existing analytic ramps | Source snow band follows the exact analytic diagonal, not the PNG's original slope angle |
| pit_edge | 24px rim strips adjoining each existing pit | Sample snow/cornice and clip within solid geometry; mirror sampling for opposite rim |
| hazard_slush | Floors of 70 /270 /60 /40px pits | 12px visual strip at floor−1; repeated modules for the boost pit; no damage/trigger |
| garage_winter | Decorative x160 /5000 /10510 | Crop transparent padding; uniform width160; cool tint, behind terrain |
| bench_winter | Existing interactive bench x7200 | Crop; uniform width90, ~42px art height; original trigger untouched, gold seat cue retained |
| streetlamp_winter | x880 /1740 /4690 /5660 /7380 /8780 /10480 | Uniform width25, behind actors and terrain |
| railing_winter | x650 /1640 /5090 /7000 /8660 | Uniform width105, behind actors; no decorative bench duplicates |
| stairs_winter | **Not rendered** | Its four equal steps do not match any existing terrain sequence. Source/public PNG retained, not preloaded. No staircase invented. |

All PNGs have a genuine RGBA alpha channel. Source dimensions range from
1024×1536 to2172×724; exact alpha bounds are in `winter-environment-assets.ts` and
original kit manifest. Never use these bounds to derive collision geometry.

Ground is not one stretched panorama. Wall samples repeat through mirrored
adjacent cells (ground220×34, high wall135×150 world units before mirroring).
Identical mirrored edge pixels avoid a hard wrap seam. Snow samples repeat with
mirrored adjacency too. The generated kit is not intrinsically seamless; this
runtime sampling adapts it without changing the source PNG. Texture variation
remains recognizable on long walls, but there are no unfilled ground seams.

The snow's irregular painted upper contour is resampled column by column onto
the current flat/diagonal surface. Snow stays **below** that surface. Fixed 20px
ground snow and 5px platform snow prevent stretched caps. Platform material is
trimmed to the existing 12px depth; dangling decorative icicles are excluded.
This is deliberate art adaptation, not a new collision interpretation. One-way
underside dashes, upward cues and non-colliding support posts remain visible.

Geometry is baked into 2× CanvasTextures once, reused on replay and owned by the
TextureManager until game destruction. This avoids regenerating/uploading the
whole level after every restart. Scene shutdown removes displayed instances and
render listeners. Resize changes the camera viewport, never art world coordinates.

## Depth

Existing parallax:−100..−97, unchanged (middle-city still only at ends).
New scenery:−30..−28; support posts:−1; terrain:0; slush:1; bench:2; seat cue:3;
food/Lipton:5; enemies/cat:8; Tanya:10; pickup feedback:20; dev overlay:100.
Existing HTML HUD remains above the canvas. Decorations do not occlude actors,
food or active recovery items. Garages are decorative; their roofs have no body.

## Debug and screenshots

Development only: append `?debugEnvironment=1` (or `&debugEnvironment=1`).
Cyan outlines show actual bodies; green lines show analytic ground and one-way
tops; pink shows pit/fall zones. Cyan flags and translucent 24×50 body footprints
show existing recovery anchors / solid safe spawn positions, not new mechanics.
The query does not enable the overlay in production.

Portrait390×844 snapshots from actual normal-run trajectory:

- [10%](10.png)
- [30%](30.png)
- [50%](50.png)
- [70%](70.png)
- [90%](90.png)
- [Debug, long pit](debug.png)

The screenshot harness freezes the loaded game's scene and physics while drawing
recorded poses; it does not create a separate staged level. It asserts progress
labels to avoid accidentally capturing a running start screen. Tests import the
script URL actually in the document, including Vite HMR timestamps, avoiding a
second game instance from a mismatched import URL.

## Validation

[Pixel/collision/resize evidence](visual-contract.json) ·
[Full-run comparison](gameplay-validation.json)

- 28 existing collision rectangles equal expected geometry exactly; bench proxy,
  body offset and dimensions unchanged. No body on any of the52 new visual objects.
- 21,460 terrain columns: no missing pixels below the analytic top, no overhang
  above it. Maximum raster difference0.351 world pixels (under half a pixel).
- Platforms remain exactly120/80/100/110/100 wide and12 high. Five resize states
  (including landscape and return) retain identical visual world bounds.
- Replays retain52 instances /36 baked textures, without accumulating copies.
- Seven fresh full runs before/after match time, food, energy, collisions,
  bench, Lipton, boosts, falls, recoveries and ending within1e−6.

| Automated run | Seconds | Food | Energy | Hits | Bench / Lipton | Boosts | Falls / returns |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| Normal | 42.10 | 98 | 15.825 | 0 | 0 /3 | 3 | 0 /0 |
| Collector | 41.23 | 103 | 6.295 | 0 | 0 /2 | 5 | 0 /0 |
| Zero-start | 52.50 | 92 | 10.003 | 0 | 1 /3 | 3 | 0 /0 |
| Intentional collisions | 50.77 | 89 | 0 | 8 | 0 /2 | 4 | 0 /0 |
| Intentional pit falls | 48.70 | 98 | 0 | 1 | 0 /3 | 3 | 4 /4 |
| Platform misses | 42.12 | 90 | 15.778 | 0 | 0 /3 | 3 | 0 /0 |
| Bench route | 44.52 | 96 | 52.350 | 0 | 1 /3 | 3 | 0 /0 |

- Existing collision suite passes: all mandatory rises, short/long gaps at normal
  and tired speed, one-way surfaces, boost/coyote/buffer, scooter timing, bench,
  hazard masks and endings.
- Recovery suite passes:18 normal/tired anchor probes,40 ramp probes at15–120fps,
  46 solid-ground landing probes and bench flow. Existing prior ramp-bug reproduction
  stays in the test; it is intentionally broken only inside that control experiment.
- Three scooter lanes pass at15/30/60fps. No actor behavior changed.
- TypeScript / production build pass. Service worker includes all12 environment
  PNGs (including unused stairs) automatically:24 cached files total. Raw art adds
  approximately14MB to initial assets/offline storage; no silent lossy conversion.

No new visual/collision boundary mismatch found by probes or inspected frames.
Decorative garages/lamps/railings intentionally have no collision. Remaining
limitations: steps are not used; concrete repetition can be recognized; one-way
platforms retain explicit directional cues rather than becoming solid boxes.
Existing visual-density / input-rhythm findings in LEVEL_AUDIT.md are not solved
or redesigned here. Browser automation and screenshots are not manual phone
playtesting; stop for phone review after integration.

Reproduce with Vite running:

```sh
node scripts/audit-v3.mjs
npm run test:environment
node scripts/validate-collisions.mjs
node scripts/validate-recovery.mjs
node scripts/validate-scooter-lanes.mjs
npm run test:background
npm run test:presentation
npm run build
```

Code changed: `src/main.ts` (render hookup/depth/hidden proxies), new
`src/winter-environment.ts`, new `src/winter-environment-assets.ts`.
Also: public PNG copies, environment validation script, existing background test's
loaded-module import fix, npm test command, report and snapshots. No changes to
settings, terrain, food layout, controls, presentation/camera or hazard masks.
