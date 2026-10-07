# Game Design — Tanya Cat Runner

> This document is the source of truth for gameplay and level-design decisions.
> Before changing gameplay, level geometry, pacing, collectibles, hazards, or camera behavior, read this document first.
> Do not override these rules unless the user explicitly asks for a change.

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

For the current prototype, target approximately 60–90 seconds for a normal active run.

Do not make the level longer merely to create a feeling of scale.

If the level needs more than about 90 seconds, it should justify the extra time with a genuinely new section idea rather than more copies of existing patterns.

Prefer:

short + dense + replayable

over:

long + varied-looking + repetitive.

### 9.2 Section-based construction

Do not build the level as one continuous sequence of similar platforms.

Divide the level into approximately 6–8 clearly differentiated gameplay sections.

Each section should usually last about 8–15 seconds.

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

The player should feel a meaningful change in gameplay roughly every 10–15 seconds.

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
- approximately 60–90 seconds on a normal run;
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
1. Is there a clear 6–8 section structure?
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
- normal run remains approximately 60–90 seconds;
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
