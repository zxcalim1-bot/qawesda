import * as THREE from 'three';
import { Terrain } from './Terrain.js';
import { RoadNetwork } from './Roads.js';
import { Ground } from './Ground.js';
import { ColliderGrid } from './Colliders.js';
import { TerrainRenderer } from './TerrainRenderer.js';
import { RoadRenderer } from './RoadRenderer.js';
import { Water } from './Water.js';
import { Grass } from './Grass.js';
import { heightTexture } from '../render/shaderlib.js';
import { Vegetation } from './Vegetation.js';
import { Structures } from './Structures.js';
import { Sky } from './Sky.js';
import { DayNightSystem } from './DayNightSystem.js';
import { WeatherSystem } from './WeatherSystem.js';
import { Effects } from './Effects.js';
import { initPropMaterials } from './Props.js';
import { windUniforms } from './Trees.js';
import { LOCATIONS, regionAt } from './WorldLayout.js';

// Собирает мир: рельеф, дороги, лес, постройки, небо, погоду.
export class WorldManager {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.events = game.events;
    this.discovered = new Set();
    this.flags = new Set();
  }

  async generate(progress) {
    this.terrain = new Terrain();
    this.roads = new RoadNetwork();
    await this.terrain.generate(this.roads, progress);
    this.ground = new Ground(this.terrain, this.roads);
    this.colliders = new ColliderGrid(16);

    progress(0.92, 'Строим дома');
    await new Promise((r) => setTimeout(r, 0));
    const q = this.game.settings.get('quality');
    initPropMaterials(q);
    this.terrainRenderer = new TerrainRenderer(this.scene, this.terrain, q);
    this.roadRenderer = new RoadRenderer(this.scene, this.roads, this.terrain);
    this.heightTex = heightTexture(this.terrain);
    this.water = new Water(this.scene, this.terrain, this.heightTex);
    this.grass = new Grass(this.scene, this.terrain, this.heightTex);
    this.vegetation = new Vegetation(this.scene, this.terrain, this.colliders, q, this.game.renderer);
    this.structures = new Structures(this).build();
    this.sky = new Sky(this.scene);
    this.dayNight = new DayNightSystem(this.scene, this.sky, this.game.settings);
    this.weather = new WeatherSystem(this.scene, this.events);
    this.effects = new Effects(this.scene);

    // несколько точечных источников — фиксированное число, чтобы шейдеры не перекомпилировались
    this.pointLights = [];
    for (let i = 0; i < 4; i++) {
      const l = new THREE.PointLight(0xffc070, 0, 20, 1.6);
      l.castShadow = false;
      this.scene.add(l);
      this.pointLights.push(l);
    }
    this.applyQuality();
    progress(0.98, 'Заводим');
  }

  applyQuality() {
    const vd = this.game.settings.get('viewDistance');
    this.viewDistance = vd;
    this.terrainRenderer.setViewDistance(vd);
    this.vegetation.setQuality(this.game.settings.get('quality'));
    this.grass.setQuality(this.game.settings.get('quality'));
  }

  warm(x, z) {
    this.terrainRenderer.warm(x, z);
    this.vegetation.warm(x, z, this.viewDistance);
  }

  ambient() {
    return this.weather.temperature;
  }

  gripMul(key) {
    return this.weather.gripMul(key);
  }

  setFlag(f) {
    if (this.flags.has(f)) return;
    this.flags.add(f);
    if (f === 'landslide') this.structures.setLandslide(true);
    if (f === 'checkpoint_open') this.structures.openBarrier(true);
    this.events.emit('flag', { flag: f });
  }

  hasFlag(f) {
    return this.flags.has(f);
  }

  // открытия локаций
  checkDiscovery(x, z) {
    for (const l of LOCATIONS) {
      if (this.discovered.has(l.id)) continue;
      if (l.hiddenUntilFlag && !this.flags.has(l.hiddenUntilFlag)) continue;
      const d = Math.hypot(x - l.x, z - l.z);
      if (d < Math.min(l.r, 90)) this.discover(l.id);
    }
    // скрытые дороги находятся, когда по ним проедешь
    const n = this.roads.nearest(x, z, 8, (r) => r.hidden && !r.discovered);
    if (n) {
      n.road.discovered = true;
      this.events.emit('road-discovered', { road: n.road });
    }
  }

  discover(id, silent = false) {
    if (this.discovered.has(id)) return;
    this.discovered.add(id);
    const l = LOCATIONS.find((x) => x.id === id);
    if (l && !silent) this.events.emit('location-discovered', { location: l });
  }

  regionAt(z) {
    return regionAt(z);
  }

  nearestLocation(x, z) {
    let best = null, bd = Infinity;
    for (const l of LOCATIONS) {
      const d = Math.hypot(x - l.x, z - l.z) - l.r * 0.5;
      if (d < bd) { bd = d; best = l; }
    }
    return best;
  }

  update(dt, dtHours, camera, focus) {
    const vd = this.viewDistance;
    this.terrainRenderer.update(camera.position);
    this.roadRenderer.update(camera.position, vd);
    windUniforms.uWind.value += (0.2 + this.weather.wind * 0.9 - windUniforms.uWind.value) * Math.min(1, dt);
    this.vegetation.update(camera.position, vd, dt);
    this.dayNight.update(dt, focus, this.weather);
    this.weather.update(dt, dtHours, camera, focus.z, this.dayNight, vd);
    this.sky.update(camera, dt, this.weather.wind, this.weather.wind * 0.4);
    this.water.update(dt);
    const dark = this.dayNight.darkness;
    // северное сияние: ночью, в ясную погоду, ближе к северу
    const north = Math.min(1, Math.max(0, (-focus.z - 2900) / 900));
    this.sky.uniforms.uAurora.value = Math.max(this.auroraForce || 0, dark * north * (1 - this.weather.cloud));
    this.structures.update(dt, this.sky.uniforms.uTime.value, dark);
    this._cullT = (this._cullT || 0) - dt;
    if (this._cullT <= 0) {
      this._cullT = 0.5;
      this.structures.cull(camera.position, vd);
    }
    const dn = this.dayNight;
    this._fxLight = this._fxLight || new THREE.Color();
    this._fxLight.copy(dn.sun.color).multiplyScalar(dn.sun.intensity * 0.12).add(dn.skyAmbient).addScalar(0.04 + dn.hemi.intensity * 0.3);
    this.effects.update(dt, this._fxLight, this.ground);

    // ближайшие фонари получают настоящие PointLight
    const lights = this.structures.lights
      .map((l) => ({ l, d: Math.hypot(l.x - focus.x, l.z - focus.z) }))
      .sort((a, b) => a.d - b.d);
    for (let i = 0; i < this.pointLights.length; i++) {
      const pl = this.pointLights[i];
      const e = lights[i];
      if (!e || e.d > 120) {
        pl.intensity = 0;
        continue;
      }
      pl.position.set(e.l.x, e.l.y + this.ground.height(e.l.x, e.l.z), e.l.z);
      pl.color.setHex(e.l.color);
      pl.distance = e.l.distance;
      const flicker = e.l.color === 0xff9040 ? 0.8 + Math.sin(this.sky.uniforms.uTime.value * 11) * 0.2 : 1;
      pl.intensity = e.l.intensity * Math.max(0.15, dark) * flicker;
    }
  }

  serialize() {
    return {
      discovered: [...this.discovered],
      flags: [...this.flags],
      roads: this.roads.serializeDiscovered(),
      dayNight: this.dayNight.serialize(),
      weather: this.weather.serialize(),
    };
  }

  deserialize(d) {
    this.discovered = new Set(d?.discovered || []);
    for (const f of [...this.flags]) {
      if (f === 'landslide') this.structures.setLandslide(false);
      if (f === 'checkpoint_open') this.structures.openBarrier(false);
    }
    this.flags = new Set();
    for (const f of d?.flags || []) this.setFlag(f);
    for (const r of this.roads.roads) r.discovered = !r.hidden;
    for (const id of d?.roads || []) if (this.roads.byId[id]) this.roads.byId[id].discovered = true;
    this.dayNight.deserialize(d?.dayNight);
    this.weather.deserialize(d?.weather);
  }

  reset() {
    this.deserialize({ discovered: LOCATIONS.filter((l) => l.known).map((l) => l.id), flags: [] });
    this.dayNight.time = 7.6;
    this.dayNight.day = 1;
    this.weather.set('clear', true);
    this.weather.nextIn = 2.5;
    this.weather.wet = 0;
    this.weather.snowCover = 0;
  }
}
