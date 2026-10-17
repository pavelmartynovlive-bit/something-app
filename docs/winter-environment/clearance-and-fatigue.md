# Platform clearance, wider short pits and zero-energy speed

Latest approved phone changes, applied over29d4a28. No macro redesign.

| Floating island (x) | Top Y | Stone depth | Minimum visible clearance |
| --- | ---: | ---: | ---: |
| 2860 | 317 | 38 | 65.16 |
| 3040 | 261 | 30 | 124.65 |
| 3190 | 205 | 32 | 173.16 |
| 1050 | 315 | 35 | 65 |
| 8130 | 348 | 32 | 65 |

The check uses the56px artwork, not the smaller50px body: required clearance64.4px.
Both ends of each footprint are checked against the actual analytic ground;
minimum is taken at the higher ground under the entire island. Ascending tops
are separated by exactly56px. The third island shifts40px left, from3230 to3190,
to keep the raised sequence reachable. Thick silhouettes, fixed X widths and
one-way behavior are preserved. Misses land on the unchanged ground ramp.

Pits at420/6040/9600 become140/120/80px wide, exactly double70/60/40. Right-edge
surface joins shift to560/6160/9680. The following landing surfaces remain430 /
220 /160px wide. Pit depths and the270px boost pit are unchanged; world length
still10730. Rubbish textures and collision geometry use the same new extents.
No hazards/recovery anchors move. Local food cues change to match wider takeoff
and higher platforms; no food is added and80/103 feeding thresholds stay.

Zero-energy speed170→85px/s. Running at nonzero energy is240px/s. At zero energy,
standard jump reach is now59.5px; height85.2px is unchanged. Existing early boost
retains330px/s after its activation and194.2–195.2px height, with330.7–345.3px
measured reach. Normal jump107.3px /192px; boost213.9–215.1 /391.2–404.2px.
Thus normal-energy players clear the short pits with a single tap; tired players
use the approved early second tap. The zero-energy optional upper line is tighter
and fail-forward; the lower route remains available. No hold/double-jump system
was introduced. Bench/Lipton recovery, drain and damage are unchanged.

Related fix: scooter slow100px/s must not accelerate a grounded exhausted85px/s
Tanya. Slowdown uses min(current committed speed,100), verified by an actual
scene-update probe:85px/s both before and during slowdown.

## Validation

- Fresh seven full runs: normal102food, collector105, zero-start89 and optional
  platform fallback89. Minimum80 /bonus103 remain coherent route thresholds.
- Normal/collector/zero-start: no hits, no falls. Intentional collisions finish
  at zero; all four deliberately missed pits restore automatically.
- All five one-way islands accept upward passage and descending landings.
- All widened short gaps tested at normal energy (single tap) and exhausted
  (early boost), with±10px launch variation. No edge blocks or falls.
- Existing mandatory rises validated at both speeds. Their tired launch timing
  probes are updated for85px/s rather than using obsolete170px/s offsets.
- Existing270px gap still rejects an unboosted jump and accepts tested boost
  timings at both energies. All ramps, coyote/buffer, hazard masks, bench use /
  bench skip, scooter reaction tests and endings pass.
- Recovery suite:18 anchor probes,40 ramp probes at15–120fps,46 solid-ground
  probes. Progress checks use actual speed;85px/s intentionally travels less
  than20px in ten frames. No softlock / geometry penetration.
- Pixel/visual/resize/replay check passes, plus explicit65px clearance and56px
  step assertions. TypeScript and production build pass.

[Updated pixel + clearance + speed probes](visual-contract.json) ·
[Full-run results](gameplay-validation.json) · [Jump measurements](jump-metrics.json)

Current snapshots: [10%](10.png),[26%](26.png),[30%](30.png),[40%](40.png),
[50%](50.png),[70%](70.png),[90%](90.png). Browser runs are not manual phone tests.
Stop here for phone feedback; no further autonomous level changes.
