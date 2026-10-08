import { ITEMS } from '../data/items.js';

// Магазины: что продают, что покупают и почём.
export const SHOPS = {
  kochki_shop: {
    name: 'Магазин «Продукты»',
    greet: 'Продавщица не отрывается от сериала: «Чего надо?»',
    sells: ['food', 'water', 'coffee', 'tape', 'tights', 'wire'],
  },
  kolos_shop: {
    name: 'АЗС «Колос» — окошко',
    greet: 'Люда за стеклом жуёт жвачку и смотрит на тебя как на лишнее звено в цепочке поставок.',
    sells: ['food', 'water', 'coffee', 'oil', 'coolant', 'canister', 'tape', 'patch_kit', 'bulb', 'film'],
  },
  kafe_buffet: {
    name: 'Кафе «Трасса» — буфет',
    greet: 'Пахнет беляшами и дизелем. Над кассой табличка: «Кредит — завтра».',
    sells: ['food', 'coffee', 'water', 'oil', 'tape'],
    markup: 1.1,
  },
  gena: {
    name: 'Автосервис «У Гены»',
    greet: 'Гена вытирает руки о штаны: «Ну, чего тебе?»',
    sells: ['parts', 'belt', 'plugs', 'hose', 'brake_hose', 'brake_pads', 'battery', 'spare_wheel', 'toolkit', 'shock',
      'bulb', 'oil', 'coolant', 'clutch_disc', 'gearbox_kit', 'glass', 'patch_kit', 'saw', 'rope', 'wire', 'tape', 'fuel_pump'],
    buys: true,
    buyMul: 1,
  },
  zina: {
    name: 'Шиномонтаж тёти Зины',
    greet: 'Тётя Зина откладывает монтировку: «Колёса, запчасти, советы. Советы бесплатно».',
    sells: ['spare_wheel', 'patch_kit', 'oil', 'coolant', 'parts', 'brake_pads', 'shock', 'belt', 'plugs', 'bulb', 'hose', 'tape', 'wire', 'rope', 'film'],
    buys: true,
    buyMul: 0.9,
  },
  nyura: {
    name: 'Пирожки бабы Нюры',
    greet: '«Бери, сынок, тёпленькие. С капустой, с картошкой и с… тоже с капустой».',
    sells: ['pirozhki'],
  },
  ashot: {
    name: 'Дядя Ашот, торговец',
    greet: '«Есть всё! А чего нет — того тебе и не надо».',
    sells: ['oil', 'coolant', 'battery', 'spare_wheel', 'plugs', 'belt', 'fuel_pump', 'film', 'coffee', 'canister'],
    buys: true,
    buyMul: 1.3,
    markup: 1.25,
  },
};

export const FUEL_PRICE = { kolos: 55, kafe: 62 };

export class Economy {
  constructor(game) {
    this.game = game;
  }

  price(shopId, item) {
    const s = SHOPS[shopId];
    return Math.round((ITEMS[item].price || 0) * (s?.markup || 1));
  }

  sellPrice(shopId, item) {
    const s = SHOPS[shopId];
    if (!s?.buys) return 0;
    return Math.round((ITEMS[item].sell || 0) * (s.buyMul || 1));
  }

  buy(shopId, item, n = 1) {
    const g = this.game;
    const price = this.price(shopId, item) * n;
    if (!g.inventory.canAfford(price)) return { ok: false, text: 'Не хватает денег.' };
    const state = item === 'canister' ? { fuel: 0 } : null;
    const where = g.inventory.give(item, n, state, 'trunk', g.nearCar);
    if (!where) return { ok: false, text: g.nearCar ? 'Некуда положить — багажник забит.' : 'Не унести. Подгони машину поближе.' };
    g.inventory.addMoney(-price, 'покупка');
    return { ok: true, text: `Куплено: ${ITEMS[item].name} → ${where.name.toLowerCase()}` };
  }

  sell(shopId, container, slot) {
    const g = this.game;
    const p = this.sellPrice(shopId, slot.id);
    if (p <= 0 || ITEMS[slot.id].quest) return { ok: false, text: 'Это тут не берут.' };
    container.remove(slot.id, 1);
    g.inventory.addMoney(p, 'продажа');
    g.achievements?.count('sold', p);
    return { ok: true, text: `Продано: ${ITEMS[slot.id].name} за ${p} ₽` };
  }
}
