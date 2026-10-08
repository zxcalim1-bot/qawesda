import * as THREE from 'three';
import { clamp, lerp, smoothstep } from '../core/util.js';

// ключевые цвета (sRGB) по высоте солнца
const KEYS = [
  { e: -0.3, zen: [0.012, 0.018, 0.045], hor: [0.045, 0.055, 0.095], sun: [0.4, 0.45, 0.6], sunI: 0.0, hemi: 0.13 },
  { e: -0.08, zen: [0.04, 0.06, 0.16], hor: [0.32, 0.2, 0.2], sun: [1, 0.4, 0.2], sunI: 0.0, hemi: 0.2 },
  { e: 0.02, zen: [0.16, 0.22, 0.45], hor: [0.98, 0.56, 0.32], sun: [1, 0.55, 0.3], sunI: 1.0, hemi: 0.35 },
  { e: 0.18, zen: [0.2, 0.38, 0.72], hor: [0.78, 0.76, 0.75], sun: [1, 0.85, 0.65], sunI: 2.4, hemi: 0.75 },
  { e: 0.5, zen: [0.17, 0.4, 0.8], hor: [0.62, 0.76, 0.9], sun: [1, 0.96, 0.9], sunI: 3.1, hemi: 1.0 },
];

function sampleKeys(e) {
  if (e <= KEYS[0].e) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1];
    if (e <= b.e) {
      const t = (e - a.e) / (b.e - a.e);
      const mix = (x, y) => x.map((v, k) => lerp(v, y[k], t));
      return { zen: mix(a.zen, b.zen), hor: mix(a.hor, b.hor), sun: mix(a.sun, b.sun), sunI: lerp(a.sunI, b.sunI, t), hemi: lerp(a.hemi, b.hemi, t) };
    }
  }
  return KEYS[KEYS.length - 1];
}

const _c = new THREE.Color();

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
    const sc = this.sun.shadow.camera;
    sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70;
    sc.near = 1; sc.far = 400;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    scene.add(this.sun);
    scene.add(this.sun.target);

    this.hemi = new THREE.HemisphereLight(0xbfd6ff, 0x4a4030, 1);
    scene.add(this.hemi);

    this.sunDir = new THREE.Vector3();
    this.moonDir = new THREE.Vector3();
    this.elevation = 0;
    this.darkness = 0; // 0 день, 1 ночь — для фар, окон и т.п.
    this.flash = 0; // вспышка молнии
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

    const k = sampleKeys(this.sunDir.y);
    const cloud = weather.cloud;
    const gloom = cloud * 0.65 + weather.fogAmount * 0.25;

    // небо
    const U = this.sky.uniforms;
    U.uSunDir.value.copy(this.sunDir);
    U.uMoonDir.value.copy(this.moonDir);
    const grey = (c, amt) => {
      const l = (c[0] + c[1] + c[2]) / 3;
      return c.map((v) => lerp(v, l * 0.85, amt));
    };
    const zen = grey(k.zen, gloom);
    const hor = grey(k.hor, gloom * 0.8);
    U.uZenith.value.setRGB(...zen, THREE.SRGBColorSpace);
    U.uHorizon.value.setRGB(...hor, THREE.SRGBColorSpace);
    U.uSunColor.value.setRGB(...k.sun, THREE.SRGBColorSpace);
    U.uGround.value.setRGB(hor[0] * 0.4, hor[1] * 0.4, hor[2] * 0.35, THREE.SRGBColorSpace);
    U.uCloud.value = cloud;
    U.uCloudDark.value = weather.storm * 0.55 + weather.rain * 0.2;
    const night = 1 - smoothstep(-0.15, 0.05, this.sunDir.y);
    this.darkness = night;
    U.uStars.value = night * (1 - cloud);
    U.uMoon.value = night;
    U.uFogMix.value = weather.fogAmount * 0.9 + weather.rain * 0.3;

    // туман
    const fog = this.scene.fog;
    if (fog) {
      _c.setRGB(...hor, THREE.SRGBColorSpace);
      fog.color.copy(_c);
      U.uFog.value.copy(_c);
    }

    // свет
    let sunI = k.sunI * (1 - cloud * 0.7);
    const sunUp = this.sunDir.y > -0.02;
    if (sunUp) {
      this.sun.color.setRGB(...k.sun, THREE.SRGBColorSpace);
      this.sun.intensity = sunI;
      this.lightDir = this.sunDir;
    } else {
      // ночью тот же источник работает как луна
      this.sun.color.setRGB(0.55, 0.62, 0.85, THREE.SRGBColorSpace);
      this.sun.intensity = 0.32 * (1 - cloud * 0.6);
      this.lightDir = this.moonDir;
    }
    this.hemi.intensity = k.hemi * 2.1 * (1 - gloom * 0.3) + this.flash * 4;
    this.hemi.color.setRGB(Math.min(1, zen[0] * 1.6 + 0.35), Math.min(1, zen[1] * 1.4 + 0.38), Math.min(1, zen[2] * 1.1 + 0.42), THREE.SRGBColorSpace);
    this.hemi.groundColor.setRGB(0.42, 0.38, 0.3, THREE.SRGBColorSpace);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3);

    // тени следуют за игроком, привязка к текселю — чтобы не дрожали
    const texel = 140 / this.sun.shadow.mapSize.x;
    const fx = Math.round(focus.x / texel) * texel;
    const fz = Math.round(focus.z / texel) * texel;
    this.sun.target.position.set(fx, focus.y, fz);
    this.sun.position.set(fx + this.lightDir.x * 180, focus.y + this.lightDir.y * 180, fz + this.lightDir.z * 180);
    this.sun.target.updateMatrixWorld();
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
