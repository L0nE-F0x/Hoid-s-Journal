/**
 * Clickable roster of what the current sky actually holds. The 3-D pick
 * can miss a planet the size of a pin; this list does not.
 */
import {
  COSMERE,
  DAWNSHARDS,
  bodyById,
  characterAt,
  inEra,
  isVisible,
  onTheMap,
  orgById,
  systemOnTheMap,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { atlasIsOpen } from './atlas.ts';
import { el, listen, setColumnBottom } from './dom.ts';
import '../styles/directory.css';

type DirTab = 'systems' | 'worlds' | 'moons' | 'people' | 'dragons' | 'places' | 'orders' | 'shards' | 'doors' | 'dawnshards';

export function directoryIsOpen(): boolean {
  const s = store.state;
  return s.shell === 'play' && !s.cinematic && !atlasIsOpen()
    && s.view !== 'web' && s.chrome.directory;
}

function leaveSpiritual(): void {
  if (store.state.realm === 'spiritual') store.set('realm', 'physical');
}

function flyTo(id: string): void {
  store.set('panel', 'none');
  store.set('selected', id);
  if (bodyById[id]) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
    return;
  }
  if (COSMERE.systems.some((s) => s.id === id)) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
    return;
  }
  if (COSMERE.locations.some((l) => l.id === id)) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id, scale: 'surface' });
    return;
  }
  const moon = COSMERE.moons.find((m) => m.id === id);
  if (moon) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id: moon.id, scale: 'globe' });
    return;
  }
  const belt = COSMERE.belts.find((b) => b.id === id);
  if (belt) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id: belt.system, scale: 'system' });
    return;
  }
  const ch = COSMERE.characters.find((c) => c.id === id);
  const at = ch ? characterAt(ch, store.state.era) : null;
  if (at?.body) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id: at.body, scale: 'globe' });
    store.set('selected', id);
    return;
  }
  if (COSMERE.shards.some((s) => s.id === id)) {
    store.set('realm', 'spiritual');
    store.set('selected', id);
    return;
  }
  if (DAWNSHARDS.some((d) => d.id === id)) {
    store.set('realm', 'spiritual');
    store.set('selected', id);
    return;
  }
  const perp = COSMERE.perps.find((p) => p.id === id);
  if (perp?.at) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id: perp.at, scale: 'surface' });
    return;
  }
  if (perp) {
    leaveSpiritual();
    store.set('cameraCue', { kind: 'focus', id: perp.body, scale: 'globe' });
    return;
  }
  if (orgById[id]) {
    store.set('selected', id);
  }
}

export function mountDirectory(root: HTMLElement): { destroy(): void } {
  let tab: DirTab = 'systems';
  let lastRealm = store.state.realm;
  const search = el('input', {
    className: 'ceph-search ceph-dir-search',
    attrs: { placeholder: 'Find a world, person, shard…', type: 'search' },
  }) as HTMLInputElement;
  const tabs = el('div', { className: 'ceph-dir-tabs' });
  const list = el('div', { className: 'ceph-dir-list' });
  const kicker = el('div', { className: 'ceph-kicker', text: 'Directory' });
  const title = el('div', { className: 'ceph-atlas-title', text: 'Systems' });
  const collapse = el('button', {
    className: 'ceph-btn ceph-icon-btn',
    text: '‹',
    attrs: { type: 'button', title: 'Hide directory' },
  });
  const panel = el('div', { className: 'ceph-panel ceph-directory' }, [
    el('div', { className: 'ceph-atlas-head' }, [kicker, title, collapse]),
    tabs,
    search,
    list,
  ]);
  const restore = el('button', {
    className: 'ceph-btn ceph-dir-restore',
    text: 'Directory',
    attrs: { type: 'button', title: 'Show directory' },
  });
  root.append(panel, restore);

  const TAB: { id: DirTab; label: string }[] = [
    { id: 'systems', label: 'Systems' },
    { id: 'worlds', label: 'Worlds' },
    { id: 'moons', label: 'Moons' },
    { id: 'people', label: 'People' },
    { id: 'dragons', label: 'Dragons' },
    { id: 'places', label: 'Places' },
    { id: 'orders', label: 'Orders' },
    { id: 'shards', label: 'Shards' },
    { id: 'doors', label: 'Doors' },
    { id: 'dawnshards', label: 'Dawnshards' },
  ];
  for (const t of TAB) {
    const b = el('button', { className: 'ceph-chip', text: t.label, attrs: { type: 'button' } });
    listen(b, 'click', () => { tab = t.id; paint(); });
    tabs.append(b);
  }

  const measure = () => {
    if (!panel.classList.contains('is-on')) {
      store.setInset('directory', null);
      setColumnBottom('directory', null);
      return;
    }
    const r = panel.getBoundingClientRect();
    setColumnBottom('directory', r.bottom);
    if (r.width > window.innerWidth * 0.5) {
      store.setInset('directory', { bottom: Math.round(window.innerHeight - r.top + 10) });
    } else {
      store.setInset('directory', { left: Math.round(r.right + 12) });
    }
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
    const canRestore = s.shell === 'play' && !s.cinematic && !atlasIsOpen()
      && s.view !== 'web' && !s.chrome.directory;
    panel.classList.toggle('is-on', show);
    restore.classList.toggle('is-on', canRestore);
    measure();
    if (!show) return;
    // Opening the Spiritual Realm lands on Shards; the other tabs still work.
    if (s.realm !== lastRealm) {
      lastRealm = s.realm;
      if (s.realm === 'spiritual') tab = 'shards';
    }
    const q = search.value.trim().toLowerCase();
    list.replaceChildren();
    [...tabs.children].forEach((c, i) => c.classList.toggle('is-on', TAB[i]!.id === tab));
    title.textContent = TAB.find((t) => t.id === tab)?.label ?? 'Directory';
    kicker.textContent = s.scale === 'system' && s.focusedSystem
      ? (COSMERE.systems.find((x) => x.id === s.focusedSystem)?.name ?? 'System')
      : 'Directory';

    const match = (...parts: Array<string | undefined>) =>
      !q || parts.some((p) => p && p.toLowerCase().includes(q));
    const push = (node: HTMLElement) => list.append(node);

    if (tab === 'systems') {
      for (const sys of COSMERE.systems) {
        if (!systemOnTheMap(sys.id, s.readProgress, s.era) || !match(sys.name)) continue;
        const n = COSMERE.bodies.filter((b) => b.system === sys.id && b.kind !== 'gas-giant'
          && onTheMap(b, s.readProgress, s.era)).length;
        if (!n) continue;
        push(row(sys.id, sys.name, n === 1 ? '1 world' : `${n} worlds`, sys.sunColor, `Enter the ${sys.name} system`));
      }
    } else if (tab === 'worlds') {
      // Standing inside a system, the roster is that system entire — gas
      // giants, dwarf planets and belts included, because they are what is
      // on the screen. From outside, the giants would be two thirds of a
      // list nobody is reading for Palah.
      const inside = s.scale === 'system' && s.focusedSystem;
      for (const b of COSMERE.bodies) {
        if (!onTheMap(b, s.readProgress, s.era) || !match(b.name, b.aliases)) continue;
        if (inside && b.system !== s.focusedSystem) continue;
        if (b.kind === 'gas-giant' && !inside) continue;
        push(row(b.id, b.name, b.kind.replace('-', ' '), b.color, b.fact));
      }
      for (const belt of COSMERE.belts) {
        if (!inside || belt.system !== s.focusedSystem) continue;
        if (!onTheMap(belt, s.readProgress, s.era) || !match(belt.name)) continue;
        push(row(belt.id, belt.name, `${belt.kind} belt`, belt.color, belt.fact));
      }
    } else if (tab === 'moons') {
      for (const m of COSMERE.moons) {
        if (!isVisible(m, s.readProgress) || !match(m.name)) continue;
        const parent = bodyById[m.parent];
        if (parent && !inEra(parent, s.era)) continue;
        if (s.scale === 'system' && s.focusedSystem && parent?.system !== s.focusedSystem) continue;
        push(row(m.id, m.name, parent?.name ?? m.parent, m.color, m.fact));
      }
    } else if (tab === 'people' || tab === 'dragons') {
      // Dragons and the Sleepless are people too; they just get their own
      // tab so a reread can find the seven of them without scrolling ninety.
      const wantDragons = tab === 'dragons';
      for (const c of COSMERE.characters) {
        const otherKind = c.kind === 'dragon' || c.kind === 'sleepless';
        if (otherKind !== wantDragons) continue;
        if (!isVisible(c, s.readProgress) || !match(c.name, c.aliases, c.fact)) continue;
        const at = characterAt(c, s.era);
        if (!at) continue;
        if (s.scale === 'system' && s.focusedSystem && bodyById[at.body ?? '']?.system !== s.focusedSystem) continue;
        push(row(c.id, c.name, wantDragons ? (c.kind === 'dragon' ? 'dragon' : 'Sleepless') : c.origin, c.color, c.fact));
      }
    } else if (tab === 'places') {
      for (const l of COSMERE.locations) {
        if (!onTheMap(l, s.readProgress, s.era) || !match(l.name, l.desc, l.region)) continue;
        if (s.scale === 'system' && s.focusedSystem && bodyById[l.body]?.system !== s.focusedSystem) continue;
        if (s.focusedBody && l.body !== s.focusedBody && s.scale !== 'cosmere' && s.scale !== 'system') continue;
        push(row(l.id, l.name, bodyById[l.body]?.name ?? l.body, l.color, l.desc));
      }
    } else if (tab === 'orders') {
      for (const o of COSMERE.organizations) {
        if (!isVisible(o, s.readProgress) || !match(o.name, o.fact, o.world)) continue;
        push(row(o.id, o.name, o.kind, o.color, o.fact));
      }
    } else if (tab === 'shards') {
      for (const sh of COSMERE.shards) {
        if (s.era <= 0) continue;
        if (!isVisible(sh, s.readProgress) || !match(sh.name)) continue;
        const era = sh.eras.find((e) => e.era === s.era) ?? sh.eras[sh.eras.length - 1];
        push(row(sh.id, sh.name, era?.status ?? 'shard', sh.color, sh.desc));
      }
    } else if (tab === 'doors') {
      for (const p of COSMERE.perps) {
        if (!onTheMap(p, s.readProgress, s.era) || !match(p.name)) continue;
        const body = bodyById[p.body];
        push(row(p.id, p.name, body?.name ?? p.body, '#c4b5fd', p.fact));
      }
    } else {
      for (const d of DAWNSHARDS) {
        if (!isVisible(d, s.readProgress) || !match(d.name)) continue;
        push(row(d.id, d.name, d.command, '#fde68a', d.fact));
      }
    }
    if (!list.childElementCount) {
      list.append(el('div', { className: 'ceph-dir-empty', text: 'Nothing matches — or it is still spoiler-gated.' }));
    }
  };

  const offs = [
    listen(search, 'input', () => { paint(); }),
    listen(collapse, 'click', () => store.patchChrome({ directory: false })),
    listen(restore, 'click', () => store.patchChrome({ directory: true })),
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
    store.on('chrome', paint),
  ];
  paint();
  return {
    destroy() { offs.forEach((o) => o()); panel.remove(); restore.remove(); },
  };
}
