/**
 * Original city plates. No Three — the atlas blits these the same way it
 * blits world maps. UVs are 0..1 on the plate, not on the globe.
 */
import { cityById } from '../data/cities.ts';
import type { CityKind } from '../data/types.ts';

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
function fbm(x: number, y: number, oct = 4): number {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise(x * f, y * f); a *= 0.5; f *= 2.05; }
  return v;
}
function mix(a: number[], b: number[], t: number): number[] {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return [a[0]! + (b[0]! - a[0]!) * u, a[1]! + (b[1]! - a[1]!) * u, a[2]! + (b[2]! - a[2]!) * u];
}
function rgb(h: string): number[] {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

interface Page {
  W: number; H: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img: ImageData;
  d: Uint8ClampedArray;
}

function page(W: number, H: number): Page {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  return { W, H, canvas, ctx, img, d: img.data };
}

function fill(p: Page, fn: (u: number, v: number, x: number, y: number) => number[]): void {
  const { W, H, d } = p;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const col = fn(x / W, v, x, y);
      const i = (y * W + x) * 4;
      d[i] = col[0]!; d[i + 1] = col[1]!; d[i + 2] = col[2]!; d[i + 3] = 255;
    }
  }
  p.ctx.putImageData(p.img, 0, 0);
}

function vignette(p: Page): void {
  const g = p.ctx.createRadialGradient(p.W * 0.5, p.H * 0.5, p.H * 0.2, p.W * 0.5, p.H * 0.5, p.H * 0.78);
  g.addColorStop(0, 'rgba(5,6,13,0)');
  g.addColorStop(1, 'rgba(5,6,13,0.42)');
  p.ctx.fillStyle = g;
  p.ctx.fillRect(0, 0, p.W, p.H);
}

function circle(p: Page, u: number, v: number, rH: number, stroke: string, width = 2): void {
  p.ctx.beginPath();
  p.ctx.arc(u * p.W, v * p.H, rH * p.H, 0, Math.PI * 2);
  p.ctx.strokeStyle = stroke;
  p.ctx.lineWidth = width;
  p.ctx.stroke();
}

function disc(p: Page, u: number, v: number, rH: number, fillStyle: string): void {
  p.ctx.beginPath();
  p.ctx.arc(u * p.W, v * p.H, rH * p.H, 0, Math.PI * 2);
  p.ctx.fillStyle = fillStyle;
  p.ctx.fill();
}

function line(p: Page, u0: number, v0: number, u1: number, v1: number, stroke: string, width = 2): void {
  p.ctx.beginPath();
  p.ctx.moveTo(u0 * p.W, v0 * p.H);
  p.ctx.lineTo(u1 * p.W, v1 * p.H);
  p.ctx.strokeStyle = stroke;
  p.ctx.lineWidth = width;
  p.ctx.stroke();
}

function rect(p: Page, u: number, v: number, wu: number, hv: number, fillStyle: string, stroke?: string): void {
  p.ctx.fillStyle = fillStyle;
  p.ctx.fillRect(u * p.W, v * p.H, wu * p.W, hv * p.H);
  if (stroke) {
    p.ctx.strokeStyle = stroke;
    p.ctx.lineWidth = 1.5;
    p.ctx.strokeRect(u * p.W, v * p.H, wu * p.W, hv * p.H);
  }
}

/** Round radius in height-units, so a circle stays a circle on a 2:1 plate. */
function rad(u: number, v: number, cu: number, cv: number, W: number, H: number): number {
  const dx = (u - cu) * (W / H);
  const dy = v - cv;
  return Math.hypot(dx, dy);
}

function urithiru(p: Page): void {
  const stone = rgb('#3d4550'); const stone2 = rgb('#1f2933');
  const snow = rgb('#dce6f0'); const glow = rgb('#7dd3fc');
  fill(p, (u, v) => {
    const n = fbm(u * 6 + 2, v * 6 + 4);
    const r = rad(u, v, 0.42, 0.52, p.W, p.H);
    const ridge = 0.5 + 0.5 * Math.sin((u * 14 + v * 9) + n * 3);
    let col = mix(stone2, mix(stone, rgb('#6b5d4d'), 0.45), n * 0.65 + ridge * 0.25);
    if (r < 0.28) {
      const ring = 0.5 + 0.5 * Math.sin(r * 72);
      col = mix(mix(stone, rgb('#6b7280'), ring), glow, Math.max(0, 0.18 - r) * 4);
    } else if (n > 0.6 && v < 0.42) col = mix(col, snow, (n - 0.6) * 2.2);
    return col;
  });
  for (let i = 1; i <= 8; i++) circle(p, 0.42, 0.52, 0.035 * i, 'rgba(186,230,253,0.35)', 1.4);
  disc(p, 0.42, 0.52, 0.028, 'rgba(125,211,252,0.9)');
  disc(p, 0.72, 0.64, 0.11, 'rgba(30,41,59,0.7)');
  circle(p, 0.72, 0.64, 0.11, 'rgba(251,191,36,0.85)', 2);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    disc(p, 0.72 + Math.cos(a) * 0.07, 0.64 + Math.sin(a) * 0.14, 0.016, 'rgba(251,191,36,0.8)');
  }
  disc(p, 0.32, 0.62, 0.05, 'rgba(253,230,138,0.35)');
}

function kholinar(p: Page): void {
  const sand = rgb('#b4532a'); const sand2 = rgb('#7c2d12'); const street = rgb('#c4a574');
  fill(p, (u, v) => {
    const n = fbm(u * 7, v * 7 + 3);
    const blade = Math.abs(Math.sin(u * 14 + v * 1.4 + n)) > 0.72;
    let col = mix(sand, sand2, n);
    if (blade) col = mix(col, rgb('#431407'), 0.7);
    const wall = rad(u, v, 0.48, 0.48, p.W, p.H);
    if (wall > 0.36 && wall < 0.40) col = mix(col, rgb('#44403c'), 0.8);
    if (wall < 0.36) col = mix(col, street, 0.18);
    return col;
  });
  rect(p, 0.44, 0.12, 0.12, 0.16, 'rgba(251,191,36,0.55)', 'rgba(251,191,36,0.9)');
  disc(p, 0.82, 0.48, 0.055, 'rgba(167,139,250,0.45)');
  circle(p, 0.82, 0.48, 0.055, 'rgba(167,139,250,0.95)', 2);
  disc(p, 0.56, 0.60, 0.04, 'rgba(253,230,138,0.4)');
}

function kharbranth(p: Page): void {
  const sea = rgb('#0e4a5c'); const sea2 = rgb('#164e63');
  const stone = rgb('#8b7355'); const cliff = rgb('#44403c');
  fill(p, (u, v) => {
    const n = fbm(u * 8, v * 8);
    const cx = 0.48, cy = 0.52;
    const r = rad(u, v, cx, cy, p.W, p.H);
    const ang = Math.atan2(v - cy, (u - cx) * (p.W / p.H));
    const crescent = r > 0.08 && r < 0.28 && ang > -0.4 && ang < 3.2;
    if (r < 0.12) return mix(rgb('#22d3ee'), sea, r * 6);
    if (crescent) {
      const terrace = 0.5 + 0.5 * Math.sin(r * 90);
      return mix(mix(stone, cliff, terrace), rgb('#a78bfa'), v < 0.38 ? 0.15 : 0);
    }
    return v > 0.42 ? mix(sea, sea2, n) : mix(cliff, stone, n);
  });
  disc(p, 0.62, 0.36, 0.035, 'rgba(167,139,250,0.7)');
  rect(p, 0.33, 0.26, 0.10, 0.08, 'rgba(196,181,253,0.45)', 'rgba(196,181,253,0.9)');
}

function luthadel(p: Page): void {
  const ash = rgb('#4b453c'); const ash2 = rgb('#2a2620'); const fire = rgb('#b45309');
  fill(p, (u, v) => {
    const n = fbm(u * 9, v * 9);
    const r = rad(u, v, 0.50, 0.50, p.W, p.H);
    let col = mix(ash, ash2, n);
    if (r < 0.42) col = mix(col, rgb('#57534e'), 0.25);
    if (Math.abs(r - 0.42) < 0.018) col = rgb('#1c1917');
    const river = Math.abs(v - (0.62 + (u - 0.5) * 0.18)) < 0.025 && r < 0.5;
    if (river) col = mix(rgb('#334155'), rgb('#1e293b'), n);
    if (r < 0.12 && v < 0.46) col = mix(rgb('#111010'), fire, n * 0.35);
    return col;
  });
  circle(p, 0.50, 0.50, 0.42, 'rgba(28,25,23,0.95)', 4);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    rect(p, 0.50 + Math.cos(a) * 0.16 - 0.025, 0.50 + Math.sin(a) * 0.32 - 0.04,
      0.05, 0.08, 'rgba(214,164,76,0.4)', 'rgba(214,164,76,0.8)');
  }
  for (let i = 0; i < 7; i++) {
    disc(p, 0.50 + (i - 3) * 0.018, 0.34 - Math.abs(i - 3) * 0.01, 0.012 + (i === 3 ? 0.02 : 0), '#111010');
  }
}

function elendel(p: Page): void {
  const green = rgb('#3f6b3a'); const green2 = rgb('#6a8a4a'); const canal = rgb('#3b82c4');
  fill(p, (u, v) => {
    const n = fbm(u * 6, v * 6);
    const r = rad(u, v, 0.50, 0.50, p.W, p.H);
    const ang = Math.atan2(v - 0.50, (u - 0.50) * (p.W / p.H));
    const oct = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 8);
    let col = mix(green, green2, n * 0.5 + (oct % 2) * 0.12);
    if (r < 0.40) col = mix(col, rgb('#d6d3c0'), 0.25);
    if (r < 0.08) col = mix(col, rgb('#d6a44c'), 0.7);
    const spoke = Math.abs((ang / (Math.PI / 4)) % 1 - 0.5) < 0.06 && r < 0.4;
    const ring = Math.abs(r - 0.22) < 0.012;
    if (spoke || ring) col = mix(col, canal, 0.85);
    return col;
  });
  circle(p, 0.50, 0.50, 0.40, 'rgba(214,164,76,0.55)', 2);
  disc(p, 0.50, 0.50, 0.045, 'rgba(214,164,76,0.85)');
  disc(p, 0.74, 0.52, 0.03, 'rgba(103,232,249,0.5)');
}

function elantris(p: Page): void {
  const land = rgb('#4b5563'); const land2 = rgb('#6b7280'); const glow = rgb('#c4b5fd');
  fill(p, (u, v) => {
    const n = fbm(u * 5, v * 5);
    const r = rad(u, v, 0.48, 0.48, p.W, p.H);
    let col = mix(land, land2, n);
    if (r < 0.32) {
      const aon = 0.5 + 0.5 * Math.sin(r * 40) * Math.cos(u * 20);
      col = mix(mix(rgb('#a1a1aa'), glow, 0.45), glow, Math.max(0, 0.08 - r) * 5 + aon * 0.15);
    }
    if (Math.abs(r - 0.32) < 0.014) col = mix(glow, rgb('#e9d5ff'), 0.4);
    return col;
  });
  circle(p, 0.48, 0.48, 0.32, 'rgba(196,181,253,0.95)', 3);
  line(p, 0.48, 0.10, 0.48, 0.86, 'rgba(167,139,250,0.55)', 2);
  line(p, 0.22, 0.48, 0.78, 0.48, 'rgba(167,139,250,0.55)', 2);
  disc(p, 0.48, 0.16, 0.03, 'rgba(167,139,250,0.8)');
  disc(p, 0.48, 0.80, 0.03, 'rgba(167,139,250,0.8)');
  disc(p, 0.28, 0.48, 0.03, 'rgba(167,139,250,0.8)');
  disc(p, 0.68, 0.48, 0.03, 'rgba(167,139,250,0.8)');
  rect(p, 0.64, 0.54, 0.18, 0.16, 'rgba(221,214,254,0.35)', 'rgba(221,214,254,0.8)');
}

function ttelir(p: Page): void {
  const jungle = rgb('#166534'); const jungle2 = rgb('#14532d');
  const sand = rgb('#e8c4a0'); const sea = rgb('#0e7490'); const sea2 = rgb('#155e75');
  fill(p, (u, v) => {
    const n = fbm(u * 7, v * 7);
    if (v > 0.68 + n * 0.06) return mix(sea, sea2, n);
    if (v < 0.22) return mix(jungle, jungle2, n);
    let col = mix(sand, rgb('#d6a574'), n);
    if (u > 0.52 && u < 0.78 && v > 0.22 && v < 0.42) {
      const pal = [rgb('#c084fc'), rgb('#f472b6'), rgb('#22d3ee'), rgb('#fbbf24'), rgb('#34d399')];
      col = pal[Math.floor(u * 18 + v * 8) % pal.length]!;
      col = mix(col, sand, 0.25);
    }
    return col;
  });
  rect(p, 0.54, 0.22, 0.24, 0.20, 'rgba(192,132,252,0.15)', 'rgba(192,132,252,0.7)');
  for (let i = 0; i < 6; i++) {
    line(p, 0.40 + i * 0.03, 0.70, 0.40 + i * 0.03, 0.84, 'rgba(15,23,42,0.45)', 2);
  }
  disc(p, 0.38, 0.48, 0.05, 'rgba(134,239,172,0.35)');
}

function kilahito(p: Page): void {
  const night = rgb('#0b1020'); const night2 = rgb('#111827');
  const cyan = rgb('#22d3ee'); const mag = rgb('#e879f9');
  fill(p, (u, v) => {
    const n = fbm(u * 10, v * 10);
    let col = mix(night, night2, n);
    const hionV = Math.abs(Math.sin(u * 22));
    const hionH = Math.abs(Math.sin(v * 16));
    if (hionV > 0.94) col = mix(col, cyan, 0.9);
    if (hionH > 0.95) col = mix(col, mag, 0.85);
    if (n > 0.62) col = mix(col, rgb('#1e293b'), 0.5);
    return col;
  });
  rect(p, 0.26, 0.32, 0.14, 0.16, 'rgba(232,121,249,0.18)', 'rgba(232,121,249,0.7)');
  rect(p, 0.54, 0.50, 0.16, 0.14, 'rgba(34,211,238,0.18)', 'rgba(34,211,238,0.7)');
}

function kezare(p: Page): void {
  const sand = rgb('#e8c878'); const sand2 = rgb('#c9a24a'); const water = rgb('#38bdf8');
  fill(p, (u, v) => {
    const n = fbm(u * 8, v * 8);
    const river = Math.abs(v - (0.58 + Math.sin(u * 8) * 0.06)) < 0.04;
    if (river) return mix(water, rgb('#0e7490'), n);
    let col = mix(sand, sand2, n);
    const r = rad(u, v, 0.48, 0.44, p.W, p.H);
    if (r < 0.28) col = mix(col, rgb('#a16207'), 0.2);
    return col;
  });
  rect(p, 0.40, 0.34, 0.12, 0.14, 'rgba(251,191,36,0.45)', 'rgba(251,191,36,0.9)');
  rect(p, 0.56, 0.30, 0.12, 0.10, 'rgba(253,230,138,0.4)', 'rgba(253,230,138,0.85)');
}

function hover(p: Page, seed: number): void {
  const ground = rgb('#1c1917'); const heat = rgb('#7c2d12'); const gold = rgb('#fbbf24');
  fill(p, (u, v) => {
    const n = fbm(u * 6 + seed, v * 6);
    const dawn = Math.max(0, u - 0.62);
    let col = mix(ground, heat, n * 0.5 + dawn * 1.4);
    const city = rad(u, v, 0.48, 0.50, p.W, p.H);
    if (city < 0.16) col = mix(mix(rgb('#292524'), gold, 0.35), gold, Math.max(0, 0.05 - city) * 8);
    return col;
  });
  for (let i = 0; i < 4; i++) {
    line(p, 0.20, 0.42 + i * 0.05, 0.78, 0.46 + i * 0.05, 'rgba(251,191,36,0.25)', 2);
  }
  disc(p, 0.62, 0.44, 0.03, 'rgba(251,191,36,0.85)');
}

const cache = new Map<string, HTMLCanvasElement>();

const PAINT: Record<CityKind, (p: Page, seed: number) => void> = {
  urithiru, kholinar, kharbranth, luthadel, elendel, elantris, ttelir, kilahito, kezare, hover,
};

export function bakeCityMap(id: string, W = 800, H = 400): HTMLCanvasElement | null {
  const spec = cityById[id];
  if (!spec) return null;
  const key = `${id}:${W}x${H}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = page(W, H);
  PAINT[spec.kind](p, id.length);
  vignette(p);
  cache.set(key, p.canvas);
  return p.canvas;
}
