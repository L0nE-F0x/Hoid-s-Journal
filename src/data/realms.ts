/**
 * Cognitive geography that is not a planet: Silverlight, the paths
 * worldhoppers actually walk, and the four Commands.
 */
import type { Dawnshard, Hub, WorldhopperRoute } from './types.ts';

const C = 'canon' as const;
const W = 'wob' as const;

export const HUBS: Hub[] = [
  {
    id: 'silverlight',
    name: 'Silverlight',
    color: '#e2e8f0',
    book: 'arcanum',
    fact: 'A city in the Cognitive Realm, not on any world. Khriss writes from here. The Ire pass through it. It sits where several subastrals can be reached.',
    between: ['selish', 'scadrian', 'rosharan', 'taldainian'],
    canon: C,
    sources: ['Arcanum Unbounded', 'Mistborn: Secret History', 'The Lost Metal'],
  },
];

export const ROUTES: WorldhopperRoute[] = [
  { id: 'sel-silver', from: 'selish', to: 'scadrian', via: 'silverlight', book: 'secrethistory',
    fact: 'The Ire walked Sel\'s Cognitive toward Scadrial. Silverlight sits on that road.' },
  { id: 'scadrial-roshar', from: 'scadrian', to: 'rosharan', via: 'silverlight', book: 'stormlight',
    fact: 'Ghostbloods and the Seventeenth Shard both use this crossing.' },
  { id: 'nalthis-roshar', from: 'nalthian', to: 'rosharan', book: 'stormlight',
    fact: 'Vasher and Vivenna came this way. Nightblood too.' },
  { id: 'taldain-silver', from: 'taldainian', to: 'scadrian', via: 'silverlight', book: 'arcanum',
    fact: 'Khriss left Dayside and made Silverlight her desk.' },
  { id: 'threnody-scadrial', from: 'threnodite', to: 'scadrian', book: 'mistborn2',
    fact: 'Nazh\'s maps keep turning up on Scadrial.' },
  { id: 'drominad-patji', from: 'drominad', to: 'rosharan', book: 'sixthofdusk',
    fact: 'Patji\'s Eye is a door. In the space age, others come looking.' },
  { id: 'lumar-sel', from: 'lumar', to: 'selish', book: 'tress',
    fact: 'The Sorceress is an Elantrian. The midnight sea has a way through.' },
];

export const DAWNSHARDS: Dawnshard[] = [
  {
    id: 'dawnshard-change', name: 'Dawnshard of Change', command: 'Change',
    holder: 'rysn', book: 'stormlight', arc: 'dawnshard',
    fact: 'One of four primal Commands. Rysn Ftori bears it, hidden, after Akinah.',
    canon: C, sources: ['Dawnshard', 'The Stormlight Archive'],
  },
  {
    id: 'dawnshard-exist', name: 'Dawnshard (Command unknown)', command: 'Unknown',
    holder: 'unknown', book: 'stormlight',
    fact: 'Four Dawnshards exist. Only Change is named on the page. The others are not ours to invent.',
    canon: W, sources: ['Dawnshard', 'Word of Brandon'],
  },
];

export const hubById: Record<string, Hub> = Object.fromEntries(HUBS.map((h) => [h.id, h]));
export const dawnshardById: Record<string, Dawnshard> =
  Object.fromEntries(DAWNSHARDS.map((d) => [d.id, d]));
