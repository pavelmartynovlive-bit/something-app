// V3 hand-authored filled ground. Ramps use the same analytic surface for drawing and contact.
export type GroundSpan = { start: number; end: number; y: number; endY?: number };
export const groundSpans: GroundSpan[] = [
  { start: 0, end: 420, y: 440 },
  { start: 420, end: 470, y: 464 },
  { start: 470, end: 990, y: 440 },
  { start: 990, end: 1450, y: 415 },
  { start: 1450, end: 1900, y: 280 },
  { start: 1900, end: 2320, y: 280, endY: 435 },
  { start: 2320, end: 2520, y: 435 },
  { start: 2520, end: 3760, y: 435, endY: 395 },
  { start: 3760, end: 4280, y: 395, endY: 425 },
  { start: 4280, end: 4550, y: 565 },
  { start: 4550, end: 4820, y: 425 },
  { start: 4820, end: 5420, y: 401 },
  { start: 5420, end: 5740, y: 465 },
  { start: 5740, end: 6040, y: 505 },
  { start: 6040, end: 6080, y: 529 },
  { start: 6080, end: 6380, y: 483 },
  { start: 6380, end: 6670, y: 525 },
  { start: 6670, end: 7550, y: 545 },
  { start: 7550, end: 7890, y: 505 },
  { start: 7890, end: 8450, y: 445 },
  { start: 8450, end: 8870, y: 310 },
  { start: 8870, end: 9500, y: 470 },
  { start: 9500, end: 9540, y: 494 },
  { start: 9540, end: 9840, y: 470 },
  { start: 9840, end: 10070, y: 470, endY: 450 },
  { start: 10070, end: 10420, y: 450 },
  { start: 10420, end: 10730, y: 462 },
];
export function groundYAt(x: number) {
  const span = groundSpans.find(s => x >= s.start && x < s.end);
  return span ? span.y + ((span.endY ?? span.y)-span.y)*(x-span.start)/(span.end-span.start) : 440;
}
export const terrainTransitions = groundSpans.slice(1).map((span,i)=>({
 x:span.start, fromY:groundSpans[i].endY ?? groundSpans[i].y, toY:span.y,
 rise:(groundSpans[i].endY ?? groundSpans[i].y)-span.y, landingWidth:span.end-span.start,
}));
export const interruptions = [
 {start:420,width:50,depth:24},{start:4280,width:270,depth:140},
 {start:6040,width:40,depth:24},{start:9500,width:40,depth:24},
];
