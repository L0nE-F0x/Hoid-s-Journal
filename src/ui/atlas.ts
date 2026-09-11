import { bakeCityMap } from '../cartography/cityMap.ts';
import { bakePlanetMap, seedFromId } from '../cartography/planetMap.ts';
import {
  bodyById,
  canEnterCity,
  charactersOnBody,
  cityById,
  isNewThisArc,
  isVisible,
  landmarkById,
  locationsOn,
  perpAt,
  scadrialBiome,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';
import '../styles/atlas.css';

const W = 800;
const H = 400;
/** How much of the world map a local scan covers, in UV. */
const LOCAL_U = 0.20;
const LOCAL_V = 0.20;

function wrapDelta(du: number): number {
  if (du > 0.5) return du - 1;
  if (du < -0.5) return du + 1;
  return du;
}

/** World-map UV → local-scan UV, or null if the pin is outside the window. */
function localUv(focusU: number, focusV: number, u: number, v: number): { u: number; v: number } | null {
  const lu = 0.5 + wrapDelta(u - focusU) / LOCAL_U;
  const lv = 0.5 + (v - focusV) / LOCAL_V;
  if (lu < 0 || lu > 1 || lv < 0 || lv > 1) return null;
  return { u: lu, v: lv };
}

/** The atlas is on whenever a world is the subject and we are down at it. */
export function atlasIsOpen(): boolean {
  const s = store.state;
  return s.shell === 'play' && !!s.focusedBody &&
    (s.scale === 'globe' || s.scale === 'surface' || s.scale === 'city');
}

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
   * Report the edge this panel actually covers. It is a left column on a
   * desktop and a bottom sheet on a phone, so measure rather than assume.
   */
  const measure = () => {
    if (!panel.classList.contains('is-on')) {
      store.setInset('atlas', null);
      return;
    }
    const r = panel.getBoundingClientRect();
    if (r.width > window.innerWidth * 0.5) {
      const top = r.top < window.innerHeight * 0.4;
      store.setInset('atlas', top
        ? { top: Math.round(r.bottom + 10) }
        : { bottom: Math.round(window.innerHeight - r.top + 10) });
    } else {
      store.setInset('atlas', { left: Math.round(r.right + 12) });
    }
  };

  const visibleLocations = () => {
    const s = store.state;
    if (!s.focusedBody) return [];
    return locationsOn(s.focusedBody, s.era).filter((l) => {
      if (!isVisible(l, s.readProgress)) return false;
      if (s.realm === 'cognitive') {
        return l.realm === 'cognitive' || !!perpAt(l.id);
      }
      return l.realm !== 'cognitive';
    });
  };

  const worldMap = () => {
    const s = store.state;
    const body = s.focusedBody ? bodyById[s.focusedBody] : undefined;
    if (!body) return null;
    const biome = body.id === 'scadrial' ? scadrialBiome(s.era) : body.biome;
    return bakePlanetMap(biome, seedFromId(body.id), 1024, 512, s.realm === 'cognitive');
  };

  const blitLocal = (ctx: CanvasRenderingContext2D, map: HTMLCanvasElement, fu: number, fv: number) => {
    const mw = map.width;
    const mh = map.height;
    const sw = LOCAL_U * mw;
    const sh = LOCAL_V * mh;
    const sx = (((fu - LOCAL_U / 2) % 1) + 1) % 1 * mw;
    const sy = Math.max(0, Math.min(mh - sh, (fv - LOCAL_V / 2) * mh));
    if (sx + sw <= mw) {
      ctx.drawImage(map, sx, sy, sw, sh, 0, 0, W, H);
      return;
    }
    const w1 = mw - sx;
    const frac = w1 / sw;
    ctx.drawImage(map, sx, sy, w1, sh, 0, 0, W * frac, H);
    ctx.drawImage(map, 0, sy, sw - w1, sh, W * frac, 0, W * (1 - frac), H);
  };

  const composeMap = () => {
    const s = store.state;
    const ctx = mapLayer.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (s.scale === 'city' && s.focusedLocation) {
      const plate = bakeCityMap(s.focusedLocation, W, H);
      if (plate) {
        ctx.drawImage(plate, 0, 0, W, H);
        return;
      }
      const loc = locationsOn(s.focusedBody ?? '', s.era).find((l) => l.id === s.focusedLocation);
      const map = worldMap();
      if (loc && map) { blitLocal(ctx, map, loc.u, loc.v); return; }
    }
    const map = worldMap();
    if (map) ctx.drawImage(map, 0, 0, W, H);
  };

  const pinRows = (): { id: string; name: string; u: number; v: number; color: string }[] => {
    const s = store.state;
    if (s.scale === 'city' && s.focusedLocation && cityById[s.focusedLocation]) {
      return cityById[s.focusedLocation]!.landmarks
        .filter((m) => isVisible(m, s.readProgress))
        .map((m) => ({ id: m.id, name: m.name, u: m.u, v: m.v, color: m.color }));
    }
    if (s.scale === 'city' && s.focusedLocation) {
      const focus = visibleLocations().find((l) => l.id === s.focusedLocation);
      if (!focus) return [];
      const rows = [];
      for (const loc of visibleLocations()) {
        const uv = localUv(focus.u, focus.v, loc.u, loc.v);
        if (uv) rows.push({ id: loc.id, name: loc.name, u: uv.u, v: uv.v, color: loc.color });
      }
      return rows;
    }
    return visibleLocations().map((l) => ({ id: l.id, name: l.name, u: l.u, v: l.v, color: l.color }));
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
    const rows = pinRows();
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
    const plate = s.scale === 'city' && s.focusedLocation ? cityById[s.focusedLocation] : undefined;
    if (plate) {
      roster.append(el('div', { className: 'ceph-kicker', text: 'On this plate', style: { width: '100%' } }));
      for (const m of plate.landmarks) {
        if (!isVisible(m, s.readProgress)) continue;
        const chip = el('button', {
          className: 'ceph-atlas-chip',
          text: m.name,
          style: { borderColor: m.color },
        });
        listen(chip, 'click', () => store.set('selected', m.id));
        roster.append(chip);
      }
    }
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

    if (s.focusedBody === 'roshar' && s.realm === 'physical' && s.scale !== 'city') {
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
    const show = atlasIsOpen();
    panel.classList.toggle('is-on', show);
    measure();
    if (!show || !s.focusedBody) return;
    const body = bodyById[s.focusedBody];
    if (!body) return;
    const loc = s.focusedLocation
      ? visibleLocations().find((l) => l.id === s.focusedLocation)
      : undefined;
    if (s.scale === 'city' && loc) {
      kicker.textContent = cityById[loc.id] ? 'City plate' : 'Local scan';
      title.textContent = loc.name;
    } else {
      kicker.textContent = 'Cartography';
      title.textContent = s.realm === 'cognitive' ? `${body.name} · Shadesmar` : body.name;
    }
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
    for (const row of pinRows()) {
      const d = Math.hypot(row.u - u, row.v - v);
      if (d < 0.045 && (!best || d < best.d)) best = { id: row.id, d };
    }
    if (!best) {
      if (!click && store.state.hovered) store.set('hovered', null);
      return;
    }
    if (!click) { store.set('hovered', best.id); return; }
    const s = store.state;
    const landmark = landmarkById[best.id];
    if (landmark) {
      store.set('selected', landmark.id);
      return;
    }
    const loc = visibleLocations().find((l) => l.id === best.id);
    if (!loc) return;
    const dive = s.focusedLocation === loc.id
      && (s.scale === 'surface' || s.scale === 'city')
      && canEnterCity(loc, s.era, s.realm);
    store.set('cameraCue', { kind: 'focus', id: loc.id, scale: dive ? 'city' : 'surface' });
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
    store.on('focusedLocation', () => {
      if (store.state.scale === 'city') refresh();
      else { composePins(); paint(); }
    }),
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
