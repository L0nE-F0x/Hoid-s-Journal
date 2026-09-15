/**
 * The atlas panel's plate for a world. No Three — the UI cannot import the
 * renderer — so this is the CPU twin of `render/planetBake.ts`, and it is a
 * deliberate line-for-line port of `shaders/planetBake.frag`.
 *
 * Line for line, because it was not. Both bakers read `recipes.ts` and both
 * followed the same three steps, but the noise underneath was different — the
 * shader on simplex, this on trilinear value noise — so "a continent sits in
 * the same place on the plate and on the globe" was an aspiration, not a
 * fact. On a world with `shape` blobs the blobs hid it; on a world without
 * them (Taldain, Braize, a gas giant) the two were drawing unrelated planets.
 * And the shader mixes in linear and lets the sRGB target encode on write,
 * while this mixed sRGB bytes, so even where the shapes agreed the colours
 * did not.
 *
 * `npm run test:cartography` holds the two together now. Change one, change
 * the other, and run it.
 */
import { plateTint, recipeFor, type Blob, type Recipe } from './recipes.ts';

// ---------------------------------------------------------------------------
// Simplex 3-D, ported from `shaders/lib/noise.glsl` (Ashima / Gustavson).
// The shader runs it at 32-bit and this at 64, so the two agree to a few parts
// in a thousand rather than exactly.
// ---------------------------------------------------------------------------

const mod289 = (x: number) => x - Math.floor(x * (1 / 289)) * 289;
const permute = (x: number) => mod289((x * 34 + 1) * x);
const taylorInvSqrt = (r: number) => 1.79284291400159 - 0.85373472095314 * r;
/** GLSL `step(edge, x)`: 0 below the edge, 1 at or above it. */
const step1 = (edge: number, x: number) => (x < edge ? 0 : 1);

function snoise(vx: number, vy: number, vz: number): number {
  const C1 = 1 / 6;
  const C2 = 1 / 3;

  const skew = (vx + vy + vz) * C2;
  const ix = Math.floor(vx + skew);
  const iy = Math.floor(vy + skew);
  const iz = Math.floor(vz + skew);

  const unskew = (ix + iy + iz) * C1;
  const x0x = vx - ix + unskew;
  const x0y = vy - iy + unskew;
  const x0z = vz - iz + unskew;

  const gx = step1(x0y, x0x);
  const gy = step1(x0z, x0y);
  const gz = step1(x0x, x0z);
  const lx = 1 - gx;
  const ly = 1 - gy;
  const lz = 1 - gz;

  const i1x = Math.min(gx, lz);
  const i1y = Math.min(gy, lx);
  const i1z = Math.min(gz, ly);
  const i2x = Math.max(gx, lz);
  const i2y = Math.max(gy, lx);
  const i2z = Math.max(gz, ly);

  const x1x = x0x - i1x + C1;
  const x1y = x0y - i1y + C1;
  const x1z = x0z - i1z + C1;
  const x2x = x0x - i2x + C2;
  const x2y = x0y - i2y + C2;
  const x2z = x0z - i2z + C2;
  const x3x = x0x - 0.5;
  const x3y = x0y - 0.5;
  const x3z = x0z - 0.5;

  const mx = mod289(ix);
  const my = mod289(iy);
  const mz = mod289(iz);

  const offZ = [0, i1z, i2z, 1];
  const offY = [0, i1y, i2y, 1];
  const offX = [0, i1x, i2x, 1];
  const p = [0, 0, 0, 0];
  for (let k = 0; k < 4; k++) {
    p[k] = permute(permute(permute(mz + offZ[k]!) + my + offY[k]!) + mx + offX[k]!);
  }

  const n_ = 0.142857142857;
  const nsx = n_ * 2;
  const nsy = n_ * 0.5 - 1;
  const nsz = n_;

  const gxv = [0, 0, 0, 0];
  const gyv = [0, 0, 0, 0];
  const h = [0, 0, 0, 0];
  for (let k = 0; k < 4; k++) {
    const j = p[k]! - 49 * Math.floor(p[k]! * nsz * nsz);
    const jx = Math.floor(j * nsz);
    const jy = Math.floor(j - 7 * jx);
    gxv[k] = jx * nsx + nsy;
    gyv[k] = jy * nsx + nsy;
    h[k] = 1 - Math.abs(gxv[k]!) - Math.abs(gyv[k]!);
  }

  // b0 = (gx.x, gx.y, gy.x, gy.y), b1 = (gx.z, gx.w, gy.z, gy.w), .xzyw both.
  const b0 = [gxv[0]!, gxv[1]!, gyv[0]!, gyv[1]!];
  const b1 = [gxv[2]!, gxv[3]!, gyv[2]!, gyv[3]!];
  const s0 = b0.map((n) => Math.floor(n) * 2 + 1);
  const s1 = b1.map((n) => Math.floor(n) * 2 + 1);
  const sh = h.map((n) => -step1(n, 0));

  const a0 = [
    b0[0]! + s0[0]! * sh[0]!, b0[2]! + s0[2]! * sh[0]!,
    b0[1]! + s0[1]! * sh[1]!, b0[3]! + s0[3]! * sh[1]!,
  ];
  const a1 = [
    b1[0]! + s1[0]! * sh[2]!, b1[2]! + s1[2]! * sh[2]!,
    b1[1]! + s1[1]! * sh[3]!, b1[3]! + s1[3]! * sh[3]!,
  ];

  const grads = [
    [a0[0]!, a0[1]!, h[0]!],
    [a0[2]!, a0[3]!, h[1]!],
    [a1[0]!, a1[1]!, h[2]!],
    [a1[2]!, a1[3]!, h[3]!],
  ];
  const dot3 = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
  for (const g of grads) {
    const n = taylorInvSqrt(dot3(g, g));
    g[0]! *= n; g[1]! *= n; g[2]! *= n;
  }

  const offs = [[x0x, x0y, x0z], [x1x, x1y, x1z], [x2x, x2y, x2z], [x3x, x3y, x3z]];
  let acc = 0;
  for (let k = 0; k < 4; k++) {
    let m = 0.6 - dot3(offs[k]!, offs[k]!);
    if (m < 0) m = 0;
    m *= m;
    acc += m * m * dot3(grads[k]!, offs[k]!);
  }
  return 42 * acc;
}

function fbm3(px: number, py: number, pz: number, oct: number, lac: number, gain: number): number {
  let a = 0.5;
  let s = 0;
  let norm = 0;
  let x = px; let y = py; let z = pz;
  for (let i = 0; i < oct; i++) {
    s += a * snoise(x, y, z);
    norm += a;
    x *= lac; y *= lac; z *= lac;
    a *= gain;
  }
  return s / Math.max(norm, 0.0001);
}

function ridged(px: number, py: number, pz: number, oct: number, lac: number, gain: number): number {
  let a = 0.5;
  let s = 0;
  let norm = 0;
  let x = px; let y = py; let z = pz;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(snoise(x, y, z));
    s += a * n * n;
    norm += a;
    x *= lac; y *= lac; z *= lac;
    a *= gain;
  }
  return s / Math.max(norm, 0.0001);
}

/** Domain-warped fbm: the swirl that keeps a coastline off a grid. */
function warped(px: number, py: number, pz: number, oct: number, amount: number): number {
  const qx = fbm3(px, py, pz, 3, 2.03, 0.5);
  const qy = fbm3(px + 5.2, py + 5.2, pz + 5.2, 3, 2.03, 0.5);
  const qz = fbm3(px + 11.7, py + 11.7, pz + 11.7, 3, 2.03, 0.5);
  return fbm3(px + qx * amount, py + qy * amount, pz + qz * amount, oct, 2.03, 0.5);
}

function hash13(px: number, py: number, pz: number): number {
  const fr = (v: number) => v - Math.floor(v);
  let x = fr(px * 0.1031);
  let y = fr(py * 0.1031);
  let z = fr(pz * 0.1031);
  const dd = x * (y + 33.33) + y * (z + 33.33) + z * (x + 33.33);
  x += dd; y += dd; z += dd;
  return fr((x + y) * z);
}

// ---------------------------------------------------------------------------
// Colour, and the two things about this pipeline that have to be said out loud
// because neither is guessable from the code that does them.
//
// 1. `planetBake.ts` builds its uniforms with
//    `new THREE.Color(hex).convertSRGBToLinear()`. The constructor *already*
//    converts sRGB to the working space, so every recipe colour reaching the
//    shader has been linearised twice. That is not a typo anyone should fix —
//    every world's palette has been art-directed on top of it — but a faithful
//    port has to do the same, so `lin()` converts twice too.
//
// 2. The albedo plate is an sRGB render target, and Three encodes on write
//    even for a raw ShaderMaterial. So the bytes the shader stores are
//    `srgbEncode(mix of twice-linearised colours)`, and this writes the same.
//
// For a flat colour the two cancel to a single conversion; it is the mixing in
// between, and Shadesmar's hardcoded constants (which are single-space and
// only get step 2), where the difference shows. `npm run test:cartography`
// compares stored bytes against stored bytes and will say so.
// ---------------------------------------------------------------------------

type RGB = [number, number, number];

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** Twice, exactly as `planetBake.ts` does it. See the note above. */
function lin(hex: string): RGB {
  const n = hex.replace('#', '');
  return [0, 2, 4]
    .map((i) => srgbToLinear(srgbToLinear(parseInt(n.slice(i, i + 2), 16) / 255))) as RGB;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}
const scale = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];

/**
 * The globe multiplies its plate by the tint after the sample has decoded it,
 * so a plate has to do the same round trip to land on the same colour.
 */
function tinted(stored: number, k: number): number {
  if (k === 1) return stored;
  const c = Math.max(0, Math.min(1, stored));
  return linearToSrgb(Math.max(0, Math.min(1, srgbToLinear(c) * k)));
}
const mul = (a: RGB, b: RGB): RGB => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const fract = (v: number) => v - Math.floor(v);

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

const canvasCache = new Map<string, HTMLCanvasElement>();

export function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return (h % 97) + 1;
}

/**
 * `cognitive` bakes the Shadesmar reading of the same landmass: the Physical
 * Realm's land is a bead ocean over there, and its seas are glass plains.
 *
 * `tint` is the per-world multiplier the globe applies to its own plate — ten
 * gas giants share three bakes and are told apart by it. See `plateTint`.
 */
export function bakePlanetMap(
  kind: string, seed = 1, W = 1024, H = 512, cognitive = false,
  tint: RGB = [1, 1, 1],
): HTMLCanvasElement {
  const key = `${kind}:${seed}:${W}x${H}${cognitive ? ':c' : ''}:${tint.join(',')}`;
  const hit = canvasCache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const r: Recipe & {
    ice: number; snow: number; lights: number; ridges: number; rivers: number;
    flora: number; floraColor: string;
  } = recipeFor(kind);
  const uSeed = seed * 17.13;

  const cLand = lin(r.land);
  const cLand2 = lin(r.land2);
  const cLand3 = lin(r.land3 ?? r.land2);
  const cOcean = lin(r.ocean);
  const cOceanDeep = lin(r.oceanDeep ?? r.ocean);
  const cCap = lin(r.cap ?? '#e2e8f0');
  const cFlora = lin(r.floraColor);
  const wedges = (r.wedges ?? []).map(lin);
  const blobs = r.shape ?? [];
  const thr = blobs.length ? 0.5 : r.threshold;

  for (let y = 0; y < H; y++) {
    // Texel centres, because that is where a fragment shader samples. Sampling
    // the corner puts the plate half a texel off the globe's, which is nothing
    // on a coastline and a visible shift on Komashi's hion grid.
    const v = (y + 0.5) / H;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);
    const polar = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const lon = u * Math.PI * 2;
      const px = Math.cos(lon) * cosLat;
      const py = Math.sin(lat);
      const pz = Math.sin(lon) * cosLat;
      const qx = px * r.warp + uSeed * 1.7;
      const qy = py * r.warp + uSeed * 1.7;
      const qz = pz * r.warp + uSeed * 1.7;

      // --- 1. continental field, or a gas giant's zonal jets ---------------
      let c: number;
      if (r.bands) {
        const shear = fbm3(px * 1.4 + uSeed, py * 7 + uSeed, pz * 1.4 + uSeed, 5, 2.1, 0.55);
        // Reduced into one turn, exactly as the shader does. See planetBake.frag.
        const phase = uSeed % (Math.PI * 2);
        const band = 0.5 + 0.5 * Math.sin(v * 26 + shear * 4.6 + phase);
        const fine = 0.5 + 0.5 * Math.sin(v * 72 + shear * 8);
        const storm = smoothstep(0.74, 0.99,
          fbm3(px * 4.2 + uSeed * 3, py * 4.2 + uSeed * 3, pz * 4.2 + uSeed * 3, 4, 2.1, 0.5) * 0.5 + 0.5);
        c = clamp(band * 0.70 + fine * 0.16 + storm * 0.42, 0, 1);
      } else if (blobs.length) {
        const bays = warped(qx * 0.5, qy * 0.5, qz * 0.5, 3, 0.42);
        const shore = fbm3(qx * 1.8, qy * 1.8, qz * 1.8, 3, 2.05, 0.5);
        c = clamp(Math.min(1.32, shapeAt(blobs, u, v)) * 0.80 + bays * 0.19 + shore * 0.075, 0, 1.4);
      } else {
        c = clamp(warped(qx * 1.25, qy * 1.25, qz * 1.25, 4, 0.5) * 0.5 + 0.5, 0, 1);
      }

      // --- 2. the coast is a level set of that, and nothing else -----------
      const coast = r.bands ? 0.10 : 0.008;
      const water = r.bands ? 0 : 1 - smoothstep(thr - coast, thr + coast, c);
      const land = 1 - water;

      // --- 3. elevation as its own field, masked to land -------------------
      const inland = smoothstep(0, 0.11, c - thr);
      const rolling = fbm3(qx * 0.95 + 41, qy * 0.95 + 41, qz * 0.95 + 41, 5, 2.05, 0.5) * 0.5 + 0.5;
      const chain = ridged(qx * 0.72 + 13, qy * 0.72 + 13, qz * 0.72 + 13, 4, 2.07, 0.52);
      const spur = ridged(qx * 2.10 + 29, qy * 2.10 + 29, qz * 2.10 + 29, 3, 2.10, 0.50);
      const ranges = chain ** 6 + spur ** 7 * 0.35;
      const up = clamp(inland * (0.05 + rolling * 0.24 + ranges * r.ridges * 3.4), 0, 1.2);
      const floorH = fbm3(qx * 1.6 + 77, qy * 1.6 + 77, qz * 1.6 + 77, 4, 2.05, 0.5) * 0.5 + 0.5;

      const riverRaw = r.rivers < 0.001 ? 0
        : smoothstep(0.90, 0.998,
          ridged(px * 8 + uSeed * 5, py * 8 + uSeed * 5, pz * 8 + uSeed * 5, 4, 2.1, 0.55)) * r.rivers;
      const river = riverRaw * land * smoothstep(0.02, 0.16, up);

      let capMask = 0;
      if (r.ice > 0.001 || r.snow > 0.001) {
        const edge = 0.955 - r.ice * 0.13;
        const wobble = warped(px * 3.6 + uSeed, py * 3.6 + uSeed, pz * 3.6 + uSeed, 3, 0.5) * 0.055;
        capMask = smoothstep(edge, edge + 0.05, polar + wobble);
        const snow = smoothstep(0.58, 0.88, up) * land * smoothstep(0.18, 0.62, polar) * r.snow * 0.85;
        capMask = clamp(Math.max(capMask, snow), 0, 1);
      }

      // --- 4. colour --------------------------------------------------------
      let col: RGB;
      if (r.bands) {
        const a = mix(cOcean, cLand, smoothstep(0.10, 0.58, c));
        col = mix(a, cLand3, smoothstep(0.58, 0.95, c));
        col = mix(col, cLand2, smoothstep(0.08, 0.34, 1 - c) * 0.55);
      } else if (r.split) {
        const day = smoothstep(0.40, 0.60, 1 - Math.abs(fract(u + 0.25) - 0.5) * 2);
        const dayCol = mix(cLand, cLand3, smoothstep(0.05, 0.60, up));
        const nightCol = mix(cOcean, cOceanDeep, c * 0.7);
        col = mix(nightCol, dayCol, day);
      } else if (r.terminator) {
        const heat = Math.exp(-((fract(u + 0.45) - 0.5) ** 2) * 40);
        const molten = mix(cLand2, cLand3, smoothstep(0.05, 0.5, up));
        col = mix(cLand, molten, heat);
        col = mix(col, cOcean, smoothstep(0.5, 0.05, heat) * 0.6);
      } else if (wedges.length) {
        // Boundaries wander and bleed; hard stripes read as a beach ball.
        const drift = warped(px * 1.5 + uSeed * 3, py * 1.5 + uSeed * 3, pz * 1.5 + uSeed * 3, 4, 0.8) * 0.10;
        const w = (u + drift) * wedges.length;
        const i0 = Math.floor(((w % wedges.length) + wedges.length) % wedges.length);
        const i1 = (i0 + 1) % wedges.length;
        let sea = mix(wedges[i0]!, wedges[i1]!, smoothstep(0.34, 1, fract(w)));
        const grain = fbm3(px * 22 + uSeed, py * 22 + uSeed, pz * 22 + uSeed, 4, 2.1, 0.5) * 0.5 + 0.5;
        const swirl = warped(px * 6 + uSeed * 2, py * 6 + uSeed * 2, pz * 6 + uSeed * 2, 4, 0.9) * 0.5 + 0.5;
        sea = scale(sea, 0.70 + 0.38 * grain + 0.22 * swirl);
        const rock = mix(cLand, cLand3, smoothstep(0.05, 0.5, up));
        col = mix(sea, rock, land);
      } else {
        const deep = clamp((thr - c) * 2, 0, 1) * (0.55 + 0.75 * (1 - floorH));
        let sea = mix(cOcean, cOceanDeep, clamp(deep, 0, 1));
        sea = mix(mix(cOcean, cLand, 0.34), sea, smoothstep(0, 0.06, thr - c));
        let ground = mix(cLand, cLand2, smoothstep(0.02, 0.30, up));
        ground = mix(ground, cLand3, smoothstep(0.52, 0.95, up));
        const dry = warped(qx * 0.42 + 91, qy * 0.42 + 91, qz * 0.42 + 91, 3, 0.5) * 0.5 + 0.5;
        ground = scale(ground, 0.84 + 0.30 * dry);
        if (r.flora > 0.001) {
          const veg = warped(px * 4.2 + uSeed * 2, py * 4.2 + uSeed * 2, pz * 4.2 + uSeed * 2, 4, 0.7) * 0.5 + 0.5;
          const wet = smoothstep(0.92, 0.20, polar) * smoothstep(0.70, 0.10, up);
          // Keep the ground's own light and shade, take the hue from the recipe.
          const lum = ground[0] * 0.2126 + ground[1] * 0.7152 + ground[2] * 0.0722;
          const leaf = scale(cFlora, 0.45 + 1.30 * lum);
          ground = mix(ground, leaf, smoothstep(0.24, 0.74, veg) * r.flora * wet);
        }
        // Sediment: a paler wash where the land has been worn flat.
        ground = mix(ground, mul(ground, [1.14, 1.07, 0.93]), smoothstep(0.12, 0, up) * 0.7);
        ground = mix(ground, mix(cOcean, cLand, 0.55), river * 0.85);
        col = mix(sea, ground, land);
      }

      if (r.fain) {
        const f = warped(px * 5 + uSeed * 4, py * 5 + uSeed * 4, pz * 5 + uSeed * 4, 4, 0.8) * 0.5 + 0.5;
        col = mix(col, [0.53, 0.94, 0.65], smoothstep(0.50, 0.82, f) * land * 0.6);
      }
      if (r.hion) {
        const hx = Math.abs(fract(px * 6 + uSeed) - 0.5);
        const hz = Math.abs(fract(pz * 6 + uSeed) - 0.5);
        const line = smoothstep(0.030, 0, Math.min(hx, hz));
        col = mix(col, u < 0.5 ? [0.13, 0.83, 0.93] : [0.91, 0.47, 0.98], line * 0.9);
      }

      if (capMask > 0.001) {
        const crack = smoothstep(0.88, 0.99,
          ridged(px * 18 + uSeed, py * 18 + uSeed, pz * 18 + uSeed, 3, 2.1, 0.5));
        col = mix(col, mix(cCap, scale(cCap, 0.74), crack), capMask);
      }

      if (cognitive) {
        const t = clamp(Math.abs(c - thr) * 2.4, 0, 1);
        const bead = hash13(Math.floor(px * 300), Math.floor(py * 300), Math.floor(pz * 300));
        let beads = mix([0.008, 0.006, 0.020], [0.048, 0.028, 0.098], t);
        beads = mix(beads, [0.34, 0.26, 0.62], step1(0.964, bead) * 0.9);
        let glass = mix([0.085, 0.105, 0.155], [0.026, 0.034, 0.062], t);
        const sheen = smoothstep(0.58, 0.92,
          fbm3(px * 11 + uSeed, py * 11 + uSeed, pz * 11 + uSeed, 4, 2.05, 0.5) * 0.5 + 0.5);
        glass = mix(glass, [0.20, 0.27, 0.44], sheen * 0.5);
        // Veins of light in the glass where the land above it meets the sea.
        const seam = smoothstep(0.055, 0, Math.abs(c - thr));
        glass = mix(glass, [0.30, 0.36, 0.66], seam * 0.55);
        col = mix(glass, beads, land);
      }

      // The sRGB render target encodes on write; so does this.
      const i = (y * W + x) * 4;
      d[i] = Math.round(tinted(linearToSrgb(clamp(col[0], 0, 1)), tint[0]) * 255);
      d[i + 1] = Math.round(tinted(linearToSrgb(clamp(col[1], 0, 1)), tint[1]) * 255);
      d[i + 2] = Math.round(tinted(linearToSrgb(clamp(col[2], 0, 1)), tint[2]) * 255);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  canvasCache.set(key, canvas);
  return canvas;
}

export { plateTint };
