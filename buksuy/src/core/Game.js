import * as THREE from 'three';
import { EventBus } from './EventBus.js';
import { Input } from './Input.js';
import { Settings } from './Settings.js';
import { clamp } from './util.js';
import { WorldManager } from '../world/WorldManager.js';
import { SPAWN, MENU_SHOT } from '../world/WorldLayout.js';
import { VehicleController } from '../vehicle/VehicleController.js';
import { VehicleConfig } from '../vehicle/VehicleConfig.js';
import { VehicleModel } from '../vehicle/VehicleModel.js';
import { VehicleRepair } from '../vehicle/VehicleRepair.js';
import { DebrisSystem } from '../vehicle/Debris.js';
import { CarEffects } from '../vehicle/CarEffects.js';
import { Traffic } from '../world/Traffic.js';
import { PlayerController } from '../player/PlayerController.js';
import { CameraRig } from '../player/CameraRig.js';
import { Inventory } from '../systems/Inventory.js';
import { Interactions } from '../systems/Interactions.js';
import { WorldInteractions } from '../systems/WorldInteractions.js';
import { Needs } from '../systems/Needs.js';
import { NPCSystem } from '../systems/NPCSystem.js';
import { DialogSystem } from '../systems/DialogSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { RandomEvents } from '../systems/RandomEvents.js';
import { RadioSystem } from '../systems/RadioSystem.js';
import { MapSystem } from '../systems/MapSystem.js';
import { Achievements } from '../systems/Achievements.js';
import { Story } from '../systems/Story.js';
import { Economy } from '../systems/Economy.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioSystem } from '../audio/AudioSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { MainMenu } from '../ui/MainMenu.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { MapPanel } from '../ui/MapPanel.js';
import { JournalPanel } from '../ui/JournalPanel.js';
import { TrunkPanel } from '../ui/TrunkPanel.js';
import { setupGameEvents } from './gameEvents.js';
import { installFog } from '../render/atmosphere.js';
import { loadAssets } from '../render/assets.js';
import { PostFX } from '../render/PostFX.js';
import { EnvironmentProbe } from '../render/Environment.js';

const STEP = 1 / 120;

export class Game {
  constructor() {
    installFog();
    this.events = new EventBus();
    this.settings = new Settings();
    this.canvas = document.getElementById('view');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.settings.get('quality') !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = this.settings.get('shadows');
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xa8c4e0, 150, 1500);
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 3000);
    this.input = new Input(this.canvas);
    this.ui = new UIManager(this);
    this.audio = new AudioSystem(this);
    this.state = 'loading';
    this.acc = 0;
    this.playTime = 0;
    this.paused = false;
    this.lastT = performance.now();
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this.settings.onChange((k) => this._applySetting(k));
  }

  _resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const q = this.settings.get('quality');
    const dpr = window.devicePixelRatio || 1;
    const pr = q === 'ultra' ? Math.min(dpr, 2) : q === 'high' ? Math.min(dpr, 1.5) : q === 'low' ? Math.min(dpr, 0.85) : Math.min(dpr, 1.1);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.post?.setSize();
  }

  _applySetting(k) {
    if (k === 'quality') {
      this._resize();
      this.world.applyQuality();
      this._applyGraphics();
    }
    if (k === 'viewDistance') this.world.applyQuality();
    if (k === 'shadows') {
      this.renderer.shadowMap.enabled = this.settings.get('shadows');
      this.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
    }
    if (k === 'volume' || k === 'musicVolume') this.audio.applyVolume();
  }

  // всё, что зависит от качества графики и не живёт в мире
  _applyGraphics() {
    const q = this.settings.get('quality');
    const shadow = { low: [55, 1024], medium: [75, 2048], high: [95, 3072], ultra: [120, 4096] }[q] || [75, 2048];
    this.world.dayNight.setShadowRange(shadow[0], shadow[1]);
    this.post.configure(q);
  }

  async init() {
    this.ui.showLoading();
    const progress = (p, t) => this.ui.loading(p, t);
    await loadAssets(this.renderer, (p) => progress(p * 0.05, 'Грузим текстуры'));
    this.world = new WorldManager(this);
    await this.world.generate(progress);
    this.post = new PostFX(this.renderer, this.scene, this.camera);
    this.envProbe = new EnvironmentProbe(this.renderer, this.scene, this.world.sky);
    this._applyGraphics();

    const env = { gripMul: (k) => this.world.gripMul(k), ambient: () => this.world.ambient() };
    this.vehicle = new VehicleController(this.events, this.world.ground, this.world.colliders, env);
    this.carModel = new VehicleModel(this.scene);
    this.debris = new DebrisSystem(this.scene, this.world.ground, this.world.colliders, this.events);
    this.carFx = new CarEffects(this);
    this.cameraRig = new CameraRig(this.camera, this.world.ground, this.settings);
    this.player = new PlayerController(this);
    this.inventory = new Inventory(this.events);
    this.interactions = new Interactions(this);
    this.needs = new Needs(this);
    this.repair = new VehicleRepair(this);
    this.economy = new Economy(this);
    this.dialogs = new DialogSystem(this);
    this.npcs = new NPCSystem(this);
    this.quests = new QuestSystem(this);
    this.story = new Story(this);
    this.randomEvents = new RandomEvents(this);
    this.radio = new RadioSystem(this);
    this.map = new MapSystem(this);
    this.achievements = new Achievements(this);
    this.worldInteractions = new WorldInteractions(this);
    this.traffic = new Traffic(this);
    this.saves = new SaveSystem(this);
    setupGameEvents(this);

    progress(1, 'Поехали');
    this.enterMenu();
    this.ui.hideLoading();
    requestAnimationFrame((t) => this._loop(t));
  }

  // ---------- состояния ----------

  enterMenu() {
    this.state = 'menu';
    this.ui.closeAll();
    this.ui.setHudVisible(false);
    this.radio.off(true);
    this.audio.setInGame(false);
    // декорация для меню: Ласточка на обочине на закате
    this.resetWorldState();
    const main = this.world.roads.byId.main;
    const n = this.world.roads.nearest(MENU_SHOT.x, MENU_SHOT.z, 80, (r) => r === main);
    const x = n.x - n.dz * 5.5, z = n.z + n.dx * 5.5;
    this.vehicle.teleport(x, z, Math.atan2(n.dx, n.dz) + 0.25);
    for (let i = 0; i < 120; i++) this.vehicle.step(STEP);
    this.vehicle.lightsOn = true;
    this.vehicle.damage.fluids.charge = 1;
    this.player.spawn(x - 3, z + 1);
    this.player.model.root.visible = false;
    this.world.dayNight.time = 17.7;
    this.world.dayNight.frozen = true;
    this.world.weather.set('clear', true);
    this.world.warm(x, z);
    this.menu = new MainMenu(this);
    this.menu.show();
  }

  resetWorldState() {
    this.world.reset();
    this.vehicle.config = new VehicleConfig();
    this.vehicle.fuel.config = this.vehicle.config;
    this.vehicle.damage.reset();
    this.vehicle.fuel.liters = 9;
    this.vehicle.fuel.totalUsed = 0;
    this.vehicle.dirt = 0.18;
    this.vehicle.odometer = 0;
    this.vehicle.engine.on = false;
    this.vehicle.engine.temp = 18;
    this.vehicle.lightsOn = false;
    this.carModel.syncDetached(this.vehicle.damage);
    this.carModel.undent();
    for (const d of [...this.debris.items]) this.debris.remove(d);
    this.inventory.reset();
    this.needs.reset();
    this.npcs.reset();
    this.quests.reset();
    this.story.reset();
    this.randomEvents.reset();
    this.radio.reset();
    this.map.reset();
    this.achievements.resetRun();
    this.worldInteractions.reset();
    this.playTime = 0;
  }

  newGame() {
    this.menu?.hide();
    this.ui.fadeThrough(() => {
      this.resetWorldState();
      this.world.dayNight.frozen = false;
      this.vehicle.teleport(SPAWN.car.x, SPAWN.car.z, SPAWN.car.yaw);
      for (let i = 0; i < 120; i++) this.vehicle.step(STEP);
      this.vehicle.release();
      // камера смотрит на машину и дядю Мишу
      const look = Math.atan2(SPAWN.car.x - SPAWN.player.x + 4, SPAWN.car.z - SPAWN.player.z + 2);
      this.player.spawn(SPAWN.player.x, SPAWN.player.z, look);
      this.player.model.root.visible = true;
      this.cameraRig.footYaw = look;
      this.cameraRig.footPitch = 0.18;
      this.world.warm(SPAWN.car.x, SPAWN.car.z);
      this.startPlaying();
      this.story.intro();
    });
  }

  async loadGame(slot) {
    const data = this.saves.read(slot);
    if (!data) {
      this.ui.notify('Сохранение не найдено.', 'warn');
      return false;
    }
    this.menu?.hide();
    await this.ui.fadeThrough(() => {
      this.ui.closeAll();
      this.resetWorldState();
      this.world.dayNight.frozen = false;
      this.saves.apply(data);
      this.player.model.root.visible = true;
      const p = this.player.inCar ? this.vehicle.pos : this.player.pos;
      this.world.warm(p.x, p.z);
      this.startPlaying();
      this.ui.notify(`Загружено: ${data.place || 'где-то в пути'}`);
    });
    return true;
  }

  startPlaying() {
    this.state = 'playing';
    this.ui.setHudVisible(true);
    this.audio.setInGame(true);
    this.acc = 0;
  }

  // ---------- главный цикл ----------

  _loop(t) {
    requestAnimationFrame((tt) => this._loop(tt));
    let dt = (t - this.lastT) / 1000;
    this.lastT = t;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.1);
    try {
      this.update(dt);
      this._prepareFrame(dt);
    } catch (err) {
      console.error(err);
    }
    this.post.render();
    this.input.endFrame();
  }

  // экспозиция и отражения неба — перед каждой отрисовкой
  _prepareFrame(dt) {
    const dn = this.world.dayNight;
    const r = this.renderer;
    r.toneMappingExposure += (dn.exposure - r.toneMappingExposure) * Math.min(1, dt * 1.5);
    this.scene.environmentIntensity = dn.envIntensity;
    this.envProbe.update(dt, dn, this.world.weather);
    this.world.grass.update(this.camera.position, this.vehicle.pos, this.player.pos, !this.player.inCar);
  }

  update(dt) {
    const ui = this.ui;
    if (this.state === 'menu') {
      this.vehicle.step(STEP);
      this.carModel.update(dt, this.vehicle);
      this.cameraRig.updateMenu(dt, this.vehicle.pos);
      this.world.update(dt, 0, this.camera, this.vehicle.pos);
      this.audio.update(dt);
      ui.update(dt);
      return;
    }
    if (this.state !== 'playing') {
      ui.update(dt);
      return;
    }

    this._globalKeys();
    const paused = ui.modal || this.paused;
    const gdt = paused ? 0 : dt;
    const mouse = this.input.takeMouse();

    if (!paused) {
      this.playTime += dt;
      this.player.update(dt);
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n < 14) {
        this.vehicle.step(STEP);
        this.acc -= STEP;
        n++;
      }
      if (n >= 14) this.acc = 0;
      this.vehicle.pushForce = null;
      this.debris.update(dt);
      this.traffic.update(dt);
    }
    this.carModel.update(gdt, this.vehicle);
    if (!paused) this.carFx.update(dt);

    if (this.player.inCar) this.cameraRig.updateCar(dt, this.vehicle, paused ? { x: 0, y: 0 } : mouse);
    else this.cameraRig.updateFoot(dt, this.player, paused ? { x: 0, y: 0 } : mouse);

    const focus = this.player.inCar ? this.vehicle.pos : this.player.pos;
    const hours = (gdt / ((this.settings.get('dayLength') || 24) * 60)) * 24;
    this.world.dayNight.frozen = paused;
    this.world.update(dt, hours, this.camera, focus);

    if (!paused) {
      this.interactions.update(dt);
      this.needs.update(dt);
      this.npcs.update(dt);
      this.quests.update(dt);
      this.story.update(dt);
      this.randomEvents.update(dt);
      this.map.update(dt);
      this.achievements.update(dt);
      this.world.checkDiscovery(focus.x, focus.z);
      this.saves.update(dt);
    } else {
      this.interactions.update(0);
    }
    this.radio.update(dt);
    this.audio.update(dt);
    ui.update(dt);
  }

  _globalKeys() {
    const inp = this.input;
    const ui = this.ui;
    if (inp.pressed('pause') && !ui.modal) {
      new PauseMenu(this).open();
      return;
    }
    if (ui.modal) return;
    if (inp.pressed('map')) new MapPanel(this).open();
    else if (inp.pressed('journal')) new JournalPanel(this).open();
    else if (inp.pressed('inventory')) new TrunkPanel(this, { mode: this.player.nearCar() ? 'trunk' : 'pockets' }).open();
    else if (inp.pressed('quicksave')) this.saves.quickSave();
    else if (inp.pressed('quickload')) this.loadGame(this.saves.latestSlot());

    const car = this.vehicle;
    if (this.player.inCar) {
      if (inp.pressed('enter')) this.player.exitCar();
      if (inp.pressed('ignition')) car.ignition();
      if (inp.pressed('lights')) {
        const on = car.toggleLights();
        this.audio.play('click');
        if (on && car.damage.hp('headlightL') < 12 && car.damage.hp('headlightR') < 12) ui.notify('Фары щёлкнули… и ничего. Обе разбиты.', 'warn');
      }
      if (inp.pressed('radio')) {
        if (inp.down('run')) this.radio.off();
        else this.radio.next();
      }
      if (inp.pressed('camera')) this.cameraRig.cycleCarMode();
      if (inp.pressed('glovebox')) this.story.glovebox();
      if (inp.pressed('sleep')) this.needs.trySleep('car');
      if (inp.down('horn')) this.audio.horn(true);
      else this.audio.horn(false);
    } else {
      this.audio.horn(false);
      if (inp.pressed('enter') && this.player.nearCar(3.6)) this.player.enterCar();
    }
    // клик по канвасу — захват мыши
    if (inp.buttons.has(0) && !inp.locked) inp.lockPointer();
  }

  // ---------- прочее ----------

  // сколько игровых минут прошло (ремонт, обыск)
  passTime(minutes) {
    this.world.dayNight.advance(minutes / 60);
    this.needs.spend(minutes * 0.05);
    this.world.weather.nextIn -= minutes / 60;
  }

  get playerPos() {
    return this.player.inCar ? this.vehicle.pos : this.player.pos;
  }

  get nearCar() {
    return this.player.nearCar(4.2);
  }

  clampMoney() {
    this.inventory.money = clamp(this.inventory.money, 0, 1e9);
  }
}
