import { NOTES } from '../data/places.js';
import { ENDINGS } from '../data/endings.js';
import { LOCATIONS } from '../world/WorldLayout.js';
import { TextPanel } from '../ui/LootPanel.js';
import { EndingScreen } from '../ui/EndingScreen.js';

const CLUES = Object.entries(NOTES).filter(([, n]) => n.clue).map(([id]) => id);
const SECRET_NEED = 5;

// Сюжет: флаги, улики, записки, концовки.
export class Story {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.flags = new Set();
    this.readNotes = new Set();
    this.clues = new Set();
    this.strangerMet = 0;
    this.ending = null;
    this.endingsSeen = this.endingsSeen || new Set();
  }

  // ---------- флаги ----------
  hasFlag(f) {
    return this.flags.has(f);
  }

  setFlag(f) {
    if (this.flags.has(f)) return;
    this.flags.add(f);
    this.game.world.setFlag(f);
    this.game.events.emit('story-flag', { flag: f });
  }

  // ---------- записки и улики ----------
  noteRead(id) {
    return this.readNotes.has(id);
  }

  clueCount() {
    return this.clues.size;
  }

  clueTotal() {
    return CLUES.length;
  }

  addClueFromNote(id, silent = false) {
    this.readNotes.add(id);
    const n = NOTES[id];
    if (!n?.clue || this.clues.has(id)) return;
    this.clues.add(id);
    if (!this.game.quests.known('secret')) this.game.quests.start('secret');
    if (!silent) this.game.ui.notify(`🔎 Улика: ${n.title} (${this.clues.size}/${CLUES.length})`, 'good');
    this.game.events.emit('clue', { id });
  }

  read(id) {
    const n = NOTES[id];
    if (!n) return;
    const first = !this.readNotes.has(id);
    this.readNotes.add(id);
    if (n.clue) this.addClueFromNote(id, !first);
    new TextPanel(this.game, n.title.toUpperCase(), n.text).open();
    this.game.audio.play('paper');
  }

  glovebox() {
    const g = this.game;
    if (g.ui.modal) return;
    this.read('glovebox');
    if (!this.hasFlag('glovebox_money')) {
      this.setFlag('glovebox_money');
      g.inventory.addMoney(150, 'бардачок');
      g.ui.notify('Под запиской — смятые 150 рублей. Спасибо, дядя Миша.', 'good');
    }
  }

  revealRoad(id) {
    const r = this.game.world.roads.byId[id];
    if (!r || r.discovered) return;
    r.discovered = true;
    this.game.ui.notify(`🗺 На карте отмечена дорога: ${r.name}`, 'good');
  }

  metStranger() {
    this.strangerMet++;
  }

  // ---------- начало ----------
  intro() {
    const g = this.game;
    g.ui.notify('Нажми E рядом с человеком, чтобы поговорить. F — сесть в машину.');
    setTimeout(() => {
      if (g.state === 'playing' && !this.hasFlag('intro_done')) {
        const misha = g.npcs.get('misha');
        if (misha) g.dialogs.start('misha_intro', 'misha');
      }
    }, 900);
  }

  // ---------- передатчик на вышке ----------
  transmitter() {
    const g = this.game;
    const night = g.world.dayNight.darkness > 0.6;
    const car = g.vehicle;
    const tower = LOCATIONS.find((l) => l.id === 'tower');
    const carNear = Math.hypot(car.pos.x - tower.x, car.pos.z - tower.z) < 60;
    if (!g.quests.isDone('signal')) {
      if (!g.quests.known('signal')) g.quests.start('signal', 'answer');
      else g.quests.set('signal', 'answer');
    }
    if (!night) {
      new TextPanel(g, 'ПУЛЬТ ПЕРЕДАТЧИКА', 'Лампы тёплые, стрелки дрожат. В наушниках — только шум и далёкий собачий лай. Похоже, днём эфир забит. Ночью сигнал должен быть чище.', { paper: false }).open();
      return;
    }
    if (!carNear) {
      new TextPanel(g, 'ПУЛЬТ ПЕРЕДАТЧИКА', 'Ты щёлкаешь тумблером. Из наушников: «…Ласточка, Ласточка, я Маяк. Приём…» Голос ждёт ответа — но не твоего. Похоже, ответить должна сама машина. Пригони Ласточку к вышке.', { paper: false }).open();
      return;
    }
    new TextPanel(g, 'ПУЛЬТ ПЕРЕДАТЧИКА', 'Ночь. Ласточка стоит у подножия вышки. На пульте горит одна-единственная надпись: «ОТВЕТ». Палец сам тянется к тумблеру.', {
      paper: false,
      buttons: [
        { label: 'Нажать «ОТВЕТ»', primary: true, action: (p) => { p.close(); g.quests.complete('signal'); this.finish('aurora'); } },
        { label: 'Не трогать', action: (p) => p.close() },
      ],
    }).open();
  }

  // ---------- концовки ----------
  update() {
    const g = this.game;
    if (this.ending) return;
    const car = g.vehicle;
    // заправились — дальше на север
    if (g.quests.is('main', 'fuel') && car.fuel.fraction > 0.45) g.quests.set('main', 'north');

    // проехали тоннель
    const tun = g.world.structures.special.tunnel;
    if (tun && g.player.inCar && !this.hasFlag('via_rail')) {
      const rail = g.world.roads.byId.rail;
      const mid = Math.floor((tun.i0 + tun.i1) / 2);
      if (Math.hypot(car.pos.x - rail.x[mid], car.pos.z - rail.z[mid]) < 25) {
        this.setFlag('via_rail');
        g.ui.notify('Тоннель 1938 года. Внутри пахнет мазутом и временем.');
      }
    }

    // объехали шлагбаум
    if (!this.hasFlag('checkpoint_open') && !this.hasFlag('detour') && g.player.inCar) {
      const cp = LOCATIONS.find((l) => l.id === 'checkpoint');
      if (car.pos.z < cp.z - 30 && car.pos.z > cp.z - 80 && Math.abs(car.pos.x - cp.x) < 120) {
        this.setFlag('detour');
        g.achievements.unlock('detour');
        g.ui.subtitle('Прапорщик Сидоренко (издалека)', 'Эй! Объезжать нельзя! …Ну ладно. Я ничего не видел!', 4);
      }
    }

    // приехали в город
    const city = g.world.structures.special.city;
    if (!city) return;
    const p = g.playerPos;
    if (Math.hypot(p.x - city.x, p.z - city.z) < city.r) {
      if (g.player.inCar) {
        let id = 'main';
        if (this.clues.size >= SECRET_NEED) id = 'secret_city';
        else if (this.hasFlag('via_rail')) id = 'other_road';
        this.finish(id);
      } else if (Math.hypot(car.pos.x - city.x, car.pos.z - city.z) > 400) {
        this.finish('on_foot');
      }
    }
  }

  // бросить машину (из меню паузы)
  abandonCar() {
    this.finish('on_foot');
  }

  // продать (через Гену)
  sellCar(price) {
    this.game.inventory.addMoney(price, 'продажа машины');
    this.finish('sold', { price });
  }

  carPrice() {
    const car = this.game.vehicle;
    let p = Math.round(car.damage.overall() * 45);
    const lv = car.config.levels;
    p += lv.engine * 3000 + lv.suspension * 2000 + (lv.tires ? 1500 : 0) + lv.tank * 1200 + lv.brakes * 1500;
    return Math.max(300, p);
  }

  finish(id, data = {}) {
    const g = this.game;
    if (this.ending) return;
    const e = ENDINGS[id];
    this.ending = id;
    this.endingsSeen.add(id);
    g.quests.complete('main');
    g.achievements.unlock(e.achievement);
    if (id === 'secret_city' || id === 'main' || id === 'other_road') {
      g.npcs.setActive('kirill', true);
      g.npcs.get('kirill')?.say();
      g.vehicle.stopEngine('ending');
    }
    g.saves.save('auto');
    setTimeout(() => {
      new EndingScreen(g, e, e.text(g, data)).show();
    }, id === 'aurora' ? 600 : 1500);
    if (id === 'aurora') {
      g.world.dayNight.time = 1;
      g.world.weather.set('clear', true);
      g.world.auroraForce = 1;
      g.vehicle.lightsOn = true;
    }
  }

  // после концовки можно ездить дальше
  continueAfterEnding() {
    this.ending = null;
    this.setFlag('post_ending');
  }

  serialize() {
    return {
      flags: [...this.flags], read: [...this.readNotes], clues: [...this.clues],
      strangerMet: this.strangerMet, endingsSeen: [...this.endingsSeen],
    };
  }

  deserialize(d) {
    this.reset();
    for (const f of d?.flags || []) {
      this.flags.add(f);
      this.game.world.setFlag(f);
    }
    this.readNotes = new Set(d?.read || []);
    this.clues = new Set(d?.clues || []);
    this.strangerMet = d?.strangerMet || 0;
    this.endingsSeen = new Set(d?.endingsSeen || []);
  }
}
