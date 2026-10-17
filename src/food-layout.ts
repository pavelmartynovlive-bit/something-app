// Level V2 movement notation, authored AFTER both jump envelopes passed.
import { groundYAt } from './terrain';
type FoodPoint = { x: number; y: number };
export const food: FoodPoint[] = [];
export const foodClusters: { purpose: string; points: FoodPoint[] }[] = [];
function phrase(purpose: string, points: FoodPoint[]) {
  food.push(...points); foodClusters.push({ purpose, points });
}
function arc(purpose: string, launch: number, floor: number, times = [.10, .22, .34, .46, .58, .70]) {
  phrase(purpose, times.map(t => ({ x: launch + 330 * t, y: floor - 26 - 560 * t + 700 * t * t })));
}
function landing(purpose: string, x: number, floor: number, count = 3, spacing = 38) {
  phrase(purpose, Array.from({ length: count }, (_, i) => ({ x: x + i * spacing, y: floor - 26 })));
}
function groundTrail(purpose: string, xs: number[]) {
  phrase(purpose, xs.map(x => ({ x, y: groundYAt(x) - 26 })));
}
function fall(purpose: string, edge: number, floor: number, times: number[]) {
  phrase(purpose, times.map(t => ({ x: edge + 330 * t, y: floor - 26 + 700 * t * t })));
}
// 0–4: linked gap/landing/rise. No third reward jump.
arc('1: jump the first safe interruption', 304, 440);
landing('1: short island landing prepares the next tap', 575, 440, 3, 25);
arc('1: second jump to the +20 street', 628, 440);
groundTrail('1→2: stay down along the descending lip', [1030,1110,1200,1310,1420]);
// 4–8: descending low notation precedes the high arc: do NOT jump on entry.
fall('2: step into the bowl before tapping', 1480, 432, [.04,.12,.19]);
arc('2: delayed pigeon clearance from the bowl bottom', 1607, 456);
landing('2: land inside the bowl before the exit tap', 1880, 460);
arc('2: exit the bowl, with no standalone reward jump', 2020, 460);
landing('2: settle before the next small interruption', 2260, 436);
// 8–12: the landing itself reveals the granny; the next arc starts immediately.
arc('3: cross the small gap onto the narrow raised island', 2641, 440);
arc('3: immediate granny jump from the island', 2905, 420);
groundTrail('3: descend from the island toward the route reveal', [3190,3300,3430,3560,3710,3910]);
// 12–17: one true alternate route; two different heights and landing windows.
groundTrail('4 lower: modest safe food before the fork', [4640,4678,4716,4754]);
arc('4 upper: first short awning landing', 4841, 448, [.16,.28,.42]);
landing('4 upper: landing window before the immediate second tap', 5060, 370, 3, 22);
arc('4 upper: cross to the smaller higher awning', 5110, 370, [.12,.24,.36,.48,.60,.70]);
landing('4 upper: reward the second landing', 5370, 346, 3, 20);
fall('4 upper: return safely to the common ground', 5400, 346, [.10,.20,.30,.38]);
landing('4: common ground reunion, no extra reward jump', 5560, 454);
// 17–22: two descents are NOT jump prompts; the pattern changes at the gap.
groundTrail('5: downward diagonal teaches two walk-offs', [5980,6100,6220,6370,6460,6530]);
arc('5: the descending trail turns into the interruption arc', 6596, 490);
landing('5: safe gap landing leads to the roadway rise', 6860, 490);
// 22–27: settle first, then anticipate the lower scooter at the road edge.
arc('6: jump onto the +24 roadway', 7520, 496);
landing('6: broad settled landing, stay down and read the edge', 7800, 472, 6);
arc('6: late edge jump clears the visible scooter below', 8234, 472, [.10,.24,.40,.58,.76,.88]);
landing('6: lower landing after the scooter', 8560, 538);
// 27–31: one recovery pocket, two visibly different trajectories.
groundTrail('7: descend to read the energy choice', [9120,9210,9330,9460,9520]);
arc('7 fast: jump for Lipton and skip the bench', 9566, 560);
landing('7 rest: grounded seat/recovery path', 9690, 560, 4);
groundTrail('7→8: low approach points to the next island ascent', [10065,10103,10141]);
// 31–36: ascent → compact high reward → changing descending trail, not equal arcs.
arc('8: longer first ascent onto the wide low island', 10209, 564, [.10,.24,.40,.58,.70]);
landing('8: first island landing sets up the shorter timing window', 10470, 540, 3, 25);
arc('8: short second takeoff across the safe gap', 10561, 540, [.20,.38,.56]);
landing('8: compact reward on the taller narrow island', 10810, 512, 4, 25);
groundTrail('8: descending notation connects the very short island to ground', [10940,11020,11130,11300,11500,11760]);
// 36–41: changing/S-like trajectory, with a real grounded interval between taps.
groundTrail('9: remain low after the descent before the flock', [11970,12010,12050]);
arc('9: delay the pigeon tap; this is the first of two actions', 12178, 562);
landing('9: comfortable landing prepares the immediate second jump', 12440, 564, 3, 25);
arc('9: second tap crosses the separate interruption', 12602, 566);
landing('9: gap landing returns to the final ground approach', 12860, 566);
groundTrail('9→10: follow the ground descent toward the final rise', [13090,13220,13380,13510,13640,13760]);
// 41–46: one final rise/granny combination, then resolve directly into the cat.
arc('10: rise to the safe final landing', 13976, 580);
arc('10: granny clearance immediately after the landing', 14279, 556);
groundTrail('10: last food follows the safe descent to the cat', [14570,14640,14715,14790,14865]);
