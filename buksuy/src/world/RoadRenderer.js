import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeRoadTexture, patchWeather } from './materials.js';
import { WATER_Y } from './WorldLayout.js';

const LIFT = 0.045;
const PIECE = 90; // сэмплов на кусок меша (~180 м)

export class RoadRenderer {
  constructor(scene, roads, terrain) {
    this.scene = scene;
    this.roads = roads;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.group.name = 'roads';
    scene.add(this.group);
    this.materials = {};
    for (const [type, offset] of [['asphalt', -4], ['gravel', -3], ['dirt', -2], ['rail', -2]]) {
      const m = new THREE.MeshStandardMaterial({
        map: makeRoadTexture(type),
        roughness: type === 'asphalt' ? 0.85 : 0.95,
        polygonOffset: true,
        polygonOffsetFactor: offset,
        polygonOffsetUnits: offset,
      });
      patchWeather(m, { detail: 0.25, detailScale: 0.3, wetDark: type === 'asphalt' ? 0.45 : 0.3, snow: 0.8 });
      this.materials[type] = m;
    }
    this.pieces = []; // { mesh, road, x, z }
    for (const r of roads.roads) this._buildRoad(r);
    this._buildBridges();
    this._buildPosts();
  }

  _buildRoad(r) {
    for (let start = 0; start < r.n - 1; start += PIECE) {
      const end = Math.min(r.n - 1, start + PIECE);
      const pos = [], uv = [], idx = [];
      let k = 0;
      let lastOk = false;
      for (let i = start; i <= end; i++) {
        const inWater = r.inWater && r.inWater(i);
        const i0 = Math.max(0, i - 1), i1 = Math.min(r.n - 1, i + 1);
        let dx = r.x[i1] - r.x[i0], dz = r.z[i1] - r.z[i0];
        const len = Math.hypot(dx, dz) || 1;
        dx /= len; dz /= len;
        // право = (-dz, dx)
        const rx = -dz, rz = dx;
        const hw = r.halfWidth;
        const y = r.h[i] + LIFT;
        pos.push(r.x[i] - rx * hw, y, r.z[i] - rz * hw, r.x[i] + rx * hw, y, r.z[i] + rz * hw);
        const v = r.s[i] / (r.type === 'asphalt' ? 16 : 10);
        uv.push(0, v, 1, v);
        const ok = !inWater && r.h[i] > WATER_Y - 0.1;
        if (k > 0 && ok && lastOk) {
          const a = (k - 1) * 2, b = a + 1, c = k * 2, d = c + 1;
          idx.push(a, c, b, b, c, d);
        }
        lastOk = ok;
        k++;
      }
      if (!idx.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, this.materials[r.type]);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = 1;
      this.group.add(mesh);
      const mid = Math.floor((start + end) / 2);
      this.pieces.push({ mesh, road: r, x: r.x[mid], z: r.z[mid] });
    }
  }

  _segBox(ax, ay, az, bx, by, bz, w, h, yOff = 0, sideOff = 0) {
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len = Math.hypot(dx, dy, dz);
    const g = new THREE.BoxGeometry(w, h, len + 0.05);
    const m = new THREE.Matrix4();
    const mid = new THREE.Vector3((ax + bx) / 2, (ay + by) / 2 + yOff, (az + bz) / 2);
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const right = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    mid.addScaledVector(right, sideOff);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    m.compose(mid, q, new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    return g;
  }

  _buildBridges() {
    const concrete = new THREE.MeshStandardMaterial({ color: 0x8d8c86, roughness: 0.9 });
    const rail = new THREE.MeshStandardMaterial({ color: 0x5b6a72, roughness: 0.6, metalness: 0.4 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x6a4d32, roughness: 0.95 });
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 1 });
    for (const r of this.roads.roads) {
      for (const b of r.bridges) {
        const deck = [], rails = [], pillars = [];
        const hw = r.halfWidth;
        for (let i = b.i0; i < b.i1; i++) {
          const ax = r.x[i], az = r.z[i], bx = r.x[i + 1], bz = r.z[i + 1];
          const ay = r.h[i], by = r.h[i + 1];
          if (b.kind === 'concrete') {
            deck.push(this._segBox(ax, ay, az, bx, by, bz, hw * 2 + 1.2, 0.6, -0.28));
            for (const s of [-1, 1]) {
              rails.push(this._segBox(ax, ay, az, bx, by, bz, 0.08, 0.08, 1.0, s * (hw + 0.45)));
              rails.push(this._segBox(ax, ay, az, bx, by, bz, 0.06, 0.06, 0.55, s * (hw + 0.45)));
              deck.push(this._segBox(ax, ay, az, bx, by, bz, 0.35, 0.35, 0.12, s * (hw + 0.35)));
            }
            if ((i - b.i0) % 3 === 0) {
              const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1;
              for (const s of [-1, 1]) {
                const post = new THREE.BoxGeometry(0.08, 1.0, 0.08);
                post.translate(ax + (-dz / l) * s * (hw + 0.45), ay + 0.55, az + (dx / l) * s * (hw + 0.45));
                rails.push(post);
              }
            }
            if ((i - b.i0) % 6 === 3) {
              const ground = this.terrain.heightAt(ax, az);
              const hgt = ay - ground + 1;
              const pil = new THREE.CylinderGeometry(0.7, 0.8, hgt, 10);
              pil.translate(ax, ground + hgt / 2 - 1.2, az);
              pillars.push(pil);
            }
          } else {
            // старый деревянный: доски поперёк, местами дырки
            const segLen = Math.hypot(bx - ax, bz - az);
            const dx = (bx - ax) / segLen, dz = (bz - az) / segLen;
            for (let s = 0; s < segLen; s += 0.45) {
              if (Math.random() < 0.06) continue;
              const px = ax + dx * s, pz = az + dz * s;
              const py = ay + (by - ay) * (s / segLen) - 0.04 + (Math.random() - 0.5) * 0.03;
              const plank = new THREE.BoxGeometry(hw * 2 + 0.4, 0.08, 0.38);
              const m = new THREE.Matrix4().makeRotationY(Math.atan2(dx, dz) + (Math.random() - 0.5) * 0.06);
              plank.applyMatrix4(m);
              plank.translate(px, py, pz);
              deck.push(plank);
            }
            for (const side of [-1, 1]) {
              rails.push(this._segBox(ax, ay, az, bx, by, bz, 0.1, 0.1, 0.95, side * (hw + 0.2)));
              deck.push(this._segBox(ax, ay, az, bx, by, bz, 0.25, 0.3, -0.25, side * (hw - 0.3)));
            }
            if ((i - b.i0) % 2 === 0) {
              for (const side of [-1, 1]) {
                const post = new THREE.BoxGeometry(0.14, 1.1, 0.14);
                post.translate(ax + -dz * side * (hw + 0.2), ay + 0.45, az + dx * side * (hw + 0.2));
                rails.push(post);
              }
            }
            if ((i - b.i0) % 4 === 1) {
              const ground = this.terrain.heightAt(ax, az);
              for (const side of [-1, 1]) {
                const hgt = ay - ground + 0.6;
                const pile = new THREE.CylinderGeometry(0.16, 0.2, hgt, 6);
                pile.translate(ax + -dz * side * (hw - 0.4), ground + hgt / 2 - 0.6, az + dx * side * (hw - 0.4));
                pillars.push(pile);
              }
            }
          }
        }
        const add = (list, mat) => {
          if (!list.length) return;
          const g = mergeGeometries(list, false);
          list.forEach((x) => x.dispose());
          const mesh = new THREE.Mesh(g, mat);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.group.add(mesh);
        };
        if (b.kind === 'concrete') {
          add(deck, concrete);
          add(rails, rail);
          add(pillars, concrete);
        } else {
          add(deck, wood);
          add(rails, woodDark);
          add(pillars, woodDark);
        }
      }
    }
  }

  // светоотражающие столбики вдоль трассы
  _buildPosts() {
    const main = this.roads.byId.main;
    const geo = new THREE.BoxGeometry(0.12, 0.9, 0.12);
    geo.translate(0, 0.45, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.7 });
    const count = Math.floor(main.length / 50) * 2;
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    let k = 0;
    const p = {};
    for (let s = 20; s < main.length - 20 && k < count - 1; s += 50) {
      main.at(s, p);
      if (main.isBridgeIndex(p.i)) continue;
      for (const side of [-1, 1]) {
        const x = p.x + -p.dz * side * (main.halfWidth + 1.6);
        const z = p.z + p.dx * side * (main.halfWidth + 1.6);
        const y = this.terrain.heightAt(x, z);
        m.makeRotationY(Math.random() * 0.3);
        m.setPosition(x, y, z);
        inst.setMatrixAt(k++, m);
      }
    }
    inst.count = k;
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    this.group.add(inst);
  }

  update(cam, viewDist) {
    const d2 = (viewDist + 200) ** 2;
    for (const p of this.pieces) {
      const dx = p.x - cam.x, dz = p.z - cam.z;
      p.mesh.visible = dx * dx + dz * dz < d2;
    }
  }
}
