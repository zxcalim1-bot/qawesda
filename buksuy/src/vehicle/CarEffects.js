import * as THREE from 'three';

const TRACK = {
  mud: [0.1, 0.07, 0.04, 0.6],
  deepmud: [0.08, 0.06, 0.03, 0.7],
  dirt: [0.2, 0.15, 0.1, 0.35],
  gravel: [0.25, 0.23, 0.2, 0.25],
  sand: [0.42, 0.35, 0.22, 0.45],
  snow: [0.5, 0.55, 0.65, 0.55],
  grass: [0.16, 0.22, 0.08, 0.35],
  forest: [0.14, 0.12, 0.07, 0.4],
};

const _v = new THREE.Vector3();

// Пыль, грязь из-под колёс, брызги, дым из-под капота и следы.
export class CarEffects {
  constructor(game) {
    this.game = game;
    this.acc = {};
    this.exhaustT = 0;
  }

  _rate(key, perSec, dt) {
    this.acc[key] = (this.acc[key] || 0) + perSec * dt;
    const n = Math.floor(this.acc[key]);
    this.acc[key] -= n;
    return n;
  }

  update(dt) {
    const g = this.game;
    const car = g.vehicle;
    const fx = g.world.effects;
    const speed = Math.hypot(car.vel.x, car.vel.z);
    const fwd = car.fwd;

    for (const w of car.wheels) {
      if (!w.contact || !w.surface) {
        fx.breakTrack(w.id);
        continue;
      }
      const s = w.surface;
      const cp = w.cp;
      const spin = w.spinning ? Math.min(30, Math.abs(w.spin) * w.radius) : 0;
      const slipping = w.slip > 0.4 || spin > 1;
      const back = -Math.sign(car.speed || 1);

      if (s.fx === 'dust' || s.fx === 'sand') {
        const n = this._rate(w.id + 'd', speed * 1.6 + spin * 4, dt);
        for (let i = 0; i < n; i++) fx.emit(s.fx === 'sand' ? 'sand' : 'dust', cp.x, cp.y + 0.15, cp.z, fwd.x * back * 1.5, 0.6, fwd.z * back * 1.5, 1.2);
      }
      if (s.fx === 'mud' && (speed > 3 || spin > 0.5)) {
        const n = this._rate(w.id + 'm', speed * 1.2 + spin * 7, dt);
        for (let i = 0; i < n; i++) {
          const k = spin > 0.5 ? spin * 0.5 + 2 : speed * 0.2;
          fx.emit('mud', cp.x, cp.y + 0.2, cp.z, fwd.x * back * k + car.vel.x * 0.5, 2 + Math.random() * 3, fwd.z * back * k + car.vel.z * 0.5, 1.2);
        }
      }
      if ((s.fx === 'grass' || s.fx === 'dirt') && (spin > 0.5 || w.slip > 0.6)) {
        const n = this._rate(w.id + 'g', 8 + spin * 4, dt);
        for (let i = 0; i < n; i++) fx.emit(s.fx === 'grass' ? 'grass' : 'dirt', cp.x, cp.y + 0.15, cp.z, fwd.x * back * 3, 2.5, fwd.z * back * 3, 1);
      }
      if (s.fx === 'snow' && speed > 2) {
        const n = this._rate(w.id + 's', speed * 1.3 + spin * 5, dt);
        for (let i = 0; i < n; i++) fx.emit('snow', cp.x, cp.y + 0.2, cp.z, fwd.x * back, 0.8, fwd.z * back, 1);
      }
      if (w.water > 0.04 && speed > 1.2) {
        const n = this._rate(w.id + 'w', speed * 3 * Math.min(1, w.water * 3), dt);
        for (let i = 0; i < n; i++) {
          const side = w.x > 0 ? 1 : -1;
          fx.emit('water', cp.x + car.right.x * side * 0.3, cp.y + 0.3 + w.water, cp.z + car.right.z * side * 0.3,
            car.right.x * side * 2 + car.vel.x * 0.3, 2 + speed * 0.2, car.right.z * side * 2 + car.vel.z * 0.3, 1.5);
        }
      }
      // дым от шин на асфальте
      if (!s.fx && w.slip > 0.6 && speed > 2) {
        const n = this._rate(w.id + 't', 14 * Math.min(2, w.slip), dt);
        for (let i = 0; i < n; i++) fx.emit('tire', cp.x, cp.y + 0.2, cp.z, 0, 0.5, 0, 1);
      }

      // следы
      const col = TRACK[s.key];
      const skid = !s.fx && w.slip > 0.5;
      if ((col || skid) && speed > 0.5) {
        const c = col || [0.05, 0.05, 0.05, 0.5];
        fx.track(w.id, cp.x, cp.y + 0.035, cp.z, fwd.x, fwd.z, 0.21, c);
      } else fx.breakTrack(w.id);
    }

    // искры от ступицы без колеса
    for (const w of car.wheels) {
      if (!car.damage.isDetached(w.id) || speed < 2) continue;
      car.worldPoint(w.x, -0.42, w.z, _v);
      const gh = g.world.ground.height(_v.x, _v.z);
      if (_v.y - gh < 0.2) {
        const n = this._rate(w.id + 'sp', speed * 3, dt);
        for (let i = 0; i < n; i++) fx.emit('spark', _v.x, gh + 0.05, _v.z, -car.vel.x * 0.3, 2, -car.vel.z * 0.3, 2);
      }
    }

    // двигатель
    const e = car.engine;
    const eng = car.damage.hp('engine');
    g.carModel.engineBayWorld(_v);
    if (e.temp > 108) {
      const n = this._rate('steam', (e.temp - 105) * 1.2, dt);
      for (let i = 0; i < n; i++) fx.emit('steam', _v.x, _v.y, _v.z, car.vel.x * 0.5, 1, car.vel.z * 0.5, 0.6);
    }
    if (e.on && eng < 30) {
      const n = this._rate('smoke', (30 - eng) * 0.4, dt);
      for (let i = 0; i < n; i++) fx.emit('smoke', _v.x, _v.y, _v.z, car.vel.x * 0.5, 1, car.vel.z * 0.5, 0.5);
    }
    if (e.on) {
      g.carModel.exhaustWorld(_v);
      const n = this._rate('ex', 6 + e.load * 14, dt);
      const dark = eng < 40 || car.damage.isDetached('exhaust');
      for (let i = 0; i < n; i++) fx.emit(dark && Math.random() < 0.4 ? 'smoke' : 'exhaust', _v.x, _v.y, _v.z, -fwd.x * 1.5 + car.vel.x * 0.6, 0.3, -fwd.z * 1.5 + car.vel.z * 0.6, 0.3);
    }
  }

  // хлопок из выхлопной
  backfire() {
    const g = this.game;
    g.carModel.exhaustWorld(_v);
    for (let i = 0; i < 8; i++) g.world.effects.emit('smoke', _v.x, _v.y, _v.z, -g.vehicle.fwd.x * 3, 0.5, -g.vehicle.fwd.z * 3, 0.8);
  }

  impact(x, y, z, speed, kind) {
    const fx = this.game.world.effects;
    const n = Math.min(30, Math.floor(speed * 2));
    for (let i = 0; i < n; i++) fx.emit(kind === 'glass' ? 'glass' : 'spark', x, y, z, 0, 2, 0, 4);
    for (let i = 0; i < n / 2; i++) fx.emit('dust', x, y, z, 0, 1, 0, 2);
  }
}
