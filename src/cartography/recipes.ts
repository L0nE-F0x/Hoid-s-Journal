/**
 * One recipe per world. Read by both bakers, so the globe and the atlas plate
 * cannot disagree about where a continent is:
 *
 *   `render/planetBake.ts`      GPU, 2048×1024, every octave we can afford
 *   `cartography/planetMap.ts`  CPU, for the atlas panel (no Three in the UI)
 *
 * Style is painterly cartography, not photoreal Earth. The shapes are ours;
 * the relative geography is the books'.
 */

/** A landmass: centre u, centre v, half-width, half-height, weight. */
export type Blob = [number, number, number, number, number];

export interface Recipe {
  /** Lowland, upland and peak. Elevation ramps through all three. */
  land: string;
  land2: string;
  land3?: string;
  ocean: string;
  oceanDeep?: string;
  /** Coast line on the elevation field. Shaped worlds always cut at 0.5. */
  threshold: number;
  /** Domain-warp strength of the continental noise. */
  warp: number;
  shape?: Blob[];
  bands?: boolean;
  split?: boolean;
  wedges?: string[];
  hion?: boolean;
  terminator?: boolean;
  fain?: boolean;
  /** Polar cap colour. Ice by default; ash worlds have no white left. */
  cap?: string;
  /** 0 = no caps. Drives both the plate and the globe shader. */
  ice?: number;
  /** Night-side settlement glow, 0–1. */
  lights?: number;
  lightColor?: string;
  /** Cloud deck coverage, 0–1. */
  clouds?: number;
  cloudTint?: string;
  /** Sun glint on water, 0–1. */
  specular?: number;
  /** Normal-map strength on the globe. */
  relief?: number;
  /** Mountain-chain weight in the elevation field. */
  ridges?: number;
  /** River carving, 0–1. */
  rivers?: number;
  /** Burning terminator (tidally locked worlds). */
  tidal?: number;
  /** Vegetation mottling strength. */
  flora?: number;
}

export const RECIPES: Record<string, Recipe> = {
  // Roshar: one supercontinent shaped like a highstorm's own fractal, Shinovar
  // sheltered at its western edge, the Shattered Plains east, Thaylenah and
  // the Reshi Isles offshore. Stone, not soil — crem-brown and slate.
  roshar: {
    land: '#7d6544', land2: '#ab9067', land3: '#dcd0b6',
    ocean: '#1d5468', oceanDeep: '#0a2a3c',
    threshold: 0.44, warp: 3.1, ridges: 0.55, rivers: 0.35, relief: 1.15,
    clouds: 0.34, cloudTint: '#dceaf6', specular: 0.85, ice: 0.42, flora: 0.55,
    cap: '#dbe8f2',
    shape: [
      [0.58, 0.54, 0.34, 0.26, 1.10], [0.84, 0.50, 0.22, 0.21, 1.00],
      [0.34, 0.60, 0.17, 0.16, 0.92], [0.24, 0.42, 0.12, 0.13, 0.86],
      [0.95, 0.52, 0.11, 0.13, 0.82], [0.62, 0.82, 0.055, 0.050, 0.80],
      [0.10, 0.52, 0.045, 0.055, 0.84], [0.745, 0.28, 0.075, 0.062, 0.80],
      [0.497, 0.198, 0.035, 0.030, 0.60], [0.669, 0.533, 0.060, 0.052, 0.62],
      [0.313, 0.187, 0.070, 0.060, 0.72], [0.419, 0.279, 0.055, 0.048, 0.64],
    ],
  },
  // The Final Empire: one ash-choked landmass, Terris in the far north. No
  // white at the poles — the ash got there first.
  'scadrial-ash': {
    land: '#4e463d', land2: '#6b6053', land3: '#8b7f6f',
    ocean: '#3b3630', oceanDeep: '#26221e',
    threshold: 0.62, warp: 1.8, ridges: 0.62, rivers: 0.18, relief: 1.0,
    clouds: 0.62, cloudTint: '#9c9086', specular: 0.16, ice: 0.0, flora: 0.05,
    cap: '#6e6459', lights: 0.35, lightColor: '#ffb066',
    shape: [
      [0.47, 0.46, 0.20, 0.16, 1.05], [0.60, 0.29, 0.10, 0.09, 0.80],
      [0.44, 0.62, 0.09, 0.08, 0.75], [0.488, 0.096, 0.055, 0.042, 0.66],
      [0.273, 0.302, 0.048, 0.042, 0.60],
    ],
  },
  // After the Catacendre: the Basin, the Roughs beyond it, and the Southern
  // Continent the Malwish came from. Harmony gave it back its green.
  'scadrial-basin': {
    land: '#456237', land2: '#829a56', land3: '#c3bda4',
    ocean: '#245a7d', oceanDeep: '#0d2b48',
    threshold: 0.48, warp: 2.0, ridges: 0.48, rivers: 0.55, relief: 1.0,
    clouds: 0.40, cloudTint: '#e8f0fa', specular: 0.9, ice: 0.34, flora: 0.55,
    lights: 0.95, lightColor: '#ffd79a',
    shape: [
      [0.50, 0.47, 0.18, 0.15, 1.05], [0.76, 0.33, 0.15, 0.13, 0.95],
      [0.60, 0.69, 0.09, 0.08, 0.80], [0.52, 0.82, 0.14, 0.09, 0.90],
      [0.201, 0.667, 0.050, 0.042, 0.62],
    ],
  },
  // Hallandren on the coast, Idris in the highlands north of it. The colour
  // is the point.
  nalthis: {
    land: '#2f6f3d', land2: '#8f8a52', land3: '#e8dcb4',
    ocean: '#1f6a8c', oceanDeep: '#0b3a58',
    threshold: 0.44, warp: 2.4, ridges: 0.50, rivers: 0.60, relief: 1.0,
    clouds: 0.45, cloudTint: '#f2eef2', specular: 0.95, ice: 0.30, flora: 0.70,
    lights: 0.55, lightColor: '#ff9ccb',
    shape: [
      [0.56, 0.60, 0.17, 0.15, 1.05], [0.49, 0.29, 0.10, 0.09, 0.85],
      [0.66, 0.71, 0.11, 0.09, 0.85], [0.585, 0.675, 0.040, 0.034, 0.58],
    ],
  },
  // Tidally locked between a white dwarf and a blue-white supergiant. Dayside
  // is sand; Darkside is electric light under a sky that never turns.
  taldain: {
    land: '#e8c878', land2: '#c9a24a', land3: '#fff3cf',
    ocean: '#0f1220', oceanDeep: '#05060e',
    threshold: 0.5, warp: 1.6, ridges: 0.30, relief: 0.85, split: true,
    clouds: 0.10, cloudTint: '#f6f0e2', specular: 0.2, ice: 0,
    lights: 0.8, lightColor: '#8fd8ff', tidal: 0.9,
  },
  // Arelon and Fjorden on one mass; Teod its own peninsula to the north.
  sel: {
    land: '#5a5077', land2: '#9086b8', land3: '#e2d8f2',
    ocean: '#264080', oceanDeep: '#0e1c44',
    threshold: 0.47, warp: 2.2, ridges: 0.52, rivers: 0.45, relief: 1.0,
    clouds: 0.38, cloudTint: '#eceaf4', specular: 0.9, ice: 0.36, flora: 0.40,
    lights: 0.5, lightColor: '#c9b6ff',
    shape: [
      [0.52, 0.47, 0.20, 0.14, 1.05], [0.72, 0.41, 0.14, 0.12, 0.95],
      [0.60, 0.62, 0.09, 0.08, 0.75], [0.22, 0.28, 0.07, 0.07, 0.90],
      [0.54, 0.52, 0.060, 0.048, 0.60],
    ],
  },
  // The Homeland and the Forests, one continent with a long coast. Everything
  // here is the colour of a thing that has stopped growing.
  threnody: {
    land: '#1f3122', land2: '#334532', land3: '#5d6a55',
    ocean: '#16223a', oceanDeep: '#080d18',
    threshold: 0.52, warp: 3.0, ridges: 0.40, rivers: 0.30, relief: 1.0,
    clouds: 0.30, cloudTint: '#8e9aa8', specular: 0.45, ice: 0.22, flora: 0.62,
    lights: 0.10, lightColor: '#9df5b5',
    shape: [[0.47, 0.50, 0.19, 0.17, 1.05], [0.41, 0.59, 0.09, 0.08, 0.7]],
  },
  // Twelve seas of aether spore, one under each geostationary moon. No land
  // to speak of — just rocks, and the rocks are where people live.
  lumar: {
    land: '#4a4036', land2: '#6b5c4a', land3: '#9c8d78',
    ocean: '#0d4a38', oceanDeep: '#052b20',
    threshold: 0.80, warp: 1.4, ridges: 0.35, relief: 0.7, specular: 0.5,
    clouds: 0.22, cloudTint: '#dff5e6', ice: 0, lights: 0.25, lightColor: '#a7f3d0',
    wedges: [
      '#2fbd7e', '#e0466a', '#25c4dd', '#9a4df0', '#f0b92a', '#f06a86',
      '#5f6b82', '#24c9b4', '#f07a2a', '#7c8cf5', '#d9c22a', '#ef77b4',
    ],
  },
  // The sun is close enough to melt the crust. Everything runs.
  canticle: {
    land: '#1c1917', land2: '#7c2d12', land3: '#fbbf24',
    ocean: '#0c0a09', oceanDeep: '#050403',
    threshold: 0.55, warp: 1.8, ridges: 0.7, relief: 1.2, terminator: true,
    clouds: 0.18, cloudTint: '#f8b184', specular: 0.05, ice: 0,
    lights: 0.3, lightColor: '#ff8c3a', tidal: 1.0,
  },
  // A world under a shroud, lit only by magenta and cyan hion lines.
  komashi: {
    land: '#0d1424', land2: '#18213a', land3: '#2c3557',
    ocean: '#020617', oceanDeep: '#01030c',
    threshold: 0.6, warp: 1.6, ridges: 0.5, relief: 0.95, hion: true,
    clouds: 0.72, cloudTint: '#2a3350', specular: 0.25, ice: 0.1,
    lights: 1.0, lightColor: '#5de7ff',
    shape: [[0.50, 0.50, 0.24, 0.18, 1.05], [0.63, 0.48, 0.10, 0.09, 0.6]],
  },
  // Yolen: white stone and the pale green creep of fain life over it.
  yolen: {
    land: '#b8b4ab', land2: '#d3cfc6', land3: '#f4f1ea',
    ocean: '#2f4f68', oceanDeep: '#13283a',
    threshold: 0.5, warp: 2.3, ridges: 0.55, rivers: 0.40, relief: 1.0,
    fain: true, clouds: 0.42, cloudTint: '#eef5ea', specular: 0.85,
    ice: 0.45, flora: 0.50, lights: 0.2, lightColor: '#bef264',
    shape: [[0.38, 0.44, 0.17, 0.16, 1.0], [0.68, 0.56, 0.14, 0.14, 0.95]],
  },
  // Ashyn: what Surgebinding does to a world when nobody says the Words.
  ashyn: {
    land: '#7c2d12', land2: '#fbbf24', land3: '#fde68a',
    ocean: '#1c1917', oceanDeep: '#0a0806',
    threshold: 0.5, warp: 2.8, ridges: 0.65, relief: 1.1,
    clouds: 0.55, cloudTint: '#f3c58a', specular: 0.12, ice: 0.05, flora: 0.05,
  },
  // Braize. Cold, dark, and a prison.
  braize: {
    land: '#3b1414', land2: '#190909', land3: '#5a2323',
    ocean: '#0c0a09', oceanDeep: '#040303',
    threshold: 0.7, warp: 2.0, ridges: 0.75, relief: 1.25,
    clouds: 0.12, cloudTint: '#6b4040', specular: 0.02, ice: 0.28, cap: '#6b5a5a',
  },
  // The Pantheon: an archipelago, and nothing else for a long way.
  'first-sun': {
    land: '#1e7440', land2: '#8a6a24', land3: '#e0d7ab',
    ocean: '#106a86', oceanDeep: '#063648',
    threshold: 0.58, warp: 3.4, ridges: 0.45, rivers: 0.2, relief: 0.9,
    clouds: 0.52, cloudTint: '#eaf7ff', specular: 1.0, ice: 0.05, flora: 0.85,
    lights: 0.12, lightColor: '#86efac',
    shape: [
      [0.52, 0.50, 0.045, 0.05, 1.0], [0.58, 0.44, 0.035, 0.04, 0.95],
      [0.46, 0.44, 0.028, 0.032, 0.9], [0.57, 0.57, 0.03, 0.034, 0.9],
      [0.44, 0.56, 0.025, 0.03, 0.85], [0.63, 0.51, 0.022, 0.026, 0.8],
      [0.38, 0.49, 0.02, 0.024, 0.8], [0.28, 0.62, 0.030, 0.030, 0.7],
    ],
  },
  // Neutral on purpose. Ten gas giants share three bakes and are told apart
  // by a per-world tint in the planet shader; a blue plate multiplied by a
  // green tint is murk, not a green world.
  gas: {
    land: '#c2ccdb', land2: '#78808f', land3: '#eef3fa',
    ocean: '#39414f', oceanDeep: '#222833',
    threshold: 0.5, warp: 0.8, bands: true, relief: 0.25, ridges: 0,
    clouds: 0, specular: 0, ice: 0,
  },
  barren: {
    land: '#4e4a45', land2: '#6b6560', land3: '#938c86',
    ocean: '#232020', oceanDeep: '#121010',
    threshold: 0.55, warp: 1.7, ridges: 0.8, relief: 1.35,
    clouds: 0.03, cloudTint: '#8b857f', specular: 0.02, ice: 0.18, cap: '#c8c4bd',
  },
  oceanic: {
    land: '#1a5c33', land2: '#4f7a2c', land3: '#b9c49c',
    ocean: '#12697f', oceanDeep: '#073246',
    threshold: 0.66, warp: 2.6, ridges: 0.4, rivers: 0.4, relief: 0.95,
    clouds: 0.58, cloudTint: '#eef7ff', specular: 1.0, ice: 0.40, flora: 0.75,
    lights: 0.2, lightColor: '#a7f3d0',
  },
};

const DEFAULTS: Required<Pick<Recipe,
  'ice' | 'lights' | 'clouds' | 'specular' | 'relief' | 'ridges' | 'rivers' | 'tidal' | 'flora'>> = {
  ice: 0, lights: 0, clouds: 0, specular: 0.5, relief: 1, ridges: 0.4, rivers: 0, tidal: 0, flora: 0,
};

export function recipeFor(kind: string): Recipe & typeof DEFAULTS {
  const r = RECIPES[kind] ?? RECIPES.barren!;
  return { ...DEFAULTS, ...r };
}
