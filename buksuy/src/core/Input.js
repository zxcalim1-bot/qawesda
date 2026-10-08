// Клавиатура + мышь. Коды клавиш через e.code, чтобы раскладка не мешала (Ц вместо W и т.п.)

export const BINDINGS = {
  throttle: ['KeyW', 'ArrowUp'],
  brake: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  handbrake: ['Space'],
  enter: ['KeyF'],
  interact: ['KeyE'],
  ignition: ['KeyQ'],
  lights: ['KeyL'],
  radio: ['KeyR'],
  horn: ['KeyH'],
  camera: ['KeyC'],
  inventory: ['Tab', 'KeyI'],
  map: ['KeyM'],
  journal: ['KeyJ'],
  pause: ['Escape', 'KeyP'],
  push: ['KeyG'],
  sleep: ['KeyZ'],
  run: ['ShiftLeft', 'ShiftRight'],
  jump: ['Space'],
  glovebox: ['KeyB'],
  quicksave: ['F5'],
  quickload: ['F9'],
};

const PREVENT = new Set(['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F5', 'F9']);

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressed = new Set();
    this.justReleased = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
    this.buttons = new Set();
    this.locked = false;
    this.enabled = true;

    window.addEventListener('keydown', (e) => {
      if (isTyping(e)) return;
      if (PREVENT.has(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.justPressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.justReleased.add(e.code);
    });
    window.addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('mousedown', (e) => {
      this.buttons.add(e.button);
    });
    window.addEventListener('mouseup', (e) => this.buttons.delete(e.button));
    window.addEventListener('mousemove', (e) => {
      // без pointer lock крутим камеру только с зажатой кнопкой
      if (this.locked || this.buttons.size) {
        this.mouseDX += e.movementX || 0;
        this.mouseDY += e.movementY || 0;
      }
    });
    canvas.addEventListener('wheel', (e) => {
      this.wheel += Math.sign(e.deltaY);
    }, { passive: true });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
    });
  }

  lockPointer() {
    if (this.locked || !this.canvas.requestPointerLock) return;
    try {
      const p = this.canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (_) { /* в iframe бывает нельзя — ок, будет мышь с зажатой кнопкой */ }
  }

  unlockPointer() {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  down(action) {
    if (!this.enabled) return false;
    const codes = BINDINGS[action];
    return codes ? codes.some((c) => this.keys.has(c)) : this.keys.has(action);
  }

  pressed(action) {
    if (!this.enabled) return false;
    const codes = BINDINGS[action];
    return codes ? codes.some((c) => this.justPressed.has(c)) : this.justPressed.has(action);
  }

  released(action) {
    const codes = BINDINGS[action];
    return codes ? codes.some((c) => this.justReleased.has(c)) : this.justReleased.has(action);
  }

  // взять дельту мыши (и обнулить)
  takeMouse() {
    const d = { x: this.mouseDX, y: this.mouseDY, wheel: this.wheel };
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
    return d;
  }

  endFrame() {
    this.justPressed.clear();
    this.justReleased.clear();
  }
}

function isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && t.type !== 'range' && t.type !== 'checkbox';
}
