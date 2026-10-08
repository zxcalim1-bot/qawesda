const PREFIX = 'buksuy.save.';
const VERSION = 1;
export const SLOTS = ['auto', 'quick', '1', '2', '3'];
const SLOT_NAMES = { auto: 'Автосохранение', quick: 'Быстрое сохранение', 1: 'Слот 1', 2: 'Слот 2', 3: 'Слот 3' };

// Полное сохранение в localStorage: игрок, машина, инвентарь, мир, задания, сюжет.
export class SaveSystem {
  constructor(game) {
    this.game = game;
    this.autoT = 90;
    game.events.on('location-discovered', () => {
      this.autoT = Math.min(this.autoT, 3);
    });
    game.events.on('quest-done', () => {
      this.autoT = Math.min(this.autoT, 3);
    });
  }

  slotName(slot) {
    return SLOT_NAMES[slot] || slot;
  }

  collect() {
    const g = this.game;
    const p = g.playerPos;
    const loc = g.world.nearestLocation(p.x, p.z);
    return {
      version: VERSION,
      time: Date.now(),
      place: loc ? `${loc.name}, день ${g.world.dayNight.day}` : `день ${g.world.dayNight.day}`,
      playTime: g.playTime,
      player: {
        mode: g.player.mode,
        pos: g.player.pos.toArray(),
        yaw: g.player.yaw,
      },
      vehicle: g.vehicle.serialize(),
      inventory: g.inventory.serialize(),
      needs: g.needs.serialize(),
      npcs: g.npcs.serialize(),
      quests: g.quests.serialize(),
      story: g.story.serialize(),
      events: g.randomEvents.serialize(),
      radio: g.radio.serialize(),
      map: g.map.serialize(),
      achievements: g.achievements.serialize(),
      world: g.world.serialize(),
      interactions: g.worldInteractions.serialize(),
      debris: g.debris.items.filter((d) => d.itemId).map((d) => ({
        itemId: d.itemId, name: d.name, state: d.state || null,
        x: d.obj.position.x, y: d.obj.position.y, z: d.obj.position.z,
      })),
    };
  }

  save(slot = 'auto', silent = false) {
    const g = this.game;
    if (g.state !== 'playing' && !g.story.ending) return false;
    try {
      const data = this.collect();
      localStorage.setItem(PREFIX + slot, JSON.stringify(data));
      if (!silent) g.ui.notify(`💾 Сохранено: ${this.slotName(slot)}`);
      return true;
    } catch (err) {
      console.error(err);
      g.ui.notify('Не удалось сохранить (переполнено хранилище?)', 'warn');
      return false;
    }
  }

  quickSave() {
    if (this.game.ui.modal) return;
    this.save('quick');
  }

  read(slot) {
    try {
      const raw = localStorage.getItem(PREFIX + slot);
      if (!raw) return null;
      const d = JSON.parse(raw);
      return d && d.version ? d : null;
    } catch (_) {
      return null;
    }
  }

  remove(slot) {
    try {
      localStorage.removeItem(PREFIX + slot);
    } catch (_) { /* ок */ }
  }

  list() {
    return SLOTS.map((slot) => {
      const d = this.read(slot);
      return { slot, name: this.slotName(slot), data: d ? { time: d.time, place: d.place, playTime: d.playTime } : null };
    });
  }

  hasAny() {
    return SLOTS.some((s) => this.read(s));
  }

  latestSlot() {
    let best = null, bt = -1;
    for (const s of SLOTS) {
      const d = this.read(s);
      if (d && d.time > bt) { bt = d.time; best = s; }
    }
    return best;
  }

  // разложить сохранение по системам. Порядок важен.
  apply(d) {
    const g = this.game;
    g.world.deserialize(d.world);
    g.story.deserialize(d.story);
    g.vehicle.deserialize(d.vehicle);
    g.inventory.setTrunkCapacity(12 + (g.vehicle.config.levels.roofrack ? 6 : 0));
    g.carModel.syncDetached(g.vehicle.damage);
    g.inventory.deserialize(d.inventory);
    g.needs.deserialize(d.needs);
    g.npcs.deserialize(d.npcs);
    g.quests.deserialize(d.quests);
    g.radio.deserialize(d.radio);
    g.map.deserialize(d.map);
    g.achievements.deserialize(d.achievements);
    g.worldInteractions.deserialize(d.interactions);
    g.randomEvents.deserialize(d.events);
    for (const it of d.debris || []) g.randomEvents.dropItem(it.itemId, it.state, it.x, it.z);
    g.playTime = d.playTime || 0;
    const p = d.player;
    g.player.spawn(p.pos[0], p.pos[2], p.yaw);
    if (p.mode === 'car') g.player.enterCar();
    // Кирилл появляется только в финале
    g.npcs.setActive('kirill', !!g.story.ending || g.story.hasFlag('post_ending'));
  }

  update(dt) {
    const g = this.game;
    if (g.ui.modal || g.story.ending) return;
    this.autoT -= dt;
    if (this.autoT <= 0) {
      this.autoT = 120;
      this.save('auto', true);
    }
  }

  // экспорт/импорт файла
  exportSlot(slot) {
    const raw = localStorage.getItem(PREFIX + slot);
    if (!raw) return false;
    const blob = new Blob([raw], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `buksuy-${slot}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return true;
  }

  importToSlot(slot, text) {
    const d = JSON.parse(text);
    if (!d || !d.version || !d.vehicle) throw new Error('Это не сохранение БУКСУЙ');
    localStorage.setItem(PREFIX + slot, JSON.stringify(d));
  }
}
