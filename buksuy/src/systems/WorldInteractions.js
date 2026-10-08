import * as THREE from 'three';
import { CONTAINERS, WRECKS } from '../data/places.js';
import { ITEMS } from '../data/items.js';
import { RepairPanel } from '../ui/RepairPanel.js';
import { TrunkPanel } from '../ui/TrunkPanel.js';
import { FuelPanel } from '../ui/FuelPanel.js';
import { ShopPanel } from '../ui/ShopPanel.js';
import { LootPanel, StripPanel } from '../ui/LootPanel.js';

const _v = new THREE.Vector3();

// Связывает точки интереса мира с игровыми действиями.
export class WorldInteractions {
  constructor(game) {
    this.game = game;
    this.left = {}; // что осталось в обысканных местах
    this.stripped = {};
    this.used = new Set();
    this._setup();
  }

  reset() {
    this.left = {};
    this.stripped = {};
    this.used = new Set();
  }

  _setup() {
    const g = this.game;
    const I = g.interactions;
    for (const s of g.world.structures.spots) {
      switch (s.type) {
        case 'container': {
          const c = CONTAINERS[s.id];
          I.add({
            x: s.x, z: s.z, r: s.r,
            label: () => (this.isEmpty(s.id) ? `${c.name} — пусто` : `Обыскать: ${c.name}`),
            action: () => this.search(s.id),
          });
          break;
        }
        case 'wreck': {
          const w = WRECKS[s.id];
          I.add({
            x: s.x, z: s.z, r: s.r,
            label: () => (this.wreckLeft(s.id).length ? `Осмотреть: ${w.name}` : `${w.name} — разобрана`),
            action: () => new StripPanel(g, s.id).open(),
          });
          break;
        }
        case 'note':
          I.add({ x: s.x, z: s.z, r: s.r, label: s.label, action: () => g.story.read(s.id) });
          break;
        case 'pump':
          I.add({ x: s.x, z: s.z, r: s.r, mode: 'any', label: 'Заправка', priority: 1, action: () => new FuelPanel(g, s.station).open() });
          break;
        case 'shop':
          I.add({ x: s.x, z: s.z, r: s.r, label: s.label, action: () => new ShopPanel(g, s.shop).open() });
          break;
        case 'sleep':
          I.add({ x: s.x, z: s.z, r: s.r, label: s.label, action: () => g.needs.trySleep('bed', s.price) });
          break;
        case 'transmitter':
          I.add({ x: s.x, z: s.z, r: s.r, label: s.label, action: () => g.story.transmitter() });
          break;
        default:
      }
    }
    I.provide(() => this._car());
    I.provide(() => this._debris());
  }

  // ---------- машина ----------
  _car() {
    const g = this.game;
    const car = g.vehicle;
    if (g.player.inCar) return null;
    const p = g.player.pos;
    if (Math.hypot(car.pos.x - p.x, car.pos.z - p.z) > 6) return null;
    const out = [];
    if (car.flipped || car.up.y < 0.45) {
      out.push({
        key: 'interact', r: 4.5, hold: 2.2, label: 'Поставить машину на колёса',
        pos: () => car.pos,
        action: () => {
          car.flipUpright();
          g.passTime(10);
          g.needs.spend(10);
          g.ui.notify('Раскачал, поднажал… Ласточка снова на колёсах!', 'good');
          g.achievements.count('flips_fixed');
        },
      });
      return out;
    }
    out.push({
      key: 'interact', r: 1.9, label: 'Открыть капот (ремонт)',
      pos: () => car.worldPoint(0, 0, 2.75, _v),
      action: () => new RepairPanel(g).open(),
    });
    out.push({
      key: 'interact', r: 1.9, label: 'Открыть багажник',
      pos: () => car.worldPoint(0, 0, -2.75, _v),
      action: () => new TrunkPanel(g, { mode: 'trunk' }).open(),
    });
    out.push({ key: 'enter', r: 3.4, label: 'Сесть за руль', pos: () => car.pos, action: () => {} });
    out.push({ key: 'push', r: 3.3, label: 'Толкать машину', pos: () => car.pos, action: () => {} });
    return out;
  }

  // ---------- обломки ----------
  _debris() {
    const g = this.game;
    if (g.player.inCar) return null;
    const d = g.debris.nearest(g.player.pos.x, g.player.pos.z, 2.6);
    if (!d) return null;
    return [{
      key: 'interact', r: 2.6, label: `Подобрать: ${d.name}`,
      pos: () => d.obj.position,
      action: () => this.pickup(d),
    }];
  }

  pickup(d) {
    const g = this.game;
    const where = g.inventory.give(d.itemId, 1, d.state || null, 'trunk', g.nearCar);
    if (!where) {
      g.ui.notify(g.nearCar ? 'В багажнике нет места.' : `${d.name} — тяжело. Подгони машину поближе или освободи руки.`, 'warn');
      return;
    }
    g.debris.remove(d);
    g.ui.notify(`${ITEMS[d.itemId].icon} ${d.name} → ${where.name.toLowerCase()}`);
  }

  // ---------- обыск ----------
  isEmpty(id) {
    const left = this.left[id];
    return left !== undefined && left.length === 0;
  }

  search(id) {
    const g = this.game;
    const c = CONTAINERS[id];
    const night = g.world.dayNight.darkness > 0.6;
    if (c.needFlag && !g.story.hasFlag(c.needFlag) && !(c.nightOk && night)) {
      g.ui.notify(c.lockedText || 'Заперто.', 'warn');
      return;
    }
    if (c.needItem && !g.inventory.has(c.needItem, 1, true)) {
      g.ui.notify(c.lockedText || 'Заперто.', 'warn');
      return;
    }
    const first = this.left[id] === undefined;
    if (first) {
      this.left[id] = c.loot.map((l) => ({ ...l }));
      g.passTime(c.time);
      if (c.money) {
        g.inventory.addMoney(c.money, 'находка');
        g.ui.notify(`Нашёл ${c.money} ₽`, 'good');
      }
      if (c.note) g.story.addClueFromNote(c.note);
      g.achievements.count('searched');
      g.events.emit('searched', { id });
      if (c.needFlag && !g.story.hasFlag(c.needFlag) && c.nightOk) g.story.setFlag('factory_sneaked');
    }
    new LootPanel(g, id, first).open();
  }

  takeLoot(id, idx) {
    const g = this.game;
    const left = this.left[id];
    const l = left?.[idx];
    if (!l) return null;
    const where = g.inventory.give(l.item, l.n || 1, l.state || null, 'trunk', g.nearCar);
    if (!where) return { ok: false, text: g.nearCar ? 'Багажник забит.' : 'Не помещается. Подгони машину.' };
    left.splice(idx, 1);
    g.events.emit('item-found', { item: l.item, source: id });
    return { ok: true, text: `${ITEMS[l.item].icon} ${ITEMS[l.item].name} → ${where.name.toLowerCase()}` };
  }

  // ---------- разборка ----------
  wreckLeft(id) {
    const taken = this.stripped[id] || [];
    const all = [...WRECKS[id].parts];
    for (const t of taken) {
      const i = all.indexOf(t);
      if (i >= 0) all.splice(i, 1);
    }
    return all;
  }

  strip(id, partKey, def) {
    const g = this.game;
    if (def.fuel) return this._siphon(id, partKey, def);
    if (!g.inventory.has('toolkit', 1, true)) return { ok: false, text: 'Без инструментов тут делать нечего.' };
    const where = g.inventory.give(def.item, 1, null, 'trunk', g.nearCar);
    if (!where) return { ok: false, text: 'Некуда положить.' };
    (this.stripped[id] || (this.stripped[id] = [])).push(partKey);
    g.passTime(def.time);
    g.achievements.count('stripped');
    const w = WRECKS[id];
    if (w.note && !g.story.noteRead(w.note)) g.story.read(w.note);
    return { ok: true, text: `Снял: ${def.name} (${def.time} мин) → ${where.name.toLowerCase()}` };
  }

  // старый народный способ: шланг, рот и немного бензина в желудке
  _siphon(id, partKey, def) {
    const g = this.game;
    const liters = 2 + Math.round(Math.random() * 4);
    const car = g.vehicle;
    const carNear = Math.hypot(car.pos.x - g.player.pos.x, car.pos.z - g.player.pos.z) < 8;
    let text;
    if (carNear) {
      const added = car.fuel.refuel(liters);
      text = `Слил ${added.toFixed(0)} л прямо в бак Ласточки. Во рту вкус бензина. Стоило того.`;
    } else {
      const can = g.inventory.canister(false, true);
      if (!can) return { ok: false, text: 'Сливать некуда: подгони машину или принеси канистру.' };
      can.state = { fuel: Math.min(20, (can.state?.fuel ?? 0) + liters) };
      text = `Слил ${liters} л в канистру.`;
    }
    (this.stripped[id] || (this.stripped[id] = [])).push(partKey);
    g.passTime(def.time);
    g.needs.spend(3);
    return { ok: true, text };
  }

  serialize() {
    return { left: this.left, stripped: this.stripped, used: [...this.used] };
  }

  deserialize(d) {
    this.left = d?.left || {};
    this.stripped = d?.stripped || {};
    this.used = new Set(d?.used || []);
  }
}
