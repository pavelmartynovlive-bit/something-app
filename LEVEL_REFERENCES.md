# Level References — Ground-first auto-runner grammar

> This document records level-design observations from the user's reference screenshots.
> It is not a request to copy art or exact level geometry.
> Use the references only to understand composition, rhythm, signposting and route structure.

## 1. Main observation

The strongest pattern is ground-first.

The playable ground is the main gameplay spine.
Most of the action happens through:
- terrain height changes;
- short gaps;
- enemies or hazards;
- collectible trajectories;
- very short optional elevated beats.

Upper geometry is usually a local accent, not a second highway that bypasses the game.

Project translation:

ground → action → short bonus / height change → return to ground → new action

Prefer this over:

ground below + long safe platform route above.

## 2. Terrain is gameplay

The reference set creates variety with the ground itself:
- short rises;
- drops;
- gaps;
- tall local islands;
- stepped terrain;
- slopes;
- short elevated blocks.

The player can perform the same basic jump, but the context changes.

Project translation:
- use street level, curb-like changes, short raised surfaces, local gaps or interruptions and compact elevation changes;
- do not make floating canopies the default answer to “make this section different”;
- long flat ground must have a reason, such as reading a scooter or creating a deliberate recovery beat.

## 3. Collectibles are movement notation

Collectibles in the references often describe the desired motion:
- jump arc;
- jump apex;
- landing point;
- climb direction;
- descent;
- optional high reward;
- alternate trajectory.

Project translation:
cat food should function as movement notation.

A food pattern should communicate one of:
- jump now;
- aim higher;
- land here;
- this short upper detour is rewarding;
- return safely to ground here;
- choose between two real trajectories.

Do not use food mainly as decoration.

## 4. Upper geometry is short and purposeful

The reference set often shows elevated blocks or platforms that last only a few seconds.

Typical role:
- collect a bonus;
- avoid one local obstacle;
- reach a special collectible;
- perform a short precision sequence;
- change the jump arc;
- immediately reconnect to the main route.

Project translation:
- upper detours should usually be 1–3 seconds of active play, not 10–15 second parallel routes;
- an upper route that gives better rewards must carry its own risk;
- missing the upper route should normally fail forward onto the ground route.

Rule:
A route must not be simultaneously safer, easier and more rewarding.

## 5. Hazards are embedded in movement phrases

Hazards in the references are mixed into terrain and landing decisions.

Examples of useful grammar:
- drop → hazard;
- gap → landing → hazard;
- small rise → hazard → collectible arc;
- short upper bonus → return to ground → moving hazard.

Project translation:
pigeons, grannies and scooters should be woven into movement phrases rather than placed after long platform sequences.

## 6. Local verticality, not permanent elevation

Vertical change is common, but it is local.

The reference frequently returns the player to the main ground route after:
- one tall jump;
- one elevated block sequence;
- one special collectible;
- one terrain change.

Project translation:
keep one clearly vertical episode if useful, but avoid repeated:
climb → climb → climb → descend → descend.

## 7. Density in portrait vs our landscape

The reference game uses a narrow portrait viewport, which naturally places the next gameplay event close to the player.

Our game currently uses landscape, which exposes much more horizontal space.
This makes empty stretches visually obvious.

Do not switch orientation automatically.

Instead compensate by:
- reducing horizontal dead space;
- making the next meaningful action readable before the current one ends;
- using ground-profile changes to fill gameplay space;
- avoiding a single lonely obstacle in a wide empty screen;
- keeping calm beats intentional and short.

Landscape must be designed more densely than the reference rather than copied literally.

## 8. What NOT to copy

Do not import these mechanics just because they appear in the reference:
- press-and-hold for a higher jump;
- reference-specific enemies or rewards;
- portrait orientation by default;
- exact level geometry.

The project keeps its own identity:
- Tanya;
- energy / fatigue;
- Lipton;
- bench recovery;
- cat food;
- pigeons;
- grannies;
- scooters;
- final cat.

## 9. Variable jump candidate

Do not implement variable jump height in the current redesign.

If more vertical control is approved later, preferred experiment:
- tap = normal jump;
- second tap during the early jump = upward boost.

This should be evaluated separately after the ground-first level works with the current single-tap jump.

## 10. Design checklist derived from the references

Before implementing a new section, ask:
1. What is the ground doing here?
2. What does the player do with their finger?
3. What does the food teach or reward?
4. Is any elevated geometry short and purposeful?
5. Does the upper option carry its own risk?
6. What happens immediately after landing?
7. Is the next action already readable?
8. Is this action grammar different from the previous section?
9. Is there any long empty landscape stretch with no decision?
10. Can the same gameplay idea be expressed through terrain instead of another floating platform?

## 11. Working principle

Ground is the main game.
Upper geometry is a short bonus or challenge.
Terrain, hazards and collectibles create the rhythm together.
