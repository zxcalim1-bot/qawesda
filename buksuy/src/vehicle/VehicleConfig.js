// Характеристики Ласточки и улучшения. Цены специально кусачие.

export const BASE = {
  mass: 1080,
  size: { w: 1.64, h: 1.42, l: 4.12 },
  wheelRadius: 0.3,
  restLength: 0.36,
  mountY: -0.12,
  travel: 0.24,
  spring: 23000,
  damperBump: 2100,
  damperRebound: 2900,
  antiRoll: 9000,
  idleRpm: 850,
  maxRpm: 5800,
  finalDrive: 4.1,
  gears: { '-1': -3.53, 0: 0, 1: 3.75, 2: 2.3, 3: 1.49, 4: 1.0 },
  brakeForce: 5200, // Н на колесо при полном нажатии
  handbrakeForce: 4200,
  maxSteer: 0.58,
};

// нормированная кривая момента
const CURVE = [
  [0, 0.4], [800, 0.55], [1500, 0.76], [2500, 0.92], [3400, 1.0], [4500, 0.94], [5400, 0.8], [6200, 0.55],
];

export function torqueCurve(rpm) {
  for (let i = 0; i < CURVE.length - 1; i++) {
    const [r0, v0] = CURVE[i], [r1, v1] = CURVE[i + 1];
    if (rpm <= r1) return v0 + ((v1 - v0) * (rpm - r0)) / (r1 - r0);
  }
  return CURVE[CURVE.length - 1][1];
}

export const UPGRADES = {
  engine: {
    name: 'Двигатель',
    levels: [
      { label: '50 л.с.', hp: 50, price: 0 },
      { label: '70 л.с.', hp: 70, price: 6800, desc: 'Расточка, новые поршни. Гена клянётся, что поедет.' },
      { label: '90 л.с.', hp: 90, price: 14500, desc: 'Двигатель от «Волги». Как влез — не спрашивай.', needs: 'carburetor' },
    ],
  },
  suspension: {
    name: 'Подвеска',
    levels: [
      { label: 'обычная', stiff: 1, damp: 1, travel: 0.24, lift: 0, price: 0 },
      { label: 'усиленная', stiff: 1.22, damp: 1.25, travel: 0.25, lift: 0.02, price: 4600, desc: 'Меньше качает, меньше бьёт.' },
      { label: 'внедорожная', stiff: 1.12, damp: 1.35, travel: 0.32, lift: 0.09, price: 9200, desc: 'Ласточка привстаёт на цыпочки.' },
    ],
  },
  tires: {
    name: 'Шины',
    choice: true, // можно купить любой вариант, не по порядку
    levels: [
      { label: 'обычные', key: 'road', price: 0 },
      { label: 'грязевые', key: 'mud', price: 3600, desc: 'Зубастые. В грязи — сказка, на асфальте гудят.' },
      { label: 'зимние', key: 'winter', price: 3600, desc: 'С шипами. Лёд им не страшен.' },
    ],
  },
  tank: {
    name: 'Бензобак',
    levels: [
      { label: '40 л', liters: 40, price: 0 },
      { label: '60 л', liters: 60, price: 2600, desc: 'Бак от «Нивы» и немного сварки.' },
      { label: '90 л', liters: 90, price: 6300, desc: 'Дополнительный бак в багажнике. Пахнет бензином. Всегда.' },
    ],
  },
  brakes: {
    name: 'Тормоза',
    levels: [
      { label: 'обычные', mul: 1, price: 0 },
      { label: 'улучшенные', mul: 1.35, price: 3900, desc: 'Вентилируемые диски. Останавливаться — приятно.' },
    ],
  },
  roofrack: {
    name: 'Багажник на крышу',
    levels: [
      { label: 'нет', slots: 0, price: 0 },
      { label: 'есть', slots: 6, price: 1900, desc: '+6 мест. Ветер свистит.' },
    ],
  },
  bullbar: {
    name: 'Кенгурятник',
    levels: [
      { label: 'нет', armor: 1, price: 0 },
      { label: 'есть', armor: 0.6, price: 2700, desc: 'Перед бьётся на 40% меньше. Лоси уважают.' },
    ],
  },
};

// множители сцепления шин по поверхностям
export const TIRE_GRIP = {
  road: {},
  mud: { asphalt: 0.9, concrete: 0.9, dirt: 1.12, gravel: 1.06, grass: 1.16, forest: 1.16, mud: 1.45, deepmud: 1.55, sand: 1.25, snow: 1.12, riverbed: 1.2 },
  winter: { asphalt: 0.95, snow: 1.6, ice: 2.4, mud: 1.05, dirt: 1.02 },
};

export class VehicleConfig {
  constructor() {
    this.levels = { engine: 0, suspension: 0, tires: 0, tank: 0, brakes: 0, roofrack: 0, bullbar: 0 };
  }

  level(key) {
    return UPGRADES[key].levels[this.levels[key]];
  }

  get hp() { return this.level('engine').hp; }
  get peakTorque() { return this.hp * 1.72; }
  get tankLiters() { return this.level('tank').liters; }
  get tireKey() { return this.level('tires').key; }
  get armor() { return this.level('bullbar').armor; }

  tireGrip(surfaceKey) {
    return TIRE_GRIP[this.tireKey][surfaceKey] ?? 1;
  }

  serialize() {
    return { ...this.levels };
  }

  deserialize(d) {
    if (d) Object.assign(this.levels, d);
  }
}
