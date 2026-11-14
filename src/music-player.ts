import { audioManager } from './audio-manager';

export const MUSIC_MAX_VOLUME = .35;
export const musicTracks = [
  { id: 'pixel-meadow-calm', title: 'Pixel Meadow · спокойно' },
  { id: 'pixel-meadow', title: 'Pixel Meadow · с мелодией' },
  { id: 'bitcade-overworld', title: 'Overworld · бодро' },
] as const;
type TrackId = typeof musicTracks[number]['id'];
type Voice = { id: TrackId; source: AudioBufferSourceNode; gain: GainNode };
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const storageKey = 'tanya:music:v1';

/** Uses the same gesture-unlocked AudioContext as SFX, on a separate gain. */
export class MusicPlayer {
  private selected: TrackId = 'pixel-meadow-calm';
  private enabled = true;
  private volume = 35;
  private ready = false;
  private request = 0;
  private buffers = new Map<TrackId, Promise<AudioBuffer>>();
  private voice?: Voice;
  private select = el<HTMLSelectElement>('music-track');
  private slider = el<HTMLInputElement>('music-volume');
  private toggle = el<HTMLButtonElement>('music-enabled');
  private status = el('music-status');
  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (musicTracks.some(t => t.id === saved?.selected)) this.selected = saved.selected;
      if (typeof saved?.enabled === 'boolean') this.enabled = saved.enabled;
      if (typeof saved?.volume === 'number' && Number.isFinite(saved.volume)) this.volume = Math.max(0, Math.min(100, saved.volume));
    } catch { /* Storage may be unavailable in private mode. */ }
    this.render();
    const open = el<HTMLButtonElement>('music-open'), panel = el('music-panel');
    open.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      open.setAttribute('aria-expanded', String(!panel.hidden));
    });
    // Controls must not send Space/arrow presses to Phaser's jump keyboard.
    el('music-player').addEventListener('keydown', event => event.stopPropagation());
    this.select.addEventListener('change', () => {
      this.selected = this.select.value as TrackId;
      this.persist(); this.render(); void this.playSelected();
    });
    this.slider.addEventListener('input', () => {
      this.volume = Number(this.slider.value); this.persist(); this.render(); this.adjustVolume();
    });
    this.toggle.addEventListener('click', () => {
      this.enabled = !this.enabled; this.persist(); this.render();
      void this.playSelected();
    });
    document.addEventListener('game:ready', () => {
      this.ready = true; el('music-player').hidden = false; void this.playSelected();
    });
    document.addEventListener('game:audio-unlocked', () => { void this.playSelected(); });
  }
  private persist() {
    try { localStorage.setItem(storageKey, JSON.stringify({ selected: this.selected, enabled: this.enabled, volume: this.volume })); } catch {}
  }
  private render() {
    this.select.value = this.selected; this.slider.value = String(this.volume);
    el('music-current').textContent = musicTracks.find(t => t.id === this.selected)!.title;
    el('music-volume-value').textContent = `${this.volume}%`;
    this.toggle.textContent = this.enabled ? 'Выключить музыку' : 'Включить музыку';
    this.toggle.setAttribute('aria-pressed', String(this.enabled));
    if (!this.enabled) this.status.textContent = 'Музыка выключена · звуки игры остаются';
  }
  private load(id: TrackId): Promise<AudioBuffer> {
    const existing = this.buffers.get(id); if (existing) return existing;
    const promise = (async () => {
      const context = audioManager.audioContext!;
      // OGG for small seamless loops, MP3 fallback for older Safari/iOS.
      for (const extension of ['ogg', 'mp3']) {
        const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const url = new URL(`${import.meta.env.BASE_URL}assets/audio/music/${id}.${extension}`, document.baseURI);
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw Error('Music unavailable');
          return await context.decodeAudioData(await response.arrayBuffer());
        } catch { /* Try the compatible format, without blocking the game. */ }
        finally { clearTimeout(timeout); }
      }
      throw Error('Music unavailable');
    })();
    this.buffers.set(id, promise);
    void promise.catch(() => { if (this.buffers.get(id) === promise) this.buffers.delete(id); });
    return promise;
  }
  private retire(voice?: Voice) {
    if (!voice) return;
    const context = audioManager.audioContext!;
    voice.gain.gain.cancelScheduledValues(context.currentTime);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, context.currentTime);
    voice.gain.gain.linearRampToValueAtTime(0, context.currentTime + .18);
    voice.source.stop(context.currentTime + .20);
  }
  private adjustVolume() {
    const context = audioManager.audioContext;
    if (!context || !this.voice) return;
    const gain = this.voice.gain.gain;
    gain.cancelScheduledValues(context.currentTime); gain.setValueAtTime(gain.value, context.currentTime);
    gain.linearRampToValueAtTime(MUSIC_MAX_VOLUME * this.volume / 100, context.currentTime + .08);
  }
  private async playSelected() {
    const request = ++this.request;
    const context = audioManager.audioContext;
    if (!this.ready || !context) return;
    if (!this.enabled) {
      this.retire(this.voice); this.voice = undefined; this.render(); return;
    }
    if (this.voice?.id === this.selected) {
      this.status.textContent = 'Играет по кругу · можно менять во время бега'; return;
    }
    this.status.textContent = 'Загружаем выбранный трек…';
    try {
      const id = this.selected, buffer = await this.load(id);
      if (request !== this.request || !this.enabled) return;
      if (!audioManager.isUnlocked || document.hidden) {
        this.status.textContent = 'Коснись экрана, чтобы включить музыку'; return;
      }
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; source.loop = true; source.loopStart = 0; source.loopEnd = buffer.duration;
      gain.gain.setValueAtTime(0, context.currentTime);
      source.connect(gain); gain.connect(context.destination);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start();
      this.retire(this.voice); this.voice = { id, source, gain }; this.adjustVolume();
      this.status.textContent = 'Играет по кругу · можно менять во время бега';
    } catch {
      if (request === this.request) this.status.textContent = 'Трек не загрузился. Выбери другой или выключи и включи музыку.';
    }
  }
}
export const musicPlayer = new MusicPlayer();
