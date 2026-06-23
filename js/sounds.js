const Sound = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      return this.ctx.resume();
    }
    return Promise.resolve();
  },

  setEnabled(on) {
    this.enabled = on;
  },

  ready() {
    return this.init().then(() => this.enabled && this.ctx);
  },

  tone(freq, duration, type = "sine", volume = 0.15) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playCorrect() {
    this.ready().then((ok) => {
      if (!ok) return;
      this.tone(523, 0.12);
      setTimeout(() => this.tone(659, 0.12), 100);
      setTimeout(() => this.tone(784, 0.18), 200);
    });
  },

  playWrong() {
    this.ready().then((ok) => {
      if (!ok) return;
      this.tone(330, 0.25, "triangle", 0.1);
    });
  },

  playUnlock() {
    this.ready().then((ok) => {
      if (!ok) return;
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.2), i * 120);
      });
    });
  },

  playClick() {
    this.ready().then((ok) => {
      if (!ok) return;
      this.tone(440, 0.06, "sine", 0.08);
    });
  },

  playBubblePop() {
    this.ready().then((ok) => {
      if (!ok || !this.ctx) return;

      const t = this.ctx.currentTime;

      const pop = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      pop.type = "sine";
      pop.frequency.setValueAtTime(980, t);
      pop.frequency.exponentialRampToValueAtTime(90, t + 0.15);
      popGain.gain.setValueAtTime(0.38, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      pop.connect(popGain);
      popGain.connect(this.ctx.destination);
      pop.start(t);
      pop.stop(t + 0.18);

      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = "sine";
      boom.frequency.setValueAtTime(180, t);
      boom.frequency.exponentialRampToValueAtTime(60, t + 0.12);
      boomGain.gain.setValueAtTime(0.2, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start(t);
      boom.stop(t + 0.14);

      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = "triangle";
      ping.frequency.setValueAtTime(1400, t + 0.05);
      ping.frequency.exponentialRampToValueAtTime(700, t + 0.14);
      pingGain.gain.setValueAtTime(0.16, t + 0.05);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      ping.start(t + 0.05);
      ping.stop(t + 0.16);

      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = "sine";
      chime.frequency.setValueAtTime(1047, t + 0.08);
      chimeGain.gain.setValueAtTime(0.1, t + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      chime.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chime.start(t + 0.08);
      chime.stop(t + 0.22);

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.11);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();
      filter.type = "bandpass";
      filter.frequency.value = 1600;
      filter.Q.value = 1.4;
      noiseGain.gain.setValueAtTime(0.26, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.11);
    });
  },
};
