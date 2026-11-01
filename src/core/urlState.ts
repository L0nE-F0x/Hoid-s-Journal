import { COSMERE, bodyById, eraAt, locationById, moonById, publicationSafeProgress, seriesById } from '../data/index.ts';
import { store, type Realm, type Scale } from './store.ts';

/** What a shared link is pointing at, if anything. */
export interface DeepTarget { id: string; scale: Scale }

const SCALES: readonly Scale[] = ['cosmere', 'system', 'globe', 'surface', 'city'];
/** The playhead's own range: `App.frame` wraps past 1000 back to -8000. */
const YEAR_MIN = -8000;
const YEAR_MAX = 1000;

/**
 * Read a shared link into the store.
 *
 * Everything in a hash is a string someone could have typed, so each field is
 * checked against the data before the store sees it. An id that names nothing
 * used to be written straight in: `#scale=globe&body=nonexistent` left the app
 * at globe scale over an empty sky with a blank atlas and no opening, and the
 * only way out was a reload. A field that does not resolve is dropped, and a
 * link with nothing left in it plays the opening as if there were no link.
 */
function parse(): DeepTarget | null {
  const h = location.hash.replace(/^#/, '');
  if (!h) return null;
  const p = new URLSearchParams(h.replace(/&/g, '&'));
  // Support both #y=0&realm=physical and query-like hashes.
  const year = p.get('y');
  const realm = p.get('realm') as Realm | null;
  const rawScale = p.get('scale') as Scale | null;
  const scale = rawScale && SCALES.includes(rawScale) ? rawScale : null;
  const rawBody = p.get('body');
  const body = rawBody && (bodyById[rawBody] || moonById[rawBody]) ? rawBody : null;
  const rawSystem = p.get('system');
  const system = rawSystem && COSMERE.systems.some((s) => s.id === rawSystem) ? rawSystem : null;
  const rawLoc = p.get('loc');
  const loc = rawLoc && locationById[rawLoc] ? rawLoc : null;
  const reading = p.get('reading');
  if (year !== null && year !== '') {
    const y = Number(year);
    if (Number.isFinite(y)) {
      const clamped = Math.min(YEAR_MAX, Math.max(YEAR_MIN, y));
      store.set('year', clamped);
      store.set('era', eraAt(clamped));
    }
  }
  if (realm === 'physical' || realm === 'cognitive' || realm === 'spiritual') {
    store.set('realm', realm);
  }
  if (scale) store.set('scale', scale);
  if (system) store.set('focusedSystem', system);
  if (body) {
    store.set('focusedBody', body);
    store.set('selected', body);
  }
  if (loc) {
    store.set('focusedLocation', loc);
    store.set('selected', loc);
  }
  // A link can carry the beat you are reading at, spoiler gate and all: a
  // series the journal knows, at an arc it has.
  if (reading) {
    const [series, arc] = reading.split(':');
    const known = series ? seriesById[series] : undefined;
    const i = Number(arc);
    if (known && Number.isInteger(i)) {
      const now = { series: known.id, arc: Math.min(known.arcs.length - 1, Math.max(0, i)) };
      store.setProgress(publicationSafeProgress(now));
      store.set('readingNow', now);
    }
  }

  if (loc) return { id: loc, scale: scale === 'city' ? 'city' : 'surface' };
  if (body) return { id: body, scale: !scale || scale === 'cosmere' || scale === 'system' ? 'globe' : scale };
  if (system) return { id: system, scale: 'system' };
  // A scale with nothing to stand on is not a place to start from.
  if (scale && scale !== 'cosmere') store.set('scale', 'cosmere');
  return null;
}

function write(): void {
  const s = store.state;
  const p = new URLSearchParams();
  p.set('y', s.year.toFixed(1));
  if (s.realm !== 'physical') p.set('realm', s.realm);
  if (s.scale !== 'cosmere') p.set('scale', s.scale);
  if (s.focusedSystem) p.set('system', s.focusedSystem);
  if (s.focusedBody) p.set('body', s.focusedBody);
  if (s.focusedLocation) p.set('loc', s.focusedLocation);
  if (s.readingNow) p.set('reading', `${s.readingNow.series}:${s.readingNow.arc}`);
  const next = p.toString();
  if (location.hash.slice(1) === next) return;
  history.replaceState(null, '', `${location.pathname}${location.search}#${next}`);
}

/** Force the hash current, then return the full URL for sharing. */
export function shareUrl(): string {
  write();
  return location.href;
}

export async function copyShareLink(): Promise<boolean> {
  const url = shareUrl();
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export function connectUrlState(): DeepTarget | null {
  const target = parse();
  let last = 0;
  const tick = (t: number) => {
    if (t - last > 900) {
      last = t;
      write();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return target;
}
