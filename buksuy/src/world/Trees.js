import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../core/Random.js';
import { tex } from '../render/assets.js';
import { extendMaterial } from '../render/shaderlib.js';
import { weatherUniforms } from './materials.js';

// Деревья: ствол и ветки — цилиндры с корой, хвоя и листва — карточки с фото-листьями.
// Вдали вместо модели — её же снимок (импостор), отрисованный при загрузке.

export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.3 },
};

const _v = new THREE.Vector3();
const _a = new THREE.Vector3();
const _s = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

// ---------- сборщик геометрии ----------

class Builder {
  constructor() {
    this.pos = [];
    this.nrm = [];
    this.uv = [];
    this.col = [];
    this.sway = [];
  }

  vert(p, n, u, v, c, sway, up) {
    this.pos.push(p.x, p.y, p.z);
    this.nrm.push(n.x, n.y, n.z);
    this.uv.push(u, v);
    this.col.push(c, c, c);
    this.sway.push(sway, up);
  }

  // карточка: четыре угла по кругу, у каждого свои uv
  quad(ps, uvs, normalFn, shade, swayFn, up) {
    const order = [0, 1, 2, 0, 2, 3];
    for (const i of order) {
      const p = ps[i];
      this.vert(p, normalFn(p), uvs[i][0], uvs[i][1], shade(p), swayFn(p), up);
    }
  }

  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aSway', new THREE.Float32BufferAttribute(this.sway, 2));
    return g;
  }
}

// ствол или ветка: конус между двумя точками, кора по uv в метрах
function limb(p0, p1, r0, r1, segs, shade, swayAt) {
  const dir = _v.subVectors(p1, p0);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, segs, Math.max(1, Math.round(len / 1.5)), true);
  const uv = g.attributes.uv;
  const circ = Math.max(1, Math.round((Math.PI * 2 * r0) / 0.55));
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * circ, (uv.getY(i) * len) / 1.4);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()));
  g.translate(p0.x, p0.y, p0.z);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const sway = new Float32Array(n * 2);
  const p = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(g.attributes.position, i);
    const c = shade(p);
    col.set([c, c, c], i * 3);
    sway[i * 2] = swayAt(p);
    sway[i * 2 + 1] = 0;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSway', new THREE.BufferAttribute(sway, 2));
  return g.toNonIndexed();
}

function mergeAll(list) {
  const g = mergeGeometries(list, false);
  list.forEach((x) => x.dispose());
  return g;
}

// ---------- виды ----------

// Ель: мутовки из еловых лап (по две карточки «домиком»), сверху макушка.
function spruce(seed) {
  const rnd = mulberry32(seed);
  const h = 12 + rnd() * 4;
  const b = new Builder();
  const y0 = 1.2;
  const crown = (y) => 2.6 * Math.pow(Math.max(0, (h - y) / (h - y0)), 0.85) + 0.22;
  const swayAt = (p) => Math.pow(Math.max(0, p.y) / h, 1.6) * 0.5 + Math.hypot(p.x, p.z) * 0.05;
  const shadeAt = (p, inner) => (0.45 + 0.55 * Math.min(1, p.y / h + 0.15)) * (inner ? 0.75 : 1);
  let rot = rnd() * 6.28;
  for (let y = y0; y < h - 0.8; y += 0.6 + rnd() * 0.12) {
    const R = crown(y);
    const n = 5 + Math.floor(rnd() * 3);
    rot += 0.9;
    for (let k = 0; k < n; k++) {
      const a = rot + (k / n) * Math.PI * 2 + (rnd() - 0.5) * 0.4;
      const droop = 0.18 + (1 - y / h) * 0.3 + rnd() * 0.1;
      const A = new THREE.Vector3(Math.cos(a), -droop, Math.sin(a)).normalize();
      const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
      const len = R * (0.9 + rnd() * 0.25);
      const w = len * 0.55;
      const O = new THREE.Vector3(Math.cos(a) * 0.05, y, Math.sin(a) * 0.05);
      const cell = rnd() < 0.5 ? 0 : 0.5;
      for (const roll of [-0.55, 0.55]) {
        const S = side.clone().applyAxisAngle(A, roll + (rnd() - 0.5) * 0.2);
        const cardN = new THREE.Vector3().crossVectors(A, S).normalize();
        const ps = [
          O.clone().addScaledVector(S, -w / 2),
          O.clone().addScaledVector(A, len).addScaledVector(S, -w / 2),
          O.clone().addScaledVector(A, len).addScaledVector(S, w / 2),
          O.clone().addScaledVector(S, w / 2),
        ];
        const uvs = [[0, cell], [1, cell], [1, cell + 0.5], [0, cell + 0.5]];
        const center = new THREE.Vector3(0, y - R * 0.25, 0);
        b.quad(ps, uvs,
          (p) => _s.subVectors(p, center).normalize().multiplyScalar(0.75).addScaledVector(UP, 0.35).normalize().clone(),
          (p) => shadeAt(p, Math.hypot(p.x, p.z) < len * 0.3),
          swayAt, Math.abs(cardN.y));
      }
    }
  }
  // макушка — две вертикальные карточки
  for (const a of [0, Math.PI / 2]) {
    const S = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const O = new THREE.Vector3(0, h - 1.6, 0);
    const ps = [
      O.clone().addScaledVector(S, -0.45),
      O.clone().addScaledVector(S, -0.45).addScaledVector(UP, 2.2),
      O.clone().addScaledVector(S, 0.45).addScaledVector(UP, 2.2),
      O.clone().addScaledVector(S, 0.45),
    ];
    b.quad(ps, [[0, 0.5], [1, 0.5], [1, 1], [0, 1]], () => UP.clone(), () => 0.95, swayAt, 0.2);
  }
  const leaf = b.geometry();
  const trunk = limb(new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0, h, 0), 0.24, 0.025, 8,
    (p) => 0.55 + 0.45 * Math.min(1, p.y / 3), swayAt);
  return { leaf, wood: trunk, height: h + 0.6, radius: crown(y0) + 0.3, bark: 'spruce' };
}

// Сосна: высокий голый ствол, крона наверху из пучков хвои на ветках.
function pine(seed) {
  const rnd = mulberry32(seed);
  const h = 16 + rnd() * 5;
  const b = new Builder();
  const woods = [];
  const lean = new THREE.Vector3((rnd() - 0.5) * 0.8, 0, (rnd() - 0.5) * 0.8);
  const trunkAt = (y) => new THREE.Vector3(lean.x * (y / h) ** 2, y, lean.z * (y / h) ** 2);
  const swayAt = (p) => Math.pow(Math.max(0, p.y) / h, 2) * 0.55;
  const shadeAt = (p) => 0.6 + 0.4 * Math.min(1, Math.max(0, (p.y - h * 0.6) / (h * 0.4)));
  // ствол из трёх кусков, чтобы чуть изогнуть
  const ys = [-0.3, h * 0.45, h * 0.8, h * 0.98];
  const rs = [0.3, 0.2, 0.12, 0.04];
  for (let i = 0; i < 3; i++) woods.push(limb(trunkAt(ys[i]), trunkAt(ys[i + 1]), rs[i], rs[i + 1], 8, (p) => (p.y < h * 0.5 ? 0.62 : 0.95), swayAt));
  const tuft = (O, up, size) => {
    const cell = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]][Math.floor(rnd() * 4)];
    for (let k = 0; k < 2; k++) {
      const a = rnd() * Math.PI + k * (Math.PI / 2);
      const S = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      S.addScaledVector(up, -S.dot(up)).normalize();
      const base = O.clone().addScaledVector(up, -size * 0.25);
      const ps = [
        base.clone().addScaledVector(S, -size / 2),
        base.clone().addScaledVector(S, size / 2),
        base.clone().addScaledVector(S, size / 2).addScaledVector(up, size),
        base.clone().addScaledVector(S, -size / 2).addScaledVector(up, size),
      ];
      const uvs = [[cell[0], cell[1]], [cell[0] + 0.5, cell[1]], [cell[0] + 0.5, cell[1] + 0.5], [cell[0], cell[1] + 0.5]];
      const center = trunkAt(h * 0.86);
      b.quad(ps, uvs, (p) => _s.subVectors(p, center).normalize().multiplyScalar(0.7).addScaledVector(UP, 0.45).normalize().clone(), shadeAt, swayAt, 0.5);
    }
  };
  const nb = 6 + Math.floor(rnd() * 4);
  let maxR = 1;
  for (let i = 0; i < nb; i++) {
    const y = h * (0.62 + (i / nb) * 0.32) + rnd() * 0.5;
    const a = rnd() * Math.PI * 2;
    const up = 0.25 + rnd() * 0.5;
    const len = (2.2 + rnd() * 1.6) * (1 - (i / nb) * 0.5);
    const O = trunkAt(y);
    const dir = new THREE.Vector3(Math.cos(a), up, Math.sin(a)).normalize();
    const E = O.clone().addScaledVector(dir, len);
    woods.push(limb(O, E, 0.08, 0.025, 5, () => 0.8, swayAt));
    maxR = Math.max(maxR, Math.hypot(E.x, E.z) + 1.2);
    const tUp = new THREE.Vector3(dir.x * 0.4, 1, dir.z * 0.4).normalize();
    for (let t = 0.45; t <= 1.01; t += 0.28) tuft(O.clone().addScaledVector(dir, len * t), tUp, 1.5 + rnd() * 0.7);
    tuft(E.clone().addScaledVector(dir, 0.3), tUp, 1.9 + rnd() * 0.6);
  }
  tuft(trunkAt(h * 0.98), UP, 2.0);
  return { leaf: b.geometry(), wood: mergeAll(woods), height: h + 1.5, radius: maxR, bark: 'pine' };
}

// Берёза: тонкий изогнутый белый ствол, восходящие ветки, листва карточками.
function birch(seed) {
  const rnd = mulberry32(seed);
  const h = 12 + rnd() * 4;
  const b = new Builder();
  const woods = [];
  const bend = new THREE.Vector3((rnd() - 0.5) * 1.2, 0, (rnd() - 0.5) * 1.2);
  const trunkAt = (y) => new THREE.Vector3(bend.x * Math.sin((y / h) * 2.5), y, bend.z * Math.sin((y / h) * 2.5));
  const swayAt = (p) => Math.pow(Math.max(0, p.y) / h, 1.5) * 0.7 + Math.hypot(p.x, p.z) * 0.04;
  const crownC = trunkAt(h * 0.7);
  const shadeAt = (p) => 0.55 + 0.45 * Math.min(1, Math.max(0, _s.subVectors(p, crownC).length() / 4));
  const ys = [-0.3, h * 0.35, h * 0.7, h];
  const rs = [0.19, 0.13, 0.07, 0.02];
  for (let i = 0; i < 3; i++) woods.push(limb(trunkAt(ys[i]), trunkAt(ys[i + 1]), rs[i], rs[i + 1], 8, () => 1, swayAt));
  const cluster = (O, normal, size) => {
    const cell = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]][Math.floor(rnd() * 4)];
    // плоскость карточки: «вверх» — от ветки наружу и вверх
    const up = new THREE.Vector3(normal.x, Math.max(0.3, normal.y) + 0.4, normal.z).normalize();
    const S = new THREE.Vector3().crossVectors(up, normal).normalize();
    if (S.lengthSq() < 0.01) S.set(1, 0, 0);
    S.applyAxisAngle(up, (rnd() - 0.5) * 1.2);
    const base = O.clone().addScaledVector(up, -size * 0.35);
    const ps = [
      base.clone().addScaledVector(S, -size / 2),
      base.clone().addScaledVector(S, size / 2),
      base.clone().addScaledVector(S, size / 2).addScaledVector(up, size),
      base.clone().addScaledVector(S, -size / 2).addScaledVector(up, size),
    ];
    const uvs = [[cell[0], cell[1]], [cell[0] + 0.5, cell[1]], [cell[0] + 0.5, cell[1] + 0.5], [cell[0], cell[1] + 0.5]];
    b.quad(ps, uvs, (p) => _s.subVectors(p, crownC).normalize().multiplyScalar(0.8).addScaledVector(UP, 0.3).normalize().clone(), shadeAt, swayAt, 0.4);
  };
  const nb = 9 + Math.floor(rnd() * 5);
  let maxR = 1.5;
  for (let i = 0; i < nb; i++) {
    const y = h * (0.38 + (i / nb) * 0.55);
    const a = i * 2.4 + rnd() * 0.8;
    const up = 0.5 + rnd() * 0.7;
    const len = (2.4 + rnd() * 1.8) * (1 - (i / nb) * 0.45);
    const O = trunkAt(y);
    const dir = new THREE.Vector3(Math.cos(a), up, Math.sin(a)).normalize();
    const mid = O.clone().addScaledVector(dir, len * 0.6);
    // конец ветки свисает
    const E = mid.clone().addScaledVector(new THREE.Vector3(dir.x, dir.y - 0.7, dir.z).normalize(), len * 0.45);
    woods.push(limb(O, mid, 0.055, 0.03, 5, () => 0.9, swayAt));
    woods.push(limb(mid, E, 0.03, 0.012, 4, () => 0.9, swayAt));
    maxR = Math.max(maxR, Math.hypot(E.x - crownC.x, E.z - crownC.z) + 1.0);
    const out = new THREE.Vector3(Math.cos(a), 0.2, Math.sin(a)).normalize();
    const n = 9 + Math.floor(rnd() * 4);
    for (let k = 0; k < n; k++) {
      const t = 0.3 + (k / n) * 0.8;
      const P = t < 0.6 ? O.clone().lerp(mid, t / 0.6) : mid.clone().lerp(E, (t - 0.6) / 0.4);
      P.add(new THREE.Vector3((rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.9));
      cluster(P, out.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.8, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.8)).normalize(), 1.6 + rnd() * 0.9);
    }
  }
  for (let k = 0; k < 10; k++) {
    const a = rnd() * 6.28;
    cluster(trunkAt(h * (0.82 + rnd() * 0.18)).add(new THREE.Vector3(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6)), new THREE.Vector3(Math.cos(a), 0.8, Math.sin(a)).normalize(), 1.4);
  }
  return { leaf: b.geometry(), wood: mergeAll(woods), height: h + 1.2, radius: maxR, bark: 'birch' };
}

// Куст: карточки листвы вокруг центра, без ствола.
function bush(seed) {
  const rnd = mulberry32(seed);
  const b = new Builder();
  const center = new THREE.Vector3(0, 0.5, 0);
  for (let k = 0; k < 16; k++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.3 + rnd() * 0.5;
    const O = new THREE.Vector3(Math.cos(a) * r, 0.1 + rnd() * 0.5, Math.sin(a) * r);
    const up = new THREE.Vector3(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5).normalize();
    const S = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)).applyAxisAngle(up, (rnd() - 0.5) * 1.5);
    const size = 0.9 + rnd() * 0.5;
    const cell = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]][Math.floor(rnd() * 4)];
    const ps = [
      O.clone().addScaledVector(S, -size / 2),
      O.clone().addScaledVector(S, size / 2),
      O.clone().addScaledVector(S, size / 2).addScaledVector(up, size),
      O.clone().addScaledVector(S, -size / 2).addScaledVector(up, size),
    ];
    const uvs = [[cell[0], cell[1]], [cell[0] + 0.5, cell[1]], [cell[0] + 0.5, cell[1] + 0.5], [cell[0], cell[1] + 0.5]];
    b.quad(ps, uvs, (p) => _s.subVectors(p, center).normalize().clone(), (p) => 0.5 + 0.5 * Math.min(1, p.y / 1.2), (p) => p.y * 0.15, 0.5);
  }
  return { leaf: b.geometry(), wood: null, height: 1.4, radius: 1.2, bark: null };
}

// ---------- материалы ----------

// На дальних мипах альфа размывается, и альфа-тест съедает листву — дерево «лысеет».
// Подтягиваем альфу в зависимости от уровня мипа (приём Бена Голуса).
const ALPHA_KEEP = /* glsl */ `
#ifdef USE_MAP
  {
    vec2 tsz = vec2(textureSize(map, 0));
    vec2 dx = dFdx(vMapUv * tsz), dy = dFdy(vMapUv * tsz);
    float lod = 0.5 * log2(max(dot(dx, dx), dot(dy, dy)));
    diffuseColor.a *= 1.0 + max(0.0, lod) * 0.28;
  }
#endif
`;

const WIND_VERTEX = /* glsl */ `
#ifdef USE_INSTANCING
  vec3 ip_ = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
#else
  vec3 ip_ = vec3(0.0);
#endif
  float ph_ = ip_.x * 0.21 + ip_.z * 0.17;
  float sw_ = aSway.x * uWind;
  transformed.x += (sin(uTime * 1.3 + ph_) * 0.6 + sin(uTime * 2.7 + ph_ * 1.7) * 0.25) * sw_;
  transformed.z += (cos(uTime * 1.1 + ph_) * 0.5) * sw_;
  vUp = aSway.y;
  vAO = color.r;
`;

function leafMaterial(map, opts = {}) {
  const m = new THREE.MeshStandardMaterial({
    map,
    alphaTest: 0.42,
    side: THREE.DoubleSide,
    vertexColors: true,
    roughness: 0.75,
    metalness: 0,
    color: opts.color ?? 0xffffff,
  });
  return extendMaterial(m, {
    key: `leaf-${opts.key}`,
    uniforms: { ...windUniforms, uSnow: weatherUniforms.uSnow, uSnowAmt: { value: opts.snow ?? 0 } },
    vertexHead: 'attribute vec2 aSway;\nuniform float uTime;\nuniform float uWind;\nvarying float vUp;\nvarying float vAO;',
    vertexBegin: WIND_VERTEX,
    fragHead: 'uniform float uSnow;\nuniform float uSnowAmt;\nvarying float vUp;\nvarying float vAO;',
    alpha: ALPHA_KEEP,
    color: `
  float snowK = clamp(uSnowAmt + uSnow * 0.7, 0.0, 1.0) * smoothstep(0.35, 0.8, vUp) * smoothstep(0.35, 0.7, vAO);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.85, 0.9), snowK);`,
    // нормали карточек «сферические» и не зависят от того, какой стороной карточка к нам
    normalBegin: `
  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;
  vec3 normal = normalize(vNormal);
  vec3 nonPerturbedNormal = normal;`,
    // свет насквозь через листву, когда солнце за деревом
    lights: `
  #if NUM_DIR_LIGHTS > 0
  {
    vec3 toCam = normalize(vViewPosition);
    float back = pow(max(dot(-toCam, directionalLights[0].direction), 0.0), 3.0);
    reflectedLight.directDiffuse += diffuseColor.rgb * directionalLights[0].color * back * 0.35;
  }
  #endif`,
  });
}

function barkMaterial(name) {
  const m = new THREE.MeshStandardMaterial({
    map: tex(`bark_${name}_c`),
    normalMap: tex(`bark_${name}_n`),
    normalScale: new THREE.Vector2(1.2, 1.2),
    vertexColors: true,
    roughness: 0.92,
  });
  return extendMaterial(m, {
    key: `bark-${name}`,
    uniforms: windUniforms,
    vertexHead: 'attribute vec2 aSway;\nuniform float uTime;\nuniform float uWind;\nvarying float vUp;\nvarying float vAO;',
    vertexBegin: WIND_VERTEX,
  });
}

// ---------- импосторы ----------

function impostorMaterial(map) {
  const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.35, side: THREE.DoubleSide, vertexColors: true, roughness: 0.85 });
  return extendMaterial(m, {
    key: 'impostor',
    alpha: ALPHA_KEEP,
    vertexHead: 'attribute vec4 aCell;',
    vertexBegin: '',
    after: (sh) => {
      // uv карточки переводим в ячейку атласа
      sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = aCell.xy + uv * aCell.zw;\n#endif');
    },
    normalBegin: `
  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;
  vec3 normal = normalize(vNormal);
  vec3 nonPerturbedNormal = normal;`,
  });
}

function impostorGeometry() {
  // две скрещённые плоскости 1×1, основание в нуле; нормали — вверх и наружу
  const pos = [], nrm = [], uv = [], col = [];
  for (const a of [0, Math.PI / 2]) {
    const c = Math.cos(a), s = Math.sin(a);
    const P = [[-0.5, 0], [0.5, 0], [0.5, 1], [-0.5, 1]];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      const [x, y] = P[i];
      pos.push(x * c, y, x * s);
      const n = new THREE.Vector3(-s * 0.5, 0.75, c * 0.5).normalize();
      nrm.push(n.x, n.y, n.z);
      uv.push(x + 0.5, y);
      const ao = 0.62 + 0.38 * y;
      col.push(ao, ao, ao);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

// снимаем каждое дерево сбоку в свою ячейку атласа (4×2 ячейки)
function bakeImpostors(renderer, list) {
  const CW = 256, CH = 512;
  const cols = 4, rows = Math.ceil(list.length / cols);
  const rt = new THREE.WebGLRenderTarget(CW * cols, CH * rows, {
    colorSpace: THREE.SRGBColorSpace,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, Math.PI * 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 0.5);
  key.position.set(0.3, 1, 1);
  scene.add(key);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, 0, -100, 100);
  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearColor(new THREE.Color());
  const prevAlpha = renderer.getClearAlpha();
  const prevTone = renderer.toneMapping;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setRenderTarget(rt);
  renderer.setClearColor(0x1c2a16, 0);
  renderer.clear();
  const cells = [];
  list.forEach((item, i) => {
    const cx = i % cols, cy = Math.floor(i / cols);
    const W = item.radius * 2, H = item.height;
    cam.left = -W / 2; cam.right = W / 2; cam.top = H; cam.bottom = 0;
    cam.position.set(0, 0, 50);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    const g = new THREE.Group();
    g.add(new THREE.Mesh(item.leaf, item.leafMat));
    if (item.wood) g.add(new THREE.Mesh(item.wood, item.woodMat));
    scene.add(g);
    rt.viewport.set(cx * CW, cy * CH, CW, CH);
    rt.scissor.set(cx * CW, cy * CH, CW, CH);
    rt.scissorTest = true;
    renderer.setRenderTarget(rt);
    renderer.render(scene, cam);
    scene.remove(g);
    cells.push({ u: cx / cols, v: cy / rows, du: 1 / cols, dv: 1 / rows, w: W, h: H });
  });
  rt.scissorTest = false;
  rt.viewport.set(0, 0, CW * cols, CH * rows);
  renderer.setRenderTarget(prevTarget);
  renderer.setClearColor(prevClear, prevAlpha);
  renderer.toneMapping = prevTone;
  rt.texture.anisotropy = 4;
  return { texture: rt.texture, cells, rt };
}

// ---------- набор видов ----------

export function buildTrees(renderer) {
  const birchLeaves = tex('leaves_birch', false);
  const spruceBranch = tex('branch_spruce', false);
  const pineTuft = tex('tuft_pine', false);
  for (const t of [birchLeaves, spruceBranch, pineTuft]) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;

  const mats = {
    spruce: leafMaterial(spruceBranch, { key: 'spruce' }),
    spruceSnow: leafMaterial(spruceBranch, { key: 'spruceSnow', snow: 0.55 }),
    pine: leafMaterial(pineTuft, { key: 'pine' }),
    birch: leafMaterial(birchLeaves, { key: 'birch' }),
    bush: leafMaterial(birchLeaves, { key: 'bush', color: 0xb8c8a0 }),
  };
  const bark = { spruce: barkMaterial('spruce'), pine: barkMaterial('pine'), birch: barkMaterial('birch') };

  const protos = {
    spruce: [spruce(11), spruce(12)],
    spruceSnow: [spruce(21), spruce(22)],
    pine: [pine(31), pine(32)],
    birch: [birch(41), birch(42)],
    bush: [bush(51), bush(52)],
  };
  const list = [];
  for (const [key, variants] of Object.entries(protos)) {
    for (const v of variants) {
      v.leafMat = mats[key];
      v.woodMat = v.bark ? bark[v.bark] : null;
      if (key !== 'bush') list.push(v);
    }
  }
  const imp = bakeImpostors(renderer, list);
  list.forEach((v, i) => { v.cell = imp.cells[i]; });
  return {
    protos,
    impostorGeo: impostorGeometry(),
    impostorMat: impostorMaterial(imp.texture),
  };
}
