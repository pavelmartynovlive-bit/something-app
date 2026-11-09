import Phaser from 'phaser';
import manifest from '../art-assets/winter-npc-hud-pack/manifest.json';

type Kind = 'scooter' | 'granny' | 'pigeons';
type Flock = { readonly flying: boolean; readonly lowFlightRemaining: number };
const assets = manifest.assets.filter(a => !a.name.startsWith('hud-'));
const key = (name: string) => `npc:${name}`;
const density = 3, size = 256, rootX = 128, footY = 240;

/** Artwork follows the existing invisible physics proxies; never resizes them. */
export class NpcVisual {
  static attach(scene: Phaser.Scene, carrier: Phaser.Physics.Arcade.Sprite, kind: Kind, flock?: Flock) {
    return new NpcVisual(scene, carrier, kind, flock);
  }
  static preload(scene: Phaser.Scene) {
    for (const asset of assets) if (!scene.textures.exists(key(asset.name))) {
      scene.load.image(`${key(asset.name)}:source`, `${import.meta.env.BASE_URL}assets/npcs/${asset.file}`);
    }
  }
  static prepare(scene: Phaser.Scene) {
    for (const asset of assets) {
      if (scene.textures.exists(key(asset.name))) continue;
      const sourceKey = `${key(asset.name)}:source`;
      const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
      const [x, y, right, bottom] = asset.alphaBounds128;
      const bird = asset.name.startsWith('pigeon-');
      const scale = bird ? 26 * density / 909 : 76 * density / (bottom - y);
      const texture = scene.textures.createCanvas(key(asset.name), size, size)!;
      const ctx = texture.getContext(); ctx.imageSmoothingQuality = 'high';
      // Shared pigeon root preserves body scale through all four poses.
      ctx.drawImage(source, x, y, right - x, bottom - y,
        bird ? rootX + (x - 768) * scale : rootX - (right - x) * scale / 2,
        bird ? footY + (y - 977) * scale : footY - (bottom - y) * scale,
        (right - x) * scale, (bottom - y) * scale);
      texture.refresh();
      // Keep only the small prepared frame on mobile GPUs, not full-size PNGs.
      scene.textures.remove(sourceKey);
    }
  }

  readonly images: Phaser.GameObjects.Image[];
  state = '';
  private readonly alpha: number;
  constructor(private scene: Phaser.Scene, private carrier: Phaser.Physics.Arcade.Sprite,
    private kind: Kind, private flock?: Flock) {
    this.alpha = carrier.alpha;
    carrier.setAlpha(0);
    const name = kind === 'scooter' ? 'scooter-rider' : kind === 'granny' ? 'grandma-stroller' : 'pigeon-standing';
    this.images = Array.from({ length: kind === 'pigeons' ? 3 : 1 }, () =>
      scene.add.image(0, 0, key(name)).setOrigin(rootX / size, footY / size)
        .setScale(1 / density).setDepth(8).setData('npcVisual', kind));
    scene.events.on(Phaser.Scenes.Events.PRE_RENDER, this.sync, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.sync();
  }
  sync() {
    const body = this.carrier.body as Phaser.Physics.Arcade.Body | null;
    const visible = this.carrier.active && this.carrier.visible && !!body?.enable;
    const left = body ? body.x - body.offset.x : this.carrier.x - this.carrier.width / 2;
    const top = body ? body.y - body.offset.y : this.carrier.y - this.carrier.height / 2;
    for (const [i, image] of this.images.entries()) {
      image.setVisible(visible);
      if (!visible) continue;
      if (this.kind === 'pigeons') {
        const phase = Math.floor(this.scene.time.now / 230 + i) % 2;
        this.state = !this.flock?.flying ? (phase ? 'walking' : 'standing')
          : this.flock.lowFlightRemaining > .55 ? 'startled' : phase ? 'takeoff' : 'startled';
        image.setTexture(key(`pigeon-${this.state}`));
        image.setFlipX(!!this.flock?.flying);
        image.setPosition(left + [10, 32, 54][i], top + 32);
      } else {
        this.state = this.kind;
        // Mirror only the courier's artwork, never the physics proxy. Grandma's
        // stroller stays on the authored side during its short patrol reversals.
        image.setFlipX(this.kind === 'scooter' && (body?.velocity.x ?? 0) < 0);
        image.setPosition(left + this.carrier.width / 2, top + 56);
      }
    }
  }
  private destroy() {
    this.scene.events.off(Phaser.Scenes.Events.PRE_RENDER, this.sync, this);
    if (this.carrier.active) this.carrier.setAlpha(this.alpha);
    for (const image of this.images) image.destroy();
  }
}
