import * as THREE from 'three';
import { RIVER, WATER_Y, LAKE } from './WorldLayout.js';
import { makeCanvas } from './materials.js';

function makeWaterNormal() {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(S, S);
  // сумма синусов — тайлится по построению
  const h = (x, y) => {
    let v = 0;
    for (let k = 1; k <= 4; k++) {
      v += Math.sin(((x * k * 2 + y * (k % 2 ? 1 : 3)) / S) * Math.PI * 2 + k * 1.7) / k;
      v += Math.sin(((y * k * 2 - x * (k % 3)) / S) * Math.PI * 2 + k) / k;
    }
    return v;
  };
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = h(x + 1, y) - h(x - 1, y);
      const dy = h(x, y + 1) - h(x, y - 1);
      const n = new THREE.Vector3(-dx * 0.6, -dy * 0.6, 1).normalize();
      const i = (y * S + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

export class Water {
  constructor(scene, terrain) {
    this.normal = makeWaterNormal();
    this.normal.repeat.set(0.06, 0.06);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x2c5560,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.86,
      normalMap: this.normal,
      normalScale: new THREE.Vector2(0.6, 0.6),
    });
    this.group = new THREE.Group();
    scene.add(this.group);

    // лента вдоль реки
    const pts = RIVER.points;
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const len = curve.getLength();
    const n = Math.ceil(len / 6);
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n);
      const tan = curve.getTangentAt(i / n);
      const rx = -tan.z, rz = tan.x;
      const fd = Math.hypot(p.x - RIVER.ford.x, p.z - RIVER.ford.z);
      const w = (fd < RIVER.ford.r ? RIVER.ford.halfWidth : RIVER.halfWidth) + 14;
      pos.push(p.x - rx * w, WATER_Y, p.z - rz * w, p.x + rx * w, WATER_Y, p.z + rz * w);
      uv.push(p.x - rx * w, p.z - rz * w, p.x + rx * w, p.z + rz * w);
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    // нормали вверх — лента может быть вывернута на изгибах
    const nrm = g.attributes.normal;
    for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
    const river = new THREE.Mesh(g, this.material);
    river.receiveShadow = true;
    river.renderOrder = 2;
    this.group.add(river);

    // лёд на озере
    const ice = new THREE.Mesh(
      new THREE.CircleGeometry(LAKE.r - 1, 64),
      new THREE.MeshStandardMaterial({ color: 0xbfd8e4, roughness: 0.18, metalness: 0.05, transparent: true, opacity: 0.55 }),
    );
    ice.rotation.x = -Math.PI / 2;
    ice.position.set(LAKE.x, terrain.lakeY + 0.03, LAKE.z);
    ice.receiveShadow = true;
    ice.renderOrder = 2;
    this.group.add(ice);
  }

  update(dt) {
    this.normal.offset.x += dt * 0.004;
    this.normal.offset.y += dt * 0.0025;
  }
}
