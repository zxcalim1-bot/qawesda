import * as THREE from 'three';
import { clamp } from '../core/util.js';

const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _hits = [];

// Отвалившиеся детали: летят, кувыркаются, катятся и в итоге лежат в кювете,
// где их можно подобрать.
export class DebrisSystem {
  constructor(scene, ground, colliders, events) {
    this.scene = scene;
    this.ground = ground;
    this.colliders = colliders;
    this.events = events;
    this.items = [];
  }

  spawn(obj, opts = {}) {
    this.scene.add(obj);
    obj.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const d = {
      obj,
      vel: (opts.vel || new THREE.Vector3()).clone(),
      angVel: (opts.angVel || new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6)).clone(),
      radius: opts.radius ?? 0.25,
      rolling: !!opts.rolling,
      rollSpeed: 0,
      partId: opts.partId || null,
      itemId: opts.itemId || null,
      name: opts.name || 'Обломок',
      resting: false,
      restTime: 0,
      age: 0,
      onRest: opts.onRest || null,
    };
    if (d.rolling) {
      // колесо ставим «на ребро» и катим вперёд
      const fwd = d.vel.clone().setY(0);
      d.rollSpeed = fwd.length();
      d.dir = fwd.lengthSq() > 0.01 ? fwd.normalize() : new THREE.Vector3(0, 0, 1);
      d.wobble = 0;
      d.lean = 0;
      d.spin = 0;
    }
    this.items.push(d);
    return d;
  }

  update(dt) {
    for (const d of this.items) {
      if (d.resting) continue;
      d.age += dt;
      if (d.rolling) this._roll(d, dt);
      else this._tumble(d, dt);
    }
  }

  _tumble(d, dt) {
    const o = d.obj;
    d.vel.y -= 9.81 * dt;
    o.position.addScaledVector(d.vel, dt);
    const w = d.angVel.length();
    if (w > 1e-4) {
      _axis.copy(d.angVel).multiplyScalar(1 / w);
      _q.setFromAxisAngle(_axis, w * dt);
      o.quaternion.premultiply(_q);
    }
    const gh = this.ground.height(o.position.x, o.position.z);
    if (o.position.y < gh + d.radius) {
      o.position.y = gh + d.radius;
      if (d.vel.y < 0) d.vel.y = -d.vel.y * 0.28;
      d.vel.x *= 0.82;
      d.vel.z *= 0.82;
      d.angVel.multiplyScalar(0.7);
      if (d.vel.length() < 0.4 && d.age > 0.4) {
        d.restTime += dt;
        if (d.restTime > 0.3) this._rest(d);
      }
    }
    this._obstacles(d);
  }

  _roll(d, dt) {
    const o = d.obj;
    // катится вперёд, постепенно теряя скорость и раскачиваясь
    d.rollSpeed = Math.max(0, d.rollSpeed - dt * (0.7 + d.wobble * 0.5));
    _v.copy(d.dir).multiplyScalar(d.rollSpeed * dt);
    o.position.add(_v);
    const gh = this.ground.height(o.position.x, o.position.z);
    const r = 0.3;
    d.spin += (d.rollSpeed / r) * dt;
    if (d.rollSpeed < 2.5) d.lean += dt * (2.5 - d.rollSpeed) * 0.6;
    d.wobble += dt * 0.2;
    // лёгкий поворот траектории
    const turn = Math.sin(d.age * 1.7) * 0.1 * dt + d.lean * 0.15 * dt;
    d.dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), turn);
    const yaw = Math.atan2(d.dir.x, d.dir.z);
    const lean = clamp(d.lean, 0, Math.PI / 2);
    o.quaternion.setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));
    o.quaternion.multiply(_q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), lean));
    // вращение «шины» внутри (спин) — первый ребёнок группы
    if (o.children[0]) o.children[0].rotation.x = d.spin;
    o.position.y = gh + r * Math.cos(lean) + 0.1 * Math.sin(lean);
    if (lean >= Math.PI / 2 - 0.01 || d.rollSpeed <= 0.05) {
      o.position.y = gh + 0.12;
      this._rest(d);
    }
    if (this._obstacles(d)) {
      d.rollSpeed = 0;
    }
  }

  _obstacles(d) {
    const o = d.obj;
    const list = this.colliders.query(o.position.x, o.position.z, 1.5, _hits);
    for (const c of list) {
      if (c.type !== 'circle' || c.breakable) continue;
      const dx = o.position.x - c.x, dz = o.position.z - c.z;
      const dist = Math.hypot(dx, dz);
      const R = c.r + d.radius;
      if (dist < R && dist > 1e-4) {
        o.position.x = c.x + (dx / dist) * R;
        o.position.z = c.z + (dz / dist) * R;
        d.vel.x *= -0.3;
        d.vel.z *= -0.3;
        return true;
      }
    }
    return false;
  }

  _rest(d) {
    d.resting = true;
    d.vel.set(0, 0, 0);
    this.events.emit('debris-rest', d);
    if (d.onRest) d.onRest(d);
  }

  remove(d) {
    this.scene.remove(d.obj);
    const i = this.items.indexOf(d);
    if (i >= 0) this.items.splice(i, 1);
  }

  nearest(x, z, maxD = 2.5) {
    let best = null, bd = maxD;
    for (const d of this.items) {
      if (!d.resting || !d.itemId) continue;
      const dist = Math.hypot(d.obj.position.x - x, d.obj.position.z - z);
      if (dist < bd) { bd = dist; best = d; }
    }
    return best;
  }
}
