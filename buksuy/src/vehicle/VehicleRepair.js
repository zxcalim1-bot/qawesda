import { PARTS, WHEEL_IDS, FAULTS } from './VehicleDamage.js';
import { ITEMS } from '../data/items.js';
import { chance } from '../core/util.js';

// Ремонт своими руками и в мастерской.
// Каждый вариант: { key, label, needs: [[item, n]], tools, time (мин), run(dmg) -> текст }

const DETACH_ITEM = {
  bumperF: 'part_bumperF', bumperR: 'part_bumperR', doorL: 'part_doorL', doorR: 'part_doorR',
  hood: 'part_hood', trunk: 'part_trunk', mirrorL: 'part_mirrorL', mirrorR: 'part_mirrorR', exhaust: 'part_exhaust',
};

// цена одного процента в мастерской
const WORKSHOP_RATE = {
  engine: 22, battery: 10, cooling: 9, brakes: 9, gearbox: 16, clutch: 13, suspension: 11,
  wheelFL: 7, wheelFR: 7, wheelRL: 7, wheelRR: 7, headlightL: 5, headlightR: 5, body: 10,
  doorL: 6, doorR: 6, hood: 6, trunk: 5, glass: 26, bumperF: 4, bumperR: 4, mirrorL: 2, mirrorR: 2,
  fuelTank: 7, exhaust: 4,
};

// если детали нет совсем — её надо купить новой
const NEW_PART_PRICE = {
  bumperF: 900, bumperR: 800, doorL: 1600, doorR: 1600, hood: 1400, trunk: 1100, mirrorL: 300, mirrorR: 300,
  exhaust: 700, wheelFL: 1500, wheelFR: 1500, wheelRL: 1500, wheelRR: 1500,
};

export class VehicleRepair {
  constructor(game) {
    this.game = game;
  }

  get car() {
    return this.game.vehicle;
  }

  get dmg() {
    return this.game.vehicle.damage;
  }

  hasTools() {
    return this.game.inventory.has('toolkit', 1, true);
  }

  // список узлов с вариантами ремонта для панели под капотом
  list() {
    const d = this.dmg;
    const rows = [];
    const add = (id, extra = {}) => rows.push({ id, name: PARTS[id]?.name ?? id, hp: d.hp(id), detached: d.isDetached(id), ...extra, options: this.options(id) });

    add('engine', { problems: this._problems('engine') });
    rows.push({
      id: 'oil', name: 'Масло', hp: d.fluids.oil * 100, fluid: true,
      problems: d.leaks.oil > 0 ? ['течёт масло'] : [], options: this.options('oil'),
    });
    add('cooling', {
      problems: [
        ...(d.leaks.coolant > 0 ? ['подтекает антифриз'] : []),
        ...(d.fluids.coolantWater ? ['в радиаторе вода'] : []),
        ...this._problems('cooling'),
      ],
      extraVal: `жидкость ${Math.round(d.fluids.coolant * 100)}%`,
    });
    add('battery', { problems: this._problems('battery'), extraVal: `заряд ${Math.round(d.fluids.charge * 100)}%` });
    add('brakes', { problems: this._problems('brakes') });
    add('gearbox');
    add('clutch');
    add('suspension');
    for (let i = 0; i < 4; i++) {
      const id = WHEEL_IDS[i];
      add(id, { problems: d.flat[i] ? ['спущено'] : [] });
    }
    add('fuelTank', { problems: d.leaks.fuel > 0 ? ['течёт бензин'] : [] });
    add('exhaust', { problems: this._problems('exhaust') });
    for (const id of ['headlightL', 'headlightR', 'body', 'glass', 'hood', 'trunk', 'doorL', 'doorR', 'bumperF', 'bumperR', 'mirrorL', 'mirrorR']) add(id);
    return rows;
  }

  _problems(partId) {
    const out = [];
    for (const [fid, f] of Object.entries(this.dmg.faults)) {
      if (FAULTS[fid]?.part !== partId) continue;
      out.push(f.temp ? `${FAULTS[fid].name.toLowerCase()} (временно)` : FAULTS[fid].name.toLowerCase());
    }
    return out;
  }

  options(id) {
    const d = this.dmg;
    const o = [];
    const hp = id === 'oil' ? d.fluids.oil * 100 : d.hp(id);
    const det = PARTS[id]?.detachable && d.isDetached(id);

    switch (id) {
      case 'engine':
        if (d.faults.plugs) {
          o.push({ key: 'plugs', label: 'Заменить свечи', needs: [['plugs', 1]], tools: true, time: 20, run: () => { d.fixFault('plugs'); return 'Новые свечи. Мотор перестал троить.'; } });
          if (!d.faults.plugs.temp) o.push({ key: 'plugs_clean', label: 'Почистить свечи ножиком', needs: [], tools: true, time: 25, run: () => { d.fixFault('plugs', true); return 'Нагар соскоблил. Какое-то время протянут.'; } });
        }
        if (d.faults.fuelpump) {
          o.push({ key: 'pump', label: 'Поставить бензонасос', needs: [['fuel_pump', 1]], tools: true, time: 35, run: () => { d.fixFault('fuelpump'); return 'Бензонасос новый. Ласточка дышит ровно.'; } });
          if (!d.faults.fuelpump.temp) o.push({ key: 'pump_knock', label: 'Постучать по бензонасосу', needs: [], tools: true, time: 3, run: () => (chance(0.7) ? (d.fixFault('fuelpump', true), 'Тук-тук. Кажется, ожил.') : 'Тук-тук… Не помогло. Попробуй ещё.') });
        }
        if (hp < 100) o.push({ key: 'rebuild', label: 'Перебрать узлы (+35%)', needs: [['parts', 2]], tools: true, time: 50, run: () => { d.setHp('engine', hp + 35); return 'Подтянул, подкрутил, продул. Двигатель стал бодрее.'; } });
        if (d.fluids.oil < 0.95) o.push(this._oilOpt());
        break;
      case 'oil':
        if (d.fluids.oil < 0.95) o.push(this._oilOpt());
        if (d.leaks.oil > 0) {
          o.push({ key: 'oilleak_tape', label: 'Обмотать поддон изолентой', needs: [['tape', 1]], tools: false, time: 10, run: () => { d.leaks.oil *= 0.25; return 'Капает уже не так бодро.'; } });
          o.push({ key: 'oilleak_fix', label: 'Заварить течь', needs: [['parts', 1]], tools: true, time: 30, run: () => { d.leaks.oil = 0; return 'Течь устранена.'; } });
        }
        break;
      case 'cooling':
        if (d.fluids.coolant < 0.95) {
          o.push({ key: 'coolant', label: 'Залить антифриз', needs: [['coolant', 1]], tools: false, time: 3, run: () => { d.fluids.coolant = Math.min(1, d.fluids.coolant + 0.5); d.fluids.coolantWater = false; return 'Залил антифриз.'; } });
          o.push({ key: 'water', label: 'Залить воду', needs: [['water', 1]], tools: false, time: 3, run: () => { d.fluids.coolant = Math.min(1, d.fluids.coolant + 0.35); d.fluids.coolantWater = true; return 'Залил воду. Главное, чтобы не было мороза.'; } });
        }
        if (d.faults.hose) {
          o.push({ key: 'hose', label: 'Заменить патрубок', needs: [['hose', 1]], tools: true, time: 15, run: () => { d.fixFault('hose'); return 'Патрубок новый, хомуты затянуты.'; } });
          if (!d.faults.hose.temp) o.push({ key: 'hose_tape', label: 'Замотать патрубок изолентой', needs: [['tape', 1]], tools: false, time: 5, run: () => { d.fixFault('hose', true); return 'Синяя изолента держит. Пока.'; } });
        } else if (d.leaks.coolant > 0) {
          o.push({ key: 'rad_tape', label: 'Замотать течь изолентой', needs: [['tape', 1]], tools: false, time: 8, run: () => { d.leaks.coolant *= 0.2; return 'Почти не капает.'; } });
        }
        if (hp < 100) o.push({ key: 'rad', label: 'Подпаять радиатор (+40%)', needs: [['parts', 1]], tools: true, time: 30, run: () => { d.setHp('cooling', hp + 40); d.leaks.coolant = 0; return 'Радиатор подпаян.'; } });
        break;
      case 'battery':
        if (hp < 100 || d.fluids.charge < 0.5) o.push({ key: 'batt', label: 'Поставить новый аккумулятор', needs: [['battery', 1]], tools: true, time: 10, run: () => { d.setHp('battery', 100); d.fluids.charge = 1; return 'Новый аккумулятор. Стартер крутит так, что страшно.'; } });
        if (d.faults.belt) {
          o.push({ key: 'belt', label: 'Поставить ремень генератора', needs: [['belt', 1]], tools: true, time: 15, run: () => { d.fixFault('belt'); return 'Ремень на месте. Зарядка пошла.'; } });
          if (!d.faults.belt.temp) o.push({ key: 'tights', label: 'Натянуть колготки вместо ремня', needs: [['tights', 1]], tools: true, time: 10, run: () => { d.fixFault('belt', true); return 'Колготки натянуты на шкивы. Генератор крутится. Советская инженерия!'; } });
        }
        if (d.faults.starter) {
          o.push({ key: 'starter', label: 'Перебрать стартер', needs: [['parts', 1]], tools: true, time: 30, run: () => { d.fixFault('starter'); return 'Стартер перебран.'; } });
          o.push({ key: 'starter_knock', label: 'Постучать по стартеру', needs: [], tools: true, time: 2, run: () => { this.car.engine.knocked = 300; return 'Постучал молотком. Минут пять должен крутить.'; } });
        }
        break;
      case 'brakes':
        if (hp < 100) o.push({ key: 'pads', label: 'Заменить колодки', needs: [['brake_pads', 1]], tools: true, time: 35, run: () => { d.setHp('brakes', 100); return 'Новые колодки. Тормозит — аж клюёт носом.'; } });
        if (d.faults.brakeline) {
          o.push({ key: 'bhose', label: 'Заменить тормозной шланг', needs: [['brake_hose', 1]], tools: true, time: 20, run: () => { d.fixFault('brakeline'); return 'Шланг заменён, тормоза прокачаны.'; } });
          if (!d.faults.brakeline.temp) o.push({ key: 'bhose_tape', label: 'Замотать шланг изолентой', needs: [['tape', 1]], tools: false, time: 6, run: () => { d.fixFault('brakeline', true); return 'Педаль стала потвёрже. Немного.'; } });
        }
        break;
      case 'gearbox':
        if (hp < 100) o.push({ key: 'gb_kit', label: 'Перебрать коробку', needs: [['gearbox_kit', 1]], tools: true, time: 90, run: () => { d.setHp('gearbox', 100); return 'Коробка перебрана. Передачи втыкаются с приятным щелчком.'; } });
        if (hp < 60) o.push({ key: 'gb_tune', label: 'Подрегулировать кулису (+25%)', needs: [['parts', 2]], tools: true, time: 40, run: () => { d.setHp('gearbox', Math.min(60, hp + 25)); return 'Передачи выскакивают реже.'; } });
        break;
      case 'clutch':
        if (hp < 100) o.push({ key: 'clutch', label: 'Заменить диск сцепления', needs: [['clutch_disc', 1]], tools: true, time: 100, run: () => { d.setHp('clutch', 100); return 'Сцепление как новое. Руки по локоть в масле.'; } });
        break;
      case 'suspension':
        if (hp < 100) o.push({ key: 'shock', label: 'Поставить амортизаторы', needs: [['shock', 1]], tools: true, time: 60, run: () => { d.setHp('suspension', 100); return 'Новые амортизаторы. Ласточка больше не скачет козлом.'; } });
        if (hp < 55) o.push({ key: 'susp_wire', label: 'Подвязать проволокой (+20%)', needs: [['wire', 1], ['parts', 1]], tools: true, time: 25, run: () => { d.setHp('suspension', Math.min(55, hp + 20)); return 'Подвязал. Ездить можно, смотреть страшно.'; } });
        break;
      case 'wheelFL': case 'wheelFR': case 'wheelRL': case 'wheelRR': {
        const i = WHEEL_IDS.indexOf(id);
        if (det) {
          o.push({ key: 'wheel_spare', label: 'Поставить запаску', needs: [['spare_wheel', 1]], tools: true, time: 15, run: () => { d.attach(id, 100); this.game.carModel.reattach(id); return 'Запаска на месте.'; } });
          o.push({ key: 'wheel_own', label: 'Прикрутить своё колесо', needs: [['part_wheel', 1]], tools: true, time: 15, run: () => { d.attach(id, 70); this.game.carModel.reattach(id); return 'Колесо вернулось на законное место.'; } });
        } else {
          if (d.flat[i]) o.push({ key: 'patch', label: 'Залатать прокол', needs: [['patch_kit', 1]], tools: false, time: 20, run: () => { d.flat[i] = false; return 'Жгут вставлен, колесо подкачано.'; } });
          if (d.flat[i] || hp < 70) o.push({ key: 'swap', label: 'Поставить запаску', needs: [['spare_wheel', 1]], tools: true, time: 15, run: () => { d.flat[i] = false; d.setHp(id, 100); return 'Колесо заменено.'; } });
        }
        break;
      }
      case 'headlightL': case 'headlightR':
        if (hp < 100) o.push({ key: 'bulb', label: 'Поставить фару', needs: [['bulb', 1]], tools: true, time: 10, run: () => { d.setHp(id, 100); return 'Фара светит.'; } });
        break;
      case 'body':
        if (hp < 80) o.push({ key: 'hammer', label: 'Выправить молотком (+25%)', needs: [['parts', 2]], tools: true, time: 40, run: () => { d.setHp('body', Math.min(80, hp + 25)); return 'Постучал. Стало ровнее. Местами.'; } });
        break;
      case 'glass':
        if (hp < 100) o.push({ key: 'glass', label: 'Вставить новое стекло', needs: [['glass', 1]], tools: true, time: 40, run: () => { d.setHp('glass', 100); return 'Лобовое как новое. Видно даже дорогу.'; } });
        if (hp < 30) o.push({ key: 'film', label: 'Затянуть плёнкой', needs: [['film', 1]], tools: false, time: 10, run: () => { d.setHp('glass', 35); return 'Плёнка натянута. Мир за ней слегка в тумане.'; } });
        break;
      case 'fuelTank':
        if (d.leaks.fuel > 0) {
          o.push({ key: 'tank_tape', label: 'Заклеить течь', needs: [['tape', 1]], tools: false, time: 8, run: () => { d.leaks.fuel *= 0.2; return 'Бензином пахнет меньше.'; } });
          o.push({ key: 'tank_fix', label: 'Запаять бак', needs: [['parts', 1]], tools: true, time: 30, run: () => { d.leaks.fuel = 0; d.setHp('fuelTank', Math.max(hp, 70)); return 'Бак запаян. (Лучше не курить рядом.)'; } });
        }
        break;
      default:
        break;
    }

    // навесные детали
    if (DETACH_ITEM[id]) {
      const item = DETACH_ITEM[id];
      if (det) {
        o.push({ key: 'reattach', label: `Поставить на место`, needs: [[item, 1]], tools: true, time: 20, run: () => { d.attach(id, 60); this.game.carModel.reattach(id); return `${PARTS[id].name}: снова на месте.`; } });
        o.push({ key: 'wire_on', label: 'Примотать проволокой', needs: [[item, 1], ['wire', 1]], tools: false, time: 12, run: () => { d.attach(id, 30); this.game.carModel.reattach(id); return `${PARTS[id].name}: примотано. Держится на честном слове.`; } });
      } else if (hp < 85) {
        o.push({ key: 'fix', label: 'Выправить (+30%)', needs: [['parts', 1]], tools: true, time: 20, run: () => { d.setHp(id, Math.min(85, hp + 30)); return `${PARTS[id].name}: выправлено.`; } });
        if (hp < 50) o.push({ key: 'tape', label: 'Подмотать изолентой (+15%)', needs: [['tape', 1]], tools: false, time: 5, run: () => { d.setHp(id, Math.min(50, hp + 15)); return `${PARTS[id].name}: синяя изолента — лучший друг.`; } });
      }
    }
    return o;
  }

  _oilOpt() {
    const d = this.dmg;
    return { key: 'oil', label: 'Долить масло', needs: [['oil', 1]], tools: false, time: 4, run: () => { d.fluids.oil = Math.min(1, d.fluids.oil + 0.35); return 'Долил масла. Щуп доволен.'; } };
  }

  check(opt) {
    const inv = this.game.inventory;
    const missing = [];
    if (opt.tools && !this.hasTools()) missing.push('🔧 инструменты');
    for (const [item, n] of opt.needs) {
      if (!inv.has(item, n, true)) missing.push(`${ITEMS[item].icon} ${ITEMS[item].name}${n > 1 ? ` ×${n}` : ''}`);
    }
    return { ok: missing.length === 0, missing };
  }

  apply(partId, opt) {
    const c = this.check(opt);
    if (!c.ok) return { ok: false, text: `Не хватает: ${c.missing.join(', ')}` };
    for (const [item, n] of opt.needs) this.game.inventory.take(item, n, true);
    const text = opt.run();
    this.game.passTime(opt.time);
    this.game.achievements?.count('repairs');
    this.game.events.emit('repaired', { part: partId, key: opt.key });
    if (partId === 'body') this.game.carModel.undent();
    return { ok: true, text: `${text} (прошло ${opt.time} мин)` };
  }

  // ---------- мастерская ----------

  quote(id) {
    const d = this.dmg;
    if (id === 'faults') {
      return Object.keys(d.faults).length * 600 + (d.leaks.oil + d.leaks.coolant + d.leaks.fuel > 0 ? 500 : 0);
    }
    if (id === 'fluids') {
      return Math.round((1 - d.fluids.oil) * 900 + (1 - d.fluids.coolant) * 700);
    }
    let price = 0;
    if (PARTS[id]?.detachable && d.isDetached(id)) price += NEW_PART_PRICE[id] || 800;
    else price += (100 - d.hp(id)) * (WORKSHOP_RATE[id] || 6);
    const wi = WHEEL_IDS.indexOf(id);
    if (wi >= 0 && d.flat[wi]) price += 300;
    return Math.round(price);
  }

  workshopRows() {
    const d = this.dmg;
    const rows = [];
    for (const id of Object.keys(PARTS)) {
      const q = this.quote(id);
      if (q > 0) rows.push({ id, name: PARTS[id].name, hp: d.hp(id), detached: d.isDetached(id), price: q });
    }
    const f = this.quote('faults');
    if (f > 0) rows.push({ id: 'faults', name: 'Неисправности и течи', price: f, list: Object.keys(d.faults).map((k) => FAULTS[k].name) });
    const fl = this.quote('fluids');
    if (fl > 50) rows.push({ id: 'fluids', name: 'Масло и антифриз (долить)', price: fl });
    return rows;
  }

  workshopFix(id, markup = 1) {
    const price = Math.round(this.quote(id) * markup);
    const inv = this.game.inventory;
    if (!inv.canAfford(price)) return { ok: false, text: 'Денег не хватает.' };
    inv.addMoney(-price, 'ремонт');
    const d = this.dmg;
    if (id === 'faults') {
      d.faults = {};
      d.leaks.oil = d.leaks.coolant = d.leaks.fuel = 0;
    } else if (id === 'fluids') {
      d.fluids.oil = 1;
      d.fluids.coolant = 1;
      d.fluids.coolantWater = false;
    } else {
      if (d.isDetached(id)) {
        d.attach(id, 100);
        this.game.carModel.reattach(id);
      }
      d.setHp(id, 100);
      const wi = WHEEL_IDS.indexOf(id);
      if (wi >= 0) d.flat[wi] = false;
      if (id === 'battery') d.fluids.charge = 1;
      if (id === 'body') this.game.carModel.undent();
    }
    this.game.passTime(20);
    this.game.events.emit('repaired', { part: id, workshop: true });
    return { ok: true, text: `Готово. −${price} ₽` };
  }

  workshopTotal(markup = 1) {
    return this.workshopRows().reduce((a, r) => a + Math.round(r.price * markup), 0);
  }

  workshopAll(markup = 1) {
    const total = this.workshopTotal(markup);
    if (!this.game.inventory.canAfford(total)) return { ok: false, text: 'На всё сразу денег не хватает.' };
    for (const r of this.workshopRows()) this.workshopFix(r.id, markup);
    this.game.carModel.undent();
    return { ok: true, text: `Всё сделано. −${total} ₽` };
  }
}

export { DETACH_ITEM };
