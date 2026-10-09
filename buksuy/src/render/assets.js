import * as THREE from 'three';

// Фото-текстуры (CC0, Poly Haven и ambientCG) — см. tools/fetch_textures.py.
// _c — цвет, _n — нормали (OpenGL), _h — высота для смешивания слоёв земли.

const FILES = import.meta.glob('../assets/tex/*.webp', { eager: true, query: '?url', import: 'default' });

const urls = {};
for (const [path, url] of Object.entries(FILES)) {
  urls[path.split('/').pop().replace('.webp', '')] = url;
}

const images = {};
const cache = {};
let maxAniso = 8;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`не грузится ${url}`));
    img.src = url;
  });
}

export async function loadAssets(renderer, progress = () => {}) {
  maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const names = Object.keys(urls);
  let done = 0;
  await Promise.all(names.map(async (n) => {
    images[n] = await loadImage(urls[n]);
    done++;
    progress(done / names.length);
  }));
}

export function hasImage(name) {
  return !!images[name];
}

// обычная текстура: цвет — в sRGB, нормали и прочее — линейно
export function tex(name, repeat = true) {
  if (cache[name]) return cache[name];
  const img = images[name];
  if (!img) throw new Error(`нет текстуры ${name}`);
  const t = new THREE.Texture(img);
  t.colorSpace = name.endsWith('_c') || !/_[nh]$/.test(name) ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
  t.needsUpdate = true;
  cache[name] = t;
  return t;
}

function pixels(img, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size).data;
}

// Массив текстур для шейдеров со слоями. layers — список { c, n, h } (имена картинок).
// В альфу цвета кладём высоту (если есть), в альфу нормалей — 255.
// Строки переворачиваем: у DataArrayTexture нет flipY, а нормали должны смотреть как у обычных текстур.
export function textureArrays(layers, size) {
  const key = layers.map((l) => l.c).join('|') + size;
  if (cache[key]) return cache[key];
  const L = layers.length;
  const col = new Uint8Array(size * size * 4 * L);
  const nrm = new Uint8Array(size * size * 4 * L);
  const avg = [];
  const row = size * 4;
  layers.forEach((l, i) => {
    const c = pixels(images[l.c], size);
    const n = pixels(images[l.n], size);
    const h = l.h && images[l.h] ? pixels(images[l.h], size) : null;
    const base = i * size * size * 4;
    let lum = 0;
    for (let y = 0; y < size; y++) {
      const src = y * row, dst = base + (size - 1 - y) * row;
      for (let x = 0; x < row; x += 4) {
        col[dst + x] = c[src + x];
        col[dst + x + 1] = c[src + x + 1];
        col[dst + x + 2] = c[src + x + 2];
        col[dst + x + 3] = h ? h[src + x] : 128;
        nrm[dst + x] = n[src + x];
        nrm[dst + x + 1] = n[src + x + 1];
        nrm[dst + x + 2] = n[src + x + 2];
        nrm[dst + x + 3] = 255;
        lum += c[src + x] * 0.3 + c[src + x + 1] * 0.59 + c[src + x + 2] * 0.11;
      }
    }
    // средняя яркость (в линейном виде) — чтобы тонировать слой цветом без потери яркости
    avg.push(Math.pow(lum / (size * size * 255), 2.2));
  });
  const make = (data, srgb) => {
    const t = new THREE.DataArrayTexture(data, size, size, L);
    t.format = THREE.RGBAFormat;
    t.type = THREE.UnsignedByteType;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = maxAniso;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.needsUpdate = true;
    return t;
  };
  const res = { color: make(col, true), normal: make(nrm, false), avg };
  cache[key] = res;
  return res;
}
