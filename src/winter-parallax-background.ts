import Phaser from 'phaser';

// Art composition only. No terrain, actor, collision or movement settings.
export const winterLayers = [
  { name: 'sky', factor: .01, alpha: 1, placement: 'cover' },
  { name: 'atmosphere', factor: .04, alpha: .6, placement: 'air' },
  { name: 'far-city', factor: .09, alpha: 1, placement: 'far' },
  { name: 'mid-city', factor: .16, alpha: 1, placement: 'mid' },
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

  constructor(private readonly scene: Phaser.Scene, private readonly worldWidth: number) {
    this.layers = winterLayers.map((spec, index) => ({
      spec,
      image: scene.add.image(0, 0, `winter:${spec.name}`)
        .setOrigin(0, 0).setDepth(-100 + index)
        .setScrollFactor(spec.factor, 0).setAlpha(spec.alpha),
    }));
    // Read the final camera position before drawing, including paused/resized views.
    scene.events.on(Phaser.Scenes.Events.PRE_RENDER, this.updateVisibility, this);
  }

  private updateVisibility() {
    const camera = this.scene.cameras.main;
    const travel = Math.max(0, this.worldWidth - camera.width / camera.zoom);
    const progress = travel > 0 ? Phaser.Math.Clamp(camera.scrollX / travel, 0, 1) : 0;
    // Solid courtyards at the two ends; a short soft transition into open sky.
    const edgeDistance = Math.min(progress, 1 - progress);
    const fade = Phaser.Math.Clamp((edgeDistance - .10) / .08, 0, 1);
    const opacity = 1 - fade * fade * (3 - 2 * fade);
    for (const { spec, image } of this.layers) {
      if (spec.name === 'mid-city') image.setAlpha(opacity).setVisible(opacity > 0);
    }
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
      // The courtyard PNG has transparent padding below the snow. Sink that
      // padding below the gameplay baseline so the skyline cannot peek under it.
      if (spec.placement === 'mid') y = groundScreenY + height * .22 - image.displayHeight;
      image.setPosition(0, y);
    }
    this.updateVisibility();
  }

  destroy() {
    this.scene.events.off(Phaser.Scenes.Events.PRE_RENDER, this.updateVisibility, this);
    for (const { image } of this.layers) image.destroy();
  }
}
