// Individually authored ground-first phrases. Food trajectories follow validated geometry.
import { groundSpans, groundYAt, interruptions } from './terrain';
import { food } from './food-layout';
type Platform = { x: number; y: number; width: number; label: string };
type Point = { x: number; y: number };
type Box = { x: number; width: number; height: number };
export const levelSections = [
  { name: 'Земля готовит посадку', start: 100, end: 3400, idea: 'Подъём → посадка → сброс → короткий разрыв' },
  { name: 'Спуск меняет момент', start: 3400, end: 6700, idea: 'Сброс → отложенный прыжок над птицами → уступ' },
  { name: 'Пересечь и выбрать', start: 6700, end: 10330, idea: 'Разрыв → бабушка → короткий рискованный навес' },
  { name: 'Посадка меняет встречу', start: 10330, end: 13630, idea: 'Подъём → прочитать самокат → выбрать спуск' },
  { name: 'Продолжить или восстановиться', start: 13630, end: 16600, idea: 'Lipton на прыжке или лавочка в углублении' },
  { name: 'Городской перепад', start: 16600, end: 19980, idea: 'Земля → терраса → высокая земля → один спуск' },
  { name: 'Вернуться, выбрать, покормить', start: 19980, end: 23860, idea: 'Самокат → короткий бонус → разрыв → кот' },
];
// Audit annotations describe intended inputs/visible choices; never drive the game.
export const rewardJumps = [2850, 6040, 8890, 12580, 13100, 16020, 20950, 22260];
export const routeChoices = [
  { x: 7930, entrance: 8150, end: 8670 },
  { x: 21360, entrance: 21580, end: 21920 },
];
export const rhythmDecisions = [
  { x: 1270, kind: 'walk-off-or-jump' }, { x: 3660, kind: 'read-drop-and-birds' },
  { x: 9200, kind: 'safe-descent' }, { x: 13900, kind: 'Lipton-or-bench' },
  { x: 16600, targetX: 17300, kind: 'read-solid-terraces' }, { x: 18820, kind: 'read-ground-landing' }, { x: 19000, targetX: 20330, kind: 'read-approaching-scooter' },
];
export const settings = {
  speed: 330, tiredSpeed: 190, jumpVelocity: 560, gravity: 1400, tiredJumpVelocity: 500,
  liptonEnergy: 22, energyDrainPerSecond: 2,
  obstacleDamage: 15, grannyDamage: 15, grannySpeed: 12, hitCooldownMs: 1400,
  scooterSpeed: 210, scooterDamage: 12, scooterSlowMs: 650, scooterSlowSpeed: 100,
  pigeonDamage: 6, pigeonTriggerDistance: 210,
  benchDurationMs: 2500, benchEnergyPerSecond: 22, benchEnergyThreshold: 65,
  requiredFood: 128, bonusFood: 170, // measured budgets: ground 153, one detour 165, both 174
  coyoteMs: 130, jumpBufferMs: 150,
  levelWidth: 24010, floorY: 440, viewHeight: 490, platformThickness: 12,
  groundSpans, interruptions,
  obstacles: [] as Box[],
  routePlatforms: [
    { x: 8150, y: 360, width: 520, label: 'Корм ↑ / птицы!' },
    { x: 21580, y: 360, width: 340, label: 'Прыжок с края ↑' },
  ] as Platform[],
  bottles: [{ x: 7570, y: 325 }, { x: 14420, y: 354 }, { x: 21100, y: 330 }] as Point[],
  food,
  scooters: [11970, 20330],
  pigeons: [{ x: 4230, y: 460 }, { x: 5350, y: 420 }, { x: 8460, y: 360 }, { x: 18440, y: 360 }],
  benches: [14480],
  grannies: [{ left: 7540, right: 7580 }],
  checkpoints: levelSections.map(section => section.start),
  signs: levelSections.map(section => ({ x: section.start + 160, text: section.name })),
};
export { groundYAt };
