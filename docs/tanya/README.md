# Tanya — static character integration

> Latest phone request: visual size reduced by20% from the previous size to35.88×64.48 world px
> (prepared texture scale0.26). Physics/body, foot anchor, camera and level
> remain unchanged. The original62px sizing audit below is historical; no
> geometry adaptation is part of this experiment.

This pass changes presentation only. The current level, physics, energy, pickups,
enemies and camera remain the technical base. No new animation is fabricated.

## Available art

- [tanya-stand.png](../../public/assets/characters/tanya/tanya-stand.png): transparent
  1024×1536 PNG, prepared with GPT Image from the approved six-pose concept.
- [Source concept](../../art-assets/tanya/concept-sheet.png): reference for future
  production poses, not an animation sheet and never loaded by gameplay.

The repository contained only that concept sheet, not separate production frames.
One isolated neutral right-facing pose is integrated. Do not treat the six
concept drawings as a ready-made animation strip.

## Audit / sizing contract

Before integration the visible proxy was40×56px, centered origin(.5,.5), body
24×50px, body offset(8,4), scale1. Its settled feet are sprite.y+26, and both
movement and the existing camera track this proxy. `tanya-sitting` is also40×56.
Replacing either texture with a large PNG would change body/frame relationships.

The proxy therefore stays unchanged and becomes invisible. A separate
`Phaser.GameObjects.Image`, with **no physics body**, follows the real body's
`(center.x,bottom)` in post-update and pre-render. Collision never derives from
PNG bounds. Camera/movement continue to reference the old carrier exclusively.

| Quantity | Current value |
| --- | --- |
| Original PNG |1024×1536|
| Uniform source crop |x150,y49,w762,h1387; boot baseline1436|
| Prepared cached texture |138×248, high-quality uniform resampling and symmetric transparent padding|
| Phaser visual scale |0.25|
| Rendered frame |**34.5×62 world pixels**|
| Equivalent source-content scale |62/1387 =0.044700793|
| Origin / direction |**(.5,1)**; facing right, no flip|
| Physics carrier |40×56, centered origin, scale1; invisible|
| Actual body |**24×50**, offset**(8,4)** on the carrier|
| Body relative to visible frame |top-left offset**(5.25,12)** world pixels|
| Foot anchor |visual bottom center = body center.x / body.bottom, error0 in probes|
| Depth |10, same as the previous heroine; above enemies8 and pickups5|

Height increases56→62 (+10.7%). Source proportions are preserved: the extra
raster width is transparent padding, not horizontal stretching. The high-quality
cached raster avoids harsh minification of a1536px illustration on a phone.
Only one raster is prepared per TextureManager; replays reuse it.

The existing minimum platform-underpass clearance65px still exceeds the new62px
visual by3px. The body stays50px high. Do not raise or move platforms to restore
an old percentage rule automatically: this task explicitly preserves geometry.
A wider hair/backpack silhouette is intentionally outside the compact body.

## Visual states and missing production assets

| State | Current display | Needed later |
| --- | --- | --- |
|run|static neutral pose|tanya-run animation / aligned frames|
|jump|same pose, follows actual upward motion|tanya-jump|
|fall|same pose, follows actual downward motion|tanya-fall|
|tired|same pose, no new tint/opacity effect|tanya-tired|
|rest|standing image hidden only during the existing bench stop|**tanya-rest**, genuine sitting pose|

Landing returns to the grounded state. A landing pose would also be useful later.
No bobbing, fake walk cycle, variable jump, velocity/gravity change or animation-
driven collider is introduced. Existing hit/fall transparency feedback is simply
mirrored from the carrier; fatigue does not add filters or transparency.

The bench still uses its original trigger, stop duration and energy restoration.
With no valid sitting art, the standing image is hidden for that stop rather than
squashed, stretched or shown as a new inconsistent placeholder. Existing rest
feedback/energy HUD remains. It reappears when running resumes. This temporary
rest-art limitation must be clear during manual phone testing.

Future assets belong in the visual module's state mapping/preload. Their height
and bottom anchors are presentation data; body dimensions and gameplay code do
not need to change. All current states share a fixed foot anchor with no swaps
of the physics carrier's shape.

## Validation

- `npm run test:character`: body/visual independence;100 consecutive sync calls
  leave physics/resources/camera untouched; run/jump/fall/landing/tired/rest;
  exact foot anchoring; pit return; eight replays without image/event leaks;
  world dimensions retained at375×667,430×932,844×390 and390×844.
- `node scripts/audit-v3.mjs`: nine actual60Hz full policies. Food, encounters,
  falls/returns, bench/Lipton use and boosts match the pre-integration run.
  Durations match within one fixed physics tick. See [runs.json](runs.json).
- `node scripts/validate-collisions.mjs`: required normal/tired rises and gaps,
  short one-way platforms, coyote/buffer, hazard masks/timing and endings.
- `node scripts/validate-recovery.mjs`:18 anchors,40 ramp/frame-rate cases,
  46 solid-ground drops, bench pocket. Automatic recovery remains intact.
- `npm run test:fatigue`: speed limits, low-energy warning, boosted exhaustion,
  midair transitions and bench/respawn restoration remain correct.
- `node scripts/measure-jumps.mjs`: normal/tired standard and early boosted
  trajectories; no movement constants changed.
- `npm run test:presentation`: A/B/C HUD, touch and orientation guards.
- `npm run build`: TypeScript / Vite /26-file PWA precache. Existing large-bundle
  warning remains. `npm run preview -- --port 4173` then
  `npm run test:character:production`: source PNG decode, production canvas,
  service-worker cache and offline reload; no errors/missing resources.

Automated natural route:44.12s,98 food,53.49 energy; collector41.90s,111 food,
16.40 energy; zero-start89.60s,93 food,8.25 energy with one bench. Clean policies
have zero hits/falls. Intentional collision still registers8 hits; intentional
pit run still gives4 falls/4 returns. These are browser simulations, not manual
phone playtesting or human animation-feel approval.

## Portrait captures

Captured by replaying actual natural/collector inputs, without repositioning the
hero/camera or modifying geometry:

- [Trees / courtyard start](trees.png)
- [Food](food.png)
- [Houses / high jump](houses.png)
- [Granny](granny.png)
- [Light sky / downhill](light-sky.png)
- [Scooter](scooter.png)
- [Bench rest: missing sitting art fallback](rest.png)
- [Lipton](lipton.png)
- [Short platform](short-platform.png)
- [Zero energy, unchanged static art](tired.png)

Pink/orange separate from the blue-white courtyard and muted hazards without an
added glow/shadow. Food and Lipton remain prominent. The static standing pose in
air and missing sitting pose are deliberate first-stage limitations, not finished
animations. Machine data: [validation.json](validation.json),
[production-check.json](production-check.json).

Changed runtime code: `src/tanya-visual.ts` and a small preload/create hookup in
`src/main.ts`. Game update, collisions, jump/fatigue values, level data and camera
logic are unchanged. Test scripts and this documentation are separate from game UI.
Stop here for manual phone testing. This pass does not publish the game.
