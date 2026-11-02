import type { Location } from './types.ts';

const C = 'canon' as const;

function eraMinFromBook(book: string): number {
  if (book === 'core') return 0;
  if (book === 'mistborn1' || book === 'secrethistory') return 2;
  if (book === 'mistborn2') return 3;
  if (book === 'tress' || book === 'fod') return 4;
  // Yumi is after The Sunlit Man (WoB 16524); Sixth of the Dusk after Mistborn Era 3.
  if (book === 'sunlit' || book === 'yumi' || book === 'sixthofdusk' || book === 'emberdark') return 5;
  return 1;
}

function loc(
  id: string, name: string, body: string, book: string, u: number, v: number,
  color: string, icon: string, desc: string, extra: Partial<Location> = {},
): Location {
  const ashOnly = extra.eraMaps?.includes('ash') && !extra.eraMaps.includes('basin');
  const basinOnly = extra.eraMaps?.includes('basin') && !extra.eraMaps.includes('ash');
  const eraMin = extra.eraMin ?? (ashOnly ? 2 : basinOnly ? 3 : eraMinFromBook(book));
  const eraMax = extra.eraMax ?? (ashOnly ? 2 : extra.eraMax);
  return { id, name, body, book, u, v, color, icon, desc, canon: extra.canon ?? C, sources: extra.sources ?? [book], eraMin, eraMax, ...extra };
}

export const PLACES_MORE: Location[] = [
  loc('warcamps', 'The Alethi Warcamps', 'roshar', 'stormlight', 0.8, 0.72, '#f87171', 'keep',
    'Ten princedoms dug in west of the Shattered Plains. Permanent enough to grow markets, temporary enough that nobody called them home.', {
      bio: 'Ten camps in ten craters west of the Plains, one per princedom, dug in for a war that was supposed to take a season and took six years. They grew markets, bridge crews and a lighteyed social season, and Dalinar spent years trying to make ten rival courts behave like an army.', arc: 'twok', region: 'Shattered Plains', see: ['shattered-plains'], wiki: 'Warcamp' }),
  loc('stormseat', 'Stormseat', 'roshar', 'stormlight', 0.836, 0.742, '#9ca3af', 'drum',
    'Capital of the old Silver Kingdom of Natanatan, at the heart of the Plains. The listeners call it Narak.', {
      bio: 'The capital of the Silver Kingdom of Natanatan, in the very centre of what became the Shattered Plains. In the War of Reckoning the listeners live there and call it Narak, Exile. Its Oathgate was the one never locked.', arc: 'wor', region: 'Shattered Plains', see: ['narak', 'shattered-plains'], wiki: 'Stormseat' }),
  loc('kholinar-windblades', 'The Windblades', 'roshar', 'stormlight', 0.79, 0.49, '#fbbf24', 'peak',
    'Rock fins that cut through Kholinar. Palaces cling to them.', {
      bio: 'Stone fins standing up through Kholinar, around and between which the city is built; the palaces sit up on them.', region: 'Alethkar', see: ['kholinar'], wiki: 'Kholinar' }),
  loc('kharbranth-palanaeum', 'The Palanaeum', 'roshar', 'stormlight', 0.585, 0.77, '#a78bfa', 'scroll',
    'The greatest library on Roshar, cut into the rock of Kharbranth. Its fees keep the city\'s hospitals open.', { arc: 'twok', region: 'Kharbranth', see: ['kharbranth'], wiki: 'Palanaeum', bio: 'Jasnah came for the books. Shallan came for Jasnah.' }),
  loc('ironsway', 'Ironsway', 'roshar', 'stormlight', 0.595, 0.625, '#94a3b8', 'city',
    'Largest town in Bavland — taverns, transient miners, and the place Took dragged Szeth to show him off.', {
      bio: 'A mining town in Bavland with more taverns than reasons to be there. Took bought Szeth as a curiosity and paraded him through it, which is how the deadliest man on Roshar spent a stretch of his life being someone\'s dinner-party trick.', arc: 'twok', region: 'Bavland', see: ['bavland', 'jah-keved'], wiki: 'Ironsway' }),
  loc('silnasen', 'Silnasen', 'roshar', 'stormlight', 0.594, 0.626, '#fca5a5', 'city',
    'A city of southern Jah Keved near Triax and Bavland, home of the Siln.', {
      arc: 'wor', bio: 'A city in the south of Jah Keved, close to Triax and Bavland, named for the Siln, an indigenous people of the region.', region: 'Jah Keved', see: ['jah-keved', 'vedenar'], wiki: 'Silnasen' }),
  loc('valath', 'Valath', 'roshar', 'stormlight', 0.648, 0.513, '#f87171', 'city',
    'Northern Jah Keved city, and a name Vorin maps still bother to print.', {
      bio: 'A northern Veden city, home to the Holy Enclave.', region: 'Jah Keved', see: ['jah-keved'], wiki: 'Valath' }),
  loc('bornwater', 'Bornwater', 'roshar', 'stormlight', 0.592, 0.565, '#67e8f9', 'village',
    'The biggest mining town in Bavland, sheltered by a cliff on its east side.', {
      bio: 'A backwater mining town in Bavland, the largest in its corner of the mountains, sheltered from the highstorms by a cliff to the east. Szeth lived here for a time as a Truthless, before he served Taravangian.', arc: 'twok', region: 'Bavland', see: ['bavland', 'szeth'], wiki: 'Bornwater' }),
  loc('fu-abra', 'Fu Abra', 'roshar', 'stormlight', 0.425, 0.505, '#22d3ee', 'village',
    'Purelake settlement Ishikk worked out of while fishing for a man who was not there.', {
      bio: 'A Purelake village where Ishikk fished in the mornings and asked after a foreigner in the afternoons, for three strangers who were looking for Hoid.', arc: 'twok', region: 'Purelake', see: ['purelake'], wiki: 'Fu_Abra' }),
  loc('cusicesh-site', 'Cusicesh the Protector', 'roshar', 'stormlight', 0.2525, 0.2675, '#c4b5fd', 'lake',
    'A spren the size of a district that rises each day in Kasitor\'s bay and wears a thousand faces.', {
      bio: 'Every morning something the size of a city district rises out of Kasitor\'s bay, turns through a sequence of human faces, and sinks again. The Iriali call it Cusicesh, the Protector.', arc: 'twok', region: 'Iri', see: ['kasitor', 'iri'], wiki: 'Cusicesh' }),
  loc('thaylen-field', 'Thaylen Field', 'roshar', 'stormlight', 0.605, 0.85, '#4ade80', 'grass',
    'The plain outside Thaylen City where a god was stood down and a perpendicularity forced open.', {
      bio: 'The plain outside Thaylen City where the coalition lost, and then did not. Dalinar refused Odium\'s claim on him in front of both armies and opened Honor\'s perpendicularity; the Stormlight it poured out refilled the Radiants, and the Thrill was trapped in the King\'s Drop.', arc: 'oathbringer', region: 'Thaylenah', see: ['thaylen-city', 'thaylenah'], wiki: 'Battle_of_Thaylen_Field' }),
  loc('klna', 'Klna', 'roshar', 'stormlight', 0.638, 0.837, '#86efac', 'port',
    'A Thaylen city on Longbrow\'s Straits, with shipyards.', {
      bio: 'A city of Thaylenah on Longbrow\'s Straits. Vstim had a new ship built here for Rysn, the Wandersail.', arc: 'oathbringer', region: 'Thaylenah', see: ['thaylenah', 'akinah'], wiki: 'Klna' }),
  // Basin pins: measured on the Basin survey and carried onto the world plate.
  // See the note above Elendel in locations.ts.
  loc('steinel', 'Steinel', 'scadrial', 'mistborn2', 0.587, 0.294, '#94a3b8', 'city',
    'Basin city due east of Elendel along the Irongate River.', {
      region: 'Elendel Basin',
      bio: 'A city of the Basin due east of Elendel on the Irongate River, where the rail line and the river run side by side out toward the Basin\'s rim.', eraMaps: ['basin'], see: ['elendel', 'irongate-river'], wiki: 'Steinel' }),
  loc('mycondwel', 'Mycondwel', 'scadrial', 'mistborn2', 0.528, 0.265, '#e8b86d', 'city',
    'A city at the north-western edge of the Basin, under the Channerel Range.', {
      region: 'Elendel Basin',
      bio: 'A city at the north-western edge of the Basin, along the Channerel Range, at the end of the rail spur that runs up from Elendel past Wyllion.', eraMaps: ['basin'], see: ['elendel-basin'], wiki: 'Mycondwel' }),
  loc('field-of-rebirth', 'Field of Rebirth', 'scadrial', 'mistborn2', 0.551, 0.288, '#86efac', 'grass',
    'Where the survivors came up into Harmony\'s new world, and where Vin and Elend are buried.', {
      region: 'Elendel',
      bio: 'The field where the survivors of the Catacendre came up out of the caverns into the world Harmony had remade. Vin and Elend lie in a crypt beneath statues of the Ascendant Warrior and the Last Emperor, set over the way down to the storage caches and the kandra Homeland, and a hot spring keeps it in marewill flowers all year. Elendel grew around it: it is the hub its canals radiate from, and Scadrial\'s prime meridian runs through it.', eraMaps: ['basin'], see: ['elendel', 'vin', 'elend'], wiki: 'Field_of_Rebirth' }),
  loc('hammondar-bay', 'Hammondar Bay', 'scadrial', 'mistborn2', 0.544, 0.292, '#38bdf8', 'sea',
    'The bay at Elendel where the Irongate runs into the Sea of Yomend. Named, presumably, for Ham.', {
      region: 'Elendel Basin',
      bio: 'The water west of Elendel, where the Irongate River ends and the Sea of Yomend begins; the name presumably remembers Hammond, Ham of Kelsier\'s crew.', arc: 'aol', eraMaps: ['basin'], see: ['elendel', 'irongate-river', 'ham'], wiki: 'Hammondar_Bay' }),
  loc('makabak', 'Makabak', 'roshar', 'stormlight', 0.34, 0.68, '#fbbf24', 'land',
    'The Azish imperial sphere: Azir and the Makabaki states that answer when the essays go out.', {
      bio: 'Not a country: the collective name for Azir and the states that orbit it — Emul, Tashikk, Yezier, Liafor, Alm, Desh, the Hexis and the rest. They answer Azimir\'s essays when it suits them, which is more often than an Alethi would expect and less often than Azir would like.', region: 'Makabak', see: ['azir'], wiki: 'Makabak' }),
  loc('makabakam', 'Makabakam', 'roshar', 'stormlight', 0.335, 0.655, '#f59e0b', 'land',
    'Ancient Silver Kingdom whose bones Azir still sits on. The Oathgate remembers the older name.', {
      region: 'Makabak',
      bio: 'One of the ten Silver Kingdoms of the Heraldic Epochs, and the ground Azir and its neighbours are built on.', see: ['makabak'], wiki: 'Makabakam' }),
  loc('tu-bayla', 'Tu Bayla', 'roshar', 'stormlight', 0.537, 0.518, '#a3e635', 'land',
    'A nation forming the Purelake\'s eastern shore, on the Veden border.', {
      region: 'Tu Bayla',
      bio: 'A nation along the eastern shore of the Purelake, bordering Jah Keved.', see: ['babatharnam', 'purelake'], wiki: 'Tu_Bayla' }),
  loc('triax', 'Triax', 'roshar', 'stormlight', 0.568, 0.663, '#86efac', 'land',
    'A small kingdom on the Tarat Sea between Jah Keved and Tu Fallia.', {
      region: 'Triax',
      bio: 'A small kingdom on the Tarat Sea, between Jah Keved and Tu Fallia: a bottleneck for anyone crossing the south of Roshar by land.', see: ['purelake', 'marabethia'], wiki: 'Triax' }),
  loc('alm', 'Alm', 'roshar', 'stormlight', 0.263, 0.651, '#f9a8d4', 'land',
    'A small Makabaki state on Azir\'s western fringe.', {
      region: 'Makabak',
      bio: 'One of the smallest kingdoms of the Makabak region. Lift liked it, since relatively few people there tried to murder her.', see: ['azir', 'liafor'], wiki: 'Alm' }),
  loc('desh', 'Desh', 'roshar', 'stormlight', 0.318, 0.558, '#fda4af', 'land',
    'Another Makabaki neighbour of Azir, folded into the empire\'s paperwork more than its armies.', {
      region: 'Makabak',
      bio: 'An Azish neighbour absorbed more by paperwork than by conquest. Desh pays what Azimir asks and argues about the arithmetic afterwards, in writing, at length.', see: ['azir', 'steen'], wiki: 'Desh' }),
  loc('yezier', 'Yezier', 'roshar', 'stormlight', 0.305, 0.627, '#fdba74', 'land',
    'A Makabaki kingdom between Desh, Azir, Tashikk and Liafor.', {
      region: 'Makabak',
      bio: 'A Makabaki kingdom with Desh to its north, Azir to the east, and Tashikk and Liafor to the south.', see: ['azir'], wiki: 'Yezier' }),
  loc('rishir', 'Rishir', 'roshar', 'stormlight', 0.42, 0.285, '#fbcfe8', 'land',
    'Ancient Silver Kingdom of the northern coast. Kurth was its capital and still holds its Oathgate.', {
      region: 'Rishir',
      bio: 'One of the northern Silver Kingdoms, with its Oathgate at Kurth. Its lands became Herdaz and the Reshi Isles; Kurth itself was taken over by Rira.', see: ['kurth'], wiki: 'Rishir' }),
  loc('sela-tales', 'Sela Tales', 'roshar', 'stormlight', 0.355, 0.48, '#c4b5fd', 'land',
    'Silver Kingdom of the west-central plains. Panatham keeps its Oathgate.', {
      region: 'Sela Tales',
      bio: 'A Silver Kingdom of the west-central plains that claimed the Purelake, Marabethia, Babatharnam and Yulay, gone for four thousand years. Panatham still stands on its Oathgate.', see: [], wiki: 'Sela_Tales' }),
  loc('bavland', 'Bavland', 'roshar', 'stormlight', 0.598, 0.567, '#a8a29e', 'land',
    'Mining country in the mountains of south-western Jah Keved.', {
      bio: 'An autonomous corner of Jah Keved at the base of the mountains: mines, small towns, and nobody\'s priority. Szeth passed between masters here as a Truthless, once for a sack of seeds.', arc: 'twok', region: 'Jah Keved', see: ['jah-keved', 'shinovar'], wiki: 'Bavland' }),
  loc('peak-oceans', 'Horneater Oceans', 'roshar', 'stormlight', 0.672, 0.528, '#67e8f9', 'lake',
    'Thermal oceans cupped between the Horneater Peaks. Cultivation\'s Perpendicularity opens in their heat.', { arc: 'wor', region: 'Horneater Peaks', see: ['horneater-peaks'], wiki: 'Horneater_Oceans', bio: 'Rock\'s people farm the shores and swim water that would scald a lowlander. The pool at the heart is not for swimming.' }),
  loc('sea-of-spears', 'Sea of Spears', 'roshar', 'stormlight', 0.82, 0.68, '#38bdf8', 'sea',
    'A large inland sea in south-eastern Alethkar.', {
      bio: 'An inland body of water in south-eastern Alethkar; Rathalas, the Rift, stands at its northern tip.', region: 'Alethkar', see: ['alethkar'], wiki: 'Sea_of_Spears' }),
  loc('tarat-sea', 'Tarat Sea', 'roshar', 'stormlight', 0.607, 0.712, '#67e8f9', 'sea',
    'The sea Kharbranth sits on.', {
      region: 'Tarat Sea',
      bio: 'A sea so sheltered that Kharbranth\'s bells were first hung to warn of highstorms its soft winds would not announce.', see: ['kharbranth'], wiki: 'Tarat_Sea' }),
  loc('steamwater-ocean', 'Steamwater Ocean', 'roshar', 'stormlight', 0.818, 0.194, '#7dd3fc', 'sea',
    'Northern ocean beyond the Reshi Sea.', {
      region: 'Steamwater Ocean',
      bio: 'The northern ocean beyond the Reshi Sea.', see: ['purelake', 'reshi-isles'], wiki: 'Steamwater_Ocean' }),
  loc('reshi-sea', 'Reshi Sea', 'roshar', 'stormlight', 0.491, 0.332, '#4ade80', 'sea',
    'Shallow seas of the Reshi Isles, where islands walk and greatshells decide the borders.', {
      region: 'Reshi Isles',
      bio: 'The shallow water the Reshi Isles wander through. Charting it is a matter of opinion, since the islands are alive and have their own views about where the borders go this season.', see: ['reshi-isles'], wiki: 'Reshi_Sea' }),
  loc('southern-depths', 'The Southern Depths', 'roshar', 'stormlight', 0.55, 0.92, '#1e3a8a', 'sea',
    'Deep water south of Thaylenah. Highstorms are born far east; down here the seas just take.', {
      region: 'The Southern Depths',
      bio: 'Deep water south of Thaylenah, past where the shelf drops away. The highstorms are born far east of here; the Depths are simply cold, and old, and take what goes into them.', see: ['the-origin'] }),
  loc('windrunner-river', 'Windrunner River', 'roshar', 'stormlight', 0.77, 0.48, '#38bdf8', 'canal',
    'The longest river in northern Alethkar, named for the Order of Windrunners.', {
      bio: 'It runs north-west past Hearthstone to the Bay of Elibath, and it carries the name of the Windrunners, one of the memories of the Radiants still left on the map.', region: 'Alethkar', see: ['alethkar', 'hearthstone'], wiki: 'Windrunner_River' }),
  loc('deathbend-river', 'Deathbend River', 'roshar', 'stormlight', 0.79, 0.56, '#64748b', 'canal',
    'A river of southern Alethkar, running through the Eastern Crownlands into Mevan Bay.', {
      bio: 'A southern Alethi river. Gavilar first met the listeners while exploring one of its tributaries.', region: 'Alethkar', see: ['alethkar'], wiki: 'Deathbend_River' }),
  loc('iriali-long-trail', 'The Long Trail', 'roshar', 'stormlight', 0.3, 0.22, '#fde68a', 'land',
    'The Iriali path through worlds. Iri is one stop; the Next Land is always further on.', { region: 'Iri', see: ['iri', 'rall-elorim'], wiki: 'Iriali', bio: 'Golden-haired pilgrims who treat continents as waystations. When the time comes, they leave.' }),
  loc('abamabar', 'Abamabar', 'roshar', 'stormlight', 0.52, 0.62, '#a8a29e', 'city',
    'Wherever Nohadon walked from to reach Urithiru. The parable survived; the road did not.', {
      region: 'The Heraldic Epochs',
      bio: 'The city Nohadon walked from when he walked to Urithiru — the walk that became The Way of Kings and the parable Dalinar cannot stop rereading. Where Abamabar was is an open question; whether the walk happened as written is a better one.', see: [], wiki: 'Abamabar' }),
  loc('shin-monasteries', 'The Shin Monasteries', 'roshar', 'stormlight', 0.21, 0.42, '#86efac', 'keep',
    'The Monasteries of Truth: Shinovar\'s watchtower-fortresses, one to each Herald, where the Honorbearers kept the Honorblades.', {
      arc: 'wat', bio: 'Ten monasteries, one dedicated to each Herald, built tall and stone as watchtowers and fortresses, and the seat of both Shin government and Stone Shamanism. Szeth\'s pilgrimage in Wind and Truth took him from one to the next, beating each Honorbearer in turn.', region: 'Shinovar', see: ['monastery-of-truth', 'honorbearers', 'shinovar'], wiki: 'Monastery_of_Truth' }),
  loc('stone-shamanate', 'The Stone Shamanate', 'roshar', 'stormlight', 0.225, 0.455, '#a3e635', 'scroll',
    'Ruling clergy of Shinovar. They named Szeth Truthless and pretended that settled it.', {
      bio: 'Shinovar\'s ruling clergy, who keep the Blades, name the Truthless and decide what the stone means. They declared Szeth Truthless and sent him out with an Honorblade.',
      // Why — the Voidbringers he said would return — is Words of Radiance (i-14), on Szeth's face there.
      region: 'Shinovar', see: ['shinovar'], wiki: 'Stone_Shamanism' }),
  loc('kholin-princedom', 'Kholin Princedom', 'roshar', 'stormlight', 0.795, 0.47, '#3b82f6', 'crown',
    'Eastern Alethkar under House Kholin. Kholinar is the seat.', {
      bio: 'Eastern Alethkar under House Kholin, with Kholinar for its seat and the windblades for a wall. Dalinar spent his youth conquering the rest of Alethkar for his brother.', region: 'Alethkar', see: ['kholinar', 'alethkar'], wiki: 'Kholin_princedom' }),
  loc('sadeas-princedom', 'Sadeas Princedom', 'roshar', 'stormlight', 0.74, 0.42, '#ef4444', 'keep',
    'Northwestern Alethkar. Torol Sadeas held it like a blade and aimed it at everyone else.', {
      bio: 'Northwestern Alethkar, held by Torol Sadeas as an instrument rather than a home. Gavilar\'s oldest friend and Dalinar\'s oldest problem; his bridge crews were a policy, and Bridge Four came out of it in spite of him.', region: 'Alethkar', see: ['alethkar', 'hearthstone'], wiki: 'Sadeas_princedom' }),
  loc('roion-princedom', 'Roion Princedom', 'roshar', 'stormlight', 0.81, 0.4, '#60a5fa', 'land',
    'An Alethi princedom under Highprince Roion.', {
      bio: 'A princedom under a highprince who was never the strongest voice in the room and knew it.', arc: 'twok', region: 'Alethkar', see: ['alethkar'], wiki: 'Roion_princedom' }),
  loc('aladar-princedom', 'Aladar Princedom', 'roshar', 'stormlight', 0.75, 0.48, '#818cf8', 'land',
    'One of the most northern Alethi princedoms, on the Bay of Elibath.', {
      bio: 'A northern princedom on the Bay of Elibath, under a highprince who took longer than was comfortable to decide that Dalinar was right.', region: 'Alethkar', see: ['alethkar'], wiki: 'Aladar_princedom' }),
  loc('ruthar-princedom', 'Ruthar Princedom', 'roshar', 'stormlight', 0.77, 0.54, '#c084fc', 'land',
    'Western Alethkar, on the Veden border.', {
      bio: 'A western princedom on the border with Jah Keved, under a highprince who opposes Dalinar and says so.', arc: 'twok', region: 'Alethkar', see: ['alethkar'], wiki: 'Ruthar_princedom' }),
  loc('sebarial-princedom', 'Sebarial Princedom', 'roshar', 'stormlight', 0.8, 0.56, '#f59e0b', 'land',
    'Southern princedom of merchants and excuses. Sebarial preferred profit to glory and survived both.', {
      bio: 'A southern princedom run on ledgers by a highprince nobody took seriously, which turned out to be an advantage. Sebarial brought merchants to the warcamps instead of glory, fed half the army, and survived a war his more martial peers did not.', region: 'Alethkar', see: ['alethkar', 'warcamps'], wiki: 'Sebarial_princedom' }),
  loc('thanadal-princedom', 'Thanadal Princedom', 'roshar', 'stormlight', 0.73, 0.5, '#fb7185', 'land',
    'Alethi princedom that played the warcamps carefully and still lost the larger game.', {
      bio: 'An Alethi princedom that played the warcamps carefully, sold what it could and committed to nothing. It kept its highprince alive longer than most and lost the larger game anyway.', region: 'Alethkar', see: ['alethkar', 'warcamps'], wiki: 'Thanadal_princedom' }),
  loc('hatham-princedom', 'Hatham Princedom', 'roshar', 'stormlight', 0.76, 0.45, '#fdba74', 'land',
    'An Alethi princedom of careful politics.', {
      bio: 'A princedom of careful politics under a highprince who collects obligations the way others collect debts.', region: 'Alethkar', see: ['alethkar'], wiki: 'Hatham_princedom' }),
  loc('bethab-princedom', 'Bethab Princedom', 'roshar', 'stormlight', 0.785, 0.51, '#a78bfa', 'land',
    'Princedom often named beside Thanadal\'s. Another banner on the Plains.', {
      bio: 'One of the ten, usually named beside Thanadal\'s and rarely for its own sake. Another banner on the Plains, another crater full of a princedom\'s pride.', region: 'Alethkar', see: ['alethkar', 'warcamps'], wiki: 'Bethab_princedom' }),
  loc('vamah-princedom', 'Vamah Princedom', 'roshar', 'stormlight', 0.72, 0.46, '#94a3b8', 'land',
    'Western Alethkar, on the Veden border. Revolar is its seat.', {
      bio: 'A western princedom bordering Jah Keved, seated at Revolar, under a highprince whose instinct in any crisis is to keep his head down until the arithmetic is clear.', region: 'Alethkar', see: ['alethkar', 'herdaz'], wiki: 'Vamah_princedom' }),
  loc('sea-of-lost-lights', 'Sea of Lost Lights', 'roshar', 'stormlight', 0.7, 0.65, '#312e81', 'sea',
    'Rosharan Shadesmar\'s dark ocean of beads. Ships sail the souls of objects; the shores are wrong.', {
      region: 'Shadesmar',
      bio: 'The ocean of Rosharan Shadesmar: a shore-to-horizon field of glass beads, each the soul of some object in the Physical Realm, that a ship sails across as if it were water. Land over there is where sea is here. Pick a bead up and you can hear what it is.', arc: 'oathbringer', realm: 'cognitive', see: ['celebrant'], wiki: 'Sea_of_Lost_Lights' }),
  loc('expanse-of-the-vapors', 'Expanse of the Vapors', 'roshar', 'stormlight', 0.25, 0.5, '#64748b', 'storm',
    'Cognitive expanse toward Scadrial. Mist instead of beads, and a different world\'s logic underneath.', {
      region: 'Shadesmar',
      bio: 'The Cognitive expanse that leads toward Scadrial, where the beads give out and mist takes over — another world\'s rules bleeding into this one\'s subastral. Worldhoppers use it as a road; nothing about it is comfortable.', arc: 'oathbringer', realm: 'cognitive', see: ['celebrant'], wiki: 'Expanse_of_the_Vapors' }),
  loc('expanse-of-vibrance', 'Expanse of Vibrance', 'roshar', 'stormlight', 0.55, 0.35, '#f472b6', 'storm',
    'Cognitive expanse associated with Nalthis — colour thick enough to feel like weather.', {
      region: 'Shadesmar',
      bio: 'The expanse toward Nalthis, where colour thickens until it has weight and weather. Awakeners find it exhilarating and everyone else finds it exhausting.', realm: 'cognitive', see: [], wiki: 'Expanse_of_Vibrance', canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'] }),
  loc('expanse-of-broken-sky', 'Expanse of the Broken Sky', 'roshar', 'stormlight', 0.45, 0.85, '#1e293b', 'storm',
    'A Shadesmar expanse that corresponds to Taldain.', {
      region: 'Shadesmar',
      bio: 'The Expanse of the Broken Sky in Shadesmar, which corresponds to Taldain. A bearing rather than a destination.', realm: 'cognitive', see: [], wiki: 'Expanse_of_the_Broken_Sky' }),
  loc('riino-lighthouse', 'Riino\'s Lighthouse', 'roshar', 'stormlight', 0.76, 0.66, '#fbbf24', 'tower',
    'A lighthouse in Shadesmar kept by an Elantrian of the Ire.', {
      region: 'Shadesmar',
      bio: 'A lighthouse standing on the bead ocean, kept by Riino, an Elantrian of the Ire who used to be Hoed, a long way from Arelon. He sells glimpses of the future.', arc: 'oathbringer', realm: 'cognitive', see: ['celebrant', 'elantris-city'], wiki: 'Riino' }),
  loc('shadesmar-kholinar', 'Kholinar Oathgate (Shadesmar)', 'roshar', 'stormlight', 0.793, 0.5, '#f472b6', 'gem',
    'The Cognitive side of Kholinar\'s Oathgate. Control here is control of the city\'s throat.', {
      region: 'Shadesmar',
      bio: 'The Cognitive side of Kholinar\'s Oathgate. Sja-anat had corrupted the gate\'s spren, and when Kaladin\'s strike team tried to use it, it dropped them into Shadesmar instead.', arc: 'oathbringer', realm: 'cognitive', see: ['kholinar', 'sea-of-lost-lights'] }),
  loc('honorspren-ships', 'Honorspren Ships', 'roshar', 'stormlight', 0.4, 0.78, '#fbbf24', 'ship',
    'Honorspren fleets that patrol toward Lasting Integrity. Not every spren ship wants passengers.', {
      region: 'Shadesmar',
      bio: 'Honorspren vessels patrolling the approaches to Lasting Integrity, crewed by spren with opinions about who deserves passage. After the Recreance those opinions hardened into policy, and the policy is mostly \'no\'.', arc: 'oathbringer', realm: 'cognitive', see: ['lasting-integrity'] }),
  loc('dominance-of-the-center', 'Central Dominance', 'scadrial', 'mistborn1', 0.636, 0.589, '#d6a44c', 'land',
    'Heart of the Final Empire, with Luthadel at its centre.', {
      region: 'Central Dominance',
      bio: 'The heart of the Final Empire: Luthadel at its centre, the Pits of Hathsin and the Arguois caverns in the hills to the north, and Lake Tyrian to the west.', eraMaps: ['ash'], see: ['luthadel', 'pits-of-hathsin'], wiki: 'Central_Dominance' }),
  loc('northern-dominance', 'Northern Dominance', 'scadrial', 'mistborn1', 0.799, 0.338, '#60a5fa', 'land',
    'Urteau\'s country, with the Ashmount Kalling.', {
      region: 'Northern Dominance',
      bio: 'The Dominance north-east of Luthadel, ruled from Urteau, House Venture\'s home city. Its one Ashmount is Kalling.', eraMaps: ['ash'], see: ['urteau'], wiki: 'Northern_Dominance' }),
  loc('western-dominance', 'Western Dominance', 'scadrial', 'mistborn1', 0.493, 0.235, '#f59e0b', 'land',
    'Cett\'s country after the Collapse.', {
      region: 'Western Dominance',
      bio: 'Cett\'s country after the Collapse, ruled from Fadrex City because its rocks made it easier to defend than Tremredare. Yomen took it from him while he was away at Luthadel.', arc: 'hoa', eraMaps: ['ash'], see: ['fadrex'], wiki: 'Western_Dominance' }),
  loc('southern-dominance', 'Southern Dominance', 'scadrial', 'mistborn1', 0.342, 0.601, '#a8a29e', 'land',
    'The south of the empire, down to the Southern Sea.', {
      region: 'Southern Dominance',
      bio: 'The south of the Final Empire, down to the Southern Sea, with two Ashmounts, Zerinah and Doriel. Vetitan and Lekal City are here.', arc: 'hoa', eraMaps: ['ash'], see: ['vetitan', 'ashmount-zerinah', 'ashmount-doriel'], wiki: 'Southern_Dominance' }),
  loc('eastern-dominance', 'Eastern Dominance', 'scadrial', 'mistborn1', 0.759, 0.781, '#94a3b8', 'land',
    'The Final Empire\'s south-eastern reaches.', {
      region: 'Eastern Dominance',
      bio: 'The south-eastern reaches of the Final Empire, out toward the Crescent Dominance, with the Ashmount Faleast on their western side.', eraMaps: ['ash'], see: ['dominance-of-the-center'], wiki: 'Eastern_Dominance' }),
  loc('farmost-dominance', 'Farmost Dominance', 'scadrial', 'mistborn1', 0.275, 0.226, '#78716c', 'land',
    'The empire\'s far western edge, behind the mountains.', {
      region: 'Farmost Dominance',
      bio: 'The far western edge of the Final Empire: a strip of coast beyond the mountains west of the Western Dominance.', eraMaps: ['ash'], wiki: 'Farmost_Dominance' }),
  loc('keep-venture', 'Keep Venture', 'scadrial', 'mistborn1', 0.625, 0.509, '#d6a44c', 'keep',
    'House Venture\'s keep in Luthadel. Elend grew up inside its politics.', {
      bio: 'The grandest keep in Luthadel and House Venture\'s seat: a vast hall of stained glass showing the Lord Ruler and the Deepness. Straff ran it as a study in cruelty; his son Elend read forbidden books at its balls.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel', 'straff-venture', 'elend'], wiki: 'Keep_Venture' }),
  loc('keep-lekal', 'Keep Lekal', 'scadrial', 'mistborn1', 0.613, 0.526, '#e8b86d', 'keep',
    'House Lekal\'s keep: the best stained glass in Luthadel, and walls meant for war.', {
      bio: 'House Lekal\'s keep, near Keep Venture and walled, unusually, for defence. Its stained glass is the finest in Luthadel and its pyramid-shaped ballroom stands on five platforms.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel', 'jastes-lekal'], wiki: 'Keep_Lekal' }),
  loc('keep-erikeller', 'Keep Erikeller', 'scadrial', 'mistborn1', 0.633, 0.521, '#a8a29e', 'keep',
    'House Erikeller\'s keep, on the west bank of the Channerel.', {
      bio: 'Seat of House Erikeller, sixth of Luthadel\'s ten Great Houses: weapon-makers, known for their dueling canes and for the Mistborn they produce. The keep stands on the western side of the River Channerel.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel'], wiki: 'Keep_Erikeller' }),
  loc('keep-hasting', 'Keep Hasting', 'scadrial', 'mistborn1', 0.608, 0.506, '#fbbf24', 'keep',
    'House Hasting\'s seat: a great tower ringed by six more.', {
      bio: 'A great tower ringed by six smaller ones, joined by walltop walkways, with the ballroom at the very top reached by skaa-worked lifts. House Hasting is second only to Venture.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel', 'telden-hasting'], wiki: 'Keep_Hasting' }),
  loc('keep-tekiel', 'Keep Tekiel', 'scadrial', 'mistborn1', 0.628, 0.531, '#94a3b8', 'keep',
    'House Tekiel\'s keep in Luthadel, where Kelsier left a dead Entrone in the gardens.', {
      bio: 'House Tekiel\'s keep in Luthadel: fourth of the Great Houses and an ally of House Entrone. Kelsier left Charrs Entrone\'s body in its gardens to start the houses killing each other.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel', 'charrs-entrone'], wiki: 'Keep_Tekiel' }),
  loc('fellise', 'Fellise', 'scadrial', 'mistborn1', 0.608, 0.520, '#c4b5fd', 'city',
    'A city just outside Luthadel where Vin lived as Valette Renoux.', {
      region: 'Central Dominance',
      bio: 'A small city just outside Luthadel where "Lord Renoux" kept his mansion, and where Vin lived as Valette Renoux — a country noblewoman with a made-up family, learning to be someone in rooms she could have killed.', arc: 'tfe', eraMaps: ['ash'], see: ['luthadel', 'lord-renoux'], wiki: 'Fellise' }),
  loc('holstep', 'Holstep', 'scadrial', 'mistborn1', 0.609, 0.457, '#a8a29e', 'city',
    'The town whose garrison Yeden\'s army took — and then lost everything on the way back.', {
      region: 'Central Dominance',
      bio: 'A town north of Luthadel along the canals. Yeden\'s army took its garrison in a night raid and was wiped out on the march back by the Valtroux garrison; his head was left on a spear by the road.', arc: 'tfe', eraMaps: ['ash'], see: ['luthadel', 'yeden'], wiki: 'Holstep' }),
  loc('kandra-homeland', 'The Kandra Homeland', 'scadrial', 'mistborn1', 0.577, 0.437, '#a3e635', 'keep',
    'The kandra\'s hidden city, in the hills between Hathsin and the Arguois caverns.', {
      region: 'Central Dominance', arc: 'hoa', eraMaps: ['ash'], see: ['pits-of-hathsin', 'arguois-caverns', 'tensoon', 'kanpaar'], wiki: 'Kandra_Homeland',
      bio: 'The kandra\'s caverns, in the same mountains as the Arguois caverns and the Pits of Hathsin, where the First Generation sit in judgment in the Trustwarren. TenSoon was tried here, KanPaar\'s Seconds seized it, and under its floor lay the Trust.' }),
  loc('well-of-ascension', 'The Well of Ascension', 'scadrial', 'mistborn1', 0.623, 0.511, '#e0f2fe', 'crystal',
    'The pool beneath Kredik Shaw. Power enough to remake the world — or free what was trapped there.', {
      region: 'Luthadel', arc: 'woa', eraMaps: ['ash'], see: ['kredik-shaw', 'luthadel'], wiki: 'Well_of_Ascension',
      bio: 'A pool of power that fills every thousand years, hidden under Kredik Shaw. Rashek took it and kept it. Vin took it and let it go, which is what the thing trapped in it had wanted all along.' }),
  loc('arguois-caverns', 'Arguois Caverns', 'scadrial', 'mistborn1', 0.619, 0.405, '#78716c', 'rock',
    'Caves north of Luthadel where Kelsier\'s skaa army hid and trained.', {
      region: 'Central Dominance',
      bio: 'A cave system north of Luthadel, between the city and the Pits, reached through three rends in the ground. The skaa rebellion hid and trained an army of seven thousand there, and the Lord Ruler never managed to raid it.', eraMaps: ['ash'], see: ['luthadel', 'yeden', 'ham'], wiki: 'Arguois_Caverns' }),
  loc('ashmount-tyrian', 'Ashmount Tyrian', 'scadrial', 'mistborn1', 0.554, 0.481, '#ef4444', 'fire',
    'The Ashmount in Lake Tyrian, just west of Luthadel.', {
      region: 'Central Dominance',
      bio: 'One of the Ashmounts whose ash falls on the Final Empire every day, standing in the middle of Lake Tyrian just west of Luthadel.', eraMaps: ['ash'], see: ['dominance-of-the-center'], wiki: 'Ashmounts' }),
  loc('ashmount-zerinah', 'Ashmount Zerinah', 'scadrial', 'mistborn1', 0.472, 0.639, '#f97316', 'fire',
    'One of the Southern Dominance\'s two Ashmounts, south-west of Luthadel.', {
      region: 'Southern Dominance',
      bio: 'An Ashmount of the Southern Dominance, south-west of Luthadel near the Southern Sea.', eraMaps: ['ash'], wiki: 'Ashmounts' }),
  loc('ashmount-doriel', 'Ashmount Doriel', 'scadrial', 'mistborn1', 0.575, 0.762, '#dc2626', 'fire',
    'The Ashmount by the Southern Sea, south-south-west of Luthadel.', {
      region: 'Southern Dominance',
      bio: 'The second Ashmount of the Southern Dominance, near the coast of the Southern Sea, south-south-west of Luthadel.', eraMaps: ['ash'], wiki: 'Ashmounts' }),
  loc('ashmount-torinost', 'Ashmount Torinost', 'scadrial', 'mistborn1', 0.550, 0.278, '#b91c1c', 'fire',
    'A Western Dominance Ashmount, north-north-west of Luthadel.', {
      region: 'Western Dominance',
      bio: 'One of the Western Dominance\'s two Ashmounts, with Morag, standing north-north-west of Luthadel.', eraMaps: ['ash'], wiki: 'Ashmounts' }),
  loc('river-channerel', 'River Channerel', 'scadrial', 'mistborn1', 0.593, 0.569, '#64748b', 'canal',
    'The river through Luthadel, south to Austrex and the Southern Sea.', {
      region: 'Central Dominance',
      bio: 'The great river of the Final Empire\'s heartland: down out of the north past Tathingdwen, through Luthadel, and on south past Austrex to the Southern Sea.', eraMaps: ['ash'], see: ['luthadel', 'austrex'], wiki: 'River_Channerel' }),
  loc('austrex', 'Austrex', 'scadrial', 'mistborn1', 0.547, 0.612, '#94a3b8', 'city',
    'A city of the Southern Dominance on the River Channerel, south of Luthadel.', {
      region: 'Southern Dominance',
      bio: 'A city on the River Channerel south of Luthadel, where the river and the canals meet on their way to the Southern Sea.', eraMaps: ['ash'], see: ['southern-dominance', 'river-channerel'], wiki: 'Austrex' }),
  loc('elendel-basin', 'Elendel Basin', 'scadrial', 'mistborn2', 0.583, 0.292, '#86efac', 'land',
    'Harmony\'s garden: a fertile ring of land around Elendel, walled by mountains.', {
      region: 'Elendel Basin',
      bio: 'The land Harmony gave the survivors when he remade the world: a broad fertile bowl ringed by the Channerel, Faleast and Seran ranges, with Elendel on its western shore and the Outer Cities spread across it. Three centuries on it is crowded, rail-laced and rich, and the Roughs beyond its rim do not think much of it.', eraMaps: ['basin'], see: ['elendel', 'the-roughs', 'seran-mountains'], wiki: 'Elendel_Basin' }),
  loc('irongate-river', 'Irongate River', 'scadrial', 'mistborn2', 0.604, 0.291, '#64748b', 'canal',
    'The Basin\'s great river, running west through Steinel and Dryport into Elendel.', {
      region: 'Elendel Basin',
      bio: 'The river that crosses the Basin from the east, past Steinel and Dryport, with the railway beside it most of the way, and runs out at Elendel into Hammondar Bay.', eraMaps: ['basin'], see: ['elendel', 'steinel', 'dryport', 'hammondar-bay'], wiki: 'Irongate_River' }),
  loc('rashekin', 'Rashekin', 'scadrial', 'mistborn2', 0.586, 0.279, '#e8b86d', 'city',
    'A Basin city named, presumably, for Rashek — and a training ground for the Set.', {
      region: 'Elendel Basin',
      bio: 'A city on the line that runs north-east from Elendel toward the Faleast Range, presumably named for Rashek, who became the Lord Ruler. It is reckoned outside the direct reach of Elendel\'s government, which is why the Set kept a compound there for training recruits.', arc: 'bom', eraMaps: ['basin'], see: ['elendel-basin', 'the-set', 'lord-ruler'], wiki: 'Rashekin' }),
  // Dulsing is off the Basin survey too: fifty miles north-east of New Seran,
  // at the foot of the Seran Range. The pin is that distance from New Seran's.
  loc('dulsing', 'Dulsing', 'scadrial', 'mistborn2', 0.616, 0.331, '#94a3b8', 'village',
    'A farming village under the Seran Range where a Malwish airship came down, and the Set moved in.', {
      region: 'Elendel Basin',
      bio: 'A remote farming village at the foot of the Seran Range, about fifty miles north-east of New Seran, with a waterfall turned into a turbine. The airship Brunstell crashed there searching the mountains for the Sovereign\'s temple; the villagers helped, and then the Set arrived, caged the crew, tore the village down and built a walled compound with a hangar to take the ship apart. Wax found Telsin held there.', arc: 'bom', eraMaps: ['basin'], see: ['new-seran', 'allik', 'irich', 'telsin', 'sovereign-temple'], wiki: 'Dulsing' }),
  loc('elendel-university', 'Elendel University', 'scadrial', 'mistborn2', 0.561, 0.297, '#d6a44c', 'scroll',
    'Where Marasi studied criminal behaviour and joined the ladies\' target club.', {
      bio: 'A large campus in Elendel, with schools of engineering and mathematics among others, a High Imperial motto on its gates that Wayne translates into something about hungry souls, and men and women housed separately. Marasi read legal justice and criminal behaviour here and learned to shoot in the ladies\' target club.', eraMaps: ['basin'], region: 'Elendel', see: ['elendel', 'marasi'], wiki: 'Elendel_University' }),
  loc('the-community', 'The Community', 'scadrial', 'mistborn2', 0.539, 0.303, '#9333ea', 'keep',
    'A town the Set built in the caverns under Bilming, and told its prisoners the ash had come back.', {
      region: 'Bilming', arc: 'tlm', eraMaps: ['basin'], see: ['bilming', 'armal', 'gave-entrone', 'the-set'], wiki: 'Community',
      bio: 'A synthesized town in the caverns beneath Bilming, built by the Set as a supply of Allomancers for its experiments. Its people were kidnapped metalborn, told they had been chosen by lottery to survive the return of the ash; outsiders were "ash-sick", and Hemalurgic "metal mutants" sniffed out anyone keeping metal. Gave Entrone was its mayor. Under his mansion was a glowing pool that Autonomy\'s army meant to come through, until Marasi and the Community\'s Allomancers burned its power away.' }),
  loc('seran-mountains', 'Seran Range', 'scadrial', 'mistborn2', 0.624, 0.322, '#a8a29e', 'peak',
    'The mountains at the Basin\'s south-eastern rim. The Sovereign hid the Bands of Mourning in them.', {
      region: 'Elendel Basin',
      bio: 'The range along the Basin\'s south-eastern rim, with the Southern Roughs beyond and New Seran and Dulsing at its feet. Somewhere high in it the Sovereign\'s priests built a temple to keep the Bands of Mourning until he came back.', arc: 'bom', eraMaps: ['basin'], see: ['new-seran', 'dulsing', 'sovereign-temple'], wiki: 'Seran_Range' }),
  loc('northern-roughs', 'Northern Roughs', 'scadrial', 'mistborn2', 0.586, 0.244, '#a8a29e', 'land',
    'The frontier north of the Basin rim. Wax\'s old patrol country.', {
      region: 'The Roughs',
      bio: 'The country north of the Basin\'s rim, between the Channerel and Faleast ranges and the Tyrian Sea: Weathering, Covingtar, True Madil, Far Dorest and a single railway. True Madil is the largest city; everything else is a siding, a mine or a ghost town like Feltrel.', arc: 'aol', eraMaps: ['basin'], see: ['the-roughs', 'weathering', 'true-madil', 'far-dorest'], wiki: 'Roughs' }),
  loc('southern-roughs', 'Southern Roughs', 'scadrial', 'mistborn2', 0.631, 0.327, '#78716c', 'land',
    'The frontier beyond the Seran Range.', {
      region: 'The Roughs',
      bio: 'The frontier on the far side of the Seran Range, south-east of the Basin, reached by the rail line through the mountains past New Seran.', eraMaps: ['basin'], see: ['the-roughs', 'seran-mountains', 'new-seran'], wiki: 'Roughs' }),
  loc('far-dorest', 'Far Dorest', 'scadrial', 'mistborn2', 0.626, 0.242, '#e8b86d', 'city',
    'A large Roughs town with one lawman, Jon Deadfinger, who nearly hanged Wayne.', {
      region: 'The Roughs',
      bio: 'A large town of the Northern Roughs, east of True Madil, kept for years by a single lawman: Jon Deadfinger, who worked with Miles and with Wax. Wayne was set to hang here for the murder he committed when he was young.', arc: 'aol', eraMaps: ['basin'], see: ['northern-roughs', 'true-madil', 'wayne'], wiki: 'Far_Dorest' }),
  loc('true-madil', 'True Madil', 'scadrial', 'mistborn2', 0.587, 0.238, '#e8b86d', 'city',
    'The largest city of the Northern Roughs. Miles Dagouter kept its law for fifteen years.', {
      region: 'The Roughs',
      bio: 'A city at the meeting of two rivers that flow down into the Basin, served by the only railway into the Northern Roughs; Drypost, the nearest Basin town, is about a hundred and twenty-five miles south. Miles Dagouter was its lawman for some fifteen years and kept an alliance with the lawmen of Weathering and Far Dorest, and he still carried a lighter with its seal when he was robbing trains.', arc: 'aol', eraMaps: ['basin'], see: ['miles-hundredlives', 'northern-roughs', 'weathering', 'far-dorest'], wiki: 'True_Madil' }),
  loc('feltrel', 'Feltrel', 'scadrial', 'mistborn2', 0.534, 0.241, '#a8a29e', 'home',
    'A Roughs ghost town of red clay, where Lessie died.', {
      region: 'The Roughs',
      bio: 'A town in the dry red-clay country of the Roughs that was booming around 320, with a hotel, a blacksmith and a chapel to the Survivor, and is empty now. Wax, Lessie and Donal\'s gang all tracked Bloody Tan here on the same day; it is where The Alloy of Law begins, and where Lessie died.', arc: 'aol', eraMaps: ['basin'], see: ['bloody-tan', 'wax', 'paalm', 'donal'], wiki: 'Feltrel' }),
  loc('covingtar', 'Covingtar', 'scadrial', 'mistborn2', 0.567, 0.233, '#e8b86d', 'home',
    'A Northern Roughs town between Weathering and True Madil.', {
      region: 'The Roughs',
      bio: 'A town on the northern line between Weathering and True Madil. When Wayne played the old woman Abrigain to pump a House Tekiel guard, Abrigain\'s grandson had a bride in Covingtar.', arc: 'aol', eraMaps: ['basin'], see: ['weathering', 'true-madil', 'wayne'], wiki: 'Covingtar' }),
  loc('callingfale', 'Callingfale', 'scadrial', 'mistborn2', 0.593, 0.220, '#e8b86d', 'home',
    'A Roughs town north of True Madil, east of the Tyrian Sea. Wayne got shot in the foot here.', {
      region: 'The Roughs',
      bio: 'A town in the Northern Roughs, north of True Madil and east of the Tyrian Sea, at the far end of the line. Wayne was once shot in the foot here, which he mentions.', arc: 'aol', eraMaps: ['basin'], see: ['true-madil', 'wayne'], wiki: 'Callingfale' }),
  loc('tathingdwel', 'Tathingdwel', 'scadrial', 'mistborn2', 0.543, 0.262, '#a3e635', 'city',
    'A Terris city of the Basin under the Channerel Range, named for the old capital.', {
      region: 'Elendel Basin',
      bio: 'A city south of the Channerel Range, presumably named for Tathingdwen, the Terris capital of the Final Empire, and mostly Terris. Steris used it to make a point about Elendel\'s reach: anyone who wants to sell metal in Tathingdwel has to go through Elendel to do it.', arc: 'aol', eraMaps: ['basin'], see: ['tathingdwen', 'mycondwel', 'elendel-basin'], wiki: 'Tathingdwel' }),
  loc('alendel', 'Alendel', 'scadrial', 'mistborn2', 0.570, 0.271, '#e8b86d', 'city',
    'A Basin city north-east of Elendel. Probably named for Alendi.', {
      region: 'Elendel Basin',
      bio: 'A city on the line north from Elendel toward Drypost and the Roughs. Its name is most likely Alendi\'s — the man who went to the Well of Ascension a thousand years before the Catacendre and did not come back from it.', arc: 'aol', eraMaps: ['basin'], see: ['alendi', 'elendel-basin'], wiki: 'Alendel',
      fieldNotes: { name: { canon: 'speculation', note: 'The survey names the city; who it is named for is a reading of the name, not something the books say.' } } }),
  loc('the-village', 'The Village', 'scadrial', 'mistborn2', 0.562, 0.302, '#a3e635', 'forest',
    'The Terris quarter of Elendel, in the Fifth Octant, where the Synod keeps its own peace.', {
      region: 'Elendel',
      bio: 'A Terris settlement inside Elendel, in the Fifth Octant: probably an ordinary street once, now overgrown into something like a forest because the Basin\'s soil is allowed to do as it likes there. The Synod and the city have an agreement that lets the Terris police themselves. Wax and Telsin grew up partly here; Wax left at fifteen, after Forch.', arc: 'sos', eraMaps: ['basin'], see: ['vwafendal', 'synod', 'idashwy', 'forch', 'elendel'], wiki: 'The_Village' }),
  loc('independence-tower', 'Independence Tower', 'scadrial', 'mistborn2', 0.538, 0.296, '#e11d48', 'tower',
    'Bilming\'s tallest skyscraper, called the Shaw. The Set\'s headquarters.', {
      region: 'Bilming',
      bio: 'A skyscraper in Bilming, usually called the Shaw after Kredik Shaw. By 348 the Set had taken it for a base and built a rocket on its roof. Wax and Wayne Pushed in halfway up and fought through the Hidden Guard, thirty stories of it, to reach Telsin at the top — where the bomb turned out to be a decoy, and Harmony cut her off from Autonomy.', arc: 'tlm', eraMaps: ['basin'], see: ['bilming', 'telsin', 'the-set', 'dumad', 'getruda'], wiki: 'Independence_Tower' }),
  // The temple is "in the Seran Range", hidden in tall mountains; no plate
  // marks it, so the pin sits in the range and claims no more than that.
  loc('sovereign-temple', 'The Sovereign\'s Temple', 'scadrial', 'mistborn2', 0.630, 0.318, '#fbbf24', 'keep',
    'The temple in the Seran Range where the Sovereign\'s priests kept the Bands of Mourning.', {
      region: 'Elendel Basin', arc: 'bom', eraMaps: ['basin'], see: ['seran-mountains', 'bands-of-mourning', 'dulsing', 'allik'], wiki: 'Sovereign%27s_temple',
      bio: 'The Sovereign left the south with a band of elite priests, built a temple hidden in the tall mountains of the Seran Range, and commanded them to guard the Bands of Mourning until he returned. Southern Scadrians took the stories as a challenge; one expedition of Hunters went to destroy it, mutinied over the Bands, lost most of its men to the traps and was executed at home. Wax, the Set and the Brunstell\'s survivors all reached it in the same few days.' }),
  loc('malwish-nations', 'Malwish Consortium', 'scadrial', 'mistborn2', 0.545, 0.700, '#64748b', 'land',
    'The southern nations under the Malwish banner: airships, medallions, masks.', {
      region: 'Southern Scadrial',
      bio: 'The heart of the Southern Continent. By The Lost Metal five southern nations have joined under the Malwish banner as the Malwish Consortium, each keeping its own leaders; the faction that unified them sees the north as chaotic and dangerous, and its new ambassador to Elendel is an admiral on a warship.', arc: 'tlm', eraMaps: ['basin'], see: ['southern-continent', 'malwish', 'admiral-daal'], wiki: 'Malwish_Consortium' }),
  loc('ladrian-mansion', 'Ladrian Mansion', 'scadrial', 'mistborn2', 0.551, 0.297, '#d6a44c', 'home',
    'House Ladrian\'s seat in Elendel. Wax came home to ledgers and left for bullets.', {
      bio: 'House Ladrian\'s seat in Elendel, and the ledgers Wax inherited along with a house in debt and a title he had not expected. Tillaume ran it, and tried to blow Wax up in it.', arc: 'aol', eraMaps: ['basin'], region: 'Elendel', see: ['elendel', 'house-ladrian', 'tillaume'], wiki: 'Ladrian_mansion' }),
  loc('teoin', 'Teoras', 'sel', 'elantris', 0.21, 0.27, '#818cf8', 'crown',
    'Capital of Teod. Sarene\'s home port, and the kingdom\'s answer to Fjorden\'s sermons.', {
      region: 'Teod',
      bio: 'Teod\'s capital: a forest-ringed seaport with the largest Korathi temple in the kingdom, and the city the Elantrians reach in time to break Fjorden\'s invasion.', see: ['teod'], wiki: 'Teoras', aliases: 'Teoin (first edition)' }),
  loc('widor', 'Widor', 'sel', 'elantris', 0.7, 0.36, '#ef4444', 'crown',
    'Capital of Fjorden and seat of Shu-Dereth\'s Wyrn. Gyorns leave from here; countries fall after.', {
      region: 'Fjorden',
      bio: 'Fjorden\'s capital and Wyrn\'s seat, where the gyorns are appointed and the next conversion is planned. Countries do not usually notice they are being taken until someone from Widor has already been living in their capital for a year.', see: ['fjorden', 'dakhor'], wiki: 'Widor' }),
  loc('hraggen', 'Hraggen', 'sel', 'elantris', 0.64, 0.4, '#f87171', 'land',
    'Small nation long under Fjorden. Its cooks are famous across Sel.', {
      region: 'Fjorden',
      bio: 'A Fjordell province, entirely Derethi and entirely certain about it. The certainty is the export.', see: ['fjorden'], wiki: 'Hraggen' }),
  loc('jaador', 'Jaador', 'sel', 'elantris', 0.66, 0.48, '#fb7185', 'land',
    'Nation under Fjorden\'s heel. Another conversion counted in Wyrn\'s ledgers.', {
      region: 'Opelon',
      bio: 'A landlocked nation of JinDo descent, annexed by the Fjordell Empire and Derethi by decree. Its chefs are among the best in the world, its wine is blue, and the syre Sarene fences with was born here.', see: ['fjorden', 'svorden'], wiki: 'Jaador' }),
  loc('dzhamar', 'Dzhamar', 'sel', 'emperorssoul', 0.76, 0.58, '#a78bfa', 'land',
    'Homeland of the Bloodsealers. Stamps that use blood instead of ink, and debts that collect themselves.', {
      region: 'Dzhamar',
      bio: 'A swampy region of the Rose Empire, homeland of the pale, red-eyed Bloodsealers. Other nations think the art sinister; the Grands hire it anyway. Dzhamarians and their neighbours the Strikers loathe each other.', see: ['rose-empire', 'maipon'], wiki: 'Dzhamar' }),
  loc('mulladil', 'Mulla\'dil', 'sel', 'emperorssoul', 0.74, 0.6, '#c084fc', 'land',
    'Mountain homeland of the Strikers — Grands\' bodyguards, and Shai\'s least favourite neighbours.', {
      region: 'Mulla\'dil',
      bio: 'An annexed mountain nation whose people the Grands renamed Strikers and hire as guards and soldiers; they keep their own language and find Dzhamar\'s Bloodsealing revolting. Zu is one.', see: ['rose-empire', 'dzhamar'], wiki: 'Mulla\'dil' }),
  loc('imperial-seat', 'The Imperial Seat', 'sel', 'emperorssoul', 0.8, 0.6, '#f472b6', 'crown',
    'Capital of the Rose Empire, where an emperor can be replaced by a well-written soul.', {
      region: 'Rose Empire', see: ['rose-empire'], wiki: 'Imperial_Seat', bio: 'The Arbiter\'s courts, the Grands\' factions, and a Forger in a cell who was the only person awake.' }),
  loc('lake-alonoe', 'Lake Alonoe', 'sel', 'elantris', 0.45, 0.4, '#67e8f9', 'lake',
    'Lake of Arelon near Elantris. Aonic geography written in water.', {
      region: 'Arelon',
      bio: 'A lake of Arelon near Elantris, part of the geography the Aons are drawn from: every Aon is a map of the land, and the land has to be right or the Dor does not answer.', see: ['elantris-city', 'arelon'], wiki: 'Lake_Alonoe' }),
  loc('opelon', 'Opelon', 'sel', 'elantris', 0.48, 0.5, '#a78bfa', 'land',
    'The continent of Arelon, Fjorden, and Teod\'s opposite shore — Sycla\'s other name in the west.', {
      region: 'Opelon',
      bio: 'The western continent — Arelon, Fjorden, Duladel and Teod\'s opposite shore. One landmass, three theologies and a thousand years of argument about which of them Shu-Keseg actually meant.', see: ['arelon', 'fjorden'], wiki: 'Opelon' }),
  loc('sycla', 'Sycla', 'sel', 'elantris', 0.62, 0.45, '#ef4444', 'land',
    'Fjordell name for the continent Opelon. Same land; different sermons.', {
      region: 'Opelon',
      bio: 'What Fjorden calls Opelon. Same rock, same coastline, different sermons — and which name a map uses tells you who drew it.', see: ['fjorden', 'opelon'], wiki: 'Sycla' }),
  loc('elantris-mountains', 'The Atad Mountains', 'sel', 'elantris', 0.5, 0.45, '#cbd5e1', 'peak',
    'Arelon\'s eastern wall. Their curve is in every Aon.', {
      region: 'Arelon',
      bio: 'The range along Arelon\'s border with Fjorden, called the Dathreki by the Fjordell, which for centuries kept Fjorden\'s armies out. Its curve is the right-hand stroke of Aon Aon, and the pool that dissolves Elantrians lies up the switchbacks south-east of the city.', see: ['elantris-city'], wiki: 'Atad_Mountains', aliases: 'Dathreki Mountains' }),
  loc('bevalis', 'Bevalis', 'nalthis', 'warbreaker', 0.47, 0.26, '#e2e8f0', 'crown',
    'Capital of Idris: a mountain-valley town of a few thousand, thatched cottages and mud roads.', {
      region: 'Idris',
      bio: 'Idris\'s capital: grey stone, high halls, and a king who traded a daughter for a peace he knew would not hold. Dedelin sent Siri because Vivenna was the one he could not bear to lose, which is the sort of arithmetic Idris does not admit to doing.', see: ['idris'], wiki: 'Bevalis' }),
  loc('inner-sea-nalthis', 'The Bright Sea', 'nalthis', 'warbreaker', 0.56, 0.5, '#67e8f9', 'sea',
    'The landlocked sea T\'Telir is built against. Idrians call it the Inner Sea.', {
      region: 'Nalthis',
      bio: 'A large inland sea east of Hallandren, which controls a third of its coast. T\'Telir sits in a bay on it and Tedradel lies across it; the Chedesh once sailed it west to find the valley. Idris, which has no coast, calls it the Inner Sea.', see: ['hallandren', 'idris'], wiki: 'Bright_Sea', aliases: 'Inner Sea' }),
  loc('highlands-idris', 'Idrian Highlands', 'nalthis', 'warbreaker', 0.48, 0.22, '#cbd5e1', 'peak',
    'Cold mountains of Austrism. Colour is sin; Breath is theology; Hallandren is downhill.', {
      region: 'Idris',
      bio: 'Cold mountains where Austrism holds that colour is indulgence, Awakening is theft, and Breath belongs to the person born with it. It is a real theology with real arguments, and Hallandren is always downhill from it in more than one sense.', see: ['idris', 'bevalis'], wiki: 'Idris' }),
  loc('tedradel', 'Tedradel', 'nalthis', 'warbreaker', 0.7, 0.48, '#f9a8d4', 'land',
    'Nation across the water that trades with Hallandren and stays politely unabsorbed.', {
      region: 'Nalthis',
      bio: 'A kingdom across the Bright Sea from Hallandren. It fought Hanald in the Manywar and still thinks little of Hallandren, though its traders crowd T\'Telir. It gets on well with Idris, and General Yarda thinks it might fight again if Idris is attacked.', see: ['hallandren'], wiki: 'Tedradel' }),
  loc('huth', 'Huth', 'nalthis', 'warbreaker', 0.45, 0.21, '#a8a29e', 'land',
    'Vanished kingdom of the Manywar. Pahn Kahl remembers; Hallandren paved it over.', {
      region: 'Nalthis',
      bio: 'A kingdom north of the Idrian mountains that Hanald invaded in the Manywar and that did not survive it — "destroyed by little drips of color", Hoid says. At the end of Warbreaker a tyrant is trying to restore Kuth and Huth, with Yesteel\'s help.', see: ['pahn-kahl', 'hallandren'], wiki: 'Huth' }),
  loc('kuth', 'Kuth', 'nalthis', 'warbreaker', 0.53, 0.21, '#78716c', 'land',
    'Sister-kingdom to Huth, also erased by the Manywar\'s arithmetic.', {
      region: 'Nalthis',
      bio: 'A kingdom north of the Idrian mountains that Hanald invaded in the Manywar and that did not survive it — "destroyed by little drips of color", Hoid says. At the end of Warbreaker a tyrant is trying to restore Kuth and Huth, with Yesteel\'s help.', see: ['huth', 'hallandren'], wiki: 'Kuth' }),
  loc('diem-site', 'The Diem', 'taldain', 'whitesand', 0.415, 0.475, '#fbbf24', 'tower',
    'Sand master fortress-guild in Kezare. Floors for ranks, and a roof that did not save them.', {
      region: 'Lossand',
      bio: 'A single block of white sandstone on Kezare\'s outskirts, older than the sand masters and impossible to wear down. It has no stairs; the upper floors were reachable only by mastery until Kenton ordered ladders. The Diem it houses is in debt, disliked, and about to be voted out of existence.', see: ['kezare', 'lossand'], wiki: 'Diem' }),
  loc('deep-sand', 'Deep Sand', 'taldain', 'whitesand', 0.35, 0.55, '#fde68a', 'land',
    'True desert beyond Lossand\'s settled rim. Sandlings hunt there; water is a rumour.', {
      region: 'Dayside',
      bio: 'The uninhabited deep sand east of Lossand, where sandlings grow large enough to be hunted from tonks. Raagent goes hunting there to avoid Kenton.', see: ['lossand', 'dayside'], wiki: 'Deep_Sand' }),
  loc('kerzt', 'Kerzta', 'taldain', 'whitesand', 0.28, 0.42, '#f59e0b', 'land',
    'Dayside nation of the Kerztian people, often at odds with Lossand over sand and faith.', {
      region: 'Dayside',
      bio: 'The Dayside nation west of Lossand, capital Ker Kedasha, whose king is chosen every fifty years. Its Ker\'reen priests call sand mastery heresy, the two nations have fought over it before, and the A\'kar\'s popularity is rising.', see: ['lossand', 'dayside'], wiki: 'Kerzta' }),
  loc('kerla', 'The Kerla', 'taldain', 'whitesand', 0.34, 0.44, '#d9f99d', 'land',
    'Not desert, by Dayside reckoning: shallow sand over dorim vines. The Diem meets here.', {
      region: 'Dayside', wiki: 'Kerla', see: ['kerzt', 'diem-site', 'diem'],
      bio: 'Dayside ground where the sand is only moderately deep and dorim vines run close beneath it, so life is plentiful and sandlings stay small. Most of Kerzta is Kerla. The Diem trains and holds its ceremonies here, and it was at an advancement ceremony in the Kerla that the Kerztians massacred it.' }),
  loc('lonzare', 'Lonzare', 'taldain', 'whitesand', 0.425, 0.485, '#818cf8', 'city',
    'Kezare\'s Darksider quarter, which the Dynasty would rather nobody knew about.', {
      region: 'Lossand',
      bio: 'The Darksider quarter of Kezare. Its existence surprises Khriss\'s party, since the Dynasty hides how much traffic crosses to Dayside. Khriss meets Loaten here, and first sees the Lord Beggar.', see: ['kezare', 'darkside'], wiki: 'Lonzare' }),
  loc('nortallon', 'Nor\'Tallon', 'taldain', 'whitesand', 0.7, 0.42, '#6366f1', 'land',
    'Capital of Tallon, in the mountains on Dayside\'s eastern side.', {
      region: 'Darkside',
      bio: 'A Darkside nation beyond the reach of Lossand\'s sun, and where the guns come from. Dayside calls them blasphemy and buys them anyway, which is the shape of most of the two hemispheres\' dealings.', see: ['darkside', 'lonzare'], wiki: 'Nor\'Tallon' }),
  loc('dayside-mountains', 'The Dayside Mountains', 'taldain', 'whitesand', 0.36, 0.38, '#a8a29e', 'peak',
    'Range dividing portions of Dayside. Shadow is precious; so is the pass.', {
      region: 'Dayside',
      bio: 'The range on Dayside\'s eastern side that separates the Rim Kingdoms from Kerzta and Lossand. Nor\'Tallon sits in it.', see: ['dayside', 'lossand'] }),
  loc('rim-kingdom', 'The Rim Kingdoms', 'taldain', 'whitesand', 0.3, 0.48, '#fdba74', 'land',
    'Lesser Dayside states along Lossand\'s edge — trade partners when the Kerztian roads close.', {
      region: 'Dayside',
      bio: 'Denka, Seevis and Tallon: smaller nations on Dayside\'s eastern and north-eastern coast, walled off from Kerzta and Lossand by the eastern range.', see: ['lossand', 'kerzt'] }),
  // Coppermind: Rose Sea (tress 10, 15, 23, 42). Its own sea, bordering the Emerald —
  // not another name for the Crimson.
  loc('roseite-sea', 'Rose Sea', 'lumar-world', 'tress', 0.50, 0.40, '#fb7185', 'sea',
    'Roseite spores. Inhabited, unlike the Crimson next door.', {
      region: 'Rose Sea', aliases: 'Roseite Sea',
      bio: 'The sea under the roseite moon, where spores set into crystal when wet. Ann and Fort have both sailed it, and people live there; nothing is said about who rules it.', see: ['roseite', 'emerald-sea'], wiki: 'Rose_Sea' }),
  // Coppermind: Sorceress's island (tress 5, 13, 23, 43, 46, 59, 62, 64). Near the Crimson border.
  loc('sorceress-island', 'The Sorceress\'s Island', 'lumar-world', 'tress', 0.76, 0.52, '#312e81', 'island',
    'A small, suspiciously circular island near the Crimson border. Curses for anyone who reaches it.', {
      region: 'Midnight Sea', see: ['riina', 'riina-tower', 'midnight-sea', 'sorceress-curse'], wiki: 'Sorceress\'s_island',
      bio: 'Barely any trees, rock spikes under the spores to tear open ships, Awakened metal soldiers on the shore and Midnight Essence in the water. The tower\'s walls are a single sheet of silver, so the only way in is the front door, and it opens from inside.' }),
  // Coppermind: Sorceress's tower (tress 46, 54, 57, 59, 60, 64).
  loc('riina-tower', 'The Sorceress\'s Tower', 'lumar-world', 'tress', 0.765, 0.515, '#6366f1', 'tower',
    'A rocket standing on its tail, which the locals took for a tower. Silver walls, a red carpet, and a computer called Seslo.', {
      region: 'Midnight Sea', aliases: 'Riina\'s Tower, Seslo',
      bio: 'Riina\'s spaceship, set down with its booster out of sight. Inside it looks like an office or a hospital, aons carved down the halls, and at the top is a bridge where she watches Lumar through hidden cameras — including the one in Fort\'s board. Hoid\'s curse could only break if he came back in here. She flew it off the planet.', see: ['riina', 'sorceress-island', 'hoid'], wiki: 'Sorceress\'s_tower' }),
  loc('spore-fall-verdant', 'Verdant Lunagree', 'lumar-world', 'tress', 0.42, 0.45, '#34d399', 'storm',
    'Where the verdant moon rains spores into the Emerald Sea. Stay dry. Stay drier than that.', {
      region: 'Emerald Sea',
      bio: 'The lunagree of the verdant moon: a column of falling spores, straight down out of a moon that never moves, feeding the sea it stands over. Sailing under one is survivable only if nothing on board is damp.', see: ['emerald-sea'], wiki: 'Lunagree' }),
  // Coppermind: Lunagree (tress 1), Riina (tress 35, 46).
  loc('midnight-lunagree', 'Midnight Lunagree', 'lumar-world', 'tress', 0.8, 0.52, '#1e1b4b', 'storm',
    'Sporefall of the midnight moon. Wet, these spores become Midnight Essence.', {
      region: 'Midnight Sea',
      bio: 'The midnight moon\'s sporefall. Rain on midnight spores makes Midnight Essence; the Sorceress arranged a steady supply of water so that what the sea grew would serve her.', see: ['midnight-sea', 'sorceress-island', 'midnight-essence'] }),
  // Coppermind: Kingsport (tress 2, 7, 19, 21), Core Archipelago (tress 4, 7, 8, 21, 30, 42).
  // Beside `emerald-sea`; the book gives "in the Emerald Sea, far from the Rock".
  loc('kingsport', 'Kingsport', 'lumar-world', 'tress', 0.44, 0.53, '#6ee7b7', 'port',
    'The king\'s port, on the Core Archipelago as far as anyone can tell. Reports of deadrunners end up here.', {
      arc: 'tress', region: 'Emerald Sea', aliases: 'Core Archipelago, the king\'s island', wiki: 'Kingsport',
      see: ['verdant-king', 'emerald-sea', 'diggens-point'],
      bio: 'The Core Archipelago is an island chain in the Emerald Sea, a long way from Diggen\'s Point, with islands Huck says run forty miles across. The king\'s palace is on one of them and Kingsport is presumably it. Tress meant to come here and beg the king for Charlie\'s ransom. She joined a pirate crew instead.' }),
  // Coppermind: Islands of Lobu (tress 15, 40), Sapphire Sea (tress 15, 30, 45). Beside `sapphire-sea`.
  loc('islands-of-lobu', 'Islands of Lobu', 'lumar-world', 'tress', 0.27, 0.57, '#38bdf8', 'island',
    'Fort and Salay\'s islands in the Sapphire Sea, where everyone chooses a hunt.', {
      arc: 'tress', region: 'Sapphire Sea', wiki: 'Islands_of_Lobu',
      see: ['fort', 'salay', 'lobu-hunt', 'sapphire-sea'],
      bio: 'A group of islands in the Sapphire Sea, home to a dark-skinned, curly-haired people who take pride in a good hunt and have stretched the word over trading, baking and planning weddings. Letters boasting of the best hunts hang in the family halls.' }),
  // Coppermind: Xisisrefliel (tress 31, 50, 51), Lunagree (tress 46, 50); WoB 16142.
  // Beside `crimson-sea` — the palace is by the Crimson Lunagree, the sea's centre.
  loc('xisis-palace', 'Xisis\'s palace', 'lumar-world', 'tress', 0.625, 0.415, '#f43f5e', 'keep',
    'Tunnels of crimson spores on the floor of the Crimson Sea, near the lunagree. The dragon opens one if you write first.', {
      arc: 'tress', region: 'Crimson Sea', aliases: 'the domain of the dragon', wiki: 'Xisisrefliel',
      see: ['xisis', 'crow', 'crimson-sea', 'spore-eater'],
      bio: 'Xisis has lived down here for centuries, studying how spores rot on the seafloor and what that does to the seethe. Being near the Crimson Lunagree is enough to ask for an audience: Crow threw a letter into the spores and a tunnel opened. In the great chamber at the end, Tress and Crow each offered the dragon the other.' }),
  // Coppermind: Union (tsm 50), Cinder King (tsm 48), Elegy Salvage (tsm 50). There is no palace;
  // the id is kept so links hold.
  loc('cinder-kings-palace', 'The Hall of Burning', 'canticle-world', 'sunlit', 0.56, 0.47, '#fb923c', 'fire',
    'Under Union\'s heart ship: a hall of hundreds of sunhearts, one Charred on guard, and the room where Charred are made.', {
      region: 'The Corridor', aliases: 'Hall of Burning',
      bio: 'A bare metal stair leads down to it. At the end of the hall a machine still uses a spear to put the cinderheart in. The Cinder King sent Rebeke here; Elegy arrived too late to stop it starting and in time to stop it halfway.', see: ['union', 'charred', 'cinderheart', 'rebeke'], wiki: 'Union' }),
  // Coppermind: Chorus (tsm 22). The Reliquary in the book is Beacon's, so it sits on that pin.
  loc('chorus-hall', 'The Reliquary', 'canticle-world', 'sunlit', 0.306, 0.508, '#f59e0b', 'drum',
    'A glass drum with an open top at the centre of Beacon, holding its share of the Chorus.', {
      region: 'The Corridor',
      bio: 'Every Canticle city carries one on its largest ship. Hand the shades leather or metal and a pattern and they make a coat or an engine; ask them where they came from and they will tell you they were the first to die here. Rebeke thought she saw Divinity in it.', see: ['chorus', 'beacon', 'divinity-salvage'], wiki: 'Chorus' }),
  // Coppermind: Hion (yumi 1, 3, 5, 21, 39).
  loc('hion-line-network', 'Hion Lines', 'komashi', 'yumi', 0.628, 0.474, '#22d3ee', 'canal',
    'Cyan and magenta lines that hold the shroud off a city.', {
      region: 'Komashi', see: ['kilahito', 'the-shroud', 'hion-term'], wiki: 'Hion',
      bio: 'Primary lines a few inches thick hang twenty feet over the main streets; thinner ones wind into the poorer quarters. They grow from stubs where Torish villages used to stand, and Nagadan stretches them between cities, onto farms, and once, into space.' }),
  // Coppermind: Father machine (yumi 39, 40, 41). It stands in Torio City's exhibit hall.
  loc('father-machine-site', 'The Father Machine', 'komashi', 'yumi', 0.608, 0.470, '#e879f9', 'keep',
    'The device that ate Torio\'s people and remade a world into hion and hunger.', {
      region: 'Torio', see: ['torio-city', 'father-machine', 'the-shroud'], wiki: 'Father_machine',
      bio: 'Thirty feet of Awakened machine with hundreds of legs, in the exhibit hall of Torio City, behind a shield nobody could cross. By the end almost none of its original parts were left; it had rebuilt itself out of smoke. Yumi stole the spirits out from under it with towers of stone.' }),
  // Coppermind: Komashi (yumi 2), Gongsha Town (yumi 13, 18, 23).
  loc('yoki-hijo-shrine', 'Place of Ritual', 'komashi', 'yumi', 0.600, 0.500, '#f0abfc', 'bell',
    'The warm ground where a yoki-hijo stacks stones and the town watches.', {
      region: 'Torio', aliases: 'kimomakkin, Yoki-hijo Shrine',
      bio: 'Kimomakkin are the warmer spots near a steamwell that yoki-hijo use. In Gongsha it is fenced, east of the orchard, with an untraditional shrine among the fruit trees.', see: ['torio', 'torio-steamwell', 'yoki-hijo', 'gongsha-town'], wiki: 'Yoki-hijo' }),
  // Coppermind: Torio City (yumi 2, 20, 33, 34, 40, ae). Ruins west of Kilahito, comparable size.
  loc('torio-city', 'Torio City', 'komashi', 'yumi', 0.608, 0.478, '#e879f9', 'city',
    'Torio\'s capital: red roofs, fountains, stone dragons, and the exhibit hall where the machine was switched on. Ruins now, west of Kilahito.', {
      arc: 'yumi', region: 'Torio', wiki: 'Torio_City',
      see: ['torio', 'father-machine-site', 'festival-of-reveals', 'institute-mech-solutions'],
      bio: 'Seat of the queen and of the university the villages trusted. After the Festival of Reveals it went to ruin under the shroud. When the shroud lifted, Nagadan found seeds of the old plants preserved here and bred crops for a world with a sun again.' }),
  // Coppermind: Futinoro (yumi 7, 36); Incident (yumi 23, 36). Placement inside Nagadan is ours.
  loc('futinoro', 'Futinoro', 'komashi', 'yumi', 0.632, 0.496, '#334155', 'city',
    'A Nagadan city destroyed by several dozen stable nightmares, thirty years before the battle of Kilahito.', {
      arc: 'yumi', region: 'Nagadan', wiki: 'Futinoro',
      see: ['the-incident', 'father-machine', 'liyun', 'stable-nightmare'],
      bio: 'Nagadan remembers it as what happens when painters are not vigilant. Liyun, who was there, says the machine sent the nightmares on purpose: spirits had got loose and reached the people of Futinoro, and a city that knew the truth could not be allowed to keep it.' }),
  // Coppermind: Gongsha Town (yumi 6, 12, 13, 18, 20, 23); Kilahito (yumi 34: five miles from Yumi's prison).
  loc('gongsha-town', 'Gongsha Town', 'komashi', 'yumi', 0.614, 0.460, '#f0abfc', 'village',
    'A Torish village of about a hundred homes, and the copy the machine kept Yumi in once Painter was Connected to her.', {
      arc: 'yumi', region: 'Torio', wiki: 'Gongsha_Town',
      see: ['yumi', 'liyun', 'gyundok', 'yoki-hijo-shrine', 'torio'],
      bio: 'A steamwell in the middle, a cold spring in the low western hills for ritual baths, an orchard of a hundred floating trees to the south, the Place of Ritual to the east. For centuries Yumi relived one day in Ihosen; Connected to Painter, she stayed in Gongsha, and the machine had to send scholars to deal with her.' }),
  loc('patjis-eye', 'Patji\'s Eye', 'first-of-the-sun', 'sixthofdusk', 0.53, 0.51, '#22d3ee', 'lake',
    'A still lake near the top of Patji, where juvenile Aviar gather to eat.', {
      region: 'The Pantheon', see: ['patji'], wiki: 'Patji\'s_Eye', eraMin: 1, bio: 'The lake near Patji\'s peak where juvenile Aviar from every island come to eat the fruit of the Patji\'s Finger trees around it. Vathi works out that a parasite in that fruit is what gives them their talents.' }),
  loc('pantheon', 'The Pantheon', 'first-of-the-sun', 'sixthofdusk', 0.5, 0.48, '#4ade80', 'island',
    'Archipelago of god-islands. Patji is Father; the rest are merely lethal.', {
      region: 'The Pantheon',
      bio: 'An archipelago of god-islands, islands the Eelakin hold to be gods, with the trappers as their priests, and each an ecosystem specifically hostile to visitors. The Aviar come from here, and the Eelakin have made a profession out of surviving the collection.', see: ['patji', 'sori'], wiki: 'Pantheon', eraMin: 1 }),
  loc('eelakin-traps', 'Dusk\'s safecamps', 'first-of-the-sun', 'sixthofdusk', 0.51, 0.49, '#86efac', 'forest',
    'Traplines and false paths Sixth of the Dusk maintained. The island rearranges the rest.', {
      region: 'The Pantheon',
      bio: 'The shelters Dusk keeps on Patji, one built into a gurratree, ringed with traps for rival trappers and topped with nesting boxes for the Aviar he raises to sell.', see: ['patji', 'patjis-eye'], eraMin: 1 }),
  loc('shattering-site', 'Site of the Shattering', 'yolen', 'core', 0.5, 0.48, '#fef3c7', 'crystal',
    'Wherever on Yolen the Vessels killed Adonalsium. The planet has not forgotten the geometry.', {
      region: 'Yolen',
      // That a Dawnshard did it is the Dawnshard novella; it lives on the
      // Dawnshard term, which waits for that book. This place is every reader's.
      bio: 'Wherever on Yolen sixteen people killed Adonalsium. What is known is that it happened, and that the power went sixteen ways rather than back where it came from. The planet has not forgotten the geometry; nobody has written down what the geometry was.', canon: 'speculation', sources: ['Word of Brandon'], see: ['fain-wilds', 'yolen-dragons'] }),
  loc('fain-border', 'Fain Borderlands', 'yolen', 'core', 0.6, 0.5, '#86efac', 'forest',
    'Where fain ecology meets everything else. The two biologies share a planet and refuse a treaty.', {
      region: 'Yolen',
      bio: 'The front where fain ecology meets ordinary ecology. Neither can eat the other and neither will yield ground, so the border is a standing argument several million years old.', canon: 'wob', sources: ['Word of Brandon'], see: ['fain-wilds'] }),
  loc('ashes-of-ashyn', 'The Ashes of Ashyn', 'ashyn', 'stormlight', 0.52, 0.52, '#fcd34d', 'fire',
    'Surface left uninhabitable by Surge-work and plague. The cities learned to stay off the ground.', {
      arc: 'oathbringer', region: 'Ashyn',
      bio: 'The surface: ruined by Surgebinding used without oaths and by the plagues that followed. It is the argument for why the Radiants have Ideals at all, and the reason the Heralds took the bargain they took.', canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'], see: ['floating-cities'] }),
  loc('damnation', 'Damnation', 'braize', 'stormlight', 0.5, 0.52, '#991b1b', 'fire',
    'Vorin name for Braize — the place of eternal punishment that turned out to be a prison for gods\' soldiers.', {
      arc: 'oathbringer', region: 'Braize', see: ['braize-prison'], wiki: 'Braize', bio: 'The Vorin hell, where the Voidbringers came from and where the Heralds went between Desolations. Older songs call it Braize.' }),
  loc('ire-fortress', 'The Ire Fortress', 'scadrial', 'secrethistory', 0.2, 0.2, '#a78bfa', 'keep',
    'Elantrian fortress in the Cognitive Realm near Scadrial. They meant to take Preservation\'s power with paperwork.', {
      region: 'Shadesmar', realm: 'cognitive', eraMaps: ['ash'], see: ['well-of-ascension'], wiki: 'Ire', bio: 'Kelsier robbed them. They never quite got over it.' }),
  loc('vax-crossing', 'Vax', 'vax', 'core', 0.5, 0.5, '#d8b4fe', 'land',
    'A world named more often than described. Worldhoppers use it as a direction and a shrug.', {
      region: 'Vax',
      bio: 'A world named far more often than it is described: worldhoppers use it as a direction and a shrug. Its magic is said to involve Initiation, it is restricted for reasons nobody will state, and any map that claims to place it — including this one — is guessing.', canon: 'wob', sources: ['Word of Brandon', 'Elantris'], wiki: 'Vax' }),
  loc('aimian-scouring', 'The Scouring of Aimia', 'roshar', 'stormlight', 0.1, 0.56, '#94a3b8', 'fire',
    'The sack of Aimia after the Recreance.', {
      region: 'Aimia',
      bio: 'When the Radiants fell, the kingdoms of Roshar turned on Aimia for its fabrials and its lanceryn. The survivors fled to Alm; the lanceryn died off.', arc: 'dawnshard', see: ['aimia', 'akinah'], wiki: 'Scouring_of_Aimia' }),
  loc('undersea-aimia', 'Aimian Sea', 'roshar', 'stormlight', 0.07, 0.58, '#475569', 'sea',
    'The sea around Aimia, off Roshar\'s south-western coast.', {
      wiki: 'Aimian_Sea', region: 'Aimia',
      bio: 'The water that surrounds the Aimian islands and laps the coasts of Steen and Liafor. Ships give Aimia a wide berth.', see: [] }),
  loc('urithiru-mountains', 'Mountains of Ur', 'roshar', 'stormlight', 0.46, 0.65, '#bae6fd', 'peak',
    'High central range that hides the tower-city. Above the storms; below the gods\' old arguments.', {
      arc: 'row', region: 'Urithiru',
      bio: 'The high central range that hides the tower-city: above the storms, above the treeline, and far enough from every kingdom that none of them found it for four thousand years. The Oathgates are the only sensible way up, which was the design.', see: ['urithiru'], wiki: 'Mountains_of_Ur' }),
  loc('oathgate-thar', 'Thaylen Oathgate', 'roshar', 'stormlight', 0.612, 0.855, '#4ade80', 'gem',
    'Oathgate platform of Thaylen City — hub of the battle that remade the war.', {
      region: 'Thaylenah',
      bio: 'Thaylen City\'s Oathgate platform, and the hinge of the battle fought around it. Getting it working again is what let the coalition arrive at all, and what let the wounded be taken out afterwards.', arc: 'oathbringer', see: ['thaylen-city', 'thaylen-field'], wiki: 'Oathgate' }),
  loc('emuli-front', 'Emuli Front', 'roshar', 'stormlight', 0.36, 0.76, '#d97706', 'land',
    'Contested ground where Azir, Emul, and Tukar spent a generation trading the same ruined towns.', {
      region: 'Emul',
      bio: 'The contested ground where Azir, Emul and Tukar traded the same ruined towns for a generation, and where the coalition\'s armies later found out that a war with the Fused is not a war with neighbours. Taravangian\'s Veden troops fought here for the wrong side.', arc: 'row', see: ['emul', 'tukar', 'sesemalex-dar'] }),
  loc('luthadel-gates', 'Luthadel Gates', 'scadrial', 'mistborn1', 0.618, 0.523, '#78716c', 'keep',
    'Eight gates named for the metals, in the only city wall the Lord Ruler permitted.', {
      region: 'Luthadel',
      bio: 'Eight gates, named for the metals, spaced around the only city wall the Lord Ruler permitted. The wall was always more a symbol than a defence.', eraMaps: ['ash'], see: ['luthadel'] }),
  loc('skaa-slums-luthadel', 'Luthadel Skaa Slums', 'scadrial', 'mistborn1', 0.615, 0.529, '#57534e', 'village',
    'The districts where Luthadel\'s skaa live, and its thieving crews work.', {
      region: 'Luthadel',
      bio: 'The districts where Luthadel\'s skaa live and die: ash in the air, mists at night that nobody walks in, and a thieving crew in more cellars than the obligators know about. Camon\'s crew worked out of here, and Kelsier recruited from it.', eraMaps: ['ash'], see: ['luthadel', 'camon'], wiki: 'Luthadel' }),
  loc('urteau-canals', 'Urteau Canals', 'scadrial', 'mistborn1', 0.740, 0.410, '#38bdf8', 'canal',
    'Urteau\'s streetslots: canals dry for a hundred years.', {
      region: 'Northern Dominance',
      bio: 'Urteau\'s streetslots: canals dry for a hundred years and paved with ash, the Marketpit the widest of them. Spook ended the Citizen\'s rule by opening Sazed\'s mechanism and letting the cache\'s water back in.', arc: 'hoa', eraMaps: ['ash'], see: ['urteau', 'spook', 'quellion'], wiki: 'Urteau' }),
  loc('fadrex-caves', 'The Fadrex cache', 'scadrial', 'mistborn1', 0.426, 0.491, '#a8a29e', 'rock',
    'The Lord Ruler\'s last storage cache, under Fadrex City.', {
      region: 'Western Dominance',
      bio: 'The last of the Lord Ruler\'s storage caches lies under Fadrex. Its plate offers no metal and no map, only a circle with a dot and an apology: he had found nothing that could stop the thing, and he had hidden its body well.', arc: 'hoa', eraMaps: ['ash'], see: ['fadrex', 'storage-cavern-luthadel'], wiki: 'Storage_cavern' }),
  loc('storage-cavern-luthadel', 'Luthadel Storage Cavern', 'scadrial', 'mistborn1', 0.628, 0.516, '#cbd5e1', 'keep',
    'The Lord Ruler\'s hidden supply cache under Kredik Shaw.', {
      region: 'Central Dominance',
      bio: 'The first of the Lord Ruler\'s hidden caches to be found, under Kredik Shaw: food, water, and a plate of inscribed metal. The plates were the point.', arc: 'woa', eraMaps: ['ash'], see: ['luthadel', 'kredik-shaw'], wiki: 'Storage_cavern' }),
  loc('eltania-pits', 'Pits of Eltania', 'scadrial', 'mistborn2', 0.640, 0.270, '#a8a29e', 'crystal',
    'Red-dusted Roughs country full of koloss, and the Survivor\'s Treasure.', {
      region: 'The Roughs',
      bio: 'Somewhere in the Roughs, a canyon country stained red by its dust, home to several koloss tribes and rumoured by the Elendel Daily to hide unknown metals. Allomancer Jak went in after the Survivor\'s Treasure and found it in a pool: an aluminum chest full of spikes. No map places the Pits, so this pin means only "out in the Roughs".', arc: 'jak', eraMaps: ['basin'], see: ['the-roughs', 'allomancer-jak', 'handerwym'], wiki: 'Pits_of_Eltania' }),
  loc('outer-estates', 'Outer Estates', 'scadrial', 'mistborn2', 0.566, 0.287, '#e8b86d', 'land',
    'The ring of orchards, fields and pastures beyond Elendel\'s suburbs that feeds the city.', {
      region: 'Elendel Basin',
      bio: 'The broad ring of orchards, fields and pastures just past the suburbs that feeds Elendel. Wax found its quiet unnerving when he went out to look at the site of a Vanishers train robbery there. Marasi grew up in it.', arc: 'aol', eraMaps: ['basin'], see: ['elendel-basin', 'marasi', 'vanishers'], wiki: 'Outer_Estates' }),
];

