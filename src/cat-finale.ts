import type Phaser from 'phaser';
import { audioManager } from './audio-manager';

export type FinaleState = 'waiting' | 'finale-enter' | 'finale-sniff' | 'finale-eat' | 'finale-happy' | 'finale-complete';
const sheets = { idle: [4, 4], sniff: [4, 6], eat: [4, 5], happy: [3, 4] } as const;
const phases = [
  { state: 'finale-enter', art: 'idle', duration: 250 },
  { state: 'finale-sniff', art: 'sniff', duration: 4 / 6 * 1000 },
  { state: 'finale-eat', art: 'eat', duration: 1600 },
  { state: 'finale-happy', art: 'happy', duration: 1100 },
] as const;

/** Presentation-only reward. A single cat+bowl image; no Arcade body or timers. */
export class CatFinale {
  static preload(scene: Phaser.Scene) {
    for (const name of Object.keys(sheets)) {
      const key = `cat-finale:${name}`;
      if (!scene.textures.exists(key)) scene.load.spritesheet(key,
        `${import.meta.env.BASE_URL}assets/characters/cat/cat-${name}-strip-320.png`,
        { frameWidth: 320, frameHeight: 320 });
    }
  }
  readonly sprite: Phaser.GameObjects.Image;
  state: FinaleState = 'waiting';
  private elapsed = 0;
  private phase = -1;
  constructor(scene: Phaser.Scene, x: number, floor: number, private complete: () => void) {
    this.sprite = scene.add.image(x, floor, 'cat-finale:idle', 0)
      .setOrigin(.5, 300 / 320).setScale(.24).setDepth(8).setData('catFinale', true);
  }
  enter() {
    if (this.state !== 'waiting') return false;
    this.phase = 0; this.elapsed = 0; this.transition(); return true;
  }
  private transition() {
    if (this.phase === phases.length) {
      this.state = 'finale-complete';
      this.sprite.setTexture('cat-finale:happy', 2);
      this.complete(); return;
    }
    const phase = phases[this.phase]; this.state = phase.state;
    this.sprite.setTexture(`cat-finale:${phase.art}`, 0);
    if (this.state === 'finale-eat') audioManager.playCatFeed();
    if (this.state === 'finale-happy') audioManager.playCatMeow();
  }
  update(delta: number) {
    if (this.state === 'finale-complete') return;
    this.elapsed += Math.max(0, Math.min(delta, 100));
    if (this.phase >= 0) {
      while (this.phase < phases.length && this.elapsed >= phases[this.phase].duration) {
        this.elapsed -= phases[this.phase].duration; this.phase++; this.transition();
      }
      if (this.phase === phases.length) return;
    }
    const art = this.phase < 0 ? 'idle' : phases[this.phase].art;
    const [count, fps] = sheets[art];
    const index = Math.floor(this.elapsed / 1000 * fps);
    this.sprite.setFrame(art === 'idle' || art === 'eat' ? index % count : Math.min(count - 1, index));
  }
}
