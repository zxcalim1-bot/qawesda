import { Panel, el } from './UIManager.js';
import { WORLD, LOCATIONS } from '../world/WorldLayout.js';
import { PX } from '../systems/MapSystem.js';
import { escapeHtml } from '../core/util.js';

const ROAD_STYLE = {
  asphalt: ['#2a2622', 3.2],
  gravel: ['#7a6a58', 2.2],
  dirt: ['#8a6a48', 2],
  rail: ['#4a3a30', 2],
};

export class MapPanel extends Panel {
  constructor(game) {
    super(game.ui, { title: 'КАРТА', size: 'wide' });
    this.game = game;
    const p = game.playerPos;
    this.zoom = 1.6; // пикселей экрана на пиксель подложки
    this.cx = (p.x - WORLD.minX) / PX;
    this.cy = (p.z - WORLD.minZ) / PX;
    this.drag = null;
  }

  onKey(e) {
    if (e.code === 'KeyM') {
      this.close();
      return true;
    }
    if (e.code === 'Equal' || e.code === 'NumpadAdd') { this.zoom = Math.min(6, this.zoom * 1.25); this.draw(); return true; }
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') { this.zoom = Math.max(0.35, this.zoom / 1.25); this.draw(); return true; }
    return false;
  }

  render() {
    const g = this.game;
    this.body.innerHTML = '';
    const wrap = el('div', 'map-wrap');
    this.canvas = document.createElement('canvas');
    wrap.append(this.canvas);
    this.body.append(wrap);
    const legend = el('div', 'map-legend', [
      '▲ ты', '■ Ласточка', '◆ задание', '📍 твои метки',
      'ЛКМ — поставить метку', 'ПКМ — убрать', 'колесо — масштаб',
      `открыто ${Math.round(g.map.revealedFraction() * 100)}% карты`,
    ].map((s) => `<span>${s}</span>`).join(''));
    this.body.append(legend);
    this.footer.innerHTML = '';
    const q = g.quests.current();
    this.footer.append(el('div', 'grow', q ? `Цель: ${escapeHtml(q.text)}` : ''));
    const center = el('button', '', 'К себе');
    center.onclick = () => {
      const p = g.playerPos;
      this.cx = (p.x - WORLD.minX) / PX;
      this.cy = (p.z - WORLD.minZ) / PX;
      this.draw();
    };
    const close = el('button', '', 'Закрыть');
    close.onclick = () => this.close();
    this.footer.append(center, close);

    requestAnimationFrame(() => {
      const r = wrap.getBoundingClientRect();
      this.canvas.width = r.width;
      this.canvas.height = r.height;
      this.draw();
    });

    wrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.35, Math.min(6, this.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
      this.draw();
    }, { passive: false });
    wrap.addEventListener('mousedown', (e) => {
      this.drag = { x: e.clientX, y: e.clientY, cx: this.cx, cy: this.cy, moved: false, btn: e.button };
    });
    wrap.addEventListener('mousemove', (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) this.drag.moved = true;
      this.cx = this.drag.cx - dx / this.zoom;
      this.cy = this.drag.cy - dy / this.zoom;
      this.draw();
    });
    wrap.addEventListener('mouseup', (e) => {
      const d = this.drag;
      this.drag = null;
      if (!d || d.moved) return;
      const r = this.canvas.getBoundingClientRect();
      const wx = WORLD.minX + (this.cx + (e.clientX - r.left - this.canvas.width / 2) / this.zoom) * PX;
      const wz = WORLD.minZ + (this.cy + (e.clientY - r.top - this.canvas.height / 2) / this.zoom) * PX;
      if (d.btn === 2) g.map.removeMarkerNear(wx, wz, 30 * PX / this.zoom);
      else {
        const label = window.prompt?.('Название метки:', 'Метка') ?? 'Метка';
        if (label !== null) g.map.addMarker(wx, wz, label || 'Метка');
      }
      this.draw();
    });
    wrap.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _toScreen(x, z) {
    return [
      ((x - WORLD.minX) / PX - this.cx) * this.zoom + this.canvas.width / 2,
      ((z - WORLD.minZ) / PX - this.cy) * this.zoom + this.canvas.height / 2,
    ];
  }

  draw() {
    const g = this.game;
    const c = this.canvas;
    if (!c || !c.width) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.fillStyle = '#1a1712';
    ctx.fillRect(0, 0, W, H);
    const base = g.map.getBase();
    const ox = W / 2 - this.cx * this.zoom, oy = H / 2 - this.cy * this.zoom;
    ctx.imageSmoothingEnabled = this.zoom < 2;
    ctx.drawImage(base, ox, oy, base.width * this.zoom, base.height * this.zoom);

    // дороги (под туманом — кроме трассы, её знают все)
    this._roads(ctx, (r) => r.id !== 'main');

    // туман войны: маленькая картинка, растянутая со сглаживанием — края мягкие
    const fog = this._fogCanvas();
    const [fx0, fy0] = this._toScreen(WORLD.minX, WORLD.minZ);
    const [fx1, fy1] = this._toScreen(WORLD.maxX, WORLD.maxZ);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fog, fx0, fy0, fx1 - fx0, fy1 - fy0);

    this._roads(ctx, (r) => r.id === 'main');
    this._overlay(ctx, W, H);
  }

  _fogCanvas() {
    const map = this.game.map;
    if (!this.fogC) {
      this.fogC = document.createElement('canvas');
      this.fogC.width = map.fw;
      this.fogC.height = map.fh;
    }
    const ctx = this.fogC.getContext('2d');
    const img = ctx.createImageData(map.fw, map.fh);
    for (let i = 0; i < map.fog.length; i++) {
      const hidden = !map.fog[i];
      img.data[i * 4] = 30 + ((i * 7) % 5);
      img.data[i * 4 + 1] = 26 + ((i * 3) % 4);
      img.data[i * 4 + 2] = 20;
      img.data[i * 4 + 3] = hidden ? 255 : 0;
    }
    ctx.putImageData(img, 0, 0);
    return this.fogC;
  }

  _roads(ctx, filter) {
    const g = this.game;
    for (const r of g.world.roads.roads) {
      if (r.hidden && !r.discovered) continue;
      if (!filter(r)) continue;
      const [col, w] = ROAD_STYLE[r.type] || ROAD_STYLE.dirt;
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1, w * Math.min(1.6, this.zoom * 0.8));
      if (r.type === 'rail') ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i < r.n; i += 3) {
        const [x, y] = this._toScreen(r.x[i], r.z[i]);
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  _overlay(ctx, W, H) {
    const g = this.game;
    const map = g.map;
    // локации
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const l of LOCATIONS) {
      const known = g.world.discovered.has(l.id);
      if (!known) continue;
      const [x, y] = this._toScreen(l.x, l.z);
      ctx.font = `${Math.round(14 + this.zoom * 2)}px sans-serif`;
      ctx.fillText(l.icon, x, y);
      if (this.zoom > 0.9) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const tw = ctx.measureText(l.name).width;
        ctx.fillRect(x - tw / 2 - 4, y + 12, tw + 8, 16);
        ctx.fillStyle = '#efe6d2';
        ctx.fillText(l.fuzzy && !map.isRevealed(l.x, l.z) ? `${l.name}?` : l.name, x, y + 20);
      }
    }

    // задания
    for (const q of g.quests.list()) {
      if (q.done || !q.target) continue;
      const [x, y] = this._toScreen(q.target.x, q.target.z);
      ctx.fillStyle = q.def.main ? '#f0a63a' : '#e8c26a';
      ctx.beginPath();
      ctx.moveTo(x, y - 9); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 7, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }

    // метки игрока
    ctx.font = '18px sans-serif';
    for (const m of map.markers) {
      const [x, y] = this._toScreen(m.x, m.z);
      ctx.fillText('📍', x, y - 8);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(m.label, x, y + 10);
      ctx.font = '18px sans-serif';
    }

    // машина и игрок
    const car = g.vehicle;
    const [cxs, cys] = this._toScreen(car.pos.x, car.pos.z);
    ctx.fillStyle = '#3f8f8c';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.fillRect(cxs - 5, cys - 5, 10, 10);
    ctx.strokeRect(cxs - 5, cys - 5, 10, 10);
    const p = g.playerPos;
    const yaw = g.player.inCar ? car.yaw : g.player.yaw;
    const [px, py] = this._toScreen(p.x, p.z);
    ctx.save();
    ctx.translate(px, py);
    // в мире +Z — вниз по карте, поэтому стрелка: (sin yaw, cos yaw)
    ctx.rotate(-yaw + Math.PI);
    ctx.fillStyle = '#ff5030';
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(7, 8); ctx.lineTo(0, 4); ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // компас
    ctx.fillStyle = '#efe6d2';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('С ↑', W - 30, 22);
  }
}
