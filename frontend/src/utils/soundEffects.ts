export type SoundEffectType =
  | "chip"
  | "shuffle"
  | "cardDeal"
  | "win"
  | "blackjack"
  | "push"
  | "lose";

const MUTE_STORAGE_KEY = "blackjack_sound_muted";

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    } catch {
      this.muted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === "undefined") {
      return null;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtx) {
      return null;
    }

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      // Gentle compressor + master gain prevents clipping when multiple transients overlap
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.12;

      const master = this.ctx.createGain();
      master.gain.value = 0.85;

      compressor.connect(master);
      master.connect(this.ctx.destination);
      this.masterGain = master;
      this.noiseBuffer = this.createWhiteNoiseBuffer(this.ctx);
    }

    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getOutputNode(ctx: AudioContext): AudioNode {
    return this.masterGain ?? ctx.destination;
  }

  private createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(mute: boolean): void {
    this.muted = mute;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(mute));
    } catch {
      // Ignore storage errors
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  play(effect: SoundEffectType): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (effect) {
      case "chip":
        this.playChipClink(ctx, now);
        break;
      case "shuffle":
        this.playShuffleRiffle(ctx, now);
        break;
      case "cardDeal":
        this.playCardSlide(ctx, now);
        break;
      case "win":
        this.playWinChime(ctx, now);
        break;
      case "blackjack":
        this.playBlackjackFanfare(ctx, now);
        break;
      case "push":
        this.playPushTone(ctx, now);
        break;
      case "lose":
        this.playLoseTone(ctx, now);
        break;
    }
  }

  private triggerChipTap(
    ctx: AudioContext,
    time: number,
    pitchScale = 1,
    volume = 0.16
  ): void {
    const out = this.getOutputNode(ctx);

    // Clay/ceramic body thud + bright rim clink
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(620 * pitchScale, time);
    bodyOsc.frequency.exponentialRampToValueAtTime(240 * pitchScale, time + 0.032);

    bodyGain.gain.setValueAtTime(0.0001, time);
    bodyGain.gain.linearRampToValueAtTime(volume * 0.85, time + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.0005, time + 0.038);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(out);
    bodyOsc.start(time);
    bodyOsc.stop(time + 0.042);

    const clinkOsc = ctx.createOscillator();
    const clinkGain = ctx.createGain();
    clinkOsc.type = "triangle";
    clinkOsc.frequency.setValueAtTime(2650 * pitchScale, time);
    clinkOsc.frequency.exponentialRampToValueAtTime(1750 * pitchScale, time + 0.048);

    clinkGain.gain.setValueAtTime(0.0001, time);
    clinkGain.gain.linearRampToValueAtTime(volume, time + 0.002);
    clinkGain.gain.exponentialRampToValueAtTime(0.0005, time + 0.055);

    clinkOsc.connect(clinkGain);
    clinkGain.connect(out);
    clinkOsc.start(time);
    clinkOsc.stop(time + 0.06);
  }

  private playChipClink(ctx: AudioContext, startTime: number): void {
    // Subtle two-tap settle like a chip landing on felt
    const jitter = 0.96 + Math.random() * 0.08;
    this.triggerChipTap(ctx, startTime, jitter, 0.17);
    this.triggerChipTap(ctx, startTime + 0.024, jitter * 1.07, 0.085);
  }

  private playCardSlide(ctx: AudioContext, startTime: number): void {
    const out = this.getOutputNode(ctx);
    const noiseBuf = this.noiseBuffer ?? this.createWhiteNoiseBuffer(ctx);

    // 1. Soft paper glide across felt
    const slideDur = 0.085;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, startTime);
    filter.frequency.exponentialRampToValueAtTime(2400, startTime + slideDur);
    filter.Q.value = 1.1;

    const slideGain = ctx.createGain();
    slideGain.gain.setValueAtTime(0.0001, startTime);
    slideGain.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
    slideGain.gain.exponentialRampToValueAtTime(0.0008, startTime + slideDur);

    noise.connect(filter);
    filter.connect(slideGain);
    slideGain.connect(out);
    noise.start(startTime, Math.random() * 0.5, slideDur + 0.02);

    // 2. Subtle card-settle snap right at the end of the slide
    const snapTime = startTime + slideDur * 0.72;
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(420, snapTime);
    snapOsc.frequency.exponentialRampToValueAtTime(150, snapTime + 0.025);

    snapGain.gain.setValueAtTime(0.0001, snapTime);
    snapGain.gain.linearRampToValueAtTime(0.08, snapTime + 0.003);
    snapGain.gain.exponentialRampToValueAtTime(0.0005, snapTime + 0.03);

    snapOsc.connect(snapGain);
    snapGain.connect(out);
    snapOsc.start(snapTime);
    snapOsc.stop(snapTime + 0.035);
  }

  private playShuffleRiffle(ctx: AudioContext, startTime: number): void {
    const out = this.getOutputNode(ctx);
    const noiseBuf = this.noiseBuffer ?? this.createWhiteNoiseBuffer(ctx);

    // Curved riffle cadence (accelerates slightly in middle, eases out)
    const flickCount = 14;
    let cursor = startTime;

    for (let i = 0; i < flickCount; i++) {
      const progress = i / (flickCount - 1);
      const arch = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
      const step = 0.044 - arch * 0.018;
      const flickDur = 0.024;

      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1350 + progress * 1400, cursor);
      filter.Q.value = 1.6;

      const gain = ctx.createGain();
      const peak = 0.06 + arch * 0.12;
      gain.gain.setValueAtTime(0.0001, cursor);
      gain.gain.linearRampToValueAtTime(peak, cursor + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0006, cursor + flickDur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      src.start(cursor, Math.random() * 0.8, flickDur + 0.01);

      cursor += step;
    }
  }

  private playBellNote(
    ctx: AudioContext,
    time: number,
    freq: number,
    duration: number,
    peakGain: number
  ): void {
    const out = this.getOutputNode(ctx);

    // Warm fundamental + gentle octave harmonic for a chime/mallet feel
    const fund = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    fund.type = "sine";
    fund.frequency.setValueAtTime(freq, time);

    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(freq * 2, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 4.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.4, time + duration);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.22;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0005, time + duration);

    fund.connect(filter);
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    fund.start(time);
    overtone.start(time);
    fund.stop(time + duration + 0.02);
    overtone.stop(time + duration + 0.02);
  }

  private playWinChime(ctx: AudioContext, startTime: number): void {
    // Crisp major-9th sparkle (C5 -> E5 -> G5 -> B5 -> D6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
    notes.forEach((freq, idx) => {
      const isLast = idx === notes.length - 1;
      this.playBellNote(
        ctx,
        startTime + idx * 0.068,
        freq,
        isLast ? 0.46 : 0.24,
        isLast ? 0.14 : 0.11
      );
    });
  }

  private playBlackjackFanfare(ctx: AudioContext, startTime: number): void {
    // Two-step celebratory cadence leading into a shimmering major chord
    const roll = [523.25, 659.25, 783.99, 1046.5];
    roll.forEach((freq, idx) => {
      this.playBellNote(ctx, startTime + idx * 0.06, freq, 0.26, 0.12);
    });

    const chordStart = startTime + 0.27;
    const chordNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chordNotes.forEach((freq, idx) => {
      this.playBellNote(ctx, chordStart + idx * 0.022, freq, 0.62, 0.11);
    });
  }

  private playPushTone(ctx: AudioContext, startTime: number): void {
    // Soft muted wood/marimba double tap
    this.playBellNote(ctx, startTime, 392.0, 0.15, 0.085);
    this.playBellNote(ctx, startTime + 0.11, 392.0, 0.18, 0.085);
  }

  private playLoseTone(ctx: AudioContext, startTime: number): void {
    const out = this.getOutputNode(ctx);
    // Warm muted low roll instead of harsh sawtooth buzz
    const notes = [293.66, 220.0]; // D4 -> A3
    notes.forEach((freq, idx) => {
      const t = startTime + idx * 0.14;
      const dur = idx === 1 ? 0.36 : 0.18;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.94, t + dur);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(640, t);
      filter.frequency.exponentialRampToValueAtTime(280, t + dur);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  }
}

export const soundEffects = new SoundEffectsManager();