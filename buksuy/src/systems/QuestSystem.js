import { QUESTS } from '../data/quests.js';
import { locationById } from '../world/WorldLayout.js';

// Состояние заданий: какой этап, выполнено ли.
export class QuestSystem {
  constructor(game) {
    this.game = game;
    this.state = {};
    this.order = [];
  }

  reset() {
    this.state = {};
    this.order = [];
  }

  start(id, stage) {
    const def = QUESTS[id];
    if (!def) return;
    const first = Object.keys(def.stages)[0];
    if (this.state[id] && !this.state[id].done) {
      if (stage) this.set(id, stage);
      return;
    }
    if (this.state[id]?.done && !def.repeatable) return;
    const again = !!this.state[id];
    this.state[id] = { stage: stage || first, done: false };
    if (again) this.order.splice(this.order.indexOf(id), 1);
    this.order.push(id);
    this.game.ui.notify(`📍 Новое задание: ${def.title}`, 'good');
    this.game.audio.play('quest');
    this.game.events.emit('quest', { id, stage: this.state[id].stage });
  }

  set(id, stage) {
    const s = this.state[id];
    if (!s || s.done || s.stage === stage) return;
    s.stage = stage;
    const t = this.text(id);
    this.game.ui.notify(`📍 ${QUESTS[id].title}: ${t}`);
    this.game.events.emit('quest', { id, stage });
  }

  complete(id) {
    const s = this.state[id];
    if (!s) {
      this.state[id] = { stage: null, done: true };
      this.order.push(id);
    } else {
      if (s.done) return;
      s.done = true;
    }
    this.game.ui.notify(`✔ Выполнено: ${QUESTS[id].title}`, 'good');
    this.game.audio.play('quest');
    this.game.events.emit('quest-done', { id });
    this.game.achievements.count('quests');
  }

  known(id) {
    return !!this.state[id];
  }

  active(id) {
    return !!this.state[id] && !this.state[id].done;
  }

  isDone(id) {
    return !!this.state[id]?.done;
  }

  stage(id) {
    return this.state[id]?.stage;
  }

  is(id, stage) {
    return this.active(id) && this.state[id].stage === stage;
  }

  text(id) {
    const s = this.state[id];
    const st = QUESTS[id].stages[s?.stage];
    if (!st) return '';
    return typeof st.text === 'function' ? st.text(this.game) : st.text;
  }

  // точка на карте для этапа
  target(id) {
    const s = this.state[id];
    if (!s || s.done) return null;
    const st = QUESTS[id].stages[s.stage];
    if (!st?.target) return null;
    const t = typeof st.target === 'function' ? st.target(this.game) : st.target;
    if (!t) return null;
    if (typeof t === 'string') {
      const l = locationById[t];
      return l ? { x: l.x, z: l.z, name: l.name } : null;
    }
    return t;
  }

  list() {
    return this.order.map((id) => ({ id, def: QUESTS[id], ...this.state[id], text: this.text(id), target: this.target(id) }));
  }

  current() {
    // что показывать в HUD: главное задание или последнее активное
    const act = this.order.filter((id) => this.active(id));
    const side = act.filter((id) => !QUESTS[id].main && id !== 'secret');
    const id = side[side.length - 1] || act.find((i) => QUESTS[i].main);
    return id ? { id, title: QUESTS[id].title, text: this.text(id) } : null;
  }

  update() {
    const g = this.game;
    // ящик найден — переходим к доставке
    if (this.is('tackle', 'find') && g.inventory.has('tackle', 1, true)) this.set('tackle', 'bring');
    if (this.active('garage') && g.worldInteractions.left.garage17) this.complete('garage');
  }

  serialize() {
    return { state: this.state, order: this.order };
  }

  deserialize(d) {
    this.state = d?.state || {};
    this.order = d?.order || Object.keys(this.state);
  }
}
