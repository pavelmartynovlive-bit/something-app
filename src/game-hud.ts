import type Phaser from 'phaser';

const canvas = document.querySelector<HTMLCanvasElement>('#hud-art')!;
const context = canvas.getContext('2d')!;
let normal: HTMLCanvasElement, low: HTMLCanvasElement;
let last = '';

/** Approved PNG panel frames/icons with live values instead of baked examples. */
export class GameHud {
  static preload(scene: Phaser.Scene) {
    if (normal) return;
    for (const name of ['normal', 'low-energy']) {
      scene.load.image(`hud:${name}`, `${import.meta.env.BASE_URL}assets/hud/hud-${name}.png`);
    }
  }
  static prepare(scene: Phaser.Scene) {
    if (normal) return;
    for (const [i, name] of ['normal', 'low-energy'].entries()) {
      const source = scene.textures.get(`hud:${name}`).getSourceImage() as HTMLImageElement;
      const base = document.createElement('canvas'); base.width = 720; base.height = 144;
      const ctx = base.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      for (const [card, x] of [0, 368].entries()) {
        const crop = card ? [1092, 156, 1044, 425] : i ? [33, 156, 1047, 425] : [37, 156, 1043, 422];
        ctx.drawImage(source, crop[0], crop[1], crop[2], crop[3], x, 0, 352, 140);
        // Erase sample text and sample bar, preserving the illustrated frame.
        ctx.fillStyle = '#faf8ee'; ctx.beginPath(); ctx.roundRect(x + 11, 10, 330, 120, 25); ctx.fill();
      }
      ctx.drawImage(source, 96, 191, 164, 215, 20, 20, 34, 45);
      ctx.drawImage(source, 1146, 226, 285, 291, 387, 24, 49, 50);
      if (i) low = base; else normal = base;
      scene.textures.remove(`hud:${name}`);
    }
    last = '';
  }
  static render(energy: number, food: number, required: number, warning: boolean) {
    if (!normal) return;
    const value = Math.ceil(energy), percent = Math.round(energy * 10) / 10;
    const signature = `${value}:${percent}:${food}:${required}:${warning}`;
    if (signature === last) return;
    last = signature;
    canvas.dataset.state = warning ? 'low' : 'normal';
    context.clearRect(0, 0, 720, 144); context.drawImage(warning ? low : normal, 0, 0);
    context.fillStyle = '#253e22'; context.textBaseline = 'alphabetic'; context.textAlign = 'left';
    context.font = '700 30px system-ui, sans-serif';
    context.fillText('Энергия', 65, 47); context.fillText('Корм', 450, 47);
    context.font = '800 35px system-ui, sans-serif'; context.textAlign = 'right';
    context.fillText(String(value), 328, 47); context.fillText(String(food), 696, 47);
    context.font = '600 22px system-ui, sans-serif'; context.textAlign = 'left';
    context.fillText(`Котику нужно: ${required}`, 450, 93);
    context.fillStyle = warning ? '#f5e4cd' : '#d6e0c4';
    context.beginPath(); context.roundRect(22, 90, 306, 18, 9); context.fill();
    if (energy > 0) {
      context.save(); context.beginPath(); context.roundRect(22, 90, 306, 18, 9); context.clip();
      context.fillStyle = warning ? '#dc8b1e' : '#78a45a';
      context.fillRect(22, 90, 306 * energy / 100, 18); context.restore();
    }
  }
}
