// Всё, что можно сделать клавишей рядом с чем-то: «[E] Поговорить», «[E] Заправиться»…
// def: { x, z, r, label, key, mode: 'foot'|'car'|'any', when(), action(), hold, pos() }

export class Interactions {
  constructor(game) {
    this.game = game;
    this.list = new Set();
    this.providers = []; // функции, возвращающие динамические варианты (машина, обломки)
    this.current = null;
    this.holdT = 0;
    this.holding = null;
  }

  add(def) {
    def.key = def.key || 'interact';
    def.mode = def.mode || 'foot';
    this.list.add(def);
    return def;
  }

  remove(def) {
    this.list.delete(def);
  }

  provide(fn) {
    this.providers.push(fn);
  }

  _candidates() {
    const out = [...this.list];
    for (const p of this.providers) {
      const r = p();
      if (r) out.push(...r);
    }
    return out;
  }

  update(dt) {
    const g = this.game;
    const ui = g.ui;
    if (ui.modal || g.state !== 'playing') {
      this.current = null;
      ui.prompt(null);
      return;
    }
    const inCar = g.player.inCar;
    const px = inCar ? g.vehicle.pos.x : g.player.pos.x;
    const pz = inCar ? g.vehicle.pos.z : g.player.pos.z;
    const py = inCar ? g.vehicle.pos.y : g.player.pos.y;

    // по одной лучшей подсказке на каждую клавишу
    const best = new Map();
    for (const d of this._candidates()) {
      if (d.mode === 'foot' && inCar) continue;
      if (d.mode === 'car' && !inCar) continue;
      if (d.when && !d.when()) continue;
      const p = d.pos ? d.pos() : d;
      const dist = Math.hypot(p.x - px, p.z - pz);
      if (dist > (d.r ?? 2.5)) continue;
      if (p.y !== undefined && Math.abs(p.y - py) > 4) continue;
      const score = dist - (d.priority || 0);
      const cur = best.get(d.key);
      if (!cur || score < cur.score) best.set(d.key, { d, score });
    }
    const shown = [...best.values()].map((b) => b.d);
    this.current = shown;

    const input = g.input;
    for (const d of shown) {
      if (d.hold) {
        if (input.down(d.key)) {
          if (this.holding !== d) {
            this.holding = d;
            this.holdT = 0;
          }
          this.holdT += dt;
          if (this.holdT >= d.hold) {
            this.holding = null;
            this.holdT = 0;
            d.action();
          }
        } else if (this.holding === d) {
          this.holding = null;
          this.holdT = 0;
        }
      } else if (input.pressed(d.key)) {
        d.action();
        break;
      }
    }
    ui.prompt(shown.map((d) => ({
      key: d.key,
      label: typeof d.label === 'function' ? d.label() : d.label,
      progress: this.holding === d ? this.holdT / d.hold : 0,
      hold: !!d.hold,
    })));
  }
}
