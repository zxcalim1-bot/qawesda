import { ACHIEVEMENTS } from '../data/achievements.js';

const KEY = 'buksuy.achievements';

// Достижения хранятся отдельно от сохранений — их не теряешь, начав новую игру.
// Статистика (stats) — в сохранении.
export class Achievements {
  constructor(game) {
    this.game = game;
    this.unlocked = new Set();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.unlocked = new Set(JSON.parse(raw));
    } catch (_) { /* пусто так пусто */ }
    this.resetRun();
  }

  resetRun() {
    this.stats = {
      distance: 0, critical: 0, threeWheels: 0, nightDark: 0, repairs: 0, searched: 0, stripped: 0,
      passengers: 0, crashes: 0, quests: 0, upgrades: 0, sold: 0, flips_fixed: 0, maxAir: 0, partsLost: 0,
    };
    this.spinTime = 0;
  }

  unlock(id) {
    if (this.unlocked.has(id) || !ACHIEVEMENTS[id]) return;
    this.unlocked.add(id);
    const a = ACHIEVEMENTS[id];
    this.game.ui.toast(a.title, a.desc, a.icon);
    this.game.audio.play('achievement');
    try {
      localStorage.setItem(KEY, JSON.stringify([...this.unlocked]));
    } catch (_) { /* ок */ }
  }

  count(key, n = 1) {
    this.stats[key] = (this.stats[key] || 0) + n;
    if (key === 'repairs' && this.stats.repairs >= 10) this.unlock('self_mechanic');
    if (key === 'searched' && this.stats.searched >= 6) this.unlock('treasure');
    if (key === 'passengers' && this.stats.passengers >= 2) this.unlock('taxi');
  }

  update(dt) {
    const g = this.game;
    const car = g.vehicle;
    const s = this.stats;
    if (g.player.inCar) {
      const d = Math.hypot(car.vel.x, car.vel.z) * dt;
      s.distance += d;
      if (car.damage.overall() < 30) {
        s.critical += d;
        if (s.critical > 3000) this.unlock('still_rolling');
      }
      if (car.wheels.some((w) => car.damage.isDetached(w.id))) {
        s.threeWheels += d;
        if (s.threeWheels > 300) this.unlock('three_wheels');
      }
      if (g.world.dayNight.darkness > 0.8 && !car.lightsOn) {
        s.nightDark += d;
        if (s.nightDark > 1000) this.unlock('night_owl');
      }
      if (car.airTime > 1.5) this.unlock('flight');
      s.maxAir = Math.max(s.maxAir, car.airTime);
      // буксуем в грязи
      const inMud = car.wheels.some((w) => w.spinning && w.surface && (w.surface.key === 'mud' || w.surface.key === 'deepmud'));
      if (inMud && car.speedKmh < 6) {
        this.spinTime += dt;
        if (this.spinTime > 15) this.unlock('buksuy');
      } else this.spinTime = Math.max(0, this.spinTime - dt * 2);
    }
    // собственное колесо укатилось вперёд машины
    if (g.player.inCar && car.speedKmh > 10) {
      for (const d of g.debris.items) {
        if (!d.rolling || d.resting) continue;
        const dx = d.obj.position.x - car.pos.x, dz = d.obj.position.z - car.pos.z;
        if (dx * car.fwd.x + dz * car.fwd.z > 4 && Math.hypot(dx, dz) < 30) this.unlock('overtaken');
      }
    }
    if (g.inventory.money >= 10000) this.unlock('rich');
    if (car.damage.lostParts >= 5) this.unlock('featherless');
  }

  serialize() {
    return { stats: this.stats };
  }

  deserialize(d) {
    this.resetRun();
    Object.assign(this.stats, d?.stats || {});
  }
}
