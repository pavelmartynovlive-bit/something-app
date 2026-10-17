// Level V2: explicitly authored filled terrain; interruptions always have safe floors.
export type GroundSpan = { start: number; end: number; y: number };
export const groundSpans: GroundSpan[] = [
  // 0–4s: safe interruption, low island, +20 ground; reveal the bowl during jump two.
  { start: 0, end: 400, y: 440 },
  { start: 400, end: 450, y: 464 },
  { start: 450, end: 750, y: 440 },
  { start: 750, end: 1050, y: 420 },
  { start: 1050, end: 1300, y: 424 },
  { start: 1300, end: 1480, y: 432 },
  // 4–8s: one shallow bowl and one exit ledge.
  { start: 1480, end: 1810, y: 456 },
  { start: 1810, end: 2140, y: 460 },
  { start: 2140, end: 2460, y: 436 },
  { start: 2460, end: 2740, y: 440 },
  // 8–12s: raised island with landing/granny timing, then a short descent.
  { start: 2740, end: 2780, y: 464 },
  { start: 2780, end: 3120, y: 420 },
  { start: 3120, end: 3410, y: 436 },
  { start: 3410, end: 3690, y: 440 },
  { start: 3690, end: 3970, y: 442 },
  { start: 3970, end: 4230, y: 444 },
  // 12–17s: ground gently continues below the sole two-surface bonus detour.
  { start: 4230, end: 4530, y: 446 },
  { start: 4530, end: 4830, y: 448 },
  { start: 4830, end: 5130, y: 450 },
  { start: 5130, end: 5430, y: 452 },
  { start: 5430, end: 5730, y: 454 },
  // 17–22s: two deliberate walk-off steps, then the interruption.
  { start: 5730, end: 6060, y: 456 },
  { start: 6060, end: 6390, y: 470 },
  { start: 6390, end: 6690, y: 490 },
  { start: 6690, end: 6740, y: 514 },
  { start: 6740, end: 7040, y: 490 },
  { start: 7040, end: 7340, y: 494 },
  // 22–27s: settled roadway landing, readable scooter, late jump to lower street.
  { start: 7340, end: 7640, y: 496 },
  { start: 7640, end: 8240, y: 472 },
  { start: 8240, end: 8540, y: 536 },
  { start: 8540, end: 8840, y: 538 },
  { start: 8840, end: 9140, y: 540 },
  // 27–31s: broad, shallow recovery pocket, no mandatory bench or exit wall.
  { start: 9140, end: 9440, y: 552 },
  { start: 9440, end: 9740, y: 560 },
  { start: 9740, end: 10040, y: 562 },
  { start: 10040, end: 10330, y: 564 },
  // 31–36s: unequal SOLID islands (330 / 210 / 140), no route underneath.
  { start: 10330, end: 10660, y: 540 },
  { start: 10660, end: 10700, y: 564 },
  { start: 10700, end: 10910, y: 512 },
  { start: 10910, end: 11050, y: 536 },
  { start: 11050, end: 11360, y: 544 },
  { start: 11360, end: 11660, y: 548 },
  { start: 11660, end: 11960, y: 550 },
  // 36–41s: separate delayed pigeon jump and following gap jump.
  { start: 11960, end: 12260, y: 562 },
  { start: 12260, end: 12560, y: 564 },
  { start: 12560, end: 12700, y: 566 },
  { start: 12700, end: 12750, y: 590 },
  { start: 12750, end: 13050, y: 566 },
  { start: 13050, end: 13350, y: 568 },
  { start: 13350, end: 13600, y: 570 },
  { start: 13600, end: 13850, y: 576 },
  // 41–46s: rise, safe landing/granny, shallow descent to the visible cat.
  { start: 13850, end: 14100, y: 580 },
  { start: 14100, end: 14420, y: 556 },
  { start: 14420, end: 14700, y: 564 },
  { start: 14700, end: 15180, y: 570 },
];
export function groundYAt(x: number) {
  return groundSpans.find(span => x >= span.start && x < span.end)?.y ?? 440;
}
export const terrainTransitions = groundSpans.slice(1).map((span, i) => ({
  x: span.start, fromY: groundSpans[i].y, toY: span.y,
  rise: groundSpans[i].y - span.y,
  landingWidth: span.end - span.start,
}));
export const interruptions = [400, 2740, 6690, 10660, 12700].map(start => ({ start, width: start === 10660 || start === 2740 ? 40 : 50, depth: 24 }));
