import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCar, run, startEngine } from './helpers.js';

test('машина стоит на земле и не проваливается', async () => {
  const { car, ground } = await makeCar();
  car.teleport(22, 200, Math.PI);
  run(car, 3);
  const h = ground.height(car.pos.x, car.pos.z);
  assert.ok(Number.isFinite(car.pos.y));
  assert.ok(car.pos.y > h + 0.4 && car.pos.y < h + 1.0, `высота ${car.pos.y - h}`);
  assert.ok(car.vel.length() < 0.2, 'стоит на месте');
});

test('заводится, разгоняется и тормозит', async () => {
  const { car, roads } = await makeCar();
  const road = roads.byId.main;
  const p = road.at(300);
  car.teleport(p.x, p.z, Math.atan2(p.dx, p.dz));
  run(car, 1);
  startEngine(car);
  assert.ok(car.engine.on, 'двигатель завёлся');
  run(car, 10, { fwd: 1 });
  const v = car.speedKmh;
  assert.ok(v > 45 && v < 150, `скорость после 10с газа: ${v.toFixed(1)}`);
  assert.ok(car.engine.gear >= 2, 'автомат переключился');
  // тормозим, пока не встанем (дальше S включит задний ход — это нормально)
  let t = 0;
  while (car.speed > 0.3 && t < 8) {
    run(car, 0.1, { back: 1 });
    t += 0.1;
  }
  assert.ok(t < 7, `тормозной путь слишком долгий: ${t.toFixed(1)}с`);
  run(car, 3, { back: 1 });
  assert.equal(car.engine.gear, -1, 'включился задний ход');
  assert.ok(car.speed < -0.5, 'едет назад');
});

test('тратит бензин и глохнет без него', async () => {
  const { car, roads } = await makeCar();
  const p = roads.byId.main.at(600);
  car.teleport(p.x, p.z, Math.atan2(p.dx, p.dz));
  run(car, 1);
  startEngine(car);
  const before = car.fuel.liters;
  run(car, 5, { fwd: 1 });
  assert.ok(car.fuel.liters < before, 'расход есть');
  car.fuel.liters = 0.001;
  run(car, 2, { fwd: 1 });
  assert.equal(car.engine.on, false);
});

test('удар в дерево ломает бампер', async () => {
  const { car, roads, colliders } = await makeCar();
  const p = roads.byId.main.at(900);
  const yaw = Math.atan2(p.dx, p.dz);
  car.teleport(p.x, p.z, yaw);
  run(car, 1);
  // ставим «дерево» прямо по курсу
  colliders.add({ type: 'circle', x: p.x + p.dx * 14, z: p.z + p.dz * 14, r: 0.5, kind: 'tree' });
  const bumper = car.damage.hp('bumperF');
  car.vel.set(p.dx * 12, 0, p.dz * 12);
  run(car, 2);
  assert.ok(car.damage.hp('bumperF') < bumper, 'бампер пострадал');
  assert.ok(car.speedKmh < 15, 'остановилась об дерево');
});

test('в болоте колёса буксуют', async () => {
  const { car } = await makeCar();
  car.teleport(-215, -1725, 0);
  run(car, 1);
  startEngine(car);
  run(car, 3, { fwd: 1 });
  const spinning = car.wheels.some((w) => w.spinning || w.slip > 0.2);
  assert.ok(spinning || car.speedKmh < 20, 'в топи не разгоняется как по асфальту');
});

test('нет NaN при перевороте', async () => {
  const { car, roads } = await makeCar();
  const p = roads.byId.main.at(1500);
  car.teleport(p.x, p.z, 0, 3);
  car.angVel.set(0, 0, 9);
  run(car, 5);
  assert.ok(Number.isFinite(car.pos.x) && Number.isFinite(car.quat.w));
});

test('руль вправо поворачивает вправо', async () => {
  const { car, roads } = await makeCar();
  const p = roads.byId.main.at(300);
  const yaw = Math.atan2(p.dx, p.dz);
  car.teleport(p.x, p.z, yaw);
  run(car, 1);
  startEngine(car);
  run(car, 3, { fwd: 1 });
  const start = car.pos.clone();
  const f0 = car.fwd.clone();
  run(car, 2, { fwd: 0.6, steer: 1 });
  const d = car.pos.clone().sub(start);
  // право относительно исходного курса: forward × up
  const rightX = -f0.z, rightZ = f0.x;
  assert.ok(d.x * rightX + d.z * rightZ > 1, 'ушла вправо');
});

test('коллизия с боксом выталкивает наружу', async () => {
  const { boxVsRect, ColliderGrid } = await import('../src/world/Colliders.js');
  const g = new ColliderGrid();
  const b = g.add({ type: 'box', x: 0, z: 3, hx: 2, hz: 1, rot: 0 });
  const out = {};
  // машина в начале координат носом на +Z, перекрывается с боксом
  assert.ok(boxVsRect(b, 0, 0, 0, 1, 0.84, 2.08, out));
  assert.ok(out.nz < -0.9, 'нормаль от бокса к машине смотрит в -Z');
  assert.ok(out.depth > 0 && out.depth < 0.2);
});
