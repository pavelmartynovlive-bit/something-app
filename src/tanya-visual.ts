import Phaser from 'phaser';
import { settings } from './settings';

export type TanyaVisualState = 'idle' | 'run' | 'jump-start' | 'jump' | 'fall' | 'land';
export type TanyaVisualContext = {
  readonly resting: boolean;
  readonly recovering: boolean;
  readonly energy: number;
};
type AnimationData = {
  frameSize: number; footX: number; footY: number; referenceHeight: number;
  frames: { name: string; rect: {x: number; y: number; w: number; h: number}; normalize: number; rootX: number; footY: number }[];
  animations: { key: string; frames: string[]; frameRate: number; repeat: number }[];
};

// Presentation sizes only. The invisible Arcade carrier remains40×56/body24×50.
export const tanyaArt = {
  key: 'tanya:animation-source', file: 'assets/characters/tanya/animations/tanya-animation-sheet.png',
  dataKey: 'tanya:animation-data', dataFile: 'assets/characters/tanya/animations/tanya-animation-data.json',
  sourceWidth: 1536, sourceHeight: 1024, frameSize: 192, footX: 96, footY: 172,
  renderedHeight: 78.0208, referenceHeight: 133, displayKey: 'tanya:animated-display',
};

export class TanyaVisual {
  static preload(scene: Phaser.Scene) {
    if (!scene.textures.exists(tanyaArt.key)) scene.load.image(tanyaArt.key, `${import.meta.env.BASE_URL}${tanyaArt.file}`);
    if (!scene.cache.json.exists(tanyaArt.dataKey)) scene.load.json(tanyaArt.dataKey, `${import.meta.env.BASE_URL}${tanyaArt.dataFile}`);
  }

  private static prepare(scene: Phaser.Scene) {
    const data = scene.cache.json.get(tanyaArt.dataKey) as AnimationData;
    if (!scene.textures.exists(tanyaArt.displayKey)) {
      const source = scene.textures.get(tanyaArt.key).getSourceImage() as HTMLImageElement;
      // One cached atlas for the entire game. Uniform resampling only: no new
      // drawing, procedural hair, frame-dependent display scale or collider.
      const texture = scene.textures.createCanvas(tanyaArt.displayKey, data.frameSize * 4, data.frameSize * 5)!;
      const ctx = texture.getContext();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      data.frames.forEach((f, i) => {
        const x = i % 4 * data.frameSize, y = Math.floor(i / 4) * data.frameSize, r = f.rect;
        ctx.drawImage(source, r.x, r.y, r.w, r.h,
          x + data.footX - f.rootX * f.normalize, y + data.footY - f.footY * f.normalize,
          r.w * f.normalize, r.h * f.normalize);
        texture.add(f.name, 0, x, y, data.frameSize, data.frameSize);
      });
      texture.refresh();
    }
    for (const a of data.animations) {
      if (!scene.anims.exists(a.key)) scene.anims.create({ key: a.key,
        frames: a.frames.map(frame => ({key: tanyaArt.displayKey, frame})), frameRate: a.frameRate, repeat: a.repeat });
    }
  }

  readonly sprite: Phaser.GameObjects.Sprite;
  readonly footShadow: Phaser.GameObjects.Ellipse;
  readonly contactShadow: Phaser.GameObjects.Ellipse;
  state: TanyaVisualState = 'idle';
  private initialized = false;
  private wasGrounded = false;
  private wasRecovering = false;
  private lastVelocityY = 0;
  private debugEnabled = false;
  private debugText?: Phaser.GameObjects.Text;
  private debugBody?: Phaser.GameObjects.Graphics;
  private nextDebugTextAt = 0;

  constructor(private scene: Phaser.Scene, private carrier: Phaser.Physics.Arcade.Sprite, private context: TanyaVisualContext) {
    TanyaVisual.prepare(scene);
    this.footShadow = scene.add.ellipse(0, 0, 30.8, 5.5, 0x36465b).setData('tanyaFootShadow', true);
    this.contactShadow = scene.add.ellipse(0, 0, 19.8, 2.2, 0x2c394b).setData('tanyaContactShadow', true);
    this.sprite = scene.add.sprite(0, 0, tanyaArt.displayKey, 'idle-01')
      .setOrigin(.5, tanyaArt.footY / tanyaArt.frameSize)
      .setScale(tanyaArt.renderedHeight / tanyaArt.referenceHeight).setFlipX(false)
      .setData('tanyaVisual', true);
    this.sprite.play('tanya-idle');
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.updateState, this);
    // Position/shadows only at PRE_RENDER: never advance state twice per frame.
    scene.events.on(Phaser.Scenes.Events.PRE_RENDER, this.sync, this);
    scene.input.keyboard?.on('keydown-F3', this.toggleDebug, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.setDebugEnabled(new URLSearchParams(location.search).get('debugCharacter') === '1');
    this.sync();
  }

  private updateState() {
    const body = this.carrier.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    const grounded = body.blocked.down && body.velocity.y >= 0;
    const recovering = this.context.recovering;
    let next: TanyaVisualState;
    if (recovering) next = 'fall';
    else if (this.context.resting) next = 'idle';
    else if (!grounded) {
      if (body.velocity.y < 0) {
        const takeoff = this.initialized && (this.wasGrounded || this.lastVelocityY >= 0) && !this.wasRecovering;
        next = takeoff || (this.state === 'jump-start' && this.sprite.anims.isPlaying) ? 'jump-start' : 'jump';
      } else next = 'fall';
    } else if (this.initialized && !this.wasGrounded && !this.wasRecovering) next = 'land';
    else if (this.state === 'land' && this.sprite.anims.isPlaying) next = 'land';
    else next = Math.abs(body.velocity.x) > 1 ? 'run' : 'idle';
    if (next !== this.state) {
      this.state = next;
      this.sprite.play(`tanya-${next}`);
    }
    // No separate tired art exists. Slow cadence follows actual horizontal speed.
    this.sprite.anims.timeScale = next === 'run'
      ? Phaser.Math.Clamp(Math.abs(body.velocity.x) / settings.speed, .35, 1.25) : 1;
    const paused = this.scene.physics.world.isPaused && Math.abs(body.velocity.x) > 1;
    if (paused && !this.sprite.anims.isPaused) this.sprite.anims.pause();
    else if (!paused && this.sprite.anims.isPaused) this.sprite.anims.resume();
    this.wasGrounded = grounded;
    this.wasRecovering = recovering;
    this.lastVelocityY = body.velocity.y;
    this.initialized = true;
    this.sync();
  }

  private sync() {
    if (!this.carrier.body) return;
    const body = this.carrier.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down && body.velocity.y >= 0;
    this.footShadow.setPosition(body.center.x, body.bottom - .5)
      .setDepth(this.carrier.depth - .1).setAlpha(.14 * this.carrier.alpha)
      .setVisible(this.carrier.active && grounded && !this.context.recovering);
    this.contactShadow.setPosition(body.center.x, body.bottom - .2)
      .setDepth(this.carrier.depth - .05).setAlpha(.18 * this.carrier.alpha).setVisible(this.footShadow.visible);
    this.sprite.setPosition(body.center.x, body.bottom).setDepth(this.carrier.depth)
      .setAlpha(this.carrier.alpha).setVisible(this.carrier.active);
    if (this.debugEnabled) this.drawDebug(body, grounded);
  }

  setDebugEnabled(enabled: boolean) {
    this.debugEnabled = enabled;
    if (enabled && !this.debugBody) {
      this.debugBody = this.scene.add.graphics().setDepth(1001);
      this.debugText = this.scene.add.text(0, 0, '', {fontSize: '12px', color: '#ffffff', backgroundColor: '#203344df', padding: {x: 6, y: 4}})
        .setScrollFactor(0).setDepth(1002);
    }
    this.debugBody?.setVisible(enabled); this.debugText?.setVisible(enabled);
    this.nextDebugTextAt = 0;
  }
  private toggleDebug() { this.setDebugEnabled(!this.debugEnabled); }
  private drawDebug(body: Phaser.Physics.Arcade.Body, grounded: boolean) {
    const zoom = this.scene.cameras.main.zoom;
    this.debugBody!.clear().lineStyle(1 / zoom, 0x13d894, 1).strokeRect(body.x, body.y, body.width, body.height);
    this.debugText!.setPosition(10 / zoom, 125 / zoom).setScale(1 / zoom);
    if (this.scene.time.now >= this.nextDebugTextAt) {
      this.debugText!.setText(`${this.sprite.anims.currentAnim?.key} / ${this.sprite.frame.name}\nvy ${body.velocity.y.toFixed(1)} · ${grounded ? 'grounded' : 'airborne'}\nenergy ${this.context.energy.toFixed(1)} · body ${body.width}×${body.height}`);
      this.nextDebugTextAt = this.scene.time.now + 100;
    }
  }
  private destroy() {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.updateState, this);
    this.scene.events.off(Phaser.Scenes.Events.PRE_RENDER, this.sync, this);
    this.scene.input.keyboard?.off('keydown-F3', this.toggleDebug, this);
    this.sprite.destroy(); this.footShadow.destroy(); this.contactShadow.destroy();
    this.debugText?.destroy(); this.debugBody?.destroy();
  }
}
