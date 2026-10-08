import { el } from './UIManager.js';
import { escapeHtml } from '../core/util.js';

// Диалоговое окно внизу экрана. Цифры 1-9 выбирают вариант, пробел/Enter — дальше.
export class DialogPanel {
  constructor(game, system) {
    this.game = game;
    this.ui = game.ui;
    this.system = system;
    this.wrap = el('div', 'dialog panel-wrap');
    this.wrap.style.background = 'transparent';
    this.wrap.style.alignItems = 'flex-end';
    this.wrap.style.position = 'fixed';
    this.box = el('div', 'box');
    this.box.style.width = 'min(820px, 94vw)';
    this.box.style.marginBottom = '40px';
    this.wrap.append(this.box);
    this.typing = null;
  }

  open() {
    this.ui.pushPanel(this);
  }

  close() {
    clearInterval(this.typing);
    this.ui.popPanel(this);
  }

  onClose() {
    // закрыли крестиком/Esc — диалог тоже закончился
    if (this.system.panel === this) {
      this.system.panel = null;
      this.system.node = null;
    }
  }

  onKey(e) {
    if (!this.current) return false;
    const opts = this.current.options;
    if (opts) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= opts.length) {
        this.system.choose(opts[n - 1]);
        return true;
      }
      return e.code !== 'Escape';
    }
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
      if (this.typing) this._finishTyping();
      else this.system.advance();
      return true;
    }
    return false;
  }

  show(node) {
    this.current = node;
    const who = node.who === 'me' ? 'Ты' : node.name;
    this.box.innerHTML = '';
    this.box.append(el('div', 'who', `${escapeHtml(who)}${node.title ? `<small>${escapeHtml(node.title)}</small>` : ''}`));
    const text = el('div', 'text', '');
    this.box.append(text);
    this._type(text, node.text);
    if (node.options) {
      const opts = el('div', 'opts');
      node.options.forEach((o, i) => {
        const b = el('button', '', `<span class="n">${i + 1}.</span>${escapeHtml(o.text)}`);
        b.onclick = () => this.system.choose(o);
        opts.append(b);
      });
      this.box.append(opts);
    } else {
      const b = el('button', 'primary', node.end ? 'Закончить разговор' : 'Дальше ▸');
      b.style.marginTop = '4px';
      b.onclick = () => {
        if (this.typing) this._finishTyping();
        else this.system.advance();
      };
      this.box.append(b);
    }
    if (node.who !== 'me') this.game.audio.play('blip');
  }

  _type(elm, text) {
    clearInterval(this.typing);
    this.fullText = text;
    this.textEl = elm;
    let i = 0;
    this.typing = setInterval(() => {
      i += 2;
      elm.textContent = text.slice(0, i);
      if (i >= text.length) this._finishTyping();
    }, 16);
  }

  _finishTyping() {
    clearInterval(this.typing);
    this.typing = null;
    if (this.textEl) this.textEl.textContent = this.fullText;
  }
}
