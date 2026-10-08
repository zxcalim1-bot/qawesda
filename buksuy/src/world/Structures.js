import * as THREE from 'three';
import {
  makeHouse, makeGarage, makeFence, makePowerPole, makeTent, makeWreck, makeSign, makePanelBlock,
  paint, merge, box, propMaterial, metalMaterial, windowLitMaterial, glassMaterial, makeRock,
} from './Props.js';
import { makeTextTexture } from './materials.js';
import { mulberry32 } from '../core/Random.js';
import { WATER_Y, PADS } from './WorldLayout.js';

// Расстановка построек по локациям. Возвращает «точки интереса» для систем игры.

export class Structures {
  constructor(world) {
    this.world = world;
    this.scene = world.scene;
    this.ground = world.ground;
    this.colliders = world.colliders;
    this.vegetation = world.vegetation;
    this.terrain = world.terrain;
    this.roads = world.roads;
    this.group = new THREE.Group();
    this.group.name = 'structures';
    this.scene.add(this.group);
    this.spots = [];
    this.npcSpots = {};
    this.lights = [];
    this.windows = [];
    this.blinkers = [];
    this.special = {};
    this.placed = [];
    this.cullT = 0;
    this.rnd = mulberry32(4242);
  }

  // минимальная высота земли под прямоугольником — чтобы дом не висел в воздухе
  baseHeight(x, z, w = 4, d = 4, rot = 0) {
    let h = Infinity;
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
      const lx = (a * w) / 2, lz = (b * d) / 2;
      h = Math.min(h, this.ground.height(x + lx * c + lz * s, z - lx * s + lz * c));
    }
    return h;
  }

  place(obj, x, z, rot = 0, opts = {}) {
    const y = opts.y ?? this.baseHeight(x, z, opts.w ?? 2, opts.d ?? 2, rot) + (opts.yOff ?? 0);
    obj.position.set(x, y, z);
    obj.rotation.y = rot;
    this.group.add(obj);
    this.placed.push({ obj, x, z, big: Math.max(opts.w || 0, opts.d || 0, opts.h || 0) > 12 });
    if (opts.collide !== false && opts.w) {
      this.colliders.add({
        type: 'box', x, z, hx: opts.w / 2, hz: opts.d / 2, rot,
        y0: y - 1, y1: y + (opts.h ?? 4), kind: opts.kind || 'building',
      });
    }
    if (opts.clear !== false && opts.w) this.vegetation.clearArea(x, z, Math.max(opts.w, opts.d) * 0.75 + 2);
    return obj;
  }

  house(x, z, rot, opts = {}) {
    const h = makeHouse({ seed: Math.floor(this.rnd() * 1e6), ...opts });
    this.place(h.group, x, z, rot, { w: h.w, d: h.d, h: h.height });
    if (h.windows) this.windows.push(h.windows);
    // точка у двери
    const door = h.doorLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    return { ...h, door: { x: x + door.x, z: z + door.z } };
  }

  spot(def) {
    this.spots.push(def);
    return def;
  }

  npc(id, x, z, yaw = 0) {
    this.npcSpots[id] = { x, z, yaw };
  }

  sign(lines, x, z, rot, opts = {}) {
    const tex = makeTextTexture(lines, opts);
    const s = makeSign(tex, opts.sw ?? 2.2, opts.sh ?? 1.1, opts.pole ?? 2.2);
    this.place(s, x, z, rot, { collide: false });
    this.colliders.add({ type: 'circle', x, z, r: 0.15, kind: 'pole', breakable: true, breakSpeed: 5, slow: 0.93, damage: 4 });
    return s;
  }

  wreck(id, x, z, rot, color) {
    const w = makeWreck(Math.floor(this.rnd() * 1e5), color);
    this.place(w, x, z, rot, { w: 1.7, d: 4.1, h: 1.5, kind: 'car' });
    this.spot({ type: 'wreck', id, x, z, r: 3.2 });
    return w;
  }

  // y — высота над землёй
  light(x, y, z, color = 0xffc070, intensity = 30, distance = 25) {
    this.lights.push({ x, y, z, color, intensity, distance });
  }

  build() {
    this.misha();
    this.kochki();
    this.gena();
    this.kolos();
    this.blueHouse();
    this.kafe();
    this.junkyard();
    this.efim();
    this.oldBridge();
    this.camp();
    this.swamp();
    this.pereval();
    this.factory();
    this.landslide();
    this.tower();
    this.tunnel();
    this.oldGas();
    this.iceHut();
    this.checkpoint();
    this.depot();
    this.city();
    this.roadside();
    this.powerLine();
    return this;
  }

  // ---------------- локации ----------------

  misha() {
    this.house(54, 220, -Math.PI / 2, { wall: '#8d5f37', shutters: '#e8e2d0', w: 7, d: 8 });
    this.npc('misha', 37, 199, -2.0);
    const shed = makeGarage({ w: 5, d: 6, h: 2.8, wall: '#7a6a5a', gate: '#6a4a30' });
    this.place(shed.group, 58, 196, -Math.PI / 2, { w: 5, d: 6, h: 3 });
    this.spot({ type: 'container', id: 'misha_shed', x: 54, z: 196, r: 3 });
    const fence = new THREE.Mesh(makeFence(36, 3), propMaterial);
    this.place(fence, 66, 178, -Math.PI / 2, { collide: false });
    const fence2 = new THREE.Mesh(makeFence(30, 4), propMaterial);
    this.place(fence2, 36, 232, 0, { collide: false });
    // лавочка
    const bench = merge([paint(box(1.6, 0.08, 0.4, 0, 0.45, 0), '#7a5a3a'), paint(box(0.1, 0.45, 0.35, -0.7, 0.22, 0), '#5a4a3a'), paint(box(0.1, 0.45, 0.35, 0.7, 0.22, 0), '#5a4a3a')]);
    this.place(new THREE.Mesh(bench, propMaterial), 46, 212, -Math.PI / 2, { collide: false });
  }

  kochki() {
    const houses = [
      [-28, 150, Math.PI / 2], [-30, 118, Math.PI / 2], [-31, 40, Math.PI / 2],
      [45, 112, Math.PI], [82, 114, Math.PI], [118, 113, Math.PI], [152, 106, Math.PI],
      [58, 70, 0], [96, 74, 0], [134, 70, 0],
    ];
    for (const [x, z, r] of houses) this.house(x, z, r);
    // магазин
    const shop = makeGarage({ w: 8, d: 6, h: 3.2, wall: '#c9b48a', roof: '#7a3a2a', gate: '#5a3b28' });
    this.place(shop.group, 28, 58, -Math.PI / 2, { w: 8, d: 6, h: 3.4 });
    this.sign(['ПРОДУКТЫ'], 23, 52, -Math.PI / 2, { bg: '#a02c22', sw: 2.6, sh: 0.8, pole: 2.4 });
    this.spot({ type: 'shop', shop: 'kochki_shop', x: 22, z: 58, r: 3, label: 'Магазин «Продукты»' });
    this.wreck('wreck_kochki', 70, 96, 0.4, '#a8a090');
    // въездные знаки
    this.sign(['НИЖНИЕ', 'КОЧКИ'], 16, 168, Math.PI, { bg: '#1f5fa8' });
    this.sign(['НИЖНИЕ', 'КОЧКИ'], 4, -60, 0, { bg: '#1f5fa8' });
    this.sign(['СЕВЕРНЫЙ', '4,8 км ↑'], 20, -96, 0, { bg: '#1f6f3a', size: 50 });
  }

  gena() {
    const g = makeGarage({ w: 11, d: 9, h: 4.2, wall: '#9aa0a4', gate: '#3a5a8a' });
    this.place(g.group, 50, -24, -Math.PI / 2, { w: 11, d: 9, h: 4.4 });
    this.sign(['АВТОСЕРВИС', '«У ГЕНЫ»'], 34, -8, -Math.PI / 2, { bg: '#e8e0c8', fg: '#2a2a2a', sw: 2.8, sh: 1.2, pole: 2.6, dirty: true });
    this.npc('gena', 36, -27, -Math.PI / 2 + 0.3);
    // покрышки стопкой
    const tires = [];
    for (let i = 0; i < 5; i++) {
      const t = new THREE.TorusGeometry(0.32, 0.12, 6, 12);
      t.rotateX(Math.PI / 2);
      t.translate(0, 0.12 + i * 0.24, 0);
      tires.push(paint(t, '#1c1c1c', 0.2));
    }
    const tm = new THREE.Mesh(merge(tires), propMaterial);
    this.place(tm, 42, -36, 0, { w: 0.9, d: 0.9, h: 1.3, kind: 'tires' });
    // бочки
    const barrels = [];
    for (const [x, z] of [[0, 0], [0.7, 0.2], [0.3, 0.8]]) {
      const b = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10);
      b.translate(x, 0.45, z);
      barrels.push(paint(b, '#2f5a3a', 0.2));
    }
    this.place(new THREE.Mesh(merge(barrels), propMaterial), 43, -12, 0, { w: 1.4, d: 1.4, h: 1, kind: 'barrel' });
    this.wreck('wreck_gena', 58, -6, 1.2, '#c9c0a8');
    this.light(38, 4, -24, 0xffd090, 20, 18);
  }

  kolos() {
    // навес
    const parts = [];
    parts.push(paint(box(9, 0.5, 12, 0, 5.2, 0), '#e8e2d4'));
    parts.push(paint(box(9.1, 0.5, 0.1, 0, 5.2, 6.05), '#c83020'));
    parts.push(paint(box(9.1, 0.5, 0.1, 0, 5.2, -6.05), '#c83020'));
    for (const [x, z] of [[-3.5, -4.5], [3.5, -4.5], [-3.5, 4.5], [3.5, 4.5]]) parts.push(paint(box(0.35, 5, 0.35, x, 2.5, z), '#9a9a9a'));
    const canopy = new THREE.Mesh(merge(parts), propMaterial);
    canopy.castShadow = true;
    this.place(canopy, 70, -392, 0, { y: this.ground.height(70, -392), collide: false });
    for (const [x, z] of [[-3.5, -4.5], [3.5, -4.5], [-3.5, 4.5], [3.5, 4.5]]) this.colliders.add({ type: 'circle', x: 70 + x, z: -392 + z, r: 0.3, kind: 'pole' });
    // колонки
    for (const dz of [-3, 3]) this._pump(70, -392 + dz, 'kolos');
    // будка
    const kiosk = makeGarage({ w: 6, d: 7, h: 3.2, wall: '#e8e2d4', roof: '#c83020', gate: '#3a6fb0' });
    this.place(kiosk.group, 92, -392, -Math.PI / 2, { w: 6, d: 7, h: 3.4 });
    this.sign(['АЗС «КОЛОС»', 'АИ-76 — 55 ₽'], 56, -372, -Math.PI / 2 + 0.4, { bg: '#c83020', sw: 2.6, sh: 1.4, pole: 3.2 });
    this.npc('luda', 86, -390, -Math.PI / 2);
    this.spot({ type: 'shop', shop: 'kolos_shop', x: 87, z: -394, r: 2.5, label: 'Окошко кассы' });
    this.light(70, 4.8, -392, 0xfff0d0, 45, 26);
  }

  _pump(x, z, station) {
    const parts = [];
    parts.push(paint(box(0.7, 1.6, 0.5, 0, 0.8, 0), station === 'old_gas' ? '#7a6a5a' : '#d8d4c8'));
    parts.push(paint(box(0.72, 0.4, 0.52, 0, 1.4, 0), station === 'old_gas' ? '#6a3a2a' : '#c83020'));
    parts.push(paint(box(0.4, 0.25, 0.05, 0, 1.05, 0.27), '#202020'));
    parts.push(paint(box(0.9, 0.2, 0.7, 0, 0.1, 0), '#8a8a8a'));
    const m = new THREE.Mesh(merge(parts), propMaterial);
    m.castShadow = true;
    this.place(m, x, z, Math.PI / 2, { w: 0.8, d: 0.6, h: 1.8, kind: 'pump' });
    this.spot({ type: 'pump', station, x, z, r: 6 });
  }

  blueHouse() {
    const h = this.house(-345, -604, 1.0, { abandoned: true, shutters: '#3a6fb0', wall: '#8a7a68', roof: '#4c4a48' });
    this.spot({ type: 'container', id: 'blue_house', x: h.door.x, z: h.door.z, r: 3 });
    // колодец
    const well = merge([
      paint(new THREE.CylinderGeometry(0.7, 0.7, 0.9, 10).translate(0, 0.45, 0), '#6a6a6a'),
      paint(box(0.1, 1.6, 0.1, -0.6, 0.8, 0), '#5a4a3a'),
      paint(box(0.1, 1.6, 0.1, 0.6, 0.8, 0), '#5a4a3a'),
      paint(new THREE.ConeGeometry(1, 0.6, 4).rotateY(Math.PI / 4).translate(0, 1.9, 0), '#4a3a2a'),
    ]);
    this.place(new THREE.Mesh(well, propMaterial), -330, -620, 0, { w: 1.4, d: 1.4, h: 2 });
    this.spot({ type: 'container', id: 'blue_well', x: -330, z: -618, r: 2.5 });
    // покосившийся сарай
    const shed = makeGarage({ w: 4, d: 5, h: 2.5, wall: '#5a5048', gate: '#4a3a30' });
    shed.group.rotation.z = 0.08;
    this.place(shed.group, -362, -588, 0.6, { w: 4, d: 5, h: 2.6 });
  }

  kafe() {
    const g = makeGarage({ w: 12, d: 8, h: 3.4, wall: '#d8c8a0', roof: '#3a5a8a', gate: '#5a3b28' });
    this.place(g.group, 22, -1250, -Math.PI / 2, { w: 12, d: 8, h: 3.6 });
    this.sign(['КАФЕ', '«ТРАССА»'], 2, -1232, -Math.PI / 2 + 0.3, { bg: '#2a2a2a', fg: '#ffcc40', pole: 3 });
    this.spot({ type: 'shop', shop: 'kafe_buffet', x: 16, z: -1252, r: 3, label: 'Буфет' });
    this.spot({ type: 'sleep', x: 16, z: -1245, r: 2.5, price: 250, label: 'Снять койку до утра (250 ₽)' });
    this.spot({ type: 'container', id: 'kafe_back', x: 30, z: -1262, r: 2.5 });
    for (const dz of [-6, 6]) this._pump(3, -1250 + dz, 'kafe');
    this.npc('valera', 8, -1262, -Math.PI / 2 - 0.5);
    // фура Валеры
    const truck = new THREE.Group();
    const tparts = [];
    tparts.push(paint(box(2.4, 2.4, 2.4, 0, 1.9, 4.5), '#b03020'));
    tparts.push(paint(box(2.5, 2.8, 8.5, 0, 2.3, -1.2), '#d8d8d8'));
    tparts.push(paint(box(2.2, 0.4, 11, 0, 0.6, 0.5), '#2a2a2a'));
    for (const z of [4.5, -2.5, -4]) for (const x of [-1.05, 1.05]) {
      const w = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12).rotateZ(Math.PI / 2).translate(x, 0.5, z);
      tparts.push(paint(w, '#1a1a1a'));
    }
    const tm = new THREE.Mesh(merge(tparts), propMaterial);
    tm.castShadow = true;
    truck.add(tm);
    const glass = new THREE.Mesh(box(2.3, 1.0, 0.05, 0, 2.5, 5.72), glassMaterial);
    truck.add(glass);
    this.place(truck, 18, -1280, -0.15, { w: 2.6, d: 11.5, h: 3.6, kind: 'truck' });
    // столики
    for (const dz of [-3, 3]) {
      const t = merge([paint(box(1.6, 0.06, 0.9, 0, 0.75, 0), '#7a5a3a'), paint(box(0.1, 0.75, 0.1, 0, 0.37, 0), '#4a4a4a')]);
      this.place(new THREE.Mesh(t, propMaterial), 12, -1240 + dz, 0, { w: 1.6, d: 0.9, h: 1, kind: 'table' });
    }
    this.light(14, 3.4, -1250, 0xffc070, 30, 22);
  }

  junkyard() {
    const cx = -215, cz = -1210;
    const colors = ['#3a5aa0', '#e8e6e0', '#b02a20', '#3a6a3a', '#7a8a6a', '#1a1a1a'];
    const ids = ['junk_1', 'junk_2', 'junk_3', 'junk_4', 'junk_5', 'junk_6'];
    ids.forEach((id, i) => {
      const a = (i / ids.length) * Math.PI * 2;
      this.wreck(id, cx + Math.cos(a) * 18, cz + Math.sin(a) * 16, a + 0.4, colors[i]);
    });
    // декоративные кучи
    for (let i = 0; i < 6; i++) {
      const w = makeWreck(900 + i, ['#6a5040', '#5a5a50', '#7a4030'][i % 3]);
      const a = (i / 6) * Math.PI * 2 + 0.5;
      this.place(w, cx + Math.cos(a) * 30, cz + Math.sin(a) * 28, a, { w: 1.7, d: 4.1, h: 1.5, kind: 'car' });
    }
    const booth = makeGarage({ w: 3, d: 3, h: 2.5, wall: '#6a7a6a', gate: '#3a3a3a' });
    this.place(booth.group, cx + 4, cz + 30, Math.PI, { w: 3, d: 3, h: 2.6 });
    this.spot({ type: 'container', id: 'junk_booth', x: cx + 4, z: cz + 27.5, r: 2.5 });
    const fence = new THREE.Mesh(makeFence(60, 11, '#5a5a5a'), propMaterial);
    this.place(fence, cx - 30, cz - 38, 0, { collide: false });
    this.sign(['СВАЛКА', 'вход 0 ₽'], cx + 20, cz + 34, Math.PI * 0.8, { bg: '#5a5a5a', size: 48 });
  }

  efim() {
    this.house(-392, -1325, 0.9, { wall: '#9a6a4a', shutters: '#3f8a5a', w: 6, d: 7 });
    const barn = makeGarage({ w: 6, d: 8, h: 3.4, wall: '#6a4a30', roof: '#4a4a4a', gate: '#5a3a20' });
    this.place(barn.group, -405, -1305, 0.9, { w: 6, d: 8, h: 3.6 });
    this.spot({ type: 'container', id: 'efim_barn', x: -401, z: -1300, r: 3 });
    this.npc('efim', -375, -1312, 0.9 + Math.PI);
    const fence = new THREE.Mesh(makeFence(24, 13), propMaterial);
    this.place(fence, -380, -1345, 0.9, { collide: false });
  }

  oldBridge() {
    this.sign(['МОСТ', '1961 г.', '3 т'], -429, -1478, 0.2, { bg: '#e8e2d0', fg: '#2a2a2a', size: 44, dirty: true });
    this.spot({ type: 'note', id: 'bridge_plaque', x: -428, z: -1478, r: 2.5, label: 'Прочитать табличку' });
    // доска на развилке
    this.sign(['НАПРАВО', 'НЕ НАДО'], -438, -1606, 0.5, { bg: '#5a4a38', fg: '#e8e2d0', size: 50, border: false, pole: 1.4 });
    this.spot({ type: 'note', id: 'fork_sign', x: -437, z: -1604, r: 2.5, label: 'Прочитать надпись' });
  }

  camp() {
    const tents = [['#3d7a4a', 252, -1488], ['#c8702a', 236, -1484]];
    for (const [c, x, z] of tents) {
      this.place(new THREE.Mesh(makeTent(c), propMaterial), x, z, this.rnd() * 3, { w: 2.2, d: 2.2, h: 1.8, kind: 'tent' });
    }
    // костёр
    const fire = merge([
      ...[0, 1, 2, 3].map((i) => paint(box(0.12, 0.12, 1.0, 0, 0.1, 0).rotateY(i * 0.8), '#4a3020')),
      ...[0, 1, 2, 3, 4, 5].map((i) => paint(box(0.25, 0.2, 0.25, Math.cos(i) * 0.6, 0.1, Math.sin(i) * 0.6), '#6a6a6a')),
    ]);
    this.place(new THREE.Mesh(fire, propMaterial), 244, -1494, 0, { collide: false });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.85 }));
    flame.position.set(244, this.ground.height(244, -1494) + 0.45, -1494);
    this.group.add(flame);
    this.special.flame = flame;
    this.light(244, 1, -1494, 0xff9040, 35, 18);
    this.special.fireLight = this.lights.length - 1;
    // лодка
    const boat = merge([paint(box(1.2, 0.4, 3.2, 0, 0.2, 0), '#5a7a8a'), paint(box(1.0, 0.1, 0.3, 0, 0.35, 0), '#7a5a3a')]);
    this.place(new THREE.Mesh(boat, propMaterial), 262, -1512, 0.3, { w: 1.3, d: 3.3, h: 0.6, kind: 'boat' });
    this.npc('semenych', 241, -1497, 0.8);
  }

  swamp() {
    // мёртвые деревья
    for (let i = 0; i < 18; i++) {
      const a = this.rnd() * Math.PI * 2, r = 20 + this.rnd() * 60;
      const x = -215 + Math.cos(a) * r, z = -1725 + Math.sin(a) * r;
      const h = 4 + this.rnd() * 4;
      const t = merge([
        paint(new THREE.CylinderGeometry(0.08, 0.2, h, 5).translate(0, h / 2, 0), '#3a3228'),
        paint(box(0.08, 1.4, 0.08, 0.4, h * 0.7, 0).rotateZ(-0.7), '#3a3228'),
      ]);
      this.place(new THREE.Mesh(t, propMaterial), x, z, this.rnd() * 6, { collide: false });
      this.colliders.add({ type: 'circle', x, z, r: 0.2, kind: 'tree', breakable: true, breakSpeed: 3, slow: 0.85, damage: 4 });
    }
    // утонувшая машина
    const w = makeWreck(77, '#3a6a68');
    w.rotation.x = 0.15;
    this.place(w, -175, -1748, 2.3, { yOff: -0.7, w: 1.7, d: 4.1, h: 0.8, kind: 'car' });
    this.spot({ type: 'container', id: 'swamp_car', x: -172, z: -1745, r: 3.5 });
  }

  pereval() {
    const houses = [[120, -2270, -Math.PI / 2 + 0.2], [190, -2320, Math.PI * 0.9], [150, -2320, Math.PI], [205, -2272, 0], [124, -2318, Math.PI * 0.95]];
    for (const [x, z, r] of houses) this.house(x, z, r, { wall: ['#6f8aa0', '#b3a07a', '#a8743e'][Math.floor(this.rnd() * 3)] });
    // шиномонтаж
    const g = makeGarage({ w: 9, d: 8, h: 3.8, wall: '#c8c0a0', gate: '#8a3a2a' });
    this.place(g.group, 165, -2268, Math.PI, { w: 9, d: 8, h: 4 });
    this.sign(['ШИНОМОНТАЖ', 'и не только'], 156, -2280, Math.PI + 0.3, { bg: '#2a2a2a', fg: '#ffd040' });
    this.npc('zina', 162, -2280, Math.PI);
    // баба Нюра на лавочке
    const bench = merge([paint(box(1.6, 0.08, 0.4, 0, 0.45, 0), '#7a5a3a'), paint(box(0.1, 0.45, 0.35, -0.7, 0.22, 0), '#5a4a3a'), paint(box(0.1, 0.45, 0.35, 0.7, 0.22, 0), '#5a4a3a')]);
    this.place(new THREE.Mesh(bench, propMaterial), 196, -2290, Math.PI / 2, { collide: false });
    this.npc('nyura', 196.5, -2290, Math.PI / 2);
    // гаражный ряд
    for (let i = 0; i < 5; i++) {
      const gg = makeGarage({ w: 4, d: 6, h: 2.8, wall: '#8a8e90', gate: ['#3a5a8a', '#6a3a2a', '#3a6a4a', '#7a7a3a', '#5a5a5a'][i] });
      this.place(gg.group, 230 + i * 4.3, -2245, Math.PI, { w: 4, d: 6, h: 3 });
    }
    this.sign(['17'], 230 + 2 * 4.3, -2247.6, Math.PI, { bg: '#e8e2d0', fg: '#1a1a1a', sw: 0.6, sh: 0.4, pole: 2.3, border: false, size: 90 });
    this.spot({ type: 'container', id: 'garage17', x: 230 + 2 * 4.3, z: -2249.5, r: 2.5 });
    const shed = makeGarage({ w: 4, d: 4, h: 2.6, wall: '#6a5a4a', gate: '#4a3a2a' });
    this.place(shed.group, 110, -2300, 0.3, { w: 4, d: 4, h: 2.8 });
    this.spot({ type: 'container', id: 'pereval_shed', x: 111, z: -2296.5, r: 2.5 });
    this.spot({ type: 'shop', shop: 'pereval_shop', x: 160, z: -2275, r: 3, label: 'Прилавок шиномонтажа' });
    this.sign(['ПОСЁЛОК', 'ПЕРЕВАЛ'], 64, -2180, 0.3, { bg: '#1f5fa8' });
  }

  factory() {
    const cx = 600, cz = -2450;
    const hall = makeGarage({ w: 40, d: 24, h: 12, wall: '#8a6a5a', roof: '#4a4a4a', gate: '#5a6a5a' });
    this.place(hall.group, cx + 10, cz, Math.PI / 2, { w: 40, d: 24, h: 12 });
    const hall2 = makeGarage({ w: 20, d: 28, h: 9, wall: '#9a8070', roof: '#4a4a4a', gate: '#6a5a4a' });
    this.place(hall2.group, cx - 30, cz - 25, 0, { w: 20, d: 28, h: 9 });
    this.spot({ type: 'container', id: 'factory_hall', x: cx - 30, z: cz - 9.5, r: 3.5 });
    const chim = new THREE.Mesh(paint(new THREE.CylinderGeometry(1.6, 2.6, 36, 14).translate(0, 18, 0), '#8a4a3a', 0.15), propMaterial);
    this.place(chim, cx + 30, cz + 25, 0, { w: 4.5, d: 4.5, h: 36 });
    for (let i = 0; i < 2; i++) {
      const band = new THREE.Mesh(paint(new THREE.CylinderGeometry(1.75, 1.75, 1.2, 14).translate(0, 31 - i * 2.4, 0), i ? '#e8e2d0' : '#c83020'), propMaterial);
      band.position.copy(chim.position);
      this.group.add(band);
    }
    // цистерны
    for (let i = 0; i < 3; i++) {
      const t = new THREE.Mesh(paint(new THREE.CylinderGeometry(2.2, 2.2, 7, 14).rotateZ(Math.PI / 2).translate(0, 2.3, 0), '#7a5a40', 0.2), propMaterial);
      this.place(t, cx - 5 + i * 6, cz + 30, 0.1, { w: 7, d: 4.5, h: 4.5, kind: 'tank' });
    }
    // проходная + сторож
    const booth = makeGarage({ w: 4, d: 4, h: 2.8, wall: '#c8c0a0', gate: '#3a3a3a' });
    this.place(booth.group, 566, -2400, 0.6, { w: 4, d: 4, h: 3 });
    this.spot({ type: 'container', id: 'factory_office', x: 568, z: -2397, r: 2.5 });
    this.npc('boris', 561, -2395, 2.3);
    this.sign(['ЗАВОД', '«КРАСНЫЙ ПОРШЕНЬ»'], 548, -2384, 0.7, { bg: '#c83020', sw: 3, sh: 1.2 });
    const fence = new THREE.Mesh(makeFence(80, 21, '#5a5a5a'), propMaterial);
    this.place(fence, cx - 50, cz + 45, 0, { collide: false });
    this.light(566, 3.5, -2398, 0xffd090, 20, 15);
  }

  landslide() {
    const grp = new THREE.Group();
    const cols = [];
    const p = this.roads.byId.main;
    // находим точку на трассе возле (82,-2808)
    const n = this.roads.nearest(82, -2808, 60, (r) => r.id === 'main');
    for (let i = 0; i < 9; i++) {
      const pt = p.at(n.s - 10 + i * 2.6);
      const off = (this.rnd() - 0.5) * 6;
      const x = pt.x + -pt.dz * off, z = pt.z + pt.dx * off;
      const size = 1.2 + this.rnd() * 1.4;
      const m = new THREE.Mesh(makeRock(300 + i, size), propMaterial);
      m.position.set(x, this.ground.height(x, z) - 0.2, z);
      m.castShadow = true;
      grp.add(m);
      cols.push({ type: 'circle', x, z, r: size * 0.9, kind: 'rock', disabled: true });
    }
    for (const c of cols) this.colliders.add(c);
    grp.visible = false;
    this.group.add(grp);
    this.special.landslide = { group: grp, colliders: cols };
  }

  tower() {
    const x = -545, z = -2962;
    const y = this.ground.height(x, z);
    const parts = [];
    const H = 38;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const leg = new THREE.CylinderGeometry(0.08, 0.12, H, 5);
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(b * -0.03, 0, a * 0.03));
      leg.applyMatrix4(m);
      leg.translate(a * 1.2, H / 2, b * 1.2);
      parts.push(paint(leg, '#b03020'));
    }
    for (let k = 2; k < H; k += 3) {
      const s = 1.25 - (k / H) * 0.9;
      for (const r of [0, Math.PI / 2]) {
        const bar = box(s * 2, 0.06, 0.06, 0, k, 0).rotateY(r);
        parts.push(paint(bar, k % 6 < 3 ? '#e8e2d0' : '#b03020'));
      }
    }
    const tower = new THREE.Mesh(merge(parts), metalMaterial);
    tower.castShadow = true;
    tower.position.set(x + 6, y - 0.2, z - 4);
    this.group.add(tower);
    this.colliders.add({ type: 'box', x: x + 6, z: z - 4, hx: 1.4, hz: 1.4, rot: 0, y0: y - 1, y1: y + 40, kind: 'tower' });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2010 }));
    lamp.position.set(x + 6, y + H + 0.3, z - 4);
    this.group.add(lamp);
    this.blinkers.push(lamp);
    const hut = makeGarage({ w: 4, d: 5, h: 2.8, wall: '#a8a090', gate: '#4a4a4a' });
    this.place(hut.group, x - 4, z + 3, Math.PI * 0.85, { w: 4, d: 5, h: 3 });
    this.spot({ type: 'container', id: 'tower_hut', x: x - 3.4, z: z + 0.2, r: 2.5 });
    this.spot({ type: 'transmitter', x: x - 2.6, z: z + 0.6, r: 2.8, label: 'Пульт передатчика' });
    this.light(x - 3, 2.6, z + 1, 0x90c0ff, 12, 10);
  }

  tunnel() {
    const r = this.roads.byId.rail;
    // где выемка глубже 6 м — ставим арку тоннеля
    const segs = [];
    for (let i = 0; i < r.n; i++) if (r.raw[i] - r.h[i] > 7) segs.push(i);
    if (!segs.length) return;
    const i0 = segs[0], i1 = segs[segs.length - 1];
    const parts = [];
    for (let i = i0; i < i1; i += 2) {
      const ax = r.x[i], az = r.z[i], bx = r.x[Math.min(r.n - 1, i + 2)], bz = r.z[Math.min(r.n - 1, i + 2)];
      const len = Math.hypot(bx - ax, bz - az);
      const arch = new THREE.CylinderGeometry(4.2, 4.2, len + 0.1, 14, 1, true, -Math.PI / 2, Math.PI);
      arch.rotateX(-Math.PI / 2);
      arch.rotateY(Math.atan2(bx - ax, bz - az));
      arch.translate((ax + bx) / 2, r.h[i] + 0.4, (az + bz) / 2);
      parts.push(paint(arch, '#5a5650', 0.15));
    }
    const mat = propMaterial.clone();
    mat.side = THREE.DoubleSide;
    const m = new THREE.Mesh(merge(parts), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    // портал
    for (const i of [i0, i1]) {
      const ang = Math.atan2(r.x[Math.min(r.n - 1, i + 1)] - r.x[i], r.z[Math.min(r.n - 1, i + 1)] - r.z[i]);
      const portal = merge([
        paint(box(1.2, 8, 1.2, -4.8, 4, 0), '#6a6660'),
        paint(box(1.2, 8, 1.2, 4.8, 4, 0), '#6a6660'),
        paint(box(10.8, 1.5, 1.2, 0, 8.2, 0), '#6a6660'),
      ]);
      const pm = new THREE.Mesh(portal, propMaterial);
      pm.position.set(r.x[i], r.h[i] - 0.2, r.z[i]);
      pm.rotation.y = ang;
      pm.castShadow = true;
      this.group.add(pm);
    }
    this.sign(['1938'], r.x[i0] + 3, r.z[i0] + 2, 0, { bg: '#5a5650', sw: 1, sh: 0.5, pole: 1.2, border: false });
    this.special.tunnel = { i0, i1 };
  }

  oldGas() {
    const cx = -54, cz = -3500;
    const parts = [];
    parts.push(paint(box(8, 0.4, 9, 0, 4.6, 0), '#8a7a6a'));
    for (const [x, z] of [[-3, -3.8], [3, -3.8], [-3, 3.8]]) parts.push(paint(box(0.3, 4.5, 0.3, x, 2.25, z), '#6a6a6a'));
    const canopy = new THREE.Mesh(merge(parts), propMaterial);
    canopy.rotation.z = 0.06;
    this.place(canopy, cx + 8, cz, 0, { collide: false });
    for (const [x, z] of [[-3, -3.8], [3, -3.8], [-3, 3.8]]) this.colliders.add({ type: 'circle', x: cx + 8 + x, z: cz + z, r: 0.25, kind: 'pole' });
    this._pump(cx + 8, cz, 'old_gas');
    const kiosk = makeGarage({ w: 5, d: 6, h: 3, wall: '#8a8478', gate: '#3a3a3a' });
    this.place(kiosk.group, cx - 6, cz, Math.PI / 2, { w: 5, d: 6, h: 3.2 });
    this.spot({ type: 'container', id: 'old_gas_kiosk', x: cx - 2.5, z: cz, r: 2.5 });
    this.sign(['А З С'], cx + 14, cz + 12, -Math.PI / 2, { bg: '#6a5a4a', fg: '#c8c0a0', dirty: true });
  }

  iceHut() {
    const x = 430, z = -3930;
    const y = this.terrain.lakeY;
    const hut = makeGarage({ w: 2.5, d: 3, h: 2.2, wall: '#7a5a3a', roof: '#4a4a4a', gate: '#5a3a2a' });
    this.place(hut.group, x, z, 0.4, { y, w: 2.5, d: 3, h: 2.4 });
    this.spot({ type: 'container', id: 'ice_hut', x: x + 0.6, z: z + 1.8, r: 2.5 });
  }

  checkpoint() {
    const x = 44, z = -4080;
    const main = this.roads.byId.main;
    const n = this.roads.nearest(x, z, 60, (r) => r === main);
    const ang = Math.atan2(n.dx, n.dz);
    const booth = makeGarage({ w: 2.6, d: 2.6, h: 2.6, wall: '#e8e2d0', roof: '#3a6a3a', gate: '#3a3a3a' });
    const bx = n.x + -n.dz * 7, bz = n.z + n.dx * 7;
    this.place(booth.group, bx, bz, ang + Math.PI / 2, { w: 2.6, d: 2.6, h: 2.8 });
    this.npc('sidorenko', n.x + -n.dz * 5, n.z + n.dx * 5, ang - Math.PI / 2);
    // шлагбаум
    const pivot = new THREE.Group();
    const arm = new THREE.Mesh(paint(box(9, 0.15, 0.15, 4.5, 0, 0), '#e8e2d0'), propMaterial);
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(paint(box(0.6, 0.16, 0.16, 1 + i * 1.8, 0, 0), '#c83020'), propMaterial);
      arm.add(stripe);
    }
    pivot.add(arm);
    const post = new THREE.Mesh(paint(box(0.3, 1.1, 0.3, 0, -0.55, 0), '#3a3a3a'), propMaterial);
    pivot.add(post);
    const px = n.x + -n.dz * 4.6, pz = n.z + n.dx * 4.6;
    pivot.position.set(px, this.ground.height(px, pz) + 1.1, pz);
    pivot.rotation.y = ang;
    this.group.add(pivot);
    const col = { type: 'box', x: n.x, z: n.z, hx: 4.6, hz: 0.25, rot: ang, y0: -1e5, y1: 1e5, kind: 'barrier' };
    this.colliders.add(col);
    this.special.barrier = { pivot, collider: col, open: false, angle: 0 };
    this.spot({ type: 'container', id: 'checkpoint_box', x: bx + -n.dx * 2.5, z: bz + -n.dz * 2.5, r: 2.2 });
    for (const s of [-1, 1]) {
      const blocks = new THREE.Mesh(paint(box(1, 0.8, 2, 0, 0.4, 0), '#9a9a90'), propMaterial);
      this.place(blocks, n.x + -n.dz * s * 9 + n.dx * 3, n.z + n.dx * s * 9 + n.dz * 3, ang, { w: 1, d: 2, h: 0.8, kind: 'block' });
    }
    this.sign(['СТОЙ!', 'КПП'], n.x + -n.dz * 6 + n.dx * 25, n.z + n.dx * 6 + n.dz * 25, ang + Math.PI, { bg: '#c83020' });
    this.light(bx, 3, bz, 0xfff0d0, 20, 16);
  }

  depot() {
    const x = -172, z = -4500;
    const shed = makeGarage({ w: 14, d: 30, h: 8, wall: '#7a5a4a', roof: '#3a3a3a', gate: '#4a4a3a' });
    this.place(shed.group, x - 18, z + 6, 0.5, { w: 14, d: 30, h: 8 });
    // ржавый паровоз
    const loco = merge([
      paint(new THREE.CylinderGeometry(1.1, 1.1, 6, 12).rotateX(Math.PI / 2).translate(0, 2, 1), '#2a2a2a'),
      paint(box(2.6, 2.8, 2.4, 0, 2.4, -3), '#3a2a2a'),
      paint(box(2.4, 0.5, 9, 0, 0.6, -0.5), '#4a3a2a'),
      paint(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 8).translate(0, 3.6, 3), '#2a2a2a'),
    ]);
    this.place(new THREE.Mesh(loco, propMaterial), x - 6, z + 26, 0.55, { w: 2.8, d: 9.5, h: 4.4, kind: 'loco' });
    const office = makeGarage({ w: 4, d: 4, h: 2.8, wall: '#a8a090', gate: '#4a4a4a' });
    this.place(office.group, x + 10, z - 10, 0.5, { w: 4, d: 4, h: 3 });
    this.spot({ type: 'container', id: 'depot_shed', x: x + 11.2, z: z - 7.8, r: 2.5 });
    this.sign(['ДЕПО', '«СЕВЕРНОЕ»'], x + 18, z + 6, 0.5, { bg: '#3a3a3a', fg: '#e8e2d0' });
  }

  city() {
    // панельки вдоль улиц
    const blocks = [
      [-120, -4490, 0, 5, 3], [120, -4490, 0, 9, 2], [-140, -4590, Math.PI / 2, 5, 3], [140, -4590, Math.PI / 2, 9, 3],
      [-110, -4700, Math.PI, 9, 3], [110, -4700, Math.PI, 5, 4], [-50, -4690, Math.PI, 5, 2], [55, -4600, 0, 5, 2],
      [-200, -4600, Math.PI / 2, 5, 2], [200, -4600, -Math.PI / 2, 9, 2],
    ];
    blocks.forEach(([x, z, r, floors, sections], i) => {
      const b = makePanelBlock(1000 + i, floors, sections);
      this.place(b.group, x, z, r, { w: b.w, d: b.d, h: b.height });
      this.windows.push(b.windows);
    });
    // площадь и постамент
    const px = -48, pz = -4585;
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(26, 40), new THREE.MeshStandardMaterial({ color: 0x8a8a86, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(px, this.ground.height(px, pz) + 0.05, pz);
    plaza.receiveShadow = true;
    this.group.add(plaza);
    const ped = merge([
      paint(box(5, 1.2, 7, 0, 0.6, 0), '#9a9890'),
      paint(box(4.4, 0.25, 6.4, 0, 1.32, 0), '#7a7870'),
      paint(box(1.4, 0.5, 0.05, 0, 0.6, 3.53), '#c8a050'),
    ]);
    this.place(new THREE.Mesh(ped, propMaterial), px, pz, 0, { w: 5, d: 7, h: 1.4, kind: 'pedestal' });
    this.spot({ type: 'note', id: 'pedestal', x: px, z: pz + 4.6, r: 2.5, label: 'Прочитать табличку' });
    this.special.pedestal = { x: px, z: pz, y: this.ground.height(px, pz) + 1.45 };
    this.npc('kirill', px + 6, pz + 6, Math.PI * 0.8);
    // фонари
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const lx = px + Math.cos(a) * 24, lz = pz + Math.sin(a) * 24;
      const lamp = merge([paint(box(0.12, 5, 0.12, 0, 2.5, 0), '#3a3a3a'), paint(box(0.5, 0.2, 0.5, 0, 5.05, 0), '#3a3a3a')]);
      this.place(new THREE.Mesh(lamp, metalMaterial), lx, lz, 0, { collide: false });
      this.colliders.add({ type: 'circle', x: lx, z: lz, r: 0.15, kind: 'pole' });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), windowLitMaterial);
      bulb.position.set(lx, this.ground.height(lx, lz) + 4.85, lz);
      this.group.add(bulb);
    }
    this.light(px, 6, pz, 0xffd8a0, 60, 40);
    // большие буквы на въезде
    const tex = makeTextTexture(['СЕВЕРНЫЙ'], { w: 1024, h: 256, bg: '#e8e2d0', fg: '#b03020', size: 150, border: false });
    const letters = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide }));
    const ex = 14, ez = -4450;
    letters.position.set(ex, this.ground.height(ex, ez) + 3.6, ez);
    letters.rotation.y = Math.PI * 0.95;
    this.group.add(letters);
    const stand = new THREE.Mesh(paint(box(14.4, 1.8, 0.6, 0, 0.9, 0), '#9a9890'), propMaterial);
    this.place(stand, ex, ez - 0.2, Math.PI * 0.95, { w: 14.4, d: 0.6, h: 2 });
    this.special.city = { x: px, z: pz, r: 34 };
  }

  // знаки и брошенные машины вдоль дорог
  roadside() {
    const main = this.roads.byId.main;
    const p = {};
    const sign = (s, lines, opts = {}) => {
      main.at(s, p);
      const side = opts.side ?? 1;
      const x = p.x + -p.dz * side * (main.halfWidth + 2.2), z = p.z + p.dx * side * (main.halfWidth + 2.2);
      this.sign(lines, x, z, Math.atan2(p.dx, p.dz) + Math.PI, opts);
    };
    sign(900, ['Северный', '12 км'], { bg: '#1f6f3a' });
    sign(1250, ['Северный', '14 км'], { bg: '#1f6f3a' });
    sign(1500, ['ОСТОРОЖНО', 'ЛОСИ'], { bg: '#e8d040', fg: '#1a1a1a' });
    sign(1900, ['РЕМОНТ ДОРОГИ', '1987 — ∞'], { bg: '#e8a020', fg: '#1a1a1a', size: 44 });
    sign(2300, ['Северный', '2,9 км'], { bg: '#1f6f3a' });
    sign(2700, ['ГОРНЫЙ', 'УЧАСТОК'], { bg: '#e8d040', fg: '#1a1a1a' });
    sign(3600, ['Северный', '1,5 км'], { bg: '#1f6f3a' });
    sign(4300, ['ДОБРО', 'ПОЖАЛОВАТЬ?'], { bg: '#1f5fa8', size: 46 });

    // брошенные машины
    const at = (road, s, off, id, color) => {
      const r = this.roads.byId[road];
      r.at(s, p);
      const x = p.x + -p.dz * off, z = p.z + p.dx * off;
      this.wreck(id, x, z, Math.atan2(p.dx, p.dz) + 0.6, color);
    };
    at('main', 1650, 9, 'wreck_road1', '#1a1a1a');
    at('old_road', 300, -7, 'wreck_road2', '#6a7a5a');
    at('main', 3000, -10, 'wreck_mount', '#4a6a8a');
    at('main', 4600, 11, 'wreck_north', '#e8e6e0');
  }

  powerLine() {
    const main = this.roads.byId.main;
    const geo = makePowerPole(7);
    const count = Math.floor(main.length / 60);
    const inst = new THREE.InstancedMesh(geo, propMaterial, count);
    const m = new THREE.Matrix4();
    const p = {};
    const tops = [];
    let k = 0;
    for (let s = 30; s < main.length - 30; s += 60) {
      main.at(s, p);
      if (main.isBridgeIndex(p.i)) continue;
      const x = p.x + -p.dz * 13, z = p.z + p.dx * 13;
      const y = this.ground.height(x, z);
      if (y < WATER_Y + 0.5) continue;
      // через заправки и дворы столбы не ставим
      if (PADS.some((pd) => pd.r < 50 && Math.hypot(x - pd.x, z - pd.z) < pd.r + 6)) continue;
      m.makeRotationY(Math.atan2(p.dx, p.dz) + Math.PI / 2);
      m.setPosition(x, y - 0.2, z);
      inst.setMatrixAt(k++, m);
      this.colliders.add({ type: 'circle', x, z, r: 0.18, kind: 'pole' });
      tops.push(new THREE.Vector3(x, y + 8.6, z));
    }
    inst.count = k;
    inst.castShadow = true;
    inst.instanceMatrix.needsUpdate = true;
    this.group.add(inst);
    // провода с провисом
    const pts = [];
    for (let i = 0; i < tops.length - 1; i++) {
      const a = tops[i], b = tops[i + 1];
      if (a.distanceTo(b) > 90) continue;
      for (let t = 0; t < 8; t++) {
        const t0 = t / 8, t1 = (t + 1) / 8;
        const sag = (u) => Math.sin(u * Math.PI) * 1.2;
        pts.push(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0 - sag(t0), a.z + (b.z - a.z) * t0);
        pts.push(a.x + (b.x - a.x) * t1, a.y + (b.y - a.y) * t1 - sag(t1), a.z + (b.z - a.z) * t1);
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x202020 }));
    this.group.add(lines);
  }

  // ---------------- динамика ----------------

  setLandslide(on) {
    const l = this.special.landslide;
    if (!l) return;
    l.group.visible = on;
    for (const c of l.colliders) c.disabled = !on;
  }

  openBarrier(open = true) {
    const b = this.special.barrier;
    if (!b) return;
    b.open = open;
    b.collider.disabled = open;
  }

  // дальние постройки прячем: туман их всё равно съедает, а вызовов отрисовки много
  cull(cam, viewDist) {
    const lim = viewDist * 1.1, limBig = viewDist * 1.8;
    for (const p of this.placed) {
      const d = Math.hypot(p.x - cam.x, p.z - cam.z);
      p.obj.visible = d < (p.big ? limBig : lim);
    }
  }

  update(dt, time, darkness) {
    const b = this.special.barrier;
    if (b) {
      const target = b.open ? 1.35 : 0;
      b.angle += (target - b.angle) * Math.min(1, dt * 2);
      b.pivot.children[0].rotation.z = b.angle;
    }
    for (const l of this.blinkers) l.visible = Math.sin(time * 3) > 0;
    if (this.special.flame) {
      const f = this.special.flame;
      f.scale.set(1, 0.8 + Math.sin(time * 13) * 0.15 + Math.sin(time * 7.3) * 0.1, 1);
    }
    windowLitMaterial.emissiveIntensity = darkness > 0.3 ? darkness * 1.8 : 0;
  }
}
