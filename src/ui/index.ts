/**
 * UI layer. The only channel to the renderer is src/core/store.ts.
 */
import '../styles/base.css';
import { COSMERE, locationsOn, onTheMap, systemOnTheMap } from '../data/index.ts';
import { store } from '../core/store.ts';
import { listen } from './dom.ts';
import { mountAtlas } from './atlas.ts';
import { mountDirectory } from './directory.ts';
import { mountHud } from './hud.ts';
import { mountLoreWeb } from './loreWeb.ts';
import { mountMinimap } from './minimap.ts';
import { mountModals } from './modals.ts';
import { mountTitle } from './title.ts';

export interface UIHandles {
  setHoverAnchor(p: { x: number; y: number } | null): void;
  enter(): void;
  openTitle(): void;
  destroy(): void;
}

function cycleSky(dir: 1 | -1): void {
  const s = store.state;
  if (s.shell !== 'play' || s.view === 'web') return;
  const wrap = (ids: string[], cur: string | null) => {
    if (!ids.length) return null;
    const idx = ids.indexOf(cur ?? '');
    const j = idx < 0 ? (dir > 0 ? 0 : ids.length - 1) : (idx + dir + ids.length) % ids.length;
    return ids[j] ?? null;
  };
  if (s.scale === 'cosmere' || !s.focusedSystem) {
    const ids = COSMERE.systems
      .filter((sys) => systemOnTheMap(sys.id, s.readProgress, s.era))
      .map((sys) => sys.id);
    const id = wrap(ids, s.focusedSystem);
    if (id) store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
    return;
  }
  if (s.scale === 'system' || s.scale === 'globe') {
    const ids = COSMERE.bodies
      .filter((b) => b.system === s.focusedSystem && b.kind !== 'gas-giant' && onTheMap(b, s.readProgress, s.era))
      .map((b) => b.id);
    const id = wrap(ids, s.focusedBody);
    if (id) store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
    return;
  }
  if (s.focusedBody) {
    const ids = locationsOn(s.focusedBody, s.era, s.year)
      .filter((l) => onTheMap(l, s.readProgress, s.era) && l.realm !== 'cognitive')
      .map((l) => l.id);
    const id = wrap(ids, s.focusedLocation);
    if (id) store.set('cameraCue', { kind: 'focus', id, scale: s.scale === 'city' ? 'city' : 'surface' });
  }
}

export function mountUI(root: HTMLElement): UIHandles {
  root.classList.add('ceph-root');
  const title = mountTitle(root);
  const hud = mountHud(root, { onHome: () => title.open() });
  const atlas = mountAtlas(root);
  const directory = mountDirectory(root);
  const minimap = mountMinimap(root);
  const web = mountLoreWeb(root);
  const modals = mountModals(root);

  const keys = listen(window, 'keydown', (ev) => {
    const e = ev as KeyboardEvent;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === 'Escape') (e.target as HTMLElement).blur();
      return;
    }
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      if (store.state.panel !== 'none') { store.set('panel', 'none'); return; }
      if (store.state.view === 'web') { store.set('view', 'sky'); return; }
      if (store.state.shell === 'play') {
        if (store.state.scale === 'cosmere' && store.state.realm === 'physical' && store.state.selected) {
          store.set('selected', null);
          return;
        }
        store.set('cameraCue', { kind: 'pop' });
      }
      return;
    }
    if (k === ' ') {
      e.preventDefault();
      if (store.state.cinematic) {
        store.set('cameraCue', { kind: 'skip-cinematic' });
        if (store.state.shell === 'title') title.enter();
        return;
      }
      if (store.state.shell === 'play') store.set('isPlaying', !store.state.isPlaying);
      return;
    }
    if (store.state.shell !== 'play') return;
    // WASD / QE fly the camera. Never steal them for panels.
    if ('wasdqe'.includes(k)) return;
    if (k === 'c') store.set('realm', store.state.realm === 'cognitive' ? 'physical' : 'cognitive');
    if (k === 'v') store.set('realm', store.state.realm === 'spiritual' ? 'physical' : 'spiritual');
    if (k === 'l') {
      store.set('view', store.state.view === 'web' ? 'sky' : 'web');
      return;
    }
    if (k === 'h' || k === '?') store.set('panel', store.state.panel === 'help' ? 'none' : 'help');
    if (k === 'm') {
      store.patchChrome({ minimap: !store.state.chrome.minimap });
      return;
    }
    if (k === 'k' || k === '/') {
      e.preventDefault();
      store.set('panel', 'codex');
    }
    if (k === 'f') store.set('cameraCue', { kind: 'frame' });
    if (e.key === '[' || e.key === ']') {
      e.preventDefault();
      cycleSky(e.key === ']' ? 1 : -1);
    }
    const eraNum = Number(k) - 1;
    if (k >= '1' && k <= '6') {
      const row = COSMERE.eras[eraNum];
      if (row) {
        store.set('year', row.start + 1);
        store.set('era', row.id);
      }
    }
  });

  return {
    setHoverAnchor() { /* info drawer handles hover */ },
    enter: () => title.enter(),
    openTitle: () => title.open(),
    destroy() {
      keys();
      title.destroy();
      hud.destroy();
      atlas.destroy();
      directory.destroy();
      minimap.destroy();
      web.destroy();
      modals.destroy();
      root.classList.remove('ceph-root');
    },
  };
}
