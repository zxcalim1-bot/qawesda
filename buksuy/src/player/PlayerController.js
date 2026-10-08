import * as THREE from 'three';
import { Humanoid } from './Humanoid.js';
import { pushCircle } from '../world/Colliders.js';
import { WATER_Y } from '../world/WorldLayout.js';
import { clamp, damp, wrapAngle } from '../core/util.js';

const _hits = [];
const _out = {};

// Игрок: ходит пешком, садится в машину и выходит, толкает её.
export class PlayerController {
  constructor(game) {
    this.game = game;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.vy = 0;
    this.onGround = true;
    this.swimming = false;
    this.pushing = false;
    this.mode = 'foot';
    this.steer = 0;
    this.model = new Humanoid({
      skin: '#e2b494', shirt: '#7a2e2a', pants: '#2e3a4a', hair: '#3a2a1a', hat: 'cap', hatColor: '#2a3a2a',
    });
    game.scene.add(this.model.root);
    this.carPose = new THREE.Vector3(0.38, -0.16, -0.12); // таз водителя (в осях модели машины)
  }

  spawn(x, z, yaw = 0) {
    this.mode = 'foot';
    this.pos.set(x, this.game.world.ground.height(x, z), z);
    this.yaw = yaw;
    this.vel.set(0, 0, 0);
    this.vy = 0;
    this._attachToCar(false);
  }

  get inCar() {
    return this.mode === 'car';
  }

  nearCar(dist = 3.4) {
    const car = this.game.vehicle;
    if (this.inCar) return true;
    return Math.hypot(car.pos.x - this.pos.x, car.pos.z - this.pos.z) < dist && Math.abs(car.pos.y - this.pos.y) < 3;
  }

  _attachToCar(on) {
    const m = this.model;
    if (on) {
      this.game.carModel.root.add(m.root);
      m.root.position.copy(this.carPose);
      m.root.rotation.set(0, 0, 0);
      m.setSitting(true);
    } else {
      this.game.scene.add(m.root);
      m.setSitting(false);
    }
  }

  enterCar() {
    const car = this.game.vehicle;
    if (car.flipped || car.up.y < 0.4) {
      this.game.ui.notify('Машина лежит на боку. Сначала поставь её на колёса [E].', 'warn');
      return false;
    }
    this.mode = 'car';
    car.parked = false;
    car.hoodOpen = false;
    car.trunkOpen = false;
    this._attachToCar(true);
    this.game.events.emit('enter-car', {});
    return true;
  }

  exitCar() {
    const car = this.game.vehicle;
    if (car.speedKmh > 12) {
      this.game.ui.notify('На ходу выпрыгивать? Ну уж нет.', 'warn');
      return false;
    }
    // выходим с водительской стороны, если там не стена — иначе с другой
    const p = new THREE.Vector3();
    let ok = false;
    for (const side of [-1.45, 1.45, 0]) {
      car.worldPoint(side, 0, side === 0 ? -3 : 0.3, p);
      if (!this._blocked(p.x, p.z)) { ok = true; break; }
    }
    if (!ok) car.worldPoint(-1.45, 0, 0.3, p);
    this.mode = 'foot';
    this.pos.set(p.x, this.game.world.ground.height(p.x, p.z), p.z);
    this.yaw = car.yaw;
    this.vel.set(0, 0, 0);
    car.release();
    this._attachToCar(false);
    this.game.cameraRig.footYaw = car.yaw;
    this.game.events.emit('exit-car', {});
    return true;
  }

  _blocked(x, z) {
    const list = this.game.world.colliders.query(x, z, 1, _hits);
    for (const c of list) {
      if (c.breakable) continue;
      if (pushCircle(c, x, z, 0.35, _out)) return true;
    }
    return false;
  }

  update(dt) {
    const input = this.game.input;
    if (this.mode === 'car') this._drive(dt, input);
    else this._walk(dt, input);
  }

  _drive(dt, input) {
    const car = this.game.vehicle;
    const ui = this.game.ui;
    const free = !ui.modal;
    const fwd = free && input.down('throttle') ? 1 : 0;
    const back = free && input.down('brake') ? 1 : 0;
    let target = 0;
    if (free && input.down('left')) target -= 1;
    if (free && input.down('right')) target += 1;
    // руль возвращается быстрее, чем поворачивается
    const rate = target === 0 || Math.sign(target) !== Math.sign(this.steer) ? 6 : 3.2;
    this.steer += clamp(target - this.steer, -rate * dt, rate * dt);
    // засыпаешь за рулём — машину ведёт
    const drowsy = this.game.needs?.drowsy || 0;
    car.setInput(fwd, back, clamp(this.steer + drowsy, -1, 1), free && input.down('handbrake'), dt);
    this.model.animate(dt, 0);
  }

  _walk(dt, input) {
    const game = this.game;
    const ground = game.world.ground;
    const free = !game.ui.modal;
    const camYaw = game.cameraRig.footYaw;
    let mx = 0, mz = 0;
    if (free) {
      if (input.down('throttle')) mz += 1;
      if (input.down('brake')) mz -= 1;
      if (input.down('left')) mx -= 1;
      if (input.down('right')) mx += 1;
    }
    const tired = (game.needs?.energy ?? 100) < 10;
    const run = free && input.down('run') && !tired && !this.pushing;
    let speed = run ? 5.4 : 2.3;
    if (this.swimming) speed = 1.2;
    if (this.model.carry) speed *= 0.75;
    const len = Math.hypot(mx, mz);
    // направление относительно камеры: вперёд = (sin, cos) yaw, вправо = (-cos, sin)
    let wx = 0, wz = 0;
    if (len > 0) {
      mx /= len; mz /= len;
      const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
      const rx = -fz, rz = fx;
      wx = fx * mz + rx * mx;
      wz = fz * mz + rz * mx;
      const targetYaw = Math.atan2(wx, wz);
      this.yaw += wrapAngle(targetYaw - this.yaw) * Math.min(1, dt * 12);
    }
    this.vel.x = damp(this.vel.x, wx * speed, 12, dt);
    this.vel.z = damp(this.vel.z, wz * speed, 12, dt);

    let nx = this.pos.x + this.vel.x * dt;
    let nz = this.pos.z + this.vel.z * dt;

    // стены и деревья
    const list = game.world.colliders.query(nx, nz, 1.2, _hits);
    for (const c of list) {
      if (c.kind === 'bush') continue;
      if (c.y1 < this.pos.y + 0.3 || c.y0 > this.pos.y + 1.8) continue;
      if (pushCircle(c, nx, nz, 0.33, _out)) { nx = _out.x; nz = _out.z; }
    }
    // машина тоже препятствие
    const car = game.vehicle;
    const fl = Math.hypot(car.fwd.x, car.fwd.z) || 1;
    const carBox = { type: 'box', x: car.pos.x, z: car.pos.z, hx: 0.86, hz: 2.12, sin: car.fwd.x / fl, cos: car.fwd.z / fl };
    if (Math.abs(car.pos.y - this.pos.y) < 2.2 && pushCircle(carBox, nx, nz, 0.33, _out)) { nx = _out.x; nz = _out.z; }

    // слишком крутой подъём — не пускаем
    const gh = ground.height(nx, nz);
    if (gh - this.pos.y > 0.65 && this.onGround) {
      nx = this.pos.x;
      nz = this.pos.z;
    }
    if (!game.world.terrain.inBounds(nx, nz, 30)) {
      nx = this.pos.x;
      nz = this.pos.z;
    }
    this.pos.x = nx;
    this.pos.z = nz;

    // прыжок и гравитация
    const g = ground.height(this.pos.x, this.pos.z);
    if (free && this.onGround && input.pressed('jump') && !this.swimming) this.vy = 4.2;
    this.vy -= 12 * dt;
    this.pos.y += this.vy * dt;
    const depth = WATER_Y - g;
    this.swimming = depth > 1.15;
    const floor = this.swimming ? WATER_Y - 1.15 : g;
    if (this.pos.y <= floor) {
      this.pos.y = floor;
      this.vy = 0;
      this.onGround = true;
    } else if (this.pos.y > floor + 0.05) {
      this.onGround = false;
    }

    // толкать машину
    this.pushing = false;
    if (free && input.down('push') && this.nearCar(3.3) && !car.flipped) {
      const dx = car.pos.x - this.pos.x, dz = car.pos.z - this.pos.z;
      const d = Math.hypot(dx, dz) || 1;
      car.parked = false;
      car.controls.handbrake = 0;
      car.pushForce = { x: (dx / d) * 2400, z: (dz / d) * 2400, px: this.pos.x, pz: this.pos.z };
      this.pushing = true;
      this.yaw = Math.atan2(dx, dz);
      game.needs?.spend(dt * 0.6);
    }

    const m = this.model;
    m.root.position.copy(this.pos);
    m.root.rotation.y = this.yaw;
    m.carry = this.pushing;
    m.animate(dt, this.pushing ? 1.2 : Math.hypot(this.vel.x, this.vel.z));
    if (len > 0 || this.pushing) game.needs?.spend(dt * (run ? 0.25 : 0.06));
  }
}
