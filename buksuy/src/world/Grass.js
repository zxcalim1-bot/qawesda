import * as THREE from 'three';
import { SURF } from './Surfaces.js';
import { WATER_Y } from './WorldLayout.js';
import { weatherUniforms } from './materials.js';
import { extendMaterial, HEIGHT_GLSL, heightUniforms, NOISE_GLSL } from '../render/shaderlib.js';
import { windUniforms } from './Trees.js';
import { clamp } from '../core/util.js';

// Трава из отдельных травинок. Каждая травинка привязана к точке мира и «переезжает»
// на другой край квадрата, когда камера уходит, — поэтому трава не плывёт.
// Три вложенных слоя: у камеры густо, дальше реже. Где трава растёт — решает маска.

const VERT_HEAD = /* glsl */ `
attribute vec4 aBlade;
uniform vec3 uCam;
uniform float uSize;
uniform float uBladeH;
uniform sampler2D uMask;
uniform vec4 uMaskInfo;
uniform vec4 uPush[2];
uniform float uTime;
uniform float uWind;
varying vec3 vGrassCol;
varying float vT;
${HEIGHT_GLSL}
${NOISE_GLSL}
`;

const VERT_BEGIN = /* glsl */ `
  vec2 corner = uCam.xz - uSize * 0.5;
  vec2 base = corner + mod(aBlade.xy * uSize - corner, uSize);
  float dist = length(base - uCam.xz);
  float fade = 1.0 - smoothstep(uSize * 0.18, uSize * 0.48, dist);
  fade = fade * fade;
  float mask = texture(uMask, (base - uMaskInfo.xy) * uMaskInfo.zw).r;
  float meadow = n_fbm(base * 0.035);
  float hgt = uBladeH * (0.45 + aBlade.w * 0.7) * (0.55 + meadow * 0.9) * smoothstep(0.0, 0.5, mask);
  float keep = step(aBlade.z, mask) * step(fract(aBlade.z * 31.7), fade);
  hgt *= mix(0.5, 1.0, fade) * keep;
  // примятая трава под машиной и под ногами
  for (int i = 0; i < 2; i++) {
    float d = length(base - uPush[i].xy);
    hgt *= mix(1.0, 0.25, (1.0 - smoothstep(uPush[i].z * 0.6, uPush[i].z, d)) * uPush[i].w);
  }
  float t = position.y;
  vT = t;
  float yaw = aBlade.w * 40.0;
  vec2 dir = vec2(cos(yaw), sin(yaw));
  vec2 perp = vec2(-dir.y, dir.x);
  float lean = 0.15 + fract(aBlade.z * 13.7) * 0.35;
  float gust = sin(uTime * 1.7 + base.x * 0.13 + base.y * 0.09) * 0.6 + sin(uTime * 3.1 + base.x * 0.4) * 0.25;
  vec2 windDir = vec2(0.8, 0.6);
  vec2 bend = dir * lean * t * t + windDir * gust * uWind * 0.45 * t * t;
  float w = 0.04 * sqrt(uSize / 24.0) * (0.7 + aBlade.w * 0.6) * (1.0 - t * 0.85);
  float ground = terrainHeight(base);
  if (hgt < 0.02) {
    transformed = vec3(base.x, ground - 50.0, base.y);
  } else {
    transformed = vec3(base.x + perp.x * position.x * w + bend.x * hgt, ground + t * hgt * (1.0 - length(bend) * 0.25), base.y + perp.y * position.x * w + bend.y * hgt);
  }
  // цвет: корень темнее, кончик светлее; пятна сухой травы; редкие цветы
  float dry = smoothstep(0.45, 0.75, n_fbm(base * 0.02 + 5.0));
  vec3 root = vec3(0.012, 0.022, 0.005);
  vec3 tip = mix(vec3(0.055, 0.095, 0.018), vec3(0.15, 0.13, 0.045), dry * 0.75);
  tip *= 0.7 + fract(aBlade.w * 91.3) * 0.6;
  vec3 c = mix(root, tip, smoothstep(0.0, 1.0, t));
  float flower = step(0.985, fract(aBlade.z * 57.1)) * step(0.85, t) * (1.0 - dry);
  vec3 fc = fract(aBlade.w * 7.3) < 0.5 ? vec3(0.9, 0.88, 0.8) : (fract(aBlade.w * 3.1) < 0.5 ? vec3(0.85, 0.7, 0.1) : vec3(0.45, 0.3, 0.7));
  vGrassCol = mix(c, fc, flower);
`;

export class Grass {
  constructor(scene, terrain, heightTex) {
    this.scene = scene;
    this.terrain = terrain;
    this.maskTex = this._makeMask();
    this.group = new THREE.Group();
    this.group.name = 'grass';
    scene.add(this.group);
    this.push = [new THREE.Vector4(0, 0, 3.0, 0), new THREE.Vector4(0, 0, 0.7, 0)];
    this.uniforms = {
      uMask: { value: this.maskTex },
      uMaskInfo: { value: new THREE.Vector4(terrain.minX, terrain.minZ, 1 / (terrain.maxX - terrain.minX), 1 / (terrain.maxZ - terrain.minZ)) },
      uPush: { value: this.push },
      uBladeH: { value: 0.6 },
      uTime: windUniforms.uTime,
      uWind: windUniforms.uWind,
      uSnow: weatherUniforms.uSnow,
      uWet: weatherUniforms.uWet,
      ...heightUniforms(terrain, heightTex),
    };
    this.geometry = this._bladeGeometry();
    this.layers = [];
    this.quality = null;
  }

  // где растёт трава (0..1) — по поверхности, дорогам, снегу и воде
  _makeMask() {
    const t = this.terrain;
    const data = new Uint8Array(t.nx * t.nz);
    for (let v = 0; v < data.length; v++) {
      const s = t.surf[v];
      let g;
      switch (s) {
        case SURF.grass: g = 1; break;
        case SURF.forest: g = 0.4; break;
        case SURF.mud: g = 0.25; break;
        case SURF.deepmud: g = 0.12; break;
        case SURF.sand: g = 0.12; break;
        case SURF.gravel: g = 0.12; break;
        case SURF.rock: g = 0.05; break;
        default: g = 0;
      }
      const rd = t.roadDist[v];
      g *= clamp((rd - 0.3) / 2.2, 0, 1);
      g *= 1 - clamp((t.snow[v] / 255 - 0.15) * 3, 0, 1);
      if (t.heights[v] < WATER_Y + 0.25) g = 0;
      data[v] = Math.round(g * 255);
    }
    const tex = new THREE.DataTexture(data, t.nx, t.nz, THREE.RedFormat, THREE.UnsignedByteType);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  _bladeGeometry() {
    // травинка: три пары вершин и кончик; x — доля ширины, y — доля высоты
    const pos = [];
    const rows = [0, 0.3, 0.62];
    for (const y of rows) pos.push(-0.5, y, 0, 0.5, y, 0);
    pos.push(0, 1, 0);
    const idx = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6];
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(7 * 3).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    g.setIndex(idx);
    return g;
  }

  _material(size, uCam) {
    const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 1, metalness: 0, envMapIntensity: 0.7 });
    return extendMaterial(m, {
      key: 'grass',
      uniforms: { ...this.uniforms, uCam, uSize: { value: size } },
      vertexHead: VERT_HEAD,
      vertexBegin: VERT_BEGIN,
      vertexNormal: 'objectNormal = vec3(0.0, 1.0, 0.0);',
      fragHead: 'varying vec3 vGrassCol;\nvarying float vT;\nuniform float uWet;\nuniform float uSnow;',
      color: `diffuseColor.rgb = vGrassCol * (1.0 - uWet * 0.25);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.8, 0.83, 0.88), uSnow * smoothstep(0.5, 1.0, vT) * 0.8);`,
      roughness: 'roughnessFactor = mix(1.0, 0.5, uWet);',
      normalBegin: `
  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;
  vec3 normal = normalize(vNormal);
  vec3 nonPerturbedNormal = normal;`,
      // просвечивающая на солнце трава
      lights: `
  #if NUM_DIR_LIGHTS > 0
  {
    float back = pow(max(dot(-normalize(vViewPosition), directionalLights[0].direction), 0.0), 4.0);
    reflectedLight.directDiffuse += diffuseColor.rgb * directionalLights[0].color * back * 0.6 * vT;
  }
  #endif`,
    });
  }

  setQuality(q) {
    if (this.quality === q) return;
    this.quality = q;
    for (const l of this.layers) {
      this.group.remove(l.mesh);
      l.mesh.material.dispose();
    }
    this.layers = [];
    const plan = {
      low: [],
      medium: [[22, 45000], [60, 45000]],
      high: [[24, 60000], [64, 60000], [140, 40000]],
      ultra: [[26, 100000], [70, 90000], [150, 70000]],
    }[q] || [];
    for (const [size, count] of plan) {
      const g = this.geometry.clone();
      const data = new Float32Array(count * 4);
      let seed = size * 7919;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < count; i++) data.set([rnd(), rnd(), rnd(), rnd()], i * 4);
      g.setAttribute('aBlade', new THREE.InstancedBufferAttribute(data, 4));
      g.instanceCount = count;
      const uCam = { value: new THREE.Vector3() };
      const mat = this._material(size, uCam);
      const mesh = new THREE.Mesh(g, mat);
      mesh.frustumCulled = false;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.layers.push({ mesh, mat, size, uCam });
    }
  }

  // carPos/playerPos — где приминать траву
  update(camPos, carPos, playerPos, playerOnFoot) {
    for (const l of this.layers) l.uCam.value.copy(camPos);
    this.push[0].set(carPos.x, carPos.z, 3.0, 1);
    this.push[1].set(playerPos.x, playerPos.z, 0.7, playerOnFoot ? 1 : 0);
  }
}
