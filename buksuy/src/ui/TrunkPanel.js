import { Panel, el } from './UIManager.js';
import { ITEMS, itemDesc } from '../data/items.js';
import { escapeHtml } from '../core/util.js';

// Багажник и вещи «при себе». Переложить, съесть, залить из канистры, выбросить.
export class TrunkPanel extends Panel {
  constructor(game, opts = {}) {
    super(game.ui, { title: opts.mode === 'trunk' ? 'БАГАЖНИК' : 'ВЕЩИ', size: 'wide' });
    this.game = game;
    this.mode = opts.mode || 'trunk';
    this.msg = '';
  }

  open() {
    if (this.mode === 'trunk' && !this.game.player.inCar) {
      this.game.vehicle.trunkOpen = true;
      this.game.audio.play('trunk');
    }
    return super.open();
  }

  onClose() {
    this.game.vehicle.trunkOpen = false;
  }

  onKey(e) {
    if (e.code === 'Tab' || e.code === 'KeyI') {
      this.close();
      return true;
    }
    return false;
  }

  render() {
    const g = this.game;
    const inv = g.inventory;
    const near = g.player.nearCar(4.5);
    this.body.innerHTML = '';
    const head = el('div', 'hint', `Деньги: <b style="color:var(--accent2)">${inv.money} ₽</b> · силы: ${Math.round(g.needs.energy)}%` +
      (near ? '' : ' · <span class="tag">машина далеко — багажник недоступен</span>'));
    this.body.append(head);
    const cols = el('div', 'cols');
    cols.append(this._container(inv.pockets, inv.trunk, near, 'pockets'));
    if (near) cols.append(this._container(inv.trunk, inv.pockets, near, 'trunk'));
    this.body.append(cols);

    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg || 'Место считается по размеру вещей. Канистра — 2, колесо — 3, дверь — 4.')));
    const b = el('button', '', 'Закрыть');
    b.onclick = () => this.close();
    this.footer.append(b);
  }

  _container(c, other, near, kind) {
    const g = this.game;
    const box = el('div');
    box.append(el('h3', '', `${c.name} <span class="cap">${c.used()}/${c.capacity}</span>`));
    const list = el('div', 'slots');
    if (!c.slots.length) list.append(el('div', 'hint', 'Пусто.'));
    for (const s of c.slots) {
      const it = ITEMS[s.id];
      const slot = el('div', 'slot');
      const count = s.count > 1 ? ` ×${s.count}` : '';
      const extra = s.id === 'canister' ? ` (${(s.state?.fuel ?? 0).toFixed(1)} л)` : '';
      slot.append(el('div', 'ic', it.icon));
      slot.append(el('div', 'nm', `${escapeHtml(it.name)}${count}${extra}<small>${escapeHtml(itemDesc(s.id, s.state))}</small>`));
      slot.append(el('div', 'sz', `${it.size}`));
      const btns = [];
      if (it.food) btns.push(['Съесть', () => {
        c.remove(s.id, 1);
        g.needs.eat(s.id);
        g.audio.play('eat');
        return `${it.name}: съедено. Силы ${Math.round(g.needs.energy)}%.`;
      }]);
      if (s.id === 'canister' && near && (s.state?.fuel ?? 0) > 0.1) btns.push(['Залить в бак', () => {
        const added = g.vehicle.fuel.refuel(s.state.fuel);
        s.state.fuel -= added;
        g.audio.play('pour');
        g.passTime(3);
        return `Залил ${added.toFixed(1)} л. В баке ${Math.round(g.vehicle.fuel.fraction * 100)}%.`;
      }]);
      if (near) btns.push([kind === 'trunk' ? '→ С собой' : '→ В багажник', () => {
        if (!other.canAdd(s.id, 1)) return 'Не помещается.';
        if (s.state) {
          c.removeSlot(s);
          other.add(s.id, 1, s.state);
        } else {
          c.remove(s.id, 1);
          other.add(s.id, 1);
        }
        return '';
      }]);
      if (!it.quest) btns.push(['Выбросить', () => {
        if (s.state) c.removeSlot(s);
        else c.remove(s.id, 1);
        this._drop(s.id, s.state);
        return `${it.name}: выброшено.`;
      }]);
      for (const [label, fn] of btns) {
        const b = el('button', '', label);
        b.onclick = () => {
          this.msg = fn() || '';
          g.events.emit('inventory', {});
          this.render();
        };
        slot.append(b);
      }
      list.append(slot);
    }
    box.append(list);
    return box;
  }

  // выброшенное ложится на землю — можно поднять обратно
  _drop(id, state) {
    const g = this.game;
    const p = g.player.inCar ? g.vehicle.pos : g.player.pos;
    g.worldInteractions.dropItem?.(id, state, p.x + (Math.random() - 0.5) * 2, p.z + (Math.random() - 0.5) * 2);
  }
}
