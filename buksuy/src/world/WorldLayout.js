// Ручная разметка мира. Север — это -Z. Всё в метрах.
// Земля и лес генерятся процедурно, а дороги/река/локации расставлены руками.

export const WORLD = {
  minX: -1024,
  maxX: 1024,
  minZ: -4864,
  maxZ: 384,
  cell: 4,
  seed: 1986,
};

export const WATER_Y = 2;

// граница регионов по Z (для погоды, растительности, снега)
export const REGIONS = [
  { id: 'south', name: 'Нижние Кочки', z0: 256, z1: -900 },
  { id: 'forest', name: 'Лесной район', z0: -900, z1: -2100 },
  { id: 'mountains', name: 'Перевал', z0: -2100, z1: -3400 },
  { id: 'north', name: 'Северные земли', z0: -3400, z1: -4864 },
];

export function regionAt(z) {
  for (const r of REGIONS) if (z <= r.z0 && z > r.z1) return r;
  return z > 0 ? REGIONS[0] : REGIONS[REGIONS.length - 1];
}

export const RIVER = {
  name: 'Кривая',
  halfWidth: 13,
  depth: 3,
  points: [
    [-1100, -1440], [-820, -1490], [-600, -1470], [-422, -1505], [-220, -1590],
    [34, -1565], [200, -1525], [310, -1540], [430, -1590], [650, -1615],
    [860, -1560], [1100, -1520],
  ],
  ford: { x: 310, z: -1540, r: 48, halfWidth: 22, depth: 0.45 },
};

export const LAKE = { name: 'Белое озеро', x: 380, z: -3960, r: 200 };

// type: asphalt | dirt | gravel | rail
// hidden — не видно на карте, пока не найдёшь
export const ROADS = [
  {
    id: 'main', name: 'Трасса', type: 'asphalt', width: 7.5,
    points: [
      [8, 236], [6, 150], [-6, 60], [-8, -40], [8, -160], [30, -270], [46, -380], [52, -500],
      [36, -640], [0, -780], [-40, -920], [-56, -1060], [-48, -1190], [-24, -1320], [10, -1440],
      [34, -1565], [44, -1690], [24, -1820], [-10, -1940], [4, -2060], [56, -2170], [86, -2280],
      [70, -2400], [10, -2490], [-56, -2560], [-62, -2630], [0, -2680], [72, -2720], [96, -2780],
      [60, -2840], [-10, -2880], [-58, -2940], [-44, -3010], [20, -3070], [56, -3150], [36, -3250],
      [-10, -3360], [-20, -3500], [10, -3660], [12, -3820], [36, -3960], [44, -4080], [24, -4210],
      [4, -4340], [0, -4440], [0, -4520],
    ],
  },
  {
    id: 'kochki_street', name: 'ул. Колхозная', type: 'dirt', width: 5,
    points: [[-5, 85], [50, 92], [110, 96], [170, 86]],
  },
  {
    id: 'blue_house', name: 'Дорога к хутору', type: 'dirt', width: 4.5,
    points: [[51, -520], [-30, -556], [-140, -572], [-250, -566], [-322, -590]],
  },
  {
    id: 'old_road', name: 'Старая дорога', type: 'dirt', width: 5,
    points: [
      [-55, -1085], [-130, -1125], [-200, -1172], [-290, -1255], [-345, -1330],
      [-400, -1420], [-420, -1470], [-422, -1505], [-424, -1545], [-430, -1610],
    ],
  },
  {
    id: 'swamp_road', name: 'Дорога через болото', type: 'dirt', width: 4.5,
    points: [
      [-430, -1610], [-360, -1660], [-280, -1700], [-200, -1735], [-120, -1800],
      [-60, -1880], [-12, -1945],
    ],
  },
  {
    id: 'west_road', name: 'Заросшая дорога', type: 'dirt', width: 4.5, hidden: true,
    points: [
      [-430, -1610], [-500, -1700], [-570, -1830], [-620, -1990], [-650, -2150], [-660, -2300],
    ],
  },
  {
    id: 'tower_road', name: 'Серпантин к вышке', type: 'gravel', width: 4.5, hidden: true, maxGrade: 0.19,
    points: [
      [-660, -2300], [-620, -2420], [-570, -2550], [-520, -2690], [-520, -2830], [-540, -2935],
    ],
  },
  {
    id: 'rail', name: 'Узкоколейка', type: 'rail', width: 4.2, hidden: true, maxGrade: 0.035,
    points: [
      [-660, -2300], [-700, -2430], [-725, -2600], [-735, -2800], [-735, -3000], [-728, -3150],
      [-712, -3300], [-680, -3460], [-620, -3660], [-540, -3850], [-450, -4050], [-350, -4230],
      [-262, -4380], [-196, -4478],
    ],
  },
  {
    id: 'camp_road', name: 'К рыбакам', type: 'dirt', width: 4.5,
    points: [[12, -1450], [90, -1470], [170, -1480], [232, -1486]],
  },
  {
    id: 'ford_track', name: 'Брод', type: 'dirt', width: 4.5, hidden: true, noBridge: true,
    points: [
      [232, -1486], [290, -1505], [310, -1540], [326, -1585], [370, -1700], [410, -1860],
      [420, -2000], [410, -2120], [400, -2210],
    ],
  },
  {
    id: 'factory_road', name: 'Заводская', type: 'gravel', width: 5.5,
    points: [[4, -2060], [120, -2110], [260, -2150], [400, -2210], [500, -2300], [552, -2392]],
  },
  {
    id: 'pereval_street', name: 'ул. Горная', type: 'dirt', width: 5,
    points: [[84, -2282], [150, -2296], [214, -2300]],
  },
  {
    id: 'mine_road', name: 'Старая горная дорога', type: 'gravel', width: 5,
    points: [
      [72, -2720], [170, -2740], [250, -2820], [270, -2930], [210, -3040], [120, -3110], [56, -3150],
    ],
  },
  {
    id: 'lake_road', name: 'К озеру', type: 'dirt', width: 4.5,
    points: [[12, -3725], [110, -3780], [200, -3860], [218, -3920]],
  },
  {
    id: 'city_avenue', name: 'Проспект Северный', type: 'asphalt', width: 9,
    points: [[0, -4520], [0, -4600], [0, -4700]],
  },
  {
    id: 'city_cross1', name: 'ул. Сияния', type: 'asphalt', width: 7,
    points: [[-230, -4530], [-100, -4530], [0, -4530], [100, -4530], [230, -4530]],
  },
  {
    id: 'city_cross2', name: 'ул. Механиков', type: 'asphalt', width: 7,
    points: [[-230, -4650], [-100, -4650], [0, -4650], [100, -4650], [230, -4650]],
  },
];

// Локации. r — радиус «обнаружения». known — видна на карте с самого начала.
export const LOCATIONS = [
  { id: 'misha', name: 'Дом дяди Миши', type: 'house', icon: '🏠', x: 40, z: 210, r: 60, known: true },
  { id: 'kochki', name: 'Нижние Кочки', type: 'village', icon: '🏘', x: 90, z: 70, r: 140, known: true },
  { id: 'gena', name: 'Автосервис «У Гены»', type: 'workshop', icon: '🛠', x: 40, z: -24, r: 60, known: true },
  { id: 'kolos', name: 'АЗС «Колос»', type: 'gas', icon: '⛽', x: 80, z: -392, r: 70, known: true },
  { id: 'blue_house', name: 'Дом с синими ставнями', type: 'abandoned', icon: '🏚', x: -345, z: -604, r: 60 },
  { id: 'kafe', name: 'Кафе «Трасса»', type: 'cafe', icon: '☕', x: 6, z: -1250, r: 80 },
  { id: 'junkyard', name: 'Кладбище машин', type: 'junkyard', icon: '🚗', x: -215, z: -1210, r: 70 },
  { id: 'efim', name: 'Хутор деда Ефима', type: 'house', icon: '🏠', x: -385, z: -1318, r: 55 },
  { id: 'bridge', name: 'Мост через Кривую', type: 'bridge', icon: '🌉', x: 34, z: -1565, r: 60 },
  { id: 'old_bridge', name: 'Старый мост', type: 'bridge', icon: '🌉', x: -422, z: -1505, r: 60 },
  { id: 'camp', name: 'Рыбацкий лагерь', type: 'camp', icon: '🏕', x: 246, z: -1494, r: 60 },
  { id: 'ford', name: 'Брод', type: 'ford', icon: '🌊', x: 310, z: -1540, r: 40 },
  { id: 'swamp', name: 'Чёрное болото', type: 'swamp', icon: '🌫', x: -215, z: -1725, r: 90 },
  { id: 'pereval', name: 'Посёлок Перевал', type: 'village', icon: '🏘', x: 160, z: -2292, r: 120 },
  { id: 'factory', name: 'Завод «Красный поршень»', type: 'factory', icon: '🏭', x: 588, z: -2440, r: 110 },
  { id: 'landslide', name: 'Обвал на серпантине', type: 'poi', icon: '🪨', x: 82, z: -2808, r: 60, hiddenUntilFlag: 'landslide' },
  { id: 'tower', name: 'Радиовышка', type: 'tower', icon: '📡', x: -545, z: -2962, r: 70 },
  { id: 'tunnel', name: 'Тоннель узкоколейки', type: 'tunnel', icon: '🚇', x: -728, z: -3172, r: 70 },
  { id: 'old_gas', name: 'Заброшенная АЗС', type: 'gas_abandoned', icon: '⛽', x: -54, z: -3500, r: 60 },
  { id: 'lake', name: 'Белое озеро', type: 'lake', icon: '🧊', x: 380, z: -3960, r: 230 },
  { id: 'ice_hut', name: 'Рыбацкая будка на льду', type: 'poi', icon: '🛖', x: 430, z: -3930, r: 40 },
  { id: 'checkpoint', name: 'КПП «Северный»', type: 'checkpoint', icon: '🚧', x: 44, z: -4080, r: 60 },
  { id: 'depot', name: 'Старое депо', type: 'depot', icon: '🚂', x: -172, z: -4500, r: 70 },
  { id: 'north_city', name: 'Северный город', type: 'city', icon: '🏙', x: 0, z: -4590, r: 160, known: true, fuzzy: true },
];

export const locationById = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

// Площадки, которые выравниваются под постройки
export const PADS = [
  { x: 40, z: 210, r: 30, blend: 25 },
  { x: 95, z: 78, r: 75, blend: 40 },
  { x: 40, z: -24, r: 28, blend: 22 },
  { x: 80, z: -392, r: 34, blend: 24 },
  { x: -345, z: -604, r: 24, blend: 20 },
  { x: 6, z: -1250, r: 42, blend: 26 },
  { x: -215, z: -1210, r: 42, blend: 30 },
  { x: -385, z: -1318, r: 26, blend: 20 },
  { x: 246, z: -1494, r: 18, blend: 14 },
  { x: 588, z: -2440, r: 85, blend: 40 },
  { x: 160, z: -2292, r: 62, blend: 40 },
  { x: -545, z: -2962, r: 20, blend: 30 },
  { x: -54, z: -3500, r: 26, blend: 20 },
  { x: 44, z: -4080, r: 22, blend: 20 },
  { x: -172, z: -4500, r: 42, blend: 30 },
  { x: 0, z: -4590, r: 270, blend: 90 },
];

// Особые зоны поверхности
export const ZONES = [
  { id: 'swamp', x: -215, z: -1725, r: 85, surface: 'deepmud', sink: 0.6 },
  { id: 'kolhoz_mud', x: -120, z: -300, r: 60, surface: 'mud', sink: 0.3 },
  { id: 'factory_mud', x: 470, z: -2260, r: 45, surface: 'mud', sink: 0.3 },
  { id: 'quarry_sand', x: 300, z: -2600, r: 70, surface: 'sand', sink: 0.0 },
];

// где ставим горный «пик» под вышку и хребет над тоннелем
export const LANDMARK_BUMPS = [
  { x: -545, z: -2962, r: 300, h: 42 },
  { x: -728, z: -3172, r: 220, h: 38, rail: true },
];

export const SPAWN = {
  car: { x: 31, z: 206, yaw: Math.PI }, // носом на север (-Z), во дворе у Миши
  player: { x: 27, z: 198 },
};

export const MENU_SHOT = { x: 30, z: -270 };
