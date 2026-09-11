/**
 * A 2-D chart of the designed Cosmere layout. No Three — positions come
 * from the catalog, clicks only set store cues.
 */
import { COSMERE, isVisible } from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';
import '../styles/minimap.css';

const W = 200;
const H = 156;

export function mountMinimap(root: HTMLElement): { destroy(): void } {
  const canvas = el('canvas', { className: 'ceph-mm-canvas', attrs: { width: String(W), height: String(H) } });
  const label = el('div', { className: 'ceph-kicker', text: 'Galaxy' });
  const hide = el('button', {
    className: 'ceph-btn ceph-icon-btn ceph-mm-hide',
    text: '×',
    attrs: { type: 'button', title: 'Hide galaxy chart (M)' },
  });
  const panel = el('div', { className: 'ceph-panel ceph-minimap' }, [
    el('div', { className: 'ceph-mm-head' }, [label, hide]),
    canvas,
  ]);
  const restore = el('button', {
    className: 'ceph-btn ceph-mm-restore',
    text: 'Galaxy',
    attrs: { type: 'button', title: 'Show galaxy chart (M)' },
  });
  root.append(panel, restore);

  const pts = () => {
    const xs = COSMERE.systems.map((s) => s.position[0]);
    const zs = COSMERE.systems.map((s) => s.position[2]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const pad = 18;
    const sx = (W - pad * 2) / Math.max(1e-3, maxX - minX);
    const sz = (H - pad * 2) / Math.max(1e-3, maxZ - minZ);
    const k = Math.min(sx, sz);
    return COSMERE.systems.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.sunColor,
      x: pad + (s.position[0] - minX) * k,
      y: pad + (s.position[2] - minZ) * k,
    }));
  };

  const paint = () => {
    const s = store.state;
    const room = s.shell === 'play' && s.realm !== 'spiritual' && s.view !== 'web';
    const show = room && s.chrome.minimap && !s.selected;
    panel.classList.toggle('is-on', show);
    restore.classList.toggle('is-on', room && !s.chrome.minimap && !s.selected);
    if (!show) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const rows = pts();
    for (const p of rows) {
      if (!isVisible(COSMERE.systems.find((x) => x.id === p.id)!, s.readProgress)) continue;
      const hot = p.id === s.focusedSystem;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hot ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      if (hot) {
        ctx.strokeStyle = 'rgba(234,244,255,0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = hot ? '#eaf4ff' : 'rgba(220,230,245,0.7)';
      ctx.font = `${hot ? 600 : 500} 9px Inter, ui-sans-serif, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(p.name, p.x + 7, p.y + 3);
    }
  };

  const hit = (ev: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * W;
    const y = ((ev.clientY - r.top) / r.height) * H;
    let best: { id: string; d: number } | null = null;
    for (const p of pts()) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 14 && (!best || d < best.d)) best = { id: p.id, d };
    }
    if (!best) return;
    store.set('cameraCue', { kind: 'focus', id: best.id, scale: 'system' });
  };

  const offs = [
    listen(canvas, 'click', (e) => hit(e as MouseEvent)),
    listen(hide, 'click', () => store.patchChrome({ minimap: false })),
    listen(restore, 'click', () => store.patchChrome({ minimap: true })),
    store.on('shell', paint),
    store.on('realm', paint),
    store.on('focusedSystem', paint),
    store.on('readProgress', paint),
    store.on('view', paint),
    store.on('chrome', paint),
    store.on('selected', paint),
  ];
  paint();
  return { destroy() { offs.forEach((o) => o()); panel.remove(); restore.remove(); } };
}
