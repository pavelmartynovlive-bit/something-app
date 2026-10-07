// Все числа прототипа — здесь. Координаты уровня заданы в игровых пикселях.
type Platform = { x: number; y: number; width: number; label: string };
type Point = { x: number; y: number };
type RouteKind = 'canopy' | 'broken' | 'steps';

// Пять коротких разделов вместо десяти повторяющихся кварталов.
const sectionWidth = 6000;
const sections: [RouteKind, RouteKind][] = [
  ['canopy', 'steps'], ['broken', 'canopy'], ['steps', 'broken'],
  ['broken', 'steps'], ['steps', 'canopy'],
];
const layout = {
  obstacles: [] as number[], routePlatforms: [] as Platform[],
  bottles: [] as Point[], food: [] as Point[], scooters: [] as number[],
  pigeons: [] as number[], benches: [] as number[],
  grannies: [] as { left: number; right: number }[],
  checkpoints: [100], signs: [] as { x: number; text: string }[],
};
function addRoute(start: number, kind: RouteKind) {
  // Все навесы проходимы снизу: минимум 76px до земли при росте 56px.
  // Под высокой серединой помещается полный прыжок, без пересечения крыши.
  const shapes: Record<RouteKind, [number, number, number][]> = {
    canopy: [[0,340,220],[280,284,220],[560,228,220],[840,284,220],[1120,340,220]],
    broken: [[0,340,200],[270,284,220],[560,228,200],[830,284,220],[1120,340,220]],
    steps: [[0,340,240],[300,284,200],[560,228,240],[860,284,200],[1120,340,240]],
  };
  const platforms = shapes[kind].map(([x,y,width],i) => ({
    x:start+x,y,width,label:i===0?'Наверх ↑':i===2?'Корм →':i===3?'Спуск →':'',
  }));
  layout.routePlatforms.push(...platforms);
  const reward=platforms[2];
  layout.food.push({x:platforms[1].x+100,y:platforms[1].y-40},
    {x:reward.x+65,y:reward.y-55},{x:reward.x+155,y:reward.y-40});
  layout.bottles.push({x:reward.x+reward.width-30,y:reward.y-26});
  layout.signs.push({x:start-90,text:'Снизу проход / корм наверху'});
}
sections.forEach(([first,second],index) => {
  const base=index*sectionWidth;
  // Ящики только на открытой земле: ни одного под крышей или у её края.
  layout.obstacles.push(...[500,1250,3420,5700].map(x=>base+x));
  layout.pigeons.push(base+950,base+(index%2===0?4460:2260));
  layout.food.push(...[560,2260,3250,4460,5450,5760].map(x=>({x:base+x,y:340})));
  addRoute(base+1600,first);addRoute(base+3800,second);
  layout.bottles.push({x:base+1450,y:414});
  // Лавочка и стая расположены под разными высокими навесами.
  const benchX=base+(index%2===0?2260:4460);
  layout.benches.push(benchX);
  layout.signs.push({x:benchX-120,text:'Можно отдохнуть →'});
  // Бабка встречается до выбора маршрута, а не в низком проходе.
  if(index>0)layout.grannies.push({left:base+1000,right:base+1120});
  // Встреча с самокатом ~3353/5553: уже после свободного приземления.
  layout.scooters.push(base+3750,base+5950);
  layout.checkpoints.push(base+1500,base+3200,base+5400);
});

export const settings = {
  speed: 330,
  tiredSpeed: 130,
  jumpVelocity: 560,
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
  platformThickness: 24,
  // Сплошная нижняя страховочная дорожка на всём протяжении забега.
  gaps: [] as { start: number; width: number }[],
  ...layout,
};
