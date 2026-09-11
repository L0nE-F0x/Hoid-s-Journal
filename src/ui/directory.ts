/**
 * Clickable roster of what the current sky actually holds. The 3-D pick
 * can miss a planet the size of a pin; this list does not.
 */
import {
  COSMERE,
  bodyById,
  isVisible,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { atlasIsOpen } from './atlas.ts';
import { el, listen } from './dom.ts';
import '../styles/directory.css';

export function directoryIsOpen(): boolean {
  const s = store.state;
  return s.shell === 'play' && !atlasIsOpen() && s.realm !== 'spiritual';
}

export function mountDirectory(root: HTMLElement): { destroy(): void } {
  const search = el('input', {
    className: 'ceph-search ceph-dir-search',
    attrs: { placeholder: 'Find a world, person, shard…', type: 'search' },
  }) as HTMLInputElement;
  const list = el('div', { className: 'ceph-dir-list' });
  const kicker = el('div', { className: 'ceph-kicker', text: 'Directory' });
  const title = el('div', { className: 'ceph-atlas-title', text: 'Systems' });
  const panel = el('div', { className: 'ceph-panel ceph-directory' }, [
    el('div', { className: 'ceph-atlas-head' }, [kicker, title]),
    search,
    list,
  ]);
  root.append(panel);

  const measure = () => {
    if (!panel.classList.contains('is-on')) {
      store.setInset('directory', null);
      return;
    }
    const r = panel.getBoundingClientRect();
    store.setInset('directory', { left: Math.round(r.right + 12) });
  };

  const row = (id: string, name: string, kind: string, color: string, hint: string) => {
    const b = el('button', { className: 'ceph-dir-row', attrs: { type: 'button' } }, [
      el('span', { className: 'ceph-dir-dot', style: { background: color } }),
      el('span', { className: 'ceph-dir-name', text: name }),
      el('span', { className: 'ceph-dir-kind', text: kind }),
    ]);
    b.title = hint;
    listen(b, 'click', () => {
      store.set('panel', 'none');
      store.set('selected', id);
      if (bodyById[id]) store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
      else if (COSMERE.systems.some((s) => s.id === id)) store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
      else if (COSMERE.locations.some((l) => l.id === id)) store.set('cameraCue', { kind: 'focus', id, scale: 'surface' });
      else {
        const ch = COSMERE.characters.find((c) => c.id === id);
        const at = ch?.eras.find((e) => e.era === store.state.era) ?? ch?.eras[0];
        if (at?.body) {
          store.set('cameraCue', { kind: 'focus', id: at.body, scale: 'globe' });
          store.set('selected', id);
        } else if (COSMERE.shards.some((s) => s.id === id)) {
          store.set('realm', 'spiritual');
          store.set('selected', id);
        }
      }
    });
    return b;
  };

  const paint = () => {
    const s = store.state;
    const show = directoryIsOpen();
    panel.classList.toggle('is-on', show);
    measure();
    if (!show) return;
    const q = search.value.trim().toLowerCase();
    list.replaceChildren();

    const push = (node: HTMLElement) => list.append(node);

    if (s.scale === 'system' && s.focusedSystem) {
      const sys = COSMERE.systems.find((x) => x.id === s.focusedSystem);
      title.textContent = sys?.name ?? 'System';
      kicker.textContent = 'Worlds';
      for (const b of COSMERE.bodies) {
        if (b.system !== s.focusedSystem || !isVisible(b, s.readProgress)) continue;
        if (q && !b.name.toLowerCase().includes(q)) continue;
        push(row(b.id, b.name, b.kind.replace('-', ' '), b.color, b.fact));
      }
      return;
    }

    title.textContent = q ? 'Matches' : 'Systems';
    kicker.textContent = 'Directory';
    if (q.length >= 1) {
      for (const sys of COSMERE.systems) {
        if (!isVisible(sys, s.readProgress) || !sys.name.toLowerCase().includes(q)) continue;
        push(row(sys.id, sys.name, 'system', sys.sunColor, sys.name));
      }
      for (const b of COSMERE.bodies) {
        if (b.kind === 'gas-giant' || !isVisible(b, s.readProgress)) continue;
        if (!b.name.toLowerCase().includes(q)) continue;
        push(row(b.id, b.name, 'world', b.color, b.fact));
      }
      for (const c of COSMERE.characters) {
        if (!isVisible(c, s.readProgress) || !c.name.toLowerCase().includes(q)) continue;
        push(row(c.id, c.name, 'person', c.color, c.fact));
      }
      for (const sh of COSMERE.shards) {
        if (!isVisible(sh, s.readProgress) || !sh.name.toLowerCase().includes(q)) continue;
        push(row(sh.id, sh.name, 'shard', sh.color, sh.desc));
      }
      if (!list.childElementCount) {
        list.append(el('div', { className: 'ceph-dir-empty', text: 'Nothing matches — or it is still spoiler-gated.' }));
      }
      return;
    }
    for (const sys of COSMERE.systems) {
      if (!isVisible(sys, s.readProgress)) continue;
      const n = COSMERE.bodies.filter((b) => b.system === sys.id && b.kind !== 'gas-giant').length;
      push(row(sys.id, sys.name, n === 1 ? '1 world' : `${n} worlds`, sys.sunColor, `Enter the ${sys.name} system`));
    }
  };

  const offs = [
    listen(search, 'input', () => { store.set('searchQuery', search.value); paint(); }),
    listen(window, 'resize', () => measure()),
    store.on('shell', paint),
    store.on('scale', paint),
    store.on('focusedSystem', paint),
    store.on('realm', paint),
    store.on('readProgress', paint),
    store.on('focusedBody', paint),
  ];
  paint();
  return {
    destroy() { offs.forEach((o) => o()); panel.remove(); },
  };
}
