import './style.css';
import { Game } from './core/Game.js';

function fail(err) {
  console.error(err);
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#111;color:#eee;font:16px sans-serif;padding:30px;text-align:center;z-index:100';
  box.innerHTML = `<div><h2>Ласточка не завелась</h2><p>${String(err && err.message ? err.message : err)}</p><p style="color:#999">Нужен браузер с поддержкой WebGL (Chrome, Firefox, Edge).</p></div>`;
  document.body.append(box);
}

const game = new Game();
// для отладки из консоли
if (import.meta.env.DEV || location.search.includes('debug')) window.game = game;
game.init().catch(fail);
