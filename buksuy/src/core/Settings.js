const KEY = 'buksuy.settings';

export const DEFAULTS = {
  quality: 'medium', // low | medium | high
  viewDistance: 900,
  shadows: true,
  volume: 0.8,
  musicVolume: 0.6,
  mouseSens: 1,
  invertY: false,
  radioVoice: true, // озвучка радио через speechSynthesis, если есть русский голос
  showFps: false,
  dayLength: 24, // реальных минут на игровые сутки
  subtitles: true,
};

export class Settings {
  constructor() {
    this.values = { ...DEFAULTS };
    this.listeners = new Set();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) Object.assign(this.values, JSON.parse(raw));
    } catch (_) { /* приватный режим или битый json — живём на дефолтах */ }
  }

  get(k) {
    return this.values[k];
  }

  set(k, v) {
    this.values[k] = v;
    this.save();
    for (const fn of this.listeners) fn(k, v);
  }

  onChange(fn) {
    this.listeners.add(fn);
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.values));
    } catch (_) { /* ну и ладно */ }
  }

  reset() {
    for (const k of Object.keys(DEFAULTS)) this.set(k, DEFAULTS[k]);
  }
}
