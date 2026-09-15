import type { Location, Perpendicularity } from './types.ts';

const C = 'canon' as const;
const W = 'wob' as const;

/** First era a place exists, inferred from the book when not set by hand. */
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
  const eraMax = extra.eraMax ?? (ashOnly ? 2 : undefined);
  return { id, name, body, book, u, v, color, icon, desc, canon: C, sources: [book], eraMin, eraMax, ...extra };
}

export const LOCATIONS: Location[] = [
  // Roshar — UVs calibrated to Isaac Stewart's roshar_full.jpg (3096×1800).
  loc('urithiru', 'Urithiru', 'roshar', 'stormlight', 0.466, 0.638, '#bae6fd', 'tower',
    'The tower-city in the mountains, seat of the Knights Radiant and the Sibling.',
    {
      region: 'Urithiru', arc: 'wor', aliases: 'the tower, Urithiru',
      bio: 'At the centre of the Oathgate network, and older than the Radiants who claimed it. The Sibling lives in it. Without Towerlight it is a cold shell — which is what Navani inherits, and what Raboniel comes to take.' }),
  loc('shattered-plains', 'Shattered Plains', 'roshar', 'stormlight', 0.831, 0.740, '#f87171', 'storm',
    'A wasteland of broken plateaus. Warcamps west, Narak at the centre. Under the stone lie fragments of a fourth moon that died and fell before Honor arrived — a metal greater than aluminum, that hides even from a Shard.',
    {
      region: 'Shattered Plains', aliases: 'the Shattered Plains, the Plains',
      bio: 'A plateau maze broken by an ancient catastrophe, fought over for six years by ten Alethi princedoms and the listeners who lived there first. The Everstorm is born at Narak, at its centre.' }),
  loc('kholinar', 'Kholinar', 'roshar', 'stormlight', 0.793, 0.487, '#fbbf24', 'crown',
    'Capital of Alethkar. Palaces, windblades, and an Oathgate.',
    { region: 'Alethkar', bio: 'Alethkar\'s capital, built among stone windblades that split the storms before they reach the palaces. Gavilar ruled here and was murdered here; Elhokar inherited it and lost it. The Oathgate outside the walls is why the Fused wanted it, and why Shallan, Kaladin and Adolin went in through a city already eaten from the inside by the Unmade Ashertmarn.' }),
  loc('kharbranth', 'Kharbranth', 'roshar', 'stormlight', 0.585, 0.765, '#a78bfa', 'bell',
    'The City of Bells, clinging to a lagoon on the coast of Tarat.',
    { region: 'Kharbranth', bio: 'A city-state of one city, curled around a lagoon and ruled by a king who collected scholars the way other monarchs collect armies. Taravangian\'s hospitals took in the dying and wrote down what they said; the Diagram was drafted here on the one day he woke brilliant. Jasnah brought Shallan here to study, which is how a ward first saw the Palanaeum.' }),
  loc('thaylen-city', 'Thaylen City', 'roshar', 'stormlight', 0.610, 0.862, '#4ade80', 'ship',
    'Great port of Thaylenah. Site of the Battle of Thaylen Field.', {
      region: 'Thaylenah',
      bio: 'Thaylenah\'s great port, cut into a drop of coast so the storms break on the seawall rather than the docks. Its merchants are the Cosmere\'s most stubborn, and its eyebrows are a matter of public record. On Thaylen Field outside it Dalinar refused Odium in front of an army, opened Honor\'s perpendicularity, and turned a rout into the day the Everstorm did not win.', arc: 'wor' }),
  loc('azimir', 'Azimir', 'roshar', 'stormlight', 0.373, 0.668, '#fcd34d', 'scroll',
    'Capital of Azir, and an Oathgate city.', {
      region: 'Azir',
      bio: 'Capital of Azir and the seat of the Prime Aqasix, who is chosen by essay and never by blood. Its bureaucracy is slow, literate and astonishingly hard to conquer: Azir survived the Desolations, the Hierocracy and Odium\'s diplomacy by filing everything. Lift walked in through a kitchen and left with the Prime\'s confidence.', arc: 'wor' }),
  loc('shinovar', 'Shinovar', 'roshar', 'stormlight', 0.218, 0.440, '#86efac', 'grass',
    'A land shielded from Highstorms, where soil and grass still grow as they do off-world.',
    { region: 'Shinovar', bio: 'The one place on Roshar with soil instead of crem, grass that does not retreat, and animals from off-world — pigs, horses, chickens. The Misted Mountains break the highstorms before they arrive, so Shinovar grows what the rest of the planet cannot. Its people were the last humans to come from Ashyn, and the Shin keep stone holy and warriors low.' }),
  loc('akinah', 'Akinah', 'roshar', 'stormlight', 0.093, 0.567, '#a1a1aa', 'gem',
    'Ruined Aimian capital, guardian of a Dawnshard.', {
      region: 'Aimia',
      bio: 'The Aimian capital, ruined and guarded. What is left of it sits under a shield no ship survives approaching, and Rysn reached it only because the Sleepless wanted her to. A Dawnshard waited inside — one of four primal Commands, older than the Shards — and it left her body changed and her crew fewer.', arc: 'dawnshard' }),
  loc('horneater-peaks', 'Horneater Peaks', 'roshar', 'stormlight', 0.669, 0.533, '#fdba74', 'peak',
    'Volcanic mountains hiding Cultivation\'s Perpendicularity.', {
      region: 'Horneater Peaks',
      bio: 'Three volcanic peaks on Jah Keved\'s northern border, home to the Unkalaki and to thermal lakes that are Cultivation\'s perpendicularity. Rock brought Kaladin\'s squad here to be healed, and the water took them into Shadesmar and back. The Horneaters call the peaks family, which is more literal than outsiders assume.', arc: 'wor' }),
  loc('purelake', 'Purelake', 'roshar', 'stormlight', 0.435, 0.489, '#67e8f9', 'lake',
    'A vast, shallow inland sea, waist-deep for miles.',
    { region: 'The Purelake', bio: 'Hundreds of miles of water nowhere deeper than a man\'s thigh, warm, clear, and full of fish with quiet uses. The people who live in it fish standing up and consider the whole lake one town. Ishikk was hired here to find a man who did not want finding; the men who hired him were Ghostbloods, and they were not the only ones asking.' }),
  loc('celebrant', 'Celebrant', 'roshar', 'stormlight', 0.749, 0.642, '#f472b6', 'ship',
    'Premier trading hub of Shadesmar.', {
      region: 'Sea of Lost Lights',
      bio: 'The trading port of Rosharan Shadesmar, on the shore of the Sea of Lost Lights, where spren, honorspren ships and the occasional stranded human do business in a currency of gemstones with light still in them. Shallan\'s party arrived here by accident and had to buy passage out; nothing in Celebrant is free and very little of it is kind.', arc: 'oathbringer', realm: 'cognitive' }),
  loc('lasting-integrity', 'Lasting Integrity', 'roshar', 'stormlight', 0.369, 0.804, '#fbbf24', 'keep',
    'Honorspren fortress-city in Shadesmar.', {
      region: 'Shadesmar',
      bio: 'The honorspren stronghold: a fortress-city built of law, standing in the middle of a Cognitive plain, run by spren who decided after the Recreance that humans were not to be trusted with bonds again. Adolin walked in and demanded a trial for the whole human race, which is not a thing the honorspren had a procedure for.', arc: 'row', realm: 'cognitive' }),
  loc('narak', 'Narak', 'roshar', 'stormlight', 0.833, 0.740, '#9ca3af', 'drum',
    'Listener city at the heart of the Shattered Plains. The Everstorm was born here.', {
      region: 'Shattered Plains',
      bio: 'The listener city at the centre of the Plains, built on the ruins of Stormseat. It was the Alethi objective for six years and the listeners\' last ground; Eshonai\'s people adopted stormform here to keep it, and the Everstorm was born out of that choice. Afterwards it became Dalinar\'s staging point and then a Radiant outpost.', arc: 'wor' }),
  loc('vedenar', 'Vedenar', 'roshar', 'stormlight', 0.626, 0.674, '#fca5a5', 'keep',
    'Capital of Jah Keved, an Oathgate city.', {
      region: 'Jah Keved',
      bio: 'Capital of Jah Keved and an Oathgate city, taken apart by its own succession war after Gavilar\'s death and Taravangian\'s arithmetic. Adolin and Shallan came through it on the way to Thaylenah; the Veden Radiants who rose here did so in a country that had already spent its nobility on itself.', arc: 'wor' }),
  loc('hearthstone', 'Hearthstone', 'roshar', 'stormlight', 0.780, 0.394, '#38bdf8', 'home',
    'A small town in northern Alethkar. Kaladin\'s home.',
    { region: 'Alethkar', bio: 'A darkeyed town in northern Alethkar, a surgeon\'s house, and a lighteyes who bought a boy\'s brother into the army. Kaladin comes from here and comes back to it, first as a slave and then as a Windrunner over his own father\'s roof. Lirin still does not approve of the sword.' }),
  loc('yeddaw', 'Yeddaw', 'roshar', 'stormlight', 0.355, 0.682, '#a3e635', 'city',
    'Tashikki city built into winding crevices. Lift hunted Darkness here.', {
      region: 'Tashikk',
      bio: 'A Tashikki city cut down into the rock in long crevices, so the storms pass over the roofs instead of through the streets. Lift came for the food and stayed for the Skybreaker hunting her; Darkness nearly ended her here, and Wyndle nearly talked her out of it.', arc: 'edgedancer' }),
  loc('the-origin', 'The Origin', 'roshar', 'stormlight', 0.979, 0.528, '#1e3a8a', 'storm',
    'The easternmost point of Roshar, where Highstorms are born.',
    { region: 'The Ocean of Origins', bio: 'The far east of Roshar, out past the Frostlands, where the highstorms are born and no ship that goes looking comes back to say what is there. Vorin theology puts the Tranquiline Halls in that direction. What is actually there is the storm, and the Stormfather, and a great deal of water.' }),
  loc('rathalas', 'Rathalas', 'roshar', 'stormlight', 0.777, 0.608, '#ef4444', 'fire',
    'The Rift. A city in a canyon, burned in Dalinar\'s past.', {
      region: 'Alethkar',
      bio: 'The Rift: a city grown down inside a canyon, rich, stubborn and disinclined to bend the knee. Dalinar burned it twice — the second time with Evi inside, gone in to plead for children who were not going to be spared. It is the memory the Nightwatcher took and Cultivation gave back.', arc: 'oathbringer' }),
  loc('sesemalex-dar', 'Sesemalex Dar', 'roshar', 'stormlight', 0.357, 0.735, '#d97706', 'city',
    'Capital of Emul, carved to drink the storms.', {
      region: 'Emul',
      bio: 'Emul\'s capital, and one of the most-fought-over plots of stone on the continent: the city is carved so the highstorms wash it rather than wreck it, and the design is old enough that nobody remembers who cut it. Tukar and Emul have traded it in pieces for a generation.', arc: 'row' }),
  loc('rall-elorim', 'Rall Elorim', 'roshar', 'stormlight', 0.313, 0.187, '#6366f1', 'city',
    'The City of Shadows in Iri, and an Oathgate.', {
      region: 'Iri',
      bio: 'The City of Shadows in Iri, built so its lanterns throw shadows deliberately and its Oathgate sits among them. Iriali tradition treats it as a stop on the Long Trail rather than a home; the golden-haired do not stay anywhere for its own sake.', arc: 'edgedancer' }),
  loc('kurth', 'Kurth', 'roshar', 'stormlight', 0.419, 0.279, '#fbcfe8', 'city',
    'Ancient capital of Rishir, an Oathgate city.', {
      region: 'Rishir',
      bio: 'Ancient capital of the Silver Kingdom of Rishir, on the northern coast, and an Oathgate city ever since. Modern maps file it under Iri, which the Iriali encourage and the Rishiri never quite accepted.', arc: 'wor' }),
  loc('panatham', 'Panatham', 'roshar', 'stormlight', 0.351, 0.476, '#c4b5fd', 'city',
    'Ancient capital of Sela Tales, an Oathgate city.', {
      region: 'Sela Tales',
      bio: 'Capital of the Silver Kingdom of Sela Tales and an Oathgate city. The kingdom is gone; the platform is not, and the Radiants who rebuilt the network had to argue their way into a city that had forgotten what it was standing on.', arc: 'wor' }),

  // Scadrial — Final Empire
  loc('luthadel', 'Luthadel', 'scadrial', 'mistborn1', 0.508, 0.386, '#d6a44c', 'city',
    'Capital of the Final Empire and seat of the Lord Ruler. Kredik Shaw at its heart.', {
      region: 'Central Dominance',
      bio: 'The Lord Ruler\'s capital: a thousand spires of Kredik Shaw at the centre, eleven Great House keeps around it, and the skaa slums breathing ash underneath. Kelsier\'s crew took it down from inside in a year, and what they got was a city with no government, no food, and four armies on the way. Elend spent Era 1 trying to govern it and Vin spent Era 1 keeping it alive.', eraMaps: ['ash'] }),
  loc('pits-of-hathsin', 'The Pits of Hathsin', 'scadrial', 'mistborn1', 0.371, 0.363, '#a8a29e', 'crystal',
    'The Lord Ruler\'s secret atium farm.', {
      region: 'Central Dominance',
      bio: 'Crystal caverns where atium grew, worked by skaa who did not last a year and guarded well enough that the empire\'s whole economy rested on the secret. Kelsier was sent here to die, Snapped here instead, and came out a Mistborn with a grudge and a plan. Vin destroyed the pits in the end, which is why atium is a rumour by Era 2.', eraMaps: ['ash'] }),
  loc('fadrex', 'Fadrex City', 'scadrial', 'mistborn1', 0.273, 0.302, '#f59e0b', 'keep',
    'Western Dominance stronghold of Lord Cett.', {
      region: 'Western Dominance',
      bio: 'A city built into a bowl of rock spires in the Western Dominance, easy to defend and impossible to starve out quickly. Cett held it when Luthadel fell, and Elend besieged it because the Lord Ruler\'s last storage cache was underneath — the one that turned out to hold not food but the truth about the Deepness.', arc: 'hoa', eraMaps: ['ash'] }),
  loc('urteau', 'Urteau', 'scadrial', 'mistborn1', 0.601, 0.231, '#60a5fa', 'canal',
    'Northern Dominance capital; a city of drained canals.', {
      region: 'Northern Dominance',
      bio: 'Capital of the Northern Dominance, built on canals that its own rebels drained rather than let a nobleman\'s water flow. Spook came here after the Collapse and found a city run by a demagogue, a nest of Ministry holdouts, and a hidden storage cavern under a burning street.', arc: 'hoa', eraMaps: ['ash'] }),
  loc('elendel', 'Elendel', 'scadrial', 'mistborn2', 0.384, 0.617, '#d6a44c', 'city',
    'Harmony\'s great city in the Basin, built where the old empire died.', {
      region: 'Elendel Basin',
      bio: 'Harmony\'s city, laid out by Sazed himself on ground where the old world ended, with eight octants and a canal ring and a constitution nobody has read recently. Four hundred years on it is rich, complacent, and quietly run by the houses; Wax came back to it for a funeral and stayed for the trouble.', eraMaps: ['basin'] }),
  loc('bilming', 'Bilming', 'scadrial', 'mistborn2', 0.201, 0.667, '#64748b', 'port',
    'Industrial port of the western Basin.', {
      region: 'Elendel Basin',
      bio: 'The Basin\'s industrial port on the western coast, all shipyards and smokestacks and civic resentment of Elendel. By The Lost Metal it is the Set\'s own city in everything but name, with a bomb in it and Autonomy\'s avatar in the harbour.', arc: 'tlm', eraMaps: ['basin'] }),
  loc('new-seran', 'New Seran', 'scadrial', 'mistborn2', 0.811, 0.904, '#e8b86d', 'city',
    'Southern city of canals and conspiracy.', {
      region: 'Elendel Basin',
      bio: 'A southern Basin city of stepped canals and old money, far enough from Elendel to keep its own secrets and close enough to sell them. Wax and Steris came for a wedding and found a Set operation running out of the hills above it.', arc: 'bom', eraMaps: ['basin'] }),
  loc('doxonar', 'Doxonar', 'scadrial', 'mistborn2', 0.346, 0.679, '#94a3b8', 'home',
    'A Basin town on the southern rail lines beyond Elendel.', {
      region: 'Elendel Basin',
      bio: 'A Basin town on the southern rail lines, named for a man who died holding a gate in a city that no longer exists. Most Basin towns are named for somebody from the Final Empire; most of them have forgotten which somebody.', arc: 'bom', eraMaps: ['basin'] }),
  loc('dryport', 'Dryport', 'scadrial', 'mistborn2', 0.421, 0.588, '#38bdf8', 'port',
    'On the route between Elendel and the northern Roughs.', {
      region: 'Elendel Basin',
      bio: 'A stop on the route between Elendel and the northern Roughs, where the rails end and the dust begins. Everyone passing between Basin law and no law at all goes through somewhere like it.', eraMaps: ['basin'] }),

  // Other worlds — first-pass original pins
  loc('elantris-city', 'Elantris', 'sel', 'elantris', 0.46, 0.42, '#a78bfa', 'city',
    'The once-shining city of the gods, fallen and then restored.',
    { region: 'Arelon', bio: 'For centuries a city of light, where anyone the Shaod took became something close to a god and AonDor ran the province. Then the Reod: the Aons stopped working, the city went grey and rotting, and the Elantrians inside became immortals who could not heal and could not die. Raoden worked out that a new chasm had to be written into every Aon, and the city came back on in a night.' }),
  loc('kae', 'Kae', 'sel', 'elantris', 0.515, 0.395, '#c4b5fd', 'city',
    'Arelish capital in the shadow of Elantris.',
    { region: 'Arelon', bio: 'The Arelish capital, built in Elantris\'s shadow when the real city failed — a court of new nobility pretending the grey walls next door are an eyesore rather than an indictment. Sarene arrived here to marry a prince who was officially dead, and started fixing the country out of sheer irritation.' }),
  loc('teod', 'Teod', 'sel', 'elantris', 0.22, 0.28, '#818cf8', 'port',
    'Northern maritime kingdom, Sarene\'s home.',
    { region: 'Teod', bio: 'A maritime kingdom on a northern peninsula, small, rich, and the last place on Sel that Shu-Dereth has not converted. Teod\'s fleet is its argument and Sarene is its ambassador; the Fjordell fleet came for it anyway and did not get it.' }),
  loc('fjorden', 'Fjorden', 'sel', 'elantris', 0.68, 0.38, '#ef4444', 'keep',
    'Seat of Shu-Dereth and the gyorns.',
    { region: 'Fjorden', bio: 'The seat of Shu-Dereth and the engine that has been converting Sel one country at a time for generations. Wyrn rules it, the gyorns argue it, and the Dakhor monks are what happens when the arguing stops. Its conquests are theological first and military only when necessary.' }),
  loc('ttelir', "T'Telir", 'nalthis', 'warbreaker', 0.55, 0.62, '#f472b6', 'city',
    'Hallandren\'s colourful capital, city of the Returned.',
    { region: 'Hallandren', bio: 'Hallandren\'s capital, and the loudest city in the Cosmere: colour is wealth here, and wealth is Breath, and Breath is what keeps the Returned alive one week at a time. The Court of Gods sits above it and the docks pay for all of it.' }),
  loc('idris', 'Idris', 'nalthis', 'warbreaker', 0.48, 0.28, '#e2e8f0', 'peak',
    'Highland kingdom of austere Austrism.',
    { region: 'Idris', bio: 'The highland kingdom in the mountains above Hallandren, austere by conviction: grey clothes, no Awakening, and a royal line that considers itself the rightful one. Vivenna was raised to marry the God King and Siri was sent instead, which is the joke Idris did not intend to make.' }),
  loc('kezare', 'Kezare', 'taldain', 'whitesand', 0.42, 0.48, '#fbbf24', 'city',
    'Dayside capital on the lossand, home of the Diem.',
    { region: 'Lossand', bio: 'The Dayside capital, on the lossand, where the Taishin govern by trade and the Diem stands over it all — until the massacre. Kenton spends White Sand trying to keep a guild alive in a city that has decided it can afford not to.' }),
  loc('patji', 'Patji', 'first-of-the-sun', 'sixthofdusk', 0.52, 0.50, '#4ade80', 'island',
    'The Father island of the Pantheon. Patji\'s Eye is a perpendicularity.', {
      region: 'The Pantheon',
      bio: 'The Father island: the largest and most lethal of the Pantheon, where every plant, animal and rock is trying something. Patji\'s Eye is a perpendicularity at its heart, and Patji itself is — by Word of Brandon and by the way the island behaves — rather more than an island.', eraMin: 1 }),
  loc('forests-of-hell', 'Forests of Hell', 'threnody', 'shadowsforsilence', 0.50, 0.52, '#78716c', 'forest',
    'Where the Simple Rules are the only law that matters.',
    { region: 'The Forests', bio: 'Woodland where breaking one of three Simple Rules — kindle no flame, shed no blood, run at night from nothing — calls a shade out of the dark to take you. The rules are not superstition and they are not negotiable, and Threnody\'s settlers have organised an entire economy of silver, salt and caution around them.' }),
  loc('diggens-point', "Diggen's Point", 'lumar-world', 'tress', 0.18, 0.48, '#6ee7b7', 'rock',
    'The rock Tress left. The Emerald Sea begins here.',
    { region: 'Emerald Sea', bio: 'The rock Tress grew up on and was not supposed to leave: a small island society with a duke, a window-washer\'s daughter and a rule that people stay where they were born. She left anyway, on the least seaworthy reasoning in the Cosmere.' }),
  loc('emerald-sea', 'Emerald Sea', 'lumar-world', 'tress', 0.40, 0.50, '#34d399', 'sea',
    'Verdant aether spores. Do not get them wet.',
    { region: 'Emerald Sea', bio: 'The verdant sea: twelve feet of green spore-dust you can walk a ship across, under a geostationary moon that rains more of it. Get verdant spores wet and vines grow through whatever is nearest, which on a ship is usually a person.' }),
  loc('beacon', 'Beacon', 'canticle-world', 'sunlit', 0.30, 0.50, '#f59e0b', 'city',
    'A hover-city racing the dawn.',
    { region: 'The Corridor', bio: 'A hover-city running west, always west, ahead of a sunrise that would burn it to slag. Beacon is the refugee city: fewer engines than Union, fewer sunhearts, and a governing council that argues about ethics while the light comes up behind them.' }),
  loc('kilahito', 'Kilahito', 'komashi', 'yumi', 0.62, 0.48, '#22d3ee', 'city',
    'City of painters, nightmares, and hion lines.',
    { region: 'Komashi', bio: 'A city of hion lines, nightmare painters and a permanent night the machine made. Painters work shifts against things that come out of the dark and are banished with ink; everyone else gets on with a life lit in magenta and cyan.' }),
  loc('torio', 'Torio', 'komashi', 'yumi', 0.38, 0.52, '#e879f9', 'village',
    'The machine-kept village of the yoki-hijo.',
    { region: 'Komashi', bio: 'The village the machine keeps for its yoki-hijo: a full household of servants, a ritual schedule, and a girl who is told she is chosen and is in fact a battery. Yumi grew up here believing every day of it.' }),
  loc('tathingdwen', 'Tathingdwen', 'scadrial', 'mistborn1', 0.488, 0.096, '#a3e635', 'city',
    'Terris homeland in the far north of the Final Empire.', {
      region: 'Terris Dominance',
      bio: 'The Terris capital in the far north, and the administrative centre of a people the Lord Ruler had spent a thousand years breeding into stewards. The Synod met here in secret; so did the Keepers, with a thousand years of copperminds between them and the fire.', eraMaps: ['ash'] }),
  loc('the-roughs', 'The Roughs', 'scadrial', 'mistborn2', 0.72, 0.38, '#a8a29e', 'land',
    'Lawless frontier beyond the Elendel Basin. Wax\'s old hunting ground.', {
      region: 'The Roughs',
      bio: 'The frontier outside the Basin: mining camps, cattle, rail spurs and no law that arrives faster than a week. Wax spent twenty years out here as a lawman because it was honest work and because Elendel had a house and a title waiting that he did not want.', eraMaps: ['basin'] }),
  loc('hallandren', 'Hallandren', 'nalthis', 'warbreaker', 0.50, 0.545, '#f472b6', 'land',
    'The colour-drenched kingdom of the Returned and the God King.',
    { region: 'Hallandren', bio: 'The kingdom of the Returned, the God King and the BioChromatic economy, sitting on the coast that Idris thinks it stole. Its priests are bureaucrats, its gods are a week from dying at all times, and its army is a standing threat nobody in it actually wants to use.' }),
  loc('pahn-kahl', 'Pahn Kahl', 'nalthis', 'warbreaker', 0.66, 0.72, '#67e8f9', 'land',
    'A people of Hallandren\'s lowlands, long under the Court of Gods.',
    { region: 'Pahn Kahl', bio: 'A people inside Hallandren who are not Hallandren, have their own religion nobody bothers to learn, and have spent generations being administrative furniture. Bluefingers ran a war plot out of that invisibility, which is the point the book is making.' }),
  loc('crimson-sea', 'Crimson Sea', 'lumar-world', 'tress', 0.62, 0.42, '#f43f5e', 'sea',
    'Roseite aether. Beautiful, and lethal when wet.',
    { region: 'Crimson Sea', bio: 'Roseite spores, which grow crystal when wet — reefs, cages, and a slow pink death for anyone who bleeds on the deck. The Crimson is beautiful from a distance and a graveyard from close up.' }),
  loc('midnight-sea', 'Midnight Sea', 'lumar-world', 'tress', 0.78, 0.55, '#312e81', 'sea',
    'Midnight Essence. The Sorceress\'s domain.',
    { region: 'Midnight Sea', bio: 'Midnight Essence: spores that grow into shapeless black creatures that mimic and obey. It is the Sorceress\'s sea because she is the only one who wants it, and she wants it because of what she can make out of it.' }),
  loc('arelon', 'Arelon', 'sel', 'elantris', 0.40, 0.50, '#a78bfa', 'land',
    'The kingdom whose capital is Elantris, reshaped by the Shaod.',
    { region: 'Arelon', bio: 'The kingdom Elantris used to run and now merely haunts. After the Reod its nobility invented itself out of merchants in a decade, and its politics are a study in how quickly people rebuild a hierarchy when the gods stop answering.' }),
  loc('dayside', 'Dayside', 'taldain', 'whitesand', 0.32, 0.50, '#fde68a', 'land',
    'The sun-locked half of Taldain. White sand, Lossand, the Diem.',
    { region: 'Dayside', bio: 'The sun-locked half of Taldain, under a white dwarf that never sets: white sand that turns black as it gives up its water, sand masters who pay in their own body to move it, and a civilisation built on the difference.' }),
  loc('darkside', 'Darkside', 'taldain', 'whitesand', 0.72, 0.50, '#1e1b4b', 'land',
    'The night-locked half. Cities of electric light under a dark sky.',
    { region: 'Darkside', bio: 'The half that never sees the sun, lit by a blue-white supergiant too distant to warm it and by a great deal of electric light. Darksiders have technology Dayside calls blasphemy and a matter-of-fact attitude to a sky that never changes. Khriss is from here.' }),
  loc('union', 'Union', 'canticle-world', 'sunlit', 0.55, 0.48, '#fb923c', 'city',
    'The Cinder King\'s moving city, harvesting sunhearts ahead of the dawn.',
    { region: 'The Corridor', bio: 'The Cinder King\'s city, larger and faster than Beacon and fed by prospector camps that harvest sunhearts out of ground the dawn is about to take. Union works because someone else is being spent, which is the Cinder King\'s entire economic model.' }),
  loc('lastport', 'Lastport', 'threnody', 'shadowsforsilence', 0.42, 0.58, '#a8a29e', 'port',
    'A Homeland town on the edge of the Forests.',
    { region: 'The Homeland', bio: 'A Homeland town on the Forests\' edge, where the trade from inside the trees comes out and the people who go in are outfitted. Everyone here knows the Rules; not everyone here has kept them.' }),

  // Second pass: regions a reread actually reaches for. Names are canon, the
  // UVs are ours — placement is relative, not an Isaac Stewart tracing.
  loc('iri', 'Iri', 'roshar', 'stormlight', 0.313, 0.187, '#fde68a', 'land',
    'Northwestern kingdom of gold and long memory, on Shinovar\'s border.',
    { region: 'Iri', bio: 'A northwestern kingdom of gold-haired people who hold that living is a sequence of things to be experienced and then left. Iri sells to everyone, allies with nobody for long, and went over to Odium in the True Desolation without much visible anguish. Shinovar is its neighbour and its opposite.' }),
  loc('herdaz', 'Herdaz', 'roshar', 'stormlight', 0.736, 0.329, '#fca5a5', 'land',
    'Small kingdom north of Alethkar, fought over for a generation.',
    { region: 'Herdaz', bio: 'A small kingdom wedged between Alethkar and the sea, invaded so often that its resistance is a profession. Kaladin fought here as a boy soldier and came back for it as a Windrunner; the Mink ran the war that would not end, on ground nobody else wanted.' }),
  loc('marat', 'Marat', 'roshar', 'stormlight', 0.73, 0.56, '#f59e0b', 'land',
    'A country of trade roads between Alethkar and the Unclaimed Hills.',
    { region: 'Marat', bio: 'Trade roads, caravans and a coastline, between Alethkar and the Unclaimed Hills. Marat had no army worth the name and an Oathgate worth a great deal, which is why the Fused took it early and quietly while the Vorin kingdoms were looking elsewhere.' }),
  loc('tukar', 'Tukar', 'roshar', 'stormlight', 0.42, 0.68, '#a78bfa', 'land',
    'At war with Emul under a god-priest who is not what he claims.',
    { region: 'Tukar', bio: 'At war with Emul for a generation under a god-priest its own people believe in. He is Ishar, Herald of Luck, oldest and maddest of the ten, and the war is what a broken Bondsmith does with a country when nobody stops him.' }),
  loc('reshi-isles', 'Reshi Isles', 'roshar', 'stormlight', 0.497, 0.198, '#4ade80', 'island',
    'Island chain riding the backs of the greatshells, north of the Shattered Plains.',
    { region: 'Reshi Isles', bio: 'Islands that swim. Each is a greatshell large enough to carry towns on its shell, and the Reshi treat them as monarchs with moods rather than as land. Rysn traded here and came away with Chiri-Chiri; the Alethi map them optimistically and the isles move anyway.' }),
  loc('new-natanan', 'New Natanan', 'roshar', 'stormlight', 0.88, 0.60, '#67e8f9', 'port',
    'Southeastern port on the edge of the Frostlands.',
    { region: 'The Frostlands', bio: 'The southeastern port on the edge of the Frostlands, and the last civilised stop before the cold and the empty. What is left of Natanatan\'s people trade out of it, which is a thin inheritance from a Silver Kingdom.' }),
  loc('revolar', 'Revolar', 'roshar', 'stormlight', 0.755, 0.47, '#d97706', 'city',
    'Alethi crossroads city, taken early in the True Desolation.', {
      region: 'Alethkar',
      bio: 'An Alethi crossroads city and the country\'s larder: every road inland runs through it. The Voidbringers took it early in the True Desolation and used it to hold the whole kingdom\'s food, which is how a war is won without a battle.', arc: 'oathbringer' }),
  loc('babatharnam', 'Babatharnam', 'roshar', 'stormlight', 0.30, 0.56, '#86efac', 'land',
    'Western land of the Most Ancient and its living, moving vines.',
    { region: 'Babatharnam', bio: 'A western land ruled by the Most Ancient, whose age is the point, and grown over with a living vinework that rearranges the streets. Babath is where Rysn learned that trade is mostly patience and that a country can be both welcoming and entirely unreadable.' }),

  loc('conventical-of-seran', 'Conventical of Seran', 'scadrial', 'mistborn1', 0.493, 0.514, '#9333ea', 'keep',
    'A Steel Ministry fortress of the Inquisitors, and a cache of the Lord Ruler.', {
      region: 'Eastern Dominance',
      bio: 'A Steel Ministry fortress in the eastern mountains where the Inquisitors were made and the Lord Ruler kept a cache. Kelsier\'s crew broke into it for the logbook and left with a plate of inscribed metal, a dead Inquisitor, and the beginning of the knowledge that something else was writing the Lord Ruler\'s story.', arc: 'hoa', eraMaps: ['ash'] }),
  loc('vetitan', 'Vetitan', 'scadrial', 'mistborn1', 0.439, 0.633, '#a8a29e', 'city',
    'A southern skaa town, emptied and led out in the last days of the ash.',
    {
      region: 'Southern Dominance',
      bio: 'A southern skaa town Vin and Elend emptied in the last year of the ash, walking its people north ahead of the mists and the falling sky. It is the small human end of a world ending: a town that packed up and left.', arc: 'hoa', eraMaps: ['ash'] }),
  loc('weathering', 'Weathering', 'scadrial', 'mistborn2', 0.78, 0.30, '#e8b86d', 'home',
    'A Roughs township. Wax kept the peace here before the city called him back.',
    {
      region: 'The Roughs',
      bio: 'A Roughs township where Waxillium Ladrian kept the peace, buried Lessie, and decided he was finished. Elendel called him home three weeks later.', arc: 'aol', eraMaps: ['basin'] }),
  loc('southern-continent', 'Southern Continent', 'scadrial', 'mistborn2', 0.52, 0.80, '#94a3b8', 'land',
    'The Malwish south: its own civilisation, and its own technology.',
    {
      region: 'Southern Scadrial',
      bio: 'The other half of Scadrial, which the Basin spent four hundred years not knowing about. The Malwish survived the cold there with medallions and ettmetal, built airships and an empire of their own, and arrived north with technology the Basin had no answer to and grievances the Basin had never earned.', arc: 'bom', eraMaps: ['basin'] }),

  loc('duladel', 'Duladel', 'sel', 'elantris', 0.54, 0.52, '#f472b6', 'land',
    'The Duladen Republic, fallen to revolution before the story opens.',
    { region: 'Duladel', bio: 'The Duladen Republic, gone before the story begins: a mixed-blood society with an elected government that collapsed into a massacre, and a collapse Fjorden had been patiently arranging. Galladon is from here, which is most of why he is not.' }),
  loc('jindo', 'JinDo', 'sel', 'elantris', 0.60, 0.62, '#fbbf24', 'land',
    'Eastern land of the Jindoeese and the ChayShan.',
    { region: 'JinDo', bio: 'The eastern land of the Jindoeese, home of Shu-Keseg\'s older and gentler reading and of ChayShan — a martial art that draws the Dor through movement rather than drawn Aons. Shuden is Jindoeese, and spends most of Elantris being the only person in the room not shouting.' }),
  loc('dakhor-monastery', 'Dakhor Monastery', 'sel', 'elantris', 0.74, 0.44, '#ef4444', 'keep',
    'Fjordell monastery whose monks wear their Investiture in their bones.',
    { region: 'Fjorden', bio: 'The Fjordell monastery where the Dor is written into a monk\'s skeleton over years of prayer and pain, until the bones themselves are the glyph and the man is the weapon. Dilaf came out of it. Most do not come out of it at all.' }),

  loc('court-of-gods-site', 'Court of the Gods', 'nalthis', 'warbreaker', 0.585, 0.675, '#c084fc', 'crown',
    'The Returned live here in T\'Telir, each a palace, each a colour.',
    { region: 'Hallandren', bio: 'The walled district of T\'Telir where each Returned gets a palace, a colour and a weekly Breath from a child. They vote on war and spectacle; Susebron sits above them, mute, and is told he is a god while being kept as an instrument.' }),
  loc('tears-of-edgli', 'Tears of Edgli Fields', 'nalthis', 'warbreaker', 0.60, 0.55, '#f43f5e', 'grass',
    'Flower fields whose dye is Hallandren\'s wealth and its Investiture.',
    {
      region: 'Hallandren', aliases: 'Tears of Edgli flowers',
      bio: 'Dyes unique to Hallandren\'s soil, and the economic root of the court\'s obsession with colour. Endowment\'s Investiture in the land is what makes the hues possible; nowhere else on Nalthis grows them.' }),

  loc('lossand', 'Lossand', 'taldain', 'whitesand', 0.38, 0.52, '#fde68a', 'land',
    'The Dayside nation of the sand and the Taishin, held together by trade.',
    { region: 'Lossand', bio: 'The Dayside nation of the sand, governed by the Taishin — a council of trade interests that holds together because none of them can afford the alternative. The Diem was one of the seats, which is why its destruction was a constitutional crisis as well as a massacre.' }),

  loc('the-homeland', 'The Homeland', 'threnody', 'shadowsforsilence', 0.44, 0.46, '#a8a29e', 'land',
    'Settled Threnody, safely outside the Forests. It does not feel safe.',
    { region: 'The Homeland', bio: 'Settled Threnody, outside the Forests, where the shades are supposed to be someone else\'s problem. It does not feel safe because it is not: the Forests are a boundary the shades observe out of habit rather than law.' }),

  loc('sapphire-sea', 'Sapphire Sea', 'lumar-world', 'tress', 0.28, 0.55, '#38bdf8', 'sea',
    'Zephyr spores. They make air, and they make it violently.',
    { region: 'Sapphire Sea', bio: 'Zephyr spores, which make air — a great deal of it, very quickly, in whatever direction the water reached first. Useful for a ship\'s guns and fatal for a ship\'s hull.' }),
  loc('sunlight-sea', 'Sunlight Sea', 'lumar-world', 'tress', 0.52, 0.62, '#fbbf24', 'sea',
    'Sunlight spores. Fire waiting for water.',
    { region: 'Sunlight Sea', bio: 'Sunlight spores: fire, waiting for water. A rain squall over the Sunlight Sea is an event the whole of Lumar can see.' }),

  loc('sori', 'Sori', 'first-of-the-sun', 'sixthofdusk', 0.58, 0.44, '#a3e635', 'island',
    'One of the Pantheon islands. Safer than Patji. Everything is.',
    { region: 'The Pantheon', bio: 'One of the Pantheon islands. Safer than Patji, which is a comparison rather than a recommendation: everything in the Pantheon is arranged to kill trespassers, and the Eelakin only trespass on purpose.' }),

  // Thin worlds: names a reread actually reaches for. Placement is ours.
  loc('torio-steamwell', 'Torio steamwell', 'komashi', 'yumi', 0.36, 0.54, '#e879f9', 'home',
    'Yumi stacked stones beside the steam, and the spirits came.',
    { region: 'Komashi', bio: 'The steamwell beside Torio where Yumi stacked stones until the spirits came. The ritual is real, the spirits are real, and what the ritual is actually for is the thing nobody in the village has ever been told.' }),
  loc('dreamwatch', 'Dreamwatch', 'komashi', 'yumi', 0.64, 0.46, '#22d3ee', 'keep',
    'Kilahito\'s painter corps. Nightmares stop at their wall, most nights.',
    { region: 'Komashi', bio: 'Kilahito\'s painter corps, who hold the line against nightmares with brush and ink and a hierarchy Painter is not doing well in. Most nights the wall holds. The nights it does not are the reason there is a corps.' }),
  loc('the-shroud', 'The Shroud', 'komashi', 'yumi', 0.50, 0.22, '#111827', 'storm',
    'The darkness the machine made of the sky. Hion cuts it; nothing else does.',
    { region: 'Komashi', bio: 'The dark the machine drew across Komashi\'s sky. Hion lines cut through it and nothing else does; under it a whole civilisation has grown up without ever having seen the sun or believed there was one.' }),

  loc('the-refuge', 'The Refuge', 'canticle-world', 'sunlit', 0.58, 0.62, '#fde68a', 'keep',
    'A cavern of the old world, under the killing sun. The Cinder King\'s prize.',
    { region: 'Canticle', bio: 'A cavern of the old world, from before Canticle\'s people took to the sky, buried under ground the sun now kills. Everyone on the planet wants it, because a place that does not have to run is the only future anyone can imagine.' }),
  loc('the-corridor', 'The Corridor', 'canticle-world', 'sunlit', 0.42, 0.50, '#fb923c', 'land',
    'The sun-scoured path the hover-cities race. Dawn on one side, night on the other.',
    { region: 'The Corridor', bio: 'The strip of survivable ground between the dawn that melts the crust and the night that freezes it. Every city on Canticle lives in it and every city on Canticle is moving, permanently, at the speed of its own sunrise.' }),

  loc('the-crossroads', 'The Crossroads', 'threnody', 'shadowsforsilence', 0.48, 0.56, '#a8a29e', 'home',
    'Silence Montane\'s waystop. Fire, blood, and running are all against the Rules.',
    { region: 'The Forests', bio: 'Silence Montane\'s waystop, deep enough into the Forests that every guest is a risk and every night is a negotiation with the Rules. Silence runs it, keeps silver in the doorframes, and hunts bounties on the side because a waystop does not pay for two children.' }),
  loc('the-fort', 'The Fort', 'threnody', 'shadowsforsilence', 0.40, 0.44, '#78716c', 'keep',
    'A Homeland fort on the Forests\' edge. Safer than the trees. Not safe.',
    { region: 'The Homeland', bio: 'A Homeland fort on the Forests\' edge: walls, silver, and a garrison whose job is less to fight than to be somewhere the shades will not bother coming. Safer than the trees. Not safe.' }),

  loc('homeisles', 'The Homeisles', 'first-of-the-sun', 'sixthofdusk', 0.28, 0.62, '#86efac', 'island',
    'The Eelakin islands, away from the Pantheon. Traps are for Patji; this is home.',
    { region: 'First of the Sun', bio: 'The Eelakin islands, well away from the Pantheon, where people actually live. The Pantheon is worked, not settled; you go there for aviar and you come home, if you come home.' }),

  // --- Third pass: the rest of Roshar a reread reaches for ----------------
  // Regions and cities whose relative geography is the books'; the UVs are
  // ours, read off the Stewart plate by eye.
  loc('alethkar', 'Alethkar', 'roshar', 'stormlight', 0.786, 0.452, '#3b82f6', 'land',
    'Ten princedoms under one Highprince too long, then under none. Dalinar\'s country, and Gavilar\'s.',
    { region: 'Alethkar', bio: 'Ten princedoms that spent four hundred years fighting each other until Gavilar made them one, and then spent six years on the Shattered Plains avenging him. Alethi are the Cosmere\'s most enthusiastic soldiers and least curious readers — writing is women\'s work here — and the Radiants came back out of them anyway.' }),
  loc('jah-keved', 'Jah Keved', 'roshar', 'stormlight', 0.640, 0.640, '#dc2626', 'land',
    'Second of the Vorin kingdoms, bled white by its own succession war.',
    { region: 'Jah Keved', bio: 'The second Vorin kingdom, and the one that bled itself. When its king died the succession went to open war among the highprinces, and Taravangian arranged the shape of it; by the time a Veden sat the throne again there was not much throne left.' }),
  loc('azir', 'Azir', 'roshar', 'stormlight', 0.360, 0.660, '#fcd34d', 'land',
    'An empire that runs on paperwork, and is the better for it. The Prime is chosen by essay.',
    { region: 'Azir', bio: 'An empire that runs on clerks. The Prime is chosen by essay, the provinces answer in writing, and the whole apparatus is slow enough to be nearly impossible to decapitate. Azir refused Odium in prose and made it stick, which is not how anyone expected the continent to be saved.' }),
  loc('thaylenah', 'Thaylenah', 'roshar', 'stormlight', 0.600, 0.858, '#4ade80', 'island',
    'An island of merchants and eyebrows, and the last place Odium expected to lose.', {
      region: 'Thaylenah',
      bio: 'An island nation of merchants and shipwrights, its coast cut so the storms break where they can be watched. The Thaylen Gemstone Reserve funds half the continent\'s wars by loan; its queen is a Radiant; and the last place Odium expected to lose was its capital\'s front field.', arc: 'oathbringer' }),
  loc('aimia', 'Aimia', 'roshar', 'stormlight', 0.088, 0.556, '#94a3b8', 'island',
    'Scoured empty long ago. Its larkins were hunted out and its islands kill anyone who lands.', {
      region: 'Aimia',
      bio: 'Scoured. The larkins were hunted to nothing, the people are gone or hiding as Dysian hordes, and the islands kill what lands on them. Something was being protected here and the Scouring was the price; the Sleepless are still standing over it, one hordeling at a time.', arc: 'dawnshard' }),
  loc('frostlands', 'The Frostlands', 'roshar', 'stormlight', 0.760, 0.720, '#cbd5e1', 'land',
    'Cold, empty and unclaimed, between Jah Keved and the Shattered Plains.',
    { region: 'The Frostlands', bio: 'Cold, empty, unclaimed and enormous, between Jah Keved and the Shattered Plains. Nobody governs it and nobody quite abandons it; the Alethi crossed it to get to the Plains and complained the whole way.' }),
  loc('unclaimed-hills', 'The Unclaimed Hills', 'roshar', 'stormlight', 0.780, 0.640, '#a8a29e', 'land',
    'The Alethi crossed these to reach the Plains, and left nothing behind them worth keeping.',
    { region: 'The Unclaimed Hills', bio: 'The broken upland the Alethi marched over to reach the Shattered Plains, and the buffer that kept the listeners unnoticed for centuries. Nothing grows here that is worth a war, which is why the war went straight through.' }),
  loc('natanatan', 'Natanatan', 'roshar', 'stormlight', 0.812, 0.630, '#67e8f9', 'land',
    'The kingdom the Shattered Plains used to be, before something broke it.',
    { region: 'Natanatan', bio: 'The Silver Kingdom the Shattered Plains used to be, whole, with Stormseat at its heart. Something broke it into plateaus and nobody living knows what; the listeners inherited the ruins and the Alethi inherited the argument.' }),
  loc('tashikk', 'Tashikk', 'roshar', 'stormlight', 0.372, 0.672, '#a3e635', 'scroll',
    'Sells information, buys information, and knows what you asked about last week.', {
      region: 'Tashikk',
      bio: 'A Makabaki state that sells information and buys more. Its scribes run the continent\'s spanreed network, which means Tashikk knows what every kingdom asked about last week and will sell that too, at a price that rises with your urgency.', arc: 'edgedancer' }),
  loc('emul', 'Emul', 'roshar', 'stormlight', 0.350, 0.740, '#d97706', 'land',
    'Ground between Tukar and Azir for a generation, and then between worse things.', {
      region: 'Emul',
      bio: 'Ground between Tukar\'s god-priest and Azir\'s paperwork for a generation, and then between the Fused and the coalition. Emul\'s people have been a battlefield longer than they have been a country, and Sesemalex Dar has changed hands more often than it has been repaired.', arc: 'row' }),
  loc('steen', 'Steen', 'roshar', 'stormlight', 0.280, 0.500, '#86efac', 'land',
    'A small nation on Shinovar\'s border that keeps out of it.',
    { region: 'Steen', bio: 'A small nation on Shinovar\'s border that has made not getting involved into a foreign policy. It works, mostly, which is more than its neighbours can say.' }),
  loc('liafor', 'Liafor', 'roshar', 'stormlight', 0.330, 0.610, '#f9a8d4', 'land',
    'Where Sigzil is from, though he had to be asked twice.',
    { region: 'Liafor', bio: 'A Makabaki country of musicians and traders, and where Sigzil is from — a fact he mentions reluctantly, having left it to follow a man who collects stories and does not explain why.' }),
  loc('marabethia', 'Marabethia', 'roshar', 'stormlight', 0.436, 0.742, '#67e8f9', 'land',
    'Cliffs, bridges and a long memory for insults.',
    { region: 'Marabethia', bio: 'Sea cliffs joined by bridges, a culture that keeps its grudges in writing, and a habit of hanging the heads of its enemies where the tide can see them. Vorin travellers find it charming for about a day.' }),
  loc('the-valley', 'The Valley', 'roshar', 'stormlight', 0.666, 0.540, '#4ade80', 'grass',
    'Where the Nightwatcher gives a boon and takes something you will miss more.', {
      region: 'The Valley',
      bio: 'The place at the far end of Shinovar\'s mountains where the Nightwatcher gives a boon and takes a curse to match, and does not negotiate either. Dalinar came asking to forget Evi and was granted it in the cruellest possible reading. Cultivation intervenes when it suits her; the Nightwatcher does not know why.', arc: 'oathbringer' }),
  loc('kasitor', 'Kasitor', 'roshar', 'stormlight', 0.352, 0.230, '#c4b5fd', 'city',
    'An Iriali city on the northern coast. Rysn traded here.', {
      region: 'Iri',
      bio: 'An Iriali port on the northern coast, where Cusicesh rises out of the bay every dawn and turns through a thousand faces while the city gets on with the morning. Rysn traded here and found the spectacle less remarkable than the locals\' indifference to it.', arc: 'wor' }),
  loc('dumadari', 'Dumadari', 'roshar', 'stormlight', 0.298, 0.640, '#fdba74', 'city',
    'An Azish city of the western coast, and a port for the Reshi trade.',
    { region: 'Azir', bio: 'An Azish port on the western coast and the hinge of the Reshi trade. Everything that leaves the isles for the mainland is counted here, in triplicate.' }),
  loc('greater-hexi', 'Greater Hexi', 'roshar', 'stormlight', 0.412, 0.700, '#fbbf24', 'land',
    'One of the Makabaki states that answer to Azir when it suits them.',
    { region: 'Makabak', bio: 'One of the Makabaki states that answers Azir when it suits and files an essay when it does not. Greater to distinguish it from Lesser, and for no other reason anyone can now establish.' }),
  loc('shinovar-hills', 'The Misted Mountains', 'roshar', 'stormlight', 0.262, 0.470, '#cbd5e1', 'peak',
    'The wall that keeps the Highstorms off Shinovar, and keeps Shinovar in.',
    { region: 'Shinovar', bio: 'The Misted Mountains: the wall that takes the highstorms apart before they reach Shinovar\'s soil. They are why the grass there does not hide, and why the Shin have stayed where they are for four thousand years.' }),

  // --- Scadrial ----------------------------------------------------------
  loc('terris', 'The Terris Dominance', 'scadrial', 'mistborn1', 0.500, 0.120, '#a3e635', 'land',
    'The far north, and the Keepers who copied everything the Lord Ruler tried to burn.',
    {
      region: 'Terris Dominance',
      bio: 'The far north: mountains, cold, and a people the Lord Ruler enslaved into stewardship precisely because they were the ones who remembered. The Keepers stored the world in copperminds here and died for it almost to a person; Sazed was the one who lived.', eraMaps: ['ash'] }),
  loc('kredik-shaw', 'Kredik Shaw', 'scadrial', 'mistborn1', 0.509, 0.383, '#cbd5e1', 'keep',
    'The Hill of a Thousand Spires, and the Well underneath it.', {
      region: 'Luthadel',
      bio: 'The Hill of a Thousand Spires: the Lord Ruler\'s palace, black and needled and built over the Well of Ascension. Vin fought the Lord Ruler here and learned what a Sliver is; a thousand years earlier Rashek had taken the Well\'s power in the same spot and remade the world with it.', eraMaps: ['ash'] }),
  loc('statlin', 'Statlin City', 'scadrial', 'mistborn2', 0.300, 0.560, '#e8b86d', 'city',
    'A Basin city on the rail lines, far enough out to have its own opinions.',
    {
      region: 'Elendel Basin',
      bio: 'A Basin city out along the rail lines, far enough from Elendel to have opinions about Elendel and near enough to be ignored for having them. The Basin\'s political problem in miniature.', arc: 'bom', eraMaps: ['basin'] }),
  loc('ironstand', 'Ironstand', 'scadrial', 'mistborn2', 0.640, 0.470, '#a8a29e', 'home',
    'A Roughs town. There are a dozen like it and Wax has been shot at in most.',
    {
      region: 'The Roughs',
      bio: 'A Roughs town of a few hundred people, a rail siding and a saloon. There are a dozen like it and Wax has been shot at in most of them, which he would tell you is the job and not a complaint.', arc: 'aol', eraMaps: ['basin'] }),

  // --- Sel ---------------------------------------------------------------
  loc('svorden', 'Svorden', 'sel', 'elantris', 0.720, 0.500, '#ef4444', 'city',
    'Fjordell city of the southern provinces, and a Derethi seat.',
    { region: 'Fjorden', bio: 'A Fjordell city of the southern provinces and a Derethi seat, where the gyorns train the arguments they will use on countries that have not been converted yet.' }),
  loc('hrovell', 'Hrovell', 'sel', 'elantris', 0.600, 0.430, '#94a3b8', 'land',
    'Poor, pious and thoroughly converted. Fjorden got there first.',
    { region: 'Opelon', bio: 'Poor, pious, and thoroughly Derethi — Fjorden reached it early and had very little to argue against. It is the model conversion Wyrn\'s gyorns cite when explaining what is about to happen to somewhere else.' }),
  loc('maipon', 'MaiPon', 'sel', 'emperorssoul', 0.660, 0.660, '#fbbf24', 'land',
    'Where Wan ShaiLu learned Forgery, and where they would execute her for it.',
    { region: 'MaiPon', bio: 'Where Wan ShaiLu learned Forgery and where they would execute her for practising it. MaiPon treats a soulstamp as a lie carved in stone, which it is; Shai treats it as the only honest way she knows to argue with the world.' }),
  loc('rose-empire', 'The Rose Empire', 'sel', 'emperorssoul', 0.780, 0.620, '#f472b6', 'crown',
    'Eastern Sel, and an emperor who spent eighty days being someone else\'s essay.',
    {
      region: 'Rose Empire', aliases: 'the Rose Empire',
      bio: 'Factions, Grands, and a bureaucracy that would rather rewrite a soul than admit a vulnerability. Shai is hired to forge the Emperor\'s because the alternative is saying out loud that he is gone.' }),

  // --- the thinner worlds ------------------------------------------------
  loc('floating-cities', 'The Floating Cities', 'ashyn', 'stormlight', 0.500, 0.480, '#fbbf24', 'city',
    'What is left of Ashyn: cities in the air, above a surface its people ruined with Surges.',
    {
      region: 'Ashyn',
      bio: 'What is left of Ashyn: cities in the air above a surface their own ancestors made uninhabitable. Humanity came from here to Roshar as refugees, which is the fact Rosharan history has been carefully not knowing for four thousand years.', canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'] }),
  loc('braize-prison', 'The Prison', 'braize', 'stormlight', 0.500, 0.500, '#ef4444', 'keep',
    'Not a building. The whole world was the cell, and ten people held the door for four thousand years.',
    {
      region: 'Braize',
      bio: 'Not a building: the planet. The Oathpact bound Odium and his Fused to Braize, and ten Heralds held the door by being tortured on the other side of it until they agreed to stop coming back. Nine broke. Taln held for four thousand years alone.', canon: 'wob', sources: ['The Stormlight Archive', 'Word of Brandon'] }),
  loc('fain-wilds', 'The Fain Wilds', 'yolen', 'core', 0.640, 0.520, '#86efac', 'forest',
    'Where the other biology wins. Fain life and normal life share Yolen and do not mix.',
    {
      region: 'Yolen',
      bio: 'Where the other biology wins. Yolen carries two ecologies that cannot metabolise each other — ordinary life and fain life, pale and crystalline and entirely separate — and the Wilds are where fain has the ground.', canon: 'wob', sources: ['Word of Brandon'] }),
  loc('yolen-dragons', 'The dragon lands', 'yolen', 'core', 0.360, 0.440, '#e0f2fe', 'peak',
    'Where the greater dragons kept to themselves, and mostly still do.',
    {
      region: 'Yolen',
      bio: 'Where the greater dragons kept to themselves before the Shattering and, as far as anyone can establish, still do. Frost writes his letters from somewhere in here, and has been declining to intervene in anything for a very long time.', canon: 'wob', sources: ['Word of Brandon', 'Isles of the Emberdark'] }),
  loc('sho-del-lands', 'The Sho Del holds', 'utol-world', 'yumi', 0.480, 0.520, '#a1a1aa', 'keep',
    'UTol is a principal Sho Del world. What that looks like from the ground is not on the page.',
    {
      region: 'UTol',
      bio: 'UTol is a principal Sho Del world — four-armed, Invested, and originally of Yolen, where they fought humans in a war nobody now living saw. What any of that looks like from the ground has not been put on the page.', canon: 'wob', sources: ['Word of Brandon'] }),
  loc('obrodai-claim', "Autonomy's claim", 'obrodai-world', 'mistborn2', 0.500, 0.500, '#db2777', 'land',
    'A world Autonomy took and put an avatar on. The avatar took a name of her own.',
    {
      region: 'Obrodai',
      bio: 'A world Autonomy took and put an avatar on, the way she has taken others. The avatar chose a name of her own, which is the part of the arrangement Autonomy keeps discovering she did not fully think through.', arc: 'tlm', sources: ['The Lost Metal'] }),
  loc('suluko', 'Suluko', 'first-of-the-sun', 'sixthofdusk', 0.470, 0.520, '#a3e635', 'island',
    'A Pantheon island. Less lethal than Patji, which is not the same as safe.', {
      region: 'The Pantheon',
      bio: 'A Pantheon island less lethal than Patji, which is the local way of saying a trapper might get a season out of it. The aviar are the reason anyone bothers.', eraMin: 1 }),
  loc('vathi-camp', 'The company camp', 'first-of-the-sun', 'sixthofdusk', 0.560, 0.520, '#fbbf24', 'home',
    'Off-worlders came to survey the Pantheon. The islands surveyed them back.', {
      region: 'The Pantheon',
      bio: 'The company camp: off-worlders and mainlanders who came to survey the Pantheon for development and found that the Pantheon surveys back. Vathi wanted to modernise the islands; Dusk wanted them left alone; the machines they brought wanted something else entirely.', arc: 'sixthofdusk' }),
  loc('longroad', 'The Long Road', 'canticle-world', 'sunlit', 0.500, 0.560, '#fb923c', 'land',
    'The track every hover-city runs, always west, always just ahead of the sun.',
    { region: 'The Corridor', bio: 'The track the hover-cities run: west, always west, at a pace set by the planet\'s rotation and not negotiable. Stop for a day and the day catches you.' }),
  loc('gakalfen', 'Gakalfen', 'komashi', 'yumi', 0.540, 0.560, '#22d3ee', 'city',
    'A Komashi city on the hion lines. The machine keeps it lit and the nightmares keep it awake.',
    {
      region: 'Komashi',
      bio: 'A Komashi city strung on the hion lines, lit by the machine and kept awake by what the machine\'s leftovers turn into after dark. Kilahito is not unique; it is simply the one with the painters.', canon: 'wob', sources: ['Yumi and the Nightmare Painter'] }),
  loc('threnody-forests-deep', 'The Deep Forest', 'threnody', 'shadowsforsilence', 0.560, 0.480, '#0f1a10', 'forest',
    'Past where the Homeland pretends the Forests end. Nobody has drawn what is in here.',
    { region: 'The Forests', bio: 'Past the depth the Homeland has agreed to call the edge. Nobody has mapped it, the people who have gone in did not come out to argue about it, and the shades in there are older than the settlement.' }),
  loc('lumar-rocks', 'The Rock', 'lumar-world', 'tress', 0.24, 0.44, '#9c8d78', 'rock',
    'One of the few outcrops above the spore seas, and therefore a whole society.',
    { region: 'Lumar', bio: 'One of the few outcrops standing above the spore seas, and therefore an entire society — everything Lumar\'s people have, they have because a rock happened to be there. The seas are not land and cannot be farmed; the rocks are all there is.' }),
];

export const PERPS: Perpendicularity[] = [
  { id: 'well-of-ascension-perp', name: 'The Well of Ascension', body: 'scadrial', book: 'mistborn1',
    fact: 'Preservation\'s pool beneath Kredik Shaw. Used, then collapsed.', at: 'luthadel',
    eraMin: 2, eraMax: 2, canon: C, sources: ['Mistborn Era 1'] },
  { id: 'harmony-pool', name: "Harmony's Perpendicularity", body: 'scadrial', book: 'mistborn2',
    fact: 'The surviving Scadrian pool after the Catacendre.', at: 'elendel',
    eraMin: 3, canon: C, sources: ['Mistborn Era 2'] },
  { id: 'elantris-pool-perp', name: 'The Pool of Elantris', body: 'sel', book: 'elantris',
    fact: 'Devotion\'s perpendicularity in the mountains above Elantris.', at: 'elantris-city',
    eraMin: 1, canon: C, sources: ['Elantris'] },
  { id: 'cultivation-pool', name: "Cultivation's Perpendicularity", body: 'roshar', book: 'stormlight',
    fact: 'The Horneater Peaks\' thermal oceans. A stable transit.', at: 'horneater-peaks',
    eraMin: 1, canon: C, sources: ['The Stormlight Archive'] },
  { id: 'honors-perp', name: "Honor's Perpendicularity", body: 'roshar', book: 'stormlight',
    fact: 'Opened by Dalinar at Thaylen Field; not a stable geographic pool.', at: 'thaylen-city',
    eraMin: 3, eraMax: 3, canon: C, sources: ['Oathbringer'] },
  { id: 'tears-of-edgli-perp', name: 'Tears of Edgli', body: 'nalthis', book: 'warbreaker',
    fact: 'Flowers whose dye is Endowment\'s Investiture made pigment.', at: 'tears-of-edgli',
    eraMin: 1, canon: C, sources: ['Warbreaker'] },
  { id: 'patjis-eye-perp', name: "Patji's Eye", body: 'first-of-the-sun', book: 'sixthofdusk',
    fact: 'A perpendicularity on the island Patji, source of Aviar powers.', at: 'patji',
    eraMin: 1, canon: C, sources: ['Sixth of the Dusk'] },
  { id: 'pits-of-hathsin-perp', name: 'The Pits of Hathsin', body: 'scadrial', book: 'mistborn1',
    fact: 'Where Ruin\'s power crystallised into atium. Not a doorway so much as a wound that produced metal.',
    at: 'pits-of-hathsin', eraMin: 2, eraMax: 2, canon: C, sources: ['Mistborn Era 1'] },
  { id: 'dominion-pool', name: "Dominion's Pool", body: 'sel', book: 'elantris',
    fact: 'The second Selish perpendicularity. Dominion was Splintered with Devotion, and both pools remain.',
    at: 'fjorden', eraMin: 1, canon: C, sources: ['Arcanum Unbounded — Sel essay'] },
  { id: 'silverlight-nexus', name: 'The Silverlight Nexus', body: 'yolen', book: 'arcanum',
    fact: 'The crossing that made a city possible where no world is. Khriss came through it and stayed.',
    eraMin: 1, canon: W, sources: ['Arcanum Unbounded', 'Word of Brandon'] },
];
