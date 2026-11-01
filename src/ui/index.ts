/**
 * UI layer. The only channel to the renderer is src/core/store.ts.
 */
import '../styles/base.css';
import { COSMERE, locationsOn, onTheMap, systemOnTheMap } from '../data/index.ts';
import { store } from '../core/store.ts';
import { keyboardMode, listen } from './dom.ts';
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
    const ids = locationsOn(s.focusedBody, s.era, s.year, s.readProgress)
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
  const web = mountLoreWeb(root);
  const atlas = mountAtlas(root);
  const directory = mountDirectory(root);
  // Document order is Tab order. Every panel here is fixed and carries its
  // own z-index, so moving a node changes what Tab reaches next and nothing
  // about what is drawn on top: top bar, Lore Web legend, the left column
  // (atlas or directory, then the card under it), the galaxy chart, the
  // playhead.
  root.append(hud.cardLayer);
  const minimap = mountMinimap(root);
  root.append(hud.lowLayer);
  const modals = mountModals(root);

  /**
   * Panels swap under the reader: choosing Roshar in the directory flies to
   * the globe, the atlas takes the column and the directory row that had
   * focus is gone. Focus fell to <body> and the next Tab started from the
   * top of the page. When the control a keyboard reader was on disappears,
   * put them on what replaced it: the card, the plate, the directory.
   */
  let lastFocus: HTMLElement | null = null;
  const shown = (n: Element | null): n is HTMLElement => n instanceof HTMLElement
    && n.isConnected && n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden';
  let rescueQueued = 0;
  const rescue = () => {
    rescueQueued = 0;
    if (!keyboardMode() || !lastFocus || shown(lastFocus)) return;
    const active = document.activeElement;
    if (active && active !== document.body && active !== lastFocus && shown(active)) return;
    const next = [
      root.querySelector('[aria-modal="true"] .ceph-modal-card'),
      root.querySelector('.ceph-panel-drawer'),
      root.querySelector('.ceph-atlas.is-on .ceph-atlas-canvas[tabindex]'),
      root.querySelector('.ceph-atlas.is-on button'),
      root.querySelector('.ceph-directory.is-on .ceph-dir-tabs .is-on'),
      root.querySelector('.ceph-web.is-on button'),
      root.querySelector('.ceph-topbar button'),
    ].find(shown);
    next?.focus({ preventScroll: true });
  };
  const queueRescue = () => { if (!rescueQueued) rescueQueued = requestAnimationFrame(rescue); };
  const focusWatch = [
    listen(root, 'focusin', (e) => { lastFocus = e.target instanceof HTMLElement ? e.target : null; }),
    ...(['scale', 'view', 'chrome', 'selected', 'panel', 'focusedBody', 'realm', 'shell', 'cinematic'] as const)
      .map((key) => store.on(key, queueRescue)),
  ];

  const keys = listen(window, 'keydown', (ev) => {
    const e = ev as KeyboardEvent;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key !== 'Escape') return;
      // In a panel, Esc closes the panel. It used to only blur the Codex
      // box, so closing Search took two presses.
      if (e.target.closest('[aria-modal="true"]')) {
        e.preventDefault();
        store.set('panel', 'none');
        return;
      }
      (e.target as HTMLElement).blur();
      return;
    }
    // Ctrl+F, Ctrl+L, Cmd+K belong to the browser and the OS. Without this
    // Ctrl+F framed the Cosmere and Ctrl+L opened the Lore Web on the way to
    // the browser's own find and address bar.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const target = e.target instanceof HTMLElement ? e.target : null;
    // Typing a letter in a <select> picks an option; it is not a shortcut.
    if (target instanceof HTMLSelectElement && k !== 'escape') return;
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
      // Space presses the focused button. The playhead toggle used to take
      // it first and cancel the press, so no button could be pressed with
      // Space at all — the keyboard's own way of clicking.
      if (target?.closest('button, a[href], summary, [role="button"]')) return;
      // In an open panel Space scrolls it, as it would any page.
      if (store.state.panel !== 'none' && !store.state.cinematic) return;
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
    // With a panel open the sky is behind glass: C, V, the era keys and the
    // rest no longer reach through it. Help and Search still switch panels.
    if (store.state.panel !== 'none' && !['h', '?', 'k', '/'].includes(k)) return;
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
      focusWatch.forEach((o) => o());
      cancelAnimationFrame(rescueQueued);
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
