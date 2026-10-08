import * as THREE from 'three';

// Общие процедурные текстуры и «погодный» патч материалов (мокрый асфальт, снег).

export const weatherUniforms = {
  uWet: { value: 0 },
  uSnow: { value: 0 },
  uTime: { value: 0 },
  uDetail: { value: null },
};

function tileableNoise(size, octaves, seed = 1) {
  const out = new Float32Array(size * size);
  let amp = 1, norm = 0;
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let o = 0; o < octaves; o++) {
    const cells = 4 << o;
    const grid = new Float32Array(cells * cells);
    for (let i = 0; i < grid.length; i++) grid[i] = rnd();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * cells, fy = (y / size) * cells;
        const ix = Math.floor(fx), iy = Math.floor(fy);
        const tx = fx - ix, ty = fy - iy;
        const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
        const a = grid[(iy % cells) * cells + (ix % cells)];
        const b = grid[(iy % cells) * cells + ((ix + 1) % cells)];
        const c = grid[((iy + 1) % cells) * cells + (ix % cells)];
        const d = grid[((iy + 1) % cells) * cells + ((ix + 1) % cells)];
        out[y * size + x] += ((a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy) * amp;
      }
    }
    norm += amp;
    amp *= 0.55;
  }
  for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

let detailTex = null;
export function getDetailTexture() {
  if (detailTex) return detailTex;
  const size = 256;
  const n = tileableNoise(size, 5, 7);
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < n.length; i++) {
    const v = Math.max(0, Math.min(255, (n[i] - 0.5) * 2.2 * 128 + 128));
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  detailTex = new THREE.CanvasTexture(c);
  detailTex.wrapS = detailTex.wrapT = THREE.RepeatWrapping;
  detailTex.colorSpace = THREE.NoColorSpace;
  detailTex.anisotropy = 4;
  weatherUniforms.uDetail.value = detailTex;
  return detailTex;
}

// Патч для MeshStandardMaterial: детализация по мировым координатам + мокро/снег.
// opts.detail — сила детализации, opts.snowNormal — снег только на горизонтальном
export function patchWeather(material, opts = {}) {
  const detail = opts.detail ?? 0.5;
  const detailScale = opts.detailScale ?? 0.11;
  const snowAmt = opts.snow ?? 1;
  const wetDark = opts.wetDark ?? 0.35;
  getDetailTexture();
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWet = weatherUniforms.uWet;
    shader.uniforms.uSnow = weatherUniforms.uSnow;
    shader.uniforms.uDetail = weatherUniforms.uDetail;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNorm;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvec4 wp_ = modelMatrix * vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwp_ = modelMatrix * instanceMatrix * vec4(transformed, 1.0);\n#endif\nvWPos = wp_.xyz;\nvWNorm = normalize(mat3(modelMatrix) * objectNormal);',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNorm;\nuniform float uWet;\nuniform float uSnow;\nuniform sampler2D uDetail;',
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float dt_ = texture2D(uDetail, vWPos.xz * ${detailScale.toFixed(4)}).r * 0.6 + texture2D(uDetail, vWPos.xz * ${(detailScale * 0.12).toFixed(4)}).r * 0.4;
        diffuseColor.rgb *= ${(1 - detail).toFixed(3)} + dt_ * ${(detail * 2).toFixed(3)};
        float snowK_ = uSnow * ${snowAmt.toFixed(2)} * smoothstep(0.5, 0.85, vWNorm.y) * (0.65 + dt_ * 0.7);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.89, 0.94), clamp(snowK_, 0.0, 1.0));
        diffuseColor.rgb *= 1.0 - uWet * ${wetDark.toFixed(2)} * (1.0 - clamp(snowK_, 0.0, 1.0));`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.35, uWet * 0.75);',
      );
  };
  material.customProgramCacheKey = () => `weather-${detail}-${detailScale}-${snowAmt}-${wetDark}`;
  return material;
}

// sRGB -> linear для вершинных цветов
export function srgb(r, g, b, out = []) {
  out[0] = Math.pow(r, 2.2);
  out[1] = Math.pow(g, 2.2);
  out[2] = Math.pow(b, 2.2);
  return out;
}

// --- текстуры дорог ---

function noiseFill(ctx, w, h, base, spread, alpha = 1, step = 2) {
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const v = base + (Math.random() - 0.5) * spread;
      ctx.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},${alpha})`;
      ctx.fillRect(x, y, step, step);
    }
  }
}

export function makeRoadTexture(type) {
  const W = 128, H = 512;
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d');
  if (type === 'asphalt') {
    ctx.fillStyle = '#3b3c3e';
    ctx.fillRect(0, 0, W, H);
    noiseFill(ctx, W, H, 60, 28, 0.5);
    // заплатки
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = `rgba(30,30,32,${0.3 + Math.random() * 0.3})`;
      ctx.fillRect(10 + Math.random() * 90, Math.random() * H, 10 + Math.random() * 30, 20 + Math.random() * 60);
    }
    // трещины
    ctx.strokeStyle = 'rgba(20,20,20,0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      let x = Math.random() * W, y = Math.random() * H;
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (Math.random() - 0.5) * 18;
        y += Math.random() * 14;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // разметка: прерывистая по центру, сплошные по краям, слегка стёртая
    ctx.fillStyle = 'rgba(225,220,200,0.75)';
    for (let y = 0; y < H; y += 128) ctx.fillRect(W / 2 - 2, y, 4, 64);
    ctx.fillStyle = 'rgba(225,220,200,0.55)';
    ctx.fillRect(6, 0, 3, H);
    ctx.fillRect(W - 9, 0, 3, H);
    ctx.globalCompositeOperation = 'multiply';
    noiseFill(ctx, W, H, 210, 90, 0.35, 4);
    ctx.globalCompositeOperation = 'source-over';
    // обочина
    ctx.fillStyle = 'rgba(110,100,85,0.9)';
    ctx.fillRect(0, 0, 4, H);
    ctx.fillRect(W - 4, 0, 4, H);
  } else if (type === 'dirt' || type === 'gravel') {
    const base = type === 'dirt' ? [118, 96, 68] : [128, 122, 110];
    ctx.fillStyle = `rgb(${base})`;
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        const k = 0.8 + Math.random() * 0.4;
        ctx.fillStyle = `rgb(${base[0] * k | 0},${base[1] * k | 0},${base[2] * k | 0})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // колеи
    ctx.fillStyle = type === 'dirt' ? 'rgba(70,52,34,0.45)' : 'rgba(90,86,78,0.4)';
    ctx.fillRect(W * 0.22, 0, W * 0.14, H);
    ctx.fillRect(W * 0.64, 0, W * 0.14, H);
    // трава по краю и посередине
    ctx.fillStyle = 'rgba(80,110,50,0.55)';
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, 6 + Math.random() * 8, 3);
      ctx.fillRect(W - 6 - Math.random() * 8, y, 14, 3);
      if (type === 'dirt' && Math.random() < 0.6) ctx.fillRect(W / 2 - 4 + Math.random() * 4, y, 4 + Math.random() * 4, 3);
    }
    if (type === 'gravel') {
      for (let i = 0; i < 900; i++) {
        const v = 90 + Math.random() * 100;
        ctx.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 2, 2);
      }
    }
  } else if (type === 'rail') {
    ctx.fillStyle = '#5d554b';
    ctx.fillRect(0, 0, W, H);
    noiseFill(ctx, W, H, 95, 40, 0.6);
    // шпалы
    for (let y = 0; y < H; y += 32) {
      ctx.fillStyle = `rgb(${70 + Math.random() * 20},${52 + Math.random() * 10},${36})`;
      ctx.fillRect(14, y, W - 28, 14);
    }
    // рельсы, ржавые
    ctx.fillStyle = '#6f4a32';
    ctx.fillRect(W * 0.3, 0, 6, H);
    ctx.fillRect(W * 0.7 - 6, 0, 6, H);
    ctx.fillStyle = 'rgba(190,170,150,0.5)';
    ctx.fillRect(W * 0.3 + 1, 0, 2, H);
    ctx.fillRect(W * 0.7 - 5, 0, 2, H);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// надпись на табличке
export function makeTextTexture(lines, opts = {}) {
  const w = opts.w ?? 512, h = opts.h ?? 256;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = opts.bg ?? '#1f5fa8';
  ctx.fillRect(0, 0, w, h);
  if (opts.border !== false) {
    ctx.strokeStyle = opts.fg ?? '#fff';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  }
  ctx.fillStyle = opts.fg ?? '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = opts.size ?? 56;
  ctx.font = `bold ${size}px "Arial Narrow", Arial, sans-serif`;
  lines.forEach((ln, i) => {
    ctx.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15, w - 40);
  });
  if (opts.dirty) {
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(60,40,20,${Math.random() * 0.25})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 10, 2 + Math.random() * 6);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
