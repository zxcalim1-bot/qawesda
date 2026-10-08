import * as THREE from 'three';
import { SURF } from './Surfaces.js';
import { patchWeather, srgb } from './materials.js';
import { clamp, lerp } from '../core/util.js';

const CHUNK = 32; // клеток на чанк (128 м)
const FAR_STEP = 4;

// цвета поверхностей (sRGB)
const COLORS = {
  [SURF.grass]: [0.42, 0.55, 0.24],
  [SURF.forest]: [0.28, 0.34, 0.17],
  [SURF.mud]: [0.34, 0.26, 0.17],
  [SURF.deepmud]: [0.21, 0.17, 0.11],
  [SURF.sand]: [0.76, 0.68, 0.48],
  [SURF.snow]: [0.9, 0.92, 0.96],
  [SURF.ice]: [0.72, 0.84, 0.9],
  [SURF.rock]: [0.47, 0.45, 0.43],
  [SURF.gravel]: [0.55, 0.52, 0.46],
  [SURF.riverbed]: [0.36, 0.33, 0.26],
  [SURF.dirt]: [0.45, 0.37, 0.27],
  [SURF.asphalt]: [0.3, 0.3, 0.3],
};

export class TerrainRenderer {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.group.name = 'terrain';
    scene.add(this.group);
    this.material = patchWeather(
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 }),
      { detail: 0.45 },
    );
    this.ncx = Math.floor((terrain.nx - 1) / CHUNK);
    this.ncz = Math.floor((terrain.nz - 1) / CHUNK);
    this.chunks = [];
    this.colors = this._computeColors();
    for (let cz = 0; cz < this.ncz; cz++) {
      for (let cx = 0; cx < this.ncx; cx++) {
        const ch = {
          cx, cz,
          x: terrain.minX + (cx + 0.5) * CHUNK * terrain.cell,
          z: terrain.minZ + (cz + 0.5) * CHUNK * terrain.cell,
          near: null, far: null,
        };
        ch.far = this._buildMesh(cx, cz, FAR_STEP, 10);
        ch.far.visible = false;
        this.group.add(ch.far);
        this.chunks.push(ch);
      }
    }
    this.nearDist = 520;
    this.farDist = 2600;
    this.buildBudget = 3;
  }

  _computeColors() {
    const t = this.terrain;
    const N = t.nx * t.nz;
    const col = new Float32Array(N * 3);
    const c = [0, 0, 0];
    for (let iz = 0; iz < t.nz; iz++) {
      for (let ix = 0; ix < t.nx; ix++) {
        const v = iz * t.nx + ix;
        const x = t.minX + ix * t.cell, z = t.minZ + iz * t.cell;
        const s = t.surf[v];
        const base = COLORS[s] || COLORS[SURF.grass];
        let r = base[0], g = base[1], b = base[2];
        const n = t.nMid.noise(x * 0.02, z * 0.02);
        const n2 = t.nForest.noise(x * 0.07 + 3, z * 0.07);
        if (s === SURF.grass) {
          // выгоревшая трава пятнами, ближе к северу — холоднее
          const dry = clamp(n * 0.6 + 0.3, 0, 1) * (z > -900 ? 1 : 0.5);
          r = lerp(r, 0.6, dry * 0.35);
          g = lerp(g, 0.58, dry * 0.25);
          b = lerp(b, 0.3, dry * 0.2);
          const north = clamp((-z - 2000) / 2500, 0, 1);
          r = lerp(r, 0.45, north * 0.4);
          g = lerp(g, 0.48, north * 0.3);
          b = lerp(b, 0.36, north * 0.4);
        }
        const k = 0.9 + n2 * 0.1;
        r *= k; g *= k; b *= k;
        // под дорогами — утоптанная обочина
        const rd = t.roadDist[v];
        if (rd < 2.2 && s !== SURF.riverbed) {
          const w = clamp((2.2 - rd) / 2.2, 0, 1) * 0.85;
          r = lerp(r, 0.47, w);
          g = lerp(g, 0.42, w);
          b = lerp(b, 0.34, w);
        }
        // снег по высоте/широте
        const sn = t.snow[v] / 255;
        if (sn > 0 && s !== SURF.ice) {
          const w = clamp(sn * 1.1, 0, 1) * (s === SURF.rock ? 0.55 : 1);
          r = lerp(r, 0.9, w);
          g = lerp(g, 0.92, w);
          b = lerp(b, 0.96, w);
        }
        srgb(r, g, b, c);
        col[v * 3] = c[0];
        col[v * 3 + 1] = c[1];
        col[v * 3 + 2] = c[2];
      }
    }
    return col;
  }

  _buildMesh(cx, cz, step, skirt) {
    const t = this.terrain;
    const H = t.heights;
    const n = CHUNK / step;
    const vx = n + 1;
    const ix0 = cx * CHUNK, iz0 = cz * CHUNK;
    const vertCount = vx * vx + vx * 4;
    const pos = new Float32Array(vertCount * 3);
    const nor = new Float32Array(vertCount * 3);
    const col = new Float32Array(vertCount * 3);
    const idx = [];

    const put = (k, ix, iz, yOff) => {
      const v = iz * t.nx + ix;
      pos[k * 3] = t.minX + ix * t.cell;
      pos[k * 3 + 1] = H[v] + yOff;
      pos[k * 3 + 2] = t.minZ + iz * t.cell;
      const l = H[iz * t.nx + Math.max(0, ix - 1)], r = H[iz * t.nx + Math.min(t.nx - 1, ix + 1)];
      const d = H[Math.max(0, iz - 1) * t.nx + ix], u = H[Math.min(t.nz - 1, iz + 1) * t.nx + ix];
      let nx = l - r, ny = 2 * t.cell, nz = d - u;
      const len = Math.hypot(nx, ny, nz);
      nor[k * 3] = nx / len;
      nor[k * 3 + 1] = ny / len;
      nor[k * 3 + 2] = nz / len;
      col[k * 3] = this.colors[v * 3];
      col[k * 3 + 1] = this.colors[v * 3 + 1];
      col[k * 3 + 2] = this.colors[v * 3 + 2];
    };

    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) put(j * vx + i, ix0 + i * step, iz0 + j * step, 0);
    }
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = j * vx + i, b = a + 1, c = a + vx, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    // юбки по краям — закрывают щели между чанками разной детализации
    let k = vx * vx;
    const edges = [
      (i) => [i, 0], (i) => [n, i], (i) => [n - i, n], (i) => [0, n - i],
    ];
    for (const e of edges) {
      const start = k;
      for (let i = 0; i <= n; i++) {
        const [gi, gj] = e(i);
        put(k++, ix0 + gi * step, iz0 + gj * step, -skirt);
      }
      // треугольники между краем сетки и юбкой (двусторонние не нужны — рисуем обе стороны)
      for (let i = 0; i < n; i++) {
        const [gi, gj] = e(i);
        const [gi2, gj2] = e(i + 1);
        const top1 = gj * vx + gi, top2 = gj2 * vx + gi2;
        const bot1 = start + i, bot2 = start + i + 1;
        idx.push(top1, bot1, top2, top2, bot1, bot2);
        idx.push(top1, top2, bot1, top2, bot2, bot1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, k * 3), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor.subarray(0, k * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col.subarray(0, k * 3), 3));
    geo.setIndex(idx);
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, this.material);
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  update(cam) {
    let built = 0;
    for (const ch of this.chunks) {
      const d = Math.hypot(ch.x - cam.x, ch.z - cam.z);
      const wantNear = d < this.nearDist;
      if (wantNear && !ch.near && built < this.buildBudget) {
        ch.near = this._buildMesh(ch.cx, ch.cz, 1, 3);
        this.group.add(ch.near);
        built++;
      }
      if (ch.near) ch.near.visible = wantNear;
      ch.far.visible = !(wantNear && ch.near) && d < this.farDist;
      // далёкие ближние чанки выгружаем, чтобы не держать память
      if (ch.near && d > this.nearDist + 400) {
        this.group.remove(ch.near);
        ch.near.geometry.dispose();
        ch.near = null;
      }
    }
  }

  // построить все ближние вокруг точки сразу (при загрузке)
  warm(x, z) {
    const old = this.buildBudget;
    this.buildBudget = 1000;
    this.update({ x, z });
    this.buildBudget = old;
  }

  setViewDistance(d) {
    this.nearDist = clamp(d * 0.6, 300, 800);
    // дальше тумана рисовать нечего — там всё равно цвет неба
    this.farDist = d * 1.8 + 150;
  }
}
