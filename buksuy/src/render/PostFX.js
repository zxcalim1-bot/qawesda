import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// Пост-обработка: затенение в углах (SSAO по глубине), свечение ярких мест,
// тонмаппинг, лёгкая «плёночная» коррекция и сглаживание.

const AO_FRAG = /* glsl */ `
uniform sampler2D tDepth;
uniform mat4 uProjInv;
uniform mat4 uProj;
uniform vec2 uRes;
uniform float uRadius;
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;

vec3 viewPos(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  vec4 p = uProjInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  return p.xyz / p.w;
}

float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

void main() {
  float d = texture2D(tDepth, vUv).x;
  if (d >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec3 p = viewPos(vUv);
  vec2 px = 1.0 / uRes;
  // нормаль по соседям: берём меньший перепад, чтобы на краях не было ореолов
  vec3 pr = viewPos(vUv + vec2(px.x, 0.0)), pl = viewPos(vUv - vec2(px.x, 0.0));
  vec3 pu = viewPos(vUv + vec2(0.0, px.y)), pd = viewPos(vUv - vec2(0.0, px.y));
  vec3 dx = abs(pr.z - p.z) < abs(p.z - pl.z) ? pr - p : p - pl;
  vec3 dy = abs(pu.z - p.z) < abs(p.z - pd.z) ? pu - p : p - pd;
  vec3 n = normalize(cross(dx, dy));
  float rad = uRadius * uProj[1][1] * 0.5 * uRes.y / -p.z;
  rad = min(rad, uRes.y * 0.12);
  float occ = 0.0;
  float a0 = ign(gl_FragCoord.xy) * 6.2831;
  const int N = 12;
  for (int i = 0; i < N; i++) {
    float fi = (float(i) + 0.5) / float(N);
    float a = a0 + float(i) * 2.39996;
    vec2 off = vec2(cos(a), sin(a)) * sqrt(fi) * rad * px;
    vec3 q = viewPos(vUv + off);
    vec3 v = q - p;
    float vv = dot(v, v);
    float fall = max(0.0, 1.0 - vv / (uRadius * uRadius * 4.0));
    occ += max(0.0, dot(v, n) - 0.02 * -p.z) / (vv + 0.05) * fall;
  }
  occ = occ / float(N);
  float ao = clamp(1.0 - occ * uIntensity, 0.0, 1.0);
  ao = mix(ao, 1.0, smoothstep(80.0, 160.0, -p.z));
  gl_FragColor = vec4(ao, ao, ao, 1.0);
}`;

const BLUR_FRAG = /* glsl */ `
uniform sampler2D tAO;
uniform sampler2D tDepth;
uniform vec2 uDir;
uniform vec2 uRes;
uniform float uNear;
uniform float uFar;
varying vec2 vUv;
float lin(float d) { float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
void main() {
  float c = lin(texture2D(tDepth, vUv).x);
  float sum = 0.0, wsum = 0.0;
  for (int i = -3; i <= 3; i++) {
    vec2 uv = vUv + uDir * float(i) * 1.5 / uRes;
    float z = lin(texture2D(tDepth, uv).x);
    float w = exp(-abs(z - c) / (c * 0.03 + 0.05)) * (1.0 - abs(float(i)) / 4.5);
    sum += texture2D(tAO, uv).r * w;
    wsum += w;
  }
  gl_FragColor = vec4(vec3(sum / max(wsum, 1e-4)), 1.0);
}`;

const APPLY_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D tAO;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  float ao = texture2D(tAO, vUv).r;
  gl_FragColor = vec4(c.rgb * ao, c.a);
}`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

class AOPass extends Pass {
  constructor(camera) {
    super();
    this.camera = camera;
    this.needsSwap = true;
    this.scale = 0.5;
    const rtOpts = { type: THREE.HalfFloatType, depthBuffer: false };
    this.aoRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    this.blurRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    this.aoMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: AO_FRAG,
      uniforms: {
        tDepth: { value: null }, uProjInv: { value: new THREE.Matrix4() }, uProj: { value: new THREE.Matrix4() },
        uRes: { value: new THREE.Vector2() }, uRadius: { value: 1.1 }, uIntensity: { value: 1.25 }, uTime: { value: 0 },
      },
      depthTest: false, depthWrite: false,
    });
    this.blurMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: BLUR_FRAG,
      uniforms: {
        tAO: { value: null }, tDepth: { value: null }, uDir: { value: new THREE.Vector2(1, 0) },
        uRes: { value: new THREE.Vector2() }, uNear: { value: 0.1 }, uFar: { value: 3000 },
      },
      depthTest: false, depthWrite: false,
    });
    this.applyMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: APPLY_FRAG,
      uniforms: { tDiffuse: { value: null }, tAO: { value: null } },
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.aoMat);
  }

  setSize(w, h) {
    const sw = Math.max(1, Math.round(w * this.scale)), sh = Math.max(1, Math.round(h * this.scale));
    this.aoRT.setSize(sw, sh);
    this.blurRT.setSize(sw, sh);
    this.aoMat.uniforms.uRes.value.set(sw, sh);
    this.blurMat.uniforms.uRes.value.set(sw, sh);
  }

  render(renderer, writeBuffer, readBuffer) {
    const cam = this.camera;
    const depth = readBuffer.depthTexture;
    const U = this.aoMat.uniforms;
    U.tDepth.value = depth;
    U.uProj.value.copy(cam.projectionMatrix);
    U.uProjInv.value.copy(cam.projectionMatrixInverse);
    this.quad.material = this.aoMat;
    renderer.setRenderTarget(this.aoRT);
    this.quad.render(renderer);
    const B = this.blurMat.uniforms;
    B.tDepth.value = depth;
    B.uNear.value = cam.near;
    B.uFar.value = cam.far;
    this.quad.material = this.blurMat;
    B.tAO.value = this.aoRT.texture;
    B.uDir.value.set(1, 0);
    renderer.setRenderTarget(this.blurRT);
    this.quad.render(renderer);
    B.tAO.value = this.blurRT.texture;
    B.uDir.value.set(0, 1);
    renderer.setRenderTarget(this.aoRT);
    this.quad.render(renderer);
    this.applyMat.uniforms.tDiffuse.value = readBuffer.texture;
    this.applyMat.uniforms.tAO.value = this.aoRT.texture;
    this.quad.material = this.applyMat;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }

  dispose() {
    this.aoRT.dispose();
    this.blurRT.dispose();
    this.quad.dispose();
  }
}

// виньетка, чуть плотнее контраст, едва заметное зерно — в пространстве экрана, после тонмаппинга
const GRADE_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uVignette;
uniform float uSat;
uniform float uContrast;
uniform vec3 uTint;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  vec3 col = c.rgb;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, uSat);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uTint;
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * uVignette;
  col += (hash(vUv * 1000.0) - 0.5) * 0.012;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);
}`;

class GradePass extends Pass {
  constructor() {
    super();
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: GRADE_FRAG,
      uniforms: {
        tDiffuse: { value: null }, uTime: { value: 0 }, uVignette: { value: 0.55 },
        uSat: { value: 1.06 }, uContrast: { value: 1.05 }, uTint: { value: new THREE.Color(1, 1, 1) },
      },
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.uTime.value = (this.material.uniforms.uTime.value + 0.618) % 100;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }
}

export class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.quality = null;
  }

  configure(quality) {
    if (this.quality === quality) return;
    this.quality = quality;
    this.composer?.dispose?.();
    this.enabled = quality !== 'low';
    if (!this.enabled) {
      this.composer = null;
      return;
    }
    const r = this.renderer;
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: quality === 'ultra' ? 4 : 0,
    });
    rt.depthTexture = new THREE.DepthTexture(size.x, size.y);
    rt.depthTexture.type = THREE.UnsignedIntType;
    const c = new EffectComposer(r, rt);
    c.addPass(new RenderPass(this.scene, this.camera));
    if (quality === 'high' || quality === 'ultra') {
      this.ao = new AOPass(this.camera);
      this.ao.scale = quality === 'ultra' ? 0.75 : 0.5;
      c.addPass(this.ao);
    } else this.ao = null;
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.22, 0.55, 1.4);
    c.addPass(this.bloom);
    c.addPass(new OutputPass());
    this.grade = new GradePass();
    c.addPass(this.grade);
    this.smaa = new SMAAPass(size.x, size.y);
    c.addPass(this.smaa);
    this.composer = c;
    this.setSize();
  }

  setSize() {
    if (!this.composer) return;
    const r = this.renderer;
    const pr = r.getPixelRatio();
    const w = r.domElement.width / pr, h = r.domElement.height / pr;
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
  }

  render() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}
