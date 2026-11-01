/**
 * Cognitive geography that is not a planet: the cities and anomalies that
 * stand in Shadesmar itself, the paths worldhoppers actually walk, and the
 * four Commands.
 *
 * Placement in the orrery is ours — Shadesmar's real distances are not to
 * scale with the Physical Realm and canon never gives coordinates. What is
 * canon is *which subastral* a place sits in, and that is what these anchors
 * encode.
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
    kind: 'city',
    eraMin: 1,
    // au selish (the Ire refuse its scholars); WoB 8342 (Khriss), 2520, 190, 12508.
    fact: 'A city of the Cognitive Realm that stands on no world. Its universities send arcanists across the cosmere to study what the Shards left behind; Khriss helped found one. The Ire answer its letters when they feel like it, which is rarely.',
    bio: 'Worldhoppers meet here, and many people are born here and never leave. The Seventeenth Shard keeps its base in the city.',
    between: ['selish', 'scadrian', 'rosharan', 'taldainian'],
    canon: W,
    sources: ['Arcanum Unbounded', 'Mistborn: Secret History', 'The Lost Metal'],
  },
  {
    id: 'celebrant-cog',
    name: 'Celebrant',
    color: '#f472b6',
    book: 'stormlight',
    arc: 'oathbringer',
    kind: 'port',
    eraMin: 1,
    system: 'rosharan',
    offset: 30,
    bearing: 0.35,
    rise: -1.4,
    // Oathbringer chs. 97–102; it sits at the counterpart of the Sea of Spears.
    fact: 'A spren trading port in the Sea of Lost Lights, on the island that answers to the Sea of Spears. The docks are longer than the city, and the moneychangers keep perfect gems that hold Stormlight for ever. Humans and honorspren are rare here; since 1173 Voidspren have held part of it.',
    canon: C,
    sources: ['Oathbringer'],
  },
  {
    id: 'lasting-integrity-cog',
    name: 'Lasting Integrity',
    color: '#22d3ee',
    book: 'stormlight',
    arc: 'row',
    kind: 'fortress',
    eraMin: 1,
    system: 'rosharan',
    offset: 34,
    bearing: 4.1,
    rise: 2.6,
    // Rhythm of War ch. 94: the verdict is never given.
    fact: 'The honorspren fortress-city, a tower of law built out over the bead ocean. Adolin Kholin stood trial here for the Recreance; Maya spoke, and the honorspren walked out without a verdict.',
    canon: C,
    sources: ['Rhythm of War'],
  },
  {
    id: 'ire-fortress-cog',
    name: 'The Ire Fortress',
    color: '#a78bfa',
    book: 'arcanum',
    kind: 'fortress',
    eraMin: 1,
    system: 'scadrian',
    offset: 26,
    bearing: 1.5,
    rise: 1.2,
    fact: 'A fortified stronghold in Scadrial\'s subastral, held by the Ire — Elantrian worldhoppers who have kept themselves alive for centuries and who tried, once, to take up Preservation. Kelsier robbed them instead.',
    canon: C,
    sources: ['Mistborn: Secret History', 'Arcanum Unbounded'],
  },
  {
    id: 'elantris-pool',
    name: 'The Elantris Pool',
    color: '#a5b4fc',
    book: 'elantris',
    kind: 'pool',
    eraMin: 1,
    system: 'selish',
    offset: 19,
    bearing: 1.2,
    rise: -0.8,
    fact: "Devotion's perpendicularity seen from the Cognitive side: the Pool in the Atad Mountains above Elantris. Elantrians who walk into it are offered release; Hoid walked out the other side.",
    canon: C,
    sources: ['Elantris chs. 25, 61, postscript'],
  },
  {
    id: 'tears-of-edgli-cog',
    name: 'Tears of Edgli',
    color: '#f472b6',
    book: 'arcanum',
    kind: 'pool',
    eraMin: 1,
    system: 'nalthian',
    offset: 22,
    bearing: 0.8,
    rise: 0.4,
    // The flowers soak up its Investiture (WoB 9833); customs (WoB 9501).
    fact: "Endowment's perpendicularity from Shadesmar. The Tears of Edgli grow where its Investiture wells up, which is why their dye holds colour so well; enough worldhoppers come through that there are customs.",
    canon: W,
    sources: ['Warbreaker', 'Word of Brandon 9833, 9501'],
  },
  {
    id: 'patjis-eye-cog',
    name: "Patji's Eye",
    color: '#4ade80',
    book: 'arcanum',
    kind: 'pool',
    eraMin: 1,
    system: 'drominad',
    offset: 20,
    bearing: 3.4,
    rise: -0.6,
    // The Drominad essay alone. Autonomy's avatar is Isles of the Emberdark ch. 33.
    fact: "First of the Sun's perpendicularity — with no Shard in residence to explain it. Silverlight sent expeditions through; none came back.",
    canon: C,
    sources: ['Arcanum Unbounded — Drominad system'],
  },
  {
    id: 'dakwaras-island',
    name: "The Dakwara's island",
    color: '#a5f3fc',
    book: 'emberdark',
    arc: 'emberdark',
    kind: 'anomaly',
    eraMin: 1,
    system: 'drominad',
    offset: 33,
    bearing: 1.1,
    rise: 0.7,
    fact: "A flat ring of black coral-like rock in the Drominad subastral, with a moat and a tiny island in the hole. Cakoban is buried in the cave there, under Frost's runes: 'I was too late to help, but I laid him here.' The Malwish took it for the hidden perpendicularity.",
    bio: "The tunnel through the outer island is full of Patji — deathants, memist, masher wasps, a nightmaw — because generations of trappers' fears made it, and it began to take on Dusk's own memories once he was a Navigator. It is a dead end. The Dakwara swam the moat with hundreds of skullsnakes until Dusk crossed to the inner island; afterwards he sent it to guard the real perpendicularity's island instead.",
    see: ['dakwara', 'cakoban', 'frost', 'dusk', 'dajer'],
    wiki: "Dakwara's island",
    canon: C,
    sources: ['Isles of the Emberdark'],
  },
  {
    // Isles of the Emberdark names the Knell and the Current (chs. 25, 45, 57);
    // Arcanum Unbounded has Ambition Splintered beyond the Threnodite system,
    // not in it.
    id: 'grand-knell',
    name: 'The Grand Knell',
    color: '#ef4444',
    book: 'emberdark',
    arc: 'emberdark',
    kind: 'anomaly',
    eraMin: 1,
    system: 'threnodite',
    offset: 24,
    bearing: 2.8,
    rise: 3.2,
    fact: 'Where Ambition died, near Threnody — on old charts, the Grand Disturbance of the Shard Ambition. It pulses, and the pulses are the Current: a heading anywhere in the Cognitive Realm, for anyone with the sense or the instrument to feel it.',
    bio: 'Seekers can find the Knell; Navigators can feel what stands between them and it, which is why they can chart the Emberdark. Close in, the Eidoliths haunt the water and human thought no longer turns them aside. The Knights Radiant once carried compasses that point here.',
    aliases: 'the Knell, the Current, Grand Disturbance of the Shard Ambition',
    see: ['ambition', 'eidolith', 'emberdark', 'navigation'],
    wiki: 'Grand Knell',
    canon: C,
    sources: ['Isles of the Emberdark chs. 25, 45, 57', 'Wind and Truth chs. 7, 11', 'Elsecaller'],
  },
  {
    id: 'well-of-ascension-cog',
    name: 'The Well, from the other side',
    color: '#67e8f9',
    book: 'secrethistory',
    kind: 'pool',
    eraMin: 2,
    eraMax: 2,
    system: 'scadrian',
    offset: 21,
    bearing: 5.0,
    rise: -0.4,
    fact: "Preservation's pool under Kredik Shaw, seen from Shadesmar. Kelsier walked this shore as a Cognitive Shadow and refused, for a while, to go on.",
    canon: C,
    sources: ['Mistborn: Secret History'],
  },
  {
    id: 'harmony-pool-cog',
    name: "Harmony's Pool",
    color: '#22d3ee',
    book: 'mistborn2',
    arc: 'tlm',
    kind: 'pool',
    eraMin: 3,
    system: 'scadrian',
    offset: 25,
    bearing: 5.6,
    rise: 0.9,
    fact: 'Harmony\'s own perpendicularity, somewhere in the far south of Scadrial. The Malwish keep a careful watch on it.',
    canon: C,
    sources: ['The Lost Metal ch. 50'],
  },
  {
    id: 'cultivation-perp-cog',
    name: "Cultivation's Perpendicularity",
    color: '#4ade80',
    book: 'stormlight',
    arc: 'wor',
    kind: 'pool',
    eraMin: 1,
    system: 'rosharan',
    offset: 24,
    bearing: 2.2,
    rise: 1.6,
    // Words of Radiance ch. 46.
    fact: 'The Horneater Pool: warm water on top and something else beneath. Unkalaki who swim deep enough visit "the place of the gods", and Wit once came up out of it.',
    canon: C,
    sources: ['Words of Radiance', 'Oathbringer'],
  },
  {
    // The Nalthian star chart marks this the way it marks a planet: a
    // cognitive anomaly, in the Physical Realm, sharing Nalthis's orbit. It
    // is drawn here in Shadesmar because that is where this atlas keeps
    // Cognitive sites, and because nobody has said which Realm it is more
    // in than the other.
    id: 'nalthian-anomaly',
    name: 'The Nalthian anomaly',
    color: '#f0abfc',
    book: 'arcanum',
    kind: 'anomaly',
    system: 'nalthian',
    offset: 17.5,
    bearing: 2.35,
    rise: 3.2,
    fact: 'A cognitive anomaly that shares Nalthis\'s orbit. Whether the planet passes through it once a year or it travels with her, the chart does not say.',
    bio: 'Endowment\'s world is the most popular address in the cosmere for worldhoppers — busy enough that there is a customs check near the perpendicularity — and this is the other thing on its chart that is not a planet. It is marked, named as a kind, and left at that.',
    aliases: 'Nalthian cognitive anomaly',
    wiki: 'Nalthian system',
    canon: C,
    sources: ['Arcanum Unbounded — Nalthian system'],
  },
  {
    // The three Expanses are on Oathbringer's map of Shadesmar.
    id: 'expanse-vapours',
    name: 'The Expanse of the Vapors',
    color: '#93c5fd',
    book: 'stormlight',
    arc: 'oathbringer',
    kind: 'anomaly',
    eraMin: 1,
    system: 'rosharan',
    offset: 42,
    bearing: 1.1,
    rise: 4.5,
    fact: 'An Expanse at the edge of the Rosharan map, between the Sea of Lost Lights and the Nexus of Imagination. It leads to Scadrial, whose subastral is all mist (Word of Brandon).',
    aliases: 'Expanse of Vapours',
    canon: W,
    sources: ['Oathbringer — map of Shadesmar', 'Word of Brandon 1392'],
  },
  {
    id: 'expanse-broken-sky',
    name: 'The Expanse of the Broken Sky',
    color: '#fbbf24',
    book: 'stormlight',
    arc: 'oathbringer',
    kind: 'anomaly',
    eraMin: 1,
    system: 'rosharan',
    offset: 44,
    bearing: 5.2,
    rise: -3.8,
    fact: 'An Expanse off the Sea of Lost Lights. It corresponds to Taldain (Word of Brandon).',
    canon: W,
    sources: ['Oathbringer — map of Shadesmar', 'Word of Brandon 12656, 1392'],
  },
  {
    id: 'expanse-densities',
    name: 'The Expanse of the Densities',
    color: '#a78bfa',
    book: 'stormlight',
    arc: 'oathbringer',
    kind: 'anomaly',
    eraMin: 1,
    system: 'rosharan',
    offset: 46,
    bearing: 3.3,
    rise: 2.2,
    fact: 'The Rosharan name for Sel\'s subastral, after the Dor that fills it: two dead Shards\' power pressed into the Cognitive Realm like plasma. People can cross it with help. Hoid has, when he had to.',
    aliases: 'Expanse of Densities',
    canon: W,
    sources: ['Oathbringer — map of Shadesmar', 'Word of Brandon 8595, 10301, 9500'],
  },
  {
    id: 'shroud-cog',
    name: 'The Shroud, from beneath',
    color: '#22d3ee',
    book: 'yumi',
    kind: 'anomaly',
    // Yumi is after The Sunlit Man (WoB 16524).
    eraMin: 5,
    system: 'utol',
    offset: 23,
    bearing: 0.6,
    rise: 1.1,
    fact: 'Komashi from the Cognitive side. The nightmares under the shroud were the father machine\'s dead, kept as its servants; when Yumi broke the machine they dissolved.',
    canon: C,
    sources: ['Yumi and the Nightmare Painter chs. 23, 39, 41'],
  },
];

export const ROUTES: WorldhopperRoute[] = [
  { id: 'sel-silver', from: 'selish', to: 'scadrian', via: 'silverlight', book: 'secrethistory',
    eraMin: 2, fact: 'The Ire are Elantrians of Sel, and they keep their fortress at the edge of Scadrial\'s subastral.' },
  // That the Ghostbloods are Scadrial's is Rhythm of War (chs. 13, 115).
  { id: 'scadrial-roshar', from: 'scadrian', to: 'rosharan', via: 'silverlight', book: 'stormlight', arc: 'row',
    eraMin: 1, fact: 'The Ghostbloods\' road between Scadrial and Roshar. Thaidakar cannot walk it himself; he sends a seon.' },
  // Vivenna on Roshar is Oathbringer. Vasher walked and rode a caravan: WoB 8168, 11992.
  { id: 'nalthis-roshar', from: 'nalthian', to: 'rosharan', book: 'stormlight', arc: 'oathbringer',
    eraMin: 1, fact: 'Vasher walked part of it and rode a caravan the rest (Word of Brandon). Vivenna followed him; Nightblood came too.' },
  // Khriss is a Darksider; she went to Dayside and home again in White Sand.
  { id: 'taldain-silver', from: 'taldainian', to: 'scadrian', via: 'silverlight', book: 'arcanum',
    eraMin: 1, fact: 'Khriss got off Taldain before Autonomy shut it, and helped found a university in Silverlight (Word of Brandon).' },
  { id: 'threnody-scadrial', from: 'threnodite', to: 'scadrian', book: 'mistborn2',
    eraMin: 3, fact: "Nazh's maps keep turning up on Scadrial." },
  // Isles of the Emberdark chs. 25, 30. The road's far end is ours; canon gives
  // only Silverlight and Yolen.
  { id: 'yolen-silver', from: 'yolish', to: 'selish', via: 'silverlight', book: 'emberdark', arc: 'emberdark',
    eraMin: 1,
    fact: 'Silverlight\'s Nexus opens on three places in the Physical Realm, and one of them is Yolen\'s greatstar. The dragons kept that quiet until a few decades before the Drominad perpendicularity was found.' },
  { id: 'canticle-scadrial', from: 'canticle', to: 'scadrian', book: 'sunlit',
    eraMin: 5, fact: 'Nomad came off Canticle with nothing and kept going. The Night Brigade followed.' },
  { id: 'roshar-braize', from: 'rosharan', to: 'rosharan', book: 'stormlight',
    eraMin: 1, fact: 'Not a worldhop at all: Roshar and Braize share a subastral, and that is what made the Oathpact possible.' },
  { id: 'drominad-emberdark', from: 'drominad', to: 'scadrian', via: 'silverlight', book: 'emberdark', arc: 'emberdark',
    eraMin: 5, fact: 'Off the lanes, on an Iriali map: Starling took the Dynamic out of Silverlight after a perpendicularity in the Drominad system, and found the Malwish had got there first.' },
];

export const DAWNSHARDS: Dawnshard[] = [
  // Two Commands are on the page: Change (Dawnshard ch. 19) and Exist (The
  // Sunlit Man ch. 21; Wind and Truth ch. 146). "Unite" was a reader's guess
  // that Brandon answered with a RAFO (WoB 14377); it is not canon. The ids
  // are kept so nothing that points at them breaks.
  {
    id: 'dawnshard-change', name: 'Dawnshard of Change', command: 'Change',
    holder: 'rysn', book: 'stormlight', arc: 'dawnshard',
    fact: 'One of four primal Commands, older than the Shards and not divisible the way they are. Rysn Ftori bears it, hidden, after Akinah. In someone with no Investiture of her own it lies quiet.',
    canon: C, sources: ['Dawnshard chs. 16–19', 'Word of Brandon'],
  },
  {
    id: 'dawnshard-unite', name: 'A third Dawnshard', command: 'Unknown',
    holder: 'unknown', book: 'stormlight', arc: 'dawnshard',
    fact: 'Nikli says there are four. This one\'s Command is not on the page. One of the four is different from all the rest (Word of Brandon), and which one is not said.',
    canon: W, sources: ['Dawnshard ch. 19', 'Word of Brandon 4824, 14364'],
  },
  {
    // When Hoid handed it over — as Retribution was born — is Wind and Truth
    // ch. 146 and stays off this Sunlit card; Sigzil's card carries it.
    id: 'dawnshard-exist', name: 'Dawnshard of Exist', command: 'Exist',
    holder: 'hoid', book: 'sunlit',
    fact: 'The Command to Exist. Hoid carried it so long that it remade him: he does not age, is very hard to kill, cannot hurt anyone and cannot eat meat. He once handed it to his apprentice Sigzil, who carried it for a while and passed it on, and is hunted for it still.',
    canon: C, sources: ['The Sunlit Man chs. 10, 21, 28, 34', 'Wind and Truth ch. 146', 'Word of Brandon 14300'],
  },
  {
    id: 'dawnshard-adonalsium', name: 'A fourth Dawnshard', command: 'Unknown',
    holder: 'unknown', book: 'core',
    fact: 'Roshar\'s myths remember the Dawnshards as weapons — one, the Poem of Ista says, could bind any creature, voidish or mortal — and Honor\'s last vision worried how mankind would manage without them. This one\'s Command is not on the page.',
    canon: C, sources: ['The Way of Kings chs. 29, 36, 75'],
  },
];

export const hubById: Record<string, Hub> = Object.fromEntries(HUBS.map((h) => [h.id, h]));
export const dawnshardById: Record<string, Dawnshard> =
  Object.fromEntries(DAWNSHARDS.map((d) => [d.id, d]));
