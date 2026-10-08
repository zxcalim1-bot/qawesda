import { Music } from './Music.js';
import { clamp } from '../core/util.js';

// Весь звук синтезируется на лету через WebAudio — никаких файлов.
export class AudioSystem {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.inGame = false;
    this.hornOn = false;
    const unlock = () => {
      this.unlock();
      if (this.ctx) {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch (_) {
      return;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.connect(this.master);
    // радио: полоса как у автомагнитолы
    this.radioBus = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 180;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4200;
    this.radioOut = ctx.createGain();
    this.radioBus.connect(hp).connect(lp).connect(this.radioOut).connect(this.master);

    // белый шум на 2 секунды
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this._buildEngine();
    this._buildLoops();
    this.music = new Music(ctx, this.radioBus, this.noiseBuf);
    // статика радио
    this.static = this._noiseLoop('bandpass', 2500, 0.6);
    this.static.out.connect(this.radioBus);
    this.applyVolume();
    this.game.events.emit('audio-ready', {});
  }

  applyVolume() {
    if (!this.ctx) return;
    const v = this.game.settings.get('volume');
    this.master.gain.value = v;
    this.radioOut.gain.value = this.game.settings.get('musicVolume') * 0.9;
  }

  setInGame(v) {
    this.inGame = v;
  }

  _noiseLoop(type, freq, q = 1) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(f).connect(g);
    src.start();
    return { src, filter: f, out: g, gain: g.gain };
  }

  _buildEngine() {
    const ctx = this.ctx;
    const e = {};
    e.osc1 = ctx.createOscillator();
    e.osc1.type = 'sawtooth';
    e.osc2 = ctx.createOscillator();
    e.osc2.type = 'square';
    e.sub = ctx.createOscillator();
    e.sub.type = 'sine';
    e.mix = ctx.createGain();
    e.mix.gain.value = 0.5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    const gs = ctx.createGain();
    gs.gain.value = 0.6;
    e.osc1.connect(e.mix);
    e.osc2.connect(g2).connect(e.mix);
    e.sub.connect(gs).connect(e.mix);
    // немного «грязи»
    e.shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * 2 - 1;
      curve[i] = Math.tanh(x * 2.2);
    }
    e.shaper.curve = curve;
    e.filter = ctx.createBiquadFilter();
    e.filter.type = 'lowpass';
    e.filter.frequency.value = 400;
    e.filter.Q.value = 2;
    e.out = ctx.createGain();
    e.out.gain.value = 0;
    e.mix.connect(e.shaper).connect(e.filter).connect(e.out).connect(this.sfx);
    // «детонация» убитого мотора — модуляция громкости
    e.am = ctx.createGain();
    e.am.gain.value = 1;
    e.out.disconnect();
    e.out.connect(e.am).connect(this.sfx);
    for (const o of [e.osc1, e.osc2, e.sub]) o.start();
    // впуск/шорох
    e.intake = this._noiseLoop('bandpass', 900, 0.8);
    e.intake.out.connect(this.sfx);
    this.engine = e;
  }

  _buildLoops() {
    this.tires = this._noiseLoop('bandpass', 1300, 4);
    this.tires.out.connect(this.sfx);
    this.rumble = this._noiseLoop('lowpass', 140, 1);
    this.rumble.out.connect(this.sfx);
    this.wind = this._noiseLoop('bandpass', 500, 0.5);
    this.wind.out.connect(this.sfx);
    this.rain = this._noiseLoop('highpass', 3000, 0.4);
    this.rain.out.connect(this.sfx);
    this.water = this._noiseLoop('lowpass', 700, 1);
    this.water.out.connect(this.sfx);
    this.crank = this._noiseLoop('bandpass', 300, 2);
    this.crank.out.connect(this.sfx);
    // гудок — два тона
    const ctx = this.ctx;
    this.hornGain = ctx.createGain();
    this.hornGain.gain.value = 0;
    for (const f of [392, 494]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      o.connect(lp).connect(this.hornGain);
      o.start();
    }
    this.hornGain.connect(this.sfx);
  }

  horn(on) {
    if (on && !this.hornOn) this.game.events.emit('horn', {});
    this.hornOn = on;
  }

  update(dt) {
    if (!this.ctx) return;
    const g = this.game;
    const t = this.ctx.currentTime;
    const car = g.vehicle;
    const e = this.engine;
    const playing = g.state === 'playing' || g.state === 'menu';
    const paused = g.ui.modal || g.state !== 'playing';
    // далеко от машины — тише
    const pp = g.player?.inCar ? car.pos : g.player?.pos || car.pos;
    const dist = Math.hypot(car.pos.x - pp.x, car.pos.z - pp.z);
    const near = clamp(1 - dist / 60, 0, 1) * (playing ? 1 : 0);

    const rpm = car.engine.rpm;
    const on = car.engine.on;
    const fire = Math.max(10, (rpm / 60) * 2);
    e.osc1.frequency.setTargetAtTime(fire, t, 0.03);
    e.osc2.frequency.setTargetAtTime(fire * 2.01, t, 0.03);
    e.sub.frequency.setTargetAtTime(fire * 0.5, t, 0.03);
    const load = car.engine.load;
    const loud = car.damage.isDetached('exhaust') || car.damage.hasFault('exhaust') ? 1.8 : 1;
    e.filter.frequency.setTargetAtTime(180 + rpm * 0.22 + load * 900 * loud, t, 0.05);
    const engVol = on ? (0.07 + load * 0.08 + (rpm / 6000) * 0.07) * loud : car.engine.cranking > 0 ? 0.04 : 0;
    e.out.gain.setTargetAtTime(engVol * near * (paused ? 0.3 : 1), t, 0.05);
    // троит — провалы громкости
    const eng = car.damage.hp('engine');
    const misf = car.engine.misfireT > 0 ? 0.15 : 1;
    const knock = eng < 40 ? 0.75 + Math.random() * 0.25 : 1;
    e.am.gain.setTargetAtTime(misf * knock, t, 0.01);
    e.intake.gain.setTargetAtTime(on ? load * 0.04 * near * (rpm / 5000) : 0, t, 0.05);
    this.crank.gain.setTargetAtTime(car.engine.cranking > 0 ? (0.08 + Math.sin(t * 70) * 0.06) * near : 0, t, 0.01);

    // шины, кочки, ветер, вода
    let slip = 0, rough = 0, water = 0;
    for (const w of car.wheels) {
      if (!w.contact) continue;
      if (!w.surface?.fx) slip = Math.max(slip, w.slip);
      rough = Math.max(rough, w.surface?.rough || 0);
      water = Math.max(water, w.water || 0);
    }
    const speed = Math.hypot(car.vel.x, car.vel.z);
    const pa = paused ? 0 : 1;
    this.tires.gain.setTargetAtTime(clamp(slip - 0.25, 0, 1) * 0.12 * near * pa, t, 0.05);
    this.rumble.gain.setTargetAtTime(clamp(speed / 20, 0, 1) * (0.03 + rough * 1.5) * near * pa, t, 0.1);
    const inCar = g.player?.inCar;
    this.wind.gain.setTargetAtTime(clamp((speed - 5) / 30, 0, 1) * 0.06 * (inCar ? 1 : 0.3) * pa, t, 0.2);
    this.wind.filter.frequency.setTargetAtTime(300 + speed * 18, t, 0.2);
    const rainV = g.world?.weather ? g.world.weather.rain : 0;
    this.rain.gain.setTargetAtTime(rainV * (inCar ? 0.05 : 0.09) * pa, t, 0.3);
    this.water.gain.setTargetAtTime(water > 0.05 && speed > 1 ? clamp(speed / 10, 0, 1) * 0.15 * near * pa : 0, t, 0.08);
    this.hornGain.gain.setTargetAtTime(this.hornOn && !paused ? 0.12 : 0, t, 0.02);
  }

  // ---------- одиночные звуки ----------

  _env(node, vol, attack, decay, t = this.ctx.currentTime) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    node.connect(g).connect(this.sfx);
    return g;
  }

  _beep(f, len, vol = 0.1, type = 'sine', t0 = 0, slide = 0) {
    const ctx = this.ctx;
    const t = ctx.currentTime + t0;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + len);
    this._env(o, vol, 0.005, len, t);
    o.start(t);
    o.stop(t + len + 0.05);
  }

  _noise(type, freq, len, vol = 0.2, t0 = 0, q = 1) {
    const ctx = this.ctx;
    const t = ctx.currentTime + t0;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    s.connect(f);
    this._env(f, vol, 0.004, len, t);
    s.start(t, Math.random());
    s.stop(t + len + 0.05);
  }

  play(name, opts = {}) {
    if (!this.ctx) return;
    switch (name) {
      case 'click': this._beep(1800, 0.03, 0.05, 'square'); break;
      case 'blip': this._beep(900 + Math.random() * 300, 0.04, 0.03, 'triangle'); break;
      case 'error': this._beep(180, 0.15, 0.08, 'square'); break;
      case 'coins': this._beep(1200, 0.08, 0.06, 'triangle'); this._beep(1600, 0.1, 0.06, 'triangle', 0.07); break;
      case 'pickup': this._beep(500, 0.06, 0.06, 'triangle'); this._beep(750, 0.08, 0.06, 'triangle', 0.05); break;
      case 'quest': this._beep(523, 0.15, 0.07, 'triangle'); this._beep(659, 0.15, 0.07, 'triangle', 0.12); this._beep(784, 0.3, 0.07, 'triangle', 0.24); break;
      case 'achievement': [523, 659, 784, 1046].forEach((f, i) => this._beep(f, 0.25, 0.07, 'square', i * 0.09)); break;
      case 'wrench': for (let i = 0; i < 4; i++) this._noise('bandpass', 3500, 0.05, 0.15, i * 0.09, 6); break;
      case 'hood': this._noise('lowpass', 400, 0.25, 0.25); this._beep(90, 0.2, 0.1, 'sine'); break;
      case 'trunk': this._noise('lowpass', 500, 0.2, 0.2); break;
      case 'pour': this._noise('bandpass', 800, 1.2, 0.08, 0, 2); break;
      case 'eat': for (let i = 0; i < 3; i++) this._noise('bandpass', 1500, 0.06, 0.08, i * 0.15, 3); break;
      case 'paper': this._noise('highpass', 4000, 0.25, 0.06); break;
      case 'pop': this._noise('lowpass', 1200, 0.08, 0.6); this._noise('highpass', 2500, 1.4, 0.08, 0.05); break;
      case 'impact': {
        const v = clamp(opts.v || 0.5, 0, 1);
        this._noise('lowpass', 300 + v * 900, 0.25 + v * 0.3, 0.3 + v * 0.5);
        this._beep(70, 0.3, 0.2 * v, 'sine', 0, -30);
        if (v > 0.4) this._noise('highpass', 3500, 0.4, 0.15 * v, 0.02);
        break;
      }
      case 'scrape': this._noise('bandpass', 2200, 0.3, 0.12, 0, 3); break;
      case 'glass': for (let i = 0; i < 6; i++) this._beep(3000 + Math.random() * 3000, 0.08, 0.04, 'triangle', i * 0.03); break;
      case 'thunder': {
        const d = opts.delay || 0;
        this._noise('lowpass', 180, 2.5, 0.7, d);
        this._noise('lowpass', 90, 3.5, 0.5, d + 0.2);
        break;
      }
      case 'moo': this._beep(170, 1.0, 0.15, 'sawtooth', 0, -40); break;
      case 'backfire': this._noise('lowpass', 600, 0.15, 0.6); break;
      case 'starter_click': this._beep(1200, 0.02, 0.1, 'square'); break;
      case 'splash': this._noise('lowpass', 900, 0.6, 0.4); break;
      case 'clunk': this._noise('lowpass', 250, 0.2, 0.5); this._beep(60, 0.2, 0.2); break;
      case 'grind': this._noise('bandpass', 1200, 0.4, 0.2, 0, 8); break;
      case 'engine_start': this._beep(60, 0.4, 0.1, 'sawtooth', 0, 40); break;
      default:
    }
  }
}
