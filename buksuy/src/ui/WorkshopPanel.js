import { Panel, el } from './UIManager.js';
import { escapeHtml, textBar } from '../core/util.js';

// Ремонт за деньги у механика
export class WorkshopPanel extends Panel {
  constructor(game, who, markup = 1) {
    super(game.ui, { title: who === 'zina' ? 'ШИНОМОНТАЖ — РЕМОНТ' : 'МАСТЕРСКАЯ ГЕНЫ', size: 'wide' });
    this.game = game;
    this.who = who;
    this.markup = markup;
    this.msg = markup > 1 ? 'Двойной тариф. За моральный ущерб.' : '';
  }

  render() {
    const g = this.game;
    const rep = g.repair;
    const near = Math.hypot(g.vehicle.pos.x - g.playerPos.x, g.vehicle.pos.z - g.playerPos.z) < 25;
    this.body.innerHTML = '';
    if (!near) {
      this.body.append(el('p', '', 'Машину-то пригони. Я по фотографии не чиню.'));
      this.footer.innerHTML = '';
      const c = el('button', '', 'Понял');
      c.onclick = () => this.close();
      this.footer.append(c);
      return;
    }
    const rows = rep.workshopRows();
    this.body.append(el('div', 'hint', `Деньги: <b style="color:var(--accent2)">${g.inventory.money} ₽</b>. Общее состояние: ${Math.round(g.vehicle.damage.overall())}%.`));
    if (!rows.length) this.body.append(el('p', '', 'Чинить нечего. Я в шоке. Ты точно на этой машине ехал?'));
    for (const r of rows) {
      const row = el('div', 'row');
      const price = Math.round(r.price * this.markup);
      const state = r.detached ? '<span class="tag">нет детали — поставим новую</span>' : r.hp !== undefined ? `<span class="bar ${r.hp < 30 ? 'low' : r.hp < 65 ? 'mid' : 'high'}">[${textBar(r.hp)}] ${Math.round(r.hp)}%</span>` : '';
      const list = r.list?.length ? `<small>${escapeHtml(r.list.join(', '))}</small>` : '';
      row.append(el('div', 'name', `${escapeHtml(r.name)} ${list}`), el('div', 'val', state), el('div', 'val', `${price} ₽`));
      const b = el('button', '', 'Сделать');
      b.disabled = !g.inventory.canAfford(price);
      b.onclick = () => {
        const res = rep.workshopFix(r.id, this.markup);
        this.msg = res.text;
        g.audio.play(res.ok ? 'wrench' : 'error');
        this.render();
      };
      row.append(b);
      this.body.append(row);
    }
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', escapeHtml(this.msg)));
    const total = rep.workshopTotal(this.markup);
    if (rows.length > 1) {
      const all = el('button', 'primary', `Всё сразу — ${total} ₽`);
      all.disabled = !g.inventory.canAfford(total);
      all.onclick = () => {
        const res = rep.workshopAll(this.markup);
        this.msg = res.text;
        g.audio.play(res.ok ? 'wrench' : 'error');
        if (res.ok) g.ui.notify(this.who === 'zina' ? 'Тётя Зина: «Вот теперь — машина!»' : 'Гена: «Ну вот. Почти как новая. Почти.»', 'good');
        this.render();
      };
      this.footer.append(all);
    }
    const c = el('button', '', 'Хватит');
    c.onclick = () => this.close();
    this.footer.append(c);
  }
}
