import { Panel, el } from './UIManager.js';
import { UPGRADES } from '../vehicle/VehicleConfig.js';
import { escapeHtml } from '../core/util.js';

const WHO = {
  gena: ['engine', 'suspension', 'tank', 'brakes', 'roofrack', 'bullbar'],
  zina: ['tires', 'suspension', 'roofrack'],
};

export class UpgradePanel extends Panel {
  constructor(game, who) {
    super(game.ui, { title: 'УЛУЧШЕНИЯ', size: 'wide' });
    this.game = game;
    this.who = who;
    this.msg = 'Улучшения дорогие. Но и север не близко.';
  }

  _price(key, lvl) {
    const g = this.game;
    let p = UPGRADES[key].levels[lvl].price;
    if (key === 'engine' && lvl === 2 && g.story.hasFlag('gena_carb')) p = Math.round(p * 0.5);
    return p;
  }

  render() {
    const g = this.game;
    const cfg = g.vehicle.config;
    const near = Math.hypot(g.vehicle.pos.x - g.playerPos.x, g.vehicle.pos.z - g.playerPos.z) < 25;
    this.body.innerHTML = '';
    this.body.append(el('div', 'hint', `Деньги: <b style="color:var(--accent2)">${g.inventory.money} ₽</b>` + (near ? '' : ' · <span class="tag">машину пригони сначала</span>')));
    for (const key of WHO[this.who] || []) {
      const up = UPGRADES[key];
      const cur = cfg.levels[key];
      const box = el('div');
      box.append(el('h3', '', `${up.name}: ${up.levels.map((l, i) => (i === cur ? `<b style="color:var(--accent2)">${l.label}</b>` : l.label)).join(' → ')}`));
      const options = up.choice ? up.levels.map((l, i) => i).filter((i) => i !== cur) : cur + 1 < up.levels.length ? [cur + 1] : [];
      if (!options.length) box.append(el('div', 'hint', 'Максимум. Дальше только ракетный двигатель.'));
      for (const lvl of options) {
        const l = up.levels[lvl];
        const price = this._price(key, lvl);
        const row = el('div', 'row');
        const needCarb = l.needs === 'carburetor' && !g.inventory.has('carburetor', 1, true) && !g.story.hasFlag('gena_carb');
        row.append(el('div', 'name', `${escapeHtml(l.label)}<small>${escapeHtml(l.desc || '')}${needCarb ? ' Нужен карбюратор «Солекс».' : ''}</small>`), el('div', 'val', `${price} ₽`));
        const b = el('button', 'primary', 'Поставить');
        b.disabled = !near || needCarb || !g.inventory.canAfford(price);
        b.onclick = () => {
          g.inventory.addMoney(-price, 'улучшение');
          cfg.levels[key] = lvl;
          if (key === 'engine' && lvl === 2 && g.inventory.has('carburetor', 1, true)) g.inventory.take('carburetor', 1, true);
          if (key === 'roofrack') g.inventory.setTrunkCapacity(12 + up.levels[lvl].slots);
          if (key === 'tank') g.vehicle.fuel.liters = Math.min(g.vehicle.fuel.liters, g.vehicle.fuel.capacity);
          g.passTime(90);
          g.audio.play('wrench');
          g.achievements.count('upgrades');
          this.msg = `Готово: ${up.name} — ${l.label}. Прошло полтора часа.`;
          g.ui.notify(`⚙ ${up.name}: ${l.label}`, 'good');
          this.render();
        };
        row.append(b);
        box.append(row);
      }
      this.body.append(box);
    }
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    const c = el('button', '', 'Закрыть');
    c.onclick = () => this.close();
    this.footer.append(c);
  }
}
