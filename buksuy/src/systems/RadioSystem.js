import { STATIONS, DJ, TALK, NEWS, LANDSLIDE_NEWS, UNKNOWN } from '../data/radio.js';
import { LOCATIONS } from '../world/WorldLayout.js';
import { clamp, pick } from '../core/util.js';

const TOWERS = [
  { x: 40, z: 50, range: 2600 },
  { x: 150, z: -2290, range: 2100 },
  { x: 0, z: -4590, range: 1600 },
];

// Магнитола Ласточки. Станции, приём, речь (если браузер умеет), события из эфира.
export class RadioSystem {
  constructor(game) {
    this.game = game;
    this.voices = [];
    if (typeof speechSynthesis !== 'undefined') {
      const load = () => {
        this.voices = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('ru'));
      };
      load();
      speechSynthesis.onvoiceschanged = load;
    }
    this.reset();
  }

  reset() {
    this.on = false;
    this.index = 0;
    this.cassette = false;
    this.lineT = 4;
    this.newsIdx = 0;
    this.talkIdx = Math.floor(Math.random() * TALK.length);
    this.talkLine = 0;
    this.heard = new Set();
    this.log = [];
    this.unknownIdx = 0;
    this.landslideTold = false;
    this._stopVoice();
  }

  get station() {
    return STATIONS[this.index];
  }

  unlockCassette() {
    this.cassette = true;
    this.game.ui.notify('📼 Кассета Ани — теперь в магнитоле есть своя станция.', 'good');
  }

  _available(i) {
    const s = STATIONS[i];
    return !s.locked || (s.id === 'cassette' && this.cassette);
  }

  next() {
    const g = this.game;
    if (!g.player.inCar) return;
    if (!this.on) {
      this.on = true;
    } else {
      let i = this.index;
      for (let k = 0; k < STATIONS.length; k++) {
        i = (i + 1) % STATIONS.length;
        if (this._available(i)) break;
      }
      this.index = i;
    }
    this._tune();
  }

  off(silent = false) {
    if (!this.on && silent) return;
    this.on = false;
    this._stopVoice();
    this.game.audio.music?.stop();
    if (!silent) this.game.ui.radio('РАДИО ВЫКЛ', '');
  }

  _tune() {
    const g = this.game;
    const s = this.station;
    this._stopVoice();
    this.lineT = 2.5;
    this.talkLine = 0;
    g.audio.play('click');
    g.ui.radio(`📻 ${s.freq}  ${s.name}`, '');
    if (s.music) g.audio.music?.start(s.music);
    else g.audio.music?.stop();
  }

  // сила сигнала 0..1
  signal() {
    const g = this.game;
    const p = g.playerPos;
    const s = this.station;
    if (s.id === 'cassette') return 1;
    if (s.id === 'unknown') {
      const tower = LOCATIONS.find((l) => l.id === 'tower');
      const d = Math.hypot(p.x - tower.x, p.z - tower.z);
      const night = g.world.dayNight.darkness;
      return clamp(1 - d / 3500, 0, 1) * (0.25 + night * 0.75) + (p.z < -1500 ? 0.15 : 0);
    }
    let best = 0;
    for (const t of TOWERS) best = Math.max(best, 1 - Math.hypot(p.x - t.x, p.z - t.z) / t.range);
    // в горах хуже
    const mountains = p.z < -2400 && p.z > -3300 ? 0.35 : 0;
    const storm = g.world.weather.storm * 0.3;
    return clamp(best - mountains - storm + 0.15, 0, 1);
  }

  _say(text, label, opts = {}) {
    const g = this.game;
    this.log.push({ station: label, text, day: g.world.dayNight.day, time: g.world.dayNight.time });
    if (this.log.length > 60) this.log.shift();
    g.ui.radio(`📻 ${label}`, text);
    if (g.settings.get('radioVoice') && this.voices.length && typeof speechSynthesis !== 'undefined' && g.player.inCar) {
      try {
        const u = new SpeechSynthesisUtterance(text.replace(/[«»…—]/g, ' '));
        u.lang = 'ru-RU';
        u.voice = this.voices[opts.voice ?? 0] || this.voices[0];
        u.rate = opts.rate ?? 1.05;
        u.pitch = opts.pitch ?? 1;
        u.volume = clamp(g.settings.get('musicVolume'), 0, 1);
        speechSynthesis.speak(u);
      } catch (_) { /* без голоса тоже можно */ }
    }
  }

  _stopVoice() {
    if (typeof speechSynthesis !== 'undefined') {
      try {
        speechSynthesis.cancel();
      } catch (_) { /* ок */ }
    }
  }

  // передача, которая включает радио сама
  strangeBroadcast() {
    const g = this.game;
    this.on = true;
    this.index = 3;
    this._tune();
    g.ui.notify('Радио само переключилось. Шипение… и голос.', 'warn');
    this.lineT = 1.5;
    this.forceUnknown = true;
  }

  update(dt) {
    const g = this.game;
    const audio = g.audio;
    const car = g.vehicle;
    car.radioDrain = this.on && !car.engine.on;
    if (car.radioDrain && car.damage.fluids.charge < 0.03) {
      this.off();
      g.ui.notify('Радио затихло — аккумулятор сел.');
    }
    if (!this.on || g.state !== 'playing') {
      if (audio.static) audio.static.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.1);
      return;
    }
    // если ушёл от машины — радио слышно хуже
    const near = g.player.inCar ? 1 : clamp(1 - Math.hypot(car.pos.x - g.player.pos.x, car.pos.z - g.player.pos.z) / 25, 0, 1);
    const sig = this.signal();
    if (audio.ctx) {
      const t = audio.ctx.currentTime;
      audio.static.gain.setTargetAtTime((1 - sig) * 0.12 * near * (g.ui.modal ? 0.3 : 1), t, 0.2);
      audio.radioBus.gain.setTargetAtTime(near * (0.3 + sig * 0.7) * (g.ui.modal ? 0.4 : 1), t, 0.2);
    }

    // обвал «объявляют» по радио, когда игрок в горах
    if (!this.landslideTold && car.pos.z < -2050 && !g.story.hasFlag('landslide')) {
      const ls = LOCATIONS.find((l) => l.id === 'landslide');
      if (Math.hypot(car.pos.x - ls.x, car.pos.z - ls.z) > 350) {
        this.landslideTold = true;
        g.story.setFlag('landslide');
        if (this.station.id === 'news' || this.station.id === 'retro' || this.station.id === 'talk') {
          this._say(LANDSLIDE_NEWS, `${this.station.freq} — СРОЧНО`);
        }
      }
    }

    this.lineT -= dt;
    if (this.lineT > 0) return;
    const s = this.station;
    if (sig < 0.12 && s.id !== 'unknown') {
      this.lineT = 6;
      g.ui.radio(`📻 ${s.freq}  ${s.name}`, '…шшшш… кх… шшш…');
      return;
    }
    switch (s.id) {
      case 'retro':
        this.lineT = 70 + Math.random() * 60;
        this._say(pick(DJ), s.name, { rate: 1.1 });
        break;
      case 'news': {
        this.lineT = 25 + Math.random() * 15;
        const f = NEWS[this.newsIdx % NEWS.length];
        this.newsIdx++;
        this._say(f(g), s.name, { rate: 1.0 });
        break;
      }
      case 'talk': {
        const show = TALK[this.talkIdx % TALK.length];
        const line = show[this.talkLine];
        this._say(line, s.name, { voice: this.talkLine % 2, pitch: this.talkLine % 2 ? 0.9 : 1.15 });
        this.talkLine++;
        if (this.talkLine >= show.length) {
          this.talkLine = 0;
          this.talkIdx++;
          this.lineT = 20 + Math.random() * 10;
        } else this.lineT = 5 + line.length * 0.05;
        break;
      }
      case 'unknown': {
        this.lineT = 22 + Math.random() * 20;
        if (sig < 0.35 && !this.forceUnknown) {
          g.ui.radio(`📻 ${s.freq}`, '…пи… пи-пи… пиии… шшш…');
          break;
        }
        this.forceUnknown = false;
        // сначала то, что ещё не слышали
        const fresh = UNKNOWN.filter((m) => !this.heard.has(m.id));
        const m = fresh.length ? fresh[0] : UNKNOWN[this.unknownIdx++ % UNKNOWN.length];
        this.heard.add(m.id);
        this._say(m.text, '??? частота 4', { rate: 0.85, pitch: 0.7 });
        if (m.clue) g.story.addClueFromNote(m.clue);
        if (m.id === 'lastochka' && !g.quests.known('signal')) g.quests.start('signal');
        if (this.heard.size >= UNKNOWN.length) g.achievements.unlock('radio_ham');
        break;
      }
      case 'cassette':
        this.lineT = 999;
        g.ui.radio('📼 Кассета Ани', 'На вкладыше от руки: «Сторона А — для дороги. Сторона Б — тоже для дороги».');
        break;
      default:
    }
  }

  serialize() {
    return { cassette: this.cassette, heard: [...this.heard], log: this.log.slice(-30), landslideTold: this.landslideTold, index: this.index };
  }

  deserialize(d) {
    this.reset();
    this.cassette = !!d?.cassette;
    this.heard = new Set(d?.heard || []);
    this.log = d?.log || [];
    this.landslideTold = !!d?.landslideTold;
    this.index = d?.index ?? 0;
  }
}
