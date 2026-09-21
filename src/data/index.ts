import { BELTS, BODIES, ERAS, JOURNAL_BOOKS, MOONS, PUB_ORDER, SERIES, SYSTEMS, TIMELINE_NOTE, WORLD_EPOCHS } from './catalog.ts';
import { COSMERE_EVENTS } from './events.ts';
import { CHARACTERS as CHARACTERS_CORE } from './characters.ts';
import { CITY_PLATES, cityById, landmarkById } from './cities.ts';
import { GLOSSARY as GLOSSARY_CORE } from './glossary.ts';
import { ARC_NOTES, arcNoteFor } from './journal.ts';
import { LOCATIONS as LOCATIONS_CORE, PERPS } from './locations.ts';
import { MAGICS } from './magics.ts';
import { ORGANIZATIONS as ORGS_CORE } from './organizations.ts';
import { PEOPLE_ROSHAR } from './peopleRoshar.ts';
import { PEOPLE_SCADRIAL } from './peopleScadrial.ts';
import { PEOPLE_WORLDS } from './peopleWorlds.ts';
import { GLOSSARY_MORE } from './glossaryMore.ts';
import { PLACES_MORE } from './placesMore.ts';
import { ORGS_MORE } from './orgsMore.ts';
import { RELATIONS_MORE } from './relationsMore.ts';
import { DAWNSHARDS, HUBS, ROUTES, dawnshardById, hubById } from './realms.ts';
import { RELATIONS as RELATIONS_CORE, REL_TYPES } from './relationships.ts';
import { SHARDS } from './shards.ts';
import {
  haystack, matchesQuery, normalizeQuery, scoreHit, type SearchHit, type SearchKind,
} from './search.ts';
import type {
  Belt, Body, Character, CharacterEra, Cosmere, Location, Moon, Organization, Perpendicularity,
  Series,
} from './types.ts';

export { CITY_PLATES, cityById, landmarkById };
export { ARC_NOTES, arcNoteFor };
export { COSMERE_EVENTS, JOURNAL_BOOKS };
export { DAWNSHARDS, HUBS, ROUTES, dawnshardById, hubById };
export { REL_TYPES };
export { copperUrl, normalizeQuery, SEARCH_KIND_LABEL } from './search.ts';
export type { SearchHit, SearchKind } from './search.ts';
export type { CosmereEvent, SkyVisual } from './events.ts';

export type { Cosmere } from './types.ts';
export * from './types.ts';

/** First id wins, so extra files cannot silently replace Hoid. */
function unique<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

/** Last id wins. Glossary.ts restates a few terms more fully; keep the later def. */
function uniqueLast<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const r of rows) map.set(r.id, r);
  return [...map.values()];
}

export const CHARACTERS: Character[] = unique([
  ...CHARACTERS_CORE, ...PEOPLE_ROSHAR, ...PEOPLE_SCADRIAL, ...PEOPLE_WORLDS,
]);
export const LOCATIONS: Location[] = unique([...LOCATIONS_CORE, ...PLACES_MORE]);
export const GLOSSARY = uniqueLast([...GLOSSARY_CORE, ...GLOSSARY_MORE]);
export const ORGANIZATIONS: Organization[] = unique([...ORGS_CORE, ...ORGS_MORE]);
export const RELATIONS = [...RELATIONS_CORE, ...RELATIONS_MORE];

export const COSMERE: Cosmere = {
  series: SERIES,
  eras: ERAS,
  systems: SYSTEMS,
  bodies: BODIES,
  moons: MOONS,
  belts: BELTS,
  shards: SHARDS,
  characters: CHARACTERS,
  magics: MAGICS,
  glossary: GLOSSARY,
  locations: LOCATIONS,
  organizations: ORGANIZATIONS,
  perps: PERPS,
  worldEpochs: WORLD_EPOCHS,
  timelineNote: TIMELINE_NOTE,
  pubOrder: PUB_ORDER,
};

export const seriesById: Record<string, Series> = Object.fromEntries(SERIES.map((s) => [s.id, s]));
export const bodyById: Record<string, Body> = Object.fromEntries(BODIES.map((b) => [b.id, b]));
export const moonById: Record<string, Moon> = Object.fromEntries(MOONS.map((m) => [m.id, m]));
export const beltById: Record<string, Belt> = Object.fromEntries(BELTS.map((b) => [b.id, b]));
export const characterById: Record<string, Character> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
export const locationById: Record<string, Location> = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
export const orgById: Record<string, Organization> = Object.fromEntries(ORGANIZATIONS.map((o) => [o.id, o]));
export const glossaryById = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));
export const magicById = Object.fromEntries(MAGICS.map((m) => [m.id, m]));
export const shardById = Object.fromEntries(SHARDS.map((s) => [s.id, s]));

export function bookArcIndex(series: string, arc: string): number {
  const s = seriesById[series];
  if (!s) return 0;
  const i = s.arcs.findIndex((a) => a.id === arc);
  return i < 0 ? 0 : i;
}

export function requiredArcIndex(item: { book?: string; arc?: string }): number {
  if (!item.book || item.book === 'core') return -1;
  const s = seriesById[item.book];
  if (!s) return 0;
  if (!item.arc) return 0;
  const i = s.arcs.findIndex((a) => a.id === item.arc);
  return i < 0 ? 0 : i;
}

export function isVisible(
  item: { book?: string; arc?: string },
  progress: Record<string, number>,
): boolean {
  if (!item.book || item.book === 'core') return true;
  const s = seriesById[item.book];
  if (!s) return true;
  const prog = progress[item.book] ?? s.arcs.length - 1;
  if (prog < 0) return false;
  return prog >= requiredArcIndex(item);
}

export type ReadingNow = { series: string; arc: number } | null;

/**
 * Publication-safe: everything published before the book you are reading is
 * fair game, that book is revealed up to your arc, and anything published
 * later is hidden. Without a book in hand there is nothing to be safe about,
 * so it falls back to fully read.
 */
export function publicationSafeProgress(now: ReadingNow): Record<string, number> {
  if (!now) return fullProgress();
  const here = PUB_ORDER.indexOf(now.series);
  if (here < 0) return fullProgress();
  const p: Record<string, number> = {};
  for (const s of SERIES) {
    const i = PUB_ORDER.indexOf(s.id);
    if (s.id === now.series) p[s.id] = Math.max(-1, Math.min(s.arcs.length - 1, now.arc));
    else if (i < 0 || i < here) p[s.id] = s.arcs.length - 1;
    else p[s.id] = -1;
  }
  return p;
}

/** Revealed by the exact arc the reader is in: the journal's ✦ chip. */
export function isNewThisArc(item: { book?: string; arc?: string }, now: ReadingNow): boolean {
  if (!now || !item.book || item.book === 'core' || item.book !== now.series) return false;
  return requiredArcIndex(item) === now.arc;
}

export function fullProgress(): Record<string, number> {
  const p: Record<string, number> = {};
  for (const s of SERIES) p[s.id] = s.arcs.length - 1;
  return p;
}

export function eraAt(year: number): number {
  let e = ERAS[0]!.id;
  for (let i = ERAS.length - 1; i >= 0; i--) {
    if (year >= ERAS[i]!.start) { e = ERAS[i]!.id; break; }
  }
  return e;
}

/** Era-weighted slider: each of 6 eras occupies 1/6 of 0..1. */
export function yearToSlider(year: number): number {
  const eras = ERAS;
  const last = eras[eras.length - 1]!;
  if (year <= eras[0]!.start) return 0;
  if (year >= last.start + 700) return 1;
  for (let i = 0; i < eras.length; i++) {
    const a = eras[i]!.start;
    const b = i + 1 < eras.length ? eras[i + 1]!.start : last.start + 700;
    if (year <= b) return (i + (year - a) / (b - a)) / eras.length;
  }
  return 1;
}

export function sliderToYear(t: number): number {
  const eras = ERAS;
  const last = eras[eras.length - 1]!;
  const u = Math.min(0.999, Math.max(0, t)) * eras.length;
  const i = Math.min(eras.length - 1, Math.floor(u));
  const f = u - i;
  const a = eras[i]!.start;
  const b = i + 1 < eras.length ? eras[i + 1]!.start : last.start + 700;
  return a + f * (b - a);
}

export function worldDate(systemId: string, era: number): string | null {
  const rows = WORLD_EPOCHS[systemId];
  if (!rows) return null;
  let best: string | null = null;
  for (const r of rows) if (r.era <= era) best = r.date;
  return best;
}

/** Whether a thing exists on the playhead, independent of spoiler gating. */
export function inEra(item: { eraMin?: number; eraMax?: number }, era: number): boolean {
  if (item.eraMin !== undefined && era < item.eraMin) return false;
  if (item.eraMax !== undefined && era > item.eraMax) return false;
  return true;
}

/** On the sky: published far enough, and the year has reached it. */
export function onTheMap(
  item: { book?: string; arc?: string; eraMin?: number; eraMax?: number },
  progress: Record<string, number>,
  era: number,
): boolean {
  return inEra(item, era) && isVisible(item, progress);
}

/**
 * A star is only a place if something in-era still orbits it. Empty rings
 * (a Scadrian system before Scadrial exists) are not a destination.
 */
export function systemOnTheMap(
  systemId: string,
  progress: Record<string, number>,
  era: number,
): boolean {
  return BODIES.some((b) => b.system === systemId && onTheMap(b, progress, era));
}

export function locationsOn(bodyId: string, era?: number): Location[] {
  return LOCATIONS.filter((l) => {
    if (l.body !== bodyId) return false;
    if (era !== undefined && !inEra(l, era)) return false;
    if (!l.eraMaps || era === undefined) return true;
    if (bodyId === 'scadrial') {
      if (era >= 3) return l.eraMaps.includes('basin');
      if (era >= 2) return l.eraMaps.includes('ash');
      return false;
    }
    return true;
  });
}

/** Continents and seas stay at surface; a place you can stand in can go closer. */
const REGION_ICONS = new Set(['land', 'sea', 'storm', 'grass', 'forest', 'peak', 'lake', 'scroll']);

/** Names this beat put on the map, not just unlocked. */
export function addedThisArc(
  now: ReadingNow,
): { kind: string; name: string }[] {
  if (!now) return [];
  const s = seriesById[now.series];
  const arcId = s?.arcs[now.arc]?.id;
  if (!arcId) return [];
  const rows: { kind: string; name: string }[] = [];
  const take = (kind: string, name: string, item: { book?: string; arc?: string }) => {
    if (item.book === now.series && item.arc === arcId) rows.push({ kind, name });
  };
  for (const b of BODIES) take('world', b.name, b);
  for (const c of CHARACTERS) take('person', c.name, c);
  for (const l of LOCATIONS) take('place', l.name, l);
  for (const g of GLOSSARY) take('term', g.term, g);
  for (const m of MAGICS) take('magic', m.name, m);
  for (const o of ORGANIZATIONS) take('order', o.name, o);
  return rows;
}

/**
 * City scale is a nested layer: an original plate if we drew one, otherwise
 * a crop of the same world map the globe is using.
 */
export function canEnterCity(
  loc: Location, era?: number, realm?: string,
): boolean {
  if (loc.realm === 'cognitive' || realm === 'cognitive' || realm === 'spiritual') return false;
  if (era !== undefined && loc.eraMaps && !locationsOn(loc.body, era).some((l) => l.id === loc.id)) {
    return false;
  }
  if (cityById[loc.id]) return true;
  return !REGION_ICONS.has(loc.icon);
}

/** The perpendicularity standing at a place, if the geography is known. */
export function perpAt(locationId: string): Perpendicularity | undefined {
  return PERPS.find((p) => p.at === locationId);
}

export function scadrialBiome(era: number): 'scadrial-ash' | 'scadrial-basin' {
  if (era >= 3) return 'scadrial-basin';
  if (era >= 2) return 'scadrial-ash';
  // Classical Scadrial, before the ashmounts. We do not have a third plate.
  return 'scadrial-basin';
}

export function characterAt(ch: Character, era: number): CharacterEra | null {
  let best: CharacterEra | null = null;
  for (const row of ch.eras) {
    if (row.era <= era) best = row;
  }
  return best;
}

export function charactersOnBody(bodyId: string, era: number): Character[] {
  return CHARACTERS.filter((c) => characterAt(c, era)?.body === bodyId);
}

/**
 * Outer edge of a system, for framing and for clicking the rings you can see.
 *
 * Not just the planets: the far lip of a comet belt and a second star are
 * both out past the last world, and a frame that cuts them off is a frame
 * that says they are not there. A double planet is measured on its partner's
 * orbit, not its own — Komashi's `a` is the width of its swing around UTol.
 */
export function systemExtent(systemId: string): number {
  const worlds = BODIES
    .filter((b) => b.system === systemId && !b.orbitAround)
    .reduce((m, b) => Math.max(m, b.orbit.a), 4);
  const belts = BELTS
    .filter((b) => b.system === systemId)
    .reduce((m, b) => Math.max(m, b.outer), 0);
  const stars = (SYSTEMS.find((s) => s.id === systemId)?.companions ?? [])
    .reduce((m, c) => Math.max(m, c.orbit.a), 0);
  return Math.max(worlds, belts, stars);
}

export function bodyByName(name: string): Body | undefined {
  const n = name.toLowerCase();
  return BODIES.find((b) => n.includes(b.name.toLowerCase()));
}

/**
 * People the sky and the Lore Web can afford to draw: anyone a relation or
 * an order names, plus dragons, Heralds, Unmade, spren, vessels, and the
 * cognitive travellers. The rest live in the Codex.
 */
const FEATURED_PEOPLE = new Set<string>();
for (const r of RELATIONS) {
  if (r.a.kind === 'character') FEATURED_PEOPLE.add(r.a.id);
  if (r.b.kind === 'character') FEATURED_PEOPLE.add(r.b.id);
}
for (const o of ORGANIZATIONS) {
  for (const m of o.members ?? []) FEATURED_PEOPLE.add(m);
}
for (const c of CHARACTERS) {
  if (c.id === 'hoid') FEATURED_PEOPLE.add(c.id);
  if (c.kind && c.kind !== 'person') FEATURED_PEOPLE.add(c.id);
  if (c.cognitive) FEATURED_PEOPLE.add(c.id);
}

export function isFeaturedPerson(id: string): boolean {
  return FEATURED_PEOPLE.has(id);
}

export type LoreKind =
  | 'body' | 'moon' | 'belt' | 'system' | 'character' | 'location' | 'landmark'
  | 'hub' | 'dawnshard' | 'shard' | 'term' | 'org' | 'magic' | 'perp';

export type LoreHit =
  | { kind: 'body'; obj: Body }
  | { kind: 'moon'; obj: Moon }
  | { kind: 'belt'; obj: Belt }
  | { kind: 'system'; obj: (typeof SYSTEMS)[number] }
  | { kind: 'character'; obj: Character }
  | { kind: 'location'; obj: Location }
  | { kind: 'landmark'; obj: (typeof landmarkById)[string] }
  | { kind: 'hub'; obj: (typeof HUBS)[number] }
  | { kind: 'dawnshard'; obj: (typeof DAWNSHARDS)[number] }
  | { kind: 'shard'; obj: (typeof SHARDS)[number] }
  | { kind: 'term'; obj: (typeof GLOSSARY)[number] }
  | { kind: 'org'; obj: Organization }
  | { kind: 'magic'; obj: (typeof MAGICS)[number] }
  | { kind: 'perp'; obj: Perpendicularity };

/**
 * The only door into the encyclopedia. Ids are unique across every kind — a
 * rule `npm run audit:data` enforces — because this returns the first claimant
 * and an entry it cannot return is written, indexed, searchable and
 * unreachable. Forty-four entries were in exactly that state before the rule
 * existed: fifteen magic systems, thirteen organisations, four Cognitive
 * sites and four perpendicularities, all shadowed by a one-line glossary term
 * of the same name.
 */
export function loreById(id: string | null | undefined): LoreHit | null {
  if (!id) return null;
  const body = bodyById[id];
  if (body) return { kind: 'body', obj: body };
  const moon = moonById[id];
  if (moon) return { kind: 'moon', obj: moon };
  const belt = beltById[id];
  if (belt) return { kind: 'belt', obj: belt };
  const sys = SYSTEMS.find((s) => s.id === id);
  if (sys) return { kind: 'system', obj: sys };
  const ch = characterById[id];
  if (ch) return { kind: 'character', obj: ch };
  const loc = locationById[id];
  if (loc) return { kind: 'location', obj: loc };
  const mark = landmarkById[id];
  if (mark) return { kind: 'landmark', obj: mark };
  const hub = hubById[id];
  if (hub) return { kind: 'hub', obj: hub };
  const ds = dawnshardById[id];
  if (ds) return { kind: 'dawnshard', obj: ds };
  const sh = shardById[id];
  if (sh) return { kind: 'shard', obj: sh };
  const term = glossaryById[id];
  if (term) return { kind: 'term', obj: term };
  const org = orgById[id];
  if (org) return { kind: 'org', obj: org };
  const mag = magicById[id];
  if (mag) return { kind: 'magic', obj: mag };
  const perp = PERPS.find((p) => p.id === id);
  if (perp) return { kind: 'perp', obj: perp };
  return null;
}

export function loreLabel(id: string): string {
  const hit = loreById(id);
  if (!hit) return id;
  switch (hit.kind) {
    case 'body': case 'moon': case 'belt': case 'system': case 'character':
    case 'location': case 'hub': case 'dawnshard': case 'shard':
    case 'org': case 'magic': case 'perp':
      return hit.obj.name;
    case 'landmark': return hit.obj.name;
    case 'term': return hit.obj.term;
  }
}

export function relatedRefs(ids: string[] | undefined): { id: string; label: string; kind: LoreKind }[] {
  if (!ids?.length) return [];
  const out: { id: string; label: string; kind: LoreKind }[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const hit = loreById(id);
    if (!hit) continue;
    seen.add(id);
    out.push({ id, label: loreLabel(id), kind: hit.kind });
  }
  return out;
}

export function orgsForCharacter(id: string): Organization[] {
  return ORGANIZATIONS.filter((o) => o.members?.includes(id));
}

export function wikiHref(wiki: string | undefined): string | null {
  if (!wiki) return null;
  if (wiki.startsWith('http')) return wiki;
  return `https://coppermind.net/wiki/${wiki.replace(/ /g, '_')}`;
}

const KIND_TO_SEARCH: Record<LoreKind, SearchKind> = {
  body: 'world', moon: 'moon', belt: 'belt', system: 'system', character: 'person',
  location: 'place', landmark: 'place', hub: 'place', dawnshard: 'relic',
  shard: 'shard', term: 'term', org: 'org', magic: 'magic', perp: 'door',
};

/**
 * Codex / Directory search. Question-shaped queries ("who is Thaidakar")
 * are stripped to the noun; aliases are first-class hits.
 */
export function searchJournal(
  raw: string,
  progress: Record<string, number>,
  kinds?: SearchKind[],
  limit = 60,
): SearchHit[] {
  const q = normalizeQuery(raw);
  if (q.length < 2) return [];
  const allow = kinds?.length ? new Set(kinds) : null;
  const hits: SearchHit[] = [];
  // Ids are unique across every kind, so one concept is one row. The guard is
  // belt and braces: a duplicate would otherwise show twice and the second
  // copy would open the first one's card.
  const taken = new Set<string>();
  const take = (
    id: string, label: string, kind: SearchKind, fact: string,
    vis: { book?: string; arc?: string }, aliases = '', extraHay = '',
    canon?: SearchHit['canon'],
  ) => {
    if (allow && !allow.has(kind)) return;
    if (taken.has(id)) return;
    if (!isVisible(vis, progress)) return;
    const hay = haystack(label, aliases, fact, extraHay);
    if (!matchesQuery(q, hay, label, aliases)) return;
    taken.add(id);
    hits.push({
      id, label, kind, fact, book: vis.book, arc: vis.arc, aliases,
      score: scoreHit(q, label, aliases, fact), canon,
    });
  };

  for (const b of BODIES) {
    take(b.id, b.name, 'world', b.fact, b, b.aliases ?? '',
      [b.bio, b.species.join(' '), b.magic.join(' '), b.locations].join(' '), b.canon);
  }
  for (const m of MOONS) take(m.id, m.name, 'moon', m.fact, m, '', '', m.canon);
  for (const b of BELTS) take(b.id, b.name, 'belt', b.fact, b, b.aliases ?? '', b.bio ?? '', b.canon);
  for (const s of SYSTEMS) {
    const star = [s.starName, s.starDesc, s.fact, s.aliases].filter(Boolean).join(' · ');
    take(s.id, s.name, 'system', s.fact ?? `${s.name} system of the Cosmere`, { book: s.book },
      [s.starName, s.aliases].filter(Boolean).join(', '), star);
  }
  for (const c of CHARACTERS) {
    take(c.id, c.name, 'person', c.fact, c, c.aliases,
      [c.bio, c.abilities, c.origin, c.titles, c.biology].join(' '), c.canon);
  }
  for (const s of SHARDS) {
    take(s.id, s.name, 'shard', s.desc, s, [s.intent, s.aliases].filter(Boolean).join(', '), s.bio ?? '', s.canon);
  }
  for (const m of MAGICS) {
    take(m.id, m.name, 'magic', m.desc, m, m.aliases ?? '', [m.mechanics, m.users, m.bio].join(' '), m.canon);
  }
  for (const g of GLOSSARY) take(g.id, g.term, 'term', g.def, g, g.aliases ?? '', '', g.canon);
  for (const l of LOCATIONS) {
    take(l.id, l.name, 'place', l.desc, l, [l.region, l.aliases].filter(Boolean).join(', '), l.bio ?? '', l.canon);
  }
  for (const m of Object.values(landmarkById)) take(m.id, m.name, 'place', m.desc, m, '', '');
  for (const h of HUBS) take(h.id, h.name, 'place', h.fact, h, h.aliases ?? '', h.bio ?? '', h.canon);
  for (const d of DAWNSHARDS) take(d.id, d.name, 'relic', d.fact, d, d.command, d.bio ?? '', d.canon);
  for (const o of ORGANIZATIONS) {
    take(o.id, o.name, 'org', o.fact, o, o.aliases ?? '', [o.bio, o.world, o.kind].join(' '), o.canon);
  }
  for (const p of PERPS) take(p.id, p.name, 'door', p.fact, p, p.aliases ?? '', '', p.canon);

  hits.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
  return hits.slice(0, limit);
}

export { KIND_TO_SEARCH };
