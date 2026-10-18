// Contextual timing/registration only; existing energy totals and hit cooldown stay.
export const tanyaInteractions = {
  benchSitMs: 200, benchStandMs: 200, benchSeatHeight: 22,
  pitDriftSpeed: 80, pitMaskInset: 12,
} as const;
export type BenchPhase = 'none' | 'sit' | 'seated' | 'stand';
export type TanyaHit = 'granny' | 'scooter';
export type PitFallZone = { start: number; width: number; maskBottom: number; killY: number };
