# Game Design — Tanya Cat Runner

> This document is the source of truth for gameplay and level-design decisions.
> Before changing gameplay, level geometry, pacing, collectibles, hazards, or camera behavior, read this document first.
> Do not override these rules unless the user explicitly asks for a change.

> **Active implementation: Level V3 (2026-10-17).** The user explicitly approved early second-tap boost and the ten-phrase V3 macro. Section 27 supersedes older V2 maps, fixed-single-tap-only restrictions and historical food budgets below. Remaining presentation/pacing findings are recorded in LEVEL_AUDIT.md; phone approval is pending.

## 0. Design principles and references

Primary references:
- Super Mario Run / 2D Mario — clear forward direction, readable main route, collectibles as guidance, optional challenge layered over an accessible path.
- Super Mario 3D Land / 3D World — introduce an idea, develop it, twist it, then pay it off.
- Rayman Jungle Run / Fiesta Run — short auto-run stages, one-touch control, strong rhythm, route variation through jump timing.
- Celeste — implicit teaching, strong mechanical identity per area, deliberate difficulty and fast iteration.
- N++ — player choice inside linear levels, compact challenges, large variation from a small mechanic set.

Project-specific interpretation:
- short and replayable is better than long and repetitive;
- one-touch simplicity must be compensated by strong level composition;
- the level should evolve every few seconds without becoming constant noise;
- the player should understand what the game is asking before they commit;
- optional challenge should add depth without blocking progress;
- collectibles must communicate movement, not merely fill space;
- level geometry must be authored intentionally, not generated as repeated platform templates;
- the main game is ground-first: the ground route is the gameplay spine, not merely the fallback beneath platforms;
- upper geometry is usually a short gameplay accent or bonus detour, not a parallel highway;
- terrain shape, hazards and collectible trajectories should create rhythm together;
- visual/platform variety is not enough: the player's action grammar must also change.

---

## 1. Game concept

A short mobile 2D auto-runner / platformer about Tanya helping cats.

The tone should be:
- playful;
- slightly absurd;
- warm;
- personal;
- easy to understand on mobile.

The game should feel light and funny rather than punishing.

The current version is a gameplay prototype.
Movement, rhythm, readability and level design are more important than visual polish.

---

## 2. Player promise and design pillars

### 2.1 One-touch readability

The player should quickly understand:
- Tanya runs automatically;
- tapping means jump;
- food is desirable;
- Lipton restores energy;
- benches restore energy more slowly;
- hazards should be avoided;
- the cat is the destination.

Do not require instructions for ordinary moment-to-moment play if the level itself can teach the behavior.

### 2.2 Rhythmic variation

The game must not feel like one platform pattern repeated across the whole level.

The player should regularly feel:
- a new spatial shape;
- a new timing pattern;
- a new route decision;
- a change in energy pressure;
- a short recovery;
- a combination of previously learned ideas.

### 2.3 Fatigue pressure, not health management

Energy represents tiredness and creates gentle pressure.

It should change decisions and pace, but it should not turn the game into a conventional health-point system.

### 2.4 Fail forward

Most mistakes should cost:
- energy;
- collectibles;
- an optional upper route;
- time;

rather than immediately ending the run.

### 2.5 Personal absurdity

The game should eventually feel like Tanya's world rather than a generic platformer.

Gameplay can exaggerate ordinary street-life objects into memorable obstacles:
- scooters;
- pigeons;
- grannies with trolleys;
- benches;
- Lipton;
- cat food.

Do not add new mechanics solely for variety without explicit approval.

---

## 3. Core gameplay loop

Tanya automatically runs to the right.

The player mainly controls jumping.

The player must:
1. read upcoming geometry and hazards;
2. choose the right moment to jump;
3. collect cat food;
4. decide whether to take optional harder routes;
5. manage Tanya's energy;
6. choose when recovery is worth the time or route cost;
7. reach the cat with enough food.

Core loop:

run → read → choose → jump / avoid / collect → manage energy → recover or continue → repeat

The player should rarely remain on pure autopilot for more than about 3 seconds unless the pause is deliberate:
- a recovery beat;
- a reveal;
- a safe landing after a difficult sequence;
- the final approach.

High gameplay density does NOT mean an obstacle every second.

---

## 4. Mobile controls and movement

Primary target: mobile browser / PWA.

Controls:
- Tanya runs automatically to the right.
- Tap anywhere in the gameplay area to jump.

Desktop fallback:
- Space / Arrow Up = jump.

Do not add manual left/right movement unless explicitly requested later.

### 4.1 Movement feel

Movement should feel:
- responsive;
- forgiving;
- predictable;
- slightly arcade-like;
- immediately understandable.

Use:
- coyote time;
- jump buffer;
- forgiving collision shapes;
- generous landing surfaces on the main route;
- predictable jump arcs.

Do not design hardcore precision platforming for the required route.

### 4.2 Jump metrics: measure, do not guess

Level geometry must be built from the actual movement model.

Before authoring or re-authoring major platform sequences:
- measure the current maximum jump height;
- measure horizontal jump reach at normal run speed;
- measure reach at tired / reduced speed;
- know the minimum comfortable landing width.

Required jumps must have clear safety margin inside Tanya's measured jump envelope.

Optional challenge jumps may approach the edge of the jump envelope, but must remain physically possible and readable.

Do not tune geometry by visual guess alone.

If practical, keep a debug visualization or documented values for:
- jump apex;
- jump duration;
- horizontal reach;
- tired-state reach.

### 4.3 Metrics are outcomes, not arbitrary standards

Do not invent spatial constants just because they look systematic.

Do not introduce a fixed tile size, camera percentage, or other numeric "standard" unless it follows from the current game's actual movement, screen size, and playtest results.

Useful metrics should be derived from the current build, for example:
- Tanya's measured jump height;
- normal-speed horizontal jump reach;
- tired-state jump reach;
- minimum comfortable landing width;
- minimum pass-under clearance;
- approximate player reaction time at the current run speed;
- visible distance required to read a hazard before commitment.

When a metric changes because movement speed, jump physics, viewport size, or fatigue behavior changes, re-measure it.

Prefer:
measured gameplay outcome → geometry rule

over:
arbitrary grid rule → forced geometry.

---

## 5. Energy system

Energy represents fatigue, not health.

Energy slowly decreases during the run.

Additional energy may be lost from:
- collisions;
- dangerous obstacles;
- specific demanding actions if introduced later.

Energy does NOT regenerate simply by standing still.

At zero energy Tanya does not die.

Instead:
- running speed is reduced;
- jumping may become weaker;
- feedback should communicate tiredness;
- the player can recover.

There must never be a soft-lock at zero energy.

### 5.1 Energy design goal

Energy should create a small number of meaningful recovery decisions during a run.

Avoid both extremes:
- energy is irrelevant because recovery is everywhere;
- energy dominates every few seconds and feels like constant maintenance.

A clean run should still make the player notice energy, but should not require obsessive meter watching.

---

## 6. Energy recovery

### 6.1 Lipton

Lipton is instant energy recovery.

Purpose:
- quick recovery;
- reward for a harder route;
- emergency recovery during a run;
- a reason to choose a particular trajectory.

Lipton should usually not require stopping.

Lipton placement should be intentional.
Do not place it at arbitrary regular intervals.

### 6.2 Bench

A bench is a rest zone.

When Tanya uses it:
- she stops for a short time;
- energy restores;
- she then continues running automatically.

A bench creates a decision:

continue immediately  
or  
spend time restoring energy.

Benches work best:
- after a demanding sequence;
- before a demanding sequence;
- on a safer lower route;
- at a natural visual pause.

Do not place benches so frequently that recovery becomes automatic.

---

## 7. Cat food collectibles

Cat food is the main collectible.

It has three roles:
1. reward;
2. navigation / movement guidance;
3. visual rhythm.

Cat food must not be placed randomly.

### 7.1 Collectible trust

If food visually suggests a trajectory, that trajectory must be:
- safe enough to trust;
- physically reachable;
- consistent with what the player has already learned.

Never use a food trail to lure the player into an unfair collision, blind fall, impossible jump, or unavoidable punishment.

The player should learn:
"If the food shows a route, I can trust that route."

### 7.2 Collectible patterns

Prefer small, readable patterns such as:
- a short line before a jump;
- an arc through the air;
- a landing cluster;
- a staircase upward;
- a short line leading to Lipton;
- a reward burst after a challenge;
- a richer cluster on an optional upper path;
- a descending arc that communicates a safe return to ground;
- two visibly different trajectories when the player is making a real route choice.

Treat food placement as movement notation.

A good food pattern should help the player understand:
- when to jump;
- roughly how high the intended arc should be;
- where a safe landing is;
- whether a short bonus route is worth taking;
- when the route returns to ground.

A typical cluster may contain around 3–6 food items.

Use multiple clusters where appropriate, but each cluster should have a movement or reward purpose.

Avoid:
- long uninterrupted rows on flat safe ground;
- random isolated food;
- filling every empty space with food;
- identical clusters repeated section after section.

### 7.3 Collectible density

Do not reduce food density so aggressively that the game looks visually dead.

But do not use food as the main solution to empty level composition.

Visual density should also come from:
- buildings;
- plants;
- lamps;
- signs;
- fences;
- street props;
- structural supports;
- background details.

The goal is:

meaningful collectible density + visually active environment

not:

collectible spam.

---

### 7.4 Approved food model: resource thresholds (Model B)

Food is a count toward feeding the final cat, not a promise of collecting every object.
Show `Корм: X` and `Котику нужно: Y`. Do not show X / total when alternative routes contain mutually exclusive food.

Below the minimum: explain the shortfall and offer replay. At the minimum: the cat is fed. At the bonus threshold: a visibly better / funnier feeding result, using the existing final cat rather than a new progression system.

Thresholds are balancing outcomes. Recalculate coherent main/lower and collector budgets after layout changes. The lower/main route needs reasonable margin, the minimum should remain relevant into the later level, and the bonus must be reachable in one collector run but require better routing/execution. Neither the world object count nor the bonus threshold is a claimed 100% maximum.

---

## 8. Obstacles

### 8.1 Granny with trolley

Slow moving hazard.

Purpose:
- basic timing;
- introductory moving obstacle;
- readable anticipation.

The player should clearly see her movement pattern.

### 8.2 Scooter

Faster timing hazard.

Purpose:
- stronger timing challenge;
- change of rhythm;
- pressure after the player has learned basic jumping.

The scooter must be visible early enough to react.

Do not spawn it from a blind position or directly after a landing with no reaction time.

### 8.3 Pigeons

Pigeons sit on the ground and fly up when Tanya approaches.

Purpose:
- visual movement;
- rhythm variation;
- light hazard;
- comic texture.

Collision may:
- reduce energy slightly;
- briefly disrupt movement;
- create visual feedback.

Pigeons should feel funny rather than deadly.

---

## 9. Level architecture

### 9.1 Prototype duration

For the current prototype, target approximately 45–50 seconds for a normal active run.

Do not make the level longer merely to create a feeling of scale.

If the level needs more than about 60 seconds, it should justify the extra time with a genuinely new section idea rather than more copies of existing patterns.

Prefer:

short + dense + replayable

over:

long + varied-looking + repetitive.

### 9.2 Section-based construction

Do not build the level as one continuous sequence of similar platforms.

Implement the user-specified Level V2: ten timed gameplay phrases. Do not preserve or creatively redesign the previous six-set-piece structure.

Use the specified 4–5 second phrases and recognizable action grammar. No unrequested set pieces, added mechanics or autonomous polishing after validation.

Each section must have:
- one dominant gameplay idea;
- a distinct spatial silhouette;
- a distinct rhythm;
- a readable beginning;
- a readable end;
- at least one memorable interaction.

Examples:
- basic jump timing;
- pigeons;
- upper/lower route choice;
- scooters;
- fatigue/recovery decision;
- vertical climb;
- combined challenge;
- final approach.

Neighboring set pieces must differ in at least three of terrain profile, movement, tap rhythm, hazard behavior, goal, vertical composition and recovery pressure. A change of hazard sprite alone is insufficient.

### Current approved presentation and scope

The approved direction is portrait, with stable framing and camera scale during gameplay. Do not introduce a temporary scooter zoom-out. Solve its readability through approach, meeting position, visible terrain and food anticipation; preserve about 0.5 seconds of readable reaction before the intended jump. If stable staging cannot do that, report the limitation before proposing a camera change.

The current approved map is Level V2:

| Approximate time | Phrase | Required action grammar |
| --- | --- | --- |
| 0–4s | Short gap + low island | jump interruption → island landing → jump to +20 ground |
| 4–8s | Bird bowl | step down without tap → wait → pigeons jump → bowl landing → +24 exit |
| 8–12s | Narrow island + granny | gap/island jump → immediately read granny → jump → descend |
| 12–17s | Only upper bonus detour | ground bypass OR first short platform → second higher/smaller platform → safe return |
| 17–22s | Descending ground staircase | step down → step down → do not tap → jump interruption |
| 22–27s | Scooter overpass | +24 rise → settle → see scooter → wait → late jump to lower landing |
| 27–31s | Recovery pocket | descend → Lipton jump OR grounded bench → continue |
| 31–36s | Three unequal heights | longer ascent → shorter timing window → short lower island → ground |
| 36–41s | Descent + pigeons + interruption | delay pigeon jump → comfortable landing → nearly immediate separate gap jump |
| 41–46s | Final granny + cat | rise → safe landing → granny jump → final food → descend → cat |

Only the fourth phrase has a true upper alternate route: two short platforms of different widths/heights, total excursion about 2–2.5 seconds. Missing either safely falls onto ground. The three unequal islands are filled terrain, not a second upper bypass. No Lipton outside the single recovery pocket. Single fixed jump, existing energy values, hazards and food resource model are preserved.

Critical composition rules:
- normally show at least two of current terrain interaction, next terrain change, food trajectory, hazard, recovery, route choice or cat;
- never leave a complete portrait frame containing only flat ground and background;
- calm lasts about 1–1.5 seconds, with the next meaningful element already visible;
- avoid a flat stretch longer than roughly one portrait viewport, except explicit anticipation of the moving scooter;
- consecutive 3–5 second windows must differ in terrain silhouette, not merely hazard sprite;
- preserve the exact action grammar; food denotes movement, not empty-space filler;
- all interruptions have a safe bottom; low-energy play must remain completable;
- set food thresholds only after full geometry and coherent route budgets are measured;
- keep portrait camera scale stable; no temporary scooter zoom-out.

Validate normal clean, mostly-ground/no-bonus, collector, low-energy and intentional-error runs. Report time, food, energy, collisions, bench use, longest input/decision interval, visible emptiness, flat distance, repeated-window count, upper-detour duration, scooter readability and normal/tired mandatory jump margins. Stop for manual phone testing; do not redesign or polish beyond this specification.

### 9.3 Ground-first level grammar

The ground route is the default gameplay spine.

Most moment-to-moment play should happen through combinations of:
- changing ground height;
- short gaps or interruptions;
- hazards;
- collectible trajectories;
- short optional upper detours;
- recovery decisions.

Do not build large parts of the level as:
ground below + long safe platform highway above.

A typical useful phrase is closer to:

ground → hazard → short upper bonus → return to ground → terrain change → moving hazard → collectible arc

than:

platform → platform → platform → descend → repeat.

Upper geometry should normally last only long enough to create one compact challenge or reward beat before reconnecting with the main flow.

### 9.4 Terrain creates rhythm

Do not rely on floating platforms as the main source of level variation.

Use the playable ground itself to change movement:
- small rises and drops;
- short ledges;
- shallow stepped height changes;
- short gaps when fail-forward behavior remains appropriate;
- local high/low terrain;
- brief slopes or ramps if supported cleanly by the movement system.

Terrain variation should change the timing or anticipation of the next action.

Avoid long flat streets unless the flatness has a deliberate purpose such as:
- reading an approaching scooter;
- a recovery beat;
- a clear final approach;
- a setup for a new mechanic.

---

## 10. Four-step development of an idea

For important recurring level ideas, use a four-step progression inspired by Nintendo's level-design approach:

1. Introduce
2. Develop
3. Twist
4. Payoff

### 10.1 Introduce

Show the idea in a safe, obvious context.

Examples:
- first pigeons on flat ground;
- first upper platform with a clear food arc;
- first scooter with generous reaction time.

### 10.2 Develop

Ask the player to use the same idea in a slightly harder or more interesting context.

Examples:
- pigeons after a small jump;
- two-step upper route;
- scooter after a simple landing.

### 10.3 Twist

Change one important condition.

Examples:
- pigeons appear on the safer lower route while the upper route avoids them;
- Lipton is on the risky route;
- the scooter appears while energy is already low;
- a familiar jump now leads downward rather than upward.

### 10.4 Payoff

Use the learned idea in a satisfying final combination.

Examples:
- upper route + food arc + scooter timing;
- fatigue decision followed by a short combined challenge.

Do not force every tiny object into a rigid four-step pattern.
Use this structure for the level's important ideas and recurring mechanic families.

---

## 11. Mechanic rotation and repetition control

A mechanic may return later only if at least one context changes:
- height;
- route;
- timing;
- energy pressure;
- reward;
- combination with another mechanic;
- spatial layout.

Do not repeat the same challenge grammar back-to-back.

Challenge grammar examples:
- jump over;
- jump up;
- drop down;
- choose upper/lower;
- time around a moving hazard;
- collect along a trajectory;
- decide whether to recover;
- combine two learned mechanics.

Two sections may use the same object but should not ask the player to perform the same action in the same spatial pattern.

Avoid:
- platform → food → pigeons → Lipton repeated many times;
- repeated canopy shapes with only object positions changed;
- identical food arcs repeated section after section;
- box → box → climb → climb → descend → descend as a recurring phrase;
- repeated long upper routes that bypass most hazards.

Reusable code primitives are good.
Repeated level compositions are not.

---

## 12. Rhythm and pacing

Do not interpret "dense" as "constant intensity."

Use waves.

Typical local rhythm:

setup → action → reward → brief recovery → next action

A stronger sequence can be:

easy → easy → challenge → reward → breathing space → twist

Breathing room should usually be around 1–3 seconds and should feel intentional.

A calm beat may contain:
- visual scenery;
- a safe collectible cluster;
- a bench;
- a reveal of the next route;
- a landing after a difficult sequence.

A calm beat should not become a long empty corridor.

### 12.1 Pacing audit

When reviewing a build, identify:
- where the player is on autopilot;
- where the player receives too many demands at once;
- where two adjacent sections feel identical;
- where a recovery beat is missing;
- where a recovery beat is too long.

Do not solve boredom only by increasing run speed or adding more objects.

### 12.2 Clean-run flow test

A skilled or clean run should feel like a continuous choreography rather than a sequence of forced stops.

If the player chooses not to use an optional bench, the main route should generally support forward flow:
- jumps connect naturally;
- landing positions prepare the next action;
- hazard timing does not require unexplained waiting;
- collectible arcs reinforce the intended rhythm;
- route transitions do not create awkward dead time.

This does NOT mean the game must never slow down.

Intentional pauses are allowed when they serve:
- recovery;
- anticipation;
- a route reveal;
- a comedic beat;
- the final approach.

During playtesting, perform at least one clean-run flow test:
- avoid unnecessary collisions;
- skip optional bench stops where possible;
- follow the intended main route;
- note every place where the player must stop, wait, or break rhythm because of geometry or timing.

Any forced rhythm break should have a clear design reason.
If it does not, redesign that section.

---

## 13. Route choices and optional challenge

The main route should be accessible and readable.

Optional routes create mastery and replay value.

### Lower route
Usually:
- safer;
- easier;
- fewer rewards;
- may include a bench.

### Upper route
Usually:
- harder;
- more food;
- may contain Lipton or another bonus when the added reward is justified;
- requires better timing;
- is short and local rather than a long parallel highway;
- reconnects with the main ground flow quickly.

A route must never be simultaneously:
- safer;
- easier;
- and more rewarding

than the alternative.

Upper routes should not remove most of the game's hazards for long stretches.
If the upper route gives stronger rewards, it should carry its own challenge through existing mechanics, for example:
- tighter jump timing;
- shorter landing windows;
- pigeons or another existing hazard on the upper surface;
- a gap or drop;
- risk of falling safely back to the lower route and losing the optional reward.

Route choices must be visible before the commitment point.

The player should not discover an upper route only after passing the jump required to enter it.

If the player misses an optional upper route, they should normally:
- fall safely to the lower route;
- lose only the optional reward;
- continue the run.

Do not turn optional challenge into mandatory frustration.

---

## 14. Geometry and collision readability

Every piece of gameplay geometry must visually communicate how it behaves.

### 14.1 No ambiguous geometry

If the player can run beneath a platform:
- provide obvious vertical clearance;
- keep lower-route obstacles jumpable;
- make the passage visually read as valid.

If the lower route is blocked:
- make the blockage obvious;
- do not create a fake-looking passage.

Never place a box or hazard under a low ceiling if the resulting jump is unclear or physically awkward.

### 14.2 Avoid giant slabs

Do not use very long uninterrupted upper platforms unless they serve a deliberate gameplay purpose.

Prefer:
- short canopies;
- awnings;
- supported walkways;
- broken platform chains;
- stepped upper paths.

Upper geometry should feel like a sequence of actions, not a ceiling.

### 14.3 Structural readability

Major overhead platforms should visually read as something supported:
- posts;
- walls;
- braces;
- structural legs.

Gameplay readability is more important than architectural realism, but geometry should feel intentional rather than generated.

### 14.4 Visual-collision contract

What the player sees and what the physics engine collides with should agree.

For gameplay-critical surfaces:
- the visible platform edge should closely match the actual collision edge;
- the visible top surface should match the real landing surface;
- openings that look passable should actually be passable;
- hazards should not damage the player outside their visually communicated dangerous area;
- decorative objects should not unexpectedly block movement;
- invisible collision should be avoided unless it solves a specific accessibility or edge-case problem.

Do not compensate for confusing collision by making the invisible hitbox dramatically larger or smaller than the art.

If forgiving collision is needed, keep the difference subtle and biased in the player's favor.

When replacing placeholder art later, re-check collision alignment instead of assuming the old graybox hitboxes still fit.

---

## 15. Camera, anticipation and signposting

Do not center Tanya exactly in the middle of the screen.

Leave more visible space ahead of her than behind her.

The player should usually be able to see the next required action before they must commit.

Camera behavior:
- smooth horizontal tracking;
- limited vertical tracking;
- no aggressive vertical bouncing on every jump;
- show upper-route entrances early;
- keep likely landing areas visible;
- avoid blind hazards immediately outside the camera.

Use signposting through:
- collectible arcs;
- platform silhouettes;
- route height;
- hazard motion;
- environmental framing.

Text signs should not be required for ordinary route understanding.

---

## 16. Mobile readability

Important gameplay elements must be readable instantly on a phone.

Avoid:
- tiny collectibles;
- very thin platforms;
- tiny hazards;
- low-contrast interactive objects;
- cluttered backgrounds;
- excessive HUD.

Gameplay objects must visually separate from decorative background elements.

The player should be able to distinguish:
- collision surfaces;
- hazards;
- collectibles;
- recovery objects;

without pausing to inspect the scene.

---

## 17. Difficulty curve

Do not keep difficulty flat.

Do not simply make each section harder than the previous one either.

Use difficulty waves.

Suggested arc:
1. safe introduction;
2. simple execution;
3. first variation;
4. route choice;
5. short recovery;
6. stronger timing challenge;
7. twist / combination;
8. final approach and cat.

Introduce unfamiliar mechanics safely before combining them.

Do not introduce multiple unfamiliar mechanics at the same time.

The required route should be completable by a relatively inexperienced player.

Mastery should mainly be expressed through:
- collecting more food;
- taking upper routes;
- reaching recovery rewards efficiently;
- cleaner timing;
- replaying for a better run.

---

## 18. Visual density vs gameplay density

Gameplay density and visual density are different.

A screen may be visually rich while gameplay remains simple.

Use decoration to avoid dead-looking scenes:
- trees;
- windows;
- signs;
- fences;
- parked objects;
- planters;
- street lamps;
- background buildings.

But decoration must not look like collision geometry unless it actually has collision.

Do not add gameplay objects merely to fill visual space.

Do not add collectibles merely because the background feels empty.

If a section feels empty, first ask:

Is the problem:
- no decision?
- no visual composition?
- no upcoming goal?
- no variation in silhouette?
- no reward?

Fix the actual problem.

---

## 19. Example section map for the current prototype

This is an example structure, not a rigid script.

### Section 1 — Learn the rhythm
Dominant idea:
- basic jump timing.

Use:
- simple ground obstacle;
- food arc that teaches jump trajectory.

Goal:
- establish trust and control.

### Section 2 — Pigeon rhythm
Dominant idea:
- light hazard timing.

Use:
- pigeons in increasingly interesting positions;
- avoid repeating the exact same ground pattern.

Goal:
- introduce moving visual pressure.

### Section 3 — First route choice
Dominant idea:
- upper vs lower.

Upper:
- more food.

Lower:
- safer path and/or bench.

Goal:
- teach risk/reward.

### Section 4 — Scooter timing
Dominant idea:
- faster moving hazard.

Goal:
- change timing rhythm.

### Section 5 — Fatigue decision
Dominant idea:
- recovery choice.

Use:
- low-energy pressure;
- Lipton and/or bench with different costs.

Goal:
- make energy affect a decision rather than merely the HUD.

### Section 6 — Short vertical accent
Dominant idea:
- one compact change of height inside a ground-first level.

Use:
- a short platform or terrain sequence;
- collectible path as guidance;
- one meaningful upper challenge or reward;
- safe return to the ground route.

Goal:
- change the level silhouette and movement pattern without creating a long parallel upper highway.

### Section 7 — Combined challenge
Dominant idea:
- combine two already learned mechanics.

Possible combination:
- route choice + scooter;
- pigeons + vertical path;
- fatigue + optional Lipton reward.

Goal:
- payoff without introducing anything new.

### Section 8 — Final approach
Dominant idea:
- release tension and reach the cat.

Goal:
- short satisfying ending;
- no unnecessary final repetition.

---

## 20. Prototype scope

Current target:
- one short level;
- approximately 45–50 seconds on a normal run;
- one final cat;
- simple mobile controls;
- placeholder visuals.

Current approved mechanics:
- auto-run;
- jump;
- energy;
- Lipton;
- bench rest zones;
- cat food collectibles;
- granny with trolley;
- scooter;
- pigeons;
- upper / lower routes;
- final cat.

Do not add:
- complex story systems;
- dialogue trees;
- inventory;
- progression systems;
- multiple worlds;
- backend;
- account system;
- advanced visual polish;
- new gameplay mechanics;

unless explicitly requested.

### 20.1 Variable jump height / double-tap status

Do not copy Super Mario Run's press-and-hold jump-height mechanic.

If more vertical control is explored later, the preferred candidate is:
- first tap = normal jump;
- second tap during the early part of the jump = additional upward boost.

This is only a future candidate.
It is NOT approved for the current level-design iteration and must not be implemented unless explicitly requested.

### 20.1 Variable jump height / double-tap status

Do not copy a press-and-hold jump-height mechanic.

If more vertical control is explored later, the preferred candidate is:
- first tap = normal jump;
- second tap during the early part of the jump = additional upward boost.

This is only a future candidate.
It is NOT approved for the current level-design iteration and must not be implemented unless explicitly requested.

---

## 21. Level-design workflow

Do not immediately modify geometry when asked to "improve the level."

First produce a section map.

For each proposed section, define:
- section name;
- approximate duration;
- dominant idea;
- what the player sees;
- what the player must decide;
- what the player does;
- reward / consequence;
- collectible pattern;
- recovery opportunity;
- how this section differs from the previous one.

Then inspect the whole level for repetition before implementing.

### 21.1 Authoring rule

The level may use reusable helper functions and primitives.

However:
- do not auto-generate the level from one repeated template;
- do not create dozens of platforms just because the helper makes that easy;
- do not treat platform count as a quality metric.

A short authored sequence is preferable to a large procedurally repeated one.

### 21.2 Before implementation

Check:
1. Does implementation follow the ten specified Level V2 phrases without inventing extra set pieces or repeated action templates?
2. Does each section have a different dominant idea or spatial pattern?
3. Is the main route readable?
4. Is the level ground-first rather than built around repeated upper highways?
5. Are optional upper routes short, purposeful and risky enough to justify their reward?
6. Are optional routes visible before commitment?
7. Are food trails trustworthy and do they describe movement rather than fill space?
8. Is recovery placed intentionally?
9. Are there long autopilot stretches?
10. Are any sections mechanically redundant?
11. Does the player's action grammar change, not just the object skin?
12. Does each long flat stretch have a deliberate reason to exist?

Only then modify the level.

---

## 22. Playtest protocol

The next useful iteration should come from playtesting, not platform counting.

Run at least three kinds of test:

### 22.1 Normal run
Play naturally.

Observe:
- where attention drops;
- where the level feels good;
- where the next action is unclear;
- where the player feels rushed or bored.

### 22.2 Collector run
Try to collect as much food as practical.

Observe:
- whether collectible paths are readable;
- whether optional routes feel worth the effort;
- whether food changes movement decisions;
- whether food becomes visual noise.

### 22.3 Failure / fatigue run
Intentionally:
- miss upper routes;
- hit hazards;
- reach zero energy;
- skip recovery when possible.

Observe:
- whether the game remains completable;
- whether failures are understandable;
- whether fatigue changes play without creating a soft-lock;
- whether missed optional jumps fail forward.

### 22.4 Playtest notes

Record feedback by section, not by individual platform.

Useful notes:
- "Section 3 feels identical to section 2."
- "Section 5 has no meaningful decision."
- "Upper route in section 6 is not visible early enough."
- "The player is on autopilot for 5 seconds after the scooter."

Avoid notes like:
- "move platform 20px right"

until the structural issue is understood.

---

## 23. Acceptance checks

After level changes, verify:

### Completion
- normal route is completable;
- zero-energy route cannot soft-lock;
- optional-route misses safely return to progress.

### Jump validity
- every required jump is inside the measured jump envelope;
- tired-state mandatory jumps remain possible;
- landing zones are visible and fair.

### Readability
- no blind mandatory hazards;
- no ambiguous pass-under geometry;
- no collectible trail points toward an unsafe or impossible route;
- interactive objects are visually distinct from decoration.

### Pacing
- no accidental long autopilot stretches;
- no identical section type repeated back-to-back;
- meaningful gameplay changes occur across the level;
- calm beats are deliberate and short;
- a clean run does not contain unexplained forced stops or waits that break flow.

### Visual-collision consistency
- visible platform edges align with collision edges;
- visible openings match actual passable openings;
- decorative objects do not unexpectedly block the player;
- hazard visuals match their damaging collision areas.

### Variety
- the level is not the same platform / food / hazard pattern repeated with different spacing;
- each section has its own dominant idea and silhouette;
- the ground profile changes meaningfully across the level;
- upper routes are short accents rather than repeated parallel highways;
- neighboring sections do not ask for the same finger rhythm with different objects.

### Scope
- normal run remains approximately 45–50 seconds;
- no new mechanics were added without approval.

---

## 24. Quality metrics

Do not report quality primarily using:
- total platform count;
- total object count;
- total collectible count.

More useful metrics:
- normal completion time;
- time to first boredom / attention drop in playtest;
- longest unintended autopilot stretch;
- number of clearly distinct sections;
- number of repeated challenge grammars;
- percentage of optional-route failures that safely fail forward;
- whether every required jump was validated against current movement metrics;
- whether the player understands the next required action before commitment.

---

## 25. Reference material

These references inform the principles above. They are not rules to copy literally.

- Koichi Hayashida on Super Mario 3D Land's four-step idea development:
  https://www.gamedeveloper.com/design/the-structure-of-fun-learning-from-i-super-mario-3d-land-i-s-director

- Nintendo / Iwata Asks — Super Mario 3D Land: clear course guidance and optional Star Medals:
  https://iwataasks.nintendo.com/interviews/3ds/super-mario-3d-land/0/1/

- Nintendo / Iwata Asks — New Super Mario Bros. Wii: coins used to safely guide player movement and preserve player trust:
  https://iwataasks.nintendo.com/interviews/wii/nsmb/1/5/

- Nintendo / Ask the Developer — Super Mario Bros. Wonder: lessons from Super Mario Run about accessibility and helping more players continue:
  https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-3/

- GDC Vault — Math for Game Programmers: Building A Better Jump:
  https://www.gdcvault.com/play/1023148/Math-for-Game-Programmers-Building

- GDC Vault — Level Design Workshop: Designing Celeste:
  https://www.gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste

- GDC Vault — Empowering the Player: Level Design in N++:
  https://www.gdcvault.com/play/1023282/Empowering-the-Player-Level-Design

- Rayman Jungle Run interview: one-touch control, short levels and rhythm:
  https://www.pocketgamer.com/rayman-jungle-run/hands-on-with-rayman-jungle-run-on-ios-and-android/

---

## 26. Final working rule

Before changing level design:

1. read this document;
2. inspect the current implementation;
3. produce or update the section map;
4. identify repetition, pacing and readability problems;
5. explain the proposed change at section level;
6. only then modify geometry.

After implementation:

1. validate jump reach;
2. validate main-route completion;
3. validate fail-forward behavior;
4. run the three playtest modes;
5. report findings by section;
6. do not claim success merely because the level contains many platforms or objects.

This document remains the source of truth unless the user explicitly overrides it.


## 27. Level V3 — approved movement vocabulary and current implementation

The user's V3 instruction replaces V2 composition rather than adding objects to it.
Portrait framing and camera scale remain stable. Keep ground as the main spine.
Target 45–55 seconds, preferring a stronger shorter run over padding. The current
measured clean run is 42.1 seconds, slightly below that target; phone evaluation
is pending. Do not extend the road merely to reach a number.

### Approved control

A tap / Space / ArrowUp starts the existing fixed jump. One further **new press**
40–280ms after takeoff, while rising, adds upward and forward boost. It targets
an apex relative to that same takeoff, not another jump from arbitrary midair.
A held key, keyboard repeat, third tap or late tap cannot add another boost.
Late requests may still use the existing 150ms landing buffer; coyote time stays
130ms. Fatigue is committed at takeoff. No variable jump, hold-to-jump or combat.

Current measured envelopes at 60Hz (body feet, level landing):

| State | Standard height / reach | Boost height / reach |
| --- | --- | --- |
| Normal | 107.3 / 192px | 213.9–215.1 / 391–404px |
| Tired | 85.2 / 119px | 194.2–195.2 / 347–356px |

Run speeds are 240 / 170px/s; boosted flight 350 / 330px/s. Gravity and normal
jump impulses remain 1400, 560 / 500. Energy values/rules remain unchanged.
Pigeons start fluttering at 120px and retain low flight for 0.75s before the fast
climb; this staging lets a tired standard jump clear the visible birds.

### Authored macro, not reusable composition templates

1. Short safe gap → low island → +25 landing: tap, land, tap.
2. A 135px ledge: tap → early boost → high landing.
3. Actual downhill ramp → ground → delayed pigeons. Do not tap on the descent.
4. Three unequal one-way surfaces: wide/low → narrow/high → short/lower.
   Optional boost earns a high reward; failures return to the sloped ground.
5. A 270px long gap: boost flight; safe floor 140px below, boost out after a miss.
6. Deliberately readable scooter approach → late standard jump → lower landing.
7. Filled descending ground: drop → short interruption jump → drop.
8. Only recovery pocket: airborne Lipton OR ground bench, then continuous exit.
9. Filled unequal low → medium → tall ground, with boost on the last tall rise.
10. High drop → delayed birds + short interruption → granny → final food → cat.

Do not replace ramps with repeated tiny stairs, extend upper routes into highways,
or insert standalone reward jumps / neutral connectors. Platforms are one-way:
light undersides, directional markings and non-colliding support posts. Ground
terraces are filled to their foundation, with no lower traversable tunnel.

### Composition, food and validation

Usually show current action, next situation and a hint after it. Existing signs
are staged before phrases; they do not collide. Empty flat viewports are forbidden.
Outside intentional anticipation/recovery, aim for <1.5s without input/decision.
Seeing or collecting food alone does not count as input.

Food uses individually authored movement groups: normal arc, vertical boost cue,
downhill diagonal, unequal zig-zag, optional high reward, long boosted parabola,
sparse scooter markers, recovery split, rising staircase and final descent/landing.
No generic createArc/createPlatformSequence composition generator.

Resource UI stays `Корм: X` / `Котику нужно: Y`, never X / all placed food.
Measured normal / ground / collector budgets: 98 / 89 / 105. Minimum 80, bonus 103.
The minimum is still relevant on the late climb/final phrase. Below it, explain
what was missing and offer replay; minimum feeds the cat; bonus gives the feast.

Before food/hazards were placed, inspect the compressed geometry silhouette.
After implementation, test clean, collector, no optional boost, low energy,
intentional error, and safe missed jumps. Keep raw input gaps separate from
first-visible-cue gaps. A viewport containing something does not automatically
pass the three-layer composition rule. See LEVEL_AUDIT.md for measured exceptions.

Development-only overview: `npm run level:overview` with Vite running. This writes
SVG/PNG artifacts under /tmp; it is not imported by the production game.

**Stop after the validation report. No further autonomous level iteration before
manual phone playtesting**. Report unresolved findings explicitly; phone approval is pending.

## 28. V3 local hazard / gap / recovery tuning (2026-10-17)

This authorized local pass preserves §27's silhouette and ten major motifs.
Three grannies now inhabit high-landing, cascade-landing and final-combination
contexts. Two scooters inhabit the original roadway and the final high-drop
approach. Keep two pigeon groups. Do not add empty connectors between them.

Pit widths70/60/40 use standard jump; the270px boost pit remains distinct.
Every pit has a visible sludge floor and automatic600ms return to the latest
confirmed safe anchor. Missing optional platforms still lands on the ramp.
Return preserves food and energy, clears vertical velocity/input buffers,
synchronizes the collider and camera, and resumes auto-run without a button or
whole-level restart. Falling itself adds no energy penalty.

Safe anchors:100,240,1220,2660,4110,5880,7320,8140,9240. Keep these on verified
solid surfaces, outside hazards, with room to resume. Terrain contact uses the
same analytic surface as drawing on every fixed physics step; visible solid
ground must catch downward crossings even when a render contains several steps.

Unequal floating widths240/160/200 and gaps60/80 keep the optional line active.
Normal/tired physics, early boost, coyote and buffer remain unchanged.

Baseline drain2.15/s. One recovery choice: airborne Lipton at6970,y435 gives22;
ground bench at7200,y545 stops2.5s and restores32. They are physically separated
and taking one disables the other for this run, including after a pit return.
Do not place incidental Lipton inside the bench trigger or sitting trajectory.
Clean finish calibration: no recovery9.34, Lipton31.31, bench41.77 energy.

Food thresholds remain80 /103 after remeasuring routes (normal97, collector105,
platform fallback90). Display only resource count and feeding requirement.
Local food cues follow new avoidance jumps and shifted landings, not empty-space
filler. See LEVEL_AUDIT.md for exact widths, all playthroughs and remaining density
limitations. Stop for manual phone testing; do not redesign the V3 macro again.

## 29. Approved local density / distributed energy pass (2026-10-17)

Latest user instruction supersedes §28's one-pocket exclusivity and exact enemy /
platform numbers. Preserve the V3 macro, ten sections and original ground profile.
Do not rebuild terrain motifs or insert long connectors.

Three former airborne surfaces are halved to120/80/100px and locally repositioned
at2860/3040/3230 so normal and tired jumps remain reachable. Two additional short
single surfaces at1050 (110px) and8130 (100px) accent existing plateau jumps.
All misses fail forward to continuous ground. No long upper highway.

Five grannies:740–760,1820–1840,3690–3710,6300–6320,10230–10250.
Three scooters: roadway, ascent terrace and final-drop approach. Each has an
explicit flat movement lane with full sprite clearance; remove it before a wall
or pit, disable its body and exclude it from damage when hidden. No stalled
scooter in a lower pocket. Keep two pigeon groups and the previous pit system.
Safe anchor8140 moves to8280 to avoid the new mid-ascent encounter.

Drain2.85/s; each of three Liptons restores12, at1580,y205;4590,y345;8190,y270.
One bench at7200 stops2.5s and restores36. No bottle in the bench pocket. Early
bottles, bench and late bottle are independent single-use recoveries: collecting
one must not globally disable distant recovery. Standing still never regenerates.
Normal finish~16 energy with three bottles; collector~6 with two; bench~52 with
three bottles and a time cost. Zero-start remains completable using the bench.
Food requirement80 /bonus103 remain justified by new actual route budgets98 /103
(normal /collector), and90 after platform misses. UI stays resource count only.

Stable portrait scale, existing jump/boost envelopes, coyote and buffer unchanged.
See current LEVEL_AUDIT.md and overview for measured local map / caveats. Do not
claim automated visible-cue metrics are manual phone playtesting. Stop after tests.

## 30. Approved phone spacing and stronger zero-energy fatigue

Latest phone request supersedes §29's platform coordinates, short-gap widths and
tired run speed. Keep the same ten-phrase V3 macro and overall10730px length.

Character artwork is56px tall (body50px). Every floating island must leave at
least1.15×56=64.4px between its FULL visible stone underside and the highest
underlying ground across its width. Current minimum is65px. Platform art depth
is shared through platform-art.ts, never guessed from the12px one-way proxy.

Three ascending top surfaces: x2860,y317,w120; x3040,y261,w80;
x3190,y205,w100. Each next top is56px higher. The third island moves40px left
for reachable timing; missed jumps still land on the continuous ramp. Standalone
islands at1050,y315,w110 and8130,y348,w100 now also have65px clear underneath.
Floating stone art stays thick and unsupported; no lamps or world billboards.

Short pits retain starts420/6040/9600 and double from70/60/40 to140/120/80px.
Their far edges move to560/6160/9680, taking width from the following surface;
level length, pit depths,270px long pit and recovery anchors stay unchanged.
Rubbish stays inside the resized pits. Food count and80/103 thresholds stay;
only local jump/landing cues move with changed geometry. Collector budget105,
normal upper run102, platform fallback89; zero-start89.

At zero energy, ground speed is85px/s, half the former170. Normal240px/s,
vertical impulses, gravity, boost window, coyote/buffer and energy/recovery values
are unchanged. Standard tired flight inherits85px/s (measured59.5px reach,
85.2px height); tired boost retains330px/s after activation (measured330.7–345.3px
reach,194.2–195.2px height depending on early tap timing). All three widened short
pits therefore use the existing early second tap when tired. This is not a new
jump mechanic. A scooter slowdown may never raise85px/s to its former100px/s
slowdown cap: clamp it to the current committed movement speed.

Seven full policies complete; clean/collector/zero-start have no collisions or
falls. Four deliberately missed pits still give four automatic returns, food and
energy preserved. Zero-start run62.58s; normal41.72s, collector41.37s. The slower
fatigue run is intentional; do not stretch or redesign the normal route to hit
an arbitrary target. See docs/winter-environment/clearance-and-fatigue.md for
measured clearances and validation. Stop for manual phone playtesting.


## 31. Phone feedback: consistent fatigue and a low-energy warning (2026-10-18)

This targeted change supersedes §30's330px/s exhausted boost. Keep all geometry,
food, hazards, energy drain and recovery amounts unchanged.

Above20 energy: running240px/s and boosted flight350px/s, unchanged.
At1–20: running204px/s (-15%), boosted flight297.5px/s, yellow meter and persistent
“Скоро Таня устанет” warning. At0: both running and boosted forward movement85px/s.
Second tapping must never bypass exhaustion or increase forward speed at0.

A tired boost uses slower local vertical physics (gravity92.8834px/s²), retaining
its200px target apex and the reach needed for the existing270px pit. At150ms
second tap, measured198.65px height /337.17px reach /3.967s flight. This is an
intentionally sleepy, longer flight, not a faster traversal. Standard tired jump
is unchanged:85.17px height /59.5px reach /0.7s. Normal jumps are unchanged.
The early40–280ms window, one boost, coyote130ms and buffer150ms remain.

If energy falls through20 or0 mid-flight, scale forward speed, vertical velocity
and local gravity together to preserve the remaining spatial trajectory while
slowing time. Recovery does not accelerate a committed jump; normal physics
returns on landing, bench entry, respawn and replay. Other actors keep existing
gravity/speeds. Above20 the warning clears; recovering only to12 remains yellow.

Regression instructions/results: docs/winter-environment/fatigue-feedback.md.
Stop for manual phone testing; no level redesign is authorized by this change.


## 32. Collectible trust / platform-purpose refinement (2026-10-18)

Preserve the V3 terrain, length, hazards, camera and §31 physics/energy values.
Food before the three-platform bonus must finish the bird landing, then expose
both low and rising branches BEFORE the entry boost. A shared continuous arc
must not hide a different route choice. Landing groups and a descending trail
connect the upper route back to the ramp before the common granny encounter.

Remove the redundant1050,y315 island: it has no reward/transition function and
cannot catch the ordinary lower-ground ascent jump. Retain2860/3040/3190 as
entry/intermediate/high-reward landings. Retain8130 as a scooter-jump landing
with food and Lipton; no extra tap is required merely to justify the platform.
The late bottle moves only8px down,270→278, so a standing landing can collect it
instead of needing a pixel-grazing airborne contact. Recovery amount stays12.
Each remaining platform has an explicit role in settings.ts.

The bench approach is grounded shared food, followed by two visible alternatives:
stay low for the existing automatic rest OR make a later seat-clearing hop for
food/tempo. No separate early arc may carry an unaware player past the bench.
Three bottles remain far from the bench; no additional recovery or mechanic.

Food remains a resource, not X/total completion. Current placement118, coherent
natural/main98 (~83% of placed), collector111; minimum80 and bonus103 retained.
Alternative-route packets are mutually exclusive. Both branches must be visible
in actual portrait-camera records before commitment. See LEVEL_AUDIT.md and
scripts/check-collectible-trust.mjs for the current audit and reproducible checks.
Stop for manual phone testing after validation, without further redesign.


## 33. Tanya character integration — presentation only (2026-10-18)

Approved brunette/pink-jacket/orange-boots concept now supplies one transparent
static stand PNG. Keep the40×56 physics carrier,24×50 body, offset8,4 and centered
carrier origin exactly unchanged. Hide that carrier; a separate visual image
at body center.x/body.bottom uses bottom-center origin and34.5×62px rendered
frame (cached138×248 texture at.25 scale). No PNG-derived collider or camera change.

Visual states run/jump/fall/tired use the same static pose for now. Rest is an
explicit missing tanya-rest asset: hide the standing image during the existing
bench stop, without stretching art or changing bench mechanics. Future poses
belong to the visual layer, never the movement/collision system. No fake sprite
sheet, new tint, glow, fatigue opacity, animation-driven impulse or geometry edit.
The existing65px underpass still clears62px art by3px; do not move platforms to
recalculate an old art-height clearance ratio during character integration.

Nine regression policies preserve pre-integration food/hazard/recovery outcomes;
foot anchors, zero-energy behavior, platforms, pits, bench and offline asset load
are tested. See docs/tanya/README.md for dimensions, missing production poses,
mobile captures and limitations. Stop for manual phone testing.


## 34. Approved visual-only +30% scale experiment

The latest phone request increases only the heroine art from34.5×62 to
44.85×80.6 world px; cached138×248 texture stays, scale0.25→0.325.
Keep bottom-center anchoring,24×50 body/offset8,4, carrier dimensions, physics,
level geometry, objects, camera and energy unchanged. Do not adapt platforms
or passages to the larger artwork in this pass. This overrides §33's rendered
size/visual clearance statement; the physical clearance is unchanged.


## 35. Approved character scale correction

Reduce Tanya visual size by20% from §34: 80.6 × 0.8 = 64.48px tall,
35.88px wide, prepared-texture scale0.26. This supersedes §34 visual size.
Keep physics body, foot anchor, level geometry, movement and camera unchanged.


## 36. Approved simplified Tanya art

Replace the static heroine artwork with a simplified right-facing production PNG:
large hot-pink jacket, olive trousers, vivid orange boots, cohesive brown hair,
simplified face, stronger dark outline, restrained cel shading, slightly larger
head, hands and boots. No animation or gameplay change.
Visual height increases 10% from §35 to70.928px; frame width39.468px.
Source1024×1536, crop(120,27,795,1476), cached138×248, scale0.286.
Existing24×50 physics body/offset(8,4), bottom anchor, movement, energy,
level and camera remain unchanged. Other visual states still share this static
pose; sitting/rest and genuine run/jump/fall/tired animation assets remain missing.


## 37. Approved cleaner silhouette and foot contact shadow

Further simplify the static Tanya sprite: cohesive ponytail, larger head/mittens/boots,
remove backpack, straps, fur cuffs and tread details; preserve three dominant
clothing colors (hot pink / olive / orange). Keep overall70.928px height,
39.468px frame width; source crop(130,84,779,1401), source1024×1536.
Add a separate28×5px blue-grey contact ellipse at body.bottom−0.5, alpha0.22.
It has no physics, follows the real foot anchor, is behind Tanya, and is hidden
while airborne, recovering or resting. Destroy it on scene shutdown.
No movement, camera, energy, collision or level changes.


## 38. Approved Tanya palette cleanup

Mittens use the boot-orange palette; boot soles use the trouser-olive palette.
Remove the vertical center line from the pink jacket. Preserve silhouette,
overall70.928px visual height, foot contact shadow and all gameplay/physics.
Updated PNG1024×1536, crop(130,83,781,1403); uniform resampling fits both
texture dimensions and stays bottom-aligned to the existing foot anchor.


## 39. Approved readability refinement

Preserve the current heroine design, palette, seam-free pink jacket, olive pants
and soles, orange gloves/boots. Clean major form boundaries and silhouette
without new costume details. Overall visual height70.928px and physics unchanged.
Source crop(131,80,781,1407). Grounding uses two presentation-only ellipses:
28×5 foot shadow alpha0.14,18×2 contact shadow alpha0.18. Both follow the
actual foot anchor and hide when airborne/resting/recovering; no collisions.
Destroy both on scene shutdown. No level, movement, camera or energy changes.


## 40. Approved neck readability correction

Replace the harsh black neck wedge/line with warm peach skin shadow and muted
rose inside the hoodie collar. Preserve the current character, palette, pose,
visual size, separate grounded shadows and all physics/gameplay.
Source1024×1536; updated crop(131,80,781,1408), height70.928px unchanged.
