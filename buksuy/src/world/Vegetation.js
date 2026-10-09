import * as THREE from 'three';
import { hash2 } from '../core/Random.js';
import { WATER_Y, PADS, LAKE } from './WorldLayout.js';
import { SURF } from './Surfaces.js';
import { makeRock, propMaterial } from './Props.js';
import { buildTrees, windUniforms } from './Trees.js';

const VCELLS = 64; // клеток террейна на чанк растительности (256 м)
const SPACING = 6.5;
const KEYS = ['spruce', 'spruceSnow', 'pine', 'birch'];

// Лес. Деревья ближе lodDist — полноценные модели, дальше — снимки (импосторы).
// Кто где — пересчитываем на процессоре раз в несколько кадров: это дешевле,
// чем гонять сотни тысяч вершин невидимых деревьев через шейдер.
export class Vegetation {
  constructor(scene, terrain, colliders, quality = 'medium', renderer) {
    this.scene = scene;
    this.terrain = terrain;
    this.colliders = colliders;
    this.group = new THREE.Group();
    this.group.name = 'vegetation';
    scene.add(this.group);
    this.setQuality(quality);

    this.kit = buildTrees(renderer);
    this.rockGeo = [makeRock(61, 1), makeRock(62, 1)];

    this.ncx = Math.ceil((terrain.nx - 1) / VCELLS);
    this.ncz = Math.ceil((terrain.nz - 1) / VCELLS);
    this.chunks = new Map();
    this.padList = PADS.map((p) => ({ x: p.x, z: p.z, r: p.r + 6 }));
    this.extraClear = []; // места, где деревья нельзя (добавляет WorldManager)
    this._lodT = 0;
    this._lastCam = new THREE.Vector3(1e9, 0, 0);
  }

  setQuality(q) {
    this.quality = q;
    const hi = q === 'high' || q === 'ultra';
    this.density = q === 'low' ? 0.5 : hi ? 1 : 0.8;
    this.lodDist = { low: 70, medium: 105, high: 140, ultra: 190 }[q] ?? 105;
    this.shadowDist = { low: 0, medium: 70, high: 95, ultra: 120 }[q] ?? 70;
    this.bushDist = q === 'low' ? 120 : 220;
    this._forceLod = true;
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
    const trees = [];
    const rocks = [];
    const bushes = [];
    const steps = Math.floor(size / SPACING);

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
          rocks.push({ x, y: h - s * 0.2, z, rot: r * 6.28, scale: s, variant: r < 0.5 ? 0 : 1, big: s > 1.3 });
          continue;
        }
        if (r > f * this.density) {
          // кусты на опушках и в полях
          const bushChance = (f > 0.1 && f < 0.7 ? 0.09 : 0.012) * this.density;
          if (hash2(gx, gz, 7) < bushChance && !this._blocked(x, z) && surf !== SURF.snow && surf !== SURF.rock) {
            bushes.push({ x, y: h - 0.05, z, rot: r * 6.28, scale: 0.8 + hash2(gx, gz, 11) * 0.9, variant: r < 0.5 ? 0 : 1 });
          }
          continue;
        }
        if (this._blocked(x, z)) continue;
        if (surf === SURF.rock && hash2(gx, gz, 8) < 0.7) continue;

        // юг — берёзы и сосны, лес — сосна/ель/берёза, горы — ели, север — ели в снегу
        const snowy = t.snow[t.idx(Math.round((x - t.minX) / t.cell), Math.round((z - t.minZ) / t.cell))] > 120;
        const k = hash2(gx, gz, 9);
        let key;
        if (z > -900) key = k < 0.55 ? 'birch' : k < 0.85 ? 'pine' : 'spruce';
        else if (z > -2100) key = k < 0.25 ? 'birch' : k < 0.6 ? 'pine' : 'spruce';
        else key = k < 0.15 ? 'pine' : 'spruce';
        if (snowy && (key === 'spruce' || key === 'birch')) key = 'spruceSnow';
        const scale = 0.75 + hash2(gx, gz, 10) * 0.6;
        trees.push({ key, variant: k < 0.5 ? 0 : 1, x, y: h - 0.15, z, rot: r * 6.28, scale, broken: false });
      }
    }

    const ch = { cx, cz, x: x0 + size / 2, z: z0 + size / 2, size, trees, group: new THREE.Group(), near: {}, colliders: [], bushes: [] };
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const sphere = new THREE.Sphere(new THREE.Vector3(ch.x, t.heightAt(ch.x, ch.z) + 10, ch.z), size * 0.8);

    // ближние модели: по паре мешей (листва + ствол) на каждый вид и вариант
    for (const key of KEYS) {
      for (let v = 0; v < 2; v++) {
        const n = trees.filter((tr) => tr.key === key && tr.variant === v).length;
        if (!n) continue;
        const proto = this.kit.protos[key][v];
        const meshes = [];
        for (const [geo, mat] of [[proto.leaf, proto.leafMat], [proto.wood, proto.woodMat]]) {
          if (!geo) continue;
          const im = new THREE.InstancedMesh(geo, mat, n);
          im.count = 0;
          im.boundingSphere = sphere;
          im.receiveShadow = true;
          ch.group.add(im);
          meshes.push(im);
        }
        ch.near[`${key}${v}`] = meshes;
      }
    }

    // дальние снимки — одним мешем, ячейка атласа через атрибут
    if (trees.length) {
      const geo = this.kit.impostorGeo.clone();
      geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(new Float32Array(trees.length * 4), 4));
      const im = new THREE.InstancedMesh(geo, this.kit.impostorMat, trees.length);
      im.count = 0;
      im.boundingSphere = sphere;
      ch.group.add(im);
      ch.impostor = im;
      ch.cellAttr = geo.attributes.aCell;
    }

    // камни
    for (let v = 0; v < 2; v++) {
      const list = rocks.filter((it) => it.variant === v);
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(this.rockGeo[v], propMaterial, list.length);
      list.forEach((it, i) => {
        q.setFromAxisAngle(up, it.rot);
        sv.set(it.scale, it.scale * 0.9, it.scale);
        pv.set(it.x, it.y, it.z);
        m.compose(pv, q, sv);
        im.setMatrixAt(i, m);
        if (it.big) ch.colliders.push({ type: 'circle', x: it.x, z: it.z, r: it.scale * 0.85, y0: it.y - 1, y1: it.y + it.scale * 0.9, kind: 'rock' });
      });
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      im.castShadow = true;
      im.receiveShadow = true;
      ch.group.add(im);
    }

    // кусты
    for (let v = 0; v < 2; v++) {
      const list = bushes.filter((it) => it.variant === v);
      if (!list.length) continue;
      const proto = this.kit.protos.bush[v];
      const im = new THREE.InstancedMesh(proto.leaf, proto.leafMat, list.length);
      list.forEach((it, i) => {
        q.setFromAxisAngle(up, it.rot);
        sv.setScalar(it.scale);
        pv.set(it.x, it.y, it.z);
        m.compose(pv, q, sv);
        im.setMatrixAt(i, m);
        ch.colliders.push({ type: 'circle', x: it.x, z: it.z, r: 0.7 * it.scale, y0: it.y, y1: it.y + 1, kind: 'bush', breakable: true, breakSpeed: 0.5, slow: 0.97, inst: im, idx: i });
      });
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      im.receiveShadow = true;
      ch.group.add(im);
      ch.bushes.push(im);
    }

    // коллайдеры деревьев
    for (const tr of trees) {
      const small = tr.key === 'birch' && tr.scale < 0.95;
      ch.colliders.push({
        type: 'circle', x: tr.x, z: tr.z, r: (tr.key === 'birch' ? 0.2 : 0.3) * tr.scale + 0.08, y0: tr.y - 1, y1: tr.y + 8,
        kind: 'tree', breakable: small, breakSpeed: 7, slow: 0.7, damage: 6, inst: tr, chunk: ch,
      });
    }
    for (const c of ch.colliders) this.colliders.add(c);
    ch.state = null;
    return ch;
  }

  // раскладываем деревья чанка по ближним моделям и дальним снимкам
  _relod(ch, cam, lod2, shadow2) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    for (const meshes of Object.values(ch.near)) for (const im of meshes) im.count = 0;
    const imp = ch.impostor;
    if (imp) imp.count = 0;
    let anyShadow = false;
    for (const tr of ch.trees) {
      if (tr.broken) continue;
      const dx = tr.x - cam.x, dz = tr.z - cam.z;
      const d2 = dx * dx + dz * dz;
      q.setFromAxisAngle(up, tr.rot);
      pv.set(tr.x, tr.y, tr.z);
      if (d2 < lod2) {
        sv.setScalar(tr.scale);
        m.compose(pv, q, sv);
        for (const im of ch.near[`${tr.key}${tr.variant}`]) im.setMatrixAt(im.count++, m);
        if (d2 < shadow2) anyShadow = true;
      } else if (imp) {
        const c = this.kit.protos[tr.key][tr.variant].cell;
        sv.set(c.w * tr.scale, c.h * tr.scale, c.w * tr.scale);
        m.compose(pv, q, sv);
        const i = imp.count++;
        imp.setMatrixAt(i, m);
        ch.cellAttr.setXYZW(i, c.u, c.v, c.du, c.dv);
      }
    }
    for (const meshes of Object.values(ch.near)) {
      for (const im of meshes) {
        im.instanceMatrix.needsUpdate = true;
        im.castShadow = anyShadow;
      }
    }
    if (imp) {
      imp.instanceMatrix.needsUpdate = true;
      ch.cellAttr.needsUpdate = true;
    }
  }

  update(cam, viewDist, dt = 0.016) {
    let budget = 1;
    const genDist = Math.max(this.lodDist + 300, Math.min(viewDist * 1.6, 1600));
    const t = this.terrain;
    const size = VCELLS * t.cell;
    windUniforms.uTime.value += dt;
    this._lodT -= dt;
    const moved = this._lastCam.distanceToSquared(cam) > 16;
    const doLod = this._forceLod || (this._lodT <= 0 && moved);
    if (doLod) {
      this._lodT = 0.2;
      this._lastCam.copy(cam);
      this._forceLod = false;
    }
    const lod2 = this.lodDist * this.lodDist;
    const shadow2 = this.shadowDist * this.shadowDist;
    for (let cz = 0; cz < this.ncz; cz++) {
      for (let cx = 0; cx < this.ncx; cx++) {
        const x = t.minX + (cx + 0.5) * size, z = t.minZ + (cz + 0.5) * size;
        const d = Math.max(0, Math.hypot(x - cam.x, z - cam.z) - size * 0.7);
        const key = cz * 1000 + cx;
        let ch = this.chunks.get(key);
        if (!ch && d < genDist && budget > 0) {
          ch = this._generate(cx, cz);
          this.chunks.set(key, ch);
          this.group.add(ch.group);
          budget--;
        }
        if (!ch) continue;
        ch.group.visible = d < viewDist * 1.6;
        if (!ch.group.visible) continue;
        // чанк целиком далеко — один раз разложить всё в снимки и не трогать
        if (d > this.lodDist + 10) {
          if (ch.state !== 'far') {
            this._relod(ch, cam, 0, 0);
            ch.state = 'far';
          }
        } else if (doLod || ch.state !== 'mixed') {
          this._relod(ch, cam, lod2, shadow2);
          ch.state = 'mixed';
        }
        for (const b of ch.bushes) b.visible = d < this.bushDist;
      }
    }
  }

  warm(x, z, viewDist) {
    const cam = new THREE.Vector3(x, 0, z);
    for (let i = 0; i < 40; i++) {
      this._forceLod = true;
      this.update(cam, viewDist, 0);
    }
    this._forceLod = true;
  }

  // спрятать сломанное дерево/куст
  breakInstance(c) {
    if (!c.inst) return;
    if (c.inst.isInstancedMesh) {
      const m = new THREE.Matrix4();
      m.makeScale(0, 0, 0);
      c.inst.setMatrixAt(c.idx, m);
      c.inst.instanceMatrix.needsUpdate = true;
      return;
    }
    // дерево: помечаем и пересобираем чанк
    c.inst.broken = true;
    if (c.chunk) c.chunk.state = null;
    this._forceLod = true;
  }
}
