import { Panel, el } from './UIManager.js';
import { escapeHtml } from '../core/util.js';

function fmtDate(t) {
  const d = new Date(t);
  return `${d.toLocaleDateString('ru-RU')} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

function fmtPlay(sec) {
  const m = Math.floor((sec || 0) / 60);
  return m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч ${m % 60} мин`;
}

export class SaveLoadPanel extends Panel {
  constructor(game, mode = 'load') {
    super(game.ui, { title: mode === 'save' ? 'СОХРАНИТЬ' : 'ЗАГРУЗИТЬ', size: 'narrow' });
    this.game = game;
    this.mode = mode;
    this.msg = '';
  }

  render() {
    const g = this.game;
    const saves = g.saves;
    this.body.innerHTML = '';
    for (const s of saves.list()) {
      if (this.mode === 'save' && (s.slot === 'auto' || s.slot === 'quick')) continue;
      const row = el('div', 'row');
      const info = s.data ? `${escapeHtml(s.data.place || '')}<small>${fmtDate(s.data.time)} · в пути ${fmtPlay(s.data.playTime)}</small>` : '<small>пусто</small>';
      row.append(el('div', 'name', `<b>${escapeHtml(s.name)}</b><br>${info}`));
      if (this.mode === 'save') {
        const b = el('button', 'primary', s.data ? 'Перезаписать' : 'Сохранить');
        b.onclick = () => {
          saves.save(s.slot);
          this.render();
        };
        row.append(b);
      } else {
        const b = el('button', 'primary', 'Загрузить');
        b.disabled = !s.data;
        b.onclick = () => {
          this.game.ui.closeAll();
          this.game.loadGame(s.slot);
        };
        row.append(b);
      }
      if (s.data) {
        const ex = el('button', '', '⇩');
        ex.title = 'Скачать файл сохранения';
        ex.onclick = () => saves.exportSlot(s.slot);
        row.append(ex);
      }
      this.body.append(row);
    }
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    if (this.mode === 'load') {
      const imp = el('button', '', 'Загрузить из файла…');
      imp.onclick = () => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = '.json,application/json';
        inp.onchange = async () => {
          const f = inp.files[0];
          if (!f) return;
          try {
            saves.importToSlot('3', await f.text());
            this.msg = 'Файл загружен в «Слот 3».';
          } catch (err) {
            this.msg = `Ошибка: ${err.message}`;
          }
          this.render();
        };
        inp.click();
      };
      this.footer.append(imp);
    }
    const c = el('button', '', 'Назад');
    c.onclick = () => this.close();
    this.footer.append(c);
  }
}
