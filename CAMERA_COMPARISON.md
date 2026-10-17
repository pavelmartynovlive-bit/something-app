> Historical comparison of the previous seven-section level. The current six-scene revision uses portrait by default and stages the scooter differently. See LEVEL_AUDIT.md for current visibility and flow measurements.

# A / B / C — same-level framing experiment

Read the latest GAME_DESIGN.md (all 1,276 lines) and LEVEL_REFERENCES.md (all 183 lines) before changes. Baseline is published commit `bb9a855`. This experiment changes camera framing, orientation presentation and the comparison UI only. No winner is selected.

## Play the variants

- [A — current landscape](https://pavelmartynovlive-bit.github.io/something-app/?view=a)
- [B — closer landscape](https://pavelmartynovlive-bit.github.io/something-app/?view=b)
- [C — portrait experiment](https://pavelmartynovlive-bit.github.io/something-app/?view=c)

All three play the **entire same level**, not different slices. The bottom-left A/B/C links restart from the same beginning. Default remains A. C is playable upright on a phone and appears in a centered portrait frame on a landscape desktop. A/B retain their original landscape rotation guard. C pauses in the wrong phone orientation and resumes after rotation, using the same existing pause mechanism.

For phone comparison, open the URLs in Safari/Chrome. An existing A/B installation can retain the operating system's landscape lock; C has a separate portrait manifest/start URL for its own installation, without changing the original landscape manifest. If the old cached build appears, close all old app windows/tabs and reopen; the fresh build has the A/B/C selector. An uncached/private browser tab can confirm the current version.

## Method

Measurements below use A/B at **667×375 CSS px** and C at **390×844 CSS px**, DPR 1, real Phaser Arcade at 60Hz. Percentages are relative to each actual game frame, not the desktop letterbox. Camera world distance is measured after smoothing, not the ideal configured anchor. Samples cover the same natural run, with the first bonus detour, approximately 2–68s to avoid startup/end camera clamping.

"Empty vertical space" is a repeatable proxy: the fraction of frame height **above the highest visible foreground gameplay object**. It excludes decorative buildings and lamps. "Empty horizontal space" is the fraction of columns without foreground player/food/hazard/bench/bottle silhouettes; continuous ground and decorative background are excluded. These are composition metrics, not measurements of boredom or literal blank-color pixels. They should be read alongside the playable views.

Scooter timing is measured from its first edge or full silhouette entering the real frame until the unchanged scripted avoidance tap. It is a **pre-tap reading window**, not total time until physical contact. A clean bot succeeding does not establish human reaction comfort.

## Numeric framing comparison

| Measurement | A — baseline | B — zoomed landscape | C — portrait |
| --- | ---: | ---: | ---: |
| Viewport | 667×375 landscape | 667×375 landscape | 390×844 portrait |
| Phaser camera zoom | 0.7653 | 1.0714 | 1.1471 |
| Apparent scale versus A | 1.00× | 1.40× | 1.50× in CSS pixels at these phone sizes |
| Visible world | 871.55×490 px | 622.53×350 px | 340×735.79 px |
| Tanya sprite box | 30.61×42.86 CSS px | 42.86×60.00 CSS px | 45.88×64.24 CSS px |
| Tanya height / frame height | 11.43% | 16.00% | 7.61% |
| Tanya width / frame width | 4.59% | 6.43% | 11.76% |
| Mean visible look-ahead | 498 world px | 479 world px | 293 world px |
| Mean foreground-free headroom | 61.3% | 46.3% | 54.8% |
| Mean object-free horizontal columns | 78.8% | 73.1% | 67.2% |
| Ground surface position, mean height fraction | 90.1% | 84.5% | 70.3% |
| Normal scooter: first edge → avoidance tap | 0.717s | 0.683s | 0.333s |
| Normal scooter: full silhouette → tap | 0.583s | 0.550s | 0.200s |
| Tired first scooter: full silhouette → tap | 1.050s | 1.000s | 0.483s |

The C character is larger in absolute pixels and relative **width**, but smaller relative **height** because the portrait frame is much taller. C also shows a substantial ground area beneath the action, roughly 30% of frame height. Portrait does not automatically solve vertical emptiness with this unchanged world.

## Evaluation by variant

### A — control

1. Original sprite scale, camera zoom, anchor, smoothing and viewport behavior retained. The character occupies about 11.4% of frame height.
2. Around 498px of look-ahead. Main terrain entries and normal hazard setups remain readable before their required tap.
3. Approximately 61% foreground-free headroom; the original thin gameplay strip is preserved as the control. Background decoration is unchanged.
4. Around 79% object-free horizontal columns under the defined metric. This shows why a world with actions can still look sparse in landscape.
5. Scooters give about 0.58s after the full silhouette appears. Ground-route jumps and hazards remain at their baseline timing.
6. Food in the next 300 world px was visible at all recorded takeoffs in the natural run; no upcoming food was clipped above the camera.
7. No camera-induced change to collisions, jumps, fatigue, food collection, or endings. Added selector is presentation UI; the original game HUD is unchanged.

### B — zoomed landscape

1. Same landscape viewport, 1.4× apparent scale; Tanya reaches 60px height. Sprite/body scale values are untouched: this is camera zoom.
2. Anchor moves from 35% to 12% of world-view width. With the existing 5/s smoothing, look-ahead is about 479px, close to A despite the tighter crop.
3. Camera frames normal ground near 84% of height and removes much of the unused upper area. Foreground-free headroom averages 46%.
4. Object-free columns fall to about 73%; objects occupy more visible area. The views expose whether this feels active rather than cramped on a real phone.
5. Mandatory hazards remain visible before their tap. Full-silhouette scooter reading loses about 0.033s compared with A (0.55s versus 0.58s). The first upper flock is fully visible about 0.08s before entering its detour, and substantially before its own bird jump. The entire far end of that detour is not visible at entry, as with A.
6. Food arcs remain inside the frame at recorded takeoffs; no vertical food clipping. Higher terrace/upper-jump samples leave room beneath the unchanged top HUD.
7. Horizontal smoothing remains 5/s; vertical smoothing remains 2.8/s with the same 40px tracking limit, offset by the new crop. No level or HUD rearrangement was needed. Actor positions, collision bodies and results match A.

### C — portrait experiment

1. Full current level, fixed 340px world width; no portrait-specific object placement. Normal phone frame is 390×844. On desktop the centered game frame is limited to 9:16.
2. A 5% anchor and 12/s horizontal follow keep Tanya near the left and maximize the available look-ahead. Even so, only about 293 world px remain ahead.
3. Headroom is about 55%, and substantial solid ground occupies the lower frame. Horizontal emptiness decreases, but tall-screen unused vertical area remains.
4. Tanya/food/hazards are wider relative to the viewport. Normal jump reach (264px) occupies about 78% of the entire 340px world view, which makes successive trajectories harder to plan.
5. **Normal scooters have only 0.20s between full visibility and the required tap. This is a camera-induced reaction/readability limitation, not a human-fairness pass.** No hazards were slowed, moved or removed to hide it.
6. The section-3 upper birds become fully visible about 0.47s **after** the entry jump begins, unlike A/B. The detour still has a safe lower return, but its risk cannot be read fully before entry. This matters even though scripted runs avoid the birds.
7. About 99.3% of upcoming food within 300px is visible at takeoff; the remainder enters from the right during flight. No food is clipped vertically. Whole-route advance planning is weaker than A/B, especially on the longer first bonus canopy.
8. HUD is rearranged into two columns/two rows within the portrait game frame; hint, toast, ending card and selector are constrained to its width. Art, textures and the original HUD data are unchanged.
9. Orientation guards, rotation/resume and touch work. Faster horizontal follow can feel more attached to Tanya; it requires phone feedback. No collision/physics changes were introduced to compensate for the narrower view.

## World-state parity

Before editing, all six full-run baselines were recorded. A after the change, B and C were compared against those traces: sampled x/y, normal/tired jump measurements, jump events, energy, food, collisions, recovery, resets, upper excursions and finish times. A separate narrow-landscape A run was also checked. Numeric comparison tolerance is 1e−8 for floating-point clock differences; player positions and resource counts match.

| Run, identical in A/B/C | Seconds | Food | Final energy | Collisions | Bench uses |
| --- | ---: | ---: | ---: | ---: | ---: |
| Natural | 71.73 | 165 | 22.40 | 0 | 0 |
| Ground-focused | 71.73 | 153 | 22.40 | 0 | 0 |
| Collector | 71.73 | 174 | 22.40 | 0 | 0 |
| Low-energy | 98.42 | 140 | 20.93 | 0 | 1 |
| Intentional mistake | 74.62 | 144 | 43.03 | 1 | 1 |
| Artificial locked zero | 126.95 | 126 | 0 | 0 | 1 |

The automated policy uses the same world-space inputs, including cues that C can reveal late. These runs establish physics parity, **not** that C offers the same human difficulty.

SHA-256 checks verify unchanged `src/settings.ts`, `src/terrain.ts`, `src/food-layout.ts`, `src/hazard-shapes.ts`, `src/controls.ts`, GAME_DESIGN.md and LEVEL_REFERENCES.md. Textures and gameplay update logic were not rewritten. Tanya remains a 24×50 physics body at sprite scale 1. Thresholds remain **128 feeding / 170 bonus**. Static visible/collision edge mismatch count remains zero; minimum pass-under clearance remains 68px. Full-run normal/tired jump measurements remain 107.33/85.17px apex and 264/133px reach.

The largest vertical camera movement in the natural trace is about 0.755 world px/frame (about 0.58/0.81/0.87 CSS px in A/B/C). Resize/orientation changes reframe immediately but do not relocate Tanya or reset the run. HUD bounds were checked at A/B 667×375, C 390×844 and 375×667, plus a desktop portrait frame in 1280×720.

## Reproduce

With `npm run dev` running:

```sh
AUDIT_WIDTH=667 AUDIT_HEIGHT=375 AUDIT_OUTPUT=/tmp/camera-a.json node scripts/audit-level.mjs
LEVEL_URL='http://localhost:5173/?view=b' AUDIT_WIDTH=667 AUDIT_HEIGHT=375 GEOMETRY_ONLY=1 AUDIT_OUTPUT=/tmp/camera-b.json node scripts/audit-level.mjs
LEVEL_URL='http://localhost:5173/?view=c' AUDIT_WIDTH=390 AUDIT_HEIGHT=844 AUDIT_TOUCH=1 GEOMETRY_ONLY=1 AUDIT_OUTPUT=/tmp/camera-c.json node scripts/audit-level.mjs
node scripts/compare-presentation.mjs /tmp/camera-a.json /tmp/camera-b.json /tmp/camera-c.json
npm run test:presentation
npm run build
```

`GEOMETRY_ONLY=1` retains reachability/collision checks while skipping legacy rhythm/balance assertions tied to baseline camera visibility. Thresholds and food budgets are instead compared directly against A; no test is made to pretend the narrow frame preserves baseline anticipation. The UI check also captures isolated same-world-pose screenshots in `/tmp/tanya-view-{a,b,c}-{street,awning,terraces}.png`; these illustrate framing and are not full-run performance evidence.

Stop for manual phone testing. Compare the same section in all three modes: apparent size, sky/ground waste, food readability, when the next hazard becomes legible, and whether the stronger crop feels cramped. No further gameplay or level-design changes, and no selected winner.
