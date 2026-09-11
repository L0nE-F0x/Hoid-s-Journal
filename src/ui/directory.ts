/**
 * Clickable roster of what the current sky actually holds. The 3-D pick
 * can miss a planet the size of a pin; this list does not.
 */
import {
  COSMERE,
  bodyById,
  characterAt,
  isVisible,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { atlasIsOpen } from './atlas.ts';
import { el, listen } from './dom.ts';
import '../styles/directory.css';

type DirTab = 'systems' | 'worlds' | 'moons' | 'people' | 'shards' | 'doors';

export function directoryIsOpen(): boolean {
  const s = store.state;
  return s.shell === 'play' && !atlasIsOpen() && s.view !== 'web';
}

function flyTo(id: string): void {
  store.set('panel', 'none');
  store.set('selected', id);
  if (bodyById[id]) {
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
    return;
  }
  if (COSMERE.systems.some((s) => s.id === id)) {
    store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
    return;
  }
  if (COSMERE.locations.some((l) => l.id === id)) {
    store.set('cameraCue', { kind: 'focus', id, scale: 'surface' });
    return;
  }
  const moon = COSMERE.moons.find((m) => m.id === id);
  if (moon) {
    store.set('cameraCue', { kind: 'focus', id: moon.parent, scale: 'globe' });
    store.set('selected', moon.id);
    return;
  }
  const ch = COSMERE.characters.find((c) => c.id === id);
  const at = ch ? characterAt(ch, store.state.era) : null;
  if (at?.body) {
    store.set('cameraCue', { kind: 'focus', id: at.body, scale: 'globe' });
    store.set('selected', id);
    return;
  }
  if (COSMERE.shards.some((s) => s.id === id)) {
    store.set('realm', 'spiritual');
    store.set('selected', id);
    return;
  }
  const perp = COSMERE.perps.find((p) => p.id === id);
  if (perp?.at) store.set('cameraCue', { kind: 'focus', id: perp.at, scale: 'surface' });
  else if (perp) store.set('cameraCue', { kind: 'focus', id: perp.body, scale: 'globe' });
}

export function mountDirectory(root: HTMLElement): { destroy(): void } {
  let tab: DirTab = 'systems';
  const search = el('input', {
    className: 'ceph-search ceph-dir-search',
    attrs: { placeholder: 'Find a world, person, shard…', type: 'search' },
  }) as HTMLInputElement;
  const tabs = el('div', { className: 'ceph-dir-tabs' });
  const list = el('div', { className: 'ceph-dir-list' });
  const kicker = el('div', { className: 'ceph-kicker', text: 'Directory' });
  const title = el('div', { className: 'ceph-atlas-title', text: 'Systems' });
  const panel = el('div', { className: 'ceph-panel ceph-directory' }, [
    el('div', { className: 'ceph-atlas-head' }, [kicker, title]),
    tabs,
    search,
    list,
  ]);
  root.append(panel);

  const TAB: { id: DirTab; label: string }[] = [
    { id: 'systems', label: 'Systems' },
    { id: 'worlds', label: 'Worlds' },
    { id: 'moons', label: 'Moons' },
    { id: 'people', label: 'People' },
    { id: 'shards', label: 'Shards' },
    { id: 'doors', label: 'Doors' },
  ];
  for (const t of TAB) {
    const b = el('button', { className: 'ceph-chip', text: t.label, attrs: { type: 'button' } });
    listen(b, 'click', () => { tab = t.id; paint(); });
    tabs.append(b);
  }

  const measure = () => {
    if (!panel.classList.contains('is-on')) {
      store.setInset('directory', null);
      return;
    }
    const r = panel.getBoundingClientRect();
    store.setInset('directory', { left: Math.round(r.right + 12) });
  };

  const row = (id: string, name: string, kind: string, color: string, hint: string) => {
    const hot = store.state.selected === id || store.state.focusedSystem === id || store.state.focusedBody === id;
    const b = el('button', { className: `ceph-dir-row${hot ? ' is-on' : ''}`, attrs: { type: 'button' } }, [
      el('span', { className: 'ceph-dir-dot', style: { background: color } }),
      el('span', { className: 'ceph-dir-name', text: name }),
      el('span', { className: 'ceph-dir-kind', text: kind }),
    ]);
    b.title = hint;
    listen(b, 'click', () => flyTo(id));
    return b;
  };

  const paint = () => {
    const s = store.state;
    const show = directoryIsOpen();
    panel.classList.toggle('is-on', show);
    measure();
    if (!show) return;
    if (s.realm === 'spiritual') tab = 'shards';
    const q = search.value.trim().toLowerCase();
    list.replaceChildren();
    [...tabs.children].forEach((c, i) => c.classList.toggle('is-on', TAB[i]!.id === tab));
    title.textContent = TAB.find((t) => t.id === tab)?.label ?? 'Directory';
    kicker.textContent = s.scale === 'system' && s.focusedSystem
      ? (COSMERE.systems.find((x) => x.id === s.focusedSystem)?.name ?? 'System')
      : 'Directory';

    const match = (name: string) => !q || name.toLowerCase().includes(q);
    const push = (node: HTMLElement) => list.append(node);

    if (tab === 'systems') {
      for (const sys of COSMERE.systems) {
        if (!isVisible(sys, s.readProgress) || !match(sys.name)) continue;
        const n = COSMERE.bodies.filter((b) => b.system === sys.id && b.kind !== 'gas-giant').length;
        push(row(sys.id, sys.name, n === 1 ? '1 world' : `${n} worlds`, sys.sunColor, `Enter the ${sys.name} system`));
      }
    } else if (tab === 'worlds') {
      for (const b of COSMERE.bodies) {
        if (b.kind === 'gas-giant' || !isVisible(b, s.readProgress) || !match(b.name)) continue;
        if (s.scale === 'system' && s.focusedSystem && b.system !== s.focusedSystem) continue;
        push(row(b.id, b.name, b.kind.replace('-', ' '), b.color, b.fact));
      }
    } else if (tab === 'moons') {
      for (const m of COSMERE.moons) {
        if (!isVisible(m, s.readProgress) || !match(m.name)) continue;
        const parent = bodyById[m.parent];
        if (s.scale === 'system' && s.focusedSystem && parent?.system !== s.focusedSystem) continue;
        push(row(m.id, m.name, parent?.name ?? m.parent, m.color, m.fact));
      }
    } else if (tab === 'people') {
      for (const c of COSMERE.characters) {
        if (!isVisible(c, s.readProgress) || !match(c.name)) continue;
        const at = characterAt(c, s.era);
        if (s.scale === 'system' && s.focusedSystem && at && bodyById[at.body ?? '']?.system !== s.focusedSystem) continue;
        push(row(c.id, c.name, c.origin, c.color, c.fact));
      }
    } else if (tab === 'shards') {
      for (const sh of COSMERE.shards) {
        if (!isVisible(sh, s.readProgress) || !match(sh.name)) continue;
        const era = sh.eras.find((e) => e.era === s.era) ?? sh.eras[sh.eras.length - 1];
        push(row(sh.id, sh.name, era?.status ?? 'shard', sh.color, sh.desc));
      }
    } else {
      for (const p of COSMERE.perps) {
        if (!isVisible(p, s.readProgress) || !match(p.name)) continue;
        const body = bodyById[p.body];
        push(row(p.id, p.name, body?.name ?? p.body, '#c4b5fd', p.fact));
      }
    }
    if (!list.childElementCount) {
      list.append(el('div', { className: 'ceph-dir-empty', text: 'Nothing matches — or it is still spoiler-gated.' }));
    }
  };

  const offs = [
    listen(search, 'input', () => { store.set('searchQuery', search.value); paint(); }),
    listen(window, 'resize', () => measure()),
    store.on('shell', paint),
    store.on('scale', paint),
    store.on('focusedSystem', paint),
    store.on('focusedBody', paint),
    store.on('selected', paint),
    store.on('realm', paint),
    store.on('era', paint),
    store.on('readProgress', paint),
    store.on('view', paint),
  ];
  paint();
  return {
    destroy() { offs.forEach((o) => o()); panel.remove(); },
  };
}
