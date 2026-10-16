// Solid, filled street terrain. Low interruptions are shallow pockets, never pits.
export type GroundSpan = { start: number; end: number; y: number };
export const groundSpans: GroundSpan[] = [
  { start: 0, end: 600, y: 440 },
  { start: 600, end: 1320, y: 416 },
  { start: 1320, end: 2140, y: 440 },
  { start: 2140, end: 2200, y: 464 },
  { start: 2200, end: 3710, y: 440 },
  { start: 3710, end: 4930, y: 460 },
  { start: 4930, end: 6070, y: 420 },
  { start: 6070, end: 6850, y: 440 },
  { start: 6850, end: 6910, y: 464 },
  { start: 6910, end: 9250, y: 440 },
  { start: 9250, end: 9800, y: 460 },
  { start: 9800, end: 10800, y: 440 },
  { start: 10800, end: 12660, y: 416 },
  { start: 12660, end: 14000, y: 440 },
  { start: 14000, end: 15360, y: 464 },
  { start: 15360, end: 17300, y: 440 },
  { start: 17300, end: 17900, y: 396 },
  { start: 17900, end: 18870, y: 360 },
  { start: 18870, end: 22920, y: 440 },
  { start: 22920, end: 22980, y: 464 },
  { start: 22980, end: 24010, y: 440 },
];
export function groundYAt(x: number) {
  return groundSpans.find(span => x >= span.start && x < span.end)?.y ?? 440;
}
export const terrainTransitions = groundSpans.slice(1).map((span, i) => ({
  x: span.start, fromY: groundSpans[i].y, toY: span.y,
  rise: groundSpans[i].y - span.y,
  landingWidth: span.end - span.start,
}));
export const interruptions = [2140, 6850, 22920].map(start => ({ start, width: 60, depth: 24 }));
