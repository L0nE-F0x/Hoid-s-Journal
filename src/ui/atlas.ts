import { bakeCityMap } from '../cartography/cityMap.ts';
import { cityMapFile, cityMapLayers, getOfficialMap, MAP_CREDIT, worldMapFile, worldMapLayers } from '../cartography/officialMaps.ts';
import { bakePlanetMap, seedFromId } from '../cartography/planetMap.ts';
import { plateTint } from '../cartography/recipes.ts';
import {
  COSMERE,
  bodyById,
  canEnterCity,
  charactersOnBody,
  cityById,
  isFeaturedPerson,
  isNewThisArc,
  isVisible,
  landmarkById,
  locationsOn,
  onTheMap,
  perpAt,
  scadrialBiome,
  CATACENDRE_YEAR,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { announce, el, listen, setColumnBottom } from './dom.ts';
import '../styles/atlas.css';

const W = 800;
const H = 400;
const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  // The opening flight crosses three scales in twelve seconds. Panels that
  // slide in and out behind it turn a cinematic into a slideshow.
  return s.shell === 'play' && !s.cinematic && s.view !== 'web' && !!s.focusedBody &&
    (s.scale === 'globe' || s.scale === 'surface' || s.scale === 'city');
}

function layer(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
}

export function mountAtlas(root: HTMLElement): { destroy(): void } {
  // A plate is a picture, and a screen reader is handed a bare <canvas>
  // otherwise. The label tracks the heading, which already says what is drawn.
  const canvas = el('canvas', {
    className: 'ceph-atlas-canvas',
    attrs: { width: String(W), height: String(H), role: 'img', 'aria-label': 'Surface scan', tabindex: '0' },
  });
  const title = el('div', { className: 'ceph-atlas-title', text: 'Surface scan' });
  const kicker = el('div', { className: 'ceph-kicker', text: 'Cartography' });
  const roster = el('div', { className: 'ceph-atlas-roster' });
  /** Outside the roster, so "Show fewer" stays put while the list scrolls. */
  const rosterMore = el('div', { className: 'ceph-atlas-more-row' });
  const credit = el('div', { className: 'ceph-atlas-credit', text: '' });
  const layersEl = el('div', { className: 'ceph-atlas-layers' });
  const panel = el('div', { className: 'ceph-panel ceph-atlas' }, [
    el('div', { className: 'ceph-atlas-head' }, [kicker, title]),
    canvas,
    layersEl,
    credit,
    roster,
    rosterMore,
  ]);
  let plateLayer = 0;
  let plateKey = '';
  let basinPhase = '';
  /** What composeMap actually drew, so the pins use the same coordinate space. */
  let plateMode: 'official' | 'plan' | 'crop' | 'world' = 'world';
  /**
   * Where the plate sits on the canvas, as fractions of it. A pin's u/v is
   * 0–1 on its own file, so it lands at `x + u·w`, `y + v·h`.
   */
  let fit = { x: 0, y: 0, w: 1, h: 1 };

  /**
   * Draw a raster at its own shape. Every plate used to be stretched over
   * the 2:1 canvas, and most of them are not 2:1: Urithiru, Kholinar and the
   * Scadrian world map are portrait and came out squashed to a third of
   * their height. A plate within 15% of the canvas's shape (Roshar and
   * Shadesmar at 1.72) still fills it, as it always has; anything further
   * off is letterboxed, and the pins follow it.
   */
  const drawPlate = (ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }) => {
    const iw = (img as HTMLImageElement).naturalWidth || img.width;
    const ih = (img as HTMLImageElement).naturalHeight || img.height;
    const ratio = iw / ih / (W / H);
    if (!iw || !ih || (ratio > 0.85 && ratio < 1 / 0.85)) {
      fit = { x: 0, y: 0, w: 1, h: 1 };
      ctx.drawImage(img, 0, 0, W, H);
      return;
    }
    const w = ratio < 1 ? ratio : 1;
    const h = ratio < 1 ? 1 : 1 / ratio;
    fit = { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
    ctx.drawImage(img, fit.x * W, fit.y * H, fit.w * W, fit.h * H);
  };
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
      setColumnBottom('atlas', null);
      return;
    }
    const r = panel.getBoundingClientRect();
    setColumnBottom('atlas', r.bottom);
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
    return locationsOn(s.focusedBody, s.era, s.year, s.readProgress).filter((l) => {
      if (!isVisible(l, s.readProgress)) return false;
      if (s.realm === 'cognitive') {
        const door = perpAt(l.id);
        return l.realm === 'cognitive' || (!!door && onTheMap(door, s.readProgress, s.era));
      }
      return l.realm !== 'cognitive';
    });
  };

  const worldMap = () => {
    const s = store.state;
    const body = s.focusedBody ? bodyById[s.focusedBody] : undefined;
    if (!body) return null;
    const official = getOfficialMap(
      worldMapFile(body.id, s.era, s.realm === 'cognitive', plateLayer, s.year, s.readProgress),
      () => { composeMap(); composePins(); paint(); },
    );
    if (official) return official;
    const biome = body.id === 'scadrial' ? scadrialBiome(s.era, s.year, s.readProgress) : body.biome;
    return bakePlanetMap(biome, seedFromId(body.id), 512, 256, s.realm === 'cognitive',
      plateTint(body.kind, body.color));
  };

  const blitLocal = (ctx: CanvasRenderingContext2D, map: CanvasImageSource & { width: number; height: number }, fu: number, fv: number) => {
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
    fit = { x: 0, y: 0, w: 1, h: 1 };
    if (s.scale === 'city' && s.focusedLocation) {
      const raster = getOfficialMap(cityMapFile(s.focusedLocation, plateLayer), () => { composeMap(); composePins(); paint(); });
      if (raster) {
        plateMode = 'official';
        drawPlate(ctx, raster);
        return;
      }
      const plate = bakeCityMap(s.focusedLocation, W, H);
      if (plate) {
        plateMode = 'plan';
        ctx.drawImage(plate, 0, 0, W, H);
        return;
      }
      plateMode = 'crop';
      const loc = locationsOn(s.focusedBody ?? '', s.era, s.year, s.readProgress).find((l) => l.id === s.focusedLocation);
      const map = worldMap();
      if (loc && map) { blitLocal(ctx, map, loc.u, loc.v); return; }
    }
    plateMode = 'world';
    const map = worldMap();
    if (map) drawPlate(ctx, map);
  };

  /** A pin's place on the canvas, in canvas pixels. */
  const at = (u: number, v: number) => ({ x: (fit.x + u * fit.w) * W, y: (fit.y + v * fit.h) * H });

  const pinRows = (): { id: string; name: string; u: number; v: number; color: string }[] => {
    const s = store.state;
    if (s.scale === 'city' && s.focusedLocation && plateMode === 'official') {
      const file = cityMapFile(s.focusedLocation, plateLayer);
      const plate = cityById[s.focusedLocation];
      if (!file || !plate) return [];
      // World-map coordinates painted on a city drawing were a lie: Alethkar
      // sat on the palace plan. Only marks measured on this file are drawn.
      const rows = [];
      for (const m of plate.landmarks) {
        if (!isVisible(m, s.readProgress)) continue;
        const hit = m.on?.find((o) => o.file === file);
        if (!hit) continue;
        rows.push({ id: m.id, name: m.name, u: hit.u, v: hit.v, color: m.color });
      }
      return rows;
    }
    if (s.scale === 'city' && s.focusedLocation && plateMode === 'plan' && cityById[s.focusedLocation]) {
      return cityById[s.focusedLocation]!.landmarks
        .filter((m) => isVisible(m, s.readProgress))
        .map((m) => ({ id: m.id, name: m.name, u: m.u, v: m.v, color: m.color }));
    }
    if (s.scale === 'city' && s.focusedLocation && plateMode === 'crop') {
      const focus = visibleLocations().find((l) => l.id === s.focusedLocation);
      if (!focus) return [];
      const rows = [];
      for (const loc of visibleLocations()) {
        const uv = localUv(focus.u, focus.v, loc.u, loc.v);
        if (uv) rows.push({ id: loc.id, name: loc.name, u: uv.u, v: uv.v, color: loc.color });
      }
      return rows;
    }
    // A place's u/v is measured on the first plate of its world and era
    // (roshar_full, final_empire, scadrial_full). The other layers — the
    // Final Empire endpaper, the Elendel Basin, the starchart — are different
    // drawings at different scales, and the same numbers put Luthadel in the
    // margin of one and in the sea of another. They show the art and no pins,
    // the way an unmeasured city layer already does.
    if (plateMode === 'world' && plateLayer > 0) return [];
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
    const isHot = (id: string) => s.selected === id || s.hovered === id || s.focusedLocation === id
      || (!!landmarkById[id]?.entry && s.selected === landmarkById[id]!.entry);

    for (const loc of rows) {
      const { x: px, y: py } = at(loc.u, loc.v);
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
      const spot = at(loc.u, loc.v);
      const x = spot.x + (hot ? 26 : 14);
      const y = spot.y;
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

  /**
   * Whether the roster shows everyone present or the first eighteen. It used
   * to end in "+161 more in Directory", and the directory is the one panel
   * that is never up while the atlas is: the rest of Roshar's cast was a
   * pointer to somewhere you could not go from here.
   */
  let rosterAll = false;
  let rosterOf: string | null = null;
  const composeRoster = () => {
    const s = store.state;
    const moreHadFocus = document.activeElement instanceof HTMLElement
      && document.activeElement.classList.contains('ceph-atlas-more');
    roster.replaceChildren();
    rosterMore.replaceChildren();
    if (s.focusedBody !== rosterOf) { rosterOf = s.focusedBody; rosterAll = false; }
    if (!s.focusedBody) return;
    const plate = s.scale === 'city' && s.focusedLocation ? cityById[s.focusedLocation] : undefined;
    if (plate) {
      roster.append(el('div', { className: 'ceph-kicker', text: 'On this plate', style: { width: '100%' } }));
      for (const m of plate.landmarks) {
        if (!isVisible(m, s.readProgress)) continue;
        const chip = el('button', {
          className: `ceph-atlas-chip${s.selected === (m.entry ?? m.id) ? ' is-on' : ''}`,
          text: m.name,
          attrs: { type: 'button' },
          style: { borderColor: m.color },
        });
        // A mark that names a place with its own pin on the globe hands over
        // the fuller entry; ids are unique, so the mark cannot just reuse it.
        listen(chip, 'click', () => store.set('selected', m.entry ?? m.id));
        roster.append(chip);
      }
    }
    const people = charactersOnBody(s.focusedBody, s.era, s.readProgress).filter((c) => isVisible(c, s.readProgress));
    const rosterPeople = [
      ...people.filter((c) => isFeaturedPerson(c.id)),
      ...people.filter((c) => !isFeaturedPerson(c.id)),
    ];
    const shown = rosterAll ? rosterPeople : rosterPeople.slice(0, 18);
    roster.classList.toggle('is-all', rosterAll);
    if (shown.length) {
      roster.append(el('div', { className: 'ceph-kicker', text: 'Present this era', style: { width: '100%' } }));
    }
    for (const c of shown) {
      const fresh = isNewThisArc(c, s.readingNow);
      const chip = el('button', {
        className: `ceph-atlas-chip${s.selected === c.id ? ' is-on' : ''}`,
        text: fresh ? `✦ ${c.name}` : c.name,
        style: { borderColor: fresh ? 'var(--ceph-amber)' : c.color },
      });
      listen(chip, 'click', () => store.set('selected', c.id));
      roster.append(chip);
    }
    if (rosterPeople.length > 18) {
      const more = el('button', {
        className: 'ceph-btn ceph-atlas-more',
        text: rosterAll ? 'Show fewer' : `+${rosterPeople.length - 18} more · show all`,
        attrs: { type: 'button', 'aria-expanded': String(rosterAll) },
      });
      listen(more, 'click', () => {
        rosterAll = !rosterAll;
        composeRoster();
        measure();
      });
      rosterMore.append(more);
      if (moreHadFocus) more.focus({ preventScroll: true });
    }
  };

  /** One blit of each layer, plus whatever genuinely moves. */
  const paint = () => {
    const s = store.state;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // A letterboxed plate leaves margins, and the last frame would show in them.
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(mapLayer, 0, 0);

    // The highstorm crossing the plate is decoration that never stops; it
    // stands down for a reader who asked for less motion.
    if (s.focusedBody === 'roshar' && s.realm === 'physical' && s.scale !== 'city' && !lessMotion.matches) {
      const t = (performance.now() / 1000) * 0.022;
      const x = (fit.x + ((0.5 - (t % 1) + 1) % 1) * fit.w) * W;
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
    // and again at the end, once the roster has been rebuilt: the card stacks
    // ten pixels under whatever this panel measures, and measuring before the
    // chips exist parks it on top of them.
    const body = bodyById[s.focusedBody];
    if (!body) return;
    // A city plate is the city's whatever the playhead says about the world
    // map under it. Luthadel opened with the playhead past the Catacendre is
    // not on the basin map, so this came back empty and the city plate was
    // drawn under "Scadrial" with the basin's World / Basin / Starchart chips.
    const loc = s.focusedLocation
      ? visibleLocations().find((l) => l.id === s.focusedLocation)
        ?? (s.scale === 'city'
          ? COSMERE.locations.find((l) => l.id === s.focusedLocation && isVisible(l, s.readProgress))
          : undefined)
      : undefined;
    const basin = s.year >= CATACENDRE_YEAR ? 'basin' : 'ash';
    // Which plate set this is. The layer chosen within it is not part of the
    // key: it was, so choosing a layer changed the key, and a changed key
    // resets the layer to the first — the first click on a city's second
    // layer put it straight back.
    const key = s.scale === 'city'
      ? `c:${s.focusedLocation}`
      : `w:${s.focusedBody}:${s.era}:${basin}:${s.realm}`;
    if (key !== plateKey) { plateKey = key; plateLayer = 0; }
    const layerRows = s.scale === 'city' && loc
      ? cityMapLayers(loc.id)
      : worldMapLayers(body.id, s.era, s.realm === 'cognitive', s.year, s.readProgress);
    layersEl.replaceChildren();
    if (layerRows.length > 1) {
      layerRows.forEach((row, i) => {
        const b = el('button', {
          className: `ceph-chip${i === plateLayer ? ' is-on' : ''}`,
          text: row.name,
          attrs: { type: 'button', 'aria-pressed': String(i === plateLayer) },
        });
        listen(b, 'click', () => { plateLayer = i; refresh(); });
        layersEl.append(b);
      });
    }
    const official = s.scale === 'city' && loc
      ? !!cityMapFile(loc.id, plateLayer)
      : !!worldMapFile(body.id, s.era, s.realm === 'cognitive', plateLayer, s.year, s.readProgress);
    if (s.scale === 'city' && loc) {
      kicker.textContent = official ? 'City plate' : (cityById[loc.id] ? 'City plate' : 'Local scan');
      title.textContent = loc.name;
    } else {
      kicker.textContent = official ? 'Cartography' : 'Cartography';
      title.textContent = s.realm === 'cognitive' ? `${body.name} · Shadesmar` : body.name;
    }
    const firstLayer = layerRows[0]?.name;
    const byline = layerRows[plateLayer]?.credit ?? MAP_CREDIT;
    credit.textContent = !official ? ''
      : plateLayer > 0 && s.scale !== 'city' && firstLayer
        ? `${byline} · places are marked on the ${firstLayer} plate`
        : byline;
    composeMap();
    const n = pinRows().length;
    canvas.setAttribute('aria-label', n
      ? `${kicker.textContent}: ${title.textContent}. ${n} marked ${n === 1 ? 'place' : 'places'}; arrow keys step through them, Enter goes there.`
      : `${kicker.textContent}: ${title.textContent}`);
    composePins();
    composeRoster();
    paint();
    measure();
  };

  const hitTest = (ev: { clientX: number; clientY: number }, click: boolean) => {
    const rect = canvas.getBoundingClientRect();
    const u = (ev.clientX - rect.left) / rect.width;
    const v = (ev.clientY - rect.top) / rect.height;
    const coarse = window.matchMedia('(pointer: coarse)').matches || rect.width < 520;
    const limit = coarse ? 0.09 : 0.045;
    let best: { id: string; d: number } | null = null;
    for (const row of pinRows()) {
      // Measured on the canvas, so a letterboxed plate's pins are as easy to
      // hit as a full one's.
      const d = Math.hypot(fit.x + row.u * fit.w - u, fit.y + row.v * fit.h - v);
      if (d < limit && (!best || d < best.d)) best = { id: row.id, d };
    }
    if (!best) {
      if (!click && store.state.hovered) store.set('hovered', null);
      return;
    }
    if (!click) { store.set('hovered', best.id); return; }
    activate(best.id);
  };

  /** What a click on a pin does: a mark opens its card, a place is flown to. */
  const activate = (id: string) => {
    const s = store.state;
    const landmark = landmarkById[id];
    if (landmark) {
      // The dot and its chip in "On this plate" are the same mark and open the
      // same card: the place it names when it names one (`entry`), the mark's
      // own note otherwise. The dot used to open the note and the chip the
      // place, so one click on the plate and one under it disagreed.
      store.set('selected', landmark.entry ?? landmark.id);
      return;
    }
    const loc = visibleLocations().find((l) => l.id === id);
    if (!loc) return;
    const dive = s.focusedLocation === loc.id
      && (s.scale === 'surface' || s.scale === 'city')
      && canEnterCity(loc, s.era, s.realm, s.year, s.readProgress);
    store.set('cameraCue', { kind: 'focus', id: loc.id, scale: dive ? 'city' : 'surface' });
  };

  /**
   * The plate's pins were pointer-only: on a globe, the only keyboard way to
   * a place was Search. Focused, the plate steps through its pins west to
   * east with the arrow keys (the hover ring and label follow, and the name
   * is read out), and Enter does what a click does. The keys it handles stop
   * here, so they neither fly the camera nor trigger a shortcut.
   */
  let keyed: string | null = null;
  const stepPin = (dir: 1 | -1 | 'first' | 'last') => {
    const rows = [...pinRows()].sort((a, b) => a.u - b.u || a.v - b.v);
    if (!rows.length) return;
    const at = rows.findIndex((r) => r.id === (keyed ?? store.state.hovered ?? store.state.focusedLocation));
    const i = dir === 'first' ? 0 : dir === 'last' ? rows.length - 1
      : at < 0 ? (dir > 0 ? 0 : rows.length - 1) : (at + dir + rows.length) % rows.length;
    const row = rows[i]!;
    keyed = row.id;
    store.set('hovered', row.id);
    announce(`${row.name}, ${i + 1} of ${rows.length}.`);
  };
  const keyOffs = [
    listen(canvas, 'keydown', (ev) => {
      const e = ev as KeyboardEvent;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') stepPin(1);
      else if (k === 'ArrowLeft' || k === 'ArrowUp') stepPin(-1);
      else if (k === 'Home') stepPin('first');
      else if (k === 'End') stepPin('last');
      else if ((k === 'Enter' || k === ' ') && keyed) activate(keyed);
      else return;
      e.preventDefault();
      e.stopPropagation();
    }),
    listen(canvas, 'blur', () => {
      if (keyed && store.state.hovered === keyed) store.set('hovered', null);
      keyed = null;
    }),
  ];

  let pointer: { x: number; y: number; id: number } | null = null;
  let hold = 0;
  let held = false;
  /**
   * Every finger on the plate, not just the first. A second finger used to
   * replace the first as "the" pointer, so a pinch whose second finger stayed
   * still ended in a tap on whatever pin was under it — or its hold timer
   * opened a card. A gesture that ever had two fingers down taps nothing.
   */
  const down = new Set<number>();
  let pinched = false;
  const release = (id: number) => {
    down.delete(id);
    window.clearTimeout(hold);
    if (down.size === 0) pinched = false;
  };
  const offs = [
    listen(canvas, 'pointerdown', (e) => {
      const ev = e as PointerEvent;
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      if (ev.isPrimary) down.clear();
      down.add(ev.pointerId);
      window.clearTimeout(hold);
      if (down.size > 1) { pinched = true; pointer = null; return; }
      pointer = { x: ev.clientX, y: ev.clientY, id: ev.pointerId };
      held = false;
      hold = window.setTimeout(() => {
        if (!pointer || pinched) return;
        held = true;
        hitTest({ clientX: pointer.x, clientY: pointer.y }, false);
        const id = store.state.hovered;
        if (id) store.set('selected', id);
      }, 480);
    }),
    listen(canvas, 'pointerup', (e) => {
      const ev = e as PointerEvent;
      const wasPinched = pinched;
      release(ev.pointerId);
      if (wasPinched || !pointer || ev.pointerId !== pointer.id) return;
      const moved = Math.hypot(ev.clientX - pointer.x, ev.clientY - pointer.y);
      const wasHeld = held;
      pointer = null;
      held = false;
      if (wasHeld || moved > 12) return;
      hitTest(ev, true);
    }),
    // The browser took the gesture (a scroll, a system swipe). Without this
    // the hold timer outlived the finger and opened a card a beat later.
    listen(canvas, 'pointercancel', (e) => {
      release((e as PointerEvent).pointerId);
      pointer = null;
      held = false;
    }),
    // A long press on a plate is ours; the image callout is not wanted.
    listen(canvas, 'contextmenu', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse') e.preventDefault();
    }),
    listen(canvas, 'pointermove', (e) => {
      const ev = e as PointerEvent;
      if (pointer && ev.pointerId === pointer.id && Math.hypot(ev.clientX - pointer.x, ev.clientY - pointer.y) > 12) {
        window.clearTimeout(hold);
        return;
      }
      if (!pointer) hitTest(ev, false);
    }),
    listen(canvas, 'pointerleave', () => {
      window.clearTimeout(hold);
      pointer = null;
      if (store.state.hovered) store.set('hovered', null);
    }),
    listen(window, 'resize', () => measure()),
    store.on('focusedBody', refresh),
    store.on('scale', refresh),
    store.on('era', refresh),
    store.on('year', () => {
      const s = store.state;
      const phase = `${s.focusedBody}:${s.era}:${s.year >= CATACENDRE_YEAR ? 'basin' : 'ash'}`;
      if (phase === basinPhase) return;
      basinPhase = phase;
      refresh();
    }),
    store.on('realm', refresh),
    store.on('shell', refresh),
    store.on('view', refresh),
    store.on('selected', () => { composePins(); composeRoster(); paint(); }),
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
    if (store.state.focusedBody === 'roshar' && panel.classList.contains('is-on') && !lessMotion.matches) paint();
  };
  loop();
  refresh();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach((o) => o());
      keyOffs.forEach((o) => o());
      panel.remove();
    },
  };
}
