import { Panel, el } from './UIManager.js';
import { escapeHtml, textBar } from '../core/util.js';
import { ITEMS } from '../data/items.js';

function barClass(v) {
  return v < 30 ? 'low' : v < 65 ? 'mid' : 'high';
}

// «Открыл капот». Состояние узлов и ремонт своими силами.
export class RepairPanel extends Panel {
  constructor(game) {
    super(game.ui, { title: 'ПОД КАПОТОМ', size: 'wide' });
    this.game = game;
    this.msg = '';
    this.filter = 'all';
  }

  open() {
    this.game.vehicle.hoodOpen = true;
    this.game.audio.play('hood');
    return super.open();
  }

  onClose() {
    this.game.vehicle.hoodOpen = false;
  }

  render() {
    const g = this.game;
    const rep = g.repair;
    const rows = rep.list();
    const groups = {
      engine: ['engine', 'oil', 'cooling', 'battery'],
      chassis: ['brakes', 'gearbox', 'clutch', 'suspension', 'fuelTank', 'exhaust'],
      wheels: ['wheelFL', 'wheelFR', 'wheelRL', 'wheelRR'],
      body: ['body', 'glass', 'headlightL', 'headlightR', 'hood', 'trunk', 'doorL', 'doorR', 'bumperF', 'bumperR', 'mirrorL', 'mirrorR'],
    };
    const titles = { engine: 'Двигатель', chassis: 'Ходовая и трансмиссия', wheels: 'Колёса', body: 'Кузов' };
    this.body.innerHTML = '';
    const top = el('div', 'hint', `Общее состояние: <b>${Math.round(g.vehicle.damage.overall())}%</b> · ` +
      `инструменты: ${rep.hasTools() ? '<span class="tag ok">есть</span>' : '<span class="tag">нет</span>'} · ` +
      `${escapeHtml(this._fluids())}`);
    this.body.append(top);
    const cols = el('div', 'cols');
    for (const [gid, ids] of Object.entries(groups)) {
      const box = el('div');
      box.append(el('h3', '', titles[gid]));
      for (const id of ids) {
        const r = rows.find((x) => x.id === id);
        if (!r) continue;
        box.append(this._row(r));
      }
      cols.append(box);
    }
    this.body.append(cols);

    this.footer.innerHTML = '';
    const info = el('div', 'grow', this.msg ? escapeHtml(this.msg) : 'Время на ремонт идёт по-настоящему: часы в углу не врут.');
    this.footer.append(info);
    const close = el('button', '', 'Закрыть капот');
    close.onclick = () => this.close();
    this.footer.append(close);
  }

  _fluids() {
    const d = this.game.vehicle.damage;
    return `масло ${Math.round(d.fluids.oil * 100)}% · антифриз ${Math.round(d.fluids.coolant * 100)}% · заряд ${Math.round(d.fluids.charge * 100)}% · t° ${Math.round(this.game.vehicle.engine.temp)}°`;
  }

  _row(r) {
    const row = el('div', 'row');
    const hp = Math.round(r.hp);
    const status = r.detached ? '<span class="tag">отвалилось</span>' : '';
    const probs = (r.problems || []).map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('');
    const extra = r.extraVal ? `<small>${escapeHtml(r.extraVal)}</small>` : '';
    row.append(el('div', 'name', `${escapeHtml(r.name)} ${status}${probs}${extra}`));
    row.append(el('div', `bar ${barClass(hp)}`, `[${textBar(hp)}] ${String(hp).padStart(3)}%`));
    const opts = r.options;
    if (opts.length) {
      const sel = el('div');
      sel.style.display = 'flex';
      sel.style.flexDirection = 'column';
      sel.style.gap = '3px';
      for (const o of opts) {
        const c = this.game.repair.check(o);
        const needs = o.needs.map(([it, n]) => `${ITEMS[it].icon}${n > 1 ? '×' + n : ''}`).join(' ') + (o.tools ? ' 🔧' : '');
        const b = el('button', c.ok ? '' : '', `${escapeHtml(o.label)} <small style="opacity:.7">${needs} · ${o.time}м</small>`);
        b.disabled = !c.ok;
        b.title = c.ok ? '' : `Не хватает: ${c.missing.join(', ')}`;
        b.onclick = () => {
          const res = this.game.repair.apply(r.id, o);
          this.msg = res.text;
          this.game.audio.play(res.ok ? 'wrench' : 'error');
          if (res.ok) this.game.ui.notify(res.text, 'good');
          this.render();
        };
        sel.append(b);
      }
      row.append(sel);
    }
    return row;
  }
}
