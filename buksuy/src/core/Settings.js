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

// Первый запуск: по названию видеокарты прикидываем, какое качество потянет.
function guessQuality() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return 'low';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(name)) return 'low';
    if (/mali|adreno|powervr|apple gpu/i.test(name) || navigator.maxTouchPoints > 1) return 'low';
    if (/intel|uhd|iris|vega \d graphics|radeon\(tm\) graphics/i.test(name)) return 'medium';
    if (/rtx|rx [67]\d{3}|rx 9\d{3}|radeon pro|arc a7/i.test(name)) return 'ultra';
    return 'high';
  } catch (_) {
    return 'medium';
  }
}

export class Settings {
  constructor() {
    this.values = { ...DEFAULTS };
    this.listeners = new Set();
    let saved = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (_) { /* приватный режим или битый json — живём на дефолтах */ }
    if (saved) Object.assign(this.values, saved);
    if (!saved || !saved.quality) {
      this.values.quality = guessQuality();
      this.save();
    }
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
