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
    ctx.drawImage(bakePlanetMap(biome, seedFromId(body.id)), 0, 0, W, H);
  };

  const composePins = () => {
    const s = store.state;
    const ctx = pinLayer.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (const loc of visibleLocations()) {
      const px = loc.u * W;
      const py = loc.v * H;
      const hot = s.selected === loc.id || s.hovered === loc.id || s.focusedLocation === loc.id;
      if (hot) {
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234,244,255,0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(px, py, hot ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = loc.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = hot ? '#eaf4ff' : 'rgba(5,6,13,0.7)';
      ctx.stroke();
      ctx.font = `${hot ? 700 : 600} 13px Inter, ui-sans-serif, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(5,6,13,0.75)';
      ctx.fillText(loc.name, px + (hot ? 18 : 9), py + 1);
      ctx.fillStyle = hot ? '#eaf4ff' : '#dce6f5';
      ctx.fillText(loc.name, px + (hot ? 17 : 8), py);
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
      const chip = el('button', { className: 'ceph-atlas-chip', text: c.name, style: { borderColor: c.color } });
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
    title.textContent = body.name;
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
