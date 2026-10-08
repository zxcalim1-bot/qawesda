import test from 'node:test';
import assert from 'node:assert/strict';
import { Container, Inventory } from '../src/systems/Inventory.js';
import { VehicleDamage } from '../src/vehicle/VehicleDamage.js';
import { FuelSystem } from '../src/vehicle/FuelSystem.js';
import { VehicleConfig } from '../src/vehicle/VehicleConfig.js';
import { EventBus } from '../src/core/EventBus.js';

test('багажник: место ограничено, стопки складываются', () => {
  const c = new Container('test', 5);
  assert.ok(c.add('toolkit'));
  assert.ok(c.add('canister', 1, { fuel: 3 }));
  assert.equal(c.used(), 4);
  assert.ok(!c.add('spare_wheel'), 'колесо (3) уже не влезает');
  assert.ok(c.add('parts', 1));
  assert.ok(c.add('parts', 3), 'запчасти стопкой по 6 — место не растёт');
  assert.equal(c.count('parts'), 4);
  assert.equal(c.used(), 5);
  assert.equal(c.remove('parts', 10), 4);
  assert.equal(c.count('parts'), 0);
});

test('инвентарь: без машины багажник недоступен', () => {
  const inv = new Inventory(new EventBus());
  inv.reset();
  assert.ok(inv.has('toolkit', 1, true));
  assert.ok(!inv.has('toolkit', 1, false), 'набор инструментов лежит в багажнике');
  assert.ok(inv.has('food', 1, false), 'еда есть и при себе');
});

test('бампер: три удара — и он на дороге', () => {
  const ev = new EventBus();
  const detached = [];
  ev.on('part-detached', (e) => detached.push(e.id));
  const d = new VehicleDamage(ev);
  const hp = [d.hp('bumperF')];
  for (let i = 0; i < 4 && !d.isDetached('bumperF'); i++) {
    d.zoneCooldown = {};
    d.applyImpact({ zone: 'front', lx: 0, lz: 2, speed: 7 });
    hp.push(Math.round(d.hp('bumperF')));
  }
  assert.ok(d.isDetached('bumperF'), `бампер держится: ${hp.join(' → ')}`);
  assert.ok(detached.includes('bumperF'));
  assert.ok(hp.length >= 3, 'с одного удара не отваливается');
});

test('повреждения влияют на множители физики', () => {
  const d = new VehicleDamage(new EventBus());
  const before = d.factors();
  d.setHp('brakes', 5, true);
  d.setHp('engine', 10, true);
  d.puncture(0);
  const after = d.factors();
  assert.ok(after.brake < before.brake);
  assert.ok(after.power < before.power);
  assert.ok(after.tireGrip[0] < before.tireGrip[0]);
});

test('сохранение повреждений туда-обратно', () => {
  const d = new VehicleDamage(new EventBus());
  d.detach('doorL');
  d.addFault('belt');
  d.fluids.oil = 0.1;
  const copy = new VehicleDamage(new EventBus());
  copy.deserialize(JSON.parse(JSON.stringify(d.serialize())));
  assert.ok(copy.isDetached('doorL'));
  assert.ok(copy.hasFault('belt'));
  assert.equal(copy.fluids.oil, 0.1);
});

test('бензобак не переливается', () => {
  const f = new FuelSystem(new EventBus(), new VehicleConfig());
  f.liters = 35;
  const added = f.refuel(20);
  assert.equal(added, 5);
  assert.equal(f.liters, 40);
});
