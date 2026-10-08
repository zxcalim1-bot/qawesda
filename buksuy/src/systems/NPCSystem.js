import * as THREE from 'three';
import { NPCS } from '../data/npcs.js';
import { Humanoid } from '../player/Humanoid.js';
import { wrapAngle } from '../core/util.js';

class NPC {
  constructor(game, id, spot) {
    this.game = game;
    this.id = id;
    this.def = NPCS[id];
    this.h = new Humanoid(this.def.look);
    this.root = this.h.root;
    this.home = spot ? { ...spot } : null;
    this.yaw = spot?.yaw ?? 0;
    this.active = !this.def.hidden;
    this.sitting = false;
    this.temp = false; // для событий
    this.collider = null;
    if (spot) this.place(spot.x, spot.z, spot.yaw);
  }

  place(x, z, yaw = this.yaw) {
    const g = this.game;
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.root.position.set(x, g.world.ground.height(x, z), z);
    this.root.rotation.y = yaw;
    if (this.collider) g.world.colliders.move(this.collider, x, z);
  }

  say() {
    this.h.talk = 1.5;
  }

  update(dt, playerPos) {
    const d = Math.hypot(playerPos.x - this.x, playerPos.z - this.z);
    // поворачивается к игроку, если тот рядом
    let target = this.yaw;
    if (d < 6) target = Math.atan2(playerPos.x - this.x, playerPos.z - this.z);
    this.root.rotation.y += wrapAngle(target - this.root.rotation.y) * Math.min(1, dt * 4);
    this.h.animate(dt, 0);
    this.dist = d;
  }
}

// Расставляет и оживляет жителей
export class NPCSystem {
  constructor(game) {
    this.game = game;
    this.list = new Map();
    this.relations = {};
    this._seq = 0;
    this.group = new THREE.Group();
    game.scene.add(this.group);
    const spots = game.world.structures.npcSpots;
    for (const [id, spot] of Object.entries(spots)) this._spawn(id, spot);
    // взаимодействие «поговорить»
    game.interactions.provide(() => this._talkOptions());
  }

  _spawn(id, spot, temp = false) {
    const npc = new NPC(this.game, id, spot);
    npc.temp = temp;
    npc.key = temp ? `${id}#${++this._seq}` : id;
    this.group.add(npc.root);
    npc.collider = this.game.world.colliders.add({ type: 'circle', x: npc.x, z: npc.z, r: 0.35, kind: 'npc', y0: -1e5, y1: 1e5, moving: true, vx: 0, vz: 0 });
    npc.collider.x = npc.x;
    npc.collider.z = npc.z;
    npc.root.visible = npc.active;
    npc.collider.disabled = !npc.active;
    this.list.set(npc.key, npc);
    return npc;
  }

  // временный NPC для события
  spawnTemp(id, x, z, yaw = 0) {
    return this._spawn(id, { x, z, yaw }, true);
  }

  removeTemp(npc) {
    if (!npc) return;
    this.group.remove(npc.root);
    npc.collider.disabled = true;
    this.game.world.colliders.remove(npc.collider);
    this.list.delete(npc.key);
  }

  get(id) {
    return this.list.get(id);
  }

  setActive(id, on) {
    const n = this.list.get(id);
    if (!n) return;
    n.active = on;
    n.root.visible = on;
    n.collider.disabled = !on;
  }

  rel(id, delta = 0) {
    this.relations[id] = (this.relations[id] || 0) + delta;
    return this.relations[id];
  }

  visible() {
    const out = [];
    for (const n of this.list.values()) if (n.active && n.root.visible && n.dist !== undefined && n.dist < 16) out.push(n);
    return out;
  }

  talk(npc) {
    const g = this.game;
    if (npc.onTalk) {
      npc.onTalk();
      return;
    }
    const dialog = npc.dialogOverride || (npc.id === 'misha' && !g.story.hasFlag('intro_done') ? 'misha_intro' : npc.def.dialog);
    g.dialogs.start(dialog, npc.id);
  }

  _talkOptions() {
    const g = this.game;
    const p = g.playerPos;
    const out = [];
    for (const n of this.list.values()) {
      if (!n.active) continue;
      if (Math.hypot(n.x - p.x, n.z - p.z) > 3.2) continue;
      out.push({
        key: 'interact', r: 3.2, mode: n.allowCar ? 'any' : 'foot', priority: 2,
        label: `Поговорить: ${n.def.name}`,
        pos: () => ({ x: n.x, z: n.z }),
        action: () => this.talk(n),
      });
    }
    return out;
  }

  update(dt) {
    const p = this.game.playerPos;
    for (const n of this.list.values()) {
      if (!n.active) continue;
      const d = Math.hypot(p.x - n.x, p.z - n.z);
      if (d > 150) {
        n.dist = d;
        continue;
      }
      n.update(dt, p);
    }
  }

  reset() {
    this.relations = {};
    for (const [k, n] of [...this.list]) {
      if (n.temp) this.removeTemp(n);
      else {
        n.dialogOverride = null;
        n.onTalk = null;
        if (n.home) n.place(n.home.x, n.home.z, n.home.yaw);
        this.setActive(k, !n.def.hidden);
      }
    }
  }

  serialize() {
    return { relations: this.relations };
  }

  deserialize(d) {
    this.relations = d?.relations || {};
  }
}
