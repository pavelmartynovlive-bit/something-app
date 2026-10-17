# Level V3 audit — 2026-10-17

Read the current GAME_DESIGN.md and LEVEL_REFERENCES.md before further work.
Base synced to origin/main `7bec1227f1db5c6c483fddd274acef182c246e84` before edits;
a second fetch confirmed no newer remote main during implementation.

## Scope and method

New authored V3 geometry, replacing V2, plus the explicitly approved early boost.
Actual Phaser Arcade scene, deterministic 60Hz browser stepping, real key/touch
requests. No teleporting, disabled damage, modified energy or invulnerability in
full playthroughs. Separate isolated contact probes place Tanya at the transition
being measured. Low-energy run starts at zero, then uses the ordinary bench.
Intentional error skips the opening jump and the first birds/scooter avoidance;
the recovery policy presses jump/boost after contacting terrain. These are automated
policies, not a claim that a human has phone-playtested the level.

Portrait 390×844, 340 world px across, zoom 1.147. Camera scale remains constant;
A/B presentation comparisons still exist, default C is portrait. No energy values,
damage values, new hazard types, art redesign or new progression systems.
Base run speeds changed 330/190 → 240/170. Low bird flight changed .45 → .75s and
trigger 210 → 120px so the tired fixed jump has a clear timing line.

[Compressed development overview](docs/level-v3-overview.svg).

Geometry-only gate: inspected the compressed silhouette before hazards/food.
Distinct shapes: notch/island → tall ledge → real ramp → three unequal short
one-way surfaces → deep safe long gap → roadway → filled descending cascade →
shallow rest pocket → solid unequal ascent → high drop and final approach.
No floating long slab, box-under-canopy passage or generated platform template.

## Full runs

| Policy | Time | Food | Finish energy | Hits | Bench uses | Boosts | Raw input gap | Input / first-visible-cue gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| normal | 42.10s | 98 | 37.67 | 0 | 0 | 3 | 4.33s | 1.68s |
| collector | 41.17s | 105 | 39.53 | 0 | 0 | 5 | 4.33s | 1.70s |
| no-optional-boost | 42.10s | 98 | 37.67 | 0 | 0 | 3 | 4.33s | 1.70s |
| low-energy | 55.73s | 90 | 27.87 | 0 | 1 | 3 | 10.28s | 4.80s |
| intentional-error | 42.15s | 88 | 19.57 | 2 | 0 | 4 | 5.58s | 1.70s |
| ground | 42.12s | 89 | 37.63 | 0 | 0 | 3 | 7.58s | 1.68s |

All finish with zero respawns. Normal and no-optional-boost intentionally coincide:
normal policy uses only the three required boosts; collector adds the high rewards
in phrases 4 and 9. Ground is an additional fallback diagnostic, not one of the
five requested policies. All non-error policies avoid damage.

Minimum 80, bonus 103, based on these route budgets rather than the old thresholds.
Normal has 18 food margin, ground 9, tired/rest 10. Collector's two extra boosts
net +7 over normal (it loses some lower food), enough for the 103 feast. Routes
are mutually exclusive; the UI never implies that all placed packets form a
collectible 100% total. Normal has only 69 before the late ascent and 83 after it;
the ground policy has 74 before the finale. Feeding stays relevant late.

## Normal route by phrase

Food below is gained in the phrase; pickups near boundaries may belong to the
next phrase. Timings are measured crossing authored boundaries, not claimed
uniform four-second sections.

| Phrase | Measured time | Food gained | Boosts |
| --- | ---: | ---: | ---: |
| 1. Разрыв и остров | 4.12s | +12 | 0 |
| 2. Высокий уступ | 2.98s | +7 | 1 |
| 3. Спуск и птицы | 2.58s | +5 | 0 |
| 4. Неравные опоры | 5.92s | +19 | 0 |
| 5. Длинный разрыв | 3.18s | +8 | 1 |
| 6. Самокат | 3.83s | +6 | 0 |
| 7. Каскад вниз | 3.88s | +5 | 0 |
| 8. Отдых | 3.03s | +7 | 0 |
| 9. Подъём | 5.77s | +14 | 1 |
| 10. Финальная связка | 6.80s | +15 | 0 |

1. Short gap / island: first normal arc → landing cue → second rise. No enemy or
   third reward jump. The island is supported terrain; a missed gap catches safely.
2. High ledge: 135px is above the 107/85px standard envelope. Early double tap,
   high landing, early sign revealing the descent. Fixed takeoff-relative apex.
3. Downhill / birds: 420px real ramp, then pigeons 180px after the ramp end; the
   standard jump starts after the downhill, not from a fake stair. Diagonal stops
   before the timing moment, post-bird reward joins the next situation.
4. Unequal surfaces: 300/180/200px wide, heights 365/330/390, gaps 40/100px.
   Standard → quick standard → longer/drop, optional boost for a high cluster.
   No enemy; a miss lands on the continuous sloped ground. Ground fallback is
   deliberately simpler and has less food, but its raw no-tap interval is long.
5. Long gap: 270px interruption with safe floor 140px down. Standard jump falls
   short; boost clears; the exit immediately exposes the scooter-road rise.
6. Scooter: settled roadway, visible approach, late standard jump at the edge,
   lower landing. No boost requirement, extra granny or reward jump.
7. Cascade: filled drops, one short interruption, another drop; food follows the
   low diagonal and landing. No floating-platform reinterpretation.
8. Recovery: one bench and one Lipton. Airborne trajectory preserves speed;
   bench is a marked ground seat, 2.5s rest. A tired fast-route probe can skip it.
9. Ascent: solid widths 340/560/420, rises 40/60/135. Optional middle boost takes
   the high cluster; final boost reaches the tall top. No traversable route below.
10. Finale: high fall, delayed birds + shallow interruption, rising ground into
    granny, final reward, cat already visible before the last jump finishes.
    Final grounded calm approach is about 0.7s.

## Measured physics and contact margins

| State | Standard max height | Standard flight / reach | Boost max height | Boost flight / reach |
| --- | ---: | ---: | ---: | ---: |
| Normal | 107.33px | .800s / 192px | 213.90–215.13px | 1.133–1.233s / 391–404px |
| Tired | 85.17px | .700s / 119px | 194.16–195.21px | 1.083–1.200s / 347–356px |

Boost tests: 50–270ms sampled, 20/300/450ms rejected, height variation <2px;
holding/repeat does not boost, third tap cannot add a second boost, touch and
ArrowUp work. Coyote 130ms and landing buffer 150ms remain functional. No air
re-trigger after the useful window. Bounds apply to equal-height landing;
raised landings reduce reach and are independently probed in the actual scene.

Two 135px rises leave about 79px normal / 59px tired boosted height margin. All
other mandatory rises are 25/24/40/60px; the largest standard rise leaves 47px
normal / 25px tired height margin. The 60px tired rise has a tested lead window,
and boost is available for additional margin. Transition probes vary lead ±10px
at both energies and require a full-foot landing with no side block.
The 270px boost gap has >71px normal / >48px tired full-foot landing margin in
100/150/220ms boost probes. Standard cannot clear it. Short gaps are separately
probed at both energies and across ±10px timing variation. All safe-floor exits
work at both energies, including boost out of the missed deep gap.

Analytic ramp contact matches the rendered top at 0px measured error; no ramp
stair-stepping or invisible rectangular ceiling. One-way surfaces pass rising
bodies through and catch descending bodies; support posts do not collide. Filled
ground has no underside passage. Hazards retain pixel-opaque danger masks (zero
sampled danger pixels outside visible art); moving masks use current body pose.

Scooter fully visible before late jump: .83s normal / 1.35s tired. Nearby late
launches 0–20px before the edge clear it; not jumping produces the expected 12
damage. Stable zoom. No unavoidable collision in the zero-energy full run.

## Flow and composition — limits, not a blanket pass

No completely empty portrait sample was observed (10Hz sampling of actual
camera/remaining collectibles/hazards/terrain, excluding decorative sign-only
frames). Samples do not prove the absence of a sub-100ms edge case.
The compressed silhouette and ten portrait poses were inspected, with different
adjacent motifs. Food groups are individually authored, rather than copies of
one arc helper. There is no repeated box/climb/climb/down/down template.

Input/decision gaps register actual taps and first-visible terrain, hazard,
recovery, goal or action sign. A first reading of an authored boost/route-choice
trajectory can add one cue per group; automatic food pickups, every packet,
auto-landings and merely continuing on a ramp never add events.

The normal maximum is **1.68s**, in the explicitly intentional scooter approach.
Excluding all food-trajectory cue events gives 1.70s, so the result does not rely
on declaring auto-collection meaningful. The first downhill still has a 1.60s
cue gap; this is slightly above the ~1.5s aim and needs phone judgement. Moving
existing boost/final action signs made the upcoming action readable sooner;
there were no extra food packets or hazards added to fill these intervals.
Raw clean input gap is **4.33s** in the cascade/recovery approach. Tired raw gap
is **10.28s**, including approaching/using the deliberate bench; its 4.80s cue
gap includes the 2.5s rest. Ground fallback has **7.58s** without taps while
skipping the optional surfaces. These raw inactivity windows are reported
explicitly rather than hidden behind collectible events.

**Three-layer readability is not certified as passed.** A deliberately strict
spatial proxy (NOW within 90px / NEXT 90–190 / AFTER beyond 190, including actual
visible trajectories and pre-staged signs) is satisfied in roughly 42–45% of
samples. It does not count flat-ground anticipation as a current task and uses
arbitrary diagnostic bands, so this is NOT a completion percentage for the design
rule. It is not a perceptual test of current task → next landing → future hint,
and it does not justify automatically certifying the mandatory rule. Some high-ledged views show the landing before a further terrain hint.
Phone testing must judge this, especially on the two boosted tall landings.

Measured clean duration 42.10s is below the requested 45–55s. The shortened
first downhill removed a distant pigeon reveal; no neutral road was added to
pad time. This duration difference is explicitly left for manual evaluation.

## Reproduce and stop

With `npm run dev` running:

```sh
npm run test:level
npm run test:presentation
npm run level:overview
```

`npm run build` checks TypeScript, production bundling and service-worker generation.
Jump metrics, full traces and contact results are written under /tmp/tanya-v3-*.
Overview SVG/PNG is development-only and never imported into normal player UI.
The production game remains a static PWA.

Automated physical/functional/empty-viewport checks pass. Three-layer perception
remains unverified; the slight pacing and duration differences are explicit above. **No further autonomous design iteration.
Stop for manual phone playtesting.**
