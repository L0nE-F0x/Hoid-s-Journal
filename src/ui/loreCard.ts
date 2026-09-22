/**
 * Encyclopedia card shared by the overlay drawer and the Codex.
 * UI talks only to the store; all lore comes from data/.
 */
import {
  COSMERE,
  bodyById,
  canEnterCity,
  characterAt,
  cityById,
  relationsFor,
  shownFace,
  isNewThisArc,
  isVisible,
  loreById,
  loreLabel,
  orgsForCharacter,
  perpAt,
  relatedRefs,
  seriesById,
  wikiHref,
  worldDate,
  type LoreHit,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';

function field(label: string, value: string | undefined | null): HTMLElement | null {
  if (!value || value === '—' || value === 'None') return null;
  return el('div', { className: 'ceph-field' }, [
    el('div', { className: 'ceph-field-label', text: label }),
    el('div', { className: 'ceph-field-val', text: value }),
  ]);
}

/**
 * A field whose value is a list of ids. `shards` and `magic` on a world are
 * stored as ids, and the card printed them raw — every world in the app read
 * "SHARDS honor, cultivation, odium". They are names now, and each one opens
 * the Shard or the Arcanum page it stands for.
 */
function refField(label: string, ids: string[] | undefined): HTMLElement | null {
  const refs = relatedRefs(ids);
  if (!refs.length) return null;
  const chips = el('div', { className: 'ceph-see-chips' });
  for (const r of refs) {
    const b = el('button', { className: 'ceph-atlas-chip', text: r.label, attrs: { type: 'button' } });
    listen(b, 'click', () => openId(r.id));
    chips.append(b);
  }
  return el('div', { className: 'ceph-field' }, [
    el('div', { className: 'ceph-field-label', text: label }),
    chips,
  ]);
}

function fields(pairs: [string, string | undefined | null][]): HTMLElement {
  const grid = el('div', { className: 'ceph-fields' });
  for (const [k, v] of pairs) {
    const n = field(k, v);
    if (n) grid.append(n);
  }
  return grid;
}

function swatch(color: string): HTMLElement {
  return el('div', { className: 'ceph-swatch', style: { background: color } });
}

function characterCue(ch: { id: string; eras: Parameters<typeof characterAt>[0]['eras']; book: string }): void {
  const at = characterAt(ch as Parameters<typeof characterAt>[0], store.state.era, store.state.readProgress);
  if (at?.at) {
    store.set('cameraCue', { kind: 'focus', id: at.at, scale: 'surface', keepSelected: true });
  } else if (at?.body) {
    store.set('cameraCue', { kind: 'focus', id: at.body, scale: 'globe', keepSelected: true });
  }
}

function openId(id: string): void {
  store.set('selected', id);
  const hit = loreById(id);
  if (!hit) return;
  if (hit.kind === 'body') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
  } else if (hit.kind === 'location') {
    store.set('cameraCue', {
      kind: 'focus', id,
      scale: cityById[id] ? 'city' : 'surface',
    });
  } else if (hit.kind === 'hub') {
    store.set('realm', 'cognitive');
    store.set('cameraCue', { kind: 'focus', id, scale: 'cosmere' });
  } else if (hit.kind === 'shard' || hit.kind === 'dawnshard') {
    store.set('realm', 'spiritual');
  } else if (hit.kind === 'character') {
    characterCue(hit.obj);
  } else if (hit.kind === 'magic') {
    store.set('magicId', id);
    store.set('panel', 'arcanum');
  } else if (hit.kind === 'moon') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
  } else if (hit.kind === 'system') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
  } else if (hit.kind === 'belt') {
    store.set('cameraCue', { kind: 'focus', id: hit.obj.system, scale: 'system' });
  } else if (hit.kind === 'perp') {
    const at = hit.obj.at;
    if (at) store.set('cameraCue', { kind: 'focus', id: at, scale: 'surface' });
    else store.set('cameraCue', { kind: 'focus', id: hit.obj.body, scale: 'globe' });
  }
}

function seeRow(ids: string[] | undefined, extra: { id: string; label: string }[] = []): HTMLElement | null {
  const refs = [...relatedRefs(ids), ...extra.filter((e) => !ids?.includes(e.id))];
  if (!refs.length) return null;
  const wrap = el('div', { className: 'ceph-see' });
  wrap.append(el('div', { className: 'ceph-field-label', text: 'See also' }));
  const chips = el('div', { className: 'ceph-see-chips' });
  for (const r of refs) {
    const b = el('button', { className: 'ceph-atlas-chip', text: r.label, attrs: { type: 'button' } });
    listen(b, 'click', () => openId(r.id));
    chips.append(b);
  }
  wrap.append(chips);
  return wrap;
}

function wikiLink(wiki: string | undefined): HTMLElement | null {
  const href = wikiHref(wiki);
  if (!href) return null;
  return el('a', {
    className: 'ceph-wiki',
    text: 'Coppermind',
    attrs: { href, target: '_blank', rel: 'noopener noreferrer' },
  });
}

function factBlock(text: string | undefined, aside = false): HTMLElement | null {
  if (!text) return null;
  return el('p', { className: aside ? 'ceph-fact ceph-fact--aside' : 'ceph-fact', text });
}

function headOf(kicker: string, name: string, color?: string, canon?: string): HTMLElement {
  const head = el('div', { className: 'ceph-drawer-head' });
  if (color) head.append(swatch(color));
  const col = el('div', {});
  col.append(el('div', { className: 'ceph-kicker', text: kicker }));
  col.append(el('h2', { text: name }));
  if (canon) col.append(el('span', { className: `ceph-canon ceph-canon--${canon}`, text: canon }));
  head.append(col);
  return head;
}

function fillFromHit(host: HTMLElement, hit: LoreHit): void {
  const era = store.state.era;
  if (hit.kind === 'body') {
    const b = hit.obj;
    host.append(headOf(b.kind.replace('-', ' '), b.name, b.color, b.canon));
    host.append(factBlock(b.fact)!);
    host.append(factBlock(b.bio, true) ?? '');
    const grid = fields([
      ['System', COSMERE.systems.find((s) => s.id === b.system)?.name],
    ]);
    grid.append(refField('Shards', b.shards) ?? '');
    grid.append(refField('Magic', b.magic) ?? '');
    for (const [k, v] of [
      ['Species', b.species.join(', ')],
      ['Places', b.locations],
      ['Sources', b.sources.join(' · ')],
      ['Local date', worldDate(b.system, era)],
    ] as [string, string | undefined | null][]) {
      grid.append(field(k, v) ?? '');
    }
    host.append(grid);
    host.append(seeRow(b.see) ?? '');
    host.append(wikiLink(b.wiki) ?? '');
    if (b.hasSurface && store.state.scale === 'globe') {
      const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: 'Zoom to the surface', style: { marginTop: '14px' } });
      listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: b.id, scale: 'surface' }));
      host.append(go);
    }
    return;
  }
  if (hit.kind === 'moon') {
    const m = hit.obj;
    const parent = bodyById[m.parent];
    host.append(headOf(`Moon of ${parent?.name ?? m.parent}`, m.name, m.color, m.canon));
    host.append(factBlock(m.fact)!);
    host.append(fields([
      ['World', parent?.name],
      ['System', parent ? COSMERE.systems.find((s) => s.id === parent.system)?.name : null],
      ['Sources', m.sources.join(' · ')],
    ]));
    host.append(wikiLink(m.wiki) ?? '');
    if (parent) {
      const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: `Go to ${parent.name}`, style: { marginTop: '14px' } });
      listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: parent.id, scale: 'globe' }));
      host.append(go);
    }
    return;
  }
  if (hit.kind === 'hub') {
    const h = hit.obj;
    host.append(headOf('Cognitive city', h.name, h.color, h.canon));
    host.append(factBlock(h.fact)!);
    host.append(factBlock(h.bio, true) ?? '');
    host.append(seeRow(h.see) ?? '');
    host.append(wikiLink(h.wiki) ?? '');
    return;
  }
  if (hit.kind === 'dawnshard') {
    const d = hit.obj;
    host.append(headOf(`Dawnshard · ${d.command}`, d.name, undefined, d.canon));
    host.append(factBlock(d.fact)!);
    host.append(factBlock(d.bio, true) ?? '');
    host.append(fields([['Holder', d.holder]]));
    host.append(seeRow(d.see) ?? '');
    host.append(wikiLink(d.wiki) ?? '');
    return;
  }
  if (hit.kind === 'system') {
    const sys = hit.obj;
    const worlds = COSMERE.bodies.filter((b) => b.system === sys.id && b.kind !== 'gas-giant');
    const giants = COSMERE.bodies.filter((b) => b.system === sys.id && b.kind === 'gas-giant');
    const belts = COSMERE.belts.filter((b) => b.system === sys.id);
    // Orbit rings are drawn in the Physical Realm only. Over in Shadesmar a
    // world is a bead ocean and there is no ring to aim at, so the hint has to
    // point at what is actually on the screen.
    const enterHint = store.state.realm === 'cognitive'
      ? 'System · click a bead ocean to enter'
      : 'System · click the rings to enter';
    host.append(headOf(enterHint, sys.name, sys.sunColor));
    host.append(factBlock(sys.fact) ?? '');
    // The star first: it is the thing everything here orbits, and three of
    // them have names on the page.
    host.append(factBlock(
      sys.starName ? `${sys.starName} — ${sys.starDesc ?? ''}`.trim() : sys.starDesc,
      true,
    ) ?? '');
    for (const c of sys.companions ?? []) {
      host.append(factBlock(`${c.name} — ${c.fact}`, true)!);
    }
    host.append(fields([
      ['Star', sys.starName ?? 'unnamed'],
      ['Worlds', worlds.map((b) => b.name).join(', ')],
      ['Gas giants', giants.map((b) => b.name).join(', ') || null],
      ['Belts', belts.map((b) => b.name).join(', ') || null],
      ['Local date', worldDate(sys.id, era)],
      ['Sources', sys.sources?.join(' · ') ?? null],
    ]));
    host.append(seeRow(undefined, [
      ...worlds.map((b) => ({ id: b.id, label: b.name })),
      ...giants.map((b) => ({ id: b.id, label: b.name })),
      ...belts.map((b) => ({ id: b.id, label: b.name })),
    ]) ?? '');
    host.append(wikiLink(sys.wiki) ?? '');
    if (store.state.scale === 'cosmere' || store.state.focusedSystem !== sys.id) {
      const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: 'Enter this system', style: { marginTop: '14px' } });
      listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: sys.id, scale: 'system' }));
      host.append(go);
    }
    return;
  }
  if (hit.kind === 'location') {
    const l = hit.obj;
    const perp = perpAt(l.id);
    host.append(headOf(bodyById[l.body]?.name ?? l.body, l.name, l.color));
    host.append(factBlock(l.desc)!);
    host.append(factBlock(l.bio, true) ?? '');
    const series = seriesById[l.book];
    const arc = series?.arcs.find((a) => a.id === l.arc);
    host.append(fields([
      ['World', bodyById[l.body]?.name],
      ['Region', l.region],
      ['Realm', l.realm === 'cognitive' ? 'Cognitive · Shadesmar' : 'Physical'],
      ['First named in', arc?.label ?? series?.title ?? null],
      ['Perpendicularity', perp?.name],
    ]));
    if (perp) host.append(factBlock(perp.fact) ?? '');
    host.append(seeRow(l.see) ?? '');
    host.append(wikiLink(l.wiki) ?? '');
    if (canEnterCity(l, era, store.state.realm, store.state.year) && store.state.scale !== 'city') {
      const go = el('button', {
        className: 'ceph-btn ceph-btn--primary',
        text: cityById[l.id] ? 'Open the city plate' : 'Look closer',
        style: { marginTop: '14px' },
      });
      listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: l.id, scale: 'city' }));
      host.append(go);
    }
    return;
  }
  if (hit.kind === 'landmark') {
    const m = hit.obj;
    const city = COSMERE.locations.find((l) => l.id === m.city);
    host.append(headOf(city?.name ?? m.city, m.name));
    host.append(factBlock(m.desc)!);
    return;
  }
  if (hit.kind === 'term') {
    const g = hit.obj;
    host.append(headOf(g.category ?? 'Codex', g.term, undefined, g.canon));
    host.append(factBlock(g.def)!);
    host.append(fields([['Also called', g.aliases], ['Sources', g.sources.join(' · ')]]));
    host.append(seeRow(g.see) ?? '');
    host.append(wikiLink(g.wiki) ?? '');
    return;
  }
  if (hit.kind === 'org') {
    const o = hit.obj;
    host.append(headOf(o.kind, o.name, o.color, o.canon));
    host.append(factBlock(o.fact)!);
    host.append(factBlock(o.bio, true) ?? '');
    const memberIds = (o.members ?? []).filter((mid) => loreById(mid));
    host.append(fields([
      ['World', o.world],
      ['People', memberIds.length ? memberIds.map((mid) => loreLabel(mid)).join(', ') : null],
      ['Sources', o.sources.join(' · ')],
    ]));
    host.append(seeRow(o.see, memberIds.map((mid) => ({ id: mid, label: loreLabel(mid) }))) ?? '');
    host.append(wikiLink(o.wiki) ?? '');
    return;
  }
  if (hit.kind === 'magic') {
    const mag = hit.obj;
    host.append(headOf(mag.world, mag.name, mag.color, mag.canon));
    host.append(factBlock(mag.desc)!);
    host.append(factBlock(mag.mechanics, true) ?? '');
    host.append(factBlock(mag.bio, true) ?? '');
    host.append(fields([
      ['Shard', mag.shard],
      ['Type', mag.type],
      ['Users', mag.users],
    ]));
    host.append(seeRow(mag.see) ?? '');
    const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: 'Open in the Arcanum', style: { marginTop: '14px' } });
    listen(go, 'click', () => { store.set('magicId', mag.id); store.set('panel', 'arcanum'); });
    host.append(go);
    return;
  }
  if (hit.kind === 'belt') {
    const b = hit.obj;
    const sys = COSMERE.systems.find((s) => s.id === b.system);
    host.append(headOf(
      `${sys?.name ?? b.system} · ${b.kind === 'comet' ? 'comet belt' : 'asteroid belt'}`,
      b.name, b.color, b.canon,
    ));
    host.append(factBlock(b.fact)!);
    host.append(factBlock(b.bio, true) ?? '');
    host.append(fields([
      ['System', sys?.name],
      ['Orbits', `${b.inner}–${b.outer} system units from the star`],
      ['Sources', b.sources.join(' · ')],
    ]));
    host.append(seeRow(b.see) ?? '');
    host.append(wikiLink(b.wiki) ?? '');
    if (sys && (store.state.scale !== 'system' || store.state.focusedSystem !== sys.id)) {
      const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: `Enter the ${sys.name} system`, style: { marginTop: '14px' } });
      listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: sys.id, scale: 'system' }));
      host.append(go);
    }
    return;
  }
  if (hit.kind === 'perp') {
    const p = hit.obj;
    host.append(headOf('Perpendicularity', p.name, '#c4b5fd', p.canon));
    host.append(factBlock(p.fact)!);
    host.append(fields([['World', bodyById[p.body]?.name]]));
    return;
  }
  if (hit.kind === 'character') {
    const c = hit.obj;
    const face = shownFace(c, store.state.readProgress);
    const at = characterAt(c, era, store.state.readProgress);
    const here = at?.at
      ? (COSMERE.locations.find((l) => l.id === at.at)?.name ?? bodyById[at.body ?? '']?.name)
      : at?.body ? bodyById[at.body]?.name : null;
    const kicker = c.kind === 'dragon' ? `Dragon of Yolen · ${c.origin}`
      : c.kind === 'sleepless' ? `Dysian Aimian · ${c.origin}`
        : c.kind === 'herald' ? `Herald · ${c.origin}`
          : c.kind === 'unmade' ? `Unmade · ${c.origin}`
            : c.kind === 'spren' ? `Spren · ${c.origin}`
              : c.kind === 'vessel' ? `Vessel · ${c.origin}`
                : c.origin;
    host.append(headOf(kicker, c.name, c.color, c.canon));
    host.append(factBlock(face.fact)!);
    host.append(factBlock(face.bio, true) ?? '');
    if (c.biology) host.append(factBlock(c.biology, true)!);
    const progress = store.state.readProgress;
    const trail = [...new Set(c.eras.map((row) => row.era))].sort((a, b) => a - b).map((eraId) => {
      const rows = c.eras.filter((row) => row.era === eraId && (!row.arc || isVisible({ book: row.book ?? c.book, arc: row.arc }, progress)));
      if (!rows.length) return null;
      const eraName = COSMERE.eras.find((e) => e.id === eraId)?.name;
      const places: string[] = [];
      for (const row of rows) {
        if (!row.at) continue;
        const name = COSMERE.locations.find((l) => l.id === row.at)?.name;
        if (name && !places.includes(name)) places.push(name);
      }
      const world = rows.map((row) => row.body ? bodyById[row.body]?.name : COSMERE.systems.find((s) => s.id === row.system)?.name).find(Boolean);
      if (!eraName || !world) return null;
      return places.length ? `${eraName}: ${places.join(', ')}` : `${eraName}: ${world}`;
    }).filter(Boolean).join(' → ');
    const orgs = orgsForCharacter(c.id, store.state.readProgress);
    host.append(fields([
      ['Aliases', face.aliases],
      ['Titles', c.titles],
      ['Abilities', face.abilities],
      ['This era', here],
      ['Where they have been', trail || null],
      ['Orders', orgs.map((o) => o.name).join(', ') || null],
    ]));
    host.append(seeRow(c.see, orgs.map((o) => ({ id: o.id, label: o.name }))) ?? '');
    host.append(wikiLink(c.wiki) ?? '');
    const rels = relationsFor(c.id, store.state.readProgress);
    if (rels.length) {
      const wrap = el('div', { className: 'ceph-see' });
      wrap.append(el('div', { className: 'ceph-field-label', text: 'Connections' }));
      const chips = el('div', { className: 'ceph-see-chips' });
      for (const r of rels) {
        const other = r.a.id === c.id ? r.b : r.a;
        const b = el('button', {
          className: 'ceph-atlas-chip',
          text: `${r.label} — ${loreLabel(other.id)}`,
          attrs: { type: 'button' },
        });
        listen(b, 'click', () => openId(other.id));
        chips.append(b);
      }
      wrap.append(chips);
      host.append(wrap);
    }
    if (at?.body) {
      const place = at.at ? COSMERE.locations.find((l) => l.id === at.at)?.name : null;
      const go = el('button', {
        className: 'ceph-btn ceph-btn--primary',
        text: place ? `Go to ${place}` : `Go to ${here}`,
        style: { marginTop: '14px' },
      });
      listen(go, 'click', () => {
        store.set('selected', c.id);
        characterCue(c);
      });
      host.append(go);
    }
    return;
  }
  const sh = hit.obj;
  const row = sh.eras.find((e) => e.era === era) ?? sh.eras[0];
  host.append(headOf('Shard of Adonalsium', sh.name, sh.color, sh.canon));
  host.append(factBlock(sh.desc)!);
  host.append(factBlock(sh.bio, true) ?? '');
  host.append(fields([
    ['Intent', sh.intent],
    ['Vessel', row?.vessel],
    ['Location', row?.loc],
    ['Status', row?.status],
    ['World', sh.world],
  ]));
  host.append(seeRow(sh.see) ?? '');
  host.append(wikiLink(sh.wiki) ?? '');
}

/** Append a full encyclopedia entry for `id` into `host`. Returns false if unknown. */
export function fillLoreCard(host: HTMLElement, id: string | null): boolean {
  const hit = loreById(id);
  if (!hit) return false;
  if (isNewThisArc(hit.obj as { book?: string; arc?: string }, store.state.readingNow)) {
    host.append(el('div', { className: 'ceph-reading ceph-reading--chip', text: '✦ new this arc' }));
  }
  fillFromHit(host, hit);
  const notes = 'fieldNotes' in hit.obj ? hit.obj.fieldNotes : undefined;
  if (notes) {
    const box = el('div', { className: 'ceph-meta', style: { marginTop: '10px' } });
    for (const [k, n] of Object.entries(notes)) {
      box.append(el('div', {
        html: `<b>${k}</b> <span class="ceph-canon ceph-canon--${n.canon}">${n.canon}</span> — ${n.note}`,
      }));
    }
    host.append(box);
  }
  return true;
}

export { openId, loreById };
