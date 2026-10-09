import * as THREE from 'three';

// Общие куски шейдеров и помощник для правки стандартных материалов three.js.

export const NOISE_GLSL = /* glsl */ `
float n_hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n_value(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(n_hash(i), n_hash(i + vec2(1, 0)), f.x), mix(n_hash(i + vec2(0, 1)), n_hash(i + vec2(1, 1)), f.x), f.y);
}
float n_fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += n_value(p) * a; p = p * 2.07 + 13.1; a *= 0.5; }
  return s;
}`;

// Трипланарная выборка из массива текстур (Ben Golus, «whiteout»-смешивание нормалей).
// p — позиция, n — нормаль (в одном пространстве), layer — слой, scale — метров на тайл.
// Трипланарная выборка из массива текстур (Ben Golus, «whiteout»-смешивание нормалей).
// p — позиция, n — нормаль (в одном пространстве), layer — слой, scale — метров на тайл.
// Градиенты передаём явно: выборки стоят внутри ветвлений, а там dFdx не определён.
export const TRIPLANAR_GLSL = /* glsl */ `
vec4 triColor(sampler2DArray t, vec3 p, vec3 dpx, vec3 dpy, vec3 w, float layer, float scale) {
  vec4 c = vec4(0.0);
  float k = 1.0 / scale;
  if (w.x > 0.01) c += textureGrad(t, vec3(p.zy * k, layer), dpx.zy * k, dpy.zy * k) * w.x;
  if (w.y > 0.01) c += textureGrad(t, vec3(p.xz * k, layer), dpx.xz * k, dpy.xz * k) * w.y;
  if (w.z > 0.01) c += textureGrad(t, vec3(p.xy * k, layer), dpx.xy * k, dpy.xy * k) * w.z;
  return c;
}
vec3 triNormal(sampler2DArray t, vec3 p, vec3 dpx, vec3 dpy, vec3 n, vec3 w, float layer, float scale, float strength) {
  vec3 s = sign(n);
  vec3 r = vec3(0.0);
  float k = 1.0 / scale;
  if (w.x > 0.01) {
    vec3 tn = textureGrad(t, vec3(p.zy * k, layer), dpx.zy * k, dpy.zy * k).xyz * 2.0 - 1.0;
    tn.xy *= strength;
    tn.x *= s.x;
    tn = vec3(tn.xy + n.zy, abs(tn.z) * n.x);
    r += tn.zyx * w.x;
  }
  if (w.y > 0.01) {
    vec3 tn = textureGrad(t, vec3(p.xz * k, layer), dpx.xz * k, dpy.xz * k).xyz * 2.0 - 1.0;
    tn.xy *= strength;
    tn.x *= s.y;
    tn = vec3(tn.xy + n.xz, abs(tn.z) * n.y);
    r += tn.xzy * w.y;
  }
  if (w.z > 0.01) {
    vec3 tn = textureGrad(t, vec3(p.xy * k, layer), dpx.xy * k, dpy.xy * k).xyz * 2.0 - 1.0;
    tn.xy *= strength;
    tn.x *= -s.z;
    tn = vec3(tn.xy + n.xy, abs(tn.z) * n.z);
    r += tn.xyz * w.z;
  }
  return normalize(r);
}
vec3 triWeights(vec3 n, float sharp) {
  vec3 w = pow(abs(n), vec3(sharp));
  return w / (w.x + w.y + w.z);
}`;

// Правка MeshStandardMaterial: кусками заменяем стандартные включения.
// patch = { uniforms, vertexHead, vertexBegin, vertexEnd, fragHead, map, normal, roughness, emissive, key }
export function extendMaterial(material, patch) {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    Object.assign(shader.uniforms, patch.uniforms || {});
    let vs = shader.vertexShader;
    let fs = shader.fragmentShader;
    if (patch.vertexHead) vs = vs.replace('#include <common>', `#include <common>\n${patch.vertexHead}`);
    if (patch.vertexBegin) vs = vs.replace('#include <begin_vertex>', `#include <begin_vertex>\n${patch.vertexBegin}`);
    if (patch.vertexNormal) vs = vs.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${patch.vertexNormal}`);
    if (patch.vertexEnd) vs = vs.replace('#include <fog_vertex>', `#include <fog_vertex>\n${patch.vertexEnd}`);
    if (patch.fragHead) fs = fs.replace('#include <common>', `#include <common>\n${patch.fragHead}`);
    if (patch.map) fs = fs.replace('#include <map_fragment>', patch.map);
    if (patch.color) fs = fs.replace('#include <color_fragment>', `#include <color_fragment>\n${patch.color}`);
    if (patch.alpha) fs = fs.replace('#include <alphatest_fragment>', `${patch.alpha}\n#include <alphatest_fragment>`);
    if (patch.roughness) fs = fs.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${patch.roughness}`);
    if (patch.metalness) fs = fs.replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>\n${patch.metalness}`);
    if (patch.normalBegin) fs = fs.replace('#include <normal_fragment_begin>', patch.normalBegin);
    if (patch.normal) fs = fs.replace('#include <normal_fragment_maps>', patch.normal);
    if (patch.emissive) fs = fs.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${patch.emissive}`);
    if (patch.lights) fs = fs.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>\n${patch.lights}`);
    if (patch.end) fs = fs.replace('#include <fog_fragment>', `${patch.end}\n#include <fog_fragment>`);
    shader.vertexShader = vs;
    shader.fragmentShader = fs;
    if (patch.after) patch.after(shader);
  };
  const key = patch.key || Math.random().toString(36).slice(2);
  material.customProgramCacheKey = () => key;
  return material;
}

// Карта высот земли в текстуре — для травы и воды (выборка в шейдере вручную, без фильтрации float)
export function heightTexture(terrain) {
  const t = new THREE.DataTexture(terrain.heights, terrain.nx, terrain.nz, THREE.RedFormat, THREE.FloatType);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}

// выборка той же интерполяцией, что и Terrain.heightAt (по треугольникам)
export const HEIGHT_GLSL = /* glsl */ `
uniform sampler2D uHeight;
uniform vec4 uHeightInfo; // minX, minZ, 1/cell, cell
float terrainHeight(vec2 xz) {
  vec2 f = (xz - uHeightInfo.xy) * uHeightInfo.z;
  ivec2 sz = textureSize(uHeight, 0);
  f = clamp(f, vec2(0.0), vec2(sz) - 1.001);
  ivec2 i = ivec2(floor(f));
  vec2 t = f - vec2(i);
  float ha = texelFetch(uHeight, i, 0).r;
  float hb = texelFetch(uHeight, i + ivec2(1, 0), 0).r;
  float hc = texelFetch(uHeight, i + ivec2(0, 1), 0).r;
  float hd = texelFetch(uHeight, i + ivec2(1, 1), 0).r;
  if (t.x + t.y <= 1.0) return ha + (hb - ha) * t.x + (hc - ha) * t.y;
  return hd + (hc - hd) * (1.0 - t.x) + (hb - hd) * (1.0 - t.y);
}`;

export function heightUniforms(terrain, tex) {
  return {
    uHeight: { value: tex },
    uHeightInfo: { value: new THREE.Vector4(terrain.minX, terrain.minZ, 1 / terrain.cell, terrain.cell) },
  };
}
