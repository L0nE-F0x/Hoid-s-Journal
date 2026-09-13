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
  isNewThisArc,
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
    const at = characterAt(hit.obj, store.state.era);
    if (at?.body) store.set('cameraCue', { kind: 'focus', id: at.body, scale: 'globe' });
  } else if (hit.kind === 'magic') {
    store.set('magicId', id);
    store.set('panel', 'arcanum');
  } else if (hit.kind === 'moon') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
  } else if (hit.kind === 'system') {
    store.set('cameraCue', { kind: 'focus', id, scale: 'system' });
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
    host.append(fields([
      ['System', COSMERE.systems.find((s) => s.id === b.system)?.name],
      ['Shards', b.shards.join(', ')],
      ['Magic', b.magic.join(', ')],
      ['Species', b.species.join(', ')],
      ['Places', b.locations],
      ['Sources', b.sources.join(' · ')],
      ['Local date', worldDate(b.system, era)],
    ]));
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
    host.append(headOf('System · click the rings to enter', sys.name, sys.sunColor));
    host.append(fields([
      ['Worlds', worlds.map((b) => b.name).join(', ')],
      ['Local date', worldDate(sys.id, era)],
    ]));
    host.append(seeRow(undefined, worlds.map((b) => ({ id: b.id, label: b.name }))) ?? '');
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
    if (canEnterCity(l, era, store.state.realm) && store.state.scale !== 'city') {
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
  if (hit.kind === 'perp') {
    const p = hit.obj;
    host.append(headOf('Perpendicularity', p.name, '#c4b5fd', p.canon));
    host.append(factBlock(p.fact)!);
    host.append(fields([['World', bodyById[p.body]?.name]]));
    return;
  }
  if (hit.kind === 'character') {
    const c = hit.obj;
    const at = characterAt(c, era);
    const here = at?.body ? bodyById[at.body]?.name : null;
    const kicker = c.kind === 'dragon' ? `Dragon of Yolen · ${c.origin}`
      : c.kind === 'sleepless' ? `Dysian Aimian · ${c.origin}`
        : c.kind === 'herald' ? `Herald · ${c.origin}`
          : c.kind === 'unmade' ? `Unmade · ${c.origin}`
            : c.kind === 'spren' ? `Spren · ${c.origin}`
              : c.kind === 'vessel' ? `Vessel · ${c.origin}`
                : c.origin;
    host.append(headOf(kicker, c.name, c.color, c.canon));
    host.append(factBlock(c.fact)!);
    host.append(factBlock(c.bio, true) ?? '');
    if (c.biology) host.append(factBlock(c.biology, true)!);
    const trail = c.eras
      .map((row) => {
        const world = row.body ? bodyById[row.body]?.name : COSMERE.systems.find((s) => s.id === row.system)?.name;
        const eraName = COSMERE.eras.find((e) => e.id === row.era)?.name;
        return world && eraName ? `${eraName}: ${world}` : null;
      })
      .filter(Boolean)
      .join(' → ');
    const orgs = orgsForCharacter(c.id);
    host.append(fields([
      ['Aliases', c.aliases],
      ['Titles', c.titles],
      ['Abilities', c.abilities],
      ['This era', here],
      ['Where they have been', trail || null],
      ['Orders', orgs.map((o) => o.name).join(', ') || null],
    ]));
    host.append(seeRow(c.see, orgs.map((o) => ({ id: o.id, label: o.name }))) ?? '');
    host.append(wikiLink(c.wiki) ?? '');
    if (at?.body) {
      const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: `Go to ${here}`, style: { marginTop: '14px' } });
      listen(go, 'click', () => {
        store.set('selected', c.id);
        store.set('cameraCue', { kind: 'focus', id: at.body!, scale: 'globe' });
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
