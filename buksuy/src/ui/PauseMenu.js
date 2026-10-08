import { Panel, el } from './UIManager.js';
import { SettingsPanel } from './SettingsPanel.js';
import { SaveLoadPanel } from './SaveLoadPanel.js';
import { MapPanel } from './MapPanel.js';
import { JournalPanel } from './JournalPanel.js';
import { TextPanel } from './LootPanel.js';

const TOW_PRICE = 800;

export class PauseMenu extends Panel {
  constructor(game) {
    super(game.ui, { title: 'ПАУЗА', size: 'narrow' });
    this.game = game;
  }

  onKey(e) {
    if (e.code === 'KeyP') {
      this.close();
      return true;
    }
    return false;
  }

  render() {
    const g = this.game;
    this.body.innerHTML = '';
    const list = el('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '8px';
    const item = (label, fn, cls = '') => {
      const b = el('button', cls, label);
      b.style.textAlign = 'left';
      b.onclick = fn;
      list.append(b);
      return b;
    };
    item('▶ Продолжить', () => this.close(), 'primary');
    item('💾 Сохранить', () => new SaveLoadPanel(g, 'save').open());
    item('📂 Загрузить', () => new SaveLoadPanel(g, 'load').open());
    item('🗺 Карта', () => { this.close(); new MapPanel(g).open(); });
    item('📓 Журнал', () => { this.close(); new JournalPanel(g).open(); });
    item('⚙ Настройки', () => new SettingsPanel(g).open());
    item(`🚚 Вызвать эвакуатор (${TOW_PRICE} ₽)`, () => this.tow());
    item('🥾 Бросить машину и идти пешком…', () => this.abandon(), 'danger');
    item('⏏ Выйти в главное меню', () => {
      g.saves.save('auto', true);
      g.enterMenu();
    });
    this.body.append(list);
    const q = g.quests.current();
    this.footer.innerHTML = '';
    this.footer.append(el('div', 'grow', q ? `Цель: ${q.text}` : 'Езжай на север.'));
  }

  tow() {
    const g = this.game;
    const car = g.vehicle;
    const free = g.inventory.money < TOW_PRICE;
    const n = g.world.roads.nearest(car.pos.x, car.pos.z, 600, (r) => r.type !== 'rail' && !r.hidden) || g.world.roads.nearest(car.pos.x, car.pos.z, 3000, (r) => r.id === 'main');
    if (!n) return;
    const go = () => {
      const x = n.x - n.dz * (n.road.halfWidth + 1.5);
      const z = n.z + n.dx * (n.road.halfWidth + 1.5);
      car.teleport(x, z, Math.atan2(n.dx, n.dz));
      car.stopEngine('tow');
      if (g.player.inCar) g.player.exitCar();
      g.player.spawn(x - n.dx * 4, z - n.dz * 4, Math.atan2(n.dx, n.dz));
      g.passTime(90);
      g.world.warm(x, z);
    };
    let text;
    if (!free) {
      g.inventory.addMoney(-TOW_PRICE, 'эвакуатор');
      text = 'Через полтора часа приехал эвакуатор «Буксир». Водитель молча поставил Ласточку на дорогу, взял деньги и уехал, качая головой.';
    } else {
      // денег нет — водитель берёт натурой
      const all = [...g.inventory.trunk.slots, ...g.inventory.pockets.slots].filter((s) => s.id !== 'parcel' && s.id !== 'tackle' && s.id !== 'cassette');
      const taken = all.length ? all[Math.floor(Math.random() * all.length)] : null;
      if (taken) {
        (g.inventory.trunk.slots.includes(taken) ? g.inventory.trunk : g.inventory.pockets).removeSlot(taken);
      }
      text = `Денег у тебя не было, и водитель эвакуатора «в счёт оплаты» забрал ${taken ? 'кое-что из багажника' : 'твою последнюю надежду'}. Но Ласточку на дорогу поставил.`;
    }
    this.close();
    g.ui.fadeThrough(() => {
      go();
      new TextPanel(g, 'ЭВАКУАТОР', text, { paper: false }).open();
    });
  }

  abandon() {
    const g = this.game;
    new TextPanel(g, 'БРОСИТЬ ЛАСТОЧКУ?', 'Ты оставишь машину на обочине и пойдёшь дальше пешком. Это одна из концовок. Ты уверен?', {
      paper: false,
      buttons: [
        { label: 'Да, пойду пешком', primary: true, action: (p) => { p.close(); this.close(); g.story.abandonCar(); } },
        { label: 'Нет, она ещё поедет', action: (p) => p.close() },
      ],
    }).open();
  }
}
