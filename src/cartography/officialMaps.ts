/**
 * Isaac Stewart cartography, shown in the atlas with credit.
 * Globe textures stay procedural — these plates are not equirectangular.
 */
import { isVisible, scadrialIsBasin } from '../data/index.ts';

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

export function worldMapFile(
  bodyId: string, era: number, cognitive: boolean, layer = 0, year?: number, progress?: Record<string, number>,
): string | null {
  const layers = worldMapLayers(bodyId, era, cognitive, year, progress);
  if (!layers.length) return null;
  return layers[Math.min(layer, layers.length - 1)]!.file;
}

export interface MapLayer {
  name: string;
  file: string;
  /** Who made this plate, when it is not Isaac Stewart's cartography. */
  credit?: string;
  /**
   * The book whose events the drawing itself shows. A plate is art, and some
   * of it is annotated: Thaylen City's survey is Navani's map of a battle.
   * A reader short of this book gets the plate's other layers, or the
   * procedural plan, as a city with no Stewart plate does.
   */
  book?: string;
  arc?: string;
}

const CITY_LAYERS: Record<string, MapLayer[]> = {
  urithiru: [{ name: 'Tower', file: 'urithiru.jpg' }],
  kholinar: [{ name: 'City', file: 'Kholinar.jpg' }],
  kharbranth: [{ name: 'City', file: 'kharbranth.jpg' }],
  // "Rough map of the Battle of Thaylen Field. Annotated by Navani Kholin":
  // where the enemy fleet landed, where the wall broke, where the Thrill came
  // out of the sea. Oathbringer's climax, printed on the city's only plate.
  'thaylen-city': [{ name: 'City', file: 'thaylen_city.jpg', book: 'stormlight', arc: 'oathbringer' }],
  // The radial sketch is Shallan's Words of Radiance map ("Mapped on the
  // journey to the center", "Mapped while lost in the chasms"; Coppermind
  // files it as Shattered_Plains_WoR_map). The symmetry it shows is that
  // book's discovery, so a Way of Kings reader keeps the other two layers.
  'shattered-plains': [
    { name: 'Plains', file: 'shattered_plains.jpg' },
    { name: 'Warcamps', file: 'warcamps.jpg' },
    { name: 'Detail', file: 'shattered_plains2.jpg', book: 'stormlight', arc: 'wor' },
  ],
  // The radial sketch is the only plate whose centre is Narak itself.
  narak: [
    { name: 'Plains', file: 'shattered_plains.jpg' },
    { name: 'Warcamps', file: 'warcamps.jpg' },
    { name: 'Detail', file: 'shattered_plains2.jpg', book: 'stormlight', arc: 'wor' },
  ],
  luthadel: [
    { name: 'Survey', file: 'luthadel.jpg' },
    { name: 'Endpaper', file: 'luthadel_endpaper.png' },
    // A painting, signed "E MONTEIRO" in its corner, not a Stewart map.
    { name: 'Kredik Shaw', file: 'kredik_shaw.jpg', credit: 'Painting by E. Monteiro' },
  ],
  elendel: [
    { name: 'Basin', file: 'elendel.jpg' },
    // The survey as printed with The Lost Metal: it marks places from across
    // the whole Wax and Wayne era, so it waits for the book it came in.
    { name: 'Lost Metal', file: 'elendel_lost_metal.jpeg', book: 'mistborn2', arc: 'tlm' },
  ],
  fadrex: [{ name: 'City', file: 'fadrex.jpg' }],
  urteau: [{ name: 'City', file: 'urteau.jpg' }],
  'new-seran': [{ name: 'City', file: 'new_seran.png' }],
};

/** A city's plates, without the ones whose drawing is ahead of the reader. */
export function cityMapLayers(locationId: string, progress?: Record<string, number>): MapLayer[] {
  const layers = CITY_LAYERS[locationId] ?? [];
  return progress ? layers.filter((l) => !l.book || isVisible(l, progress)) : layers;
}

export function cityMapFile(locationId: string, layer = 0, progress?: Record<string, number>): string | null {
  const layers = cityMapLayers(locationId, progress);
  if (!layers.length) return null;
  return layers[Math.min(layer, layers.length - 1)]!.file;
}

export function worldMapLayers(
  bodyId: string, era: number, cognitive: boolean, year?: number, progress?: Record<string, number>,
): MapLayer[] {
  if (bodyId === 'roshar') {
    return cognitive
      ? [{ name: 'Shadesmar', file: 'Shadesmar_full.jpg' }]
      : [{ name: 'Roshar', file: 'roshar_full.jpg' }];
  }
  if (bodyId === 'scadrial' && !cognitive) {
    return scadrialIsBasin(era, year, progress)
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
