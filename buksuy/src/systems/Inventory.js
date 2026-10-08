import { ITEMS } from '../data/items.js';

// Два контейнера: багажник (машина) и карманы (на себе).
// Слот = { id, count, state? }. Ёмкость считается в «местах» (size * стопки).

export class Container {
  constructor(name, capacity) {
    this.name = name;
    this.capacity = capacity;
    this.slots = [];
  }

  used() {
    let u = 0;
    for (const s of this.slots) u += ITEMS[s.id].size * Math.ceil(s.count / (ITEMS[s.id].stack || 1));
    return u;
  }

  free() {
    return this.capacity - this.used();
  }

  count(id) {
    let c = 0;
    for (const s of this.slots) if (s.id === id) c += s.count;
    return c;
  }

  find(id) {
    return this.slots.find((s) => s.id === id);
  }

  // сколько места займёт добавление n штук
  costOf(id, n = 1) {
    const it = ITEMS[id];
    const stack = it.stack || 1;
    if (stack === 1) return it.size * n;
    const have = this.count(id);
    const before = Math.ceil(have / stack), after = Math.ceil((have + n) / stack);
    return (after - before) * it.size;
  }

  canAdd(id, n = 1) {
    return this.costOf(id, n) <= this.free();
  }

  add(id, n = 1, state = null) {
    if (!ITEMS[id] || !this.canAdd(id, n)) return false;
    const it = ITEMS[id];
    if ((it.stack || 1) > 1 && !state) {
      const s = this.find(id);
      if (s) s.count += n;
      else this.slots.push({ id, count: n });
    } else {
      for (let i = 0; i < n; i++) this.slots.push({ id, count: 1, state: state ? { ...state } : undefined });
    }
    return true;
  }

  remove(id, n = 1) {
    let left = n;
    for (let i = this.slots.length - 1; i >= 0 && left > 0; i--) {
      const s = this.slots[i];
      if (s.id !== id) continue;
      const take = Math.min(s.count, left);
      s.count -= take;
      left -= take;
      if (s.count <= 0) this.slots.splice(i, 1);
    }
    return n - left;
  }

  removeSlot(slot) {
    const i = this.slots.indexOf(slot);
    if (i >= 0) this.slots.splice(i, 1);
  }

  serialize() {
    return this.slots.map((s) => ({ ...s }));
  }

  deserialize(d) {
    this.slots = (d || []).filter((s) => ITEMS[s.id]).map((s) => ({ ...s }));
  }
}

export class Inventory {
  constructor(events) {
    this.events = events;
    this.trunk = new Container('Багажник', 12);
    this.pockets = new Container('При себе', 4);
    this.money = 1200;
  }

  reset() {
    this.trunk = new Container('Багажник', 12);
    this.pockets = new Container('При себе', 4);
    this.money = 1200;
    // что лежало у дяди Миши в багажнике
    this.trunk.add('toolkit');
    this.trunk.add('canister', 1, { fuel: 0 });
    this.trunk.add('tape', 2);
    this.trunk.add('food', 1);
    this.trunk.add('water', 2);
    this.trunk.add('parts', 1);
    this.pockets.add('food', 1);
  }

  setTrunkCapacity(cap) {
    this.trunk.capacity = cap;
  }

  // где искать вещи: карманы всегда, багажник — если машина рядом
  sources(nearCar) {
    return nearCar ? [this.pockets, this.trunk] : [this.pockets];
  }

  has(id, n = 1, nearCar = true) {
    return this.sources(nearCar).reduce((a, c) => a + c.count(id), 0) >= n;
  }

  count(id, nearCar = true) {
    return this.sources(nearCar).reduce((a, c) => a + c.count(id), 0);
  }

  take(id, n = 1, nearCar = true) {
    let left = n;
    for (const c of this.sources(nearCar)) {
      if (left <= 0) break;
      left -= c.remove(id, left);
    }
    if (n - left > 0) this.events?.emit('inventory', {});
    return n - left;
  }

  // положить: сначала куда просят, потом куда влезет
  give(id, n = 1, state = null, prefer = 'trunk', nearCar = true) {
    let order = prefer === 'pockets' ? [this.pockets, this.trunk] : [this.trunk, this.pockets];
    if (!nearCar) order = [this.pockets];
    for (const c of order) {
      if (c.add(id, n, state)) {
        this.events?.emit('inventory', {});
        return c;
      }
    }
    return null;
  }

  addMoney(v, reason = '') {
    this.money = Math.max(0, this.money + v);
    this.events?.emit('money', { delta: v, reason });
  }

  canAfford(v) {
    return this.money >= v;
  }

  // первая канистра с бензином (или пустая)
  canister(withFuel = true, nearCar = true) {
    for (const c of this.sources(nearCar)) {
      for (const s of c.slots) {
        if (s.id !== 'canister') continue;
        if (!withFuel || (s.state?.fuel ?? 0) > 0.1) return s;
      }
    }
    return null;
  }

  serialize() {
    return { trunk: this.trunk.serialize(), pockets: this.pockets.serialize(), money: this.money, trunkCap: this.trunk.capacity };
  }

  deserialize(d) {
    if (!d) return;
    this.trunk.deserialize(d.trunk);
    this.pockets.deserialize(d.pockets);
    this.money = d.money ?? 0;
    if (d.trunkCap) this.trunk.capacity = d.trunkCap;
  }
}
