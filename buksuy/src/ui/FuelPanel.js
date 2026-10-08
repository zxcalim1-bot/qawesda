import { Panel, el } from './UIManager.js';
import { FUEL_PRICE } from '../systems/Economy.js';
import { escapeHtml } from '../core/util.js';

// Заправка: в бак и в канистру.
export class FuelPanel extends Panel {
  constructor(game, station) {
    super(game.ui, { title: 'ЗАПРАВКА', size: 'narrow' });
    this.game = game;
    this.station = station;
    this.liters = 10;
    this.msg = '';
  }

  render() {
    const g = this.game;
    const car = g.vehicle;
    const fuel = car.fuel;
    const near = Math.hypot(car.pos.x - g.playerPos.x, car.pos.z - g.playerPos.z) < 9;
    this.body.innerHTML = '';

    if (this.station === 'old_gas') {
      const used = g.worldInteractions.used.has('old_gas_pump');
      this.setTitle('СТАРАЯ КОЛОНКА');
      this.body.append(el('p', '', used
        ? 'Ручной насос сипит и выплёвывает воздух. Всё, что было в подземной ёмкости, ты уже выкачал.'
        : 'Колонка мертва, но сбоку торчит ручной насос. Если покачать, из подземной ёмкости, может, что-то и поднимется.'));
      this.footer.innerHTML = '';
      const b = el('button', 'primary', 'Качать (≈15 л, 20 минут)');
      b.disabled = used || !near;
      b.onclick = () => {
        g.worldInteractions.used.add('old_gas_pump');
        g.passTime(20);
        g.needs.spend(8);
        const added = fuel.refuel(15);
        const rest = 15 - added;
        let extra = '';
        if (rest > 0.5) {
          const can = g.inventory.canister(false, true);
          if (can) {
            const space = 20 - (can.state?.fuel ?? 0);
            const put = Math.min(space, rest);
            can.state = { fuel: (can.state?.fuel ?? 0) + put };
            extra = ` Остаток (${put.toFixed(1)} л) — в канистру.`;
          }
        }
        this.msg = `Накачал ${added.toFixed(1)} л. Пахнет старым бензином, но горит.${extra}`;
        g.audio.play('pour');
        g.ui.notify(this.msg, 'good');
        this.render();
      };
      if (!near) this.footer.append(el('div', 'grow', 'Подгони машину к колонке.'));
      this.footer.append(b);
      const c = el('button', '', 'Уйти');
      c.onclick = () => this.close();
      this.footer.append(c);
      return;
    }

    const price = FUEL_PRICE[this.station] || 55;
    const space = Math.max(0, fuel.capacity - fuel.liters);
    this.body.append(el('p', 'hint', `АИ-76 — <b>${price} ₽/л</b>. В баке: ${fuel.liters.toFixed(1)} из ${fuel.capacity} л. Денег: ${g.inventory.money} ₽.`));
    if (g.vehicle.engine.on && this.station === 'kolos') {
      this.body.append(el('p', '', '<i>Люда из окошка: «Мотор заглуши, гонщик! Взлетим тут все.»</i>'));
    }
    const row = el('div', 'row');
    row.append(el('div', 'name', 'Литров'));
    const range = document.createElement('input');
    range.type = 'range';
    range.min = 1;
    range.max = Math.max(1, Math.ceil(space));
    range.value = Math.min(this.liters, range.max);
    const val = el('div', 'val', '');
    const upd = () => {
      this.liters = Number(range.value);
      val.textContent = `${this.liters} л = ${this.liters * price} ₽`;
    };
    range.oninput = upd;
    upd();
    row.append(range, val);
    this.body.append(row);

    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    const full = el('button', '', 'До полного');
    full.disabled = space < 0.5 || !near;
    full.onclick = () => {
      const can = Math.floor(g.inventory.money / price);
      range.value = Math.min(Math.ceil(space), can);
      upd();
    };
    const pay = el('button', 'primary', 'Залить в бак');
    pay.disabled = space < 0.5 || !near;
    pay.onclick = () => this._fill('tank', price);
    const canBtn = el('button', '', 'Наполнить канистру');
    const can = g.inventory.canister(false, near);
    canBtn.disabled = !can || (can.state?.fuel ?? 0) > 19.5;
    canBtn.onclick = () => this._fill('canister', price);
    if (!near) this.footer.append(el('div', 'hint', 'Машина далеко от колонки.'));
    this.footer.append(full, pay, canBtn);
  }

  _fill(where, price) {
    const g = this.game;
    let liters = this.liters;
    if (where === 'canister') {
      const can = g.inventory.canister(false, true);
      liters = Math.min(liters, 20 - (can.state?.fuel ?? 0));
    } else {
      liters = Math.min(liters, g.vehicle.fuel.capacity - g.vehicle.fuel.liters);
    }
    liters = Math.max(0, Math.floor(liters * 10) / 10);
    const cost = Math.ceil(liters * price);
    if (!g.inventory.canAfford(cost)) {
      this.msg = 'Денег не хватает. Люда сочувственно жуёт жвачку.';
      this.render();
      return;
    }
    if (liters <= 0) return;
    g.inventory.addMoney(-cost, 'бензин');
    if (where === 'canister') {
      const can = g.inventory.canister(false, true);
      can.state = { fuel: (can.state?.fuel ?? 0) + liters };
    } else {
      g.vehicle.fuel.refuel(liters);
    }
    g.passTime(4);
    g.audio.play('pour');
    g.events.emit('refuel', { liters, where, station: this.station });
    this.msg = `Залито ${liters} л за ${cost} ₽.`;
    this.render();
  }
}
