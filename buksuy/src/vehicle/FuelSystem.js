import { clamp } from '../core/util.js';

// Ласточка жрёт как не в себя — это не баг, это характер.
export class FuelSystem {
  constructor(events, config) {
    this.events = events;
    this.config = config;
    this.liters = 9;
    this.totalUsed = 0;
    this.warned = false;
  }

  get capacity() {
    return this.config.tankLiters;
  }

  get fraction() {
    return clamp(this.liters / this.capacity, 0, 1);
  }

  get empty() {
    return this.liters <= 0.001;
  }

  // powerKw — мощность, которую сейчас отдаёт двигатель
  consume(dt, engineOn, powerKw, efficiency = 1) {
    if (!engineOn || this.empty) return;
    const rate = (0.005 + 0.0076 * Math.pow(Math.max(0, powerKw), 0.85)) * efficiency;
    this.use(rate * dt);
  }

  leak(dt, rate) {
    if (rate > 0 && this.liters > 0) this.use(rate * dt, true);
  }

  use(l, isLeak = false) {
    const before = this.liters;
    this.liters = Math.max(0, this.liters - l);
    if (!isLeak) this.totalUsed += before - this.liters;
    if (!this.warned && this.fraction < 0.1 && before / this.capacity >= 0.1) {
      this.warned = true;
      this.events.emit('note', { text: 'Лампочка топлива загорелась. Бензина почти нет.', kind: 'warn' });
    }
    if (before > 0 && this.liters <= 0) this.events.emit('fuel-empty', {});
  }

  // вернуть сколько реально влезло
  refuel(l) {
    const space = this.capacity - this.liters;
    const add = clamp(l, 0, space);
    this.liters += add;
    if (this.fraction > 0.12) this.warned = false;
    return add;
  }

  serialize() {
    return { liters: this.liters, totalUsed: this.totalUsed };
  }

  deserialize(d) {
    if (!d) return;
    this.liters = d.liters ?? this.liters;
    this.totalUsed = d.totalUsed ?? 0;
  }
}
