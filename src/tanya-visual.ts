import Phaser from 'phaser';

export type TanyaVisualState = 'run' | 'jump' | 'fall' | 'tired' | 'rest';
export type TanyaVisualContext = { resting: boolean; tired: boolean; recovering: boolean };

// Static simplified production sprite, not a sprite sheet. Frame coordinates
// trim transparent padding and center the two boot soles around the anchor.
export const tanyaArt = {
  key: 'tanya:stand', file: 'assets/characters/tanya/tanya-stand.png',
  sourceWidth: 1024, sourceHeight: 1536,
  frame: { x: 132, y: 76, width: 779, height: 1412 },
  renderedHeight: 78.0208, rasterHeight: 248, rasterWidth: 138,
  displayKey: 'tanya:stand-display',
};
type TanyaPose = { key: string; frame: string; renderedHeight: number };
const stand: TanyaPose = { key: tanyaArt.displayKey, frame: '__BASE', renderedHeight: tanyaArt.renderedHeight };
// Replace individual entries with real textures/animations later. Movement and
// collision never depend on the active visual state or texture dimensions.
const stateArt: Record<TanyaVisualState, TanyaPose | null> = {
  run: stand, jump: stand, fall: stand, tired: stand,
  rest: null, // Missing production asset: tanya-rest. Do not deform a standing pose.
};

export class TanyaVisual {
  static preload(scene: Phaser.Scene) {
    if (!scene.textures.exists(tanyaArt.key)) {
      scene.load.image(tanyaArt.key, `${import.meta.env.BASE_URL}${tanyaArt.file}`);
    }
  }

  readonly sprite: Phaser.GameObjects.Image;
  readonly footShadow: Phaser.GameObjects.Ellipse;
  readonly contactShadow: Phaser.GameObjects.Ellipse;
  state: TanyaVisualState = 'run';

  constructor(
    private scene: Phaser.Scene,
    private carrier: Phaser.Physics.Arcade.Sprite,
    private context: () => TanyaVisualContext,
  ) {
    if (!scene.textures.exists(tanyaArt.displayKey)) {
      const source = scene.textures.get(tanyaArt.key).getSourceImage() as HTMLImageElement;
      const f = tanyaArt.frame, rate = Math.min(tanyaArt.rasterHeight / f.height, tanyaArt.rasterWidth / f.width);
      const texture = scene.textures.createCanvas(tanyaArt.displayKey, tanyaArt.rasterWidth, tanyaArt.rasterHeight)!;
      const ctx = texture.getContext();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      // Uniform resampling, with symmetric transparent padding. Source art is
      // unchanged; small sprites avoid noisy direct 22:1 GPU minification.
      ctx.drawImage(source, f.x, f.y, f.width, f.height,
        (tanyaArt.rasterWidth - f.width * rate) / 2, tanyaArt.rasterHeight - f.height * rate, f.width * rate, f.height * rate);
      texture.refresh();
    }
    // Contact shadow only: no physics and no floating shadow during jumps/falls.
    this.footShadow = scene.add.ellipse(0, 0, 30.8, 5.5, 0x36465b)
      .setData('tanyaFootShadow', true);
    this.contactShadow = scene.add.ellipse(0, 0, 19.8, 2.2, 0x2c394b)
      .setData('tanyaContactShadow', true);
    this.sprite = scene.add.image(0, 0, stand.key, stand.frame)
      .setOrigin(.5, 1).setScale(tanyaArt.renderedHeight / tanyaArt.rasterHeight).setFlipX(false);
    this.sprite.setData('tanyaVisual', true);
    // Arcade synchronizes its carrier in POST_UPDATE before this listener.
    // Read the current body, never an earlier Scene.update sprite position.
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.sync, this);
    scene.events.on(Phaser.Scenes.Events.PRE_RENDER, this.sync, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.sync();
  }

  private sync() {
    if (!this.carrier.body) return;
    const body = this.carrier.body as Phaser.Physics.Arcade.Body;
    const c = this.context();
    const grounded = body.blocked.down && body.velocity.y >= 0;
    this.state = c.resting ? 'rest' : c.recovering ? 'fall'
      : !grounded ? (body.velocity.y < 0 ? 'jump' : 'fall')
      : c.tired ? 'tired' : 'run';
    const art = stateArt[this.state];
    if (art && (this.sprite.texture.key !== art.key || this.sprite.frame.name !== art.frame)) {
      this.sprite.setTexture(art.key, art.frame).setScale(art.renderedHeight / this.sprite.height);
    }
    this.footShadow.setPosition(body.center.x, body.bottom - .5)
      .setDepth(this.carrier.depth - .1).setAlpha(.14 * this.carrier.alpha)
      .setVisible(this.carrier.active && grounded && !c.recovering && art !== null);
    this.contactShadow.setPosition(body.center.x, body.bottom - .2)
      .setDepth(this.carrier.depth - .05).setAlpha(.18 * this.carrier.alpha)
      .setVisible(this.footShadow.visible);
    this.sprite.setPosition(body.center.x, body.bottom)
      .setDepth(this.carrier.depth).setAlpha(this.carrier.alpha)
      .setVisible(this.carrier.active && art !== null);
  }

  private destroy() {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.sync, this);
    this.scene.events.off(Phaser.Scenes.Events.PRE_RENDER, this.sync, this);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.sprite.destroy();
    this.footShadow.destroy();
    this.contactShadow.destroy();
  }
}
