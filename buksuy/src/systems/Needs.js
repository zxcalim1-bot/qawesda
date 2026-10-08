import { ITEMS } from '../data/items.js';
import { clamp, chance } from '../core/util.js';

// Силы водителя. Не «выживач», а просто повод остановиться, поесть и поспать.
export class Needs {
  constructor(game) {
    this.game = game;
    this.energy = 100;
    this.drowsy = 0;
    this.blink = 0;
    this._blinkT = 0;
    this._warned = false;
  }

  reset() {
    this.energy = 92;
    this.drowsy = 0;
    this.blink = 0;
  }

  spend(v) {
    this.energy = clamp(this.energy - v, 0, 100);
  }

  update(dt) {
    const g = this.game;
    // ~45 минут реального времени от полного до нуля, ночью быстрее
    const night = g.world.dayNight.darkness;
    this.spend(dt * (0.033 + night * 0.02));

    if (this.energy < 20 && !this._warned) {
      this._warned = true;
      g.ui.notify('Глаза слипаются. Надо поесть или поспать (Z — поспать в машине).', 'warn');
    }
    if (this.energy > 30) this._warned = false;

    // клюёшь носом — экран темнеет, машину уводит
    this.drowsy *= Math.exp(-dt * 3);
    this.blink = Math.max(0, this.blink - dt * 1.5);
    if (this.energy < 12 && g.player.inCar && g.vehicle.speedKmh > 20) {
      this._blinkT -= dt;
      if (this._blinkT <= 0) {
        this._blinkT = 6 + Math.random() * 10;
        if (chance(0.6)) {
          this.blink = 1;
          this.drowsy = (Math.random() - 0.5) * 0.7;
        }
      }
    }
  }

  eat(id) {
    const it = ITEMS[id];
    if (!it?.food) return false;
    this.energy = clamp(this.energy + it.food, 0, 100);
    return true;
  }

  // поспать: в машине (бесплатно, но холодно и неудобно) или за деньги в кафе
  trySleep(where = 'car', price = 0) {
    const g = this.game;
    const car = g.vehicle;
    if (where === 'car') {
      if (car.speedKmh > 2) {
        g.ui.notify('Сначала остановись.', 'warn');
        return;
      }
      if (this.energy > 70) {
        g.ui.notify('Спать не хочется.');
        return;
      }
    }
    if (price && !g.inventory.canAfford(price)) {
      g.ui.notify('Денег не хватает.', 'warn');
      return;
    }
    if (price) g.inventory.addMoney(-price, 'ночлег');
    const wasOn = car.engine.on;
    g.ui.fadeThrough(() => {
      const dn = g.world.dayNight;
      const before = dn.time;
      let hours = before < 6 ? 7 - before : 31 - before;
      if (hours > 10) hours = 8;
      dn.advance(hours);
      g.world.weather.nextIn -= hours;
      // мотор глохнет, фары и радио сажают аккумулятор
      if (wasOn) car.stopEngine('sleep');
      const dmg = car.damage;
      if (car.lightsOn) dmg.fluids.charge = Math.max(0, dmg.fluids.charge - 0.12 * hours);
      if (g.radio.on) dmg.fluids.charge = Math.max(0, dmg.fluids.charge - 0.04 * hours);
      car.engine.temp = g.world.ambient();
      this.energy = where === 'car' ? 85 : 100;
      g.ui.notify(where === 'car'
        ? `Поспал в машине ${Math.round(hours)} ч. Шея затекла, зато голова свежая.`
        : `Выспался на койке. Как будто заново родился.`, 'good');
      if (car.lightsOn && dmg.fluids.charge < 0.1) g.ui.notify('Фары горели всю ночь. Аккумулятор сел.', 'warn');
      g.events.emit('slept', { hours, where });
    });
  }

  serialize() {
    return { energy: this.energy };
  }

  deserialize(d) {
    this.energy = d?.energy ?? 90;
  }
}
