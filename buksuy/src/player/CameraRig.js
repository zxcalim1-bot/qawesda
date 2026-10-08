import * as THREE from 'three';
import { clamp, damp } from '../core/util.js';

const _v = new THREE.Vector3();
const _t = new THREE.Vector3();

const CAR_MODES = [
  { id: 'chase', dist: 6.6, height: 2.1, look: 1.0 },
  { id: 'far', dist: 11, height: 3.6, look: 1.2 },
  { id: 'hood', dist: 0, height: 0, look: 0 },
];

export class CameraRig {
  constructor(camera, ground, settings) {
    this.camera = camera;
    this.ground = ground;
    this.settings = settings;
    this.carMode = 0;
    this.orbitYaw = 0;
    this.orbitPitch = 0.15;
    this.lastMouse = 0;
    this.footYaw = 0;
    this.footPitch = 0.25;
    this.footDist = 4.2;
    this.pos = new THREE.Vector3(0, 10, 0);
    this.target = new THREE.Vector3();
    this.shake = 0;
    this.velDir = new THREE.Vector3(0, 0, 1);
    this.menuAngle = 0;
  }

  cycleCarMode() {
    this.carMode = (this.carMode + 1) % CAR_MODES.length;
    return CAR_MODES[this.carMode].id;
  }

  addShake(a) {
    this.shake = Math.min(1.2, this.shake + a);
  }

  _mouse(mouse) {
    const s = 0.0026 * (this.settings.get('mouseSens') || 1);
    const inv = this.settings.get('invertY') ? -1 : 1;
    return { dx: mouse.x * s, dy: mouse.y * s * inv };
  }

  // camera: за машиной
  updateCar(dt, car, mouse) {
    const mode = CAR_MODES[this.carMode];
    const m = this._mouse(mouse);
    if (Math.abs(m.dx) + Math.abs(m.dy) > 0) {
      this.orbitYaw -= m.dx;
      this.orbitPitch = clamp(this.orbitPitch + m.dy, -0.2, 1.1);
      this.lastMouse = 0;
    } else {
      this.lastMouse += dt;
      if (this.lastMouse > 2) {
        this.orbitYaw = damp(this.orbitYaw, 0, 2, dt);
        this.orbitPitch = damp(this.orbitPitch, 0.15, 2, dt);
      }
    }
    if (mouse.wheel) {
      this.zoom = clamp((this.zoom || 1) + mouse.wheel * 0.1, 0.6, 1.8);
    }
    const zoom = this.zoom || 1;

    if (mode.id === 'hood') {
      car.worldPoint(-0.38, 0.52, 0.15, _v); // место водителя (лево = -right)
      this.camera.position.copy(_v);
      _t.copy(_v).addScaledVector(car.fwd, 10).addScaledVector(car.up, -0.4);
      // можно оглядываться мышью
      _t.sub(_v).applyAxisAngle(car.up, this.orbitYaw).add(_v);
      this.camera.up.copy(car.up);
      this.camera.lookAt(_t);
      this.pos.copy(this.camera.position);
      return;
    }
    this.camera.up.set(0, 1, 0);

    // направление «назад»: по курсу машины, на скорости — по вектору скорости
    const flat = _t.set(car.fwd.x, 0, car.fwd.z);
    if (flat.lengthSq() < 0.01) flat.set(0, 0, 1);
    flat.normalize();
    const hv = _v.set(car.vel.x, 0, car.vel.z);
    if (hv.length() > 4 && car.speed > 0) {
      hv.normalize();
      flat.lerp(hv, 0.35).normalize();
    }
    this.velDir.lerp(flat, 1 - Math.exp(-4 * dt)).normalize();
    const dir = _v.copy(this.velDir).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.orbitYaw);
    const dist = mode.dist * zoom;
    const desired = new THREE.Vector3(
      car.pos.x - dir.x * dist * Math.cos(this.orbitPitch * 0.6),
      car.pos.y + mode.height * zoom + Math.sin(this.orbitPitch) * dist * 0.6,
      car.pos.z - dir.z * dist * Math.cos(this.orbitPitch * 0.6),
    );
    const gh = this.ground.height(desired.x, desired.z);
    if (desired.y < gh + 0.8) desired.y = gh + 0.8;
    const k = 1 - Math.exp(-7 * dt);
    this.pos.lerp(desired, k);
    if (this.pos.distanceTo(car.pos) > dist * 3) this.pos.copy(desired);
    this.target.set(car.pos.x, car.pos.y + mode.look, car.pos.z);
    this._apply(dt);
  }

  updateFoot(dt, player, mouse) {
    const m = this._mouse(mouse);
    this.footYaw -= m.dx;
    this.footPitch = clamp(this.footPitch + m.dy, -0.6, 1.25);
    if (mouse.wheel) this.footDist = clamp(this.footDist + mouse.wheel * 0.4, 2, 9);
    const head = _t.set(player.pos.x, player.pos.y + 1.55, player.pos.z);
    const d = this.footDist;
    const desired = new THREE.Vector3(
      head.x - Math.sin(this.footYaw) * Math.cos(this.footPitch) * d,
      head.y + Math.sin(this.footPitch) * d,
      head.z - Math.cos(this.footYaw) * Math.cos(this.footPitch) * d,
    );
    const gh = this.ground.height(desired.x, desired.z);
    if (desired.y < gh + 0.4) desired.y = gh + 0.4;
    this.pos.lerp(desired, 1 - Math.exp(-14 * dt));
    this.target.copy(head);
    this._apply(dt);
  }

  // кино-облёт для главного меню
  updateMenu(dt, center) {
    this.menuAngle += dt * 0.05;
    const r = 9;
    this.pos.set(center.x + Math.sin(this.menuAngle) * r, center.y + 2.2, center.z + Math.cos(this.menuAngle) * r);
    const gh = this.ground.height(this.pos.x, this.pos.z);
    if (this.pos.y < gh + 1) this.pos.y = gh + 1;
    this.target.set(center.x, center.y + 0.6, center.z);
    this.camera.up.set(0, 1, 0);
    this._apply(dt);
  }

  // смотреть вперёд по взгляду камеры (для пешехода)
  get yawForward() {
    return this.footYaw;
  }

  _apply(dt) {
    this.camera.position.copy(this.pos);
    if (this.shake > 0.01) {
      const s = this.shake * 0.12;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.camera.position.z += (Math.random() - 0.5) * s;
      this.shake = damp(this.shake, 0, 6, dt);
    }
    this.camera.lookAt(this.target);
  }

  get modeId() {
    return CAR_MODES[this.carMode].id;
  }
}
