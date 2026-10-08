import { Panel, el } from './UIManager.js';
import { SHOPS } from '../systems/Economy.js';
import { ITEMS } from '../data/items.js';
import { escapeHtml } from '../core/util.js';

export class ShopPanel extends Panel {
  constructor(game, shopId) {
    super(game.ui, { title: SHOPS[shopId].name.toUpperCase(), size: 'wide' });
    this.game = game;
    this.shopId = shopId;
    this.msg = '';
  }

  render() {
    const g = this.game;
    const shop = SHOPS[this.shopId];
    const eco = g.economy;
    this.body.innerHTML = '';
    this.body.append(el('p', 'hint', `<i>${escapeHtml(shop.greet)}</i>`));
    this.body.append(el('div', 'hint', `Деньги: <b style="color:var(--accent2)">${g.inventory.money} ₽</b> · ` +
      `в багажнике свободно ${g.inventory.trunk.free()} · при себе ${g.inventory.pockets.free()}` + (g.nearCar ? '' : ' · <span class="tag">машина далеко</span>')));

    const cols = el('div', shop.buys ? 'cols' : '');
    const buy = el('div');
    buy.append(el('h3', '', 'Купить'));
    for (const id of shop.sells) {
      const it = ITEMS[id];
      const price = eco.price(this.shopId, id);
      const row = el('div', 'slot');
      row.append(el('div', 'ic', it.icon), el('div', 'nm', `${escapeHtml(it.name)}<small>${escapeHtml(it.desc || '')}</small>`), el('div', 'sz', `${price} ₽`));
      const b = el('button', '', 'Купить');
      b.disabled = !g.inventory.canAfford(price);
      b.onclick = () => {
        const r = eco.buy(this.shopId, id, 1);
        this.msg = r.text;
        g.audio.play(r.ok ? 'coins' : 'error');
        this.render();
      };
      row.append(b);
      buy.append(row);
    }
    cols.append(buy);

    if (shop.buys) {
      const sell = el('div');
      sell.append(el('h3', '', 'Продать'));
      const containers = g.nearCar ? [g.inventory.pockets, g.inventory.trunk] : [g.inventory.pockets];
      let any = false;
      for (const c of containers) {
        for (const s of c.slots) {
          const p = eco.sellPrice(this.shopId, s.id);
          if (p <= 0 || ITEMS[s.id].quest) continue;
          any = true;
          const it = ITEMS[s.id];
          const row = el('div', 'slot');
          row.append(el('div', 'ic', it.icon), el('div', 'nm', `${escapeHtml(it.name)}${s.count > 1 ? ' ×' + s.count : ''}<small>${escapeHtml(c.name)}</small>`), el('div', 'sz', `${p} ₽`));
          const b = el('button', '', 'Продать');
          b.onclick = () => {
            const r = eco.sell(this.shopId, c, s);
            this.msg = r.text;
            g.audio.play(r.ok ? 'coins' : 'error');
            this.render();
          };
          row.append(b);
          sell.append(row);
        }
      }
      if (!any) sell.append(el('div', 'hint', 'Продавать нечего.'));
      cols.append(sell);
    }
    this.body.append(cols);
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    const c = el('button', '', 'Уйти');
    c.onclick = () => this.close();
    this.footer.append(c);
  }
}
