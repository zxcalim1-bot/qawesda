import * as THREE from 'three';
import { clamp, lerp, damp, weightedPick } from '../core/util.js';
import { regionAt } from './WorldLayout.js';
import { weatherUniforms } from './materials.js';
import { fogState } from '../render/atmosphere.js';

export const WEATHER = {
  clear: { name: 'Ясно', icon: '☀️', cloud: 0.12, rain: 0, snow: 0, fog: 0, wind: 0.2, storm: 0 },
  cloudy: { name: 'Облачно', icon: '☁️', cloud: 0.6, rain: 0, snow: 0, fog: 0.1, wind: 0.4, storm: 0 },
  rain: { name: 'Дождь', icon: '🌧', cloud: 0.88, rain: 0.65, snow: 0, fog: 0.3, wind: 0.5, storm: 0 },
  storm: { name: 'Гроза', icon: '⛈', cloud: 1, rain: 1, snow: 0, fog: 0.4, wind: 1, storm: 1 },
  fog: { name: 'Туман', icon: '🌫', cloud: 0.5, rain: 0, snow: 0, fog: 1, wind: 0.05, storm: 0 },
  snow: { name: 'Снег', icon: '❄️', cloud: 0.85, rain: 0, snow: 0.8, fog: 0.4, wind: 0.5, storm: 0 },
};

const ODDS = {
  south: { clear: 40, cloudy: 26, rain: 18, storm: 8, fog: 8 },
  forest: { clear: 30, cloudy: 26, rain: 22, storm: 10, fog: 12 },
  mountains: { clear: 26, cloudy: 26, rain: 14, storm: 8, fog: 14, snow: 12 },
  north: { clear: 24, cloudy: 22, fog: 14, snow: 40 },
};

// базовая температура по регионам
const TEMP = { south: 17, forest: 13, mountains: 7, north: -7 };

export class WeatherSystem {
  constructor(scene, events) {
    this.scene = scene;
    this.events = events;
    this.type = 'clear';
    this.prev = 'clear';
    this.blend = 1;
    this.nextIn = 3; // игровых часов до смены
    this.forced = null; // прогноз, который радио уже объявило
    this.cloud = 0.12;
    this.rain = 0;
    this.snow = 0;
    this.fogAmount = 0;
    this.wind = 0.2;
    this.storm = 0;
    this.wet = 0;
    this.snowCover = 0;
    this.temperature = 15;
    this.lightningTimer = 5;
    this.region = 'south';
    this._buildParticles();
  }

  _buildParticles() {
    // дождь: отрезки, падение считает шейдер
    const N = 7000;
    const pos = new Float32Array(N * 2 * 3);
    const end = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const x = Math.random(), y = Math.random(), z = Math.random();
      pos.set([x, y, z, x, y, z], i * 6);
      end[i * 2] = 0;
      end[i * 2 + 1] = 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    this.rainUniforms = {
      uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uWind: { value: new THREE.Vector2(0.5, 0.2) },
      uIntensity: { value: 0 }, uColor: { value: new THREE.Color(0.7, 0.75, 0.85) },
    };
    this.rainMesh = new THREE.LineSegments(g, new THREE.ShaderMaterial({
      uniforms: this.rainUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float aEnd;
        uniform float uTime; uniform vec3 uCam; uniform vec2 uWind; uniform float uIntensity;
        varying float vA;
        void main() {
          vec3 size = vec3(44.0, 26.0, 44.0);
          vec3 b = position * size;
          b.y = mod(b.y - uTime * 17.0 * (0.8 + position.x * 0.4), size.y);
          vec3 wp;
          wp.xz = uCam.xz + mod(b.xz - uCam.xz, size.xz) - size.xz * 0.5;
          wp.y = uCam.y - size.y * 0.45 + b.y;
          wp.xz += uWind * (wp.y - uCam.y) * 0.12;
          wp += vec3(uWind.x * 0.12, 1.0, uWind.y * 0.12) * aEnd * 0.55;
          vA = step(fract(position.z * 91.7 + position.x * 13.1), uIntensity) * 0.55;
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uColor; varying float vA;
        void main() { if (vA < 0.01) discard; gl_FragColor = vec4(uColor, vA); }`,
    }));
    this.rainMesh.frustumCulled = false;
    this.rainMesh.visible = false;
    this.scene.add(this.rainMesh);

    // снег — точки
    const M = 5000;
    const sp = new Float32Array(M * 3);
    for (let i = 0; i < M * 3; i++) sp[i] = Math.random();
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.snowUniforms = {
      uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uWind: { value: new THREE.Vector2() },
      uIntensity: { value: 0 }, uScale: { value: 300 },
    };
    this.snowMesh = new THREE.Points(sg, new THREE.ShaderMaterial({
      uniforms: this.snowUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform float uTime; uniform vec3 uCam; uniform vec2 uWind; uniform float uIntensity; uniform float uScale;
        varying float vA;
        void main() {
          vec3 size = vec3(40.0, 22.0, 40.0);
          vec3 b = position * size;
          b.y = mod(b.y - uTime * (1.2 + position.x), size.y);
          b.x += sin(uTime * 0.8 + position.z * 30.0) * 0.8 + uWind.x * uTime * 2.0;
          b.z += cos(uTime * 0.7 + position.x * 30.0) * 0.8 + uWind.y * uTime * 2.0;
          vec3 wp;
          wp.xz = uCam.xz + mod(b.xz - uCam.xz, size.xz) - size.xz * 0.5;
          wp.y = uCam.y - size.y * 0.4 + b.y;
          vA = step(fract(position.z * 57.3 + position.y * 7.7), uIntensity);
          vec4 mv = viewMatrix * vec4(wp, 1.0);
          gl_PointSize = uScale * 0.06 / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vA;
        void main() {
          if (vA < 0.5) discard;
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(0.95, 0.97, 1.0, (0.5 - d) * 1.8);
        }`,
    }));
    this.snowMesh.frustumCulled = false;
    this.snowMesh.visible = false;
    this.scene.add(this.snowMesh);
  }

  set(type, instant = false) {
    if (!WEATHER[type]) return;
    this.prev = instant ? type : this.type;
    this.type = type;
    this.blend = instant ? 1 : 0;
    this.nextIn = 2 + Math.random() * 5;
    if (instant) this._applyParams(1);
    this.events?.emit('weather', { type });
  }

  // радио может «заказать» погоду наперёд
  forecast() {
    if (!this.forced) this.forced = this._pickNext();
    return { type: this.forced, inHours: this.nextIn };
  }

  _pickNext() {
    const odds = ODDS[this.region] || ODDS.south;
    const keys = Object.keys(odds).filter((k) => k !== this.type);
    return weightedPick(keys, (k) => odds[k]);
  }

  _applyParams(t) {
    const a = WEATHER[this.prev], b = WEATHER[this.type];
    this.cloud = lerp(a.cloud, b.cloud, t);
    this.rain = lerp(a.rain, b.rain, t);
    this.snow = lerp(a.snow, b.snow, t);
    this.fogAmount = lerp(a.fog, b.fog, t);
    this.wind = lerp(a.wind, b.wind, t);
    this.storm = lerp(a.storm, b.storm, t);
  }

  // dtGame — сколько игровых часов прошло
  update(dt, dtHours, camera, playerZ, dayNight, viewDist) {
    const region = regionAt(playerZ).id;
    this.region = region;

    this.nextIn -= dtHours;
    if (this.nextIn <= 0) {
      const next = this.forced || this._pickNext();
      this.forced = null;
      this.set(next);
    }
    // на севере дождь превращается в снег
    if (region === 'north' && (this.type === 'rain' || this.type === 'storm')) this.set('snow');
    if (region === 'south' && this.type === 'snow') this.set('rain');

    if (this.blend < 1) this.blend = Math.min(1, this.blend + dt / 25);
    this._applyParams(this.blend);

    // мокрая дорога и снежный покров
    const wetTarget = Math.max(this.rain, this.snow * 0.3);
    this.wet = wetTarget > this.wet ? Math.min(wetTarget, this.wet + dt / 40) : Math.max(wetTarget, this.wet - dt / 240);
    const snowTarget = region === 'north' ? Math.max(0.35, this.snow) : this.snow * (region === 'mountains' ? 0.8 : 0.4);
    this.snowCover = snowTarget > this.snowCover ? Math.min(snowTarget, this.snowCover + dt / 60) : Math.max(snowTarget, this.snowCover - dt / 400);
    weatherUniforms.uWet.value = this.wet * (1 - this.snowCover);
    weatherUniforms.uSnow.value = this.snowCover;

    // температура
    const night = dayNight ? dayNight.darkness : 0;
    const target = (TEMP[region] ?? 10) - night * 6 - this.rain * 3 - this.snow * 4 + (playerZ > -2100 ? 0 : 0);
    this.temperature = damp(this.temperature, target, 0.05, dt);

    // частицы
    const cam = camera.position;
    this.rainUniforms.uTime.value += dt;
    this.rainUniforms.uCam.value.copy(cam);
    this.rainUniforms.uIntensity.value = this.rain;
    this.rainUniforms.uWind.value.set(this.wind * 1.5, this.wind * 0.6);
    this.rainMesh.visible = this.rain > 0.02;
    if (dayNight) {
      const l = 0.25 + (1 - dayNight.darkness) * 0.5 + dayNight.flash;
      this.rainUniforms.uColor.value.setRGB(l, l * 1.05, l * 1.15);
    }
    this.snowUniforms.uTime.value += dt;
    this.snowUniforms.uCam.value.copy(cam);
    this.snowUniforms.uIntensity.value = this.snow;
    this.snowUniforms.uWind.value.set(this.wind * 0.6, this.wind * 0.2);
    this.snowUniforms.uScale.value = window.innerHeight || 600;
    this.snowMesh.visible = this.snow > 0.02;

    // молнии
    if (this.storm > 0.6) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 6 + Math.random() * 14;
        if (dayNight) dayNight.flash = 1;
        this.events?.emit('lightning', { delay: 0.5 + Math.random() * 3 });
      }
    }

    // туман: дымка по расстоянию + слой у земли (в тумане и на рассвете)
    let vis = viewDist * 1.9;
    vis = lerp(vis, 120, this.fogAmount * this.fogAmount);
    vis = Math.min(vis, lerp(vis, 480, this.rain));
    vis = Math.min(vis, lerp(vis, 320, this.snow));
    vis *= 1 - night * 0.25;
    this.visibility = vis;
    const hour = dayNight ? dayNight.time : 12;
    const mist = hour > 3.5 && hour < 8.5 ? Math.sin(((hour - 3.5) / 5) * Math.PI) * 0.006 : 0;
    fogState.params[0] = this.fogAmount * 0.03 + mist + this.rain * 0.002;
    fogState.params[1] = 0.045;
    fogState.params[2] = camera.position.y - 6;
    fogState.params[3] = 3.2 / vis;
  }

  // множитель сцепления для поверхности
  gripMul(key) {
    let m = 1;
    const w = this.wet;
    switch (key) {
      case 'asphalt':
      case 'concrete':
        m *= 1 - w * 0.27;
        break;
      case 'dirt':
        m *= 1 - w * 0.3;
        break;
      case 'grass':
      case 'forest':
        m *= 1 - w * 0.2;
        break;
      case 'gravel':
      case 'rock':
        m *= 1 - w * 0.1;
        break;
      case 'mud':
      case 'deepmud':
        m *= 1 - w * 0.12;
        break;
      case 'wood':
        m *= 1 - w * 0.4;
        break;
      default:
    }
    if (key !== 'snow' && key !== 'ice' && key !== 'riverbed') {
      // укатанный снег поверх дороги
      m = lerp(m, Math.min(m, 0.45), clamp(this.snowCover * 1.2, 0, 1) * 0.85);
    }
    return m;
  }

  get info() {
    return WEATHER[this.type];
  }

  serialize() {
    return { type: this.type, nextIn: this.nextIn, wet: this.wet, snowCover: this.snowCover, forced: this.forced };
  }

  deserialize(d) {
    if (!d) return;
    this.set(d.type || 'clear', true);
    this.nextIn = d.nextIn ?? 3;
    this.wet = d.wet ?? 0;
    this.snowCover = d.snowCover ?? 0;
    this.forced = d.forced ?? null;
  }
}
