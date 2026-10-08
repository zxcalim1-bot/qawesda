import { Panel, el } from './UIManager.js';
import { CONTAINERS, WRECKS, WRECK_PARTS } from '../data/places.js';
import { ITEMS } from '../data/items.js';
import { escapeHtml } from '../core/util.js';

// Обыск места
export class LootPanel extends Panel {
  constructor(game, id, first) {
    super(game.ui, { title: CONTAINERS[id].name.toUpperCase(), size: 'narrow' });
    this.game = game;
    this.id = id;
    this.first = first;
    this.msg = first ? `Обыск занял ${CONTAINERS[id].time} мин.` : '';
  }

  render() {
    const g = this.game;
    const c = CONTAINERS[this.id];
    const left = g.worldInteractions.left[this.id] || [];
    this.body.innerHTML = '';
    this.body.append(el('p', '', escapeHtml(c.text)));
    this.body.append(el('h3', '', 'Найдено'));
    if (!left.length) this.body.append(el('div', 'hint', 'Больше ничего полезного.'));
    left.forEach((l, i) => {
      const it = ITEMS[l.item];
      const row = el('div', 'slot');
      const extra = l.state?.fuel !== undefined ? ` (${l.state.fuel} л)` : '';
      row.append(el('div', 'ic', it.icon), el('div', 'nm', `${escapeHtml(it.name)}${(l.n || 1) > 1 ? ' ×' + l.n : ''}${extra}<small>${escapeHtml(it.desc || '')}</small>`), el('div', 'sz', `${it.size}`));
      const b = el('button', 'primary', 'Взять');
      b.onclick = () => {
        const r = g.worldInteractions.takeLoot(this.id, i);
        this.msg = r?.text || '';
        if (r?.ok) g.audio.play('pickup');
        this.render();
      };
      row.append(b);
      this.body.append(row);
    });
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    if (left.length > 1) {
      const all = el('button', '', 'Взять всё');
      all.onclick = () => {
        const msgs = [];
        for (let i = (g.worldInteractions.left[this.id] || []).length - 1; i >= 0; i--) {
          const r = g.worldInteractions.takeLoot(this.id, i);
          if (r && !r.ok) msgs.push(r.text);
        }
        this.msg = msgs[0] || 'Забрал всё, что смог.';
        g.audio.play('pickup');
        this.render();
      };
      this.footer.append(all);
    }
    const close = el('button', '', 'Уйти');
    close.onclick = () => this.close();
    this.footer.append(close);
  }
}

// Разборка брошенной машины
export class StripPanel extends Panel {
  constructor(game, id) {
    super(game.ui, { title: WRECKS[id].name.toUpperCase(), size: 'narrow' });
    this.game = game;
    this.id = id;
    this.msg = '';
  }

  render() {
    const g = this.game;
    const wi = g.worldInteractions;
    const parts = wi.wreckLeft(this.id);
    const tools = g.inventory.has('toolkit', 1, true);
    this.body.innerHTML = '';
    this.body.append(el('p', 'hint', tools
      ? 'Можно снять, что ещё держится. Хозяину, судя по ржавчине, уже всё равно.'
      : 'Без набора инструментов отсюда ничего не открутить.'));
    if (!parts.length) this.body.append(el('div', 'hint', 'Разобрано подчистую. Остался скелет и запах.'));
    const seen = new Map();
    for (const p of parts) seen.set(p, (seen.get(p) || 0) + 1);
    for (const [key, n] of seen) {
      const def = WRECK_PARTS[key];
      const it = ITEMS[def.item];
      const row = el('div', 'slot');
      row.append(el('div', 'ic', it.icon), el('div', 'nm', `${escapeHtml(def.name)}${n > 1 ? ' ×' + n : ''}<small>${def.time} мин работы · место: ${it.size}</small>`));
      const b = el('button', 'primary', 'Снять');
      b.disabled = !tools;
      b.onclick = () => {
        const r = wi.strip(this.id, key, def);
        this.msg = r.text;
        g.audio.play(r.ok ? 'wrench' : 'error');
        this.render();
      };
      row.append(b);
      this.body.append(row);
    }
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    const close = el('button', '', 'Отойти');
    close.onclick = () => this.close();
    this.footer.append(close);
  }
}

// Простое окно с текстом (записка, сообщение)
export class TextPanel extends Panel {
  constructor(game, title, text, opts = {}) {
    super(game.ui, { title, size: 'narrow' });
    this.game = game;
    this.text = text;
    this.paper = opts.paper !== false;
    this.buttons = opts.buttons || [{ label: 'Закрыть', action: () => this.close() }];
  }

  render() {
    this.body.innerHTML = '';
    this.body.append(el('div', this.paper ? 'note-text' : '', escapeHtml(this.text)));
    this.footer.innerHTML = '';
    for (const b of this.buttons) {
      const e = el('button', b.primary ? 'primary' : '', escapeHtml(b.label));
      e.onclick = () => b.action(this);
      this.footer.append(e);
    }
  }
}
