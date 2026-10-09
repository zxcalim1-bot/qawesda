import * as THREE from 'three';
import { makeCanvas } from '../world/materials.js';
import { tex, hasImage } from '../render/assets.js';
import { clamp, damp } from '../core/util.js';
import { BASE } from './VehicleConfig.js';

// В модели +X — левый борт (водительский), -X — правый. Так получается из кватерниона физики.
// Начало координат — центр масс.

const WHEEL_POS = {
  wheelFL: [0.69, 1.24], wheelFR: [-0.69, 1.24], wheelRL: [0.69, -1.2], wheelRR: [-0.69, -1.2],
};

// Краска кузова: выгоревший верх, ржавые пятна из фото-текстуры ржавчины, царапины.
// Карта нормалей — бугристая там, где ржавчина.
function bodyTextures(color) {
  const S = 512;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const n = makeCanvas(S, S);
  const nctx = n.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, S, S);
  nctx.fillStyle = 'rgb(128,128,255)';
  nctx.fillRect(0, 0, S, S);
  // неровная выгоревшая краска
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * S, Math.random() * S, 4 + Math.random() * 30, 2 + Math.random() * 14, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const rust = hasImage('rust_c') ? tex('rust_c').image : null;
  const rustN = hasImage('rust_n') ? tex('rust_n').image : null;
  const mask = makeCanvas(S, S);
  const mctx = mask.getContext('2d');
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 4 + Math.random() * (i < 6 ? 34 : 14);
    const g = mctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.85)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g;
    mctx.beginPath();
    // рваный край
    for (let a = 0; a <= 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      const rr = r * (0.6 + Math.random() * 0.5);
      mctx[a ? 'lineTo' : 'moveTo'](x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
    }
    mctx.fill();
  }
  const stamp = (target, img) => {
    const tmp = makeCanvas(S, S);
    const t = tmp.getContext('2d');
    if (img) t.drawImage(img, 0, 0, S, S);
    else { t.fillStyle = '#7a3a1a'; t.fillRect(0, 0, S, S); }
    t.globalCompositeOperation = 'destination-in';
    t.drawImage(mask, 0, 0);
    target.drawImage(tmp, 0, 0);
  };
  stamp(ctx, rust);
  stamp(nctx, rustN);
  // царапины до металла
  ctx.strokeStyle = 'rgba(210,210,205,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    const x = Math.random() * S, y = Math.random() * S;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 90, y + (Math.random() - 0.5) * 10);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const tn = new THREE.CanvasTexture(n);
  tn.colorSpace = THREE.NoColorSpace;
  // маска ржавчины — для шероховатости (ржавчина матовая, краска с остатками лака)
  const rough = makeCanvas(S, S);
  const rctx = rough.getContext('2d');
  rctx.fillStyle = 'rgb(0,95,0)';
  rctx.fillRect(0, 0, S, S);
  const tmp = makeCanvas(S, S);
  const tc = tmp.getContext('2d');
  tc.fillStyle = 'rgb(0,240,0)';
  tc.fillRect(0, 0, S, S);
  tc.globalCompositeOperation = 'destination-in';
  tc.drawImage(mask, 0, 0);
  rctx.drawImage(tmp, 0, 0);
  const tr = new THREE.CanvasTexture(rough);
  tr.colorSpace = THREE.NoColorSpace;
  return { map: t, normal: tn, rough: tr };
}

// протектор и боковина шины
function tireTextures() {
  const W = 512, H = 64;
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, W, H);
  // поперечные ламели и продольные канавки — рисуем «склоны» в нормалях
  for (let x = 0; x < W; x += 16) {
    ctx.fillStyle = 'rgb(70,128,230)';
    ctx.fillRect(x, 8, 3, H - 16);
    ctx.fillStyle = 'rgb(186,128,230)';
    ctx.fillRect(x + 3, 8, 3, H - 16);
  }
  for (const y of [H * 0.33, H * 0.66]) {
    ctx.fillStyle = 'rgb(128,70,230)';
    ctx.fillRect(0, y - 3, W, 3);
    ctx.fillStyle = 'rgb(128,186,230)';
    ctx.fillRect(0, y, W, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function crackedGlassTexture(level) {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(30,45,55,1)';
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = 'rgba(230,240,245,0.85)';
  ctx.lineWidth = 1.2;
  const cx = S * (0.3 + Math.random() * 0.4), cy = S * (0.3 + Math.random() * 0.4);
  const rays = level > 1 ? 22 : 9;
  for (let i = 0; i < rays; i++) {
    let x = cx, y = cy;
    const a = (i / rays) * Math.PI * 2 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += Math.cos(a + (Math.random() - 0.5) * 0.6) * 25;
      y += Math.sin(a + (Math.random() - 0.5) * 0.6) * 25;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  if (level > 1) {
    for (let r = 20; r < 140; r += 25) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.random() * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function plateTexture() {
  const c = makeCanvas(256, 64);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e6dc';
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, 250, 58);
  ctx.fillStyle = '#111';
  ctx.font = 'bold 40px "Arial Narrow", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Л 019 АС 86', 128, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// грязь: снизу больше, параметр uDirt 0..1
function patchDirt(mat, uniforms) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDirt = uniforms.uDirt;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vLY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLY = (modelMatrix * vec4(transformed,1.0)).y - (modelMatrix * vec4(0.0,0.0,0.0,1.0)).y;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLY;\nuniform float uDirt;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float dk = uDirt * (0.25 + smoothstep(0.35, -0.45, vLY) * 0.9);
        float spot = fract(sin(dot(floor(gl_FragCoord.xy / 3.0), vec2(12.9898, 78.233))) * 43758.5453);
        dk *= 0.8 + spot * 0.4;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.12, 0.08), clamp(dk, 0.0, 0.92));`,
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 1.0, clamp(uDirt * 0.8, 0.0, 1.0));');
  };
  mat.customProgramCacheKey = () => 'car-dirt';
}

export class VehicleModel {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'lastochka';
    scene.add(this.root);
    this.dirtU = { uDirt: { value: 0.15 } };

    const color = opts.color ?? '#3f8f8c';
    const body = bodyTextures(color);
    this.bodyMat = new THREE.MeshPhysicalMaterial({
      map: body.map,
      normalMap: body.normal,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: body.rough,
      roughness: 1,
      metalness: 0,
      clearcoat: 0.45,
      clearcoatRoughness: 0.35,
    });
    patchDirt(this.bodyMat, this.dirtU);
    this.chromeMat = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.18, metalness: 1 });
    patchDirt(this.chromeMat, this.dirtU);
    this.darkMat = new THREE.MeshStandardMaterial({ color: 0x141516, roughness: 0.75 });
    this.rubberMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.9 });
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a262c, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.42, envMapIntensity: 1.8, clearcoat: 1, clearcoatRoughness: 0.02,
    });
    this.glassCrack1 = new THREE.MeshStandardMaterial({ map: crackedGlassTexture(1), roughness: 0.2, transparent: true, opacity: 0.7 });
    this.glassCrack2 = new THREE.MeshStandardMaterial({ map: crackedGlassTexture(2), roughness: 0.3, transparent: true, opacity: 0.8 });
    const tread = tireTextures();
    tread.repeat.set(1, 1);
    this.tireMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.92, normalMap: tread, normalScale: new THREE.Vector2(1.5, 1.5) });
    patchDirt(this.tireMat, this.dirtU);
    this.rimMat = new THREE.MeshStandardMaterial({ color: 0x8a8e90, roughness: 0.35, metalness: 0.85 });
    patchDirt(this.rimMat, this.dirtU);
    this.headMatL = new THREE.MeshPhysicalMaterial({ color: 0xdddddd, emissive: 0xfff2d0, emissiveIntensity: 0, roughness: 0.05, metalness: 0.2, clearcoat: 1 });
    this.headMatR = this.headMatL.clone();
    this.tailMat = new THREE.MeshPhysicalMaterial({ color: 0x5a0808, emissive: 0xff2010, emissiveIntensity: 0.05, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92 });
    this.amberMat = new THREE.MeshPhysicalMaterial({ color: 0x8a5010, emissive: 0xff8a10, emissiveIntensity: 0.02, roughness: 0.1, clearcoat: 1 });
    this.interiorMat = new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.9 });
    if (hasImage('jersey_c')) {
      const fab = tex('jersey_c');
      this.interiorMat = new THREE.MeshStandardMaterial({ map: fab, color: 0x7a5a48, roughness: 0.95 });
    }

    this.parts = {}; // id -> Object3D (для отваливания)
    this.dentables = [];
    this._build();

    // фары
    this.lights = [];
    for (const x of [0.55, -0.55]) {
      const l = new THREE.SpotLight(0xfff0d0, 0, 70, 0.5, 0.45, 1.2);
      l.position.set(x, 0.05, 2.05);
      l.target.position.set(x * 1.5, -1.2, 22);
      this.root.add(l, l.target);
      this.lights.push(l);
    }
    this.hoodAngle = 0;
    this.trunkAngle = 0;
    this.time = 0;
  }

  _mesh(geo, mat, parent = this.root, dentable = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    if (dentable && mat !== this.glassMat) {
      this.dentables.push(m);
      geo.userData.orig = geo.attributes.position.array.slice();
    }
    return m;
  }

  _box(w, h, d, seg = [1, 1, 1]) {
    return new THREE.BoxGeometry(w, h, d, seg[0], seg[1], seg[2]);
  }

  _build() {
    const R = this.root;
    const W = 1.62;
    // центральная часть кузова между колёсами
    const mid = this._box(W, 0.62, 1.7, [6, 3, 8]);
    mid.translate(0, -0.09, 0);
    this.bodyMid = this._mesh(mid, this.bodyMat);
    // передняя часть над колёсами
    const front = this._box(W, 0.34, 1.15, [6, 2, 6]);
    front.translate(0, 0.05, 1.42);
    this.bodyFront = this._mesh(front, this.bodyMat);
    const apronF = this._box(W - 0.1, 0.22, 0.38, [4, 1, 2]);
    apronF.translate(0, -0.22, 1.82);
    this._mesh(apronF, this.bodyMat);
    // задняя
    const rear = this._box(W, 0.34, 1.15, [6, 2, 6]);
    rear.translate(0, 0.05, -1.42);
    this.bodyRear = this._mesh(rear, this.bodyMat);
    const apronR = this._box(W - 0.1, 0.22, 0.38, [4, 1, 2]);
    apronR.translate(0, -0.22, -1.82);
    this._mesh(apronR, this.bodyMat);
    // подкрылки — тёмные, чтобы колёса не «висели»
    for (const [x, z] of Object.values(WHEEL_POS)) {
      const g = this._box(0.3, 0.05, 0.75);
      g.translate(x * 0.98, -0.06, z);
      this._mesh(g, this.darkMat, R, false);
    }

    // салон: трапеция
    const cab = new THREE.BufferGeometry();
    const b0 = 0.22, t0 = 0.8;
    const bx = 0.79, tx = 0.66;
    const bzf = 0.95, bzr = -1.15, tzf = 0.42, tzr = -0.82;
    const v = [
      [-bx, b0, bzr], [bx, b0, bzr], [bx, b0, bzf], [-bx, b0, bzf],
      [-tx, t0, tzr], [tx, t0, tzr], [tx, t0, tzf], [-tx, t0, tzf],
    ];
    const faces = [
      [4, 5, 6, 7], // крыша
      [3, 2, 6, 7], // лобовое
      [1, 0, 4, 5], // заднее
      [2, 1, 5, 6], // левый бок (+X)
      [0, 3, 7, 4], // правый бок
    ];
    const pos = [];
    for (const f of faces) {
      const [a, b, c, d] = f.map((i) => v[i]);
      pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
    cab.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    cab.computeVertexNormals();
    // проверяем, чтобы нормали смотрели наружу (иначе переворачиваем)
    this._fixWinding(cab, new THREE.Vector3(0, 0.5, -0.2));
    this.cabin = this._mesh(cab, this.bodyMat, R, false);

    // стёкла — чуть наружу от граней салона, с отступом под стойки
    const glassQuad = (a, b, c, d, inset = 0.08, out = 0.012) => {
      const center = new THREE.Vector3().add(a).add(b).add(c).add(d).multiplyScalar(0.25);
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a)).normalize();
      const pts = [a, b, c, d].map((p) => p.clone().lerp(center, inset * 2).addScaledVector(n, out));
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[3]], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
      g.computeVertexNormals();
      return g;
    };
    const V = v.map((p) => new THREE.Vector3(...p));
    // лобовое
    this.windshield = this._mesh(glassQuad(V[3], V[2], V[6], V[7], 0.06), this.glassMat, R, false);
    this._fixWinding(this.windshield.geometry, new THREE.Vector3(0, 0.5, -0.2));
    const rearG = this._mesh(glassQuad(V[1], V[0], V[4], V[5], 0.08), this.glassMat, R, false);
    this._fixWinding(rearG.geometry, new THREE.Vector3(0, 0.5, -0.2));
    const sideL = this._mesh(glassQuad(V[2], V[1], V[5], V[6], 0.1), this.glassMat, R, false);
    this._fixWinding(sideL.geometry, new THREE.Vector3(0, 0.5, -0.2));
    const sideR = this._mesh(glassQuad(V[0], V[3], V[7], V[4], 0.1), this.glassMat, R, false);
    this._fixWinding(sideR.geometry, new THREE.Vector3(0, 0.5, -0.2));

    // салон внутри: сиденья, торпедо, руль
    const dash = this._box(1.4, 0.18, 0.3);
    dash.translate(0, 0.3, 0.8);
    this._mesh(dash, this.darkMat, R, false);
    for (const x of [0.38, -0.38]) {
      const seat = this._box(0.5, 0.3, 0.5);
      seat.translate(x, -0.3, -0.05);
      this._mesh(seat, this.interiorMat, R, false);
      const back = this._box(0.5, 0.65, 0.12);
      back.translate(x, 0.08, -0.36);
      this._mesh(back, this.interiorMat, R, false);
    }
    const rearSeat = this._box(1.3, 0.3, 0.5);
    rearSeat.translate(0, -0.3, -0.85);
    this._mesh(rearSeat, this.interiorMat, R, false);
    const sw = new THREE.TorusGeometry(0.17, 0.025, 6, 16);
    this.steeringWheel = new THREE.Mesh(sw, this.darkMat);
    this.steeringWheel.position.set(0.38, 0.38, 0.6);
    this.steeringWheel.rotation.x = -0.5;
    R.add(this.steeringWheel);

    // капот — на шарнире у лобового стекла
    this.hoodPivot = new THREE.Group();
    this.hoodPivot.position.set(0, 0.235, 0.92);
    R.add(this.hoodPivot);
    const hood = this._box(W - 0.06, 0.04, 1.12, [6, 1, 6]);
    hood.translate(0, 0, 0.56);
    this.parts.hood = this._mesh(hood, this.bodyMat, this.hoodPivot);
    this.parts.hood.userData.pivot = this.hoodPivot;
    // моторный отсек (видно при открытом капоте)
    const engine = this._box(0.7, 0.3, 0.6);
    engine.translate(0, 0.08, 1.4);
    this.engineBlock = this._mesh(engine, new THREE.MeshStandardMaterial({ color: 0x3a3e40, roughness: 0.6, metalness: 0.6 }), R, false);
    const radiator = this._box(1.1, 0.3, 0.06);
    radiator.translate(0, 0.06, 1.92);
    this._mesh(radiator, this.darkMat, R, false);
    const batt = this._box(0.25, 0.2, 0.17);
    batt.translate(-0.5, 0.16, 1.25);
    this._mesh(batt, new THREE.MeshStandardMaterial({ color: 0x202833, roughness: 0.7 }), R, false);

    // крышка багажника
    this.trunkPivot = new THREE.Group();
    this.trunkPivot.position.set(0, 0.235, -1.18);
    R.add(this.trunkPivot);
    const trunk = this._box(W - 0.06, 0.04, 0.86, [6, 1, 4]);
    trunk.translate(0, 0, -0.43);
    this.parts.trunk = this._mesh(trunk, this.bodyMat, this.trunkPivot);
    this.parts.trunk.userData.pivot = this.trunkPivot;

    // двери (+X — левая, водительская)
    for (const [id, x] of [['doorL', 1], ['doorR', -1]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x * 0.815, 0, 0.85);
      R.add(pivot);
      const g = this._box(0.035, 0.56, 1.42, [1, 3, 6]);
      g.translate(0, -0.1, -0.71);
      const door = this._mesh(g, this.bodyMat, pivot);
      const handle = this._box(0.03, 0.03, 0.14);
      handle.translate(x * 0.025, 0.08, -1.15);
      this._mesh(handle, this.chromeMat, door, false);
      door.userData.pivot = pivot;
      door.userData.side = x;
      this.parts[id] = door;
    }

    // бамперы
    const bf = this._box(1.7, 0.12, 0.12, [6, 1, 1]);
    bf.translate(0, -0.14, 2.08);
    this.parts.bumperF = this._mesh(bf, this.chromeMat);
    const br = this._box(1.7, 0.12, 0.12, [6, 1, 1]);
    br.translate(0, -0.14, -2.08);
    this.parts.bumperR = this._mesh(br, this.chromeMat);

    // решётка и фары
    const grille = this._box(0.75, 0.16, 0.04);
    grille.translate(0, 0.04, 2.0);
    this._mesh(grille, this.darkMat, R, false);
    for (const [id, x, mat] of [['headlightL', 0.55, this.headMatL], ['headlightR', -0.55, this.headMatR]]) {
      const g = new THREE.CylinderGeometry(0.095, 0.095, 0.06, 16);
      g.rotateX(Math.PI / 2);
      g.translate(x, 0.04, 2.0);
      const m = this._mesh(g, mat, R, false);
      const rim = new THREE.TorusGeometry(0.1, 0.015, 6, 16);
      rim.translate(x, 0.04, 2.03);
      this._mesh(rim, this.chromeMat, R, false);
      this.parts[id] = m;
    }
    for (const x of [0.6, -0.6]) {
      const g = this._box(0.26, 0.1, 0.04);
      g.translate(x, 0.06, -2.01);
      this._mesh(g, this.tailMat, R, false);
    }
    // номера
    const plateMat = new THREE.MeshStandardMaterial({ map: plateTexture(), roughness: 0.6 });
    for (const [z, rot] of [[2.15, 0], [-2.15, Math.PI]]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.105), plateMat);
      p.position.set(0, -0.14, z);
      p.rotation.y = rot;
      R.add(p);
    }

    // зеркала
    for (const [id, x] of [['mirrorL', 1], ['mirrorR', -1]]) {
      const g = new THREE.Group();
      g.position.set(x * 0.86, 0.3, 0.82);
      const stalk = this._box(0.12, 0.03, 0.03);
      stalk.translate(x * -0.04, 0, 0);
      const s = new THREE.Mesh(stalk, this.chromeMat);
      const head = this._box(0.06, 0.09, 0.14);
      head.translate(x * 0.03, 0.03, 0);
      const h = new THREE.Mesh(head, this.chromeMat);
      s.castShadow = h.castShadow = true;
      g.add(s, h);
      R.add(g);
      this.parts[id] = g;
    }

    // глушитель
    const ex = new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8);
    ex.rotateX(Math.PI / 2);
    ex.translate(-0.45, -0.38, -2.0);
    this.parts.exhaust = this._mesh(ex, this.chromeMat, R, false);

    // колёса: шина — тело вращения с профилем, диск со штамповкой, колпак
    this.wheelGroups = {};
    const R0 = BASE.wheelRadius, rimR = 0.175, halfW = 0.095;
    const profile = [];
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      // боковина скруглена, протектор почти плоский
      const y = -Math.cos(a) * halfW;
      const r = rimR + (R0 - rimR) * Math.pow(Math.sin(a), 0.35);
      profile.push(new THREE.Vector2(r, y));
    }
    const tireGeo = new THREE.LatheGeometry(profile, 36);
    tireGeo.rotateZ(Math.PI / 2);
    const rimProfile = [
      new THREE.Vector2(0.02, -0.07), new THREE.Vector2(0.08, -0.075), new THREE.Vector2(0.12, -0.06),
      new THREE.Vector2(0.15, -0.05), new THREE.Vector2(rimR - 0.005, -0.06), new THREE.Vector2(rimR + 0.008, -0.085),
      new THREE.Vector2(rimR + 0.008, 0.08), new THREE.Vector2(rimR - 0.01, 0.08),
    ];
    const rimGeo = new THREE.LatheGeometry(rimProfile, 24);
    rimGeo.rotateZ(Math.PI / 2);
    const capGeo = new THREE.SphereGeometry(0.085, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.35);
    capGeo.rotateZ(-Math.PI / 2);
    capGeo.translate(-0.065, 0, 0);
    for (const [id, [x, z]] of Object.entries(WHEEL_POS)) {
      const pivot = new THREE.Group(); // руль
      pivot.position.set(x, -0.37, z);
      const spin = new THREE.Group();
      pivot.add(spin);
      const side = x > 0 ? 1 : -1;
      const t = new THREE.Mesh(tireGeo, this.tireMat);
      t.castShadow = true;
      t.receiveShadow = true;
      spin.add(t);
      const r = new THREE.Mesh(rimGeo, this.rimMat);
      r.scale.x = side;
      r.castShadow = true;
      spin.add(r);
      const cap = new THREE.Mesh(capGeo, this.chromeMat);
      cap.scale.x = side;
      spin.add(cap);
      // болты — видно, что колесо крутится
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6).rotateZ(Math.PI / 2), this.chromeMat);
        b.position.set(side * 0.075, Math.cos(a) * 0.115, Math.sin(a) * 0.115);
        spin.add(b);
      }
      R.add(pivot);
      this.wheelGroups[id] = { pivot, spin, tire: t };
      this.parts[id] = pivot;
    }

    // детали кузова: колёсные арки, хромированные молдинги, щели дверей, решётка, дворники, антенна
    const arch = new THREE.CylinderGeometry(0.36, 0.36, 0.02, 20, 1, false, 0, Math.PI);
    arch.rotateZ(Math.PI / 2);
    for (const [x, z] of Object.values(WHEEL_POS)) {
      const m = new THREE.Mesh(arch, this.darkMat);
      m.position.set(x > 0 ? W / 2 + 0.004 : -W / 2 - 0.004, -0.39, z);
      R.add(m);
    }
    for (const side of [-1, 1]) {
      // молдинг вдоль борта
      const strip = new THREE.Mesh(this._box(0.012, 0.025, 4.0), this.chromeMat);
      strip.position.set(side * (W / 2 + 0.006), -0.02, 0);
      R.add(strip);
      // водосток над дверями
      const gutter = new THREE.Mesh(this._box(0.02, 0.02, 1.2), this.chromeMat);
      gutter.position.set(side * 0.665, 0.79, -0.2);
      R.add(gutter);
      // щель между передним крылом и дверью и за дверью
      for (const z of [0.87, -0.6]) {
        const seam = new THREE.Mesh(this._box(0.006, 0.6, 0.012), this.darkMat);
        seam.position.set(side * (W / 2 + 0.003), -0.1, z);
        R.add(seam);
      }
      // брызговик
      const flap = new THREE.Mesh(this._box(0.02, 0.22, 0.25), this.rubberMat);
      flap.position.set(side * 0.7, -0.52, -1.52);
      R.add(flap);
    }
    // решётка радиатора: рамка и горизонтальные ламели
    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(this._box(0.78, 0.012, 0.02), this.chromeMat);
      slat.position.set(0, -0.025 + i * 0.03, 2.025);
      R.add(slat);
    }
    // поворотники
    for (const x of [0.66, -0.66]) {
      const g = new THREE.Mesh(this._box(0.12, 0.05, 0.03), this.amberMat);
      g.position.set(x, -0.08, 2.03);
      R.add(g);
    }
    // дворники
    for (const x of [0.32, -0.22]) {
      const wiper = new THREE.Mesh(this._box(0.012, 0.012, 0.45), this.darkMat);
      wiper.position.set(x, 0.26, 0.92);
      wiper.rotation.set(-0.4, 0, 1.25);
      R.add(wiper);
    }
    // антенна
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.9, 5), this.chromeMat);
    ant.position.set(0.72, 0.62, 1.0);
    ant.rotation.x = -0.25;
    R.add(ant);
    // уплотнители стёкол
    for (const [a, b] of [[V[3], V[2]], [V[2], V[6]], [V[6], V[7]], [V[7], V[3]], [V[1], V[0]], [V[0], V[4]], [V[4], V[5]], [V[5], V[1]]]) {
      const len = a.distanceTo(b);
      const g = new THREE.CylinderGeometry(0.012, 0.012, len, 5);
      const m = new THREE.Mesh(g, this.chromeMat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(b, a).normalize());
      R.add(m);
    }

    // улучшения
    this.roofRack = new THREE.Group();
    for (const z of [-0.6, 0.2]) {
      const g = this._box(1.3, 0.04, 0.04);
      g.translate(0, 0.9, z);
      this.roofRack.add(new THREE.Mesh(g, this.darkMat));
    }
    for (const x of [-0.62, 0.62]) {
      const g = this._box(0.04, 0.04, 1.0);
      g.translate(x, 0.92, -0.2);
      this.roofRack.add(new THREE.Mesh(g, this.darkMat));
    }
    const can = this._box(0.35, 0.25, 0.5);
    can.translate(0.3, 1.05, -0.3);
    this.roofRack.add(new THREE.Mesh(can, new THREE.MeshStandardMaterial({ color: 0x6b8a3a, roughness: 0.7 })));
    this.roofRack.visible = false;
    R.add(this.roofRack);

    this.bullbar = new THREE.Group();
    for (const x of [-0.5, 0.5]) {
      const g = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6);
      g.translate(x, 0.0, 2.22);
      this.bullbar.add(new THREE.Mesh(g, this.darkMat));
    }
    const top = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6);
    top.rotateZ(Math.PI / 2);
    top.translate(0, 0.25, 2.24);
    this.bullbar.add(new THREE.Mesh(top, this.darkMat));
    this.bullbar.visible = false;
    R.add(this.bullbar);

    this.root.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
  }

  _fixWinding(geo, inside) {
    const p = geo.attributes.position;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i);
      b.fromBufferAttribute(p, i + 1);
      c.fromBufferAttribute(p, i + 2);
      n.subVectors(b, a).cross(c.clone().sub(a));
      const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
      if (n.dot(center.sub(inside)) < 0) {
        // меняем местами b и c
        p.setXYZ(i + 1, c.x, c.y, c.z);
        p.setXYZ(i + 2, b.x, b.y, b.z);
      }
    }
    geo.computeVertexNormals();
  }

  // вмятина: точка и направление в мировых координатах
  dent(worldPoint, worldDir, amount) {
    const inv = new THREE.Matrix4();
    const lp = new THREE.Vector3(), ld = new THREE.Vector3();
    const v = new THREE.Vector3();
    const R = 0.35 + amount * 0.25;
    const depth = Math.min(0.14, amount * 0.07);
    for (const m of this.dentables) {
      if (!m.parent) continue;
      m.updateWorldMatrix(true, false);
      inv.copy(m.matrixWorld).invert();
      lp.copy(worldPoint).applyMatrix4(inv);
      ld.copy(worldDir).transformDirection(inv);
      const pos = m.geometry.attributes.position;
      const orig = m.geometry.userData.orig;
      let changed = false;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const d = v.distanceTo(lp);
        if (d > R) continue;
        const k = (1 - d / R) ** 2 * depth;
        v.addScaledVector(ld, k);
        // не даём уехать слишком далеко от исходной формы
        if (orig) {
          const ox = orig[i * 3], oy = orig[i * 3 + 1], oz = orig[i * 3 + 2];
          const dx = v.x - ox, dy = v.y - oy, dz = v.z - oz;
          const len = Math.hypot(dx, dy, dz);
          if (len > 0.22) v.set(ox + (dx / len) * 0.22, oy + (dy / len) * 0.22, oz + (dz / len) * 0.22);
        }
        pos.setXYZ(i, v.x, v.y, v.z);
        changed = true;
      }
      if (changed) {
        pos.needsUpdate = true;
        m.geometry.computeVertexNormals();
      }
    }
  }

  // вернуть форму (после ремонта кузова)
  undent() {
    for (const m of this.dentables) {
      const orig = m.geometry.userData.orig;
      if (!orig) continue;
      m.geometry.attributes.position.array.set(orig);
      m.geometry.attributes.position.needsUpdate = true;
      m.geometry.computeVertexNormals();
    }
  }

  // снять деталь с машины и вернуть объект для обломка (в мировых координатах)
  detach(id) {
    const obj = this.parts[id];
    if (!obj || !obj.parent || obj.userData.detached) return null;
    this.root.updateWorldMatrix(true, true);
    const world = new THREE.Matrix4().copy(obj.matrixWorld);
    obj.removeFromParent();
    obj.userData.detached = true;
    // клон уходит в мир, а на машине деталь просто пропадает
    const clone = obj.clone(true);
    clone.matrixAutoUpdate = true;
    world.decompose(clone.position, clone.quaternion, clone.scale);
    if (id.startsWith('wheel')) this.wheelGroups[id].detached = true;
    return clone;
  }

  reattach(id) {
    const obj = this.parts[id];
    if (!obj || !obj.userData.detached) return;
    const parent = obj.userData.pivot || this.root;
    parent.add(obj);
    obj.userData.detached = false;
    if (id.startsWith('wheel')) this.wheelGroups[id].detached = false;
  }

  syncDetached(damage) {
    for (const id of Object.keys(this.parts)) {
      if (!damage.parts[id]) continue;
      const det = damage.parts[id].detached;
      if (det && !this.parts[id].userData.detached) {
        this.parts[id].removeFromParent();
        this.parts[id].userData.detached = true;
        if (this.wheelGroups[id]) this.wheelGroups[id].detached = true;
      } else if (!det && this.parts[id].userData.detached) {
        this.reattach(id);
      }
    }
  }

  update(dt, car) {
    this.time += dt;
    const R = this.root;
    R.position.copy(car.pos);
    R.quaternion.copy(car.quat);

    // колёса
    const sus = car.config.level('suspension');
    const restLen = BASE.restLength + sus.lift;
    for (const w of car.wheels) {
      const g = this.wheelGroups[w.id];
      if (!g || g.detached) continue;
      const comp = w.contact ? w.comp : 0;
      g.pivot.position.y = BASE.mountY - (restLen - comp);
      if (car.damage.flat[w.index]) {
        g.pivot.position.y += 0.06;
        g.tire.scale.set(1, 0.82, 1);
      } else g.tire.scale.set(1, 1, 1);
      g.pivot.rotation.y = w.front ? car.steerAngle * -1 : 0;
      g.spin.rotation.x = w.angle;
    }
    this.steeringWheel.rotation.z = car.steerAngle * 2.5;

    // состояние деталей: висящий бампер, приоткрытые двери и т.п.
    const dmg = car.damage;
    const sag = (id) => 1 - dmg.hp(id) / 100;
    if (!this.parts.bumperF.userData.detached) {
      const s = sag('bumperF');
      this.parts.bumperF.rotation.z = s > 0.5 ? (s - 0.5) * 0.35 : 0;
      this.parts.bumperF.position.y = s > 0.6 ? -(s - 0.6) * 0.2 : 0;
    }
    if (!this.parts.bumperR.userData.detached) {
      const s = sag('bumperR');
      this.parts.bumperR.rotation.z = s > 0.5 ? -(s - 0.5) * 0.3 : 0;
    }
    for (const id of ['doorL', 'doorR']) {
      const d = this.parts[id];
      if (d.userData.detached) continue;
      const s = sag(id);
      const side = d.userData.side;
      const flap = s > 0.75 ? Math.sin(this.time * 3) * 0.05 * Math.min(1, car.vel.length() / 8) : 0;
      d.userData.pivot.rotation.y = side * (s > 0.5 ? (s - 0.5) * 0.18 + flap : 0);
    }
    // капот / багажник открываются при ремонте или подпрыгивают, если замок убит
    const hoodTarget = car.hoodOpen ? 1.1 : sag('hood') > 0.7 ? 0.08 + Math.abs(Math.sin(this.time * 6)) * 0.04 * Math.min(1, car.vel.length() / 10) : 0;
    this.hoodAngle = damp(this.hoodAngle, hoodTarget, 6, dt);
    this.hoodPivot.rotation.x = -this.hoodAngle;
    const trunkTarget = car.trunkOpen ? 1.2 : sag('trunk') > 0.75 ? 0.1 : 0;
    this.trunkAngle = damp(this.trunkAngle, trunkTarget, 6, dt);
    this.trunkPivot.rotation.x = this.trunkAngle;
    for (const id of ['mirrorL', 'mirrorR']) {
      const m = this.parts[id];
      if (!m.userData.detached) m.rotation.z = sag(id) > 0.6 ? (sag(id) - 0.6) * 1.5 : 0;
    }

    // стекло
    const glass = dmg.hp('glass');
    const gm = glass > 60 ? this.glassMat : glass > 20 ? this.glassCrack1 : this.glassCrack2;
    if (this.windshield.material !== gm) this.windshield.material = gm;
    this.windshield.visible = glass > 1;

    // фары
    const charge = dmg.fluids.charge;
    const powered = car.lightsOn && charge > 0.02;
    const lhp = dmg.hp('headlightL'), rhp = dmg.hp('headlightR');
    const flick = (hp) => (hp < 30 ? (Math.sin(this.time * 37 + hp) > 0.2 ? 1 : 0.3) : 1);
    const lOn = powered && lhp > 12 ? flick(lhp) * clamp(charge * 3, 0.3, 1) : 0;
    const rOn = powered && rhp > 12 ? flick(rhp) * clamp(charge * 3, 0.3, 1) : 0;
    this.headMatL.emissiveIntensity = lOn * 3;
    this.headMatR.emissiveIntensity = rOn * 3;
    this.lights[0].intensity = lOn * 260;
    this.lights[1].intensity = rOn * 260;
    const braking = car.controls.brake > 0.1 && car.engine.gear >= 0;
    this.tailMat.emissiveIntensity = (braking ? 2.5 : 0) + (car.lightsOn ? 0.6 : 0.05);

    this.dirtU.uDirt.value = car.dirt;
    this.roofRack.visible = car.config.levels.roofrack > 0;
    this.bullbar.visible = car.config.levels.bullbar > 0;
  }

  // точка капота/выхлопа в мире — для дыма
  engineBayWorld(out) {
    return out.set(0, 0.35, 1.5).applyMatrix4(this.root.matrixWorld);
  }

  exhaustWorld(out) {
    return out.set(-0.45, -0.38, -2.2).applyMatrix4(this.root.matrixWorld);
  }

  setVisible(v) {
    this.root.visible = v;
  }
}
