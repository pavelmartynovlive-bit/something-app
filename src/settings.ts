// Individually authored ground-first phrases. Food trajectories follow validated geometry.
import { groundSpans, groundYAt, interruptions } from './terrain';
import { food } from './food-layout';
type Platform = { x: number; y: number; width: number; label: string };
type Point = { x: number; y: number };
type Box = { x: number; width: number; height: number };
export const levelSections = [
  { name: 'Разрыв и низкий остров', start: 100, end: 1420, idea: 'Прыжок → остров → второй прыжок' },
  { name: 'Птичья чаша', start: 1420, end: 2740, idea: 'Сход → ждать → птицы → выход' },
  { name: 'Остров и бабушка', start: 2740, end: 4060, idea: 'Прыжок на остров → сразу бабушка → спуск' },
  { name: 'Единственный верхний бонус', start: 4060, end: 5710, idea: 'Выбор → две разные опоры → безопасное падение' },
  { name: 'Лесенка вниз', start: 5710, end: 7360, idea: 'Сойти → сойти → не прыгать → разрыв' },
  { name: 'Самокат под эстакадой', start: 7360, end: 9010, idea: 'Подъём → посадка → ждать → поздний прыжок вниз' },
  { name: 'Карман восстановления', start: 9010, end: 10330, idea: 'Lipton на прыжке ИЛИ лавочка внизу' },
  { name: 'Три неравные высоты', start: 10330, end: 11980, idea: 'Дальний прыжок → короткое окно → спуск' },
  { name: 'Спуск, птицы и разрыв', start: 11980, end: 13630, idea: 'Отложенный прыжок → посадка → быстрый второй тап' },
  { name: 'Бабушка и кот', start: 13630, end: 15030, idea: 'Подъём → бабушка → спуск → кот' },
];
// Read-only audit annotations; these never drive gameplay.
export const rewardJumps: number[] = [];
export const routeChoices = [{ x: 4730, entrance: 4950, end: 5400 }];
export const rhythmDecisions = [
  { x: 1000, targetX: 1050, kind: 'read-bowl-descent' },
  { x: 1350, targetX: 1720, kind: 'descend-before-pigeons' },
  { x: 2400, targetX: 2740, kind: 'read-next-island' },
  { x: 3130, targetX: 3410, kind: 'follow-island-descent' },
  { x: 3900, targetX: 4950, kind: 'read-bonus-entrance' },
  { x: 5420, targetX: 6060, kind: 'read-descending-staircase' },
  { x: 6000, targetX: 6060, kind: 'walk-down-first-step' },
  { x: 6300, targetX: 6390, kind: 'walk-down-second-step' },
  { x: 7030, targetX: 7340, kind: 'read-roadway-approach' },
  { x: 7900, targetX: 8240, kind: 'read-scooter-road-edge' },
  { x: 8520, targetX: 8840, kind: 'read-lower-landing' },
  { x: 9150, targetX: 9630, kind: 'Lipton-or-bench' },
  { x: 10000, targetX: 10330, kind: 'read-unequal-islands' },
  { x: 10920, targetX: 11050, kind: 'stay-low-on-short-island' },
  { x: 11400, targetX: 11660, kind: 'follow-descending-trail' },
  { x: 11940, targetX: 12290, kind: 'read-delayed-pigeon-timing' },
  { x: 13000, targetX: 13350, kind: 'read-final-rise-approach' },
  { x: 14600, targetX: 15030, kind: 'feed-cat' },
];
export const settings = {
  speed: 330, tiredSpeed: 190, jumpVelocity: 560, gravity: 1400, tiredJumpVelocity: 500,
  liptonEnergy: 22, energyDrainPerSecond: 2,
  obstacleDamage: 15, grannyDamage: 15, grannySpeed: 12, hitCooldownMs: 1400,
  scooterSpeed: 210, scooterDamage: 12, scooterSlowMs: 650, scooterSlowSpeed: 100,
  pigeonDamage: 6, pigeonTriggerDistance: 210,
  benchDurationMs: 2500, benchEnergyPerSecond: 22, benchEnergyThreshold: 65,
  requiredFood: 150, bonusFood: 194, // Measured V2 budgets: normal 183, ground/rest 180, collector 201.
  coyoteMs: 130, jumpBufferMs: 150,
  levelWidth: 15180, floorY: 440, viewHeight: 490, platformThickness: 12,
  groundSpans, interruptions,
  obstacles: [] as Box[],
  routePlatforms: [
    { x: 4950, y: 370, width: 240, label: 'Бонус ↑' },
    { x: 5230, y: 346, width: 170, label: '' },
  ] as Platform[],
  bottles: [{ x: 9630, y: 450 }] as Point[],
  food,
  // Existing ground collision stops the approaching scooter at the visible road face.
  scooters: [8460],
  pigeons: [{ x: 1720, y: 456 }, { x: 12290, y: 564 }],
  benches: [9700],
  grannies: [{ left: 3020, right: 3044 }, { left: 14380, right: 14400 }],
  checkpoints: levelSections.map(section => section.start),
  signs: levelSections.map(section => ({ x: section.start + 160, text: section.name })),
};
export { groundYAt };
