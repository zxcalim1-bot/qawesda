import * as THREE from 'three';

// Человечек из коробочек. Им собраны и игрок, и все NPC.

const matCache = new Map();
function mat(color, rough = 0.85) {
  const key = color + rough;
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough }));
  return matCache.get(key);
}

function box(w, h, d, color, y = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, y, 0);
  const m = new THREE.Mesh(g, mat(color));
  m.castShadow = true;
  return m;
}

export class Humanoid {
  constructor(look = {}) {
    this.look = {
      skin: '#e0b090', shirt: '#4a6a8a', pants: '#2e3440', shoes: '#1e1e1e',
      hair: '#4a3020', hat: 'none', hatColor: '#3a3a3a', beard: false, mustache: false,
      glasses: false, height: 1, belly: 1, coat: false, ...look,
    };
    const L = this.look;
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.body.scale.set(1, L.height, 1);
    this.root.add(this.body);

    const hipY = 0.92;
    this.legs = [];
    for (const x of [-0.11, 0.11]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, hipY, 0);
      const leg = box(0.16, 0.82, 0.18, L.pants, -0.41);
      const shoe = box(0.17, 0.1, 0.27, L.shoes, -0.84);
      shoe.position.z = 0.04;
      pivot.add(leg, shoe);
      this.body.add(pivot);
      this.legs.push(pivot);
    }
    const torsoW = 0.48 * L.belly;
    this.torso = box(torsoW, 0.6, 0.27 * L.belly, L.shirt, hipY + 0.3);
    this.body.add(this.torso);
    if (L.coat) {
      const coat = box(torsoW + 0.06, 0.9, 0.3 * L.belly + 0.04, L.coat === true ? '#2b2b30' : L.coat, hipY + 0.12);
      this.body.add(coat);
    }
    this.arms = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * (torsoW / 2 + 0.07), hipY + 0.56, 0);
      const arm = box(0.12, 0.6, 0.13, L.coat ? (L.coat === true ? '#2b2b30' : L.coat) : L.shirt, -0.3);
      const hand = box(0.1, 0.1, 0.1, L.skin, -0.63);
      pivot.add(arm, hand);
      this.body.add(pivot);
      this.arms.push(pivot);
    }
    this.head = new THREE.Group();
    this.head.position.set(0, hipY + 0.78, 0);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), mat(L.skin, 0.7));
    headMesh.scale.set(1, 1.12, 1);
    headMesh.castShadow = true;
    this.head.add(headMesh);
    // глаза
    for (const x of [-0.05, 0.05]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), mat('#1a1a1a', 0.3));
      e.position.set(x, 0.03, 0.125);
      this.head.add(e);
    }
    const nose = box(0.04, 0.06, 0.05, L.skin, 0);
    nose.position.set(0, -0.01, 0.14);
    this.head.add(nose);
    if (L.hat !== 'cap' && L.hat !== 'ushanka' && L.hat !== 'hood') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(L.hair));
      hair.position.y = 0.02;
      hair.scale.set(1.02, 1.1, 1.02);
      this.head.add(hair);
    }
    if (L.beard) {
      const b = box(0.2, 0.14, 0.1, L.beard === true ? '#9a9a96' : L.beard, 0);
      b.position.set(0, -0.11, 0.08);
      this.head.add(b);
    }
    if (L.mustache) {
      const m = box(0.14, 0.03, 0.04, L.mustache === true ? L.hair : L.mustache, 0);
      m.position.set(0, -0.045, 0.135);
      this.head.add(m);
    }
    if (L.glasses) {
      for (const x of [-0.055, 0.055]) {
        const g = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 10), mat('#202020', 0.4));
        g.position.set(x, 0.03, 0.14);
        this.head.add(g);
      }
    }
    switch (L.hat) {
      case 'cap': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(L.hatColor));
        c.position.y = 0.03;
        const brim = box(0.2, 0.02, 0.14, L.hatColor, 0);
        brim.position.set(0, 0.04, 0.15);
        this.head.add(c, brim);
        break;
      }
      case 'ushanka': {
        const c = box(0.32, 0.16, 0.32, L.hatColor, 0.13);
        const flapL = box(0.04, 0.16, 0.18, L.hatColor, -0.02);
        flapL.position.x = -0.15;
        const flapR = flapL.clone();
        flapR.position.x = 0.15;
        this.head.add(c, flapL, flapR);
        break;
      }
      case 'kerchief': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), mat(L.hatColor));
        c.position.y = 0.0;
        this.head.add(c);
        const knot = box(0.06, 0.06, 0.06, L.hatColor, -0.12);
        knot.position.z = -0.05;
        this.head.add(knot);
        break;
      }
      case 'beret': {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.15, 0.06, 12), mat(L.hatColor));
        c.position.y = 0.12;
        c.rotation.z = 0.15;
        this.head.add(c);
        break;
      }
      case 'hood': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(L.hatColor));
        c.position.set(0, 0.01, -0.02);
        this.head.add(c);
        break;
      }
      case 'helmet': {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(L.hatColor, 0.5));
        c.position.y = 0.02;
        this.head.add(c);
        break;
      }
      default:
    }
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
      this.arms[0].rotation.z = 0;
      this.arms[1].rotation.z = 0;
      this.body.position.y = Math.abs(Math.cos(p)) * 0.03 * Math.min(1, speed / 3);
    } else {
      for (const l of this.legs) l.rotation.x *= 0.8;
      const breathe = Math.sin(p * 0.9) * 0.02;
      this.arms[0].rotation.x = breathe;
      this.arms[1].rotation.x = -breathe;
      this.arms[0].rotation.z = 0.05;
      this.arms[1].rotation.z = -0.05;
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
