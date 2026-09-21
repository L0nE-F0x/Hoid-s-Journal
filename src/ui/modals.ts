import {
  COSMERE,
  addedThisArc,
  arcNoteFor,
  characterAt,
  cityById,
  isNewThisArc,
  isVisible,
  loreById,
  SEARCH_KIND_LABEL,
  searchJournal,
  systemOnTheMap,
  publicationSafeProgress,
  seriesById,
  fullProgress,
  JOURNAL_BOOKS,
  bookArcIndex,
  type SearchKind,
} from '../data/index.ts';
import { canInstall, promptInstall } from '../core/pwa.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';

export function mountModals(root: HTMLElement): { destroy(): void } {
  const host = el('div');
  root.append(host);
  const offs: (() => void)[] = [];

  const render = () => {
    host.replaceChildren();
    const panel = store.state.panel;
    if (panel === 'none') return;

    const card = el('div', { className: 'ceph-panel ceph-modal-card' });
    const close = el('button', { className: 'ceph-btn', text: 'Close', attrs: { type: 'button' } });
    listen(close, 'click', () => store.set('panel', 'none'));
    card.append(el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' } }, [close]));

    if (panel === 'arcanum') renderArcanum(card);
    else if (panel === 'codex') renderCodex(card);
    else if (panel === 'journal') renderSpoilers(card);
    else if (panel === 'settings') renderSettings(card);
    else if (panel === 'help') renderHelp(card);
    else if (panel === 'realms') renderRealms(card);

    const modal = el('div', { className: 'ceph-modal' }, [card]);
    listen(modal, 'click', (e) => {
      if (e.target === modal) store.set('panel', 'none');
    });
    host.append(modal);
  };

  offs.push(store.on('panel', render));
  offs.push(store.on('magicId', () => { if (store.state.panel === 'arcanum') render(); }));
  offs.push(store.on('readingNow', () => { if (store.state.panel === 'journal') render(); }));
  offs.push(store.on('readProgress', () => {
    if (store.state.panel === 'journal' || store.state.panel === 'codex' || store.state.panel === 'arcanum') render();
  }));
  offs.push(store.on('visual', (vis) => {
    if (store.state.panel !== 'settings') return;
    for (const b of host.querySelectorAll<HTMLElement>('[data-visual]')) {
      const key = b.getAttribute('data-visual') as keyof typeof vis;
      const on = Boolean(vis[key]);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }));

  return { destroy() { offs.forEach((o) => o()); host.remove(); } };
}

function renderArcanum(card: HTMLElement): void {
  const mag = COSMERE.magics.find((m) => m.id === store.state.magicId);
  if (!mag) {
    card.append(el('div', { className: 'ceph-kicker', text: 'The Arcanum' }), el('h2', { text: 'Magic systems of the Cosmere' }));
    const grid = el('div', { className: 'ceph-grid' });
    for (const m of COSMERE.magics) {
      if (!isVisible(m, store.state.readProgress)) continue;
      const b = el('button', { className: 'ceph-card' }, [
        el('div', { className: 'ceph-kicker', text: m.world, style: { color: m.color } }),
        el('div', { text: m.name, style: { fontWeight: '600', marginTop: '6px' } }),
        el('div', { text: m.type, style: { color: 'var(--ceph-text-dim)', marginTop: '6px', fontSize: '11px' } }),
      ]);
      listen(b, 'click', () => store.set('magicId', m.id));
      grid.append(b);
    }
    card.append(grid);
    return;
  }
  const back = el('button', { className: 'ceph-btn', text: '← All systems', style: { marginRight: '8px' } });
  listen(back, 'click', () => store.set('magicId', null));
  card.append(back);
  card.append(el('div', { className: 'ceph-kicker', text: mag.world, style: { color: mag.color, marginTop: '12px' } }));
  card.append(el('h2', { text: mag.name }));
  card.append(el('span', { className: `ceph-canon ceph-canon--${mag.canon}`, text: mag.canon }));
  card.append(el('p', { className: 'ceph-fact', text: mag.desc }));
  card.append(el('p', { className: 'ceph-fact', text: mag.mechanics }));
  if (mag.bio) card.append(el('p', { className: 'ceph-fact ceph-fact--aside', text: mag.bio }));
  if (mag.users) card.append(el('p', { className: 'ceph-fact', text: `Users: ${mag.users}` }));
  if (mag.table) {
    const table = el('table', { className: 'ceph-table' });
    const thead = el('thead');
    const hr = el('tr');
    for (const c of mag.table.cols) hr.append(el('th', { text: c }));
    thead.append(hr);
    table.append(thead);
    const tb = el('tbody');
    for (const row of mag.table.rows) {
      const tr = el('tr');
      for (const cell of row) tr.append(el('td', { text: cell }));
      tb.append(tr);
    }
    table.append(tb);
    card.append(table);
  }
}

const CODEX_FILTERS: { id: SearchKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'person', label: 'People' },
  { id: 'place', label: 'Places' },
  { id: 'term', label: 'Terms' },
  { id: 'magic', label: 'Magic' },
  { id: 'org', label: 'Orders' },
  { id: 'shard', label: 'Shards' },
  { id: 'world', label: 'Worlds' },
];

function flyCodexHit(id: string): void {
  store.set('selected', id);
  const hit = loreById(id);
  if (!hit) return;
  if (hit.kind === 'magic') {
    store.set('magicId', id);
    store.set('panel', 'arcanum');
    return;
  }
  store.set('panel', 'none');
  if (hit.kind === 'body') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
    return;
  }
  if (hit.kind === 'location') {
    store.set('cameraCue', { kind: 'focus', id, scale: cityById[id] ? 'city' : 'surface' });
    return;
  }
  if (hit.kind === 'landmark') {
    store.set('cameraCue', { kind: 'focus', id: hit.obj.city, scale: 'city' });
    return;
  }
  if (hit.kind === 'hub') {
    store.set('realm', 'cognitive');
    store.set('cameraCue', { kind: 'focus', id, scale: 'cosmere' });
    return;
  }
  if (hit.kind === 'shard' || hit.kind === 'dawnshard') {
    store.set('realm', 'spiritual');
    return;
  }
  if (hit.kind === 'character') {
    const where = characterAt(hit.obj, store.state.era)?.body;
    if (where) store.set('cameraCue', { kind: 'focus', id: where, scale: 'globe' });
    return;
  }
  if (hit.kind === 'system') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
    return;
  }
  if (hit.kind === 'moon') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
    return;
  }
  if (hit.kind === 'belt') {
    store.set('cameraCue', { kind: 'focus', id: hit.obj.system, scale: 'system' });
    return;
  }
  if (hit.kind === 'perp') {
    if (hit.obj.at) store.set('cameraCue', { kind: 'focus', id: hit.obj.at, scale: 'surface' });
    else store.set('cameraCue', { kind: 'focus', id: hit.obj.body, scale: 'globe' });
  }
}

function renderCodex(card: HTMLElement): void {
  card.append(
    el('div', { className: 'ceph-kicker', text: 'The Codex' }),
    el('h2', { text: 'Ask the journal' }),
    el('p', {
      className: 'ceph-fact',
      text: 'Names, aliases, orders, metals, places. “Who is Thaidakar” and “Wit” hit the same man. The sky hides what you have not read.',
    }),
  );
  const input = el('input', {
    className: 'ceph-search',
    attrs: {
      placeholder: 'Who is Thaidakar? What is a metalmind? Where is Urithiru?',
      value: store.state.searchQuery,
      type: 'search',
    },
  }) as HTMLInputElement;
  const filters = el('div', { className: 'ceph-codex-filters' });
  const results = el('div', { className: 'ceph-codex-results' });
  let filter: SearchKind | 'all' = 'all';

  const paintFilters = () => {
    [...filters.children].forEach((c, i) => {
      const spec = CODEX_FILTERS[i]!;
      c.classList.toggle('is-on', spec.id === filter);
    });
  };

  for (const f of CODEX_FILTERS) {
    const b = el('button', { className: 'ceph-chip', text: f.label, attrs: { type: 'button' } });
    listen(b, 'click', () => { filter = f.id; paintFilters(); run(); });
    filters.append(b);
  }

  const run = () => {
    store.set('searchQuery', input.value);
    results.replaceChildren();
    const kinds = filter === 'all' ? undefined : [filter];
    const q = input.value.trim();
    if (q.length < 2) {
      if (filter === 'all') {
        results.append(el('div', { className: 'ceph-kicker', text: 'Browse' }));
        const counts = el('div', { className: 'ceph-codex-counts' });
        const rows: [string, number][] = [
          ['people', COSMERE.characters.length],
          ['places', COSMERE.locations.length],
          ['terms', COSMERE.glossary.length],
          ['orders', COSMERE.organizations.length],
          ['magics', COSMERE.magics.length],
        ];
        for (const [label, n] of rows) {
          counts.append(el('div', { className: 'ceph-title-count' }, [
            el('b', { text: String(n) }),
            el('span', { text: label }),
          ]));
        }
        results.append(counts);
        results.append(el('div', { className: 'ceph-kicker', text: 'Systems', style: { marginTop: '12px' } }));
        for (const sys of COSMERE.systems) {
          if (!systemOnTheMap(sys.id, store.state.readProgress, store.state.era)) continue;
          const b = el('button', { className: 'ceph-card' }, [
            el('div', { className: 'ceph-kicker', text: 'system' }),
            el('div', { text: sys.name, style: { fontWeight: '600' } }),
          ]);
          listen(b, 'click', () => flyCodexHit(sys.id));
          results.append(b);
        }
        return;
      }
      results.append(el('div', { className: 'ceph-kicker', text: CODEX_FILTERS.find((f) => f.id === filter)?.label ?? '' }));
      const vis = store.state.readProgress;
      const cards: { id: string; label: string; kind: string; fact: string; book?: string; arc?: string }[] = [];
      if (filter === 'person') {
        for (const c of COSMERE.characters) {
          if (!isVisible(c, vis)) continue;
          cards.push({ id: c.id, label: c.name, kind: 'person', fact: c.fact, book: c.book, arc: c.arc });
        }
      } else if (filter === 'place') {
        for (const l of COSMERE.locations) {
          if (!isVisible(l, vis)) continue;
          cards.push({ id: l.id, label: l.name, kind: 'place', fact: l.desc, book: l.book, arc: l.arc });
        }
      } else if (filter === 'term') {
        for (const g of COSMERE.glossary) {
          if (!isVisible(g, vis)) continue;
          cards.push({ id: g.id, label: g.term, kind: 'term', fact: g.def, book: g.book, arc: g.arc });
        }
      } else if (filter === 'magic') {
        for (const m of COSMERE.magics) {
          if (!isVisible(m, vis)) continue;
          cards.push({ id: m.id, label: m.name, kind: 'magic', fact: m.desc, book: m.book });
        }
      } else if (filter === 'org') {
        for (const o of COSMERE.organizations) {
          if (!isVisible(o, vis)) continue;
          cards.push({ id: o.id, label: o.name, kind: 'order', fact: o.fact, book: o.book, arc: o.arc });
        }
      } else if (filter === 'shard') {
        for (const s of COSMERE.shards) {
          if (!isVisible(s, vis)) continue;
          cards.push({ id: s.id, label: s.name, kind: 'shard', fact: s.desc, book: s.book });
        }
      } else if (filter === 'world') {
        for (const b of COSMERE.bodies) {
          if (b.kind === 'gas-giant' || !isVisible(b, vis)) continue;
          cards.push({ id: b.id, label: b.name, kind: 'world', fact: b.fact, book: b.book });
        }
      }
      for (const h of cards.slice(0, 80)) {
        const fresh = isNewThisArc(h, store.state.readingNow);
        const row = el('button', { className: 'ceph-card' }, [
          el('div', { className: 'ceph-kicker', text: fresh ? `✦ ${h.kind} · new this arc` : h.kind,
            style: fresh ? { color: 'var(--ceph-amber)' } : {} }),
          el('div', { text: h.label, style: { fontWeight: '600' } }),
          el('div', { text: h.fact, style: { color: 'var(--ceph-text-dim)', fontSize: '12px', marginTop: '4px' } }),
        ]);
        listen(row, 'click', () => flyCodexHit(h.id));
        results.append(row);
      }
      results.append(el('div', {
        className: 'ceph-kicker',
        text: `${Math.min(cards.length, 80)} of ${cards.length}`,
        style: { marginTop: '10px' },
      }));
      return;
    }
    const hits = searchJournal(q, store.state.readProgress, kinds, 60);
    for (const h of hits) {
      const fresh = isNewThisArc({ book: h.book, arc: h.arc }, store.state.readingNow);
      const kind = SEARCH_KIND_LABEL[h.kind] ?? h.kind;
      const row = el('button', { className: 'ceph-card' }, [
        el('div', {
          className: 'ceph-kicker',
          text: fresh ? `✦ ${kind} · new this arc` : kind,
          style: fresh ? { color: 'var(--ceph-amber)' } : {},
        }),
        el('div', { text: h.label, style: { fontWeight: '600' } }),
        h.aliases
          ? el('div', { className: 'ceph-kicker', text: h.aliases, style: { marginTop: '2px' } })
          : '',
        el('div', { text: h.fact, style: { color: 'var(--ceph-text-dim)', fontSize: '12px', marginTop: '4px' } }),
      ]);
      listen(row, 'click', () => flyCodexHit(h.id));
      results.append(row);
    }
    if (!hits.length) {
      results.append(el('div', {
        text: 'Nothing in the journal matches — or it is still spoiler-gated.',
        style: { color: 'var(--ceph-text-dim)' },
      }));
    } else {
      results.append(el('div', {
        className: 'ceph-kicker',
        text: hits.length === 60 ? '60 matches · refine the question' : `${hits.length} matches`,
        style: { marginTop: '10px' },
      }));
    }
  };
  listen(input, 'input', run);
  card.append(input, filters, results);
  paintFilters();
  queueMicrotask(() => input.focus());
  run();
}

function renderHelp(card: HTMLElement): void {
  card.append(
    el('div', { className: 'ceph-kicker', text: 'How to read the sky' }),
    el('h2', { text: 'The journal is a map you fly' }),
    el('p', { className: 'ceph-fact', text: 'Hover a world for its name. Click to open the card — the sky stays put. Click the orbit rings, not just the star, to dive in. Click a world for its globe, again for the surface, again for a city plate. Esc walks back out. ☰ hides the directory. Search (K) is the journal: aliases, orders, metals, “who is Thaidakar”.' }),
    el('p', { className: 'ceph-fact', html: '<b>Drag</b> orbit · <b>scroll</b> zoom · <b>WASD / QE</b> fly (those keys never open panels) · <b>Space</b> play time · <b>+/−</b> on the timeline for speed · click a tick for a named beat · <b>1–6</b> eras · <b>C</b> Cognitive · <b>V</b> Spiritual · <b>L</b> Lore Web · <b>M</b> galaxy chart · <b>F</b> frame Cosmere · <b>K</b> or <b>/</b> Search · <b>H</b> this help. Arcanum, Journal, Settings and Share are buttons. Soundtrack lives in Settings.' }),
    el('p', { className: 'ceph-fact', text: 'Roshar and Scadrial atlas plates are Isaac Stewart\'s cartography, credited on the map. Globes are procedural, baked from one recipe per world, so a coast on the plate is the same coast on the sphere. Journal sets where you are in the books; the sky hides what you have not reached. Default is fully read.' }),
    el('p', { className: 'ceph-fact', style: { color: 'var(--ceph-text-dim)' }, text: 'Unofficial fan project. Not affiliated with Dragonsteel or Brandon Sanderson. Cartography by Isaac Stewart.' }),
  );
}

function renderRealms(card: HTMLElement): void {
  card.append(
    el('div', { className: 'ceph-kicker', text: 'The three Realms' }),
    el('h2', { text: 'Where do you stand?' }),
  );
  const grid = el('div', { className: 'ceph-grid' });
  const rows: { id: 'physical' | 'cognitive' | 'spiritual'; title: string; fact: string }[] = [
    { id: 'physical', title: 'Physical', fact: 'The orrery. Every star canon names, their worlds, moons and belts, and the sky you reread in.' },
    { id: 'cognitive', title: 'Cognitive · Shadesmar', fact: 'Bead oceans where land was, and the light of every mind over them. Silverlight, Celebrant, Lasting Integrity, the Grand Knell, the Expanses, and the roads between. C toggles.' },
    { id: 'spiritual', title: 'Spiritual', fact: 'Not a map. One light Shattered into sixteen, still Connected, with the broken ones shown as the fragments they are. Click a Shard to see where it sits. V toggles.' },
  ];
  for (const r of rows) {
    const on = store.state.realm === r.id;
    const b = el('button', { className: `ceph-card${on ? ' is-on' : ''}` }, [
      el('div', { className: 'ceph-kicker', text: on ? 'you are here' : 'Realm' }),
      el('div', { text: r.title, style: { fontWeight: '600', marginTop: '6px' } }),
      el('div', { text: r.fact, style: { color: 'var(--ceph-text-dim)', marginTop: '6px', fontSize: '12px' } }),
    ]);
    listen(b, 'click', () => {
      store.set('realm', r.id);
      store.set('panel', 'none');
    });
    grid.append(b);
  }
  card.append(grid);
}

function applyReading(series: string | null, arc: number): void {
  if (!series) {
    store.set('readingNow', null);
    store.setProgress(fullProgress());
    return;
  }
  const now = { series, arc };
  store.setProgress(publicationSafeProgress(now));
  store.set('readingNow', now);
}

function renderSpoilers(card: HTMLElement): void {
  card.append(
    el('div', { className: 'ceph-kicker', text: 'Reading companion' }),
    el('h2', { text: 'Where are you in the story?' }),
    el('p', { className: 'ceph-fact', text: 'Rereaders default to fully read. Pick the book you are on and the journal hides what was published after it. Every Cosmere work is in the list — not just the big series names.' }),
  );

  const now = store.state.readingNow;
  const pick = el('select', { className: 'ceph-search', style: { marginTop: '14px' } }) as HTMLSelectElement;
  pick.append(el('option', { text: 'Not tracking a book — show everything', attrs: { value: '' } }));
  for (const book of JOURNAL_BOOKS) {
    const i = bookArcIndex(book.series, book.arc);
    const here = now?.series === book.series && now.arc === i;
    pick.append(el('option', {
      text: book.title,
      attrs: { value: `${book.series}:${book.arc}`, ...(here ? { selected: 'selected' } : {}) },
    }));
  }
  listen(pick, 'change', () => {
    const v = pick.value;
    if (!v) { applyReading(null, 0); return; }
    const [series, arc] = v.split(':');
    if (!series || !arc) return;
    applyReading(series, bookArcIndex(series, arc));
  });
  card.append(pick);

  if (now) {
    const s = seriesById[now.series];
    const note = s ? arcNoteFor(now.series, now.arc, s.arcs) : undefined;
    if (note) {
      card.append(
        el('div', { className: 'ceph-kicker', text: 'This beat added', style: { marginTop: '16px' } }),
        el('p', { className: 'ceph-fact', text: note.added }),
        el('p', { className: 'ceph-fact', text: note.note, style: { color: 'var(--ceph-text-dim)' } }),
      );
    }
    const fresh = addedThisArc(now);
    if (fresh.length) {
      const wrap = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' } });
      for (const row of fresh.slice(0, 24)) {
        wrap.append(el('span', { className: 'ceph-atlas-chip', text: `✦ ${row.name}`,
          style: { border: '1px solid var(--ceph-border)', borderRadius: '999px', padding: '2px 8px', fontSize: '10.5px' } }));
      }
      card.append(wrap);
    }
  }

  const list = el('div', { className: 'ceph-book-list' });
  for (const book of JOURNAL_BOOKS) {
    const i = bookArcIndex(book.series, book.arc);
    const prog = store.state.readProgress[book.series] ?? (seriesById[book.series]?.arcs.length ?? 1) - 1;
    const here = now?.series === book.series && now.arc === i;
    const read = prog >= i;
    const row = el('button', {
      className: `ceph-book${here ? ' is-on' : ''}${read ? ' is-read' : ''}`,
      attrs: { type: 'button' },
    }, [
      el('span', { className: 'ceph-book-mark', text: here ? '✦' : read ? '·' : '' }),
      el('span', { className: 'ceph-book-title', text: book.title }),
    ]);
    listen(row, 'click', () => applyReading(book.series, i));
    list.append(row);
  }
  const clear = el('button', {
    className: 'ceph-btn',
    text: 'Show everything',
    style: { marginTop: '14px' },
  });
  listen(clear, 'click', () => applyReading(null, 0));
  if (!now) clear.disabled = true;
  card.append(el('div', { className: 'ceph-kicker', text: 'Every book', style: { marginTop: '18px' } }));
  card.append(list, clear);
}


function renderSettings(card: HTMLElement): void {
  card.append(el('h2', { text: 'Settings' }));
  const v = store.state.visual;
  const toggle = (key: keyof typeof v, label: string) => {
    const b = el('button', {
      className: `ceph-chip${v[key] ? ' is-on' : ''}`,
      text: label,
      attrs: { type: 'button', 'data-visual': String(key), 'aria-pressed': v[key] ? 'true' : 'false' },
    });
    listen(b, 'click', () => {
      const next = !store.state.visual[key];
      store.patchVisual({ [key]: next });
      b.classList.toggle('is-on', Boolean(next));
      b.setAttribute('aria-pressed', next ? 'true' : 'false');
    });
    return b;
  };
  card.append(el('div', { className: 'ceph-kicker', text: 'The sky', style: { marginTop: '14px' } }));
  card.append(el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' } }, [
    toggle('showOrbits', 'Orbits'),
    toggle('showMoons', 'Moons'),
    toggle('showNebula', 'Nebulae'),
    toggle('showLabels', 'Labels'),
    toggle('showAtmospheres', 'Atmospheres'),
    toggle('showCharacters', 'People'),
    toggle('showShardLines', 'Shard lines'),
    toggle('showPerps', 'Doors'),
  ]));
  card.append(el('div', { className: 'ceph-kicker', text: 'Feel', style: { marginTop: '16px' } }));
  const auto = toggle('autoRotate', 'Auto-rotate (title)');
  if (store.state.shell === 'play') {
    auto.disabled = true;
    auto.title = 'Turns the title sky only';
  }
  card.append(el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' } }, [
    auto,
    toggle('rumble', 'Rumble'),
    toggle('music', 'Soundtrack'),
  ]));
  const slider = (key: 'bloom' | 'exposure' | 'starSize' | 'nebula', label: string, min: number, max: number) => {
    const row = el('label', { className: 'ceph-look-slider' });
    const cap = el('span', { text: `${label}  ${v[key].toFixed(2)}` });
    const input = el('input', {
      className: 'ceph-slider',
      attrs: { type: 'range', min: String(min), max: String(max), step: '0.05', value: String(v[key]) },
    }) as HTMLInputElement;
    listen(input, 'input', () => {
      const n = Number(input.value);
      store.patchVisual({ [key]: n });
      cap.textContent = `${label}  ${n.toFixed(2)}`;
    });
    row.append(cap, input);
    return row;
  };
  card.append(el('div', { className: 'ceph-kicker', text: 'Picture', style: { marginTop: '16px' } }));
  card.append(el('div', { style: { display: 'grid', gap: '8px', marginTop: '8px' } }, [
    slider('bloom', 'Bloom', 0, 2),
    slider('exposure', 'Exposure', 0.4, 2),
    slider('starSize', 'Stars', 0.4, 2.4),
    slider('nebula', 'Nebula', 0, 2),
  ]));
  const q = el('button', {
    className: 'ceph-chip is-on',
    text: `Quality · ${v.quality}`,
    style: { marginTop: '12px' },
    attrs: { type: 'button' },
  });
  listen(q, 'click', () => {
    const order = ['auto', 'high', 'medium', 'low'] as const;
    const i = order.indexOf(store.state.visual.quality);
    const next = order[(i + 1) % order.length]!;
    store.patchVisual({ quality: next });
    q.textContent = `Quality · ${next}`;
  });
  card.append(q);

  if (canInstall()) {
    const install = el('button', {
      className: 'ceph-btn ceph-btn--primary',
      text: 'Install the journal',
      style: { marginTop: '18px' },
    });
    listen(install, 'click', () => { void promptInstall(); });
    card.append(
      el('div', { className: 'ceph-kicker', text: 'Offline', style: { marginTop: '20px' } }),
      el('p', { className: 'ceph-fact', text: 'Keep the journal on the device and open it without a connection.' }),
      install,
    );
  }
}
