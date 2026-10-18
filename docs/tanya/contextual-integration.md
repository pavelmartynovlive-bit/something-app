# Tanya contextual interactions

The original basic animation PNG remains byte-identical. New contextual art is
based on that approved sheet; face, loose hair/open forehead, palette, outline and
minimal clothing detail are used as the reference. No other environment/UI assets,
level geometry, hazards, food, Lipton placement or regular jump/run settings changed.

## Assets and registration

New production assets:
- `public/assets/characters/tanya/animations/tanya-context-sheet.png`:1536×1024 RGBA,
  four columns/five rows,20 complete contextual poses.
- `public/assets/characters/tanya/animations/tanya-context-data.json`: exact source
  rectangles, source hash, reference-face scale, foot/seat registration and FPS.

Source files: `art-assets/tanya/contextual/tanya-context-sheet.png` and
`tanya-context-atlas.json`. `scripts/audit-tanya-context-source.py` analyzes alpha
components without editing pixels; `scripts/prepare-tanya-context.mjs` prepares
metadata using the approved37px reference face height. The source sheet includes
large pose/placement differences, so it is not sliced using naive equal cells.

Both cached runtime atlases now use256×256 virtual frames with the same
origin(.5,224/256) and foot anchor(128,224). Extra transparent space accommodates
lifted hair/arms without clipping; the original basic artwork does not grow.
Constant visual scale remains78.0208/133 =0.5866225564; idle visible height78.0208px.
Two1024×1280 canvas atlases and all12 animation definitions are created once and
reused on restart. No per-frame texture creation, procedural hair, PNG-derived
collider or animated body shape. The original carrier remains40×56, body24×50,
offset(8,4). Test probes confirm fixed size and origin across contextual states.

| Animation | Source indices, zero-based | Frames | FPS | Duration / repeat |
| --- | --- | --- | --- | --- |
|tanya-bench-sit|0–1|2|10|200ms, once|
|tanya-bench-idle|2–5|4|4|loop during seated phase|
|tanya-bench-stand|6–7|2|10|200ms, once|
|tanya-pit-fall|8–11|4|10|400ms, holds last if still falling|
|tanya-hit-granny|12–14|3|16|187.5ms, once|
|tanya-hit-scooter|15–19|5|18|277.8ms, once|

## Bench

The existing bench trigger and energy threshold remain. Its ground anchor is
(7200,545); body is held there without `reset()` offset drift. Autorun pauses for
the original total2500ms. Sit200ms → seated2100ms → stand200ms → run. Energy is
integrated only across the seated interval, totaling the original intended36
energy, clamped by the existing100 maximum. No recovery during sit/stand.
This removes the previous single-frame energy overshoot (~0.24 at60Hz).

Seated artwork uses an independent hip anchor at the real visible seat22px above
the ground. The physics body stays standing-size and immobile throughout. No new
bench collider, trigger or environment prop is introduced. All3 phases protect
against hits and consume input as the existing rest did. Stand does not add extra
waiting after the2500ms stop.

Portrait rest needed one local composition correction: the normal left autorun
anchor gradually cropped both the bench and hair after stopping. While resting,
the existing smoothed camera follows a0.25 horizontal anchor; otherwise the normal
camera settings are unchanged. No zoom or instant camera jump.

## Pit descent and return

Previous behavior froze velocity and disabled the body as soon as the feet crossed
the pit lip. That was the floating/blinking bug. Now commitment keeps body enabled,
preserves positive downward velocity and restores ordinary falling gravity1400.
Horizontal drift is limited to80px/s and kept within the existing opening.
Only a committed pit-fall bypasses solid terrain contact; other actors and all
ordinary surface/one-way-platform collisions remain unchanged.

The character plays pit-fall. A reusable geometry mask lets it disappear behind
the existing pit walls/sludge, not float over the filled foundation. The mask
ends12px above the existing lower pit surface. Kill plane is below this boundary
by the entire virtual image extent above the foot anchor plus2px. Thus no part
of the sprite remains visible when the body is finally stopped/disabled.

Only then: show «Ой, яма! Возвращаемся…», wait220ms (about233ms at60Hz due to
frame quantization), return automatically to the original last safe checkpoint,
clear vertical velocity, clear the mask and resume autorun/camera tracking.
No manual button, full level restart, extra energy penalty, food reset or energy
reset. The original800ms post-respawn protection remains, without alpha blinking.

## Hits and priority

Real granny danger-shape contact starts hit-granny; scooter starts hit-scooter.
Existing consequences stay15/12 energy, scooter slow100px/s for650ms and existing
camera shake. The animation changes no position/velocity/body. Normal jump/boost
input remains live during hit feedback and real airborne state is restored when
it completes. No new flash, tint, particle art or recurring opacity effect.

The shared1400ms `hitUntil` protects across all hazard types, not just repeated
calls from one enemy. Only an accepted hit starts a reaction. Bench/pit/recovery
cannot take additional damage. A later contact after the cooldown is accepted.

Priority: pit-fall/recovery → protected bench phase → latched hit → actual
jump/fall/landing → run/idle. Pit entry cancels a hit; bench phases cannot be
accidentally replaced by run. None of these animations modify jump physics.

## Validation

`npm run test:character:context`:
- Six real missed-pit entries:140px,270px and80px openings at normal and zero energy.
  Positive downward motion each physics tick until invisibility; no disabled body
  or alpha change in midair;220–233ms pause;1fall/1return; resources preserved.
- Real bench activation at30/60/120fps. Body center/bottom remain exactly7200/545,
  fixed24×50 body. All3 phases occur; seated recovery totals36 before normal run
  drain; idle/sit/stand cannot restart or be replaced by run during the stop.
- Actual granny and scooter danger-rectangle contacts. Damage15/12, both reactions
  remain latched, alpha1, jump accepted during recoil. Cross-hazard contact inside
  cooldown is rejected; contact after it expires is accepted.
- Pit priority over hit; eight scene restarts preserve six contextual animations,
 20 contextual frames, one visual and stable event counts.
- Actual390×844 renderer captures: [bench](context-bench.png),
  [pit descent](context-pit.png), [scooter recoil](context-hit.png).

`npm run test:character`: basic run/jump/fall/land, interrupted landing, tired
cadence, contextual bench/pit probes, all20 basic sole registrations, five viewport
sizes, unchanged body/scale, restarts and actual input replay portrait captures.

`node scripts/validate-recovery.mjs`:18safe-anchor cases,40ramp/frame-rate cases,
46solid-surface drops, bench/fast route distinction. No solid-ground fall-through,
no pit respawn softlock, safe food/energy-preserving restoration and camera reset.

`node scripts/audit-v3.mjs`: all9 full policies reach the cat. Normal/collector
still41.90s,111food,16.395energy,0hits/falls. Natural44.10s,98food; zero-start89.60s,
93food. Intentional collisions:8hits. Pit-fall51.02s,4falls/4returns; extra time is
physical descent. No empty viewport introduced. No-bench runs retain prior exact
outcomes; bench runs differ only by fixed anchoring/one-frame rounding correction.
Data: [context-runs.json](context-runs.json), [context-validation.json](context-validation.json).

TypeScript/Vite production build and30-file PWA precache pass. Production checker
loads both approved source PNGs plus both metadata files, validates40frames/12
animations and reloads offline. These are automated Chromium mobile-viewport tests;
manual iPhone smoothness/likeness review remains the final step. No further level
or character redesign is included after these tests.

## Changed code

`src/main.ts`, `src/tanya-visual.ts`, new `src/tanya-interactions.ts`,
`src/settings.ts` (respawn pause only600→220ms), `package.json` (context test script).
Metadata tools: `scripts/prepare-tanya-context.mjs`,
`scripts/audit-tanya-context-source.py`, updated `scripts/prepare-tanya-animation.mjs`.
Checks: new `scripts/check-tanya-context.mjs`, updated `scripts/check-tanya.mjs`,
`scripts/check-tanya-production.mjs`, `scripts/validate-recovery.mjs` and
`scripts/audit-v3.mjs` (preserves hazard kind when recording actual hits).
Updated audit/design docs and portrait evidence; other art is unchanged.
