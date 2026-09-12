import type { Body, Era, Moon, Series, System, WorldEpoch } from './types.ts';

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
  'secrethistory', 'arcanum', 'tress', 'yumi', 'sunlit', 'emberdark',
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

export const SYSTEMS: System[] = [
  { id: 'yolish', name: 'Yolish', sunColor: '#fefce8', position: sys(0, 0, 0), book: 'core', nebula: '#fef3c7' },
  { id: 'scadrian', name: 'Scadrian', sunColor: '#fbbf24', position: sys(-720, 340, 80), book: 'mistborn1', nebula: '#64748b' },
  { id: 'rosharan', name: 'Rosharan', sunColor: '#bae6fd', position: sys(620, -260, -40), book: 'stormlight', nebula: '#22d3ee' },
  { id: 'selish', name: 'Selish', sunColor: '#a5b4fc', position: sys(180, 720, 120), book: 'elantris', nebula: '#818cf8' },
  { id: 'nalthian', name: 'Nalthian', sunColor: '#f472b6', position: sys(-850, -520, -90), book: 'warbreaker', nebula: '#f472b6' },
  { id: 'taldainian', name: 'Taldainian', sunColor: '#fcd34d', position: sys(920, 450, 60), book: 'whitesand', nebula: '#fbbf24' },
  { id: 'drominad', name: 'Drominad', sunColor: '#67e8f9', position: sys(-150, -780, -110), book: 'sixthofdusk', nebula: '#34d399' },
  { id: 'threnodite', name: 'Threnodite', sunColor: '#78716c', position: sys(1050, -650, 40), book: 'shadowsforsilence', nebula: '#44403c' },
  { id: 'lumar', name: 'Lumar', sunColor: '#6ee7b7', position: sys(420, -920, -70), book: 'tress', nebula: '#6ee7b7' },
  { id: 'canticle', name: 'Canticle', sunColor: '#f59e0b', position: sys(-480, 920, 150), book: 'sunlit', nebula: '#f59e0b' },
  { id: 'utol', name: 'UTol', sunColor: '#a1a1aa', position: sys(780, 720, -50), book: 'yumi', nebula: '#22d3ee' },
  { id: 'obrodai', name: 'Obrodai', sunColor: '#db2777', position: sys(-520, -280, 30), book: 'mistborn2', nebula: '#db2777' },
  { id: 'vaxian', name: 'Vaxian', sunColor: '#fcd34d', position: sys(-1050, 850, 90), book: 'core', nebula: '#d8b4fe' },
];

const cited = (book: string, sources: string[], canon: 'canon' | 'wob' | 'speculation' = C) =>
  ({ canon, sources: sources.length ? sources : [book] });

export const BODIES: Body[] = [
  { id: 'yolen', name: 'Yolen', system: 'yolish', book: 'core', kind: 'shardworld', color: '#fefce8',
    orbit: { a: 9.2, e: 0.05, i: 0.02, omega: 0.2, period: 0.28 }, radius: 1.55,
    shards: ['adonalsium'], magic: ['yolish-lightweaving'], species: ['Humans', 'Dragons', 'Sho Del'],
    locations: 'Fain Life regions', biome: 'yolen', hasSurface: true,
    fact: 'The original homeworld of humanity and the birthplace of the sixteen Vessels who Shattered Adonalsium.',
    ...cited('core', ['Arcanum Unbounded', 'Word of Brandon']) },
  { id: 'scadrial', name: 'Scadrial', system: 'scadrian', book: 'mistborn1', kind: 'shardworld', color: '#77aaff',
    orbit: { a: 16.4, e: 0.15, i: 0.04, omega: 1.2, period: 1 }, radius: 1.22,
    shards: ['preservation', 'ruin'], magic: ['allomancy', 'feruchemy', 'hemalurgy'],
    species: ['Humans', 'Kandra', 'Koloss'], locations: 'Luthadel, Elendel',
    biome: 'scadrial-ash', hasSurface: true,
    fact: 'A world literally constructed by its Shards, originally suffering under ashfalls before being reformed.',
    eraMin: 1,
    ...cited('mistborn1', ['Mistborn Era 1']) },
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
    ...cited('stormlight', ['The Stormlight Archive']) },
  { id: 'braize', name: 'Braize', system: 'rosharan', book: 'stormlight', kind: 'shardworld', color: '#f87171',
    orbit: { a: 32.5, e: 0.18, i: 0.08, omega: 3.1, period: 0.41 }, radius: 1.05,
    shards: ['odium'], magic: ['voidbinding'], species: ['Fused', 'Voidspren'], locations: 'Damnation',
    biome: 'braize', hasSurface: true,
    fact: 'A harsh, cold, barren planet. It serves as the prison for the Fused between Desolations.',
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
  { id: 'sel', name: 'Sel', system: 'selish', book: 'elantris', kind: 'shardworld', color: '#a78bfa',
    orbit: { a: 17.9, e: 0.06, i: 0.03, omega: 0.8, period: 0.92 }, radius: 1.28,
    shards: ['devotion', 'dominion'], magic: ['aondor', 'forgery'],
    species: ['Humans', 'Seons', 'Skaze'], locations: 'Elantris, Rose Empire',
    biome: 'sel', hasSurface: true,
    fact: 'Magic here is deeply tied to geography and form. The Shards here were shattered by Odium.',
    ...cited('elantris', ['Elantris', 'Arcanum Unbounded — Sel essay']) },
  { id: 'nalthis', name: 'Nalthis', system: 'nalthian', book: 'warbreaker', kind: 'shardworld', color: '#f472b6',
    orbit: { a: 16.5, e: 0.09, i: 0.02, omega: 2.2, period: 1.05 }, radius: 1.18,
    shards: ['endowment'], magic: ['awakening'], species: ['Humans', 'Returned'],
    locations: 'Hallandren, Idris', biome: 'nalthis', hasSurface: true,
    fact: 'A vibrant world where magic runs on colour and fragments of souls known as BioChromatic Breaths.',
    ...cited('warbreaker', ['Warbreaker']) },
  { id: 'taldain', name: 'Taldain', system: 'taldainian', book: 'whitesand', kind: 'shardworld', color: '#fbbf24',
    orbit: { a: 14.3, e: 0.14, i: 0.0, omega: 4, period: 1 }, radius: 1.24,
    shards: ['autonomy'], magic: ['sand-mastery'], species: ['Humans'],
    locations: 'Dayside, Darkside', biome: 'taldain', hasSurface: true,
    fact: 'Tidally locked between a weak white dwarf and a blue-white supergiant. One side is a blistering desert; the other is perpetual night.',
    ...cited('whitesand', ['White Sand']) },
  { id: 'first-of-the-sun', name: 'First of the Sun', system: 'drominad', book: 'sixthofdusk', kind: 'minor-shardworld', color: '#4ade80',
    orbit: { a: 13.5, e: 0.11, i: 0.05, omega: 5.1, period: 0.75 }, radius: 1.1,
    shards: ['autonomy'], magic: ['aviar'], species: ['Humans', 'Aviar'],
    locations: 'Pantheon Archipelago', biome: 'first-sun', hasSurface: true,
    fact: 'A dangerous archipelago where magic is gained by bonding with telepathic birds.',
    ...cited('sixthofdusk', ['Sixth of the Dusk', 'Arcanum Unbounded']) },
  { id: 'second-of-the-sun', name: 'Second of the Sun', system: 'drominad', book: 'arcanum', kind: 'planet', color: '#fb923c',
    orbit: { a: 19.2, e: 0.1, i: 0.04, omega: 0.5, period: 0.45 }, radius: 0.92,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'The second planet in the Drominad system.',
    ...cited('arcanum', ['Arcanum Unbounded']) },
  { id: 'third-of-the-sun', name: 'Third of the Sun', system: 'drominad', book: 'arcanum', kind: 'planet', color: '#9ca3af',
    orbit: { a: 25, e: 0.08, i: 0.03, omega: 1.2, period: 0.3 }, radius: 0.78,
    shards: [], magic: [], species: [], locations: 'Unknown', biome: 'barren', hasSurface: false,
    fact: 'The third planet in the Drominad system.',
    ...cited('arcanum', ['Arcanum Unbounded']) },
  { id: 'threnody', name: 'Threnody', system: 'threnodite', book: 'shadowsforsilence', kind: 'shardworld', color: '#78716c',
    orbit: { a: 12.3, e: 0.25, i: 0.12, omega: 1, period: 0.68 }, radius: 1.05,
    shards: ['ambition'], magic: [], species: ['Humans', 'Shades'],
    locations: 'Forests of Hell', biome: 'threnody', hasSurface: true,
    fact: "A world scarred by a deadly clash between Odium and Ambition. Inhabitants follow strict Simple Rules to avoid deadly Cognitive shadows.",
    ...cited('shadowsforsilence', ['Shadows for Silence', 'Arcanum Unbounded — Threnody essay']) },
  { id: 'lumar-world', name: 'Lumar', system: 'lumar', book: 'tress', kind: 'planet', color: '#67e8f9',
    orbit: { a: 13.2, e: 0.04, i: 0.01, omega: 0.3, period: 0.81 }, radius: 1.2,
    shards: [], magic: ['aether'], species: ['Humans'],
    locations: 'Emerald Sea, Crimson Sea', biome: 'lumar', hasSurface: true,
    fact: 'The oceans are made of fluidizing aether spores falling from twelve geostationary moons.',
    eraMin: 4,
    ...cited('tress', ['Tress of the Emerald Sea']) },
  { id: 'canticle-world', name: 'Canticle', system: 'canticle', book: 'sunlit', kind: 'planet', color: '#f59e0b',
    orbit: { a: 7.9, e: 0.28, i: 0.06, omega: 2.5, period: 1.45 }, radius: 0.72,
    shards: [], magic: [], species: ['Humans', 'Charred'],
    locations: 'Hover-cities', biome: 'canticle', hasSurface: true,
    fact: 'The sun is so intense it melts the crust. Humanity survives in moving cities racing the dawn.',
    eraMin: 5,
    ...cited('sunlit', ['The Sunlit Man']) },
  { id: 'utol-world', name: 'UTol', system: 'utol', book: 'yumi', kind: 'planet', color: '#a1a1aa',
    orbit: { a: 17.1, e: 0.05, i: 0.02, omega: 0.9, period: 0.88 }, radius: 1.12,
    shards: ['virtuosity'], magic: [], species: ['Sho Del'],
    locations: 'Unknown', biome: 'oceanic', hasSurface: true,
    fact: 'A primary home of the four-armed Sho Del species.',
    eraMin: 4,
    ...cited('yumi', ['Yumi and the Nightmare Painter']) },
  { id: 'komashi', name: 'Komashi', system: 'utol', book: 'yumi', kind: 'shardworld', color: '#67e8f9',
    orbit: { a: 19.6, e: 0.07, i: 0.03, omega: 1.7, period: 0.88 }, radius: 1.14,
    shards: ['virtuosity'], magic: ['hion'], species: ['Humans', 'Nightmares'],
    locations: 'Torio, Kilahito', biome: 'komashi', hasSurface: true,
    fact: 'A world shrouded in darkness, powered by glowing magenta and cyan Hion lines.',
    eraMin: 4,
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
    canon: 'wob', sources: ['Word of Brandon'],
    fieldNotes: { magic: { canon: 'wob', note: "Vax's magic ('Initiation') is known only from Word of Brandon." } } },
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
 * Moons. Roshar's three and the named moons of Sel, Nalthis and Taldain are
 * canon. Lumar's twelve are canon as a *count* — twelve lunagrees, twelve
 * seas — but only six aethers are named on the page, so the other six are
 * numbered and badged as speculation rather than given invented names.
 */
export const MOONS: Moon[] = [
  { id: 'salas', name: 'Salas', parent: 'roshar', book: 'stormlight', color: '#c084fc',
    orbit: { a: 2.4, e: 0.02, i: 0.04, omega: 0.1, period: 14.2 }, radius: 0.18,
    fact: 'The smallest and first of Roshar\'s moons to rise, violet and dim. Vorin tradition gives each moon a Herald; Salas is the withdrawn one.',
    ...cited('stormlight', ['The Stormlight Archive']) },
  { id: 'nomon', name: 'Nomon', parent: 'roshar', book: 'stormlight', color: '#bae6fd',
    orbit: { a: 3.15, e: 0.04, i: 0.03, omega: 1.2, period: 10.8 }, radius: 0.26,
    fact: 'The second and largest, pale blue and bright enough to read by. Said in Vorin myth to be Salas\' son.',
    ...cited('stormlight', ['The Stormlight Archive']) },
  { id: 'mishim', name: 'Mishim', parent: 'roshar', book: 'stormlight', color: '#86efac',
    orbit: { a: 3.9, e: 0.06, i: 0.05, omega: 2.4, period: 8.5 }, radius: 0.21,
    fact: 'The third, green and clever. The Natan story of how Mishim was tricked down to the ground is one Hoid tells.',
    ...cited('stormlight', ['The Stormlight Archive', 'Oathbringer']) },
  { id: 'oem', name: 'Oem', parent: 'sel', book: 'elantris', color: '#e0f2fe',
    orbit: { a: 2.8, e: 0.05, i: 0.04, omega: 1.1, period: 7.6 }, radius: 0.24,
    fact: "Sel's moon.", ...cited('elantris', ['Elantris', 'Arcanum Unbounded — Sel essay']) },
  { id: 'rrendos', name: 'Rrendos', parent: 'nalthis', book: 'warbreaker', color: '#e0f2fe',
    orbit: { a: 2.6, e: 0.03, i: 0.02, omega: 0.5, period: 9.3 }, radius: 0.22,
    fact: "Nalthis' moon.", ...cited('warbreaker', ['Warbreaker', 'Arcanum Unbounded']) },
  { id: 'nizh-da', name: 'Nizh Da', parent: 'taldain', book: 'whitesand', color: '#cbd5e1',
    orbit: { a: 2.9, e: 0.08, i: 0.05, omega: 3.0, period: 12.1 }, radius: 0.23,
    fact: "Taldain's moon. On Dayside nobody looks up at it; on Darkside it is most of the sky they have.",
    ...cited('whitesand', ['White Sand', 'Arcanum Unbounded']) },
  ...lunagrees(),
  { id: 'utol-moon-1', name: 'Anu', parent: 'utol-world', book: 'yumi', color: '#a1a1aa',
    orbit: { a: 2.7, e: 0.03, i: 0.04, omega: 1.5, period: 13 }, radius: 0.21,
    fact: 'A moon of UTol, the Sho Del world. Named here for the atlas; canon gives the moons but not their names.',
    canon: S, sources: ['Yumi and the Nightmare Painter', 'Word of Brandon'] },
  { id: 'komashi-moon', name: "Komashi's moon", parent: 'komashi', book: 'yumi', color: '#334155',
    orbit: { a: 2.6, e: 0.04, i: 0.03, omega: 4.2, period: 11.4 }, radius: 0.19,
    fact: 'Behind the shroud nobody on Komashi has seen it for generations. The machine that made the dark did not remove it.',
    canon: S, sources: ['Yumi and the Nightmare Painter'] },
  { id: 'first-sun-moon', name: "First of the Sun's moon", parent: 'first-of-the-sun', book: 'sixthofdusk', color: '#d9f99d',
    orbit: { a: 2.5, e: 0.02, i: 0.03, omega: 2.2, period: 12.6 }, radius: 0.20,
    fact: 'The Eelakin read the tides by it, and the tides are how you leave Patji alive.',
    canon: S, sources: ['Sixth of the Dusk'] },
  { id: 'braize-moon', name: "Braize's companion", parent: 'braize', book: 'stormlight', color: '#57534e',
    orbit: { a: 2.2, e: 0.10, i: 0.09, omega: 0.9, period: 15.5 }, radius: 0.14,
    fact: 'A cold rock over a colder world. Nothing in the text requires it; nothing forbids it either.',
    canon: S, sources: ['Word of Brandon'] },
];

/**
 * Lumar's twelve geostationary moons. Each hangs over one sea and rains its
 * own aether spores into it — the lunagrees are why the seas are coloured and
 * why anything on that world is dangerous when wet.
 */
function lunagrees(): Moon[] {
  const named: [string, string, string, string][] = [
    ['verdant', 'Verdant Moon', '#34d399', 'Green spores. Vines, instantly, wherever water finds them — which is how Tress learned what a sea can do.'],
    ['crimson', 'Crimson Moon', '#f43f5e', 'Roseite. It crystallises into hard pink structure, and it does not care what it grows through.'],
    ['midnight', 'Midnight Moon', '#374151', 'Midnight Essence. It takes a shape from whatever mind is nearest, and then it keeps it.'],
    ['zephyr', 'Zephyr Moon', '#93c5fd', 'Zephyr spores. They make air, violently, which is the only reason ships cross at all.'],
    ['sunlight', 'Sunlight Moon', '#fde047', 'Sunlight spores. Fire waiting for water. Sailors carry them and hate carrying them.'],
    ['roseite', 'Roseite Moon', '#fbcfe8', 'The rose aether, and the reason the Crimson is navigable at the edges.'],
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
};
