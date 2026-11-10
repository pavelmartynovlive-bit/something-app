/** Optional SFX: never part of Phaser's critical image preload. */
export const MASTER_SFX_VOLUME = 0.65;
const effects = {
  jump: ['jump', .55, 100], landing: ['snow_land', .52, 180],
  food: ['food_pickup', .36, 35], lipton: ['lipton_combo', .65, 200],
  bench: ['bench_sit', .42, 500], granny: ['granny_hit', .52, 300],
  scooter: ['scooter_hit', .5, 300], pigeon: ['pigeon_takeoff', .46, 400],
  pit: ['pit_combo', .58, 500], respawn: ['respawn', .48, 200],
  meow1: ['cat_meow_01', .45, 500], meow2: ['cat_meow_02', .45, 500],
  feed: ['cat_feed', .45, 500], ui: ['ui_click', .22, 150],
} as const;
type Effect = keyof typeof effects;
type Voice = { source: AudioBufferSourceNode; gain: GainNode; kind: Effect };

export class AudioManager {
  private context?: AudioContext;
  private buffers = new Map<Effect, AudioBuffer>();
  private last = new Map<Effect, number>();
  private seen = new Map<Effect, WeakSet<object>>();
  private voices = new Set<Voice>();
  private started = false;
  private unlocked = false;
  private unlock = () => {
    const context = this.context;
    if (!context || document.hidden) return;
    // resume() must be called synchronously inside the real user gesture.
    void context.resume().then(() => {
      this.unlocked = context.state === 'running';
      if (!this.unlocked) return;
      const silent = context.createBufferSource();
      silent.buffer = context.createBuffer(1, 1, context.sampleRate);
      silent.connect(context.destination); silent.start();
      silent.onended = () => silent.disconnect();
    }).catch(() => { this.unlocked = false; });
  };
  start() {
    if (this.started) return;
    this.started = true;
    try {
      const Constructor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) return;
      this.context = new Constructor();
    } catch { return; }
    for (const name of ['pointerdown', 'touchend', 'keydown'] as const)
      document.addEventListener(name, this.unlock, { capture: true, passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopVoices(); this.unlocked = false;
        void this.context?.suspend().catch(() => {});
      }
      // Foreground playback resumes only after another gesture; no replay queue.
    });
    // Loading/decoding may happen while the context is suspended on Safari.
    // No await in scene startup; timeout/404/corrupt audio simply disables that SFX.
    for (const [kind, [filename]] of Object.entries(effects)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const url = new URL(`${import.meta.env.BASE_URL}assets/audio/sfx/${filename}.wav`, document.baseURI);
      void fetch(url, { signal: controller.signal }).then(response => {
        if (!response.ok) throw new Error('Optional SFX unavailable');
        return response.arrayBuffer();
      }).then(bytes => this.context!.decodeAudioData(bytes))
        .then(buffer => this.buffers.set(kind as Effect, buffer))
        .catch(() => {}).finally(() => clearTimeout(timeout));
    }
  }
  resetRun() { this.stopVoices(true); this.last.clear(); this.seen.clear(); }
  private stopVoices(preserveUI = false) {
    for (const voice of [...this.voices]) {
      if (preserveUI && voice.kind === 'ui') continue;
      try { voice.source.stop(); } catch {} this.release(voice);
    }
  }
  private release(voice: Voice) {
    voice.source.disconnect(); voice.gain.disconnect(); this.voices.delete(voice);
  }
  private play(kind: Effect, event?: object, varied = false) {
    if (event) {
      let events = this.seen.get(kind);
      if (!events) this.seen.set(kind, events = new WeakSet());
      if (events.has(event)) return;
      events.add(event);
    }
    const context = this.context, buffer = this.buffers.get(kind);
    if (!context || !buffer || !this.unlocked || context.state !== 'running' || document.hidden) return;
    const [, volume, cooldown] = effects[kind];
    const now = performance.now();
    if (now - (this.last.get(kind) ?? -Infinity) < cooldown) return;
    if (this.voices.size >= 12 || [...this.voices].filter(v => v.kind === kind).length >= 3) return;
    this.last.set(kind, now);
    try {
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer;
      source.detune.value = varied ? (Math.random() * 2 - 1) * 25 : 0;
      gain.gain.value = MASTER_SFX_VOLUME * volume * (varied ? .96 + Math.random() * .08 : 1);
      source.connect(gain); gain.connect(context.destination);
      const voice = { source, gain, kind }; this.voices.add(voice);
      source.onended = () => this.release(voice);
      source.start();
    } catch { /* Audio interruptions must never affect gameplay. */ }
  }
  playJump() { this.play('jump'); }
  playLanding() { this.play('landing', undefined, true); }
  playFoodPickup(event: object) { this.play('food', event, true); }
  playLiptonPickup(event: object) { this.play('lipton', event); }
  playBenchSit(event: object) { this.play('bench', event); }
  playGrannyHit() { this.play('granny'); }
  playScooterHit() { this.play('scooter'); }
  playPigeonTakeoff(event: object) { this.play('pigeon', event); }
  playPitFall(event: object) { this.play('pit', event); }
  playRespawn() { this.play('respawn'); }
  playCatMeow() { this.play(Math.random() < .5 ? 'meow1' : 'meow2'); }
  playCatFeed() { this.play('feed'); }
  playUIClick() { this.play('ui'); }
}
export const audioManager = new AudioManager();
