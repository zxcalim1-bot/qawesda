import * as THREE from 'three';
import { ATMO_GLSL } from '../render/atmosphere.js';

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const frag = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform vec3 uSunLight;
uniform vec3 uAmbient;
uniform vec3 uNight;
uniform vec3 uFog;
uniform float uFogMix;
uniform float uHaze;
uniform float uOvercast;
uniform float uStars;
uniform float uCloud;
uniform float uCloudDark;
uniform float uTime;
uniform float uAurora;
uniform float uMoon;
uniform float uEnv;
uniform vec2 uWind;
varying vec3 vDir;

${ATMO_GLSL}

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++) { s += vnoise(p) * a; p = r * p * 2.03; a *= 0.5; }
  return s;
}

// плотность облачного слоя в точке (координаты слоя в км)
float cloudDensity(vec2 p) {
  vec2 q = vec2(fbm(p * 0.6 + uWind * 0.3), fbm(p * 0.6 + vec2(5.2, 1.3)));
  float n = fbm(p + q * 1.4 + uWind);
  float cov = uCloud;
  return smoothstep(1.0 - cov * 0.92 - 0.12, 1.0 - cov * 0.92 + 0.28, n);
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 dd = normalize(vec3(d.x, max(h, 0.0) + 0.002, d.z));
  vec3 col = atmosphere(dd, uSunDir, uHaze);

  // ночное небо и рассеянный лунный свет
  col += uNight * (0.55 + 0.45 * (1.0 - clamp(h, 0.0, 1.0)));
  // пасмурно — небо уходит в серое
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(lum) * vec3(0.92, 0.95, 1.0) * (1.0 - uCloudDark * 0.6), uOvercast);

  // диск солнца
  float sd = dot(d, uSunDir);
  float disc = smoothstep(0.99985, 0.99993, sd);
  float sunVis = (1.0 - uOvercast * 0.9) * (1.0 - uEnv * 0.7);
  col += uSunLight * disc * 40.0 * sunVis;

  // луна и звёзды
  float md = dot(d, uMoonDir);
  col += vec3(0.75, 0.8, 0.9) * smoothstep(0.99955, 0.9998, md) * uMoon * 2.0 * (1.0 - uCloud * 0.8);
  col += vec3(0.02, 0.025, 0.04) * pow(max(md, 0.0), 30.0) * uMoon;
  if (uStars > 0.01 && h > 0.0) {
    vec3 p = floor(d * 300.0);
    float r = hash(p);
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + r * 80.0);
    col += vec3(step(0.9978, r) * uStars * tw * smoothstep(0.0, 0.2, h) * (1.0 - uCloud) * 0.25) * (1.0 - uEnv);
  }

  // северное сияние — на севере (это -Z)
  if (uAurora > 0.01 && h > 0.0) {
    float north = smoothstep(0.1, 0.8, -d.z);
    vec2 ap = vec2(atan(d.x, -d.z) * 3.0, h * 4.0);
    float band = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float wave = sin(ap.x * (1.3 + fi * 0.4) + uTime * (0.15 + fi * 0.05) + fbm(ap + uTime * 0.05) * 3.0) * 0.12;
      float y = 0.25 + fi * 0.1 + wave;
      band += smoothstep(0.12, 0.0, abs(h - y)) * (0.6 + 0.4 * fbm(vec2(ap.x * 2.0, uTime * 0.2 + fi)));
    }
    vec3 ac = mix(vec3(0.1, 0.9, 0.5), vec3(0.4, 0.2, 0.9), smoothstep(0.25, 0.55, h));
    col += ac * band * north * uAurora * 0.18 * (1.0 - uCloud * 0.9);
  }

  // облака: слой на высоте ~1.8 км
  if (h > 0.0 && uCloud > 0.02) {
    float t = 1.8 / (h + 0.04);
    vec2 cp = d.xz * t * 0.55;
    float dens = cloudDensity(cp);
    if (dens > 0.001) {
      vec2 toSun = normalize(uSunDir.xz + vec2(1e-4)) * 0.18;
      float dl = cloudDensity(cp + toSun);
      float light = exp(-dl * 2.2) * (1.0 - uCloudDark * 0.8);
      float fwd = pow(max(sd, 0.0), 6.0);
      vec3 lit = uSunLight * light * (0.55 + 1.6 * fwd) + uAmbient * (1.15 - dens * 0.45);
      lit *= 1.0 - uCloudDark * 0.55;
      float fade = exp(-t * 0.035);
      col = mix(col, lit, dens * smoothstep(0.0, 0.06, h) * mix(0.35, 1.0, fade));
    }
  }

  // дымка у горизонта и «земля» под горизонтом
  col = mix(col, uFog, uFogMix * (1.0 - smoothstep(0.0, 0.25, max(h, 0.0))));
  if (h < 0.0) col = mix(col, uFog, smoothstep(0.0, -0.08, h));

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Sky {
  constructor(scene) {
    this.uniforms = {
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
      uSunLight: { value: new THREE.Color(1, 1, 1) },
      uAmbient: { value: new THREE.Color(0.3, 0.4, 0.5) },
      uNight: { value: new THREE.Color(0, 0, 0) },
      uFog: { value: new THREE.Color(0xa8c4e0) },
      uFogMix: { value: 0 },
      uHaze: { value: 0 },
      uOvercast: { value: 0 },
      uStars: { value: 0 },
      uCloud: { value: 0.3 },
      uCloudDark: { value: 0 },
      uTime: { value: 0 },
      uAurora: { value: 0 },
      uMoon: { value: 0 },
      uEnv: { value: 0 },
      uWind: { value: new THREE.Vector2() },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), this.material);
    this.mesh.renderOrder = -10;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);

    // копия неба для карты окружения (отражения и рассеянный свет)
    this.envScene = new THREE.Scene();
    this.envUniforms = THREE.UniformsUtils.clone(this.uniforms);
    this.envMesh = new THREE.Mesh(this.mesh.geometry, new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, uniforms: this.envUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    }));
    this.envMesh.frustumCulled = false;
    this.envScene.add(this.envMesh);
    // земля снизу, чтобы отражения не были чёрными
    this.groundColor = new THREE.Color(0.1, 0.1, 0.08);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(150, 16), new THREE.MeshBasicMaterial({ color: this.groundColor, side: THREE.DoubleSide }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    this.envGround = ground;
    this.envScene.add(ground);
  }

  update(camera, dt, windX = 0, windZ = 0) {
    this.mesh.position.copy(camera.position);
    this.uniforms.uTime.value += dt;
    this.uniforms.uWind.value.x += dt * (0.004 + windX * 0.01);
    this.uniforms.uWind.value.y += dt * (0.002 + windZ * 0.01);
  }

  // переносим текущие значения в копию для карты окружения
  syncEnv() {
    for (const k of Object.keys(this.uniforms)) {
      const v = this.uniforms[k].value;
      const dst = this.envUniforms[k];
      if (v && v.copy) dst.value.copy(v);
      else dst.value = v;
    }
    this.envUniforms.uEnv.value = 1;
  }
}
