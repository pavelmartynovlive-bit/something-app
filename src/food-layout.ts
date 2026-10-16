// Movement notation, authored AFTER solid terrain and both jump envelopes passed.
// A cluster records why it exists; none is generated to fill an empty screen.
type FoodPoint = { x: number; y: number };
export const food: FoodPoint[] = [];
export const foodClusters: { purpose: string; points: FoodPoint[] }[] = [];
function phrase(purpose: string, points: FoodPoint[]) {
  food.push(...points); foodClusters.push({ purpose, points });
}
function arc(purpose: string, launch: number, floor: number, times = [.16, .30, .46, .62]) {
  phrase(purpose, times.map(t => ({ x: launch + 330 * t, y: floor - 25 - (560 * t - 700 * t * t) })));
}
function landing(purpose: string, x: number, floor: number, count = 3, spacing = 38) {
  phrase(purpose, Array.from({ length: count }, (_, i) => ({ x: x + i * spacing, y: floor - 26 })));
}
function fall(purpose: string, edge: number, floor: number, times: number[]) {
  phrase(purpose, times.map(t => ({ x: edge + 330 * t, y: floor - 25 + 700 * t * t })));
}
// 1: the street teaches up, down, interruption and an optional reward trajectory.
arc('1: jump onto the low street rise', 480, 440);
fall('1: walk off to the visible lower landing', 1320, 416, [.08, .14, .20]);
arc('1: bridge the shallow interruption', 2042, 440, [.12, .24, .38, .52, .66]);
landing('1: safe landing after the interruption', 2320, 440);
arc('1: jump for the first earned reward', 2850, 440);
// 2: downward notation deliberately differs from the delayed bird arcs.
fall('2: descend before reading the first flock', 3710, 440, [.08, .14, .20]);
arc('2: delayed jump over the low flock', 4115, 460);
arc('2: jump from depression to the ground ledge', 4808, 460);
arc('2: birds on raised ground change the takeoff height', 5237, 420);
arc('2: optional airborne exit reward', 6040, 420);
landing('2: reconnect with street before the next interruption', 6320, 440);
// 3: main challenges come before the fork. Upper rewards require a second tap.
arc('3: interruption before the granny', 6755, 440, [.12, .24, .38, .52, .66]);
arc('3: granny jump leads to Lipton', 7448, 440, [.16, .28, .40, .54, .66]);
landing('3: stay grounded and bypass the awning challenge', 8240, 440, 4);
arc('3 upper: commit to the short awning', 8042, 440, [.16, .28, .44]);
landing('3 upper: landing prepares the bird timing', 8240, 360, 3, 30);
arc('3 upper: jump the visible flock', 8334, 360, [.12, .24, .38, .52, .66]);
landing('3 upper: reward after birds, before falling', 8530, 360, 4, 30);
fall('3 upper: trustworthy return to the common ground', 8670, 360, [.10, .22, .32]);
arc('3: common reward after the reunion', 8894, 440);
fall('3: descend into the shallow ground pocket', 9250, 440, [.08, .14, .20]);
arc('3: recover from the ground pocket', 9676, 460);
landing('3: wide landing prepares raised street', 9980, 440);
// 4: terrain landing, oncoming timing, then two downward trajectories.
arc('4: land on the raised scooter encounter street', 10676, 440);
arc('4: scooter timing from the raised street', 11628, 416);
landing('4: reward after the meeting', 11920, 416);
arc('4: choose the airborne descent reward', 12585, 416);
fall('4: equally safe walk-off descent', 12660, 416, [.08, .14, .20]);
arc('4: low-ground landing reward', 13102, 440);
landing('4: recovery approach', 13380, 440);
// 5: fast recovery competes with a ground seat; the two food paths are exclusive.
fall('5: enter the recoverable bench pocket', 14000, 440, [.08, .14, .20]);
arc('5: jumping skips rest and reaches Lipton', 14345, 464);
landing('5: bench/rest route reward', 14490, 464);
arc('5: exit the depression with comfortable margin', 15236, 464);
arc('5: prepare the forthcoming terrain climb', 16022, 440);
// 6: this is SOLID rising ground, not an upper route or a lower/upper choice.
arc('6: first filled terrace', 17178, 440);
arc('6: second filled terrace', 17777, 396);
arc('6: crest birds require a new tap after landing', 18327, 360, [.12, .24, .38, .52, .66]);
fall('6: one safe drop back to the main ground', 18870, 360, [.14, .25, .34]);
landing('6: clear landing before visible traffic', 19070, 440);
// 7: scooter is shared BEFORE the bonus. The ledge rewards an edge-timed tap.
arc('7: shared scooter after the terrain descent', 19984, 440);
arc('7: earned Lipton before the final route choice', 20950, 440);
landing('7: ground bypass of the last timing challenge', 21620, 440, 4);
arc('7 upper: land on the short ledge', 21473, 440, [.16, .28, .44]);
landing('7 upper: short landing window before the edge tap', 21690, 360, 3, 30);
arc('7 upper: second tap earns the high arc', 21842, 360, [.12, .24, .38, .52, .66]);
arc('7 upper: descent connects directly to the street', 21842, 360, [.70, .82, .92]);
arc('7: common ground reward after the detour', 22265, 440);
arc('7: final shallow interruption', 22820, 440, [.12, .24, .38, .52, .66]);
landing('7: feeding payoff, no final surprise', 23120, 440, 4);
