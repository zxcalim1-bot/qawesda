import * as THREE from 'three';
import { tex, hasImage } from '../render/assets.js';

// Человек: игрок и все NPC. Капсулы вместо коробок, одежда с фактурой ткани.

const matCache = new Map();
// fabric: 'denim' | 'jersey' | 'plaid' | null
function mat(color, rough = 0.85, fabric = null) {
  const key = `${color}|${rough}|${fabric}`;
  if (!matCache.has(key)) {
    const opts = { color, roughness: rough };
    if (fabric && hasImage(`${fabric}_c`)) {
      const map = tex(`${fabric}_c`).clone();
      map.needsUpdate = true;
      map.repeat.set(fabric === 'plaid' ? 1.5 : 3, fabric === 'plaid' ? 1.5 : 3);
      opts.map = map;
      const nm = tex(`${fabric}_n`).clone();
      nm.needsUpdate = true;
      nm.repeat.copy(map.repeat);
      opts.normalMap = nm;
      // джинса и клетка — свой цвет, трикотаж красим
      if (fabric !== 'jersey') opts.color = new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.55);
    }
    matCache.set(key, new THREE.MeshStandardMaterial(opts));
  }
  return matCache.get(key);
}

function capsule(r, len, color, y = 0, fabric = null, rough = 0.85) {
  const g = new THREE.CapsuleGeometry(r, len, 4, 10);
  g.translate(0, y, 0);
  const m = new THREE.Mesh(g, mat(color, rough, fabric));
  m.castShadow = true;
  return m;
}

function rbox(w, h, d, color, y = 0, rough = 0.8) {
  const g = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
  // скругляем углы: тянем вершины к описанному эллипсоиду
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 1 - 0.18 * (Math.abs(v.x / (w / 2)) * Math.abs(v.y / (h / 2)) + Math.abs(v.y / (h / 2)) * Math.abs(v.z / (d / 2)) + Math.abs(v.x / (w / 2)) * Math.abs(v.z / (d / 2))) / 3;
    p.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeVertexNormals();
  g.translate(0, y, 0);
  const m = new THREE.Mesh(g, mat(color, rough));
  m.castShadow = true;
  return m;
}

const SKIN_ROUGH = 0.55;

export class Humanoid {
  constructor(look = {}) {
    this.look = {
      skin: '#e0b090', shirt: '#4a6a8a', pants: '#2e3440', shoes: '#1e1e1e',
      hair: '#4a3020', hat: 'none', hatColor: '#3a3a3a', beard: false, mustache: false,
      glasses: false, height: 1, belly: 1, coat: false, ...look,
    };
    const L = this.look;
    // ткань по цвету: тёмно-синие штаны — джинсы, рубашки в клетку у мужиков постарше
    const pantsFabric = /^#[23][a-f0-9][3-5][a-f0-9][4-6]/i.test(L.pants) || L.pants === '#2e3440' ? 'denim' : 'jersey';
    const shirtFabric = L.beard || L.mustache ? 'plaid' : 'jersey';
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.body.scale.set(1, L.height, 1);
    this.root.add(this.body);

    const hipY = 0.92;
    this.legs = [];
    for (const x of [-0.1, 0.1]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, hipY, 0);
      const thigh = capsule(0.085, 0.36, L.pants, -0.24, pantsFabric);
      const shin = capsule(0.07, 0.38, L.pants, -0.64, pantsFabric);
      const shoe = rbox(0.11, 0.09, 0.27, L.shoes, -0.86, 0.6);
      shoe.position.z = 0.04;
      pivot.add(thigh, shin, shoe);
      this.body.add(pivot);
      this.legs.push(pivot);
    }
    const belly = L.belly;
    // торс: капсула пошире в плечах
    const torsoGeo = new THREE.CapsuleGeometry(0.17, 0.32, 4, 12);
    const tp = torsoGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < tp.count; i++) {
      v.fromBufferAttribute(tp, i);
      const t = (v.y + 0.33) / 0.66; // 0 внизу, 1 у плеч
      const sx = (1.05 + t * 0.35) * (t < 0.5 ? belly : 1);
      const sz = 0.62 * (t < 0.6 ? belly * 1.05 : 1);
      tp.setXYZ(i, v.x * sx, v.y, v.z * sz + (t < 0.5 ? (belly - 1) * 0.06 : 0));
    }
    torsoGeo.computeVertexNormals();
    torsoGeo.translate(0, hipY + 0.3, 0);
    const coatColor = L.coat ? (L.coat === true ? '#2b2b30' : L.coat) : null;
    this.torso = new THREE.Mesh(torsoGeo, mat(coatColor || L.shirt, 0.9, coatColor ? 'denim' : shirtFabric));
    this.torso.castShadow = true;
    this.body.add(this.torso);
    if (L.coat) {
      // полы куртки ниже пояса
      const hem = capsule(0.2 * belly, 0.18, coatColor, hipY - 0.02, 'denim', 0.9);
      hem.scale.set(1.05, 1, 0.68);
      this.body.add(hem);
    }
    const neck = capsule(0.055, 0.06, L.skin, hipY + 0.66, null, SKIN_ROUGH);
    this.body.add(neck);

    this.arms = [];
    const sleeve = coatColor || L.shirt;
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.25, hipY + 0.56, 0);
      const upper = capsule(0.055, 0.24, sleeve, -0.15, coatColor ? 'denim' : shirtFabric, 0.9);
      const lower = capsule(0.047, 0.24, sleeve, -0.43, coatColor ? 'denim' : shirtFabric, 0.9);
      const hand = capsule(0.042, 0.05, L.skin, -0.64, null, SKIN_ROUGH);
      hand.scale.set(0.8, 1, 1.2);
      pivot.add(upper, lower, hand);
      this.body.add(pivot);
      this.arms.push(pivot);
    }

    this.head = new THREE.Group();
    this.head.position.set(0, hipY + 0.8, 0);
    const skin = mat(L.skin, SKIN_ROUGH);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), skin);
    headMesh.scale.set(0.92, 1.12, 1.0);
    headMesh.castShadow = true;
    this.head.add(headMesh);
    // челюсть
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), skin);
    jaw.scale.set(1, 0.8, 1);
    jaw.position.set(0, -0.06, 0.025);
    this.head.add(jaw);
    // уши
    for (const x of [-0.105, 0.105]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), skin);
      ear.scale.set(0.4, 1, 0.7);
      ear.position.set(x, 0.0, 0.0);
      this.head.add(ear);
    }
    // глаза: белок и зрачок, брови
    for (const x of [-0.04, 0.04]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), mat('#e8e4dc', 0.3));
      white.position.set(x, 0.025, 0.098);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), mat('#2a1e14', 0.2));
      pupil.position.set(x, 0.025, 0.112);
      const brow = rbox(0.04, 0.009, 0.012, L.hair === '#9a9a96' ? '#8a8a86' : L.hair, 0);
      brow.position.set(x, 0.052, 0.104);
      brow.rotation.z = x > 0 ? -0.1 : 0.1;
      this.head.add(white, pupil, brow);
    }
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 8), skin);
    nose.rotation.x = Math.PI / 2 + 0.35;
    nose.position.set(0, 0.0, 0.12);
    this.head.add(nose);
    const mouth = rbox(0.04, 0.006, 0.01, '#8a4a40', 0, 0.5);
    mouth.position.set(0, -0.045, 0.105);
    this.head.add(mouth);
    if (L.hat !== 'cap' && L.hat !== 'ushanka' && L.hat !== 'hood') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), mat(L.hair, 0.95));
      hair.position.set(0, 0.015, -0.008);
      hair.scale.set(0.98, 1.12, 1.04);
      this.head.add(hair);
    }
    if (L.beard) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), mat(L.beard === true ? '#9a9a96' : L.beard, 0.95));
      b.position.set(0, -0.045, 0.035);
      b.scale.set(1.1, 1.2, 1);
      this.head.add(b);
    }
    if (L.mustache) {
      const m = rbox(0.075, 0.016, 0.02, L.mustache === true ? L.hair : L.mustache, 0, 0.95);
      m.position.set(0, -0.03, 0.112);
      this.head.add(m);
    }
    if (L.glasses) {
      for (const x of [-0.04, 0.04]) {
        const g = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 16), mat('#202020', 0.3));
        g.position.set(x, 0.025, 0.118);
        this.head.add(g);
      }
    }
    switch (L.hat) {
      case 'cap': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(L.hatColor, 0.9, 'jersey'));
        c.position.y = 0.03;
        const brim = rbox(0.17, 0.015, 0.11, L.hatColor, 0, 0.9);
        brim.position.set(0, 0.035, 0.13);
        brim.rotation.x = 0.12;
        this.head.add(c, brim);
        break;
      }
      case 'ushanka': {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.145, 0.13, 16), mat(L.hatColor, 1));
        c.position.y = 0.11;
        const flapL = rbox(0.03, 0.13, 0.13, L.hatColor, -0.01, 1);
        flapL.position.x = -0.125;
        const flapR = flapL.clone();
        flapR.position.x = 0.125;
        this.head.add(c, flapL, flapR);
        break;
      }
      case 'kerchief': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(L.hatColor, 0.9, 'jersey'));
        c.scale.set(1, 1.1, 1.05);
        this.head.add(c);
        const knot = capsule(0.025, 0.02, L.hatColor, -0.12, 'jersey');
        knot.position.z = -0.03;
        this.head.add(knot);
        break;
      }
      case 'beret': {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.05, 18), mat(L.hatColor, 0.95));
        c.position.y = 0.11;
        c.rotation.z = 0.15;
        this.head.add(c);
        break;
      }
      case 'hood': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(L.hatColor, 0.9, 'denim'));
        c.position.set(0, 0.01, -0.02);
        this.head.add(c);
        break;
      }
      case 'helmet': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(L.hatColor, 0.35));
        c.position.y = 0.02;
        this.head.add(c);
        break;
      }
      default:
    }
    this.head.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.body.add(this.head);

    this.phase = Math.random() * 10;
    this.talk = 0;
    this.sitting = false;
    this.wave = 0;
    this.carry = false;
  }

  setSitting(v) {
    this.sitting = v;
  }

  // speed — м/с
  animate(dt, speed = 0) {
    this.phase += dt * (speed > 0.1 ? 2 + speed * 1.8 : 1.4);
    const p = this.phase;
    if (this.sitting) {
      for (const l of this.legs) l.rotation.x = -1.45;
      this.arms[0].rotation.x = -1.1;
      this.arms[1].rotation.x = -1.1;
      this.arms[0].rotation.z = 0.15;
      this.arms[1].rotation.z = -0.15;
      // таз в начале координат — так проще усаживать
      this.body.position.y = -0.92 * this.look.height;
      return;
    }
    this.body.position.y = 0;
    if (speed > 0.1) {
      const a = Math.sin(p) * Math.min(0.75, 0.25 + speed * 0.12);
      this.legs[0].rotation.x = a;
      this.legs[1].rotation.x = -a;
      this.arms[0].rotation.x = -a * 0.8;
      this.arms[1].rotation.x = a * 0.8;
      this.arms[0].rotation.z = 0.06;
      this.arms[1].rotation.z = -0.06;
      this.body.position.y = Math.abs(Math.cos(p)) * 0.03 * Math.min(1, speed / 3);
    } else {
      for (const l of this.legs) l.rotation.x *= 0.8;
      const breathe = Math.sin(p * 0.9) * 0.02;
      this.arms[0].rotation.x = breathe;
      this.arms[1].rotation.x = -breathe;
      this.arms[0].rotation.z = 0.08;
      this.arms[1].rotation.z = -0.08;
      this.head.rotation.y = Math.sin(p * 0.3) * 0.25;
    }
    if (this.carry) {
      this.arms[0].rotation.x = -1.2;
      this.arms[1].rotation.x = -1.2;
    }
    if (this.talk > 0) {
      this.talk -= dt;
      this.arms[1].rotation.x = -0.6 + Math.sin(p * 3) * 0.35;
      this.arms[1].rotation.z = -0.3;
      this.head.rotation.x = Math.sin(p * 4) * 0.06;
    }
    if (this.wave > 0) {
      this.wave -= dt;
      this.arms[1].rotation.z = -2.6 + Math.sin(p * 6) * 0.3;
      this.arms[1].rotation.x = 0;
    }
  }
}
