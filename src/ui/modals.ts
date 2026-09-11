import {
  COSMERE,
  bodyById,
  characterAt,
  characterById,
  cityById,
  isNewThisArc,
  isVisible,
  landmarkById,
  publicationSafeProgress,
  seriesById,
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
  offs.push(store.on('readingNow', () => { if (store.state.panel === 'spoilers') render(); }));
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
    const hits: { id: string; label: string; kind: string; fact: string; fresh: boolean }[] = [];
    const push = (id: string, label: string, kind: string, fact: string, vis: { book?: string; arc?: string }) => {
      if (!isVisible(vis, store.state.readProgress)) return;
      if (!label.toLowerCase().includes(q) && !fact.toLowerCase().includes(q)) return;
      hits.push({ id, label, kind, fact, fresh: isNewThisArc(vis, store.state.readingNow) });
    };
    for (const b of COSMERE.bodies) push(b.id, b.name, 'world', b.fact, b);
    for (const c of COSMERE.characters) push(c.id, c.name, 'person', c.fact, c);
    for (const s of COSMERE.shards) push(s.id, s.name, 'shard', s.desc, s);
    for (const m of COSMERE.magics) push(m.id, m.name, 'magic', m.desc, m);
    for (const g of COSMERE.glossary) push(g.id, g.term, 'term', g.def, g);
    for (const l of COSMERE.locations) push(l.id, l.name, 'place', l.desc, l);
    for (const m of Object.values(landmarkById)) push(m.id, m.name, 'place', m.desc, m);
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
        el('div', { className: 'ceph-kicker', text: h.fresh ? `✦ ${h.kind} · new this arc` : h.kind,
          style: h.fresh ? { color: 'var(--ceph-amber)' } : {} }),
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
        // A Codex hit should take you there, not just tick a box.
        if (bodyById[h.id]) {
          store.set('cameraCue', { kind: 'focus', id: h.id, scale: 'globe' });
          return;
        }
        if (COSMERE.locations.some((l) => l.id === h.id)) {
          store.set('cameraCue', {
            kind: 'focus', id: h.id,
            scale: cityById[h.id] ? 'city' : 'surface',
          });
          return;
        }
        const mark = landmarkById[h.id];
        if (mark) {
          store.set('cameraCue', { kind: 'focus', id: mark.city, scale: 'city' });
          store.set('selected', mark.id);
          return;
        }
        const ch = characterById[h.id];
        const where = ch ? characterAt(ch, store.state.era)?.body : undefined;
        if (where) {
          store.set('cameraCue', { kind: 'focus', id: where, scale: 'globe' });
          store.set('selected', h.id);
        }
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

function applyReading(series: string | null, arc: number): void {
  if (!series) {
    store.set('readingNow', null);
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
    el('p', { className: 'ceph-fact', text: 'Rereaders default to fully read. Tell the journal what you are on and it syncs the Cosmere to that beat, publication-safe. Or step a single series back by hand.' }),
  );

  // "I am on Words of Radiance": the beat the whole journal answers to.
  const now = store.state.readingNow;
  const pick = el('select', { className: 'ceph-search', style: { marginTop: '14px' } }) as HTMLSelectElement;
  pick.append(el('option', { text: 'Not tracking a book — show everything', attrs: { value: '' } }));
  for (const s of COSMERE.series) {
    pick.append(el('option', {
      text: s.title,
      attrs: { value: s.id, ...(now?.series === s.id ? { selected: 'selected' } : {}) },
    }));
  }
  listen(pick, 'change', () => {
    const id = pick.value;
    if (!id) { applyReading(null, 0); return; }
    const s = seriesById[id];
    applyReading(id, s ? s.arcs.length - 1 : 0);
  });

  const arcRow = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' } });
  if (now) {
    const s = seriesById[now.series];
    const back = el('button', { className: 'ceph-btn', text: '←' });
    const fwd = el('button', { className: 'ceph-btn', text: '→' });
    listen(back, 'click', () => applyReading(now.series, Math.max(0, now.arc - 1)));
    listen(fwd, 'click', () => applyReading(now.series, Math.min((s?.arcs.length ?? 1) - 1, now.arc + 1)));
    arcRow.append(
      back, fwd,
      el('span', { className: 'ceph-reading', text: `✦ ${s?.arcs[now.arc]?.label ?? 'reading'}` }),
    );
  }
  card.append(pick, arcRow);
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
  const pub = el('button', {
    className: 'ceph-btn',
    text: 'Re-apply publication-safe',
    style: { marginTop: '12px' },
  });
  listen(pub, 'click', () => {
    const n = store.state.readingNow;
    if (!n) return;
    applyReading(n.series, n.arc);
  });
  if (!store.state.readingNow) pub.disabled = true;
  card.append(el('div', { className: 'ceph-kicker', text: 'By series', style: { marginTop: '18px' } }));
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

  if (canInstall()) {
    const install = el('button', {
      className: 'ceph-btn ceph-btn--primary',
      text: 'Install the journal',
      style: { marginTop: '18px' },
    });
    listen(install, 'click', () => { void promptInstall(); });
    card.append(
      el('div', { className: 'ceph-kicker', text: 'Offline', style: { marginTop: '20px' } }),
      el('p', { className: 'ceph-fact', text: 'Keep Cephandrius on the device and open it without a connection.' }),
      install,
    );
  }
}
