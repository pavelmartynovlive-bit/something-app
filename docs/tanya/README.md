# Tanya animated character integration

The approved [20-frame PNG](../../public/assets/characters/tanya/animations/tanya-animation-sheet.png)
replaces the static heroine through `TanyaVisual`. No regenerated artwork, movement,
level data, hazards, energy, food, camera or collision changes are included.

## Asset and frame audit

Original PNG:1536×1024 RGBA,4columns×5rows.1024 is not divisible by5, so the
loader uses the exact rectangles from the source atlas, never naive grid slicing.
Source copies in `art-assets/tanya/animations` and `public/assets/characters/tanya/animations`
are byte-identical. `tanya-animation-data.json` records the SHA256 and registrations.

The original atlas supplied provisional bounding-box centers, a3px transparent
bottom margin and small drawing-scale variations (face height36–40 source pixels).
`scripts/prepare-tanya-animation.mjs` derives registration from jacket-hem center,
opaque sole baseline and a37px reference face height. Runtime performs uniform
resampling only, once per texture manager, into one768×960 canvas atlas containing
20 equal192×192 frames. The PNG is not redrawn, deformed or regenerated.
No textures or animations are created each frame; replays reuse the same atlas
and six global animations. Main-scene context getters avoid per-frame object creation.

| Animation | Source indices, zero-based | FPS | Playback |
| --- | --- | --- | --- |
|tanya-idle|0–3|5|loop|
|tanya-run|4–11|12 nominal|loop, cadence follows actual horizontal speed|
|tanya-jump-start|12–13|24|one shot, never delays takeoff|
|tanya-jump|14–15|8|hold last while rising|
|tanya-fall|16–17|8|hold last until contact|
|tanya-land|18–19|24|~83ms, immediately interruptible by takeoff|

At204px/s the run rate is10.2fps; at85px/s it is4.25fps. This affects animation
only, not movement. No dedicated tired or sitting artwork is present. Zero energy
uses the slower existing run cycle with no new tint/opacity. Bench rest uses idle
as requested; it does not depict sitting. A genuine seated-rest animation remains
an optional future asset. Some source run poses are visually similar; source art
and limb drawing are preserved. Manual phone review remains necessary for feel.

## Stable visual/physics contract

- Existing invisible Arcade carrier:40×56, scale1, origin(.5,.5).
- Existing body:24×50, offset(8,4), unchanged across every frame/state.
- Separate animated `Phaser.GameObjects.Sprite`: **no physics body**.
- Fixed virtual frame192×192; origin(.5,172/192), sole anchor(96,172).
- Constant sprite scale **78.0208/133 =0.5866225564**.
- Full virtual displayed rectangle112.6315×112.6315px includes transparent padding.
- Visible idle height78.0208px; run silhouette77.43–83.89px due to pose extension,
  not runtime scale switching. Crouching naturally reduces visible height.
- Position always follows body.center.x/body.bottom in POST_UPDATE and PRE_RENDER.
- Measured opaque sole error0px for all20 normalized frames; origin and scale stay
  identical. Underpass geometry is not adjusted to the artwork.
- Existing foot/contact shadows30.8×5.5 and19.8×2.2px remain presentation-only,
  grounded-only, follow the same foot anchor, and mirror existing hit alpha.

## Animation priority

Only POST_UPDATE chooses animation state. PRE_RENDER updates positions/shadows
and optional debug drawing, so animation is never restarted by the render pass.
Recovering in a pit uses fall. Bench rest uses idle. Airborne upward movement
uses jump-start on actual takeoff, then jump after its two frames; downward/zero
vertical velocity uses fall immediately. Ground contact plays land once, then
run/idle. A newly accepted jump interrupts land immediately. Walking off a ledge
uses fall directly; respawn returns to run without a spurious takeoff/landing.
Animations change only when this state changes. Input, coyote time, buffering,
boost, gravity and motion do not wait for animation completion.

## Opt-in debugging

Default off. Use `?debugCharacter=1` (or append `&debugCharacter=1`) or press **F3**.
The overlay displays animation/frame, velocityY, grounded/airborne, current energy
and body dimensions; a green rectangle shows the real body. It does not enable
physics debug globally or change the player/HUD/camera. Objects are allocated once
when enabled and destroyed with the scene. Debug text refreshes at10Hz.

## Validation

`npm run test:character` checks all20 frame sizes/baselines, fixed scale/body,
100 presentation sync calls with no physics/camera/resource mutation, all8 run
frames without restart, takeoff/rise/apex/fall/contact/land exit, immediate repeat
jump, tired cadence, high-platform drop, bench, pit return, debug, eight restarts
without animation/texture/event leaks, and five mobile/orientation viewport sizes.
Real natural and collector input replays provide the portrait captures below.

`node scripts/audit-v3.mjs` completes nine full60Hz policies. Compared against
an actual pre-change audit, every policy has identical food, final energy,
collisions, bench/Lipton use, boosts, falls and recoveries; completion time matches
to floating-point precision. Data: [animation-runs.json](animation-runs.json).

| Run | Time | Food | Final energy | Hits | Bench | Lipton | Falls/returns |
| --- | --- | --- | --- | --- | --- | --- | --- |
|normal / collector|41.90s|111|16.395|0|0|3|0/0|
|natural|44.12s|98|53.49|0|1|3|0/0|
|safe lower route|44.52s|98|52.35|0|1|3|0/0|
|zero-energy start|89.60s|93|8.245|0|1|3|0/0|
|intentional collisions|82.90s|91|0|8|0|2|0/0|
|intentional pit falls|50.58s|112|0|1|0|3|4/4|
|platform miss|41.90s|100|16.395|0|0|3|0/0|
|bench route|44.13s|108|53.4425|0|1|3|0/0|

`npm run build`: TypeScript/Vite/PWA precache. `npm run test:character:production`
checks portrait production loading, original PNG1536×1024 +20-frame metadata,
precache and offline reload. These are automated browser checks, not manual iPhone
playtesting or a claim that generated frame art equals a hand-rigged animation.

## Captures and files

[Courtyard/run](trees.png) · [food](food.png) · [houses](houses.png) ·
[granny](granny.png) · [light sky](light-sky.png) · [scooter](scooter.png) ·
[bench idle](rest.png) · [Lipton](lipton.png) · [short platform](short-platform.png) ·
[zero energy](tired.png). Detailed checks: [validation.json](validation.json),
[production-check.json](production-check.json).

Runtime changes: `src/tanya-visual.ts`, visual-context hookup only in `src/main.ts`.
New production assets: `public/assets/characters/tanya/animations/*.png/json`.
Metadata tool: `scripts/prepare-tanya-animation.mjs`; checks: `scripts/check-tanya.mjs`,
`scripts/check-tanya-production.mjs`. Original static PNG is retained as history,
but no longer loaded by the character module. Stop for phone testing after deployment.
