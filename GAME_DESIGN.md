# Game Design — Tanya Cat Runner

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
Visual polish is secondary to movement, rhythm and level design.

---

## 2. Core gameplay loop

The character automatically runs to the right.

The player mainly controls jumping.

The player must:

1. read upcoming obstacles;
2. jump at the right moment;
3. collect cat food;
4. manage Tanya's energy;
5. decide whether to take harder routes for better rewards;
6. use rest zones or Lipton when energy is low;
7. reach the cat with enough food.

Core loop:

run → read obstacle → jump → collect / avoid → manage energy → continue

The player should rarely spend more than 2–3 seconds without making a meaningful decision or action.

---

## 3. Mobile controls

Primary target: mobile browser / PWA.

Controls:
- Tanya runs automatically to the right.
- Tap anywhere in the gameplay area to jump.

Desktop fallback:
- Space / Arrow Up = jump.

Controls must be extremely simple.

Do not add manual left/right movement unless explicitly requested later.

---

## 4. Tanya movement

Movement should feel:
- responsive;
- forgiving;
- slightly arcade-like;
- easy to understand immediately.

Use:
- coyote time;
- jump buffer;
- forgiving collision shapes;
- wide landing surfaces;
- predictable jump arcs.

Do not design hardcore precision platforming.

The player should usually understand why they failed.

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
- animations / feedback should communicate tiredness;
- the player can recover.

There must never be a soft-lock at zero energy.

---

## 6. Energy recovery

### Lipton

Lipton is an instant energy recovery collectible.

Purpose:
- quick recovery;
- reward for risky routes;
- emergency recovery during a run.

Lipton should usually not require stopping.

### Bench

A bench is a rest zone.

When Tanya uses it:
- she stops for a short time;
- energy restores;
- she then continues running automatically.

A bench creates a small strategic choice:

continue immediately  
or  
spend time restoring energy.

Benches should not appear too frequently.

They work best:
- after a difficult sequence;
- before a difficult sequence;
- on an easier lower route.

---

## 7. Cat food collectibles

Cat food is the main level collectible.

Example:
- 5 bags exist in a level;
- at least 3 are required to feed the final cat.

Cat food must not be placed randomly.

Use it to:
- guide jump trajectories;
- reward exploration;
- signal upper routes;
- teach the player;
- reward difficult sequences.

Good examples:
- food arranged in an arc over a jump;
- food placed on an upper platform;
- food after a difficult obstacle;
- food used to visually guide the player upward.

Avoid placing collectibles on long empty flat sections with no decision involved.

---

## 8. Obstacles

### Granny with trolley

Slow moving obstacle.

Purpose:
- basic timing;
- introductory moving hazard.

The player should clearly see her movement pattern.

### Scooter

Fast moving obstacle.

Purpose:
- stronger timing challenge;
- surprise without unfairness.

The scooter must be visible early enough to react.

Never spawn it in a way that makes collision unavoidable.

### Pigeons

Pigeons sit on the ground and fly up when Tanya approaches.

Purpose:
- visual movement;
- rhythm variation;
- light hazard.

Collision may:
- reduce energy slightly;
- briefly disrupt movement;
- create visual feedback.

Pigeons should feel funny rather than deadly.

---

## 9. Level rhythm

Avoid long empty stretches.

A meaningful event should generally occur every 1–2 seconds.

Meaningful events include:
- jump;
- obstacle;
- collectible;
- vertical change;
- route choice;
- rest opportunity;
- moving hazard;
- reward;
- short environmental interaction.

Use rhythm like:

setup → action → reward → short breathing room → next action

After a difficult sequence, a 2–3 second calm section is acceptable.

Do not make every second equally intense.

---

## 10. Level structure

The level must not be a flat horizontal corridor.

Use:
- height changes;
- stairs of platforms;
- upper and lower routes;
- drops;
- short platform sequences;
- wide safe areas;
- risk/reward routes.

Good pattern:

ground → low obstacle → jump → food arc → pigeons → platform steps upward → reward → drop → scooter → rest zone

The world should feel like a route, not a treadmill.

---

## 11. Verticality

Use vertical gameplay regularly.

Examples:
- boxes;
- benches;
- awnings;
- low roofs;
- steps;
- raised platforms;
- small ledges.

Upper routes should usually:
- require slightly better timing;
- contain more rewards.

Lower routes should usually:
- be safer;
- contain fewer rewards.

If the player fails to reach an upper route, they should normally fall safely onto the lower route and continue.

Do not punish a missed optional jump with restart unless explicitly intended.

---

## 12. Route choices

Include occasional route choices.

Typical structure:

### Lower route
- safer;
- easier;
- fewer collectibles;
- may include a bench.

### Upper route
- harder;
- more food;
- Lipton or bonus reward;
- requires several jumps.

Choices must be readable before the player commits.

---

## 13. Difficulty curve

Do not keep difficulty flat.

Suggested structure:

1. safe introduction;
2. one simple obstacle;
3. collectible used as jump guidance;
4. second obstacle type;
5. short vertical section;
6. first route choice;
7. brief rest;
8. combination of existing mechanics;
9. final challenge;
10. cat.

Introduce mechanics one at a time.

Do not introduce multiple unfamiliar mechanics simultaneously.

---

## 14. Fairness

The player must have enough time to understand and react.

Rules:
- upcoming hazards should usually be visible in advance;
- required jumps must be physically possible;
- obstacles should not spawn directly after blind landings;
- never require knowledge the player could not reasonably have;
- avoid unavoidable collisions.

The camera should support anticipation.

---

## 15. Camera

Do not center Tanya exactly in the middle of the screen.

Leave more visible space in front of her.

The player should be able to see upcoming hazards.

Camera behavior:
- smooth horizontal tracking;
- limited vertical tracking;
- no aggressive bouncing during jumps;
- show upper routes early enough to understand them.

---

## 16. Mobile readability

Important objects must be readable instantly on a phone.

Avoid:
- tiny collectibles;
- thin platforms;
- visually ambiguous hazards;
- excessive UI;
- cluttered backgrounds.

Gameplay objects must clearly separate from decorative background elements.

---

## 17. Level density

Prefer a short dense level over a long empty one.

If the player runs for several seconds without:
- jumping;
- choosing;
- collecting;
- avoiding;
- resting;

the section should probably be redesigned.

Do not fix boring sections only by increasing run speed.

Improve the sequence of decisions instead.

---

## 18. Meaningful actions

Before adding any object, ask:

"What does the player do or decide because this exists?"

An object should normally:
- test timing;
- guide movement;
- offer a choice;
- reward risk;
- provide recovery;
- create breathing room;
- prepare the next challenge.

If it does none of these, it is probably decoration rather than gameplay.

Decoration is allowed, but it should not replace actual level design.

---

## 19. Prototype scope

Current target:
- one short level;
- roughly 90–120 seconds;
- one final cat;
- simple mobile controls;
- placeholder visuals.

Do not add:
- complex story systems;
- dialogue trees;
- inventory;
- progression systems;
- multiple worlds;
- backend;
- account system;
- advanced visual polish;

unless explicitly requested.

---

## 20. Current gameplay objects

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

Do not introduce new gameplay mechanics without explicit approval.

---

## 21. Working process

Before modifying level design:

1. read this document;
2. inspect the current implementation;
3. identify violations of these rules;
4. describe the proposed level structure;
5. explain what the player does in each section;
6. only then modify the level.

After implementation:

1. verify the full level is completable;
2. verify all required jumps are reachable;
3. verify optional upper routes fail safely;
4. verify zero energy cannot soft-lock the player;
5. verify the player rarely remains inactive for more than 2–3 seconds.

This document is the source of truth for gameplay and level-design decisions unless the user explicitly overrides it.

---

## Level sections and mechanic rotation

Do not build the level as one continuous sequence of similar platforms.

Divide each level into 6–8 clearly differentiated gameplay sections.

Each section must have:
- one dominant gameplay idea;
- a distinct rhythm;
- a beginning and an end;
- at least one memorable interaction.

Example section types:
- basic jump timing;
- pigeons;
- upper/lower route choice;
- scooters;
- fatigue/recovery decision;
- vertical climb;
- combined challenge;
- final approach.

Do not repeat the same section type back-to-back.

A mechanic may return later only if:
- combined with another mechanic;
- used at a different height;
- used under different energy pressure;
- or presented with a new route choice.

The player should feel a meaningful change in gameplay every 10–15 seconds.

## Collectible density

Cat food has two roles:
1. gameplay reward and navigation;
2. helping the level feel visually active and populated.

Do not reduce collectible density so aggressively that large parts of the level feel visually empty.

Prefer medium-density, intentional clusters rather than either extreme:
- not one collectible every few seconds;
- not continuous collectible spam across the whole level.

A typical cluster may contain around 3–6 food items.

Use several clusters throughout a section when appropriate, but give each cluster a clear spatial pattern or gameplay purpose.

Each collectible cluster should help with one or more of the following:
- show a jump arc;
- visually connect two platforms;
- guide the player upward or downward;
- reward an upper route;
- reward a difficult sequence;
- draw attention toward Lipton or a recovery opportunity;
- encourage a specific movement pattern;
- make an otherwise sparse gameplay section feel visually alive.

Food can also be used for rhythm:
- a short line before a jump;
- an arc during a jump;
- a landing cluster;
- a vertical staircase of collectibles;
- a small reward burst after a challenge.

Avoid:
- very long uninterrupted rows on flat safe ground;
- random isolated food with no relation to movement;
- filling every empty space with collectibles;
- sections where there is neither meaningful gameplay nor enough visual activity.

Do not rely on food alone to solve visual emptiness.

Visual density should also come from environment and level composition:
- street props;
- plants;
- lamps;
- signs;
- benches;
- fences;
- buildings;
- background details;
- structural supports.

The screen should feel populated even when the player is between collectible clusters.

The goal is:
meaningful collectible density + visually rich environment,
not collectible spam.
