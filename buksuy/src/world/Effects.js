import * as THREE from 'three';
import { FOG_GLSL, fogUniforms } from '../render/atmosphere.js';

// Частицы (пыль, грязь, брызги, дым) и следы шин.

const PRESETS = {
  dust: { color: [0.62, 0.55, 0.44], alpha: 0.32, size: [0.8, 3.6], life: [1.2, 2.4], grav: -0.25, drag: 1.4 },
  sand: { color: [0.8, 0.72, 0.52], alpha: 0.35, size: [0.6, 3.0], life: [1.0, 2.0], grav: -0.1, drag: 1.5 },
  mud: { color: [0.22, 0.16, 0.09], alpha: 0.95, size: [0.16, 0.22], life: [0.6, 1.0], grav: 9.8, drag: 0.3 },
  dirt: { color: [0.32, 0.27, 0.18], alpha: 0.8, size: [0.12, 0.18], life: [0.5, 0.8], grav: 9.8, drag: 0.3 },
  grass: { color: [0.3, 0.45, 0.16], alpha: 0.9, size: [0.1, 0.12], life: [0.5, 0.8], grav: 7, drag: 0.6 },
  water: { color: [0.78, 0.86, 0.92], alpha: 0.6, size: [0.3, 1.3], life: [0.5, 0.9], grav: 9.8, drag: 0.5 },
  snow: { color: [0.93, 0.95, 1], alpha: 0.65, size: [0.5, 1.8], life: [0.8, 1.4], grav: 1.2, drag: 1.2 },
  smoke: { color: [0.08, 0.08, 0.08], alpha: 0.5, size: [0.5, 3.2], life: [2.0, 3.0], grav: -1.4, drag: 0.8 },
  steam: { color: [0.92, 0.92, 0.92], alpha: 0.38, size: [0.4, 2.6], life: [1.2, 1.8], grav: -2.2, drag: 1.0 },
  exhaust: { color: [0.5, 0.5, 0.52], alpha: 0.16, size: [0.15, 0.9], life: [0.8, 1.2], grav: -0.6, drag: 1.0 },
  tire: { color: [0.8, 0.8, 0.82], alpha: 0.3, size: [0.6, 3.0], life: [1.2, 2.0], grav: -0.4, drag: 1.2 },
  spark: { color: [1.0, 0.7, 0.3], alpha: 1, size: [0.08, 0.02], life: [0.2, 0.4], grav: 6, drag: 0.2, glow: 1 },
  glass: { color: [0.8, 0.9, 0.95], alpha: 0.9, size: [0.06, 0.06], life: [0.6, 1.0], grav: 9.8, drag: 0.2 },
};

const MAX = 3000;

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.pos = new Float32Array(MAX * 3);
    this.vel = new Float32Array(MAX * 3);
    this.col = new Float32Array(MAX * 4);
    this.size = new Float32Array(MAX);
    this.life = new Float32Array(MAX);
    this.maxLife = new Float32Array(MAX);
    this.preset = new Array(MAX).fill(null);
    this.next = 0;

    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.colAttr = new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    this.sizeAttr = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    const seed = new Float32Array(MAX);
    for (let i = 0; i < MAX; i++) seed[i] = Math.random();
    g.setAttribute('position', this.posAttr);
    g.setAttribute('aColor', this.colAttr);
    g.setAttribute('aSize', this.sizeAttr);
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.uniforms = {
      uLight: { value: new THREE.Color(1, 1, 1) },
      uScale: { value: 600 },
      ...fogUniforms(scene),
    };
    // клубы пыли и дыма: шум внутри точки, мягкий край; мелкие брызги — просто капли
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute vec4 aColor; attribute float aSize; attribute float aSeed;
        uniform float uScale;
        varying vec4 vC;
        varying float vSeed;
        varying float vPx;
        varying vec3 vW;
        void main() {
          vC = aColor;
          vSeed = aSeed;
          vW = position;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale / max(0.5, -mv.z);
          vPx = gl_PointSize;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uLight;
        varying vec4 vC;
        varying float vSeed;
        varying float vPx;
        varying vec3 vW;
        ${FOG_GLSL}
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
        }
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          float d = length(q);
          if (d > 0.5 || vC.a < 0.003) discard;
          float a = vC.a;
          vec3 col = vC.rgb;
          if (vPx > 6.0) {
            // поворачиваем шум для каждой частицы
            float ang = vSeed * 6.28;
            vec2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * q;
            float n = vn(r * 5.0 + vSeed * 17.0) * 0.6 + vn(r * 11.0 + vSeed * 5.0) * 0.4;
            a *= smoothstep(0.5, 0.05, d) * smoothstep(0.25, 0.75, n + 0.35 - d);
            col *= 0.8 + n * 0.35 - q.y * 0.3;
          } else {
            a *= smoothstep(0.5, 0.2, d);
          }
          col *= uLight;
          gl_FragColor = vec4(applyFog(col, vW), a);
        }`,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);

    this._buildTracks();
  }

  emit(type, x, y, z, vx = 0, vy = 0, vz = 0, spread = 0.5) {
    const p = PRESETS[type];
    if (!p) return;
    const i = this.next;
    this.next = (this.next + 1) % MAX;
    this.pos[i * 3] = x + (Math.random() - 0.5) * spread * 0.4;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z + (Math.random() - 0.5) * spread * 0.4;
    this.vel[i * 3] = vx + (Math.random() - 0.5) * spread;
    this.vel[i * 3 + 1] = vy + Math.random() * spread * 0.5;
    this.vel[i * 3 + 2] = vz + (Math.random() - 0.5) * spread;
    const life = p.life[0] + Math.random() * (p.life[1] - p.life[0]);
    this.life[i] = life;
    this.maxLife[i] = life;
    this.preset[i] = p;
    this.col[i * 4] = p.color[0];
    this.col[i * 4 + 1] = p.color[1];
    this.col[i * 4 + 2] = p.color[2];
    this.col[i * 4 + 3] = p.alpha;
    this.size[i] = p.size[0];
  }

  // light — цвет освещения (солнце + небо)
  update(dt, light, ground) {
    if (typeof light === 'number') this.uniforms.uLight.value.setScalar(light);
    else this.uniforms.uLight.value.copy(light);
    this.uniforms.uScale.value = (window.innerHeight || 700) * 0.9;
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) continue;
      const p = this.preset[i];
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.col[i * 4 + 3] = 0;
        this.size[i] = 0;
        continue;
      }
      const t = 1 - this.life[i] / this.maxLife[i];
      const k = Math.max(0, 1 - p.drag * dt);
      this.vel[i * 3] *= k;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * k - p.grav * dt;
      this.vel[i * 3 + 2] *= k;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (p.grav > 3 && ground) {
        const gh = ground.height(this.pos[i * 3], this.pos[i * 3 + 2]);
        if (this.pos[i * 3 + 1] < gh + 0.03) {
          this.pos[i * 3 + 1] = gh + 0.03;
          this.vel[i * 3] = this.vel[i * 3 + 1] = this.vel[i * 3 + 2] = 0;
        }
      }
      this.size[i] = p.size[0] + (p.size[1] - p.size[0]) * t;
      this.col[i * 4 + 3] = p.alpha * (1 - t) * Math.min(1, t * 8 + 0.3);
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
    this.sizeAttr.needsUpdate = true;
  }

  // --- следы шин ---
  _buildTracks() {
    const N = 4000;
    this.trackN = N;
    this.trackPos = new Float32Array(N * 4 * 3);
    this.trackCol = new Float32Array(N * 4 * 4);
    const idx = new Uint32Array(N * 6);
    for (let i = 0; i < N; i++) {
      idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2], i * 6);
    }
    const g = new THREE.BufferGeometry();
    this.trackPosAttr = new THREE.BufferAttribute(this.trackPos, 3).setUsage(THREE.DynamicDrawUsage);
    this.trackColAttr = new THREE.BufferAttribute(this.trackCol, 4).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.trackPosAttr);
    g.setAttribute('color', this.trackColAttr);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    this.trackMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6,
    }));
    this.trackMesh.frustumCulled = false;
    this.trackMesh.renderOrder = 3;
    this.scene.add(this.trackMesh);
    this.trackNext = 0;
    this.trackLast = new Map(); // id колеса -> последняя точка
  }

  // добавить кусок следа. color [r,g,b,a]
  track(id, x, y, z, dirX, dirZ, width, color) {
    const last = this.trackLast.get(id);
    if (!last) {
      this.trackLast.set(id, { x, y, z, dirX, dirZ });
      return;
    }
    const dx = x - last.x, dz = z - last.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.35) return;
    if (d > 3) {
      this.trackLast.set(id, { x, y, z, dirX, dirZ });
      return;
    }
    const i = this.trackNext;
    this.trackNext = (this.trackNext + 1) % this.trackN;
    const hw = width / 2;
    const rx0 = -last.dirZ * hw, rz0 = last.dirX * hw;
    const rx1 = -dirZ * hw, rz1 = dirX * hw;
    this.trackPos.set([
      last.x - rx0, last.y, last.z - rz0,
      last.x + rx0, last.y, last.z + rz0,
      x - rx1, y, z - rz1,
      x + rx1, y, z + rz1,
    ], i * 12);
    for (let k = 0; k < 4; k++) this.trackCol.set(color, i * 16 + k * 4);
    this.trackPosAttr.needsUpdate = true;
    this.trackColAttr.needsUpdate = true;
    this.trackLast.set(id, { x, y, z, dirX, dirZ });
  }

  breakTrack(id) {
    this.trackLast.delete(id);
  }
}
