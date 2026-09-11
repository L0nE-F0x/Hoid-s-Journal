/**
 * Procedural equirectangular plates for the atlas panel. No Three — the UI
 * cannot import the renderer, so this is the CPU twin of
 * `render/planetBake.ts`. Both read `recipes.ts` and follow the same three
 * steps, so a continent sits in the same place on the plate and on the globe:
 *
 *   1. a continental field from the blob geography plus low-frequency noise
 *   2. the coast as a level set of that field, and nothing else
 *   3. elevation as its own field, masked to land and faded in from the shore
 *
 * Only the octave count differs. Sampling 3-D noise on the sphere (rather than
 * 2-D noise on the plate) is what keeps the poles from ringing.
 */
import { recipeFor, type Blob, type Recipe } from './recipes.ts';

function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Trilinear value noise. Cheap, and smooth enough at these frequencies. */
function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  const c = (dx: number, dy: number, dz: number) => hash3(ix + dx, iy + dy, iz + dz);
  const x00 = c(0, 0, 0) + (c(1, 0, 0) - c(0, 0, 0)) * ux;
  const x10 = c(0, 1, 0) + (c(1, 1, 0) - c(0, 1, 0)) * ux;
  const x01 = c(0, 0, 1) + (c(1, 0, 1) - c(0, 0, 1)) * ux;
  const x11 = c(0, 1, 1) + (c(1, 1, 1) - c(0, 1, 1)) * ux;
  const y0 = x00 + (x10 - x00) * uy;
  const y1 = x01 + (x11 - x01) * uy;
  return y0 + (y1 - y0) * uz;
}

function fbm3(x: number, y: number, z: number, oct = 4): number {
  let v = 0;
  let a = 0.5;
  let f = 1;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    v += a * noise3(x * f, y * f, z * f);
    norm += a;
    a *= 0.5;
    f *= 2.05;
  }
  return v / norm;
}

function ridged3(x: number, y: number, z: number, oct = 4): number {
  let v = 0;
  let a = 0.5;
  let f = 1;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(noise3(x * f, y * f, z * f) * 2 - 1);
    v += a * n * n;
    norm += a;
    a *= 0.5;
    f *= 2.07;
  }
  return v / norm;
}

/** Domain-warped fbm: the swirl that keeps a coastline off a grid. */
function warped3(x: number, y: number, z: number, oct: number, amount: number): number {
  const wx = fbm3(x, y, z, 3) - 0.5;
  const wy = fbm3(x + 5.2, y + 5.2, z + 5.2, 3) - 0.5;
  const wz = fbm3(x + 11.7, y + 11.7, z + 11.7, 3) - 0.5;
  return fbm3(x + wx * amount * 2, y + wy * amount * 2, z + wz * amount * 2, oct);
}

function mix(a: number[], b: number[], t: number): number[] {
  const k = Math.max(0, Math.min(1, t));
  return [a[0]! + (b[0]! - a[0]!) * k, a[1]! + (b[1]! - a[1]!) * k, a[2]! + (b[2]! - a[2]!) * k];
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function rgb(h: string): number[] {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

function shapeAt(blobs: Blob[], u: number, v: number): number {
  let m = 0;
  for (const [cu, cv, ru, rv, w] of blobs) {
    let du = Math.abs(u - cu);
    du = Math.min(du, 1 - du);
    const dv = (v - cv) / rv;
    const d = (du / ru) ** 2 + dv * dv;
    m += w * Math.exp(-(d ** 1.8) * 0.5);
  }
  return m;
}

const BEAD = rgb('#0e0a1b');
const BEAD2 = rgb('#362162');
const GLINT = rgb('#bdaaff');
const GLASS = rgb('#4d5978');
const GLASS2 = rgb('#222b45');

const canvasCache = new Map<string, HTMLCanvasElement>();

export function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return (h % 97) + 1;
}

/**
 * `cognitive` bakes the Shadesmar reading of the same landmass: the Physical
 * Realm's land is a bead ocean over there, and its seas are glass plains.
 */
export function bakePlanetMap(
  kind: string, seed = 1, W = 1024, H = 512, cognitive = false,
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
  const r: Recipe & { ice: number; lights: number; ridges: number; rivers: number; flora: number } =
    recipeFor(kind);
  const s = seed * 17.13;

  const land = rgb(r.land);
  const land2 = rgb(r.land2);
  const land3 = rgb(r.land3 ?? r.land2);
  const ocean = rgb(r.ocean);
  const oceanDeep = rgb(r.oceanDeep ?? r.ocean);
  const cap = rgb(r.cap ?? '#e2e8f0');
  const wedges = (r.wedges ?? []).map(rgb);
  const blobs = r.shape ?? [];
  const thr = blobs.length ? 0.5 : r.threshold;

  for (let y = 0; y < H; y++) {
    const v = y / H;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);
    const polar = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const lon = u * Math.PI * 2;
      const px = Math.cos(lon) * cosLat;
      const py = Math.sin(lat);
      const pz = Math.sin(lon) * cosLat;
      const qx = px * r.warp + s * 1.7;
      const qy = py * r.warp + s * 1.7;
      const qz = pz * r.warp + s * 1.7;

      // --- 1. continental field -----------------------------------------
      let c: number;
      if (r.bands) {
        const shear = fbm3(px * 1.4 + s, py * 7 + s, pz * 1.4, 4) * 2 - 1;
        c = Math.max(0, Math.min(1, (0.5 + 0.5 * Math.sin(v * 26 + shear * 4.6 + s)) * 0.7
          + (0.5 + 0.5 * Math.sin(v * 72 + shear * 8)) * 0.16));
      } else if (blobs.length) {
        const bays = warped3(qx * 0.5, qy * 0.5, qz * 0.5, 3, 0.42) * 2 - 1;
        const shore = fbm3(qx * 1.8, qy * 1.8, qz * 1.8, 3) * 2 - 1;
        c = Math.max(0, Math.min(1.4,
          Math.min(1.32, shapeAt(blobs, u, v)) * 0.8 + bays * 0.19 + shore * 0.075));
      } else {
        c = warped3(qx * 1.25, qy * 1.25, qz * 1.25, 4, 0.5);
      }

      // --- 2. coast ------------------------------------------------------
      const coast = r.bands ? 0.10 : 0.008;
      const water = r.bands ? 0 : 1 - smoothstep(thr - coast, thr + coast, c);
      const isLand = 1 - water;

      // --- 3. elevation ---------------------------------------------------
      const inland = smoothstep(0, 0.11, c - thr);
      const rolling = fbm3(qx * 0.95 + 41, qy * 0.95 + 41, qz * 0.95 + 41, 4);
      const chain = ridged3(qx * 0.72 + 13, qy * 0.72 + 13, qz * 0.72 + 13, 4);
      const spur = ridged3(qx * 2.1 + 29, qy * 2.1 + 29, qz * 2.1 + 29, 3);
      const ranges = chain ** 6 + spur ** 7 * 0.35;
      const up = Math.min(1.2, inland * (0.05 + rolling * 0.24 + ranges * r.ridges * 3.4));
      const floorH = fbm3(qx * 1.6 + 77, qy * 1.6 + 77, qz * 1.6 + 77, 4);

      let col: number[];
      if (cognitive) {
        const t = Math.min(1, Math.abs(c - thr) * 2.4);
        if (isLand) {
          col = mix(BEAD, BEAD2, t);
          if (hash3(px * 300, py * 300, pz * 300) > 0.974) col = mix(col, GLINT, 0.9);
        } else {
          col = mix(GLASS, GLASS2, t);
        }
      } else if (r.bands) {
        col = mix(mix(ocean, land, smoothstep(0.10, 0.58, c)), land3, smoothstep(0.58, 0.95, c));
      } else if (r.split) {
        const day = smoothstep(0.40, 0.60, 1 - Math.abs(((u + 0.25) % 1) - 0.5) * 2);
        col = mix(mix(ocean, oceanDeep, c * 0.7), mix(land, land3, smoothstep(0.05, 0.6, up)), day);
      } else if (r.terminator) {
        const heat = Math.exp(-((((u + 0.45) % 1) - 0.5) ** 2) * 40);
        col = mix(land, mix(land2, land3, smoothstep(0.05, 0.5, up)), heat);
        col = mix(col, ocean, smoothstep(0.5, 0.05, heat) * 0.6);
      } else if (wedges.length) {
        // Boundaries wander and bleed; hard stripes read as a beach ball.
        const drift = (warped3(px * 1.5 + s * 3, py * 1.5 + s * 3, pz * 1.5 + s * 3, 4, 0.8) - 0.5) * 0.20;
        const w = (u + drift) * wedges.length;
        const i0 = Math.floor(((w % wedges.length) + wedges.length) % wedges.length);
        const sea = mix(wedges[i0]!, wedges[(i0 + 1) % wedges.length]!,
          smoothstep(0.34, 1, w - Math.floor(w)));
        const grain = fbm3(px * 22 + s, py * 22 + s, pz * 22 + s, 4);
        const swirl = warped3(px * 6 + s, py * 6 + s, pz * 6 + s, 4, 0.9);
        const k = 0.70 + 0.38 * grain + 0.22 * swirl;
        col = isLand
          ? mix(land, land3, smoothstep(0.05, 0.5, up))
          : [sea[0]! * k, sea[1]! * k, sea[2]! * k];
      } else {
        const deep = Math.min(1, Math.max(0, (thr - c) * 2) * (0.55 + 0.75 * (1 - floorH)));
        let sea = mix(ocean, oceanDeep, deep);
        sea = mix(mix(ocean, land, 0.34), sea, smoothstep(0, 0.06, thr - c));
        let ground = mix(land, land2, smoothstep(0.02, 0.30, up));
        ground = mix(ground, land3, smoothstep(0.52, 0.95, up));
        if (r.flora) {
          const veg = warped3(qx * 0.42 + 12, qy * 0.42 + 12, qz * 0.42 + 12, 4, 0.7);
          const wet = smoothstep(0.92, 0.20, polar) * smoothstep(0.70, 0.10, up);
          ground = mix(ground, [ground[0]! * 0.62, ground[1]! * 1.26, ground[2]! * 0.68],
            smoothstep(0.24, 0.74, veg) * r.flora * wet);
        }
        const dry = warped3(qx * 0.42 + 91, qy * 0.42 + 91, qz * 0.42 + 91, 3, 0.5);
        const k = 0.84 + 0.30 * dry;
        ground = [ground[0]! * k, ground[1]! * k, ground[2]! * k];
        col = mix(sea, ground, isLand);
      }

      if (!cognitive) {
        if (r.fain) {
          const f = warped3(px * 5 + s * 4, py * 5 + s * 4, pz * 5 + s * 4, 4, 0.8);
          col = mix(col, rgb('#87f0a6'), smoothstep(0.50, 0.82, f) * isLand * 0.6);
        }
        if (r.hion) {
          const gx = Math.abs(((px * 6 + s) % 1 + 1) % 1 - 0.5);
          const gz = Math.abs(((pz * 6 + s) % 1 + 1) % 1 - 0.5);
          const line = smoothstep(0.030, 0, Math.min(gx, gz));
          col = mix(col, u < 0.5 ? rgb('#22d3ee') : rgb('#e879f9'), line * 0.9);
        }
        if (r.ice) {
          const edge = 0.955 - r.ice * 0.13;
          const wobble = (warped3(px * 3.6 + s, py * 3.6 + s, pz * 3.6 + s, 3, 0.5) - 0.5) * 0.11;
          const capPolar = smoothstep(edge, edge + 0.05, polar + wobble);
          const snow = smoothstep(0.58, 0.88, up) * isLand * smoothstep(0.18, 0.62, polar) * r.ice * 0.85;
          col = mix(col, cap, Math.max(capPolar, snow));
        }
      }

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
