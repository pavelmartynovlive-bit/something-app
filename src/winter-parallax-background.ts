import Phaser from 'phaser';

// Art composition only. No terrain, actor, collision or movement settings.
export const winterLayers = [
  { name: 'sky', factor: .01, alpha: 1, placement: 'cover' },
  { name: 'atmosphere', factor: .04, alpha: .6, placement: 'air' },
  { name: 'far-city', factor: .09, alpha: 1, placement: 'far' },
  { name: 'mid-city', factor: .16, alpha: .7, placement: 'mid' },
  { name: 'near-decor', factor: .30, alpha: .55, placement: 'near' },
] as const;

export class WinterParallaxBackground {
  static preload(scene: Phaser.Scene) {
    for (const layer of winterLayers) {
      const key = `winter:${layer.name}`;
      if (!scene.textures.exists(key)) {
        scene.load.image(key, `${import.meta.env.BASE_URL}assets/backgrounds/winter/${layer.name}.png`);
      }
    }
  }

  private readonly layers: { spec: typeof winterLayers[number]; image: Phaser.GameObjects.Image }[];

  constructor(scene: Phaser.Scene, private readonly worldWidth: number) {
    this.layers = winterLayers.map((spec, index) => ({
      spec,
      image: scene.add.image(0, 0, `winter:${spec.name}`)
        .setOrigin(0, 0).setDepth(-100 + index)
        .setScrollFactor(spec.factor, 0).setAlpha(spec.alpha),
    }));
  }

  resize(camera: Phaser.Cameras.Scene2D.Camera, groundScreenY: number) {
    const width = camera.width / camera.zoom;
    const height = camera.height / camera.zoom;
    const travel = Math.max(0, this.worldWidth - width);
    for (const { spec, image } of this.layers) {
      // One image, no wrapping: at maximum camera scroll its right edge still
      // reaches the viewport edge. Uniform scaling preserves the source ratio.
      const requiredWidth = width + travel * spec.factor;
      const source = image.frame.realWidth;
      const scale = spec.placement === 'cover'
        ? Math.max(requiredWidth / source, height / image.frame.realHeight)
        : requiredWidth / source;
      image.setScale(scale);
      let y = 0;
      if (spec.placement === 'air') y = height * .08;
      if (spec.placement === 'far') y = groundScreenY + height * .08 - image.displayHeight;
      if (spec.placement === 'mid') y = groundScreenY + height * .12 - image.displayHeight;
      // Near props live mostly below the traversal silhouette. Their original
      // transparent margins are retained; the solid gameplay ground masks them.
      if (spec.placement === 'near') y = height - image.displayHeight;
      image.setPosition(0, y);
    }
  }

  destroy() {
    for (const { image } of this.layers) image.destroy();
  }
}
