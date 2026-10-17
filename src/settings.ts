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
  liptonEnergy: 22, energyDrainPerSecond: 2.15,
  obstacleDamage: 15, grannyDamage: 15, grannySpeed: 12, hitCooldownMs: 1400,
  scooterSpeed: 210, scooterDamage: 12, scooterSlowMs: 650, scooterSlowSpeed: 100,
  pigeonDamage: 6, pigeonTriggerDistance: 120,
  benchDurationMs: 2500, benchEnergyPerSecond: 12.8, benchEnergyThreshold: 65,
  requiredFood: 80, bonusFood: 103, // V3 route budgets are recorded in LEVEL_AUDIT.md.
  coyoteMs: 130, jumpBufferMs: 150,
  boostMinMs: 40, boostWindowMs: 280, boostHeight: 220, tiredBoostHeight: 200,
  boostSpeed: 350, tiredBoostSpeed: 330,
  levelWidth: 10730, floorY: 440, viewHeight: 490, platformThickness: 12,
  groundSpans, interruptions,
  obstacles: [] as Box[],
  routePlatforms: [
    {x:2860,y:365,width:240,label:'Бонус ↑'},
    {x:3160,y:330,width:160,label:''},
    {x:3400,y:390,width:200,label:''},
  ] as Platform[],
  bottles: [{x:6970,y:435}] as Point[], food,
  scooters: [{x:5640,launchAt:4990},{x:9360,launchAt:9150}],
  pigeons: [{x:2500,y:435},{x:9590,y:470}] as Point[],
  benches: [7200] as number[],
  grannies: [{left:1820,right:1840},{left:6300,right:6320},{left:10230,right:10250}] as {left:number;right:number}[],
  recoveryDelayMs: 600,
  recoveryAnchors: [100,240,1220,2660,4110,5880,7320,8140,9240],
  signs: levelSections.map(section => ({ x: section.start === 100 ? 260 : section.start === 1100 ? 1470 : section.start === 3940 ? 3990 : section.start === 8870 ? 9130 : section.start - 160, text: section.start === 1100 ? 'Тап → тап: выше' : section.start === 3940 ? 'Тап → тап: дальше' : section.start === 8870 ? 'Самокат → птицы → кот' : section.name })),
};
export { groundYAt };
