import Phaser from 'phaser';
import sources from './collectible-sources.json';

type Kind = 'food' | 'lipton';

// The normalized frames match the original textures exactly. Artwork must never
// determine pickup dimensions, placement, rewards or timing.
export const collectibleArt = {
  food: { sourceKey: 'collectible:food:source', displayKey: 'collectible:food:display', width: 36, height: 40 },
  lipton: { sourceKey: 'collectible:lipton:source', displayKey: 'collectible:lipton:display', width: 42, height: 52 },
} as const;

export class CollectibleVisual {
  static preload(scene: Phaser.Scene) {
    for (const kind of ['food', 'lipton'] as const) {
      const file = sources[kind] as string | null;
      const art = collectibleArt[kind];
      if (file && !scene.textures.exists(art.sourceKey)) {
        scene.load.image(art.sourceKey, `${import.meta.env.BASE_URL}assets/collectibles/${file}`);
      }
    }
  }

  static prepare(scene: Phaser.Scene) {
    for (const art of Object.values(collectibleArt)) {
      if (!scene.textures.exists(art.sourceKey) || scene.textures.exists(art.displayKey)) continue;
      const source = scene.textures.get(art.sourceKey).getSourceImage() as HTMLImageElement;
      const scratch = document.createElement('canvas');
      scratch.width = source.width; scratch.height = source.height;
      const scan = scratch.getContext('2d')!;
      scan.drawImage(source, 0, 0);
      const pixels = scan.getImageData(0, 0, scratch.width, scratch.height).data;
      let left = scratch.width, top = scratch.height, right = -1, bottom = -1;
      for (let y = 0; y < scratch.height; y++) for (let x = 0; x < scratch.width; x++) {
        if (pixels[(y * scratch.width + x) * 4 + 3] < 128) continue;
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      // An empty or failed source leaves the existing procedural art available.
      if (right < left) continue;
      const width = right - left + 1, height = bottom - top + 1;
      const scale = Math.min(art.width / width, art.height / height);
      const texture = scene.textures.createCanvas(art.displayKey, art.width, art.height)!;
      const context = texture.getContext();
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
      context.drawImage(source, left, top, width, height,
        (art.width - width * scale) / 2, (art.height - height * scale) / 2,
        width * scale, height * scale);
      texture.refresh();
    }
  }

  static apply(sprite: Phaser.Physics.Arcade.Sprite, kind: Kind) {
    const art = collectibleArt[kind];
    // Keep the public texture keys ('food', 'lipton') for existing replays and
    // level audits. Only the frame changes; the Arcade body stays untouched.
    if (sprite.scene.textures.exists(art.displayKey)) {
      const texture = sprite.scene.textures.get(kind);
      if (!texture.has('png')) {
        const source = sprite.scene.textures.get(art.displayKey).getSourceImage();
        const index = texture.source.length;
        texture.source.push(new Phaser.Textures.TextureSource(texture, source, art.width, art.height));
        const firstFrame = texture.firstFrame;
        texture.add('png', index, 0, 0, art.width, art.height);
        texture.firstFrame = firstFrame;
      }
      sprite.setFrame('png');
    }
  }
}
