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

interface Recipe {
  land: number[];
  land2: number[];
  ocean: number[];
  threshold: number;
  warp: number;
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
  roshar: { land: rgb('#b08958'), land2: rgb('#6e4e32'), ocean: rgb('#1c3d48'), threshold: 0.50, warp: 2.8 },
  'scadrial-ash': { land: rgb('#5b5248'), land2: rgb('#3a332c'), ocean: rgb('#46413b'), threshold: 0.62, warp: 1.6, cap: rgb('#6e6459') },
  'scadrial-basin': { land: rgb('#4a6b3a'), land2: rgb('#6a8a4a'), ocean: rgb('#2a4a6a'), threshold: 0.48, warp: 1.8, lights: true },
  nalthis: { land: rgb('#2d6a3a'), land2: rgb('#c45a8a'), ocean: rgb('#2a6a8a'), threshold: 0.44, warp: 2.2 },
  taldain: { land: rgb('#e8c878'), land2: rgb('#c9a24a'), ocean: rgb('#0f1220'), threshold: 0.5, warp: 1.4, split: true },
  sel: { land: rgb('#6a5a8a'), land2: rgb('#8a7ab0'), ocean: rgb('#2a3a6a'), threshold: 0.47, warp: 2.0 },
  threnody: { land: rgb('#1a2a1a'), land2: rgb('#0d140d'), ocean: rgb('#111827'), threshold: 0.52, warp: 2.8 },
  lumar: { land: rgb('#14532d'), land2: rgb('#166534'), ocean: rgb('#064e3b'), threshold: 0.72, warp: 1.2, wedges: ['#34d399', '#f43f5e', '#22d3ee', '#a855f7', '#fbbf24', '#fb7185', '#64748b', '#2dd4bf', '#f97316', '#818cf8', '#eab308', '#f472b6'].map(rgb) },
  canticle: { land: rgb('#1c1917'), land2: rgb('#7c2d12'), ocean: rgb('#0c0a09'), threshold: 0.55, warp: 1.6, terminator: true },
  komashi: { land: rgb('#0b1020'), land2: rgb('#111827'), ocean: rgb('#020617'), threshold: 0.6, warp: 1.4, hion: true },
  yolen: { land: rgb('#d6d3d1'), land2: rgb('#a8a29e'), ocean: rgb('#334155'), threshold: 0.5, warp: 2.1, fain: true },
  ashyn: { land: rgb('#7c2d12'), land2: rgb('#fbbf24'), ocean: rgb('#1c1917'), threshold: 0.5, warp: 2.6 },
  braize: { land: rgb('#3f1212'), land2: rgb('#1c0a0a'), ocean: rgb('#0c0a09'), threshold: 0.7, warp: 1.8 },
  'first-sun': { land: rgb('#166534'), land2: rgb('#854d0e'), ocean: rgb('#0e4a5c'), threshold: 0.58, warp: 3.2 },
  gas: { land: rgb('#3b82f6'), land2: rgb('#1e3a8a'), ocean: rgb('#0f172a'), threshold: 0.5, warp: 0.6, bands: true },
  barren: { land: rgb('#57534e'), land2: rgb('#292524'), ocean: rgb('#1c1917'), threshold: 0.55, warp: 1.5 },
  oceanic: { land: rgb('#14532d'), land2: rgb('#365314'), ocean: rgb('#164e63'), threshold: 0.62, warp: 2.4 },
};

const canvasCache = new Map<string, HTMLCanvasElement>();

export function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return (h % 97) + 1;
}

export function bakePlanetMap(kind: BiomeKind, seed = 1, W = 1024, H = 512): HTMLCanvasElement {
  const key = `${kind}:${seed}:${W}x${H}`;
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

      let col: number[];
      if (r.wedges) {
        const sea = r.wedges[Math.floor(u * r.wedges.length) % r.wedges.length]!;
        col = n > r.threshold ? mix(r.land, r.land2, n) : sea;
      } else if (r.split) {
        col = u < 0.5 ? mix(r.land, r.land2, n) : mix(r.ocean, rgb('#020617'), n * 0.5);
      } else if (r.terminator) {
        const heat = Math.exp(-((u - 0.55) ** 2) * 40);
        col = mix(mix(r.land, rgb('#fb923c'), heat), rgb('#7c2d12'), n * 0.4);
      } else {
        col = n > r.threshold ? mix(r.land, r.land2, (n - r.threshold) * 2) : r.ocean;
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
