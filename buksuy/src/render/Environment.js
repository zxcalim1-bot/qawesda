import * as THREE from 'three';

// Карта окружения из текущего неба: от неё рассеянный свет и отражения
// (мокрый асфальт, стёкла, лужи, краска машины). Пересчитывается, когда небо заметно поменялось.

export class EnvironmentProbe {
  constructor(renderer, scene, sky) {
    this.renderer = renderer;
    this.scene = scene;
    this.sky = sky;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.pmrem.compileCubemapShader();
    this.rt = null;
    this.timer = 0;
  }

  update(dt, dayNight, weather, force = false) {
    this.timer -= dt;
    const ch = dayNight.changed;
    if (!force && !(ch > 1.2 || (this.timer <= 0 && ch > 0.04))) return;
    this.timer = 2.5;
    const sky = this.sky;
    sky.syncEnv();
    // земля в отражениях: тёмно-зелёная, освещённая как сейчас
    const a = dayNight.skyAmbient;
    const s = dayNight.sun.intensity * 0.06;
    sky.groundColor.setRGB(0.09 * (a.r + s), 0.1 * (a.g + s), 0.07 * (a.b + s));
    const rt = this.pmrem.fromScene(sky.envScene, 0, 0.1, 200);
    const old = this.rt;
    this.rt = rt;
    this.scene.environment = rt.texture;
    if (old) old.dispose();
    dayNight.markEnvUpdated(weather);
  }
}
