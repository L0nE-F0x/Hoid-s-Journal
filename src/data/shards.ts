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
  // The Vessel's name is an Oathbringer epigraph; that she held Ambition was
  // Word of Brandon until Wind and Truth. Mercy, the Grand Knell and the Evil
  // are later books and live in relations, hubs and the glossary.
  line('ambition', 'Ambition', '#f97316', 'arcanum', 'Threnody',
    'Odium found her in the Threnodite system and tore pieces off her. She got away, and was Splintered somewhere beyond it; the pieces left behind are why Threnody is the way it is.',
    ['Arcanum Unbounded — Threnodite system', 'Oathbringer ch. 40 epigraph', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      splintered(1, 'Wounded in the Threnodite system; Splintered beyond it', 'Uli Da (killed)'),
      splintered(2, 'Threnody'), splintered(3, 'Threnody'), splintered(4, 'Threnody'), splintered(5, 'Threnody'),
    ], {
      bio: 'Khriss suspects the shades, the Evil and the strange surplus of Investiture on Threnody are chunks of Ambition, torn off in that fight and left to twist the people and the planet. There is no stable perpendicularity there, only unpredictable ones of morbid origin. Odium had her first on his list.',
      see: ['uli-da', 'threnody', 'shade'],
      fieldNotes: {
        vessel: { canon: 'wob', note: 'Uli Da is named in an Oathbringer epigraph (ch. 40); that she held Ambition was Word of Brandon (8398) until Wind and Truth ch. 104. She was Sho Del (WoB 8933).' },
        bio: { canon: 'wob', note: '"First on his list" is Word of Brandon 1550.' },
      },
    }),
  // Scadrial, Trell and Telsin are The Lost Metal and reach this Shard by
  // relation; this card is White Sand's and Arcanum Unbounded's.
  line('autonomy', 'Autonomy', '#f59e0b', 'whitesand', 'Taldain',
    'Taldain\'s only Shard. Her Investiture rides the sunlight onto Dayside\'s sand. She keeps Taldain shut to worldhoppers and wants no other Shard near her — and meddles on other worlds all the same.',
    ['White Sand — Ars Arcanum', 'Arcanum Unbounded — Taldain system', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Bavadin', 'Taldain'), whole(2, 'Bavadin', 'Taldain'),
      whole(3, 'Bavadin', 'Taldain'), whole(4, 'Bavadin', 'Taldain'),
      whole(5, 'Bavadin', 'Taldain'),
    ], {
      intent: 'To stand apart, from the other Shards most of all.',
      aliases: 'Sand Lord',
      bio: 'On Dayside she is the Sand Lord, one of many faces she wears; whole pantheons on other worlds turn out to be her under different names. Even Taldain\'s sky is arranged — the moon held to its hour, the planet held between two suns — and the Ars Arcanum credits her for it. Khriss, who is from Taldain, cannot get home.',
      see: ['taldain', 'sand-mastery', 'khriss'],
      fieldNotes: {
        vessel: { canon: 'wob', note: 'Hoid names Bavadin in a Way of Kings letter; that she holds Autonomy was Word of Brandon until The Lost Metal ch. 19.' },
        bio: { canon: 'wob', note: 'The Sand Lord as her persona and her many faces are Word of Brandon 5876 and 3974.' },
      },
    }),
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
  // Odium's hand is a Way of Kings letter and the Sel essay; it is a relation.
  line('devotion', 'Devotion', '#a78bfa', 'elantris', 'Sel',
    'Sel\'s Shard of love that serves, Splintered long before Arelon. With Dominion\'s power it became the Dor: trapped in the Cognitive Realm, bound to the shape of the land, and behind every Aon.',
    ['Elantris', 'Arcanum Unbounded — Selish system', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      splintered(1, 'Sel', 'Aona'), splintered(2, 'Sel'), splintered(3, 'Sel'),
      splintered(4, 'Sel'), splintered(5, 'Sel'),
    ], {
      // Ien, Elantris ch. 16.
      intent: 'Love that serves: no above or beneath, only those we love.',
      bio: 'Arelon still prays to her as Domi. The Aon at the heart of every seon is a Splinter of her. Elantrians who walk into the Pool hear a kind voice offer them release, and whether that is something left of Devotion nobody has said.',
      see: ['dominion', 'aona', 'dor', 'seon', 'elantris-city'],
      fieldNotes: {
        vessel: { canon: 'wob', note: 'Aona as Devotion\'s Vessel is Word of Brandon 783; her name is first printed in a Way of Kings epigraph (ch. 22).' },
        bio: { canon: 'wob', note: 'Domi (783) and the seons as her Splinters (4679) are Word of Brandon.' },
      },
    }),
  line('dominion', 'Dominion', '#6366f1', 'elantris', 'Sel',
    'Sel\'s other Shard, Splintered beside Devotion. Half of the Dor is Dominion, and Fjordell\'s Jaddeth owes it most of what he is.',
    ['Elantris', 'Arcanum Unbounded — Selish system', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      splintered(1, 'Sel', 'Skai'), splintered(2, 'Sel'), splintered(3, 'Sel'),
      splintered(4, 'Sel'), splintered(5, 'Sel'),
    ], {
      intent: 'Conquest, by Word of Brandon.',
      bio: 'The skaze are its Splinters, as the seons are Devotion\'s, and they still have a hand in Fjordell\'s politics. Sel has a second perpendicularity, presumably Dominion\'s; where it is has not been said.',
      see: ['devotion', 'skai', 'dor', 'skaze'],
      fieldNotes: {
        vessel: { canon: 'wob', note: 'Skai as Dominion\'s Vessel is Word of Brandon; his name is first printed in a Way of Kings epigraph (ch. 22).' },
        bio: { canon: 'wob', note: 'The skaze\'s politics (6167), the second perpendicularity (13093) and "Conquest" (13140) are Word of Brandon.' },
      },
    }),
  // Her letters to Hoid (Oathbringer, Wind and Truth) are relations.
  line('endowment', 'Endowment', '#f472b6', 'warbreaker', 'Nalthis',
    'Nalthis\'s only Shard, and she gives: a Breath to everyone born, a second life to the Returned, colour to the Tears of Edgli.',
    ['Warbreaker', 'Arcanum Unbounded', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Edgli', 'Nalthis'), whole(2, 'Edgli', 'Nalthis'),
      whole(3, 'Edgli', 'Nalthis'), whole(4, 'Edgli', 'Nalthis'), whole(5, 'Edgli', 'Nalthis'),
    ], {
      intent: 'To give, with no strings attached.',
      bio: 'The dead hear her as a calm voice offering a vision and a choice; she does not press. Most Nalthians do not know she exists — only the Pahn Kahl remember the voice — and Austre is not her.',
      see: ['edgli', 'nalthis', 'returned', 'awakening', 'tears-of-edgli'],
      fieldNotes: {
        vessel: { canon: 'wob', note: 'Edgli as Endowment\'s Vessel is Word of Brandon 2106; the Tears of Edgli are named in Warbreaker.' },
        bio: { canon: 'wob', note: 'The Pahn Kahl (4498) and Austre (6590) are Word of Brandon.' },
      },
    }),
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
  // Named in Harmony's Rhythm of War letter, but the Vessel is in every era row
  // and that is Wind and Truth ch. 115, so the card waits for that book.
  line('invention', 'Invention', '#94a3b8', 'stormlight', 'Unknown',
    'One of the sixteen, held by Chan Ko Sar, who travelled the cosmere making marvels and turned Honor down when he asked for help against Odium. Harmony reached Invention once, and could not find it again.',
    ['Rhythm of War — Harmony\'s letter', 'Wind and Truth ch. 115'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Chan Ko Sar', 'Unknown'), whole(2, 'Chan Ko Sar', 'Unknown'),
      whole(3, 'Chan Ko Sar', 'Unknown'), whole(4, 'Chan Ko Sar', 'Unknown'), whole(5, 'Chan Ko Sar', 'Unknown'),
    ], { arc: 'wat', see: ['invention-vessel'] }),
  // First named in Harmony's letter (Rhythm of War chs. 22–27 epigraphs).
  line('mercy', 'Mercy', '#fca5a5', 'stormlight', 'Unknown',
    'One of the sixteen, Vessel unknown. Mercy was there when it, Ambition and Odium clashed and Ambition was destroyed; whose side it took, the letter does not say. It worries Harmony.',
    ['Rhythm of War — Harmony\'s letter (chs. 22–27 epigraphs)'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Unknown'), whole(2, 'Unknown', 'Unknown'),
      whole(3, 'Unknown', 'Unknown'), whole(4, 'Unknown', 'Unknown'), whole(5, 'Unknown', 'Unknown'),
    ], { arc: 'row', see: ['mercy-vessel'] }),
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
  // Vin and Sazed as Vessels are The Hero of Ages, and so are the names. Kelsier's
  // turn holding it is Secret History, and reaches the Shard by relation.
  line('preservation', 'Preservation', '#77aaff', 'mistborn1', 'Scadrial',
    'The drive to keep things as they are. Held by Leras, then Vin, then Sazed — who holds it with Ruin as Harmony.',
    ['Mistborn Era 1'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Leras', 'Scadrial'),
      whole(2, 'Leras → Vin → Sazed', 'Scadrial'),
      merged(3, 'Sazed (Harmony)', 'Scadrial'),
      merged(4, 'Sazed (Harmony)', 'Scadrial'),
      merged(5, 'Sazed (Harmony)', 'Scadrial'),
    ], {
      arc: 'hoa',
      intent: 'To keep things as they are.',
      aliases: 'Terr',
      bio: 'Leras made Scadrial with Ruin, then caged him in the Well of Ascension and hid most of his body as atium in the Pits of Hathsin. It cost Leras his mind. The mists, the Terris prophecies and a thousand years of Snapped Mistings were the plan he left to finish the job.',
      see: ['ruin', 'leras', 'vin', 'sazed', 'well-of-ascension', 'harmony'],
    }),
  line('reason', 'Reason', '#c4b5fd', 'stormlight', 'Unknown',
    'One of the sixteen, held by Euridrius. Her first wish was to hide from the other Shards and outlast them, and she hid well enough that Honor could never find her.',
    ['Wind and Truth ch. 115', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Euridrius', 'Unknown'), whole(2, 'Euridrius', 'Unknown'),
      whole(3, 'Euridrius', 'Unknown'), whole(4, 'Euridrius', 'Unknown'), whole(5, 'Euridrius', 'Unknown'),
    ], {
      arc: 'wat',
      intent: 'Not shown beyond the name. The wish to hide is hers more than the Shard\'s (Word of Brandon).',
      bio: 'She has begun to doubt that hiding is the most important thing, and she likes experiments (Word of Brandon).',
      see: ['reason-vessel'],
      fieldNotes: { bio: { canon: 'wob', note: 'Word of Brandon 2788, 326, 12684, 13231, 17222.' } },
    }),
  line('ruin', 'Ruin', '#1e293b', 'mistborn1', 'Scadrial',
    'Entropy and decay. Held by Ati until the Catacendre, then taken up with Preservation by Sazed as Harmony.',
    ['Mistborn Era 1'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Ati', 'Scadrial'),
      whole(2, 'Ati → Sazed', 'Scadrial'),
      merged(3, 'Sazed (Harmony)', 'Scadrial'),
      merged(4, 'Sazed (Harmony)', 'Scadrial'),
      merged(5, 'Sazed (Harmony)', 'Scadrial'),
    ], {
      arc: 'hoa',
      intent: 'Entropy: every clock must wind down. Without that there is no life.',
      bio: 'Caged in the Well of Ascension with his body buried as atium, Ruin rewrote every prophecy not set in metal and whispered through every Hemalurgic spike, until Vin let him out.',
      see: ['preservation', 'ati', 'pits-of-hathsin', 'hemalurgy', 'atium'],
    }),
  // Named in Rhythm of War; the Vessel is Wind and Truth ch. 115 and is in every
  // era row, so the card waits for that book. Nothing about Miral here: that is
  // The Fires of December, and it reaches Valor through relations.
  line('valor', 'Valor', '#fbbf24', 'stormlight', 'Unknown',
    'One of the sixteen, held by the dragon Medelantorius, a warrior before the Shattering. Harmony found her reasonable. Tanavast looked for her in his war with Odium and never found her, and Endowment says she does not want to see Hoid again.',
    ['Rhythm of War — Harmony\'s letter', 'Wind and Truth ch. 115', 'Wind and Truth — Endowment\'s letter'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Medelantorius', 'Unknown'), whole(2, 'Medelantorius', 'Unknown'),
      whole(3, 'Medelantorius', 'Unknown'), whole(4, 'Medelantorius', 'Unknown'),
      whole(5, 'Medelantorius', 'Unknown'),
    ], { arc: 'wat', see: ['medelantorius'] }),
  // The nightmares are not hers: they are the father machine's dead.
  line('virtuosity', 'Virtuosity', '#22d3ee', 'yumi', 'Komashi',
    'The Shard of artistic talent and appreciation. She wandered the cosmere rather than settle, and Splintered herself near Komashi; the hijo are her Splinters, and the hion that lights Kilahito comes from them.',
    ['Yumi and the Nightmare Painter', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Wandering the cosmere'),
      splintered(2, 'UTol system'), splintered(3, 'UTol system'), splintered(4, 'UTol system'), splintered(5, 'UTol system'),
    ], {
      intent: 'Artistic intent, talent and appreciation (Word of Brandon).',
      bio: 'Her Vessel was a woman whose name is not given. Hoid thinks her Splintering is part of why UTol shows through Komashi\'s shroud the way it does, and Design says the whole region is full of her Splinters. When she broke herself, and why, nobody has said.',
      see: ['virtuosity-vessel', 'komashi', 'hion'],
      fieldNotes: {
        eras: { canon: 'speculation', note: 'Yumi fixes where she Splintered, not when; the era-2 changeover is ours.' },
        intent: { canon: 'wob', note: 'Word of Brandon 15500; her wandering is 15530.' },
      },
    }),
  line('whimsy', 'Whimsy', '#e879f9', 'stormlight', 'Unknown',
    'One of the sixteen, Vessel unknown. When Harmony reached it at Hoid\'s asking, it was not terribly useful.',
    ['Rhythm of War — Harmony\'s letter', 'The Lost Metal ch. 35', 'Word of Brandon'], [
      whole(0, '—', 'Yolen (pre-Shattering)'),
      whole(1, 'Unknown', 'Unknown'), whole(2, 'Unknown', 'Unknown'),
      whole(3, 'Unknown', 'Unknown'), whole(4, 'Unknown', 'Unknown'), whole(5, 'Unknown', 'Unknown'),
    ], {
      arc: 'row',
      intent: 'Unknown. Not calculating, not deliberate (Word of Brandon).',
      see: ['whimsy-vessel'],
    }),
];
