/**
 * Original city plates. Shapes are ours; names and relative layout are the
 * books'. UVs live on the plate, not on the world map.
 */
import type { CityLandmark, CityPlate } from './types.ts';

function mark(
  id: string, city: string, name: string, u: number, v: number,
  color: string, desc: string, extra: Partial<CityLandmark> = {},
): CityLandmark {
  return { id, city, name, u, v, color, desc, ...extra };
}

export const CITY_PLATES: CityPlate[] = [
  {
    id: 'urithiru',
    kind: 'urithiru',
    kicker: 'Tower-city',
    landmarks: [
      mark('urithiru-atrium', 'urithiru', 'Crystal pillar', 0.42, 0.52, '#7dd3fc',
        'The crystal pillar deep inside the tower, at its heart.',
        { book: 'stormlight', arc: 'oathbringer' }),
      mark('urithiru-oathgates', 'urithiru', 'Oathgate plateau', 0.72, 0.64, '#fbbf24',
        'Ten platforms at the tower\'s foot. Each is a door to a capital.',
        { book: 'stormlight', arc: 'wor', on: [{ file: 'urithiru.jpg', u: 0.332, v: 0.824 }] }),
      mark('urithiru-breakaway', 'urithiru', 'The Breakaway', 0.32, 0.62, '#fde68a',
        'A market in a vast hall — the liveliest floor in a city of stone.',
        { book: 'stormlight', arc: 'oathbringer' }),
      mark('urithiru-cloudwalk', 'urithiru', 'Cloudwalk', 0.18, 0.38, '#e2e8f0',
        'Where the tower meets the storm. Clouds break on the masonry.',
        { book: 'stormlight', arc: 'row' }),
    ],
  },
  {
    id: 'kholinar',
    kind: 'kholinar',
    kicker: 'Capital of Alethkar',
    landmarks: [
      mark('kholinar-palace', 'kholinar', 'Kholin palace', 0.50, 0.22, '#fbbf24',
        'The palace above the windblades, seat of the Kholin throne.',
        { book: 'stormlight', on: [{ file: 'Kholinar.jpg', u: 0.498, v: 0.588 }] }),
      mark('kholinar-oathgate', 'kholinar', 'Oathgate', 0.82, 0.48, '#a78bfa',
        'Alethkar\'s Oathgate: the Monastery Dais on the palace grounds, reached by the Sunwalk.',
        { book: 'stormlight', arc: 'oathbringer' }),
      mark('kholinar-windblades-mark', 'kholinar', 'Windblades', 0.42, 0.50, '#fdba74',
        'Stone ridges the city is built around and between.',
        { entry: 'kholinar-windblades', book: 'stormlight', on: [{ file: 'Kholinar.jpg', u: 0.506, v: 0.353 }] }),
      mark('kholinar-market', 'kholinar', 'Market', 0.56, 0.60, '#fde68a',
        'The market between the blades, still trading under occupation.',
        { book: 'stormlight', arc: 'oathbringer' }),
    ],
  },
  {
    id: 'kharbranth',
    kind: 'kharbranth',
    kicker: 'City of Bells',
    landmarks: [
      mark('kharbranth-harbour', 'kharbranth', 'The lagoon', 0.48, 0.58, '#67e8f9',
        'The harbour the city curls around, bells over the water.',
        { book: 'stormlight', on: [{ file: 'kharbranth.jpg', u: 0.50, v: 0.78 }] }),
      mark('kharbranth-palanaeum-mark', 'kharbranth', 'Palanaeum', 0.62, 0.36, '#a78bfa',
        'The world\'s great library, cut deep into the cliff.',
        { entry: 'kharbranth-palanaeum', book: 'stormlight' }),
      mark('kharbranth-conclave', 'kharbranth', 'The Conclave', 0.38, 0.32, '#c4b5fd',
        'Where the king and the ardents rule, high above the docks.',
        { book: 'stormlight', on: [{ file: 'kharbranth.jpg', u: 0.466, v: 0.246 }] }),
    ],
  },
  // Navani's annotated survey after the battle. Every name on it is an
  // Oathbringer name, so a Words of Radiance reader gets the art and no marks.
  // `u`/`v` repeat the survey's, for the plan drawn if the raster fails.
  {
    id: 'thaylen-city',
    kind: 'thaylen',
    kicker: 'Capital of Thaylenah',
    landmarks: [
      mark('thaylen-oathgate-mark', 'thaylen-city', 'Oathgate', 0.867, 0.183, '#a78bfa',
        'Thalath\'s Oathgate, on the Royal Ward\'s level by the sea cliffs. Thaylens kept it as a sculpture garden and called it a portal of worlds; Kaladin and Shallan unlocked it.',
        { entry: 'oathgate-thar', book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.867, v: 0.183 }] }),
      // Inside the ward's west wall under the "A", not between the two words:
      // the atlas writes a name to the right of its dot, and from the middle
      // of the ward "Ancient Ward" ran over the Talenelat and palace dots.
      mark('thaylen-ancient-ward', 'thaylen-city', 'Ancient Ward', 0.591, 0.451, '#e2e8f0',
        'The oldest quarter: stone, raised a little above the rest, its streets laid out in a cymatic pattern. In the Heraldic Epochs this was the whole city.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.591, v: 0.451 }] }),
      mark('thaylen-low-ward', 'thaylen-city', 'Low Ward', 0.560, 0.378, '#a8a29e',
        'Shops and government offices, with the city wall along its west side. The wall was broken in the battle; Jasnah filled the gap with Soulcast metal.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.560, v: 0.378 }] }),
      mark('thaylen-gemstone-reserve', 'thaylen-city', 'Gemstone Reserve', 0.600, 0.611, '#67e8f9',
        'Thaylenah\'s national bank: a windowless fortress of vaults, the King\'s Drop among them. A thunderclast tore it open in the battle.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.600, v: 0.611 }] }),
      mark('thaylen-field-mark', 'thaylen-city', 'Thaylen Field', 0.451, 0.536, '#4ade80',
        'Outside the wall: docks, warehouses and the grand bazaar, all wood, until the Everstorm flattened them. Named for the battle fought on what was left.',
        { entry: 'thaylen-field', book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.451, v: 0.536 }] }),
      mark('thaylen-royal-ward', 'thaylen-city', 'Royal Ward', 0.897, 0.333, '#fde68a',
        'The top of the city: palaces, mansions, and a temple to each of the ten Heralds. After the Everstorm the temples took in the wounded and the homeless.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.897, v: 0.333 }] }),
      mark('thaylen-palace', 'thaylen-city', 'Royal Palace', 0.902, 0.425, '#fbbf24',
        'Seat of the Thaylen monarchs. Just past it three roads leave the city, its only way out overland.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.902, v: 0.425 }] }),
      mark('thaylen-temple-talenelat', 'thaylen-city', 'Temple of Talenelat', 0.858, 0.448, '#fcd34d',
        'Mosaics of Taln holding against the Voidbringers, and a roof the Everstorm\'s lightning brought down. The first building Dalinar mended, the day he found he could.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.858, v: 0.448 }] }),
      mark('thaylen-temple-battah', 'thaylen-city', 'Temple of Battah', 0.864, 0.278, '#fcd34d',
        'The second-oldest temple. The Everstorm threw the Simulacrum of Paralet down from its plaza into the Loft Wards; Dalinar put it back together.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.864, v: 0.278 }] }),
      mark('thaylen-temple-pailiah', 'thaylen-city', 'Temple of Pailiah', 0.919, 0.287, '#fcd34d',
        'Built open, so the wind blows through. Renarin came here to pray when he began seeing the battle before it happened.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.919, v: 0.287 }] }),
      mark('thaylen-temple-ishi', 'thaylen-city', 'Temple of Ishi', 0.858, 0.534, '#fcd34d',
        'The oldest temple in the city, in the south of the Royal Ward.',
        { book: 'stormlight', arc: 'oathbringer', on: [{ file: 'thaylen_city.jpg', u: 0.858, v: 0.534 }] }),
    ],
  },
  // Three plates, none of them labelled. The Prime Map's caption names the
  // Tower ("the largest plateau", lower right — Coppermind's caption agrees)
  // and the warcamps (the craters down the west edge); Vandonas's painting
  // keys the king's complex; the radial sketch marks only its centre.
  // Neither Narak's Oathgate nor the Well of Control is drawn on any of them,
  // so they are roster chips with no dot.
  {
    id: 'narak',
    kind: 'narak',
    kicker: 'Shattered Plains',
    landmarks: [
      mark('stormseat-mark', 'narak', 'Stormseat', 0.47, 0.50, '#e2e8f0',
        'Every chasm on the Plains runs out from here. Stormseat, the old capital of Natanatan, stood at the centre; the listeners built Narak on its ruins.',
        { entry: 'stormseat', book: 'stormlight', arc: 'wor', on: [{ file: 'shattered_plains2.jpg', u: 0.483, v: 0.376 }] }),
      mark('narak-oathgate', 'narak', 'Oathgate', 0.40, 0.60, '#a78bfa',
        'The one Oathgate the Radiants never locked. It broke away whole when the Plains shattered and stands as a plateau of its own under a skin of crem. Shallan woke it to carry the armies out from under the Everstorm.',
        { book: 'stormlight', arc: 'wor' }),
      mark('warcamps-mark', 'narak', 'Warcamps', 0.10, 0.50, '#fbbf24',
        'Ten craters along the western rim, one highprince\'s army in each, and each camp a town of its own with markets and taverns.',
        { entry: 'warcamps', book: 'stormlight', on: [{ file: 'shattered_plains.jpg', u: 0.103, v: 0.559 }] }),
      mark('narak-tower-plateau', 'narak', 'The Tower', 0.30, 0.62, '#f87171',
        'The largest plateau in the explored east, and a favourite place for chasmfiends to pupate. Sadeas pulled his bridges back here and left Dalinar\'s army to the Parshendi.',
        { book: 'stormlight', on: [{ file: 'shattered_plains.jpg', u: 0.859, v: 0.654 }] }),
      mark('warcamps-palace', 'narak', 'Royal Palace', 0.14, 0.32, '#fde68a',
        'The king\'s palace on its hill above the camps. Vandonas keys the king\'s complex from top to bottom: the palace, the Gallery of Maps, the feasting basin, the duelling arena.',
        { book: 'stormlight', on: [{ file: 'warcamps.jpg', u: 0.768, v: 0.267 }] }),
      mark('well-of-control-mark', 'narak', 'Well of Control', 0.55, 0.44, '#facc15',
        'Odium\'s perpendicularity, in a sealed cavern under the Plains, inside what is left of Roshar\'s fourth moon. Retribution\'s now.',
        { entry: 'well-of-control', book: 'stormlight', arc: 'wat' }),
    ],
  },
  {
    id: 'luthadel',
    kind: 'luthadel',
    kicker: 'Final Empire',
    landmarks: [
      mark('luthadel-kredik', 'luthadel', 'Kredik Shaw', 0.50, 0.36, '#111010',
        'The Lord Ruler\'s spiked palace. The Hill of a Thousand Spires.',
        { book: 'mistborn1', on: [{ file: 'luthadel.jpg', u: 0.659, v: 0.495 }, { file: 'luthadel_endpaper.png', u: 0.615, v: 0.537 }, { file: 'kredik_shaw.jpg', u: 0.698, v: 0.326 }] }),
      mark('luthadel-venture', 'luthadel', 'Keep Venture', 0.68, 0.42, '#d6a44c',
        'The most powerful of the great houses, a fortress inside the wall.',
        { book: 'mistborn1', on: [{ file: 'luthadel.jpg', u: 0.692, v: 0.317 }, { file: 'luthadel_endpaper.png', u: 0.631, v: 0.373 }] }),
      mark('luthadel-gates-mark', 'luthadel', 'Steel Gate', 0.50, 0.16, '#a8a29e',
        'The city\'s northern door, under ash and watch.',
        { entry: 'luthadel-gates', book: 'mistborn1', on: [{ file: 'luthadel.jpg', u: 0.231, v: 0.198 }, { file: 'luthadel_endpaper.png', u: 0.290, v: 0.293 }] }),
      mark('luthadel-twists', 'luthadel', 'The Twists', 0.28, 0.62, '#78716c',
        'Skaa slums in the shadow of the wall.',
        { book: 'mistborn1', on: [{ file: 'luthadel.jpg', u: 0.221, v: 0.335 }, { file: 'luthadel_endpaper.png', u: 0.281, v: 0.398 }] }),
      mark('luthadel-channerel', 'luthadel', 'River Channerel', 0.42, 0.72, '#64748b',
        'The river that cuts Luthadel in two.',
        { book: 'mistborn1', on: [{ file: 'luthadel.jpg', u: 0.503, v: 0.504 }, { file: 'luthadel_endpaper.png', u: 0.504, v: 0.508 }] }),
    ],
  },
  // The 2007 survey's numbered key, measured on the file. Every name on it
  // is The Hero of Ages. The wells are the plate's own detail and stay so.
  {
    id: 'fadrex',
    kind: 'fadrex',
    kicker: 'Western Dominance',
    // Keep Orielle first: the atlas names pins in this order and skips a name
    // that would collide with one already placed, and Slowswift's name, if it
    // is placed, runs straight over Keep Orielle's dot.
    landmarks: [
      mark('fadrex-keep-orielle', 'fadrex', 'Keep Orielle', 0.365, 0.532, '#e2e8f0',
        'White marble, stained glass and a low ceiling. Vin and Elend flew to the doors of Yomen\'s ball here on the siege\'s first night, and Elend let the nobility see he was Mistborn.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'fadrex.jpg', u: 0.365, v: 0.532 }] }),
      mark('fadrex-canton-resource', 'fadrex', 'Canton of Resource', 0.465, 0.589, '#f59e0b',
        'Blocky, one storey, and the largest Ministry building in the city. Yomen governed from it, and the last of the Lord Ruler\'s storage caverns lies beneath it.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'fadrex.jpg', u: 0.465, v: 0.589 }] }),
      mark('fadrex-slowswift', 'fadrex', 'Slowswift\'s House', 0.243, 0.515, '#a8a29e',
        'Home of the old storyteller Slowswift, who traded writing with Cett for a decade. Vin came here to buy what he knew about Yomen.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'fadrex.jpg', u: 0.243, v: 0.515 }] }),
      mark('fadrex-infirmary', 'fadrex', 'Infirmary', 0.685, 0.382, '#fca5a5',
        'Another Ministry building, which Yomen turned into an infirmary.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'fadrex.jpg', u: 0.685, v: 0.382 }] }),
      mark('fadrex-gates', 'fadrex', 'City Gates', 0.754, 0.206, '#78716c',
        'Fadrex\'s rock shelves are its walls, and this is the way through them. When Ruin took the koloss, Yomen opened the gates to Elend\'s army.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'fadrex.jpg', u: 0.754, v: 0.206 }] }),
    ],
  },
  // Five of the survey's places have something on record. The White Streets,
  // the Interchange Building, Old City Square, the Canton of Orthodoxy and
  // Westlane Brook are names on the map and nothing more, so they get no dot:
  // a mark with nothing to say when it is clicked is not worth the click.
  {
    id: 'urteau',
    kind: 'urteau',
    kicker: 'Northern Dominance',
    landmarks: [
      mark('urteau-canton-inquisition', 'urteau', 'Canton of Inquisition', 0.669, 0.430, '#f87171',
        'The third of the Lord Ruler\'s storage caverns lies beneath it, round the lake that once filled the city\'s canals. Spook ran through the fires to Sazed\'s mechanism and let the water back in.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'urteau.jpg', u: 0.669, v: 0.430 }] }),
      mark('urteau-marketpit', 'urteau', 'Market Pit', 0.626, 0.628, '#fde68a',
        'The widest of the dry canals, once room for three boats abreast, now the main street. The Citizen burned his executions beside it and spoke to the crowd from it.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'urteau.jpg', u: 0.626, v: 0.628 }] }),
      mark('urteau-citizens-home', 'urteau', 'The Citizen\'s Home', 0.560, 0.288, '#60a5fa',
        'Quellion\'s house. Spook kept slipping in to hear the Citizen\'s plans, and to watch his sister Beldre.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'urteau.jpg', u: 0.560, v: 0.288 }] }),
      mark('urteau-harrows', 'urteau', 'The Harrows', 0.423, 0.694, '#a8a29e',
        'When the Harrows were new, Durn\'s men pulled the old locks from their mouth. Before Spook flooded the canals Durn put them back, so the people living there would not be swept away.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'urteau.jpg', u: 0.423, v: 0.694 }] }),
      mark('urteau-fedre-aqueduct', 'urteau', 'Lord Fedre\'s Aqueduct', 0.719, 0.238, '#38bdf8',
        'Named for an eighth-century canal architect, an infamous scoundrel fond of cats and canals. Sazed carried his book in a metalmind and thought him a genius.',
        { book: 'mistborn1', arc: 'hoa', on: [{ file: 'urteau.jpg', u: 0.719, v: 0.238 }] }),
    ],
  },
  {
    id: 'elendel',
    kind: 'elendel',
    kicker: 'The Basin',
    landmarks: [
      mark('elendel-rebirth', 'elendel', 'Field of Rebirth', 0.50, 0.50, '#d6a44c',
        'The park at the city\'s heart, where the old empire ended.',
        { book: 'mistborn2', on: [{ file: 'elendel.jpg', u: 0.598, v: 0.500 }, { file: 'elendel_lost_metal.jpeg', u: 0.599, v: 0.499 }] }),
      mark('elendel-ladrian-mark', 'elendel', 'Ladrian mansion', 0.68, 0.62, '#fbbf24',
        'House Ladrian, in the fourth octant, on the plate Nazh annotated.',
        { entry: 'ladrian-mansion', book: 'mistborn2', arc: 'aol', on: [{ file: 'elendel.jpg', u: 0.653, v: 0.737 }, { file: 'elendel_lost_metal.jpeg', u: 0.653, v: 0.735 }] }),
      mark('elendel-bay-mark', 'elendel', 'Hammondar Bay', 0.16, 0.42, '#67e8f9',
        'The bay west of the city, on the survey of 341.',
        { entry: 'hammondar-bay', book: 'mistborn2', on: [{ file: 'elendel.jpg', u: 0.109, v: 0.477 }, { file: 'elendel_lost_metal.jpeg', u: 0.109, v: 0.480 }] }),
      mark('elendel-governor', 'elendel', "Governor's mansion", 0.58, 0.38, '#fbbf24',
        'The governor\'s seat, in the Second Octant. MeLaan spoke to the riot from in front of it, wearing Innate\'s bones.',
        { book: 'mistborn2', arc: 'sos', on: [{ file: 'elendel_lost_metal.jpeg', u: 0.655, v: 0.467 }] }),
      mark('elendel-university-mark', 'elendel', 'Elendel University', 0.38, 0.44, '#93c5fd',
        'Lecture halls and a museum of the Originators.',
        { entry: 'elendel-university', book: 'mistborn2', on: [{ file: 'elendel_lost_metal.jpeg', u: 0.620, v: 0.376 }] }),
      mark('elendel-eastbridge', 'elendel', 'Eastbridge', 0.74, 0.52, '#67e8f9',
        'A road-and-rail bridge on the outermost ring road, in the Third Octant, where the city\'s electric light gives out. Wax fights Bleeder on and around it.',
        { book: 'mistborn2', arc: 'sos', on: [{ file: 'elendel_lost_metal.jpeg', u: 0.937, v: 0.507 }] }),
    ],
  },
  // The plate's cursive labels, read at four times size. Uptown, Downtown
  // and one more legible label have nothing on record beyond the map, so
  // they get no dot.
  {
    id: 'new-seran',
    kind: 'newseran',
    kicker: 'Outer City',
    landmarks: [
      mark('new-seran-shores-mansion', 'new-seran', 'Shores Mansion', 0.208, 0.151, '#e8b86d',
        'Lady Kelesina\'s house, built and decorated to look like a keep from before the Catacendre. Wax and Steris came to her party here; she was working with the Set.',
        { book: 'mistborn2', arc: 'bom', on: [{ file: 'new_seran.png', u: 0.208, v: 0.151 }] }),
      mark('new-seran-copper-gate', 'new-seran', 'Copper Gate Hotel', 0.103, 0.309, '#d6a44c',
        'Aunt Gin\'s hotel. Wax\'s party took the whole top floor, and Wax tore open the windows she had painted shut against the wind.',
        { book: 'mistborn2', arc: 'bom', on: [{ file: 'new_seran.png', u: 0.103, v: 0.309 }] }),
      mark('new-seran-cemetery', 'new-seran', 'Seran New District Cemetery', 0.640, 0.360, '#a8a29e',
        'The city pays it to bury the unidentified, and it has the worst grave robbing in town. ReLuur\'s spike went into its mass grave; Wayne and Marasi came looking for it and were ambushed.',
        { book: 'mistborn2', arc: 'bom', on: [{ file: 'new_seran.png', u: 0.640, v: 0.360 }] }),
      mark('new-seran-river', 'new-seran', 'Seran River', 0.800, 0.369, '#67e8f9',
        'Streams cross every terrace and drop to the next; the water finds its way back to the river, and the river runs on toward Elendel.',
        { book: 'mistborn2', arc: 'bom', on: [{ file: 'new_seran.png', u: 0.800, v: 0.369 }] }),
    ],
  },
  {
    id: 'elantris-city',
    kind: 'elantris',
    kicker: 'City of the gods',
    landmarks: [
      mark('elantris-palace', 'elantris-city', 'Royal palace', 0.50, 0.46, '#c4b5fd',
        'Five domed wings at the city\'s centre. Karata kept Elantris\'s children here.',
        { book: 'elantris' }),
      mark('elantris-market', 'elantris-city', 'Market district', 0.38, 0.58, '#fde68a',
        'Once the finest market on Sel. The Shaod does not shop.',
        { book: 'elantris' }),
      mark('elantris-gates', 'elantris-city', 'Ato', 0.50, 0.22, '#a78bfa',
        'The northern outer city, empty since the Reod. Ake, Ato, Kae and Toa sit at the compass points; with Elantris they draw Aon Rao.',
        { book: 'elantris' }),
      mark('elantris-kae-edge', 'elantris-city', 'Kae', 0.72, 0.62, '#ddd6fe',
        'The new capital, clinging to the walls of the old.',
        { book: 'elantris' }),
      mark('elantris-pool-road', 'elantris-city', 'Mountain path', 0.50, 0.10, '#818cf8',
        'Switchbacks up the Atad Mountains to the pool. A tunnel from inside the city reaches it too.',
        { book: 'elantris' }),
    ],
  },
  {
    id: 'ttelir',
    kind: 'ttelir',
    kicker: 'Hallandren',
    landmarks: [
      mark('ttelir-court', 'ttelir', 'Court of the Gods', 0.64, 0.30, '#c084fc',
        'A palace for every Returned, each a colour, each a god.',
        { book: 'warbreaker' }),
      mark('ttelir-docks', 'ttelir', 'The docks', 0.48, 0.78, '#67e8f9',
        'Hallandren\'s door to the Bright Sea.',
        { book: 'warbreaker' }),
      mark('ttelir-ddenir', 'ttelir', "D'Denir garden", 0.38, 0.48, '#86efac',
        'Statues of a forgotten army, lined up as if still on the march.',
        { book: 'warbreaker' }),
      mark('ttelir-slums', 'ttelir', 'Idrian quarter', 0.26, 0.58, '#e2e8f0',
        'Grey clothes in a city that worships colour.',
        { book: 'warbreaker' }),
    ],
  },
  {
    id: 'kilahito',
    kind: 'kilahito',
    kicker: 'City of painters',
    landmarks: [
      mark('kilahito-hion', 'kilahito', 'Hion lines', 0.50, 0.50, '#22d3ee',
        'Cyan and magenta. Light, heat, and the city\'s pulse.',
        { book: 'yumi' }),
      // Coppermind: Kilahito (yumi 1, 3, 14, 28, 39); Noodle Pupil (yumi 5, 21, 32, 40, ae);
      // Nightmare Division (yumi 14). Placement on the plate is ours.
      mark('kilahito-capstones', 'kilahito', 'Capstone walls', 0.26, 0.48, '#e879f9',
        'White perimeter warehouses with no windows. Each painter claims one for a mural; the battle was fought along the western edge.',
        { book: 'yumi', arc: 'yumi' }),
      mark('kilahito-noodle-pupil', 'kilahito', 'The Noodle Pupil', 0.60, 0.56, '#67e8f9',
        'Design\'s noodle shop: prime-number discounts, a heated bar, Hoid as the coatrack. Later the Noodle Princess.',
        { book: 'yumi', arc: 'yumi' }),
      mark('kilahito-nd-hq', 'kilahito', 'Nightmare Division headquarters', 0.46, 0.36, '#22d3ee',
        'Where painters hand in the night\'s canvases. Foreman Sukishi has an office here.',
        { book: 'yumi', arc: 'yumi' }),
      mark('kilahito-carnival', 'kilahito', 'The carnival', 0.72, 0.44, '#f0abfc',
        '"The place of a million lights": food, games and the Jotun Line, open on festivals and rest days.',
        { book: 'yumi', arc: 'yumi' }),
    ],
  },
  {
    id: 'kezare',
    kind: 'kezare',
    kicker: 'Lossand',
    landmarks: [
      mark('kezare-diem', 'kezare', 'The Diem', 0.46, 0.42, '#fbbf24',
        'Home of the sand masters, a profession and a building.',
        { book: 'whitesand' }),
      mark('kezare-river', 'kezare', 'The Ry\'DoAli', 0.50, 0.62, '#38bdf8',
        'The river Kezare sits in the middle of, on an island.',
        { book: 'whitesand' }),
      mark('kezare-taishin', 'kezare', 'Hall of Judgment', 0.62, 0.36, '#fde68a',
        'The Taishin meet in its Taisha Meeting Hall; the trackts work out of it too.',
        { book: 'whitesand' }),
    ],
  },
  {
    id: 'beacon',
    kind: 'hover',
    kicker: 'Hover-city',
    landmarks: [
      // Coppermind: Chorus (tsm 22), Greater Good (tsm 7, 8), Dawnchaser (tsm 26).
      mark('beacon-reliquary', 'beacon', 'The Reliquary', 0.48, 0.52, '#f59e0b',
        'A glass drum on the central ship. The Chorus lives in it and makes things on request.',
        { book: 'sunlit', arc: 'sunlit', entry: 'chorus-hall' }),
      mark('beacon-greater-good', 'beacon', 'The Greater Good\'s chamber', 0.62, 0.44, '#fbbf24',
        'Where three old women in black disagree deferentially and decide where the city goes.',
        { book: 'sunlit', arc: 'sunlit' }),
      mark('beacon-dawnchaser', 'beacon', 'The Dawnchaser', 0.36, 0.60, '#fb923c',
        'Elegy\'s refitted prospector, one of Beacon\'s ships, built to fly into the maelstrom.',
        { book: 'sunlit', arc: 'sunlit' }),
    ],
  },
  {
    id: 'union',
    kind: 'hover',
    kicker: 'Hover-city',
    landmarks: [
      // Coppermind: Union (tsm 3, 50), Cinder King (tsm 7, 16), Zeal (tsm 7).
      mark('union-kings-ship', 'union', 'The Cinder King\'s ship', 0.50, 0.42, '#fb923c',
        'His private ship. Zeal stole the key off it; Nomad turned down a job on it.',
        { book: 'sunlit', arc: 'sunlit' }),
      mark('union-hall-of-burning', 'union', 'Hall of Burning', 0.64, 0.56, '#f59e0b',
        'Hundreds of sunhearts down a bare stair, one Charred on guard, and the room where Charred are made.',
        { book: 'sunlit', arc: 'sunlit', entry: 'cinder-kings-palace' }),
      mark('union-arena', 'union', 'The arena', 0.36, 0.50, '#ef4444',
        'Ships pulled into a ring over mud. Prisoners run, Charred chase, and the Cinder King picks.',
        { book: 'sunlit', arc: 'sunlit' }),
    ],
  },
];

export const cityById: Record<string, CityPlate> =
  Object.fromEntries(CITY_PLATES.map((c) => [c.id, c]));

export const landmarkById: Record<string, CityLandmark> =
  Object.fromEntries(CITY_PLATES.flatMap((c) => c.landmarks.map((m) => [m.id, m])));
