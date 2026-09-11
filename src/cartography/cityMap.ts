/**
 * Original city plates, drawn as ink on parchment.
 *
 * These sit in the same panel as Isaac Stewart's city rasters, so they have to
 * belong to the same family: a ruled border, a warm ground, a compass, a scale
 * bar, and a street plan someone could have surveyed. The earlier version was
 * a noise fill with a few circles on it and looked exactly like that next to
 * the real thing.
 *
 * No Three — the atlas blits these the same way it blits world maps. UVs are
 * 0..1 on the plate, not on the globe.
 */
import { cityById } from '../data/cities.ts';
import type { CityKind } from '../data/types.ts';

/* -------------------------------------------------------------------------
 * page
 * ---------------------------------------------------------------------- */

interface Page {
  W: number;
  H: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Deterministic per-plate random, so a plate never changes under a reader. */
  rnd: () => number;
}

function page(W: number, H: number, seed: number): Page {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return { W, H, canvas, ctx, rnd };
}

const px = (p: Page, u: number) => u * p.W;
const py = (p: Page, v: number) => v * p.H;
/** Radius in height units, so a circle stays a circle on a 2:1 plate. */
const rx = (p: Page, r: number) => (r * p.H) / p.W;

/* -------------------------------------------------------------------------
 * palettes
 * ---------------------------------------------------------------------- */

interface Palette {
  /** Parchment, light and shadowed. */
  paper: string;
  paperDark: string;
  /** The pen. */
  ink: string;
  inkSoft: string;
  /** Blocks, water, and the one accent a plate is allowed. */
  block: string;
  water: string;
  accent: string;
  /** Some worlds are not drawn on paper at all. */
  dark?: boolean;
}

const VORIN: Palette = {
  paper: '#e4d7b8', paperDark: '#c8b489', ink: '#4a3823', inkSoft: 'rgba(74,56,35,0.42)',
  block: 'rgba(120,96,62,0.30)', water: '#9fb9b4', accent: '#9a6b2f',
};
const SCADRIAL: Palette = {
  paper: '#ded3bb', paperDark: '#b9a888', ink: '#3f3628', inkSoft: 'rgba(63,54,40,0.40)',
  block: 'rgba(96,86,62,0.32)', water: '#a6b6b0', accent: '#8a5a2b',
};
const SELISH: Palette = {
  paper: '#e0d9c6', paperDark: '#bdb39b', ink: '#3c3550', inkSoft: 'rgba(60,53,80,0.40)',
  block: 'rgba(92,84,120,0.28)', water: '#a3b5c9', accent: '#6b5a9a',
};
const NALTHIS: Palette = {
  paper: '#e7dcc4', paperDark: '#c6b492', ink: '#4a2f3c', inkSoft: 'rgba(74,47,60,0.40)',
  block: 'rgba(150,96,120,0.24)', water: '#8fb6c4', accent: '#b0537f',
};
const TALDAIN: Palette = {
  paper: '#efe0b4', paperDark: '#d2be84', ink: '#4d3a1c', inkSoft: 'rgba(77,58,28,0.40)',
  block: 'rgba(130,102,50,0.28)', water: '#9cc0c6', accent: '#a8761f',
};
const KOMASHI: Palette = {
  paper: '#0e1424', paperDark: '#070b16', ink: '#5de7ff', inkSoft: 'rgba(93,231,255,0.30)',
  block: 'rgba(93,231,255,0.10)', water: '#123047', accent: '#e879f9', dark: true,
};
const CANTICLE: Palette = {
  paper: '#221510', paperDark: '#120b08', ink: '#f0a35a', inkSoft: 'rgba(240,163,90,0.30)',
  block: 'rgba(240,163,90,0.12)', water: '#3a1d10', accent: '#ffd08a', dark: true,
};

/* -------------------------------------------------------------------------
 * the sheet
 * ---------------------------------------------------------------------- */

/** Warm ground with fibre, foxing and a burnt edge. Or a dark plate. */
function sheet(p: Page, pal: Palette): void {
  const { ctx, W, H } = p;
  ctx.fillStyle = pal.paper;
  ctx.fillRect(0, 0, W, H);

  // Fibre: short strokes in two directions, very low contrast.
  ctx.globalAlpha = pal.dark ? 0.05 : 0.09;
  ctx.strokeStyle = pal.paperDark;
  ctx.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = p.rnd() * W;
    const y = p.rnd() * H;
    const len = 2 + p.rnd() * 9;
    const horiz = p.rnd() > 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (horiz ? len : 0), y + (horiz ? 0 : len));
    ctx.stroke();
  }
  // Foxing: the brown blooms old paper gets.
  ctx.globalAlpha = pal.dark ? 0.05 : 0.10;
  ctx.fillStyle = pal.paperDark;
  for (let i = 0; i < 40; i++) {
    const r = 4 + p.rnd() * 26;
    ctx.beginPath();
    ctx.arc(p.rnd() * W, p.rnd() * H, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Edge burn.
  const g = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.30, W * 0.5, H * 0.5, H * 0.92);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, pal.dark ? 'rgba(0,0,0,0.55)' : 'rgba(70,48,20,0.30)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** The ruled border a surveyed plate has, with ticks at the corners. */
function frame(p: Page, pal: Palette): void {
  const { ctx, W, H } = p;
  const m = Math.round(H * 0.045);
  ctx.strokeStyle = pal.ink;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 2;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;
  ctx.strokeRect(m + 6, m + 6, W - m * 2 - 12, H - m * 2 - 12);
  // Corner ticks.
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 2;
  const t = 14;
  for (const [cx, cy, sx, sy] of [
    [m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1],
  ] as [number, number, number, number][]) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * t, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * t);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function compass(p: Page, u: number, v: number, pal: Palette): void {
  const { ctx } = p;
  const cx = px(p, u);
  const cy = py(p, v);
  const r = p.H * 0.052;
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = pal.ink;
  ctx.fillStyle = pal.ink;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  // Four points, north filled.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const wide = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a + Math.PI / 2) * wide, cy + Math.sin(a + Math.PI / 2) * wide);
    ctx.lineTo(cx + Math.cos(a - Math.PI / 2) * wide, cy + Math.sin(a - Math.PI / 2) * wide);
    ctx.closePath();
    if (i === 0) ctx.fill(); else ctx.stroke();
  }
  ctx.font = `600 ${Math.round(r * 0.52)}px Inter, ui-sans-serif, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - r * 1.32);
  ctx.restore();
}

function scaleBar(p: Page, pal: Palette): void {
  const { ctx, W, H } = p;
  const x = W * 0.07;
  const y = H * 0.90;
  const w = W * 0.14;
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = pal.ink;
  ctx.fillStyle = pal.ink;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, 7);
  for (let i = 0; i < 4; i += 2) ctx.fillRect(x + (w / 4) * i, y, w / 4, 7);
  ctx.font = `500 ${Math.round(H * 0.030)}px Inter, ui-sans-serif, sans-serif`;
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.6;
  ctx.fillText('surveyed, not to scale', x, y - 7);
  ctx.restore();
}

/* -------------------------------------------------------------------------
 * plans
 * ---------------------------------------------------------------------- */

interface Plan {
  pal: Palette;
  /** Concentric ring roads and radial streets inside a wall. */
  radial?: { rings: number; spokes: number; wall: boolean; gates: number };
  /** Streets on a grid, optionally rotated. */
  grid?: { cols: number; rows: number; tilt: number };
  /** A river or canal system across the plate. */
  water?: 'river' | 'bay' | 'canals' | 'none';
  /** A keep, palace or tower at the middle. */
  citadel?: 'keep' | 'tower' | 'terraces' | 'none';
  /** Outlying hamlets beyond the wall. */
  outskirts?: number;
  /** A lattice of light instead of streets. */
  lattice?: boolean;
  /** The city is moving, and leaves a track. */
  track?: boolean;
}

const CENTRE: [number, number] = [0.47, 0.50];

function blocks(p: Page, pal: Palette, inside: (u: number, v: number) => boolean, n: number): void {
  const { ctx } = p;
  ctx.save();
  ctx.fillStyle = pal.block;
  ctx.strokeStyle = pal.inkSoft;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const u = 0.10 + p.rnd() * 0.80;
    const v = 0.12 + p.rnd() * 0.76;
    if (!inside(u, v)) continue;
    const w = (0.010 + p.rnd() * 0.026) * p.W;
    const h = (0.020 + p.rnd() * 0.052) * p.H;
    ctx.beginPath();
    ctx.rect(px(p, u), py(p, v), w, h);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawRadial(p: Page, pal: Palette, spec: NonNullable<Plan['radial']>): void {
  const { ctx } = p;
  const [cu, cv] = CENTRE;
  const outer = 0.34;
  ctx.save();
  ctx.strokeStyle = pal.ink;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.2;
  for (let i = 1; i <= spec.rings; i++) {
    const r = (outer * i) / spec.rings;
    ctx.beginPath();
    ctx.ellipse(px(p, cu), py(p, cv), rx(p, r) * p.W, r * p.H, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < spec.spokes; i++) {
    const a = (i / spec.spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(px(p, cu), py(p, cv));
    ctx.lineTo(px(p, cu + Math.cos(a) * rx(p, outer)), py(p, cv + Math.sin(a) * outer));
    ctx.stroke();
  }
  if (spec.wall) {
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(px(p, cu), py(p, cv), rx(p, outer * 1.06) * p.W, outer * 1.06 * p.H, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Gates: short breaks with a tick either side.
    ctx.fillStyle = pal.paper;
    for (let i = 0; i < spec.gates; i++) {
      const a = (i / spec.gates) * Math.PI * 2 + 0.3;
      const gx = px(p, cu + Math.cos(a) * rx(p, outer * 1.06));
      const gy = py(p, cv + Math.sin(a) * outer * 1.06);
      ctx.beginPath();
      ctx.arc(gx, gy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = pal.ink;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 3.5;
    }
  }
  ctx.restore();
  blocks(p, pal, (u, v) => {
    const d = Math.hypot((u - cu) / rx(p, 1), v - cv);
    return d < outer * 0.98 && d > outer * 0.10;
  }, 260);
}

function drawGrid(p: Page, pal: Palette, spec: NonNullable<Plan['grid']>): void {
  const { ctx } = p;
  ctx.save();
  ctx.translate(px(p, CENTRE[0]), py(p, CENTRE[1]));
  ctx.rotate(spec.tilt);
  ctx.strokeStyle = pal.ink;
  ctx.globalAlpha = 0.40;
  ctx.lineWidth = 1.1;
  const halfW = p.W * 0.34;
  const halfH = p.H * 0.36;
  for (let i = 0; i <= spec.cols; i++) {
    const x = -halfW + (i / spec.cols) * halfW * 2;
    ctx.beginPath();
    ctx.moveTo(x, -halfH);
    ctx.lineTo(x, halfH);
    ctx.stroke();
  }
  for (let i = 0; i <= spec.rows; i++) {
    const y = -halfH + (i / spec.rows) * halfH * 2;
    ctx.beginPath();
    ctx.moveTo(-halfW, y);
    ctx.lineTo(halfW, y);
    ctx.stroke();
  }
  // Two avenues, heavier than the rest.
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-halfW, 0);
  ctx.lineTo(halfW, 0);
  ctx.moveTo(0, -halfH);
  ctx.lineTo(0, halfH);
  ctx.stroke();
  ctx.restore();
  blocks(p, pal, (u, v) => Math.abs(u - CENTRE[0]) < 0.33 && Math.abs(v - CENTRE[1]) < 0.35, 300);
}

function drawWater(p: Page, pal: Palette, kind: NonNullable<Plan['water']>): void {
  if (kind === 'none') return;
  const { ctx, W, H } = p;
  ctx.save();
  ctx.fillStyle = pal.water;
  ctx.globalAlpha = pal.dark ? 0.55 : 0.72;
  if (kind === 'bay') {
    ctx.beginPath();
    ctx.ellipse(W * 0.46, H * 1.08, W * 0.42, H * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'river') {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.70);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      ctx.lineTo(W * t, H * (0.70 + Math.sin(t * 5 + 1) * 0.07));
    }
    ctx.lineTo(W, H * 0.86);
    for (let i = 12; i >= 0; i--) {
      const t = i / 12;
      ctx.lineTo(W * t, H * (0.80 + Math.sin(t * 5 + 1) * 0.07));
    }
    ctx.closePath();
    ctx.fill();
  } else {
    // Canals: three bands across the plan.
    for (let i = 0; i < 3; i++) {
      const y = H * (0.30 + i * 0.20);
      ctx.fillRect(W * 0.10, y, W * 0.78, H * 0.026);
    }
    ctx.fillRect(W * 0.30, H * 0.22, W * 0.028, H * 0.56);
  }
  // A drawn shoreline.
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

function drawCitadel(p: Page, pal: Palette, kind: NonNullable<Plan['citadel']>): void {
  if (kind === 'none') return;
  const { ctx } = p;
  const cx = px(p, CENTRE[0]);
  const cy = py(p, CENTRE[1]);
  ctx.save();
  ctx.strokeStyle = pal.ink;
  ctx.fillStyle = pal.accent;
  ctx.lineWidth = 2;
  if (kind === 'keep') {
    ctx.globalAlpha = 0.30;
    ctx.fillRect(cx - p.H * 0.075, cy - p.H * 0.075, p.H * 0.15, p.H * 0.15);
    ctx.globalAlpha = 0.9;
    ctx.strokeRect(cx - p.H * 0.075, cy - p.H * 0.075, p.H * 0.15, p.H * 0.15);
    // Spires.
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * p.H * 0.055, cy + Math.sin(a) * p.H * 0.055, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'tower') {
    for (let i = 5; i >= 1; i--) {
      const r = p.H * 0.020 * i;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Terraces stepping down to the water.
    ctx.globalAlpha = 0.65;
    for (let i = 1; i <= 9; i++) {
      const r = p.H * 0.035 * i;
      ctx.beginPath();
      ctx.arc(cx, py(p, 0.86), r, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawOutskirts(p: Page, pal: Palette, n: number): void {
  const { ctx } = p;
  ctx.save();
  ctx.strokeStyle = pal.inkSoft;
  ctx.fillStyle = pal.block;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const a = p.rnd() * Math.PI * 2;
    const d = 0.40 + p.rnd() * 0.12;
    const u = CENTRE[0] + Math.cos(a) * rx(p, d);
    const v = CENTRE[1] + Math.sin(a) * d;
    if (u < 0.07 || u > 0.93 || v < 0.09 || v > 0.91) continue;
    const s = p.H * (0.012 + p.rnd() * 0.018);
    ctx.beginPath();
    ctx.rect(px(p, u), py(p, v), s, s * 0.7);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawLattice(p: Page, pal: Palette): void {
  const { ctx, W, H } = p;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 22; i++) {
    const cyan = i % 2 === 0;
    ctx.strokeStyle = cyan ? pal.ink : pal.accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = cyan ? pal.ink : pal.accent;
    ctx.shadowBlur = 10;
    const horiz = p.rnd() > 0.45;
    if (horiz) {
      const y = H * (0.12 + p.rnd() * 0.76);
      ctx.beginPath();
      ctx.moveTo(W * 0.06, y);
      ctx.lineTo(W * 0.94, y);
      ctx.stroke();
    } else {
      const x = W * (0.08 + p.rnd() * 0.84);
      ctx.beginPath();
      ctx.moveTo(x, H * 0.08);
      ctx.lineTo(x, H * 0.92);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawTrack(p: Page, pal: Palette): void {
  const { ctx, W, H } = p;
  ctx.save();
  ctx.strokeStyle = pal.ink;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const y = H * (0.42 + i * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + H * 0.04);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // The dawn line the city is running from.
  const g = ctx.createLinearGradient(W * 0.62, 0, W, 0);
  g.addColorStop(0, 'rgba(255,190,110,0)');
  g.addColorStop(1, 'rgba(255,190,110,0.45)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.fillRect(W * 0.62, 0, W * 0.38, H);
  ctx.restore();
}

/* -------------------------------------------------------------------------
 * one plate per kind
 * ---------------------------------------------------------------------- */

const PLANS: Record<CityKind, Plan> = {
  urithiru: { pal: VORIN, radial: { rings: 6, spokes: 10, wall: false, gates: 0 }, citadel: 'tower', water: 'none' },
  kholinar: { pal: VORIN, radial: { rings: 4, spokes: 8, wall: true, gates: 6 }, citadel: 'keep', water: 'none', outskirts: 26 },
  kharbranth: { pal: VORIN, water: 'bay', citadel: 'terraces', grid: { cols: 7, rows: 4, tilt: -0.10 }, outskirts: 14 },
  luthadel: { pal: SCADRIAL, radial: { rings: 3, spokes: 12, wall: true, gates: 8 }, citadel: 'keep', water: 'river', outskirts: 30 },
  elendel: { pal: SCADRIAL, grid: { cols: 12, rows: 8, tilt: 0.06 }, citadel: 'tower', water: 'canals', outskirts: 22 },
  elantris: { pal: SELISH, radial: { rings: 5, spokes: 4, wall: true, gates: 4 }, citadel: 'tower', water: 'none', outskirts: 34 },
  ttelir: { pal: NALTHIS, grid: { cols: 9, rows: 6, tilt: -0.05 }, citadel: 'keep', water: 'bay', outskirts: 18 },
  kilahito: { pal: KOMASHI, lattice: true, grid: { cols: 8, rows: 5, tilt: 0 }, citadel: 'none', water: 'none' },
  kezare: { pal: TALDAIN, radial: { rings: 4, spokes: 6, wall: false, gates: 0 }, citadel: 'keep', water: 'river', outskirts: 24 },
  hover: { pal: CANTICLE, track: true, radial: { rings: 3, spokes: 6, wall: true, gates: 3 }, citadel: 'tower', water: 'none' },
};

const cache = new Map<string, HTMLCanvasElement>();

export function bakeCityMap(id: string, W = 800, H = 400): HTMLCanvasElement | null {
  const spec = cityById[id];
  if (!spec) return null;
  const key = `${id}:${W}x${H}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 100000;
  const p = page(W, H, seed + 1);
  const plan = PLANS[spec.kind];
  const pal = plan.pal;

  sheet(p, pal);
  if (plan.water) drawWater(p, pal, plan.water);
  if (plan.track) drawTrack(p, pal);
  if (plan.grid) drawGrid(p, pal, plan.grid);
  if (plan.radial) drawRadial(p, pal, plan.radial);
  if (plan.lattice) drawLattice(p, pal);
  if (plan.outskirts) drawOutskirts(p, pal, plan.outskirts);
  if (plan.citadel) drawCitadel(p, pal, plan.citadel);
  frame(p, pal);
  compass(p, 0.90, 0.19, pal);
  scaleBar(p, pal);

  cache.set(key, p.canvas);
  return p.canvas;
}
