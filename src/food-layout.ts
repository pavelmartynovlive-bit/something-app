// Movement notation, authored AFTER the solid terrain and both jump envelopes passed.
// Alternative trajectories are resources, never advertised as a collectible total.
type FoodPoint = { x: number; y: number };
export const food: FoodPoint[] = [];
export const foodClusters: { purpose: string; points: FoodPoint[] }[] = [];
function phrase(purpose: string, points: FoodPoint[]) {
  food.push(...points); foodClusters.push({ purpose, points });
}
function arc(purpose: string, launch: number, floor: number, times = [.10, .22, .34, .46, .58, .70]) {
  phrase(purpose, times.map(t => ({ x: launch + 330 * t, y: floor - 26 - 560 * t + 700 * t * t })));
}
function landing(purpose: string, x: number, floor: number, count = 3) {
  phrase(purpose, Array.from({ length: count }, (_, i) => ({ x: x + i * 38, y: floor - 26 })));
}
function fall(purpose: string, edge: number, floor: number, times: number[]) {
  phrase(purpose, times.map(t => ({ x: edge + 330 * t, y: floor - 26 + 700 * t * t })));
}
// 1. Two grounded actions, not a separate reward jump after the lesson.
arc('1: read the shallow interruption and its far landing', 424, 440);
landing('1: confirm the first landing', 700, 440);
arc('1: second tap onto the low solid ledge', 1040, 440);
fall('1: release; walking off connects to the bowl', 1670, 416, [.08, .15, .22]);
// 2. Fall first, delay the tap; then a separate, broad exit lip.
fall('2: downward entry, not an instruction to jump early', 1840, 440, [.08, .15, .22]);
arc('2: delayed bird jump from the bottom of the bowl', 2020, 464);
landing('2: broad bowl landing after the flock', 2290, 464);
arc('2: jump the exit from the bowl', 2938, 464);
landing('2: settle before the shared granny encounter', 3190, 440);
// 3. Granny is shared before the fork. Only ONE awning in the whole level.
arc('3: shared granny clearance leads to the route choice', 4088, 440);
landing('3: shared landing before commitment', 4380, 440);
landing('3 lower: clear walk-under passage, modest reward', 5000, 440, 4);
arc('3 upper: invite a short optional landing', 4841, 440, [.16, .28, .42]);
landing('3 upper: short landing prepares the edge tap', 5100, 360);
arc('3 upper: edge timing earns the high reward', 5270, 360);
arc('3 upper: falling reward returns directly to the street', 5270, 360, [.82, .94]);
// 4. Food sets up the edge jump; none invites a premature jump at the scooter.
arc('4: jump onto the filled causeway', 5930, 440);
landing('4: settle on the causeway before reading the lower street', 6190, 408);
landing('4: short grounded lead-in points to the visible road edge', 7270, 408, 3);
arc('4: late edge jump clears the approaching scooter below', 7404, 408, [.10, .24, .40, .58, .76, .88]);
landing('4: safe lower-street landing after the scooter', 7740, 472);
// 5. One recovery opportunity: airborne Lipton OR the grounded seat.
fall('5: reveal the low resting plaza', 8570, 472, [.08, .15, .22]);
arc('5: bypass the seat and reach Lipton in one existing jump', 9126, 496);
landing('5: the bench route gets a modest grounded reward', 9280, 496, 4);
// 6. The only two-rise ground episode, one descent, one combined final phrase.
arc('6: first filled terrace', 10330, 496);
landing('6: first terrace landing sets up the next tap', 10600, 464);
arc('6: second filled terrace', 10979, 464);
landing('6: crest landing before the descent choice', 11240, 432);
fall('6: safe walk-off descent joins the main street', 11720, 432, [.10, .18, .26]);
arc('6 optional: jumping off the same ground crest earns the high descent', 11644, 432, [.16, .30, .44, .60, .78, .94]);
arc('6: one trajectory connects birds, shallow interruption and landing', 12464, 496);
landing('6: generous landing before the following granny', 12740, 496);
arc('6: last distinct granny tap after the combined landing', 13118, 496);
landing('6: payoff points directly to the hungry cat', 13400, 496, 4);
