// Solid, filled street terrain. Low interruptions are shallow pockets, never pits.
export type GroundSpan = { start: number; end: number; y: number };
export const groundSpans: GroundSpan[] = [
  { start: 0, end: 520, y: 440 },
  { start: 520, end: 570, y: 464 },
  { start: 570, end: 1160, y: 440 },
  { start: 1160, end: 1670, y: 416 },
  { start: 1670, end: 1840, y: 440 },
  { start: 1840, end: 3060, y: 464 },
  { start: 3060, end: 6050, y: 440 },
  { start: 6050, end: 7410, y: 408 },
  { start: 7410, end: 8570, y: 472 },
  { start: 8570, end: 10450, y: 496 },
  { start: 10450, end: 11100, y: 464 },
  { start: 11100, end: 11720, y: 432 },
  { start: 11720, end: 12590, y: 496 },
  { start: 12590, end: 12630, y: 520 },
  { start: 12630, end: 14050, y: 496 },
];
export function groundYAt(x: number) {
  return groundSpans.find(span => x >= span.start && x < span.end)?.y ?? 440;
}
export const terrainTransitions = groundSpans.slice(1).map((span, i) => ({
  x: span.start, fromY: groundSpans[i].y, toY: span.y,
  rise: groundSpans[i].y - span.y,
  landingWidth: span.end - span.start,
}));
export const interruptions = [{ start: 520, width: 50, depth: 24 }, { start: 12590, width: 40, depth: 24 }];
