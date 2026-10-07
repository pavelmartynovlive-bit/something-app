// Все числа прототипа — здесь. Координаты уровня заданы в игровых пикселях.
type Platform = { x: number; y: number; width: number; label: string };
type Point = { x: number; y: number };
type RouteKind = 'stairs' | 'low' | 'rolling' | 'split';

// Десять авторских последовательностей, без случайной генерации.
// Каждый квартал ~18с: прыжки → выбор высоты → спуск → самокат → передышка.
const sectionWidth = 6000;
const sections: [RouteKind, RouteKind][] = [
  ['stairs', 'low'], ['low', 'rolling'], ['rolling', 'split'],
  ['split', 'stairs'], ['low', 'split'], ['rolling', 'low'],
  ['stairs', 'rolling'], ['split', 'low'], ['rolling', 'split'], ['split', 'rolling'],
];
const layout = {
  obstacles: [] as number[], routePlatforms: [] as Platform[],
  bottles: [] as Point[], food: [] as Point[], scooters: [] as number[],
  pigeons: [] as number[], benches: [] as number[],
  grannies: [] as { left: number; right: number }[],
  checkpoints: [100], signs: [] as { x: number; text: string }[],
};
function addRoute(start: number, kind: RouteKind) {
  // Первые два шага знакомят с подъёмом. Затем разные длины и перепады.
  const shapes: Record<RouteKind, [number, number, number][]> = {
    stairs: [[0,380,260],[300,320,260],[600,260,360],[1020,300,240],[1320,370,260]],
    low: [[0,380,300],[340,320,420],[820,320,360],[1240,380,340]],
    rolling: [[0,380,260],[300,320,260],[600,350,260],[900,290,260],[1200,350,380]],
    split: [[0,380,260],[300,320,300],[660,260,280],[1000,320,240],[1300,380,280]],
  };
  const platforms = shapes[kind].map(([x,y,width],i) => ({
    x:start+x,y,width,label:i===0?'Наверх ↑':i===2?'Корм →':i===3?'Спуск →':'',
  }));
  layout.routePlatforms.push(...platforms);
  // Цепочка у подъёма и на наградной площадке, а не случайные предметы.
  const reward=platforms[2];
  layout.food.push({x:platforms[1].x+140,y:platforms[1].y-40},
    {x:reward.x+100,y:reward.y-55},{x:reward.x+230,y:reward.y-40});
  layout.bottles.push({x:reward.x+reward.width-35,y:reward.y-26});
  layout.signs.push({x:start-90,text:'Корм наверху / проще снизу'});
}
sections.forEach(([first,second],index) => {
  const base=index*sectionWidth;
  // Вступление обучает одиночным прыжкам, далее опасности комбинируются.
  const obstacles=index===0?[500,1250,1950,2850,3550,5100,5700]
    :index%2===0?[500,1250,1950,2800,3550,4050,5100,5700]
    :[500,1250,1800,2850,3550,4100,5050,5700];
  layout.obstacles.push(...obstacles.map(x=>base+x));
  layout.pigeons.push(...(index===0?[950,2150,3050,4450]:[950,2200,3050,4500]).map(x=>base+x));
  layout.food.push({x:base+560,y:340},{x:base+5760,y:340});
  addRoute(base+1600,first);addRoute(base+3800,second);
  // Нижний маршрут обеспечивает восстановление даже при нулевой энергии.
  layout.bottles.push({x:base+1450,y:414});
  const benchX=base+(index%2===0?2450:4750);
  layout.benches.push(benchX);
  layout.signs.push({x:benchX-120,text:'Можно отдохнуть →'});
  if(index>0)layout.grannies.push({left:base+2600,right:base+2720});
  // Запуск за 650px; встреча после спуска, с видимым временем на реакцию.
  layout.scooters.push(base+3750,base+5950);
  layout.checkpoints.push(base+1500,base+3200,base+5400);
});

export const settings = {
  speed: 330,
  tiredSpeed: 130,
  jumpVelocity: 520,
  gravity: 1400,
  liptonEnergy: 22,
  obstacleDamage: 15,
  grannyDamage: 15,
  grannySpeed: 24,
  hitCooldownMs: 1400,
  energyDrainPerSecond: 3.5,
  tiredJumpVelocity: 440,
  scooterSpeed: 210,
  scooterDamage: 12,
  scooterSlowMs: 650,
  scooterSlowSpeed: 100,
  pigeonDamage: 6,
  pigeonTriggerDistance: 150,
  benchDurationMs: 2500,
  benchEnergyPerSecond: 22,
  benchEnergyThreshold: 65,
  requiredFood: 3,
  coyoteMs: 130,
  jumpBufferMs: 150,
  levelWidth: sectionWidth * sections.length,
  floorY: 440,
  viewHeight: 490,
  platformThickness: 28,
  // Сплошная нижняя страховочная дорожка на всём протяжении забега.
  gaps: [] as { start: number; width: number }[],
  ...layout,
};
