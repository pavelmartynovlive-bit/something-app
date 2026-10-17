// Individually authored ground-first phrases. Food trajectories follow validated geometry.
import { groundSpans, groundYAt, interruptions } from './terrain';
import { food } from './food-layout';
type Platform = { x: number; y: number; width: number; label: string };
type Point = { x: number; y: number };
type Box = { x: number; width: number; height: number };
export const levelSections = [
  { name: 'Разрыв и остров', start: 100, end: 1100, idea: 'tap → land → tap' },
  { name: 'Высокий уступ', start: 1100, end: 1900, idea: 'tap → early boost → high landing' },
  { name: 'Спуск и птицы', start: 1900, end: 2520, idea: 'descend → wait → tap' },
  { name: 'Неравные опоры', start: 2520, end: 3940, idea: 'tap → quick tap → longer jump' },
  { name: 'Длинный разрыв', start: 3940, end: 4820, idea: 'tap → boost → long flight' },
  { name: 'Самокат', start: 4820, end: 5740, idea: 'see → wait → late tap' },
  { name: 'Каскад вниз', start: 5740, end: 6670, idea: 'drop → tap → drop' },
  { name: 'Отдых', start: 6670, end: 7400, idea: 'Lipton OR bench' },
  { name: 'Подъём', start: 7400, end: 8870, idea: 'tap → tap/boost → boost' },
  { name: 'Финальная связка', start: 8870, end: 10580, idea: 'drop → wait → tap → land → tap → cat' },
];
export const rewardJumps: number[] = [];
export const routeChoices = [{x:2640,entrance:2860,end:3680}];
export const rhythmDecisions: {x:number;targetX:number;kind:string}[] = [];
export const settings = {
  speed: 240, tiredSpeed: 170, jumpVelocity: 560, gravity: 1400, tiredJumpVelocity: 500,
  liptonEnergy: 22, energyDrainPerSecond: 2,
  obstacleDamage: 15, grannyDamage: 15, grannySpeed: 12, hitCooldownMs: 1400,
  scooterSpeed: 210, scooterDamage: 12, scooterSlowMs: 650, scooterSlowSpeed: 100,
  pigeonDamage: 6, pigeonTriggerDistance: 120,
  benchDurationMs: 2500, benchEnergyPerSecond: 22, benchEnergyThreshold: 65,
  requiredFood: 80, bonusFood: 103, // V3 route budgets are recorded in LEVEL_AUDIT.md.
  coyoteMs: 130, jumpBufferMs: 150,
  boostMinMs: 40, boostWindowMs: 280, boostHeight: 220, tiredBoostHeight: 200,
  boostSpeed: 350, tiredBoostSpeed: 330,
  levelWidth: 10730, floorY: 440, viewHeight: 490, platformThickness: 12,
  groundSpans, interruptions,
  obstacles: [] as Box[],
  routePlatforms: [
    {x:2860,y:365,width:300,label:'Бонус ↑'},
    {x:3200,y:330,width:180,label:''},
    {x:3480,y:390,width:200,label:''},
  ] as Platform[],
  bottles: [{x:7080,y:435}] as Point[], food,
  scooters: [5640] as number[],
  pigeons: [{x:2500,y:435},{x:9490,y:470}] as Point[],
  benches: [7120] as number[],
  grannies: [{left:10230,right:10250}] as {left:number;right:number}[],
  checkpoints: levelSections.map(section => section.start),
  signs: levelSections.map(section => ({ x: section.start === 100 ? 260 : section.start === 1100 ? 1470 : section.start === 3940 ? 3990 : section.start === 8870 ? 9130 : section.start - 160, text: section.start === 1100 ? 'Тап → тап: выше' : section.start === 3940 ? 'Тап → тап: дальше' : section.start === 8870 ? '↓ Птицы → кот' : section.name })),
};
export { groundYAt };
