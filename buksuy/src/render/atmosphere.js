import * as THREE from 'three';

// Атмосфера: рассеяние Рэлея и Ми (одно рассеяние, как в учебнике), туман по высоте.
// Один и тот же расчёт живёт в GLSL (небо) и в JS (цвет солнца, тумана, окружения),
// чтобы горизонт и туман совпадали по цвету.

export const ATMO = {
  planet: 6371e3,
  atmos: 6471e3,
  rlh: [5.5e-6, 13.0e-6, 22.4e-6],
  ozone: [0.65e-6, 1.881e-6, 0.085e-6],
  mie: 21e-6,
  shRlh: 8e3,
  shMie: 1.2e3,
  g: 0.758,
  sun: 22,
};

export const ATMO_GLSL = /* glsl */ `
#define A_PLANET 6371e3
#define A_ATMOS 6471e3
#define A_RLH vec3(5.5e-6, 13.0e-6, 22.4e-6)
#define A_OZ vec3(0.65e-6, 1.881e-6, 0.085e-6)
#define A_MIE 21e-6
#define A_SHR 8e3
#define A_SHM 1.2e3
#define A_G 0.758

vec2 aRaySphere(vec3 ro, vec3 rd, float r) {
  float b = 2.0 * dot(rd, ro);
  float c = dot(ro, ro) - r * r;
  float d = b * b - 4.0 * c;
  if (d < 0.0) return vec2(1e5, -1e5);
  d = sqrt(d);
  return vec2(-b - d, -b + d) * 0.5;
}

// возвращает радиацию неба в направлении rd при солнце в sunDir (без диска солнца)
vec3 atmosphere(vec3 rd, vec3 sunDir, float haze) {
  vec3 ro = vec3(0.0, A_PLANET + 600.0, 0.0);
  vec2 p = aRaySphere(ro, rd, A_ATMOS);
  if (p.x > p.y) return vec3(0.0);
  vec2 pg = aRaySphere(ro, rd, A_PLANET);
  float tEnd = p.y;
  if (pg.x < pg.y && pg.x > 0.0) tEnd = pg.x;
  float tStart = max(p.x, 0.0);
  const int STEPS = 16;
  const int LSTEPS = 6;
  float ds = (tEnd - tStart) / float(STEPS);
  float t = tStart;
  vec3 totR = vec3(0.0), totM = vec3(0.0);
  float odR = 0.0, odM = 0.0;
  float mu = dot(rd, sunDir);
  float mumu = mu * mu;
  float gg = A_G * A_G;
  float pR = 3.0 / (16.0 * 3.14159) * (1.0 + mumu);
  float pM = 3.0 / (8.0 * 3.14159) * ((1.0 - gg) * (mumu + 1.0)) / (pow(1.0 + gg - 2.0 * mu * A_G, 1.5) * (2.0 + gg));
  float mieK = A_MIE * (1.0 + haze * 3.0);
  for (int i = 0; i < STEPS; i++) {
    vec3 pos = ro + rd * (t + ds * 0.5);
    float h = length(pos) - A_PLANET;
    float dR = exp(-h / A_SHR) * ds;
    float dM = exp(-h / A_SHM) * ds;
    odR += dR;
    odM += dM;
    float lt = aRaySphere(pos, sunDir, A_ATMOS).y;
    float lds = lt / float(LSTEPS);
    float lodR = 0.0, lodM = 0.0;
    float lti = 0.0;
    for (int j = 0; j < LSTEPS; j++) {
      vec3 lp = pos + sunDir * (lti + lds * 0.5);
      float lh = length(lp) - A_PLANET;
      lodR += exp(-lh / A_SHR) * lds;
      lodM += exp(-lh / A_SHM) * lds;
      lti += lds;
    }
    vec3 att = exp(-(mieK * (odM + lodM) + (A_RLH + A_OZ) * (odR + lodR)));
    totR += dR * att;
    totM += dM * att;
    t += ds;
  }
  return 22.0 * (pR * A_RLH * totR + pM * mieK * totM);
}
`;

function raySphereFar(ox, oy, oz, dx, dy, dz, r) {
  const b = 2 * (dx * ox + dy * oy + dz * oz);
  const c = ox * ox + oy * oy + oz * oz - r * r;
  const d = b * b - 4 * c;
  if (d < 0) return [1e5, -1e5];
  const s = Math.sqrt(d);
  return [(-b - s) / 2, (-b + s) / 2];
}

// JS-версия того же расчёта (чуть грубее по шагам — нужна лишь пара направлений в кадр)
export function skyRadiance(dir, sun, haze = 0, out = new THREE.Color()) {
  const A = ATMO;
  const ox = 0, oy = A.planet + 600, oz = 0;
  const [p0, p1] = raySphereFar(ox, oy, oz, dir.x, dir.y, dir.z, A.atmos);
  const g = raySphereFar(ox, oy, oz, dir.x, dir.y, dir.z, A.planet);
  let tEnd = p1;
  if (g[0] < g[1] && g[0] > 0) tEnd = g[0];
  const t0 = Math.max(p0, 0);
  const N = 12, M = 5;
  const ds = (tEnd - t0) / N;
  let t = t0;
  let odR = 0, odM = 0;
  const tot = [0, 0, 0, 0, 0, 0];
  const mu = dir.x * sun.x + dir.y * sun.y + dir.z * sun.z;
  const gg = A.g * A.g;
  const pR = (3 / (16 * Math.PI)) * (1 + mu * mu);
  const pM = (3 / (8 * Math.PI)) * ((1 - gg) * (mu * mu + 1)) / (Math.pow(1 + gg - 2 * mu * A.g, 1.5) * (2 + gg));
  const mieK = A.mie * (1 + haze * 3);
  for (let i = 0; i < N; i++) {
    const px = ox + dir.x * (t + ds / 2), py = oy + dir.y * (t + ds / 2), pz = oz + dir.z * (t + ds / 2);
    const h = Math.hypot(px, py, pz) - A.planet;
    const dR = Math.exp(-h / A.shRlh) * ds;
    const dM = Math.exp(-h / A.shMie) * ds;
    odR += dR;
    odM += dM;
    const lt = raySphereFar(px, py, pz, sun.x, sun.y, sun.z, A.atmos)[1];
    const lds = lt / M;
    let lR = 0, lM = 0, lti = 0;
    for (let j = 0; j < M; j++) {
      const qx = px + sun.x * (lti + lds / 2), qy = py + sun.y * (lti + lds / 2), qz = pz + sun.z * (lti + lds / 2);
      const lh = Math.hypot(qx, qy, qz) - A.planet;
      lR += Math.exp(-lh / A.shRlh) * lds;
      lM += Math.exp(-lh / A.shMie) * lds;
      lti += lds;
    }
    for (let k = 0; k < 3; k++) {
      const att = Math.exp(-(mieK * (odM + lM) + (A.rlh[k] + A.ozone[k]) * (odR + lR)));
      tot[k] += dR * att;
      tot[k + 3] += dM * att;
    }
    t += ds;
  }
  out.r = A.sun * (pR * A.rlh[0] * tot[0] + pM * mieK * tot[3]);
  out.g = A.sun * (pR * A.rlh[1] * tot[1] + pM * mieK * tot[4]);
  out.b = A.sun * (pR * A.rlh[2] * tot[2] + pM * mieK * tot[5]);
  return out;
}

// сколько солнечного света доходит до земли (цвет солнца на закате — отсюда)
export function sunTransmittance(sun, haze = 0, out = new THREE.Color()) {
  const A = ATMO;
  const oy = A.planet + 600;
  const g = raySphereFar(0, oy, 0, sun.x, sun.y, sun.z, A.planet);
  if (g[0] < g[1] && g[0] > 0) return out.setRGB(0, 0, 0);
  const lt = raySphereFar(0, oy, 0, sun.x, sun.y, sun.z, A.atmos)[1];
  const N = 16;
  const ds = lt / N;
  let odR = 0, odM = 0;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) * ds;
    const h = Math.hypot(sun.x * t, oy + sun.y * t, sun.z * t) - A.planet;
    odR += Math.exp(-h / A.shRlh) * ds;
    odM += Math.exp(-h / A.shMie) * ds;
  }
  const mieK = A.mie * (1 + haze * 3) * 1.1;
  out.r = Math.exp(-((A.rlh[0] + A.ozone[0]) * odR + mieK * odM));
  out.g = Math.exp(-((A.rlh[1] + A.ozone[1]) * odR + mieK * odM));
  out.b = Math.exp(-((A.rlh[2] + A.ozone[2]) * odR + mieK * odM));
  return out;
}

// ---------- туман ----------
// Свой туман для всех материалов: экспоненциальный по высоте + дымка по расстоянию,
// цвет у горизонта со стороны солнца теплее. Параметры лежат в общих массивах,
// которые three.js при клонировании униформ не копирует, а передаёт по ссылке.

export const fogState = {
  params: new Float32Array([0.0, 0.02, 0, 0.0015]), // плотность у земли, спад по высоте, высота «земли», дымка
  sun: new Float32Array([0, 1, 0, 0]), // направление на солнце + сила подсветки
  sunColor: new Float32Array([1, 0.9, 0.7]),
};

let installed = false;

export function installFog() {
  if (installed) return;
  installed = true;
  for (const lib of Object.values(THREE.ShaderLib)) {
    if (!lib.uniforms || !lib.uniforms.fogColor) continue;
    lib.uniforms.fogParams = { value: fogState.params };
    lib.uniforms.fogSun = { value: fogState.sun };
    lib.uniforms.fogSunColor = { value: fogState.sunColor };
  }
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = /* glsl */ `
#ifdef USE_FOG
  varying vec3 vFogWorldPos;
#endif`;
  C.fog_vertex = /* glsl */ `
#ifdef USE_FOG
  // мировая позиция из видовой: R^T * (mv - t)
  vFogWorldPos = transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz);
#endif`;
  C.fog_pars_fragment = /* glsl */ `
#ifdef USE_FOG
  uniform vec3 fogColor;
  uniform vec4 fogParams;
  uniform vec4 fogSun;
  uniform vec3 fogSunColor;
  varying vec3 vFogWorldPos;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`;
  C.fog_fragment = /* glsl */ `
#ifdef USE_FOG
  {
    vec3 fr = vFogWorldPos - cameraPosition;
    float fd = length(fr);
    vec3 fdir = fr / max(fd, 1e-3);
    float fb = fogParams.y;
    float camH = cameraPosition.y - fogParams.z;
    float fy = abs(fdir.y) < 1e-4 ? 1e-4 : fdir.y;
    float heightFog = fogParams.x * exp(-camH * fb) * (1.0 - exp(-fd * fy * fb)) / (fy * fb);
    float amount = 1.0 - exp(-max(heightFog, 0.0) - fd * fogParams.w);
    float sunAmt = pow(max(dot(fdir, fogSun.xyz), 0.0), 6.0) * fogSun.w;
    vec3 fc = mix(fogColor, fogSunColor, sunAmt);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fc, clamp(amount, 0.0, 1.0));
  }
#endif`;
}

// Тот же туман для своих шейдеров (вода, частицы): вернуть долю тумана
export const FOG_GLSL = /* glsl */ `
uniform vec4 fogParams;
uniform vec4 fogSun;
uniform vec3 fogSunColor;
uniform vec3 fogColor;
vec3 applyFog(vec3 col, vec3 wpos) {
  vec3 fr = wpos - cameraPosition;
  float fd = length(fr);
  vec3 fdir = fr / max(fd, 1e-3);
  float fb = fogParams.y;
  float camH = cameraPosition.y - fogParams.z;
  float fy = abs(fdir.y) < 1e-4 ? 1e-4 : fdir.y;
  float heightFog = fogParams.x * exp(-camH * fb) * (1.0 - exp(-fd * fy * fb)) / (fy * fb);
  float amount = 1.0 - exp(-max(heightFog, 0.0) - fd * fogParams.w);
  float sunAmt = pow(max(dot(fdir, fogSun.xyz), 0.0), 6.0) * fogSun.w;
  return mix(col, mix(fogColor, fogSunColor, sunAmt), clamp(amount, 0.0, 1.0));
}`;

export function fogUniforms(scene) {
  return {
    fogParams: { value: fogState.params },
    fogSun: { value: fogState.sun },
    fogSunColor: { value: fogState.sunColor },
    fogColor: { value: scene.fog.color },
  };
}
