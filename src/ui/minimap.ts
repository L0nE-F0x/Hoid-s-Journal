/**
 * A 2-D chart of the designed Cosmere layout. No Three — positions come
 * from the catalog, clicks only set store cues.
 *
 * It is a survey plate, not a scatter plot: each star wears the faint cloud
 * the sky already gives that system, names dodge each other, and the one you
 * are in is the only mark in the signal colour.
 */
import { COSMERE, systemOnTheMap } from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';
import '../styles/minimap.css';

const W = 280;
const H = 214;

interface ChartStar {
  id: string;
  name: string;
  /** The star's own light. */
  color: string;
  /** The Investiture cloud, ours, which is how the systems stay apart. */
  nebula: string;
  scale: number;
  x: number;
  y: number;
}

interface Box { x0: number; y0: number; x1: number; y1: number }

function hexAlpha(hex: string, a: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Stable dust, so the plate does not shimmer every time it repaints. */
function dust(i: number): number {
  let h = (Math.imul(i + 1, 0x9e3779b1) ^ 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function mountMinimap(root: HTMLElement): { destroy(): void } {
  const canvas = el('canvas', {
    className: 'ceph-mm-canvas',
    attrs: {
      width: String(W),
      height: String(H),
      role: 'img',
      'aria-label': 'A chart of the systems. Click a star to travel there.',
    },
  });
  const label = el('div', { className: 'ceph-kicker', text: 'Galaxy' });
  const footName = el('div', { className: 'ceph-mm-foot-name', text: '' });
  const footMeta = el('div', { className: 'ceph-mm-foot-meta', text: '' });
  const hide = el('button', {
    className: 'ceph-btn ceph-icon-btn ceph-mm-hide',
    text: '×',
    attrs: { type: 'button', title: 'Hide galaxy chart (M)' },
  });
  const panel = el('div', { className: 'ceph-panel ceph-minimap' }, [
    el('div', { className: 'ceph-mm-head' }, [label, hide]),
    canvas,
    el('div', { className: 'ceph-mm-foot' }, [footName, footMeta]),
  ]);
  const restore = el('button', {
    className: 'ceph-btn ceph-mm-restore',
    text: 'Galaxy',
    attrs: { type: 'button', title: 'Show galaxy chart (M)' },
  });
  root.append(panel, restore);

  let hoverId: string | null = null;
  let rows: ChartStar[] = [];

  const layout = (): ChartStar[] => {
    const s = store.state;
    const live = COSMERE.systems.filter((sys) => systemOnTheMap(sys.id, s.readProgress, s.era));
    if (!live.length) return [];
    const xs = live.map((sys) => sys.position[0]);
    const zs = live.map((sys) => sys.position[2]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const pad = 22;
    const k = Math.min(
      (W - pad * 2) / Math.max(1e-3, maxX - minX),
      (H - pad * 2) / Math.max(1e-3, maxZ - minZ),
    );
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    return live.map((sys) => ({
      id: sys.id,
      name: sys.name,
      color: sys.sunColor,
      nebula: sys.nebula,
      scale: sys.nebulaScale ?? 1,
      x: W / 2 + (sys.position[0] - cx) * k,
      y: H / 2 + (sys.position[2] - cz) * k,
    }));
  };

  const paint = () => {
    const s = store.state;
    const room = s.shell === 'play' && !s.cinematic
      && s.realm !== 'spiritual' && s.view !== 'web';
    const show = room && s.chrome.minimap && !s.selected;
    panel.classList.toggle('is-on', show);
    restore.classList.toggle('is-on', room && !s.chrome.minimap && !s.selected);
    if (!show) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    rows = layout();
    const here = s.focusedSystem;
    const hotId = hoverId && rows.some((p) => p.id === hoverId) ? hoverId : here;

    // Corner ticks, the way a plate is registered, not a box around the data.
    ctx.strokeStyle = 'rgba(206, 221, 255, 0.28)';
    ctx.lineWidth = 1;
    const m = 6;
    const len = 9;
    ctx.beginPath();
    for (const [x, y, sx, sy] of [
      [m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1],
    ] as const) {
      ctx.moveTo(x, y + sy * len);
      ctx.lineTo(x, y);
      ctx.lineTo(x + sx * len, y);
    }
    ctx.stroke();

    for (let i = 0; i < 48; i++) {
      const x = 12 + dust(i) * (W - 24);
      const y = 12 + dust(i + 90) * (H - 24);
      ctx.fillStyle = `rgba(220, 230, 245, ${0.08 + dust(i + 40) * 0.16})`;
      ctx.fillRect(x, y, dust(i + 7) > 0.82 ? 1.5 : 1, 1);
    }

    for (const p of rows) {
      const radius = 15 + 14 * p.scale;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      g.addColorStop(0, hexAlpha(p.nebula, p.id === here ? 0.42 : 0.26));
      g.addColorStop(0.55, hexAlpha(p.nebula, 0.08));
      g.addColorStop(1, hexAlpha(p.nebula, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const placed: Box[] = [];
    for (const p of rows) {
      const focus = p.id === here;
      const over = p.id === hoverId;
      const r = focus || over ? 3.1 : 2.15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 2.4, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(p.color, focus ? 0.28 : 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
      if (focus) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(111, 215, 232, 0.95)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (over) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 244, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      placed.push({ x0: p.x - 6, y0: p.y - 6, x1: p.x + 6, y1: p.y + 6 });
    }

    const order = [...rows].sort((a, b) => {
      const rank = (p: ChartStar) => (p.id === hotId ? 0 : p.id === here ? 1 : 2);
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });
    for (const p of order) {
      const emphasis = p.id === here || p.id === hoverId;
      ctx.font = `${emphasis ? 600 : 500} ${emphasis ? 11 : 10}px Inter, ui-sans-serif, sans-serif`;
      const w = ctx.measureText(p.name).width;
      const candidates: { x: number; y: number; align: CanvasTextAlign; box: Box }[] = [
        { x: p.x + 8, y: p.y + 3, align: 'left', box: { x0: p.x + 8, y0: p.y - 8, x1: p.x + 8 + w, y1: p.y + 5 } },
        { x: p.x - 8, y: p.y + 3, align: 'right', box: { x0: p.x - 8 - w, y0: p.y - 8, x1: p.x - 8, y1: p.y + 5 } },
        { x: p.x, y: p.y - 9, align: 'center', box: { x0: p.x - w / 2, y0: p.y - 20, x1: p.x + w / 2, y1: p.y - 8 } },
        { x: p.x, y: p.y + 16, align: 'center', box: { x0: p.x - w / 2, y0: p.y + 6, x1: p.x + w / 2, y1: p.y + 18 } },
      ];
      const fits = (b: Box) => b.x0 >= 4 && b.y0 >= 2 && b.x1 <= W - 4 && b.y1 <= H - 2
        && !placed.some((r) => b.x0 < r.x1 && b.x1 > r.x0 && b.y0 < r.y1 && b.y1 > r.y0);
      const spot = candidates.find((c) => fits(c.box)) ?? (emphasis ? candidates[0] : null);
      if (!spot) continue;
      placed.push(spot.box);
      ctx.textAlign = spot.align;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = emphasis ? '#eaf4ff' : 'rgba(214, 222, 238, 0.78)';
      ctx.fillText(p.name, spot.x, spot.y);
    }

    const named = rows.find((p) => p.id === hotId);
    const focused = rows.find((p) => p.id === here);
    if (named && hoverId === named.id && named.id !== here) {
      footName.textContent = named.name;
      footMeta.textContent = '';
    } else if (focused) {
      footName.textContent = focused.name;
      footMeta.textContent = 'You are here';
    } else {
      footName.textContent = rows.length === 1 ? 'One system' : `${rows.length} systems`;
      footMeta.textContent = '';
    }
    canvas.setAttribute('aria-label', named
      ? `${named.name}. Chart of the systems. Click a star to travel there.`
      : `Chart of ${rows.length} systems. Click a star to travel there.`);
  };

  const local = (ev: { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - r.left) / r.width) * W,
      y: ((ev.clientY - r.top) / r.height) * H,
    };
  };

  const pick = (x: number, y: number) => {
    let best: { id: string; d: number } | null = null;
    const limit = window.matchMedia('(pointer: coarse)').matches ? 22 : 14;
    for (const p of rows) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < limit && (!best || d < best.d)) best = { id: p.id, d };
    }
    return best?.id ?? null;
  };

  const offs = [
    listen(canvas, 'pointermove', (e) => {
      const ev = e as PointerEvent;
      const at = local(ev);
      const id = pick(at.x, at.y);
      if (id === hoverId) return;
      hoverId = id;
      paint();
    }),
    listen(canvas, 'pointerleave', () => {
      if (!hoverId) return;
      hoverId = null;
      paint();
    }),
    listen(canvas, 'click', (e) => {
      const at = local(e as MouseEvent);
      const id = pick(at.x, at.y);
      if (!id) return;
      store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
    }),
    listen(hide, 'click', () => store.patchChrome({ minimap: false })),
    listen(restore, 'click', () => store.patchChrome({ minimap: true })),
    listen(window, 'resize', () => paint()),
    store.on('shell', paint),
    store.on('realm', paint),
    store.on('focusedSystem', paint),
    store.on('readProgress', paint),
    store.on('era', paint),
    store.on('view', paint),
    store.on('chrome', paint),
    store.on('selected', paint),
    store.on('cinematic', paint),
  ];
  paint();
  return { destroy() { offs.forEach((o) => o()); panel.remove(); restore.remove(); } };
}
