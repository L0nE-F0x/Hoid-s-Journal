import { eraAt } from '../data/index.ts';
import { store, type Realm, type Scale } from './store.ts';

function parse(): void {
  const h = location.hash.replace(/^#/, '');
  if (!h) return;
  const p = new URLSearchParams(h.replace(/&/g, '&'));
  // Support both #y=0&realm=physical and query-like hashes.
  const year = p.get('y');
  const realm = p.get('realm') as Realm | null;
  const scale = p.get('scale') as Scale | null;
  const body = p.get('body');
  const system = p.get('system');
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
}

function write(): void {
  const s = store.state;
  const p = new URLSearchParams();
  p.set('y', s.year.toFixed(1));
  if (s.realm !== 'physical') p.set('realm', s.realm);
  if (s.scale !== 'cosmere') p.set('scale', s.scale);
  if (s.focusedSystem) p.set('system', s.focusedSystem);
  if (s.focusedBody) p.set('body', s.focusedBody);
  const next = p.toString();
  if (location.hash.slice(1) === next) return;
  history.replaceState(null, '', `${location.pathname}${location.search}#${next}`);
}

export function connectUrlState(): void {
  parse();
  let last = 0;
  const tick = (t: number) => {
    if (t - last > 900) {
      last = t;
      write();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
