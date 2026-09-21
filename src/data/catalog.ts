import type { Belt, Body, Era, Moon, Series, System, WorldEpoch } from './types.ts';

const C = 'canon' as const;
const S = 'speculation' as const;

export const SERIES: Series[] = [
  { id: 'elantris', title: 'Elantris', arcs: [
    { id: 'elantris', label: 'Elantris' },
    { id: 'hope', label: 'The Hope of Elantris' },
  ]},
  { id: 'emperorssoul', title: "The Emperor's Soul", single: true, arcs: [{ id: 'emperorssoul', label: "The Emperor's Soul" }] },
  { id: 'eleventhmetal', title: 'The Eleventh Metal', single: true, arcs: [{ id: 'eleventhmetal', label: 'The Eleventh Metal' }] },
  { id: 'mistborn1', title: 'Mistborn Era 1', arcs: [
    { id: 'tfe', label: 'The Final Empire' },
    { id: 'woa', label: 'The Well of Ascension' },
    { id: 'hoa', label: 'The Hero of Ages' },
  ]},
  { id: 'secrethistory', title: 'Mistborn: Secret History', single: true, arcs: [{ id: 'secrethistory', label: 'Mistborn: Secret History' }] },
  { id: 'warbreaker', title: 'Warbreaker', single: true, arcs: [{ id: 'warbreaker', label: 'Warbreaker' }] },
  { id: 'whitesand', title: 'White Sand', arcs: [
    { id: 'ws1', label: 'White Sand, Volume 1' },
    { id: 'ws2', label: 'White Sand, Volume 2' },
    { id: 'ws3', label: 'White Sand, Volume 3' },
  ]},
  { id: 'stormlight', title: 'The Stormlight Archive', arcs: [
    { id: 'twok', label: 'The Way of Kings' },
    { id: 'wor', label: 'Words of Radiance' },
    { id: 'edgedancer', label: 'Edgedancer' },
    { id: 'oathbringer', label: 'Oathbringer' },
    { id: 'dawnshard', label: 'Dawnshard' },
    { id: 'row', label: 'Rhythm of War' },
    { id: 'wat', label: 'Wind and Truth' },
  ]},
  { id: 'elsecaller', title: 'Elsecaller', single: true, arcs: [{ id: 'elsecaller', label: 'Elsecaller' }] },
  { id: 'arcanum', title: 'Arcanum Unbounded', single: true, arcs: [{ id: 'arcanum', label: 'Arcanum Unbounded: The Cosmere Collection' }] },
  { id: 'shadowsforsilence', title: 'Shadows for Silence in the Forests of Hell', single: true,
    arcs: [{ id: 'shadowsforsilence', label: 'Shadows for Silence in the Forests of Hell' }] },
  { id: 'sixthofdusk', title: 'Sixth of the Dusk', single: true, arcs: [{ id: 'sixthofdusk', label: 'Sixth of the Dusk' }] },
  { id: 'mistborn2', title: 'Mistborn Era 2', arcs: [
    { id: 'aol', label: 'The Alloy of Law' },
    { id: 'sos', label: 'Shadows of Self' },
    { id: 'bom', label: 'The Bands of Mourning' },
    { id: 'tlm', label: 'The Lost Metal' },
    { id: 'jak', label: 'Allomancer Jak and the Pits of Eltania' },
  ]},
  { id: 'tress', title: 'Tress of the Emerald Sea', single: true, arcs: [{ id: 'tress', label: 'Tress of the Emerald Sea' }] },
  { id: 'yumi', title: 'Yumi and the Nightmare Painter', single: true, arcs: [{ id: 'yumi', label: 'Yumi and the Nightmare Painter' }] },
  { id: 'sunlit', title: 'The Sunlit Man', single: true, arcs: [{ id: 'sunlit', label: 'The Sunlit Man' }] },
  { id: 'emberdark', title: 'Isles of the Emberdark', single: true, arcs: [{ id: 'emberdark', label: 'Isles of the Emberdark' }] },
];

/** Every published Cosmere work, in the order the Journal lists them. */
export const JOURNAL_BOOKS: { series: string; arc: string; title: string }[] = [
  { series: 'elantris', arc: 'elantris', title: 'Elantris' },
  { series: 'elantris', arc: 'hope', title: 'The Hope of Elantris' },
  { series: 'emperorssoul', arc: 'emperorssoul', title: "The Emperor's Soul" },
  { series: 'eleventhmetal', arc: 'eleventhmetal', title: 'The Eleventh Metal' },
  { series: 'mistborn1', arc: 'tfe', title: 'The Final Empire' },
  { series: 'mistborn1', arc: 'woa', title: 'The Well of Ascension' },
  { series: 'mistborn1', arc: 'hoa', title: 'The Hero of Ages' },
  { series: 'mistborn2', arc: 'aol', title: 'The Alloy of Law' },
  { series: 'mistborn2', arc: 'sos', title: 'Shadows of Self' },
  { series: 'mistborn2', arc: 'bom', title: 'The Bands of Mourning' },
  { series: 'mistborn2', arc: 'tlm', title: 'The Lost Metal' },
  { series: 'mistborn2', arc: 'jak', title: 'Allomancer Jak and the Pits of Eltania' },
  { series: 'secrethistory', arc: 'secrethistory', title: 'Mistborn: Secret History' },
  { series: 'warbreaker', arc: 'warbreaker', title: 'Warbreaker' },
  { series: 'stormlight', arc: 'twok', title: 'The Way of Kings' },
  { series: 'stormlight', arc: 'wor', title: 'Words of Radiance' },
  { series: 'stormlight', arc: 'edgedancer', title: 'Edgedancer' },
  { series: 'stormlight', arc: 'oathbringer', title: 'Oathbringer' },
  { series: 'stormlight', arc: 'dawnshard', title: 'Dawnshard' },
  { series: 'stormlight', arc: 'row', title: 'Rhythm of War' },
  { series: 'stormlight', arc: 'wat', title: 'Wind and Truth' },
  { series: 'elsecaller', arc: 'elsecaller', title: 'Elsecaller' },
  { series: 'whitesand', arc: 'ws1', title: 'White Sand, Volume 1' },
  { series: 'whitesand', arc: 'ws2', title: 'White Sand, Volume 2' },
  { series: 'whitesand', arc: 'ws3', title: 'White Sand, Volume 3' },
  { series: 'shadowsforsilence', arc: 'shadowsforsilence', title: 'Shadows for Silence in the Forests of Hell' },
  { series: 'sixthofdusk', arc: 'sixthofdusk', title: 'Sixth of the Dusk' },
  { series: 'arcanum', arc: 'arcanum', title: 'Arcanum Unbounded: The Cosmere Collection' },
  { series: 'tress', arc: 'tress', title: 'Tress of the Emerald Sea' },
  { series: 'yumi', arc: 'yumi', title: 'Yumi and the Nightmare Painter' },
  { series: 'sunlit', arc: 'sunlit', title: 'The Sunlit Man' },
  { series: 'emberdark', arc: 'emberdark', title: 'Isles of the Emberdark' },
];

export const PUB_ORDER = [
  'elantris', 'mistborn1', 'warbreaker', 'stormlight', 'mistborn2',
  'eleventhmetal', 'emperorssoul', 'shadowsforsilence', 'sixthofdusk', 'whitesand',
  'secrethistory', 'arcanum', 'tress', 'yumi', 'sunlit', 'elsecaller', 'emberdark',
];

export const ERAS: Era[] = [
  {
    id: 0, name: 'Pre-Shattering', start: -8000,
    event: 'Adonalsium exists on Yolen. The origin of magic and humanity.',
    realDate: 'Yolen — pre-Shattering',
    chrono: "Adonalsium is whole on Yolen. No canonical absolute date exists; the Shattering is only loosely placed 'over 10,000 years' before the Cosmere space age.",
    canon: S, sources: ['Coppermind: Shattering', 'Word of Brandon'],
  },
  {
    id: 1, name: 'Post-Shattering', start: -7000,
    event: 'Sixteen Vessels Shatter Adonalsium and scatter. Worlds are Shaped and Invested.',
    realDate: 'Early post-Shattering (millennia)',
    chrono: 'The sixteen Vessels disperse and Invest worlds over millennia. Elantris, Warbreaker and White Sand fall in the broad early-modern span that follows.',
    canon: C, sources: ['Arcanum Unbounded'],
  },
  {
    id: 2, name: 'Mistborn Era 1', start: -350,
    event: "The Lord Ruler holds Scadrial in ash. Preservation and Ruin clash over its fate.",
    realDate: "Scadrial — the Final Empire (~1,000 yrs) → Catacendre",
    chrono: "Scadrial's Final Empire endures roughly a thousand years under the Lord Ruler, ending with the Catacendre.",
    canon: C, sources: ['Mistborn Era 1'],
  },
  {
    id: 3, name: 'Stormlight Era 1', start: 0,
    event: 'The True Desolation begins on Roshar. The Knights Radiant return.',
    realDate: 'Roshar — 1173–1175 (Vorin calendar)',
    chrono: 'The Stormlight Archive, Books 1–5. Roshar years 1173–1175; Wind and Truth covers the final ten days of the contest in 1175.',
    canon: C, sources: ['The Stormlight Archive'],
  },
  {
    id: 4, name: 'Mistborn Era 2', start: 15,
    event: 'Harmony guides a recovering Scadrial. Technology evolves.',
    realDate: 'Scadrial — ~341 years after the Catacendre',
    chrono: 'The Wax & Wayne era. Tress and Yumi sit in this later modern band.',
    canon: C, sources: ['Mistborn Era 2'],
  },
  {
    id: 5, name: 'Future Convergence', start: 300,
    event: 'The Cosmere space age. Interplanetary travel becomes common.',
    realDate: 'Cosmere space age (latest known anchor)',
    chrono: 'Sixth of the Dusk, then The Sunlit Man, then Isles of the Emberdark. Only the broad ordering is canon.',
    canon: S, sources: ['The Sunlit Man', 'Isles of the Emberdark'],
  },
];

export const TIMELINE_NOTE =
  'Cross-world dates are deliberately fuzzy in canon. Each world\'s own calendar is shown where known; alignment between worlds is approximate (≈).';

const G = 0.145;
const sys = (x: number, y: number, z = (x * 0.08 - y * 0.05)): [number, number, number] =>
  [x * G, z * G, -y * G];

/**
 * The stars.
 *
 * `sunColor` is the star's own light and is canon wherever canon says one:
 * Roshar's is a large white sun, Threnody's is red, UTol's is a red-orange
 * larger than Roshar's, and the Nalthian, Scadrian and Selish suns are all
 * yellow and much alike. The Investiture cloud a system wears (`nebula`) is
 * the art device that still tells them apart at Cosmere distance — that one
 * is ours, not astronomy.
 *
 * Only three stars are named on the page: Mashe over Sel, and Taldain's pair,
 * AisDa and the Eye of Ridos.
 */
export const SYSTEMS: System[] = [
  { id: 'yolish', name: 'Yolish', sunColor: '#fefce8', position: sys(0, 0, 0), book: 'core', nebula: '#fef3c7',
    starDesc: 'Unnamed. Yolen keeps an astronomy that would be impossible under ordinary physics, and the dragons have never explained it.',
    fact: 'Where Adonalsium was Shattered. Yolen is the only world canon places here, and it measures the cosmere: its gravity and its year are what scholars call standard.',
    wiki: 'Yolen', sources: ['Word of Brandon'] },
  { id: 'scadrian', name: 'Scadrian', sunColor: '#fbbf24', position: sys(-720, 340, 80), book: 'mistborn1', nebula: '#64748b',
    starDesc: 'A yellow star, much like the suns of Sel and Nalthis. Its third planet has been moved twice — once too close by a man holding a god\'s power, and once back by a god who had been a man.',
    fact: 'Scadrial, two gas giants the Nelazan named the Near and Far Eye, a comet belt and two dwarf planets past it. Only the first planet was built after the Shattering; the rest were Adonalsium\'s.',
    wiki: 'Scadrian system', sources: ['Arcanum Unbounded — Scadrian system', 'Mistborn Adventure Game'] },
  { id: 'rosharan', name: 'Rosharan', sunColor: '#eaf2ff', position: sys(620, -260, -40), book: 'stormlight', nebula: '#22d3ee',
    starDesc: 'A large white sun — smaller, all the same, than the red-orange one UTol and Komashi share.',
    aliases: 'Greater Roshar',
    fact: 'Thirteen planets: three terrestrial, then an asteroid belt, then ten gas giants named for the Vorin numerals. Khriss calls it the crowded one.',
    wiki: 'Rosharan system', sources: ['Arcanum Unbounded — Rosharan system', 'Wind and Truth'] },
  { id: 'selish', name: 'Selish', sunColor: '#fde68a', position: sys(180, 720, 120), book: 'elantris', nebula: '#818cf8',
    starName: 'Mashe',
    starDesc: 'A yellow star whose name holds the Aon Ashe — light. Sel names its sun the way it names everything else.',
    fact: 'Four planets and a dwarf world: Donne, Sel, an asteroid belt, Ky, Ralen, a comet belt, and one small body past the edge of it.',
    wiki: 'Selish system', sources: ['Elantris — Ars Arcanum', 'Arcanum Unbounded — Selish system'] },
  { id: 'nalthian', name: 'Nalthian', sunColor: '#fcd34d', position: sys(-850, -520, -90), book: 'warbreaker', nebula: '#f472b6',
    starDesc: 'A yellow star, one of the lights of the constellation called the Giver.',
    fact: 'Nalthis, a red gas giant and a small violet outer world — and both of the uninhabited ones are named like Returned. A comet belt marks the edge.',
    wiki: 'Nalthian system', sources: ['Arcanum Unbounded — Nalthian system'] },
  { id: 'taldainian', name: 'Taldain', sunColor: '#cfe0ff', position: sys(920, 450, 60), book: 'whitesand', nebula: '#fbbf24',
    starName: 'AisDa',
    starDesc: 'A blue-white supergiant. It holds both the Eye of Ridos and Taldain in its orbit, and it is what burns Dayside white.',
    fact: 'A binary. One planet, tidally locked at a point between the two stars, with a single moon crossing its twilight line pole to pole — and every bit of that arrangement was placed on purpose.',
    wiki: 'Taldain system', sources: ['Arcanum Unbounded — Taldain system', 'White Sand — Ars Arcanum'],
    companions: [{
      id: 'eye-of-ridos', name: 'The Eye of Ridos', color: '#f1f5f9', size: 0.42,
      // Twice Taldain's semi-major axis, and its omega and period to the
      // digit: the same ellipse scaled, so the planet sits forever on the
      // line between the two stars. That is the arrangement, not a
      // coincidence of the layout — Taldain rides a Lagrange point.
      orbit: { a: 28.6, e: 0.14, i: 0.0, omega: 4, period: 1 },
      shroud: '#94a3b8',
      fact: 'A faint white dwarf wrapped in a dense Particulate Ring. Darkside sees it as a dim eye that never sets, and every seven orbits of Nizh Da it pulses light and Investiture through the ring — which is what marks the Starcarved.',
      canon: C, sources: ['Arcanum Unbounded — Taldain system', 'White Sand — Ars Arcanum'],
    }] },
  { id: 'drominad', name: 'Drominad', sunColor: '#fef3c7', position: sys(-150, -780, -110), book: 'sixthofdusk', nebula: '#34d399',
    starDesc: 'Unnamed. Four worlds sit in its habitable zone with water the dominant feature on every one of them.',
    fact: 'Seven planets and an asteroid belt, numbered outward in the Eelakin fashion. Khriss counts three fully developed human societies here — more than any other system in the cosmere.',
    wiki: 'Drominad system', sources: ['Arcanum Unbounded — Drominad system'] },
  { id: 'threnodite', name: 'Threnodite', sunColor: '#f0846a', position: sys(1050, -650, 40), book: 'shadowsforsilence', nebula: '#44403c',
    starDesc: 'A red star. Under it the nights are dark enough that the Starbelt is the only thing people read the ground by.',
    fact: 'Four planets, most of them named for songs of mourning — and there used to be more. Odium and Ambition fought here and the missing worlds are the argument.',
    wiki: 'Threnodite system', sources: ['Arcanum Unbounded — Threnodite system', 'Wind and Truth'] },
  { id: 'lumar', name: 'Lumar', sunColor: '#fde68a', position: sys(420, -920, -70), book: 'tress', nebula: '#6ee7b7',
    starDesc: "Unnamed. Every day it passes behind one of the twelve moons, and that world calls the cool shade it throws a moonshadow.",
    fact: 'Canon does not name the system Lumar sits in. The planet and its twelve moons are the whole of what we are told.',
    wiki: 'Lumar', sources: ['Tress of the Emerald Sea'] },
  { id: 'canticle', name: 'Canticle', sunColor: '#f59e0b', position: sys(-480, 920, 150), book: 'sunlit', nebula: '#f59e0b',
    starDesc: 'A single, heavily Invested star. Its light does not merely burn the day side — it is what the whole ecology, and the sunhearts, run on.',
    fact: 'Whether anything else orbits this star is unknown. One tiny ringed planet is all the book gives us.',
    wiki: 'Canticle', sources: ['The Sunlit Man'] },
  { id: 'utol', name: 'UTol', sunColor: '#fb923c', position: sys(780, 720, -50), book: 'yumi', nebula: '#22d3ee',
    starDesc: 'A large red-orange sun, bigger than Roshar\'s and closer to the worlds that circle it.',
    fact: 'A double planet: UTol and Komashi swing around each other while the pair goes round the sun. From Komashi, UTol is the daystar — the one light the shroud never covered.',
    wiki: 'UTol system', sources: ['Yumi and the Nightmare Painter'] },
  { id: 'obrodai', name: 'Obrodai', sunColor: '#fcd34d', position: sys(-520, -280, 30), book: 'mistborn2', nebula: '#db2777',
    starDesc: 'Unnamed, unvisited on the page. Autonomy has claimed the world under it.',
    wiki: 'Physical Realm', sources: ['Oathbringer — the second letter'] },
  { id: 'vaxian', name: 'Vaxian', sunColor: '#fcd34d', position: sys(-1050, 850, 90), book: 'core', nebula: '#d8b4fe',
    starDesc: 'Unnamed. Vax is spoken of far more often than it is described, and its star not at all.',
    wiki: 'Physical Realm', sources: ['Word of Brandon'] },
  // Worlds canon names without placing. Their stars are ours; the worlds are
  // not. Each is badged on its own card.
  { id: 'dhatrian', nebulaScale: 0.55, name: 'Dhatrian', sunColor: '#fdba74', position: sys(-1000, 120, -140), book: 'mistborn2', nebula: '#fb7185',
    starDesc: 'Unnamed. Canon gives Dhatri a planetary network and no astronomy at all; this star is our placeholder for it.',
    fact: 'The aethers came from here. Where here is, the books do not say.',
    wiki: 'Dhatri', sources: ['The Lost Metal', 'Isles of the Emberdark'] },
  { id: 'apparatus', nebulaScale: 0.55, name: 'Apparatus', sunColor: '#a3a3a3', position: sys(300, 1050, 90), book: 'emberdark', nebula: '#94a3b8',
    starDesc: 'Unnamed. The Grand Apparatus keeps its sky to itself: sunlight there is a room you have to request.',
    fact: 'A planetary megastructure of moving rooms, run by Sleepless. No one aboard is told which star it goes round.',
    wiki: 'Grand Apparatus', sources: ['Isles of the Emberdark'] },
  { id: 'mythos', nebulaScale: 0.55, name: 'Mythos', sunColor: '#c4b5fd', position: sys(-300, -1150, 60), book: 'mistborn2', nebula: '#a78bfa',
    starDesc: 'Unnamed. Mythos is the off-world nickname; what its own people call the place, and its sun, we do not know.',
    fact: 'Kelsier named it to Harmony as a possible ally, and thought it the least likely of the three.',
    wiki: 'Physical Realm', sources: ['The Lost Metal'] },
  { id: 'rellamite', nebulaScale: 0.55, name: 'Rellamite', sunColor: '#86efac', position: sys(1150, 180, -90), book: 'elsecaller', nebula: '#4ade80',
    starDesc: 'Unnamed. A historian from that world told Jasnah about it in Shadesmar, where there are no stars to point at.',
    fact: 'Rellam has no gods — Tyvneri had to leave it to learn the word.',
    wiki: 'Physical Realm', sources: ['Elsecaller'] },
  { id: 'bjendal', nebulaScale: 0.55, name: 'Bjendal', sunColor: '#fbbf24', position: sys(220, -520, 110), book: 'mistborn2', nebula: '#fcd34d',
    starDesc: 'Unnamed. The Ghostbloods count Bjendal one of their primary systems, which tells you they can reach it and not what it looks like.',
    fact: 'In 348 PC the Cognitive road to Bjendal closed, and the Ghostbloods do not know why either.',
    wiki: 'Physical Realm', sources: ['The Lost Metal'] },
];

const cited = (book: string, sources: string[], canon: 'canon' | 'wob' | 'speculation' = C) =>
  ({ canon, sources: sources.length ? sources : [book] });

export const BODIES: Body[] = [
  { id: 'yolen', name: 'Yolen', system: 'yolish', book: 'core', kind: 'shardworld', color: '#fefce8',
    orbit: { a: 9.2, e: 0.05, i: 0.02, omega: 0.2, period: 0.28 }, radius: 1.55,
    shards: ['adonalsium'], magic: ['yolish-lightweaving'], species: ['Humans', 'Dragons', 'Sho Del'],
    locations: 'Fain Life regions', biome: 'yolen', hasSurface: true,
    fact: 'The original homeworld of humanity and the birthplace of the sixteen Vessels who Shattered Adonalsium.',
    bio: 'Yolen had three peoples — humans, dragons, and Sho Del — and two biologies, ordinary and fain, which do not mix. Adonalsium was Shattered here. Hoid and Frost still argue about whether that was a mercy. Most of what the journal knows of the planet is from letters, not from a map.',
    wiki: 'Yolen', see: ['adonalsium', 'hoid', 'frost', 'sho-del'],
    ...cited('core', ['Arcanum Unbounded', 'Word of Brandon']) },
  { id: 'scadrial', name: 'Scadrial', system: 'scadrian', book: 'mistborn1', kind: 'shardworld', color: '#77aaff',
    orbit: { a: 16.4, e: 0.15, i: 0.04, omega: 1.2, period: 1 }, radius: 1.22,
    shards: ['preservation', 'ruin'], magic: ['allomancy', 'feruchemy', 'hemalurgy'],
    species: ['Humans', 'Kandra', 'Koloss'], locations: 'Luthadel, Elendel',
    biome: 'scadrial-ash', hasSurface: true,
    fact: 'A world literally constructed by its Shards, originally suffering under ashfalls before being reformed.',
    bio: 'Preservation and Ruin made Scadrial together, then spent an age fighting over it. The Lord Ruler moved the planet too close to the sun and buried the difference in ash. Sazed put it back. The Basin is the garden that grew in the wreckage; the south built a different civilisation under ice, and now they have met. Harmony holds both Shards and can rarely act. Autonomy has noticed.',
    wiki: 'Scadrial', see: ['preservation', 'ruin', 'harmony', 'luthadel', 'elendel'],
    // The one world the Shards built from scratch after the Shattering.
    // Aagal Nod and Aagal Uch were Adonalsium's; we do not draw them, so the
    // labelled Scadrian system waits with this planet. Coppermind: Scadrian system.
    eraMin: 1,
    ...cited('mistborn1', ['Mistborn Era 1']) },
  // The rest of the Scadrian system was Adonalsium's, and the Nelazan had
  // names for the two big ones long before the Final Empire buried the sky.
  { id: 'aagal-nod', name: 'Aagal Nod', system: 'scadrian', book: 'mistborn1', kind: 'gas-giant', color: '#5b8ad6',
    orbit: { a: 26, e: 0.04, i: 0.02, omega: 2.4, period: 0.34 }, radius: 1.5,
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    aliases: 'the Near Eye',
    fact: 'A blue gas giant with at least six moons — the largest planet in the Scadrian system.',
    bio: 'The Nelazan of Classical Scadrial called it the Near Eye. They were an astronomically-minded people, and their names for these two outlived them — which is more than most of Classical Scadrial managed under the ash.',
    wiki: 'Aagal Nod', see: ['scadrial', 'aagal-uch'],
    ...cited('mistborn1', ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']),
    fieldNotes: { name: { canon: C, note: 'The chart gives the planet; the Nelazan name comes from the Mistborn Adventure Game, which Brandon has approved as canon.' } } },
  { id: 'aagal-uch', name: 'Aagal Uch', system: 'scadrian', book: 'mistborn1', kind: 'gas-giant', color: '#d06a52',
    orbit: { a: 34, e: 0.05, i: 0.03, omega: 5.1, period: 0.24 }, radius: 1.38,
    rings: { inner: 1.6, outer: 2.42, color: '#ffd2ac', color2: '#a8663a' },
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    aliases: 'the Far Eye',
    fact: 'A red gas giant with a ring system and at least five moons. The comet belt begins past it.',
    bio: 'The Far Eye, to the Nelazan. Between the two Eyes and the comet belt, most of the Scadrian system is older than the world Preservation and Ruin built at the front of it.',
    wiki: 'Aagal Uch', see: ['scadrial', 'aagal-nod'],
    ...cited('mistborn1', ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']),
    fieldNotes: { name: { canon: C, note: 'The chart gives the planet; the Nelazan name comes from the Mistborn Adventure Game, which Brandon has approved as canon.' } } },
  { id: 'scadrian-dwarf-near', name: 'Scadrian dwarf planet I', system: 'scadrian', book: 'mistborn1', kind: 'dwarf-planet', color: '#b8c0cc',
    orbit: { a: 46, e: 0.19, i: 0.14, omega: 1.1, period: 0.14 }, radius: 0.34,
    shards: [], magic: [], species: [], locations: 'Beyond the comet belt', biome: 'barren', hasSurface: false,
    fact: 'One of two dwarf planets outside the Scadrian comet belt. The chart draws them; nobody has named them.',
    ...cited('mistborn1', ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']),
    fieldNotes: { name: { canon: S, note: 'Canon gives two dwarf planets out past the comet belt and no names for either. The numerals are ours.' } } },
  { id: 'scadrian-dwarf-far', name: 'Scadrian dwarf planet II', system: 'scadrian', book: 'mistborn1', kind: 'dwarf-planet', color: '#9fa8b5',
    orbit: { a: 49.5, e: 0.24, i: 0.18, omega: 4.4, period: 0.12 }, radius: 0.3,
    shards: [], magic: [], species: [], locations: 'Beyond the comet belt', biome: 'barren', hasSurface: false,
    fact: 'The outer of the two Scadrian dwarf planets, on a tilted, stretched orbit at the edge of the system.',
    ...cited('mistborn1', ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']),
    fieldNotes: { name: { canon: S, note: 'Canon gives two dwarf planets out past the comet belt and no names for either. The numerals are ours.' } } },
  { id: 'ashyn', name: 'Ashyn', system: 'rosharan', book: 'stormlight', kind: 'planet', color: '#fcd34d',
    orbit: { a: 10.2, e: 0.12, i: 0.03, omega: 1.5, period: 1.35 }, radius: 0.88,
    shards: [], magic: [], species: ['Humans'], locations: 'Floating Cities',
    biome: 'ashyn', hasSurface: true,
    fact: 'The original human homeworld in the Rosharan system, devastated by an ancient cataclysm via Surgebinding.',
    ...cited('stormlight', ['The Stormlight Archive']) },
  { id: 'roshar', name: 'Roshar', system: 'rosharan', book: 'stormlight', kind: 'shardworld', color: '#22d3ee',
    orbit: { a: 20.4, e: 0.08, i: 0.02, omega: -0.5, period: 0.85 }, radius: 1.32,
    shards: ['honor', 'cultivation', 'odium'], magic: ['surgebinding', 'voidbinding'],
    species: ['Humans', 'Singers', 'Spren', 'Aimians'], locations: 'Urithiru, Shattered Plains',
    biome: 'roshar', hasSurface: true,
    fact: 'A supercontinent battered by massive, magical Highstorms. Life here has adapted with carapace and shells.',
    bio: 'Honor, Cultivation and Odium all Invested here. Highstorms cross east to west carrying Stormlight; the Everstorm now crosses the other way. Singers were the first people; humans came from Ashyn as refugees and became the Vorin kingdoms, Shinovar, Azir, and the rest. The Knights Radiant fell once. They are back. After the Contest, Honor and Odium sit in one hand as Retribution.',
    wiki: 'Roshar', see: ['honor', 'cultivation', 'odium', 'urithiru', 'highstorm'],
    ...cited('stormlight', ['The Stormlight Archive']) },
  { id: 'braize', name: 'Braize', system: 'rosharan', book: 'stormlight', kind: 'shardworld', color: '#f87171',
    orbit: { a: 32.5, e: 0.18, i: 0.08, omega: 3.1, period: 0.41 }, radius: 1.05,
    shards: ['odium'], magic: ['voidbinding'], species: ['Fused', 'Voidspren'], locations: 'Damnation',
    biome: 'braize', hasSurface: true,
    fact: 'A harsh, cold, barren planet. It serves as the prison for the Fused between Desolations.',
    bio: 'Odium\'s seat in the system, and the cell of the Oathpact. Between Desolations the Fused are trapped here, and the Heralds with them. Vorin people call it Damnation and they are not wrong. Taln held the door alone for four thousand years.',
    wiki: 'Braize', see: ['odium', 'oathpact', 'taln', 'fused'],
    ...cited('stormlight', ['The Stormlight Archive']) },
  ...gasGiant('jes', 'Jes', 37.5, '#3b82f6', 0.18, 0),
  ...gasGiant('nan', 'Nan', 39.2, '#4ade80', 0.16, 0.5),
  ...gasGiant('chach', 'Chach', 40.8, '#f87171', 0.14, 1),
  ...gasGiant('vev', 'Vev', 42.5, '#fbbf24', 0.12, 1.5),
  ...gasGiant('palah', 'Palah', 44.2, '#a855f7', 0.1, 2),
  ...gasGiant('shash', 'Shash', 45.8, '#ef4444', 0.09, 2.5),
  ...gasGiant('betab', 'Betab', 47.5, '#22d3ee', 0.08, 3),
  ...gasGiant('kak', 'Kak', 49.2, '#fcd34d', 0.07, 3.5),
  ...gasGiant('tanat', 'Tanat', 50.8, '#fb923c', 0.06, 4),
  ...gasGiant('ishi', 'Ishi', 52.5, '#9ca3af', 0.05, 4.5),
  { id: 'donne', name: 'Donne', system: 'selish', book: 'elantris', kind: 'planet', color: '#8b5e83',
    orbit: { a: 11, e: 0.07, i: 0.03, omega: 2.8, period: 1.6 }, radius: 0.62,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    aliases: 'Doo',
    fact: 'The planet closest to Mashe. Inside the habitable zone and barren anyway — too warm, and swept by terrible dust storms.',
    bio: 'Sel names most things twice, once in each of two tongues, and its innermost neighbour is Donne on one chart and Doo on the other. Nothing lives there, so far as anyone has said.',
    wiki: 'Donne', see: ['sel'],
    ...cited('elantris', ['Arcanum Unbounded — Selish system']) },
  { id: 'sel', name: 'Sel', system: 'selish', book: 'elantris', kind: 'shardworld', color: '#a78bfa',
    orbit: { a: 17.9, e: 0.06, i: 0.03, omega: 0.8, period: 0.92 }, radius: 1.28,
    shards: ['devotion', 'dominion'], magic: ['aondor', 'forgery'],
    species: ['Humans', 'Seons', 'Skaze'], locations: 'Elantris, Rose Empire',
    biome: 'sel', hasSurface: true,
    fact: 'Magic here is deeply tied to geography and form. The Shards here were shattered by Odium.',
    bio: 'Odium Splintered Devotion and Dominion and stuffed their power into the Cognitive Realm, where it became the Dor — a riptide of Investiture keyed to nations and maps. AonDor, Forgery, Dakhor, ChayShan and Bloodsealing are all the same ocean, shaped by different coastlines. Elantris was a city of gods until the Chasm broke the Aon, and a prince redrew it.',
    wiki: 'Sel', see: ['devotion', 'dominion', 'dor', 'elantris-city', 'aondor'],
    ...cited('elantris', ['Elantris', 'Arcanum Unbounded — Sel essay']) },
  { id: 'ky', name: 'Ky', system: 'selish', book: 'elantris', kind: 'gas-giant', color: '#8f9ae0',
    orbit: { a: 30.5, e: 0.05, i: 0.02, omega: 0.4, period: 0.28 }, radius: 1.26,
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    aliases: 'Kii',
    fact: 'The first planet past the asteroid belt: a gas giant with four moons. Kii is the Aon for justice.',
    wiki: 'Ky', see: ['sel', 'ralen'],
    ...cited('elantris', ['Arcanum Unbounded — Selish system']) },
  { id: 'ralen', name: 'Ralen', system: 'selish', book: 'elantris', kind: 'gas-giant', color: '#d97fc4',
    orbit: { a: 38, e: 0.04, i: 0.02, omega: 3.6, period: 0.2 }, radius: 1.55,
    rings: { inner: 1.58, outer: 2.6, color: '#f6d7ef', color2: '#a3608f' },
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    aliases: 'Raa',
    fact: 'The largest planet in the Selish system — a ringed gas giant with five moons. The comet belt lies past it.',
    wiki: 'Ralen', see: ['sel', 'ky'],
    ...cited('elantris', ['Arcanum Unbounded — Selish system']) },
  { id: 'selish-dwarf', name: 'Selish dwarf planet', system: 'selish', book: 'elantris', kind: 'dwarf-planet', color: '#cbd5e1',
    orbit: { a: 51, e: 0.21, i: 0.16, omega: 5.6, period: 0.1 }, radius: 0.38,
    shards: [], magic: [], species: [], locations: 'Beyond the comet belt', biome: 'barren', hasSurface: false,
    fact: 'A small body just outside the comet belt, at the edge of the Selish system. The chart marks it; no one has named it.',
    ...cited('elantris', ['Arcanum Unbounded — Selish system']),
    fieldNotes: { name: { canon: S, note: 'The star chart shows an unnamed dwarf planet here. The label is ours.' } } },
  { id: 'nalthis', name: 'Nalthis', system: 'nalthian', book: 'warbreaker', kind: 'shardworld', color: '#f472b6',
    orbit: { a: 16.5, e: 0.09, i: 0.02, omega: 2.2, period: 1.05 }, radius: 1.18,
    shards: ['endowment'], magic: ['awakening'], species: ['Humans', 'Returned'],
    locations: 'Hallandren, Idris', biome: 'nalthis', hasSurface: true,
    fact: 'A vibrant world where magic runs on colour and fragments of souls known as BioChromatic Breaths.',
    bio: 'Endowment gives a Breath to every child and takes it back if they Return. Hallandren is colour and Returned gods and a God King who could not speak; Idris is grey cloth and a queen who was sent as a sacrifice. Nightblood was made here with a thousand Breaths and a Command no one had thought through. Vasher took the sword and left.',
    wiki: 'Nalthis', see: ['endowment', 'breath', 'ttelir', 'nightblood'],
    ...cited('warbreaker', ['Warbreaker']) },
  // Nalthis names its dead gods for what they were good at, and its planets
  // the same way. Both of the uninhabited ones are titled like Returned.
  { id: 'farkeeper', name: 'Farkeeper the Bright', system: 'nalthian', book: 'warbreaker', kind: 'gas-giant', color: '#e0674f',
    orbit: { a: 27, e: 0.05, i: 0.02, omega: 1.3, period: 0.33 }, radius: 1.52,
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    aliases: 'Farkeeper',
    fact: 'A red gas giant with at least six moons — the largest planet in the Nalthian system, and titled like one of the Returned.',
    wiki: 'Farkeeper the Bright', see: ['nalthis', 'nightstar'],
    ...cited('warbreaker', ['Arcanum Unbounded — Nalthian system']) },
  { id: 'nightstar', name: 'Nightstar the Hidden', system: 'nalthian', book: 'warbreaker', kind: 'planet', color: '#8b5cf6',
    orbit: { a: 39, e: 0.11, i: 0.06, omega: 4.7, period: 0.19 }, radius: 0.66,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    aliases: 'Nightstar',
    fact: 'A small violet world a long way out past Farkeeper, with the comet belt beyond it. Hallandren would have called that a good name for a god nobody sees.',
    wiki: 'Nightstar the Hidden', see: ['nalthis', 'farkeeper'],
    ...cited('warbreaker', ['Arcanum Unbounded — Nalthian system']) },
  { id: 'taldain', name: 'Taldain', system: 'taldainian', book: 'whitesand', kind: 'shardworld', color: '#fbbf24',
    orbit: { a: 14.3, e: 0.14, i: 0.0, omega: 4, period: 1 }, radius: 1.24,
    shards: ['autonomy'], magic: ['sand-mastery'], species: ['Humans'],
    locations: 'Dayside, Darkside', biome: 'taldain', hasSurface: true,
    fact: 'Tidally locked between a weak white dwarf and a blue-white supergiant. One side is a blistering desert; the other is perpetual night.',
    bio: 'Autonomy\'s world, and Khriss\'s. Dayside runs on white sand and water; Darkside runs on electric light under a black sky. The Diem of Sand Masters almost died in a massacre and Kenton would not let it. Khriss left, stole the Cosmere\'s scholarship, and never really went home.',
    wiki: 'Taldain', see: ['autonomy', 'khriss', 'sand-mastery', 'kezare'],
    ...cited('whitesand', ['White Sand']) },
  { id: 'first-of-the-sun', name: 'First of the Sun', system: 'drominad', book: 'sixthofdusk', kind: 'minor-shardworld', color: '#4ade80',
    orbit: { a: 13.5, e: 0.11, i: 0.05, omega: 5.1, period: 0.75 }, radius: 1.1,
    shards: ['autonomy'], magic: ['aviar'], species: ['Humans', 'Aviar'],
    locations: 'Pantheon Archipelago', biome: 'first-sun', hasSurface: true,
    aliases: 'Drominad',
    fact: 'A dangerous archipelago where magic is gained by bonding with telepathic birds.',
    ...cited('sixthofdusk', ['Sixth of the Dusk', 'Arcanum Unbounded']) },
  // Four worlds share this habitable zone and water is the dominant feature
  // on every one of them. Khriss counts three fully developed human
  // societies here — more than any system in the cosmere — and does not say
  // which three. The chart numbers them the Eelakin way; the people on them
  // have their own names, which we are not told.
  { id: 'second-of-the-sun', name: 'Second of the Sun', system: 'drominad', book: 'arcanum', kind: 'planet', color: '#38bdf8',
    orbit: { a: 19.2, e: 0.1, i: 0.04, omega: 0.5, period: 0.45 }, radius: 0.92,
    shards: [], magic: [], species: ['Humans'], locations: 'Unknown', biome: 'oceanic', hasSurface: true,
    fact: 'The second planet, smaller than First of the Sun — and one of the candidates for a human society of its own.',
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']),
    fieldNotes: { species: { canon: S, note: 'Khriss counts three fully developed human societies among the four habitable-zone worlds and does not say which three. Putting people on this one is our reading.' } } },
  { id: 'third-of-the-sun', name: 'Third of the Sun', system: 'drominad', book: 'arcanum', kind: 'planet', color: '#22d3ee',
    orbit: { a: 25, e: 0.08, i: 0.03, omega: 1.2, period: 0.3 }, radius: 0.78,
    shards: [], magic: [], species: ['Humans'], locations: 'Unknown', biome: 'oceanic', hasSurface: true,
    fact: 'The smallest planet in the Drominad system, and another of the three that may be inhabited.',
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']),
    fieldNotes: { species: { canon: S, note: 'Khriss counts three fully developed human societies among the four habitable-zone worlds and does not say which three. Putting people on this one is our reading.' } } },
  { id: 'fourth-of-the-sun', name: 'Fourth of the Sun', system: 'drominad', book: 'arcanum', kind: 'planet', color: '#5eead4',
    orbit: { a: 30.5, e: 0.07, i: 0.03, omega: 2.9, period: 0.24 }, radius: 1.02,
    rings: { inner: 1.5, outer: 2.2, color: '#cffafe', color2: '#5b8f99' },
    shards: [], magic: [], species: ['Humans'], locations: 'Unknown', biome: 'oceanic', hasSurface: true,
    fact: 'The last world in the habitable zone, and the only one of the four with a ring system. The asteroid belt begins past it.',
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']),
    fieldNotes: { species: { canon: S, note: 'Khriss counts three fully developed human societies among the four habitable-zone worlds and does not say which three. Putting people on this one is our reading.' } } },
  { id: 'fifth-of-the-sun', name: 'Fifth of the Sun', system: 'drominad', book: 'arcanum', kind: 'gas-giant', color: '#9fb8d8',
    orbit: { a: 42, e: 0.04, i: 0.02, omega: 0.8, period: 0.18 }, radius: 1.4,
    rings: { inner: 1.56, outer: 2.34, color: '#dbeafe', color2: '#7189ad' },
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    fact: 'The first gas giant past the asteroid belt: three major moons and a ring system.',
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']) },
  { id: 'sixth-of-the-sun', name: 'Sixth of the Sun', system: 'drominad', book: 'arcanum', kind: 'gas-giant', color: '#d8b56a',
    orbit: { a: 48, e: 0.03, i: 0.02, omega: 3.3, period: 0.15 }, radius: 1.58,
    rings: { inner: 1.6, outer: 2.5, color: '#fde9c8', color2: '#9c7a45' },
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    fact: 'The largest planet in the Drominad system — four major moons and a ring system.',
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']) },
  { id: 'seventh-of-the-sun', name: 'Seventh of the Sun', system: 'drominad', book: 'arcanum', kind: 'gas-giant', color: '#a8c4c0',
    orbit: { a: 53, e: 0.05, i: 0.03, omega: 5.4, period: 0.13 }, radius: 1.36,
    shards: [], magic: [], species: [], locations: 'Outer system', biome: 'gas', hasSurface: false,
    fact: 'The outermost planet of the Drominad system, with four major moons and no ring.',
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']) },
  // Three of the four surviving planets and the system's only moon are named
  // for songs of mourning, which is not an accident: Odium and Ambition
  // fought here, other planets did not survive it, and the ones that did got
  // named afterwards.
  { id: 'monody', name: 'Monody', system: 'threnodite', book: 'shadowsforsilence', kind: 'planet', color: '#c88a63',
    orbit: { a: 7.6, e: 0.09, i: 0.04, omega: 3.9, period: 1.5 }, radius: 0.98,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'The planet closest to the red Threnodite sun. A monody is a poem lamenting one person\'s death.',
    wiki: 'Monody', see: ['threnody', 'elegy'],
    ...cited('shadowsforsilence', ['Arcanum Unbounded — Threnodite system']) },
  { id: 'elegy-planet', name: 'Elegy', system: 'threnodite', book: 'shadowsforsilence', kind: 'planet', color: '#9aa5b1',
    orbit: { a: 9.9, e: 0.07, i: 0.05, omega: 0.7, period: 1.05 }, radius: 1.0,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'The second planet, and the only body in the system with a moon — Coronach, named for the third part of a round of keening.',
    bio: 'Threnodites name for mourning and they take the habit with them: the exiles who fled to Canticle called their children Elegy, Contemplation, Compassion and Zeal, and this planet was already called Elegy before any of them were born.',
    wiki: 'Elegy (planet)', see: ['threnody', 'monody', 'coronach', 'elegy'],
    ...cited('shadowsforsilence', ['Arcanum Unbounded — Threnodite system']) },
  { id: 'threnody', name: 'Threnody', system: 'threnodite', book: 'shadowsforsilence', kind: 'shardworld', color: '#78716c',
    orbit: { a: 12.3, e: 0.25, i: 0.12, omega: 1, period: 0.68 }, radius: 1.05,
    shards: ['ambition'], magic: [], species: ['Humans', 'Shades'],
    locations: 'Forests of Hell', biome: 'threnody', hasSurface: true,
    fact: "A world scarred by a deadly clash between Odium and Ambition. Inhabitants follow strict Simple Rules to avoid deadly Cognitive shadows.",
    ...cited('shadowsforsilence', ['Shadows for Silence', 'Arcanum Unbounded — Threnody essay']) },
  { id: 'purity', name: 'Purity', system: 'threnodite', book: 'shadowsforsilence', kind: 'planet', color: '#e8e4d8',
    orbit: { a: 30, e: 0.06, i: 0.03, omega: 2.2, period: 0.2 }, radius: 1.62,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'The outermost world of the system, far beyond the other three and much larger than any of them. Nazh swears by Purity\'s Eye.',
    bio: 'The odd one out twice over: the only name here that is not a song of mourning, and the only planet that does not keep close company with the rest. Whatever the Eye is, it is on the swearing end of a Rosharan glyph page and nowhere else.',
    wiki: 'Purity', see: ['threnody', 'monody', 'elegy'],
    ...cited('shadowsforsilence', ['Arcanum Unbounded — Threnodite system', 'Alethi glyph page']),
    fieldNotes: { kind: { canon: S, note: 'Canon gives Purity size and distance, not composition. We draw it as a big cold rock.' } } },
  // Adonalsium-era worlds. Named places and later civilisations wait on the
  // playhead; the planets do not. Coppermind: most worlds existed and were
  // named before the Shattering. Canticle and its sun were likely his too
  // (WoB 16261). UTol is a Sho Del world — that species is as old as Yolen.
  { id: 'lumar-world', name: 'Lumar', system: 'lumar', book: 'tress', kind: 'planet', color: '#67e8f9',
    orbit: { a: 13.2, e: 0.04, i: 0.01, omega: 0.3, period: 0.81 }, radius: 1.2,
    shards: [], magic: ['aether'], species: ['Humans'],
    locations: 'Emerald Sea, Crimson Sea', biome: 'lumar', hasSurface: true,
    fact: 'The oceans are made of fluidizing aether spores falling from twelve geostationary moons.',
    ...cited('tress', ['Tress of the Emerald Sea']) },
  { id: 'canticle-world', name: 'Canticle', system: 'canticle', book: 'sunlit', kind: 'planet', color: '#f59e0b',
    orbit: { a: 7.9, e: 0.28, i: 0.06, omega: 2.5, period: 1.45 }, radius: 0.72,
    shards: [], magic: [], species: ['Humans', 'Charred'],
    locations: 'Hover-cities', biome: 'canticle', hasSurface: true,
    // Blue and gold, divided, and tilted well off the equator. They are not
    // decoration: they bounce Invested light onto the night side, and that
    // reflected light is what the plants — and the people planting them —
    // live on between one dawn and the next.
    rings: { inner: 1.7, outer: 2.85, color: '#bfe4ff', color2: '#e6b455', tilt: 0.42 },
    fact: 'The sun is so intense it melts the crust. Humanity survives in moving cities racing the dawn.',
    bio: 'A hundred miles of radius around an Invested iron core, which is the only reason something this small holds its shape and its rings at all. The rings carry the sun round to the dark side; the Charred and the sunhearts are what that light does to a body that stays out in it.',
    wiki: 'Canticle', see: ['sunhearts', 'sigzil'],
    ...cited('sunlit', ['The Sunlit Man']) },
  { id: 'utol-world', name: 'UTol', system: 'utol', book: 'yumi', kind: 'planet', color: '#bfdbfe',
    orbit: { a: 18.4, e: 0.05, i: 0.02, omega: 0.9, period: 0.88 }, radius: 1.12,
    shards: ['virtuosity'], magic: [], species: ['Sho Del'],
    locations: 'Unknown', biome: 'oceanic', hasSurface: true,
    aliases: 'the daystar',
    fact: 'A primary home of the four-armed Sho Del species.',
    bio: 'Ocean almost all the way round, with few enough islands that the Sho Del mostly live on boats. Nagadan astronomers watched it through telescopes and then from a hion-powered bus in orbit, and heard no radio at all. From the ground on Komashi it is the daystar — the one light that came through the shroud.',
    wiki: 'UTol', see: ['komashi', 'virtuosity', 'sho-del'],
    ...cited('yumi', ['Yumi and the Nightmare Painter']) },
  // A double planet. The two of them swing around each other and the pair
  // goes round the red-orange sun, which is why each hangs in the other's
  // sky — Komashi's orbit is measured from UTol rather than from the star.
  { id: 'komashi', name: 'Komashi', system: 'utol', book: 'yumi', kind: 'shardworld', color: '#67e8f9',
    orbitAround: 'utol-world',
    orbit: { a: 4.6, e: 0.04, i: 0.03, omega: 1.7, period: 3.2 }, radius: 1.14,
    shards: ['virtuosity'], magic: ['hion'], species: ['Humans', 'Nightmares'],
    locations: 'Torio, Kilahito', biome: 'komashi', hasSurface: true,
    fact: 'A world shrouded in darkness, powered by glowing magenta and cyan Hion lines.',
    ...cited('yumi', ['Yumi and the Nightmare Painter']) },
  { id: 'obrodai-world', name: 'Obrodai', system: 'obrodai', book: 'mistborn2', kind: 'minor-shardworld', color: '#db2777',
    orbit: { a: 11.2, e: 0.13, i: 0.05, omega: 3.5, period: 0.92 }, radius: 1.16,
    shards: ['autonomy'], magic: [], species: [], locations: 'Unknown', biome: 'oceanic', hasSurface: true,
    fact: 'Planet claimed by the Shard Autonomy. Home to a new female avatar of Autonomy.',
    ...cited('mistborn2', ['The Lost Metal']) },
  { id: 'vax', name: 'Vax', system: 'vaxian', book: 'core', kind: 'planet', color: '#d8b4fe',
    orbit: { a: 11.7, e: 0.22, i: 0.15, omega: 4.8, period: 0.9 }, radius: 0.98,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: true,
    fact: 'A highly restricted, mysterious planet. Confirmed lore indicates its magic system involves Initiation.',
    bio: 'Named in the Cosmere far more often than it is described — referenced in letters and by worldhoppers, never visited on the page. Treat any map that claims to place it, including this one, as speculative.',
    aliases: 'Vax',
    canon: 'wob', sources: ['Word of Brandon'],
    fieldNotes: { magic: { canon: 'wob', note: "Vax's magic ('Initiation') is known only from Word of Brandon." } } },
  // Named worlds with no chart. Canon gives these a name, a fact or two and
  // no system at all; the star each one sits at here is ours, and every card
  // says so. They are on the map because leaving a named world off it is a
  // worse lie than placing it badly.
  { id: 'dhatri', name: 'Dhatri', system: 'dhatrian', book: 'mistborn2', arc: 'tlm', kind: 'planet', color: '#2dd4bf',
    orbit: { a: 15.2, e: 0.07, i: 0.02, omega: 1.4, period: 0.94 }, radius: 1.22,
    shards: [], magic: [], species: ['Humans', 'Aethers'], locations: 'Twelve kingdoms',
    biome: 'oceanic', hasSurface: false,
    aliases: 'the land of the aethers',
    fact: 'The origin of the aethers — twelve primal beings worshipped as gods, one to each of the twelve kingdoms.',
    bio: 'A twelve-world, the way Roshar is a ten and Scadrial a sixteen. The Dhatrians hold that the aethers predate not just the Shattering but Adonalsium, that they made people to each think differently, and that the dead go back to them to think it over. Then something called the dark aether struck, and the world turned unfriendly to the Aetherbound. Its perpendicularity is gone too, so getting there is expensive now.',
    wiki: 'Dhatri', see: ['aether'],
    canon: C, sources: ['The Lost Metal', 'Isles of the Emberdark', 'Word of Brandon'],
    fieldNotes: { system: { canon: S, note: 'Canon names Dhatri and a Dhatrian Planetary Network, never its star. The placement is ours.' } } },
  { id: 'grand-apparatus', name: 'The Grand Apparatus', system: 'apparatus', book: 'emberdark', kind: 'planet', color: '#94a3b8',
    orbit: { a: 14.6, e: 0.05, i: 0.03, omega: 4.1, period: 0.86 }, radius: 1.15,
    shards: [], magic: [], species: ['Lawnark', 'Sleepless'], locations: 'Moving rooms',
    biome: 'barren', hasSurface: false,
    aliases: 'the Apparatus',
    fact: 'A planetary megastructure: thousands of communal rooms in constant motion, run by a central Invested mechanism.',
    bio: 'Ask the Apparatus for a bedroom and one arrives and adjoins the room you are in; ask for a window and you are carried to the perimeter. Nobody owns space, and nobody knows whether there is ground under it all, because the Sleepless who rule the place make leaving impossible. Its people believe they occupy their bodies the way they occupy a room — temporarily — and they are further ahead technologically than the outsiders who pity them.',
    wiki: 'Grand Apparatus', see: ['sleepless-hordes', 'invention'],
    canon: C, sources: ['Isles of the Emberdark'],
    fieldNotes: { system: { canon: S, note: 'Canon gives the Apparatus no star and no sky worth the name. The placement is ours.' } } },
  { id: 'mythos-world', name: 'Mythos', system: 'mythos', book: 'mistborn2', arc: 'tlm', kind: 'planet', color: '#a78bfa',
    orbit: { a: 13.8, e: 0.1, i: 0.04, omega: 2.6, period: 0.98 }, radius: 1.05,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'A world Kelsier named to Harmony as a possible ally, and thought the least likely of the three he listed.',
    bio: '"Mythos" is what the rest of the cosmere calls it; what its own people call it has not been said. Brandon has mentioned a series set there, which is the most anyone knows.',
    wiki: 'Physical Realm', see: ['kelsier', 'dhatri'],
    canon: C, sources: ['The Lost Metal'],
    fieldNotes: { system: { canon: S, note: 'No star, no system, no map. The placement is ours.' } } },
  { id: 'rellam', name: 'Rellam', system: 'rellamite', book: 'elsecaller', kind: 'planet', color: '#86efac',
    orbit: { a: 14.2, e: 0.08, i: 0.03, omega: 5.2, period: 0.91 }, radius: 1.1,
    shards: [], magic: [], species: ['Rellamites'], locations: 'Unknown', biome: 'oceanic', hasSurface: false,
    fact: 'A world with no gods, where Investiture is a curse on the people who carry it. Its people are green-skinned and live for centuries.',
    bio: 'Hwynn Tyvneri, a historian from Rellam, met Jasnah in Shadesmar and had to leave his own world before he learned the word "god". If he is typical of the place, Rellamites are long-lived and green-skinned — which is all we have.',
    wiki: 'Physical Realm', see: ['jasnah'],
    canon: C, sources: ['Elsecaller'],
    fieldNotes: { system: { canon: S, note: 'Named in a conversation in Shadesmar, where there are no stars to point at. The placement is ours.' } } },
  { id: 'bjendal-world', name: 'Bjendal', system: 'bjendal', book: 'mistborn2', arc: 'tlm', kind: 'planet', color: '#fbbf24',
    orbit: { a: 13.4, e: 0.09, i: 0.05, omega: 0.6, period: 1.02 }, radius: 1.02,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'One of the Ghostbloods\' primary systems. In 348 PC the Cognitive road to it was cut, and they do not know why.',
    bio: 'Bjendal is named as a system rather than as a place anyone describes: travel there was "completely upset", which made it the fourth primary system the Ghostbloods could not visit without extreme danger — Roshar, after Retribution, being another.',
    wiki: 'Physical Realm', see: ['ghostbloods'],
    canon: C, sources: ['The Lost Metal'],
    fieldNotes: { system: { canon: S, note: 'Canon calls Bjendal a system and never draws it. The world at the middle of it, and where it sits, are ours.' } } },
];

function gasGiant(id: string, name: string, a: number, color: string, period: number, omega: number): Body[] {
  return [{
    id, name, system: 'rosharan', book: 'stormlight', kind: 'gas-giant', color,
    orbit: { a, e: 0.03, i: 0.02, omega, period }, radius: 1.35 + (a - 40) * 0.04,
    shards: [], magic: [], species: [], locations: 'Outer System', biome: 'gas', hasSurface: false,
    fact: `A gas giant of the Rosharan system, named after the Vorin numeral ${name}.`,
    ...cited('stormlight', ['Arcanum Unbounded — Rosharan system']),
  }];
}

/**
 * Moons.
 *
 * Eight are named in canon: Roshar's Salas, Nomon and Mishim; Oem over Sel;
 * Rrendos over Nalthis; Nizh Da over Taldain; Coronach over Elegy; and First
 * of the First over First of the Sun. Everything else here is a *count* the
 * Arcanum star charts give without names — Ky's four, Ralen's five, the
 * Aagals' six and five, Farkeeper's six, and three, four and four around the
 * outer Drominad worlds — so those are numbered and each says on its card
 * that the numeral is ours.
 *
 * Lumar's twelve are the same bargain: twelve lunagrees, twelve seas, six
 * aethers named on the page.
 *
 * Three moons that used to be here are gone. Braize had an invented
 * companion and the Rosharan system has exactly three moons in canon; UTol
 * and Komashi had one each, and canon gives them something better — each
 * other. Roshar's fourth moon is not here either: it died and fell before
 * Honor arrived, and what is left of it is under the Shattered Plains.
 */
export const MOONS: Moon[] = [
  { id: 'salas', name: 'Salas', parent: 'roshar', book: 'stormlight', color: '#c084fc',
    orbit: { a: 2.4, e: 0.02, i: 0.04, omega: 0.1, period: 14.2 }, radius: 0.18,
    fact: 'Smallest and first to rise, violet and dim — the colour of Voidlight. Shin call her First Sister of the Three. The orbits are unstable on a cosmic timescale; they were placed, not born. A fourth moon died and fell before Honor arrived, its fragments under the Shattered Plains.',
    ...cited('stormlight', ['The Stormlight Archive', 'Coppermind: Roshar']) },
  { id: 'nomon', name: 'Nomon', parent: 'roshar', book: 'stormlight', color: '#bae6fd',
    orbit: { a: 3.15, e: 0.04, i: 0.03, omega: 1.2, period: 10.8 }, radius: 0.26,
    fact: 'Largest and brightest, pale blue like Stormlight. Shin Second Sister; singers call it Honor\'s Moon. Natanatan holds Nomon male, and Hoid\'s tale of Queen Tsa has their people from his light. All three complete two orbits a Rosharan day.',
    ...cited('stormlight', ['The Stormlight Archive', 'Rhythm of War']) },
  { id: 'mishim', name: 'Mishim', parent: 'roshar', book: 'stormlight', color: '#86efac',
    orbit: { a: 3.9, e: 0.06, i: 0.05, omega: 2.4, period: 8.5 }, radius: 0.21,
    fact: 'Last to rise, small and green — Lifelight\'s colour, Cultivation\'s. Shin Third Sister. Hoid tells how clever Mishim swapped with Queen Tsa to walk the ground, and how Natanatan got its blue skin.',
    ...cited('stormlight', ['The Stormlight Archive', 'Oathbringer']) },
  { id: 'oem', name: 'Oem', parent: 'sel', book: 'elantris', color: '#e0f2fe',
    orbit: { a: 2.8, e: 0.05, i: 0.04, omega: 1.1, period: 7.6 }, radius: 0.24,
    fact: "Sel's only moon. Named in Arcanum Unbounded's starchart; the page does not give it a myth the way Roshar's three have.",
    ...cited('elantris', ['Elantris', 'Arcanum Unbounded — Sel essay']) },
  { id: 'rrendos', name: 'Rrendos', parent: 'nalthis', book: 'warbreaker', color: '#e0f2fe',
    orbit: { a: 2.6, e: 0.03, i: 0.02, omega: 0.5, period: 9.3 }, radius: 0.22,
    fact: "Nalthis's moon. Endowment's world has one, named on the Nalthian starchart.",
    ...cited('warbreaker', ['Warbreaker', 'Arcanum Unbounded']) },
  { id: 'nizh-da', name: 'Nizh Da', parent: 'taldain', book: 'whitesand', color: '#cbd5e1',
    orbit: { a: 2.9, e: 0.08, i: 0.05, omega: 3.0, period: 12.1 }, radius: 0.23,
    fact: "Taldain's moon. On Dayside nobody looks up at it; on Darkside it is most of the sky they have.",
    ...cited('whitesand', ['White Sand', 'Arcanum Unbounded']) },
  ...lunagrees(),
  { id: 'coronach', name: 'Coronach', parent: 'elegy-planet', book: 'shadowsforsilence', color: '#b8c3cf',
    orbit: { a: 2.6, e: 0.05, i: 0.04, omega: 2.7, period: 10.2 }, radius: 0.21,
    fact: 'The only moon in the Threnodite system, over the second planet. A coronach is the third part of a round of keening — and Threnody itself, one orbit out, has no moon at all, which is why its nights are dark enough to need the Starbelt.',
    wiki: 'Threnodite system',
    ...cited('shadowsforsilence', ['Arcanum Unbounded — Threnodite system']) },
  { id: 'first-of-the-first', name: 'First of the First', parent: 'first-of-the-sun', book: 'sixthofdusk', color: '#d9f99d',
    orbit: { a: 2.5, e: 0.02, i: 0.03, omega: 2.2, period: 12.6 }, radius: 0.20,
    fact: 'The single moon of First of the Sun, numbered in the same Eelakin fashion as the planets. The Eelakin read the tides by it, and the tides are how you leave Patji alive.',
    wiki: 'First of the Sun',
    ...cited('sixthofdusk', ['Arcanum Unbounded — Drominad system', 'Isles of the Emberdark']) },
  // The moons the Arcanum charts draw and do not name. The counts are canon;
  // the numerals are ours, and every card says so.
  ...satellites('ky', 4, 'elantris', '#c7cbe8', ['Arcanum Unbounded — Selish system']),
  ...satellites('ralen', 5, 'elantris', '#efd0e6', ['Arcanum Unbounded — Selish system']),
  ...satellites('aagal-nod', 6, 'mistborn1', '#b9cbe8',
    ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']),
  ...satellites('aagal-uch', 5, 'mistborn1', '#e8bfae',
    ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']),
  ...satellites('farkeeper', 6, 'warbreaker', '#f0c3b6', ['Arcanum Unbounded — Nalthian system']),
  ...satellites('fifth-of-the-sun', 3, 'arcanum', '#cddbec', ['Arcanum Unbounded — Drominad system']),
  ...satellites('sixth-of-the-sun', 4, 'arcanum', '#ecdcb8', ['Arcanum Unbounded — Drominad system']),
  ...satellites('seventh-of-the-sun', 4, 'arcanum', '#cfe0dd', ['Arcanum Unbounded — Drominad system']),
];

/**
 * A gas giant's unnamed moons.
 *
 * The Arcanum star charts draw moons around Ky, Ralen, the two Aagals,
 * Farkeeper and the outer three of the Drominad worlds, and name none of
 * them. Drawing a bare planet where canon draws five moons is the same error
 * as inventing a sixth, so the count is honoured and each one carries a field
 * note saying the numeral is ours.
 */
function satellites(
  parent: string, count: number, book: string, color: string, sources: string[],
): Moon[] {
  // Declared in here rather than beside the table: `MOONS` calls this while
  // it is still being built, and a `const` at module scope below it would
  // still be in its dead zone.
  const NUMERAL = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const name = BODIES.find((b) => b.id === parent)?.name ?? parent;
  const rows: Moon[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `${parent}-${NUMERAL[i]!.toLowerCase()}`,
      name: `${name} ${NUMERAL[i]}`,
      parent,
      book,
      color,
      orbit: {
        a: 2.15 + i * 0.46,
        e: 0.02 + (i % 3) * 0.015,
        i: 0.02 + (i % 4) * 0.02,
        omega: (i / count) * Math.PI * 2 + 0.4,
        period: 13 - i * 1.15,
      },
      radius: 0.12 + ((i * 7) % 5) * 0.018,
      fact: `One of ${name}'s moons. The chart gives ${name} ${count} of them and names none.`,
      canon: C,
      sources,
      fieldNotes: {
        name: {
          canon: S,
          note: `Canon draws ${count} moons here and leaves them unnamed. The numeral is ours.`,
        },
      },
    });
  }
  return rows;
}

/**
 * Lumar's twelve geostationary moons. Each hangs over one sea and rains its
 * own aether spores into it — the lunagrees are why the seas are coloured and
 * why anything on that world is dangerous when wet.
 */
function lunagrees(): Moon[] {
  const named: [string, string, string, string][] = [
    ['verdant', 'Verdant Moon', '#34d399', 'Green spores over the Emerald Sea. Vines, instantly, wherever water finds them — which is how Tress learned what a sea can do.'],
    ['crimson', 'Crimson Moon', '#f43f5e', 'Red spores over the Crimson Sea. They grow enormous spikes, which turn out to be coral, and Xisis lives underneath them.'],
    ['midnight', 'Midnight Moon', '#374151', 'Black spores over the Midnight Sea. Midnight Essence takes the shape of whatever is nearest and lets someone else look out through it.'],
    ['zephyr', 'Zephyr Moon', '#93c5fd', 'Blue spores over the Sapphire Sea. They make air, violently, which is the only reason ships cross anything at all.'],
    ['sunlight', 'Sunlight Moon', '#fde047', 'Gold spores over the sea nobody on the page names. Fire waiting for water — sailors carry them and hate carrying them.'],
    ['roseite', 'Roseite Moon', '#fbcfe8', 'Pink-red spores over the Rose Sea. Roseite sets into crystal hard enough to patch a hull, and Silajana is the aether behind it.'],
  ];
  const rows: Moon[] = [];
  for (let i = 0; i < 12; i++) {
    const row = named[i];
    const a = 2.1 + (i % 4) * 0.42;
    const omega = (i / 12) * Math.PI * 2;
    rows.push(row
      ? {
        id: `lumar-${row[0]}`, name: row[1], parent: 'lumar-world', book: 'tress', color: row[2],
        orbit: { a, e: 0.01, i: 0.01, omega, period: 6 }, radius: 0.13,
        fact: row[3], ...cited('tress', ['Tress of the Emerald Sea']),
      }
      : {
        id: `lumar-lunagree-${i + 1}`, name: `Lunagree ${i + 1}`, parent: 'lumar-world', book: 'tress',
        color: ['#5f6b82', '#24c9b4', '#f07a2a', '#7c8cf5', '#d9c22a', '#ef77b4'][i % 6]!,
        orbit: { a, e: 0.01, i: 0.01, omega, period: 6 }, radius: 0.12,
        fact: 'One of the twelve. The count is canon; this one\'s aether is not named on the page, so neither is it here.',
        canon: S, sources: ['Tress of the Emerald Sea'],
      });
  }
  return rows;
}

/**
 * Belts.
 *
 * The Arcanum star charts draw these as plainly as they draw the planets —
 * rubble between Sel and Ky, between Braize and Jes and past Fourth of the
 * Sun; ice out past Aagal Uch, Ralen and Nightstar — and a system missing
 * its belt is a system drawn wrong. They are not bodies: no globe, no surface, no atlas
 * plate. The orrery draws each as the band of specks it is.
 */
export const BELTS: Belt[] = [
  { id: 'selish-asteroid-belt', name: 'Selish asteroid belt', system: 'selish', book: 'elantris',
    kind: 'asteroid', inner: 22, outer: 26.5, color: '#a98d78',
    fact: 'Rubble between Sel and Ky, dividing the two inner worlds from the two gas giants.',
    wiki: 'Selish system', see: ['sel', 'ky'],
    ...cited('elantris', ['Arcanum Unbounded — Selish system']) },
  { id: 'selish-comet-belt', name: 'Selish comet belt', system: 'selish', book: 'elantris',
    kind: 'comet', inner: 42.5, outer: 48, color: '#bfdbfe',
    fact: 'Ice beyond Ralen, at the edge of the system. One small dwarf planet sits just outside it.',
    wiki: 'Selish system', see: ['ralen', 'selish-dwarf'],
    ...cited('elantris', ['Arcanum Unbounded — Selish system']) },
  { id: 'scadrian-comet-belt', name: 'Scadrian comet belt', system: 'scadrian', book: 'mistborn1',
    kind: 'comet', inner: 38, outer: 43, color: '#cbd5e1',
    fact: 'Ice past the Far Eye, with two unnamed dwarf planets beyond it. Nobody under the ashfalls could see any of this.',
    wiki: 'Scadrian system', see: ['aagal-uch', 'scadrian-dwarf-near'],
    ...cited('mistborn1', ['Mistborn Adventure Game', 'Arcanum Unbounded — Scadrian system']) },
  { id: 'rosharan-asteroid-belt', name: 'Rosharan asteroid belt', system: 'rosharan', book: 'stormlight',
    kind: 'asteroid', inner: 33.6, outer: 36.4, color: '#a1887f',
    fact: 'The divide in Greater Roshar: three terrestrial worlds inside it, ten gas giants outside.',
    wiki: 'Rosharan system', see: ['braize', 'jes'],
    ...cited('stormlight', ['Arcanum Unbounded — Rosharan system', 'Wind and Truth']) },
  { id: 'nalthian-comet-belt', name: 'Nalthian comet belt', system: 'nalthian', book: 'warbreaker',
    kind: 'comet', inner: 43, outer: 48, color: '#dbeafe',
    fact: 'Ice past Nightstar, marking the edge of the Nalthian system.',
    wiki: 'Nalthian system', see: ['nightstar'],
    ...cited('warbreaker', ['Arcanum Unbounded — Nalthian system']) },
  { id: 'drominad-asteroid-belt', name: 'Drominad asteroid belt', system: 'drominad', book: 'arcanum',
    kind: 'asteroid', inner: 34, outer: 38.5, color: '#9c8a74',
    fact: 'Rubble past Fourth of the Sun, between the four water worlds and the three gas giants.',
    wiki: 'Drominad system', see: ['fourth-of-the-sun', 'fifth-of-the-sun'],
    ...cited('arcanum', ['Arcanum Unbounded — Drominad system']) },
];

export const WORLD_EPOCHS: Record<string, WorldEpoch[]> = {
  yolish: [
    { era: 0, date: 'Pre-Shattering — Adonalsium intact', canon: C },
    { era: 1, date: 'Post-Shattering — the dragons remain on Yolen', canon: C },
  ],
  scadrian: [
    { era: 1, date: 'Pre-Ascension Scadrial', canon: S },
    { era: 2, date: "The Final Empire — the Lord Ruler's reign", canon: C },
    { era: 3, date: 'Post-Catacendre band — alignment with Roshar is approximate', canon: S },
    { era: 4, date: '~341 years after the Catacendre (Wax & Wayne)', canon: C },
    { era: 5, date: 'Scadrian space age', canon: S },
  ],
  rosharan: [
    { era: 1, date: 'The Heraldic Epochs — the Desolations', canon: S },
    { era: 2, date: 'After the Recreance', canon: S },
    { era: 3, date: '1173–1175, Vorin calendar — the True Desolation', canon: C },
    { era: 4, date: 'After Wind and Truth — the ten-year cold war', canon: S },
    { era: 5, date: 'Rosharan space age', canon: S },
  ],
  selish: [{ era: 2, date: 'Elantris era — early post-Shattering band', canon: S }],
  nalthian: [
    { era: 2, date: 'Warbreaker era', canon: S },
    { era: 3, date: 'After Warbreaker (relative order only)', canon: S },
  ],
  taldainian: [{ era: 2, date: 'White Sand era', canon: S }],
  threnodite: [
    { era: 1, date: "After Ambition's death scarred the system", canon: C },
    { era: 2, date: 'Shadows for Silence era — placement uncertain', canon: S },
  ],
  drominad: [
    { era: 4, date: 'Sixth of the Dusk — Cosmere space age', canon: S },
    { era: 5, date: 'Sixth of the Dusk — Cosmere space age', canon: S },
  ],
  lumar: [{ era: 4, date: 'Tress of the Emerald Sea — later-modern band', canon: S }],
  canticle: [{ era: 5, date: 'The Sunlit Man — far future', canon: S }],
  utol: [{ era: 4, date: 'Yumi and the Nightmare Painter — later-modern band', canon: S }],
  obrodai: [{ era: 4, date: "Autonomy's avatar world (Mistborn Era 2 band)", canon: S }],
  vaxian: [],
  dhatrian: [{ era: 4, date: 'After the dark aether — Dhatri closed to the Aetherbound', canon: S }],
  apparatus: [{ era: 5, date: 'Isles of the Emberdark — the space age', canon: S }],
  mythos: [],
  rellamite: [],
  bjendal: [{ era: 4, date: '348 PC — the Cognitive road to Bjendal closes', canon: C }],
};
