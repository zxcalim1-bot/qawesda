import { ROADS, WATER_Y, RIVER } from './WorldLayout.js';
import { clamp, lerp, polylineDist } from '../core/util.js';

const STEP = 2; // шаг дискретизации осевой линии, м

const GRADE = { asphalt: 0.085, gravel: 0.13, dirt: 0.15, rail: 0.035 };
const SMOOTH = { asphalt: 16, gravel: 10, dirt: 8, rail: 22 }; // полуокно сглаживания в сэмплах

export class Road {
  constructor(def, index) {
    this.def = def;
    this.index = index;
    this.id = def.id;
    this.name = def.name;
    this.type = def.type;
    this.width = def.width;
    this.halfWidth = def.width / 2;
    this.hidden = !!def.hidden;
    this.discovered = !def.hidden;
    this.maxGrade = def.maxGrade ?? GRADE[def.type] ?? 0.12;
    this.bridges = [];
    this.n = 0;
    this.x = null;
    this.z = null;
    this.h = null;
    this.s = null;
    this.length = 0;
  }

  // сэмпл по длине дуги: интерполяция между узлами
  at(s, out = {}) {
    s = clamp(s, 0, this.length);
    let i = Math.min(this.n - 2, Math.floor(s / STEP));
    // s у нас равномерный, но на всякий случай подправим
    while (i > 0 && this.s[i] > s) i--;
    while (i < this.n - 2 && this.s[i + 1] < s) i++;
    const seg = this.s[i + 1] - this.s[i] || 1;
    const t = (s - this.s[i]) / seg;
    out.x = lerp(this.x[i], this.x[i + 1], t);
    out.z = lerp(this.z[i], this.z[i + 1], t);
    out.h = lerp(this.h[i], this.h[i + 1], t);
    const dx = this.x[i + 1] - this.x[i], dz = this.z[i + 1] - this.z[i];
    const len = Math.hypot(dx, dz) || 1;
    out.dx = dx / len;
    out.dz = dz / len;
    out.i = i;
    out.s = s;
    return out;
  }

  isBridgeIndex(i) {
    for (const b of this.bridges) if (i >= b.i0 && i <= b.i1) return b;
    return null;
  }
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function sampleSpline(points, step) {
  const dense = [];
  const P = points;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(4, Math.ceil(segLen / 1.5));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      dense.push([catmullRom(p0[0], p1[0], p2[0], p3[0], t), catmullRom(p0[1], p1[1], p2[1], p3[1], t)]);
    }
  }
  dense.push(P[P.length - 1].slice());

  // равномерная пересэмплировка
  const cum = [0];
  for (let i = 1; i < dense.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const n = Math.max(2, Math.round(total / step) + 1);
  const xs = new Float32Array(n), zs = new Float32Array(n), ss = new Float32Array(n);
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (k / (n - 1)) * total;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const t = (s - cum[j]) / seg;
    xs[k] = lerp(dense[j][0], dense[j + 1][0], t);
    zs[k] = lerp(dense[j][1], dense[j + 1][1], t);
    ss[k] = s;
  }
  return { xs, zs, ss, total };
}

export class RoadNetwork {
  constructor() {
    this.roads = ROADS.map((d, i) => new Road(d, i));
    this.byId = Object.fromEntries(this.roads.map((r) => [r.id, r]));
    this.grid = new Map(); // пространственный индекс точек осевых линий
    this.gridSize = 32;
    for (const r of this.roads) {
      const { xs, zs, ss, total } = sampleSpline(r.def.points, STEP);
      r.x = xs;
      r.z = zs;
      r.s = ss;
      r.n = xs.length;
      r.length = total;
      r.h = new Float32Array(r.n);
    }
  }

  // heightFn — «естественная» высота рельефа без дорог
  computeProfiles(heightFn) {
    const done = [];
    for (const r of this.roads) {
      const raw = new Float32Array(r.n);
      for (let i = 0; i < r.n; i++) raw[i] = heightFn(r.x[i], r.z[i]);

      const pinned = new Uint8Array(r.n);
      const h = new Float32Array(r.n);

      // мосты: где под дорогой вода
      if (!r.def.noBridge) {
        const wet = new Uint8Array(r.n);
        for (let i = 0; i < r.n; i++) {
          const dRiver = polylineDist(r.x[i], r.z[i], RIVER.points);
          if (raw[i] < WATER_Y + 1.0 && dRiver < RIVER.halfWidth + 12) wet[i] = 1;
        }
        let i = 0;
        while (i < r.n) {
          if (!wet[i]) { i++; continue; }
          let j = i;
          while (j + 1 < r.n && wet[j + 1]) j++;
          const ext = r.type === 'asphalt' ? 6 : 4;
          const i0 = Math.max(0, i - ext), i1 = Math.min(r.n - 1, j + ext);
          const deckY = WATER_Y + (r.type === 'asphalt' ? 4.2 : 2.6);
          r.bridges.push({ i0, i1, deckY, kind: r.type === 'asphalt' ? 'concrete' : 'wood' });
          for (let k = i0; k <= i1; k++) { h[k] = deckY; pinned[k] = 1; }
          i = j + 1;
        }
      }

      // брод: дорога честно уходит под воду
      if (r.def.noBridge) {
        for (let i = 0; i < r.n; i++) {
          if (raw[i] < WATER_Y + 0.4) { h[i] = raw[i]; pinned[i] = 1; }
        }
      }

      // сглаживание
      const half = SMOOTH[r.type] ?? 8;
      for (let i = 0; i < r.n; i++) {
        if (pinned[i]) continue;
        let sum = 0, cnt = 0;
        for (let k = Math.max(0, i - half); k <= Math.min(r.n - 1, i + half); k++) {
          sum += raw[k];
          cnt++;
        }
        h[i] = sum / cnt;
      }

      // стыковка с уже посчитанными дорогами: всё, что лежит на чужом полотне,
      // берёт его высоту, иначе на перекрёстке будет ступенька
      if (done.length) {
        const doneSet = new Set(done);
        for (let i = 0; i < r.n; i++) {
          if (pinned[i]) continue;
          const hit = this.nearest(r.x[i], r.z[i], 30, (o) => doneSet.has(o));
          if (!hit) continue;
          const reach = hit.road.halfWidth + r.halfWidth + 3;
          if (hit.dist < reach) {
            h[i] = hit.h;
            pinned[i] = 1;
          } else if (hit.dist < reach + 14) {
            h[i] = lerp(hit.h, h[i], (hit.dist - reach) / 14);
          }
        }
      }

      // ограничение уклона, с учётом закреплённых точек
      const g = r.maxGrade * STEP;
      for (let pass = 0; pass < 4; pass++) {
        for (let i = 1; i < r.n; i++) {
          if (pinned[i]) continue;
          h[i] = clamp(h[i], h[i - 1] - g, h[i - 1] + g);
        }
        for (let i = r.n - 2; i >= 0; i--) {
          if (pinned[i]) continue;
          h[i] = clamp(h[i], h[i + 1] - g, h[i + 1] + g);
        }
      }
      // лёгкое финальное сглаживание
      const tmp = h.slice();
      for (let i = 2; i < r.n - 2; i++) {
        if (pinned[i]) continue;
        tmp[i] = (h[i - 2] + h[i - 1] * 2 + h[i] * 3 + h[i + 1] * 2 + h[i + 2]) / 9;
      }
      r.h = tmp;
      r.raw = raw;
      r.inWater = (i) => r.def.noBridge && raw[i] < WATER_Y + 0.4;
      done.push(r);
      this._indexRoad(r);
    }
  }

  _buildIndex() {
    this.grid.clear();
    for (const r of this.roads) this._indexRoad(r);
  }

  _indexRoad(r) {
    const gs = this.gridSize;
    for (let i = 0; i < r.n; i += 2) {
      const key = `${Math.floor(r.x[i] / gs)},${Math.floor(r.z[i] / gs)}`;
      let cell = this.grid.get(key);
      if (!cell) this.grid.set(key, (cell = []));
      cell.push(r.index, i);
    }
  }

  // ближайшая точка на дороге. filter(road) -> bool
  nearest(x, z, maxDist = 80, filter = null) {
    const gs = this.gridSize;
    const rad = Math.ceil(maxDist / gs);
    const cx = Math.floor(x / gs), cz = Math.floor(z / gs);
    let best = null, bd = maxDist;
    for (let gx = cx - rad; gx <= cx + rad; gx++) {
      for (let gz = cz - rad; gz <= cz + rad; gz++) {
        const cell = this.grid.get(`${gx},${gz}`);
        if (!cell) continue;
        for (let k = 0; k < cell.length; k += 2) {
          const r = this.roads[cell[k]];
          if (filter && !filter(r)) continue;
          const i = cell[k + 1];
          // уточняем на соседних отрезках
          for (let j = Math.max(0, i - 2); j < Math.min(r.n - 1, i + 2); j++) {
            const ax = r.x[j], az = r.z[j], bx = r.x[j + 1], bz = r.z[j + 1];
            const dx = bx - ax, dz = bz - az;
            const l2 = dx * dx + dz * dz || 1;
            const t = clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1);
            const px = ax + dx * t, pz = az + dz * t;
            const d = Math.hypot(x - px, z - pz);
            if (d < bd) {
              bd = d;
              const len = Math.sqrt(l2);
              // >0 — справа по ходу (право для направления (dx,dz) — это (-dz, dx))
              const side = Math.sign(-(x - px) * dz + (z - pz) * dx) || 1;
              best = {
                road: r, i: j, t, dist: d, x: px, z: pz,
                h: lerp(r.h[j], r.h[j + 1], t), s: r.s[j] + t * len,
                dx: dx / len, dz: dz / len, side,
              };
            }
          }
        }
      }
    }
    return best;
  }

  // высота настила моста в точке (или null)
  bridgeAt(x, z) {
    for (const r of this.roads) {
      for (const b of r.bridges) {
        for (let j = b.i0; j < b.i1; j++) {
          const ax = r.x[j], az = r.z[j], bx = r.x[j + 1], bz = r.z[j + 1];
          const dx = bx - ax, dz = bz - az;
          const l2 = dx * dx + dz * dz || 1;
          const t = ((x - ax) * dx + (z - az) * dz) / l2;
          if (t < -0.01 || t > 1.01) continue;
          const px = ax + dx * t, pz = az + dz * t;
          if (Math.hypot(x - px, z - pz) < r.halfWidth + 0.7) {
            return { h: lerp(r.h[j], r.h[j + 1], clamp(t, 0, 1)), bridge: b, road: r };
          }
        }
      }
    }
    return null;
  }

  // точка на дороге примерно через dist метров по направлению (dirX,dirZ)
  pointAhead(x, z, dirX, dirZ, dist, filter = null) {
    const n = this.nearest(x, z, 60, filter);
    if (!n) return null;
    const forward = n.dx * dirX + n.dz * dirZ >= 0 ? 1 : -1;
    const s = n.s + forward * dist;
    if (s < 5 || s > n.road.length - 5) return null;
    const p = n.road.at(s);
    p.road = n.road;
    p.dir = forward;
    return p;
  }

  serializeDiscovered() {
    return this.roads.filter((r) => r.hidden && r.discovered).map((r) => r.id);
  }
}
