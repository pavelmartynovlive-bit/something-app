// Local rectangles follow the actual placeholder silhouette. The same regions
// are used for every moving hazard; transparent sprite corners never deal damage.
export type DangerRect = { x: number; y: number; width: number; height: number };
export const hazardShapes: Record<'scooter' | 'pigeons' | 'granny', DangerRect[]> = {
  scooter: [
    { x: 31, y: 2, width: 10, height: 12 }, // rounded head, excluding transparent corners
    { x: 30, y: 3, width: 12, height: 10 },
    { x: 29, y: 15, width: 14, height: 22 },
    { x: 51, y: 9, width: 4, height: 35 }, // upright stem
    { x: 43, y: 7, width: 19, height: 4 },
    { x: 10, y: 42, width: 49, height: 4 },
    { x: 7, y: 45, width: 10, height: 10 },
    { x: 53, y: 45, width: 10, height: 10 },
  ],
  pigeons: [10, 32, 54].flatMap(x => [
    { x: x - 7, y: 15, width: 14, height: 12 },
    { x: x + 1, y: 7, width: 9, height: 10 },
    { x: x - 4, y: 27, width: 2, height: 5 },
  ]),
  granny: [
    { x: 8, y: 4, width: 19, height: 14 },
    { x: 9, y: 18, width: 17, height: 1 },
    { x: 9, y: 19, width: 16, height: 1 },
    { x: 8, y: 20, width: 19, height: 3 },
    { x: 6, y: 21, width: 23, height: 27 },
    { x: 35, y: 29, width: 28, height: 18 },
    { x: 36, y: 49, width: 6, height: 6 },
    { x: 56, y: 49, width: 6, height: 6 },
  ],
};
export function touchesDanger(
  player: { left: number; right: number; top: number; bottom: number },
  sprite: { x: number; y: number; width: number; height: number; flipX: boolean;
    body?: { x: number; y: number; offset: { x: number; y: number } } | null },
  kind: keyof typeof hazardShapes,
) {
  // Arcade advances bodies before Scene.update and synchronizes sprites after
  // it. Use this frame's body pose for both actors, not the previous sprite pose.
  // Current placeholder hazards have scale 1 and rotation 0.
  const left = sprite.body ? sprite.body.x - sprite.body.offset.x : sprite.x - sprite.width / 2;
  const top = sprite.body ? sprite.body.y - sprite.body.offset.y : sprite.y - sprite.height / 2;
  return hazardShapes[kind].some(rect => {
    const x = left + (sprite.flipX ? sprite.width - rect.x - rect.width : rect.x);
    const y = top + rect.y;
    return player.right > x && player.left < x + rect.width &&
      player.bottom > y && player.top < y + rect.height;
  });
}
