import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../core/Random.js';
import { patchWeather } from './materials.js';

// Процедурные модельки: деревья, камни, дома и прочая утварь.
// Всё красится вершинными цветами, чтобы обходиться парой материалов.

const _c = new THREE.Color();

export function paint(geo, color, jitter = 0, rnd = Math.random) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  const n = geo.attributes.position.count;
  const col = new Float32Array(n * 3);
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
  if (geo.attributes.uv) geo.deleteAttribute('uv');
  return geo;
}

export function merge(list) {
  const g = mergeGeometries(list, false);
  list.forEach((x) => x.dispose());
  return g;
}

export const propMaterial = patchWeather(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }), { detail: 0.2, detailScale: 0.5 });
export const leafMaterial = patchWeather(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: true }), { detail: 0.15, detailScale: 0.7, snow: 0.9 });
export const metalMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.5 });
export const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x1d2a33, roughness: 0.1, metalness: 0.3 });
export const windowLitMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a20, emissive: 0xffc870, emissiveIntensity: 0, roughness: 0.4 });

function jitterVerts(geo, amt, rnd) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (1 + (rnd() - 0.5) * amt), p.getY(i) * (1 + (rnd() - 0.5) * amt), p.getZ(i) * (1 + (rnd() - 0.5) * amt));
  }
  geo.computeVertexNormals();
  return geo;
}

// --- деревья: возвращают { wood, leaf } геометрии, основание в (0,0,0) ---

export function makeSpruce(seed, snowy = false, lod = 0) {
  const rnd = mulberry32(seed);
  const h = 9 + rnd() * 5;
  const trunk = new THREE.CylinderGeometry(0.12, 0.25, h * 0.35, lod ? 4 : 6);
  trunk.translate(0, h * 0.175, 0);
  const leaf = [];
  const tiers = lod ? 2 : 4;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const r = (1 - t) * 2.6 + 0.5;
    const cone = new THREE.ConeGeometry(r, h * (0.42 - t * 0.12), lod ? 5 : 7);
    cone.translate(0, h * 0.25 + t * h * 0.6 + h * 0.18, 0);
    const green = ['#41693a', '#3b6134', '#4a7341', '#365a31'][Math.floor(rnd() * 4)];
    leaf.push(paint(cone, snowy && i < tiers - 1 ? '#4c6a46' : green, 0.15, rnd));
    if (snowy) {
      const cap = new THREE.ConeGeometry(r * 0.75, h * 0.1, lod ? 5 : 7);
      cap.translate(0, h * 0.25 + t * h * 0.6 + h * 0.3, 0);
      leaf.push(paint(cap, '#e8eef4', 0.05, rnd));
    }
  }
  return { wood: paint(trunk, '#5e4430', 0.2, rnd), leaf: merge(leaf), height: h };
}

export function makePine(seed, lod = 0) {
  const rnd = mulberry32(seed);
  const h = 12 + rnd() * 6;
  const trunk = new THREE.CylinderGeometry(0.16, 0.3, h * 0.8, lod ? 4 : 6);
  trunk.translate(0, h * 0.4, 0);
  const leaf = [];
  const blobs = lod ? 1 : 3;
  for (let i = 0; i < blobs; i++) {
    const b = new THREE.IcosahedronGeometry(1.8 + rnd() * 1.2, 0);
    if (!lod) jitterVerts(b, 0.4, rnd);
    b.scale(1.2, 0.7, 1.2);
    b.translate((rnd() - 0.5) * 2, h * 0.78 + i * 1.2, (rnd() - 0.5) * 2);
    leaf.push(paint(b, ['#55803c', '#4c7536', '#5d8a42'][i % 3], 0.2, rnd));
  }
  return { wood: paint(trunk, '#8a5a3a', 0.15, rnd), leaf: merge(leaf), height: h };
}

export function makeBirch(seed, lod = 0) {
  const rnd = mulberry32(seed);
  const h = 8 + rnd() * 5;
  const trunk = new THREE.CylinderGeometry(0.1, 0.18, h * 0.85, lod ? 4 : 6, lod ? 1 : 6);
  trunk.translate(0, h * 0.42, 0);
  // берёзовые «пятна» — красим полосками
  const t = paint(trunk, '#e8e6df', 0, rnd);
  if (!lod) {
    const col = t.attributes.color;
    for (let i = 0; i < col.count; i += 3) {
      if (rnd() < 0.3) {
        for (let j = 0; j < 3; j++) col.setXYZ(i + j, 0.02, 0.02, 0.02);
      }
    }
  }
  const leaf = [];
  const blobs = lod ? 1 : 4;
  for (let i = 0; i < blobs; i++) {
    const b = new THREE.IcosahedronGeometry(1.4 + rnd() * 1.0, lod ? 0 : 1);
    if (!lod) jitterVerts(b, 0.35, rnd);
    b.translate((rnd() - 0.5) * 1.8, h * 0.62 + rnd() * h * 0.3, (rnd() - 0.5) * 1.8);
    leaf.push(paint(b, ['#6f9a3a', '#7aa344', '#668f35', '#86a94c'][i % 4], 0.2, rnd));
  }
  return { wood: t, leaf: merge(leaf), height: h };
}

export function makeBush(seed) {
  const rnd = mulberry32(seed);
  const leaf = [];
  for (let i = 0; i < 3; i++) {
    const b = new THREE.IcosahedronGeometry(0.6 + rnd() * 0.5, 0);
    jitterVerts(b, 0.4, rnd);
    b.translate((rnd() - 0.5) * 1.2, 0.45 + rnd() * 0.3, (rnd() - 0.5) * 1.2);
    leaf.push(paint(b, ['#4c6b2e', '#587a35', '#41602a'][i], 0.2, rnd));
  }
  return { wood: null, leaf: merge(leaf), height: 1 };
}

export function makeRock(seed, size = 1) {
  const rnd = mulberry32(seed);
  const g = new THREE.DodecahedronGeometry(size, 1);
  jitterVerts(g, 0.45, rnd);
  g.scale(1, 0.65 + rnd() * 0.3, 1);
  g.translate(0, size * 0.25, 0);
  const shade = 0.4 + rnd() * 0.15;
  return paint(g, new THREE.Color(shade, shade * 0.97, shade * 0.93).getStyle(), 0.25, rnd);
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
  const roofColor = opts.roof ?? ['#5b6168', '#7a3a2a', '#4c5a4a', '#6a6460'][Math.floor(rnd() * 4)];
  const abandoned = !!opts.abandoned;
  const parts = [], dark = [], lit = [];

  parts.push(paint(box(w + 0.3, 0.5, d + 0.3, 0, 0.25, 0), '#6b6660', 0.1, rnd)); // фундамент
  parts.push(paint(box(w, hWall, d, 0, 0.5 + hWall / 2, 0), wallColor, 0.08, rnd));
  const roof = gableRoof(w, d, 1.6 + rnd() * 0.8);
  roof.translate(0, 0.5 + hWall, 0);
  parts.push(paint(roof, roofColor, 0.12, rnd));
  // труба
  parts.push(paint(box(0.5, 1.4, 0.5, w * 0.2, 0.5 + hWall + 1.2, d * 0.15), '#7a4b3a', 0.1, rnd));
  // окна по длинным сторонам и наличники
  const shutter = opts.shutters ?? ['#3a6fb0', '#e8e2d0', '#3f8a5a', '#a0352c'][Math.floor(rnd() * 4)];
  const nWin = Math.max(1, Math.floor(d / 3));
  for (const side of [-1, 1]) {
    for (let i = 0; i < nWin; i++) {
      const z = -d / 2 + (d / nWin) * (i + 0.5);
      const win = box(0.06, 1.1, 0.9, side * (w / 2 + 0.02), 0.5 + hWall * 0.55, z);
      (abandoned || rnd() < 0.4 ? dark : lit).push(win);
      parts.push(paint(box(0.08, 1.3, 0.2, side * (w / 2 + 0.05), 0.5 + hWall * 0.55, z - 0.6), shutter, 0.1, rnd));
      parts.push(paint(box(0.08, 1.3, 0.2, side * (w / 2 + 0.05), 0.5 + hWall * 0.55, z + 0.6), shutter, 0.1, rnd));
    }
  }
  // дверь на фасаде (+Z)
  parts.push(paint(box(1.0, 2.0, 0.08, w * 0.25, 1.5, d / 2 + 0.03), abandoned ? '#3a2e24' : '#5a3b28', 0.1, rnd));
  // крыльцо
  parts.push(paint(box(1.6, 0.3, 1.0, w * 0.25, 0.35, d / 2 + 0.5), '#6a5440', 0.1, rnd));
  if (abandoned) {
    // доски крест-накрест на окнах
    for (const side of [-1, 1]) {
      for (let j = 0; j < nWin; j++) {
        for (const r of [-0.6, 0.6]) {
          const b = box(0.08, 0.12, 1.3);
          b.rotateX(r);
          b.translate(side * (w / 2 + 0.07), 0.5 + hWall * 0.55, -d / 2 + (d / nWin) * (j + 0.5));
          parts.push(paint(b, '#5a4a38', 0.2, rnd));
        }
      }
    }
  }

  const group = new THREE.Group();
  const main = new THREE.Mesh(merge(parts), propMaterial);
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);
  if (dark.length) {
    const m = new THREE.Mesh(merge(dark), glassMaterial);
    group.add(m);
  }
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
  const parts = [];
  parts.push(paint(box(w, h, d, 0, h / 2, 0), opts.wall ?? '#8f969a', 0.1, rnd));
  parts.push(paint(box(w + 0.6, 0.25, d + 0.6, 0, h + 0.12, 0), opts.roof ?? '#4f5458', 0.1, rnd));
  parts.push(paint(box(w * 0.7, h * 0.75, 0.1, 0, h * 0.375, d / 2 + 0.05), opts.gate ?? '#4f6e5a', 0.1, rnd));
  for (let i = 0; i < 6; i++) parts.push(paint(box(w * 0.7, 0.04, 0.12, 0, 0.3 + i * 0.42, d / 2 + 0.1), '#3e5848', 0, rnd));
  const group = new THREE.Group();
  const m = new THREE.Mesh(merge(parts), propMaterial);
  m.castShadow = m.receiveShadow = true;
  group.add(m);
  return { group, w, d, height: h };
}

export function makeFence(len, seed = 1, color = '#7a6046') {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let x = 0; x <= len; x += 2) {
    parts.push(paint(box(0.12, 1.3, 0.12, x, 0.65, 0), color, 0.2, rnd));
  }
  for (let x = 0; x < len; x += 0.18) {
    if (rnd() < 0.08) continue;
    const b = box(0.12, 1.1 + rnd() * 0.15, 0.03, x, 0.6, 0.08);
    parts.push(paint(b, color, 0.25, rnd));
  }
  parts.push(paint(box(len, 0.08, 0.06, len / 2, 0.35, 0.05), color, 0.1, rnd));
  parts.push(paint(box(len, 0.08, 0.06, len / 2, 0.95, 0.05), color, 0.1, rnd));
  return merge(parts);
}

export function makePowerPole(seed = 1) {
  const rnd = mulberry32(seed);
  const parts = [];
  parts.push(paint(box(0.22, 9, 0.22, 0, 4.5, 0), '#5a4a3a', 0.15, rnd));
  parts.push(paint(box(2.2, 0.15, 0.15, 0, 8.4, 0), '#5a4a3a', 0.15, rnd));
  for (const x of [-0.9, 0, 0.9]) parts.push(paint(box(0.08, 0.25, 0.08, x, 8.6, 0), '#d8d4c8', 0, rnd));
  return merge(parts);
}

export function makeTent(color = '#3d7a4a') {
  const g = new THREE.ConeGeometry(1.6, 1.8, 4);
  g.rotateY(Math.PI / 4);
  g.translate(0, 0.9, 0);
  return paint(g, color, 0.1);
}

// ржавая брошенная машина (без физики, просто декор + обыск)
export function makeWreck(seed = 1, color = '#7a5a40') {
  const rnd = mulberry32(seed);
  const parts = [];
  parts.push(paint(box(1.6, 0.6, 4.0, 0, 0.55, 0), color, 0.25, rnd));
  const cab = box(1.4, 0.55, 2.0, 0, 1.12, -0.3);
  parts.push(paint(cab, color, 0.25, rnd));
  for (const [x, z] of [[-0.75, 1.25], [0.75, 1.25], [-0.75, -1.2], [0.75, -1.2]]) {
    if (rnd() < 0.35) {
      // колеса нет — кирпичи
      parts.push(paint(box(0.3, 0.3, 0.4, x, 0.15, z), '#8a3b2a', 0.2, rnd));
    } else {
      const w = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10);
      w.rotateZ(Math.PI / 2);
      w.translate(x, 0.28, z);
      parts.push(paint(w, '#1f1f1f', 0.1, rnd));
    }
  }
  // ржавчина пятнами
  const g = merge(parts);
  const col = g.attributes.color;
  for (let i = 0; i < col.count; i += 3) {
    if (rnd() < 0.3) for (let j = 0; j < 3; j++) col.setXYZ(i + j, 0.25, 0.1, 0.04);
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
  const pole = new THREE.Mesh(paint(box(0.08, poleH, 0.08, 0, poleH / 2, 0), '#8a8e90'), metalMaterial);
  group.add(pole);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 }));
  board.position.y = poleH + h / 2 - 0.1;
  board.position.z = 0.05;
  group.add(board);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0x7a7e80, roughness: 0.7 }));
  back.rotation.y = Math.PI;
  back.position.copy(board.position);
  back.position.z = 0.04;
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
  parts.push(paint(box(w, h, d, 0, h / 2, 0), new THREE.Color(tone, tone * 0.98, tone * 0.95).getStyle(), 0.04, rnd));
  parts.push(paint(box(w + 0.4, 0.5, d + 0.4, 0, h + 0.25, 0), '#55585a', 0.05, rnd));
  const lit = [], dark = [];
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < sections * 4; i++) {
      const x = -w / 2 + 1.5 + i * 3;
      for (const side of [-1, 1]) {
        const win = box(1.4, 1.4, 0.06, x, 1.4 + f * fh, side * (d / 2 + 0.02));
        (rnd() < 0.35 ? lit : dark).push(win);
      }
    }
  }
  // подъезды
  for (let s = 0; s < sections; s++) {
    parts.push(paint(box(2.2, 0.2, 1.6, -w / 2 + 6 + s * 12, 2.6, d / 2 + 0.8), '#7a7e80', 0.05, rnd));
    parts.push(paint(box(1.2, 2.1, 0.08, -w / 2 + 6 + s * 12, 1.05, d / 2 + 0.03), '#4a3a30', 0.1, rnd));
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

export { box, gableRoof };
