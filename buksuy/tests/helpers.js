import { Terrain } from '../src/world/Terrain.js';
import { RoadNetwork } from '../src/world/Roads.js';
import { Ground } from '../src/world/Ground.js';
import { ColliderGrid } from '../src/world/Colliders.js';
import { EventBus } from '../src/core/EventBus.js';
import { VehicleController } from '../src/vehicle/VehicleController.js';

let cached = null;

// мир генерится ~2 секунды, поэтому один на все тесты
export async function makeWorld() {
  if (cached) return cached;
  const terrain = new Terrain();
  const roads = new RoadNetwork();
  await terrain.generate(roads);
  const ground = new Ground(terrain, roads);
  cached = { terrain, roads, ground };
  return cached;
}

export async function makeCar() {
  const w = await makeWorld();
  const events = new EventBus();
  const colliders = new ColliderGrid();
  const car = new VehicleController(events, w.ground, colliders, { gripMul: () => 1, ambient: () => 15 });
  return { ...w, events, colliders, car };
}

export function run(car, seconds, input = {}) {
  const dt = 1 / 120;
  for (let i = 0; i < seconds * 120; i++) {
    car.setInput(input.fwd || 0, input.back || 0, input.steer || 0, !!input.hb, dt);
    car.step(dt);
  }
}

export function startEngine(car) {
  car.fuel.liters = 30;
  car.damage.fluids.charge = 1;
  for (let k = 0; k < 20 && !car.engine.on; k++) {
    car.ignition();
    run(car, 2.5);
  }
}
