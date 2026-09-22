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
}

const S = 'speculation' as const;
const C = 'canon' as const;

export const COSMERE_EVENTS: CosmereEvent[] = [
  {
    id: 'shattering', year: -7000, name: 'The Shattering', visual: 'shatter', focus: 'yolen', canon: C,
    fact: 'Sixteen Vessels kill Adonalsium on Yolen. The power splits; the worlds that follow are Shaped around the pieces.',
  },
  {
    id: 'heraldic', year: -4500, name: 'The Desolations', canon: S,
    fact: 'The Oathpact holds. Between returns, Roshar rebuilds; each Desolation knocks it back.',
  },
  {
    id: 'recreance', year: -2000, name: 'The Recreance', canon: S,
    fact: 'The Knights Radiant abandon their Shards. The cause is not a date we print as fact.',
  },
  {
    id: 'final-empire', year: -350, name: 'The Final Empire', visual: 'ash', focus: 'scadrial', canon: C,
    fact: 'The Lord Ruler holds Scadrial under ash. A thousand years of that sky.',
  },
  {
    id: 'catacendre', year: -1, name: 'The Catacendre', visual: 'dawn', focus: 'scadrial', canon: C,
    fact: 'Sazed takes up Preservation and Ruin together. Scadrial is remade; the map itself changes.',
  },
  {
    id: 'true-desolation', year: 0, name: 'The True Desolation', visual: 'storm', focus: 'roshar', canon: C,
    fact: 'The Everstorm. The Knights Radiant return. Roshar years 1173–1175.',
  },
  {
    id: 'wax', year: 15, name: 'The Alloy of Law', canon: C,
    fact: 'Three centuries after the Catacendre, Elendel has trains and newspapers. Harmony is not silent yet.',
  },
  {
    id: 'contest', year: 2, name: 'The Contest of Champions', visual: 'duel', focus: 'roshar', canon: C,
    fact: 'The last ten days. Honor and Odium in one hand. The war changes shape.',
  },
  {
    id: 'space', year: 300, name: 'The space age', canon: S,
    fact: 'Worlds can reach each other without a perpendicularity. Sixth of the Dusk, then Canticle, then the Emberdark.',
  },
];
