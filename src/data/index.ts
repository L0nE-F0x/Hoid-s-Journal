import { BODIES, ERAS, MOONS, PUB_ORDER, SERIES, SYSTEMS, TIMELINE_NOTE, WORLD_EPOCHS } from './catalog.ts';
import { CHARACTERS } from './characters.ts';
import { GLOSSARY } from './glossary.ts';
import { LOCATIONS, PERPS } from './locations.ts';
import { MAGICS } from './magics.ts';
import { SHARDS } from './shards.ts';
import type { Body, Character, CharacterEra, Cosmere, Location, Series } from './types.ts';

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

export function locationsOn(bodyId: string, era?: number): Location[] {
  return LOCATIONS.filter((l) => {
    if (l.body !== bodyId) return false;
    if (!l.eraMaps || era === undefined) return true;
    if (bodyId === 'scadrial') {
      return era >= 3 ? l.eraMaps.includes('basin') : l.eraMaps.includes('ash');
    }
    return true;
  });
}

export function scadrialBiome(era: number): 'scadrial-ash' | 'scadrial-basin' {
  return era >= 3 ? 'scadrial-basin' : 'scadrial-ash';
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

export function bodyByName(name: string): Body | undefined {
  const n = name.toLowerCase();
  return BODIES.find((b) => n.includes(b.name.toLowerCase()));
}
