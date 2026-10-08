// Статические препятствия: круги (деревья, столбы, валуны) и повернутые прямоугольники (дома, машины).
// Хранятся в сетке, чтобы не перебирать все 30 тысяч деревьев каждый шаг физики.

export class ColliderGrid {
  constructor(cellSize = 16) {
    this.cs = cellSize;
    this.cells = new Map();
    this.dynamic = new Set(); // двигающиеся (трафик) — проверяются всегда
    this._stamp = 0;
  }

  _key(ix, iz) {
    return ix * 73856093 ^ iz * 19349663;
  }

  _range(c) {
    const r = c.type === 'circle' ? c.r : Math.hypot(c.hx, c.hz);
    return [
      Math.floor((c.x - r) / this.cs), Math.floor((c.x + r) / this.cs),
      Math.floor((c.z - r) / this.cs), Math.floor((c.z + r) / this.cs),
    ];
  }

  add(c) {
    if (c.type === 'box') {
      c.cos = Math.cos(c.rot || 0);
      c.sin = Math.sin(c.rot || 0);
    }
    if (c.y0 === undefined) c.y0 = -1e5;
    if (c.y1 === undefined) c.y1 = 1e5;
    c._stamp = 0;
    if (c.moving) {
      this.dynamic.add(c);
      return c;
    }
    const [x0, x1, z0, z1] = this._range(c);
    c._cells = [];
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const k = this._key(ix, iz);
        let cell = this.cells.get(k);
        if (!cell) this.cells.set(k, (cell = []));
        cell.push(c);
        c._cells.push(k);
      }
    }
    return c;
  }

  remove(c) {
    if (c.moving) {
      this.dynamic.delete(c);
      return;
    }
    if (!c._cells) return;
    for (const k of c._cells) {
      const cell = this.cells.get(k);
      if (!cell) continue;
      const i = cell.indexOf(c);
      if (i >= 0) cell.splice(i, 1);
    }
    c._cells = null;
  }

  // обновить положение (для редких перемещений статики)
  move(c, x, z, rot) {
    this.remove(c);
    c.x = x;
    c.z = z;
    if (rot !== undefined) c.rot = rot;
    this.add(c);
  }

  query(x, z, r, out = []) {
    out.length = 0;
    const stamp = ++this._stamp;
    const x0 = Math.floor((x - r) / this.cs), x1 = Math.floor((x + r) / this.cs);
    const z0 = Math.floor((z - r) / this.cs), z1 = Math.floor((z + r) / this.cs);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const cell = this.cells.get(this._key(ix, iz));
        if (!cell) continue;
        for (const c of cell) {
          if (c._stamp === stamp || c.disabled) continue;
          c._stamp = stamp;
          out.push(c);
        }
      }
    }
    for (const c of this.dynamic) {
      if (c.disabled) continue;
      const rr = r + (c.type === 'circle' ? c.r : Math.hypot(c.hx, c.hz));
      if (Math.abs(c.x - x) < rr && Math.abs(c.z - z) < rr) out.push(c);
    }
    return out;
  }
}

// --- 2D проверки пересечения. Возвращают нормаль (из препятствия наружу) и глубину ---

// круг против прямоугольника машины (cx,cz — центр, fx,fz — «вперёд», hx/hz — полуразмеры)
export function circleVsRect(c, cx, cz, fx, fz, hx, hz, out) {
  // в локальные координаты прямоугольника: right = (-fz, fx)
  const dx = c.x - cx, dz = c.z - cz;
  const lx = -dx * fz + dz * fx; // вдоль right
  const lz = dx * fx + dz * fz; // вдоль forward
  const qx = Math.max(-hx, Math.min(hx, lx));
  const qz = Math.max(-hz, Math.min(hz, lz));
  let nx = qx - lx, nz = qz - lz; // от центра круга к ближайшей точке машины
  let d = Math.hypot(nx, nz);
  let depth;
  if (d < 1e-5) {
    // центр круга внутри машины — выталкиваем по меньшей оси
    const px = hx - Math.abs(lx), pz = hz - Math.abs(lz);
    if (px < pz) { nx = lx > 0 ? -1 : 1; nz = 0; depth = px + c.r; }
    else { nx = 0; nz = lz > 0 ? -1 : 1; depth = pz + c.r; }
    d = 1;
  } else {
    if (d >= c.r) return false;
    depth = c.r - d;
    nx /= d;
    nz /= d;
  }
  // обратно в мир
  out.nx = -nx * fz + nz * fx;
  out.nz = nx * fx + nz * fz;
  out.depth = depth;
  // точка контакта — на краю машины
  out.px = cx - qx * fz + qz * fx;
  out.pz = cz + qx * fx + qz * fz;
  return true;
}

function project(axX, axZ, pts) {
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i < 8; i += 2) {
    const p = pts[i] * axX + pts[i + 1] * axZ;
    if (p < mn) mn = p;
    if (p > mx) mx = p;
  }
  return [mn, mx];
}

function corners(cx, cz, ax, az, hx, hz, out) {
  // ax,az — ось «вперёд»; right = (-az, ax)
  const rx = -az, rz = ax;
  let k = 0;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      out[k++] = cx + rx * hx * sx + ax * hz * sz;
      out[k++] = cz + rz * hx * sx + az * hz * sz;
    }
  }
  return out;
}

const _A = new Float32Array(8), _B = new Float32Array(8);

// прямоугольник машины против повернутого бокса (SAT)
export function boxVsRect(b, cx, cz, fx, fz, hx, hz, out) {
  // ось «вперёд» бокса: rot=0 -> +Z
  const bfx = b.sin, bfz = b.cos;
  corners(cx, cz, fx, fz, hx, hz, _A);
  corners(b.x, b.z, bfx, bfz, b.hx, b.hz, _B);
  const axes = [-fz, fx, fx, fz, -bfz, bfx, bfx, bfz];
  let minDepth = Infinity, nX = 0, nZ = 0;
  for (let i = 0; i < 8; i += 2) {
    const ax = axes[i], az = axes[i + 1];
    const [a0, a1] = project(ax, az, _A);
    const [b0, b1] = project(ax, az, _B);
    const o = Math.min(a1, b1) - Math.max(a0, b0);
    if (o <= 0) return false;
    if (o < minDepth) {
      minDepth = o;
      // нормаль от бокса к машине
      const ca = (a0 + a1) / 2, cb = (b0 + b1) / 2;
      const s = ca >= cb ? 1 : -1;
      nX = ax * s;
      nZ = az * s;
    }
  }
  out.nx = nX;
  out.nz = nZ;
  out.depth = minDepth;
  // точка контакта: углы машины внутри бокса, иначе углы бокса внутри машины
  let sx = 0, sz = 0, cnt = 0;
  for (let i = 0; i < 8; i += 2) {
    if (inRect(b.x, b.z, bfx, bfz, b.hx, b.hz, _A[i], _A[i + 1])) { sx += _A[i]; sz += _A[i + 1]; cnt++; }
  }
  if (!cnt) {
    for (let i = 0; i < 8; i += 2) {
      if (inRect(cx, cz, fx, fz, hx, hz, _B[i], _B[i + 1])) { sx += _B[i]; sz += _B[i + 1]; cnt++; }
    }
  }
  if (!cnt) {
    let best = -Infinity;
    for (let i = 0; i < 8; i += 2) {
      const p = -(_A[i] * nX + _A[i + 1] * nZ);
      if (p > best) { best = p; sx = _A[i]; sz = _A[i + 1]; }
    }
    cnt = 1;
  }
  out.px = sx / cnt;
  out.pz = sz / cnt;
  return true;
}

function inRect(cx, cz, fx, fz, hx, hz, px, pz) {
  const dx = px - cx, dz = pz - cz;
  const lx = -dx * fz + dz * fx;
  const lz = dx * fx + dz * fz;
  return Math.abs(lx) <= hx + 1e-3 && Math.abs(lz) <= hz + 1e-3;
}

// простая проверка точки (игрок) против коллайдера, выталкивание
export function pushCircle(c, x, z, r, out) {
  if (c.type === 'circle') {
    const dx = x - c.x, dz = z - c.z;
    const d = Math.hypot(dx, dz);
    const R = c.r + r;
    if (d >= R || d < 1e-6) return false;
    out.x = c.x + (dx / d) * R;
    out.z = c.z + (dz / d) * R;
    return true;
  }
  // бокс: в локальные координаты
  const dx = x - c.x, dz = z - c.z;
  const fx = c.sin, fz = c.cos;
  const lx = -dx * fz + dz * fx;
  const lz = dx * fx + dz * fz;
  const qx = Math.max(-c.hx, Math.min(c.hx, lx));
  const qz = Math.max(-c.hz, Math.min(c.hz, lz));
  let ex = lx - qx, ez = lz - qz;
  let d = Math.hypot(ex, ez);
  let nlx, nlz;
  if (d < 1e-6) {
    const px = c.hx - Math.abs(lx), pz = c.hz - Math.abs(lz);
    if (px < pz) { nlx = (lx >= 0 ? c.hx : -c.hx) + (lx >= 0 ? r : -r); nlz = lz; }
    else { nlx = lx; nlz = (lz >= 0 ? c.hz : -c.hz) + (lz >= 0 ? r : -r); }
  } else {
    if (d >= r) return false;
    nlx = qx + (ex / d) * r;
    nlz = qz + (ez / d) * r;
  }
  out.x = c.x - nlx * fz + nlz * fx;
  out.z = c.z + nlx * fx + nlz * fz;
  return true;
}
