import * as THREE from 'three';
import { ITEMS } from '../data/items.js';
import { chance } from './util.js';

const DETACH_TEXT = {
  bumperF: 'ПЕРЕДНИЙ БАМПЕР ОТВАЛИЛСЯ', bumperR: 'ЗАДНИЙ БАМПЕР ОТВАЛИЛСЯ',
  doorL: 'ЛЕВАЯ ДВЕРЬ ОТВАЛИЛАСЬ', doorR: 'ПРАВАЯ ДВЕРЬ ОТВАЛИЛАСЬ',
  hood: 'КАПОТ ОТВАЛИЛСЯ', trunk: 'КРЫШКА БАГАЖНИКА ОТВАЛИЛАСЬ',
  mirrorL: 'ЛЕВОЕ ЗЕРКАЛО ОТВАЛИЛОСЬ', mirrorR: 'ПРАВОЕ ЗЕРКАЛО ОТВАЛИЛОСЬ',
  exhaust: 'ГЛУШИТЕЛЬ ОТВАЛИЛСЯ',
  wheelFL: 'КОЛЕСО ОТВАЛИЛОСЬ', wheelFR: 'КОЛЕСО ОТВАЛИЛОСЬ', wheelRL: 'КОЛЕСО ОТВАЛИЛОСЬ', wheelRR: 'КОЛЕСО ОТВАЛИЛОСЬ',
};

const STOP_TEXT = {
  fuel: ['Мотор чихнул… и заглох. Бензин кончился.', 'warn'],
  overheat: ['Перегрев! Из-под капота валит пар, мотор заглох. Пусть остынет.', 'warn'],
  water: ['Двигатель захлебнулся водой!', 'big'],
  engine: ['Двигатель заглох сам по себе. Видимо, устал.', 'warn'],
  fuelpump: ['Мотор заглох. Похоже на бензонасос.', 'warn'],
  seized: ['Двигатель заклинило. Масло надо было лить.', 'big'],
  flip: ['Мотор заглох — машина лежит на боку.', 'warn'],
};

const WEATHER_TEXT = {
  rain: 'Начинается дождь. Дорога станет скользкой.',
  storm: 'Гроза. Дворников у Ласточки, кстати, нет.',
  fog: 'Наползает туман. Дальше двадцати метров ничего не видно.',
  snow: 'Пошёл снег. На лысой резине будет весело.',
  clear: 'Распогодилось.',
};

const _v = new THREE.Vector3();
const _d = new THREE.Vector3();

export function setupGameEvents(g) {
  const ev = g.events;
  const ui = g.ui;
  const playing = () => g.state === 'playing';

  // повреждения собираем пачкой, чтобы не засыпать экран
  let pending = [];
  let flushT = null;
  ev.on('part-damaged', (e) => {
    if (!playing()) return;
    pending.push(e);
    if (flushT) return;
    flushT = setTimeout(() => {
      flushT = null;
      const byId = new Map();
      for (const p of pending) {
        const cur = byId.get(p.id);
        if (!cur) byId.set(p.id, { ...p });
        else cur.to = p.to;
      }
      pending = [];
      const list = [...byId.values()].filter((p) => p.to > 0).sort((a, b) => (b.from - b.to) - (a.from - a.to)).slice(0, 2);
      for (const p of list) ui.notify(`<span class="mono">${p.name}: ${Math.round(p.from)}% → ${Math.round(p.to)}%</span>`, p.to < 25 ? 'warn' : '');
    }, 140);
  });

  ev.on('part-detached', (e) => {
    if (!playing()) {
      g.carModel.syncDetached(g.vehicle.damage);
      return;
    }
    ui.notify(DETACH_TEXT[e.id] || `${e.name.toUpperCase()} ОТВАЛИЛОСЬ`, 'big');
    g.audio.play('clunk');
    g.cameraRig.addShake(0.3);
    const obj = g.carModel.detach(e.id);
    if (obj) {
      const car = g.vehicle;
      const wheel = e.id.startsWith('wheel');
      const vel = car.vel.clone();
      vel.x += (Math.random() - 0.5) * 3;
      vel.z += (Math.random() - 0.5) * 3;
      vel.y += 1.5 + Math.random() * 2;
      if (wheel) vel.multiplyScalar(1.15);
      g.debris.spawn(obj, {
        vel, rolling: wheel && vel.length() > 3, radius: wheel ? 0.3 : 0.12,
        itemId: wheel ? 'part_wheel' : `part_${e.id}`, name: wheel ? 'Колесо' : ITEMS[`part_${e.id}`]?.name || e.name, partId: e.id,
      });
    }
    if (e.id === 'doorL' || e.id === 'doorR') g.achievements.unlock('where_door');
    g.achievements.count('partsLost');
  });

  ev.on('puncture', (e) => {
    if (!playing()) return;
    g.audio.play('pop');
    ui.notify(`${e.name}: прокол!`, 'warn');
  });

  ev.on('fault', (e) => {
    if (!playing()) return;
    g.audio.play('clunk');
    ui.notify(`⚠ ${e.name}: ${e.effect}`, 'warn');
    if (e.id === 'belt') ui.notify('Лампочка зарядки горит. Аккумулятор садится.', 'warn');
  });

  ev.on('engine-start', (e) => {
    g.audio.play('engine_start');
    if (e.bump) g.achievements.unlock('bump_start');
  });
  ev.on('engine-crank', () => g.audio.play('starter_click'));
  ev.on('engine-fail', (e) => {
    g.audio.play('starter_click');
    ui.notify(e.reason, 'warn');
  });
  ev.on('engine-stop', (e) => {
    if (!playing()) return;
    const t = STOP_TEXT[e.reason];
    if (t) ui.notify(t[0], t[1]);
    if (e.reason === 'fuel') g.achievements.unlock('empty_tank');
  });
  ev.on('engine-flooded', () => g.achievements.unlock('submarine'));

  ev.on('car-impact', (e) => {
    if (!playing()) return;
    const car = g.vehicle;
    g.cameraRig.addShake(Math.min(1, e.base / 50));
    g.audio.play('impact', { v: Math.min(1, e.speed / 14) });
    _v.set(e.x, e.y, e.z);
    _d.copy(car.pos).sub(_v).setY(0).normalize();
    g.carModel.dent(_v, _d, e.base / 25);
    g.carFx.impact(e.x, e.y, e.z, e.speed, e.zone === 'front' && car.damage.hp('glass') < 40 ? 'glass' : 'spark');
    if (e.base > 12) g.randomEvents.react('crash');
    g.achievements.count('crashes');
    // хрупкая посылка
    if (e.base > 22 && g.inventory.has('parcel', 1, true) && !g.story.hasFlag('parcel_broken')) {
      g.story.setFlag('parcel_broken');
      ui.notify('В посылке что-то звонко хрустнуло. Ой.', 'warn');
    }
    if (e.base > 15) maybeDropFromTrunk(g);
  });

  ev.on('car-landing', (e) => {
    if (!playing()) return;
    g.cameraRig.addShake(Math.min(0.6, e.speed / 10));
    g.audio.play('clunk');
    if (e.speed > 4) maybeDropFromTrunk(g);
  });

  let scrapeT = 0;
  ev.on('car-scrape', () => {
    const now = performance.now();
    if (now - scrapeT < 400) return;
    scrapeT = now;
    g.audio.play('scrape');
  });

  ev.on('car-flipped', () => {
    if (!playing()) return;
    g.achievements.unlock('upside_down');
    ui.notify('Ласточка легла на бок. Выйди (F) и поставь её на колёса (держи E).', 'warn');
    g.randomEvents.react('flip');
  });

  ev.on('obstacle-break', (e) => {
    const c = e.collider;
    if (c.inst) g.world.vegetation.breakInstance(c);
    if (c.onBreakEvent?.onBreak) c.onBreakEvent.onBreak();
    g.audio.play('impact', { v: 0.3 });
    const p = g.vehicle.pos;
    for (let i = 0; i < 12; i++) g.world.effects.emit(c.kind === 'bush' ? 'grass' : 'dirt', c.x, p.y, c.z, 0, 3, 0, 3);
  });

  ev.on('gear-pop', () => {
    g.audio.play('grind');
    ui.notify('Передача выскочила! Коробка просит ремонта.', 'warn');
  });

  ev.on('misfire', () => {
    if (chance(0.35)) {
      g.audio.play('backfire');
      g.carFx.backfire();
    }
  });

  ev.on('lightning', (e) => g.audio.play('thunder', { delay: e.delay }));

  ev.on('location-discovered', (e) => {
    if (!playing()) return;
    ui.notify(`${e.location.icon} Открыто место: <b>${e.location.name}</b>`, 'good');
  });

  ev.on('road-discovered', (e) => {
    if (!playing() || !e.road.hidden) return;
    ui.notify(`🗺 Найдена дорога: ${e.road.name}`, 'good');
  });

  ev.on('note', (e) => {
    if (playing()) ui.notify(e.text, e.kind || '');
  });

  ev.on('repaired', (e) => {
    if (e.key === 'tights') g.achievements.unlock('tights');
  });

  ev.on('weather', (e) => {
    if (!playing() || g.ui.modal) return;
    const t = WEATHER_TEXT[e.type];
    if (t) ui.notify(t);
  });

  let firstEnter = true;
  ev.on('enter-car', () => {
    if (firstEnter) {
      firstEnter = false;
      ui.notify('Q — завести, W — газ, S — тормоз/назад, L — фары, R — радио. Выйти — F.');
    }
  });

}

// без крышки багажника вещи выпрыгивают на кочках
function maybeDropFromTrunk(g) {
  const car = g.vehicle;
  if (!car.damage.isDetached('trunk') || !chance(0.45)) return;
  const slots = g.inventory.trunk.slots.filter((s) => !ITEMS[s.id].quest);
  if (!slots.length) return;
  const s = slots[Math.floor(Math.random() * slots.length)];
  if (s.state) g.inventory.trunk.removeSlot(s);
  else g.inventory.trunk.remove(s.id, 1);
  car.worldPoint(0, 0.3, -2.8, _v);
  g.randomEvents.dropItem(s.id, s.state || null, _v.x, _v.z);
  g.ui.notify(`Из багажника вылетело: ${ITEMS[s.id].icon} ${ITEMS[s.id].name}. Крышки-то нет!`, 'warn');
}
