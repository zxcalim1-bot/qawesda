import * as THREE from 'three';
import { paint, merge, box, propMaterial, glassMaterial } from './Props.js';
import { locationById } from './WorldLayout.js';
import { damp } from '../core/util.js';

function wheels(parts, list, r, w) {
  for (const [x, z] of list) {
    const g = new THREE.CylinderGeometry(r, r, w, 12).rotateZ(Math.PI / 2).translate(x, r, z);
    parts.push(paint(g, 'rubber:#161616'));
  }
}

const MODELS = {
  kamaz: () => {
    const p = [];
    p.push(paint(box(2.4, 2.3, 2.2, 0, 1.9, 3.6), 'metal:#c8702a'));
    p.push(paint(box(2.5, 2.6, 6.5, 0, 2.3, -1.2), 'metal:#3a5a3a'));
    p.push(paint(box(2.2, 0.4, 9.5, 0, 0.75, 0.6), 'rusty:#2a2a2a'));
    p.push(paint(box(2.0, 0.6, 0.2, 0, 1.0, 4.75), 'metal:#8a8a8a'));
    wheels(p, [[-1.05, 3.4], [1.05, 3.4], [-1.05, -1.8], [1.05, -1.8], [-1.05, -3.2], [1.05, -3.2]], 0.52, 0.4);
    const g = new THREE.Group();
    const m = new THREE.Mesh(merge(p), propMaterial);
    m.castShadow = true;
    g.add(m, new THREE.Mesh(box(2.3, 0.9, 0.05, 0, 2.4, 4.72), glassMaterial));
    return { group: g, hx: 1.25, hz: 4.9, speed: 14 };
  },
  paz: () => {
    const p = [];
    p.push(paint(box(2.3, 2.2, 7.2, 0, 1.6, 0), 'metal:#e8c040'));
    p.push(paint(box(2.32, 0.3, 7.22, 0, 0.75, 0), 'metal:#c83020'));
    p.push(paint(box(2.0, 0.5, 0.1, 0, 1.0, 3.62), 'metal:#d8d8d0'));
    wheels(p, [[-1.0, 2.4], [1.0, 2.4], [-1.0, -2.4], [1.0, -2.4]], 0.45, 0.35);
    const g = new THREE.Group();
    const m = new THREE.Mesh(merge(p), propMaterial);
    m.castShadow = true;
    g.add(m);
    const win = merge([box(0.05, 0.8, 5.5, 1.16, 2.1, -0.3), box(0.05, 0.8, 5.5, -1.16, 2.1, -0.3), box(2.1, 0.9, 0.05, 0, 2.0, 3.61)]);
    g.add(new THREE.Mesh(win, glassMaterial));
    return { group: g, hx: 1.18, hz: 3.65, speed: 12 };
  },
  niva: () => {
    const p = [];
    p.push(paint(box(1.68, 0.75, 3.7, 0, 0.85, 0), 'metal:#e8e6dc'));
    p.push(paint(box(1.6, 0.6, 2.0, 0, 1.5, -0.35), 'metal:#e8e6dc'));
    p.push(paint(box(1.3, 0.12, 1.4, 0, 1.86, -0.4), 'metal:#3a3a3a'));
    wheels(p, [[-0.75, 1.25], [0.75, 1.25], [-0.75, -1.2], [0.75, -1.2]], 0.36, 0.25);
    const g = new THREE.Group();
    const m = new THREE.Mesh(merge(p), propMaterial);
    m.castShadow = true;
    g.add(m, new THREE.Mesh(box(1.5, 0.45, 0.05, 0, 1.55, 0.67), glassMaterial));
    return { group: g, hx: 0.86, hz: 1.9, speed: 16 };
  },
};

// Редкие попутные и встречные машины на трассе. Ездят по своей полосе,
// тормозят перед Ласточкой и сигналят, если она мешает.
export class Traffic {
  constructor(game) {
    this.game = game;
    const roads = game.world.roads;
    this.road = roads.byId.main;
    const L = this.road.length;
    const sAt = (id) => roads.nearest(locationById[id].x, locationById[id].z, 300, (r) => r === this.road)?.s ?? L / 2;
    const slide = sAt('landslide');
    const cp = sAt('checkpoint');
    this.list = [
      this._make('kamaz', 300, 1, [60, slide - 60]),
      this._make('paz', 1500, -1, [60, slide - 60]),
      this._make('niva', slide + 200, 1, [slide + 60, cp - 50]),
    ];
  }

  _make(type, s, dir, range) {
    const g = this.game;
    const m = MODELS[type]();
    g.scene.add(m.group);
    const col = g.world.colliders.add({
      type: 'box', x: 0, z: 0, hx: m.hx, hz: m.hz, rot: 0, moving: true, vx: 0, vz: 0, kind: 'traffic',
    });
    return { type, mesh: m.group, s, dir, speed: m.speed, cruise: m.speed, range, col, blockedT: 0, lane: 2.1 };
  }

  update(dt) {
    const g = this.game;
    const car = g.vehicle;
    const cam = g.camera.position;
    const p = {};
    for (const v of this.list) {
      // поворот на концах участка — когда игрок не видит
      const nearEnd = (v.dir > 0 && v.s > v.range[1]) || (v.dir < 0 && v.s < v.range[0]);
      const toPlayer = Math.hypot(v.mesh.position.x - cam.x, v.mesh.position.z - cam.z);
      if (nearEnd) {
        if (toPlayer > 220) v.dir = -v.dir;
        else {
          v.speed = damp(v.speed, 0, 3, dt);
        }
      }
      // кривизна впереди: на серпантине медленнее
      const a = this.road.at(v.s, p);
      const ax = a.dx, az = a.dz;
      const b = this.road.at(v.s + v.dir * 35, {});
      const turn = Math.abs(Math.atan2(ax * b.dz - az * b.dx, ax * b.dx + az * b.dz));
      let target = nearEnd ? 0 : v.cruise * (turn > 0.5 ? 0.55 : turn > 0.25 ? 0.75 : 1);

      // Ласточка впереди на нашей полосе?
      const fx = ax * v.dir, fz = az * v.dir;
      const dx = car.pos.x - v.mesh.position.x, dz = car.pos.z - v.mesh.position.z;
      const ahead = dx * fx + dz * fz;
      const side = Math.abs(dx * -fz + dz * fx);
      if (ahead > 0 && ahead < 26 && side < 3.2) {
        target = Math.min(target, Math.max(0, (ahead - 9) * 0.6));
        if (ahead < 14) {
          v.blockedT += dt;
          if (v.blockedT > 3 && Math.hypot(dx, dz) < 40) {
            v.blockedT = -4;
            g.audio.play('honk');
          }
        }
      } else if (v.blockedT > 0) v.blockedT = 0;
      // друг в друга тоже не въезжаем
      for (const o of this.list) {
        if (o === v || o.dir !== v.dir) continue;
        const gap = (o.s - v.s) * v.dir;
        if (gap > 0 && gap < 25) target = Math.min(target, o.speed * 0.8);
      }

      v.speed = damp(v.speed, target, target < v.speed ? 2.5 : 0.8, dt);
      v.s += v.dir * v.speed * dt;
      this.road.at(v.s, p);
      const rx = -p.dz * v.dir, rz = p.dx * v.dir; // правая полоса по ходу
      const x = p.x + rx * v.lane, z = p.z + rz * v.lane;
      const y = g.world.ground.height(x, z);
      v.mesh.position.set(x, y, z);
      const yaw = Math.atan2(p.dx * v.dir, p.dz * v.dir);
      v.mesh.rotation.y = yaw;
      v.mesh.visible = toPlayer < g.world.viewDistance * 1.3;
      const c = v.col;
      c.x = x;
      c.z = z;
      c.rot = yaw;
      c.sin = Math.sin(yaw);
      c.cos = Math.cos(yaw);
      c.vx = p.dx * v.dir * v.speed;
      c.vz = p.dz * v.dir * v.speed;
      c.y0 = y - 1;
      c.y1 = y + 3;
    }
  }
}
