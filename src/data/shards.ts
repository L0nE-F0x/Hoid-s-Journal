import type { Shard } from './types.ts';

const C = 'canon' as const;

function line(
  id: string, name: string, color: string, book: string, world: string, desc: string,
  sources: string[],
  eras: Shard['eras'],
  extra: Partial<Shard> = {},
): Shard {
  return { id, name, color, book, world, desc, canon: C, sources, eras, wiki: name, ...extra };
}

const whole = (era: number, vessel: string, loc: string) =>
  ({ era, status: 'whole' as const, vessel, loc });
const splintered = (era: number, loc: string, vessel = 'None (Splintered)') =>
  ({ era, status: 'splintered' as const, vessel, loc });
const merged = (era: number, vessel: string, loc: string) =>
  ({ era, status: 'merged' as const, vessel, loc });

export const SHARDS: Shard[] = [
  line('ambition', 'Ambition', '#f97316', 'arcanum', 'Threnody',
    'Hunted and Splintered by Odium with Mercy\'s help. Its death scarred the Threnodite system with the Current.',
    ['Arcanum Unbounded — Threnody essay', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      splintered(1, 'Threnody', 'Uli Da'),
      splintered(2, 'Threnody'), splintered(3, 'Threnody'), splintered(4, 'Threnody'), splintered(5, 'Threnody'),
    ]),
  line('autonomy', 'Autonomy', '#f59e0b', 'whitesand', 'Taldain',
    'Deeply isolationist. Creates Avatars to act on other worlds without direct involvement — including on Scadrial.',
    ['Mistborn: Secret History', 'The Lost Metal', 'Arcanum Unbounded'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Bavadin', 'Taldain'), whole(2, 'Bavadin', 'Taldain'),
      whole(3, 'Bavadin', 'Taldain'), whole(4, 'Bavadin', 'Taldain / Scadrial (avatars)'),
      whole(5, 'Bavadin', 'Taldain'),
    ]),
  line('cultivation', 'Cultivation', '#4ade80', 'stormlight', 'Roshar',
    'The Shard of growth and change, Honor\'s counterpart on Roshar.',
    ['The Stormlight Archive', 'Rhythm of War', 'Wind and Truth'], [
      // No arc on a Shard or its rows yet: everything before era 4 is
      // written so a Way of Kings reader can read it. Her name is Rhythm of
      // War's; that she left Roshar is Wind and Truth's.
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unnamed', 'Roshar'), whole(2, 'Unnamed', 'Roshar'),
      whole(3, 'Unnamed', 'Roshar'),
      whole(4, 'Koravellium Avast', 'Gone from Roshar'),
      whole(5, 'Koravellium Avast', 'Gone from Roshar'),
    ]),
  line('devotion', 'Devotion', '#a78bfa', 'elantris', 'Sel',
    'Splintered by Odium. Its power, with Dominion, became the Dor — trapped in the Cognitive Realm and geographically anchored.',
    ['Elantris', 'Arcanum Unbounded — Sel essay'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      splintered(1, 'Sel', 'Aona'), splintered(2, 'Sel'), splintered(3, 'Sel'),
      splintered(4, 'Sel'), splintered(5, 'Sel'),
    ]),
  line('dominion', 'Dominion', '#6366f1', 'elantris', 'Sel',
    'Splintered by Odium alongside Devotion. The Dor is their combined, trapped Investiture.',
    ['Elantris', 'Arcanum Unbounded — Sel essay'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      splintered(1, 'Sel', 'Skai'), splintered(2, 'Sel'), splintered(3, 'Sel'),
      splintered(4, 'Sel'), splintered(5, 'Sel'),
    ]),
  line('endowment', 'Endowment', '#f472b6', 'warbreaker', 'Nalthis',
    'Gives freely: BioChromatic Breath, the Returned, and the Tears of Edgli. Held by Edgli.',
    ['Warbreaker', 'Arcanum Unbounded'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Edgli', 'Nalthis'), whole(2, 'Edgli', 'Nalthis'),
      whole(3, 'Edgli', 'Nalthis'), whole(4, 'Edgli', 'Nalthis'), whole(5, 'Edgli', 'Nalthis'),
    ]),
  line('honor', 'Honor', '#38bdf8', 'stormlight', 'Roshar',
    'The Shard of oaths and bonds, the Almighty of the Vorin church. He is dead, and his visions still come in the storms.',
    ['The Stormlight Archive', 'Wind and Truth'], [
      // Era 3 is the default year and says only what The Way of Kings says.
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'The Almighty', 'Roshar'), whole(2, 'The Almighty', 'Roshar'),
      splintered(3, 'Roshar', 'None: the Almighty is dead'),
      merged(4, 'Taravangian (Retribution)', 'Roshar'),
      merged(5, 'Taravangian (Retribution)', 'Roshar'),
    ]),
  line('invention', 'Invention', '#94a3b8', 'stormlight', 'Unknown',
    'One of the sixteen. Named in Wind and Truth; current vessel and world remain largely unknown.',
    ['Wind and Truth ch. 115'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Unknown'), whole(2, 'Unknown', 'Unknown'),
      whole(3, 'Unknown', 'Unknown'), whole(4, 'Unknown', 'Unknown'), whole(5, 'Unknown', 'Unknown'),
    ]),
  line('mercy', 'Mercy', '#fca5a5', 'arcanum', 'Unknown',
    'Aided Odium against Ambition. Little else is known on the page.',
    ['Arcanum Unbounded', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Unknown'), whole(2, 'Unknown', 'Unknown'),
      whole(3, 'Unknown', 'Unknown'), whole(4, 'Unknown', 'Unknown'), whole(5, 'Unknown', 'Unknown'),
    ]),
  line('odium', 'Odium', '#ef4444', 'stormlight', 'Braize / Roshar',
    'Hatred: the god who killed the Almighty, and whose Voidbringers the Desolations were fought against.',
    ['The Stormlight Archive', 'Oathbringer', 'Rhythm of War', 'Wind and Truth'], [
      // Rayse is named in Oathbringer and dies in Rhythm of War; era 3 waits.
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Odium', 'Braize'), whole(2, 'Odium', 'Braize'),
      whole(3, 'Odium', 'Braize / Roshar'),
      merged(4, 'Taravangian (Retribution)', 'Roshar'),
      merged(5, 'Taravangian (Retribution)', 'Roshar'),
    ]),
  line('preservation', 'Preservation', '#77aaff', 'mistborn1', 'Scadrial',
    'The drive to keep things as they are. Held by Leras, then Vin, then Sazed — who holds it with Ruin as Harmony.',
    ['Mistborn Era 1'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Leras', 'Scadrial'),
      whole(2, 'Leras → Vin → Sazed', 'Scadrial'),
      merged(3, 'Sazed (Harmony)', 'Scadrial'),
      merged(4, 'Sazed (Harmony)', 'Scadrial'),
      merged(5, 'Sazed (Harmony)', 'Scadrial'),
    ]),
  line('reason', 'Reason', '#c4b5fd', 'stormlight', 'Unknown',
    'Named in Wind and Truth. Current vessel and location remain largely unknown.',
    ['Wind and Truth ch. 115'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Unknown'), whole(2, 'Unknown', 'Unknown'),
      whole(3, 'Unknown', 'Unknown'), whole(4, 'Unknown', 'Unknown'), whole(5, 'Unknown', 'Unknown'),
    ]),
  line('ruin', 'Ruin', '#1e293b', 'mistborn1', 'Scadrial',
    'Entropy and decay. Held by Ati until the Catacendre, then taken up with Preservation by Sazed as Harmony.',
    ['Mistborn Era 1'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Ati', 'Scadrial'),
      whole(2, 'Ati → Sazed', 'Scadrial'),
      merged(3, 'Sazed (Harmony)', 'Scadrial'),
      merged(4, 'Sazed (Harmony)', 'Scadrial'),
      merged(5, 'Sazed (Harmony)', 'Scadrial'),
    ]),
  line('valor', 'Valor', '#fbbf24', 'stormlight', 'Unknown',
    'Held by the dragon Medelantorius. Named in Wind and Truth.',
    ['Wind and Truth ch. 115'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Medelantorius', 'Unknown'), whole(2, 'Medelantorius', 'Unknown'),
      whole(3, 'Medelantorius', 'Unknown'), whole(4, 'Medelantorius', 'Unknown'),
      whole(5, 'Medelantorius', 'Unknown'),
    ]),
  line('virtuosity', 'Virtuosity', '#22d3ee', 'yumi', 'Komashi',
    'The Shard of artistic excellence. Splintered herself; her Investiture became the hion and the nightmares of Komashi.',
    ['Yumi and the Nightmare Painter'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Komashi'),
      splintered(2, 'Komashi'), splintered(3, 'Komashi'), splintered(4, 'Komashi'), splintered(5, 'Komashi'),
    ]),
  line('whimsy', 'Whimsy', '#e879f9', 'stormlight', 'Unknown',
    'One of the sixteen. Named; little else is on the page.',
    ['Word of Brandon', 'Wind and Truth'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Unknown'), whole(2, 'Unknown', 'Unknown'),
      whole(3, 'Unknown', 'Unknown'), whole(4, 'Unknown', 'Unknown'), whole(5, 'Unknown', 'Unknown'),
    ]),
];
