import { Panel, el } from './UIManager.js';
import { NOTES } from '../data/places.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { escapeHtml, fmtClock, fmtDist, fmtMoney } from '../core/util.js';

const TABS = [
  ['quests', 'Задания'],
  ['notes', 'Записки'],
  ['radio', 'Радио'],
  ['achievements', 'Достижения'],
  ['stats', 'Статистика'],
  ['keys', 'Управление'],
];

export class JournalPanel extends Panel {
  constructor(game, tab = 'quests') {
    super(game.ui, { title: 'ЖУРНАЛ', size: 'wide', tabs: true });
    this.game = game;
    this.tab = tab;
  }

  onKey(e) {
    if (e.code === 'KeyJ') {
      this.close();
      return true;
    }
    return false;
  }

  render() {
    this.tabs.innerHTML = '';
    for (const [id, label] of TABS) {
      const b = el('button', this.tab === id ? 'on' : '', label);
      b.onclick = () => {
        this.tab = id;
        this.render();
      };
      this.tabs.append(b);
    }
    this.body.innerHTML = '';
    this[`_${this.tab}`]();
    this.footer.innerHTML = '';
    const c = el('button', '', 'Закрыть');
    c.onclick = () => this.close();
    this.footer.append(c);
  }

  _quests() {
    const g = this.game;
    const list = g.quests.list();
    const act = list.filter((q) => !q.done);
    const done = list.filter((q) => q.done);
    this.body.append(el('h3', '', 'Активные'));
    if (!act.length) this.body.append(el('div', 'hint', 'Нет заданий. Езжай на север.'));
    for (const q of act) this.body.append(el('div', 'row', `<div class="name"><b>${escapeHtml(q.def.title)}</b><small>${escapeHtml(q.text)}</small></div>`));
    if (done.length) {
      this.body.append(el('h3', '', 'Выполненные'));
      for (const q of done) this.body.append(el('div', 'row', `<div class="name" style="opacity:.6">✔ ${escapeHtml(q.def.title)}</div>`));
    }
  }

  _notes() {
    const g = this.game;
    const read = [...g.story.readNotes].filter((id) => NOTES[id]);
    this.body.append(el('div', 'hint', `Улик о прошлом Ласточки: ${g.story.clueCount()} из ${g.story.clueTotal()}`));
    if (!read.length) this.body.append(el('p', 'hint', 'Пока ничего не найдено. Загляни в бардачок (B), в заброшенные дома, послушай странное радио.'));
    for (const id of read) {
      const n = NOTES[id];
      const box = el('div');
      box.append(el('h3', '', `${n.clue ? '🔎 ' : ''}${escapeHtml(n.title)}`));
      box.append(el('div', 'note-text', escapeHtml(n.text)));
      this.body.append(box);
    }
  }

  _radio() {
    const g = this.game;
    const log = g.radio.log.slice().reverse();
    if (!log.length) this.body.append(el('p', 'hint', 'Радио ещё не слушал. R — включить и переключить станцию, Shift+R — выключить.'));
    for (const l of log) {
      this.body.append(el('div', 'row', `<div class="name"><small>День ${l.day}, ${fmtClock(l.time)} · ${escapeHtml(l.station)}</small>${escapeHtml(l.text)}</div>`));
    }
  }

  _achievements() {
    const g = this.game;
    const grid = el('div', 'ach');
    for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
      const got = g.achievements.unlocked.has(id);
      grid.append(el('div', got ? '' : 'locked', `<b>${got ? a.icon : '🔒'} ${escapeHtml(a.title)}</b><small>${escapeHtml(a.desc)}</small>`));
    }
    this.body.append(el('div', 'hint', `Открыто: ${g.achievements.unlocked.size} из ${Object.keys(ACHIEVEMENTS).length}`));
    this.body.append(grid);
  }

  _stats() {
    const g = this.game;
    const s = g.achievements.stats;
    const car = g.vehicle;
    const rows = [
      ['В пути', `${Math.floor(g.playTime / 60)} мин (день ${g.world.dayNight.day})`],
      ['Проехано', fmtDist(s.distance)],
      ['Сожжено бензина', `${car.fuel.totalUsed.toFixed(1)} л`],
      ['Ремонтов своими руками', s.repairs],
      ['Отвалилось деталей', car.damage.lostParts],
      ['Обыскано мест', s.searched],
      ['Разобрано машин (деталей)', s.stripped],
      ['Попутчиков довезено', s.passengers],
      ['Самый долгий полёт', `${s.maxAir.toFixed(2)} с`],
      ['Общее состояние машины', `${Math.round(car.damage.overall())}%`],
      ['Деньги', fmtMoney(g.inventory.money)],
      ['Открыто карты', `${Math.round(g.map.revealedFraction() * 100)}%`],
    ];
    for (const [k, v] of rows) this.body.append(el('div', 'row', `<div class="name">${k}</div><div class="val">${escapeHtml(String(v))}</div>`));
  }

  _keys() {
    const keys = [
      ['W / S', 'газ / тормоз и задний ход'], ['A / D', 'руль'], ['Пробел', 'ручник (пешком — прыжок)'],
      ['F', 'сесть / выйти'], ['E', 'действие, разговор'], ['Q', 'завести / заглушить'],
      ['L', 'фары'], ['R', 'радио: станция'], ['Shift+R', 'радио: выключить'], ['H', 'гудок'],
      ['C', 'камера'], ['B', 'бардачок'], ['Z', 'поспать в машине'], ['G (держать)', 'толкать машину'],
      ['Tab / I', 'вещи и багажник'], ['M', 'карта'], ['J', 'журнал'], ['Esc / P', 'пауза'],
      ['F5 / F9', 'быстрое сохранение / загрузка'], ['Shift', 'бег'], ['Мышь', 'обзор (клик — захват курсора)'],
    ];
    const box = el('div', 'keys');
    for (const [k, v] of keys) box.append(el('div', '', `<kbd>${k}</kbd>${v}`));
    this.body.append(box);
    this.body.append(el('p', 'hint', 'Советы: в грязи не газуй до упора — качай машину вперёд-назад. Если машина не заводится, а аккумулятор сел — разгони её под горку или потолкай (G) и нажми Q на ходу. Капот (E у передка машины) — там весь ремонт.'));
  }
}
