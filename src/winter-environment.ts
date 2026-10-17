import Phaser from 'phaser';
import { settings as s, groundYAt } from './settings';
import { environmentAssets } from './winter-environment-assets';

type Art = typeof environmentAssets[number]['file'];
const depth = { scenery: -30, terrain: 0, prop: 2, debug: 100 };
const resolution = 2;
const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return c;
};

// Presentation adapter. Reads existing surfaces; never creates or edits a body.
export class WinterEnvironment {
  // Replays reuse the fixed level's baked artwork. TextureManager owns it until
  // game destruction; scene shutdown removes only the displayed instances.
  private static baked = new WeakMap<Phaser.Textures.TextureManager,
    { key: string; x: number; y: number; z: number }[]>();
  static preload(scene: Phaser.Scene) {
    for (const { file } of environmentAssets) {
      // No current four-step staircase matches this sprite's silhouette.
      if (['stairs_winter.png', 'streetlamp_winter.png', 'hazard_slush.png'].includes(file)) continue;
      const key = `environment:${file}`;
      if (!scene.textures.exists(key)) scene.load.image(key, `${import.meta.env.BASE_URL}assets/environment/winter/${file}`);
    }
  }

  private objects: Phaser.GameObjects.GameObject[] = [];
  private bakedEntries: { key: string; x: number; y: number; z: number }[] = [];
  private pixels = new Map<Art, ImageData>();
  private debug?: Phaser.GameObjects.Graphics;
  private benchArt: { trigger: Phaser.Physics.Arcade.Sprite; image: Phaser.GameObjects.Image }[] = [];

  constructor(private scene: Phaser.Scene, private foundation: number) {
    const cached = WinterEnvironment.baked.get(scene.textures);
    if (cached) {
      for (const { key, x, y, z } of cached) this.display(key, x, y, z);
      this.finishCreate();
      return;
    }
    const wall = this.wallPattern('ground_snow_basic.png', [80, 550, 1600, 240], 220, 34);
    const cliff = this.wallPattern('cliff_tall.png', [170, 580, 680, 780], 135, 150);
    const snow = this.snow('ground_snow_basic.png', 220, 20, .04, .96);
    const cliffSnow = this.snow('cliff_tall.png', 135, 20, .1, .9);
    const slopeSnow = this.snow('slope_snow.png', 210, 20, .04, .96);
    const pitSnow = this.snow('pit_edge.png', 96, 20, .02, .76);
    for (const span of s.groundSpans) {
      const minY = Math.min(span.y, span.endY ?? span.y);
      const w = span.end - span.start, h = foundation - minY;
      const c = canvas(w * resolution, h * resolution), ctx = c.getContext('2d')!;
      ctx.scale(resolution, resolution);
      const pit = s.interruptions.find(p => p.start === span.start);
      const high = minY <= 310;
      ctx.beginPath(); ctx.moveTo(0, span.y - minY); ctx.lineTo(w, (span.endY ?? span.y) - minY);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#9298a8'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ctx.createPattern(high ? cliff : wall, 'repeat')!;
      ctx.fillRect(0, 0, w, h);
      if (!pit) {
        const cap = span.endY !== undefined ? slopeSnow : high ? cliffSnow : snow;
        // Sample the art in narrow columns along the SAME analytic surface.
        // The snow never bulges above a collider or bridges an interruption.
        for (let x = 0; x < w; x += .5) {
          const y = span.y + ((span.endY ?? span.y) - span.y) * x / w - minY;
          const atLeftPit = x < 24 && s.interruptions.some(p => p.start + p.width === span.start);
          const atRightPit = x > w - 24 && s.interruptions.some(p => p.start === span.end);
          const tile = atLeftPit || atRightPit ? pitSnow : cap;
          const tx = atLeftPit ? tile.width - 1 - Math.floor(x % tile.width) : Math.floor(x % tile.width);
          ctx.drawImage(tile, tx, 0, 1, tile.height, x, y, .5, 20);
        }
      }
      this.image(c, `ground:${span.start}`, span.start, minY, depth.terrain);
      if (pit) this.slush(pit.start, pit.width, span.y);
    }
    for (const p of s.routePlatforms) {
      const file = p.width <= 100 ? 'platform_floating_small.png' : 'platform_short.png';
      const height = Math.max(30, Math.round(p.width * .32));
      const c = canvas(p.width * resolution, height * resolution), ctx = c.getContext('2d')!;
      const source = this.source(file), [x0, , x1, y1] = this.bounds(file);
      // Keep the full stone and icicle silhouette instead of compressing it
      // into the 12px physics proxy. Only the top is collidable (one-way).
      const sample = canvas(source.width, source.height), sampleCtx = sample.getContext('2d')!;
      sampleCtx.drawImage(source, 0, 0);
      const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
      for (let x = 0; x < c.width; x++) {
        const sx = Math.min(x1 - 1, Math.floor(x0 + (x1 - x0) * x / c.width));
        let top = 0;
        while (top < y1 - 1 && pixels[(top * source.width + sx) * 4 + 3] < 128) top++;
        ctx.drawImage(source, sx, top, 1, y1 - top, x, 0, 1, c.height);
      }
      // Solid terrain clips the decorative underside at the closest low ledge;
      // it must never paint over a real lower-route surface.
      this.image(c, `platform:${p.x}`, p.x, p.y, depth.terrain - .5);
    }
    WinterEnvironment.baked.set(scene.textures, this.bakedEntries);
    this.finishCreate();
  }

  private finishCreate() {
    this.decorations();
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('debugEnvironment')) this.enableDebug();
    this.scene.events.on(Phaser.Scenes.Events.PRE_RENDER, this.beforeRender, this);
  }

  private source(file: Art) { return this.scene.textures.get(`environment:${file}`).getSourceImage() as HTMLImageElement; }
  private bounds(file: Art) { return environmentAssets.find(a => a.file === file)!.contentBoundsAlpha128; }

  private snow(file: Art, width: number, height: number, from: number, to: number) {
    const source = this.source(file), [bx, , ex] = this.bounds(file);
    let data = this.pixels.get(file);
    if (!data) {
      const c = canvas(source.width, source.height), ctx = c.getContext('2d')!;
      ctx.drawImage(source, 0, 0); data = ctx.getImageData(0, 0, c.width, c.height); this.pixels.set(file, data);
    }
    const c = canvas(width, height), ctx = c.getContext('2d')!;
    ctx.fillStyle = '#eff5ff'; ctx.fillRect(0, 0, width, height);
    for (let x = 0; x < width; x++) {
      const sx = Math.min(ex - 1, Math.floor(bx + (ex - bx) * (from + (to - from) * x / width)));
      let sy = 0;
      while (sy < source.height - 1 && data.data[(sy * source.width + sx) * 4 + 3] < 128) sy++;
      const sampleHeight = file === 'slope_snow.png' ? 150 : Math.min(190, source.height - sy);
      ctx.drawImage(source, sx, sy, 1, sampleHeight, x, 0, 1, height);
    }
    // Mirrored adjacency joins identical edge pixels without stretching a module.
    const repeat = canvas(c.width * 2, c.height), r = repeat.getContext('2d')!;
    r.drawImage(c, 0, 0); r.translate(repeat.width, 0); r.scale(-1, 1); r.drawImage(c, 0, 0);
    return repeat;
  }

  private wallPattern(file: Art, crop: [number, number, number, number], width: number, height: number) {
    const tile = canvas(width * 2, height * 2), ctx = tile.getContext('2d')!;
    for (const x of [0, 1]) for (const y of [0, 1]) {
      ctx.save(); ctx.translate(x ? width * 2 : 0, y ? height * 2 : 0); ctx.scale(x ? -1 : 1, y ? -1 : 1);
      ctx.drawImage(this.source(file), ...crop, 0, 0, width, height); ctx.restore();
    }
    return tile;
  }

  private slush(x: number, width: number, y: number) {
    const file = 'pit_rubbish_winter.png', [x0, y0, x1, y1] = this.bounds(file);
    const height = 30;
    const c = canvas(width * resolution, height * resolution), ctx = c.getContext('2d')!;
    ctx.scale(resolution, resolution);
    const moduleWidth = 180;
    for (let dx = 0; dx < width; dx += moduleWidth) {
      const w = Math.min(moduleWidth, width - dx);
      ctx.drawImage(this.source(file), x0, y0, (x1 - x0) * w / moduleWidth, y1 - y0, dx, 0, w, height);
    }
    this.image(c, `slush:${x}`, x, y - height + 9, 1);
  }

  private image(c: HTMLCanvasElement, name: string, x: number, y: number, z: number) {
    const key = `winter-art:${name}`;
    this.scene.textures.addCanvas(key, c);
    this.bakedEntries.push({ key, x, y, z });
    return this.display(key, x, y, z);
  }

  private display(key: string, x: number, y: number, z: number) {
    const image = this.scene.add.image(x, y, key).setOrigin(0).setScale(1 / resolution).setDepth(z);
    image.setData('environmentVisual', true); this.objects.push(image); return image;
  }

  private prop(file: Art, x: number, bottom: number, width: number, z: number) {
    const [x0, y0, x1, y1] = this.bounds(file);
    const key = `winter-crop:${file}`;
    if (!this.scene.textures.get(`environment:${file}`).has(key)) this.scene.textures.get(`environment:${file}`).add(key, 0, x0, y0, x1 - x0, y1 - y0);
    const image = this.scene.add.image(x, bottom, `environment:${file}`, key).setOrigin(.5, 1).setScale(width / (x1 - x0)).setDepth(z);
    image.setData('environmentVisual', true); this.objects.push(image); return image;
  }

  private decorations() {
    // Presentation placements only; all props sit behind the playable lane.
    for (const x of [160, 10510]) this.prop('garage_winter.png', x, groundYAt(x) + 8, 160, depth.scenery).setTint(0xc3d0de);
    for (const x of [650, 1640, 5090, 7000, 8660]) this.prop('railing_winter.png', x, groundYAt(x) + 3, 105, depth.scenery + 2).setTint(0xc7d5e3);
  }

  attachBench(trigger: Phaser.Physics.Arcade.Sprite) {
    // Keep its 90x44 physics proxy and trigger offset exactly as before.
    trigger.setVisible(false);
    const image = this.prop('bench_winter.png', trigger.x, groundYAt(trigger.x), 90, depth.prop);
    this.benchArt.push({ trigger, image });
  }

  private beforeRender() {
    for (const { trigger, image } of this.benchArt) image.setVisible(trigger.active);
    if (this.debug) this.drawDebug();
  }

  private enableDebug() {
    this.debug = this.scene.add.graphics().setDepth(depth.debug).setData('environmentDebug', true);
    this.objects.push(this.debug);
    this.objects.push(this.scene.add.text(6, 100,
      'DEV: cyan = bodies / safe anchors\ngreen = surfaces; pink = pits',
      { fontSize: '10px', color: '#f5ffff', backgroundColor: '#203b50' })
      .setDepth(depth.debug).setScrollFactor(0));
  }

  private drawDebug() {
    const g = this.debug!; g.clear();
    g.lineStyle(1, 0x00ddff, .9);
    for (const body of [...this.scene.physics.world.bodies.entries, ...this.scene.physics.world.staticBodies.entries]) {
      if (body.enable) g.strokeRect(body.x, body.y, body.width, body.height);
    }
    g.lineStyle(2, 0x34ed72, 1);
    for (const span of s.groundSpans) g.lineBetween(span.start, span.y, span.end, span.endY ?? span.y);
    for (const p of s.routePlatforms) g.lineBetween(p.x, p.y, p.x + p.width, p.y);
    for (const p of s.interruptions) {
      const top = groundYAt(p.start - 1); g.fillStyle(0xeb4c6b, .18).fillRect(p.start, top, p.width, groundYAt(p.start) - top);
    }
    for (const x of s.recoveryAnchors) {
      const y = groundYAt(x); g.fillStyle(0x31d9ce, .18).fillRect(x - 12, y - 50, 24, 50);
      g.lineStyle(2, 0x31d9ce); g.lineBetween(x, y, x, y - 65); g.lineBetween(x, y - 65, x + 14, y - 57);
    }
  }

  destroy() {
    this.scene.events.off(Phaser.Scenes.Events.PRE_RENDER, this.beforeRender, this);
    for (const object of this.objects) object.destroy();
    this.pixels.clear();
  }
}
