export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.masterVolume = 0.6;
  }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  beep(freq = 440, duration = 0.1, vol = 0.2) {
    if (!this.enabled || !this.sfxEnabled) return;
    const ctx = this._ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    gain.gain.setValueAtTime(vol * this.masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  playVocabulary(audioPath) {
    if (!this.enabled || !audioPath) return null;
    const a = new window.Audio(audioPath);
    a.volume = this.masterVolume;
    a.play().catch(() => {});
    return a;
  }
}
