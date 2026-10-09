import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../core/Random.js';
import { weatherUniforms } from './materials.js';
import { textureArrays } from '../render/assets.js';
import { extendMaterial, TRIPLANAR_GLSL } from '../render/shaderlib.js';

// Процедурные модельки: дома, гаражи, заборы, столбы и прочая утварь.
// Геометрия красится вершинным цветом, а фактуру даёт один общий материал
// с набором фото-текстур: paint(geo, 'siding:#8d5f37') — доски, крашенные в коричневый.

// Слои материала построек. colorize: 1 — текстура перекрашивается в заданный цвет
// (краска), 0 — свой цвет текстуры, от заданного берётся только яркость.
export const PROP_LAYERS = [
  { key: 'paint', c: 'plaster_c', n: 'plaster_n', scale: 3.0, rough: 0.75, metal: 0, colorize: 1 },
  { key: 'wood', c: 'planks_c', n: 'planks_n', scale: 2.2, rough: 0.88, metal: 0, colorize: 0.45 },
  { key: 'siding', c: 'siding_c', n: 'siding_n', scale: 2.6, rough: 0.85, metal: 0, colorize: 0.85 },
  { key: 'slate', c: 'slate_c', n: 'slate_n', scale: 2.2, rough: 0.8, metal: 0, colorize: 0.6 },
  { key: 'tin', c: 'tin_c', n: 'tin_n', scale: 2.2, rough: 0.6, metal: 0.35, colorize: 0.3 },
  { key: 'concrete', c: 'concrete_c', n: 'concrete_n', scale: 3.5, rough: 0.92, metal: 0, colorize: 0.15 },
  { key: 'brick', c: 'brick_c', n: 'brick_n', scale: 2.4, rough: 0.9, metal: 0, colorize: 0.2 },
  { key: 'rusty', c: 'rusty_c', n: 'rusty_n', scale: 2.0, rough: 0.7, metal: 0.45, colorize: 0.35 },
  { key: 'metal', c: 'paintmetal_c', n: 'paintmetal_n', scale: 2.0, rough: 0.5, metal: 0.15, colorize: 1 },
  { key: 'rubber', c: 'concrete_c', n: 'denim_n', scale: 0.5, rough: 0.95, metal: 0, colorize: 1 },
  { key: 'stone', c: 'rock_c', n: 'rock_n', scale: 3.0, rough: 0.85, metal: 0, colorize: 0.1 },
  { key: 'fabric', c: 'jersey_c', n: 'denim_n', scale: 0.8, rough: 0.95, metal: 0, colorize: 1 },
];
const LAYER_INDEX = Object.fromEntries(PROP_LAYERS.map((l, i) => [l.key, i]));

const _c = new THREE.Color();

export function paint(geo, color, jitter = 0, rnd = Math.random) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  let mat = 0;
  if (typeof color === 'string' && color.includes(':')) {
    const [m, c] = color.split(':');
    mat = LAYER_INDEX[m] ?? 0;
    color = c;
  }
  const n = geo.attributes.position.count;
  const col = new Float32Array(n * 3);
  const mats = new Float32Array(n).fill(mat);
  _c.set(color);
  _c.convertSRGBToLinear();
  for (let i = 0; i < n; i += 3) {
    const k = 1 + (rnd() - 0.5) * jitter;
    for (let j = 0; j < 3 && i + j < n; j++) {
      col[(i + j) * 3] = _c.r * k;
      col[(i + j) * 3 + 1] = _c.g * k;
      col[(i + j) * 3 + 2] = _c.b * k;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aMat', new THREE.BufferAttribute(mats, 1));
  if (geo.attributes.uv) geo.deleteAttribute('uv');
  return geo;
}

export function merge(list) {
  const g = mergeGeometries(list, false);
  list.forEach((x) => x.dispose());
  return g;
}

// ---------- материал ----------

const propUniforms = {
  uPropC: { value: null },
  uPropN: { value: null },
  uScale: { value: PROP_LAYERS.map((l) => l.scale) },
  uRoughL: { value: PROP_LAYERS.map((l) => l.rough) },
  uMetalL: { value: PROP_LAYERS.map((l) => l.metal) },
  uColorize: { value: PROP_LAYERS.map((l) => l.colorize) },
  uAvg: { value: PROP_LAYERS.map(() => 0.2) },
  uWet: weatherUniforms.uWet,
  uSnow: weatherUniforms.uSnow,
};

function makePropMaterial(opts = {}) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0, ...opts });
  return extendMaterial(m, {
    key: `prop-${opts.side ?? 0}`,
    uniforms: propUniforms,
    vertexHead: `attribute float aMat;
varying vec3 vObjPos; varying vec3 vObjN; varying float vMat;
varying vec3 vMx; varying vec3 vMy; varying vec3 vMz;`,
    vertexBegin: `vObjPos = position; vObjN = normal; vMat = aMat;
mat3 nm_ = normalMatrix;
#ifdef USE_INSTANCING
nm_ = normalMatrix * mat3(instanceMatrix);
#endif
vMx = nm_ * vec3(1.0, 0.0, 0.0); vMy = nm_ * vec3(0.0, 1.0, 0.0); vMz = nm_ * vec3(0.0, 0.0, 1.0);`,
    fragHead: `uniform sampler2DArray uPropC;
uniform sampler2DArray uPropN;
uniform float uScale[${PROP_LAYERS.length}];
uniform float uRoughL[${PROP_LAYERS.length}];
uniform float uMetalL[${PROP_LAYERS.length}];
uniform float uColorize[${PROP_LAYERS.length}];
uniform float uAvg[${PROP_LAYERS.length}];
uniform float uWet;
uniform float uSnow;
varying vec3 vObjPos; varying vec3 vObjN; varying float vMat;
varying vec3 vMx; varying vec3 vMy; varying vec3 vMz;
${TRIPLANAR_GLSL}`,
    color: `
  int li = int(vMat + 0.5);
  float layer = float(li);
  vec3 oN = normalize(vObjN);
  vec3 tw = triWeights(oN, 8.0);
  vec3 dpx = dFdx(vObjPos), dpy = dFdy(vObjPos);
  vec4 tcol = triColor(uPropC, vObjPos, dpx, dpy, tw, layer, uScale[li]);
  vec3 detail = tcol.rgb / max(uAvg[li], 0.02);
  float dl = dot(detail, vec3(0.2126, 0.7152, 0.0722));
  float vl = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 natural = tcol.rgb * (vl / max(uAvg[li], 0.02));
  vec3 colored = diffuseColor.rgb * mix(1.0, dl, 0.85);
  diffuseColor.rgb = mix(natural, colored, uColorize[li]);
  vec3 propN = triNormal(uPropN, vObjPos, dpx, dpy, oN, tw, layer, uScale[li], 1.0);
`,
    roughness: 'roughnessFactor = uRoughL[li];',
    metalness: 'metalnessFactor = uMetalL[li];',
    normal: `
  normal = normalize(vMx * propN.x + vMy * propN.y + vMz * propN.z);
  #ifdef DOUBLE_SIDED
  normal *= faceDirection;
  #endif
  {
    vec3 wN = (vec4(normal, 0.0) * viewMatrix).xyz;
    float snowK = uSnow * smoothstep(0.5, 0.85, wN.y);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.8, 0.83, 0.88), snowK);
    float wet = uWet * (1.0 - snowK);
    diffuseColor.rgb *= 1.0 - wet * 0.3;
    roughnessFactor = mix(roughnessFactor, 0.3, wet * 0.6);
  }`,
  });
}

export const propMaterial = makePropMaterial();
export const propMaterialDouble = makePropMaterial({ side: THREE.DoubleSide });
export const metalMaterial = propMaterial;
export const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x10181c, roughness: 0.06, metalness: 0.1, envMapIntensity: 1.6 });
export const windowLitMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a20, emissive: 0xffc070, emissiveIntensity: 0, roughness: 0.25 });

// вызывается после загрузки текстур
export function initPropMaterials(quality = 'medium') {
  const size = quality === 'low' ? 256 : 512;
  const arr = textureArrays(PROP_LAYERS, size);
  propUniforms.uPropC.value = arr.color;
  propUniforms.uPropN.value = arr.normal;
  propUniforms.uAvg.value = arr.avg;
}

function jitterVerts(geo, amt, rnd) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (1 + (rnd() - 0.5) * amt), p.getY(i) * (1 + (rnd() - 0.5) * amt), p.getZ(i) * (1 + (rnd() - 0.5) * amt));
  }
  geo.computeVertexNormals();
  return geo;
}

// валун: сфера, продавленная шумом; сверху мох (его даёт текстура камня)
export function makeRock(seed, size = 1) {
  const rnd = mulberry32(seed);
  const g = new THREE.IcosahedronGeometry(size, 3);
  const p = g.attributes.position;
  const ox = rnd() * 10, oz = rnd() * 10;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 2.1 + ox) * Math.cos(v.z * 1.7 + oz) * 0.18 + Math.sin(v.y * 3.3 + ox) * 0.08 + Math.sin((v.x + v.z) * 5.1) * 0.03;
    v.multiplyScalar(1 + n);
    if (v.y < 0) v.y *= 0.55;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.scale(1, 0.62 + rnd() * 0.3, 0.85 + rnd() * 0.3);
  g.translate(0, size * 0.22, 0);
  g.computeVertexNormals();
  const shade = 0.55 + rnd() * 0.2;
  return paint(g, `stone:${new THREE.Color(shade, shade * 0.98, shade * 0.95).getStyle()}`, 0, rnd);
}

// --- постройки ---

// двускатная крыша
function gableRoof(w, d, h, overhang = 0.4) {
  const W = w / 2 + overhang, D = d / 2 + overhang;
  const shape = new THREE.Shape();
  shape.moveTo(-W, 0);
  shape.lineTo(W, 0);
  shape.lineTo(0, h);
  shape.lineTo(-W, 0);
  const g = new THREE.ExtrudeGeometry(shape, { depth: D * 2, bevelEnabled: false });
  g.translate(0, 0, -D);
  return g;
}

// скаты крыши отдельно от фронтонов: скаты — шифер/железо, фронтоны — доски
function gableParts(w, d, h, overhang = 0.4) {
  const W = w / 2 + overhang, D = d / 2 + overhang;
  const len = Math.hypot(W, h);
  const ang = Math.atan2(h, W);
  const slopes = [];
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(len + 0.05, 0.06, D * 2);
    g.rotateZ(-s * ang);
    g.translate((s * W) / 2, h / 2, 0);
    slopes.push(g);
  }
  // фронтоны — пятиугольник от верха стены до конька
  const yE = (h * (W - w / 2)) / W;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, yE);
  shape.lineTo(0, h - 0.03);
  shape.lineTo(-w / 2, yE);
  shape.lineTo(-w / 2, 0);
  const gables = [];
  for (const s of [-1, 1]) {
    const g = new THREE.ShapeGeometry(shape);
    if (s < 0) g.rotateY(Math.PI);
    g.translate(0, 0, (s * d) / 2);
    gables.push(g);
  }
  return { slopes, gables, ridge: h };
}

function box(w, h, d, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

// Деревенский дом. Возвращает { group, colliders: [{hx,hz,...}], windows: Mesh }
export function makeHouse(opts = {}) {
  const rnd = mulberry32(opts.seed ?? 1);
  const w = opts.w ?? 6 + rnd() * 3;
  const d = opts.d ?? 7 + rnd() * 3;
  const hWall = opts.h ?? 2.8 + rnd() * 0.6;
  const wallColor = opts.wall ?? ['#a8743e', '#8d5f37', '#c9b48a', '#6f8aa0', '#b3a07a', '#9a6a4a'][Math.floor(rnd() * 6)];
  const roofColor = opts.roof ?? ['#8a8e8c', '#7a3a2a', '#5a6a5a', '#9a9690'][Math.floor(rnd() * 4)];
  const roofMat = roofColor === '#7a3a2a' || roofColor === '#5a6a5a' ? 'tin' : 'slate';
  const abandoned = !!opts.abandoned;
  const parts = [], dark = [], lit = [];

  parts.push(paint(box(w + 0.3, 0.5, d + 0.3, 0, 0.25, 0), 'concrete:#7b7670', 0.1, rnd)); // фундамент
  parts.push(paint(box(w, hWall, d, 0, 0.5 + hWall / 2, 0), `siding:${wallColor}`, 0.06, rnd));
  // нижний венец и углы — потемнее
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    parts.push(paint(box(0.16, hWall, 0.16, x * (w / 2 + 0.02), 0.5 + hWall / 2, z * (d / 2 + 0.02)), 'wood:#5a4632', 0.1, rnd));
  }
  const roofH = 1.6 + rnd() * 0.8;
  const roof = gableParts(w, d, roofH);
  for (const g of roof.slopes) {
    g.translate(0, 0.5 + hWall, 0);
    parts.push(paint(g, `${roofMat}:${roofColor}`, 0.08, rnd));
  }
  for (const g of roof.gables) {
    g.translate(0, 0.5 + hWall, 0);
    parts.push(paint(g, `siding:${wallColor}`, 0.06, rnd));
  }
  // труба
  parts.push(paint(box(0.5, 1.6, 0.5, w * 0.2, 0.5 + hWall + 1.1, d * 0.15), 'brick:#8a5040', 0.1, rnd));
  // окна по длинным сторонам и наличники
  const shutter = opts.shutters ?? ['#3a6fb0', '#e8e2d0', '#3f8a5a', '#a0352c'][Math.floor(rnd() * 4)];
  const nWin = Math.max(1, Math.floor(d / 3));
  for (const side of [-1, 1]) {
    for (let i = 0; i < nWin; i++) {
      const z = -d / 2 + (d / nWin) * (i + 0.5);
      const y = 0.5 + hWall * 0.55;
      const win = box(0.06, 1.1, 0.9, side * (w / 2 + 0.02), y, z);
      (abandoned || rnd() < 0.4 ? dark : lit).push(win);
      // рама и подоконник
      parts.push(paint(box(0.09, 1.24, 0.08, side * (w / 2 + 0.03), y, z - 0.49), `paint:${shutter}`, 0.05, rnd));
      parts.push(paint(box(0.09, 1.24, 0.08, side * (w / 2 + 0.03), y, z + 0.49), `paint:${shutter}`, 0.05, rnd));
      parts.push(paint(box(0.09, 0.08, 1.06, side * (w / 2 + 0.03), y + 0.62, z), `paint:${shutter}`, 0.05, rnd));
      parts.push(paint(box(0.16, 0.06, 1.1, side * (w / 2 + 0.06), y - 0.6, z), `paint:${shutter}`, 0.05, rnd));
      parts.push(paint(box(0.06, 0.04, 0.9, side * (w / 2 + 0.035), y, z), 'paint:#e8e4da', 0, rnd));
      // ставни
      parts.push(paint(box(0.06, 1.2, 0.42, side * (w / 2 + 0.06), y, z - 0.72), `wood:${shutter}`, 0.1, rnd));
      parts.push(paint(box(0.06, 1.2, 0.42, side * (w / 2 + 0.06), y, z + 0.72), `wood:${shutter}`, 0.1, rnd));
    }
  }
  // дверь на фасаде (+Z)
  parts.push(paint(box(1.0, 2.0, 0.08, w * 0.25, 1.5, d / 2 + 0.03), abandoned ? 'wood:#3a2e24' : 'wood:#6a4a30', 0.1, rnd));
  // крыльцо с навесом
  parts.push(paint(box(1.8, 0.3, 1.2, w * 0.25, 0.35, d / 2 + 0.6), 'wood:#7a6450', 0.1, rnd));
  parts.push(paint(box(1.8, 0.06, 1.3, w * 0.25, 2.75, d / 2 + 0.6), `${roofMat}:${roofColor}`, 0.1, rnd));
  for (const x of [-0.8, 0.8]) parts.push(paint(box(0.1, 2.4, 0.1, w * 0.25 + x, 1.55, d / 2 + 1.15), 'wood:#6a5440', 0.1, rnd));
  if (abandoned) {
    // доски крест-накрест на окнах
    for (const side of [-1, 1]) {
      for (let j = 0; j < nWin; j++) {
        for (const r of [-0.6, 0.6]) {
          const b = box(0.08, 0.12, 1.3);
          b.rotateX(r);
          b.translate(side * (w / 2 + 0.09), 0.5 + hWall * 0.55, -d / 2 + (d / nWin) * (j + 0.5));
          parts.push(paint(b, 'wood:#6a5a48', 0.2, rnd));
        }
      }
    }
  }

  const group = new THREE.Group();
  const main = new THREE.Mesh(merge(parts), propMaterialDouble);
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);
  if (dark.length) group.add(new THREE.Mesh(merge(dark), glassMaterial));
  let windows = null;
  if (lit.length) {
    windows = new THREE.Mesh(merge(lit), windowLitMaterial);
    group.add(windows);
  }
  return { group, w: w + 0.4, d: d + 0.4, height: hWall + 2.5, windows, doorLocal: new THREE.Vector3(w * 0.25, 0, d / 2 + 1.2) };
}

// сарай / гараж с воротами
export function makeGarage(opts = {}) {
  const rnd = mulberry32(opts.seed ?? 5);
  const w = opts.w ?? 7, d = opts.d ?? 8, h = opts.h ?? 3.6;
  const wallMat = opts.mat ?? (w >= 14 ? 'brick' : h < 3 && w <= 5 ? 'wood' : 'paint');
  const parts = [];
  parts.push(paint(box(w + 0.2, 0.3, d + 0.2, 0, 0.15, 0), 'concrete:#7a7670', 0.05, rnd));
  parts.push(paint(box(w, h, d, 0, h / 2, 0), `${wallMat}:${opts.wall ?? '#8f969a'}`, 0.06, rnd));
  parts.push(paint(box(w + 0.6, 0.25, d + 0.6, 0, h + 0.12, 0), `tin:${opts.roof ?? '#5f6468'}`, 0.08, rnd));
  parts.push(paint(box(w * 0.7, h * 0.75, 0.1, 0, h * 0.375, d / 2 + 0.05), `metal:${opts.gate ?? '#4f6e5a'}`, 0.05, rnd));
  for (let i = 0; i < 6; i++) parts.push(paint(box(w * 0.7, 0.04, 0.12, 0, 0.3 + i * 0.42, d / 2 + 0.1), `metal:${opts.gate ?? '#3e5848'}`, 0, rnd));
  // окошко сбоку
  const win = box(0.06, 0.8, 1.2, w / 2 + 0.02, h * 0.6, 0);
  const group = new THREE.Group();
  const m = new THREE.Mesh(merge(parts), propMaterial);
  m.castShadow = m.receiveShadow = true;
  group.add(m);
  if (w >= 3 && h >= 2.5) group.add(new THREE.Mesh(win, glassMaterial));
  return { group, w, d, height: h };
}

export function makeFence(len, seed = 1, color = '#7a6046') {
  const rnd = mulberry32(seed);
  const parts = [];
  const metal = color === '#5a5a5a';
  for (let x = 0; x <= len; x += 2) {
    parts.push(paint(box(0.12, 1.3, 0.12, x, 0.65, 0), metal ? 'rusty:#6a6a6a' : 'wood:#5a4a3a', 0.2, rnd));
  }
  for (let x = 0; x < len; x += 0.18) {
    if (rnd() < 0.08) continue;
    const b = box(0.12, 1.1 + rnd() * 0.15, 0.03, x, 0.6, 0.08);
    b.rotateZ((rnd() - 0.5) * 0.04);
    parts.push(paint(b, metal ? `tin:${color}` : `wood:${color}`, 0.25, rnd));
  }
  parts.push(paint(box(len, 0.08, 0.06, len / 2, 0.35, 0.05), `wood:${color}`, 0.1, rnd));
  parts.push(paint(box(len, 0.08, 0.06, len / 2, 0.95, 0.05), `wood:${color}`, 0.1, rnd));
  return merge(parts);
}

export function makePowerPole(seed = 1) {
  const rnd = mulberry32(seed);
  const parts = [];
  const pole = new THREE.CylinderGeometry(0.11, 0.15, 9, 8);
  pole.translate(0, 4.5, 0);
  parts.push(paint(pole, 'wood:#4a3a2a', 0.1, rnd));
  parts.push(paint(box(2.2, 0.14, 0.14, 0, 8.4, 0), 'wood:#4a3a2a', 0.15, rnd));
  parts.push(paint(box(0.08, 1.2, 0.08, 0.5, 7.8, 0).rotateZ(0.6), 'wood:#4a3a2a', 0.15, rnd));
  for (const x of [-0.9, 0, 0.9]) {
    const ins = new THREE.CylinderGeometry(0.05, 0.07, 0.22, 8);
    ins.translate(x, 8.6, 0);
    parts.push(paint(ins, 'paint:#d8d4c8', 0, rnd));
  }
  return merge(parts);
}

export function makeTent(color = '#3d7a4a') {
  const g = new THREE.ConeGeometry(1.6, 1.8, 4, 3);
  g.rotateY(Math.PI / 4);
  g.translate(0, 0.9, 0);
  return paint(g, `fabric:${color}`, 0.1);
}

// ржавая брошенная машина (без физики, просто декор + обыск)
export function makeWreck(seed = 1, color = '#7a5a40') {
  const rnd = mulberry32(seed);
  const parts = [];
  parts.push(paint(box(1.6, 0.6, 4.0, 0, 0.55, 0), `metal:${color}`, 0.25, rnd));
  parts.push(paint(box(1.4, 0.55, 2.0, 0, 1.12, -0.3), `metal:${color}`, 0.25, rnd));
  for (const [x, z] of [[-0.75, 1.25], [0.75, 1.25], [-0.75, -1.2], [0.75, -1.2]]) {
    if (rnd() < 0.35) {
      // колеса нет — кирпичи
      parts.push(paint(box(0.3, 0.3, 0.4, x, 0.15, z), 'brick:#8a3b2a', 0.2, rnd));
    } else {
      const w = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14);
      w.rotateZ(Math.PI / 2);
      w.translate(x, 0.28, z);
      parts.push(paint(w, 'rubber:#1f1f1f', 0.1, rnd));
    }
  }
  // ржавчина пятнами — целые грани меняем на ржавое железо
  const g = merge(parts);
  const col = g.attributes.color;
  const mat = g.attributes.aMat;
  for (let i = 0; i < col.count; i += 3) {
    if (mat.getX(i) === LAYER_INDEX.metal && rnd() < 0.35) {
      for (let j = 0; j < 3; j++) {
        col.setXYZ(i + j, 0.2, 0.09, 0.04);
        mat.setX(i + j, LAYER_INDEX.rusty);
      }
    }
  }
  const winG = merge([box(1.42, 0.4, 0.05, 0, 1.15, 0.72), box(1.42, 0.35, 0.05, 0, 1.12, -1.3)]);
  const group = new THREE.Group();
  const m = new THREE.Mesh(g, propMaterial);
  m.castShadow = m.receiveShadow = true;
  group.add(m);
  group.add(new THREE.Mesh(winG, glassMaterial));
  group.rotation.z = (rnd() - 0.5) * 0.08;
  return group;
}

export function makeSign(texture, w = 2.2, h = 1.1, poleH = 2.2) {
  const group = new THREE.Group();
  const poleG = new THREE.CylinderGeometry(0.04, 0.04, poleH, 8);
  poleG.translate(0, poleH / 2, 0);
  const pole = new THREE.Mesh(paint(poleG, 'metal:#8a8e90'), propMaterial);
  group.add(pole);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.45, metalness: 0.1 }));
  board.position.y = poleH + h / 2 - 0.1;
  board.position.z = 0.05;
  group.add(board);
  const back = new THREE.Mesh(paint(new THREE.BoxGeometry(w, h, 0.03), 'rusty:#7a7e80'), propMaterial);
  back.position.copy(board.position);
  back.position.z = 0.025;
  group.add(back);
  group.traverse((o) => { o.castShadow = true; });
  return group;
}

// пятиэтажка/девятиэтажка для Северного
export function makePanelBlock(seed, floors = 5, sections = 3) {
  const rnd = mulberry32(seed);
  const fh = 2.9;
  const w = 12 * sections, d = 12, h = floors * fh + 0.6;
  const parts = [];
  const tone = 0.62 + rnd() * 0.12;
  parts.push(paint(box(w, h, d, 0, h / 2, 0), `concrete:${new THREE.Color(tone, tone * 0.98, tone * 0.95).getStyle()}`, 0.04, rnd));
  parts.push(paint(box(w + 0.4, 0.5, d + 0.4, 0, h + 0.25, 0), 'concrete:#55585a', 0.05, rnd));
  const lit = [], dark = [];
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < sections * 4; i++) {
      const x = -w / 2 + 1.5 + i * 3;
      for (const side of [-1, 1]) {
        const win = box(1.4, 1.4, 0.06, x, 1.4 + f * fh, side * (d / 2 + 0.02));
        (rnd() < 0.35 ? lit : dark).push(win);
        // подоконник и швы панелей
        parts.push(paint(box(1.6, 0.06, 0.14, x, 0.68 + f * fh, side * (d / 2 + 0.05)), 'metal:#9a9a96', 0, rnd));
      }
    }
    // балконы через один
    if (f > 0) {
      for (let s = 0; s < sections; s++) {
        if (rnd() < 0.5) continue;
        parts.push(paint(box(3, 1.0, 1.1, -w / 2 + 3 + s * 12, 0.9 + f * fh, d / 2 + 0.55), 'concrete:#8a8680', 0.05, rnd));
      }
    }
  }
  // подъезды
  for (let s = 0; s < sections; s++) {
    parts.push(paint(box(2.2, 0.2, 1.6, -w / 2 + 6 + s * 12, 2.6, d / 2 + 0.8), 'concrete:#7a7e80', 0.05, rnd));
    parts.push(paint(box(1.2, 2.1, 0.08, -w / 2 + 6 + s * 12, 1.05, d / 2 + 0.03), 'metal:#4a3a30', 0.1, rnd));
  }
  const group = new THREE.Group();
  const m = new THREE.Mesh(merge(parts), propMaterial);
  m.castShadow = m.receiveShadow = true;
  group.add(m);
  group.add(new THREE.Mesh(merge(dark), glassMaterial));
  const windows = new THREE.Mesh(merge(lit), windowLitMaterial);
  group.add(windows);
  return { group, w, d, height: h, windows };
}

export { box, gableRoof, jitterVerts };
