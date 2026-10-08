// Типы поверхностей. grip — сцепление, roll — сопротивление качению,
// rough — тряска, sink — насколько колесо «тонет», fx — какие частицы летят из-под колёс.

export const SURFACES = [
  { id: 0, key: 'asphalt', name: 'асфальт', grip: 1.0, roll: 0.012, rough: 0.0, sink: 0, fx: null, color: [0.22, 0.22, 0.23] },
  { id: 1, key: 'dirt', name: 'грунтовка', grip: 0.78, roll: 0.03, rough: 0.035, sink: 0, fx: 'dust', color: [0.45, 0.36, 0.25] },
  { id: 2, key: 'gravel', name: 'гравий', grip: 0.72, roll: 0.035, rough: 0.045, sink: 0, fx: 'dust', color: [0.52, 0.5, 0.46] },
  { id: 3, key: 'grass', name: 'трава', grip: 0.66, roll: 0.05, rough: 0.05, sink: 0.01, fx: 'grass', color: [0.33, 0.47, 0.2] },
  { id: 4, key: 'forest', name: 'лесная подстилка', grip: 0.62, roll: 0.06, rough: 0.07, sink: 0.02, fx: 'dirt', color: [0.3, 0.32, 0.18] },
  { id: 5, key: 'mud', name: 'грязь', grip: 0.42, roll: 0.11, rough: 0.04, sink: 0.08, fx: 'mud', color: [0.3, 0.22, 0.14] },
  { id: 6, key: 'deepmud', name: 'топь', grip: 0.34, roll: 0.19, rough: 0.03, sink: 0.16, fx: 'mud', color: [0.2, 0.16, 0.1] },
  { id: 7, key: 'sand', name: 'песок', grip: 0.55, roll: 0.13, rough: 0.02, sink: 0.06, fx: 'sand', color: [0.76, 0.68, 0.48] },
  { id: 8, key: 'snow', name: 'снег', grip: 0.42, roll: 0.07, rough: 0.03, sink: 0.05, fx: 'snow', color: [0.88, 0.9, 0.94] },
  { id: 9, key: 'ice', name: 'лёд', grip: 0.14, roll: 0.01, rough: 0.0, sink: 0, fx: 'snow', color: [0.72, 0.82, 0.88] },
  { id: 10, key: 'rock', name: 'камни', grip: 0.8, roll: 0.04, rough: 0.09, sink: 0, fx: 'dust', color: [0.45, 0.44, 0.42] },
  { id: 11, key: 'rail', name: 'шпалы', grip: 0.7, roll: 0.05, rough: 0.075, sink: 0, fx: 'dust', color: [0.35, 0.3, 0.25] },
  { id: 12, key: 'wood', name: 'доски', grip: 0.7, roll: 0.02, rough: 0.02, sink: 0, fx: null, color: [0.45, 0.33, 0.2] },
  { id: 13, key: 'concrete', name: 'бетон', grip: 0.95, roll: 0.014, rough: 0.005, sink: 0, fx: null, color: [0.55, 0.55, 0.53] },
  { id: 14, key: 'riverbed', name: 'дно', grip: 0.45, roll: 0.15, rough: 0.05, sink: 0.05, fx: 'water', color: [0.3, 0.3, 0.25] },
];

export const SURF = Object.fromEntries(SURFACES.map((s) => [s.key, s.id]));

export function surfaceById(id) {
  return SURFACES[id] || SURFACES[3];
}

export const ROAD_SURFACE = {
  asphalt: SURF.asphalt,
  dirt: SURF.dirt,
  gravel: SURF.gravel,
  rail: SURF.rail,
};
