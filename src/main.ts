import Phaser from 'phaser';
import { settings as s, levelSections, groundYAt } from './settings';
import { touchesDanger } from './hazard-shapes';
import { TouchControls } from './controls';
import { presentation, cameraFrame } from './presentation';
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
  private airborneSpeed = s.speed;
  private jumpStartedAt = -Infinity;
  private takeoffFloor = s.floorY;
  private takeoffTired = false;
  private boostUsed = false;
  private boostsUsed = 0;
  private restRemaining = 0;
  private foodCount = 0;
  private scooters: { sprite: Phaser.Physics.Arcade.Sprite; spawnX: number; launchAt: number; left: number; right: number; launched: boolean }[] = [];
  private pigeons: { sprite: Phaser.Physics.Arcade.Sprite; flying: boolean; lowFlightRemaining: number; perchY: number }[] = [];
  private recoveryRemaining = 0;
  private falls = 0;
  private recoveries = 0;
  private benchUses = 0;
  private liptonUses = 0;
  private benchSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private finished = false;
  private wasPortrait = false;
  private framing?: ReturnType<typeof cameraFrame>;
  constructor() { super('play'); }

  create() {
    this.energy = 100;
    this.exhausted = false;
    this.checkpoint = 100;
    this.recoveryRemaining = this.falls = this.recoveries = this.benchUses = this.liptonUses = 0;
    this.benchSprites = [];
    this.lastGround = this.bufferedJump = -Infinity;
    this.hitUntil = this.slowUntil = 0;
    this.airborneSpeed = s.speed;
    this.jumpStartedAt = -Infinity;
    this.takeoffFloor = s.floorY;
    this.takeoffTired = this.boostUsed = false;
    this.boostsUsed = 0;
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
    this.cameras.main.setBackgroundColor('#c7dfcf').setScroll(0, 0);
    this.framing = undefined;
    this.resize();
    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.resize, this));
    const scenery = this.add.graphics().setDepth(-2);
    for (const [i, section] of levelSections.entries()) {
      for (let x = section.start; x < section.end; x += 430) {
        scenery.fillStyle(0xb6cfbe);
        scenery.fillRoundedRect(x + 140, 280 - (i % 3) * 25, 140, 160 + (i % 3) * 25, 10);
        scenery.fillRoundedRect(x + 310, 350, 95, 90, 8);
        scenery.fillStyle(0xc7dfcf);
        scenery.fillRect(x + 162, 315, 22, 28);
        scenery.fillRect(x + 214, 315, 22, 28);
        scenery.lineStyle(3, 0xa1bdab);
        scenery.lineBetween(x + 75, 340, x + 75, 440);
        scenery.fillStyle(0xa1bdab).fillCircle(x + 75, 339, 12);
        scenery.fillStyle(0xaac6ad).fillEllipse(x + 30, 430, 38, 22);
      }
    }
    const ground = this.physics.add.staticGroup();
    const obstacles = this.physics.add.staticGroup();
    const upperRoute = this.physics.add.staticGroup();
    const slab = (x: number, y: number, width: number, height: number, group = ground) => {
      group.add(this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x788c7b));
      this.add.rectangle(x + width / 2, y + 4, width, 8, 0x96aa8c);
    };
    for (const span of s.groundSpans) {
      // Filled to one foundation: the terraces have no playable underside.
      if (span.endY === undefined) slab(span.start, span.y, span.end - span.start, 660 - span.y);
      else {
        const shape = this.add.graphics();
        shape.fillStyle(0x788c7b).fillPoints([
          new Phaser.Geom.Point(span.start,span.y),new Phaser.Geom.Point(span.end,span.endY),
          new Phaser.Geom.Point(span.end,660),new Phaser.Geom.Point(span.start,660),
        ],true);
        shape.lineStyle(8,0x96aa8c).lineBetween(span.start,span.y+4,span.end,span.endY+4);
      }
    }
    for (const box of s.obstacles) {
      const y = groundYAt(box.x) - box.height;
      const crate = this.add.rectangle(box.x + box.width / 2, y + box.height / 2, box.width, box.height, 0xb99c70);
      obstacles.add(crate);
      const detail = this.add.graphics();
      detail.lineStyle(2, 0x705745);
      detail.strokeRect(box.x + 1, y + 1, box.width - 2, box.height - 2);
      detail.lineBetween(box.x + 3, y + 3, box.x + box.width - 3, groundYAt(box.x) - 3);
    }
    const sludge = this.add.graphics();
    for (const pit of s.interruptions) {
      const y = groundYAt(pit.start+1);
      sludge.fillStyle(0x435a50).fillRect(pit.start,y,pit.width,9);
      sludge.lineStyle(2,0x92a15b).lineBetween(pit.start,y+1,pit.start+pit.width,y+1);
      for(let x=pit.start+10;x<pit.start+pit.width;x+=24)sludge.fillStyle(0x72804e).fillEllipse(x,y+3,12,3);
    }
    for (const sign of s.signs) this.sign(sign.x, sign.text);
    // Опоры находятся за игровой дорожкой: они поддерживают навес визуально,
    // но не являются препятствиями в проходе перед ними.
    const supports = this.add.graphics().setDepth(-1);
    for (const platform of s.routePlatforms) {
      const underside = platform.y + s.platformThickness;
      supports.fillStyle(0x9bb3a3);
      supports.lineStyle(3, 0x9bb3a3);
      for (const postX of [platform.x + 16, platform.x + platform.width - 23]) {
        supports.fillRect(postX, underside, 7, groundYAt(postX) - underside);
        supports.lineBetween(postX + 3, underside + 25, postX + 24, underside);
      }
      // A light, open awning with a strong top edge communicates a one-way surface.
      const awning = this.add.rectangle(platform.x + platform.width / 2, platform.y + s.platformThickness / 2,
        platform.width, s.platformThickness, 0x788c7b, .55);
      upperRoute.add(awning);
      this.add.rectangle(platform.x + platform.width / 2, platform.y + 2, platform.width, 4, 0x568968);
      for (let x = platform.x + 36; x < platform.x + platform.width; x += 70) {
        this.add.text(x, platform.y + 12, '↑', { fontSize: '12px', color: '#568968' });
      }
      const body = (upperRoute.getChildren().at(-1) as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
      // Односторонняя опора: края и низ никогда не блокируют автобег.
      body.checkCollision.left = body.checkCollision.right = body.checkCollision.down = false;
      if (platform.label) this.add.text(platform.x + 22, platform.y - 28, platform.label, { fontSize: '15px', color: '#3c594b' });
    }
    this.sign(s.levelWidth - 600, 'Ещё немного →');
    this.tanya = this.physics.add.sprite(100, s.floorY - 25, 'tanya');
    this.tanya.setSize(24, 50).setOffset(8, 4).setMaxVelocity(500, 700);
    this.physics.add.collider(this.tanya, ground);
    // Resolve the same drawn top after EVERY fixed physics substep, not once
    // per render frame. This also catches high-speed top crossings at joins.
    const physicsWorld = this.physics.world;
    physicsWorld.on('worldstep',this.resolveTerrainContacts,this);
    this.events.once('shutdown',()=>physicsWorld.off('worldstep',this.resolveTerrainContacts,this));
    this.physics.add.collider(this.tanya, upperRoute, undefined, (_player, block) => {
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      const platform = (block as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
      return body.velocity.y >= 0 && body.prev.y + body.height <= platform.top + 4;
    });
    // Crates are genuinely solid. A missed jump contacts the visible face;
    // a jump from that face remains possible even at zero energy.
    this.physics.add.collider(this.tanya, obstacles, () => {
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.right) this.hit(s.obstacleDamage);
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
      if (this.finished || this.recoveryRemaining > 0) return;
      const bottle = item as Phaser.Physics.Arcade.Sprite;
      const label = this.add.text(bottle.x, bottle.y - 25, `+${s.liptonEnergy}`, { fontSize: '22px', color: '#326544', fontStyle: 'bold' }).setOrigin(.5);
      bottle.destroy();
      this.liptonUses++;
      this.changeEnergy(s.liptonEnergy);
      this.tweens.add({ targets: label, y: label.y - 45, alpha: 0, duration: 850, onComplete: () => label.destroy() });
      message(`Lipton! +${s.liptonEnergy} энергии`, 1200);
    });
    for (const range of s.grannies) {
      const sprite = this.physics.add.sprite(range.left, groundYAt(range.left) - 27, 'granny');
      sprite.setSize(48, 44).setOffset(10, 12).setVelocityX(s.grannySpeed);
      this.physics.add.collider(sprite, ground);
      this.grannies.push({ sprite, ...range });
    }
    this.createNewObjects(ground);
    const catX = s.levelWidth - 150;
    this.add.image(catX, groundYAt(catX) - 22, 'cat');
    this.add.text(catX, groundYAt(catX) - 75, 'Мяу…', { fontSize: '22px', color: '#29483e' }).setOrigin(.5);
    this.sign(catX - 260, 'Покорми котика');
    if (!controls) controls = new TouchControls(this.game.canvas, hideHint);
    element('#food-goal').textContent = `Котику нужно: ${s.requiredFood}. ${s.bonusFood}+ — кошачий пир!`;
    this.updateHud();
  }

  update(_time: number, delta: number) {
    const now = this.time.now;
    const portrait = window.matchMedia('(pointer: coarse)').matches &&
      (presentation === 'c' ? window.innerWidth > window.innerHeight : window.innerHeight > window.innerWidth);
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
    if (this.recoveryRemaining > 0) {
      this.recoveryRemaining = Math.max(0,this.recoveryRemaining-delta);
      controls.reset();
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
      Phaser.Input.Keyboard.JustDown(this.keys.UP);
      if (this.recoveryRemaining === 0) this.respawn();
      return;
    }
    const pit = s.interruptions.find(p => body.center.x >= p.start && body.center.x < p.start+p.width);
    if ((pit && body.bottom > groundYAt(pit.start-1)+3) || body.bottom > 650) {
      this.beginFall(); return;
    }
    const grounded = body.blocked.down && body.velocity.y >= 0;
    const jumpVelocity = this.exhausted ? s.tiredJumpVelocity : s.jumpVelocity;
    if (grounded) { this.lastGround = now; body.maxVelocity.y = 700; }
    // Прочитать все запросы, чтобы JustDown не оставался от предыдущего кадра.
    const space = Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const up = Phaser.Input.Keyboard.JustDown(this.keys.UP);
    const touch = controls.consumeJump();
    const jumpRequested = space || up || touch;
    if (jumpRequested) this.bufferedJump = now;
    if (this.restRemaining > 0) {
      this.restRemaining = Math.max(0, this.restRemaining - delta);
      this.tanya.setVelocity(0, 0);
      this.bufferedJump = -Infinity;
      this.changeEnergy(s.benchEnergyPerSecond * dt);
      if (this.restRemaining === 0) {
        this.tanya.setTexture('tanya');
        body.allowGravity = true;
        body.reset(this.tanya.x, groundYAt(this.tanya.x) - 26);
        message('Отдохнули — побежали!', 1200);
      }
    } else {
      if (grounded) this.airborneSpeed = this.exhausted ? s.tiredSpeed : s.speed;
      this.changeEnergy(-s.energyDrainPerSecond * dt);
      // Fatigue/recovery changes the next grounded stride, not a jump that was
      // already committed. This keeps food-guided arcs predictable at energy 0.
      this.tanya.setVelocityX(now < this.slowUntil ? s.scooterSlowSpeed : this.airborneSpeed).setFlipX(false);
    }
    if (this.restRemaining === 0 && now - this.bufferedJump <= s.jumpBufferMs && now - this.lastGround <= s.coyoteMs) {
      this.tanya.setVelocityY(-jumpVelocity);
      this.jumpStartedAt = now;
      this.takeoffFloor = body.bottom;
      this.takeoffTired = jumpVelocity === s.tiredJumpVelocity;
      this.boostUsed = false;
      this.bufferedJump = this.lastGround = -Infinity;
    } else if (this.restRemaining === 0 && jumpRequested && !grounded && !this.boostUsed &&
      now - this.jumpStartedAt >= s.boostMinMs && now - this.jumpStartedAt <= s.boostWindowMs && body.velocity.y < 0) {
      // A single early continuation of THIS takeoff, never an arbitrary air jump.
      // Target a fixed apex relative to takeoff so different early tap timings
      // do not produce radically different heights. Fatigue is committed at takeoff.
      const height = this.takeoffTired ? s.tiredBoostHeight : s.boostHeight;
      const rise = this.takeoffFloor - body.bottom;
      body.maxVelocity.y = 900;
      this.tanya.setVelocityY(-Math.sqrt(Math.max(0, 2 * s.gravity * (height - rise))));
      this.airborneSpeed = this.takeoffTired ? s.tiredBoostSpeed : s.boostSpeed;
      this.tanya.setVelocityX(this.airborneSpeed);
      this.boostUsed = true;
      this.boostsUsed++;
      this.bufferedJump = -Infinity;
    }
    this.tanya.setAlpha(now < this.hitUntil ? (Math.floor(now / 100) % 2 ? .45 : 1) : 1);
    // Keep the trolley silhouette stable when the patrol reverses: flipping
    // it would instantly move the head hitbox across a jump already in progress.
    for (const granny of this.grannies) {
      if (granny.sprite.x >= granny.right) granny.sprite.setVelocityX(-s.grannySpeed);
      if (granny.sprite.x <= granny.left) granny.sprite.setVelocityX(s.grannySpeed);
    }
    this.updateNewObjects(dt);
    if (grounded && Math.abs(body.bottom - groundYAt(body.center.x)) < 1) {
      for (const cp of s.recoveryAnchors) if (body.center.x >= cp) this.checkpoint = Math.max(this.checkpoint, cp);
    }

    if (this.tanya.x < 16) this.tanya.x = 16;
    const camera = this.cameras.main;
    const framing = this.framing!;
    const viewWidth = camera.width / camera.zoom;
    const target = Phaser.Math.Clamp(this.tanya.x - viewWidth * framing.anchorX, 0, Math.max(0, s.levelWidth - viewWidth));
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, target, 1 - Math.exp(-dt * framing.followX));
    // Небольшое вертикальное смещение сохраняет нижнюю страховочную дорожку в кадре.
    const targetY = framing.baseY + Phaser.Math.Clamp((this.tanya.y - (s.floorY - 24)) * .22, -40, 0);
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
  private resolveTerrainContacts() {
    if (!this.tanya) return;
    const actors = [this.tanya,...this.grannies.map(g=>g.sprite),...this.scooters.map(g=>g.sprite)];
    for(const actor of actors) {
      const body=actor.body as Phaser.Physics.Arcade.Body;
      if(!body.enable || !body.allowGravity || body.velocity.y<0)continue;
      const x=body.center.x, previousX=body.prev.x+body.halfWidth;
      const span=s.groundSpans.find(g=>x>=g.start&&x<g.end);
      if(!span)continue;
      const surface=groundYAt(x),previousSurface=groundYAt(previousX);
      const previousBottom=body.prev.y+body.height;
      const followsRamp=span.endY!==undefined && Math.abs(previousBottom-previousSurface)<3;
      // Never lift a side-on body onto a tall ledge. Swept landing must start
      // above this surface, or follow an already-supported continuous incline.
      if((previousBottom<=surface+.5 || followsRamp) &&
         (body.bottom>=surface || followsRamp)) {
        body.y=surface-body.height; body.updateCenter();
        body.velocity.y=0; body.blocked.down=body.touching.down=true;
      }
    }
  }
  private beginFall() {
    if(this.finished || this.recoveryRemaining>0)return;
    this.falls++;
    this.recoveryRemaining=s.recoveryDelayMs;
    const body=this.tanya.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0,0); body.enable=false; this.tanya.setAlpha(.45);
    this.lastGround=this.bufferedJump=this.jumpStartedAt=-Infinity;
    controls.reset(); message('Ой, яма! Возвращаемся…',s.recoveryDelayMs);
  }
  private respawn() {
    const body=this.tanya.body as Phaser.Physics.Arcade.Body;
    body.enable=true; body.allowGravity=true;
    this.tanya.setTexture('tanya').setAlpha(1);
    const floor=groundYAt(this.checkpoint);
    body.reset(this.checkpoint,floor-26);
    // Arcade reset() starts at the texture top-left and omits the body offset.
    // Synchronize the collider and all previous positions before resuming.
    body.position.set(this.checkpoint-body.halfWidth,floor-body.height);
    body.prev.copy(body.position); body.prevFrame.copy(body.position);
    body.updateCenter();
    body.blocked.down=body.touching.down=true;
    body.setMaxVelocity(500,700); body.setVelocity(0,0);
    this.airborneSpeed=this.exhausted?s.tiredSpeed:s.speed;
    body.setVelocityX(this.airborneSpeed);
    this.slowUntil=0; this.hitUntil=this.time.now+800;
    this.lastGround=this.bufferedJump=this.jumpStartedAt=-Infinity;
    this.boostUsed=true; this.restRemaining=this.recoveryRemaining=0;
    this.tanya.setTexture('tanya').setAlpha(1);
    this.recoveries++; controls.reset();
    const camera=this.cameras.main,f=this.framing!;
    camera.scrollX=Phaser.Math.Clamp(this.checkpoint-camera.width/camera.zoom*f.anchorX,0,s.levelWidth-camera.width/camera.zoom);
    camera.scrollY=f.baseY+Phaser.Math.Clamp((this.tanya.y-(s.floorY-24))*.22,-40,0);
    message('Снова бежим!',900);
  }
  private feedCat() {
    const success = this.foodCount >= s.requiredFood;
    const feast = this.foodCount >= s.bonusFood;
    element('#end-title').textContent = feast ? 'Кошачий пир! 🐈🎉' : success ? 'Котик накормлен ❤️' : 'Котику не хватило корма';
    element('#end-description').textContent = feast
      ? `Корм: ${this.foodCount}. Котик поел и заказал добавку. Таня открыла кошачий ресторан!`
      : success ? `Корм: ${this.foodCount}. Котик сыт. Таня справилась! Для кошачьего пира нужно ${s.bonusFood} пакетиков.`
      : `Корм: ${this.foodCount}. Котику нужно: ${s.requiredFood}. Не хватило ${s.requiredFood - this.foodCount} пакетиков. Попробуй ещё раз и следуй за кормом.`;
    element('.cat-icon').textContent = feast ? '🐈🍽️🎉' : success ? '🐈❤️' : '🐈';
    this.finished = true;
    this.tanya.setVelocity(0, 0).setAlpha(1).setFlipX(false);
    controls.reset();
    this.physics.pause();
    if (success) {
      this.add.rectangle(s.levelWidth - 195, groundYAt(s.levelWidth - 150) - 7, feast ? 48 : 22, 10, 0xe5b83d);
      if (feast) this.add.text(s.levelWidth - 170, groundYAt(s.levelWidth - 150) - 110, 'Мур! А добавка будет?', { fontSize: '22px', color: '#29483e' }).setOrigin(.5);
    }
    message(feast ? 'Кошачий пир! Кот требует звезду Мишлен.' : success ? 'Таня покормила котика' : 'Нужно ещё немного корма', 1800);
    this.time.delayedCall(1600, () => { ending.hidden = false; });
  }
  private updateHud() {
    element('#food-count').textContent = `Корм: ${this.foodCount}`;
    element('#food-needed').textContent = `Котику нужно: ${s.requiredFood}`;
    hudValue.textContent = `${Math.ceil(this.energy)}`;
    hudFill.style.width = `${this.energy}%`;
    hudFill.style.background = this.exhausted ? '#bd745b' : '#568968';
    energyTrack.setAttribute('aria-valuenow', `${Math.ceil(this.energy)}`);
  }
  private createNewObjects(ground: Phaser.Physics.Arcade.StaticGroup) {
    const food = this.physics.add.staticGroup();
    for (const point of s.food) food.create(point.x, point.y, 'food');
    this.physics.add.overlap(this.tanya, food, (_player, item) => {
      if (this.finished || this.recoveryRemaining > 0) return;
      const packet = item as Phaser.Physics.Arcade.Sprite;
      const label = this.add.text(packet.x, packet.y - 25, '+1 корм', { fontSize: '18px', color: '#326544' }).setOrigin(.5);
      packet.destroy();
      this.foodCount++;
      this.tweens.add({ targets: label, y: label.y - 40, alpha: 0, duration: 750, onComplete: () => label.destroy() });
      this.updateHud();
    });
    for (const {x,launchAt,left,right} of s.scooters) {
      const sprite = this.physics.add.sprite(x, groundYAt(x) - 28, 'scooter');
      this.physics.add.collider(sprite, ground);
      this.scooters.push({ sprite, spawnX: x, launchAt, left, right, launched: false });
    }
    for (const point of s.pigeons) {
      const sprite = this.physics.add.sprite(point.x, point.y - 16, 'pigeons');
      (sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      const flock = { sprite, flying: false, lowFlightRemaining: 0, perchY: point.y };
      this.pigeons.push(flock);
    }
    const benches = this.physics.add.staticGroup();
    for (const x of s.benches) {
      const bench = benches.create(x, groundYAt(x) - 22, 'bench') as Phaser.Physics.Arcade.Sprite;
      // Rest is activated by the visibly marked seat, not the whole 90px prop.
      this.benchSprites.push(bench);
      bench.setSize(24, 32).setOffset(33, 12);
      this.add.rectangle(x, groundYAt(x) - 24, 24, 5, 0xe5b83d);
    }
    this.physics.add.overlap(this.tanya, benches, (_player, item) => {
      const bench = item as Phaser.Physics.Arcade.Sprite;
      const body = this.tanya.body as Phaser.Physics.Arcade.Body;
      if (this.finished || this.recoveryRemaining > 0 || this.restRemaining > 0 || bench.getData('used') || this.energy >= s.benchEnergyThreshold || body.velocity.y < 0 || !(body.blocked.down && Math.abs(body.bottom - groundYAt(this.tanya.x)) < 3)) return;
      bench.setData('used', true);
      this.benchUses++;
      this.restRemaining = s.benchDurationMs;
      body.reset(bench.x, groundYAt(bench.x) - 26);
      this.tanya.setVelocity(0, 0).setTexture('tanya-sitting');
      body.allowGravity = false;
      controls.reset();
      message('Отдыхаем на лавочке', s.benchDurationMs);
    });
  }
  private updateNewObjects(dt: number) {
    for (const scooter of this.scooters) {
      const body=scooter.sprite.body as Phaser.Physics.Arcade.Body;
      if(!body.enable)continue;
      // Retire after passing Tanya, before a wall, pit or terrain join.
      // A disabled invisible scooter cannot remain as a hidden hazard.
      if(scooter.launched && (body.center.x<=scooter.left || body.blocked.left || body.blocked.right)) {
        body.stop(); body.enable=false; scooter.sprite.setVisible(false); continue;
      }
      if (!scooter.launched && this.tanya.x >= scooter.launchAt) {
        scooter.launched = true;
        scooter.sprite.setVelocityX(-s.scooterSpeed);
      }
      if (scooter.sprite.x < 0) scooter.sprite.setVelocityX(0).setVisible(false);
    }
    for (const flock of this.pigeons) {
      if (!flock.flying && Math.abs(this.tanya.body!.bottom - flock.perchY) < 60 && Math.abs(flock.sprite.x - this.tanya.x) < s.pigeonTriggerDistance) {
        flock.flying = true;
        flock.lowFlightRemaining = .75;
        // Сначала вспархивают низко: без прыжка можно задеть стаю.
        flock.sprite.setVelocity(-60, -45);
      }
      if (flock.flying) {
        flock.lowFlightRemaining = Math.max(0, flock.lowFlightRemaining - dt);
        if (flock.lowFlightRemaining === 0) {
          flock.sprite.setVelocity(-90, -260);
        }
      }
    }
    const player = this.tanya.body as Phaser.Physics.Arcade.Body;
    for (const granny of this.grannies) {
      if (touchesDanger(player, granny.sprite, 'granny')) this.hit(s.grannyDamage);
    }
    for (const scooter of this.scooters) {
      if (scooter.sprite.body!.enable && touchesDanger(player, scooter.sprite, 'scooter') && this.hit(s.scooterDamage)) {
        this.slowUntil = this.time.now + s.scooterSlowMs;
        this.cameras.main.shake(90, .002);
      }
    }
    for (const flock of this.pigeons) {
      // Visible birds remain dangerous while flying. No invisible rectangular
      // flock and no timer that silently turns still-visible birds harmless.
      if (touchesDanger(player, flock.sprite, 'pigeons') && this.hit(s.pigeonDamage)) {
        this.cameras.main.shake(160, .004);
      }
    }
  }
  private resize() {
    const previousBase = this.framing?.baseY ?? 0;
    this.framing = cameraFrame(this.scale.width, this.scale.height, s.viewHeight, s.floorY);
    this.cameras.main.setOrigin(0, 0);
    this.cameras.main.setZoom(this.framing.zoom);
    this.cameras.main.scrollY = this.framing.baseY + Phaser.Math.Clamp(this.cameras.main.scrollY - previousBase, -40, 0);
    controls?.reset();
  }
  private sign(x: number, text: string) {
    this.add.rectangle(x, groundYAt(x) - 30, 4, 60, 0x788c7b);
    this.add.text(x, groundYAt(x) - 70, text, { fontSize: '17px', color: '#3c594b', backgroundColor: '#eef3df', padding: { x: 10, y: 7 } }).setOrigin(.5);
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
