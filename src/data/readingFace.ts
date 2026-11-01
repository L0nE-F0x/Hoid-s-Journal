/**
 * What the card is allowed to say before the book that earns the rest.
 *
 * The published fact, bio, aliases and abilities stay on the character.
 * `early` replaces them until the first `step` the reader has reached. Each
 * step is a whole face, and the last step is the published card, so a fully
 * read journal is unchanged. A step's `book` can be a later series than the
 * person's own — Thaidakar is not a Mistborn fact.
 */
export interface FaceText {
  fact?: string;
  bio?: string;
  aliases?: string;
  abilities?: string;
}

export interface FaceStep extends FaceText {
  book: string;
  arc: string;
  /** From this arc on, show the published card and ignore the fields here. */
  published?: boolean;
}

export interface ReadingFace {
  early: FaceText;
  steps: FaceStep[];
}

export const READING_FACES: Record<string, ReadingFace> = {
  kaladin: {
    early: {
      fact: 'A surgeon\'s son sold to a bridge crew on the Shattered Plains.',
      abilities: 'Spear, field surgery',
      aliases: 'Kal',
      bio: 'Darkeyed son of a surgeon in Hearthstone, enslaved to Bridge Four. He is trying to keep the men on his bridge alive.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Bridge Four\'s captain, and a Windrunner.',
        abilities: 'Windrunner Radiant',
        aliases: 'Stormblessed',
        bio: 'A darkeyed surgeon\'s son who becomes a slave, a bridgeman, and the first Windrunner of the new Radiance. Syl chose him. Bridge Four is why he is still standing.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  shallan: {
    early: {
      fact: 'A bright scholar travelling to become Jasnah\'s ward.',
      abilities: 'Scholarship, drawing',
      aliases: 'Shallan Davar',
      bio: 'A Veden girl with a sketchbook and a scholarship she cannot afford to lose. She draws what she sees, and she is careful about what she remembers.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'A Lightweaver, still deciding which of her faces is the real one.',
        abilities: 'Lightweaver Radiant',
        aliases: 'Veil, Radiant',
        bio: 'Jasnah\'s ward, then a Lightweaver. Veil and Radiant are the names she uses when Shallan is not enough.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  dalinar: {
    early: {
      fact: 'Highprince of Kholin, called the Blackthorn, trying to be better than the name.',
      abilities: 'Shardbearer',
      aliases: 'Blackthorn',
      bio: 'Alethkar\'s most feared highprince, now following the codes he wrote down and cannot always keep. The warcamps know the Blackthorn. He is trying to be someone else.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Highprince, and a Bondsmith.',
        abilities: 'Bondsmith Radiant',
        aliases: 'Blackthorn, Bondsmith',
        bio: 'The Blackthorn, who spent a life being the knife and then tried to put it down. He bonds the Stormfather on the Shattered Plains.',
      },
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'Bondsmith, refounder of the Radiants, and the man who refused Odium at Thaylen Field.',
        abilities: 'Bondsmith Radiant',
        aliases: 'Blackthorn, Bondsmith',
        bio: 'The Blackthorn who burned the Rift and asked the Nightwatcher to take the pain of it; she took his memory of Evi. It comes back. At Thaylen Field he takes responsibility for what he did instead of letting Odium have it, opens Honor\'s perpendicularity, and unites the Radiants he has refounded.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'Bondsmith, and Honor\'s champion in a contest with Odium.',
        abilities: 'Bondsmith Radiant',
        aliases: 'Blackthorn, Bondsmith',
        bio: 'The Blackthorn turned Bondsmith, learning what his bond can do: he moves Urithiru across Shadesmar, opens perpendicularities, and faces Ishar. At the end of Rhythm of War he signs a contract with Odium. In ten days, a contest of champions.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  jasnah: {
    early: {
      fact: 'A heretic scholar the Alethi court would rather not argue with.',
      abilities: 'Scholar',
      aliases: 'Heretic',
      bio: 'Gavilar\'s daughter and a scholar who says the Vorin church is wrong out loud. Shallan comes to Kharbranth to be her ward.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  navani: {
    early: {
      fact: 'Gavilar\'s widow, an artifabrian the court pretends not to need.',
      abilities: 'Artifabrian',
      aliases: 'Navani',
      bio: 'The king\'s widow, designing fabrials the ardents call improper and the armies quietly use.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', bio: 'Artifabrian queen who turns grief into scholarship and scholarship into Towerlight. She bonds the Sibling, outmanoeuvres Raboniel in the weaponisation of anti-Light, and proves that engineering is a Radiant Calling.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  taravangian: {
    early: {
      fact: 'King of Kharbranth: a kindly old man with a hospital.',
      abilities: 'King of Kharbranth',
      aliases: 'Taravangian',
      bio: 'The elderly king of Kharbranth, who keeps free hospitals for the sick and dying and is thought kind and a little slow. He is also, though nobody knows it, the master who holds Szeth\'s Oathstone.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'King of Kharbranth. A hospital, a Diagram, and a mind that will not hold still.',
        abilities: 'The Diagram',
        aliases: 'Vargo',
        bio: 'King of Kharbranth, who keeps a hospital of the dying and writes down what they say. On his brilliant days he is the most frightening man in Roshar. On the others he weeps, and means it.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'The king of Kharbranth who killed a god and took his place.',
        abilities: 'The Diagram · Vessel of Odium',
        aliases: 'Vargo, Odium',
        bio: 'King of Kharbranth and author of the Diagram, which he wrote on the one day he woke brilliant. He betrayed Dalinar\'s coalition, and at the end of Rhythm of War killed Rayse with Nightblood and took up Odium himself: the ascension Cultivation\'s boon had arranged.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  moash: {
    early: {
      fact: 'Bridge Four. He wants the king who sold them to answer for it.',
      abilities: 'Spear',
      aliases: 'Moash',
      bio: 'One of Kaladin\'s bridge crew, and the one whose grievance has a name and a throne attached to it.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  jezrien: {
    early: {
      fact: 'King of Heralds who abandoned the Oathpact and left Taln alone on Braize.',
      abilities: 'Herald · Windrunner patron · Surgebinding (Adhesion, Gravitation)',
      aliases: 'Jezerezeh, Yaezir, Herald of Kings, Kadasix of Kings',
      bio: 'Herald of Kings and patron of the Windrunners. After Aharietiam he walked away from the Oathpact with the others, leaving Taln to hold Braize alone.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  // Wind and Truth rewrote the Shinovar cast. Each face stops at the book
  // that earns the next sentence; the published card is the whole story.
  szeth: {
    early: {
      fact: 'The Assassin in White: a Shin Truthless who kills for whoever holds his Oathstone.',
      abilities: 'Windrunner Honorblade',
      aliases: 'Szeth-son-son-Vallano, Truthless, the Assassin in White',
      bio: 'A Shin exile made Truthless, bound to obey whoever holds his Oathstone. With an Honorblade that lets him Lash himself across a room, he killed King Gavilar on the night of the treaty, and he goes on killing for each new master. He believes his people named him Truthless for a reason.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Truthless no longer, and dead once. Nale brought him back with a black sword.',
        abilities: 'Nightblood',
        aliases: 'Szeth-son-son-Vallano, Truthless, the Assassin in White',
        bio: 'The Assassin in White, who killed King Gavilar and went on to kill rulers across Roshar for a master he would not name. Kaladin killed him in the sky over the Shattered Plains. Nale brought him back, handed him a sentient black sword, and offered him a law to follow instead of a stone.',
      },
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'A Skybreaker sworn to follow the will of Dalinar Kholin, and then to cleanse Shinovar.',
        abilities: 'Skybreaker Radiant, Nightblood',
        aliases: 'Szeth-son-son-Vallano, the Assassin in White',
        bio: 'The Assassin in White, revived by Nale and carrying Nightblood. He joined the Skybreakers, and at Thaylen Field chose to follow Dalinar, the man he had once tried to kill. His Third Ideal binds him to Dalinar\'s will; his Fourth, he says, will be to cleanse the Shin of the false leaders who made him Truthless.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  ishar: {
    early: {
      fact: 'One of the ten Heralds of the Almighty, and one of the nine who walked away.',
      abilities: 'Herald · Honorblade',
      aliases: 'Ishar',
      bio: 'One of the ten Heralds who held back the Desolations, and one of the nine who left their Blades in the stone at Aharietiam and left Taln to hold alone.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'Tezim, the god-priest conquering Tukar, is Ishar, and he is mad.',
        abilities: 'Herald · patron of the Bondsmiths',
        aliases: 'Tezim, Ishi\'Elin',
        bio: 'Herald of the Bondsmiths. In the present day he rules Tukar as Tezim, a god-priest at war with Emul over Sesemalex Dar. The Stormfather says he curses him at night even as he names himself a god, and that he seeks death: his own, perhaps everyone\'s. Nale still trusts him above every other Herald.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'The mad Herald of Tukar, who nearly took Dalinar\'s bond to the Stormfather.',
        abilities: 'Herald · Bondsmith Honorblade',
        aliases: 'Tezim, Ishi\'Elin, Herald of Luck',
        bio: 'Herald of the Bondsmiths, ruling Tukar as Tezim. He has been dragging Radiant spren into the Physical Realm to see how long they last, and cutting them open when they do not. When Dalinar comes for him, he pins five Windrunners to the ground and drains them, opens Honor\'s Perpendicularity, and almost takes Dalinar\'s bond and his place in the contest, until Szeth cuts the Connection with Nightblood. He wants to join the Shards and be the Almighty reborn.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  nale: {
    early: {
      fact: 'Nalan, Herald of Justice: one of the nine who walked away at Aharietiam.',
      abilities: 'Herald · Honorblade',
      aliases: 'Nalan\'Elin, Nale',
      bio: 'One of the ten Heralds who held back the Desolations, and one of the nine who left their Blades in the stone at Aharietiam.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'A Herald who never stopped working. He brings Szeth back from the dead.',
        abilities: 'Herald · Honorblade',
        aliases: 'Nin, Nalan\'Elin, Herald of Justice',
        bio: 'Nalan, Herald of Justice. Unlike the others he is still at work in the world, and it is the work of a judge without mercy. As Nin he brings Szeth back from the dead, hands him a black sword, and offers him the law.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  adolin: {
    early: {
      fact: 'Dalinar\'s elder son: a Shardbearer, a duelist, and the most eligible man in the warcamps.',
      abilities: 'Shardbearer, duelist',
      aliases: 'Adolin',
      bio: 'Highprince Dalinar\'s heir, a Shardbearer and a brilliant duelist who would rather be at a dance than in a war council. He loves his father, worries about his visions, and goes through courtships faster than spheres.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Dalinar\'s heir, duelling his father\'s rivals out of their Shards.',
        abilities: 'Shardbearer, duelist',
        aliases: 'Adolin',
        bio: 'Highprince Dalinar\'s heir. He duels to strip Shards from the men who would not follow his father, and survives a four-on-one stacked against him because a bridgeman jumps into the ring. He is causally betrothed to Shallan Davar, and in Urithiru he kills Torol Sadeas in a corridor when Sadeas finally says too much.',
      },
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'The best swordsman in Alethkar, and a better man than he believes.',
        abilities: 'Shardbearer',
        aliases: 'Adolin',
        bio: 'Dalinar\'s heir and the best duelist in Alethkar. He marries Shallan in Urithiru, kills Torol Sadeas in a corridor when Sadeas finally says too much, and fights his way through occupied Kholinar and out across Shadesmar. His Shardblade is a dead spren, Maya, and she has begun to answer him.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  maya: {
    early: {
      fact: 'Adolin\'s Shardblade, who is not as dead as the Recreance promised.',
      abilities: 'Deadeye cultivationspren',
      aliases: 'Maya',
      bio: 'Adolin\'s Shardblade is a dead spren: in Shadesmar a deadeye with scratched-out eyes, who follows him like a soldier. He talks to his sword. She seems to listen.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'row',
        bio: 'A cultivationspren deadeye who relearns personhood through Adolin\'s stubborn friendship. She speaks at Lasting Integrity and cracks the thesis that a broken oath ends a spren forever.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  yanagawn: {
    early: {
      fact: 'Gawx the thief, who woke up Prime Aqasix of Azir.',
      abilities: 'Prime Aqasix',
      aliases: 'Gawx, Prime Aqasix Yanagawn the First',
      bio: 'A street thief who broke into the palace with his uncle and Lift on the night Azir was choosing a new Prime, after the last two had been murdered in a single week. One of Darkness\'s attendants struck him down; Lift brought him back, the viziers called it a miracle and crowned him, and his first act was to pardon her.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  colot: {
    early: {
      fact: 'Captain of archers in the Kholin Fifth Battalion, and a lighteyed Windrunner squire.',
      abilities: 'Archer captain · Windrunner squire',
      aliases: 'Captain Colot',
      bio: 'A lanky lighteyes with red in his hair, captain of the archer battalion that helped Bridge Four scout Urithiru. Kaladin did not want lighteyed squires; Skar vouched for Colot anyway, and he took the tryout without complaint and learned to breathe Stormlight with Bridge Four.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  'may-aladar': {
    early: {
      fact: 'Highprince Aladar\'s only known child.',
      abilities: 'Lighteyed noblewoman',
      aliases: 'May',
      bio: 'Highprince Aladar\'s only known child: short, round-faced, with cropped curly black hair.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  taln: {
    early: {
      fact: 'He held Braize alone for four thousand years. Then he broke, and did not.',
      abilities: 'Herald of War',
      aliases: 'Talenelat, Stonesinew',
      bio: 'Herald of War who held Braize alone for four thousand years after the others broke. He returns mad, loyal, and still trying to warn a world that has turned his agony into scripture.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  shalash: {
    early: {
      fact: 'Herald of Beauty, who destroys every depiction of herself she can find.',
      bio: 'Herald of Beauty and patron of the Lightweavers. Shame over abandoning the Oathpact drives her across Roshar with hired help, breaking into palaces to deface or destroy every image of herself she can find. She does not want the job to be easy.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'oathbringer',
        bio: 'Herald of Beauty and patron of the Lightweavers. Shame over abandoning the Oathpact drives her to destroy her own images across Roshar. Then a painting lures her to Thaylen City, where she finds Taln, the man the nine left behind, and she stays at his side: apologising, and dismayed that he does not hate her.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Bridge Four and the court: The Way of Kings knows them as bridgemen and
  // highprinces. What they become waits for the book that says so.
  skar: {
    early: {
      fact: 'Short, stubborn Bridge Four spearman; Kaladin calls him a killer.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'A wiry former rocksplitter who wanted to be one of Aladar\'s Blackcaps and ended up on Sadeas\'s bridges. He takes to Kaladin\'s spear training instinctively, and becomes one of the men the crew follows.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Bridge Four\'s lieutenant: short, stubborn, and the first to call himself Bridge Four instead of Cobalt Guard.',
        abilities: 'Bridge Four lieutenant',
        bio: 'A wiry former rocksplitter, made lieutenant when Bridge Four becomes Dalinar\'s guard; he is the first to tear off the Cobalt Guard patch and insist they are Bridge Four. At Narak he holds Adolin back from a chasm by his Plate\'s skirt. After the Everstorm he is one of the few of them who cannot draw in Stormlight.',
      },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  drehy: {
    early: {
      fact: 'Quiet Bridge Four spearman; the one you send when it must work.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'Soft-spoken and deadly reliable, one of Bridge Four\'s original bridgemen under Gaz and Sadeas.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  hobber: {
    early: {
      fact: 'The first Bridge Four man Kaladin saved from a wound that should have killed him.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'Wounded early, while Bridge Four were still dying on every run. Kaladin nursed him back with field surgery and stolen antiseptic, and Hobber limped out: the first of them to believe in Kaladin.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        abilities: 'Bridgeman · Bridge Four',
        bio: 'The first of Bridge Four to believe in Kaladin, nursed back from a wound that should have killed him. Then the Assassin in White cut him down in the palace and left his legs grey and dead, and he served Bridge Four from a stump in Rock\'s kitchen.',
      },
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  leyten: {
    early: {
      fact: 'Bridge Four\'s armour and kit man.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'Thick-bodied, curly-haired and neat, the bridgeman who looks after the crew\'s gear.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  peet: {
    early: {
      fact: 'Bridge Four spearman; a steady hand, fewer jokes than Lopen.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'One of the core Bridge Four survivors under Kaladin. He shares the crew\'s scars and its stubborn refusal to leave people behind.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  bisig: {
    early: {
      fact: 'Bridge Four spearman.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'Another of Kaladin\'s original bridge crew. Less famous than Rock or Lopen, no less Bridge Four.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  gaz: {
    early: {
      fact: 'One-eyed bridge sergeant, debt-ridden and cruel from fear.',
      abilities: 'Bridge sergeant',
      bio: 'Sadeas\'s bridge sergeant, one-eyed, in debt, and cruel out of fear. He takes bribes, keeps Bridge Four on the worst duty, and does what he is told, until Kaladin\'s crew stops dying on schedule.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'One-eyed bridge sergeant who deserted, and fell in with Shallan.',
        abilities: 'Deserter · one of Shallan\'s men',
        bio: 'Sadeas\'s one-eyed bridge sergeant, who deserted after the Tower and turned up among the men Shallan collected on the road. She gave his debts a way out.',
      },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  vathah: {
    early: {
      fact: 'Leads the deserters Shallan recruits on the road.',
      abilities: 'Deserter captain',
      bio: 'Captain of the deserters Shallan hires on the Frostlands road with stolen authority and a speech. Skepticism, slowly sanded down.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  elhokar: {
    early: {
      fact: 'Gavilar\'s son and heir, King of Alethkar, sure that someone is trying to kill him.',
      abilities: 'King of Alethkar · Shardbearer',
      bio: 'King of Alethkar since his father\'s murder: paranoid, theatrical, and less foolish than his court assumes. He leaves the war to his highprinces and is convinced someone wants him dead.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  lirin: {
    early: {
      bio: 'Darkeyed surgeon of Hearthstone. He teaches Kaladin to heal, clashes with him over violence, and refuses the spear because saving lives is the only argument he trusts.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  amaram: {
    early: {
      fact: 'The hero of the darkeyes, who stole Kaladin\'s Shards and branded him a slave.',
      abilities: 'Highmarshal · Shardbearer',
      bio: 'Highmarshal Amaram, a lighteyed general and a hero to the darkeyes. When Kaladin killed a Shardbearer to save him, Amaram murdered Kaladin\'s squad, took the Shards for himself, and had Kaladin branded and sold.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        abilities: 'Highmarshal · Shardbearer · Sons of Honor',
        bio: 'Highmarshal Amaram, hero of the darkeyes, who murdered Kaladin\'s squad to take the Shards Kaladin won. He serves Sadeas in the open and the Sons of Honor in secret: he wants the Heralds back, and he will start a Desolation to do it.',
      },
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  ruthar: {
    early: {
      fact: 'Conservative highprince of the warcamps, opposed to Dalinar.',
      bio: 'Highprince of a martial Alethi faction, opposed to Dalinar\'s changes and comfortable saying so.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  roion: {
    early: {
      fact: 'A cautious, worried highprince of the warcamps.',
      bio: 'One of the ten highprinces of the War of Reckoning: cautious, worried, and slow to commit, more interested in surviving the plateau runs than winning them.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  vstim: {
    early: {
      bio: 'Veteran Thaylen trader who takes Rysn as his apprentice, his babsk, and teaches her to see people as more than ledgers.',
    },
    steps: [
      { book: 'stormlight', arc: 'dawnshard', published: true },
    ],
  },
  yalb: {
    early: {
      fact: 'Friendly Thaylen sailor on the Wind\'s Pleasure.',
      bio: 'Sailor aboard Tozbek\'s Wind\'s Pleasure, who teaches Shallan shipboard ease and flirts with her for the crew\'s amusement.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  tozbek: {
    early: {
      fact: 'Thaylen captain of the Wind\'s Pleasure.',
      bio: 'Thaylen captain of the Wind\'s Pleasure, contracted to carry Jasnah and her ward.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  notum: {
    early: {
      fact: 'Honorspren captain who imprisons Syl\'s Radiants, then lets them go.',
      abilities: 'Honorspren · ship captain',
      bio: 'Captain of the honorspren ship Honor\'s Path. At Celebrant he takes Syl and her Radiants aboard and locks them in; after hours spent outrunning the Fused he lets them go, though it puts his crew at risk.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'row',
        abilities: 'Honorspren · ship captain',
        fact: 'Honorspren captain who let Syl go, and then defended Adolin.',
        bio: 'Captain of the honorspren ship Honor\'s Path. He let Syl and her Radiants go at Celebrant and was exiled for it, to patrol near Lasting Integrity. When Adolin saved his life he threw away his prepared speech and defended Adolin at his trial.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  ialai: {
    early: {
      fact: 'Torol Sadeas\'s wife, and the sharper of the two.',
      bio: 'Wife of Highprince Torol Sadeas: short, green-eyed, a reported touch of foreign blood under hair dyed black to look wholly Alethi, and always measuring the room for weaknesses.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Torol\'s widow; keeps the Sadeas knives sharp after his death.',
        bio: 'Torol Sadeas\'s wife and the keener politician of the pair, with the best network of spies and assassins in the warcamps. Adolin killed her husband in Urithiru. She has not forgiven it.',
      },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  aladar: {
    early: {
      abilities: 'Alethi highprince',
      fact: 'One of the ten highprinces of the War of Reckoning.',
      bio: 'Highprince of one of Alethkar\'s princedoms, cautious and calculating, weighing Dalinar\'s talk of unity against the gemhearts on the plateaus.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  teleb: {
    early: {
      bio: 'Loyal Kholin officer and Shardbearer, one of the professional spine around Dalinar in the warcamps.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  'lin-davar': {
    early: {
      bio: 'Brightlord of House Davar in Jah Keved, a violent man with debts and dangerous friends. He is dead, and his children are hiding it while they try to save the house.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  helaran: {
    early: {
      fact: 'Shallan\'s eldest brother, who left home and did not come back.',
      bio: 'Oldest of the Davar children. He left home with a Shardblade nobody could explain and has not come back.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  'chiri-chiri': {
    early: {
      fact: 'A palm-sized winged creature Rysn came home with.',
      abilities: 'Small winged creature',
      bio: 'A palm-sized thing like a cremling with wings, a sleek head and solid silver eyes. Rysn came away from the Reshi Isles with her.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'Rysn\'s larkin: she eats Stormlight, and grows on it.',
        abilities: 'Larkin · eats Investiture',
        bio: 'Rysn\'s larkin, one of only three known to be left alive. She sucks the Stormlight out of spheres, and out of fabrials if nobody is watching, and grows fast on it.',
      },
      { book: 'stormlight', arc: 'dawnshard', published: true },
    ],
  },
  sadeas: {
    early: {
      fact: 'Dalinar\'s rival. The bridges, the plateaus, and a smile.',
      bio: 'Highprince of Information, Dalinar\'s old friend and rival, who runs his bridge crews as disposable tools and his plateaus as ledger columns. At the Tower he leaves Dalinar\'s army to die.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  gavinor: {
    early: {
      fact: 'Elhokar\'s son: a child wearing a kingdom\'s grief.',
      abilities: 'Heir to Alethkar',
      aliases: 'Gav',
      bio: 'Son of Elhokar and Aesudan, rescued from fallen Kholinar and raised among Radiants and war councils: a small boy whose name is a political weapon, frightened of spren after what was done to him in the palace, and a reminder of what Moash took.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  stormfather: {
    early: {
      fact: 'The spirit of the highstorm, sworn by across Alethkar.',
      abilities: 'Spren of the highstorm',
      aliases: 'Stormfather',
      bio: 'The spirit of the highstorm in Alethi oaths and legend. Whether he is more than a figure of speech is not a question most people think to ask.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'The highstorm given a mind. He lets Dalinar Kholin bond him.',
        abilities: 'Spren of the highstorm · Bondsmith spren',
        aliases: 'Rider of Storms',
        bio: 'The highstorm given a mind, the Rider of Storms to the listeners, and the carrier of Dalinar\'s visions all along. He has watched the Radiants betray their spren once, and at the end of Words of Radiance he lets Dalinar bond him anyway.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  sibling: {
    early: {},
    steps: [
      { book: 'stormlight', arc: 'row', bio: 'The third Bondsmith spren, soul of Urithiru. Wounded by the Recreance\'s aftershocks and Raboniel\'s occupation, it bonds Navani and relearns how to trust a human with the tower\'s veins.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  koravellium: {
    early: {
      bio: 'Dragon Vessel of Cultivation. She prunes Dalinar\'s memories, and gambles on Taravangian: the boon she once gave him is what makes him Odium.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  neturo: {
    early: {
      fact: 'Szeth\'s father: a Shin shepherd who taught him to add to the world, not subtract.',
      abilities: 'Shepherd · bore the Bondsmith Honorblade',
      aliases: 'Neturo, Szeth\'s father',
      bio: 'A shepherd whose teaching Szeth carried through every year he was Truthless: the best and truest duty of a person is to create, and not destroy. Szeth stopped calling himself Szeth-son-Neturo so as not to shame the name. When Ishar summons his Honorblade, Szeth knows it for the Blade his father carried, and learns that Neturo is dead.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  vin: {
    early: {
      fact: 'A skaa thief Kelsier is teaching to be Mistborn.',
      abilities: 'Mistborn',
      aliases: 'Valette Renoux',
      bio: 'A half-skaa thief raised by Reen to trust no one. Kelsier finds her, and the crew becomes the first thing she has that is not a lie.',
    },
    steps: [
      { book: 'mistborn1', arc: 'hoa', published: true },
    ],
  },
  sazed: {
    early: {
      fact: 'A Terris Keeper, carrying a library in his copperminds.',
      abilities: 'Keeper, Feruchemist',
      aliases: 'Sazed',
      bio: 'A Keeper of Terris, polite, grieving, and determined that the world the Lord Ruler erased will be remembered by somebody.',
    },
    steps: [
      { book: 'mistborn1', arc: 'hoa', published: true },
    ],
  },
  kelsier: {
    early: {
      fact: 'The Survivor of Hathsin, building a crew to kill a god.',
      abilities: 'Mistborn',
      aliases: 'Survivor, Lord of Scars, Survivor of Hathsin',
      bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He is going to kill the Lord Ruler, and he has convinced a crew to help.',
    },
    steps: [
      {
        book: 'secrethistory', arc: 'secrethistory',
        fact: 'The Survivor. Death has not finished with him.',
        abilities: 'Mistborn, Cognitive Shadow',
        aliases: 'Survivor, Lord of Scars',
        bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He died at the Lord Ruler\'s hand and refused to finish dying.',
      },
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  sigzil: {
    early: {
      fact: 'Hoid\'s apprentice, keeping Bridge Four\'s accounts.',
      abilities: 'Bridgeman, scholar',
      aliases: 'Sigzil',
      bio: 'An Azish man who apprenticed to Hoid and then to a bridge crew. He writes down what the others survive.',
    },
    steps: [
      { book: 'sunlit', arc: 'sunlit', published: true },
    ],
  },
  rysn: {
    early: {
      fact: 'A Thaylen merchant apprentice who wants a ship of her own.',
      abilities: 'Trade',
      aliases: 'Rysn',
      bio: 'Vstim\'s apprentice, learning that a deal is a kind of travel.',
    },
    steps: [
      { book: 'stormlight', arc: 'dawnshard', published: true },
    ],
  },
};
