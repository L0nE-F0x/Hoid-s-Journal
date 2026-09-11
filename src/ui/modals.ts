import { COSMERE, bodyById, isVisible, seriesById } from '../data/index.ts';
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
    const close = el('button', { className: 'ceph-btn', text: 'Close', style: { float: 'right' } });
    listen(close, 'click', () => store.set('panel', 'none'));
    card.append(close);

    if (panel === 'arcanum') renderArcanum(card);
    else if (panel === 'codex') renderCodex(card);
    else if (panel === 'spoilers') renderSpoilers(card);
    else if (panel === 'settings') renderSettings(card);

    const modal = el('div', { className: 'ceph-modal' }, [card]);
    listen(modal, 'click', (e) => {
      if (e.target === modal) store.set('panel', 'none');
    });
    host.append(modal);
  };

  offs.push(store.on('panel', render));
  offs.push(store.on('magicId', () => { if (store.state.panel === 'arcanum') render(); }));
  offs.push(store.on('readProgress', () => {
    if (store.state.panel === 'spoilers' || store.state.panel === 'codex' || store.state.panel === 'arcanum') render();
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

function renderCodex(card: HTMLElement): void {
  card.append(el('div', { className: 'ceph-kicker', text: 'The Codex' }), el('h2', { text: 'Search the journal' }));
  const input = el('input', { className: 'ceph-search', attrs: { placeholder: 'Worlds, people, shards, terms…', value: store.state.searchQuery } });
  const results = el('div', { style: { marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' } });
  const run = () => {
    const q = input.value.trim().toLowerCase();
    store.set('searchQuery', input.value);
    results.replaceChildren();
    if (q.length < 2) return;
    const hits: { id: string; label: string; kind: string; fact: string }[] = [];
    const push = (id: string, label: string, kind: string, fact: string, vis: { book?: string; arc?: string }) => {
      if (!isVisible(vis, store.state.readProgress)) return;
      if (!label.toLowerCase().includes(q) && !fact.toLowerCase().includes(q)) return;
      hits.push({ id, label, kind, fact });
    };
    for (const b of COSMERE.bodies) push(b.id, b.name, 'world', b.fact, b);
    for (const c of COSMERE.characters) push(c.id, c.name, 'person', c.fact, c);
    for (const s of COSMERE.shards) push(s.id, s.name, 'shard', s.desc, s);
    for (const m of COSMERE.magics) push(m.id, m.name, 'magic', m.desc, m);
    for (const g of COSMERE.glossary) push(g.id, g.term, 'term', g.def, g);
    for (const l of COSMERE.locations) push(l.id, l.name, 'place', l.desc, l);
    hits.sort((a, b) => {
      const score = (h: { label: string }) => {
        const n = h.label.toLowerCase();
        if (n === q) return 0;
        if (n.startsWith(q)) return 1;
        if (n.includes(q)) return 2;
        return 3;
      };
      return score(a) - score(b);
    });
    for (const h of hits.slice(0, 40)) {
      const row = el('button', { className: 'ceph-card' }, [
        el('div', { className: 'ceph-kicker', text: h.kind }),
        el('div', { text: h.label, style: { fontWeight: '600' } }),
        el('div', { text: h.fact, style: { color: 'var(--ceph-text-dim)', fontSize: '12px', marginTop: '4px' } }),
      ]);
      listen(row, 'click', () => {
        store.set('panel', 'none');
        if (COSMERE.magics.some((m) => m.id === h.id)) {
          store.set('magicId', h.id);
          store.set('panel', 'arcanum');
          return;
        }
        store.set('selected', h.id);
        if (bodyById[h.id]) store.set('cameraCue', { kind: 'focus', id: h.id, scale: 'globe' });
      });
      results.append(row);
    }
    if (!hits.length) results.append(el('div', { text: 'Nothing in the journal matches — or it is still spoiler-gated.', style: { color: 'var(--ceph-text-dim)' } }));
  };
  listen(input, 'input', run);
  card.append(input, results);
  queueMicrotask(() => input.focus());
  if (store.state.searchQuery.length >= 2) run();
}

function renderSpoilers(card: HTMLElement): void {
  card.append(
    el('div', { className: 'ceph-kicker', text: 'Reading companion' }),
    el('h2', { text: 'Where are you in the story?' }),
    el('p', { className: 'ceph-fact', text: 'Rereaders default to fully read. Step a series back if you want the Cosmere to hide what you have not reached.' }),
  );
  const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' } });
  for (const s of COSMERE.series) {
    const prog = store.state.readProgress[s.id] ?? s.arcs.length - 1;
    const label = el('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px' } }, [
      el('strong', { text: s.title }),
      el('span', { className: 'ceph-kicker', text: prog < 0 ? 'unread' : s.arcs[prog]?.label ?? 'done' }),
    ]);
    const row = el('div');
    const less = el('button', { className: 'ceph-btn', text: '−' });
    const more = el('button', { className: 'ceph-btn', text: '+' });
    listen(less, 'click', () => store.patchProgress(s.id, Math.max(-1, prog - 1)));
    listen(more, 'click', () => store.patchProgress(s.id, Math.min(s.arcs.length - 1, prog + 1)));
    row.append(label, el('div', { style: { display: 'flex', gap: '8px', marginTop: '6px' } }, [less, more]));
    list.append(row);
  }
  const pub = el('button', { className: 'ceph-btn', text: 'Publication-safe preset', style: { marginTop: '12px' } });
  listen(pub, 'click', () => {
    const now = store.state.readingNow;
    const idx = now ? COSMERE.pubOrder.indexOf(now.series) : COSMERE.pubOrder.length - 1;
    for (const id of COSMERE.pubOrder) {
      const s = seriesById[id];
      if (!s) continue;
      const i = COSMERE.pubOrder.indexOf(id);
      store.patchProgress(id, i <= idx ? s.arcs.length - 1 : -1);
    }
  });
  card.append(list, pub);
}

function renderSettings(card: HTMLElement): void {
  card.append(el('h2', { text: 'Look' }));
  const v = store.state.visual;
  const toggle = (key: keyof typeof v, label: string) => {
    const b = el('button', { className: `ceph-chip${v[key] ? ' is-on' : ''}`, text: label });
    listen(b, 'click', () => store.patchVisual({ [key]: !v[key] }));
    return b;
  };
  card.append(el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' } }, [
    toggle('showOrbits', 'Orbits'),
    toggle('showMoons', 'Moons'),
    toggle('showNebula', 'Nebulae'),
    toggle('showLabels', 'Labels'),
    toggle('showAtmospheres', 'Atmospheres'),
    toggle('autoRotate', 'Auto-rotate (title)'),
  ]));
}
