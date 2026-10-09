import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { weatherUniforms } from './materials.js';
import { WATER_Y } from './WorldLayout.js';
import { tex } from '../render/assets.js';
import { extendMaterial, NOISE_GLSL } from '../render/shaderlib.js';
import { paint, merge, propMaterial } from './Props.js';

const LIFT = 0.045;
const PIECE = 90; // сэмплов на кусок меша (~180 м)

// Покрытие дорог. В uv лежат метры: x — поперёк от оси, y — вдоль.
// Разметку, колеи, траву посередине грунтовки рисует шейдер.
const ROAD_HEAD = /* glsl */ `
uniform sampler2D uMain;
uniform sampler2D uMainN;
uniform sampler2D uEdge;
uniform sampler2D uEdgeN;
uniform sampler2D uGrass;
uniform float uTile;
uniform float uWet;
uniform float uSnow;
varying vec2 vRoad;
varying float vHalfW;
varying vec3 vRight;
varying vec3 vFwd;
varying vec3 vWPos;
${NOISE_GLSL}
`;

function roadFrag(type) {
  const asphalt = type === 'asphalt';
  const dirt = type === 'dirt';
  const gravel = type === 'gravel';
  return /* glsl */ `
  float x = vRoad.x;
  float s = vRoad.y;
  float ax = abs(x);
  float hw = vHalfW;
  vec2 uvM = vec2(x, s) / uTile;
  vec4 base = texture(uMain, uvM);
  vec4 base2 = texture(uMain, vec2(s, -x) / (uTile * 3.3) + 0.31);
  vec3 col = mix(base.rgb, base2.rgb, 0.35);
  vec3 tn = texture(uMainN, uvM).xyz * 2.0 - 1.0;
  float rough = ${asphalt ? '0.82' : '0.95'};
  float n1 = n_fbm(vec2(x * 0.7, s * 0.05));
  float n2 = n_fbm(vec2(x * 3.0, s * 0.6) + 11.0);
  // край дороги переходит в обочину
  float edge = smoothstep(hw - ${asphalt ? '0.35' : '0.9'} - n2 * 0.4, hw, ax);
  vec4 e = texture(uEdge, vec2(x, s) / 3.6);
  vec3 en = texture(uEdgeN, vec2(x, s) / 3.6).xyz * 2.0 - 1.0;
  ${asphalt ? `
  // заплатки и потёртости
  float patchK = smoothstep(0.72, 0.75, n_fbm(vec2(x * 0.35, s * 0.08) + 4.0));
  col *= 1.0 - patchK * 0.35;
  rough = mix(rough, 0.7, patchK);
  // накатанные полосы от колёс — темнее и глаже
  float lane = hw * 0.5;
  float wheel = 0.0;
  for (int i = 0; i < 2; i++) {
    float c = (i == 0 ? lane : -lane);
    wheel = max(wheel, 1.0 - smoothstep(0.2, 0.55, abs(abs(x - c) - 0.75)));
  }
  col *= 1.0 - wheel * 0.12;
  rough -= wheel * 0.08;
  // разметка: прерывистая по оси, сплошные по краям; местами стёрта
  float wear = smoothstep(0.35, 0.65, n_fbm(vec2(x * 2.0, s * 0.35) + 2.0));
  float center = (1.0 - smoothstep(0.05, 0.07, ax)) * step(fract(s / 9.0), 0.33);
  float side = 1.0 - smoothstep(0.05, 0.07, abs(ax - (hw - 0.3)));
  float paintK = max(center, side) * (0.35 + 0.65 * wear);
  col = mix(col, vec3(0.78, 0.77, 0.72), paintK);
  rough = mix(rough, 0.55, paintK);
  tn = mix(tn, vec3(0.0, 0.0, 1.0), paintK * 0.8);
  ` : `
  // колеи: утрамбованные полосы, между ними и по краям трава
  float rut = 1.0 - smoothstep(0.18, 0.42, abs(ax - 0.85));
  col = mix(col, col * 0.78, rut);
  tn = mix(tn, vec3(0.0, 0.0, 1.0), rut * 0.5);
  float mid = (1.0 - smoothstep(0.18, 0.42 + n2 * 0.2, ax)) * smoothstep(0.35, 0.6, n1 + 0.15);
  vec3 g = texture(uGrass, vec2(x, s) / 3.2).rgb;
  col = mix(col, g, mid * ${dirt ? '0.85' : '0.5'});
  rough = mix(rough, 0.97, mid);
  `}
  col = mix(col, e.rgb, edge);
  tn = normalize(mix(tn, en, edge));
  // дождь: мокро, в колеях и выбоинах — лужи
  float puddle = 0.0;
  if (uWet > 0.01) {
    float pn = n_fbm(vec2(x * 0.5, s * 0.12) + 9.0);
    ${asphalt ? 'puddle = smoothstep(0.66, 0.72, pn + wheel * 0.08) * uWet;' : 'puddle = smoothstep(0.55, 0.62, pn + rut * 0.15) * uWet;'}
    col *= 1.0 - uWet * ${asphalt ? '0.45' : '0.35'};
    rough = mix(rough, ${asphalt ? '0.18' : '0.4'}, uWet * 0.8);
    col = mix(col, col * 0.6, puddle);
    rough = mix(rough, 0.03, puddle);
    tn = mix(tn, vec3(0.0, 0.0, 1.0), puddle);
  }
  // снег: по колеям укатан и темнее
  if (uSnow > 0.01) {
    float sk = uSnow * (0.75 + n2 * 0.25);
    ${asphalt ? 'sk *= 1.0 - wheel * 0.55;' : 'sk *= 1.0 - rut * 0.5;'}
    col = mix(col, vec3(0.82, 0.84, 0.88), clamp(sk, 0.0, 1.0));
    rough = mix(rough, 0.5, sk);
  }
  diffuseColor.rgb = col;
  float roadRough = rough;
  vec3 roadN = normalize(vRight * tn.x + vFwd * tn.y + vec3(0.0, 1.0, 0.0) * tn.z);
  `;
}

function roadMaterial(type, offset) {
  const main = type === 'asphalt' ? 'asphalt' : type === 'gravel' ? 'gravel' : type === 'rail' ? 'scree' : 'dirt';
  const m = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    polygonOffset: true,
    polygonOffsetFactor: offset,
    polygonOffsetUnits: offset,
  });
  return extendMaterial(m, {
    key: `road-${type}`,
    uniforms: {
      uMain: { value: tex(`${main}_c`) },
      uMainN: { value: tex(`${main}_n`) },
      uEdge: { value: tex(type === 'asphalt' ? 'gravel_c' : 'grass_c') },
      uEdgeN: { value: tex(type === 'asphalt' ? 'gravel_n' : 'grass_n') },
      uGrass: { value: tex('grass_c') },
      uTile: { value: type === 'asphalt' ? 4.5 : type === 'rail' ? 2.5 : 3.6 },
      uWet: weatherUniforms.uWet,
      uSnow: weatherUniforms.uSnow,
    },
    vertexHead: 'attribute vec4 aRoad;\nvarying vec2 vRoad;\nvarying float vHalfW;\nvarying vec3 vRight;\nvarying vec3 vFwd;\nvarying vec3 vWPos;',
    vertexBegin: `vRoad = aRoad.xy; vHalfW = aRoad.z;
      float ang_ = aRoad.w;
      vFwd = vec3(sin(ang_), 0.0, cos(ang_));
      vRight = vec3(-vFwd.z, 0.0, vFwd.x);
      vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
    fragHead: ROAD_HEAD,
    map: roadFrag(type),
    roughness: 'roughnessFactor = roadRough;',
    normal: 'normal = normalize((viewMatrix * vec4(roadN, 0.0)).xyz);',
  });
}

export class RoadRenderer {
  constructor(scene, roads, terrain) {
    this.scene = scene;
    this.roads = roads;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.group.name = 'roads';
    scene.add(this.group);
    this.materials = {};
    for (const [type, offset] of [['asphalt', -4], ['gravel', -3], ['dirt', -2], ['rail', -2]]) {
      this.materials[type] = roadMaterial(type, offset);
    }
    this.pieces = []; // { mesh, road, x, z }
    for (const r of roads.roads) this._buildRoad(r);
    this._buildRails();
    this._buildBridges();
    this._buildPosts();
  }

  _buildRoad(r) {
    // чуть шире реальной дороги — край уходит в обочину и прячет стык с землёй
    const extra = r.type === 'asphalt' ? 0.4 : 0.7;
    for (let start = 0; start < r.n - 1; start += PIECE) {
      const end = Math.min(r.n - 1, start + PIECE);
      const pos = [], attr = [], idx = [];
      let k = 0;
      let lastOk = false;
      for (let i = start; i <= end; i++) {
        const inWater = r.inWater && r.inWater(i);
        const i0 = Math.max(0, i - 1), i1 = Math.min(r.n - 1, i + 1);
        let dx = r.x[i1] - r.x[i0], dz = r.z[i1] - r.z[i0];
        const len = Math.hypot(dx, dz) || 1;
        dx /= len; dz /= len;
        // право = (-dz, dx)
        const rx = -dz, rz = dx;
        const hw = r.halfWidth + extra;
        const y = r.h[i] + LIFT;
        pos.push(r.x[i] - rx * hw, y, r.z[i] - rz * hw, r.x[i] + rx * hw, y, r.z[i] + rz * hw);
        const ang = Math.atan2(dx, dz);
        attr.push(-hw, r.s[i], r.halfWidth, ang, hw, r.s[i], r.halfWidth, ang);
        const ok = !inWater && r.h[i] > WATER_Y - 0.1;
        if (k > 0 && ok && lastOk) {
          // a/b — левый/правый край предыдущего сэмпла, c/d — текущего; нормаль вверх
          const a = (k - 1) * 2, b = a + 1, c = k * 2, d = c + 1;
          idx.push(a, b, c, b, d, c);
        }
        lastOk = ok;
        k++;
      }
      if (!idx.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('aRoad', new THREE.Float32BufferAttribute(attr, 4));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, this.materials[r.type]);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = 1;
      this.group.add(mesh);
      const mid = Math.floor((start + end) / 2);
      this.pieces.push({ mesh, road: r, x: r.x[mid], z: r.z[mid] });
    }
  }

  // узкоколейка: шпалы и рельсы поверх щебня
  _buildRails() {
    for (const r of this.roads.roads) {
      if (r.type !== 'rail') continue;
      const sleeper = paint(new THREE.BoxGeometry(2.0, 0.12, 0.24), 'wood:#4a3a2c', 0.25);
      const p = {};
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const list = [];
      for (let s = 0; s < r.length; s += 0.62) {
        r.at(s, p);
        if (r.isBridgeIndex(p.i)) continue;
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(p.dx, p.dz) + (Math.random() - 0.5) * 0.04);
        m.compose(new THREE.Vector3(p.x, p.h + LIFT + 0.02, p.z), q, new THREE.Vector3(1, 1, 1));
        list.push(m.clone());
      }
      const inst = new THREE.InstancedMesh(sleeper, propMaterial, list.length);
      list.forEach((mm, i) => inst.setMatrixAt(i, mm));
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      inst.receiveShadow = true;
      inst.castShadow = true;
      this.group.add(inst);
      // рельсы — отрезками вдоль оси
      const segs = [];
      for (let i = 0; i < r.n - 1; i++) {
        if (r.isBridgeIndex(i)) continue;
        const ax = r.x[i], az = r.z[i], bx = r.x[i + 1], bz = r.z[i + 1];
        const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1;
        for (const side of [-0.6, 0.6]) {
          const ox = (-dz / l) * side, oz = (dx / l) * side;
          const g = this._segBox(ax + ox, r.h[i] + LIFT + 0.13, az + oz, bx + ox, r.h[i + 1] + LIFT + 0.13, bz + oz, 0.07, 0.11);
          segs.push(paint(g, 'rusty:#5a4a40', 0.1));
        }
      }
      if (segs.length) {
        const mesh = new THREE.Mesh(merge(segs), propMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.group.add(mesh);
      }
    }
  }

  _segBox(ax, ay, az, bx, by, bz, w, h, yOff = 0, sideOff = 0) {
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len = Math.hypot(dx, dy, dz);
    const g = new THREE.BoxGeometry(w, h, len + 0.05);
    const m = new THREE.Matrix4();
    const mid = new THREE.Vector3((ax + bx) / 2, (ay + by) / 2 + yOff, (az + bz) / 2);
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const right = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    mid.addScaledVector(right, sideOff);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    m.compose(mid, q, new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    return g;
  }

  _buildBridges() {
    for (const r of this.roads.roads) {
      for (const b of r.bridges) {
        const deck = [], rails = [], pillars = [];
        const hw = r.halfWidth;
        for (let i = b.i0; i < b.i1; i++) {
          const ax = r.x[i], az = r.z[i], bx = r.x[i + 1], bz = r.z[i + 1];
          const ay = r.h[i], by = r.h[i + 1];
          if (b.kind === 'concrete') {
            deck.push(paint(this._segBox(ax, ay, az, bx, by, bz, hw * 2 + 1.2, 0.6, -0.28), 'concrete:#8d8c86', 0.05));
            for (const s of [-1, 1]) {
              rails.push(paint(this._segBox(ax, ay, az, bx, by, bz, 0.08, 0.08, 1.0, s * (hw + 0.45)), 'metal:#5b6a72'));
              rails.push(paint(this._segBox(ax, ay, az, bx, by, bz, 0.06, 0.06, 0.55, s * (hw + 0.45)), 'metal:#5b6a72'));
              deck.push(paint(this._segBox(ax, ay, az, bx, by, bz, 0.35, 0.35, 0.12, s * (hw + 0.35)), 'concrete:#9a9890'));
            }
            if ((i - b.i0) % 3 === 0) {
              const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1;
              for (const s of [-1, 1]) {
                const post = new THREE.BoxGeometry(0.08, 1.0, 0.08);
                post.translate(ax + (-dz / l) * s * (hw + 0.45), ay + 0.55, az + (dx / l) * s * (hw + 0.45));
                rails.push(paint(post, 'metal:#5b6a72'));
              }
            }
            if ((i - b.i0) % 6 === 3) {
              const ground = this.terrain.heightAt(ax, az);
              const hgt = ay - ground + 1;
              const pil = new THREE.CylinderGeometry(0.7, 0.8, hgt, 16);
              pil.translate(ax, ground + hgt / 2 - 1.2, az);
              pillars.push(paint(pil, 'concrete:#8d8c86', 0.05));
            }
          } else {
            // старый деревянный: доски поперёк, местами дырки
            const segLen = Math.hypot(bx - ax, bz - az);
            const dx = (bx - ax) / segLen, dz = (bz - az) / segLen;
            for (let s = 0; s < segLen; s += 0.45) {
              if (Math.random() < 0.06) continue;
              const px = ax + dx * s, pz = az + dz * s;
              const py = ay + (by - ay) * (s / segLen) - 0.04 + (Math.random() - 0.5) * 0.03;
              const plank = new THREE.BoxGeometry(hw * 2 + 0.4, 0.08, 0.38);
              plank.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.atan2(dx, dz) + (Math.random() - 0.5) * 0.06));
              plank.translate(px, py, pz);
              deck.push(paint(plank, 'wood:#6a4d32', 0.3));
            }
            for (const side of [-1, 1]) {
              rails.push(paint(this._segBox(ax, ay, az, bx, by, bz, 0.1, 0.1, 0.95, side * (hw + 0.2)), 'wood:#4a3524', 0.2));
              deck.push(paint(this._segBox(ax, ay, az, bx, by, bz, 0.25, 0.3, -0.25, side * (hw - 0.3)), 'wood:#4a3524', 0.2));
            }
            if ((i - b.i0) % 2 === 0) {
              for (const side of [-1, 1]) {
                const post = new THREE.BoxGeometry(0.14, 1.1, 0.14);
                post.translate(ax + -dz * side * (hw + 0.2), ay + 0.45, az + dx * side * (hw + 0.2));
                rails.push(paint(post, 'wood:#4a3524', 0.2));
              }
            }
            if ((i - b.i0) % 4 === 1) {
              const ground = this.terrain.heightAt(ax, az);
              for (const side of [-1, 1]) {
                const hgt = ay - ground + 0.6;
                const pile = new THREE.CylinderGeometry(0.16, 0.2, hgt, 8);
                pile.translate(ax + -dz * side * (hw - 0.4), ground + hgt / 2 - 0.6, az + dx * side * (hw - 0.4));
                pillars.push(paint(pile, 'wood:#3a2a1c', 0.2));
              }
            }
          }
        }
        for (const list of [deck, rails, pillars]) {
          if (!list.length) continue;
          const mesh = new THREE.Mesh(merge(list), propMaterial);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.group.add(mesh);
        }
      }
    }
  }

  // светоотражающие столбики вдоль трассы
  _buildPosts() {
    const main = this.roads.byId.main;
    const body = paint(new THREE.BoxGeometry(0.12, 0.9, 0.12).translate(0, 0.45, 0), 'paint:#e8e4da');
    const band = paint(new THREE.BoxGeometry(0.125, 0.12, 0.125).translate(0, 0.78, 0), 'paint:#1a1a1a');
    const geo = mergeGeometries([body, band], false);
    const count = Math.floor(main.length / 50) * 2;
    const inst = new THREE.InstancedMesh(geo, propMaterial, count);
    const m = new THREE.Matrix4();
    let k = 0;
    const p = {};
    for (let s = 20; s < main.length - 20 && k < count - 1; s += 50) {
      main.at(s, p);
      if (main.isBridgeIndex(p.i)) continue;
      for (const side of [-1, 1]) {
        const x = p.x + -p.dz * side * (main.halfWidth + 1.6);
        const z = p.z + p.dx * side * (main.halfWidth + 1.6);
        const y = this.terrain.heightAt(x, z);
        m.makeRotationY(Math.random() * 0.3);
        m.setPosition(x, y, z);
        inst.setMatrixAt(k++, m);
      }
    }
    inst.count = k;
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    this.group.add(inst);
  }

  update(cam, viewDist) {
    const d2 = (viewDist + 200) ** 2;
    for (const p of this.pieces) {
      const dx = p.x - cam.x, dz = p.z - cam.z;
      p.mesh.visible = dx * dx + dz * dz < d2;
    }
  }
}
