// Все числа прототипа — здесь. Координаты уровня заданы в игровых пикселях.
export const settings = {
  speed: 330,
  tiredSpeed: 130,
  jumpVelocity: 520,
  gravity: 1400,
  liptonEnergy: 30,
  obstacleDamage: 15,
  grannyDamage: 15,
  grannySpeed: 24,
  hitCooldownMs: 1400,
  exhaustedDurationMs: 4000,
  recoveryEnergy: 30,
  coyoteMs: 130,
  jumpBufferMs: 150,
  levelWidth: 14500,
  floorY: 440,
  // События через 900px: примерно 2,7 секунды на скорости 330px/s.
  gaps: [{ start: 4500, width: 80 }, { start: 9900, width: 80 }],
  obstacles: [900, 1800, 5400, 6300, 8100, 10800, 11700, 13500],
  checkpoints: [100, 2000, 3800, 4700, 6500, 9200, 10100, 11900, 13700],
  bottles: [2700, 7200, 12600],
  grannies: [{ left: 3500, right: 3700 }, { left: 8900, right: 9100 }],
};
