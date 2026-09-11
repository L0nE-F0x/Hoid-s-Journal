/**
 * Procedural equirectangular maps. No Three — the renderer wraps these in
 * textures, the atlas UI draws them straight onto a canvas.
 */
import type { BiomeKind } from '../data/types.ts';

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, oct = 5): number {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise(x * f, y * f);
    a *= 0.5;
    f *= 2.05;
  }
  return v;
}

function mix(a: number[], b: number[], t: number): number[] {
  return [a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t, a[2]! + (b[2]! - a[2]!) * t];
}

function rgb(h: string): number[] {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

/** A landmass: centre u, centre v, half-width, half-height, weight. */
type Blob = [number, number, number, number, number];

/**
 * Continents, not noise. Each entry places a landmass where this world's
 * places actually are, and the noise supplies the coastline. Original
 * cartography: the shapes are ours, the relative geography is the books'.
 */
function shapeAt(blobs: Blob[], u: number, v: number): number {
  let m = 0;
  for (const [cu, cv, ru, rv, w] of blobs) {
    let du = Math.abs(u - cu);
    du = Math.min(du, 1 - du);
    const dv = (v - cv) / rv;
    const d = (du / ru) ** 2 + dv * dv;
    m += w * Math.exp(-d * 1.45);
  }
  return m;
}

interface Recipe {
  land: number[];
  land2: number[];
  ocean: number[];
  threshold: number;
  warp: number;
  shape?: Blob[];
  bands?: boolean;
  split?: boolean;
  wedges?: number[][];
  lights?: boolean;
  hion?: boolean;
  terminator?: boolean;
  fain?: boolean;
  /** Polar cap colour. Ice by default; ash worlds have no white left. */
  cap?: number[];
}

const RECIPES: Record<BiomeKind, Recipe> = {
  // Roshar: one supercontinent, Shinovar at its western edge, the Shattered
  // Plains east, Thaylenah and the Reshi Isles offshore.
  roshar: { land: rgb('#b08958'), land2: rgb('#6e4e32'), ocean: rgb('#1c3d48'), threshold: 0.50, warp: 2.8,
    shape: [
      [0.55, 0.55, 0.30, 0.23, 1.0], [0.82, 0.50, 0.18, 0.18, 0.95],
      [0.36, 0.62, 0.13, 0.12, 0.8], [0.24, 0.40, 0.09, 0.10, 0.75],
      [0.93, 0.52, 0.08, 0.10, 0.7], [0.62, 0.82, 0.05, 0.05, 0.85],
      [0.10, 0.52, 0.035, 0.045, 0.8], [0.745, 0.28, 0.05, 0.045, 0.7],
    ] },
  // The Final Empire: one ash-choked landmass, Terris in the far north.
  'scadrial-ash': { land: rgb('#5b5248'), land2: rgb('#3a332c'), ocean: rgb('#46413b'), threshold: 0.62, warp: 1.6, cap: rgb('#6e6459'),
    shape: [
      [0.47, 0.46, 0.20, 0.16, 1.05], [0.60, 0.29, 0.10, 0.09, 0.8],
      [0.44, 0.62, 0.09, 0.08, 0.75],
    ] },
  // After the Catacendre: the Basin, the Roughs beyond it, and the Southern
  // Continent the Malwish came from.
  'scadrial-basin': { land: rgb('#4a6b3a'), land2: rgb('#6a8a4a'), ocean: rgb('#2a4a6a'), threshold: 0.48, warp: 1.8, lights: true,
    shape: [
      [0.50, 0.47, 0.18, 0.15, 1.05], [0.76, 0.33, 0.15, 0.13, 0.95],
      [0.60, 0.69, 0.09, 0.08, 0.8], [0.52, 0.82, 0.14, 0.09, 0.9],
    ] },
  // Hallandren on the coast, Idris in the highlands north of it.
  nalthis: { land: rgb('#2d6a3a'), land2: rgb('#c45a8a'), ocean: rgb('#2a6a8a'), threshold: 0.44, warp: 2.2,
    shape: [
      [0.56, 0.60, 0.17, 0.15, 1.05], [0.49, 0.29, 0.10, 0.09, 0.85],
      [0.66, 0.71, 0.11, 0.09, 0.85],
    ] },
  taldain: { land: rgb('#e8c878'), land2: rgb('#c9a24a'), ocean: rgb('#0f1220'), threshold: 0.5, warp: 1.4, split: true },
  // Arelon and Fjorden on one mass; Teod is its own peninsula to the north.
  sel: { land: rgb('#6a5a8a'), land2: rgb('#8a7ab0'), ocean: rgb('#2a3a6a'), threshold: 0.47, warp: 2.0,
    shape: [
      [0.52, 0.47, 0.20, 0.14, 1.05], [0.72, 0.41, 0.14, 0.12, 0.95],
      [0.60, 0.62, 0.09, 0.08, 0.75], [0.22, 0.28, 0.07, 0.07, 0.9],
    ] },
  // The Homeland and the Forests, one continent with a long coast.
  threnody: { land: rgb('#1a2a1a'), land2: rgb('#0d140d'), ocean: rgb('#111827'), threshold: 0.52, warp: 2.8,
    shape: [[0.47, 0.50, 0.19, 0.17, 1.05], [0.41, 0.59, 0.09, 0.08, 0.7]] },
  lumar: { land: rgb('#14532d'), land2: rgb('#166534'), ocean: rgb('#064e3b'), threshold: 0.72, warp: 1.2, wedges: ['#34d399', '#f43f5e', '#22d3ee', '#a855f7', '#fbbf24', '#fb7185', '#64748b', '#2dd4bf', '#f97316', '#818cf8', '#eab308', '#f472b6'].map(rgb) },
  canticle: { land: rgb('#1c1917'), land2: rgb('#7c2d12'), ocean: rgb('#0c0a09'), threshold: 0.55, warp: 1.6, terminator: true },
  komashi: { land: rgb('#0b1020'), land2: rgb('#111827'), ocean: rgb('#020617'), threshold: 0.6, warp: 1.4, hion: true,
    shape: [[0.50, 0.50, 0.24, 0.18, 1.05], [0.63, 0.48, 0.10, 0.09, 0.6]] },
  yolen: { land: rgb('#d6d3d1'), land2: rgb('#a8a29e'), ocean: rgb('#334155'), threshold: 0.5, warp: 2.1, fain: true,
    shape: [[0.38, 0.44, 0.17, 0.16, 1.0], [0.68, 0.56, 0.14, 0.14, 0.95]] },
  ashyn: { land: rgb('#7c2d12'), land2: rgb('#fbbf24'), ocean: rgb('#1c1917'), threshold: 0.5, warp: 2.6 },
  braize: { land: rgb('#3f1212'), land2: rgb('#1c0a0a'), ocean: rgb('#0c0a09'), threshold: 0.7, warp: 1.8 },
  // The Pantheon: an archipelago, and nothing else for a long way.
  'first-sun': { land: rgb('#166534'), land2: rgb('#854d0e'), ocean: rgb('#0e4a5c'), threshold: 0.58, warp: 3.2,
    shape: [
      [0.52, 0.50, 0.045, 0.05, 1.0], [0.58, 0.44, 0.035, 0.04, 0.95],
      [0.46, 0.44, 0.028, 0.032, 0.9], [0.57, 0.57, 0.03, 0.034, 0.9],
      [0.44, 0.56, 0.025, 0.03, 0.85], [0.63, 0.51, 0.022, 0.026, 0.8],
      [0.38, 0.49, 0.02, 0.024, 0.8],
    ] },
  gas: { land: rgb('#3b82f6'), land2: rgb('#1e3a8a'), ocean: rgb('#0f172a'), threshold: 0.5, warp: 0.6, bands: true },
  barren: { land: rgb('#57534e'), land2: rgb('#292524'), ocean: rgb('#1c1917'), threshold: 0.55, warp: 1.5 },
  oceanic: { land: rgb('#14532d'), land2: rgb('#365314'), ocean: rgb('#164e63'), threshold: 0.62, warp: 2.4 },
};

const BEAD = rgb('#0a0714');
const BEAD2 = rgb('#2f1b57');
const GLINT = rgb('#b39dfb');
const GLASS = rgb('#73819e');
const GLASS2 = rgb('#3d4c69');

const canvasCache = new Map<string, HTMLCanvasElement>();

export function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return (h % 97) + 1;
}

/**
 * `cognitive` bakes the Shadesmar reading of the same landmass: the Physical
 * Realm's land is a bead ocean over there, and its seas are glass plains. Same
 * mask, different palette, so the map and the globe cannot disagree.
 */
export function bakePlanetMap(
  kind: BiomeKind, seed = 1, W = 1024, H = 512, cognitive = false,
): HTMLCanvasElement {
  const key = `${kind}:${seed}:${W}x${H}${cognitive ? ':c' : ''}`;
  const hit = canvasCache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const r = RECIPES[kind];
  const s = seed * 17.13;

  for (let y = 0; y < H; y++) {
    const v = y / H;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const lon = u * Math.PI * 2;
      const px = Math.cos(lon) * cosLat;
      const py = Math.sin(lat);
      const pz = Math.sin(lon) * cosLat;
      const nx = px * r.warp + s;
      const ny = py * r.warp + s * 1.7;
      const nz = pz * r.warp;

      let n = fbm(nx * 2.2 + nz, ny * 2.2, 5);
      if (r.bands) n = 0.5 + 0.5 * Math.sin(v * 28 + n * 4);
      if (r.shape) n = n * 0.5 + Math.min(1.2, shapeAt(r.shape, u, v)) * 0.62;

      const isLand = n > (r.shape ? 0.5 : r.threshold);
      if (cognitive) {
        const t = Math.min(1, Math.abs(n - (r.shape ? 0.5 : r.threshold)) * 2.4);
        let col: number[];
        if (isLand) {
          // Bead ocean: obsidian spheres, the odd one catching the light.
          col = mix(BEAD, BEAD2, t);
          if (hash(x * 1.7, y * 2.3) > 0.978) col = mix(col, GLINT, 0.85);
        } else {
          col = mix(GLASS, GLASS2, t);
        }
        const i0 = (y * W + x) * 4;
        d[i0] = col[0]!;
        d[i0 + 1] = col[1]!;
        d[i0 + 2] = col[2]!;
        d[i0 + 3] = 255;
        continue;
      }

      let col: number[];
      if (r.wedges) {
        const sea = r.wedges[Math.floor(u * r.wedges.length) % r.wedges.length]!;
        col = isLand ? mix(r.land, r.land2, n) : sea;
      } else if (r.split) {
        col = u < 0.5 ? mix(r.land, r.land2, n) : mix(r.ocean, rgb('#020617'), n * 0.5);
      } else if (r.terminator) {
        const heat = Math.exp(-((u - 0.55) ** 2) * 40);
        col = mix(mix(r.land, rgb('#fb923c'), heat), rgb('#7c2d12'), n * 0.4);
      } else {
        const thr = r.shape ? 0.5 : r.threshold;
        // Shelf to abyss, so an ocean is not one flat colour.
        col = isLand
          ? mix(r.land, r.land2, (n - thr) * 2)
          : mix(r.ocean, mix(r.ocean, [4, 6, 14], 0.55), Math.min(1, (thr - n) * 2.6));
      }

      if (r.fain && n > 0.62) col = mix(col, rgb('#86efac'), 0.45);
      if (r.hion) {
        const line = Math.abs(Math.sin(u * 40 + n * 6));
        if (line > 0.96) col = mix(col, u < 0.5 ? rgb('#22d3ee') : rgb('#e879f9'), 0.85);
      }
      if (r.lights && n > 0.58 && n < 0.64) col = mix(col, rgb('#fde68a'), 0.5);

      const polar = Math.abs(v - 0.5) * 2;
      if (polar > 0.82) col = mix(col, r.cap ?? rgb('#e2e8f0'), (polar - 0.82) / 0.18);

      const i = (y * W + x) * 4;
      d[i] = col[0]!;
      d[i + 1] = col[1]!;
      d[i + 2] = col[2]!;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  canvasCache.set(key, canvas);
  return canvas;
}
