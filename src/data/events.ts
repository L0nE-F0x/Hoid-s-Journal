/**
 * Named beats on the Cosmere playhead. Era chips are the coarse grain;
 * these are the things a reread actually jumps to.
 *
 * Years live on the same fan axis as `ERAS[].start`. Intra-world dates stay
 * on each world's own calendar; these marks are the speculative alignment.
 */
import type { CanonLevel } from './types.ts';

export type SkyVisual = 'shatter' | 'ash' | 'storm' | 'dawn' | 'duel';

export interface CosmereEvent {
  id: string;
  year: number;
  name: string;
  fact: string;
  canon: CanonLevel;
  visual?: SkyVisual;
  /** Body the beat is centred on. The Shattering is Yolen; the ash is Scadrial. */
  focus?: string;
  /**
   * The earliest book that reveals this beat, as everywhere else. Absent, or
   * 'core', means every reader may see it. The HUD ticker, the timeline tick
   * and the sky set-piece should all wait for it.
   */
  book?: string;
  arc?: string;
}

const S = 'speculation' as const;
const C = 'canon' as const;

export const COSMERE_EVENTS: CosmereEvent[] = [
  {
    // Ungated on purpose: the Shattering is the premise of the whole atlas.
    id: 'shattering', year: -7000, name: 'The Shattering', visual: 'shatter', focus: 'yolen', canon: C,
    fact: 'Sixteen people kill Adonalsium on Yolen and take up the pieces. The worlds that follow are Shaped around them.',
  },
  {
    // 4,500 years before the True Desolation: The Way of Kings prologue; Oathbringer ch. 38.
    id: 'heraldic', year: -4500, name: 'Aharietiam', canon: C,
    book: 'stormlight', arc: 'twok',
    fact: 'Four and a half thousand years before the True Desolation: the Last Desolation, as Roshar remembers it.',
  },
  {
    // About two thousand Rosharan years before the True Desolation (Wind and Truth chs. 7, 11).
    id: 'recreance', year: -2000, name: 'The Recreance', canon: C,
    book: 'stormlight', arc: 'wor',
    fact: 'Around two thousand years before the True Desolation, the Knights Radiant abandon their oaths.',
  },
  {
    id: 'final-empire', year: -350, name: 'The Final Empire', visual: 'ash', focus: 'scadrial', canon: C,
    book: 'mistborn1', arc: 'tfe',
    fact: 'The Lord Ruler holds Scadrial under ash. A thousand years of that sky.',
  },
  {
    id: 'catacendre', year: -1, name: 'The Catacendre', visual: 'dawn', focus: 'scadrial', canon: C,
    book: 'mistborn1', arc: 'hoa',
    fact: 'The end of the ash. Scadrial is remade, and the map itself changes.',
  },
  {
    id: 'true-desolation', year: 0, name: 'The True Desolation', visual: 'storm', focus: 'roshar', canon: C,
    book: 'stormlight', arc: 'wor',
    fact: 'A Desolation comes back to Roshar. Roshar years 1173–1175.',
  },
  {
    id: 'wax', year: 15, name: 'The Alloy of Law', canon: C,
    book: 'mistborn2', arc: 'aol',
    fact: 'Three centuries after the Catacendre, Elendel has trains and newspapers.',
  },
  {
    id: 'contest', year: 2, name: 'The Contest of Champions', visual: 'duel', focus: 'roshar', canon: C,
    book: 'stormlight', arc: 'row',
    fact: 'The last ten days of the Contest. The war on Roshar changes shape.',
  },
  {
    id: 'space', year: 300, name: 'The space age', canon: S,
    book: 'sixthofdusk', arc: 'sixthofdusk',
    // WoB 15579, 16524.
    fact: 'Ships cross between worlds in the Physical Realm, and then faster than light.',
  },
];
