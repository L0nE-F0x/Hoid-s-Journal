import type { Character } from './types.ts';
import { PEOPLE_BIOS } from './peopleBios.ts';

const C = 'canon' as const;

function ch(
  id: string, name: string, color: string, book: string, origin: string,
  aliases: string, abilities: string, fact: string, cognitive: boolean,
  eras: Character['eras'],
  extra: Partial<Character> = {},
): Character {
  return { id, name, color, book, origin, aliases, abilities, fact, cognitive, eras, canon: C, sources: [book], ...extra };
}

export const CHARACTERS: Character[] = [
  ch('hoid', 'Hoid', '#ffffff', 'core', 'Yolen', 'Wit, Cephandrius, Midius, Dust, Topaz, Roamer, Drifter',
    'Yolish Lightweaving, Allomancy, Awakening, Fortune, Lightweaver (Design), AonDor, the Dawnshard Exist',
    'The ultimate worldhopper. Present in almost every major Cosmere event.', true, [
      { era: 0, system: 'yolish', body: 'yolen' },
      // In White Sand, hidden (WoB 5776). White Sand is the earliest book in time (WoB 10502).
      { era: 1, system: 'taldainian', body: 'taldain', book: 'whitesand', arc: 'ws1' },
      { era: 1, system: 'selish', body: 'sel', book: 'elantris', arc: 'elantris' },
      { era: 2, system: 'scadrian', body: 'scadrial', book: 'mistborn1', arc: 'tfe' },
      { era: 3, system: 'rosharan', body: 'roshar', book: 'stormlight', arc: 'twok' },
      // The Yomen–Ostlin wedding (The Alloy of Law ch. 4). Mistborn Era 2 falls
      // after Wind and Truth, which is where Hoid re-forms on Scadrial.
      { era: 4, system: 'scadrian', body: 'scadrial', book: 'mistborn2', arc: 'aol' },
      // After Scadrial, looking for Valor. Her temple in Kingseat burns him.
      // The first of his three, and straight after The Lost Metal.
      { era: 4, system: 'miralan', body: 'miral', at: 'kingseat', book: 'fod', arc: 'fod' },
      // A cursed deckhand on the Crow's Song, betting the Sorceress for AonDor.
      // Tress is post-Lost Metal (the kandra are loose); its exact place is not fixed.
      { era: 4, system: 'lumar', body: 'lumar-world', book: 'tress', arc: 'tress' },
      // Frozen as the Noodle Pupil's coatrack. Yumi is after The Sunlit Man
      // (WoB 16524). He is never on Canticle — Aux only pushes an illusion of
      // him along Sigzil's Connection.
      { era: 5, system: 'utol', body: 'komashi', at: 'kilahito', book: 'yumi', arc: 'yumi' },
    ], {
      wiki: 'Hoid', kind: 'person', titles: 'King\'s Wit, Court jester, storyteller',
      see: ['frost', 'sigzil', 'dawnshard', 'yolen', 'seventeenth-shard'],
      bio: 'Born on Yolen before the Shattering; one of the people who was there when Adonalsium died and who did not take a Shard. He collects magics the way other people collect scars — Lightweaving from home, Allomancy on Scadrial, Breath on Nalthis, a spren on Roshar — and he cannot hurt people, which he treats as an inconvenience and a joke. On Roshar he is Wit. The Shards call him Cephandrius. He is looking for someone, and he will not say who.',
      fieldNotes: { origin: { canon: 'canon', note: 'The Sunlit Man ch. 10 puts his birth on Yolen, before the Shattering.' } },
    }),
  ch('vin', 'Vin', '#77aaff', 'mistborn1', 'Scadrial', 'Valette Renoux',
    'Mistborn, Splinter of Preservation',
    'Ascended to become the vessel of Preservation.', false,
    [{ era: 2, system: 'scadrian', body: 'scadrial' }]),
  ch('kaladin', 'Kaladin', '#22d3ee', 'stormlight', 'Roshar', 'Stormblessed',
    'Windrunner Radiant',
    'A former surgeon turned leader of the Knights Radiant.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'rosharan', body: 'roshar' },
    ]),
  ch('shallan', 'Shallan', '#f472b6', 'stormlight', 'Roshar', 'Veil, Radiant',
    'Lightweaver Radiant',
    'A brilliant scholar grappling with deeply suppressed trauma.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'rosharan', body: 'roshar' },
    ]),
  ch('wax', 'Waxillium', '#fbbf24', 'mistborn2', 'Scadrial', 'Dawnshot',
    'Twinborn (Coinshot / Skimmer)',
    'A former lawman of the Roughs pulled back into politics.', false,
    [{ era: 4, system: 'scadrian', body: 'scadrial' }]),
  ch('jasnah', 'Jasnah', '#a78bfa', 'stormlight', 'Roshar', 'Heretic',
    'Elsecaller Radiant',
    'A fierce scholar and Queen of Alethkar.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'rosharan', body: 'roshar' },
    ]),
  ch('kelsier', 'Kelsier', '#ef4444', 'mistborn1', 'Scadrial', 'Survivor, Thaidakar, Lord of Scars, Survivor of Hathsin',
    'Mistborn, Cognitive Shadow',
    'Founder of the Ghostbloods. Bound strictly to the Scadrian system as a Shadow.', true, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      // Surviving The Final Empire is Secret History; leading the Bilming
      // Ghostbloods is The Lost Metal. Nothing places him in the space age.
      { era: 3, system: 'scadrian', body: 'scadrial', book: 'secrethistory', arc: 'secrethistory' },
      { era: 4, system: 'scadrian', body: 'scadrial', book: 'mistborn2', arc: 'tlm' },
    ], {
      wiki: 'Kelsier',
      see: ['vin', 'marsh', 'scadrial', 'kelsiers-crew'],
      // msh 6:4; mb6 epilogue (the Sovereign); mb7 36, 40, 47; sa4 115.
      bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He died at the Lord Ruler\'s hand and refused to finish dying: he held Preservation for a while, found his way back into a body with a spike through one eye, and saved the far south as its Sovereign. He founded the Ghostbloods to keep Scadrial safe from the rest of the cosmere; on Roshar they call him Thaidakar. He still cannot leave home.',
    }),
  ch('khriss', 'Khriss', '#a5b4fc', 'whitesand', 'Taldain', 'Khrissalla',
    'Worldhopper scholar',
    'Author of the Ars Arcanum essays. The Cosmere\'s foremost arcanist.', false, [
      { era: 1, system: 'taldainian', body: 'taldain' },
      // Scadrial's Cognitive Realm as Preservation dies (Secret History); New
      // Seran, 342 PC (The Bands of Mourning ch. 12); and by the Emberdark she is
      // "otherwise occupied on Taldain" (iote 30). Nothing puts her on Scadrial
      // in the Stormlight era or the space age.
      { era: 2, system: 'scadrian', body: 'scadrial', book: 'secrethistory', arc: 'secrethistory' },
      { era: 4, system: 'scadrian', body: 'scadrial', book: 'mistborn2', arc: 'bom' },
      { era: 5, system: 'taldainian', body: 'taldain', book: 'emberdark', arc: 'emberdark' },
    ]),
  ch('nazh', 'Nazh', '#78716c', 'arcanum', 'Threnody', 'Nazh, Nazrilof',
    'Worldhopper, mapmaker; a shade',
    'Khriss\'s agent and annotator of stolen maps.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 4, system: 'scadrian', body: 'scadrial' },
      // Dead, a shade, and the Dynamic's security officer by the space age.
      { era: 5, system: 'drominad', body: 'first-of-the-sun', book: 'emberdark', arc: 'emberdark' },
    ]),
  ch('galladon', 'Galladon', '#a78bfa', 'elantris', 'Sel', 'Grump',
    'Elantrian, worldhopper',
    'A Dula Elantrian; later one of three Seventeenth Shard agents hunting Hoid on Roshar.', false, [
      { era: 1, system: 'selish', body: 'sel' },
      { era: 3, system: 'rosharan', body: 'roshar', book: 'stormlight', arc: 'twok' },
    ], { fieldNotes: { fact: { canon: 'wob', note: 'Ishikk calls him Grump; that Grump is Galladon is Word of Brandon 7427, 10085.' } } }),
  ch('sigzil', 'Sigzil', '#f59e0b', 'stormlight', 'Roshar', 'Nomad, Zellion, the Sunlit Man, Sess Nassith Tor',
    'Windrunner, then Skybreaker; Skips between worlds; once carried a Dawnshard',
    'Hoid\'s apprentice. Far-future wanderer of The Sunlit Man.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'canticle', body: 'canticle-world', book: 'sunlit', arc: 'sunlit' },
    ]),
  ch('vasher', 'Vasher', '#a78bfa', 'warbreaker', 'Nalthis', 'Zahel, Kalad',
    'Returned, Awakener, Nightblood\'s creator',
    'Worldhopper hiding as an ardent on Roshar.', false, [
      { era: 2, system: 'nalthian', body: 'nalthis' },
      { era: 3, system: 'rosharan', body: 'roshar', book: 'stormlight', arc: 'wor' },
    ]),
  ch('azure', 'Azure', '#38bdf8', 'warbreaker', 'Nalthis', 'Vivenna',
    'Awakener, royal of Idris',
    'Vasher\'s student, then his travelling companion; later the Wall Guard\'s commander in Kholinar.', false, [
      { era: 2, system: 'nalthian', body: 'nalthis' },
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('demoux', 'Demoux', '#64748b', 'mistborn1', 'Scadrial', 'Thinker',
    'Seer, Seventeenth Shard field agent, worldhopper',
    'Kelsier\'s captain, then Elend\'s general; three centuries on, one of three Seventeenth Shard agents hunting Hoid on Roshar.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      { era: 3, system: 'rosharan', body: 'roshar', book: 'stormlight', arc: 'twok' },
    ], { fieldNotes: { fact: { canon: 'wob', note: 'Ishikk calls him Thinker; that Thinker is Demoux is Word of Brandon 6683.' } } }),
  ch('lift', 'Lift', '#86efac', 'stormlight', 'Roshar', 'Lift',
    'Edgedancer Radiant',
    'A thief who metabolizes food directly into Stormlight.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('szeth', 'Szeth', '#e2e8f0', 'stormlight', 'Roshar', 'Truthless, the Assassin in White',
    'Skybreaker Radiant, Nightblood',
    'Shin exile who reshaped Roshar\'s politics with a single Blade.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('sazed', 'Sazed', '#a3e635', 'mistborn1', 'Scadrial', 'Harmony',
    'Keeper, then Vessel of Harmony',
    'The Hero of Ages. Holds Preservation and Ruin together.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      { era: 3, system: 'scadrian', body: 'scadrial' },
      { era: 4, system: 'scadrian', body: 'scadrial' },
      { era: 5, system: 'scadrian', body: 'scadrial' },
    ]),
  ch('elend', 'Elend Venture', '#93c5fd', 'mistborn1', 'Scadrial', 'Emperor',
    'Mistborn (lerasium)',
    'Scholar-emperor of the New Empire.', false,
    [{ era: 2, system: 'scadrian', body: 'scadrial' }]),
  ch('marsh', 'Marsh', '#334155', 'mistborn1', 'Scadrial', 'Ironeyes',
    'Steel Inquisitor, Cognitive survivor',
    'Kelsier\'s brother; Death walking the Elendel Basin.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      { era: 4, system: 'scadrian', body: 'scadrial' },
    ]),
  ch('lord-ruler', 'The Lord Ruler', '#b45309', 'mistborn1', 'Scadrial', 'Rashek, Sliver of Infinity',
    'Compounding Fullborn',
    'Held Scadrial in ash for a thousand years.', false,
    [{ era: 2, system: 'scadrian', body: 'scadrial' }]),
  ch('tensoon', 'TenSoon', '#a8a29e', 'mistborn1', 'Scadrial', 'OreSeur (assumed)',
    'Kandra, Third Generation',
    'Vin\'s once-spy, later a voice of the kandra.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      { era: 4, system: 'scadrian', body: 'scadrial' },
    ]),
  ch('spook', 'Spook', '#fb923c', 'mistborn1', 'Scadrial', 'Lestibournes, Lord Mistborn',
    'Tineye, later Mistborn',
    'Survivor of the Flames; ancestor of Elendel\'s nobility.', false,
    [{ era: 2, system: 'scadrian', body: 'scadrial' }]),
  ch('wayne', 'Wayne', '#f59e0b', 'mistborn2', 'Scadrial', 'Wayne',
    'Twinborn (Slider / Bloodmaker)',
    'Hats, accents, and a goldmind. Wax\'s oldest friend.', false,
    [{ era: 4, system: 'scadrian', body: 'scadrial' }]),
  ch('marasi', 'Marasi Colms', '#38bdf8', 'mistborn2', 'Scadrial', 'Marasi',
    'Pulser, later Leecher',
    'Constable and scholar of the Basin.', false,
    [{ era: 4, system: 'scadrian', body: 'scadrial' }]),
  ch('steris', 'Steris Harms', '#94a3b8', 'mistborn2', 'Scadrial', 'Steris',
    'Lists, contingency, courage',
    'The most prepared person in Elendel.', false,
    [{ era: 4, system: 'scadrian', body: 'scadrial' }]),
  ch('melaan', 'MeLaan', '#d6d3d1', 'mistborn2', 'Scadrial', 'MeLaan',
    'Kandra, Seventh Generation',
    'Harmony\'s agent in a changing world.', false,
    [{ era: 4, system: 'scadrian', body: 'scadrial' }]),
  ch('dalinar', 'Dalinar', '#1d4ed8', 'stormlight', 'Roshar', 'Blackthorn, Bondsmith',
    'Bondsmith Radiant',
    'Highprince, then Bondsmith, then the man who refused Odium.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('adolin', 'Adolin Kholin', '#eab308', 'stormlight', 'Roshar', 'Adolin',
    'Shardbearer, later Maya\'s partner',
    'The best swordsman in Alethkar, and a better man than he believes.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('renarin', 'Renarin Kholin', '#67e8f9', 'stormlight', 'Roshar', 'Renarin',
    'Truthwatcher (corrupted)',
    'Sees what should not be seen.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('navani', 'Navani Kholin', '#c4b5fd', 'stormlight', 'Roshar', 'Navani',
    'Artifabrian, Bondsmith (Sibling)',
    'Scholar-queen of Urithiru.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('venli', 'Venli', '#a3e635', 'stormlight', 'Roshar', 'Last Listener',
    'Willshaper Radiant',
    'The sister who chose a different song.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('taravangian', 'Taravangian', '#f87171', 'stormlight', 'Roshar', 'Odium, Retribution',
    'Vessel of Odium, then Retribution',
    'The man who would save the world by destroying it.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 4, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'rosharan', body: 'roshar' },
    ]),
  ch('moash', 'Moash', '#57534e', 'stormlight', 'Roshar', 'Vyre',
    'Gravitation, Honorblade',
    'Bridge Four, then Odium\'s knife.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('rlain', 'Rlain', '#84cc16', 'stormlight', 'Roshar', 'Shen',
    'Truthwatcher (corrupted), Listener',
    'The spy who became family.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('teft', 'Teft', '#64748b', 'stormlight', 'Roshar', 'Teft',
    'Windrunner Radiant',
    'The sergeant who kept standing up.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('rock', 'Rock', '#fdba74', 'stormlight', 'Roshar', 'Lunamor',
    'Horneater, cook of Bridge Four',
    'A man who would not fight — until he had to.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('rysn', 'Rysn Ftori', '#a1a1aa', 'stormlight', 'Roshar', 'Dawnshard',
    'Dawnshard of Change',
    'Thaylen merchant who became something the Sleepless could not refuse.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('eshonai', 'Eshonai', '#4ade80', 'stormlight', 'Roshar', 'Last Listener',
    'Stormform, then Willshaper in death',
    'The sister who tried to save her people from a song.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('siri', 'Siri', '#f9a8d4', 'warbreaker', 'Nalthis', 'Vessel of Austrism\'s joke',
    'Queen of Hallandren',
    'The youngest daughter sent to marry a god.', false,
    [{ era: 2, system: 'nalthian', body: 'nalthis' }]),
  ch('susebron', 'Susebron', '#e879f9', 'warbreaker', 'Nalthis', 'God King',
    'Returned, Tenth Heightening',
    'A god who learned to write, then to speak.', true,
    [{ era: 2, system: 'nalthian', body: 'nalthis' }]),
  ch('lightsong', 'Lightsong', '#fb7185', 'warbreaker', 'Nalthis', 'Lightsong the Bold',
    'Returned',
    'The god who did not believe in his own divinity — and died proving it.', true,
    [{ era: 2, system: 'nalthian', body: 'nalthis' }]),
  ch('raoden', 'Raoden', '#a78bfa', 'elantris', 'Sel', 'Spirit',
    'Elantrian',
    'The prince who walked into the fallen city and drew the Chasm Line.', false,
    [{ era: 1, system: 'selish', body: 'sel' }]),
  ch('sarene', 'Sarene', '#818cf8', 'elantris', 'Sel', 'Sarene',
    'Teo princess, politician',
    'A woman who refused to be a widow to a living city.', false,
    [{ era: 1, system: 'selish', body: 'sel' }]),
  ch('hrathen', 'Hrathen', '#ef4444', 'elantris', 'Sel', 'Gyorn',
    'Dakhor-adjacent priest of Shu-Dereth',
    'The gyorn who chose a people over a conversion quota.', false,
    [{ era: 1, system: 'selish', body: 'sel' }]),
  ch('kenton', 'Kenton', '#fbbf24', 'whitesand', 'Taldain', 'Kenton',
    'Sand Master, Lord Mastrell',
    'The under-mastered Diemite who would not let his order die.', false,
    [{ era: 2, system: 'taldainian', body: 'taldain' }]),
  ch('yumi', 'Yumi', '#22d3ee', 'yumi', 'Komashi', 'Chosen, Honored One',
    'Yoki-hijo; Cognitive Shadow',
    'A stone-stacker whose life was a machine\'s lie.', false,
    [{ era: 5, system: 'utol', body: 'komashi' }]),
  ch('painter', 'Painter', '#67e8f9', 'yumi', 'Komashi', 'Nikaro',
    'Nightmare painter',
    'A slacker who learned to see what he was painting.', false,
    [{ era: 5, system: 'utol', body: 'komashi' }]),
  ch('tress', 'Tress', '#6ee7b7', 'tress', 'Lumar', 'Glorf',
    'Sprouter, cook, Luhel bond with Midnight Essence',
    'A girl who went to sea for a boy and stayed for herself.', false,
    [{ era: 4, system: 'lumar', body: 'lumar-world' }]),
  ch('charlie', 'Charlie', '#fcd34d', 'tress', 'Lumar', 'Huck',
    'Valet; passable storyteller and musician; terrible liar',
    'The boy Tress went to save.', false,
    [{ era: 4, system: 'lumar', body: 'lumar-world' }]),
  ch('shai', 'Shai', '#6366f1', 'emperorssoul', 'Sel', 'Wan ShaiLu',
    'Forger',
    'The woman who restamped an emperor — and herself.', false,
    [{ era: 1, system: 'selish', body: 'sel' }]),
  ch('silence', 'Silence Montane', '#78716c', 'shadowsforsilence', 'Threnody', 'Silence',
    'Shade-wise innkeeper',
    'She keeps the Simple Rules. The Forests do not.', false,
    [{ era: 2, system: 'threnodite', body: 'threnody' }]),
  ch('dusk', 'Sixth of the Dusk', '#4ade80', 'sixthofdusk', 'First of the Sun', 'Dusk, Sixth',
    'Trapper; Aviar-bonded (Sak, Kokerlii, then Rokke); Navigator',
    'A Patji trapper who paddled through Patji\'s Eye into the dark, came back the first Navigator in millennia, and bought his people their freedom with it.', false, [
      { era: 5, system: 'drominad', body: 'first-of-the-sun' },
    ]),
  // Both first appear in Words of Radiance.
  ch('mraize', 'Mraize', '#a3a3a3', 'stormlight', 'Roshar (Thaylenah)', 'Mraize',
    'Ghostblood, hunter, worldhopper',
    'Shallan\'s would-be master. A hunter who collects worlds like trophies.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { arc: 'wor', fieldNotes: { origin: { canon: 'wob', note: 'Thaylen by Word of Brandon 10403.' } } }),
  // She died in the Spiritual Realm in Wind and Truth (ch. 134): no later row.
  ch('iyatil', 'Iyatil', '#fb923c', 'stormlight', 'Silverlight', 'Iyatil',
    'Ghostblood, spy, worldhopper; an Elsecaller by an Enlightened inkspren',
    'Mraize\'s babsk among the Ghostbloods. The mask is a Hunter\'s; the errand was Thaidakar\'s.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { arc: 'wor', fieldNotes: { origin: { canon: 'wob', note: 'Born in Silverlight, of Southern Scadrian heritage — Word of Brandon 12733, 13475.' } } }),
  ch('felt', 'Felt', '#64748b', 'mistborn1', 'Scadrial', 'Felt',
    'Spy, scout, Awakener, worldhopper',
    'House Venture\'s spy on Scadrial; three centuries later a Kholin scout on Roshar, and a Ghostblood.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
      { era: 3, system: 'rosharan', body: 'roshar', book: 'stormlight', arc: 'wor' },
    ]),
  ch('design', 'Design', '#22d3ee', 'stormlight', 'Roshar', 'Design',
    'Cryptic, Lightweaver bond, some control of Connection',
    'Hoid\'s Cryptic. On Komashi she ran a noodle shop and used him as the coatrack.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
      // Yumi is after The Sunlit Man (WoB 16524).
      { era: 5, system: 'utol', body: 'komashi', at: 'kilahito', book: 'yumi', arc: 'yumi' },
    ], { kind: 'spren', wiki: 'Design', arc: 'oathbringer' }),
  ch('riina', 'Riina', '#a78bfa', 'tress', 'Sel', 'The Sorceress',
    'Elantrian, AonDor curses, Awakener, worldhopper',
    'An Elantrian of the Ire who landed a spaceship on Lumar and let the locals call it a tower.', false, [
      { era: 1, system: 'selish', body: 'sel' },
      { era: 4, system: 'lumar', body: 'lumar-world' },
    ]),
  ch('nikli', 'Nikli', '#a1a1aa', 'stormlight', 'Roshar', 'Nikli, Dysian Aimian',
    'Sleepless, hordeling swarm',
    'A Sleepless who tried to keep a Dawnshard off the board, and failed kindly.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('nightblood', 'Nightblood', '#111827', 'warbreaker', 'Nalthis', 'Sword-nimi',
    'Awakened sword, Destroy Evil',
    'A thousand Breaths in a blade. Vasher\'s, then Szeth\'s. It wants to help.', true, [
      { era: 2, system: 'nalthian', body: 'nalthis' },
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('lopen', 'Lopen', '#fbbf24', 'stormlight', 'Roshar', 'The Lopen',
    'Windrunner Radiant',
    'Herdazian, one-armed, then two. The universe is invited to his family.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('baon', 'Baon', '#b45309', 'whitesand', 'Taldain', 'Blunt',
    'Soldier, marksman, worldhopper',
    'Khriss\'s bodyguard on Dayside; later one of three Seventeenth Shard agents hunting Hoid on Roshar.', false, [
      // White Sand is the earliest book in time (WoB 10502), as Khriss's row has it.
      { era: 1, system: 'taldainian', body: 'taldain' },
      { era: 3, system: 'rosharan', body: 'roshar', book: 'stormlight', arc: 'twok' },
    ], { fieldNotes: { fact: { canon: 'wob', note: 'Ishikk calls him Blunt; that Blunt is Baon is Word of Brandon 9208, 5556. He is not Invested (WoB 1564).' } } }),
  ch('syl', 'Sylphrena', '#7dd3fc', 'stormlight', 'Roshar', 'Syl',
    'Honorspren, Windrunner bond',
    'Kaladin\'s spren. Ancient, loyal, and still learning what a joke is.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'spren', wiki: 'Sylphrena' }),
  ch('pattern', 'Pattern', '#c4b5fd', 'stormlight', 'Roshar', 'Pattern',
    'Cryptic, Lightweaver bond',
    'Shallan\'s spren of lies. He likes truths more than she does.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'spren', wiki: 'Pattern' }),
  ch('ivory', 'Ivory', '#1e1b4b', 'stormlight', 'Roshar', 'Ivory',
    'Inkspren, Elsecaller bond',
    'Jasnah\'s spren. Logic first, the Physical Realm second.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'spren', wiki: 'Ivory' }),
  ch('stormfather', 'The Stormfather', '#1e3a8a', 'stormlight', 'Roshar', 'Rider of Storms',
    'Cognitive Shadow of Honor, Bondsmith spren',
    'The highstorm given a mind. Dalinar\'s bond, and Tanavast\'s last voice.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'spren', wiki: 'Stormfather' }),
  ch('nightwatcher', 'The Nightwatcher', '#166534', 'stormlight', 'Roshar', 'Nightwatcher',
    'Splinter of Cultivation, boon and curse',
    'She grants what you ask and takes what she will. The Valley is hers.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'spren', wiki: 'Nightwatcher' }),
  ch('sibling', 'The Sibling', '#a7f3d0', 'stormlight', 'Roshar', 'Sibling',
    'Bondsmith spren of Urithiru',
    'Tower-spren, half Honor and half Cultivation. Navani woke them.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { arc: 'row', kind: 'spren', wiki: 'Sibling' }),
  ch('nale', 'Nale', '#0f172a', 'stormlight', 'Roshar', 'Nin, Herald of Justice',
    'Herald of the Skybreakers',
    'The only Herald still trying to keep an oath. It is not going well.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'herald', wiki: 'Nale' }),
  ch('taln', 'Taln', '#7f1d1d', 'stormlight', 'Roshar', 'Talenelat, Stonesinew',
    'Herald of War',
    'He held Braize alone for four thousand years. Then he broke, and did not.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'herald', wiki: 'Talenel' }),
  ch('ishar', 'Ishar', '#ca8a04', 'stormlight', 'Roshar', 'Tukiri, Herald of Luck',
    'Herald of the Bondsmiths',
    'Mad god-priest of Tukar. The Oathpact was his idea.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { kind: 'herald', wiki: 'Ishar' }),
  ch('gavilar', 'Gavilar Kholin', '#1d4ed8', 'stormlight', 'Roshar', 'King of Alethkar',
    'King, seeker of old powers',
    'United Alethkar. Died the night the Parshendi learned what a treaty costs.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('sadeas', 'Torol Sadeas', '#b91c1c', 'stormlight', 'Roshar', 'Highprince of Information',
    'Alethi highprince',
    'Dalinar\'s rival. The Tower, the plate, the betrayal.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ]),
  ch('evi', 'Evi Kholin', '#fde68a', 'stormlight', 'Roshar', 'Evi',
    'Riran, Dalinar\'s wife',
    'She asked him to be better. Rathalas answered.', false, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { arc: 'oathbringer' }),
  ch('maya', 'Mayalaran', '#86efac', 'stormlight', 'Roshar', 'Maya',
    'Deadeye cultivationspren',
    'Adolin\'s Shardblade, who is not as dead as the Recreance promised.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { arc: 'oathbringer', kind: 'spren', wiki: 'Mayalaran' }),
  ch('timbre', 'Timbre', '#4ade80', 'stormlight', 'Roshar', 'Timbre',
    'Lightspren, Willshaper bond',
    'Venli\'s spren, small enough to hide in a gemheart.', true, [
      { era: 3, system: 'rosharan', body: 'roshar' },
    ], { arc: 'oathbringer', kind: 'spren', wiki: 'Timbre' }),
  ch('telsin', 'Telsin Ladrian', '#e11d48', 'mistborn2', 'Scadrial', 'Lady Sequence, the Key, Trell',
    'Hemalurgic spikes; the Set\'s Key; avatar of Autonomy',
    'Wax\'s sister, the Set\'s Key, and for a little while Autonomy\'s avatar on Scadrial.', false, [
      { era: 4, system: 'scadrian', body: 'scadrial' },
    ], { arc: 'sos' }),
  ch('blushweaver', 'Blushweaver', '#fb7185', 'warbreaker', 'Nalthis', 'Blushweaver the Honest',
    'Returned',
    'A goddess of honesty who never wore enough clothing for the job.', false, [
      { era: 2, system: 'nalthian', body: 'nalthis' },
    ]),
  ch('denth', 'Denth', '#64748b', 'warbreaker', 'Nalthis', 'VaraTreledees',
    'Returned, mercenary',
    'Vasher\'s brother, once. A smile that hid a thousand Breaths of hurt.', false, [
      { era: 2, system: 'nalthian', body: 'nalthis' },
    ]),
  ch('dilaf', 'Dilaf', '#dc2626', 'elantris', 'Sel', 'Gragdet',
    'Dakhor monk',
    'Hrathen\'s arteth, and something older and crueller than Shu-Dereth.', false, [
      { era: 1, system: 'selish', body: 'sel' },
    ]),
  ch('breeze', 'Breeze', '#f59e0b', 'mistborn1', 'Scadrial', 'Ladrian',
    'Soother',
    'A nobleman who pushed emotions for a living, and a crew that let him.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
    ]),
  ch('ham', 'Ham', '#78716c', 'mistborn1', 'Scadrial', 'Hammond',
    'Pewterarm, philosopher',
    'Thug with a taste for ethics. The crew\'s conscience in a pewter lining.', false, [
      { era: 2, system: 'scadrian', body: 'scadrial' },
    ]),
];

/**
 * The dragons of Yolen, and the Sleepless of Aimia.
 *
 * They sit in the same roster as everyone else — same eras, same trails, same
 * Lore Web — because in the Cosmere they *are* people, they are just not human
 * ones. The Directory tabs them separately so a reread can find them.
 */
function drake(
  id: string, name: string, color: string, book: string, aliases: string,
  abilities: string, biology: string, fact: string, eras: Character['eras'],
  extra: Partial<Character> = {},
): Character {
  return {
    id, name, color, book, origin: 'Yolen', aliases, abilities, fact,
    cognitive: true, eras, kind: 'dragon', biology,
    canon: 'canon', sources: [book], ...extra,
  };
}

const ALL_ERAS = (system: string, body?: string): Character['eras'] =>
  [0, 1, 2, 3, 4, 5].map((era) => ({ era, system, body }));

CHARACTERS.push(
  drake('frost', 'Frost', '#e0f2fe', 'stormlight', 'the oldest of them',
    'Functionally immortal · shapeshifter · vast Cosmere knowledge',
    'The oldest known being in the Cosmere, older than Hoid. In human form, a pale man of about sixty with a long silver beard in white and silver robes. Like all greater dragons he spent his first thirty years in human form before his First Light.',
    "Hoid's oldest friend and fiercest philosophical opponent. He keeps an oath of non-intervention, and the Seventeenth Shard share it; Hoid's letters in The Way of Kings are to him, and the replies in Words of Radiance are his.",
    ALL_ERAS('yolish', 'yolen'),
    { sources: ['The Stormlight Archive', 'Arcanum Unbounded', 'Word of Brandon'] }),

  drake('koravellium', 'Koravellium Avast', '#4ade80', 'stormlight', 'Cultivation · Kor · Slammer',
    'Vessel of Cultivation · future sight · boons and curses · spren-making',
    'A dragon considered heretical on Yolen for refusing the worship her kind expected. Prefers human form with mortals. Immortal twice over — once by birth, once by Shard.',
    'The dragon behind Cultivation. She helped Shatter Adonalsium, and she spent millennia engineering the ascension of Taravangian. Also called She Who Brings the Dews at Dawn.',
    [{ era: 0, system: 'yolish', body: 'yolen' }, ...ALL_ERAS('rosharan', 'roshar').slice(1)],
    { arc: 'row', sources: ['The Stormlight Archive', 'Word of Brandon'] }),

  drake('medelantorius', 'Medelantorius', '#fbbf24', 'stormlight', 'Valor',
    'Vessel of Valor · functionally immortal · shapeshifter · trained warrior',
    'A dragon of Yolen, and a warrior before the Shattering. Her draconic form is not described on the page.',
    'Took up Valor at the Shattering and has kept herself hidden since: Tanavast could not find her, and Endowment will not say where she is. She and Hoid were together, once. He means to find her.',
    // Every Vessel left Yolen; where she went is not said.
    [{ era: 0, system: 'yolish', body: 'yolen' }],
    {
      arc: 'wat', sources: ['Wind and Truth ch. 115', 'Wind and Truth — Endowment\'s letter', 'Word of Brandon'],
      fieldNotes: { fact: { canon: 'wob', note: 'That she and Hoid dated is Word of Brandon 16895.' } },
    }),

  // Tress card only. The Dynamic, Silverlight, the piano and his opinion of
  // Hoid are Isles of the Emberdark (iote 25, 32), carried by gated relations.
  drake('xisis', 'Xisisrefliel', '#f87171', 'tress', 'Xisis · Foil',
    'Shapeshifter · Tenth Heightening Awakener · commands crimson spores · a cure for spore eaters that lasts a year or two',
    'Black scales, silvery hair, dragonsteel horns, ridges and claws; about four people tall. Like every greater dragon he has a human body as well.',
    'A dragon who has kept a palace of spore tunnels under the Crimson Sea for centuries, studying how aethers rot. He trades boons for servants.',
    [...ALL_ERAS('yolish', 'yolen').slice(0, 4), { era: 4, system: 'lumar', body: 'lumar-world' }, { era: 5, system: 'yolish', body: 'yolen' }],
    { sources: ['Tress of the Emerald Sea', 'Word of Brandon'] }),

  drake('illistandrista', 'Illistandrista', '#f472b6', 'emberdark', 'Starling',
    "Shapeshifter (manacled to human form) · ship's captain · Hoid's apprentice",
    "Frost's niece, raised by him after her parents died. Eighty-seven years old during Isles of the Emberdark, which is young. Wears manacles that hold her in human form.",
    "Captain of the Dynamic Storyteller's Incredible Conveyance and Hoid's apprentice: a young dragon exiled from Yolen and manacled into human form, who does not despair.",
    [{ era: 5, system: 'drominad', body: 'first-of-the-sun' }],
    { arc: 'emberdark', sources: ['Isles of the Emberdark'] }),

  drake('vambrakastram', 'Vambrakastram', '#c084fc', 'core', 'name only',
    'Presumed standard greater-dragon abilities',
    'Nothing is recorded but the name, which Brandon has confirmed. Like all greater dragons, presumed a functionally immortal shapeshifter.',
    'One of the named Yolish dragons, and almost nothing else. This entry exists so the count is honest, not because the atlas knows anything.',
    ALL_ERAS('yolish', 'yolen'),
    { canon: 'wob', sources: ['Word of Brandon'] }),

  // Wind and Truth ch. 18: Hoid reaches Frost and his sister by tamukek; Frost
  // will not look at the contract, his sister will. That she is Starling's
  // parent is not on the page — Starling's parents are only "mourned".
  drake('frosts-sister', "Frost's sister", '#94a3b8', 'stormlight', 'unnamed',
    'Presumed standard greater-dragon abilities',
    'A dragon known only by her brother. Hoid reached them both by tamukek in the last days of the contest.',
    'Frost\'s sister. When Hoid needed a Rosharan contract read and Frost would not do it, she would. The books have not given her a name, and neither will this.',
    ALL_ERAS('yolish', 'yolen').slice(0, 4),
    { arc: 'wat', sources: ['Wind and Truth ch. 18'] }),

  {
    id: 'arclo', name: 'Arclo', color: '#86efac', book: 'stormlight', arc: 'row',
    origin: 'Aimia', aliases: 'the librarian', kind: 'sleepless',
    abilities: 'Distributed mind · hivebody · deep Cosmere knowledge',
    biology: 'A Dysian Aimian: one mind carried by thousands of cremling-like creatures, which can be assembled into a human shape or dispersed entirely. Losing a few is an inconvenience, not a death.',
    fact: 'A Sleepless who posed as a librarian in the Palanaeum. Knows far more about the Cosmere than he volunteers, and volunteers more than most of his kind.',
    cognitive: false,
    canon: 'canon', sources: ['Rhythm of War', 'The Stormlight Archive'],
    eras: [
      { era: 1, system: 'rosharan', body: 'roshar' },
      { era: 2, system: 'rosharan', body: 'roshar' },
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 4, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'rosharan', body: 'roshar' },
    ],
  },
  {
    id: 'sleepless-hordes', name: 'The Sleepless', color: '#4ade80', book: 'stormlight',
    origin: 'Aimia', aliases: 'Dysian Aimians', kind: 'sleepless',
    abilities: 'Hivemind · shape-building · centuries of patience',
    biology: 'Each Sleepless is a collective of thousands of hordelings, bred for tasks — eyes, hands, memory. They build bodies the way a person builds a tool, and they have been building them since before the Recreance.',
    fact: 'Ancient guardians of Aimia, and of at least one Dawnshard. They are why Akinah kills anyone who lands there, and why the Aimian islands stayed empty.',
    cognitive: false,
    canon: 'canon', sources: ['The Stormlight Archive', 'Dawnshard'],
    eras: [
      { era: 1, system: 'rosharan', body: 'roshar' },
      { era: 2, system: 'rosharan', body: 'roshar' },
      { era: 3, system: 'rosharan', body: 'roshar' },
      { era: 4, system: 'rosharan', body: 'roshar' },
      { era: 5, system: 'rosharan', body: 'roshar' },
    ],
  },
);

for (const c of CHARACTERS) {
  const extra = PEOPLE_BIOS[c.id];
  if (!extra) continue;
  if (extra.bio && !c.bio) c.bio = extra.bio;
  if (extra.see && !c.see) c.see = extra.see;
  if (extra.wiki && !c.wiki) c.wiki = extra.wiki;
  if (extra.titles && !c.titles) c.titles = extra.titles;
  if (extra.kind && !c.kind) c.kind = extra.kind;
}
