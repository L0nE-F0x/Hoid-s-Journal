import type { Character } from './types.ts';

/** Overlay bios / wiki / see for people who already sit in characters.ts. */
export const PEOPLE_BIOS: Record<string, Partial<Character>> = {
  vin: {
    wiki: 'Vin',
    see: ['elend', 'kelsier', 'reen', 'lord-ruler', 'sazed'],
    bio: 'A half-skaa thief raised by her half-brother Reen to trust no one, then taught by Kelsier to trust a crew. She kills the Lord Ruler, loves Elend, and briefly holds Preservation before giving her life so Ruin can die. The mists chose her; she still had to choose what to do with them.',
  },
  kaladin: {
    wiki: 'Kaladin',
    see: ['syl', 'bridge-four', 'tien', 'szeth', 'ishar', 'heralds'],
    bio: 'A darkeyed surgeon\'s son who became a slave, a bridgeman, and the first Windrunner of the new Radiance. Depression and the weight of everyone he failed nearly broke him more than once; Syl, Bridge Four and Teft kept dragging him back into the sky, and after Rhythm of War he turned his father\'s training on minds instead of bodies. In Wind and Truth he goes to Shinovar with Szeth to help a mad Herald, swears the Fifth Ideal to Ishar himself, and on Stormfall takes Jezrien\'s place in a reforged Oathpact. His body is left behind, and Szeth buries it. He is the Herald of Second Chances now.',
  },
  shallan: {
    wiki: 'Shallan',
    see: ['jasnah', 'adolin', 'lin-davar', 'helaran'],
    bio: 'A Lightweaver who survived her family by splitting into Veil and Radiant, and then had to take back what those masks were holding: that the first Cryptic she bonded, Testament, was the one she killed, and that the mother she killed at eleven was the Herald Chanarach, sent with a Skybreaker to kill her, who hesitated. In Wind and Truth she hunts the Ghostbloods through the Spiritual Realm with Renarin and Rlain, and refuses the self she calls Formless. The Formless she finally stabs is Iyatil in disguise; she kills Mraize too, and Radiant folds back into her. She ends the book stranded in Shadesmar, where Cultivation\'s Perpendicularity has vanished, bargaining with Thaidakar for a seon that can reach Adolin.',
  },
  wax: {
    wiki: 'Waxillium_Ladrian',
    see: ['wayne', 'steris', 'marasi', 'telsin', 'harmony', 'house-ladrian', 'weathering'],
    bio: 'A Coinshot and a Skimmer who spent twenty years as a lawman in the Roughs, came home to Elendel when his uncle died, and found his uncle was Mister Suit. Harmony speaks to him through an earring MeLaan gave him; Lessie turned out to be a kandra; his sister shot him at the Sovereign\'s temple. By The Lost Metal he is a senator, a husband and a father, and Harmony\'s Sword — and he climbs the Shaw in Bilming to cut Telsin off from Autonomy, while Wayne goes out to sea with the bomb.',
  },
  jasnah: {
    wiki: 'Jasnah_Kholin',
    see: ['shallan', 'dalinar', 'navani', 'kharbranth'],
    bio: 'Alethkar\'s heretic scholar-queen, an Elsecaller who Soulcasts assassins into smoke and walks Shadesmar on purpose, mentor to Shallan, and Wit\'s lover. In Wind and Truth she holds Thaylen City and finds the invasion ships empty; then the new Odium shows her his face, Taravangian\'s, and challenges her to a public debate for Thaylenah. Queen Fen chooses him. Jasnah ends things with Wit by letter, and he agrees. After Stormfall she gives the Shattered Plains to the listeners by treaty, watches Alethkar fall, and with Renarin begins a government that does not need a throne. By the time Knights of Wind and Truth is written, she leads her order.',
  },
  kelsier: {
    wiki: 'Kelsier',
    see: ['ghostbloods', 'vin', 'marsh', 'preservation', 'bands-of-mourning'],
  },
  khriss: {
    wiki: 'Khrissalla',
    see: ['baon', 'gevalden', 'kenton', 'taldain', 'sand-mastery', 'nazh'],
    bio: 'Duchess Khrissalla of Taldain, the Cosmere\'s foremost arcanist and the voice behind the Ars Arcanum essays. She studies Investiture the way generals study maps, sends Nazh to steal the footnotes, and knows more about your planet than your priests do.',
  },
  nazh: {
    wiki: 'Nazrilof',
    see: ['khriss', 'threnody', 'silverlight'],
    bio: 'Khriss\'s long-suffering Threnodite agent: map thief, annotator, and professional complainer. If a chart in your edition has dry sarcasm in the margins, that is Nazh earning his keep. Somewhere before the space age he died and came back a shade, and he keeps the Dynamic\'s security for Starling — which is why the Malwish on the Dakwara\'s island had a shade prison ready for him.',
  },
  galladon: {
    wiki: 'Galladon',
    see: ['raoden', 'karata', 'elantris-city', 'seventeenth-shard'],
    bio: 'A Dula Elantrian who taught Raoden how to live in a broken city, then left Sel with the Seventeenth Shard. On Roshar, with Baon and Demoux, he hunts for Hoid; a Purelake fisherman knows him as Grump. Pessimistic, practical, and better travelled than he admits.',
  },
  sigzil: {
    wiki: 'Sigzil',
    see: ['hoid', 'kaladin', 'bridge-four'],
    bio: 'Bridge Four\'s Azish Worldsinger and Hoid\'s apprentice. In Wind and Truth he commands the Windrunners holding Narak: he watches Moash kill Leyten and his spren, and to save his own honorspren, Vienta, from Moash\'s knife he renounces his oaths. On the Night of Sorrows, with Retribution coming for him, Wit gives Sigzil the Dawnshard Exist and pushes him into Shadesmar, and he leaves Roshar with an Iriali caravan. He becomes the man called Nomad: bonded to Szeth\'s old highspren, Aux, hunted across the stars by the Night Brigade, and learning that skipping is not the same as escaping.',
  },
  vasher: {
    wiki: 'Vasher',
    see: ['nightblood', 'azure', 'shashara', 'kalad-phantoms'],
    bio: 'Returned scholar of Awakening, once Kalad the Usurper, now a man who would rather teach swordsmanship on Roshar than rule anything. He helped make Nightblood, survived the Manywar\'s guilt, and still argues with swords that have opinions.',
  },
  azure: {
    wiki: 'Vivenna',
    see: ['vasher', 'siri', 'nightblood'],
    bio: 'Vivenna of Idris, who lost her betrothal, her hair, and her certainties, then gained Breath, a Shardblade that is not a spren, and the name Azure. She hunts Vasher across worlds with a soldier\'s pragmatism and a princess\'s unfinished business.',
  },
  demoux: {
    wiki: 'Demoux',
    see: ['kelsier', 'seventeenth-shard', 'sazed'],
    bio: 'A captain of Kelsier\'s army who preached the Survivor at night in Luthadel, rose to general under Elend, and was struck down by the mists — which Snapped him into a Seer. Long after, he is one of the three who ask after Hoid on Roshar for the Seventeenth Shard.',
  },
  lift: {
    wiki: 'Lift',
    see: ['yanagawn', 'nightwatcher', 'azimir'],
    bio: 'A Reshi thief who asked the Nightwatcher to stay herself, and got something stranger: a body that turns food into Lifelight, a foot in the Cognitive Realm, and hands that can touch spren. Edgedancer Ideals, Wyndle\'s complaining vines, and a stubborn compassion for the people empires forget. In Wind and Truth she is growing up and hates it, slips into the Stormfather\'s visions on her own, and teaches Gavinor that disobeying your elders is sometimes right, which is how he ends up in the Spiritual Realm.',
  },
  szeth: {
    wiki: 'Szeth',
    see: ['nightblood', 'kaladin', 'ishar', 'shin-shamans', 'truthless'],
    bio: 'Szeth-son-Neturo: Truthless of Shinovar, the Assassin in White, Skybreaker. He went home with Kaladin to cleanse Shinovar and found that the Voice which had guided him since childhood was Ishar, and that the Honorbearers he had to beat included his own father and sister, remade as Ishar\'s Fused. He swore the Fifth Ideal and broke his bond with his highspren in the same breath, then freed them all with Nightblood; the sword ate his right arm. Ishar wanted him for a Herald. Kaladin took the place instead, and Szeth buried his body. Years on, he is married to the Shin historian who wrote the Knights of Wind and Truth down.',
  },
  sazed: {
    wiki: 'Sazed',
    see: ['vin', 'kelsier', 'keepers', 'tindwyl', 'tensoon'],
    bio: 'A Terris Keeper who catalogued dead religions, lost his faith when Tindwyl died, and then remade Scadrial as Harmony.',
  },
  elend: {
    wiki: 'Elend_Venture',
    see: ['vin', 'sazed', 'house-venture'],
    bio: 'A scholarly heir who becomes king and then emperor because someone has to read the books on how not to be his father. He marries Vin, becomes Mistborn at the Well, and dies at the Battle of Hathsin, beheaded by Marsh, holding a koloss army and a philosophy that almost worked.',
  },
  marsh: {
    wiki: 'Marsh',
    see: ['kelsier', 'inquisitor', 'steel-ministry', 'vin'],
    bio: 'Kelsier\'s brother, made an Inquisitor by the Ministry he went in to spy on, then Ruin\'s favourite puppet. He beheads Elend at Hathsin and, with what is left of himself, tears out the earring that kept Vin from Preservation. Centuries later the Basin calls him Ironeyes, the death in its folk tales, and he still runs Harmony\'s errands.',
  },
  'lord-ruler': {
    wiki: 'Rashek',
    see: ['alendi', 'kwaan', 'vin', 'final-empire', 'kredik-shaw'],
    bio: 'Rashek, a Terris packman who killed Alendi at the Well of Ascension, took its power, and ruled Scadrial as the Lord Ruler for a thousand years of ash. Allomancy and Feruchemy together made him all but unkillable, until Vin took his metalminds from him.',
  },
  tensoon: {
    wiki: 'TenSoon',
    see: ['vin', 'oreseur', 'kandra', 'sazed', 'melaan'],
    bio: 'A Third Generation kandra, born with the Blessing of Presence, who took OreSeur\'s Blessing of Potency when he killed him and spent the siege of Luthadel in a wolfhound\'s bones as Vin\'s "OreSeur". He broke his Contract for her, stood trial in the Homeland, and pulled his own spikes when Ruin seized his body. Three centuries on he is Harmony\'s agent among the kandra, still partial to the wolfhound.',
  },
  spook: {
    wiki: 'Spook',
    see: ['clubs', 'kelsier', 'vin', 'beldre', 'quellion'],
    bio: 'Clubs\'s nephew and the crew\'s youngest Tineye, who goes north to Urteau, takes a Hemalurgic spike that Ruin speaks through in Kelsier\'s voice, and tears it out to save the city. After the Catacendre Sazed makes him Mistborn, and he rules the survivors as the Lord Mistborn. The crew remembered him as the boy who wanted to be useful.',
  },
  wayne: {
    wiki: 'Wayne',
    see: ['wax', 'marasi', 'harmonium'],
    bio: 'A Slider and a Bloodmaker with a hat for every accent, who shot a man named Durkel in a robbery at sixteen and has paid his daughter every month since. He rode with Wax in the Roughs, followed him to Elendel, joined the constabulary and partnered Marasi for six years. In The Lost Metal he pushes Wax off the Bilming warship, wraps the bomb in a speed bubble with duralumin and bendalloy burning together, and dies in the biggest explosion anyone has ever made. Harmony told him so.',
  },
  marasi: {
    wiki: 'Marasi_Colms',
    see: ['wax', 'wayne', 'steris', 'malwish'],
    bio: 'Lord Harms\'s illegitimate daughter and Steris\'s half-sister, raised in the Outer Estates, who came to the city to study legal justice and criminal behaviour and had read every report about Wax and Wayne before she met them. Aradel hired her as a constable; at the Sovereign\'s temple she took up the Bands of Mourning and turned the fight. In The Lost Metal the Ghostbloods recruit her and she turns them down because she could not share what she learned. Two years later she is leaving for the Malwish Consortium as an ambassador, and planning to run for governor.',
  },
  steris: {
    wiki: 'Steris_Harms',
    see: ['wax', 'marasi', 'house-ladrian'],
    bio: 'A woman who weaponises notebooks: she memorises social rules because they do not come to her, and keeps a contingency for every occasion. Her marriage to Wax began as a contract and became the partnership that keeps House Ladrian solvent and alive. When the bomb came for Elendel she ran the evacuation of the docks herself, and the governor made her the city\'s Disaster Preparations Officer.',
  },
  melaan: {
    wiki: 'MeLaan',
    see: ['tensoon', 'wax', 'kandra', 'wayne'],
    bio: 'A Seventh Generation kandra raised by TenSoon, who backed him at his trial in the Homeland and freed the First Generation when KanPaar turned on them. Three centuries later she is Harmony\'s hands in Elendel, introduces herself to Wax at a party as "Milan", and wears Governor Innate\'s bones in front of a riot. After six years with Wayne she asked Harmony for a mission off-world — the first kandra to go — and left him for Shadesmar.',
  },
  dalinar: {
    wiki: 'Dalinar_Kholin',
    see: ['navani', 'stormfather', 'adolin', 'honor'],
    bio: 'The Blackthorn who burned the Rift, gave his memory of his wife to the Old Magic, and rebuilt himself into a Bondsmith and the man who refounded the Knights Radiant. In Wind and Truth he walks Honor\'s past in the Spiritual Realm, then meets Odium\'s champion on top of Urithiru: Gavinor, grown up in a vision and taught to hate him. He will not kill the boy. He takes up Honor, finds it wants only war on Odium, and renounces his oaths instead, buying Roshar time with his life. He dies shielding Gavinor from the wind, and Taravangian takes up what he let go.',
  },
  adolin: {
    wiki: 'Adolin_Kholin',
    see: ['shallan', 'dalinar', 'renarin', 'kholin'],
    bio: 'Dalinar\'s heir: duelist, Shardbearer, Shallan\'s husband, and the man who befriended a deadeye instead of speaking an Ideal. At Lasting Integrity Maya testified beside him. In Wind and Truth the coalition sends him to hold Azimir; a thunderclast takes his right leg below the knee, and he fights on with a peg. On the last day he took Azir\'s throne room back from Abidi the Monarch, and when Maya came through Shadesmar with thirty-seven deadeyes he called his ten the Unoathed. Azir is the one nation not under the Everstorm. All book long he is furious with his father, and then, before the end, he is not.',
  },
  renarin: {
    wiki: 'Renarin_Kholin',
    see: ['dalinar', 'adolin', 'elhokar', 'kholin'],
    bio: 'Dalinar\'s younger son, who never fit Alethi war culture: quiet, epileptic, and bonded to Glys, a mistspren Enlightened by Sja-anat, so that he sees futures Odium would rather keep. In Wind and Truth he and Rlain hunt Ba-Ado-Mishram\'s prison through the Spiritual Realm and choose to break it open rather than seal her away again. After his father dies he refuses the crown of Urithiru and asks Jasnah to help him build a representative government instead.',
  },
  navani: {
    wiki: 'Navani_Kholin',
    see: ['dalinar', 'fabrial', 'gavilar'],
    bio: 'Gavilar\'s widow and Dalinar\'s wife, an artifabrian who turned grief into scholarship and scholarship into Towerlight. She bonded the Sibling and out-thought Raboniel. In Wind and Truth she walks Roshar\'s history with Dalinar in the Spiritual Realm, one of the few humans who can find its pure tones, and comes back believing she has Gavinor; Taravangian has left her a sleeping copy. When Dalinar dies she has the Sibling seal Urithiru in crystal against Retribution, and sleeps inside it.',
  },
  venli: {
    wiki: 'Venli',
    see: ['eshonai', 'listeners', 'thude'],
    bio: 'A listener scholar who bargained her people toward stormform, lost her sister to it, and then took a different spren entirely: a Willshaper, the Last Listener, Raboniel\'s Voice. In Wind and Truth she goes home to Narak and what is left of the listeners, with their new chasmfiend allies and Leshwi looking for a place outside Odium. Under the plateau she finds the Well of Control. When the contest begins the listeners hold Narak by treaty with Jasnah, and El withdraws. After Stormfall Retribution lets them take Warlight, and Venli tells her people they will take in anyone who will listen for peace.',
  },
  taravangian: {
    wiki: 'Taravangian',
    see: ['odium', 'cultivation'],
    bio: 'King of Kharbranth, whose Diagram was written on the one day he woke brilliant. At the end of Rhythm of War he killed Rayse with Nightblood and took up Odium. In Wind and Truth he keeps every contract by its letter: he raises Gavinor in a vision to be his champion, and when Dalinar gives up Honor he takes that too and becomes Retribution, among the most Invested beings in the cosmere and no longer bound to Roshar\'s system. He destroys the Stormfather, folds the highstorm into the Everstorm, and goes to ground before the other Shards can move. Kharbranth, which he seemed to drown, is safe in a copy he built in the Spiritual Realm.',
  },
  moash: {
    wiki: 'Moash',
    see: ['kaladin', 'odium', 'jezrien'],
    bio: 'Bridge Four\'s friend who chose vengeance over the Ideal, killed Elhokar and a Herald, and took Vyre\'s name under Odium. In Rhythm of War he kills Teft. In Wind and Truth, blinded, he lets Odium and the Herald Battar drive crystal spikes into his eyes so that he sees Investiture as light; on the Shattered Plains he kills Leyten and his spren, and comes close to Vienta. He is the warning Kaladin cannot stop replaying: protection without mercy curdles.',
  },
  rlain: {
    wiki: 'Rlain',
    see: ['kaladin', 'bridge-four', 'teft'],
    bio: 'A listener spy who became Bridge Four\'s own, and then, in the occupation of Urithiru, a Truthwatcher bonded to the Enlightened mistspren Tumi. In Wind and Truth he goes into the Spiritual Realm after Ba-Ado-Mishram with Renarin and Shallan, argues that hating all humans for Melishi\'s betrayal is exactly what Odium wants, and convinces Renarin that they must free her. When she strikes at Renarin, Rlain steps between them. He and Renarin are together.',
  },
  teft: {
    wiki: 'Teft',
    see: ['kaladin', 'bridge-four'],
    bio: 'Bridge Four\'s sergeant, raised among the Envisagers who wanted the Radiants back, and a firemoss addict who takes the First Ideal seriously enough to drag Bridge Four into Radiance with him. He bonds Phendorana. In the occupation of Urithiru he dies fighting Moash to shield the helpless Radiants: a sergeant\'s death, and a Windrunner\'s.',
  },
  rock: {
    wiki: 'Lunamor',
    see: ['kaladin', 'bridge-four', 'horneaters'],
    bio: 'Numuhukumakiaki\'aialunamor — Horneater cook, bridgepuller, and the man who sees spren when others cannot. He feeds Bridge Four until the war asks him to kill, then goes home carrying scars stewardship cannot wash off.',
  },
  rysn: {
    wiki: 'Rysn_Ftori',
    see: [],
    bio: 'A Thaylen merchant who lost the use of her legs in a fall on Relu-na, raised a larkin, and at Akinah became the bearer of the Dawnshard Change, which the Sleepless had guarded for millennia. It lies dormant in her, though she can sense life, and a voice in her head offers suggestions. Afterward she makes the coalition accept Thaylen patent law, and goes into business with Huio.',
  },
  eshonai: {
    wiki: 'Eshonai',
    see: [],
    bio: 'A listener general and Shardbearer who wanted to explore the world more than fight for it. To save her people she took stormform, and it took her; her sister inherits both the guilt and the chance to choose differently. In her last moments she bonded Timbre.',
  },
  siri: {
    wiki: 'Siri',
    see: ['susebron', 'azure', 'austrism'],
    bio: 'Idrian princess sent to marry the God King as a substitute sacrifice. Colour, curiosity, and stubborn kindness undo a theocracy\'s silence — and give Susebron his voice back in more than one sense.',
  },
  susebron: {
    wiki: 'Susebron',
    see: ['siri', 'court-of-gods', 'breath'],
    bio: 'God King of Hallandren, raised without a tongue and with enough Breath to break kingdoms. Siri teaches him that divinity without agency is just another cage; he learns to speak, rule, and refuse the easy war.',
  },
  lightsong: {
    wiki: 'Lightsong',
    see: ['llarimar', 'blushweaver', 'susebron'],
    bio: 'Returned who insists he is useless while running a city\'s politics on wit and mercy. He gives his Divine Breath to heal Susebron and dies knowing, for once, what he Returned for.',
  },
  raoden: {
    wiki: 'Raoden',
    see: ['sarene', 'galladon', 'aon-dor', 'elantrian'],
    bio: 'Crown prince of Arelon thrown into Elantris by the Shaod. He rebuilds a people before he rebuilds the Aons, adds the Chasm Line, and turns a corpse-city back into a capital of light.',
  },
  sarene: {
    wiki: 'Sarene',
    see: ['raoden', 'hrathen', 'teod'],
    bio: 'Teoish princess who weaponises etiquette, politics, and a fencing foil. She fights Fjorden\'s conversion of Arelon while falling for a man she thinks is dead — and wins both the marriage and the kingdom.',
  },
  hrathen: {
    wiki: 'Hrathen',
    see: ['dilaf', 'sarene', 'shu-dereth'],
    bio: 'A gyorn who came to convert Arelon in three months and found his own faith cracking. He dies blocking Dilaf\'s atrocity, proof that Shu-Dereth\'s armour can still house a conscience.',
  },
  kenton: {
    wiki: 'Kenton',
    see: ['diem', 'sand-mastery', 'baon'],
    bio: 'A weak sand master who survives a massacre, inherits the Diem\'s leadership, and tries to keep Lossand\'s profession from being outlawed. Low power, high stubbornness, Dayside politics at knife-point.',
  },
  yumi: {
    wiki: 'Yumi',
    see: ['painter', 'liyun', 'father-machine', 'yoki-hijo', 'torio', 'samjae'],
    bio: 'A yoki-hijo of Torio, born under a falling star and raised by Liyun inside the strictest form of the tradition; her record is thirty-seven spirits at once. When the father machine woke it ate her people and could not eat her, so it kept her in a copy of her old life and wiped each day, for one thousand seven hundred and sixty-three years. A spirit Connected her to Painter; she remembered, learned to paint, and took the spirits back from the machine stone by stone. She is a Cognitive Shadow now, anchored with painter\'s ink, and runs the Noodle Princess with him.',
  },
  painter: {
    wiki: 'Nikaro',
    see: ['yumi', 'akane', 'tojin', 'the-dreamwatch', 'bamboo-painting', 'battle-of-kilahito'],
    bio: 'The best artist of his year, who failed the Dreamwatch, told his friends he had got in, and has painted nothing but bamboo since. A spirit Connected him to Yumi: he learned to stack stones in her body, she learned to paint in his. At the battle of Kilahito he worked out that a nightmare painted as the person it used to be stays that way, and painted Gongsha Town back one face at a time.',
  },
  tress: {
    wiki: 'Tress',
    see: ['charlie', 'hoid', 'crow', 'crows-song', 'xisis', 'two-cups'],
    bio: 'Born Glorf on Diggen\'s Point and called Tress for her hair. She washed the duke\'s windows, traded pies to sailors for cups, and fell for his son. When the Sorceress took Charlie she conned her way off a rock nobody is allowed to leave, became the Crow\'s Song\'s sprouter to make herself useful, sold her captain to a dragon, and sailed the ship into the Midnight Sea.',
  },
  charlie: {
    wiki: 'Charlie',
    see: ['tress', 'hoid', 'riina', 'duke-diggen', 'dirk', 'sorceress-curse'],
    bio: 'The duke\'s son, who bored a year of princesses on purpose and sent Tress a cup after every rejection. His father sent him to marry the Sorceress instead. She made him a rat whose curse would break only if he brought Tress to her to be cursed, and he spent the book trying to stop Tress reaching the island — as Huck, on her shoulder. Hoid rewrote the terms: bring her home, and write her a verse.',
  },
  shai: {
    wiki: 'Wan_ShaiLu',
    see: ['gaotona', 'ashravan', 'frava', 'han-shuxen', 'forgery', 'ghostbloods'],
    bio: 'A MaiPon Forger, among the best alive, caught in the Rose Palace after the Imperial Fool swapped her fake Moon Scepter for the real one and gave her up. Facing execution, she is offered a deal: Forge a new soul for the comatose Emperor Ashravan within his hundred days of mourning. She carries five Essence Marks that took eight years to make, writes him a soul with no backdoors in it, and walks out. Long afterwards, unable to go home to Sel, she is a Ghostblood on Scadrial called Moonlight; under Bilming she stamps her own past to become an Elantrian and holds a wall so Marasi can get through — and no longer remembers who Marasi is.',
  },
  silence: {
    wiki: 'Silence_Montane',
    see: ['william-ann', 'shade', 'simple-rules'],
    bio: 'Proprietor of a waystop in the Forests of Hell and, secretly, the White Fox, the bounty hunter every storyteller in the Forests has a tale about. She takes Chesterton Divide\'s bounty to keep the waystop out of Theopolis\'s hands; it costs William Ann a hand and very nearly both their lives. Her grandmother\'s shade, locked in the shrine, settles Theopolis.',
  },
  dusk: {
    wiki: 'Sixth_of_the_Dusk',
    see: ['vathi', 'aviar', 'patji-eye'],
    bio: 'A trapper of the Pantheon, a man who says little, trusts Aviar more than people, and serves Patji as priest while treating it as a father trying to kill him. He wanted the island left alone. Then the Company came, and Vathi with it, and the Ones Above\'s machine turned out to be a trap, and he decided the Eelakin had to modernise before they were taken. Five years on, with Kokerlii dead and his people outmatched, he paddled a canoe through Patji\'s Eye into the Emberdark with Sak and Rokke. Patji made him a Navigator. He bluffed the Malwish on the Dakwara\'s island, bested the Dakwara, and brought Starling\'s crew back to the perpendicularity; after six months training the first Navigators, he signed on with the Dynamic.',
  },
  mraize: {
    wiki: 'Mraize',
    see: ['shallan', 'iyatil', 'ghostbloods', 'thaidakar'],
    bio: 'Betd, called Mraize: a Thaylen-born Ghostblood, hunter and collector, Shallan\'s handler, answering to Iyatil and to Thaidakar. He bonded an Enlightened Cryptic of his own and learned to Lightweave. In Wind and Truth he hunts Ba-Ado-Mishram\'s prison through the Spiritual Realm with Iyatil wearing the face of Shallan\'s Formless. Shallan kills them both; Mraize dies breathing in Stormlight, trying to heal from a knife that will not let him.',
  },
  iyatil: {
    wiki: 'Iyatil',
    see: ['mraize', 'ghostbloods', 'thaidakar'],
    bio: 'A masked Ghostblood of Southern Scadrian blood, from Silverlight, who outranks Mraize on Roshar and is his babsk. In Wind and Truth she follows Dalinar into the Spiritual Realm wearing a Lightweaving of Shallan\'s Formless. Shallan drives an anti-Stormlight knife into her eye; when Iyatil tries to heal, the two Lights destroy her.',
  },
  felt: {
    wiki: 'Felt',
    see: ['elend', 'kelsier', 'ghostbloods'],
    bio: 'A House Venture spy who tailed Kelsier\'s crew for Elend, and who turns up, by Word of Brandon, as a scout on Roshar\'s Shattered Plains — and in Ghostblood company. Bland competence, and a reminder that Scadrial\'s agents got off-world somehow.',
  },
  design: {
    wiki: 'Design',
    see: ['hoid', 'cryptic', 'yolen'],
    // Published face (Yumi). Stormlight readers get READING_FACES.design.early.
    bio: 'The Cryptic Hoid found in Kholinar near where Elhokar died, and bonded himself. She spoils his endings on purpose and thinks surprises are dumb unless they are pranks. Off Roshar she wears a wireframe Lightweaving of a striking Nagadan woman — she does not see herself as female, she just likes the shape. When Hoid froze on Komashi she founded the Noodle Pupil, stood him in a corner for coats, spotted Masaka for a Sleepless, stretched Painter\'s Connection, and willed the shop to him and Yumi when they left.',
  },
  riina: {
    wiki: 'Riina',
    see: ['the-ire', 'tress', 'hoid', 'sorceress-curse', 'riina-tower', 'sorceress-island'],
    bio: 'She picked Lumar because nothing on it could stop her. Over the years her metal soldiers, Midnight Essence and tariffs on the Midnight Sea made her the Sorceress, and anyone who reached her island left cursed — in rhyme, told every term, and unable to say any of them. She turned Charlie into a rat and took Hoid\'s bet: a curse now, Elantrian status if he broke it. When he walked back into her ship cured, she weighed the odds and left the planet.',
  },
  nikli: {
    wiki: 'Nikli',
    see: ['rysn', 'sleepless', 'dawnshard'],
    bio: 'A Sleepless guardian who wears a human role beside Rysn until the Dawnshard secret forces honesty. Hordelings, guilt, and an ancient mandate to keep Change from becoming a weapon.',
  },
  nightblood: {
    wiki: 'Nightblood',
    see: ['vasher', 'shashara', 'type-iv', 'command'],
    bio: 'A Type IV BioChromatic entity in sword form, Commanded to destroy evil and permanently confused about the definition. It vaporizes what it judges, chatters like a child, and has changed hands from Vasher to Szeth without getting any better at philosophy.',
  },
  lopen: {
    wiki: 'Lopen',
    see: ['kaladin', 'bridge-four'],
    bio: 'A one-armed Herdazian on Bridge Four who collects cousins, nicknames and opinions. He grows the arm back with Stormlight, swears the Windrunner Ideals with the honorspren Rua, and never grows out of being Bridge Four\'s best morale officer.',
  },
  baon: {
    wiki: 'Baon',
    see: ['kenton', 'khriss', 'cynder', 'acron', 'seventeenth-shard'],
    bio: 'A Darkside soldier who guards Khriss on Dayside, sent by the Dynasty to judge whether sand masters threaten it. He reports that they do not, since sand needs Dayside\'s sun, takes his post with Khriss back, and on the voyage home passes the sand master\'s test with a massive release of power. Later he guards scholars across the Cosmere: one of the three Seventeenth Shard agents asking after Hoid on Roshar — loyalty as a profession.',
  },
  syl: {
    wiki: 'Sylphrena',
    see: ['kaladin'],
    bio: 'An honorspren, one of the Stormfather\'s first children, born in the Godforge, who defied Lasting Integrity to bond Kaladin. She dies when he breaks and returns when he remembers why he wanted to be good. In Wind and Truth she feels despair for the first time, and when the Stormfather is destroyed she stands with Kaladin as he takes Jezrien\'s place: the spren of a Herald.',
  },
  pattern: {
    wiki: 'Pattern',
    see: ['shallan'],
    bio: 'A Cryptic who loves lies that become true. He bonds Shallan knowing she killed the Cryptic before him, and keeps humming whenever the truth is about to hurt productively.',
  },
  ivory: {
    wiki: 'Ivory',
    see: ['jasnah'],
    bio: 'An inkspren who risked a human bond after the Recreance\'s betrayal. He matches Jasnah for precision and occasionally for disdain — a scholar\'s spren in every sense.',
  },
  stormfather: {
    wiki: 'Stormfather',
    see: ['dalinar', 'highstorm', 'honorspren'],
    bio: 'A spren of the highstorm, first made an avatar of Honor and later merged with a half-finished Cognitive Shadow of Tanavast, so that he carries Honor\'s memories. He made the modern honorspren, stopped after the Recreance, and then made ten more. He bonded Dalinar as a Bondsmith, and in Wind and Truth showed him Honor\'s history. On Stormfall, Retribution destroyed him.',
  },
  nightwatcher: {
    wiki: 'Nightwatcher',
    see: ['cultivation', 'old-magic', 'dalinar'],
    bio: 'Cultivation\'s spren of the Old Magic, dispenser of boons and curses in the Valley. She is younger than the Stormfather in personality, older in consequence, and not interested in making petitioners comfortable.',
  },
  sibling: {
    wiki: 'Sibling',
    see: ['navani', 'urithiru', 'towerlight', 'bondsmiths'],
    bio: 'The third Bondsmith spren, soul of Urithiru, child of Honor and Cultivation. Wounded by the Recreance\'s aftershocks and Raboniel\'s occupation, they bond Navani and relearn how to trust a human with the tower\'s veins. When Dalinar dies on Stormfall, the Sibling and Navani seal the tower in crystal that even a Shard cannot break, and both fall into a coma; inside, the fabrials still run.',
  },
  nale: {
    wiki: 'Nale',
    see: ['szeth', 'heralds', 'ishar', 'kaladin'],
    bio: 'Nalan\'Elin, Herald of Justice, born on Ashyn at his uncle Makibak\'s side. For a thousand years he hunted every Surgebinder outside his own Skybreakers, because Ishar told him the return of the Radiants would bring a Desolation. In Shinovar Kaladin broke through his rationalisations and he fell apart in horror at what he had become; his highspren left him. He helped Szeth and Kaladin reach Ishar, and on Stormfall he laid the Honorblades in the circle that remade the Oathpact.',
  },
  taln: {
    wiki: 'Talenel',
    see: ['heralds', 'oathpact', 'shalash'],
    bio: 'Talenelat\'Elin, Herald of War, and the tenth Herald: Nale put him forward when Hoid turned the place down. At Aharietiam he died holding a pass nobody could hold, and the other nine left him on Braize alone for four and a half thousand years. He came back broken, repeating his warning, and spent most of the True Desolation in other people\'s care. At Azimir, when Abidi the Monarch sent Fused to kill him and Ash, Taln stood up and Abidi fled; he died there, on a pile of the dead, with Ash beside him. In the reforged Oathpact his mind is somewhere the Fused cannot reach, and he has told Kaladin he forgives the others.',
  },
  ishar: {
    wiki: 'Ishar',
    see: ['heralds', 'nale', 'szeth'],
    bio: 'The Herald who Connected the others to Honor and bound the Oathpact. Long before, on Ashyn, Odium tricked him first into the experiments with the Surges that ruined that world. A thousand years before the True Desolation he took a fraction of the Well of Control and Connected himself to Shinovar like a god: he spoke in Shin heads as the Voice, groomed Szeth for decades to replace a Herald, drove the spren out of the land, and remade the Honorbearers as human Fused. On Stormfall Kaladin swore his Fifth Ideal to him and forced Odium\'s power out. Ishar then reforged the Oathpact, and made Kaladin a Herald.',
  },
  gavilar: {
    wiki: 'Gavilar_Kholin',
    see: ['dalinar', 'navani', 'szeth', 'elhokar'],
    bio: 'King of Alethkar, who unified the princedoms with Dalinar as his knife. In secret he was a Son of Honor, harvesting Voidlight with Vasher\'s help and working the Stormfather for the Words that would make him a Herald, meaning to give in on Braize and come back with every death. Szeth killed him on the night of the treaty. In Wind and Truth, Dalinar finally accepts that his brother was not the man he thought.',
  },
  sadeas: {
    wiki: 'Torol_Sadeas',
    see: ['dalinar', 'bridge-four', 'adolin'],
    bio: 'Alethi highprince of betrayal: bridge crews as disposable tools, plateaus as ledger columns. Adolin kills him in a corridor when politics finally fails to contain the man.',
  },
  evi: {
    wiki: 'Evi_Kholin',
    see: ['dalinar', 'adolin', 'renarin'],
    bio: 'Riran wife to Dalinar, mother to Adolin and Renarin, murdered in the burning of Rathalas. Cultivation takes Dalinar\'s memory of her; the return of that memory nearly breaks the Blackthorn cleanly in half.',
  },
  maya: {
    wiki: 'Mayalaran',
    see: ['adolin', 'deadeye', 'recreance'],
    bio: 'Mayalaran, a cultivationspren bonded to an Edgedancer before the Recreance, and Adolin\'s Shardblade ever since. His stubborn friendship drew her back toward personhood, and at Lasting Integrity she spoke for him. In Wind and Truth he can summon her again, and before the contest she crossed Shadesmar and came back to Azimir with thirty-seven deadeyes: the Blades and Plate of the Unoathed. Since Ba-Ado-Mishram was freed, the deadeyes have begun to heal.',
  },
  timbre: {
    wiki: 'Timbre',
    see: ['venli', 'lightspren', 'willshapers'],
    bio: 'A lightspren who slips past Odium\'s claim on Venli and builds a Willshaper bond in enemy territory. Small, bright, and politically enormous.',
  },
  telsin: {
    wiki: 'Telsin_Ladrian',
    see: ['wax', 'trell', 'the-set'],
    bio: 'Wax\'s sister, who stayed in the Village when he left, joined the Set as a young woman and brought their uncle in for his money. She faked her death with Edwarn and played the Set\'s captive to control her brother; at the Sovereign\'s temple she shot him three times and took MeLaan\'s spikes. As the Key she persuaded Autonomy to let her prove Scadrial could be conquered, and built Bilming to do it. When Harmony cut her Connection on the roof of the Shaw, Autonomy left her, and she died with "You have proven yourselves. For now." scratched into her own arm.',
  },
  blushweaver: {
    wiki: 'Blushweaver',
    see: ['lightsong', 'court-of-gods'],
    bio: 'Returned goddess of the Court who plays politics like a contact sport. She wants Lifeless Codes and a war; she gets intrigue, Lightsong\'s deflection, and a death that is not metaphorical.',
  },
  denth: {
    wiki: 'Denth',
    see: ['vasher', 'azure', 'nightblood'],
    bio: 'A Returned mercenary, and one of the Five Scholars, who smiles while steering Vivenna into the war Bluefingers is paying for. He took Vasher\'s side in the Manywar and has hated him since Vasher killed his sister Shashara with Nightblood. He is the better swordsman; Vasher wins their last duel with a trick.',
  },
  dilaf: {
    wiki: 'Dilaf',
    see: ['hrathen', 'dakhor', 'shu-dereth'],
    bio: 'Hrathen\'s zealous arteth in Kae — in truth the gragdet of Dakhor, his body remade to pass as Arelene. He hates Elantris because the woman he loved died despite Elantrian help. He leads the massacres in Kae and Teoras; Hrathen kills him, and dies of it.',
  },
  breeze: {
    wiki: 'Breeze',
    see: ['kelsier', 'ham', 'sazed', 'allomancy'],
    bio: 'A Soother who manipulates rooms the way other men rearrange furniture. High society manners, low society jobs, and a soft spot he pretends is tactical.',
  },
  ham: {
    wiki: 'Hammond',
    see: ['kelsier', 'breeze', 'pewterarm'],
    bio: 'A Thug who philosophises between pewter burns. Muscle for the crew, its conscience, and happier in a debate than a massacre.',
  },
  frost: {
    wiki: 'Frost',
    see: ['hoid', 'seventeenth-shard', 'yolen'],
    bio: 'Oldest dragon still corresponding with Hoid — mentor, critic, and Seventeenth Shard voice for non-intervention. He watches the Cosmere tilt toward war and still prefers letters to cataclysm. He raised his niece Starling after her parents died, taught her to feel for mortals, and let her apprentice herself to Hoid though he feared what Hoid attracts. Millennia earlier he reached Cakoban seconds too late in the Drominad subastral and buried him. By the space age he has been missing for years and most think him dead. Starling does not. In human form he is a pale man of about sixty with a long silver beard, in white and silver robes; like all greater dragons he spent his first thirty years in human form before his First Light.',
  },
  koravellium: {
    wiki: 'Koravellium_Avast',
    see: ['cultivation', 'taravangian', 'nightwatcher', 'honor'],
    bio: 'Dragon Vessel of Cultivation, a heretic on Yolen for refusing to be worshipped, who helped Shatter Adonalsium because she believes no one god can rule everyone. She and Tanavast loved each other, against his oaths. She prunes Dalinar\'s memories and gambles on Taravangian with a boon that makes him Odium; when he becomes Retribution she leaves Roshar, and her perpendicularity vanishes behind her. She prefers human form with mortals, and is immortal twice over: once by birth, once by Shard.',
  },
  xisis: {
    wiki: 'Xisisrefliel',
    see: ['tress', 'crow', 'xisis-palace', 'crimson-sea', 'spore-eater', 'riina'],
    bio: 'Xisis researches the seafloor under the spore seas — how the spores decompose, what that does to the seethe — and takes servants in trade for boons. Crow came to buy a cure with Tress. Tress offered Crow instead, argued that a servant who will never stop trying to leave is a bad buy, and won; she took three small boons for her friends. There is precisely one being on Lumar he fears, and it is the Sorceress.',
  },
  illistandrista: {
    wiki: 'Illistandrista',
    see: ['frost', 'hoid', 'dynamic-crew', 'xisis', 'dusk', 'emberdark'],
    bio: 'Leucistic in both forms: white scales and silver dragonsteel, or a pale young woman with white hair and eyes. Frost raised her on Yolen. At about seventy-five she defied her elders on a point of conscience, and they bound her powers with manacles that turn her own Investiture against her and exiled her until she learns her lesson — which is why Hoid took her as an apprentice and put her aboard the Dynamic as his lieutenant. When he left, Xisis took the ship and gave it to Crow; when Crow would not answer a distress call, Starling led the mutiny, then bargained the crew\'s future out of Xisis against finding the Drominad perpendicularity. Taken by the Malwish on the Dakwara\'s island, she let Dajer turn the Intensifier on her manacles, felt her wings come back, and held the manacles shut herself so the overload would black out the island and her crew could run. The ship is hers now and the crew are partners, and they have promised to get the manacles off. She believes her uncle is alive.',
  },
  hoid: {
    wiki: 'Hoid',
    see: ['frost', 'design', 'sigzil', 'dawnshard', 'yolen', 'seventeenth-shard'],
  },
};
