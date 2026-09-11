/**
 * UI layer. The only channel to the renderer is src/core/store.ts.
 */
import '../styles/base.css';
import { COSMERE } from '../data/index.ts';
import { store } from '../core/store.ts';
import { listen } from './dom.ts';
import { mountAtlas } from './atlas.ts';
import { mountHud } from './hud.ts';
import { mountModals } from './modals.ts';
import { mountTitle } from './title.ts';

export interface UIHandles {
  setHoverAnchor(p: { x: number; y: number } | null): void;
  enter(): void;
  openTitle(): void;
  destroy(): void;
}

export function mountUI(root: HTMLElement): UIHandles {
  root.classList.add('ceph-root');
  const title = mountTitle(root);
  const hud = mountHud(root, { onHome: () => title.open() });
  const atlas = mountAtlas(root);
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
      if (store.state.shell === 'play') store.set('cameraCue', { kind: 'pop' });
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
    if (k === 'c') store.set('realm', store.state.realm === 'cognitive' ? 'physical' : 'cognitive');
    if (k === 'v') store.set('realm', store.state.realm === 'spiritual' ? 'physical' : 'spiritual');
    if (k === 'a') store.set('panel', store.state.panel === 'arcanum' ? 'none' : 'arcanum');
    if (k === 'k' || k === '/') {
      e.preventDefault();
      store.set('panel', 'codex');
    }
    if (k === 'f') store.set('cameraCue', { kind: 'frame' });
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
      modals.destroy();
      root.classList.remove('ceph-root');
    },
  };
}
