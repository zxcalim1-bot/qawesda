import { WORLD, RIVER, LAKE, WATER_Y } from '../world/WorldLayout.js';
import { makeCanvas } from '../world/materials.js';

const CELL = 32; // клетка тумана войны, м
const PX = 4; // метров на пиксель подложки

// Карта: подложка из рельефа, туман неисследованного, метки игрока.
export class MapSystem {
  constructor(game) {
    this.game = game;
    this.fw = Math.ceil((WORLD.maxX - WORLD.minX) / CELL);
    this.fh = Math.ceil((WORLD.maxZ - WORLD.minZ) / CELL);
    this.fog = new Uint8Array(this.fw * this.fh);
    this.markers = [];
    this.t = 0;
    this.base = null;
  }

  reset() {
    this.fog.fill(0);
    this.markers = [];
    // окрестности деревни известны сразу
    this.reveal(30, 100, 260);
  }

  reveal(x, z, r) {
    const cx0 = Math.floor((x - r - WORLD.minX) / CELL), cx1 = Math.floor((x + r - WORLD.minX) / CELL);
    const cz0 = Math.floor((z - r - WORLD.minZ) / CELL), cz1 = Math.floor((z + r - WORLD.minZ) / CELL);
    for (let cz = Math.max(0, cz0); cz <= Math.min(this.fh - 1, cz1); cz++) {
      for (let cx = Math.max(0, cx0); cx <= Math.min(this.fw - 1, cx1); cx++) {
        const mx = WORLD.minX + (cx + 0.5) * CELL, mz = WORLD.minZ + (cz + 0.5) * CELL;
        if (Math.hypot(mx - x, mz - z) <= r) this.fog[cz * this.fw + cx] = 1;
      }
    }
  }

  isRevealed(x, z) {
    const cx = Math.floor((x - WORLD.minX) / CELL), cz = Math.floor((z - WORLD.minZ) / CELL);
    if (cx < 0 || cz < 0 || cx >= this.fw || cz >= this.fh) return false;
    return this.fog[cz * this.fw + cx] === 1;
  }

  revealedFraction() {
    let n = 0;
    for (const v of this.fog) n += v;
    return n / this.fog.length;
  }

  update(dt) {
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 0.5;
    const g = this.game;
    const p = g.playerPos;
    // с высоты видно дальше
    const h = p.y;
    const r = (g.player.inCar ? 150 : 110) + Math.max(0, h - 30) * 1.5;
    this.reveal(p.x, p.z, r);
  }

  addMarker(x, z, label = 'Метка') {
    this.markers.push({ x, z, label });
  }

  removeMarkerNear(x, z, maxD = 60) {
    let bi = -1, bd = maxD;
    this.markers.forEach((m, i) => {
      const d = Math.hypot(m.x - x, m.z - z);
      if (d < bd) { bd = d; bi = i; }
    });
    if (bi >= 0) this.markers.splice(bi, 1);
    return bi >= 0;
  }

  // подложка карты рисуется один раз
  getBase() {
    if (this.base) return this.base;
    const t = this.game.world.terrain;
    const colors = this.game.world.terrainRenderer.colors;
    const W = Math.round((WORLD.maxX - WORLD.minX) / PX), H = Math.round((WORLD.maxZ - WORLD.minZ) / PX);
    const c = makeCanvas(W, H);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(W, H);
    const step = PX / t.cell;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const ix = Math.min(t.nx - 2, Math.floor(px * step));
        const iz = Math.min(t.nz - 2, Math.floor(py * step));
        const v = iz * t.nx + ix;
        // цвета в линейном пространстве -> sRGB
        let r = Math.pow(colors[v * 3], 1 / 2.2);
        let gg = Math.pow(colors[v * 3 + 1], 1 / 2.2);
        let b = Math.pow(colors[v * 3 + 2], 1 / 2.2);
        // отмывка рельефа
        const hx = t.heights[v + 1] - t.heights[v];
        const hz = t.heights[v + t.nx] - t.heights[v];
        const shade = 1 + (-hx * 0.7 - hz * 0.4) * 0.06;
        // высота чуть осветляет
        const hh = Math.min(1, Math.max(0, t.heights[v] / 160));
        r = r * shade + hh * 0.15;
        gg = gg * shade + hh * 0.13;
        b = b * shade + hh * 0.1;
        if (t.heights[v] < WATER_Y - 0.1) { r = 0.22; gg = 0.42; b = 0.52; }
        // бумажный оттенок
        r = r * 0.8 + 0.12;
        gg = gg * 0.8 + 0.1;
        b = b * 0.75 + 0.07;
        const i = (py * W + px) * 4;
        img.data[i] = Math.min(255, r * 255);
        img.data[i + 1] = Math.min(255, gg * 255);
        img.data[i + 2] = Math.min(255, b * 255);
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // озеро
    ctx.fillStyle = 'rgba(200,225,235,0.85)';
    ctx.beginPath();
    ctx.arc((LAKE.x - WORLD.minX) / PX, (LAKE.z - WORLD.minZ) / PX, LAKE.r / PX, 0, Math.PI * 2);
    ctx.fill();
    // река линией поверх, чтобы читалась
    ctx.strokeStyle = 'rgba(60,110,140,0.9)';
    ctx.lineWidth = (RIVER.halfWidth * 2) / PX;
    ctx.beginPath();
    RIVER.points.forEach(([x, z], i) => {
      const X = (x - WORLD.minX) / PX, Y = (z - WORLD.minZ) / PX;
      if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
    });
    ctx.stroke();
    this.base = c;
    return c;
  }

  serialize() {
    let bin = '';
    for (let i = 0; i < this.fog.length; i += 8) {
      let byte = 0;
      for (let k = 0; k < 8; k++) if (this.fog[i + k]) byte |= 1 << k;
      bin += String.fromCharCode(byte);
    }
    return { fog: btoa(bin), markers: this.markers };
  }

  deserialize(d) {
    this.fog.fill(0);
    if (d?.fog) {
      const bin = atob(d.fog);
      for (let i = 0; i < bin.length; i++) {
        const byte = bin.charCodeAt(i);
        for (let k = 0; k < 8; k++) if (i * 8 + k < this.fog.length) this.fog[i * 8 + k] = (byte >> k) & 1;
      }
    }
    this.markers = d?.markers || [];
  }
}

export { CELL, PX };
