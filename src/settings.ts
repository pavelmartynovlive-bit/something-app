// Individually authored ground-first phrases. Food trajectories follow validated geometry.
import { groundSpans, groundYAt, interruptions } from './terrain';
import { food } from './food-layout';
type Platform = { x: number; y: number; width: number; label: string };
type Point = { x: number; y: number };
type Box = { x: number; width: number; height: number };
export const levelSections = [
  { name: 'Две кромки', start: 100, end: 1740, idea: 'Разрыв → посадка → низкий уступ' },
  { name: 'Птичья чаша', start: 1740, end: 4000, idea: 'Сойти вниз → задержать тап → птицы → выход' },
  { name: 'Единственный козырёк', start: 4000, end: 6050, idea: 'Бабушка → выбор → короткий рискованный бонус' },
  { name: 'Эстакада и встречный', start: 6050, end: 8350, idea: 'Подъём → увидеть встречного → поздний прыжок вниз' },
  { name: 'Карман отдыха', start: 8350, end: 9700, idea: 'Спуск → Lipton на прыжке ИЛИ лавочка → передышка' },
  { name: 'Горка к коту', start: 9700, end: 13900, idea: 'Две террасы → один сброс → птицы с разрывом → бабушка → кот' },
];
// These annotations describe authored decisions; they never drive gameplay.
export const rewardJumps: number[] = [];
export const routeChoices = [{ x: 4730, entrance: 4950, end: 5350 }];
export const rhythmDecisions = [
  { x: 1580, targetX: 1670, kind: 'read-two-ground-drops' },
  { x: 2760, targetX: 3060, kind: 'read-bowl-exit' },
  { x: 5720, targetX: 6050, kind: 'read-causeway-rise' },
  { x: 7060, targetX: 7410, kind: 'read-scooter-and-edge' },
  { x: 8360, targetX: 8570, kind: 'read-rest-pocket' },
  { x: 8970, targetX: 9190, kind: 'Lipton-or-bench' },
  { x: 9600, targetX: 10450, kind: 'read-filled-hill' },
  { x: 11480, targetX: 11720, kind: 'walk-off-or-descent-arc' },
  { x: 13600, targetX: 13900, kind: 'feed-cat' },
];
export const settings = {
  speed: 330, tiredSpeed: 190, jumpVelocity: 560, gravity: 1400, tiredJumpVelocity: 500,
  liptonEnergy: 22, energyDrainPerSecond: 2,
  obstacleDamage: 15, grannyDamage: 15, grannySpeed: 12, hitCooldownMs: 1400,
  scooterSpeed: 210, scooterDamage: 12, scooterSlowMs: 650, scooterSlowSpeed: 100,
  pigeonDamage: 6, pigeonTriggerDistance: 210,
  benchDurationMs: 2500, benchEnergyPerSecond: 22, benchEnergyThreshold: 65,
  requiredFood: 100, bonusFood: 132, // Measured coherent budgets: ground 126, natural 128, collector 137.
  coyoteMs: 130, jumpBufferMs: 150,
  levelWidth: 14050, floorY: 440, viewHeight: 490, platformThickness: 12,
  groundSpans, interruptions,
  obstacles: [] as Box[],
  routePlatforms: [
    { x: 4950, y: 360, width: 400, label: 'Короткий бонус ↑' },
  ] as Platform[],
  bottles: [{ x: 9190, y: 386 }] as Point[],
  food,
  // Launch on the lower street; the visible solid causeway face stops the scooter.
  // No timer, invisible barrier, camera change or altered scooter speed.
  scooters: [7630],
  pigeons: [{ x: 2130, y: 464 }, { x: 12575, y: 496 }],
  benches: [9260],
  grannies: [{ left: 4200, right: 4224 }, { left: 13220, right: 13244 }],
  checkpoints: levelSections.map(section => section.start),
  signs: levelSections.map(section => ({ x: section.start + 160, text: section.name })),
};
export { groundYAt };
