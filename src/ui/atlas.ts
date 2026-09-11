import { bakePlanetMap, seedFromId } from '../cartography/planetMap.ts';
import {
  bodyById,
  charactersOnBody,
  isVisible,
  locationsOn,
  scadrialBiome,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';
import '../styles/atlas.css';

export function mountAtlas(root: HTMLElement): { destroy(): void } {
  const canvas = el('canvas', { className: 'ceph-atlas-canvas', attrs: { width: '800', height: '400' } });
  const title = el('div', { className: 'ceph-atlas-title', text: 'Surface scan' });
  const kicker = el('div', { className: 'ceph-kicker', text: 'Cartography' });
  const roster = el('div', { className: 'ceph-atlas-roster' });
  const panel = el('div', { className: 'ceph-panel ceph-atlas' }, [
    el('div', { className: 'ceph-atlas-head' }, [kicker, title]),
    canvas,
    roster,
  ]);
  root.append(panel);

  /**
   * The atlas owns the left and top insets; the HUD owns right and bottom.
   * Measured rather than assumed, because the panel goes full-width on a phone
   * and the roster grows with the era.
   */
  const measure = () => {
    if (!panel.classList.contains('is-on')) {
      store.patchInsets({ left: 0, top: 0 });
      return;
    }
    const r = panel.getBoundingClientRect();
    if (r.width > window.innerWidth * 0.5) {
      store.patchInsets({ left: 0, top: Math.round(r.bottom + 12) });
    } else {
      store.patchInsets({ left: Math.round(r.right + 12), top: 0 });
    }
  };

  /** `remeasure` is false on the animation loop: it forces a layout. */
  const paint = (remeasure = true) => {
    const s = store.state;
    const show = s.shell === 'play' && !!s.focusedBody && (s.scale === 'globe' || s.scale === 'surface' || s.scale === 'city');
    panel.classList.toggle('is-on', show);
    if (!show || !s.focusedBody) { if (remeasure) measure(); return; }

    const body = bodyById[s.focusedBody];
    if (!body) return;
    title.textContent = body.name;
    const biome = body.id === 'scadrial' ? scadrialBiome(s.era) : body.biome;
    const src = bakePlanetMap(biome, seedFromId(body.id));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.drawImage(src, 0, 0, w, h);

    if (body.id === 'roshar' && s.realm === 'physical') {
      const t = (performance.now() / 1000) * 0.022;
      const x = ((0.5 - (t % 1) + 1) % 1) * w;
      const g = ctx.createLinearGradient(x - 28, 0, x + 28, 0);
      g.addColorStop(0, 'rgba(94,231,255,0)');
      g.addColorStop(0.5, 'rgba(186,230,255,0.45)');
      g.addColorStop(1, 'rgba(94,231,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 28, h * 0.12, 56, h * 0.76);
    }

    const locs = locationsOn(body.id, s.era).filter((l) => isVisible(l, s.readProgress));
    for (const loc of locs) {
      if (s.realm === 'cognitive' && loc.realm !== 'cognitive') continue;
      if (s.realm !== 'cognitive' && loc.realm === 'cognitive') continue;
      const px = loc.u * w;
      const py = loc.v * h;
      const hot = s.selected === loc.id || s.hovered === loc.id || s.focusedLocation === loc.id;
      ctx.beginPath();
      ctx.arc(px, py, hot ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = loc.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = hot ? '#eaf4ff' : 'rgba(5,6,13,0.7)';
      ctx.stroke();
      ctx.font = '600 13px Inter, ui-sans-serif, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(5,6,13,0.75)';
      ctx.fillText(loc.name, px + 9, py + 1);
      ctx.fillStyle = hot ? '#eaf4ff' : '#dce6f5';
      ctx.fillText(loc.name, px + 8, py);
    }

    roster.replaceChildren();
    const people = charactersOnBody(body.id, s.era).filter((c) => isVisible(c, s.readProgress));
    if (people.length) {
      roster.append(el('div', { className: 'ceph-kicker', text: 'Present this era', style: { width: '100%' } }));
    }
    for (const c of people) {
      const chip = el('button', { className: 'ceph-atlas-chip', text: c.name, style: { borderColor: c.color } });
      listen(chip, 'click', () => store.set('selected', c.id));
      roster.append(chip);
    }
    if (remeasure) measure();
  };

  const hitTest = (ev: MouseEvent, click: boolean) => {
    const s = store.state;
    if (!s.focusedBody) return;
    const rect = canvas.getBoundingClientRect();
    const u = (ev.clientX - rect.left) / rect.width;
    const v = (ev.clientY - rect.top) / rect.height;
    let best: { id: string; d: number } | null = null;
    for (const loc of locationsOn(s.focusedBody, s.era)) {
      if (!isVisible(loc, s.readProgress)) continue;
      if (s.realm === 'cognitive' && loc.realm !== 'cognitive') continue;
      if (s.realm !== 'cognitive' && loc.realm === 'cognitive') continue;
      const d = Math.hypot(loc.u - u, loc.v - v);
      if (d < 0.045 && (!best || d < best.d)) best = { id: loc.id, d };
    }
    if (!best) return;
    if (click) {
      store.set('selected', best.id);
      store.set('focusedLocation', best.id);
      store.set('scale', 'surface');
    } else {
      store.set('hovered', best.id);
    }
  };

  const offs = [
    listen(canvas, 'click', (e) => hitTest(e as MouseEvent, true)),
    listen(canvas, 'mousemove', (e) => hitTest(e as MouseEvent, false)),
    store.on('focusedBody', () => paint()),
    store.on('scale', () => paint()),
    store.on('era', () => paint()),
    store.on('realm', () => paint()),
    store.on('shell', () => paint()),
    store.on('selected', () => paint()),
    store.on('hovered', () => paint()),
    store.on('readProgress', () => paint()),
    store.on('focusedLocation', () => paint()),
    listen(window, 'resize', () => paint()),
  ];

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (store.state.focusedBody === 'roshar' && panel.classList.contains('is-on')) paint(false);
  };
  loop();
  paint();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach((o) => o());
      panel.remove();
    },
  };
}
