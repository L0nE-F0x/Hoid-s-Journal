import { eraAt, publicationSafeProgress } from '../data/index.ts';
import { store, type Realm, type Scale } from './store.ts';

/** What a shared link is pointing at, if anything. */
export interface DeepTarget { id: string; scale: Scale }

function parse(): DeepTarget | null {
  const h = location.hash.replace(/^#/, '');
  if (!h) return null;
  const p = new URLSearchParams(h.replace(/&/g, '&'));
  // Support both #y=0&realm=physical and query-like hashes.
  const year = p.get('y');
  const realm = p.get('realm') as Realm | null;
  const scale = p.get('scale') as Scale | null;
  const body = p.get('body');
  const system = p.get('system');
  const loc = p.get('loc');
  const reading = p.get('reading');
  if (year !== null && year !== '') {
    const y = Number(year);
    if (Number.isFinite(y)) {
      store.set('year', y);
      store.set('era', eraAt(y));
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
  // A link can carry the beat you are reading at, spoiler gate and all.
  if (reading) {
    const [series, arc] = reading.split(':');
    const i = Number(arc);
    if (series && Number.isFinite(i)) {
      const now = { series, arc: i };
      store.setProgress(publicationSafeProgress(now));
      store.set('readingNow', now);
    }
  }

  if (loc) return { id: loc, scale: scale === 'city' ? 'city' : 'surface' };
  if (body) return { id: body, scale: scale === 'cosmere' ? 'globe' : (scale ?? 'globe') };
  if (system) return { id: system, scale: 'system' };
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
