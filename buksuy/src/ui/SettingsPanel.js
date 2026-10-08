import { Panel, el } from './UIManager.js';

export class SettingsPanel extends Panel {
  constructor(game) {
    super(game.ui, { title: 'НАСТРОЙКИ', size: 'narrow' });
    this.game = game;
  }

  render() {
    const s = this.game.settings;
    this.body.innerHTML = '';
    this.body.classList.add('settings');
    const row = (label, input) => {
      const r = el('div', 'row');
      r.append(el('label', '', label), input);
      this.body.append(r);
    };
    const select = (key, opts) => {
      const e = document.createElement('select');
      for (const [v, t] of opts) {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = t;
        if (String(s.get(key)) === String(v)) o.selected = true;
        e.append(o);
      }
      e.onchange = () => s.set(key, typeof s.get(key) === 'number' ? Number(e.value) : e.value);
      return e;
    };
    const range = (key, min, max, step, fmt = (v) => v) => {
      const wrap = el('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '8px';
      wrap.style.alignItems = 'center';
      const e = document.createElement('input');
      e.type = 'range';
      e.min = min;
      e.max = max;
      e.step = step;
      e.value = s.get(key);
      const v = el('span', 'val', fmt(s.get(key)));
      e.oninput = () => {
        s.set(key, Number(e.value));
        v.textContent = fmt(Number(e.value));
      };
      wrap.append(e, v);
      return wrap;
    };
    const check = (key) => {
      const e = document.createElement('input');
      e.type = 'checkbox';
      e.checked = !!s.get(key);
      e.onchange = () => s.set(key, e.checked);
      return e;
    };
    this.body.append(el('h3', '', 'Графика'));
    row('Качество', select('quality', [['low', 'Низкое (слабый компьютер)'], ['medium', 'Среднее'], ['high', 'Высокое']]));
    row('Дальность прорисовки', range('viewDistance', 400, 1600, 50, (v) => `${v} м`));
    row('Тени', check('shadows'));
    row('Показывать FPS', check('showFps'));
    this.body.append(el('h3', '', 'Звук'));
    row('Громкость', range('volume', 0, 1, 0.05, (v) => `${Math.round(v * 100)}%`));
    row('Радио', range('musicVolume', 0, 1, 0.05, (v) => `${Math.round(v * 100)}%`));
    row('Озвучка радио (если есть русский голос)', check('radioVoice'));
    this.body.append(el('h3', '', 'Управление и время'));
    row('Чувствительность мыши', range('mouseSens', 0.3, 2.5, 0.1, (v) => v.toFixed(1)));
    row('Инвертировать ось Y', check('invertY'));
    row('Длина суток', select('dayLength', [[12, '12 минут'], [24, '24 минуты'], [48, '48 минут']]));

    this.footer.innerHTML = '';
    const reset = el('button', '', 'По умолчанию');
    reset.onclick = () => {
      s.reset();
      this.render();
    };
    const ok = el('button', 'primary', 'Готово');
    ok.onclick = () => this.close();
    this.footer.append(reset, ok);
  }
}
