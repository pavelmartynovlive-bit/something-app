# Winter parallax background — 2026-10-17

Read GAME_DESIGN.md, LEVEL_REFERENCES.md and the entire PlayScene before editing.
Base: `1fc3a1e340902302e456b67e2deb34336ed25ba2`. The requested public asset
folder was absent; the user explicitly selected the preceding GPT Image files.
They are now copied unchanged into `public/assets/backgrounds/winter/`.

[Gameplay screenshot](winter-parallax-preview.png) · [Measured validation](winter-parallax-validation.json)

## Implementation

`WinterParallaxBackground` owns five Phaser `Image` objects, loader keys, depth,
composition and resizing. PlayScene only calls preload/create/resize/destroy;
the old placeholder scenery Graphics is replaced. No CSS background, TileSprite,
wrapping, repeated copies, filters, physics bodies or colliders. Layers have depth
−100 through−96, below existing structural supports (−1) and gameplay objects(0).

Horizontal scroll factors: sky .01, atmosphere .04, far-city .09, mid-city .16,
near-decor .30. All vertical factors are0, so jumping and camera recovery do not
move the background vertically. Standard camera behavior / zoom remains unchanged.
Near .30 and mid .16 use the quiet end of the proposed ranges. Layer opacity is
1 / .6 /1 /.7 /.55: no tint or contrast filter; foreground drawing is untouched.

The same source image is progressively revealed as the camera moves right:

```
V = camera.width / camera.zoom
T = max(0, worldWidth - V)
requiredWidth = V + T * scrollFactorX
scale = requiredWidth / nativeWidth
```

For opaque sky, scale additionally covers `camera.height / camera.zoom`. Every
image uses identical scaleX/scaleY. At maximum travel, right edge minus camera
travel×factor remains at least V; at start, left edge is0. The inequality holds
continuously between these extremes, not just at screenshot positions.

Transparent architecture is a strip, not an opaque screen fill. Sky covers the
entire viewport; alpha areas reveal the deeper layers. Air sits near the top;
far/mid strips are aligned relative to the existing floor's screen baseline;
near decoration is aligned to viewport bottom so most props remain below the
traversal silhouette and the original solid ground masks their lower parts.
No level-specific positions are embedded in this class. World width is passed
from the existing settings, ground baseline from existing camera framing.

## Actual dimensions

Reference canvas390×844, zoom1.14706, world viewport340×735.795, maximum camera
travel10390. Display dimensions below are **world pixels**, not source PNG pixels.

| Layer | Native PNG | X / Y factor | Display width × height | Uniform scale | Depth |
| --- | --- | --- | --- | --- | --- |
| sky | 2172×724 RGB | .01 /0 | 2207.385×735.795 | 1.01629 | −100 |
| atmosphere | 2172×724 RGBA | .04 /0 | 755.6×251.867 | .34788 | −99 |
| far-city | 2100×749 RGBA | .09 /0 | 1275.1×454.786 | .60719 | −98 |
| mid-city | 2172×724 RGBA | .16 /0 | 2002.4×667.467 | .92192 | −97 |
| near-decor | 2172×724 RGBA | .30 /0 | 3457×1152.333 | 1.59162 | −96 |

The generated source panoramas are~3:1, not the originally requested4–5:1.
Before integration, the short source width and need for near upscaling were
reported; the user selected these existing assets. Near is uniformly upscaled
1.59×, not stretched horizontally or repeated. Its height is cropped by viewport
and gameplay ground. This art resolution is a known limit, not hidden tiling.
Sky cover resizes with viewport height (1814–2437px width across tested portrait
sizes); other strip widths remain fixed while portrait world width stays340.
When returning to the same device size, all layer sizes / positions match exactly.

## Verification

- 0 /10 /25 /50 /75 /90 /100% camera travel, five phone sizes, rotation and return:
  full horizontal coverage for every layer, opaque sky fills height.
- Actual device viewports375×667,390×844,393×852,430×932,375×896;
  rotated844×390 and return390×844.
- Five Images, five distinct factors; no physics body / TileSprite; correct depth.
- Background coordinates are independent of vertical camera scroll. Resize does
  not create extra images; replay creates exactly five, without stale references.
- Start/middle/end rendered screenshots inspected. Actual character/food/hazard
  snapshots also inspected in platform, bench and high-rise phrases. Background
  is pale and subordinate; manual phone readability judgement remains useful.
- All seven complete gameplay policies repeated: time, food, energy, collisions,
  bench/Lipton uses, boosts, falls and returns match pre-integration within1e−6.
  Normal42.10s /98food /15.825energy; collector41.233s /103 /6.295;
  zero-start52.50s /92 /10.0025. Error/fall/platform-miss/bench results also match.
- Gameplay update / energy / food / hazard / recovery methods are byte-identical
  to the base. Settings, terrain, food placement, controls, hazard masks, camera
  presentation and physics configuration are unchanged.
- A/B/C presentation tests pass: HUD, collider dimensions, touch and rotation.
- `npm run build` passes; service-worker generation precaches all five PNGs
  automatically (13 files total). No service-worker code change required.

Reproduce with Vite running:

```sh
npm run test:background
npm run test:presentation
node scripts/audit-v3.mjs
npm run build
```

Changed: `src/main.ts`, `package.json` (test command only).
Added: `src/winter-parallax-background.ts`, `scripts/check-winter-background.mjs`,
five canonical PNGs, this report, validation JSON and preview PNG.
No gameplay redesign or new mechanics in this pass.
