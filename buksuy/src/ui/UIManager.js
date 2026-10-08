import * as THREE from 'three';
import { escapeHtml, fmtClock, fmtMoney } from '../core/util.js';

const KEY_LABEL = {
  interact: 'E', enter: 'F', push: 'G', ignition: 'Q', glovebox: 'B', sleep: 'Z', lights: 'L', radio: 'R',
};

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

// Модальная панель: заголовок, тело, подвал. render() перерисовывает содержимое.
export class Panel {
  constructor(ui, opts = {}) {
    this.ui = ui;
    this.opts = opts;
    this.wrap = el('div', 'panel-wrap');
    this.panel = el('div', `panel ${opts.size || ''}`);
    this.header = el('header');
    this.title = el('h2', '', escapeHtml(opts.title || ''));
    const x = el('button', 'x', '✕');
    x.onclick = () => this.close();
    this.header.append(this.title, x);
    this.tabs = el('div', 'tabs');
    this.body = el('div', 'body');
    this.footer = el('footer');
    this.panel.append(this.header);
    if (opts.tabs) this.panel.append(this.tabs);
    this.panel.append(this.body, this.footer);
    this.wrap.append(this.panel);
    this.wrap.addEventListener('mousedown', (e) => {
      if (e.target === this.wrap && opts.closeOnBackdrop !== false) this.close();
    });
  }

  setTitle(t) {
    this.title.textContent = t;
  }

  open() {
    this.ui.pushPanel(this);
    return this;
  }

  close() {
    this.ui.popPanel(this);
  }

  onKey() {
    return false;
  }
}

export class UIManager {
  constructor(game) {
    this.game = game;
    this.root = document.getElementById('ui');
    this.stack = [];
    this.notesEl = el('div', 'notes');
    this.promptEl = el('div', 'prompts');
    this.hudEl = el('div', 'hud hidden');
    this.iconsEl = el('div', 'hud-icons');
    this.topEl = el('div', 'hud-top');
    this.subsEl = el('div', 'subs');
    this.radioEl = el('div', 'radio-box hidden');
    this.namesEl = el('div', 'names');
    this.fadeEl = el('div', 'fade-layer');
    this.vignetteEl = el('div', 'vignette');
    this.fpsEl = el('div', 'fps');
    this.root.append(this.vignetteEl, this.namesEl, this.hudEl, this.iconsEl, this.topEl, this.promptEl, this.subsEl, this.radioEl, this.notesEl, this.fpsEl, this.fadeEl);
    this._lastPrompt = '';
    this.subQueue = [];
    this.subTimer = 0;
    this.nameTags = new Map();
    this.hudVisible = false;
    this._fps = { t: 0, n: 0 };

    window.addEventListener('keydown', (e) => {
      const top = this.stack[this.stack.length - 1];
      if (!top) return;
      // клавиша, которую съела панель, не должна дойти до игры (иначе Esc закроет и тут же откроет паузу)
      if (top.onKey(e)) {
        e.preventDefault();
        this.game.input.justPressed.delete(e.code);
        return;
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        this.game.input.justPressed.delete(e.code);
        top.close();
      }
    });
  }

  get modal() {
    return this.stack.length > 0;
  }

  pushPanel(p) {
    if (this.stack.includes(p)) return;
    this.stack.push(p);
    this.root.append(p.wrap);
    p.render?.();
    this.game.input.unlockPointer();
    this.game.events.emit('ui-modal', { open: true });
  }

  popPanel(p) {
    const i = this.stack.indexOf(p);
    if (i < 0) return;
    this.stack.splice(i, 1);
    p.wrap.remove();
    p.onClose?.();
    if (!this.stack.length) this.game.events.emit('ui-modal', { open: false });
  }

  closeAll() {
    for (const p of [...this.stack]) p.close();
  }

  topPanel() {
    return this.stack[this.stack.length - 1] || null;
  }

  // ---------- загрузка ----------
  showLoading() {
    this.loadingEl = el('div', 'loading', `<div class="logo">БУКСУЙ</div><div class="bar"><div></div></div><div class="what">Подкачиваем колёса…</div>`);
    document.body.append(this.loadingEl);
  }

  loading(p, text) {
    if (!this.loadingEl) return;
    this.loadingEl.querySelector('.bar > div').style.width = `${Math.round(p * 100)}%`;
    if (text) this.loadingEl.querySelector('.what').textContent = text;
  }

  hideLoading() {
    if (!this.loadingEl) return;
    const l = this.loadingEl;
    l.style.opacity = 0;
    setTimeout(() => l.remove(), 700);
    this.loadingEl = null;
  }

  // ---------- уведомления ----------
  notify(text, kind = '') {
    const n = el('div', `note ${kind}`, text);
    this.notesEl.append(n);
    while (this.notesEl.children.length > 6) this.notesEl.firstChild.remove();
    const life = kind === 'big' ? 5500 : 4200 + text.length * 25;
    setTimeout(() => n.classList.add('fade'), life);
    setTimeout(() => n.remove(), life + 600);
  }

  toast(title, sub, icon = '🏆') {
    const t = el('div', 'toast', `<div class="t">${icon} ${escapeHtml(title)}</div><div class="s">${escapeHtml(sub)}</div>`);
    this.root.append(t);
    setTimeout(() => (t.style.opacity = 0), 5000);
    setTimeout(() => t.remove(), 5800);
  }

  // реплики попутчиков и прочее — снизу по центру
  subtitle(who, text, dur = 4) {
    this.subQueue.push({ who, text, dur });
  }

  radio(station, text, show = true) {
    if (!show) {
      this.radioEl.classList.add('hidden');
      return;
    }
    this.radioEl.innerHTML = `<div class="st">${escapeHtml(station)}</div>${text ? `<div>${escapeHtml(text)}</div>` : ''}`;
    this.radioEl.classList.remove('hidden');
    clearTimeout(this._radioT);
    this._radioT = setTimeout(() => this.radioEl.classList.add('hidden'), text ? 7000 + text.length * 40 : 2500);
  }

  prompt(list) {
    const key = list ? list.map((p) => p.key + p.label + Math.round(p.progress * 20)).join('|') : '';
    if (key === this._lastPrompt) return;
    this._lastPrompt = key;
    if (!list || !list.length) {
      this.promptEl.innerHTML = '';
      return;
    }
    this.promptEl.innerHTML = list
      .map((p) => `<div class="prompt"><kbd>${KEY_LABEL[p.key] || p.key}</kbd>${escapeHtml(p.label)}${p.hold ? ' <small style="color:#a99f8d">(удерживать)</small>' : ''}${p.progress > 0 ? `<div class="hold" style="width:${p.progress * 100}%"></div>` : ''}</div>`)
      .join('');
  }

  fade(on) {
    this.fadeEl.classList.toggle('on', on);
  }

  async fadeThrough(fn) {
    this.fade(true);
    await new Promise((r) => setTimeout(r, 650));
    await fn();
    this.fade(false);
  }

  setHudVisible(v) {
    this.hudVisible = v;
    this.hudEl.classList.toggle('hidden', !v);
    this.topEl.style.display = v ? '' : 'none';
    this.iconsEl.style.display = v ? '' : 'none';
  }

  // ---------- HUD ----------
  update(dt) {
    const g = this.game;
    // субтитры
    if (this.subTimer > 0) {
      this.subTimer -= dt;
      if (this.subTimer <= 0) this.subsEl.innerHTML = '';
    } else if (this.subQueue.length) {
      const s = this.subQueue.shift();
      this.subsEl.innerHTML = `${s.who ? `<b>${escapeHtml(s.who)}:</b> ` : ''}${escapeHtml(s.text)}`;
      this.subTimer = s.dur;
    }

    if (g.settings.get('showFps')) {
      this._fps.t += dt;
      this._fps.n++;
      if (this._fps.t > 0.5) {
        this.fpsEl.textContent = `${Math.round(this._fps.n / this._fps.t)} fps · ${g.renderer.info.render.calls} dc · ${Math.round(g.renderer.info.render.triangles / 1000)}k tri`;
        this._fps.t = 0;
        this._fps.n = 0;
      }
    } else this.fpsEl.textContent = '';

    if (g.state !== 'playing' || !this.hudVisible) {
      this.namesEl.innerHTML = '';
      return;
    }
    this._hud();
    this._names();
  }

  _hud() {
    const g = this.game;
    const car = g.vehicle;
    const dmg = car.damage;
    const inCar = g.player.inCar;
    const fuel = Math.round(car.fuel.fraction * 100);
    const eng = Math.round(dmg.hp('engine'));
    let html;
    if (inCar) {
      const kmh = Math.round(car.speedKmh);
      html = `<div><span class="big">${kmh}</span><span class="lbl">км/ч</span> <span class="gear">${car.engine.on ? car.gearLabel : '·'}</span></div>`
        + `<div class="${fuel < 12 ? 'warn' : ''}">⛽ ${fuel}%</div>`
        + `<div class="${eng < 30 ? 'warn' : ''}">⚙ ${eng}%</div>`;
    } else {
      html = `<div class="${fuel < 12 ? 'warn' : ''}">⛽ ${fuel}%</div><div class="${eng < 30 ? 'warn' : ''}">⚙ ${eng}%</div>`;
      const en = g.needs ? Math.round(g.needs.energy) : 100;
      if (en < 35) html += `<div class="warn">☕ ${en}%</div>`;
    }
    if (html !== this._hudHtml) {
      this.hudEl.innerHTML = html;
      this._hudHtml = html;
    }

    const icons = [];
    if (car.engine.temp > 108) icons.push('🌡 перегрев');
    if (dmg.fluids.oil < 0.15) icons.push('🛢 масло');
    if (car.engine.on && (dmg.hasFault('belt') || dmg.fluids.charge < 0.15)) icons.push('🔋 зарядка');
    if (dmg.flat.some((f) => f)) icons.push('🛞 колесо');
    if (car.engine.on && dmg.hp('brakes') < 20) icons.push('🛑 тормоза');
    const iconsHtml = inCar ? icons.map((i) => `<span>${i}</span>`).join('') : '';
    if (iconsHtml !== this._iconsHtml) {
      this.iconsEl.innerHTML = iconsHtml;
      this._iconsHtml = iconsHtml;
    }

    const w = g.world.weather.info;
    const top = `<div>${w.icon} ${fmtClock(g.world.dayNight.time)} · день ${g.world.dayNight.day}</div><div class="money">${fmtMoney(g.inventory.money)}</div>`;
    if (top !== this._topHtml) {
      this.topEl.innerHTML = top;
      this._topHtml = top;
    }

    const en = g.needs ? g.needs.energy : 100;
    this.vignetteEl.style.opacity = en < 15 ? (15 - en) / 15 * 0.8 + (g.needs?.blink || 0) : (g.needs?.blink || 0);
  }

  _names() {
    const g = this.game;
    const cam = g.camera;
    const w = window.innerWidth, h = window.innerHeight;
    const v = new THREE.Vector3();
    const seen = new Set();
    for (const npc of g.npcs?.visible() || []) {
      v.copy(npc.root.position);
      v.y += 2.15;
      const d = v.distanceTo(cam.position);
      if (d > 14) continue;
      v.project(cam);
      if (v.z > 1) continue;
      let tag = this.nameTags.get(npc.id);
      if (!tag) {
        tag = el('div', 'name', `${escapeHtml(npc.def.name)} <small>${escapeHtml(npc.def.title || '')}</small>`);
        this.nameTags.set(npc.id, tag);
      }
      if (!tag.parentNode) this.namesEl.append(tag);
      tag.style.left = `${((v.x + 1) / 2) * w}px`;
      tag.style.top = `${((1 - v.y) / 2) * h}px`;
      tag.style.opacity = d > 10 ? (14 - d) / 4 : 1;
      seen.add(npc.id);
    }
    for (const [id, tag] of this.nameTags) if (!seen.has(id) && tag.parentNode) tag.remove();
  }
}
