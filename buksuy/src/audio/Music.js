// Процедурная музыка для радио. Каждая «песня» — своя прогрессия и мелодия.

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);

const STYLES = {
  retro: {
    bpm: [104, 124],
    scale: [0, 2, 4, 5, 7, 9, 11],
    progs: [[0, 5, 3, 4], [0, 4, 5, 3], [5, 3, 0, 4], [0, 3, 4, 4]],
    root: [57, 60, 62, 55],
    chordWave: 'square',
    leadWave: 'triangle',
    swing: 0,
    stabs: true,
  },
  cassette: {
    bpm: [84, 96],
    scale: [0, 2, 3, 5, 7, 8, 10],
    progs: [[0, 5, 2, 6], [0, 3, 6, 5], [0, 6, 5, 4]],
    root: [57, 52, 55],
    chordWave: 'sawtooth',
    leadWave: 'sine',
    swing: 0.12,
    stabs: false,
  },
};

export class Music {
  constructor(ctx, out, noiseBuf) {
    this.ctx = ctx;
    this.out = out;
    this.noise = noiseBuf;
    this.playing = false;
    this.style = 'retro';
    this.timer = null;
  }

  newSong() {
    const st = STYLES[this.style];
    this.bpm = st.bpm[0] + Math.random() * (st.bpm[1] - st.bpm[0]);
    this.prog = st.progs[Math.floor(Math.random() * st.progs.length)];
    this.root = st.root[Math.floor(Math.random() * st.root.length)];
    this.bars = 0;
    this.melodyIdx = 3;
    // мотив на 2 такта, потом повторяется с вариациями
    this.motif = [];
    for (let i = 0; i < 16; i++) this.motif.push(Math.random() < 0.55 ? Math.floor(Math.random() * 5) - 2 : null);
  }

  start(style = 'retro') {
    if (this.playing && this.style === style) return;
    this.stop();
    this.style = style;
    this.newSong();
    this.playing = true;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this._schedule(), 30);
  }

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
  }

  _schedule() {
    const ctx = this.ctx;
    const stepDur = 60 / this.bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this._playStep(this.step, this.nextTime, stepDur);
      this.step++;
      if (this.step % 16 === 0) {
        this.bars++;
        if (this.bars >= 16) this.newSong();
      }
      const sw = this.step % 2 ? STYLES[this.style].swing * stepDur : 0;
      this.nextTime += stepDur + sw;
    }
  }

  _degree(d, oct = 0) {
    const sc = STYLES[this.style].scale;
    const n = sc.length;
    const o = Math.floor(d / n);
    const i = ((d % n) + n) % n;
    return this.root + sc[i] + 12 * (o + oct);
  }

  _playStep(step, t, dur) {
    const st = STYLES[this.style];
    const s16 = step % 16;
    const chordDeg = this.prog[Math.floor(step / 16) % 4];

    // барабаны
    if (s16 % 8 === 0) this._kick(t);
    if (s16 % 8 === 4) this._snare(t);
    if (s16 % 2 === 0) this._hat(t, s16 % 4 === 2 ? 0.05 : 0.03);

    // бас
    if (s16 % 4 === 0 || (s16 === 10 && Math.random() < 0.5)) {
      this._tone(NOTE(this._degree(chordDeg, -2)), t, dur * 3, 'triangle', 0.2);
    }
    // аккорды
    if (st.stabs) {
      if (s16 % 4 === 2) for (const k of [0, 2, 4]) this._tone(NOTE(this._degree(chordDeg + k, 0)), t, dur * 1.2, st.chordWave, 0.03, 1800);
    } else if (s16 === 0) {
      for (const k of [0, 2, 4]) this._tone(NOTE(this._degree(chordDeg + k, 0)), t, dur * 15, st.chordWave, 0.025, 900);
    }
    // мелодия — вступает со второго такта
    if (this.bars >= 1 && s16 % 2 === 0) {
      const m = this.motif[(s16 / 2 + (this.bars % 2) * 8) % 16];
      if (m !== null && Math.random() < 0.9) {
        this.melodyIdx = Math.max(-2, Math.min(9, chordDeg + m + (this.bars % 4 === 3 ? 2 : 0)));
        this._tone(NOTE(this._degree(this.melodyIdx, 1)), t, dur * 1.8, st.leadWave, 0.07, 3000, true);
      }
    }
  }

  _tone(f, t, len, wave, vol, cutoff = 2500, vibrato = false) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = wave;
    o.frequency.value = f;
    if (vibrato) {
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = 5.5;
      lg.gain.value = f * 0.006;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + len + 0.1);
    }
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(flt).connect(g).connect(this.out);
    o.start(t);
    o.stop(t + len + 0.05);
  }

  _kick(t) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.3);
  }

  _noiseHit(t, type, freq, vol, len) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(f).connect(g).connect(this.out);
    s.start(t, Math.random() * 1.5);
    s.stop(t + len + 0.02);
  }

  _snare(t) {
    this._noiseHit(t, 'bandpass', 1900, 0.18, 0.16);
  }

  _hat(t, v) {
    this._noiseHit(t, 'highpass', 7500, v, 0.04);
  }
}
