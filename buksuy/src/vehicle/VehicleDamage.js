import { clamp, chance, pick } from '../core/util.js';

// Все узлы машины. detachable — может отвалиться и остаться лежать на дороге.
export const PARTS = {
  engine: { name: 'Двигатель', group: 'engine', weight: 3 },
  battery: { name: 'Аккумулятор', group: 'engine', weight: 0.6 },
  cooling: { name: 'Охлаждение', group: 'engine', weight: 1 },
  brakes: { name: 'Тормоза', group: 'chassis', weight: 1.5 },
  gearbox: { name: 'Коробка передач', group: 'chassis', weight: 1.5 },
  clutch: { name: 'Сцепление', group: 'chassis', weight: 1 },
  suspension: { name: 'Подвеска', group: 'chassis', weight: 1.5 },
  wheelFL: { name: 'Колесо переднее левое', short: 'Колесо ПЛ', group: 'wheels', detachable: true, weight: 0.4 },
  wheelFR: { name: 'Колесо переднее правое', short: 'Колесо ПП', group: 'wheels', detachable: true, weight: 0.4 },
  wheelRL: { name: 'Колесо заднее левое', short: 'Колесо ЗЛ', group: 'wheels', detachable: true, weight: 0.4 },
  wheelRR: { name: 'Колесо заднее правое', short: 'Колесо ЗП', group: 'wheels', detachable: true, weight: 0.4 },
  headlightL: { name: 'Левая фара', group: 'body', detachable: true, weight: 0.2 },
  headlightR: { name: 'Правая фара', group: 'body', detachable: true, weight: 0.2 },
  body: { name: 'Кузов', group: 'body', weight: 1 },
  doorL: { name: 'Левая дверь', group: 'body', detachable: true, weight: 0.3 },
  doorR: { name: 'Правая дверь', group: 'body', detachable: true, weight: 0.3 },
  hood: { name: 'Капот', group: 'body', detachable: true, weight: 0.3 },
  trunk: { name: 'Крышка багажника', group: 'body', detachable: true, weight: 0.3 },
  glass: { name: 'Лобовое стекло', group: 'body', weight: 0.3 },
  bumperF: { name: 'Передний бампер', group: 'body', detachable: true, weight: 0.2 },
  bumperR: { name: 'Задний бампер', group: 'body', detachable: true, weight: 0.2 },
  mirrorL: { name: 'Левое зеркало', group: 'body', detachable: true, weight: 0.05 },
  mirrorR: { name: 'Правое зеркало', group: 'body', detachable: true, weight: 0.05 },
  fuelTank: { name: 'Бензобак', group: 'chassis', weight: 0.5 },
  exhaust: { name: 'Глушитель', group: 'chassis', detachable: true, weight: 0.2 },
};

export const WHEEL_IDS = ['wheelFL', 'wheelFR', 'wheelRL', 'wheelRR'];

export const FAULTS = {
  belt: { name: 'Порван ремень генератора', effect: 'аккумулятор не заряжается', part: 'battery' },
  plugs: { name: 'Закоксовались свечи', effect: 'двигатель троит и не тянет', part: 'engine' },
  hose: { name: 'Лопнул патрубок', effect: 'антифриз течёт ручьём', part: 'cooling' },
  fuelpump: { name: 'Барахлит бензонасос', effect: 'двигатель внезапно глохнет', part: 'engine' },
  starter: { name: 'Заедает стартер', effect: 'с ключа не заводится', part: 'battery' },
  brakeline: { name: 'Течёт тормозной шланг', effect: 'педаль проваливается', part: 'brakes' },
  exhaust: { name: 'Прогорел глушитель', effect: 'ревёт как трактор', part: 'exhaust' },
};

// стартовое состояние: машина дяди Миши, видавшая виды
const START = {
  engine: 72, battery: 83, cooling: 66, brakes: 41, gearbox: 63, clutch: 58, suspension: 56,
  wheelFL: 70, wheelFR: 64, wheelRL: 58, wheelRR: 61,
  headlightL: 90, headlightR: 35, body: 64, doorL: 80, doorR: 71, hood: 77, trunk: 69,
  glass: 74, bumperF: 100, bumperR: 54, mirrorL: 88, mirrorR: 46, fuelTank: 85, exhaust: 52,
};

export class VehicleDamage {
  constructor(events) {
    this.events = events;
    this.parts = {};
    this.flat = [false, false, false, false];
    this.fluids = { oil: 0.62, coolant: 0.8, charge: 0.8, coolantWater: false };
    this.leaks = { oil: 0, coolant: 0, fuel: 0 };
    this.faults = {}; // id -> { temp: bool }
    this.zoneCooldown = {};
    this.lostParts = 0;
    this.reset();
  }

  reset() {
    for (const id of Object.keys(PARTS)) this.parts[id] = { hp: START[id] ?? 100, detached: false };
    this.flat = [false, false, false, false];
    this.fluids = { oil: 0.62, coolant: 0.8, charge: 0.8, coolantWater: false };
    this.leaks = { oil: 0, coolant: 0, fuel: 0 };
    this.faults = {};
    this.lostParts = 0;
  }

  hp(id) {
    const p = this.parts[id];
    return p.detached ? 0 : p.hp;
  }

  frac(id) {
    return this.hp(id) / 100;
  }

  isDetached(id) {
    return this.parts[id].detached;
  }

  setHp(id, v, silent = false) {
    const p = this.parts[id];
    const from = p.hp;
    p.hp = clamp(v, 0, 100);
    if (!silent && Math.abs(from - p.hp) >= 0.5) {
      this.events.emit('part-hp', { id, from, to: p.hp });
    }
  }

  damage(id, amount, opts = {}) {
    if (amount <= 0) return;
    const p = this.parts[id];
    if (!p || p.detached) return;
    const from = p.hp;
    p.hp = clamp(p.hp - amount, 0, 100);
    if (from - p.hp >= 3 && !opts.quiet) {
      this.events.emit('part-damaged', { id, from, to: p.hp, name: PARTS[id].name });
    }
    const def = PARTS[id];
    if (def.detachable) {
      // убитая деталь может отвалиться и не дожидаясь нуля
      if (p.hp <= 0 || (p.hp < 18 && amount > 4 && chance(0.25))) this.detach(id, opts);
    }
  }

  detach(id, opts = {}) {
    const p = this.parts[id];
    if (p.detached) return;
    p.detached = true;
    p.hp = 0;
    this.lostParts++;
    const wi = WHEEL_IDS.indexOf(id);
    if (wi >= 0) this.flat[wi] = false;
    this.events.emit('part-detached', { id, name: PARTS[id].name, impulse: opts.impulse });
  }

  attach(id, hp = 60) {
    const p = this.parts[id];
    p.detached = false;
    p.hp = hp;
    this.events.emit('part-attached', { id });
  }

  puncture(i) {
    if (this.flat[i] || this.parts[WHEEL_IDS[i]].detached) return false;
    this.flat[i] = true;
    this.events.emit('puncture', { index: i, id: WHEEL_IDS[i], name: PARTS[WHEEL_IDS[i]].name });
    return true;
  }

  addFault(id, temp = false) {
    if (this.faults[id] && !this.faults[id].temp) return false;
    this.faults[id] = { temp: false };
    if (id === 'hose') this.leaks.coolant = Math.max(this.leaks.coolant, 0.006);
    this.events.emit('fault', { id, ...FAULTS[id] });
    return true;
  }

  hasFault(id) {
    return !!this.faults[id] && !this.faults[id].temp;
  }

  fixFault(id, temp = false) {
    if (temp) this.faults[id] = { temp: true, wear: 1 };
    else delete this.faults[id];
    if (id === 'hose') this.leaks.coolant = temp ? 0.0007 : 0;
  }

  // удар. zone: front | rear | left | right | bottom | roof
  applyImpact({ zone, lx = 0, lz = 0, speed, kind = 'terrain', armor = 1 }) {
    if (speed < 2.4) return 0;
    const now = performance.now();
    if (this.zoneCooldown[zone] && now - this.zoneCooldown[zone] < 220) return 0;
    this.zoneCooldown[zone] = now;

    const e = speed - 2.4;
    let base = e * 7 + e * e * 0.55;
    if (kind === 'scrape') base *= 0.35;
    if (kind === 'tree') base *= 1.15;
    const side = lx < 0 ? 'L' : 'R';

    switch (zone) {
      case 'front': {
        base *= armor;
        let spill = base;
        if (!this.isDetached('bumperF')) {
          this.damage('bumperF', base * 0.95, { impulse: speed });
          spill = base * 0.45;
        }
        if (Math.abs(lx) > 0.25) this.damage('headlight' + side, spill * 0.9);
        else { this.damage('headlightL', spill * 0.35); this.damage('headlightR', spill * 0.35); }
        this.damage('hood', spill * 0.6, { impulse: speed });
        this.damage('cooling', spill * 0.45);
        this.damage('engine', spill * 0.25);
        this.damage('body', base * 0.22);
        if (base > 45) this.damage('glass', spill * 0.35);
        if (Math.abs(lx) > 0.45) {
          this.damage(side === 'L' ? 'wheelFL' : 'wheelFR', spill * 0.35);
          this.damage('suspension', spill * 0.2);
        }
        if (spill > 14 && chance(0.25)) this.leaks.coolant = Math.max(this.leaks.coolant, 0.002 + spill * 0.00005);
        break;
      }
      case 'rear': {
        let spill = base;
        if (!this.isDetached('bumperR')) {
          this.damage('bumperR', base * 0.95, { impulse: speed });
          spill = base * 0.45;
        }
        this.damage('trunk', spill * 0.65, { impulse: speed });
        this.damage('fuelTank', spill * 0.3);
        this.damage('exhaust', spill * 0.5);
        this.damage('body', base * 0.22);
        if (spill > 12 && chance(0.3)) this.leaks.fuel = Math.max(this.leaks.fuel, 0.004 + spill * 0.0001);
        if (Math.abs(lx) > 0.45) this.damage(side === 'L' ? 'wheelRL' : 'wheelRR', spill * 0.3);
        break;
      }
      case 'left':
      case 'right': {
        const s = zone === 'left' ? 'L' : 'R';
        if (lz > 1.25) {
          this.damage(s === 'L' ? 'wheelFL' : 'wheelFR', base * 0.45);
          this.damage('suspension', base * 0.25);
          this.damage('headlight' + s, base * 0.2);
          if (base > 10 && chance(0.2)) this.puncture(s === 'L' ? 0 : 1);
        } else if (lz < -1.15) {
          this.damage(s === 'L' ? 'wheelRL' : 'wheelRR', base * 0.45);
          this.damage('suspension', base * 0.25);
          if (base > 10 && chance(0.2)) this.puncture(s === 'L' ? 2 : 3);
        } else {
          this.damage('door' + s, base * 0.85, { impulse: speed });
        }
        if (lz > 0.2 && lz < 1.3) this.damage('mirror' + s, base * 0.7, { impulse: speed });
        this.damage('glass', base * 0.12);
        this.damage('body', base * 0.32);
        break;
      }
      case 'bottom': {
        this.damage('exhaust', base * 0.6);
        this.damage('suspension', base * 0.35);
        this.damage('gearbox', base * 0.12);
        if (lz < -0.8) this.damage('fuelTank', base * 0.2);
        if (base > 8 && chance(0.35)) {
          this.leaks.oil = Math.max(this.leaks.oil, 0.0012 + base * 0.00004);
          this.events.emit('note', { text: 'Что-то шкрябнуло по днищу. Под машиной капает…' });
        }
        break;
      }
      case 'roof': {
        this.damage('glass', base * 0.7);
        this.damage('body', base * 0.6);
        this.damage('doorL', base * 0.15, { quiet: true });
        this.damage('doorR', base * 0.15, { quiet: true });
        this.damage('mirrorL', base * 0.5, { quiet: true });
        this.damage('mirrorR', base * 0.5, { quiet: true });
        break;
      }
    }
    this.events.emit('impact', { zone, speed, base });
    return base;
  }

  // жёсткая посадка после прыжка
  landing(wheelIndex, speed) {
    if (speed < 3.2) return;
    const e = speed - 3.2;
    this.damage('suspension', e * 4.5);
    this.damage(WHEEL_IDS[wheelIndex], e * 3.2);
    if (e > 2.5 && chance(0.12 * e)) this.puncture(wheelIndex);
  }

  // общее состояние в процентах
  overall() {
    let sum = 0, w = 0;
    for (const [id, def] of Object.entries(PARTS)) {
      sum += this.hp(id) * def.weight;
      w += def.weight;
    }
    return sum / w;
  }

  // множители, которые читает физика
  factors() {
    const f = (id) => this.frac(id);
    const eng = f('engine');
    let power = eng > 0.2 ? 0.45 + 0.55 * eng : 0.2 + eng;
    if (this.hasFault('plugs')) power *= 0.65;
    else if (this.faults.plugs) power *= 0.88;
    if (this.fluids.oil < 0.08) power *= 0.7;

    let brake = 0.28 + 0.72 * f('brakes');
    if (this.hasFault('brakeline')) brake *= 0.45;

    const gb = f('gearbox');
    const tireGrip = WHEEL_IDS.map((id, i) => {
      if (this.isDetached(id)) return 0;
      let g = 0.74 + 0.26 * f(id);
      if (this.flat[i]) g *= 0.55;
      return g;
    });

    let drag = 0;
    for (const id of ['doorL', 'doorR', 'hood', 'trunk']) if (this.isDetached(id)) drag += 0.04;
    if (this.hp('glass') < 10) drag += 0.06;

    return {
      power,
      misfire: (1 - eng) * 0.5 + (this.hasFault('plugs') ? 0.35 : 0),
      brake,
      suspDamp: 0.3 + 0.7 * f('suspension'),
      suspStiff: 0.78 + 0.22 * f('suspension'),
      shake: (1 - f('suspension')) * 0.6,
      shiftTime: 0.28 + 0.9 * (1 - gb),
      gearPop: gb < 0.5 ? (0.5 - gb) * 0.5 : 0,
      maxGear: gb < 0.12 ? 3 : 4,
      clutchCap: 250 * (0.18 + 0.82 * f('clutch')),
      tireGrip,
      drag,
      steerWobble: (1 - f('suspension')) * 0.02 + (this.flat[0] || this.flat[1] ? 0.03 : 0),
    };
  }

  // износ и утечки
  update(dt, s) {
    const fl = this.fluids;
    // утечки
    if (this.leaks.oil > 0) fl.oil = Math.max(0, fl.oil - this.leaks.oil * dt * (s.engineOn ? 1 : 0.3));
    if (this.leaks.coolant > 0) fl.coolant = Math.max(0, fl.coolant - this.leaks.coolant * dt * (s.engineOn ? 1 : 0.3));
    if (s.engineOn) fl.oil = Math.max(0, fl.oil - 0.000025 * dt * (1.5 - this.frac('engine')));

    // двигатель
    if (s.engineOn) {
      if (s.temp > 112) this.damage('engine', (s.temp - 112) * 0.06 * dt, { quiet: true });
      if (fl.oil < 0.18) this.damage('engine', (0.18 - fl.oil) * 3.5 * dt, { quiet: true });
      if (s.rpm > 5400) this.damage('engine', 0.02 * dt, { quiet: true });
    }
    // тормоза
    if (s.brake > 0.1 && s.speed > 2) this.damage('brakes', s.brake * s.speed * 0.0012 * dt, { quiet: true });
    // сцепление горит
    if (s.clutchSlip > 0) this.damage('clutch', s.clutchSlip * 0.6 * dt, { quiet: true });
    // колёса
    for (let i = 0; i < 4; i++) {
      const id = WHEEL_IDS[i];
      if (this.isDetached(id)) continue;
      if (this.flat[i] && s.speed > 1) {
        this.damage(id, s.speed * 0.022 * dt, { quiet: true });
        if (this.parts[id].hp <= 0) this.detach(id, { impulse: s.speed });
      } else if (s.rough > 0.02 && s.speed > 3) {
        this.damage(id, s.rough * s.speed * 0.012 * dt, { quiet: true });
        // лысая резина на камнях — прокол
        if (this.parts[id].hp < 25 && chance(s.rough * s.speed * 0.00012 * dt * 60)) this.puncture(i);
      }
    }
    // подвеска на кочках
    if (s.rough > 0.03 && s.speed > 4) this.damage('suspension', s.rough * s.speed * 0.006 * dt, { quiet: true });

    // временный ремонт постепенно сдаётся
    for (const [id, f] of Object.entries(this.faults)) {
      if (!f.temp) continue;
      f.wear -= dt * (s.engineOn ? 1 / 600 : 0);
      if (f.wear <= 0) {
        delete this.faults[id];
        this.addFault(id);
        this.events.emit('note', { text: `Временный ремонт не выдержал: ${FAULTS[id].name.toLowerCase()}.` });
      }
    }
  }

  // случайная поломка из «Машина внезапно начинает работать хуже»
  randomFault() {
    const options = Object.keys(FAULTS).filter((id) => !this.faults[id]);
    if (!options.length) return null;
    const id = pick(options);
    this.addFault(id);
    return id;
  }

  serialize() {
    return {
      parts: this.parts,
      flat: this.flat,
      fluids: this.fluids,
      leaks: this.leaks,
      faults: this.faults,
      lostParts: this.lostParts,
    };
  }

  deserialize(d) {
    if (!d) return;
    for (const id of Object.keys(PARTS)) if (d.parts?.[id]) this.parts[id] = { ...d.parts[id] };
    this.flat = d.flat?.slice() ?? [false, false, false, false];
    Object.assign(this.fluids, d.fluids || {});
    Object.assign(this.leaks, d.leaks || {});
    this.faults = d.faults || {};
    this.lostParts = d.lostParts || 0;
  }
}
