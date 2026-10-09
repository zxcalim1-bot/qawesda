import * as THREE from 'three';
import { SURF } from './Surfaces.js';
import { weatherUniforms } from './materials.js';
import { textureArrays } from '../render/assets.js';
import { extendMaterial, NOISE_GLSL, TRIPLANAR_GLSL } from '../render/shaderlib.js';
import { clamp, lerp } from '../core/util.js';

const CHUNK = 32; // клеток на чанк (128 м)
const FAR_STEP = 4;

// Слои земли. Порядок важен — веса лежат в двух vec4 по этому порядку.
export const TERRAIN_LAYERS = [
  { c: 'grass_c', n: 'grass_n', h: 'grass_h', tile: 3.2, rough: 0.95 },
  { c: 'forest_c', n: 'forest_n', h: 'forest_h', tile: 4.0, rough: 0.95 },
  { c: 'mud_c', n: 'mud_n', h: 'mud_h', tile: 4.0, rough: 0.7 },
  { c: 'rock_c', n: 'rock_n', h: 'rock_h', tile: 7.0, rough: 0.85 },
  { c: 'snow_c', n: 'snow_n', h: 'snow_h', tile: 5.0, rough: 0.55 },
  { c: 'sand_c', n: 'sand_n', h: 'sand_h', tile: 4.0, rough: 0.9 },
  { c: 'scree_c', n: 'scree_n', h: 'scree_h', tile: 3.0, rough: 0.88 },
  { c: 'dirt_c', n: 'dirt_n', h: 'dirt_h', tile: 3.6, rough: 0.95 },
];
const L = { grass: 0, forest: 1, mud: 2, rock: 3, snow: 4, sand: 5, scree: 6, dirt: 7 };

const FRAG_HEAD = /* glsl */ `
uniform sampler2DArray uTerrC;
uniform sampler2DArray uTerrN;
uniform float uTile[8];
uniform float uRough[8];
uniform float uWet;
uniform float uSnow;
varying vec3 vWPos;
varying vec3 vWNorm;
varying vec4 vW0;
varying vec4 vW1;
varying vec3 vTint;
${NOISE_GLSL}
${TRIPLANAR_GLSL}
`;

const FRAG_MAP = /* glsl */ `
  float tw[8];
  tw[0] = vW0.x; tw[1] = vW0.y; tw[2] = vW0.z; tw[3] = vW0.w;
  tw[4] = vW1.x; tw[5] = vW1.y; tw[6] = vW1.z; tw[7] = vW1.w;
  vec3 gN = normalize(vWNorm);
  float camDist = length(vWPos - cameraPosition);
  float macro = n_fbm(vWPos.xz * 0.012);
  // крутые склоны — голый камень
  float cliff = smoothstep(0.62, 0.78, 1.0 - gN.y + (macro - 0.5) * 0.15);
  for (int i = 0; i < 8; i++) tw[i] *= 1.0 - cliff;
  tw[3] += cliff;
  // свежий снег ложится на ровное
  float snowNew = uSnow * smoothstep(0.55, 0.85, gN.y) * clamp(0.55 + (macro - 0.5) * 1.6, 0.0, 1.0);
  for (int i = 0; i < 8; i++) tw[i] *= 1.0 - snowNew;
  tw[4] += snowNew;

  // смешивание по высотам текстур: камешки торчат из песка, а не просвечивают
  vec4 tc[8];
  float hb[8];
  float hmax = -10.0;
  vec3 tri = triWeights(gN, 6.0);
  float far = smoothstep(25.0, 260.0, camDist);
  vec3 dpx = dFdx(vWPos), dpy = dFdy(vWPos);
  for (int i = 0; i < 8; i++) {
    hb[i] = -10.0;
    if (tw[i] < 0.02) continue;
    float s = uTile[i];
    vec4 c;
    if (i == 3) {
      c = triColor(uTerrC, vWPos, dpx, dpy, tri, 3.0, s);
      c = mix(c, triColor(uTerrC, vWPos, dpx, dpy, tri, 3.0, s * 4.3), 0.35 + far * 0.3);
    } else {
      float k = 1.0 / s;
      vec2 uv = vWPos.xz * k;
      vec2 gx = dpx.xz * k, gy = dpy.xz * k;
      c = textureGrad(uTerrC, vec3(uv, float(i)), gx, gy);
      vec4 c2 = textureGrad(uTerrC, vec3(vec2(uv.y, -uv.x) * 0.23 + 0.37, float(i)), gx.yx * vec2(0.23, -0.23), gy.yx * vec2(0.23, -0.23));
      c = mix(c, c2, 0.3 + far * 0.35);
    }
    tc[i] = c;
    hb[i] = c.a * 0.6 + tw[i];
    hmax = max(hmax, hb[i]);
  }
  vec3 albedo = vec3(0.0);
  float wsum = 0.0;
  float rough = 0.0;
  vec3 nAcc = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    if (hb[i] < -5.0) continue;
    float b = max(hb[i] - hmax + 0.22, 0.0);
    if (b <= 0.0) continue;
    albedo += tc[i].rgb * b;
    rough += uRough[i] * b;
    vec3 tn;
    if (i == 3) {
      tn = triNormal(uTerrN, vWPos, dpx, dpy, gN, tri, 3.0, uTile[i], 1.0);
    } else {
      float k = 1.0 / uTile[i];
      vec3 t = textureGrad(uTerrN, vec3(vWPos.xz * k, float(i)), dpx.xz * k, dpy.xz * k).xyz * 2.0 - 1.0;
      // касательная — мировой X, бинормаль — мировой Z (v текстуры)
      vec3 T = normalize(vec3(1.0, 0.0, 0.0) - gN * gN.x);
      vec3 B = normalize(cross(T, gN));
      tn = normalize(T * t.x + B * t.y + gN * t.z);
    }
    nAcc += tn * b;
    wsum += b;
  }
  albedo /= max(wsum, 1e-4);
  rough /= max(wsum, 1e-4);
  vec3 terrN = normalize(mix(nAcc / max(wsum, 1e-4), gN, smoothstep(60.0, 400.0, camDist) * 0.7));

  // трава и подстилка тонируются (выгоревшие пятна, холодный север)
  float vegK = clamp((tw[0] + tw[1]) * 1.4, 0.0, 1.0);
  albedo *= mix(vec3(1.0), vTint * 1.5, vegK);
  albedo *= 0.88 + macro * 0.24;

  // дождь: всё темнеет, в низинах — лужи с отражениями
  float puddle = 0.0;
  if (uWet > 0.01) {
    float pn = n_fbm(vWPos.xz * 0.11 + 7.0);
    puddle = smoothstep(0.62, 0.7, pn + (gN.y - 0.98) * 6.0) * uWet * (1.0 - tw[4]) * (1.0 - cliff);
    albedo *= 1.0 - uWet * 0.38 * (1.0 - tw[4]);
    rough = mix(rough, 0.45, uWet * 0.6);
    albedo = mix(albedo, albedo * 0.55, puddle);
    rough = mix(rough, 0.04, puddle);
    terrN = normalize(mix(terrN, gN, puddle));
  }
  diffuseColor.rgb = albedo;
`;

export class TerrainRenderer {
  constructor(scene, terrain, quality = 'medium') {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.group.name = 'terrain';
    scene.add(this.group);
    const size = quality === 'low' ? 512 : 1024;
    const arr = textureArrays(TERRAIN_LAYERS, size);
    this.material = extendMaterial(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 }), {
      key: 'terrain',
      uniforms: {
        uTerrC: { value: arr.color },
        uTerrN: { value: arr.normal },
        uTile: { value: TERRAIN_LAYERS.map((l) => l.tile) },
        uRough: { value: TERRAIN_LAYERS.map((l) => l.rough) },
        uWet: weatherUniforms.uWet,
        uSnow: weatherUniforms.uSnow,
      },
      vertexHead: 'attribute vec4 aW0;\nattribute vec4 aW1;\nattribute vec3 aTint;\nvarying vec3 vWPos;\nvarying vec3 vWNorm;\nvarying vec4 vW0;\nvarying vec4 vW1;\nvarying vec3 vTint;',
      vertexBegin: 'vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWNorm = normalize(mat3(modelMatrix) * objectNormal);\nvW0 = aW0;\nvW1 = aW1;\nvTint = aTint;',
      fragHead: FRAG_HEAD,
      map: FRAG_MAP,
      roughness: 'roughnessFactor = rough;',
      normal: 'normal = normalize((viewMatrix * vec4(terrN, 0.0)).xyz);',
    });
    this.ncx = Math.floor((terrain.nx - 1) / CHUNK);
    this.ncz = Math.floor((terrain.nz - 1) / CHUNK);
    this.chunks = [];
    this._computeSplat();
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

  // веса слоёв и оттенок для каждой вершины сетки
  _computeSplat() {
    const t = this.terrain;
    const N = t.nx * t.nz;
    const W = new Uint8Array(N * 8);
    const tint = new Uint8Array(N * 3);
    const w = new Float32Array(8);
    for (let iz = 0; iz < t.nz; iz++) {
      for (let ix = 0; ix < t.nx; ix++) {
        const v = iz * t.nx + ix;
        const x = t.minX + ix * t.cell, z = t.minZ + iz * t.cell;
        const s = t.surf[v];
        const n = t.nMid.noise(x * 0.02, z * 0.02);
        const n2 = t.nForest.noise(x * 0.07 + 3, z * 0.07);
        w.fill(0);
        switch (s) {
          case SURF.grass:
            w[L.grass] = 1;
            w[L.dirt] = clamp(n2 * 1.4 - 0.55, 0, 0.8);
            w[L.forest] = clamp(t.forest[v] / 255 - 0.2, 0, 0.6);
            break;
          case SURF.forest:
            w[L.forest] = 1;
            w[L.grass] = clamp(0.4 + n2 * 0.5, 0, 0.8);
            break;
          case SURF.mud: w[L.mud] = 1; w[L.dirt] = 0.35; break;
          case SURF.deepmud: w[L.mud] = 1; break;
          case SURF.sand: w[L.sand] = 1; w[L.scree] = clamp(n2 * 0.8, 0, 0.4); break;
          case SURF.snow: case SURF.ice: w[L.snow] = 1; break;
          case SURF.rock: w[L.rock] = 1; w[L.scree] = 0.35; break;
          case SURF.gravel: w[L.scree] = 1; w[L.rock] = 0.25; break;
          case SURF.riverbed: w[L.sand] = 0.7; w[L.scree] = 0.6; w[L.mud] = 0.3; break;
          default: w[L.dirt] = 1;
        }
        // утоптанная обочина
        const rd = t.roadDist[v];
        if (rd < 2.6 && s !== SURF.riverbed) {
          const k = clamp((2.6 - rd) / 2.6, 0, 1);
          for (let i = 0; i < 8; i++) w[i] *= 1 - k * 0.8;
          w[z < -2100 ? L.scree : L.dirt] += k * 1.4;
        }
        // снег по высоте/широте
        const sn = t.snow[v] / 255;
        if (sn > 0 && s !== SURF.ice) {
          const k = clamp(sn * 1.15, 0, 1) * (s === SURF.rock ? 0.6 : 1);
          for (let i = 0; i < 8; i++) w[i] *= 1 - k;
          w[L.snow] += k;
        }
        let sum = 0;
        for (let i = 0; i < 8; i++) sum += w[i];
        for (let i = 0; i < 8; i++) W[v * 8 + i] = Math.round((w[i] / sum) * 255);

        // оттенок травы: выгоревшие пятна на юге, холоднее к северу (кодируем /1.5)
        let r = 1, g = 1, b = 1;
        const dry = clamp(n * 0.7 + 0.25, 0, 1) * (z > -900 ? 1 : 0.45);
        r = lerp(r, 1.18, dry * 0.6); g = lerp(g, 1.04, dry * 0.6); b = lerp(b, 0.62, dry * 0.6);
        const north = clamp((-z - 2000) / 2500, 0, 1);
        r = lerp(r, 0.9, north * 0.5); g = lerp(g, 0.92, north * 0.4); b = lerp(b, 1.02, north * 0.5);
        const k = 0.9 + n2 * 0.12;
        tint[v * 3] = clamp(Math.round((r * k / 1.5) * 255), 0, 255);
        tint[v * 3 + 1] = clamp(Math.round((g * k / 1.5) * 255), 0, 255);
        tint[v * 3 + 2] = clamp(Math.round((b * k / 1.5) * 255), 0, 255);
      }
    }
    this.weights = W;
    this.tints = tint;
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
    const w0 = new Uint8Array(vertCount * 4);
    const w1 = new Uint8Array(vertCount * 4);
    const tint = new Uint8Array(vertCount * 3);
    const idx = [];
    const W = this.weights, T = this.tints;

    const put = (k, ix, iz, yOff) => {
      const v = iz * t.nx + ix;
      pos[k * 3] = t.minX + ix * t.cell;
      pos[k * 3 + 1] = H[v] + yOff;
      pos[k * 3 + 2] = t.minZ + iz * t.cell;
      const l = H[iz * t.nx + Math.max(0, ix - 1)], r = H[iz * t.nx + Math.min(t.nx - 1, ix + 1)];
      const d = H[Math.max(0, iz - 1) * t.nx + ix], u = H[Math.min(t.nz - 1, iz + 1) * t.nx + ix];
      const nx = l - r, ny = 2 * t.cell, nz = d - u;
      const len = Math.hypot(nx, ny, nz);
      nor[k * 3] = nx / len;
      nor[k * 3 + 1] = ny / len;
      nor[k * 3 + 2] = nz / len;
      for (let i = 0; i < 4; i++) {
        w0[k * 4 + i] = W[v * 8 + i];
        w1[k * 4 + i] = W[v * 8 + 4 + i];
      }
      tint[k * 3] = T[v * 3];
      tint[k * 3 + 1] = T[v * 3 + 1];
      tint[k * 3 + 2] = T[v * 3 + 2];
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
    geo.setAttribute('aW0', new THREE.BufferAttribute(w0.subarray(0, k * 4), 4, true));
    geo.setAttribute('aW1', new THREE.BufferAttribute(w1.subarray(0, k * 4), 4, true));
    geo.setAttribute('aTint', new THREE.BufferAttribute(tint.subarray(0, k * 3), 3, true));
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
    this.farDist = d * 1.8 + 150;
  }
}
