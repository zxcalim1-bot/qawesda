import * as THREE from 'three';

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const frag = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uSunColor;
uniform vec3 uFog;
uniform float uFogMix;
uniform float uStars;
uniform float uCloud;
uniform float uCloudDark;
uniform float uTime;
uniform float uAurora;
uniform float uMoon;
uniform vec3 uMoonDir;
varying vec3 vDir;

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += vnoise(p) * a; p *= 2.03; a *= 0.5; }
  return s;
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.5));
  if (h < 0.0) col = mix(uHorizon, uGround, clamp(-h * 5.0, 0.0, 1.0));

  float sd = max(dot(d, uSunDir), 0.0);
  float sunVis = smoothstep(-0.08, 0.02, uSunDir.y);
  col += uSunColor * (pow(sd, 6.0) * 0.25 + pow(sd, 40.0) * 0.4) * sunVis * (1.0 - uCloud * 0.6);
  col += uSunColor * smoothstep(0.9993, 0.99965, sd) * 14.0 * sunVis * (1.0 - uCloud * 0.85);

  // луна
  float md = max(dot(d, uMoonDir), 0.0);
  col += vec3(0.75, 0.8, 0.9) * smoothstep(0.99955, 0.9998, md) * uMoon * (1.0 - uCloud * 0.8);
  col += vec3(0.08, 0.1, 0.14) * pow(md, 30.0) * uMoon;

  // звёзды
  if (uStars > 0.01 && h > 0.0) {
    vec3 p = floor(d * 260.0);
    float r = hash(p);
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + r * 80.0);
    col += vec3(step(0.9975, r) * uStars * tw * smoothstep(0.0, 0.2, h) * (1.0 - uCloud));
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
    col += ac * band * north * uAurora * 0.55 * (1.0 - uCloud * 0.9);
  }

  // облака
  if (h > -0.02) {
    vec2 uv = d.xz / (h + 0.15) * 1.4 + vec2(uTime * 0.006, uTime * 0.002);
    float n = fbm(uv);
    float cov = smoothstep(1.0 - uCloud, 1.0 - uCloud + 0.35, n);
    float lit = clamp(fbm(uv + uSunDir.xz * 0.15) - n + 0.6, 0.0, 1.0);
    vec3 cc = mix(uHorizon * 0.55, mix(uSunColor, vec3(1.0), 0.5) * 0.9, lit) * (1.0 - uCloudDark);
    col = mix(col, cc, cov * smoothstep(-0.02, 0.15, h) * 0.95);
  }

  col = mix(col, uFog, uFogMix * (1.0 - smoothstep(0.0, 0.3, max(h, 0.0))));
  if (h < 0.0) col = mix(col, uFog, 0.8);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Sky {
  constructor(scene) {
    this.uniforms = {
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
      uZenith: { value: new THREE.Color(0x2a5ea8) },
      uHorizon: { value: new THREE.Color(0xa8c4e0) },
      uGround: { value: new THREE.Color(0x3a4030) },
      uSunColor: { value: new THREE.Color(1, 0.95, 0.85) },
      uFog: { value: new THREE.Color(0xa8c4e0) },
      uFogMix: { value: 0 },
      uStars: { value: 0 },
      uCloud: { value: 0.3 },
      uCloudDark: { value: 0 },
      uTime: { value: 0 },
      uAurora: { value: 0 },
      uMoon: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), mat);
    this.mesh.renderOrder = -10;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  update(camera, dt) {
    this.mesh.position.copy(camera.position);
    this.uniforms.uTime.value += dt;
  }
}
