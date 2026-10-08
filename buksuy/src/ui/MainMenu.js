import { el } from './UIManager.js';
import { SettingsPanel } from './SettingsPanel.js';
import { SaveLoadPanel } from './SaveLoadPanel.js';

const TAGLINES = [
  'Я просто хотел доехать до города…',
  'Заводится с третьего раза. Едет — всегда.',
  'Если хочешь узнать, что на севере — доедь.',
  'Колготки вместо ремня — это не баг, это фича.',
];

export class MainMenu {
  constructor(game) {
    this.game = game;
  }

  show() {
    const g = this.game;
    const title = 'БУКСУЙ'.split('').map((c) => `<span>${c}</span>`).join('');
    this.el = el('div', 'menu', `<h1>${title}</h1><div class="tagline">${TAGLINES[Math.floor(Math.random() * TAGLINES.length)]}</div>`);
    const items = el('div', 'items');
    const btn = (label, fn, disabled = false) => {
      const b = el('button', '', label);
      b.disabled = disabled;
      b.onclick = () => {
        g.audio.unlock();
        g.audio.play('click');
        fn();
      };
      items.append(b);
      return b;
    };
    btn('НОВАЯ ИГРА', () => g.newGame());
    const has = g.saves.hasAny();
    const cont = btn('ПРОДОЛЖИТЬ', () => g.loadGame(g.saves.latestSlot()), !has);
    if (has) cont.title = 'Загрузить последнее сохранение';
    btn('ЗАГРУЗИТЬ', () => new SaveLoadPanel(g, 'load').open(), !has);
    btn('НАСТРОЙКИ', () => new SettingsPanel(g).open());
    btn('ВЫХОД', () => this.exit());
    this.el.append(items);
    this.el.append(el('div', 'foot', 'WASD — ехать · E — действие · F — сесть/выйти · Q — завести · M — карта · Esc — пауза'));
    document.getElementById('ui').append(this.el);
  }

  hide() {
    this.el?.remove();
    this.el = null;
  }

  exit() {
    const g = this.game;
    // вкладку, открытую не скриптом, браузер закрыть не даст — тогда просто прощаемся
    try {
      window.close();
    } catch (_) { /* ну нет так нет */ }
    setTimeout(() => {
      if (!this.el) return;
      this.el.innerHTML = '';
      const box = el('div', '', `<h1 style="font-size:64px"><span>ПОКА</span></h1><p class="farewell">Ласточка подождёт. Она сорок лет ждала — подождёт ещё.</p><p style="color:#a99f8d">Вкладку можно закрыть.</p>`);
      const back = el('button', '', '← Вернуться');
      back.onclick = () => {
        this.hide();
        this.show();
      };
      this.el.append(box, back);
      g.audio.music?.stop();
    }, 150);
  }
}
