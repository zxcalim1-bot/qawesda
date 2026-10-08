import * as THREE from 'three';
import { BASE, VehicleConfig, torqueCurve } from './VehicleConfig.js';
import { VehicleDamage, WHEEL_IDS } from './VehicleDamage.js';
import { FuelSystem } from './FuelSystem.js';
import { circleVsRect, boxVsRect } from '../world/Colliders.js';
import { WATER_Y } from '../world/WorldLayout.js';
import { tmpSample } from '../world/Ground.js';
import { clamp, damp, chance, smoothstep } from '../core/util.js';

const G = 9.81;
const TWO_PI = Math.PI * 2;

const WHEELS = [
  { id: 'wheelFL', x: -0.69, z: 1.24, front: true, driven: false },
  { id: 'wheelFR', x: 0.69, z: 1.24, front: true, driven: false },
  { id: 'wheelRL', x: -0.69, z: -1.2, front: false, driven: true },
  { id: 'wheelRR', x: 0.69, z: -1.2, front: false, driven: true },
];

// точки корпуса для столкновений с землёй (относительно центра масс)
const HULL = [
  [-0.78, -0.4, 1.95, 'front'], [0.78, -0.4, 1.95, 'front'], [-0.78, -0.4, -1.95, 'rear'], [0.78, -0.4, -1.95, 'rear'],
  [0, -0.44, 0, 'bottom'], [0, -0.43, 1.15, 'bottom'], [0, -0.43, -1.15, 'bottom'],
  [-0.8, -0.38, 0, 'left'], [0.8, -0.38, 0, 'right'],
  [-0.8, -0.12, 2.08, 'front'], [0.8, -0.12, 2.08, 'front'], [0, -0.12, 2.12, 'front'],
  [-0.8, -0.12, -2.08, 'rear'], [0.8, -0.12, -2.08, 'rear'], [0, -0.12, -2.12, 'rear'],
  [-0.84, 0.1, 1.1, 'left'], [0.84, 0.1, 1.1, 'right'], [-0.84, 0.1, -1.1, 'left'], [0.84, 0.1, -1.1, 'right'],
  [-0.7, 0.22, 1.9, 'front'], [0.7, 0.22, 1.9, 'front'], [-0.7, 0.24, -1.9, 'rear'], [0.7, 0.24, -1.9, 'rear'],
  [-0.62, 0.78, 0.45, 'roof'], [0.62, 0.78, 0.45, 'roof'], [-0.62, 0.78, -0.85, 'roof'], [0.62, 0.78, -0.85, 'roof'],
  [0, 0.8, -0.2, 'roof'],
].map(([x, y, z, zone]) => ({ x, y, z, zone }));

export const HALF_X = 0.84;
export const HALF_Z = 2.08;

const _p = new THREE.Vector3();
const _r = new THREE.Vector3();
const _f = new THREE.Vector3();
const _t = new THREE.Vector3();
const _t2 = new THREE.Vector3();
const _vp = new THREE.Vector3();
const _n = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _wf = new THREE.Vector3();
const _ws = new THREE.Vector3();
const _hit = {};
const _list = [];

export class VehicleController {
  constructor(events, ground, colliders, env) {
    this.events = events;
    this.ground = ground;
    this.colliders = colliders;
    this.env = env || { gripMul: () => 1, ambient: () => 15 };

    this.config = new VehicleConfig();
    this.damage = new VehicleDamage(events);
    this.fuel = new FuelSystem(events, this.config);

    this.mass = BASE.mass;
    const { w, h, l } = BASE.size;
    // чуть завышенные моменты инерции — машина стабильнее и не крутится волчком
    this.invI = new THREE.Vector3(
      1 / ((this.mass / 12) * (h * h + l * l) * 1.15),
      1 / ((this.mass / 12) * (w * w + l * l) * 1.1),
      1 / ((this.mass / 12) * (w * w + h * h) * 1.3),
    );

    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.vel = new THREE.Vector3();
    this.angVel = new THREE.Vector3();
    this.right = new THREE.Vector3(1, 0, 0);
    this.up = new THREE.Vector3(0, 1, 0);
    this.fwd = new THREE.Vector3(0, 0, 1);
    this.force = new THREE.Vector3();
    this.torque = new THREE.Vector3();

    this.wheels = WHEELS.map((wd, i) => ({
      ...wd, index: i,
      comp: 0, prevComp: 0, contact: false, wasContact: false,
      cp: new THREE.Vector3(), load: 0, omega: 0, angle: 0, spin: 0,
      vLong: 0, vLat: 0, slip: 0, lock: false, spinning: false,
      surface: null, water: 0, radius: BASE.wheelRadius, airTime: 0,
    }));

    this.controls = { throttle: 0, brake: 0, steer: 0, handbrake: 0 };
    this.input = { fwd: 0, back: 0, steer: 0, handbrake: false };
    this.steerAngle = 0;
    this.driveTorque = 0;
    this.engine = {
      on: false, rpm: 0, gear: 1, targetGear: 1, shiftTimer: 0, temp: 20,
      cranking: 0, crankTime: 0, misfireT: 0, clutchSlip: 0, load: 0, powerKw: 0,
      limiter: false, reverseTimer: 0, fwdTimer: 0, knocked: 0, popTimer: 0,
    };
    this.lightsOn = false;
    this.radioDrain = false;
    this.parked = true; // ручник, когда никого нет
    this.hoodOpen = false;
    this.trunkOpen = false;
    this.speed = 0;
    this.airTime = 0;
    this.upsideTime = 0;
    this.flipped = false;
    this.inWater = 0;
    this.dirt = 0.15;
    this.wet = 0;
    this.odometer = 0;
    this.contacts = [];
    this.gs = tmpSample();
    this.landingCooldown = 0;
    this.frozen = false;
    this.lastImpact = 0;
    this.pushForce = null;
    this.stunned = 0;
  }

  // ---------- управление ----------

  // fwd/back — W/S (0..1), steer -1..1, handbrake bool
  setInput(fwd, back, steer, handbrake, dt) {
    const e = this.engine;
    const v = this.speed;
    this.input.fwd = fwd;
    this.input.back = back;
    // автоматическая логика «тормоз/задний ход», как у автомата
    if (e.gear >= 0) {
      this.controls.throttle = fwd;
      this.controls.brake = back;
      if (back > 0.5 && v < 0.6 && fwd < 0.1) {
        e.reverseTimer += dt;
        if (e.reverseTimer > 0.3) this._shiftTo(-1, 0.25);
      } else e.reverseTimer = 0;
    } else {
      this.controls.throttle = back;
      this.controls.brake = fwd;
      if (fwd > 0.5 && v > -0.6 && back < 0.1) {
        e.fwdTimer += dt;
        if (e.fwdTimer > 0.3) this._shiftTo(1, 0.25);
      } else e.fwdTimer = 0;
    }
    // после сильного удара руль на секунду вырывает из рук
    if (this.stunned > 0) {
      this.stunned -= dt;
      steer = Math.sin(this.stunned * 13) * 0.8;
      this.controls.throttle = 0;
    }
    this.controls.steer = steer;
    this.controls.handbrake = handbrake ? 1 : 0;
    if (fwd > 0 || back > 0) this.parked = false;
  }

  release() {
    // водитель вышел: ручник, руль прямо
    this.controls.throttle = 0;
    this.controls.brake = 0;
    this.controls.steer = 0;
    this.controls.handbrake = 1;
    this.parked = true;
  }

  ignition() {
    const e = this.engine;
    if (e.on) {
      this.stopEngine('key');
      return;
    }
    if (e.cranking > 0) return;
    // с толкача
    if (Math.abs(this.speed) > 2.5 && e.gear !== 0) {
      if (!this.fuel.empty && this.damage.hp('engine') > 3 && this.inWater < 0.7) {
        this._start();
        this.events.emit('engine-start', { bump: true });
        this.events.emit('note', { text: 'Завелась с толкача! Вот это по-нашему.' });
      } else {
        this.events.emit('engine-fail', { reason: 'Не схватывает. Что-то серьёзное.' });
      }
      return;
    }
    e.cranking = 0.001;
    const cold = this.env.ambient() < 0 ? 0.6 : 0;
    e.crankTime = 0.6 + Math.random() * 0.7 + cold + (1 - this.damage.fluids.charge) * 0.6;
    this.events.emit('engine-crank', {});
  }

  _start() {
    const e = this.engine;
    e.on = true;
    e.cranking = 0;
    e.rpm = BASE.idleRpm + 300;
    if (e.gear === 0) e.gear = 1;
  }

  stopEngine(reason) {
    const e = this.engine;
    if (!e.on) return;
    e.on = false;
    e.cranking = 0;
    this.events.emit('engine-stop', { reason });
  }

  toggleLights() {
    this.lightsOn = !this.lightsOn;
    return this.lightsOn;
  }

  _shiftTo(g, time) {
    const e = this.engine;
    if (e.gear === g || (e.shiftTimer > 0 && e.targetGear === g)) return;
    e.targetGear = g;
    e.shiftTimer = time;
    e.gear = 0;
    e.sinceShift = 0;
  }

  // ---------- физика ----------

  teleport(x, z, yaw, lift = 0.75) {
    const h = this.ground.height(x, z);
    this.pos.set(x, h + lift, z);
    this.quat.setFromAxisAngle(_t.set(0, 1, 0), yaw);
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);
    for (const w of this.wheels) {
      w.prevComp = 0.1;
      w.comp = 0.1;
      w.spin = 0;
    }
    this._basis();
  }

  get yaw() {
    return Math.atan2(this.fwd.x, this.fwd.z);
  }

  flipUpright() {
    const yaw = this.yaw;
    this.teleport(this.pos.x, this.pos.z, yaw, 1.2);
  }

  _basis() {
    const q = this.quat;
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    // локальная +X у кватерниона — это левый борт (вперёд +Z, вверх +Y), поэтому «право» = -X
    this.right.set(-(1 - (yy + zz)), -(xy + wz), -(xz - wy));
    this.up.set(xy - wz, 1 - (xx + zz), yz + wx);
    this.fwd.set(xz + wy, yz - wx, 1 - (xx + yy));
  }

  // I^-1 в мировых осях, применённая к вектору
  _invI(v, out) {
    const lx = v.dot(this.right) * this.invI.x;
    const ly = v.dot(this.up) * this.invI.y;
    const lz = v.dot(this.fwd) * this.invI.z;
    return out.set(0, 0, 0).addScaledVector(this.right, lx).addScaledVector(this.up, ly).addScaledVector(this.fwd, lz);
  }

  _addForce(F, point) {
    this.force.add(F);
    _r.subVectors(point, this.pos);
    this.torque.add(_t2.crossVectors(_r, F));
  }

  _applyImpulse(J, point) {
    this.vel.addScaledVector(J, 1 / this.mass);
    _r.subVectors(point, this.pos);
    _t2.crossVectors(_r, J);
    this._invI(_t2, _t2);
    this.angVel.add(_t2);
  }

  _pointVel(point, out) {
    _r.subVectors(point, this.pos);
    return out.crossVectors(this.angVel, _r).add(this.vel);
  }

  local(id) {
    return WHEELS.find((w) => w.id === id);
  }

  worldPoint(lx, ly, lz, out) {
    return out.copy(this.pos).addScaledVector(this.right, lx).addScaledVector(this.up, ly).addScaledVector(this.fwd, lz);
  }

  step(dt) {
    if (this.frozen) return;
    this._basis();
    const fac = this.damage.factors();
    this.fac = fac;
    this.force.set(0, -G * this.mass, 0);
    this.torque.set(0, 0, 0);

    if (this.pushForce) {
      // игрок толкает руками
      _f.set(this.pushForce.x, 0, this.pushForce.z);
      this.force.add(_f);
    }
    this._steering(dt, fac);
    this._engineStep(dt, fac);
    this._wheelsStep(dt, fac);
    this._aero(fac);
    this._waterStep();

    this.vel.addScaledVector(this.force, dt / this.mass);
    this._invI(this.torque, _t);
    this.angVel.addScaledVector(_t, dt);
    this.angVel.multiplyScalar(1 - 0.04 * dt);
    if (this.angVel.lengthSq() > 400) this.angVel.setLength(20);

    this.pos.addScaledVector(this.vel, dt);
    _q.set(this.angVel.x, this.angVel.y, this.angVel.z, 0).multiply(this.quat);
    this.quat.x += _q.x * 0.5 * dt;
    this.quat.y += _q.y * 0.5 * dt;
    this.quat.z += _q.z * 0.5 * dt;
    this.quat.w += _q.w * 0.5 * dt;
    this.quat.normalize();
    this._basis();

    this._collide(dt);
    this._bookkeeping(dt, fac);
  }

  _steering(dt, fac) {
    const v = Math.abs(this.speed);
    const maxA = BASE.maxSteer * (1 - 0.65 * smoothstep(3, 32, v));
    let target = this.controls.steer * maxA;
    // спущенное колесо тянет в свою сторону
    const fl = this.damage.flat;
    const pull = (fl[0] ? -1 : 0) + (fl[1] ? 1 : 0) + (fl[2] ? -0.5 : 0) + (fl[3] ? 0.5 : 0);
    if (pull && v > 3) target += pull * 0.07 * Math.min(1, v / 15);
    // разболтанная подвеска и спущенное переднее — руль гуляет
    if (fac.steerWobble > 0 && v > 4) target += Math.sin(performance.now() * 0.0047) * fac.steerWobble;
    const rate = 2.8;
    const d = target - this.steerAngle;
    this.steerAngle += clamp(d, -rate * dt, rate * dt);
  }

  _engineStep(dt, fac) {
    const e = this.engine;
    const c = this.controls;
    const dmg = this.damage;

    // стартер
    if (e.cranking > 0) {
      e.cranking += dt;
      dmg.fluids.charge = Math.max(0, dmg.fluids.charge - 0.03 * dt / (0.3 + 0.7 * dmg.frac('battery')));
      if (dmg.fluids.charge < 0.08) {
        e.cranking = 0;
        this.events.emit('engine-fail', { reason: 'Щёлк… и тишина. Аккумулятор сел.', battery: true });
      } else if (dmg.hasFault('starter') && !(e.knocked > 0)) {
        e.cranking = 0;
        this.events.emit('engine-fail', { reason: 'Стартер не крутит. Можно постучать по нему или завести с толкача.' });
      } else if (e.cranking >= e.crankTime) {
        let p = 0.35 + 0.65 * dmg.frac('engine');
        p *= smoothstep(0.08, 0.35, dmg.fluids.charge);
        if (this.env.ambient() < 0) p *= 0.7;
        if (dmg.hasFault('fuelpump')) p *= 0.5;
        let reason = 'Чихнула и заглохла. Попробуй ещё.';
        if (this.fuel.empty) { p = 0; reason = 'Крутит, но не схватывает. Бензина нет.'; }
        if (this.inWater > 0.7) { p = 0; reason = 'Двигатель залит водой.'; }
        if (dmg.hp('engine') < 3) { p = 0; reason = 'Двигатель заклинило. Тут нужен механик, и не один.'; }
        if (Math.random() < p) {
          this._start();
          this.events.emit('engine-start', {});
        } else {
          e.cranking = 0;
          this.events.emit('engine-fail', { reason });
        }
      }
    }
    if (e.knocked > 0) e.knocked -= dt;

    // смена передач
    if (e.shiftTimer > 0) {
      e.shiftTimer -= dt;
      if (e.shiftTimer <= 0) {
        e.gear = e.targetGear;
        if (e.gear > 1 && chance(fac.gearPop)) {
          e.gear = 0;
          e.popTimer = 0.7;
          this.events.emit('gear-pop', {});
        }
      }
    } else if (e.popTimer > 0) {
      e.popTimer -= dt;
      if (e.popTimer <= 0) this._shiftTo(e.targetGear, fac.shiftTime);
    }

    // обороты ведущих колёс
    let omega = 0, n = 0;
    for (let i = 2; i < 4; i++) {
      const w = this.wheels[i];
      if (dmg.isDetached(w.id)) continue;
      omega += w.omega;
      n++;
    }
    omega = n ? omega / n : 0;

    const ratio = (BASE.gears[e.gear] || 0) * BASE.finalDrive;
    const wheelRpm = (omega * ratio * 60) / TWO_PI;
    e.clutchSlip = 0;

    if (!e.on) {
      e.rpm = damp(e.rpm, e.cranking > 0 ? 260 + Math.sin(e.cranking * 50) * 60 : 0, 5, dt);
      this.driveTorque = 0;
      e.powerKw = 0;
      e.load = 0;
      return;
    }

    // автомат: решаем по оборотам колёс, а не мотора — мотор при выжатом сцеплении врёт
    e.sinceShift = (e.sinceShift || 0) + dt;
    if (e.shiftTimer <= 0 && e.popTimer <= 0 && e.gear >= 1 && e.sinceShift > 1.2) {
      const spinning = this.wheels[2].spinning || this.wheels[3].spinning;
      const upAt = c.throttle > 0.6 ? 5150 : 3300;
      const downAt = c.throttle > 0.6 ? 2150 : 1400;
      const nextRatio = (BASE.gears[e.gear + 1] || 0) / BASE.gears[e.gear];
      if (wheelRpm > upAt && e.gear < fac.maxGear && !spinning && this.speed > 2 && wheelRpm * nextRatio > 1700) {
        this._shiftTo(e.gear + 1, fac.shiftTime);
      } else if (wheelRpm < downAt && e.gear > 1) {
        this._shiftTo(e.gear - 1, fac.shiftTime * 0.8);
      } else if (e.gear > fac.maxGear) {
        this._shiftTo(fac.maxGear, fac.shiftTime);
      }
    }

    let throttle = c.throttle;
    if (e.misfireT > 0) {
      e.misfireT -= dt;
      throttle *= 0.15;
    } else if (chance(fac.misfire * dt * 1.1)) {
      e.misfireT = 0.07 + Math.random() * 0.12;
      this.events.emit('misfire', {});
    }

    const engaged = e.gear !== 0 && e.shiftTimer <= 0;
    const idle = BASE.idleRpm;
    let targetRpm;
    let launchSlip = 0;
    if (engaged) {
      const launch = idle + 350 + throttle * 1800;
      if (wheelRpm < launch && throttle > 0.05) {
        targetRpm = launch;
        launchSlip = (launch - Math.max(0, wheelRpm)) / launch;
      } else {
        targetRpm = Math.max(wheelRpm, idle);
      }
    } else if (e.shiftTimer > 0) {
      // во время переключения газ сброшен, обороты подтягиваются к будущей передаче
      const nr = (BASE.gears[e.targetGear] || 0) * BASE.finalDrive;
      targetRpm = Math.max(idle, (omega * nr * 60) / TWO_PI);
      throttle = 0;
    } else {
      targetRpm = idle + throttle * (BASE.maxRpm - idle);
    }
    e.rpm = damp(e.rpm, clamp(targetRpm, 0, BASE.maxRpm + 150), engaged ? 18 : 6, dt);

    let T = torqueCurve(e.rpm) * this.config.peakTorque * fac.power * throttle;
    e.limiter = e.rpm >= BASE.maxRpm - 20;
    if (e.limiter) T = 0;
    if (engaged && Math.abs(wheelRpm) > idle + 150 && throttle < 0.05) {
      T -= 0.08 * this.config.peakTorque * Math.min(1, Math.abs(wheelRpm) / BASE.maxRpm) * Math.sign(wheelRpm);
    }

    if (engaged) {
      const cap = fac.clutchCap;
      if (Math.abs(T) > cap) {
        e.clutchSlip = (Math.abs(T) - cap) / cap;
        T = Math.sign(T) * cap;
        e.rpm = Math.min(BASE.maxRpm, e.rpm + 2500 * e.clutchSlip * dt);
      }
      e.clutchSlip += launchSlip * throttle * 0.15;
      this.driveTorque = T * ratio * 0.88;
    } else {
      this.driveTorque = 0;
    }
    e.powerKw = (Math.max(0, T) * e.rpm * TWO_PI) / 60 / 1000;
    e.load = throttle;
  }

  _wheelsStep(dt, fac) {
    const cfg = this.config;
    const sus = cfg.level('suspension');
    const k = BASE.spring * sus.stiff * fac.suspStiff;
    const travel = sus.travel;
    const restLen = BASE.restLength + sus.lift;
    const brakeMul = fac.brake * cfg.level('brakes').mul;
    const upY = this.up.y;
    const gs = this.gs;
    const dmg = this.damage;

    let driven = 0;
    for (let i = 2; i < 4; i++) if (!dmg.isDetached(this.wheels[i].id)) driven++;

    const parkedHold = this.parked || (this.controls.handbrake > 0 && Math.abs(this.speed) < 0.5);
    // «автоудержание»: заведённая машина без газа не катится назад на горке
    const autoHold = this.engine.on && this.controls.throttle < 0.05 && Math.abs(this.speed) < 0.3;

    for (let i = 0; i < 4; i++) {
      const w = this.wheels[i];
      w.wasContact = w.contact;
      w.contact = false;
      w.slip = 0;
      w.lock = false;
      w.spinning = false;
      if (dmg.isDetached(w.id)) {
        w.load = 0;
        w.comp = 0;
        continue;
      }
      const rEff = dmg.flat[i] ? BASE.wheelRadius - 0.075 : BASE.wheelRadius;
      w.radius = rEff;
      const rayLen = restLen + rEff;

      this.worldPoint(w.x, BASE.mountY, w.z, _p);
      if (upY < 0.2) {
        w.comp = 0;
        w.prevComp = 0;
        this._freeSpin(w, dt, driven);
        continue;
      }
      // луч вдоль -up до земли (несколько итераций, рельеф не плоский)
      this.ground.sample(_p.x, _p.z, gs, true);
      let t = (_p.y - gs.h) / upY;
      for (let it = 0; it < 3; it++) {
        const qx = _p.x - this.up.x * t, qz = _p.z - this.up.z * t, qy = _p.y - this.up.y * t;
        this.ground.sample(qx, qz, gs, true);
        const un = this.up.x * gs.nx + this.up.y * gs.ny + this.up.z * gs.nz;
        t += ((qy - gs.h) * gs.ny) / Math.max(un, 0.25);
      }
      if (t > rayLen) {
        w.comp = 0;
        w.prevComp = 0;
        this._freeSpin(w, dt, driven);
        w.airTime += dt;
        continue;
      }
      const comp = Math.min(rayLen - t, travel + 0.15);
      w.contact = true;
      w.cp.copy(_p).addScaledVector(this.up, -t);
      w.surface = gs.surface;
      w.water = gs.water;
      w.onRoad = gs.onRoad;

      let compVel = (comp - w.prevComp) / dt;
      compVel = clamp(compVel, -9, 9);
      const c = (compVel > 0 ? BASE.damperBump : BASE.damperRebound) * sus.damp * fac.suspDamp;
      let Fs = k * comp + c * compVel;
      if (comp > travel) {
        Fs += (comp - travel) * 150000;
        if (compVel > 3.2 && this.landingCooldown <= 0) {
          dmg.landing(i, compVel);
          this.landingCooldown = 0.4;
          this.events.emit('car-landing', { speed: compVel });
        }
      }
      // разбитая подвеска — потряхивает
      if (fac.shake > 0.08 && Math.abs(this.speed) > 3) Fs += (Math.random() - 0.5) * fac.shake * Math.abs(this.speed) * 160;
      Fs = Math.max(0, Fs);
      w.prevComp = comp;
      w.comp = Math.min(comp, travel + 0.04);
      w.load = Fs;
      w.airTime = 0;

      _f.copy(this.up).multiplyScalar(Fs);
      this._addForce(_f, w.cp);

      // --- шина ---
      _n.set(gs.nx, gs.ny, gs.nz);
      const sa = w.front ? this.steerAngle : 0;
      const cs = Math.cos(sa), sn = Math.sin(sa);
      _wf.copy(this.fwd).multiplyScalar(cs).addScaledVector(this.right, sn);
      _wf.addScaledVector(_n, -_wf.dot(_n)).normalize();
      _ws.crossVectors(_wf, _n).normalize();

      this._pointVel(w.cp, _vp);
      const vLong = _vp.dot(_wf);
      const vLat = _vp.dot(_ws);
      w.vLong = vLong;
      w.vLat = vLat;

      const s = gs.surface;
      const mu = s.grip * this.env.gripMul(s.key) * cfg.tireGrip(s.key) * fac.tireGrip[i];
      const N = Math.min(Fs, this.mass * G * 1.3);
      const Fmax = mu * N;

      // привод
      let drive = 0;
      if (w.driven && driven > 0) drive = this.driveTorque / driven / rEff;

      // тормоз + сопротивление качению — сила трения, может удержать на месте
      let brakeF = this.controls.brake * BASE.brakeForce * brakeMul * (w.front ? 1.15 : 0.85);
      if (!w.front) brakeF += this.controls.handbrake * BASE.handbrakeForce;
      if (parkedHold && !w.front) brakeF = Math.max(brakeF, BASE.handbrakeForce);
      if (autoHold) brakeF = Math.max(brakeF, 1800);
      let roll = (s.roll + (dmg.flat[i] ? 0.09 : 0)) * N;
      if (gs.water > 0) roll += Math.min(gs.water, 0.8) * N * 0.35;
      const resist = brakeF + roll;
      const mShare = this.mass / 4;
      let fx = drive + clamp(-(vLong * mShare) / dt - drive, -resist, resist);

      const locked = brakeF > Fmax * 1.08 && Math.abs(vLong) > 1.2;
      const hbLock = !w.front && this.controls.handbrake > 0.5 && Math.abs(vLong) > 0.8;
      const spinning = w.driven && Math.abs(drive) > Fmax * 0.97 && N > 100;
      let latMu = 1;
      if (locked || hbLock) latMu = 0.45;
      else if (spinning) latMu = 0.62;

      const latK = 1 / Math.max(Math.abs(vLong) * 0.11, 0.5);
      let fy = -clamp(vLat * latK, -1, 1) * Fmax * latMu;

      const total = Math.hypot(fx, fy);
      if (total > Fmax && total > 0) {
        const sc = Fmax / total;
        fx *= sc;
        fy *= sc;
        w.slip = total / Fmax - 1;
      }
      if (Math.abs(vLat) > 2.2) w.slip = Math.max(w.slip, (Math.abs(vLat) - 2.2) * 0.4);

      // буксуем
      if (spinning) {
        w.spinning = true;
        const excess = Math.abs(drive) - Fmax * 0.97;
        w.spin += Math.sign(drive) * excess * rEff * dt * 0.9;
        w.slip = Math.max(w.slip, Math.min(2, Math.abs(w.spin) * rEff * 0.15));
      } else {
        w.spin = damp(w.spin, 0, 10, dt);
      }
      w.spin = clamp(w.spin, -90, 90);
      w.lock = locked || hbLock;
      w.omega = w.lock ? 0 : vLong / rEff + w.spin;

      _f.copy(_wf).multiplyScalar(fx).addScaledVector(_ws, fy);
      // точку приложения чуть приподнимаем — меньше «подсекает» на поворотах
      _t.copy(w.cp).addScaledVector(this.up, rEff * 0.35);
      this._addForce(_f, _t);
    }

    // стабилизаторы
    const travelMax = travel + 0.04;
    for (const [a, b] of [[0, 1], [2, 3]]) {
      const wa = this.wheels[a], wb = this.wheels[b];
      if (!wa.contact || !wb.contact) continue;
      const diff = (Math.min(wa.comp, travelMax) - Math.min(wb.comp, travelMax)) * BASE.antiRoll * this.config.level('suspension').stiff;
      _f.copy(this.up).multiplyScalar(diff);
      this._addForce(_f, wa.cp);
      _f.multiplyScalar(-1);
      this._addForce(_f, wb.cp);
    }
  }

  _freeSpin(w, dt, driven) {
    w.contact = false;
    if (w.driven && driven > 0) {
      w.omega += (this.driveTorque / driven) * dt * 0.8;
    }
    w.omega = damp(w.omega, 0, this.controls.brake > 0.1 || this.controls.handbrake ? 8 : 0.4, dt);
    w.omega = clamp(w.omega, -150, 150);
    w.spin = 0;
  }

  _aero(fac) {
    const v = this.vel.length();
    if (v < 0.1) return;
    const cd = 0.54 + fac.drag * 1.2;
    this.force.addScaledVector(this.vel, -cd * v);
  }

  _waterStep() {
    const bottom = this.pos.y - 0.45;
    const sub = clamp((WATER_Y - bottom) / 1.3, 0, 1);
    if (sub <= 0) {
      this.inWater = 0;
      return;
    }
    // проверяем, что тут правда вода, а не просто низина рядом с рекой
    this.ground.sample(this.pos.x, this.pos.z, this.gs, false);
    if (this.gs.water <= 0 && !(this.gs.h < WATER_Y)) {
      this.inWater = 0;
      return;
    }
    this.inWater = WATER_Y - bottom;
    this.force.addScaledVector(this.vel, -sub * 2600);
    this.force.y += sub * this.mass * G * 0.5;
    this.angVel.multiplyScalar(1 - sub * 0.02);
  }

  _collide(dt) {
    const contacts = this.contacts;
    contacts.length = 0;
    const gs = this.gs;

    for (const h of HULL) {
      this.worldPoint(h.x, h.y, h.z, _p);
      this.ground.sample(_p.x, _p.z, gs, false);
      const pen = gs.h - _p.y;
      if (pen > 0) {
        contacts.push({
          px: _p.x, py: _p.y, pz: _p.z, nx: gs.nx, ny: gs.ny, nz: gs.nz,
          depth: pen * gs.ny, zone: h.zone, lx: h.x, lz: h.z, kind: 'terrain', mu: 0.55, e: 0.05,
        });
      }
    }
    // отвалившееся колесо — ступица скребёт по земле
    for (const w of this.wheels) {
      if (!this.damage.isDetached(w.id)) continue;
      this.worldPoint(w.x, BASE.mountY - 0.32, w.z, _p);
      this.ground.sample(_p.x, _p.z, gs, false);
      const pen = gs.h - _p.y;
      if (pen > 0) {
        contacts.push({
          px: _p.x, py: _p.y, pz: _p.z, nx: gs.nx, ny: gs.ny, nz: gs.nz,
          depth: pen * gs.ny, zone: 'bottom', lx: w.x, lz: w.z, kind: 'hub', mu: 0.45, e: 0,
        });
      }
    }

    // препятствия
    let fx = this.fwd.x, fz = this.fwd.z;
    let fl = Math.hypot(fx, fz);
    if (fl < 0.3) { fx = -this.up.x; fz = -this.up.z; fl = Math.hypot(fx, fz) || 1; }
    fx /= fl; fz /= fl;
    const list = this.colliders ? this.colliders.query(this.pos.x, this.pos.z, 3.2, _list) : [];
    for (const c of list) {
      if (c.y1 < this.pos.y - 0.3 || c.y0 > this.pos.y + 0.75) continue;
      const hit = c.type === 'circle'
        ? circleVsRect(c, this.pos.x, this.pos.z, fx, fz, HALF_X, HALF_Z, _hit)
        : boxVsRect(c, this.pos.x, this.pos.z, fx, fz, HALF_X, HALF_Z, _hit);
      if (!hit) continue;
      const py = clamp(this.pos.y - 0.05, c.y0 + 0.1, c.y1);
      const dx = _hit.px - this.pos.x, dz = _hit.pz - this.pos.z;
      const lx = dx * this.right.x + dz * this.right.z;
      const lz = dx * this.fwd.x + dz * this.fwd.z;
      const zone = Math.abs(lz) > 1.55 ? (lz > 0 ? 'front' : 'rear') : lx < 0 ? 'left' : 'right';
      contacts.push({
        px: _hit.px, py, pz: _hit.pz, nx: _hit.nx, ny: 0, nz: _hit.nz, depth: _hit.depth,
        zone, lx, lz, kind: c.kind || 'obstacle', collider: c, mu: 0.35, e: 0.18,
      });
    }

    if (!contacts.length) return;

    // разрушаемое (кусты, заборы, знаки) — проламываем
    for (let i = contacts.length - 1; i >= 0; i--) {
      const ct = contacts[i];
      const c = ct.collider;
      if (!c || !c.breakable) continue;
      _p.set(ct.px, ct.py, ct.pz);
      this._pointVel(_p, _vp);
      const vn = -(_vp.x * ct.nx + _vp.z * ct.nz);
      if (vn > (c.breakSpeed ?? 4)) {
        c.disabled = true;
        this.vel.multiplyScalar(c.slow ?? 0.85);
        this.events.emit('obstacle-break', { collider: c, speed: vn });
        if (c.damage) this.damage.applyImpact({ zone: ct.zone, lx: ct.lx, lz: ct.lz, speed: Math.min(vn, c.damage), kind: 'obstacle' });
        contacts.splice(i, 1);
      }
    }

    // импульсы
    for (const ct of contacts) {
      _p.set(ct.px, ct.py, ct.pz);
      this._pointVel(_p, _vp);
      if (ct.collider?.moving) {
        _vp.x -= ct.collider.vx || 0;
        _vp.z -= ct.collider.vz || 0;
      }
      const vn = _vp.x * ct.nx + _vp.y * ct.ny + _vp.z * ct.nz;
      ct.impact = Math.max(0, -vn);
      ct.target = vn < -1.2 ? -ct.e * vn : 0;
      ct.jn = 0;
    }
    for (let iter = 0; iter < 3; iter++) {
      for (const ct of contacts) {
        _p.set(ct.px, ct.py, ct.pz);
        _n.set(ct.nx, ct.ny, ct.nz);
        this._pointVel(_p, _vp);
        if (ct.collider?.moving) {
          _vp.x -= ct.collider.vx || 0;
          _vp.z -= ct.collider.vz || 0;
        }
        const vn = _vp.dot(_n);
        _r.subVectors(_p, this.pos);
        _t.crossVectors(_r, _n);
        this._invI(_t, _t);
        _t.cross(_r);
        const kn = 1 / this.mass + _n.dot(_t);
        let j = (ct.target - vn) / kn;
        const old = ct.jn;
        ct.jn = Math.max(0, old + j);
        j = ct.jn - old;
        if (j !== 0) {
          _f.copy(_n).multiplyScalar(j);
          this._applyImpulse(_f, _p);
        }
        // трение
        this._pointVel(_p, _vp);
        if (ct.collider?.moving) {
          _vp.x -= ct.collider.vx || 0;
          _vp.z -= ct.collider.vz || 0;
        }
        if (iter > 0) continue;
        const vn2 = _vp.dot(_n);
        _vp.addScaledVector(_n, -vn2);
        const vt = _vp.length();
        if (vt > 1e-4 && ct.jn > 0) {
          _vp.multiplyScalar(1 / vt);
          _r.subVectors(_p, this.pos);
          _t.crossVectors(_r, _vp);
          this._invI(_t, _t);
          _t.cross(_r);
          const kt = 1 / this.mass + _vp.dot(_t);
          const jt = Math.min(vt / kt, ct.mu * ct.jn);
          _f.copy(_vp).multiplyScalar(-jt);
          this._applyImpulse(_f, _p);
        }
      }
    }

    // вытаскиваем из земли
    let maxD = 0, mnx = 0, mny = 1, mnz = 0;
    for (const ct of contacts) {
      if (ct.collider) {
        this.pos.x += ct.nx * ct.depth;
        this.pos.z += ct.nz * ct.depth;
      } else if (ct.depth > maxD) {
        maxD = ct.depth;
        mnx = ct.nx; mny = ct.ny; mnz = ct.nz;
      }
    }
    if (maxD > 0.004) {
      const d = Math.min(maxD - 0.004, 0.5) * 0.8;
      this.pos.x += mnx * d;
      this.pos.y += mny * d;
      this.pos.z += mnz * d;
    }

    // повреждения
    for (const ct of contacts) {
      if (ct.impact < 2.4) {
        // скрежет днищем на скорости
        if (ct.kind === 'terrain' && ct.zone === 'bottom' && this.vel.length() > 4 && chance(dt * 2)) {
          this.damage.applyImpact({ zone: 'bottom', lx: ct.lx, lz: ct.lz, speed: 2.4 + this.vel.length() * 0.35, kind: 'scrape' });
          this.events.emit('car-scrape', {});
        }
        continue;
      }
      this._impact(ct);
    }
  }

  _impact(ct) {
    const kind = ct.collider?.kind === 'tree' ? 'tree' : ct.kind === 'hub' ? 'scrape' : 'obstacle';
    const base = this.damage.applyImpact({
      zone: ct.zone, lx: ct.lx, lz: ct.lz, speed: ct.impact, kind,
      armor: ct.zone === 'front' ? this.config.armor : 1,
    });
    if (base <= 0) return;
    this.lastImpact = performance.now();
    this.events.emit('car-impact', {
      speed: ct.impact, zone: ct.zone, base, lx: ct.lx, lz: ct.lz,
      x: ct.px, y: ct.py, z: ct.pz, kind, collider: ct.collider || null,
    });
    if (base > 32 && Math.abs(this.speed) > 6) {
      this.stunned = Math.min(1.4, 0.4 + base / 80);
      this.events.emit('stunned', {});
    }
    if (this.engine.on && base > 40 && chance(Math.min(0.9, base / 140))) {
      this.stopEngine('impact');
      this.events.emit('note', { text: 'От удара двигатель заглох.' });
    }
  }

  _bookkeeping(dt, fac) {
    const e = this.engine;
    const dmg = this.damage;
    this.speed = this.vel.dot(this.fwd);
    const hs = Math.hypot(this.vel.x, this.vel.z);
    this.odometer += hs * dt;
    if (this.landingCooldown > 0) this.landingCooldown -= dt;

    const anyContact = this.wheels.some((w) => w.contact);
    this.airTime = anyContact ? 0 : this.airTime + dt;

    if (this.up.y < 0.25) {
      this.upsideTime += dt;
      if (this.upsideTime > 1.2 && !this.flipped && hs < 3) {
        this.flipped = true;
        this.events.emit('car-flipped', {});
      }
      if (e.on && this.upsideTime > 2.5) this.stopEngine('flip');
    } else {
      this.upsideTime = 0;
      if (this.flipped && this.up.y > 0.7) this.flipped = false;
    }

    for (const w of this.wheels) w.angle = (w.angle + w.omega * dt) % TWO_PI;

    // температура
    const amb = this.env.ambient();
    const radiator = dmg.frac('cooling') * clamp(dmg.fluids.coolant / 0.6, 0, 1);
    let heat = e.on ? 0.3 + 0.9 * e.load * (e.rpm / BASE.maxRpm + 0.2) : 0;
    if (dmg.fluids.oil < 0.15) heat *= 1.4;
    const thermostat = e.temp > 86 ? 1 : 0.15;
    const cool = (e.temp - amb) * (0.0035 + 0.022 * radiator * thermostat);
    e.temp += (heat - cool) * dt;
    if (dmg.fluids.coolantWater && amb < -2 && !e.on && e.temp < 2 && !dmg.faults.frozen) {
      dmg.fluids.coolant = 0;
      this.events.emit('note', { text: 'Вода в радиаторе замёрзла. Надо было лить антифриз…', kind: 'warn' });
      dmg.fluids.coolantWater = false;
    }

    if (e.on) {
      if (this.fuel.empty) this.stopEngine('fuel');
      else if (e.temp > 128) this.stopEngine('overheat');
      else if (WATER_Y > this.pos.y + 0.2 && this.inWater > 0) {
        this.stopEngine('water');
        dmg.damage('engine', 22);
        this.events.emit('engine-flooded', {});
      } else if (dmg.hp('engine') < 12 && chance(0.03 * dt)) this.stopEngine('engine');
      else if (dmg.hasFault('fuelpump') && chance(0.012 * dt)) this.stopEngine('fuelpump');
      else if (dmg.fluids.oil <= 0.001 && dmg.hp('engine') < 5) this.stopEngine('seized');
    }

    // электрика
    const fl = dmg.fluids;
    const cap = 0.3 + 0.7 * dmg.frac('battery');
    let dq = 0;
    if (e.on && !dmg.hasFault('belt')) dq += 0.0045;
    if (this.lightsOn) dq -= 0.0011;
    if (this.radioDrain) dq -= 0.0004;
    fl.charge = clamp(fl.charge + (dq / cap) * dt, 0, 1);
    if (fl.charge <= 0.02 && this.lightsOn && !e.on) {
      this.lightsOn = false;
      this.events.emit('note', { text: 'Фары потухли — аккумулятор разряжен в ноль.' });
    }

    // топливо
    const eff = 1 + (fac.misfire > 0.3 ? 0.25 : 0);
    this.fuel.consume(dt, e.on, e.powerKw, eff);
    this.fuel.leak(dt, dmg.leaks.fuel * (1 - dmg.frac('fuelTank') * 0.3));

    // грязь на кузове
    let dirtRate = 0;
    for (const w of this.wheels) {
      if (!w.contact || !w.surface) continue;
      const fx = w.surface.fx;
      if (fx === 'mud') dirtRate += 0.02;
      else if (fx === 'dust' || fx === 'dirt' || fx === 'sand') dirtRate += 0.003;
      else if (fx === 'water') dirtRate -= 0.02;
    }
    this.dirt = clamp(this.dirt + dirtRate * Math.min(1, hs / 6) * dt - this.wet * 0.002 * dt, 0, 1);

    let rough = 0;
    for (const w of this.wheels) if (w.contact && w.surface) rough = Math.max(rough, w.surface.rough);
    dmg.update(dt, {
      engineOn: e.on, temp: e.temp, rpm: e.rpm, brake: this.controls.brake, speed: hs,
      clutchSlip: e.clutchSlip, rough,
    });
  }

  // для HUD и звука
  get speedKmh() {
    return Math.abs(this.speed) * 3.6;
  }

  get gearLabel() {
    const g = this.engine.gear;
    if (this.engine.shiftTimer > 0) return '·';
    return g === -1 ? 'R' : g === 0 ? 'N' : String(g);
  }

  wheelsAnySpin() {
    return this.wheels.some((w) => w.spinning);
  }

  serialize() {
    return {
      pos: this.pos.toArray(),
      quat: this.quat.toArray(),
      gear: this.engine.gear < 0 ? 1 : this.engine.gear,
      temp: this.engine.temp,
      lights: this.lightsOn,
      dirt: this.dirt,
      odometer: this.odometer,
      config: this.config.serialize(),
      damage: this.damage.serialize(),
      fuel: this.fuel.serialize(),
    };
  }

  deserialize(d) {
    if (!d) return;
    this.config.deserialize(d.config);
    this.damage.deserialize(d.damage);
    this.fuel.deserialize(d.fuel);
    this.pos.fromArray(d.pos);
    this.quat.fromArray(d.quat);
    // чуть приподнимаем, чтобы не провалиться при загрузке
    const h = this.ground.height(this.pos.x, this.pos.z);
    if (this.pos.y < h + 0.5) this.pos.y = h + 0.75;
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);
    this.engine.on = false;
    this.engine.gear = d.gear ?? 1;
    this.engine.temp = d.temp ?? 20;
    this.lightsOn = !!d.lights;
    this.dirt = d.dirt ?? 0.1;
    this.odometer = d.odometer ?? 0;
    this.parked = true;
    this._basis();
  }
}

export { WHEEL_IDS, HULL };
