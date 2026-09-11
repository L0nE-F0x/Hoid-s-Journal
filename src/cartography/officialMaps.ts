/**
 * Isaac Stewart cartography, shown in the atlas with credit.
 * Globe textures stay procedural — these plates are not equirectangular.
 */
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

export function worldMapFile(bodyId: string, era: number, cognitive: boolean): string | null {
  if (bodyId === 'roshar') return cognitive ? 'Shadesmar_full.jpg' : 'roshar_full.jpg';
  if (bodyId === 'scadrial') {
    if (cognitive) return null;
    return era >= 3 ? 'elendel_basin.png' : 'final_empire.jpg';
  }
  return null;
}

export function cityMapFile(locationId: string): string | null {
  const files: Record<string, string> = {
    urithiru: 'urithiru.jpg',
    kholinar: 'Kholinar.jpg',
    kharbranth: 'kharbranth.jpg',
    'thaylen-city': 'thaylen_city.jpg',
    'shattered-plains': 'shattered_plains.jpg',
    narak: 'shattered_plains.jpg',
    luthadel: 'luthadel.jpg',
    elendel: 'elendel.jpg',
    fadrex: 'fadrex.jpg',
    urteau: 'urteau.jpg',
    'new-seran': 'new_seran.png',
  };
  return files[locationId] ?? null;
}

export function getOfficialMap(
  file: string | null, onReady: () => void,
): HTMLImageElement | null {
  if (!file) return null;
  return load(file, onReady);
}

export const MAP_CREDIT = 'Cartography by Isaac Stewart';
