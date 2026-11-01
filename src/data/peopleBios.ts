import type { Character } from './types.ts';

/** Overlay bios / wiki / see for people who already sit in characters.ts. */
export const PEOPLE_BIOS: Record<string, Partial<Character>> = {
  vin: {
    wiki: 'Vin',
    see: ['elend', 'kelsier', 'preservation', 'lord-ruler', 'sazed'],
    bio: 'A half-skaa Mistborn raised by the crewleader Reen to trust no one, then taught by Kelsier to trust a crew. She kills the Lord Ruler, loves Elend, and briefly holds Preservation before giving her life so Ruin can die. The mists chose her; she still had to choose what to do with them.',
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
    see: ['wayne', 'steris', 'marasi', 'telsin', 'harmony'],
    bio: 'Twinborn lawman of the Roughs dragged back to Elendel as Lord Ladrian. Steelpushes and ironpulls define his fights; Steris and Wayne define his life. He spends Era 2 learning that Harmony\'s quiet is not the same as Harmony\'s help, and that family can be the Set.',
  },
  jasnah: {
    wiki: 'Jasnah_Kholin',
    see: ['ivory', 'shallan', 'dalinar', 'elsecallers'],
    bio: 'Alethkar\'s heretic scholar-queen, an Elsecaller who Soulcasts assassins into smoke and walks Shadesmar on purpose. She mentors Shallan, out-argues Vorinism, and treats monarchy as another research problem with lethal stakes. Softness is not her brand; competence is.',
  },
  kelsier: {
    wiki: 'Kelsier',
    see: ['ghostbloods', 'vin', 'marsh', 'preservation', 'bands-of-mourning'],
  },
  khriss: {
    wiki: 'Khrissalla',
    see: ['nazh', 'silverlight', 'taldain', 'sand-mastery'],
    bio: 'Duchess Khrissalla of Taldain, the Cosmere\'s foremost arcanist and the voice behind the Ars Arcanum essays. She studies Investiture the way generals study maps, sends Nazh to steal the footnotes, and knows more about your planet than your priests do.',
  },
  nazh: {
    wiki: 'Nazrilof',
    see: ['khriss', 'threnody', 'silverlight'],
    bio: 'Khriss\'s long-suffering Threnodite agent: map thief, annotator, and professional complainer. If a chart in your edition has dry sarcasm in the margins, that is Nazh earning his keep.',
  },
  galladon: {
    wiki: 'Galladon',
    see: ['raoden', 'elantris-city', 'seventeenth-shard'],
    bio: 'A Dula Elantrian who taught Raoden how to live in a broken city, then later walks Roshar under another name for the Seventeenth Shard. Dry humour, citrus obsession, and more Cosmere mileage than he admits.',
  },
  sigzil: {
    wiki: 'Sigzil',
    see: ['hoid', 'auxiliary', 'kaladin', 'night-brigade'],
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
    bio: 'Vivenna of Idris, who lost her betrothal, her hair dye, and her certainties, then gained Breath, a Shardblade that is not a spren, and the name Azure. She hunts Vasher across worlds with a soldier\'s pragmatism and a princess\'s unfinished business.',
  },
  demoux: {
    wiki: 'Demoux',
    see: ['kelsier', 'seventeenth-shard', 'sazed'],
    bio: 'An officer of Kelsier\'s rebellion who survives into Harmony\'s age and eventually into the Seventeenth Shard\'s quiet war. On Roshar he is one of the three who ask after Hoid; the Survivor\'s faith never entirely left him.',
  },
  lift: {
    wiki: 'Lift',
    see: ['wyndle', 'edgedancers', 'nightwatcher', 'dalinar'],
    bio: 'A Reshi thief who asked the Old Magic to stay the same and received a metabolism that turns food into Lifelight. Edgedancer Ideals, Wyndle\'s complaining vines, and a stubborn compassion for the people empires forget.',
  },
  szeth: {
    wiki: 'Szeth',
    see: ['nightblood', 'kaladin', 'ishar', 'shin-shamans', 'truthless'],
    bio: 'Szeth-son-Neturo: Truthless of Shinovar, the Assassin in White, Skybreaker. He went home with Kaladin to cleanse Shinovar and found that the Voice which had guided him since childhood was Ishar, and that the Honorbearers he had to beat included his own father and sister, remade as Ishar\'s Fused. He swore the Fifth Ideal and broke his bond with his highspren in the same breath, then freed them all with Nightblood; the sword ate his right arm. Ishar wanted him for a Herald. Kaladin took the place instead, and Szeth buried his body. Years on, he is married to the Shin historian who wrote the Knights of Wind and Truth down.',
  },
  sazed: {
    wiki: 'Sazed',
    see: ['harmony', 'vin', 'kelsier', 'keepers', 'tensoon'],
    bio: 'A Terris Keeper who catalogued dead religions, lost faith when Tindwyl died, and then remade Scadrial as Harmony. Two Shards in one Vessel leave him vast and often paralysed — the Hero of Ages who can rarely act without undoing himself.',
  },
  elend: {
    wiki: 'Elend_Venture',
    see: ['vin', 'sazed', 'house-venture'],
    bio: 'A scholarly heir who becomes emperor because someone has to read the books on how not to be his father. Mistborn by lerasium, idealist by temperament, he dies beside Vin holding a Koloss army and a philosophy that almost worked.',
  },
  marsh: {
    wiki: 'Marsh',
    see: ['kelsier', 'ruin', 'inquisitor', 'harmony'],
    bio: 'Kelsier\'s brother, turned Inquisitor against his will, then Ruin\'s favourite puppet. He murders a god on command and spends the next era as Ironeyes — Harmony\'s grim reminder that Hemalurgy does not easily let go.',
  },
  'lord-ruler': {
    wiki: 'Rashek',
    see: ['well', 'preservation', 'vin', 'final-empire'],
    bio: 'Rashek the Traveller, who murdered Alendi, took the Well, became the Lord Ruler, and crushed a planet into a thousand years of ash. Compounding made him unkillable until Vin found the flaw; history still walks in his footprints.',
  },
  tensoon: {
    wiki: 'TenSoon',
    see: ['vin', 'kandra', 'harmony', 'sazed'],
    bio: 'A Third Generation kandra of Potency who wears OreSeur\'s bones, a dog\'s body, and eventually the trust of gods. He breaks the First Contract for Vin and becomes Harmony\'s messenger when the world needs a spy who can be anyone.',
  },
  spook: {
    wiki: 'Spook',
    see: ['kelsier', 'sazed', 'vin'],
    bio: 'The crew\'s half-skaa Tineye who becomes Lord Mistborn after the Catacendre — pewter-burning, city-building, and briefly Ruin\'s whisper-toy. Elendel remembers him as founder; the crew remembered him as the boy who wanted to be useful.',
  },
  wayne: {
    wiki: 'Wayne',
    see: ['wax', 'marasi', 'harmonium'],
    bio: 'A Slider with a hat for every accent and a guilt for every grave. He speed-bubbles through Wax\'s disasters, loves Marasi without winning her, and dies buying Scadrial time with a bomb only he could place.',
  },
  marasi: {
    wiki: 'Marasi_Colms',
    see: ['wax', 'wayne', 'steris', 'malwish'],
    bio: 'Steris\'s illegitimate sister, constable, Pulser, and the scholar who actually finishes the political work Wax starts with bullets. She grows from admiring the Roughs into shaping Elendel\'s future — including a trip into the god-metal underbelly of the Cosmere.',
  },
  steris: {
    wiki: 'Steris_Harms',
    see: ['wax', 'marasi', 'house-ladrian'],
    bio: 'A woman who weaponises notebooks. Marriage to Wax begins as ledger-alliance and becomes the partnership that keeps House Ladrian solvent and alive; her contingency plans save as many lives as his Pushing.',
  },
  melaan: {
    wiki: 'MeLaan',
    see: ['tensoon', 'wax', 'kandra', 'wayne'],
    bio: 'A Sixth Generation kandra comfortable in any body and few boundaries. She spies for Harmony, flirts with disaster, and gives Wayne a goodbye that is pure MeLaan — honest, theatrical, and kind.',
  },
  dalinar: {
    wiki: 'Dalinar_Kholin',
    see: ['navani', 'stormfather', 'evi', 'adolin', 'honor'],
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
    see: ['dalinar', 'sibling', 'fabrial', 'gavilar'],
    bio: 'Gavilar\'s widow and Dalinar\'s wife, an artifabrian who turned grief into scholarship and scholarship into Towerlight. She bonded the Sibling and out-thought Raboniel. In Wind and Truth she walks Roshar\'s history with Dalinar in the Spiritual Realm, one of the few humans who can find its pure tones, and comes back believing she has Gavinor; Taravangian has left her a sleeping copy. When Dalinar dies she has the Sibling seal Urithiru in crystal against Retribution, and sleeps inside it.',
  },
  venli: {
    wiki: 'Venli',
    see: ['eshonai', 'listeners', 'thude'],
    bio: 'A listener scholar who bargained her people toward stormform, lost her sister to it, and then took a different spren entirely: a Willshaper, the Last Listener, Raboniel\'s Voice. In Wind and Truth she goes home to Narak and what is left of the listeners, with their new chasmfiend allies and Leshwi looking for a place outside Odium. Under the plateau she finds the Well of Control. When the contest begins the listeners hold Narak by treaty with Jasnah, and El withdraws. After Stormfall Retribution lets them take Warlight, and Venli tells her people they will take in anyone who will listen for peace.',
  },
  taravangian: {
    wiki: 'Taravangian',
    see: ['diagram', 'odium', 'retribution', 'cultivation'],
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
    see: ['kaladin', 'bridge-four', 'firemoss', 'windrunners'],
    bio: 'A firemoss addict who takes the First Ideal seriously enough to drag Bridge Four into Radiance with him. He dies in Urithiru buying Kaladin time — a sergeant\'s death, and a Windrunner\'s.',
  },
  rock: {
    wiki: 'Rock_(Roshar)',
    see: ['kaladin', 'bridge-four', 'horneaters'],
    bio: 'Numuhukumakiaki\'aialunamor — Horneater cook, bridgepuller, and the man who sees spren when others cannot. He feeds Bridge Four until the war asks him to kill, then goes home carrying scars stewardship cannot wash off.',
  },
  rysn: {
    wiki: 'Rysn_Ftori',
    see: ['dawnshard', 'chiri-chiri', 'nikli', 'command-change'],
    bio: 'Thaylen merchant who trades her legs, gains a larkin, and becomes the bearer of Change. The Sleepless guard her; the Dawnshard rewrites her so she cannot casually destroy life — a merchant\'s oath written into the spiritweb.',
  },
  eshonai: {
    wiki: 'Eshonai',
    see: ['venli', 'stormform', 'listener'],
    bio: 'Listener Shardbearer and general who wanted exploration more than war, then became stormform\'s first tragedy. Her death is the Everstorm\'s birth-cry; her sister inherits both the guilt and the chance to choose differently.',
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
    see: ['painter', 'yoki-hijo', 'father-machine'],
    bio: 'A yoki-hijo stacked into sainthood by ritual until a machine\'s lie and a painter\'s honesty unmake the shroud. She and Painter share bodies, nightmares, and a love story that has to survive the end of her world\'s favourite story about her.',
  },
  painter: {
    wiki: 'Nikaro',
    see: ['yumi', 'bamboo-painting', 'hion'],
    bio: 'Nikaro of Kilahito — nightmare painter, professional fraud, and the ordinary man Yumi\'s miracle lands on. He learns to tell the truth with a bamboo pen and to stack stones when stacking souls is required.',
  },
  tress: {
    wiki: 'Tress',
    see: ['charlie', 'hoid', 'xisis', 'verdant'],
    bio: 'A sprouter\'s daughter who sails spore seas to rescue her love and accidentally becomes the kind of captain pirates negotiate with. Practical, soft-hearted, and terrifying once she understands the spores.',
  },
  charlie: {
    wiki: 'Charlie',
    see: ['tress', 'hoid', 'riina'],
    bio: 'A duke\'s son cursed into a rat and a foil for Hoid\'s storytelling. He is the reason Tress leaves the Rock — and the proof that curses are just another kind of unfinished negotiation.',
  },
  shai: {
    wiki: 'Wan_ShaiLu',
    see: ['forgery', 'rose-empire', 'essence-mark'],
    bio: 'A Forger who rewrites objects — and herself — with stamps and research. Imprisoned to restore an emperor\'s soul, she walks out having forged a life the court cannot quite revoke.',
  },
  silence: {
    wiki: 'Silence_Montane',
    see: ['william-ann', 'shade', 'simple-rules'],
    bio: 'A Forests innkeeper who harvests shades with silver and silence. She keeps her daughter alive through debt, lies, and the Simple Rules — a horror story told from the hunter\'s side of the counter.',
  },
  dusk: {
    wiki: 'Sixth_of_the_Dusk',
    see: ['vathi', 'aviar', 'patji-eye'],
    bio: 'A trapper of the Pantheon islands who trusts Aviar more than people. Vathi and the ones above force him to decide whether First of the Sun stays isolated or joins a Cosmere that has already noticed Patji.',
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
    see: ['ghostbloods', 'elend', 'scadrial'],
    bio: 'A worldhopper who spied for Elend Venture and later turns up in Ghostblood circles. Longevity, bland competence, and a reminder that Scadrial\'s agents got off-world somehow.',
  },
  design: {
    wiki: 'Design',
    see: ['hoid', 'cryptic', 'yolen'],
    bio: 'Hoid\'s Cryptic on Roshar — dry, curious, and unimpressed by her bondmate\'s theatrics. She is proof he finally entered a Nahel bond, with all the oath-shaped complications that implies.',
  },
  riina: {
    wiki: 'Riina',
    see: ['the-ire', 'tress', 'hoid'],
    bio: 'An Ire sorceress who curses Charlie and underestimates a sprouter. Elantrian tools, Cognitive Realm politics, and a grudging exit when Tress and Hoid ruin her afternoon.',
  },
  nikli: {
    wiki: 'Nikli',
    see: ['rysn', 'sleepless', 'dawnshard'],
    bio: 'A Sleepless guardian who wears a human role beside Rysn until the Dawnshard secret forces honesty. Hordelings, guilt, and an ancient mandate to keep Change from becoming a weapon.',
  },
  nightblood: {
    wiki: 'Nightblood_(Roshar)',
    see: ['vasher', 'szeth', 'type-iv', 'command'],
    bio: 'A Type IV BioChromatic entity in sword form, Commanded to destroy evil and permanently confused about the definition. It vaporizes what it judges, chatters like a child, and has changed hands from Vasher to Szeth without getting any better at philosophy.',
  },
  lopen: {
    wiki: 'Lopen',
    see: ['kaladin', 'bridge-four', 'windrunners'],
    bio: 'Herazanian one-armed Windrunner who collects cousins, nicknames, and the Second Ideal with equal enthusiasm. He grows the arm back and never grows out of being Bridge Four\'s best morale officer.',
  },
  baon: {
    wiki: 'Baon',
    see: ['kenton', 'khriss', 'seventeenth-shard'],
    bio: 'A Darksider warrior who guards scholars across Taldain and later across the Cosmere. One of the three Seventeenth Shard agents asking after Hoid on Roshar — loyalty as a profession.',
  },
  syl: {
    wiki: 'Sylphrena',
    see: ['kaladin', 'honorspren', 'windrunners'],
    bio: 'An honorspren who defied Lasting Integrity to bond Kaladin. She dies when he breaks, returns when he remembers why he wanted to be good, and remains the wind\'s opinion about what honour is for.',
  },
  pattern: {
    wiki: 'Pattern',
    see: ['shallan', 'cryptic', 'lightweavers'],
    bio: 'A Cryptic who loves lies that become true. He bonds Shallan knowing she killed the Cryptic before him, and keeps humming whenever the truth is about to hurt productively.',
  },
  ivory: {
    wiki: 'Ivory',
    see: ['jasnah', 'inkspren', 'elsecallers'],
    bio: 'An inkspren who risked a human bond after the Recreance\'s betrayal. He matches Jasnah for precision and occasionally for disdain — a scholar\'s spren in every sense.',
  },
  stormfather: {
    wiki: 'Stormfather',
    see: ['dalinar', 'highstorm', 'honorspren'],
    bio: 'A spren of the highstorm, first made an avatar of Honor and later merged with a half-finished Cognitive Shadow of Tanavast, so that he carries Honor\'s memories. He made the modern honorspren, stopped after the Recreance, and then made ten more. He bonded Dalinar as a Bondsmith, and in Wind and Truth showed him Honor\'s history. On Stormfall, Retribution destroyed him.',
  },
  nightwatcher: {
    wiki: 'Nightwatcher',
    see: ['cultivation', 'old-magic', 'dalinar', 'lift'],
    bio: 'Cultivation\'s spren of the Old Magic, dispenser of boons and curses in the Valley. She is younger than the Stormfather in personality, older in consequence, and not interested in making petitioners comfortable.',
  },
  sibling: {
    wiki: 'Sibling',
    see: ['navani', 'urithiru', 'towerlight', 'bondsmiths'],
    bio: 'The third Bondsmith spren, soul of Urithiru, child of Honor and Cultivation. Wounded by the Recreance\'s aftershocks and Raboniel\'s occupation, they bond Navani and relearn how to trust a human with the tower\'s veins. When Dalinar dies on Stormfall, the Sibling and Navani seal the tower in crystal that even a Shard cannot break, and both fall into a coma; inside, the fabrials still run.',
  },
  nale: {
    wiki: 'Nale',
    see: ['szeth', 'skybreakers', 'heralds', 'ishar', 'kaladin'],
    bio: 'Nalan\'Elin, Herald of Justice, born on Ashyn at his uncle Makibak\'s side. For a thousand years he hunted every Surgebinder outside his own Skybreakers, because Ishar told him the return of the Radiants would bring a Desolation. In Shinovar Kaladin broke through his rationalisations and he fell apart in horror at what he had become; his highspren left him. He helped Szeth and Kaladin reach Ishar, and on Stormfall he laid the Honorblades in the circle that remade the Oathpact.',
  },
  taln: {
    wiki: 'Talenel',
    see: ['heralds', 'oathpact', 'shalash'],
    bio: 'Talenelat\'Elin, Herald of War, and the tenth Herald: Nale put him forward when Hoid turned the place down. At Aharietiam he died holding a pass nobody could hold, and the other nine left him on Braize alone for four and a half thousand years. He came back broken, repeating his warning, and spent most of the True Desolation in other people\'s care. At Azimir, when Abidi the Monarch sent Fused to kill him and Ash, Taln stood up and Abidi fled; he died there, on a pile of the dead, with Ash beside him. In the reforged Oathpact his mind is somewhere the Fused cannot reach, and he has told Kaladin he forgives the others.',
  },
  ishar: {
    wiki: 'Ishar',
    see: ['heralds', 'bondsmiths', 'nale', 'szeth'],
    bio: 'The Herald who Connected the others to Honor and bound the Oathpact. Long before, on Ashyn, Odium tricked him first into the experiments with the Surges that ruined that world. A thousand years before the True Desolation he took a fraction of the Well of Control and Connected himself to Shinovar like a god: he spoke in Shin heads as the Voice, groomed Szeth for decades to replace a Herald, drove the spren out of the land, and remade the Honorbearers as human Fused. On Stormfall Kaladin swore his Fifth Ideal to him and forced Odium\'s power out. Ishar then reforged the Oathpact, and made Kaladin a Herald.',
  },
  gavilar: {
    wiki: 'Gavilar_Kholin',
    see: ['dalinar', 'navani', 'sons-of-honor', 'szeth'],
    bio: 'King of Alethkar who unified a kingdom and secretly chased immortality through Voidlight and old oaths. Szeth kills him on the night he would have made the wrong kind of history — and still almost did.',
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
    bio: 'Wax\'s sister and a high operative of the Set under Trell\'s influence. Ambition plus Autonomy\'s religion turns family into opposing command structures; their reunion is a firefight.',
  },
  blushweaver: {
    wiki: 'Blushweaver',
    see: ['lightsong', 'court-of-gods'],
    bio: 'Returned goddess of the Court who plays politics like a contact sport. She wants Lifeless Codes and a war; she gets intrigue, Lightsong\'s deflection, and a death that is not metaphorical.',
  },
  denth: {
    wiki: 'Denth',
    see: ['vasher', 'azure', 'nightblood'],
    bio: 'A Returned mercenary who smiles while steering Vivenna into catastrophe. Old comrade to Vasher, on the other side of the Manywar\'s leftovers — until the smile cracks.',
  },
  dilaf: {
    wiki: 'Dilaf',
    see: ['hrathen', 'dakhor', 'shu-dereth'],
    bio: 'A Dakhor gragdet wearing the mask of an Arelene priest. Hatred of Elantris outruns even Wyrn\'s strategy; Hrathen dies stopping him.',
  },
  breeze: {
    wiki: 'Breeze',
    see: ['kelsier', 'ham', 'sazed', 'allomancy'],
    bio: 'A Soother who manipulates rooms the way other men rearrange furniture. High society manners, low society jobs, and a soft spot he pretends is tactical.',
  },
  ham: {
    wiki: 'Hammond',
    see: ['kelsier', 'breeze', 'pewterarm'],
    bio: 'A Thug who philosophises between pewter burns. Muscle for the crew, conscience in plate armour, happier in a debate than a massacre.',
  },
  frost: {
    wiki: 'Frost',
    see: ['hoid', 'seventeenth-shard', 'illistandrista', 'yolen'],
    bio: 'Oldest dragon still corresponding with Hoid — mentor, critic, and Seventeenth Shard voice for non-intervention. He raises Starling, watches the Cosmere tilt toward war, and still prefers letters to cataclysm.',
  },
  koravellium: {
    wiki: 'Koravellium_Avast',
    see: ['cultivation', 'taravangian', 'nightwatcher', 'honor'],
    bio: 'Dragon Vessel of Cultivation, a heretic on Yolen for refusing to be worshipped, who helped Shatter Adonalsium because she believes no one god can rule everyone. She and Tanavast loved each other, against his oaths. She prunes Dalinar\'s memories and gambles on Taravangian with a boon that makes him Odium; when he becomes Retribution she leaves Roshar, and her perpendicularity vanishes behind her.',
  },
  xisis: {
    wiki: 'Xisisrefliel',
    see: ['tress', 'crimson-spore', 'lumar-world', 'aether'],
    bio: 'A dragon under Lumar\'s Crimson Sea, trading favours for servants and studying aethers with proprietary calm. Tress bargains with him; Hoid would rather not.',
  },
  illistandrista: {
    wiki: 'Illistandrista',
    see: ['frost', 'hoid', 'emberdark'],
    bio: 'Starling — Frost\'s niece, Hoid\'s apprentice, captain into the Emberdark. Young for a dragon, cuffed into human form, looking for a perpendicularity and for family the Cosmere has misplaced.',
  },
  hoid: {
    wiki: 'Hoid',
    see: ['frost', 'design', 'sigzil', 'dawnshard', 'yolen', 'seventeenth-shard'],
  },
};
