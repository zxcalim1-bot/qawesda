import * as THREE from 'three';
import { RIVER, WATER_Y, LAKE } from './WorldLayout.js';
import { weatherUniforms } from './materials.js';
import { tex } from '../render/assets.js';
import { extendMaterial, HEIGHT_GLSL, heightUniforms, NOISE_GLSL } from '../render/shaderlib.js';
import { makeCanvas } from './materials.js';

function makeWaterNormal() {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(S, S);
  // сумма синусов — тайлится по построению
  const h = (x, y) => {
    let v = 0;
    for (let k = 1; k <= 5; k++) {
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

// Река: глубину берём из карты высот дна — у берега вода прозрачная и зеленоватая,
// на глубине тёмная, по краю пена. Рябь бежит по течению.
const FRAG_HEAD = /* glsl */ `
uniform sampler2D uWaves;
uniform float uTime;
uniform float uWaterY;
uniform float uWet;
varying vec3 vWPos;
varying vec2 vFlow;
${HEIGHT_GLSL}
${NOISE_GLSL}
`;

const FRAG_MAP = /* glsl */ `
  float depth = max(uWaterY - terrainHeight(vWPos.xz), 0.0);
  vec2 fl = normalize(vFlow + vec2(1e-4));
  vec2 side = vec2(-fl.y, fl.x);
  vec2 p = vec2(dot(vWPos.xz, side), dot(vWPos.xz, fl));
  float spd = uTime * 0.45;
  vec3 n1 = texture(uWaves, (p + vec2(0.0, -spd * 1.6)) / 7.0).xyz * 2.0 - 1.0;
  vec3 n2 = texture(uWaves, (p.yx * vec2(1.0, -1.0) + vec2(spd * 0.9, 0.0)) / 3.3 + 0.37).xyz * 2.0 - 1.0;
  vec3 n3 = texture(uWaves, (p + vec2(spd * 0.3, -spd * 3.0)) / 1.3).xyz * 2.0 - 1.0;
  vec3 wn = normalize(vec3(n1.xy + n2.xy * 0.7 + n3.xy * (0.25 + uWet * 0.9), 1.0));
  vec3 wN = normalize(vec3(side.x, 0.0, side.y) * wn.x + vec3(fl.x, 0.0, fl.y) * wn.y + vec3(0.0, 1.0, 0.0) * wn.z * 2.2);
  float absorb = 1.0 - exp(-depth * 1.4);
  vec3 shallow = vec3(0.16, 0.2, 0.13);
  vec3 deep = vec3(0.012, 0.035, 0.04);
  vec3 wc = mix(shallow, deep, absorb);
  float foam = (1.0 - smoothstep(0.02, 0.14, depth)) * smoothstep(0.45, 0.7, n_fbm(p * vec2(1.5, 0.5) + vec2(0.0, -spd * 2.0)));
  wc = mix(wc, vec3(0.75, 0.78, 0.76), foam * 0.8);
  diffuseColor.rgb = wc;
  diffuseColor.a = clamp(depth * 3.5, 0.0, 1.0) * mix(0.82, 1.0, absorb) + foam * 0.5;
  float waterRough = mix(0.035, 0.6, foam);
`;

export class Water {
  constructor(scene, terrain, heightTex) {
    this.normal = makeWaterNormal();
    this.uniforms = { uTime: { value: 0 } };
    this.material = extendMaterial(new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      depthWrite: false,
      envMapIntensity: 0.8,
    }), {
      key: 'river',
      uniforms: {
        uWaves: { value: this.normal },
        uTime: this.uniforms.uTime,
        uWaterY: { value: WATER_Y },
        uWet: weatherUniforms.uWet,
        ...heightUniforms(terrain, heightTex),
      },
      vertexHead: 'attribute vec2 aFlow;\nvarying vec3 vWPos;\nvarying vec2 vFlow;',
      vertexBegin: 'vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvFlow = aFlow;',
      fragHead: FRAG_HEAD,
      map: FRAG_MAP,
      roughness: 'roughnessFactor = waterRough;',
      normal: 'normal = normalize((viewMatrix * vec4(wN, 0.0)).xyz);',
    });
    this.group = new THREE.Group();
    scene.add(this.group);

    // лента вдоль реки
    const pts = RIVER.points;
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const len = curve.getLength();
    const n = Math.ceil(len / 6);
    const pos = [], flow = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n);
      const tan = curve.getTangentAt(i / n);
      const rx = -tan.z, rz = tan.x;
      const fd = Math.hypot(p.x - RIVER.ford.x, p.z - RIVER.ford.z);
      const w = (fd < RIVER.ford.r ? RIVER.ford.halfWidth : RIVER.halfWidth) + 14;
      pos.push(p.x - rx * w, WATER_Y, p.z - rz * w, p.x + rx * w, WATER_Y, p.z + rz * w);
      // река течёт с запада на восток по точкам — направление течения вдоль касательной
      flow.push(tan.x, tan.z, tan.x, tan.z);
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aFlow', new THREE.Float32BufferAttribute(flow, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const nrm = g.attributes.normal;
    for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
    const river = new THREE.Mesh(g, this.material);
    river.renderOrder = 2;
    this.group.add(river);

    // лёд на озере: снег пятнами поверх голубого льда
    const ice = new THREE.Mesh(
      new THREE.CircleGeometry(LAKE.r - 1, 64),
      extendMaterial(new THREE.MeshStandardMaterial({ color: 0xa9c4d2, roughness: 0.12, metalness: 0, normalMap: tex('snow_n'), normalScale: new THREE.Vector2(0.3, 0.3) }), {
        key: 'ice',
        vertexHead: 'varying vec3 vWPos;',
        vertexBegin: 'vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
        fragHead: `varying vec3 vWPos;\n${NOISE_GLSL}`,
        color: `float sn = smoothstep(0.45, 0.65, n_fbm(vWPos.xz * 0.05));
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.88, 0.92), sn);
  float iceRough = mix(0.08, 0.7, sn);`,
        roughness: 'roughnessFactor = iceRough;',
      }),
    );
    ice.rotation.x = -Math.PI / 2;
    ice.position.set(LAKE.x, terrain.lakeY + 0.03, LAKE.z);
    ice.receiveShadow = true;
    ice.renderOrder = 2;
    this.group.add(ice);
  }

  update(dt) {
    this.uniforms.uTime.value += dt;
  }
}
