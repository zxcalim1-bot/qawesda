import * as THREE from 'three';
import { clamp, lerp, smoothstep } from '../core/util.js';
import { skyRadiance, sunTransmittance, fogState } from '../render/atmosphere.js';

// Солнце, луна, цвет неба и тумана. Цвета считаются по той же модели рассеяния,
// что и шейдер неба, поэтому закат сам получается оранжевым, а дымка у горизонта — голубой.

const _c = new THREE.Color();
const _c2 = new THREE.Color();
const _sunT = new THREE.Color();
const _v = new THREE.Vector3();
const ZENITH = new THREE.Vector3(0, 1, 0);

// ночью небо подсвечено луной и городами где-то за горизонтом
const NIGHT_SKY = new THREE.Color(0.0045, 0.0075, 0.016);

export class DayNightSystem {
  constructor(scene, sky, settings) {
    this.scene = scene;
    this.sky = sky;
    this.settings = settings;
    this.time = 7.5;
    this.day = 1;
    this.frozen = false;

    this.sun = new THREE.DirectionalLight(0xffffff, 3);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.shadowRange = 70;
    const sc = this.sun.shadow.camera;
    sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70;
    sc.near = 1; sc.far = 500;
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.035;
    scene.add(this.sun);
    scene.add(this.sun.target);

    // слабая подсветка — в основном ночью; днём рассеянный свет даёт карта окружения
    this.hemi = new THREE.HemisphereLight(0xbfd6ff, 0x4a4030, 0.2);
    scene.add(this.hemi);

    this.sunDir = new THREE.Vector3();
    this.moonDir = new THREE.Vector3();
    this.lightDir = this.sunDir;
    this.elevation = 0;
    this.darkness = 0; // 0 день, 1 ночь — для фар, окон и т.п.
    this.flash = 0; // вспышка молнии
    this.exposure = 1;
    this.envIntensity = 1;
    this.skyAmbient = new THREE.Color();
    this.changed = 0; // насколько всё поменялось с прошлого обновления карты окружения
    this._lastDir = new THREE.Vector3();
    this._lastCloud = -1;
  }

  setShadowRange(r, size) {
    this.shadowRange = r;
    const sc = this.sun.shadow.camera;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r;
    sc.updateProjectionMatrix();
    if (size && this.sun.shadow.mapSize.x !== size) {
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
  }

  get hours() {
    return this.time;
  }

  isNight() {
    return this.darkness > 0.6;
  }

  advance(hours) {
    this.time += hours;
    while (this.time >= 24) {
      this.time -= 24;
      this.day++;
    }
  }

  update(dt, focus, weather) {
    if (!this.frozen) {
      const dayLen = (this.settings.get('dayLength') || 24) * 60;
      this.advance((dt / dayLen) * 24);
    }
    const a = ((this.time - 6) / 12) * Math.PI;
    const elev = Math.sin(a) * 1.1;
    this.elevation = clamp(elev, -1, 1);
    const ce = Math.cos(Math.asin(clamp(elev, -0.99, 0.99)));
    this.sunDir.set(Math.cos(a) * ce, elev, Math.sin(a) * ce * 0.7 + 0.3).normalize();
    this.moonDir.set(-this.sunDir.x, -this.sunDir.y * 0.8 + 0.25, -this.sunDir.z).normalize();

    const cloud = weather.cloud;
    const haze = clamp(weather.fogAmount * 0.6 + weather.rain * 0.35, 0, 1);
    const overcast = clamp(smoothstep(0.5, 0.95, cloud) * 0.92 + weather.storm * 0.08, 0, 1);
    const night = 1 - smoothstep(-0.12, 0.06, this.sunDir.y);
    this.darkness = night;
    const moonUp = smoothstep(-0.05, 0.15, this.moonDir.y) * night;

    // солнце сквозь атмосферу
    sunTransmittance(this.sunDir, haze, _sunT);
    const sunVis = smoothstep(-0.03, 0.03, this.sunDir.y);
    const direct = (1 - overcast * 0.88) * (1 - cloud * 0.25);

    // небо
    const U = this.sky.uniforms;
    U.uSunDir.value.copy(this.sunDir);
    U.uMoonDir.value.copy(this.moonDir);
    U.uHaze.value = haze;
    U.uOvercast.value = overcast;
    U.uCloud.value = cloud;
    U.uCloudDark.value = weather.storm * 0.6 + weather.rain * 0.25;
    U.uSunLight.value.copy(_sunT).multiplyScalar(2.4 * sunVis);
    skyRadiance(ZENITH, this.sunDir, haze, this.skyAmbient);
    this.skyAmbient.multiplyScalar(2.2);
    _c.copy(NIGHT_SKY).multiplyScalar(1 + moonUp * 2.5);
    U.uNight.value.copy(_c).multiplyScalar(night);
    U.uAmbient.value.copy(this.skyAmbient).add(_c2.copy(NIGHT_SKY).multiplyScalar(6 * night));
    U.uStars.value = night * (1 - cloud);
    U.uMoon.value = night;
    U.uFogMix.value = weather.fogAmount * 0.85 + weather.rain * 0.25;

    // цвет тумана: горизонт поперёк солнца и горизонт под солнцем
    _v.set(-this.sunDir.z, 0.04, this.sunDir.x).normalize();
    skyRadiance(_v, this.sunDir, haze, _c);
    _c.add(_c2.copy(NIGHT_SKY).multiplyScalar(night * (1.2 + moonUp * 2)));
    const lumFog = _c.r * 0.2126 + _c.g * 0.7152 + _c.b * 0.0722;
    _c.lerp(_c2.setRGB(lumFog * 0.92, lumFog * 0.95, lumFog), overcast);
    _c.multiplyScalar(1 - weather.storm * 0.35);
    this.scene.fog.color.copy(_c);
    U.uFog.value.copy(_c);
    _v.set(this.sunDir.x, 0.04, this.sunDir.z).normalize();
    skyRadiance(_v, this.sunDir, haze, _c2);
    fogState.sunColor[0] = lerp(_c2.r, _c.r, overcast);
    fogState.sunColor[1] = lerp(_c2.g, _c.g, overcast);
    fogState.sunColor[2] = lerp(_c2.b, _c.b, overcast);
    fogState.sun[0] = this.sunDir.x;
    fogState.sun[1] = this.sunDir.y;
    fogState.sun[2] = this.sunDir.z;
    fogState.sun[3] = (1 - overcast) * sunVis;

    // прямой свет
    if (this.sunDir.y > -0.03) {
      const l = Math.max(_sunT.r, _sunT.g, _sunT.b, 1e-4);
      this.sun.color.setRGB(_sunT.r / l, _sunT.g / l, _sunT.b / l);
      this.sun.intensity = 6.5 * l * direct * sunVis;
      this.lightDir = this.sunDir;
    } else {
      // ночью тот же источник работает как луна
      this.sun.color.setRGB(0.62, 0.7, 0.95);
      this.sun.intensity = 0.32 * (1 - cloud * 0.65) * moonUp + 0.02;
      this.lightDir = this.moonDir;
    }
    // ночная заливка + вспышка молнии
    this.hemi.intensity = 0.05 + night * 0.28 + this.flash * 5;
    this.hemi.color.setRGB(0.55, 0.65, 0.95);
    this.hemi.groundColor.setRGB(0.25, 0.22, 0.18);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3);
    // при сплошной облачности рассеянный свет от неба чуть слабее, а тени мягче
    this.envIntensity = lerp(1, 0.75, overcast);
    this.sun.shadow.radius = 1 + overcast * 4;
    // глаз привыкает к темноте
    this.exposure = lerp(1.0, 2.2, night) * lerp(1, 1.25, overcast * (1 - night));

    // насколько изменилось небо — для карты окружения
    this.changed = this._lastDir.distanceTo(this.sunDir) * 40 + Math.abs(this._lastCloud - cloud) * 8 + this.flash;
    // тени следуют за игроком, привязка к текселю — чтобы не дрожали
    const texel = (this.shadowRange * 2) / this.sun.shadow.mapSize.x;
    const fx = Math.round(focus.x / texel) * texel;
    const fz = Math.round(focus.z / texel) * texel;
    this.sun.target.position.set(fx, focus.y, fz);
    this.sun.position.set(fx + this.lightDir.x * 250, focus.y + this.lightDir.y * 250, fz + this.lightDir.z * 250);
    this.sun.target.updateMatrixWorld();
  }

  markEnvUpdated(weather) {
    this._lastDir.copy(this.sunDir);
    this._lastCloud = weather.cloud;
  }

  serialize() {
    return { time: this.time, day: this.day };
  }

  deserialize(d) {
    if (!d) return;
    this.time = d.time ?? 7.5;
    this.day = d.day ?? 1;
  }
}
