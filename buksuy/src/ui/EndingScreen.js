import { el } from './UIManager.js';
import { escapeHtml, fmtDist } from '../core/util.js';

export class EndingScreen {
  constructor(game, ending, text) {
    this.game = game;
    this.ending = ending;
    this.text = text;
  }

  show() {
    const g = this.game;
    g.state = 'ending';
    g.ui.closeAll();
    g.ui.setHudVisible(false);
    g.input.unlockPointer();
    const s = g.achievements.stats;
    const stats = `В пути: ${Math.floor(g.playTime / 60)} мин · проехано ${fmtDist(s.distance)} · ремонтов: ${s.repairs} · отвалилось деталей: ${g.vehicle.damage.lostParts} · улик: ${g.story.clueCount()}/${g.story.clueTotal()}`;
    this.el = el('div', 'ending', `<div class="inner">
      <div class="kind">${escapeHtml(this.ending.kind)}</div>
      <h1>${escapeHtml(this.ending.title)}</h1>
      <div class="text">${escapeHtml(this.text)}</div>
      <div class="stats">${escapeHtml(stats)}</div>
      <div class="btns"></div>
    </div>`);
    const btns = this.el.querySelector('.btns');
    const cont = el('button', 'primary', 'Продолжить путешествие');
    cont.onclick = () => {
      this.el.remove();
      g.story.continueAfterEnding();
      g.state = 'playing';
      g.ui.setHudVisible(true);
      g.world.auroraForce = 0;
    };
    const menu = el('button', '', 'Главное меню');
    menu.style.marginLeft = '10px';
    menu.onclick = () => {
      this.el.remove();
      g.enterMenu();
    };
    // после «пешком» и «продано» ехать дальше не на чем
    if (this.ending.achievement !== 'ending_foot' && this.ending.achievement !== 'ending_sold') btns.append(cont);
    btns.append(menu);
    document.getElementById('ui').append(this.el);
    this.el.style.pointerEvents = 'auto';
    g.audio.play('quest');
  }
}
