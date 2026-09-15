import type { Location } from './types.ts';

const C = 'canon' as const;

function eraMinFromBook(book: string): number {
  if (book === 'core') return 0;
  if (book === 'mistborn1' || book === 'secrethistory') return 2;
  if (book === 'mistborn2') return 3;
  if (book === 'tress' || book === 'yumi') return 4;
  if (book === 'sunlit' || book === 'sixthofdusk' || book === 'emberdark') return 5;
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
      bio: 'Ten camps in ten craters west of the Plains, one per princedom, dug in for a war that was supposed to take a season and took six years. They grew markets, brothels, bridge crews and a lighteyed social season, and Dalinar spent Oathbringer trying to make them behave like an army instead of ten rival courts with a shared enemy.', arc: 'twok', region: 'Shattered Plains', see: ['shattered-plains', 'narak'], wiki: 'Warcamps' }),
  loc('stormseat', 'Stormseat', 'roshar', 'stormlight', 0.836, 0.742, '#9ca3af', 'drum',
    'The listener name for the capital plateau at the heart of the Plains. Narak stands on what is left of it.', {
      bio: 'The Silver Kingdom capital at the centre of Natanatan, and the listeners\' name for what is left of it. Whatever shattered the Plains shattered this first; Narak is built on the remains, and the Oathgate that served the old city is still down there under the rubble.', arc: 'wor', region: 'Shattered Plains', see: ['narak', 'shattered-plains'], wiki: 'Stormseat' }),
  loc('kholinar-windblades', 'The Windblades', 'roshar', 'stormlight', 0.79, 0.49, '#fbbf24', 'peak',
    'Knife-edged rock fins that cut through Kholinar. Palaces cling to them; storms scream between them.', {
      bio: 'Stone fins standing up through the middle of Kholinar, sharp enough to have names, old enough that nobody agrees how they got there. The city is built around and between them; the palaces sit up on them, and when a highstorm comes through the gaps the sound is what Alethi children are told the Voidbringers make.', region: 'Alethkar', see: ['kholinar'], wiki: 'Kholinar' }),
  loc('kharbranth-palanaeum', 'The Palanaeum', 'roshar', 'stormlight', 0.585, 0.77, '#a78bfa', 'scroll',
    'The greatest library on Roshar, cut into the cliff behind Kharbranth. Taravangian traded lives to keep it funded.', { arc: 'twok', region: 'Kharbranth', see: ['kharbranth'], wiki: 'Palanaeum', bio: 'Jasnah came for the books. Shallan came for Jasnah. The Diagram was written in a hospital upstairs.' }),
  loc('ironsway', 'Ironsway', 'roshar', 'stormlight', 0.595, 0.625, '#94a3b8', 'city',
    'Largest town in Bavland — taverns, transient miners, and the place Took dragged Szeth to show him off.', {
      bio: 'A mining town in Bavland with more taverns than reasons to be there. Took bought Szeth as a curiosity and paraded him through it, which is how the deadliest man on Roshar spent a stretch of his life being someone\'s dinner-party trick.', arc: 'twok', region: 'Bavland', see: ['bavland', 'jah-keved'], wiki: 'Ironsway' }),
  loc('silnasen', 'Silnasen', 'roshar', 'stormlight', 0.61, 0.7, '#fca5a5', 'city',
    'A Jah Keved city of the southern marches, caught between Veden succession and Alethi ambition.', {
      bio: 'A city of Jah Keved\'s southern marches, close enough to Alethkar to be a bargaining chip and far enough from Vedenar to be forgotten in a succession war. Lift passed through on her way south and stole from it, which is her usual arrangement with cities.', region: 'Jah Keved', see: ['jah-keved', 'vedenar'], wiki: 'Silnasen' }),
  loc('valath', 'Valath', 'roshar', 'stormlight', 0.65, 0.61, '#f87171', 'city',
    'Northern Jah Keved city, and a name Vorin maps still bother to print.', {
      bio: 'A northern Veden city that survives on Vorin maps mostly by having survived. It changed hands during the succession war without anyone outside the kingdom noticing.', region: 'Jah Keved', see: ['jah-keved'], wiki: 'Valath' }),
  loc('bornwater', 'Bornwater', 'roshar', 'stormlight', 0.45, 0.5, '#67e8f9', 'village',
    'A Purelake town where the water is the street and the fish know more than they should.', {
      bio: 'A Purelake town where the streets are shin-deep water and the houses stand on stilts that have not needed replacing in living memory. The fish here are used medicinally, and the locals\' opinion of outsiders who try to buy the lake is unprintable.', arc: 'twok', region: 'Purelake', see: ['purelake'], wiki: 'Bornwater' }),
  loc('fu-abra', 'Fu Abra', 'roshar', 'stormlight', 0.425, 0.505, '#22d3ee', 'village',
    'Purelake settlement Ishikk worked out of while fishing for a man who was not there.', {
      bio: 'One of the Purelake settlements Ishikk worked out of, fishing in the mornings and asking after a foreigner in the afternoons. The three men paying him were Ghostbloods and the man they wanted was not in the lake, but the money was good and the lake is patient.', arc: 'twok', region: 'Purelake', see: ['purelake'], wiki: 'Fu_Abra' }),
  loc('rit-vo-ma', 'Rit-vo-Ma', 'roshar', 'stormlight', 0.5575, 0.1661, '#4ade80', 'island',
    'A Reshi island-greatshell. People live on its back and argue with its moods.', {
      bio: 'One of the Reshi greatshells, with a town on its back and a king who reigns by the isle\'s consent rather than the other way round. When it decides to move, the town moves; when it decides to sulk, the town waits.', arc: 'wor', region: 'Reshi Isles', see: ['reshi-isles'], wiki: 'Rit-vo-Ma' }),
  loc('cusicesh-site', 'Cusicesh the Protector', 'roshar', 'stormlight', 0.2525, 0.2675, '#c4b5fd', 'lake',
    'A spren the size of a district that rises each day in Kasitor\'s bay and wears a thousand faces.', {
      bio: 'Every dawn something the size of a city district rises out of Kasitor\'s bay, turns through a thousand faces — some human, some not, all wrong — and sinks again. The Iriali have built a viewing platform. Jasnah wanted to know what it is; nobody has told her.', arc: 'wor', region: 'Iri', see: ['kasitor', 'iri'], wiki: 'Cusicesh' }),
  loc('thaylen-field', 'Thaylen Field', 'roshar', 'stormlight', 0.605, 0.85, '#4ade80', 'grass',
    'The plain outside Thaylen City where a god was stood down and a perpendicularity forced open.', {
      bio: 'The plain outside Thaylen City where the coalition lost, and then did not. Dalinar refused Odium\'s claim on him in front of both armies, the Stormfather and Honor\'s own remnant, and forced open a perpendicularity that healed the wounded and burned the Thrill out of the sky. It is where the True Desolation stopped being a rout.', arc: 'oathbringer', region: 'Thaylenah', see: ['thaylen-city', 'thaylenah'], wiki: 'Battle_of_Thaylen_Field' }),
  loc('klna', 'Klna', 'roshar', 'stormlight', 0.595, 0.87, '#86efac', 'port',
    'Thaylen shipyards. Where the Wandersail was refitted before Rysn sailed west.', {
      bio: 'The Thaylen shipyards, where a merchant fleet is built to survive a coast that is trying to kill it. The Wandersail was refitted here before Rysn took it west, which is the last time anyone sailed for Aimia on purpose and came back.', arc: 'dawnshard', region: 'Thaylenah', see: ['thaylenah', 'akinah'], wiki: 'Klna' }),
  loc('steinel', 'Steinel', 'scadrial', 'mistborn2', 0.48, 0.62, '#94a3b8', 'city',
    'Basin city due east of Elendel along the Irongate River.', {
      region: 'Elendel Basin',
      bio: 'A Basin city east of Elendel on the Irongate, where the river traffic stops before the capital\'s tariffs start. Prosperous, dull, and quietly furious about octant politics.', eraMaps: ['basin'], see: ['elendel', 'irongate-river'], wiki: 'Steinel' }),
  loc('mycondwel', 'Mycondwel', 'scadrial', 'mistborn2', 0.35, 0.55, '#e8b86d', 'city',
    'Basin city on the western spokes — far enough from Elendel to have its own gossip.', {
      region: 'Elendel Basin',
      bio: 'A Basin city on the western spokes, far enough out that its gossip is its own and its loyalty to Elendel is a matter of freight rates.', eraMaps: ['basin'], see: ['elendel-basin'], wiki: 'Mycondwel' }),
  loc('field-of-rebirth', 'Field of Rebirth', 'scadrial', 'mistborn2', 0.388, 0.615, '#86efac', 'grass',
    'Where the survivors of the Catacendre woke to a green world. Elendel grew around the memory.', {
      region: 'Elendel Basin',
      bio: 'Where the survivors of the Catacendre came out of the caverns into a world with a blue sky, green ground and no ash falling. Sazed left the Bands of Mourning there as a marker. Elendel grew up around the memory and the memory became a park.', eraMaps: ['basin'], see: ['elendel'], wiki: 'Field_of_Rebirth' }),
  loc('hammondar-bay', 'Hammondar Bay', 'scadrial', 'mistborn2', 0.36, 0.62, '#38bdf8', 'sea',
    'Bay west of Elendel where the Irongate meets the Sea of Yomend. Named for a man who preferred dens to thrones.', {
      region: 'Elendel Basin',
      bio: 'The bay west of Elendel where the Irongate meets the Sea of Yomend. Named for Hammond — Ham, of Kelsier\'s crew — who preferred a dockside den and a philosophical argument to anything a statue could commemorate.', eraMaps: ['basin'], see: ['elendel', 'irongate-river'], wiki: 'Hammondar_Bay' }),
  loc('makabak', 'Makabak', 'roshar', 'stormlight', 0.34, 0.68, '#fbbf24', 'land',
    'The Azish imperial sphere: Azir and the Makabaki states that answer when the essays go out.', {
      bio: 'Not a country: the collective name for Azir and the states that orbit it — Emul, Tashikk, Yezier, Liafor, Alm, Desh, the Hexis and the rest. They answer Azimir\'s essays when it suits them, which is more often than an Alethi would expect and less often than Azir would like.', region: 'Makabak', see: ['azir', 'emul', 'tashikk'], wiki: 'Makabak' }),
  loc('makabakam', 'Makabakam', 'roshar', 'stormlight', 0.335, 0.655, '#f59e0b', 'land',
    'Ancient Silver Kingdom whose bones Azir still sits on. The Oathgate remembers the older name.', {
      region: 'Makabak',
      bio: 'One of the ten Silver Kingdoms of the Heraldic Epochs, and the ground Azir is built on. Its Oathgate still answers to the older name, which is one of the few pieces of evidence the modern empire has that it is standing on something.', see: ['azimir', 'makabak'], wiki: 'Makabakam' }),
  loc('tu-bayla', 'Tu Bayla', 'roshar', 'stormlight', 0.4, 0.56, '#a3e635', 'land',
    'A small nation east of Babatharnam, more often crossed than visited.', {
      region: 'Tu Bayla',
      bio: 'A small nation east of Babatharnam, on the road between the Purelake and the western coast. It is crossed constantly and visited rarely, which is most of what can be said about it.', see: ['babatharnam', 'purelake'], wiki: 'Tu_Bayla' }),
  loc('triax', 'Triax', 'roshar', 'stormlight', 0.455, 0.62, '#86efac', 'land',
    'Between the Purelake and the southern kingdoms. Easy to miss on a map, harder to hold.', {
      region: 'Triax',
      bio: 'A stretch between the Purelake and the southern kingdoms that has been claimed by several of them and held by none for long. Easy to miss on a map and harder to hold in practice.', see: ['purelake', 'marabethia'], wiki: 'Triax' }),
  loc('alm', 'Alm', 'roshar', 'stormlight', 0.3, 0.62, '#f9a8d4', 'land',
    'A Makabaki state on Azir\'s fringe. Sigzil listed it among the places that still send delegates.', {
      region: 'Makabak',
      bio: 'A Makabaki state on Azir\'s fringe that still sends delegates and still files essays. Sigzil listed it among the places a Worldsinger is expected to know the songs of, which is the closest thing it has to fame.', see: ['azir', 'liafor'], wiki: 'Alm' }),
  loc('desh', 'Desh', 'roshar', 'stormlight', 0.31, 0.58, '#fda4af', 'land',
    'Another Makabaki neighbour of Azir, folded into the empire\'s paperwork more than its armies.', {
      region: 'Makabak',
      bio: 'An Azish neighbour absorbed more by paperwork than by conquest. Desh pays what Azimir asks and argues about the arithmetic afterwards, in writing, at length.', see: ['azir', 'steen'], wiki: 'Desh' }),
  loc('yezier', 'Yezier', 'roshar', 'stormlight', 0.32, 0.7, '#fdba74', 'land',
    'Makabaki kingdom southwest of Azir, often named in the same breath as Emul and Tashikk.', {
      region: 'Makabak',
      bio: 'A Makabaki kingdom southwest of Azir, named in the same breath as Emul and Tashikk because it sits between them and has spent centuries trying not to be. Its princess turns up in the Azish court when the coalition needs a quorum.', see: ['emul', 'azir'], wiki: 'Yezier' }),
  loc('lesser-hexi', 'Lesser Hexi', 'roshar', 'stormlight', 0.395, 0.715, '#fbbf24', 'land',
    'The smaller Hexi beside Greater Hexi. Azir counts both when it counts at all.', {
      region: 'Makabak',
      bio: 'The smaller of the two Hexis, distinguished from Greater Hexi by size and by nothing else anyone can now establish. Azir counts both, on the rare occasions Azir is counting.', see: ['greater-hexi', 'azir'], wiki: 'Hexi' }),
  loc('rishir', 'Rishir', 'roshar', 'stormlight', 0.42, 0.285, '#fbcfe8', 'land',
    'Ancient Silver Kingdom of the northern coast. Kurth was its capital and still holds its Oathgate.', {
      region: 'Rishir',
      bio: 'One of the ten Silver Kingdoms, on the northern coast, with Kurth for a capital and an Oathgate that still works. The modern maps have folded it into Iri; the Oathgate has not been told.', see: ['kurth'], wiki: 'Rishir' }),
  loc('sela-tales', 'Sela Tales', 'roshar', 'stormlight', 0.355, 0.48, '#c4b5fd', 'land',
    'Silver Kingdom of the west-central plains. Panatham keeps its Oathgate.', {
      region: 'Sela Tales',
      bio: 'A Silver Kingdom of the west-central plains, gone for four thousand years, remembered because Panatham still stands on its Oathgate. The Radiants rebuilding the network had to explain to the modern occupants what the platform in the middle of their city was for.', see: ['panatham'], wiki: 'Sela_Tales' }),
  loc('bavland', 'Bavland', 'roshar', 'stormlight', 0.6, 0.62, '#a8a29e', 'land',
    'Mining country in Jah Keved. Szeth was dumped here after Shinovar decided it was done with him.', {
      bio: 'Mining country on Jah Keved\'s western edge, poor, cold and nobody\'s priority. Shinovar sent Szeth here after deciding he was Truthless and no longer their problem, and Bavland is where a man with an Honorblade spent years being bought and sold by people who had no idea.', arc: 'twok', region: 'Jah Keved', see: ['jah-keved', 'shinovar'], wiki: 'Bavland' }),
  loc('longbrow-mountains', 'The Longbrow Mountains', 'roshar', 'stormlight', 0.72, 0.36, '#fdba74', 'peak',
    'Range along the Alethi–Herdazian border. Horneaters trade across them; armies bleed on them.', {
      bio: 'The range along the Alethi–Herdazian border, and the reason a small kingdom has held out against a large one for so long. Horneaters trade across the passes; armies bleed in them and then claim the map anyway.', region: 'Herdaz', see: ['herdaz', 'alethkar'], wiki: 'Longbrow_Mountains' }),
  loc('herdazian-peaks', 'The Herdazian Peaks', 'roshar', 'stormlight', 0.745, 0.31, '#fca5a5', 'peak',
    'High country of Herdaz, rockier than the Alethi pretend when they come to conquer it.', {
      bio: 'The high country that makes Herdaz worth less than it costs to take. Alethi campaign maps flatten it out of habit, and Alethi campaigns have been finding out otherwise for three generations.', region: 'Herdaz', see: ['herdaz', 'longbrow-mountains'] }),
  loc('peak-oceans', 'The Peak Oceans', 'roshar', 'stormlight', 0.672, 0.528, '#67e8f9', 'lake',
    'Thermal oceans cupped between the Horneater Peaks. Cultivation\'s Perpendicularity opens in their heat.', { arc: 'wor', region: 'Horneater Peaks', see: ['horneater-peaks', 'the-valley'], wiki: 'Horneater_Peaks', bio: 'Rock\'s people farm the shores and swim water that would scald a lowlander. The pool at the heart is not for swimming.' }),
  loc('sea-of-spears', 'Sea of Spears', 'roshar', 'stormlight', 0.82, 0.68, '#38bdf8', 'sea',
    'Waters off the Unclaimed Hills and the Plains. Named for the rock spires that stab up through the surf.', {
      bio: 'The waters off the Unclaimed Hills, named for the rock spires that come up through the surf like a rank of raised weapons. No fleet uses it willingly and no chart of it is trusted twice.', region: 'Unclaimed Hills', see: ['shattered-plains', 'unclaimed-hills'], wiki: 'Sea_of_Spears' }),
  loc('tarat-sea', 'Sea of Tarat', 'roshar', 'stormlight', 0.56, 0.78, '#67e8f9', 'sea',
    'The sea Kharbranth clings to. Bells carry across it when the storms are kind.', {
      region: 'Tarat Sea',
      bio: 'The sea Kharbranth clings to, sheltered enough for a lagoon city and open enough to trade with everyone. On a still day the bells carry all the way across it, which is how the City of Bells got the name and keeps it.', see: ['kharbranth', 'thaylenah'], wiki: 'Tarat' }),
  loc('steamwater-ocean', 'Steamwater Ocean', 'roshar', 'stormlight', 0.5, 0.32, '#7dd3fc', 'sea',
    'Northern ocean above the Purelake latitudes, warm where the peaks bleed heat into it.', {
      region: 'Steamwater Ocean',
      bio: 'The northern ocean above the Purelake latitudes, warm where the Horneater Peaks bleed heat into it and warmer still where nobody has gone to check. Reshi traders cross it; Thaylen ones respect it and go around.', see: ['purelake', 'reshi-isles'], wiki: 'Steamwater_Ocean' }),
  loc('reshi-sea', 'Reshi Sea', 'roshar', 'stormlight', 0.52, 0.24, '#4ade80', 'sea',
    'Shallow seas of the Reshi Isles, where islands walk and greatshells decide the borders.', {
      region: 'Reshi Isles',
      bio: 'The shallow water the Reshi Isles wander through. Charting it is a matter of opinion, since the islands are alive and have their own views about where the borders go this season.', see: ['reshi-isles', 'rit-vo-ma'], wiki: 'Reshi_Sea' }),
  loc('southern-depths', 'The Southern Depths', 'roshar', 'stormlight', 0.55, 0.92, '#1e3a8a', 'sea',
    'Deep water south of Thaylenah. Highstorms are born far east; down here the seas just take.', {
      region: 'The Southern Depths',
      bio: 'Deep water south of Thaylenah, past where the shelf drops away. The highstorms are born far east of here; the Depths are simply cold, and old, and take what goes into them.', see: ['thaylenah', 'the-origin'] }),
  loc('windrunner-river', 'Windrunner River', 'roshar', 'stormlight', 0.77, 0.48, '#38bdf8', 'canal',
    'Major Alethi river running toward the east. Named long before anyone swore the oaths.', {
      bio: 'The great river of eastern Alethkar, running toward the Frostlands and the Plains. It carried the Alethi war east and the grain back west, and it was named long before anyone on Roshar had sworn a Windrunner\'s oaths — which is either coincidence or the kind of thing Roshar does.', region: 'Alethkar', see: ['alethkar', 'kholinar'], wiki: 'Windrunner_River' }),
  loc('deathbend-river', 'Deathbend River', 'roshar', 'stormlight', 0.79, 0.56, '#64748b', 'canal',
    'River of eastern Alethkar, dark water and worse stories, feeding toward the Frostlands.', {
      bio: 'A dark river of eastern Alethkar with a bend that gave it the name and a set of stories nobody in the villages along it will tell a foreigner twice. It feeds toward the Frostlands, where nothing much is listening.', region: 'Alethkar', see: ['alethkar', 'rathalas'], wiki: 'Deathbend_River' }),
  loc('iriali-long-trail', 'The Long Trail', 'roshar', 'stormlight', 0.3, 0.22, '#fde68a', 'land',
    'The Iriali path through worlds. Iri is one stop; the Next Land is always further on.', { region: 'Iri', see: ['iri', 'rall-elorim'], wiki: 'Iriali', bio: 'Golden-haired pilgrims who treat continents as waystations. When the time comes, they leave.' }),
  loc('abamabar', 'Abamabar', 'roshar', 'stormlight', 0.52, 0.62, '#a8a29e', 'city',
    'Wherever Nohadon walked from to reach Urithiru. The parable survived; the road did not.', {
      region: 'The Heraldic Epochs',
      bio: 'The city Nohadon walked from when he walked to Urithiru — the walk that became The Way of Kings and the parable Dalinar cannot stop rereading. Where Abamabar was is an open question; whether the walk happened as written is a better one.', see: ['urithiru'], wiki: 'Abamabar' }),
  loc('shin-monasteries', 'The Shin Monasteries', 'roshar', 'stormlight', 0.21, 0.42, '#86efac', 'keep',
    'Where Shin train Truthless and keep stone sacred. Outsiders are not shown the inside.', {
      bio: 'Where the Shin keep their Honorblades, train their Truthless, and hold stone sacred enough that walking on it uncovered is an offence. Outsiders are not shown the inside, which is how the eight Blades Honor gave the Heralds sat unremarked in a farming country for four thousand years.', region: 'Shinovar', see: ['shinovar'], wiki: 'Shinovar' }),
  loc('stone-shamanate', 'The Stone Shamanate', 'roshar', 'stormlight', 0.225, 0.455, '#a3e635', 'scroll',
    'Ruling clergy of Shinovar. They named Szeth Truthless and pretended that settled it.', {
      bio: 'Shinovar\'s ruling clergy, who keep the Blades, name the Truthless and decide what the stone means. They declared Szeth Truthless for telling them the Voidbringers were returning, which he was right about, and sent him out with an Honorblade to prove how little they believed him.', region: 'Shinovar', see: ['shinovar'], wiki: 'Stone_Shamanate' }),
  loc('kholin-princedom', 'Kholin Princedom', 'roshar', 'stormlight', 0.795, 0.47, '#3b82f6', 'crown',
    'Eastern Alethkar under House Kholin. Kholinar is the seat; the windblades are the argument.', {
      bio: 'Eastern Alethkar under House Kholin: Kholinar for a seat, the windblades for a wall, and a family that produced a Blackthorn, a king, a Bondsmith and two more Radiants inside one generation. Dalinar spent his life conquering it for his brother and the rest of it trying to be worth it.', region: 'Alethkar', see: ['kholinar', 'alethkar'], wiki: 'Kholin_princedom' }),
  loc('sadeas-princedom', 'Sadeas Princedom', 'roshar', 'stormlight', 0.74, 0.42, '#ef4444', 'keep',
    'Northwestern Alethkar. Torol Sadeas held it like a blade and aimed it at everyone else.', {
      bio: 'Northwestern Alethkar, held by Torol Sadeas as an instrument rather than a home. Gavilar\'s oldest friend and Dalinar\'s oldest problem; his bridge crews were a policy, and Bridge Four came out of it in spite of him.', region: 'Alethkar', see: ['alethkar', 'hearthstone'], wiki: 'Sadeas_princedom' }),
  loc('roion-princedom', 'Roion Princedom', 'roshar', 'stormlight', 0.81, 0.4, '#60a5fa', 'land',
    'Northern coastal princedom. Roion died on Thaylen Field; the coast did not get quieter.', {
      bio: 'A northern coastal princedom under a highprince who was never the strongest voice in the room and knew it. Roion followed Dalinar late and paid the full price for it at Thaylen Field.', arc: 'oathbringer', region: 'Alethkar', see: ['alethkar'], wiki: 'Roion_princedom' }),
  loc('aladar-princedom', 'Aladar Princedom', 'roshar', 'stormlight', 0.75, 0.48, '#818cf8', 'land',
    'Western Alethi princedom. Aladar learned to follow Dalinar later than was comfortable.', {
      bio: 'A western princedom whose highprince took longer than was comfortable to decide Dalinar was right, and then became the Alethi coalition\'s Highprince of Information. His daughter May is considerably faster at the same arithmetic.', region: 'Alethkar', see: ['alethkar'], wiki: 'Aladar_princedom' }),
  loc('ruthar-princedom', 'Ruthar Princedom', 'roshar', 'stormlight', 0.77, 0.54, '#c084fc', 'land',
    'South-central Alethkar. Ruthar talked himself into a duel he could not win.', {
      bio: 'South-central Alethkar, under a highprince who talked himself into a duel with Adolin Kholin and discovered what the Kholin boy actually is with a Blade in his hand.', arc: 'row', region: 'Alethkar', see: ['alethkar'], wiki: 'Ruthar_princedom' }),
  loc('sebarial-princedom', 'Sebarial Princedom', 'roshar', 'stormlight', 0.8, 0.56, '#f59e0b', 'land',
    'Southern princedom of merchants and excuses. Sebarial preferred profit to glory and survived both.', {
      bio: 'A southern princedom run on ledgers by a highprince nobody took seriously, which turned out to be an advantage. Sebarial brought merchants to the warcamps instead of glory, fed half the army, and survived a war his more martial peers did not.', region: 'Alethkar', see: ['alethkar', 'warcamps'], wiki: 'Sebarial_princedom' }),
  loc('thanadal-princedom', 'Thanadal Princedom', 'roshar', 'stormlight', 0.73, 0.5, '#fb7185', 'land',
    'Alethi princedom that played the warcamps carefully and still lost the larger game.', {
      bio: 'An Alethi princedom that played the warcamps carefully, sold what it could and committed to nothing. It kept its highprince alive longer than most and lost the larger game anyway.', region: 'Alethkar', see: ['alethkar', 'warcamps'], wiki: 'Thanadal_princedom' }),
  loc('hatham-princedom', 'Hatham Princedom', 'roshar', 'stormlight', 0.76, 0.45, '#fdba74', 'land',
    'Alethi princedom of careful politics. Hatham collected allegiances like debt.', {
      bio: 'A princedom of careful politics under a highprince who collected obligations the way others collect debts, and who is more often found among ardents than among soldiers.', region: 'Alethkar', see: ['alethkar'], wiki: 'Hatham_princedom' }),
  loc('bethab-princedom', 'Bethab Princedom', 'roshar', 'stormlight', 0.785, 0.51, '#a78bfa', 'land',
    'Princedom often named beside Thanadal\'s. Another banner on the Plains.', {
      bio: 'One of the ten, usually named beside Thanadal\'s and rarely for its own sake. Another banner on the Plains, another crater full of a princedom\'s pride.', region: 'Alethkar', see: ['alethkar', 'warcamps'], wiki: 'Bethab_princedom' }),
  loc('vamah-princedom', 'Vamah Princedom', 'roshar', 'stormlight', 0.72, 0.46, '#94a3b8', 'land',
    'Northwestern marches of Alethkar, toward Herdaz. Vamah kept his head down when he could.', {
      bio: 'The northwestern marches, toward Herdaz, under a highprince whose instinct in any crisis was to keep his head down until the arithmetic was clear. It served him better than it served Alethkar.', region: 'Alethkar', see: ['alethkar', 'herdaz'], wiki: 'Vamah_princedom' }),
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
      bio: 'The expanse toward Nalthis, where colour thickens until it has weight and weather. Awakeners find it exhilarating and everyone else finds it exhausting.', realm: 'cognitive', see: ['expanse-of-the-vapors'], wiki: 'Expanse_of_Vibrance', canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'] }),
  loc('expanse-of-broken-sky', 'Expanse of the Broken Sky', 'roshar', 'stormlight', 0.45, 0.85, '#1e293b', 'storm',
    'Cognitive expanse whose sky is wrong even by Shadesmar standards. Direction, not destination.', {
      region: 'Shadesmar',
      bio: 'An expanse whose sky is wrong even by the standards of a realm where the sun does not move. It is used as a bearing rather than a destination: you go through it, and you do not stop.', realm: 'cognitive', see: ['lasting-integrity'], wiki: 'Expanse_of_the_Broken_Sky' }),
  loc('expanse-of-densities', 'Expanse of Densities', 'roshar', 'stormlight', 0.15, 0.6, '#a78bfa', 'storm',
    'Cognitive expanse toward Sel. Pressure and Dor bleed through in ways worldhoppers dread.', {
      region: 'Shadesmar',
      bio: 'The expanse toward Sel, where the Dor presses through from a Cognitive Realm that is already far too full. Worldhoppers who have been to Sel\'s subastral do not recommend it; the ones who have not are told why.', realm: 'cognitive', see: ['expanse-of-the-vapors'], wiki: 'Expanse_of_Densities', canon: 'wob', sources: ['Arcanum Unbounded', 'Word of Brandon'] }),
  loc('riino-lighthouse', 'Riino\'s Lighthouse', 'roshar', 'stormlight', 0.76, 0.66, '#fbbf24', 'tower',
    'A lighthouse in Shadesmar run by a man who was once Elantrian. He sells futures by the cup.', {
      region: 'Shadesmar',
      bio: 'A lighthouse standing in the bead ocean, kept by an Elantrian who ended up a long way from Arelon and sells glimpses of the future by the cup. Whether the futures are real is the sort of question Riino charges extra for.', arc: 'oathbringer', realm: 'cognitive', see: ['celebrant', 'elantris-city'], wiki: 'Riino' }),
  loc('shadesmar-kholinar', 'Kholinar Oathgate (Shadesmar)', 'roshar', 'stormlight', 0.793, 0.5, '#f472b6', 'gem',
    'The Cognitive side of Kholinar\'s Oathgate. Control here is control of the city\'s throat.', {
      region: 'Shadesmar',
      bio: 'The Cognitive side of Kholinar\'s Oathgate, and the reason Shallan\'s party had to fight for a platform rather than a city. Hold this and you hold the throat of Alethkar\'s capital from a realm its defenders cannot reach.', arc: 'oathbringer', realm: 'cognitive', see: ['kholinar', 'sea-of-lost-lights'] }),
  loc('honorspren-ships', 'Honorspren Ships', 'roshar', 'stormlight', 0.4, 0.78, '#fbbf24', 'ship',
    'Honorspren fleets that patrol toward Lasting Integrity. Not every spren ship wants passengers.', {
      region: 'Shadesmar',
      bio: 'Honorspren vessels patrolling the approaches to Lasting Integrity, crewed by spren with opinions about who deserves passage. After the Recreance those opinions hardened into policy, and the policy is mostly \'no\'.', arc: 'row', realm: 'cognitive', see: ['lasting-integrity'] }),
  loc('dominance-of-the-center', 'Central Dominance', 'scadrial', 'mistborn1', 0.508, 0.4, '#d6a44c', 'land',
    'Heart of the Final Empire. Luthadel sits at its centre like a spike through a map.', {
      region: 'Central Dominance',
      bio: 'The heart of the Final Empire, with Luthadel at its centre and the Pits of Hathsin in its hills. Everything the empire actually cared about was inside a week\'s ride of the capital, which is how one man governed a world for a thousand years.', eraMaps: ['ash'], see: ['luthadel'], wiki: 'Central_Dominance' }),
  loc('northern-dominance', 'Northern Dominance', 'scadrial', 'mistborn1', 0.58, 0.25, '#60a5fa', 'land',
    'Urteau\'s country. Canals, ambition, and a capital that drained itself dry.', {
      region: 'Northern Dominance',
      bio: 'Canal country, with Urteau for a capital and ambition out of proportion to its harvest. When the Collapse came it produced the rebellion that drained its own waterways to spite the nobility.', eraMaps: ['ash'], see: ['urteau'], wiki: 'Northern_Dominance' }),
  loc('western-dominance', 'Western Dominance', 'scadrial', 'mistborn1', 0.28, 0.32, '#f59e0b', 'land',
    'Cett\'s stronghold country. Fadrex City held when Luthadel could not.', {
      region: 'Western Dominance',
      bio: 'Cett\'s country, and the only Dominance whose capital was still standing and still armed when Luthadel\'s was not. Fadrex is built in rock; the Western Dominance has always known it could outlast the centre.', arc: 'hoa', eraMaps: ['ash'], see: ['fadrex'], wiki: 'Western_Dominance' }),
  loc('southern-dominance', 'Southern Dominance', 'scadrial', 'mistborn1', 0.45, 0.58, '#a8a29e', 'land',
    'Ash-choked south of the empire. Vetitan emptied itself walking north in the end.', {
      region: 'Southern Dominance',
      bio: 'The ash-choked south, where the Ashmounts fell heaviest and the plantations were worked hardest. Vetitan walked out of it northward in the last year, which is as close as the Southern Dominance came to an ending of its own.', arc: 'hoa', eraMaps: ['ash'], see: ['vetitan'], wiki: 'Southern_Dominance' }),
  loc('eastern-dominance', 'Eastern Dominance', 'scadrial', 'mistborn1', 0.68, 0.4, '#94a3b8', 'land',
    'Eastern reaches of the Final Empire, far from the Lord Ruler\'s daily shadow.', {
      region: 'Eastern Dominance',
      bio: 'The eastern reaches, far enough from Luthadel that a Ministry Conventical could be built in the mountains and mostly forgotten about by everyone except the Inquisitors who came out of it.', eraMaps: ['ash'], see: ['dominance-of-the-center'], wiki: 'Eastern_Dominance' }),
  loc('farmost-dominance', 'Farmost Dominance', 'scadrial', 'mistborn1', 0.35, 0.2, '#78716c', 'land',
    'The empire\'s remote edge. Maps grow vague; the ash does not.', {
      region: 'Farmost Dominance',
      bio: 'The empire\'s remote edge, where the maps grow vague and the obligators grow bored. The ash fell here exactly as hard as everywhere else.', eraMaps: ['ash'], wiki: 'Farmost_Dominance' }),
  loc('inner-dominance', 'Inner Dominance', 'scadrial', 'mistborn1', 0.53, 0.36, '#cbd5e1', 'land',
    'Belt around the Central Dominance — close enough to matter, far enough to scheme.', {
      region: 'Inner Dominance',
      bio: 'The belt around the Central Dominance: close enough to Luthadel to matter at court, far enough to plot in. Most of the Great Houses kept their real estates here and their politics in the capital.', eraMaps: ['ash'], see: ['dominance-of-the-center', 'luthadel'] }),
  loc('keep-venture', 'Keep Venture', 'scadrial', 'mistborn1', 0.512, 0.378, '#d6a44c', 'keep',
    'House Venture\'s fortress in Luthadel. Elend grew up inside its politics.', {
      bio: 'House Venture\'s fortress in Luthadel, and the most powerful of the Great House keeps until it was not. Straff Venture ran it as a study in cruelty; his son Elend read books in it, married a Mistborn out of it, and ended up trying to govern the empire that had orbited it.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel'], wiki: 'Keep_Venture' }),
  loc('keep-lekal', 'Keep Lekal', 'scadrial', 'mistborn1', 0.5, 0.395, '#e8b86d', 'keep',
    'Great House keep of the Lekals. Ballrooms upstairs, knives downstairs.', {
      bio: 'A Great House keep with ballrooms upstairs and assassins downstairs, which describes most of Luthadel\'s nobility and Lekal more than most. House warfare in the capital was a social season with a body count.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel'], wiki: 'Keep_Lekal' }),
  loc('keep-erikell', 'Keep Erikell', 'scadrial', 'mistborn1', 0.52, 0.39, '#a8a29e', 'keep',
    'Another of Luthadel\'s Great House fortresses, a skyline of spikes and balconies.', {
      bio: 'One of Luthadel\'s Great House fortresses: spires, balconies, and the same arrangement of glass and iron every keep used to say it could outlast a siege. Most of them were wrong.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel'], wiki: 'Keep_Erikell' }),
  loc('keep-hasting', 'Keep Hasting', 'scadrial', 'mistborn1', 0.495, 0.375, '#fbbf24', 'keep',
    'House Hasting\'s seat in the capital. The balls were prettier than the alliances.', {
      bio: 'House Hasting\'s seat, famous for throwing the prettier balls and making the worse alliances. Kelsier\'s crew used its parties the way a burglar uses an unlocked window.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel'], wiki: 'Keep_Hasting' }),
  loc('keep-tekiel', 'Keep Tekiel', 'scadrial', 'mistborn1', 0.515, 0.4, '#94a3b8', 'keep',
    'Tekiel fortress in Luthadel. The name survives into the Basin as a house that still ships cargo.', {
      bio: 'The Tekiel fortress in Luthadel, and a house name that survived the Final Empire into the Basin as a freight company. Vin\'s father was its Lord Prelan, which is a fact she learned late and did nothing with.', eraMaps: ['ash'], region: 'Luthadel', see: ['luthadel'], wiki: 'Keep_Tekiel' }),
  loc('fellise', 'Fellise', 'scadrial', 'mistborn1', 0.47, 0.41, '#c4b5fd', 'city',
    'Suburb city of Luthadel where Vin lived as Valette. Quieter streets, same empire.', {
      region: 'Central Dominance',
      bio: 'A suburb city outside Luthadel where the lesser nobility kept quieter houses, and where Vin lived as Valette Renoux — a country noblewoman with a made-up family and a borrowed accent, learning to be someone in rooms she could have killed.', arc: 'tfe', eraMaps: ['ash'], see: ['luthadel'], wiki: 'Fellise' }),
  loc('holstep', 'Holstep', 'scadrial', 'mistborn1', 0.56, 0.35, '#a8a29e', 'city',
    'Town near Luthadel. The skaa rebellion hit its garrison and learned what Inquisitors cost.', {
      region: 'Central Dominance',
      bio: 'A town near Luthadel whose garrison the skaa rebellion attacked early, and where the rebellion found out exactly what one Steel Inquisitor costs a crowd.', arc: 'tfe', eraMaps: ['ash'], see: ['luthadel'], wiki: 'Holstep' }),
  loc('kandra-homeland', 'The Kandra Homeland', 'scadrial', 'mistborn1', 0.365, 0.37, '#a3e635', 'keep',
    'Secret city of the kandra beneath the world, adjacent to the Pits and the Trust.', {
      region: 'Terris Dominance', arc: 'hoa', eraMaps: ['ash'], see: ['pits-of-hathsin'], wiki: 'Kandra_Homeland', bio: 'Contract, Bones, and the First Generation enthroned in a cavern of history. TenSoon walked out anyway.' }),
  loc('well-of-ascension', 'The Well of Ascension', 'scadrial', 'mistborn1', 0.51, 0.38, '#e0f2fe', 'crystal',
    'Preservation\'s pool beneath Kredik Shaw. Power enough to remake an empire — or free a god.', {
      region: 'Luthadel', arc: 'woa', eraMaps: ['ash'], see: ['kredik-shaw', 'luthadel'], wiki: 'Well_of_Ascension', bio: 'Rashek used it. Vin took it and gave it away. The ash remembers both choices.' }),
  loc('arguois-caverns', 'Arguois Caverns', 'scadrial', 'mistborn1', 0.48, 0.34, '#78716c', 'rock',
    'Cave network near Luthadel where skaa rebels hid and kandra sometimes listened.', {
      region: 'Central Dominance',
      bio: 'A cave network near Luthadel used by skaa rebels for shelter and by kandra for other purposes. Nothing said in a cave on Scadrial was ever as private as the speaker assumed.', eraMaps: ['ash'], see: ['luthadel'], wiki: 'Arguois_Caverns' }),
  loc('ashmount-tyrian', 'Ashmount Tyrian', 'scadrial', 'mistborn1', 0.42, 0.42, '#ef4444', 'fire',
    'One of the Ashmounts that choked the Final Empire. Eruptions were policy.', {
      region: 'Central Dominance',
      bio: 'One of the Ashmounts Rashek raised when he remade the world: volcanoes as an instrument of policy, meant to cool a planet pushed too close to its sun. They worked, and they buried the sky for a thousand years.', eraMaps: ['ash'], see: ['dominance-of-the-center'], wiki: 'Ashmounts' }),
  loc('ashmount-zerinah', 'Ashmount Zerinah', 'scadrial', 'mistborn1', 0.6, 0.45, '#f97316', 'fire',
    'Eastern Ashmount. The sky went dark from more than one throat.', {
      region: 'Eastern Dominance',
      bio: 'The eastern Ashmount. The permanent dusk over the Final Empire came out of more than one throat, and this was one of the loudest.', eraMaps: ['ash'], wiki: 'Ashmounts' }),
  loc('ashmount-doriel', 'Ashmount Doriel', 'scadrial', 'mistborn1', 0.38, 0.5, '#dc2626', 'fire',
    'Southern Ashmount whose ashfall fed the empire\'s permanent winter.', {
      region: 'Southern Dominance',
      bio: 'The southern Ashmount, whose fall fed the empire\'s permanent winter and the south\'s permanent grey. Whatever the Lord Ruler had intended, the arithmetic of ash was not something he ever got right.', eraMaps: ['ash'], wiki: 'Ashmounts' }),
  loc('ashmount-torinish', 'Ashmount Torinish', 'scadrial', 'mistborn1', 0.55, 0.3, '#b91c1c', 'fire',
    'Northern Ashmount over the canal country. Urteau breathed its dust for centuries.', {
      region: 'Northern Dominance',
      bio: 'The northern Ashmount over the canal country. Urteau breathed its dust for ten centuries and built its drainage around what settled out of the air.', eraMaps: ['ash'], see: ['urteau'], wiki: 'Ashmounts' }),
  loc('river-channerel', 'River Channerel', 'scadrial', 'mistborn1', 0.5, 0.42, '#64748b', 'canal',
    'Major river of the Final Empire\'s heartland, black with ash and industry.', {
      region: 'Central Dominance',
      bio: 'The great river of the Final Empire\'s heartland, black with ash and with everything the capital put into it. It joins the canal network at Austrex and carries the empire\'s freight to the sea.', eraMaps: ['ash'], see: ['luthadel'], wiki: 'River_Channerel' }),
  loc('austrex', 'Austrex', 'scadrial', 'mistborn1', 0.48, 0.55, '#94a3b8', 'city',
    'Capital of the Southern Dominance, where the Channerel meets the western canals.', {
      region: 'Southern Dominance',
      bio: 'Capital of the Southern Dominance, where the Channerel meets the western canals and the empire\'s grain went north. A bureaucratic town with a river\'s worth of leverage over a dominance that grew the food.', eraMaps: ['ash'], see: ['southern-dominance', 'river-channerel'], wiki: 'Austrex' }),
  loc('elendel-basin', 'Elendel Basin', 'scadrial', 'mistborn2', 0.42, 0.6, '#86efac', 'land',
    'Harmony\'s garden: fertile ring around Elendel where the ash finally stopped winning.', {
      region: 'Elendel Basin',
      bio: 'The fertile ring Sazed made when he set the world right: mountains around it, rivers through it, and soil that grows things without being argued with. Four hundred years of Basin prosperity have made it complacent, and the Roughs and the south both know it.', eraMaps: ['basin'], see: ['elendel'], wiki: 'Elendel_Basin' }),
  loc('irongate-river', 'Irongate River', 'scadrial', 'mistborn2', 0.42, 0.62, '#64748b', 'canal',
    'Main river of the Elendel Basin — runs through the capital into Hammondar Bay, and roughly splits the Roughs north from south.', {
      region: 'Elendel Basin',
      bio: 'The Basin\'s main river, running through Elendel and out to Hammondar Bay, and the rough line that divides the northern Roughs from the southern. Half the Basin\'s freight moves on it and most of its politics argue about the tolls.', eraMaps: ['basin'], see: ['elendel', 'elendel-basin'], wiki: 'Irongate_River' }),
  loc('rashekin', 'Rashekin', 'scadrial', 'mistborn2', 0.52, 0.65, '#e8b86d', 'city',
    'Basin city whose name remembers Rashek whether anyone wants it to or not.', {
      region: 'Elendel Basin',
      bio: 'A Basin city whose name remembers Rashek — the Lord Ruler, before he was the Lord Ruler — whether the Church of the Survivor wants it to or not. Scadrial\'s history is not tidy and its place names are less so.', eraMaps: ['basin'], see: ['elendel-basin'], wiki: 'Rashekin' }),
  loc('dulsing', 'Dulsing', 'scadrial', 'mistborn2', 0.48, 0.88, '#94a3b8', 'village',
    'Remote southern settlement where a crashed ship and a hunt for the Bands collided.', {
      region: 'Southern Scadrial',
      bio: 'A remote southern settlement where a Malwish airship came down and a hunt for the Bands of Mourning caught up with it. Wax found the Bands there, and something else: proof that the south had been getting on with things while the Basin admired itself.', arc: 'bom', eraMaps: ['basin'], see: ['southern-continent', 'new-seran'], wiki: 'Dulsing' }),
  loc('elendel-university', 'Elendel University', 'scadrial', 'mistborn2', 0.39, 0.61, '#d6a44c', 'scroll',
    'Where Basin science pretends the old magic is a solved problem. Marasi took notes anyway.', {
      bio: 'Where Basin science treats Allomancy as a solved problem and Feruchemy as a historical curiosity, and teaches both badly. Marasi took notes anyway, and the notes are why she is the one who understands what the Set is doing when nobody else does.', eraMaps: ['basin'], region: 'Elendel', see: ['elendel'], wiki: 'Elendel' }),
  loc('the-community', 'The Community', 'scadrial', 'mistborn2', 0.375, 0.625, '#9333ea', 'keep',
    'Cavern society beneath Elendel, cut off and cultivated by Autonomy\'s agents.', {
      region: 'Terris Dominance', arc: 'tlm', eraMaps: ['basin'], see: ['elendel'], wiki: 'Community', bio: 'Wax found a city that thought the surface was a story. Telsin had gotten there first.' }),
  loc('seran-mountains', 'Seran Range', 'scadrial', 'mistborn2', 0.78, 0.85, '#a8a29e', 'peak',
    'Mountains above New Seran. Temples, tunnels, and things the Set preferred buried.', {
      region: 'Elendel Basin',
      bio: 'The range above New Seran: old temples, older tunnels, and a set of facilities the Set would rather stayed buried. What the Basin calls archaeology, Autonomy\'s people call storage.', arc: 'bom', eraMaps: ['basin'], see: ['new-seran', 'conventical-of-seran'], wiki: 'New_Seran' }),
  loc('northern-roughs', 'Northern Roughs', 'scadrial', 'mistborn2', 0.7, 0.28, '#a8a29e', 'land',
    'Lawless north beyond the Basin rim. Wax\'s old patrol country.', {
      region: 'The Roughs',
      bio: 'The lawless country north of the Basin rim, and Wax\'s old patrol. Far Dorest is the nearest thing to a city; everything else is a siding, a mine or a grave.', arc: 'aol', eraMaps: ['basin'], see: ['the-roughs', 'weathering'], wiki: 'Roughs' }),
  loc('southern-roughs', 'Southern Roughs', 'scadrial', 'mistborn2', 0.75, 0.5, '#78716c', 'land',
    'Southern frontier beyond Basin law. Same dust, different outlaws.', {
      region: 'The Roughs',
      bio: 'The southern frontier past Basin law — the same dust as the north, different outlaws, and the same week-long wait for anyone official to arrive.', eraMaps: ['basin'], see: ['the-roughs', 'ironstand'], wiki: 'Roughs' }),
  loc('far-dorest', 'Far Dorest', 'scadrial', 'mistborn2', 0.68, 0.25, '#e8b86d', 'city',
    'Northern Roughs city. Jon Deadfinger kept the law here; Wayne nearly hung for it.', {
      region: 'The Roughs',
      bio: 'The largest town of the northern Roughs, with a lawman named Jon Deadfinger and a gallows that Wayne came within a day of using. Wax got him out; Wayne has been paying that off in his own way ever since.', arc: 'aol', eraMaps: ['basin'], see: ['northern-roughs', 'the-roughs'], wiki: 'Far_Dorest' }),
  loc('sovereign-temple', 'The Sovereign\'s Temple', 'scadrial', 'mistborn2', 0.5, 0.92, '#fbbf24', 'keep',
    'Southern temple where the Lord Ruler-as-Sovereign left the Bands of Mourning.', {
      region: 'Southern Scadrial', arc: 'bom', eraMaps: ['basin'], see: ['southern-continent', 'dulsing'], wiki: 'Bands_of_Mourning', bio: 'Ice, traps, and a spear that was never just a spear. The Malwish got there with better coats.' }),
  loc('malwish-nations', 'Malwish Nations', 'scadrial', 'mistborn2', 0.54, 0.86, '#64748b', 'land',
    'Southern Scadrian peoples under the Masked Ones\' banners. Airships, medallions, and old grudges.', {
      region: 'Southern Scadrial',
      bio: 'The southern peoples under the Masked Ones\' banners: airships, unsealed metalminds, ettmetal, and four centuries of getting on with it while the north assumed it was alone. The Malwish arrived in the Basin as traders, allies and eventually an occupying force, in that order.', arc: 'bom', eraMaps: ['basin'], see: ['southern-continent'], wiki: 'Southern_Scadrians' }),
  loc('ladrian-mansion', 'Ladrian Mansion', 'scadrial', 'mistborn2', 0.382, 0.612, '#d6a44c', 'home',
    'House Ladrian\'s city seat in Elendel. Wax came home to ledgers and left for bullets.', {
      bio: 'House Ladrian\'s seat in Elendel, and the ledgers Wax inherited along with a bankrupt house and a title he had spent twenty years avoiding. He married Steris for the accounts and got rather more than that.', arc: 'aol', eraMaps: ['basin'], region: 'Elendel', see: ['elendel'], wiki: 'Ladrian_mansion' }),
  loc('teoin', 'Teoin', 'sel', 'elantris', 0.21, 0.27, '#818cf8', 'crown',
    'Capital of Teod. Sarene\'s home port, and the kingdom\'s answer to Fjorden\'s sermons.', {
      region: 'Teod',
      bio: 'Teod\'s capital and home port, and the kingdom\'s standing answer to Fjordell sermons: a fleet, a treasury and a royal family that has read the theology and declined it.', see: ['teod'], wiki: 'Teoin' }),
  loc('widor', 'Widor', 'sel', 'elantris', 0.7, 0.36, '#ef4444', 'crown',
    'Capital of Fjorden and seat of Shu-Dereth\'s Wyrn. Gyorns leave from here; countries fall after.', {
      region: 'Fjorden',
      bio: 'Fjorden\'s capital and Wyrn\'s seat, where the gyorns are appointed and the next conversion is planned. Countries do not usually notice they are being taken until someone from Widor has already been living in their capital for a year.', see: ['fjorden', 'dakhor'], wiki: 'Widor' }),
  loc('iseid', 'Iseid', 'sel', 'elantris', 0.43, 0.48, '#c4b5fd', 'city',
    'Arelish city beyond Kae\'s shadow. The Shaod did not only strike the capital\'s walls.', {
      region: 'Arelon',
      bio: 'An Arelish city well beyond Kae, and a reminder that the Shaod does not take people only at the capital. Anyone, anywhere in Arelon, can go to sleep whole and wake up Elantrian.', see: ['arelon', 'kae'], wiki: 'Iseid' }),
  loc('hraggen', 'Hraggen', 'sel', 'elantris', 0.64, 0.4, '#f87171', 'land',
    'Fjordell province, thoroughly Derethi and sure of it.', {
      region: 'Fjorden',
      bio: 'A Fjordell province, entirely Derethi and entirely certain about it. The certainty is the export.', see: ['fjorden'], wiki: 'Hraggen' }),
  loc('jaador', 'Jaador', 'sel', 'elantris', 0.66, 0.48, '#fb7185', 'land',
    'Nation under Fjorden\'s heel. Another conversion counted in Wyrn\'s ledgers.', {
      region: 'Opelon',
      bio: 'A nation under Fjorden\'s heel, counted in Wyrn\'s ledgers as a conversion rather than a conquest, which is the distinction Shu-Dereth exists to maintain.', see: ['fjorden', 'svorden'], wiki: 'Jaador' }),
  loc('dzhamar', 'Dzhamar', 'sel', 'emperorssoul', 0.76, 0.58, '#a78bfa', 'land',
    'Homeland of the Bloodsealers. Stamps that use blood instead of ink, and debts that collect themselves.', {
      region: 'Dzhamar',
      bio: 'Homeland of the Bloodsealers, whose stamps use blood instead of ink and whose creations are made of other people\'s bones. It is Forgery\'s ugly cousin, and the Rose Empire hires it anyway when a debt needs collecting.', see: ['rose-empire', 'maipon'], wiki: 'Dzhamar' }),
  loc('mulladil', 'Mulla\'dil', 'sel', 'emperorssoul', 0.74, 0.6, '#c084fc', 'land',
    'Mountain homeland of the Strikers — Grands\' bodyguards, and Shai\'s least favourite neighbours.', {
      region: 'Mulla\'dil',
      bio: 'The mountain homeland of the Strikers, who serve the Grands of the Rose Empire as bodyguards and are very good at it. Shai has been caught by them before and does not intend to discuss it.', see: ['rose-empire', 'dzhamar'], wiki: 'Mulla\'dil' }),
  loc('imperial-seat', 'The Imperial Seat', 'sel', 'emperorssoul', 0.8, 0.6, '#f472b6', 'crown',
    'Capital of the Rose Empire, where an emperor can be replaced by a well-written soul.', {
      region: 'Rose Empire', see: ['rose-empire'], wiki: 'Rose_Empire', bio: 'The Arbiter\'s courts, the Grands\' factions, and a Forger in a cell who was the only person awake.' }),
  loc('farcoast', 'Farcoast', 'sel', 'emperorssoul', 0.86, 0.64, '#fb7185', 'land',
    'Rose Empire province on the edge of the maps Shai grew up hearing about.', {
      region: 'Rose Empire',
      bio: 'A Rose Empire province out at the edge of the maps Shai grew up hearing about — far enough that the court\'s factional weather arrives late and distorted.', see: ['rose-empire'], wiki: 'Farcoast' }),
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
  loc('elantris-mountains', 'The Mountains of Elantris', 'sel', 'elantris', 0.44, 0.36, '#cbd5e1', 'peak',
    'Range above Elantris holding Devotion\'s pool. Pilgrims climbed; the city below shone.', {
      region: 'Arelon',
      bio: 'The range above Elantris, holding the pool that is Devotion\'s perpendicularity. Pilgrims climbed to it while the city below still shone; worldhoppers use it for something else entirely.', see: ['elantris-city'], wiki: 'Elantris_(city)' }),
  loc('rain', 'Rain', 'sel', 'emperorssoul', 0.82, 0.66, '#38bdf8', 'land',
    'Rose Empire faction-land of the Rain party — one of the Grands\' political weather systems.', {
      region: 'Rose Empire',
      bio: 'One of the Rose Empire\'s factions, which function less like parties than like weather systems moving across the court. Shai\'s problem in The Emperor\'s Soul is not the forgery; it is which faction wants the Emperor awake.', see: ['rose-empire', 'imperial-seat'], wiki: 'Rose_Empire' }),
  loc('bevalis', 'Bevalis', 'nalthis', 'warbreaker', 0.47, 0.26, '#e2e8f0', 'crown',
    'Capital of Idris. Grey clothes, high halls, and a king trading his daughter for a peace that would not hold.', {
      region: 'Idris',
      bio: 'Idris\'s capital: grey stone, high halls, and a king who traded a daughter for a peace he knew would not hold. Dedelin sent Siri because Vivenna was the one he could not bear to lose, which is the sort of arithmetic Idris does not admit to doing.', see: ['idris'], wiki: 'Bevalis' }),
  loc('inner-sea-nalthis', 'The Inner Sea', 'nalthis', 'warbreaker', 0.56, 0.5, '#67e8f9', 'sea',
    'Sea between Idris\'s highlands and Hallandren\'s low jungles. Trade and invasion use the same water.', {
      region: 'Nalthis',
      bio: 'The water between Idris\'s highlands and Hallandren\'s jungles. Trade uses it, and so would an invasion; the two kingdoms have spent twenty years pretending the second is unthinkable while building for it.', see: ['hallandren', 'idris'], wiki: 'Inner_Sea' }),
  loc('highlands-idris', 'Idrian Highlands', 'nalthis', 'warbreaker', 0.48, 0.22, '#cbd5e1', 'peak',
    'Cold mountains of Austrism. Colour is sin; Breath is theology; Hallandren is downhill.', {
      region: 'Idris',
      bio: 'Cold mountains where Austrism holds that colour is indulgence, Awakening is theft, and Breath belongs to the person born with it. It is a real theology with real arguments, and Hallandren is always downhill from it in more than one sense.', see: ['idris', 'bevalis'], wiki: 'Idris' }),
  loc('tedradel', 'Tedradel', 'nalthis', 'warbreaker', 0.7, 0.48, '#f9a8d4', 'land',
    'Nation across the water that trades with Hallandren and stays politely unabsorbed.', {
      region: 'Nalthis',
      bio: 'A nation across the water that trades with Hallandren, hears the sermons, and remains politely unabsorbed. Being useful and unthreatening has kept it that way.', see: ['hallandren'], wiki: 'Tedradel' }),
  loc('huth', 'Huth', 'nalthis', 'warbreaker', 0.4, 0.4, '#a8a29e', 'land',
    'Vanished kingdom of the Manywar. Pahn Kahl remembers; Hallandren paved it over.', {
      region: 'Nalthis',
      bio: 'One of the kingdoms the Manywar ended. Vasher and Shashara built Nightblood in that war and Huth is one of the answers to what it cost; Hallandren is built over where it used to be.', see: ['pahn-kahl', 'hallandren'], wiki: 'Huth' }),
  loc('kuth', 'Kuth', 'nalthis', 'warbreaker', 0.38, 0.45, '#78716c', 'land',
    'Sister-kingdom to Huth, also erased by the Manywar\'s arithmetic.', {
      region: 'Nalthis',
      bio: 'Huth\'s sister-kingdom, erased by the same arithmetic. The Manywar is why Hallandren exists and why the Returned are treated as a military asset rather than a religious one.', see: ['huth', 'hallandren'], wiki: 'Kuth' }),
  loc('pahn-kahl-lowlands', 'Pahn Kahl Lowlands', 'nalthis', 'warbreaker', 0.65, 0.7, '#5eead4', 'grass',
    'Floodplains and canals of the Pahn Kahl. Quiet work until the revolt stops being quiet.', {
      region: 'Pahn Kahl',
      bio: 'The floodplains and canals the Pahn Kahl work, quietly, inside a kingdom that does not think of them as a people. Quiet is a strategy until it stops being one.', see: ['pahn-kahl', 'ttelir'], wiki: 'Pahn_Kahl' }),
  loc('diem-site', 'The Diem', 'taldain', 'whitesand', 0.415, 0.475, '#fbbf24', 'tower',
    'Sand master fortress-guild in Kezare. Floors for ranks, and a roof that did not save them.', {
      region: 'Lossand',
      bio: 'The sand masters\' fortress-guild in Kezare, with a floor for each rank and an income from the sand trade. It was attacked and gutted, and what is left is Kenton arguing that an order of eight survivors is still an order.', see: ['kezare', 'lossand'], wiki: 'Diem' }),
  loc('deep-sand', 'Deep Sand', 'taldain', 'whitesand', 0.35, 0.55, '#fde68a', 'land',
    'True desert beyond Lossand\'s settled rim. Sandlings hunt there; water is a rumour.', {
      region: 'Dayside',
      bio: 'True desert past Lossand\'s settled rim, where the sandlings hunt, water is a rumour and a sand master\'s power runs out at exactly the moment it is needed. Crossing it is a thing people survive rather than do.', see: ['lossand', 'dayside'], wiki: 'Deep_Sand' }),
  loc('kerzt', 'Kerzt', 'taldain', 'whitesand', 0.28, 0.42, '#f59e0b', 'land',
    'Dayside nation of the Kerztian people, often at odds with Lossand over sand and faith.', {
      region: 'Dayside',
      bio: 'The Dayside nation of the Kerztian people, whose faith holds sand mastery to be an abomination and whose roads Lossand depends on. The two have a border, a trade relationship and a permanent theological grievance.', see: ['lossand', 'dayside'], wiki: 'Kerztian' }),
  loc('lonzare', 'Lonzare', 'taldain', 'whitesand', 0.74, 0.48, '#818cf8', 'city',
    'Darkside capital of electric light — where night is weather and dynamos are theology.', {
      region: 'Darkside',
      bio: 'The Darkside capital, where night is simply the weather and the dynamos are close enough to theology. Everything Dayside thinks is impossible is municipal infrastructure here.', see: ['darkside'], wiki: 'Lonzare' }),
  loc('nortallon', 'Nor\'Tallon', 'taldain', 'whitesand', 0.7, 0.42, '#6366f1', 'land',
    'A Darkside nation beyond Lossand\'s sun. Guns come from here; Dayside still calls them blasphemy.', {
      region: 'Darkside',
      bio: 'A Darkside nation beyond the reach of Lossand\'s sun, and where the guns come from. Dayside calls them blasphemy and buys them anyway, which is the shape of most of the two hemispheres\' dealings.', see: ['darkside', 'lonzare'], wiki: 'Nor\'Tallon' }),
  loc('dayside-mountains', 'The Dayside Mountains', 'taldain', 'whitesand', 0.36, 0.38, '#a8a29e', 'peak',
    'Range dividing portions of Dayside. Shadow is precious; so is the pass.', {
      region: 'Dayside',
      bio: 'The range that divides parts of Dayside, where shadow is a resource and a pass is worth a war. Under a sun that never moves, shade is real estate.', see: ['dayside', 'lossand'] }),
  loc('rim-kingdom', 'The Rim Kingdoms', 'taldain', 'whitesand', 0.3, 0.48, '#fdba74', 'land',
    'Lesser Dayside states along Lossand\'s edge — trade partners when the Kerztian roads close.', {
      region: 'Dayside',
      bio: 'The lesser Dayside states along Lossand\'s edge, useful trade partners whenever the Kerztian roads close, which is often enough to keep them in business.', see: ['lossand', 'kerzt'] }),
  loc('a-kar', 'A\'Kar', 'taldain', 'whitesand', 0.27, 0.4, '#ef4444', 'keep',
    'Kerztian high priest\'s seat of faith. Lossand hears the sermons as threats, usually correctly.', {
      region: 'Kerzt',
      bio: 'The seat of the Kerztian high priest, from which the sermons against sand mastery are issued. Lossand hears them as threats, and has generally been right to.', see: ['kerzt'], wiki: 'A\'Kar' }),
  loc('roseite-sea', 'Roseite Sea', 'lumar-world', 'tress', 0.58, 0.38, '#fb7185', 'sea',
    'Another name sailors give the Crimson\'s roseite aether — coral-spores that grow into reefs and cages.', {
      region: 'Crimson Sea',
      bio: 'What sailors call the Crimson when they are being precise about what is in it. Roseite grows into coral and cages, and a ship caught in a roseite bloom is not salvaged so much as excavated.', see: ['crimson-sea'], wiki: 'Crimson_Sea' }),
  loc('sorceress-island', 'The Sorceress\'s Island', 'lumar-world', 'tress', 0.82, 0.56, '#312e81', 'island',
    'Riina\'s domain in the Midnight Sea. Curses for trespassers; worse for people she finds interesting.', {
      region: 'Midnight Sea', see: ['midnight-sea'], wiki: 'Riina', bio: 'An Elantrian exile with a tower, a board of living pieces, and no patience for moons that misbehave.' }),
  loc('riina-tower', 'Riina\'s Tower', 'lumar-world', 'tress', 0.835, 0.55, '#6366f1', 'tower',
    'The Sorceress\'s seat. Midnight Essence at the foundations; paperwork of doom upstairs.', {
      region: 'Midnight Sea',
      bio: 'The Sorceress\'s seat, founded on Midnight Essence and administered with a great deal of paperwork. Tress goes there to buy her husband back and finds a curse, a bureaucracy and a considerably older story underneath.', see: ['sorceress-island', 'midnight-sea'], wiki: 'Riina' }),
  loc('spore-fall-verdant', 'Verdant Lunagree', 'lumar-world', 'tress', 0.42, 0.45, '#34d399', 'storm',
    'Where the verdant moon rains spores into the Emerald Sea. Stay dry. Stay drier than that.', {
      region: 'Emerald Sea',
      bio: 'The lunagree of the verdant moon: a column of falling spores, straight down out of a moon that never moves, feeding the sea it stands over. Sailing under one is survivable only if nothing on board is damp.', see: ['emerald-sea'], wiki: 'Lunagree' }),
  loc('midnight-lunagree', 'Midnight Lunagree', 'lumar-world', 'tress', 0.8, 0.52, '#1e1b4b', 'storm',
    'Sporefall of Midnight Essence. The Sorceress prefers neighbours who cannot breathe her weather.', {
      region: 'Midnight Sea',
      bio: 'The sporefall of Midnight Essence, and the reason the Sorceress\'s neighbours are so few. She prefers weather her visitors cannot breathe.', see: ['midnight-sea', 'sorceress-island'] }),
  loc('cinder-kings-palace', 'Cinder King\'s Palace', 'canticle-world', 'sunlit', 0.56, 0.47, '#fb923c', 'crown',
    'The seat on Union where the Cinder King mounts sunhearts and calls it stewardship.', {
      region: 'The Corridor',
      bio: 'The seat aboard Union where the Cinder King mounts harvested sunhearts on his walls and calls it stewardship. He brands people into Charred, binds the Chorus, and has an answer for every objection.', see: ['union', 'beacon'], wiki: 'Cinder_King' }),
  loc('prospector-camps', 'Prospector Camps', 'canticle-world', 'sunlit', 0.35, 0.55, '#fde68a', 'village',
    'Temporary digs ahead of the dawn, harvesting sunhearts before the heat takes the ground back.', {
      region: 'The Corridor',
      bio: 'Temporary digs set down behind the cities and ahead of the dawn, pulling sunhearts out of ground that has hours left. The crews are told the margins are generous and the margins are not.', see: ['the-corridor', 'beacon'] }),
  loc('chorus-hall', 'The Chorus', 'canticle-world', 'sunlit', 0.57, 0.5, '#f59e0b', 'drum',
    'Union\'s gathered voices of the dead-that-still-advise. Nomad heard them; he did not love them.', {
      region: 'The Corridor',
      bio: 'Where Union keeps the Chorus: the gathered dead of Canticle, screaming and advising at once, used by the Cinder King as counsel and as threat. Nomad heard them and did not love them, which is the mildest possible summary.', see: ['union'], wiki: 'Chorus' }),
  loc('beacon-engine', 'Beacon\'s Engines', 'canticle-world', 'sunlit', 0.295, 0.505, '#fbbf24', 'fire',
    'The machinery that keeps Beacon one step ahead of sunrise. Fail once and the city is ash.', {
      region: 'The Corridor',
      bio: 'The machinery that keeps Beacon a step ahead of sunrise, kept running by people who know exactly what one failure costs. It is the most important room on the planet and it is held together with salvage.', see: ['beacon', 'longroad'] }),
  loc('hion-line-network', 'Hion Lines', 'komashi', 'yumi', 0.55, 0.48, '#22d3ee', 'canal',
    'Twin lines of cold light that cut the Shroud and power every city that still pretends to be awake.', {
      region: 'Komashi', see: ['kilahito', 'the-shroud'], wiki: 'Hion', bio: 'Cyan and magenta. Without them the nightmares have no border and the cities have no excuse.' }),
  loc('painter-district', 'Painter District', 'komashi', 'yumi', 0.63, 0.47, '#67e8f9', 'scroll',
    'Kilahito wards where nightmare painters keep shifts and count their stable jobs in ink.', {
      region: 'Komashi',
      bio: 'The Kilahito wards where nightmare painters keep their shifts and measure their status in stable contracts. Painter has none, which is most of his problem and all of his freedom.', see: ['kilahito', 'dreamwatch'], wiki: 'Nightmare_painter' }),
  loc('father-machine-site', 'The Father Machine', 'komashi', 'yumi', 0.5, 0.5, '#e879f9', 'keep',
    'The device that ate Torio\'s sky and remade a world into hion and hunger.', {
      region: 'Komashi', see: ['torio', 'the-shroud'], wiki: 'Father_machine', bio: 'Built to contact the spirits. It bound them instead, and wore their world as a mask.' }),
  loc('yoki-hijo-shrine', 'Yoki-hijo Shrine', 'komashi', 'yumi', 0.37, 0.51, '#f0abfc', 'bell',
    'Ritual ground where yoki-hijo stacked stones and bargained with spirits before the machine won.', {
      region: 'Komashi',
      bio: 'Ritual ground where yoki-hijo stacked stones and bargained with spirits for the things a town needed, back when that was still what the ritual did. The machine took over the arrangement and left the ceremony in place.', see: ['torio', 'torio-steamwell'], wiki: 'Yoki-hijo' }),
  loc('forests-hell-name', 'Hell', 'threnody', 'shadowsforsilence', 0.52, 0.53, '#0f1a10', 'forest',
    'What Homeland folk call the Forests when the Simple Rules feel like theology instead of advice.', {
      region: 'The Forests',
      bio: 'What Homeland folk call the Forests when the Simple Rules stop sounding like practical advice and start sounding like theology. The name has stuck hard enough that outsiders use it as a place name.', see: ['forests-of-hell', 'the-homeland'], wiki: 'Forests_of_Hell' }),
  loc('silver-waystop', 'Silver Waystops', 'threnody', 'shadowsforsilence', 0.46, 0.55, '#e2e8f0', 'home',
    'Homeland inns that keep silver handy and questions quieter. Silence\'s Crossroads is the famous one.', {
      region: 'The Homeland',
      bio: 'Inns on the Forest roads that keep silver in the walls, salt at the threshold and their questions to themselves. Silence\'s Crossroads is the famous one, and the famous one is famous for what happened at it.', see: ['the-crossroads', 'lastport'] }),
  loc('shades-boundary', 'The Shade Line', 'threnody', 'shadowsforsilence', 0.48, 0.5, '#44403c', 'land',
    'Where settled Threnody admits the Forests begin. The shades do not respect the signage.', {
      region: 'The Forests',
      bio: 'The line where settled Threnody admits the Forests begin: marked, patrolled, and treated by the shades as a suggestion. Everything about the boundary is for the living\'s benefit.', see: ['the-homeland', 'forests-of-hell'] }),
  loc('patjis-eye', 'Patji\'s Eye', 'first-of-the-sun', 'sixthofdusk', 0.53, 0.51, '#22d3ee', 'lake',
    'Lake at Patji\'s heart — a perpendicularity wearing the shape of still water.', {
      region: 'The Pantheon', see: ['patji'], wiki: 'Patji\'s_Eye', eraMin: 1, bio: 'Aviar drink power here. Trappers die for approaches. Patji does not care which.' }),
  loc('pantheon', 'The Pantheon', 'first-of-the-sun', 'sixthofdusk', 0.5, 0.48, '#4ade80', 'island',
    'Archipelago of god-islands. Patji is Father; the rest are merely lethal.', {
      region: 'The Pantheon',
      bio: 'An archipelago of god-islands, each named for a deity and each an ecosystem specifically hostile to visitors. The aviar come from here — birds that bond a person and grant a talent while quietly taking something in exchange — and the Eelakin have made a profession out of surviving the collection.', see: ['patji', 'sori', 'suluko'], wiki: 'Pantheon', eraMin: 1 }),
  loc('eelakin-traps', 'Patji\'s Trails', 'first-of-the-sun', 'sixthofdusk', 0.51, 0.49, '#86efac', 'forest',
    'Traplines and false paths Sixth of the Dusk maintained. The island rearranges the rest.', {
      region: 'The Pantheon',
      bio: 'The traplines and deliberately false paths Sixth of the Dusk maintained on Patji. The traps are half the job; the other half is that the island rearranges everything else while you are not looking.', see: ['patji', 'patjis-eye'], eraMin: 1 }),
  loc('shattering-site', 'Site of the Shattering', 'yolen', 'core', 0.5, 0.48, '#fef3c7', 'crystal',
    'Wherever on Yolen the Vessels killed Adonalsium. The planet has not forgotten the geometry.', {
      region: 'Yolen',
      bio: 'Wherever on Yolen sixteen people killed Adonalsium. What is known is that it happened, that they used a Dawnshard to do it, and that the power went sixteen ways rather than back where it came from. The planet has not forgotten the geometry; nobody has written down what the geometry was.', canon: 'speculation', sources: ['Word of Brandon'], see: ['fain-wilds', 'yolen-dragons'] }),
  loc('fain-border', 'Fain Borderlands', 'yolen', 'core', 0.6, 0.5, '#86efac', 'forest',
    'Where fain ecology meets everything else. The two biologies share a planet and refuse a treaty.', {
      region: 'Yolen',
      bio: 'The front where fain ecology meets ordinary ecology. Neither can eat the other and neither will yield ground, so the border is a standing argument several million years old.', canon: 'wob', sources: ['Word of Brandon'], see: ['fain-wilds'] }),
  loc('ashes-of-ashyn', 'The Ashes of Ashyn', 'ashyn', 'stormlight', 0.52, 0.52, '#fcd34d', 'fire',
    'Surface left uninhabitable by Surge-work and plague. The cities learned to stay off the ground.', {
      region: 'Ashyn',
      bio: 'The surface: ruined by Surgebinding used without oaths and by the plagues that followed. It is the argument for why the Radiants have Ideals at all, and the reason the Heralds took the bargain they took.', canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'], see: ['floating-cities'] }),
  loc('damnation', 'Damnation', 'braize', 'stormlight', 0.5, 0.52, '#991b1b', 'fire',
    'Vorin name for Braize — the place of eternal punishment that turned out to be a prison for gods\' soldiers.', {
      region: 'Braize', see: ['braize-prison'], wiki: 'Braize', bio: 'Ten heartbeats from the Heralds\' first lie. The fused came back anyway.' }),
  loc('braize-holds', 'The Holds of Braize', 'braize', 'stormlight', 0.48, 0.48, '#7f1d1d', 'keep',
    'Cognitive-adjacent prisons and proving grounds where Fused waited between Desolations.', {
      region: 'Braize',
      bio: 'The Cognitive-adjacent places where the Fused waited out the years between Desolations — not sleeping, not dead, and remembering every one of the nine returns.', realm: 'cognitive', see: ['damnation', 'braize-prison'], canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'] }),
  loc('ire-fortress', 'The Ire Fortress', 'scadrial', 'secrethistory', 0.2, 0.2, '#a78bfa', 'keep',
    'Elantrian fortress in the Cognitive Realm near Scadrial. They meant to take Preservation\'s power with paperwork.', {
      region: 'Shadesmar', realm: 'cognitive', eraMaps: ['ash'], see: ['well-of-ascension'], wiki: 'Ire', bio: 'Kelsier robbed them. They never quite got over it.' }),
  loc('vax-crossing', 'Vax', 'vax', 'core', 0.5, 0.5, '#d8b4fe', 'land',
    'A world named more often than described. Worldhoppers use it as a direction and a shrug.', {
      region: 'Vax',
      bio: 'A world named far more often than it is described: worldhoppers use it as a direction and a shrug. Its magic is said to involve Initiation, it is restricted for reasons nobody will state, and any map that claims to place it — including this one — is guessing.', canon: 'wob', sources: ['Word of Brandon', 'Elantris'], wiki: 'Vax' }),
  loc('obrodai-avatar-shore', 'Autonomy\'s Shore', 'obrodai-world', 'mistborn2', 0.52, 0.48, '#db2777', 'land',
    'Coast where Autonomy\'s avatar took root. The planet learned a new name for ambition.', {
      region: 'Obrodai',
      bio: 'The coast where Autonomy\'s avatar took root and a local religion grew up around her. Worldhoppers who meddle here find that the local religious scene is not friendly and that the deity is paying attention.', arc: 'tlm', see: ['obrodai-claim'], sources: ['The Lost Metal'] }),
  loc('moelach-valley', 'Moelach\'s Drift', 'roshar', 'stormlight', 0.7, 0.6, '#78716c', 'storm',
    'Country where the Unmade Moelach\'s influence made Death Rattles common coin.', {
      bio: 'Country where the Unmade Moelach drifted, and where the dying began to speak in rhymes nobody had taught them. The Diagram was built on a harvest of those Death Rattles; Taravangian\'s people collected them in hospital beds and called it charity.', arc: 'twok', region: 'Jah Keved', see: ['jah-keved', 'bavland'], wiki: 'Moelach' }),
  loc('natan-coast', 'Natan Coast', 'roshar', 'stormlight', 0.87, 0.62, '#67e8f9', 'port',
    'Shores of old Natanatan and New Natanan — blue-veined people and a broken kingdom\'s leftovers.', {
      region: 'Natanatan',
      bio: 'The shores of old Natanatan and the port that replaced it. The Natan people have blue-tinged skin and a kingdom that stopped existing when the Plains broke, and they have been a minority in other people\'s countries ever since.', see: ['new-natanan', 'natanatan'], wiki: 'Natanatan' }),
  loc('aimian-scouring', 'The Scouring of Aimia', 'roshar', 'stormlight', 0.1, 0.56, '#94a3b8', 'fire',
    'Whatever broke Aimia left islands that kill visitors and a people in hiding.', {
      region: 'Aimia',
      bio: 'Whatever emptied Aimia. The larkins were hunted out, the islands became lethal to approach, and an entire people either died or went into hiding as Dysian hordes. The Sleepless know what happened. The Sleepless are not saying.', arc: 'dawnshard', see: ['aimia', 'akinah'], wiki: 'Scouring_of_Aimia' }),
  loc('undersea-aimia', 'Aimian Waters', 'roshar', 'stormlight', 0.07, 0.58, '#475569', 'sea',
    'Seas around Aimia\'s husks. Larkins hunted here until there was nothing left to hunt for.', {
      region: 'Aimia',
      bio: 'The seas around Aimia\'s husks, where the larkin were hunted until there was nothing left to hunt, and where the shipping charts simply stop. What defends the islands reaches this far out.', see: ['aimia', 'akinah'] }),
  loc('cultivation-valley-approaches', 'Approaches to the Valley', 'roshar', 'stormlight', 0.66, 0.545, '#4ade80', 'forest',
    'Forest roads to the Nightwatcher. Pilgrims mark them; few mark the walk back the same way.', {
      region: 'The Valley',
      bio: 'The forest roads that pilgrims take to the Nightwatcher. They mark the way in carefully; very few of them mark the way out the same, because the boon and the curse together tend to change what a person thinks the road was for.', arc: 'oathbringer', see: ['the-valley', 'horneater-peaks'] }),
  loc('urithiru-mountains', 'The Mountains of Urithiru', 'roshar', 'stormlight', 0.46, 0.65, '#bae6fd', 'peak',
    'High central range that hides the tower-city. Above the storms; below the gods\' old arguments.', {
      region: 'Urithiru',
      bio: 'The high central range that hides the tower-city: above the storms, above the treeline, and far enough from every kingdom that none of them found it for four thousand years. The Oathgates are the only sensible way up, which was the design.', see: ['urithiru'], wiki: 'Urithiru' }),
  loc('frostlands-road', 'Frostlands Road', 'roshar', 'stormlight', 0.78, 0.7, '#cbd5e1', 'land',
    'Cold track between the warcamps\' supply and New Natanan\'s thin hospitality.', {
      region: 'The Frostlands',
      bio: 'The cold track between the warcamps\' supply lines and New Natanan\'s thin hospitality. It is the only land route east, it takes months, and the Alethi used it for six years while complaining that someone ought to do something about it.', see: ['frostlands', 'new-natanan', 'warcamps'] }),
  loc('listener-atlas', 'Listener Homelands', 'roshar', 'stormlight', 0.84, 0.76, '#9ca3af', 'drum',
    'Plateau country the listeners held before the Alethi war — Narak at the centre, songs at the edge.', {
      region: 'Shattered Plains',
      bio: 'The plateau country the listeners held before the Alethi came: Narak at the centre, the chasms for roads, and a people who had deliberately given up their gods\' forms to stay free of them. They lasted centuries out here by being beneath notice.', arc: 'wor', see: ['narak', 'stormseat'], wiki: 'Listeners' }),
  loc('singer-last-legion', 'The Last Legion\'s March', 'roshar', 'stormlight', 0.85, 0.73, '#78716c', 'land',
    'Remembered path of the listeners\' ancestors who fled the gods and found the Plains instead.', {
      region: 'Shattered Plains',
      bio: 'The remembered march of the listeners\' ancestors — singers who broke from Odium\'s forms, fled the war, and lost their memory of everything but the leaving. They found the Plains, and the Plains were empty, and that was enough for a very long time.', see: ['narak', 'shattered-plains'], wiki: 'Last_Legion' }),
  loc('oathgate-thar', 'Thaylen Oathgate', 'roshar', 'stormlight', 0.612, 0.855, '#4ade80', 'gem',
    'Oathgate platform of Thaylen City — hub of the battle that remade the war.', {
      region: 'Thaylenah',
      bio: 'Thaylen City\'s Oathgate platform, and the hinge of the battle fought around it. Getting it working again is what let the coalition arrive at all, and what let the wounded be taken out afterwards.', arc: 'oathbringer', see: ['thaylen-city', 'thaylen-field'], wiki: 'Oathgate' }),
  loc('emuli-front', 'Emuli Front', 'roshar', 'stormlight', 0.36, 0.76, '#d97706', 'land',
    'Contested ground where Azir, Emul, and Tukar spent a generation trading the same ruined towns.', {
      region: 'Emul',
      bio: 'The contested ground where Azir, Emul and Tukar traded the same ruined towns for a generation, and where the coalition\'s armies later found out that a war with the Fused is not a war with neighbours. Taravangian\'s Veden troops fought here for the wrong side.', arc: 'row', see: ['emul', 'tukar', 'sesemalex-dar'] }),
  loc('tukari-coast', 'Tukari Coast', 'roshar', 'stormlight', 0.43, 0.72, '#a78bfa', 'port',
    'Shoreline under the god-priest\'s war. Tezim\'s banners; someone else\'s soul behind them.', {
      region: 'Tukar',
      bio: 'The shoreline under Tezim\'s war: a god-priest\'s banners over a country run by a Herald who lost his mind four thousand years ago and has been giving orders ever since. Ishar\'s coast, and someone else\'s soul behind the crown.', see: ['tukar', 'emul'] }),
  loc('marat-roads', 'Marat Trade Roads', 'roshar', 'stormlight', 0.735, 0.58, '#f59e0b', 'land',
    'Caravan routes across Marat that fed Alethkar\'s wars and fled them in the same season.', {
      region: 'Marat',
      bio: 'The caravan routes across Marat that fed Alethkar\'s wars, and that the same caravans fled along when the Fused took the country in a season. Trade roads are an excellent way to move an army, which is why Marat had no chance.', see: ['marat', 'alethkar'] }),
  loc('babatharnam-vines', 'The Living Cities', 'roshar', 'stormlight', 0.295, 0.555, '#86efac', 'forest',
    'Babatharnam\'s settlements wound through animate vines. Age is rank; the plants enforce it.', {
      region: 'Babatharnam',
      bio: 'Babatharnam\'s settlements, grown through vinework that moves on its own schedule and rearranges the streets to suit a hierarchy based on age. Living here requires knowing both the politics and the plants, and the plants are less forgiving.', see: ['babatharnam'], wiki: 'Babatharnam' }),
  loc('purelake-temple', 'Purelake Temple Ruins', 'roshar', 'stormlight', 0.44, 0.48, '#67e8f9', 'bell',
    'Half-submerged holy sites the Purelakers still fish around. The water is the congregation.', {
      region: 'The Purelake',
      bio: 'Half-drowned holy sites the Purelakers fish around without much ceremony. Whatever was worshipped here predates Vorinism; the lake has covered it to the knee and the congregation has adapted.', see: ['purelake', 'bornwater'] }),
  loc('luthadel-gates', 'Luthadel Gates', 'scadrial', 'mistborn1', 0.505, 0.392, '#78716c', 'keep',
    'City gates of the Final Empire\'s capital — where armies learned the walls were not the real problem.', {
      region: 'Luthadel',
      bio: 'The gates of the Final Empire\'s capital, where four armies converged after the Collapse and where the city learned that a wall is only as good as the koloss on the other side of it. Vin took the koloss instead.', eraMaps: ['ash'], see: ['luthadel'] }),
  loc('skaa-slums-luthadel', 'Luthadel Skaa Slums', 'scadrial', 'mistborn1', 0.502, 0.398, '#57534e', 'village',
    'Ash-choked districts where the empire\'s labour lived. Clubs, crews, and the occasional Mistborn.', {
      region: 'Luthadel',
      bio: 'The districts where the empire\'s labour lived, worked and died on a schedule: ash in the air, mists at night, and a thieving crew in every other cellar. Kelsier recruited his revolution out of here by convincing people with nothing that they were owed something.', eraMaps: ['ash'], see: ['luthadel'], wiki: 'Luthadel' }),
  loc('urteau-canals', 'Urteau Canals', 'scadrial', 'mistborn1', 0.605, 0.235, '#38bdf8', 'canal',
    'Drained waterways of Urteau — a city that burned its own circulation to spite a dead emperor.', {
      region: 'Northern Dominance',
      bio: 'Urteau\'s waterways, drained by its own rebels so that no nobleman would drink from them, leaving a city with dry stone trenches for streets. Spook fought a war in the bottom of them.', arc: 'hoa', eraMaps: ['ash'], see: ['urteau'], wiki: 'Urteau' }),
  loc('fadrex-caves', 'Fadrex Caverns', 'scadrial', 'mistborn1', 0.27, 0.31, '#a8a29e', 'rock',
    'Cave systems under Fadrex. Siege lines above; secrets and storage below.', {
      region: 'Western Dominance',
      bio: 'The cave systems under Fadrex City: siege lines above, storage and secrets below, and the Lord Ruler\'s last cache among them — the one holding the record of what he had actually been holding back.', arc: 'hoa', eraMaps: ['ash'], see: ['fadrex'] }),
  loc('storage-cavern-luthadel', 'Luthadel Storage Cavern', 'scadrial', 'mistborn1', 0.515, 0.385, '#cbd5e1', 'keep',
    'One of the Lord Ruler\'s hidden supply caches beneath the Central Dominance.', {
      region: 'Central Dominance',
      bio: 'One of the Lord Ruler\'s hidden caches under the Central Dominance, stocked against a disaster he expected and did not name. Each one held food, water and a plate of inscribed metal, and the plates were the point.', arc: 'hoa', eraMaps: ['ash'], see: ['luthadel', 'conventical-of-seran'], wiki: 'Storage_cavern' }),
  loc('eltania-pits', 'Pits of Eltania', 'scadrial', 'mistborn2', 0.8, 0.42, '#a8a29e', 'crystal',
    'Roughs diggings made famous by Allomancer Jak\'s entirely reliable broadsheets.', {
      region: 'The Roughs',
      bio: 'Roughs diggings made famous by Allomancer Jak\'s broadsheets, which are entirely reliable if you read Handerwym\'s footnotes and nothing else on the page.', arc: 'jak', eraMaps: ['basin'], see: ['the-roughs'], wiki: 'Allomancer_Jak' }),
  loc('bilming-shipyards', 'Bilming Shipyards', 'scadrial', 'mistborn2', 0.195, 0.67, '#64748b', 'ship',
    'Industrial docks of Bilming — warships, civic pride, and Set fingerprints in the weld marks.', {
      region: 'Elendel Basin',
      bio: 'Bilming\'s industrial docks: warships the Basin has no declared use for, civic pride out of all proportion, and Set fingerprints in the weld marks. By The Lost Metal the yards are building for a war Elendel does not know is coming.', arc: 'tlm', eraMaps: ['basin'], see: ['bilming'] }),
  loc('elendel-field', 'Elendel Field', 'scadrial', 'mistborn2', 0.4, 0.63, '#86efac', 'grass',
    'Open ground at the city\'s edge where Basin politics sometimes remembered it had armies.', {
      region: 'Elendel Basin',
      bio: 'Open ground at the city\'s edge where the Basin occasionally remembers it is supposed to have an army, and where its constabulary drill because the constitution says somebody ought to.', eraMaps: ['basin'], see: ['elendel'] }),
  loc('outer-estates', 'Outer Estates', 'scadrial', 'mistborn2', 0.48, 0.58, '#e8b86d', 'land',
    'Manor country ringing Elendel. House names on gates; Roughs dust on the far fences.', {
      region: 'Elendel Basin',
      bio: 'The manor country ringing Elendel: house names on the gates, lawns on the near side and Roughs dust on the far fences. Where Basin money goes when it stops wanting to be near Basin politics.', eraMaps: ['basin'], see: ['elendel-basin', 'ladrian-mansion'] }),
];

