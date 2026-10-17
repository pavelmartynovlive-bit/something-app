# Phone feedback: floating islands, pit rubbish, no billboards

The existing Level V3 geometry, five one-way top surfaces and their physics bodies
are unchanged. No level-design or energy changes.

- Removed all seven standalone streetlamps and their preload request.
- Garage props only at x160 and x10510: removed x5000.
- Platforms use the full snow/stone/icicle PNG silhouette, 30–38px visual depth
  instead of 12px. Landing tops and widths remain unchanged. New stone grows
  downward from the exact landing surface, so it does not create an invisible
  step or change jump heights. The physical12px proxy remains one-way, with
  non-blocking sides/underside. All decorative support posts/braces are removed.
- Platform art is behind filled terrain: near the lowest optional platform,
  its decorative bottom is hidden by the real lower ground instead of painting
  over the lower route. Its full visible thickness is therefore limited there
  by the pre-existing ground clearance; no platform was raised or moved.
- New transparent GPT Image asset `pit_rubbish_winter.png`,2172×724RGBA,
  content bounds[12,390,2161,678]. Piles of muddy snow, cardboard, red/teal bags
  and blue plastic bottles line all four original pits. 30px art modules repeat
  at180px width and clip inside pit X bounds. The pile reaches21px above the
  floor and9px below it. No body or damage; pit/fail-forward mechanics unchanged.
- Removed all world billboards and posts, section captions, bonus caption and
  final directional signs. HUD, pickup feedback and cat speech remain.
  The audit script no longer counts non-rendered signs as visible decisions.

Verification: `npm run test:environment`, `node scripts/audit-v3.mjs`,
`node scripts/validate-collisions.mjs`, TypeScript and `npm run build` pass.
The visual check confirms no lamps, exactly two garage props, no supports or
billboards, unchanged collision rectangles/bench trigger, no physics on new art,
no terrain-top holes/overhangs, stable resize and replay. Seven full-run outcomes
match the previous integration's time/food/energy/hits/recovery within1e−4.
Normal42.10s/98food/15.825energy; collector41.23s/103/6.295;
zero-start52.50s/92/10.0025. Four deliberate pit falls still produce four returns.

44 visual objects,36 cached textures; collision geometry is still28 rectangles.
Current images: [platforms26%](26.png), [pit40%](40.png),
[10%](10.png),[30%](30.png),[50%](50.png),[70%](70.png),[90%](90.png).
The previous integration report records the earlier12px artwork, lamps and signs;
this document supersedes those presentation details. No further redesign.
