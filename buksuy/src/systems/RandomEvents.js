import * as THREE from 'three';
import { LOCATIONS, locationById } from '../world/WorldLayout.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { paint, merge, box, propMaterial, makeWreck, makeGarage } from '../world/Props.js';
import { rand, pick, chance, weightedPick } from '../core/util.js';
import { TextPanel } from '../ui/LootPanel.js';

// «Я просто хотел доехать до города… но по дороге постоянно происходит какая-то фигня.»

const PASSENGER_LINES = {
  anya: [
    'А можно радио погромче? А потише? А другую станцию?',
    'Мой дядя говорит, что рыба умнее людей. Я с ним спорила. Проиграла.',
    'Смотри, корова! А, нет, это куст. Похожий.',
    'Ты знаешь, что в Северном все пешком ходят? Мне таксист рассказывал. Который пешком ходит.',
    'Если что, я умею менять колесо. В теории.',
  ],
  grisha: [
    'Я читал, что такие машины выпускали до восемьдесят второго. Или до девяносто второго. Где-то так.',
    'А вы знали, что колготки можно поставить вместо ремня генератора? Я читал. В интернете.',
    'У вас тут Wi-Fi есть? Шучу. Тут и связи-то нет.',
    'Моя бабушка печёт пирожки. Не такие, как баба Нюра, но тоже ничего.',
  ],
};

const REACT = {
  crash: ['Эй! Аккуратнее!', 'Мы во что-то врезались. Или что-то в нас.', 'Я пристёгнут! Ой, ремня же нет.', 'Ты права где покупал?'],
  fast: ['Мы же не на пожар!', 'Ласточка так не летает!', 'Я хочу доехать живым. Ну, хотя бы доехать.'],
  stuck: ['Может, вылезти и толкнуть?', 'Буксуем… Как в жизни.', 'Попробуй враскачку: туда-сюда!'],
  flip: ['…Мы перевернулись? Мы перевернулись.', 'Я вижу небо снизу. Это нормально?'],
};

function cowMesh() {
  const parts = [
    paint(box(0.9, 0.9, 1.9, 0, 1.1, 0), '#e8e2d8'),
    paint(box(0.5, 0.5, 0.6, 0, 1.4, 1.15), '#e8e2d8'),
    paint(box(0.4, 0.25, 0.2, 0, 1.25, 1.5), '#d8a0a0'),
    paint(box(0.4, 0.3, 0.5, 0.25, 1.3, -0.3), '#2a2a2a'),
    paint(box(0.35, 0.3, 0.4, -0.3, 1.1, 0.4), '#2a2a2a'),
    paint(box(0.08, 0.2, 0.08, 0.2, 1.75, 1.15), '#d8d0b0'),
    paint(box(0.08, 0.2, 0.08, -0.2, 1.75, 1.15), '#d8d0b0'),
  ];
  for (const [x, z] of [[0.3, 0.7], [-0.3, 0.7], [0.3, -0.7], [-0.3, -0.7]]) parts.push(paint(box(0.18, 0.7, 0.18, x, 0.35, z), '#e8e2d8'));
  const m = new THREE.Mesh(merge(parts), propMaterial);
  m.castShadow = true;
  return m;
}

function mooseMesh() {
  const parts = [
    paint(box(0.9, 1.1, 2.2, 0, 1.6, 0), '#4a3424'),
    paint(box(0.45, 0.5, 0.8, 0, 2.0, 1.4), '#4a3424'),
    paint(box(1.6, 0.08, 0.5, 0, 2.45, 1.3), '#c8b090'),
  ];
  for (const [x, z] of [[0.3, 0.8], [-0.3, 0.8], [0.3, -0.8], [-0.3, -0.8]]) parts.push(paint(box(0.16, 1.1, 0.16, x, 0.55, z), '#3a2a1a'));
  const m = new THREE.Mesh(merge(parts), propMaterial);
  m.castShadow = true;
  return m;
}

function logMesh(len) {
  const g = new THREE.CylinderGeometry(0.35, 0.45, len, 8);
  g.rotateZ(Math.PI / 2);
  g.translate(0, 0.4, 0);
  const parts = [paint(g, '#5a4430', 0.1)];
  for (let i = 0; i < 5; i++) {
    const b = new THREE.IcosahedronGeometry(1.0, 0);
    b.translate(len / 2 - 0.5 + Math.random(), 0.9, (Math.random() - 0.5) * 2);
    parts.push(paint(b, '#36502a', 0.2));
  }
  const m = new THREE.Mesh(merge(parts), propMaterial);
  m.castShadow = true;
  return m;
}

export class RandomEvents {
  constructor(game) {
    this.game = game;
    this.events = this._defs();
    this.reset();
  }

  reset() {
    for (const a of this.active || []) this._cleanup(a);
    this.active = [];
    this.history = [];
    this.counts = {};
    this.lastAt = {};
    this.clock = 0;
    this.timer = 55;
    this.passenger = null;
    this.offer = null;
    this.tolikPos = null;
    this.gameTime = 0;
  }

  // ---------- общие помощники ----------

  _ahead(dist, side = 1, offset = 5) {
    const g = this.game;
    const car = g.vehicle;
    const p = g.world.roads.pointAhead(car.pos.x, car.pos.z, car.fwd.x, car.fwd.z, dist, (r) => r.type !== 'rail');
    if (!p) return null;
    const dx = p.dx * p.dir, dz = p.dz * p.dir; // направление движения игрока
    const rx = -dz, rz = dx;
    const hw = p.road.halfWidth;
    return {
      x: p.x + rx * side * (hw + offset), z: p.z + rz * side * (hw + offset),
      cx: p.x, cz: p.z, dx, dz, yaw: Math.atan2(dx, dz), road: p.road, hw,
    };
  }

  _add(obj, x, z, yaw = 0) {
    const g = this.game;
    obj.position.set(x, g.world.ground.height(x, z), z);
    obj.rotation.y = yaw;
    g.scene.add(obj);
    return obj;
  }

  _track(a) {
    a.t = 0;
    a.objects = a.objects || [];
    a.colliders = a.colliders || [];
    a.interactions = a.interactions || [];
    a.npcs = a.npcs || [];
    this.active.push(a);
    return a;
  }

  _cleanup(a) {
    const g = this.game;
    for (const o of a.objects) g.scene.remove(o);
    for (const c of a.colliders) g.world.colliders.remove(c);
    for (const i of a.interactions) g.interactions.remove(i);
    for (const n of a.npcs) if (n !== this.passenger?.npc) g.npcs.removeTemp(n);
    a.dead = true;
  }

  // ---------- реестр событий ----------

  _defs() {
    const R = this;
    const ev = (id, def) => ({ id, weight: 1, cooldown: 300, max: 3, ...def });
    return [
      ev('flat_tire', {
        title: 'Пробитое колесо', weight: 3, cooldown: 360, max: 3,
        when: (g) => g.vehicle.speedKmh > 30 && g.vehicle.damage.flat.some((f, i) => !f && !g.vehicle.damage.isDetached(`wheel${['FL', 'FR', 'RL', 'RR'][i]}`)),
        run: (g) => {
          const car = g.vehicle;
          const opts = [0, 1, 2, 3].filter((i) => !car.damage.flat[i] && !car.damage.isDetached(['wheelFL', 'wheelFR', 'wheelRL', 'wheelRR'][i]));
          const i = pick(opts);
          car.damage.puncture(i);
          g.audio.play('pop');
          g.ui.notify('Хлоп! Пшшшш… Колесо спустило. Машину тянет в сторону.', 'warn');
          return true;
        },
      }),
      ev('stranger', {
        title: 'Человек у дороги', weight: 2, cooldown: 500, max: 3,
        when: (g) => g.story.strangerMet < 3 && (g.world.dayNight.darkness > 0.3 || g.world.weather.fogAmount > 0.5 || g.story.strangerMet > 0) && g.vehicle.pos.z < -300,
        run: (g) => {
          const p = R._ahead(170, chance(0.5) ? 1 : -1, 2.5);
          if (!p) return false;
          const npc = g.npcs.spawnTemp('stranger', p.x, p.z, p.yaw + Math.PI);
          const a = R._track({ id: 'stranger', x: p.x, z: p.z, npcs: [npc] });
          a.update = (dt) => {
            const pp = g.playerPos;
            const d = Math.hypot(pp.x - p.x, pp.z - p.z);
            // проехал мимо — исчез; поговорил — тоже исчез
            if (a.talked && !g.dialogs.active) return false;
            if (d < 10) a.close = true;
            if (a.close && d > 35) return false;
            return true;
          };
          npc.onTalk = () => {
            a.talked = true;
            g.dialogs.start('stranger', 'stranger');
          };
          return true;
        },
      }),
      ev('hitchhiker', {
        title: 'Попутчик', weight: 2.5, cooldown: 420, max: 4,
        when: (g) => !R.passenger && g.vehicle.pos.z > -4300,
        run: (g) => {
          const p = R._ahead(160, 1, 2);
          if (!p) return false;
          const anyaFirst = !g.story.hasFlag('anya_met') && g.vehicle.pos.z > -1450 && g.vehicle.pos.z < 100;
          const anyaAgain = g.story.hasFlag('anya_met') && !g.story.hasFlag('anya_north') && g.vehicle.pos.z < -2200 && g.quests.isDone('ride');
          let npcId = 'grisha';
          if (anyaFirst) npcId = 'anya';
          else if (anyaAgain) { npcId = 'anya'; g.story.setFlag('anya_north'); }
          const npc = g.npcs.spawnTemp(npcId, p.x, p.z, p.yaw + Math.PI);
          npc.h.wave = 4;
          if (npcId === 'grisha') {
            const dests = LOCATIONS.filter((l) => l.z < g.vehicle.pos.z - 400 && l.z > g.vehicle.pos.z - 2200 && ['village', 'cafe', 'gas', 'workshop', 'factory', 'city'].includes(l.type));
            const dest = dests.length ? pick(dests) : locationById.north_city;
            R.offer = { npc: npcId, dest: dest.id, destName: dest.name, reward: Math.round(rand(3, 8)) * 100 };
          }
          const a = R._track({ id: 'hitch', x: p.x, z: p.z, npcs: [npc] });
          npc.allowCar = true;
          a.update = () => {
            if (R.passenger?.npc === npc) return false;
            const pp = g.playerPos;
            const d = Math.hypot(pp.x - p.x, pp.z - p.z);
            if (d < 30) a.close = true;
            return !(a.close && d > 120);
          };
          g.ui.notify('Впереди кто-то голосует на обочине.');
          return true;
        },
      }),
      ev('broken_car', {
        title: 'Сломанная машина', weight: 2, cooldown: 900, max: 1,
        when: (g) => !g.quests.known('tolik'),
        run: (g) => {
          const p = R._ahead(200, 1, 2.5);
          if (!p) return false;
          const wreck = makeWreck(4242, '#c8b040');
          R._add(wreck, p.x, p.z, p.yaw);
          const col = g.world.colliders.add({ type: 'box', x: p.x, z: p.z, hx: 0.85, hz: 2.05, rot: p.yaw, kind: 'car' });
          const nx = p.x - p.dz * 1.6, nz = p.z + p.dx * 1.6;
          const npc = g.npcs.spawnTemp('tolik', nx, nz, p.yaw);
          npc.h.wave = 6;
          npc.allowCar = true;
          R.tolikPos = { x: p.x, z: p.z, name: 'Толик' };
          g.quests.start('tolik');
          R._track({ id: 'tolik', x: p.x, z: p.z, objects: [wreck], colliders: [col], npcs: [npc], keep: () => !g.quests.isDone('tolik') && !R.tolikGone });
          g.ui.notify('На обочине машина с открытым капотом. Рядом машет руками человек.');
          return true;
        },
      }),
      ev('storm', {
        title: 'Гроза', weight: 1.2, cooldown: 900, max: 2,
        when: (g) => g.world.weather.type !== 'storm' && g.vehicle.pos.z > -3300,
        run: (g) => {
          g.world.weather.set('storm');
          g.ui.notify('Небо почернело за минуту. Сейчас начнётся…', 'warn');
          return true;
        },
      }),
      ev('fallen_tree', {
        title: 'Дерево на дороге', weight: 1.6, cooldown: 600, max: 2,
        when: (g) => g.vehicle.pos.z < -700 && g.vehicle.pos.z > -3300,
        run: (g) => {
          const p = R._ahead(170, 0, 0);
          if (!p) return false;
          const len = p.hw * 2 + 4;
          const log = logMesh(len);
          R._add(log, p.cx, p.cz, p.yaw);
          const col = g.world.colliders.add({
            type: 'box', x: p.cx, z: p.cz, hx: 0.5, hz: len / 2, rot: p.yaw - Math.PI / 2, kind: 'log',
            breakable: true, breakSpeed: 7.5, slow: 0.55, damage: 9,
          });
          const a = R._track({ id: 'tree', x: p.cx, z: p.cz, objects: [log], colliders: [col] });
          const it = g.interactions.add({
            x: p.cx, z: p.cz, r: len / 2 + 2, label: () => (g.inventory.has('saw', 1, true) ? 'Распилить дерево (20 мин)' : g.inventory.has('rope', 1, true) ? 'Оттащить тросом (15 мин)' : 'Дерево. Нужна пила или трос'),
            action: () => {
              if (g.inventory.has('saw', 1, true)) g.passTime(20);
              else if (g.inventory.has('rope', 1, true)) g.passTime(15);
              else {
                g.ui.notify('Голыми руками не сдвинуть. Объезжай по обочине — или разгонись и снеси (бамперу не понравится).', 'warn');
                return;
              }
              col.disabled = true;
              log.visible = false;
              g.ui.notify('Дорога свободна.', 'good');
              g.audio.play('wrench');
            },
          });
          a.interactions.push(it);
          a.onBreak = () => { log.visible = false; };
          col.onBreakEvent = a;
          g.ui.notify('Впереди поперёк дороги лежит дерево.');
          return true;
        },
      }),
      ev('kiosk', {
        title: 'Заброшенная заправка', weight: 1.2, cooldown: 900, max: 1,
        when: (g) => g.vehicle.fuel.fraction < 0.5,
        run: (g) => {
          const p = R._ahead(150, chance(0.5) ? 1 : -1, 9);
          if (!p) return false;
          const k = makeGarage({ w: 3, d: 3, h: 2.4, wall: '#8a7a6a', gate: '#3a3a3a' });
          const face = Math.atan2(p.cx - p.x, p.cz - p.z);
          R._add(k.group, p.x, p.z, face);
          const pump = new THREE.Mesh(merge([paint(box(0.6, 1.5, 0.5, 0, 0.75, 0), '#6a5a4a'), paint(box(0.62, 0.35, 0.52, 0, 1.3, 0), '#7a3a2a')]), propMaterial);
          const px = p.x + p.dx * 4, pz = p.z + p.dz * 4;
          R._add(pump, px, pz, p.yaw);
          const col = g.world.colliders.add({ type: 'box', x: p.x, z: p.z, hx: 1.5, hz: 1.5, rot: face });
          const a = R._track({ id: 'kiosk', x: p.x, z: p.z, objects: [k.group, pump], colliders: [col] });
          const fuel = Math.round(rand(6, 14));
          const it = g.interactions.add({
            x: px, z: pz, r: 3, label: () => (a.used ? 'Колонка пуста' : 'Обыскать будку заправки'),
            action: () => {
              if (a.used) return;
              a.used = true;
              g.passTime(10);
              const where = g.inventory.give('canister', 1, { fuel }, 'trunk', g.nearCar);
              new TextPanel(g, 'ЗАБРОШЕННАЯ ЗАПРАВКА', where
                ? `Будка без окон, колонка без шланга. Но под прилавком — канистра, и в ней плещется ${fuel} литров. Кто-то оставил на чёрный день. Похоже, он наступил.`
                : 'Под прилавком канистра с бензином, но тебе её некуда положить. Освободи место.').open();
              if (!where) a.used = false;
            },
          });
          a.interactions.push(it);
          g.ui.notify('У дороги виднеется ржавая будка заправки.');
          return true;
        },
      }),
      ev('trader', {
        title: 'Торговец', weight: 1.4, cooldown: 700, max: 3,
        when: () => true,
        run: (g) => {
          const p = R._ahead(170, 1, 4);
          if (!p) return false;
          const car = makeWreck(777, '#8a2a20');
          R._add(car, p.x, p.z, p.yaw);
          const trailer = new THREE.Mesh(merge([paint(box(1.5, 0.7, 2, 0, 0.75, 0), '#5a5a5a'), paint(box(1.5, 0.8, 0.05, 0, 1.4, 0.98), '#3a5a8a')]), propMaterial);
          const tx = p.x - p.dx * 4, tz = p.z - p.dz * 4;
          R._add(trailer, tx, tz, p.yaw);
          const cols = [
            g.world.colliders.add({ type: 'box', x: p.x, z: p.z, hx: 0.85, hz: 2.05, rot: p.yaw, kind: 'car' }),
            g.world.colliders.add({ type: 'box', x: tx, z: tz, hx: 0.8, hz: 1.1, rot: p.yaw, kind: 'car' }),
          ];
          const npc = g.npcs.spawnTemp('ashot', p.x - p.dz * 1.8, p.z + p.dx * 1.8, p.yaw + Math.PI / 2);
          npc.h.wave = 3;
          npc.allowCar = true;
          R._track({ id: 'trader', x: p.x, z: p.z, objects: [car, trailer], colliders: cols, npcs: [npc] });
          g.ui.notify('На обочине «Жигули» с прицепом. Хозяин призывно машет.');
          return true;
        },
      }),
      ev('rare_part', {
        title: 'Что-то блестит', weight: 1.5, cooldown: 500, max: 3,
        when: () => true,
        run: (g) => {
          const p = R._ahead(130, chance(0.5) ? 1 : -1, 3);
          if (!p) return false;
          const item = pick(['fuel_pump', 'clutch_disc', 'battery', 'spare_wheel', 'gearbox_kit', 'shock', 'belt', 'radio_lamp', 'samovar']);
          R.dropItem(item, null, p.x, p.z, true);
          g.ui.notify('На обочине что-то блестит.');
          return true;
        },
      }),
      ev('accident', {
        title: 'Авария', weight: 1, cooldown: 900, max: 1,
        when: (g) => g.vehicle.pos.z < -500,
        run: (g) => {
          const p = R._ahead(220, 0, 0);
          if (!p) return false;
          const objs = [], cols = [];
          for (const [off, rot, col] of [[-1.5, 0.9, '#3a5aa0'], [1.8, -0.6, '#e8e6e0']]) {
            const x = p.cx - p.dz * off + p.dx * off * 0.5, z = p.cz + p.dx * off + p.dz * off * 0.5;
            const w = makeWreck(Math.floor(Math.random() * 1e4), col);
            R._add(w, x, z, p.yaw + rot);
            objs.push(w);
            cols.push(g.world.colliders.add({ type: 'box', x, z, hx: 0.85, hz: 2.05, rot: p.yaw + rot, kind: 'car' }));
          }
          const npc = g.npcs.spawnTemp('pyzhov', p.cx - p.dz * (p.hw + 2) - p.dx * 8, p.cz + p.dx * (p.hw + 2) - p.dz * 8, p.yaw + Math.PI);
          npc.allowCar = true;
          npc.dialogOverride = 'pyzhov';
          R._track({ id: 'accident', x: p.cx, z: p.cz, objects: objs, colliders: cols, npcs: [npc] });
          g.ui.notify('Впереди авария — две машины поперёк дороги. Придётся объезжать.', 'warn');
          return true;
        },
      }),
      ev('hidden_road', {
        title: 'Скрытая дорога', weight: 1.5, cooldown: 600, max: 3,
        when: (g) => !!R._nearHiddenRoad(450),
        run: (g) => {
          const r = R._nearHiddenRoad(450);
          if (!r) return false;
          g.story.revealRoad(r.id);
          g.ui.notify('Среди деревьев виднеется заросшая колея. Кто-то тут ездил — давно.');
          return true;
        },
      }),
      ev('old_garage', {
        title: 'Старый гараж', weight: 1, cooldown: 900, max: 2,
        when: () => true,
        run: (g) => {
          const p = R._ahead(160, chance(0.5) ? 1 : -1, 14);
          if (!p) return false;
          const gar = makeGarage({ w: 4, d: 6, h: 2.8, wall: '#7a7e80', gate: '#6a4a2a' });
          const face = Math.atan2(p.cx - p.x, p.cz - p.z);
          R._add(gar.group, p.x, p.z, face);
          const col = g.world.colliders.add({ type: 'box', x: p.x, z: p.z, hx: 2, hz: 3, rot: face });
          const a = R._track({ id: 'garage', x: p.x, z: p.z, objects: [gar.group], colliders: [col] });
          const loot = [pick(['battery', 'spare_wheel', 'shock', 'samovar', 'clutch_disc']), pick(['oil', 'coolant', 'parts', 'tape', 'wire']), pick(['parts', 'food', 'coffee', 'radio_lamp'])];
          const money = Math.round(rand(0, 6)) * 100;
          const it = g.interactions.add({
            x: p.x + (p.cx - p.x) * 0.15, z: p.z + (p.cz - p.z) * 0.15, r: 4.5,
            label: () => (a.used ? 'Гараж пуст' : 'Обыскать старый гараж'),
            action: () => {
              if (a.used) return;
              a.used = true;
              g.passTime(15);
              const got = [];
              for (const id of loot) if (g.inventory.give(id, 1, null, 'trunk', g.nearCar)) got.push(`${ITEMS[id].icon} ${ITEMS[id].name}`);
              if (money) g.inventory.addMoney(money, 'гараж');
              g.achievements.count('searched');
              new TextPanel(g, 'СТАРЫЙ ГАРАЖ', `Ворота поддались с третьего пинка. Внутри — верстак, банки, паутина и запах старого масла.\n\nНайдено: ${got.join(', ') || 'ничего, что влезло бы'}${money ? `, ${money} ₽ в жестянке из-под чая` : ''}.`).open();
            },
          });
          a.interactions.push(it);
          g.ui.notify('В стороне от дороги стоит одинокий гараж.');
          return true;
        },
      }),
      ev('radio', {
        title: 'Странная передача', weight: 1.3, cooldown: 500, max: 3,
        when: (g) => g.vehicle.pos.z < -900,
        run: (g) => {
          g.radio.strangeBroadcast();
          return true;
        },
      }),
      ev('worse', {
        title: 'Машина барахлит', weight: 2, cooldown: 500, max: 4,
        when: (g) => Object.keys(g.vehicle.damage.faults).length < 3,
        run: (g) => {
          const id = g.vehicle.damage.randomFault();
          return !!id;
        },
      }),
      ev('cow', {
        title: 'Корова', weight: 1.5, cooldown: 600, max: 2,
        when: (g) => g.vehicle.pos.z > -2300,
        run: (g) => {
          const p = R._ahead(150, 0, 0);
          if (!p) return false;
          const cow = cowMesh();
          R._add(cow, p.cx, p.cz, p.yaw + Math.PI / 2);
          const col = g.world.colliders.add({ type: 'box', x: p.cx, z: p.cz, hx: 0.5, hz: 1.0, rot: p.yaw + Math.PI / 2, kind: 'cow', moving: true, vx: 0, vz: 0 });
          const a = R._track({ id: 'cow', x: p.cx, z: p.cz, objects: [cow], colliders: [col] });
          a.cow = { mesh: cow, col, dir: { x: -p.dz, z: p.dx }, leave: false };
          a.update = (dt) => {
            const c = a.cow;
            const pp = g.playerPos;
            const d = Math.hypot(pp.x - c.mesh.position.x, pp.z - c.mesh.position.z);
            if (g.audio.hornOn && d < 40) c.leave = true;
            if (c.leave) {
              const sp = 1.2;
              c.mesh.position.x += c.dir.x * sp * dt;
              c.mesh.position.z += c.dir.z * sp * dt;
              c.mesh.position.y = g.world.ground.height(c.mesh.position.x, c.mesh.position.z);
              col.x = c.mesh.position.x;
              col.z = c.mesh.position.z;
            }
            if (d < 25 && !a.mooed) {
              a.mooed = true;
              g.audio.play('moo');
              g.ui.subtitle('Корова', 'Му-у-у.', 2.5);
            }
            return !(a.mooed && d > 200);
          };
          g.ui.notify('На дороге стоит корова и смотрит на тебя. Посигналь (H).');
          return true;
        },
      }),
      ev('moose', {
        title: 'Лось', weight: 1, cooldown: 800, max: 2,
        when: (g) => g.vehicle.pos.z < -900 && g.vehicle.pos.z > -3400 && g.world.dayNight.darkness > 0.4,
        run: (g) => {
          const p = R._ahead(110, 0, 0);
          if (!p) return false;
          const m = mooseMesh();
          const start = { x: p.cx + p.dz * 12, z: p.cz - p.dx * 12 };
          R._add(m, start.x, start.z, p.yaw - Math.PI / 2);
          const col = g.world.colliders.add({ type: 'box', x: start.x, z: start.z, hx: 0.5, hz: 1.2, rot: p.yaw - Math.PI / 2, kind: 'moose', moving: true, vx: 0, vz: 0 });
          const a = R._track({ id: 'moose', x: p.cx, z: p.cz, objects: [m], colliders: [col] });
          a.update = (dt) => {
            a.t += dt;
            const sp = 2.6;
            m.position.x += -p.dz * sp * dt;
            m.position.z += p.dx * sp * dt;
            m.position.y = g.world.ground.height(m.position.x, m.position.z);
            col.x = m.position.x;
            col.z = m.position.z;
            col.vx = -p.dz * sp;
            col.vz = p.dx * sp;
            return a.t < 22;
          };
          g.ui.notify('Что-то большое и рогатое выходит на дорогу…', 'warn');
          return true;
        },
      }),
      ev('lights_sky', {
        title: 'Огни в небе', weight: 0.8, cooldown: 900, max: 1,
        when: (g) => g.vehicle.pos.z < -3000 && g.world.dayNight.darkness > 0.7,
        run: (g) => {
          g.world.auroraForce = 1;
          setTimeout(() => { g.world.auroraForce = 0; }, 25000);
          g.ui.notify('Небо на севере вдруг заливает зелёным светом. Сияние. Ласточка будто притормаживает сама.');
          return true;
        },
      }),
      ev('mushroom', {
        title: 'Грибник', weight: 1.2, cooldown: 700, max: 2,
        when: (g) => g.vehicle.pos.z > -2200 && g.world.dayNight.darkness < 0.5,
        run: (g) => {
          const p = R._ahead(140, chance(0.5) ? 1 : -1, 2.5);
          if (!p) return false;
          const npc = g.npcs.spawnTemp('vitya', p.x, p.z, p.yaw + Math.PI);
          npc.allowCar = true;
          npc.h.wave = 2;
          R._track({ id: 'vitya', x: p.x, z: p.z, npcs: [npc] });
          return true;
        },
      }),
    ];
  }

  // ---------- запуск ----------

  update(dt) {
    const g = this.game;
    this.gameTime += dt;
    // активные события
    for (const a of this.active) {
      if (a.dead) continue;
      a.t += dt;
      let alive = a.update ? a.update(dt) : true;
      const pp = g.playerPos;
      const far = Math.hypot(pp.x - a.x, pp.z - a.z) > 600;
      if (far && a.t > 30 && !(a.keep && a.keep())) alive = false;
      if (!alive) this._cleanup(a);
    }
    this.active = this.active.filter((a) => !a.dead);

    this._passengerUpdate(dt);

    if (g.dialogs.active || g.story.ending) return;
    if (g.player.inCar && g.vehicle.speedKmh > 18) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.fire();
        this.timer = rand(55, 120);
      }
    }
  }

  eligible() {
    const g = this.game;
    return this.events.filter((e) => {
      if ((this.counts[e.id] || 0) >= e.max) return false;
      if (this.lastAt[e.id] !== undefined && this.gameTime - this.lastAt[e.id] < e.cooldown) return false;
      if (this.history.slice(-3).includes(e.id)) return false;
      return e.when(g);
    });
  }

  fire(id = null) {
    const g = this.game;
    const list = id ? this.events.filter((e) => e.id === id) : this.eligible();
    if (!list.length) return false;
    const e = id ? list[0] : weightedPick(list, (x) => x.weight);
    let ok = false;
    try {
      ok = e.run(g);
    } catch (err) {
      console.error('event', e.id, err);
    }
    if (ok) {
      this.counts[e.id] = (this.counts[e.id] || 0) + 1;
      this.lastAt[e.id] = this.gameTime;
      this.history.push(e.id);
      g.events.emit('random-event', { id: e.id });
    }
    return ok;
  }

  _nearHiddenRoad(maxD) {
    const g = this.game;
    const p = g.vehicle.pos;
    let best = null, bd = maxD;
    for (const r of g.world.roads.roads) {
      if (!r.hidden || r.discovered) continue;
      for (let i = 0; i < r.n; i += 10) {
        const d = Math.hypot(r.x[i] - p.x, r.z[i] - p.z);
        if (d < bd) { bd = d; best = r; }
      }
    }
    return best;
  }

  // ---------- вещи на земле ----------

  dropItem(id, state, x, z, glint = false) {
    const g = this.game;
    const it = ITEMS[id];
    const s = 0.25 + Math.min(it.size, 4) * 0.12;
    const mesh = new THREE.Mesh(paint(box(s * 1.4, s * 0.7, s, 0, 0, 0), it.carPart ? '#3f8f8c' : '#8a6a4a'), propMaterial);
    mesh.castShadow = true;
    mesh.position.set(x, g.world.ground.height(x, z) + 2, z);
    const d = g.debris.spawn(mesh, { vel: new THREE.Vector3(0, 0, 0), radius: s * 0.35, itemId: id, name: it.name });
    d.state = state;
    if (glint) d.glint = true;
    return d;
  }

  // ---------- слухи от грибника ----------

  rumor() {
    const g = this.game;
    const options = [];
    const reveal = (locId, text) => options.push(() => { g.world.discover(locId); return text; });
    if (!g.world.discovered.has('old_gas')) reveal('old_gas', 'За перевалом, у трассы, старая заправка стоит. Колонка мёртвая, а насос ручной — живой. Я там бензин для мотоблока качаю. Только никому!');
    if (!g.world.discovered.has('junkyard')) reveal('junkyard', 'На старой дороге, что от трассы налево за кафе, — кладбище машин. Там с любой железки что-нибудь да открутишь.');
    if (!g.world.discovered.has('swamp')) reveal('swamp', 'В Чёрное болото не суйся. Там машина стоит, по пояс в тине. Восемьдесят шестого года, говорят. Я туда за клюквой хожу.');
    if (!g.world.discovered.has('tower')) reveal('tower', 'На западе, в горах, вышка стоит. По ночам огонёк мигает. Радио там ловит такое, что лучше не слушать.');
    if (!g.world.discovered.has('lake')) reveal('lake', 'На севере Белое озеро. Замёрзшее круглый год. Рыбаки там будку держат, а в будке — улов и иногда кофе.');
    options.push(() => 'Грибы растут после дождя. Люди — тоже. Ну, в смысле, вырастают. Ну, ты понял.');
    const f = options[0];
    return f();
  }

  // ---------- попутчики ----------

  takePassenger(npcId, dest, reward) {
    const g = this.game;
    // ищем временного NPC этого типа рядом
    let npc = null;
    for (const n of g.npcs.list.values()) {
      if (n.id === npcId && n.temp && Math.hypot(n.x - g.playerPos.x, n.z - g.playerPos.z) < 15) npc = n;
    }
    if (!npc) npc = g.npcs.spawnTemp(npcId, g.vehicle.pos.x, g.vehicle.pos.z);
    this.passenger = { npcId, npc, dest, reward, mood: 100, talkT: rand(25, 45), reactT: 0 };
    g.npcs.group.remove(npc.root);
    g.carModel.root.add(npc.root);
    npc.root.position.set(-0.38, -0.16, -0.12);
    npc.root.rotation.set(0, 0, 0);
    npc.h.setSitting(true);
    npc.active = false;
    npc.collider.disabled = true;
    g.quests.start('ride');
    g.ui.notify(`${NPCS[npcId].name} садится в машину. Куда: ${this.passengerDestName()}.`);
  }

  passengerDestName() {
    const p = this.passenger;
    return p ? locationById[p.dest]?.name || '?' : '';
  }

  passengerText() {
    const p = this.passenger;
    if (!p) return 'Пассажир вышел.';
    return `Довезти: ${NPCS[p.npcId].name} → ${this.passengerDestName()}. Настроение пассажира: ${Math.round(p.mood)}%`;
  }

  react(kind) {
    const p = this.passenger;
    if (!p || p.reactT > 0) return;
    p.reactT = 6;
    if (kind === 'crash') p.mood -= 20;
    if (kind === 'fast') p.mood -= 4;
    if (kind === 'flip') p.mood -= 40;
    this.game.ui.subtitle(NPCS[p.npcId].name, pick(REACT[kind]), 3.5);
  }

  _passengerUpdate(dt) {
    const g = this.game;
    const p = this.passenger;
    if (!p) return;
    p.reactT -= dt;
    p.talkT -= dt;
    p.npc.h.animate(dt, 0);
    if (p.talkT <= 0 && g.player.inCar) {
      p.talkT = rand(40, 75);
      const lines = PASSENGER_LINES[p.npcId] || PASSENGER_LINES.grisha;
      g.ui.subtitle(NPCS[p.npcId].name, pick(lines), 5);
      p.npc.say();
    }
    if (g.vehicle.speedKmh > 105) this.react('fast');
    if (g.vehicle.wheelsAnySpin() && g.vehicle.speedKmh < 5 && chance(dt * 0.1)) this.react('stuck');

    if (p.mood <= 0) {
      g.ui.subtitle(NPCS[p.npcId].name, 'Всё, высади меня! Я лучше пешком!', 4);
      this._dropPassenger(false);
      return;
    }
    const dest = locationById[p.dest];
    const car = g.vehicle;
    if (dest && Math.hypot(car.pos.x - dest.x, car.pos.z - dest.z) < Math.min(70, dest.r * 0.7) && car.speedKmh < 12) {
      this._dropPassenger(true);
    }
  }

  _dropPassenger(arrived) {
    const g = this.game;
    const p = this.passenger;
    this.passenger = null;
    g.carModel.root.remove(p.npc.root);
    g.npcs.removeTemp(p.npc);
    if (arrived) {
      const name = NPCS[p.npcId].name;
      if (p.npcId === 'anya' && p.dest === 'camp') {
        g.ui.subtitle(name, 'Приехали! Спасибо! Держи кассету — в дороге пригодится. Там всё, что я люблю.', 5);
        g.inventory.give('cassette', 1, null, 'pockets', true);
        g.radio.unlockCassette();
        g.npcs.rel('semenych', 2);
      } else if (p.npcId === 'anya') {
        g.ui.subtitle(name, 'Северный! Ура! Я тут останусь. Приходи на площадь — я песню сочиню. Про тебя и Ласточку.', 5);
        g.inventory.addMoney(p.reward || 300, 'попутчица');
      } else {
        g.ui.subtitle(name, `Спасибо! Вот, как договаривались. ${p.mood < 50 ? 'Хотя за такую езду надо бы скидку.' : ''}`, 4);
        g.inventory.addMoney(p.mood < 50 ? Math.round(p.reward * 0.5) : p.reward, 'попутчик');
      }
      g.achievements.count('passengers');
      g.quests.complete('ride');
    } else {
      g.quests.complete('ride');
    }
  }

  resolveTolik(ok) {
    const g = this.game;
    g.quests.complete('tolik');
    this.tolikGone = true;
    g.npcs.rel('tolik', ok ? 3 : 0);
  }

  serialize() {
    // активные события не сохраняем — после загрузки мир «чистый»
    return { counts: this.counts, history: this.history.slice(-10), passenger: this.passenger ? { npcId: this.passenger.npcId, dest: this.passenger.dest, reward: this.passenger.reward } : null };
  }

  deserialize(d) {
    this.reset();
    this.counts = d?.counts || {};
    this.history = d?.history || [];
    if (d?.passenger) {
      setTimeout(() => {
        const p = d.passenger;
        this.takePassenger(p.npcId, p.dest, p.reward);
      }, 50);
    }
  }
}

