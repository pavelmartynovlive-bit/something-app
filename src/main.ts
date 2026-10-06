import Phaser from 'phaser';
import { settings as s } from './settings';
import { TouchControls } from './controls';
import './style.css';
import './pwa';

const element = <T extends HTMLElement>(id: string) => document.querySelector<T>(id)!;
const hudValue = element('#energy-value');
const hudFill = element('#energy-fill');
const energyTrack = element('.energy-track');
const hint = element('#hint');
const toast = element('#toast');
const ending = element('#ending');
const installDialog = element<HTMLDialogElement>('#install-dialog');
let toastTimer: ReturnType<typeof setTimeout>;
let controls: TouchControls;
const hideHint = () => { hint.hidden = true; };
function message(text: string, duration = 1800) {
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

class PlayScene extends Phaser.Scene {
  private tanya!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private grannies: { sprite: Phaser.Physics.Arcade.Sprite; left: number; right: number }[] = [];
  private energy = 100;
  private exhausted = false;
  private checkpoint = 100;
  private lastGround = -Infinity;
  private bufferedJump = -Infinity;
  private hitUntil = 0;
  private slowUntil = 0;
  private restRemaining = 0;
  private foodCount = 0;
  private scooters: { sprite: Phaser.Physics.Arcade.Sprite; spawnX: number; launched: boolean }[] = [];
  private pigeons: { sprite: Phaser.Physics.Arcade.Sprite; flying: boolean; dangerRemaining: number }[] = [];
  private finished = false;
  private wasPortrait = false;
  constructor() { super('play'); }

  create() {
    this.energy = 100;
    this.exhausted = false;
    this.checkpoint = 100;
    this.lastGround = this.bufferedJump = -Infinity;
    this.hitUntil = this.slowUntil = 0;
    this.restRemaining = this.foodCount = 0;
    this.scooters = [];
    this.pigeons = [];
    this.finished = this.wasPortrait = false;
    this.grannies = [];
    ending.hidden = true;
    toast.classList.remove('visible');
    clearTimeout(toastTimer);
    controls?.reset();
    this.makeTextures();
    this.cameras.main.setBackgroundColor('#c7dfcf');
    this.resize();
    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.resize, this));
    const scenery = this.add.graphics();
    scenery.fillStyle(0xb6cfbe);
    for (let x = 0; x < s.levelWidth; x += 500) {
      scenery.fillRoundedRect(x + 140, 305, 140, 135, 10);
      scenery.fillRoundedRect(x + 320, 350, 95, 90, 8);
    }
    const ground = this.physics.add.staticGroup();
    const obstacles = this.physics.add.staticGroup();
    const upperRoute = this.physics.add.staticGroup();
    const slab = (x: number, y: number, width: number, height: number, group = ground) => {
      group.add(this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x788c7b));
      this.add.rectangle(x + width / 2, y + 4, width, 8, 0x96aa8c);
    };
    let start = 0;
    for (const gap of s.gaps) {
      slab(start, s.floorY, gap.start - start, 180);
      start = gap.start + gap.width;
      this.sign(gap.start - 130, 'Прыгни →');
    }
    slab(start, s.floorY, s.levelWidth - start, 180);
    s.obstacles.forEach((x, i) => slab(x, s.floorY - (i % 3 === 0 ? 48 : 34), 42, i % 3 === 0 ? 48 : 34, obstacles));
    this.sign(170, 'Котик ждёт →');
    this.sign(4100, 'Прыжками — наверх ↑');
    this.sign(5900, 'Нижний путь →');
    for (const platform of s.routePlatforms) {
      slab(platform.x, platform.y, platform.width, 18, upperRoute);
      const body = (upperRoute.getChildren().at(-1) as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
      // Односторонняя опора: края и низ никогда не блокируют автобег.
      body.checkCollision.left = body.checkCollision.right = body.checkCollision.down = false;
      if (platform.label) this.add.text(platform.x + 22, platform.y - 28, platform.label, { fontSize: '15px', color: '#3c594b' });
    }
    this.sign(13100, 'Ещё немного →');
    this.tanya = this.physics.add.sprite(100, s.floorY - 25, 'tanya');
    this.tanya.setSize(26, 48).setOffset(7, 4).setMaxVelocity(500, 700);
    this.physics.add.collider(this.tanya, ground);
    this.physics.add.collider(this.tanya, upperRoute, undefined, (_player, block) => {
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      const platform = (block as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
      return body.velocity.y >= 0 && body.prev.y + body.height <= platform.top + 4;
    });
    // Платформы поддерживают сверху; удар сбоку не блокирует auto-run.
    this.physics.add.collider(this.tanya, obstacles, undefined, (_player, block) => {
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      const obstacle = (block as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
      return body.velocity.y >= 0 && body.bottom <= obstacle.top + 12;
    });
    this.physics.add.overlap(this.tanya, obstacles, (_player, block) => {
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      const obstacle = (block as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
      if (body.bottom > obstacle.top + 12) this.hit(s.obstacleDamage);
    });
    this.keys = this.input.keyboard!.addKeys('SPACE,UP') as typeof this.keys;
    this.input.keyboard!.on('keydown', hideHint);
    this.events.once('shutdown', () => this.input.keyboard!.off('keydown', hideHint));
    const bottles = this.physics.add.staticGroup();
    s.bottles.forEach(point => {
      const bottle = bottles.create(point.x, point.y, 'lipton') as Phaser.Physics.Arcade.Sprite;
      bottle.setSize(42, 52);
    });
    this.physics.add.overlap(this.tanya, bottles, (_player, item) => {
      if (this.finished) return;
      const bottle = item as Phaser.Physics.Arcade.Sprite;
      const label = this.add.text(bottle.x, bottle.y - 25, `+${s.liptonEnergy}`, { fontSize: '22px', color: '#326544', fontStyle: 'bold' }).setOrigin(.5);
      bottle.destroy();
      this.changeEnergy(s.liptonEnergy);
      this.tweens.add({ targets: label, y: label.y - 45, alpha: 0, duration: 850, onComplete: () => label.destroy() });
      message(`Lipton! +${s.liptonEnergy} энергии`, 1200);
    });
    for (const range of s.grannies) {
      const sprite = this.physics.add.sprite(range.left, s.floorY - 27, 'granny');
      sprite.setSize(48, 44).setOffset(10, 12).setVelocityX(s.grannySpeed);
      this.physics.add.collider(sprite, ground);
      this.physics.add.overlap(this.tanya, sprite, () => this.hit(s.grannyDamage));
      this.grannies.push({ sprite, ...range });
    }
    this.createNewObjects();
    const catX = s.levelWidth - 150;
    this.add.image(catX, s.floorY - 22, 'cat');
    this.add.text(catX, s.floorY - 75, 'Мяу…', { fontSize: '22px', color: '#29483e' }).setOrigin(.5);
    this.sign(catX - 260, 'Покорми котика');
    if (!controls) controls = new TouchControls(this.game.canvas, hideHint);
    this.updateHud();
  }

  update(_time: number, delta: number) {
    const now = this.time.now;
    const portrait = window.matchMedia('(pointer: coarse)').matches && window.innerHeight > window.innerWidth;
    if (portrait || document.hidden || installDialog.open) {
      this.physics.pause();
      controls.reset();
      this.wasPortrait = true;
      return;
    }
    if (this.wasPortrait && !this.finished) {
      this.physics.resume();
      this.wasPortrait = false;
    }
    if (this.finished) return;
    const dt = Math.min(delta, 50) / 1000;
    const body = this.tanya.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;
    if (grounded) this.lastGround = now;
    // Прочитать все запросы, чтобы JustDown не оставался от предыдущего кадра.
    const space = Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const up = Phaser.Input.Keyboard.JustDown(this.keys.UP);
    const touch = controls.consumeJump();
    if (space || up || touch) this.bufferedJump = now;
    if (this.restRemaining > 0) {
      this.restRemaining = Math.max(0, this.restRemaining - delta);
      this.tanya.setVelocity(0, 0);
      this.bufferedJump = -Infinity;
      this.changeEnergy(s.benchEnergyPerSecond * dt);
      if (this.restRemaining === 0) {
        this.tanya.setTexture('tanya');
        body.allowGravity = true;
        this.tanya.setPosition(this.tanya.x, s.floorY - 25);
        message('Отдохнули — побежали!', 1200);
      }
    } else {
      this.changeEnergy(-s.energyDrainPerSecond * dt);
      this.tanya.setVelocityX(now < this.slowUntil ? s.scooterSlowSpeed : this.exhausted ? s.tiredSpeed : s.speed).setFlipX(false);
    }
    if (this.restRemaining === 0 && now - this.bufferedJump <= s.jumpBufferMs && now - this.lastGround <= s.coyoteMs) {
      this.tanya.setVelocityY(-(this.exhausted ? s.tiredJumpVelocity : s.jumpVelocity));
      this.bufferedJump = this.lastGround = -Infinity;
    }
    this.tanya.setAlpha(now < this.hitUntil ? (Math.floor(now / 100) % 2 ? .45 : 1) : 1);
    for (const granny of this.grannies) {
      if (granny.sprite.x >= granny.right) granny.sprite.setVelocityX(-s.grannySpeed).setFlipX(true);
      if (granny.sprite.x <= granny.left) granny.sprite.setVelocityX(s.grannySpeed).setFlipX(false);
    }
    this.updateNewObjects(dt);
    if (grounded && Math.abs(body.bottom - s.floorY) < 3) {
      for (const cp of s.checkpoints) if (this.tanya.x >= cp) this.checkpoint = Math.max(this.checkpoint, cp);
    }
    if (this.tanya.y > 620) this.respawn();
    if (this.tanya.x < 16) this.tanya.x = 16;
    const camera = this.cameras.main;
    const viewWidth = camera.width / camera.zoom;
    const target = Phaser.Math.Clamp(this.tanya.x - viewWidth * .35, 0, Math.max(0, s.levelWidth - viewWidth));
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, target, 1 - Math.exp(-dt * 5));
    // Небольшое вертикальное смещение сохраняет нижнюю страховочную дорожку в кадре.
    const targetY = Phaser.Math.Clamp((this.tanya.y - (s.floorY - 24)) * .28, -90, 0);
    camera.scrollY = Phaser.Math.Linear(camera.scrollY, targetY, 1 - Math.exp(-dt * 2.8));
    element('#distance').textContent = `${Math.min(100, Math.round(this.tanya.x / (s.levelWidth - 150) * 100))}% пути`;
    this.updateHud();
    if (Math.abs(this.tanya.x - (s.levelWidth - 150)) < 80 && grounded) this.feedCat();
  }
  private changeEnergy(amount: number) {
    this.energy = Phaser.Math.Clamp(this.energy + amount, 0, 100);
    if (this.energy === 0 && !this.exhausted) {
      this.exhausted = true;
      message('Таня устала — нужен Lipton или лавочка', 2500);
    }
    if (this.exhausted && this.energy > 0) {
      this.exhausted = false;
      message('Снова бежим быстро!', 1400);
    }
  }
  private hit(damage: number) {
    if (this.finished || this.restRemaining > 0 || this.time.now < this.hitUntil) return false;
    this.hitUntil = this.time.now + s.hitCooldownMs;
    this.changeEnergy(-damage);
    if (!this.exhausted) message(`Ой! −${damage} энергии`, 1000);
    return true;
  }
  private respawn() {
    this.tanya.setPosition(this.checkpoint, s.floorY - 26).setVelocity(0, 0);
    this.hitUntil = this.time.now + 800;
    this.lastGround = this.bufferedJump = -Infinity;
    controls.reset();
    message('Вернулись на безопасное место', 1500);
    this.cameras.main.scrollX = Math.max(0, this.checkpoint - this.cameras.main.width / this.cameras.main.zoom * .35);
  }
  private feedCat() {
    const success = this.foodCount >= s.requiredFood;
    element('#end-title').textContent = success ? 'Котик спасён ❤️' : 'Нужно ещё немного корма';
    element('#end-description').textContent = success ? 'Таня дошла. Котик поел. Всё получилось.' : `Собрано ${this.foodCount}/5. Котику нужно минимум ${s.requiredFood} пакетика — попробуй ещё раз.`;
    this.finished = true;
    this.tanya.setVelocity(0, 0).setAlpha(1).setFlipX(false);
    controls.reset();
    this.physics.pause();
    if (success) this.add.rectangle(s.levelWidth - 195, s.floorY - 7, 22, 10, 0xe5b83d);
    message(success ? 'Таня покормила котика' : 'Нужно ещё немного корма', 1800);
    this.time.delayedCall(1600, () => { ending.hidden = false; });
  }
  private updateHud() {
    element('#food-count').textContent = `Корм ${this.foodCount}/5`;
    hudValue.textContent = `${Math.ceil(this.energy)}`;
    hudFill.style.width = `${this.energy}%`;
    hudFill.style.background = this.exhausted ? '#bd745b' : '#568968';
    energyTrack.setAttribute('aria-valuenow', `${Math.ceil(this.energy)}`);
  }
  private createNewObjects() {
    const food = this.physics.add.staticGroup();
    for (const point of s.food) food.create(point.x, point.y, 'food');
    this.physics.add.overlap(this.tanya, food, (_player, item) => {
      if (this.finished) return;
      const packet = item as Phaser.Physics.Arcade.Sprite;
      const label = this.add.text(packet.x, packet.y - 25, '+1 корм', { fontSize: '18px', color: '#326544' }).setOrigin(.5);
      packet.destroy();
      this.foodCount++;
      this.tweens.add({ targets: label, y: label.y - 40, alpha: 0, duration: 750, onComplete: () => label.destroy() });
      this.updateHud();
    });
    for (const x of s.scooters) {
      const sprite = this.physics.add.sprite(x, s.floorY - 28, 'scooter').setImmovable(true);
      (sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      this.scooters.push({ sprite, spawnX: x, launched: false });
      this.physics.add.overlap(this.tanya, sprite, () => {
        if (this.hit(s.scooterDamage)) {
          this.slowUntil = this.time.now + s.scooterSlowMs;
          this.cameras.main.shake(90, .002);
        }
      });
    }
    for (const x of s.pigeons) {
      const sprite = this.physics.add.sprite(x, s.floorY - 16, 'pigeons');
      (sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      const flock = { sprite, flying: false, dangerRemaining: 0 };
      this.pigeons.push(flock);
      this.physics.add.overlap(this.tanya, sprite, () => {
        if ((!flock.flying || flock.dangerRemaining > 0) && this.hit(s.pigeonDamage)) this.cameras.main.shake(160, .004);
      });
    }
    const benches = this.physics.add.staticGroup();
    for (const x of s.benches) benches.create(x, s.floorY - 22, 'bench');
    this.physics.add.overlap(this.tanya, benches, (_player, item) => {
      const bench = item as Phaser.Physics.Arcade.Sprite;
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      if (this.finished || this.restRemaining > 0 || bench.getData('used') || this.energy >= s.benchEnergyThreshold || !(body.blocked.down || body.touching.down)) return;
      bench.setData('used', true);
      this.restRemaining = s.benchDurationMs;
      this.tanya.setPosition(bench.x, s.floorY - 25).setVelocity(0, 0).setTexture('tanya-sitting');
      body.allowGravity = false;
      controls.reset();
      message('Отдыхаем на лавочке', s.benchDurationMs);
    });
  }
  private updateNewObjects(dt: number) {
    for (const scooter of this.scooters) {
      if (!scooter.launched && scooter.spawnX - this.tanya.x < 650) {
        scooter.launched = true;
        scooter.sprite.setVelocityX(-s.scooterSpeed);
      }
      if (scooter.sprite.x < 0) scooter.sprite.setVelocityX(0).setVisible(false);
    }
    for (const flock of this.pigeons) {
      if (!flock.flying && Math.abs(flock.sprite.x - this.tanya.x) < s.pigeonTriggerDistance) {
        flock.flying = true;
        flock.dangerRemaining = .45;
        // Сначала вспархивают низко: без прыжка можно задеть стаю.
        flock.sprite.setVelocity(35, -35);
        this.tweens.add({ targets: flock.sprite, angle: 12, yoyo: true, repeat: 2, duration: 70 });
      }
      if (flock.flying) {
        flock.dangerRemaining = Math.max(0, flock.dangerRemaining - dt);
        if (flock.dangerRemaining === 0) {
          (flock.sprite.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;
          flock.sprite.setVelocity(65, -260);
        }
      }
    }
  }
  private resize() {
    this.cameras.main.setOrigin(0, 0);
    this.cameras.main.setZoom(this.scale.height / 540);
    this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY, -90, 0);
    controls?.reset();
  }
  private sign(x: number, text: string) {
    this.add.rectangle(x, s.floorY - 30, 4, 60, 0x788c7b);
    this.add.text(x, s.floorY - 70, text, { fontSize: '17px', color: '#3c594b', backgroundColor: '#eef3df', padding: { x: 10, y: 7 } }).setOrigin(.5);
  }
  private makeTextures() {
    if (this.textures.exists('tanya')) return;
    const g = this.add.graphics();
    g.fillStyle(0x446b55).fillRoundedRect(8, 21, 24, 25, 5);
    g.fillStyle(0xf0d2ac).fillCircle(20, 13, 10);
    g.fillStyle(0x705745).fillRect(10, 3, 20, 6);
    g.fillStyle(0x29483e).fillRect(9, 44, 8, 10).fillRect(23, 44, 8, 10).fillCircle(25, 13, 2);
    g.generateTexture('tanya', 40, 56).clear();
    g.fillStyle(0x977d99).fillRoundedRect(5, 20, 25, 29, 6);
    g.fillStyle(0xe9cfae).fillCircle(17, 13, 10);
    g.fillStyle(0xf5f0e5).fillRect(6, 3, 23, 8);
    g.fillStyle(0x91a1a0).fillRoundedRect(34, 28, 30, 20, 3);
    g.lineStyle(3, 0x51665d).lineBetween(28, 23, 38, 33);
    g.fillStyle(0x40584c).fillCircle(39, 52, 4).fillCircle(59, 52, 4);
    g.generateTexture('granny', 68, 58).clear();
    g.fillStyle(0xe8b93b).fillRoundedRect(2, 8, 38, 42, 5);
    g.fillStyle(0x698849).fillRect(14, 0, 14, 10);
    g.fillStyle(0xfff1b5).fillRect(4, 22, 34, 15);
    g.generateTexture('bottle-base', 42, 52).clear();
    const bottle = this.textures.createCanvas('lipton', 42, 52)!;
    const ctx = bottle.getContext();
    ctx.drawImage(this.textures.get('bottle-base').getSourceImage() as HTMLCanvasElement, 0, 0);
    ctx.fillStyle = '#645024'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LIPTON', 21, 33);
    bottle.refresh();
    g.fillStyle(0xd29a59).fillRoundedRect(9, 20, 32, 24, 8).fillCircle(27, 16, 14);
    g.fillTriangle(14, 9, 15, 0, 24, 9).fillTriangle(29, 9, 40, 0, 40, 14);
    g.lineStyle(6, 0xd29a59).lineBetween(10, 34, 2, 20);
    g.fillStyle(0x4b483a).fillCircle(23, 15, 2).fillCircle(33, 15, 2);
    g.generateTexture('cat', 48, 46).clear();
    g.fillStyle(0xf0d2ac).fillCircle(20, 25, 10);
    g.fillStyle(0x705745).fillRect(10, 15, 20, 6);
    g.fillStyle(0x446b55).fillRoundedRect(8, 33, 23, 15, 4);
    g.fillStyle(0x29483e).fillRect(23, 44, 17, 7);
    g.generateTexture('tanya-sitting', 40, 56).clear();
    g.fillStyle(0xb99c70).fillRoundedRect(2, 2, 32, 36, 4);
    g.fillStyle(0xefe4ce).fillRect(5, 12, 26, 16);
    g.fillStyle(0x705745).fillCircle(18, 19, 6);
    g.generateTexture('food', 36, 40).clear();
    g.fillStyle(0x788c7b).fillRect(2, 7, 86, 12).fillRect(2, 24, 86, 8);
    g.fillStyle(0x51665d).fillRect(12, 32, 7, 12).fillRect(70, 32, 7, 12);
    g.generateTexture('bench', 90, 44).clear();
    g.lineStyle(4, 0x51665d).lineBetween(10, 44, 59, 44).lineBetween(53, 44, 53, 9).lineBetween(43, 9, 62, 9);
    g.fillStyle(0x40584c).fillCircle(12, 50, 6).fillCircle(58, 50, 6);
    g.fillStyle(0x977d99).fillRoundedRect(28, 15, 16, 22, 3);
    g.fillStyle(0xe9cfae).fillCircle(36, 8, 7);
    g.generateTexture('scooter', 68, 56).clear();
    for (const x of [10, 32, 54]) {
      g.fillStyle(0x91a1a0).fillEllipse(x, 21, 18, 16).fillCircle(x + 5, 12, 6);
      g.fillStyle(0x40584c).fillCircle(x + 7, 11, 1);
      g.lineStyle(2, 0x51665d).lineBetween(x - 3, 27, x - 3, 32);
    }
    g.generateTexture('pigeons', 68, 34);
    g.destroy();
  }
}

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#c7dfcf',
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: s.gravity }, debug: false } },
  input: { activePointers: 3, keyboard: true },
  scene: PlayScene,
  render: { antialias: true },
});
// dvh меняется и при скрытии панели браузера. Наблюдаем контейнер, а не
// только window.resize: это также устраняет задержку размера при повороте.
new ResizeObserver(() => {
  if (!game.isBooted) return;
  game.scale.getParentBounds();
  game.scale.refresh();
}).observe(element('#game'));
setTimeout(hideHint, 2800);
element<HTMLButtonElement>('#replay').addEventListener('click', () => {
  controls.reset();
  game.scene.start('play');
});
