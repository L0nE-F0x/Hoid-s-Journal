import { BODIES, ERAS, JOURNAL_BOOKS, MOONS, PUB_ORDER, SERIES, SYSTEMS, TIMELINE_NOTE, WORLD_EPOCHS } from './catalog.ts';
import { COSMERE_EVENTS } from './events.ts';
import { CHARACTERS } from './characters.ts';
import { CITY_PLATES, cityById, landmarkById } from './cities.ts';
import { GLOSSARY } from './glossary.ts';
import { ARC_NOTES, arcNoteFor } from './journal.ts';
import { LOCATIONS, PERPS } from './locations.ts';
import { MAGICS } from './magics.ts';
import { DAWNSHARDS, HUBS, ROUTES, dawnshardById, hubById } from './realms.ts';
import { RELATIONS, REL_TYPES } from './relationships.ts';
import { SHARDS } from './shards.ts';
import type {
  Body, Character, CharacterEra, Cosmere, Location, Perpendicularity, Series,
} from './types.ts';

export { CITY_PLATES, cityById, landmarkById };
export { ARC_NOTES, arcNoteFor };
export { COSMERE_EVENTS, JOURNAL_BOOKS };
export { DAWNSHARDS, HUBS, ROUTES, dawnshardById, hubById };
export { RELATIONS, REL_TYPES };
export type { CosmereEvent, SkyVisual } from './events.ts';

export type { Cosmere } from './types.ts';
export * from './types.ts';

export const COSMERE: Cosmere = {
  series: SERIES,
  eras: ERAS,
  systems: SYSTEMS,
  bodies: BODIES,
  moons: MOONS,
  shards: SHARDS,
  characters: CHARACTERS,
  magics: MAGICS,
  glossary: GLOSSARY,
  locations: LOCATIONS,
  perps: PERPS,
  worldEpochs: WORLD_EPOCHS,
  timelineNote: TIMELINE_NOTE,
  pubOrder: PUB_ORDER,
};

export const seriesById: Record<string, Series> = Object.fromEntries(SERIES.map((s) => [s.id, s]));
export const bodyById: Record<string, Body> = Object.fromEntries(BODIES.map((b) => [b.id, b]));
export const characterById: Record<string, Character> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

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

/** Outer orbit of a system, for framing and for clicking the rings you can see. */
export function systemExtent(systemId: string): number {
  return BODIES.filter((b) => b.system === systemId).reduce((m, b) => Math.max(m, b.orbit.a), 4);
}

export function bodyByName(name: string): Body | undefined {
  const n = name.toLowerCase();
  return BODIES.find((b) => n.includes(b.name.toLowerCase()));
}
