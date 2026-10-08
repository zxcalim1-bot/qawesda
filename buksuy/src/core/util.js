export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);

export function smoothstep(a, b, v) {
  const t = invLerp(a, b, v);
  return t * t * (3 - 2 * t);
}

// плавное приближение, не зависящее от fps
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;

export function weightedPick(list, weightOf) {
  let total = 0;
  for (const it of list) total += weightOf(it);
  let r = Math.random() * total;
  for (const it of list) {
    r -= weightOf(it);
    if (r <= 0) return it;
  }
  return list[list.length - 1];
}

export function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export const dist2d = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// расстояние от точки до отрезка, t — параметр проекции
export function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / len2 : 0;
  t = clamp(t, 0, 1);
  const cx = ax + dx * t, cz = az + dz * t;
  return { d: Math.hypot(px - cx, pz - cz), t, cx, cz };
}

export function polylineDist(px, pz, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const r = segDist(px, pz, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    if (r.d < best) best = r.d;
  }
  return best;
}

export function fmtMoney(n) {
  return `${Math.round(n).toLocaleString('ru-RU')} ₽`;
}

export function fmtClock(hours) {
  const h = Math.floor(hours) % 24;
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtDist(m) {
  if (m < 1000) return `${Math.round(m)} м`;
  return `${(m / 1000).toFixed(1).replace('.', ',')} км`;
}

export function textBar(pct, len = 10) {
  const full = clamp(Math.round((pct / 100) * len), 0, len);
  return '█'.repeat(full) + '░'.repeat(len - full);
}

// "1 час", "2 часа", "5 часов"
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
