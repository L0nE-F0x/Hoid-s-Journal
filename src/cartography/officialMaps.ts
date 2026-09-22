/**
 * Isaac Stewart cartography, shown in the atlas with credit.
 * Globe textures stay procedural — these plates are not equirectangular.
 */
import { scadrialIsBasin } from '../data/index.ts';

const BASE = `${import.meta.env.BASE_URL}maps/`;

const cache = new Map<string, HTMLImageElement | 'loading' | 'fail'>();
const waiters = new Map<string, Set<() => void>>();

function load(file: string, onReady: () => void): HTMLImageElement | null {
  const hit = cache.get(file);
  if (hit instanceof HTMLImageElement) return hit;
  if (hit === 'fail') return null;
  let w = waiters.get(file);
  if (!w) {
    w = new Set();
    waiters.set(file, w);
    cache.set(file, 'loading');
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      cache.set(file, img);
      const q = waiters.get(file);
      waiters.delete(file);
      q?.forEach((fn) => fn());
    };
    img.onerror = () => {
      cache.set(file, 'fail');
      waiters.delete(file);
    };
    img.src = BASE + file;
  }
  w.add(onReady);
  return null;
}

export function worldMapFile(bodyId: string, era: number, cognitive: boolean, layer = 0, year?: number): string | null {
  const layers = worldMapLayers(bodyId, era, cognitive, year);
  if (!layers.length) return null;
  return layers[Math.min(layer, layers.length - 1)]!.file;
}

export interface MapLayer { name: string; file: string }

const CITY_LAYERS: Record<string, MapLayer[]> = {
  urithiru: [{ name: 'Tower', file: 'urithiru.jpg' }],
  kholinar: [{ name: 'City', file: 'Kholinar.jpg' }],
  kharbranth: [{ name: 'City', file: 'kharbranth.jpg' }],
  'thaylen-city': [{ name: 'City', file: 'thaylen_city.jpg' }],
  'shattered-plains': [
    { name: 'Plains', file: 'shattered_plains.jpg' },
    { name: 'Warcamps', file: 'warcamps.jpg' },
    { name: 'Detail', file: 'shattered_plains2.jpg' },
  ],
  narak: [
    { name: 'Plains', file: 'shattered_plains.jpg' },
    { name: 'Warcamps', file: 'warcamps.jpg' },
  ],
  luthadel: [
    { name: 'Survey', file: 'luthadel.jpg' },
    { name: 'Endpaper', file: 'luthadel_endpaper.png' },
    { name: 'Kredik Shaw', file: 'kredik_shaw.jpg' },
  ],
  elendel: [
    { name: 'Basin', file: 'elendel.jpg' },
    { name: 'Lost Metal', file: 'elendel_lost_metal.jpeg' },
  ],
  fadrex: [{ name: 'City', file: 'fadrex.jpg' }],
  urteau: [{ name: 'City', file: 'urteau.jpg' }],
  'new-seran': [{ name: 'City', file: 'new_seran.png' }],
};

export function cityMapLayers(locationId: string): MapLayer[] {
  return CITY_LAYERS[locationId] ?? [];
}

export function cityMapFile(locationId: string, layer = 0): string | null {
  const layers = CITY_LAYERS[locationId];
  if (!layers?.length) return null;
  return layers[Math.min(layer, layers.length - 1)]!.file;
}

export function worldMapLayers(bodyId: string, era: number, cognitive: boolean, year?: number): MapLayer[] {
  if (bodyId === 'roshar') {
    return cognitive
      ? [{ name: 'Shadesmar', file: 'Shadesmar_full.jpg' }]
      : [{ name: 'Roshar', file: 'roshar_full.jpg' }];
  }
  if (bodyId === 'scadrial' && !cognitive) {
    return scadrialIsBasin(era, year)
      ? [
          { name: 'World', file: 'scadrial_full.png' },
          { name: 'Basin', file: 'elendel_basin.png' },
          { name: 'Starchart', file: 'scadrial_starchart.jpg' },
        ]
      : [
          { name: 'Final Empire', file: 'final_empire.jpg' },
          { name: 'Endpaper', file: 'final_empire_endpaper.png' },
        ];
  }
  return [];
}

export function getOfficialMap(
  file: string | null, onReady: () => void,
): HTMLImageElement | null {
  if (!file) return null;
  return load(file, onReady);
}

export const MAP_CREDIT = 'Cartography by Isaac Stewart';
