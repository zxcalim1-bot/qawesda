import { WORLD, WATER_Y, RIVER, LAKE, PADS, ZONES, LANDMARK_BUMPS, ROADS } from './WorldLayout.js';
import { SURF, ROAD_SURFACE } from './Surfaces.js';
import { Simplex2, mulberry32 } from '../core/Random.js';
import { clamp, lerp, smoothstep, polylineDist } from '../core/util.js';

const SHOULDER = 2.5; // обочина, выровненная вровень с дорогой
const BLEND = 9; // откос

const yieldFrame = () => new Promise((r) => setTimeout(r, 0));

export class Terrain {
  constructor() {
    this.cell = WORLD.cell;
    this.minX = WORLD.minX;
    this.minZ = WORLD.minZ;
    this.maxX = WORLD.maxX;
    this.maxZ = WORLD.maxZ;
    this.nx = Math.round((WORLD.maxX - WORLD.minX) / this.cell) + 1;
    this.nz = Math.round((WORLD.maxZ - WORLD.minZ) / this.cell) + 1;
    const N = this.nx * this.nz;
    this.heights = new Float32Array(N);
    this.surf = new Uint8Array(N);
    this.roadDist = new Float32Array(N).fill(99);
    this.roadIdx = new Int16Array(N).fill(-1);
    this.forest = new Uint8Array(N);
    this.snow = new Uint8Array(N);
    this.zoneSink = new Uint8Array(N);

    const rng = mulberry32(WORLD.seed);
    this.nBig = new Simplex2(rng);
    this.nMid = new Simplex2(rng);
    this.nRidge = new Simplex2(rng);
    this.nForest = new Simplex2(rng);
    this.nMud = new Simplex2(rng);
    this.nSnow = new Simplex2(rng);
    this.nRough = new Simplex2(rng);

    const byId = Object.fromEntries(ROADS.map((r) => [r.id, r]));
    this.passCorridors = [
      { pts: byId.main.points, r0: 110, r1: 380, k: 0.86 },
      { pts: byId.mine_road.points, r0: 60, r1: 220, k: 0.7 },
      { pts: byId.rail.points, r0: 50, r1: 190, k: 0.8 },
      { pts: byId.factory_road.points, r0: 60, r1: 200, k: 0.6 },
      { pts: byId.tower_road.points, r0: 40, r1: 170, k: 0.78 },
    ];
    this.lakeY = 0;
  }

  // ---------- генерация ----------

  baseHeight(x, z) {
    const fW = smoothstep(-700, -1100, z);
    const mW = smoothstep(-2050, -2380, z) * (1 - smoothstep(-3220, -3460, z));
    const nW = smoothstep(-3250, -3550, z);

    let h = 14;
    h += this.nBig.fbm(x * 0.0018, z * 0.0018, 4) * (5 + 9 * fW + 6 * nW);
    h += this.nMid.fbm(x * 0.008, z * 0.008, 3) * (1.4 + 2.4 * fW);

    if (mW > 0.001) {
      const ridge = this.nRidge.ridged(x * 0.0021, z * 0.0021, 5);
      let mountain = ridge * ridge * 190 + this.nBig.noise(x * 0.004 + 7, z * 0.004) * 14 + 10;
      let pass = 0;
      for (const c of this.passCorridors) {
        const d = polylineDist(x, z, c.pts);
        pass = Math.max(pass, (1 - smoothstep(c.r0, c.r1, d)) * c.k);
      }
      h += mountain * mW * (1 - pass);
    }
    h += nW * 18;

    const ex = smoothstep(760, 1010, Math.abs(x));
    const ezN = smoothstep(-4730, -4860, z);
    const ezS = smoothstep(290, 384, z);
    const edge = Math.max(ex, ezN, ezS * 0.5);
    if (edge > 0) h += edge * (55 + this.nRidge.ridged(x * 0.004, z * 0.004, 3) * 110);

    for (const b of LANDMARK_BUMPS) {
      const dx = x - b.x, dz = z - b.z;
      const d2 = (dx * dx + dz * dz) / (b.r * b.r);
      if (d2 < 4) h += b.h * Math.exp(-d2 * 2.2);
    }
    return h;
  }

  riverCarve(x, z, h) {
    if (z > -1250 || z < -1850) return h;
    const d = polylineDist(x, z, RIVER.points);
    if (d > 200) return h;
    const f = RIVER.ford;
    const fd = Math.hypot(x - f.x, z - f.z);
    const fk = 1 - smoothstep(f.r * 0.35, f.r, fd);
    const hw = lerp(RIVER.halfWidth, f.halfWidth, fk);
    const depth = lerp(RIVER.depth, f.depth, fk);
    const bank = WATER_Y + 2.2;
    if (d < hw) return WATER_Y - 0.15 - depth * (1 - (d / hw) ** 2);
    if (d < hw + 9) return WATER_Y - 0.15 + (bank - WATER_Y + 0.15) * smoothstep(hw, hw + 9, d);
    const w = 1 - smoothstep(hw + 9, hw + 175, d);
    return lerp(h, Math.min(h, bank), w);
  }

  lakeCarve(x, z, h) {
    const d = Math.hypot(x - LAKE.x, z - LAKE.z);
    if (d > LAKE.r + 70) return h;
    if (d < LAKE.r) return this.lakeY;
    return lerp(this.lakeY + 0.5, h, smoothstep(LAKE.r, LAKE.r + 70, d));
  }

  naturalHeight(x, z) {
    let h = this.baseHeight(x, z);
    h = this.riverCarve(x, z, h);
    h = this.lakeCarve(x, z, h);
    return Math.max(h, WATER_Y - 3.5);
  }

  async generate(roads, progress = () => {}) {
    const { nx, nz, cell, minX, minZ } = this;
    const H = this.heights;

    this.lakeY = this.baseHeight(LAKE.x, LAKE.z) - 2.5;
    for (const p of PADS) p.h = this.naturalHeight(p.x, p.z);

    // 1. рельеф
    for (let iz = 0; iz < nz; iz++) {
      const z = minZ + iz * cell;
      for (let ix = 0; ix < nx; ix++) {
        const x = minX + ix * cell;
        let h = this.naturalHeight(x, z);
        for (const p of PADS) {
          const dx = x - p.x, dz = z - p.z;
          const R = p.r + p.blend;
          if (dx * dx + dz * dz > R * R) continue;
          const d = Math.sqrt(dx * dx + dz * dz);
          h = lerp(h, p.h, 1 - smoothstep(p.r, R, d));
        }
        for (const zn of ZONES) {
          const d = Math.hypot(x - zn.x, z - zn.z);
          if (d < zn.r + 10) h -= zn.sink * (1 - smoothstep(zn.r * 0.6, zn.r + 10, d));
        }
        H[iz * nx + ix] = h;
      }
      if (iz % 64 === 0) {
        progress(0.05 + 0.5 * (iz / nz), 'Насыпаем холмы');
        await yieldFrame();
      }
    }

    // 2. дороги — профили по естественному рельефу (с площадками)
    progress(0.56, 'Прокладываем дороги');
    await yieldFrame();
    roads.computeProfiles((x, z) => this.heightAt(x, z));
    this.applyRoads(roads);

    // 3. поверхности, лес, снег
    progress(0.75, 'Сажаем лес');
    await yieldFrame();
    this.classify(roads);
    progress(0.9, 'Готово почти');
  }

  applyRoads(roads) {
    const { nx, nz, cell, minX, minZ } = this;
    const N = nx * nz;
    const H = this.heights;
    const W = new Float32Array(N);
    const T = new Float32Array(N);
    const bestD = new Float32Array(N).fill(1e9);

    for (const r of roads.roads) {
      const reach = r.halfWidth + SHOULDER + BLEND;
      for (let j = 0; j < r.n - 1; j++) {
        const ax = r.x[j], az = r.z[j], bx = r.x[j + 1], bz = r.z[j + 1];
        const bridge = r.isBridgeIndex(j) && r.isBridgeIndex(j + 1);
        const x0 = Math.min(ax, bx) - reach, x1 = Math.max(ax, bx) + reach;
        const z0 = Math.min(az, bz) - reach, z1 = Math.max(az, bz) + reach;
        const ix0 = Math.max(0, Math.floor((x0 - minX) / cell)), ix1 = Math.min(nx - 1, Math.ceil((x1 - minX) / cell));
        const iz0 = Math.max(0, Math.floor((z0 - minZ) / cell)), iz1 = Math.min(nz - 1, Math.ceil((z1 - minZ) / cell));
        const dx = bx - ax, dz = bz - az;
        const l2 = dx * dx + dz * dz || 1;
        for (let iz = iz0; iz <= iz1; iz++) {
          const z = minZ + iz * cell;
          for (let ix = ix0; ix <= ix1; ix++) {
            const x = minX + ix * cell;
            let t = ((x - ax) * dx + (z - az) * dz) / l2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const px = ax + dx * t, pz = az + dz * t;
            const d = Math.hypot(x - px, z - pz);
            if (d > reach) continue;
            const v = iz * nx + ix;
            const sd = d - r.halfWidth;
            if (sd < this.roadDist[v]) {
              this.roadDist[v] = sd;
              this.roadIdx[v] = r.index;
            }
            if (bridge) continue; // под мостом не трогаем — там река
            const w = d <= r.halfWidth + SHOULDER ? 1 : 1 - smoothstep(r.halfWidth + SHOULDER, reach, d);
            const ht = r.h[j] + (r.h[j + 1] - r.h[j]) * t;
            if (w > W[v] + 1e-4 || (w >= 0.999 && d < bestD[v])) {
              W[v] = w;
              T[v] = ht;
              bestD[v] = d;
            }
          }
        }
      }
    }
    for (let v = 0; v < N; v++) {
      if (W[v] > 0) H[v] = lerp(H[v], T[v], W[v]);
    }
  }

  classify(roads) {
    const { nx, nz, cell, minX, minZ } = this;
    const H = this.heights;
    for (let iz = 0; iz < nz; iz++) {
      const z = minZ + iz * cell;
      for (let ix = 0; ix < nx; ix++) {
        const x = minX + ix * cell;
        const v = iz * nx + ix;
        const h = H[v];
        const hx = H[v + (ix < nx - 1 ? 1 : 0)] - H[v - (ix > 0 ? 1 : 0)];
        const hz = H[v + (iz < nz - 1 ? nx : 0)] - H[v - (iz > 0 ? nx : 0)];
        const slope = Math.hypot(hx, hz) / (2 * cell);

        const snowLine = -3330 + this.nSnow.noise(x * 0.004, z * 0.004) * 110;
        let snow = smoothstep(snowLine + 60, snowLine - 60, z);
        snow = Math.max(snow, smoothstep(105, 150, h));
        this.snow[v] = Math.round(clamp(snow, 0, 1) * 255);

        let s = SURF.grass;
        const mud = this.nMud.fbm(x * 0.012, z * 0.012, 2);
        const forest = this.forestDensity(x, z, h, slope);

        if (z > -1850 && z < -1250) {
          const dr = polylineDist(x, z, RIVER.points);
          if (h < WATER_Y - 0.05) s = SURF.riverbed;
          else if (dr < RIVER.halfWidth + 9 + Math.abs(mud) * 6) s = SURF.sand;
          else s = forest > 0.45 ? SURF.forest : SURF.grass;
        } else if (snow > 0.5) {
          s = slope > 0.9 ? SURF.rock : SURF.snow;
        } else if (slope > 0.75) {
          s = SURF.rock;
        } else if (forest > 0.45) {
          s = SURF.forest;
        } else if (mud > 0.6 && slope < 0.12 && z > -2100 && z < 120) {
          s = SURF.mud;
        } else if (z < -2100 && slope > 0.35) {
          s = SURF.gravel;
        }

        const dl = Math.hypot(x - LAKE.x, z - LAKE.z);
        if (dl < LAKE.r - 1) s = SURF.ice;

        for (const zn of ZONES) {
          const d = Math.hypot(x - zn.x, z - zn.z);
          if (d < zn.r * (0.85 + mud * 0.2)) {
            s = SURF[zn.surface];
            this.zoneSink[v] = 1;
          }
        }
        this.surf[v] = s;
        this.forest[v] = Math.round(forest * 255);
      }
    }
  }

  forestDensity(x, z, h, slope) {
    let n = this.nForest.fbm(x * 0.0042, z * 0.0042, 3);
    let f;
    if (z > -900) f = (n - 0.18) * 2.2; // перелески среди полей
    else if (z > -2100) f = (n + 0.35) * 1.5; // лес
    else if (z > -3400) f = (n + 0.15) * 1.4 * (1 - smoothstep(60, 110, h));
    else f = (n + 0.05) * 1.3; // северная тайга
    f *= 1 - smoothstep(0.55, 0.9, slope);
    if (h < WATER_Y + 0.6) f = 0;
    return clamp(f, 0, 1);
  }

  // ---------- запросы ----------

  idx(ix, iz) {
    return iz * this.nx + ix;
  }

  heightAt(x, z) {
    const { nx, nz, cell } = this;
    let fx = (x - this.minX) / cell;
    let fz = (z - this.minZ) / cell;
    let ix = Math.floor(fx), iz = Math.floor(fz);
    if (ix < 0) { ix = 0; fx = 0; } else if (ix > nx - 2) { ix = nx - 2; fx = nx - 1; }
    if (iz < 0) { iz = 0; fz = 0; } else if (iz > nz - 2) { iz = nz - 2; fz = nz - 1; }
    const tx = fx - ix, tz = fz - iz;
    const i = iz * nx + ix;
    const H = this.heights;
    const ha = H[i], hb = H[i + 1], hc = H[i + nx], hd = H[i + nx + 1];
    if (tx + tz <= 1) return ha + (hb - ha) * tx + (hc - ha) * tz;
    return hd + (hc - hd) * (1 - tx) + (hb - hd) * (1 - tz);
  }

  // высота + нормаль + поверхность
  sample(x, z, out) {
    const { nx, nz, cell } = this;
    let fx = (x - this.minX) / cell;
    let fz = (z - this.minZ) / cell;
    let ix = Math.floor(fx), iz = Math.floor(fz);
    if (ix < 0) { ix = 0; fx = 0; } else if (ix > nx - 2) { ix = nx - 2; fx = nx - 1; }
    if (iz < 0) { iz = 0; fz = 0; } else if (iz > nz - 2) { iz = nz - 2; fz = nz - 1; }
    const tx = fx - ix, tz = fz - iz;
    const i = iz * nx + ix;
    const H = this.heights;
    const ha = H[i], hb = H[i + 1], hc = H[i + nx], hd = H[i + nx + 1];
    let h, gx, gz;
    if (tx + tz <= 1) {
      h = ha + (hb - ha) * tx + (hc - ha) * tz;
      gx = (hb - ha) / cell;
      gz = (hc - ha) / cell;
    } else {
      h = hd + (hc - hd) * (1 - tx) + (hb - hd) * (1 - tz);
      gx = (hd - hc) / cell;
      gz = (hd - hb) / cell;
    }
    const inv = 1 / Math.sqrt(gx * gx + 1 + gz * gz);
    out.h = h;
    out.nx = -gx * inv;
    out.ny = inv;
    out.nz = -gz * inv;

    // расстояние до дороги — билинейно, чтобы край был ровный
    const R = this.roadDist;
    const rd = (R[i] * (1 - tx) + R[i + 1] * tx) * (1 - tz) + (R[i + nx] * (1 - tx) + R[i + nx + 1] * tx) * tz;
    const near = (tz < 0.5 ? i : i + nx) + (tx < 0.5 ? 0 : 1);
    out.roadDist = rd;
    out.roadIdx = this.roadIdx[near];
    out.surf = this.surf[near];
    out.snow = this.snow[near] / 255;
    out.zone = this.zoneSink[near];
    return out;
  }

  // микронеровности: на рендере их нет, но подвеска их чувствует
  roughness(x, z, amp) {
    if (amp <= 0) return 0;
    return amp * (this.nRough.noise(x * 0.32, z * 0.32) * 0.75 + this.nRough.noise(x * 1.1 + 13, z * 1.1) * 0.25);
  }

  forestAt(x, z) {
    const ix = clamp(Math.round((x - this.minX) / this.cell), 0, this.nx - 1);
    const iz = clamp(Math.round((z - this.minZ) / this.cell), 0, this.nz - 1);
    return this.forest[iz * this.nx + ix] / 255;
  }

  surfAt(x, z) {
    const ix = clamp(Math.round((x - this.minX) / this.cell), 0, this.nx - 1);
    const iz = clamp(Math.round((z - this.minZ) / this.cell), 0, this.nz - 1);
    return this.surf[iz * this.nx + ix];
  }

  roadDistAt(x, z) {
    const ix = clamp(Math.round((x - this.minX) / this.cell), 0, this.nx - 1);
    const iz = clamp(Math.round((z - this.minZ) / this.cell), 0, this.nz - 1);
    return this.roadDist[iz * this.nx + ix];
  }

  inBounds(x, z, margin = 0) {
    return x > this.minX + margin && x < this.maxX - margin && z > this.minZ + margin && z < this.maxZ - margin;
  }
}

export { ROAD_SURFACE };
