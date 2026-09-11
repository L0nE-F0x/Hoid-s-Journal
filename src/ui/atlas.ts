import { bakePlanetMap, seedFromId } from '../cartography/planetMap.ts';
import {
  bodyById,
  charactersOnBody,
  isNewThisArc,
  isVisible,
  locationsOn,
  scadrialBiome,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';
import '../styles/atlas.css';

const W = 800;
const H = 400;

function layer(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
}

export function mountAtlas(root: HTMLElement): { destroy(): void } {
  const canvas = el('canvas', { className: 'ceph-atlas-canvas', attrs: { width: String(W), height: String(H) } });
  const title = el('div', { className: 'ceph-atlas-title', text: 'Surface scan' });
  const kicker = el('div', { className: 'ceph-kicker', text: 'Cartography' });
  const roster = el('div', { className: 'ceph-atlas-roster' });
  const panel = el('div', { className: 'ceph-panel ceph-atlas' }, [
    el('div', { className: 'ceph-atlas-head' }, [kicker, title]),
    canvas,
    roster,
  ]);
  root.append(panel);

  // The map and the pins are each composed once per change and blitted every
  // frame. Re-running the pin labels at 60fps was the old cost.
  const mapLayer = layer();
  const pinLayer = layer();

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

  const visibleLocations = () => {
    const s = store.state;
    if (!s.focusedBody) return [];
    return locationsOn(s.focusedBody, s.era).filter((l) => {
      if (!isVisible(l, s.readProgress)) return false;
      return (s.realm === 'cognitive') === (l.realm === 'cognitive');
    });
  };

  const composeMap = () => {
    const s = store.state;
    const body = s.focusedBody ? bodyById[s.focusedBody] : undefined;
    const ctx = mapLayer.getContext('2d');
    if (!ctx || !body) return;
    const biome = body.id === 'scadrial' ? scadrialBiome(s.era) : body.biome;
    const cognitive = s.realm === 'cognitive';
    ctx.drawImage(bakePlanetMap(biome, seedFromId(body.id), 1024, 512, cognitive), 0, 0, W, H);
  };

  /**
   * Pins first, then as many names as fit. A crowded continent gets dots and
   * the names that do not collide, rather than a wall of overlapping text; the
   * selected place always keeps its label.
   */
  const composePins = () => {
    const s = store.state;
    const ctx = pinLayer.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const rows = visibleLocations();
    const isHot = (id: string) => s.selected === id || s.hovered === id || s.focusedLocation === id;

    for (const loc of rows) {
      const px = loc.u * W;
      const py = loc.v * H;
      const hot = isHot(loc.id);
      if (hot) {
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234,244,255,0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(px, py, hot ? 10 : 6.5, 0, Math.PI * 2);
      ctx.fillStyle = loc.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = hot ? '#eaf4ff' : 'rgba(5,6,13,0.75)';
      ctx.stroke();
    }

    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const ordered = [...rows].sort((a, b) => Number(isHot(b.id)) - Number(isHot(a.id)));
    for (const loc of ordered) {
      const hot = isHot(loc.id);
      ctx.font = `${hot ? 700 : 600} 22px Inter, ui-sans-serif, sans-serif`;
      const w = ctx.measureText(loc.name).width;
      const x = loc.u * W + (hot ? 26 : 14);
      const y = loc.v * H;
      const box = { x0: x - 4, y0: y - 13, x1: x + w + 4, y1: y + 13 };
      if (box.x1 > W || box.y0 < 0 || box.y1 > H) continue;
      if (placed.some((r) => box.x0 < r.x1 && box.x1 > r.x0 && box.y0 < r.y1 && box.y1 > r.y0)) continue;
      placed.push(box);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(5,6,13,0.85)';
      ctx.strokeText(loc.name, x, y);
      ctx.fillStyle = hot ? '#eaf4ff' : '#dce6f5';
      ctx.fillText(loc.name, x, y);
    }
  };

  const composeRoster = () => {
    const s = store.state;
    roster.replaceChildren();
    if (!s.focusedBody) return;
    const people = charactersOnBody(s.focusedBody, s.era).filter((c) => isVisible(c, s.readProgress));
    if (people.length) {
      roster.append(el('div', { className: 'ceph-kicker', text: 'Present this era', style: { width: '100%' } }));
    }
    for (const c of people) {
      const fresh = isNewThisArc(c, s.readingNow);
      const chip = el('button', {
        className: 'ceph-atlas-chip',
        text: fresh ? `✦ ${c.name}` : c.name,
        style: { borderColor: fresh ? 'var(--ceph-amber)' : c.color },
      });
      listen(chip, 'click', () => store.set('selected', c.id));
      roster.append(chip);
    }
  };

  /** One blit of each layer, plus whatever genuinely moves. */
  const paint = () => {
    const s = store.state;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(mapLayer, 0, 0);

    if (s.focusedBody === 'roshar' && s.realm === 'physical') {
      const t = (performance.now() / 1000) * 0.022;
      const x = ((0.5 - (t % 1) + 1) % 1) * W;
      const g = ctx.createLinearGradient(x - 28, 0, x + 28, 0);
      g.addColorStop(0, 'rgba(94,231,255,0)');
      g.addColorStop(0.5, 'rgba(186,230,255,0.45)');
      g.addColorStop(1, 'rgba(94,231,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 28, H * 0.12, 56, H * 0.76);
    }

    ctx.drawImage(pinLayer, 0, 0);
  };

  const refresh = () => {
    const s = store.state;
    const show = s.shell === 'play' && !!s.focusedBody &&
      (s.scale === 'globe' || s.scale === 'surface' || s.scale === 'city');
    panel.classList.toggle('is-on', show);
    measure();
    if (!show || !s.focusedBody) return;
    const body = bodyById[s.focusedBody];
    if (!body) return;
    title.textContent = s.realm === 'cognitive' ? `${body.name} · Shadesmar` : body.name;
    composeMap();
    composePins();
    composeRoster();
    paint();
  };

  const hitTest = (ev: MouseEvent, click: boolean) => {
    const rect = canvas.getBoundingClientRect();
    const u = (ev.clientX - rect.left) / rect.width;
    const v = (ev.clientY - rect.top) / rect.height;
    let best: { id: string; d: number } | null = null;
    for (const loc of visibleLocations()) {
      const d = Math.hypot(loc.u - u, loc.v - v);
      if (d < 0.045 && (!best || d < best.d)) best = { id: loc.id, d };
    }
    if (!best) {
      if (!click && store.state.hovered) store.set('hovered', null);
      return;
    }
    // A pin on the map is a place on the world: turn the globe to face it.
    if (click) store.set('cameraCue', { kind: 'focus', id: best.id, scale: 'surface' });
    else store.set('hovered', best.id);
  };

  const offs = [
    listen(canvas, 'click', (e) => hitTest(e as MouseEvent, true)),
    listen(canvas, 'mousemove', (e) => hitTest(e as MouseEvent, false)),
    listen(canvas, 'mouseleave', () => { if (store.state.hovered) store.set('hovered', null); }),
    listen(window, 'resize', () => measure()),
    store.on('focusedBody', refresh),
    store.on('scale', refresh),
    store.on('era', refresh),
    store.on('realm', refresh),
    store.on('shell', refresh),
    store.on('selected', () => { composePins(); paint(); }),
    store.on('hovered', () => { composePins(); paint(); }),
    store.on('focusedLocation', () => { composePins(); paint(); }),
    store.on('readProgress', refresh),
    store.on('readingNow', refresh),
  ];

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (store.state.focusedBody === 'roshar' && panel.classList.contains('is-on')) paint();
  };
  loop();
  refresh();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach((o) => o());
      panel.remove();
    },
  };
}
