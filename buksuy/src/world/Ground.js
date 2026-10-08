import { WATER_Y } from './WorldLayout.js';
import { SURFACES, SURF, ROAD_SURFACE } from './Surfaces.js';

const ROAD_LIFT = 0.04; // лента дороги лежит чуть выше земли

// Единая точка «что под колесом»: высота, нормаль, покрытие, вода, мост.
export class Ground {
  constructor(terrain, roads) {
    this.terrain = terrain;
    this.roads = roads;
    this.bridgeBoxes = [];
    for (const r of roads.roads) {
      for (const b of r.bridges) {
        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        for (let i = b.i0; i <= b.i1; i++) {
          x0 = Math.min(x0, r.x[i]); x1 = Math.max(x1, r.x[i]);
          z0 = Math.min(z0, r.z[i]); z1 = Math.max(z1, r.z[i]);
        }
        const m = r.halfWidth + 1;
        this.bridgeBoxes.push({ x0: x0 - m, x1: x1 + m, z0: z0 - m, z1: z1 + m });
      }
    }
    this.extra = []; // доп. «подставки»: настилы, рампы { x0,x1,z0,z1, h, surf }
  }

  _maybeBridge(x, z) {
    for (const b of this.bridgeBoxes) {
      if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return this.roads.bridgeAt(x, z);
    }
    return null;
  }

  // wheel=true — добавить микронеровности и «утопание» в грязь
  sample(x, z, out, wheel = false) {
    const t = this.terrain;
    t.sample(x, z, out);
    let surfId = out.surf;
    out.onRoad = out.roadDist < 0;
    out.onBridge = false;
    if (out.onRoad && out.roadIdx >= 0) {
      const road = this.roads.roads[out.roadIdx];
      surfId = ROAD_SURFACE[road.type];
      if (out.zone) surfId = out.surf; // дорога через болото — всё равно болото
      else out.h += ROAD_LIFT;
    }

    const b = this._maybeBridge(x, z);
    if (b && b.h > out.h - 0.4) {
      out.h = b.h + ROAD_LIFT;
      out.nx = 0; out.ny = 1; out.nz = 0;
      surfId = b.bridge.kind === 'wood' ? SURF.wood : SURF.concrete;
      out.onBridge = true;
      out.water = 0;
    } else {
      out.water = out.h < WATER_Y ? WATER_Y - out.h : 0;
      if (out.water > 0.05) surfId = SURF.riverbed;
    }

    for (const e of this.extra) {
      if (x >= e.x0 && x <= e.x1 && z >= e.z0 && z <= e.z1 && e.h > out.h - 0.3) {
        out.h = e.h;
        out.nx = 0; out.ny = 1; out.nz = 0;
        surfId = e.surf ?? SURF.concrete;
      }
    }

    const s = SURFACES[surfId];
    out.surface = s;
    if (wheel) {
      out.h += t.roughness(x, z, s.rough);
      out.h -= s.sink;
    }
    return out;
  }

  height(x, z) {
    const b = this._maybeBridge(x, z);
    const h = this.terrain.heightAt(x, z);
    if (b && b.h > h - 0.4) return b.h + ROAD_LIFT;
    return h;
  }

  waterLevel() {
    return WATER_Y;
  }
}

export const tmpSample = () => ({ h: 0, nx: 0, ny: 1, nz: 0, surface: SURFACES[3], water: 0, roadDist: 99 });
