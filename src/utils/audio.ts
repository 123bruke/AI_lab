class LabAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private burnerGain: GainNode | null = null;
  private burnerFilter: BiquadFilterNode | null = null;
  private burnerSource: AudioBufferSourceNode | null = null;
  private boilingGain: GainNode | null = null;
  private boilingFilter: BiquadFilterNode | null = null;
  private isInitialized: boolean = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupBurnerHiss();
      this.setupBoilingSound();
      this.isInitialized = true;
    } catch {
      // Audio not permitted or supported
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.burnerGain && this.boilingGain) {
      if (this.isMuted) {
        this.burnerGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.boilingGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private setupBurnerHiss() {
    if (!this.ctx) return;
    // Create pinkish gas hiss buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.2;
      output[i] = (b0 + b1 + b2) * 0.3;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.burnerSource = whiteNoise;
    this.burnerFilter = filter;
    this.burnerGain = gain;
  }

  private setupBoilingSound() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const bubbleBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = bubbleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = bubbleBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start();
    this.boilingFilter = filter;
    this.boilingGain = gain;
  }

  public updateBurnerSound(isLit: boolean, powerPercent: number) {
    this.init();
    if (!this.ctx || !this.burnerGain || !this.burnerFilter || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const targetGain = isLit ? (powerPercent / 100) * 0.18 : 0;
    this.burnerGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    this.burnerFilter.frequency.setTargetAtTime(600 + (powerPercent / 100) * 800, this.ctx.currentTime, 0.1);
  }

  public updateBoilingSound(temperature: number) {
    this.init();
    if (!this.ctx || !this.boilingGain || !this.boilingFilter || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    let targetGain = 0;
    if (temperature > 60) {
      const boilFactor = Math.min(1, Math.max(0, (temperature - 60) / 40));
      targetGain = boilFactor * 0.22;
      this.boilingFilter.frequency.setTargetAtTime(300 + boilFactor * 700, this.ctx.currentTime, 0.1);
    }
    this.boilingGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  public playIgnite() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playGlassClink() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400 + Math.random() * 400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const labAudio = new LabAudioEngine();
