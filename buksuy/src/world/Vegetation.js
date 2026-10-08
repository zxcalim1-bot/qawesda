import * as THREE from 'three';
import { hash2, mulberry32 } from '../core/Random.js';
import { WATER_Y, PADS, LAKE } from './WorldLayout.js';
import { SURF } from './Surfaces.js';
import { makeSpruce, makePine, makeBirch, makeBush, makeRock, merge, leafMaterial, propMaterial, paint } from './Props.js';

const VCELLS = 64; // клеток террейна на чанк растительности (256 м)
const SPACING = 6.5;

function treeGeo(t) {
  const list = [t.leaf];
  if (t.wood) list.push(t.wood);
  return merge(list);
}

export class Vegetation {
  constructor(scene, terrain, colliders, quality = 'medium') {
    this.scene = scene;
    this.terrain = terrain;
    this.colliders = colliders;
    this.group = new THREE.Group();
    this.group.name = 'vegetation';
    scene.add(this.group);
    this.setQuality(quality);

    // прототипы
    this.protos = {
      spruce: [treeGeo(makeSpruce(11)), treeGeo(makeSpruce(12))],
      spruceSnow: [treeGeo(makeSpruce(21, true)), treeGeo(makeSpruce(22, true))],
      pine: [treeGeo(makePine(31)), treeGeo(makePine(32))],
      birch: [treeGeo(makeBirch(41)), treeGeo(makeBirch(42))],
      bush: [makeBush(51).leaf, makeBush(52).leaf],
      rock: [makeRock(61, 1), makeRock(62, 1)],
    };
    // дальний LOD — один конус/шар на всех, цвет через instanceColor
    const farCone = new THREE.ConeGeometry(2.4, 9, 5);
    farCone.translate(0, 6.5, 0);
    const farTrunk = new THREE.CylinderGeometry(0.2, 0.25, 3, 4);
    farTrunk.translate(0, 1.5, 0);
    this.farGeo = merge([paint(farCone, '#ffffff'), paint(farTrunk, '#8a7a6a')]);
    this.farMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });

    this.ncx = Math.ceil((terrain.nx - 1) / VCELLS);
    this.ncz = Math.ceil((terrain.nz - 1) / VCELLS);
    this.chunks = new Map();
    this.padList = PADS.map((p) => ({ x: p.x, z: p.z, r: p.r + 6 }));
    this.extraClear = []; // места, где деревья нельзя (добавляет WorldManager)
  }

  setQuality(q) {
    this.quality = q;
    this.density = q === 'low' ? 0.45 : q === 'high' ? 1 : 0.75;
    this.nearDist = q === 'low' ? 260 : q === 'high' ? 420 : 340;
    this.shadowDist = q === 'low' ? 0 : q === 'high' ? 260 : 160;
  }

  clearArea(x, z, r) {
    this.extraClear.push({ x, z, r });
  }

  _blocked(x, z) {
    for (const p of this.padList) {
      const dx = x - p.x, dz = z - p.z;
      if (dx * dx + dz * dz < p.r * p.r) return true;
    }
    for (const p of this.extraClear) {
      const dx = x - p.x, dz = z - p.z;
      if (dx * dx + dz * dz < p.r * p.r) return true;
    }
    return false;
  }

  _generate(cx, cz) {
    const t = this.terrain;
    const x0 = t.minX + cx * VCELLS * t.cell;
    const z0 = t.minZ + cz * VCELLS * t.cell;
    const size = VCELLS * t.cell;
    const items = {}; // proto key -> [{x,y,z,rot,scale,variant}]
    const far = [];
    const rnd = mulberry32(cx * 7919 + cz * 104729 + 17);
    const steps = Math.floor(size / SPACING);
    const add = (key, it) => (items[key] || (items[key] = [])).push(it);

    for (let j = 0; j < steps; j++) {
      for (let i = 0; i < steps; i++) {
        const gx = cx * steps + i, gz = cz * steps + j;
        const x = x0 + (i + 0.15 + hash2(gx, gz, 1) * 0.7) * SPACING;
        const z = z0 + (j + 0.15 + hash2(gx, gz, 2) * 0.7) * SPACING;
        if (!t.inBounds(x, z, 4)) continue;
        const f = t.forestAt(x, z);
        const r = hash2(gx, gz, 3);
        const rd = t.roadDistAt(x, z);
        if (rd < 3.5) continue;
        const h = t.heightAt(x, z);
        if (h < WATER_Y + 0.5) continue;
        const surf = t.surfAt(x, z);
        if (surf === SURF.ice || surf === SURF.riverbed || surf === SURF.sand) continue;
        if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 4) continue;

        // камни — немного везде, больше в горах
        const rockChance = (z < -2100 ? 0.012 : 0.003) + (surf === SURF.rock ? 0.05 : 0);
        if (hash2(gx, gz, 5) < rockChance && rd > 5 && !this._blocked(x, z)) {
          const s = 0.6 + hash2(gx, gz, 6) * 2.2;
          add('rock', { x, y: h - s * 0.15, z, rot: r * 6.28, scale: s, variant: r < 0.5 ? 0 : 1, big: s > 1.3 });
          continue;
        }
        if (r > f * this.density) {
          // одинокие кусты на опушках
          if (f > 0.15 && f < 0.6 && hash2(gx, gz, 7) < 0.05 * this.density && !this._blocked(x, z)) {
            add('bush', { x, y: h, z, rot: r * 6.28, scale: 0.8 + r * 0.6, variant: r < 0.5 ? 0 : 1 });
          }
          continue;
        }
        if (this._blocked(x, z)) continue;
        if (surf === SURF.rock && hash2(gx, gz, 8) < 0.7) continue;

        // какое дерево: юг — берёзы и сосны, лес — сосна/ель/берёза, горы — ели, север — ели в снегу
        const snowy = t.snow[t.idx(Math.round((x - t.minX) / t.cell), Math.round((z - t.minZ) / t.cell))] > 120;
        const k = hash2(gx, gz, 9);
        let key;
        if (z > -900) key = k < 0.55 ? 'birch' : k < 0.85 ? 'pine' : 'spruce';
        else if (z > -2100) key = k < 0.25 ? 'birch' : k < 0.6 ? 'pine' : 'spruce';
        else key = k < 0.15 ? 'pine' : 'spruce';
        if (snowy && key === 'spruce') key = 'spruceSnow';
        if (snowy && key === 'birch') key = 'spruceSnow';
        const scale = 0.75 + hash2(gx, gz, 10) * 0.6;
        const it = { x, y: h - 0.1, z, rot: r * 6.28, scale, variant: k < 0.5 ? 0 : 1 };
        add(key, it);
        far.push({ x, y: h - 0.1, z, scale, key });
      }
    }

    // меши
    const near = new THREE.Group();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const sv = new THREE.Vector3();
    const pv = new THREE.Vector3();
    const colliderList = [];
    for (const [key, list] of Object.entries(items)) {
      for (let v = 0; v < 2; v++) {
        const sub = list.filter((it) => it.variant === v);
        if (!sub.length) continue;
        const geo = this.protos[key][v];
        const mat = key === 'rock' ? propMaterial : leafMaterial;
        const inst = new THREE.InstancedMesh(geo, mat, sub.length);
        sub.forEach((it, i) => {
          q.setFromAxisAngle(up, it.rot);
          sv.setScalar(it.scale);
          pv.set(it.x, it.y, it.z);
          m.compose(pv, q, sv);
          inst.setMatrixAt(i, m);
          // коллайдеры
          if (key === 'rock') {
            if (it.big) colliderList.push({ type: 'circle', x: it.x, z: it.z, r: it.scale * 0.85, y0: it.y - 1, y1: it.y + it.scale * 0.9, kind: 'rock' });
          } else if (key === 'bush') {
            colliderList.push({ type: 'circle', x: it.x, z: it.z, r: 0.7 * it.scale, y0: it.y, y1: it.y + 1, kind: 'bush', breakable: true, breakSpeed: 0.5, slow: 0.97, inst, idx: i });
          } else {
            const small = key === 'birch' && it.scale < 0.95;
            colliderList.push({
              type: 'circle', x: it.x, z: it.z, r: (key === 'birch' ? 0.2 : 0.3) * it.scale + 0.08, y0: it.y - 1, y1: it.y + 8,
              kind: 'tree', breakable: small, breakSpeed: 7, slow: 0.7, damage: 6, inst, idx: i,
            });
          }
        });
        inst.instanceMatrix.needsUpdate = true;
        inst.computeBoundingSphere();
        inst.receiveShadow = true;
        inst.userData.key = key;
        near.add(inst);
      }
    }
    for (const c of colliderList) this.colliders.add(c);

    // дальний LOD
    let farMesh = null;
    if (far.length) {
      farMesh = new THREE.InstancedMesh(this.farGeo, this.farMat, far.length);
      const col = new THREE.Color();
      far.forEach((it, i) => {
        sv.set(it.scale, it.scale * (it.key === 'pine' ? 1.3 : 1), it.scale);
        pv.set(it.x, it.y, it.z);
        q.identity();
        m.compose(pv, q, sv);
        farMesh.setMatrixAt(i, m);
        if (it.key === 'birch') col.setRGB(0.3, 0.42, 0.14);
        else if (it.key === 'spruceSnow') col.setRGB(0.55, 0.62, 0.62);
        else if (it.key === 'pine') col.setRGB(0.15, 0.24, 0.09);
        else col.setRGB(0.08, 0.16, 0.07);
        farMesh.setColorAt(i, col);
      });
      farMesh.instanceMatrix.needsUpdate = true;
      farMesh.computeBoundingSphere();
    }

    return {
      cx, cz, x: x0 + size / 2, z: z0 + size / 2,
      near, far: farMesh, colliders: colliderList, trees: far.length,
    };
  }

  update(cam, viewDist) {
    let budget = 1;
    const genDist = Math.max(this.nearDist + 150, Math.min(viewDist * 1.6, 1600));
    for (let cz = 0; cz < this.ncz; cz++) {
      for (let cx = 0; cx < this.ncx; cx++) {
        const t = this.terrain;
        const size = VCELLS * t.cell;
        const x = t.minX + (cx + 0.5) * size, z = t.minZ + (cz + 0.5) * size;
        const d = Math.max(0, Math.hypot(x - cam.x, z - cam.z) - size * 0.7);
        const key = cz * 1000 + cx;
        let ch = this.chunks.get(key);
        if (!ch && d < genDist && budget > 0) {
          ch = this._generate(cx, cz);
          this.chunks.set(key, ch);
          this.group.add(ch.near);
          if (ch.far) this.group.add(ch.far);
          budget--;
        }
        if (!ch) continue;
        const isNear = d < this.nearDist;
        ch.near.visible = isNear;
        if (ch.far) ch.far.visible = !isNear && d < viewDist * 1.6;
        const shadows = d < this.shadowDist;
        if (ch.shadows !== shadows) {
          ch.shadows = shadows;
          for (const m of ch.near.children) m.castShadow = shadows;
        }
      }
    }
  }

  warm(x, z, viewDist) {
    for (let i = 0; i < 40; i++) this.update({ x, z }, viewDist);
  }

  // спрятать сломанное дерево/куст
  breakInstance(c) {
    if (!c.inst) return;
    const m = new THREE.Matrix4();
    c.inst.getMatrixAt(c.idx, m);
    const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    m.decompose(p, q, s);
    c.broken = { p, q, s };
    m.makeScale(0, 0, 0);
    c.inst.setMatrixAt(c.idx, m);
    c.inst.instanceMatrix.needsUpdate = true;
  }
}
