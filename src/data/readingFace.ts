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
        aliases: 'Veil',
        bio: 'Jasnah\'s ward, then a Lightweaver bonded to a Cryptic. On the Shattered Plains she walks into the Ghostbloods as Veil and is betrothed to Adolin Kholin, and at last she remembers what happened in her father\'s house.',
      },
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'A Lightweaver, Adolin\'s wife, and more than one person in one head.',
        abilities: 'Lightweaver Radiant',
        aliases: 'Veil, Radiant',
        bio: 'A Lightweaver bonded to Pattern, married to Adolin in Urithiru. Veil and Radiant are the names she uses when Shallan is not enough. She faces Re-Shephir in the tower, and crosses Shadesmar from Kholinar to Thaylen City.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'A Lightweaver hunting Restares for the Ghostbloods, and her own past.',
        abilities: 'Lightweaver Radiant',
        aliases: 'Veil, Radiant',
        bio: 'A Lightweaver with three names, working Mraize\'s errands to get at the Ghostbloods. Radiant poisons Ialai; Shallan goes to Lasting Integrity after Restares, and finally remembers Testament, the first Cryptic she bonded and killed. Under Veil and Radiant waits a self she calls Formless.',
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
      { book: 'stormlight', arc: 'oathbringer', bio: 'Alethkar\'s heretic scholar-queen, an Elsecaller who Soulcasts assassins into smoke and walks Shadesmar on purpose. She mentors Shallan, out-argues Vorinism, and treats monarchy as another research problem with lethal stakes. Softness is not her brand; competence is.' },
      { book: 'stormlight', arc: 'wat', published: true },
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
      { book: 'stormlight', arc: 'oathbringer', bio: 'Bridge Four\'s friend who chose vengeance over the Ideal: he killed Elhokar in Kholinar, went over to the singers, and on Odium\'s orders killed the Herald Jezrien with a Fused knife.' },
      { book: 'stormlight', arc: 'row', bio: 'Bridge Four\'s friend who chose vengeance over the Ideal, killed Elhokar and a Herald, and took the name Vyre under Odium. In the occupation of Urithiru he kills Teft.' },
      { book: 'stormlight', arc: 'wat', published: true },
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
        bio: 'A wiry former rocksplitter, made lieutenant when Bridge Four becomes Dalinar\'s guard; he is the first to tear off the Cobalt Guard patch and insist they are Bridge Four. At Narak he holds Adolin back from a chasm by his Plate\'s skirt.',
      },
      // Coppermind: two weeks after Narak only Skar, Rlain and Dabbid cannot
      // draw Stormlight — Oathbringer, not the Words of Radiance it was shown in.
      {
        book: 'stormlight', arc: 'oathbringer',
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
      { book: 'stormlight', arc: 'row', bio: 'Survives a wounded crawl across the Plains and becomes the crew\'s practical gear-head — straps, plates, and the unglamorous work that keeps Windrunners alive after the oaths fade.' },
      { book: 'stormlight', arc: 'wat', published: true },
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
      // The Ghostbloods are Words of Radiance; the published abilities said so.
      abilities: 'Head of House Davar',
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
  // The published fact and aliases were Wind and Truth's: that she helped
  // Shatter Adonalsium (i-4) and Tanavast's "Kor" (ch. 100). Her name is a
  // Rhythm of War art page (Coppermind: Koravellium Avast, trivia).
  koravellium: {
    early: {
      fact: 'Cultivation\'s Vessel, who engineered the ascension of Taravangian. Also called She Who Brings the Dews at Dawn.',
      aliases: 'Cultivation · Slammer',
      bio: 'Vessel of Cultivation. She prunes Dalinar\'s memories, and gambles on Taravangian: the boon she once gave him is what makes him Odium.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  renarin: {
    early: {
      fact: 'Dalinar\'s younger son, kept from the battlefield by a blood weakness.',
      abilities: 'Prince of House Kholin',
      aliases: 'Renarin',
      bio: 'Dalinar\'s younger son, quiet and bespectacled, with the seizures the Alethi call the blood weakness. He wants to be a soldier like his brother and is not allowed to be.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'Dalinar\'s younger son, and a Truthwatcher.',
        abilities: 'Truthwatcher Radiant',
        aliases: 'Renarin',
        bio: 'Dalinar\'s younger son, kept from war by his seizures, who turns out at the end of Words of Radiance to have bonded a spren of his own: a Truthwatcher, the first of the new order.',
      },
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'Sees what should not be seen.',
        abilities: 'Truthwatcher (corrupted)',
        aliases: 'Renarin',
        bio: 'Dalinar\'s younger son, a Truthwatcher whose spren Glys was Enlightened by Sja-anat, so that he sees possible futures, which no Truthwatcher should. At Thaylen Field he stands against a thunderclast.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  rlain: {
    early: {
      fact: 'Shen, the parshman on Bridge Four.',
      abilities: 'Bridgeman',
      aliases: 'Shen',
      bio: 'The parshman slave assigned to Bridge Four. Shen hardly speaks, carries his share of the bridge, and Kaladin is not sure what to do with him.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'A listener spy on Bridge Four, who chose the bridge.',
        abilities: 'Listener · Bridge Four',
        aliases: 'Shen',
        bio: 'Shen is Rlain, a listener left among the Alethi as a spy, who chose Bridge Four over his people\'s war. When Eshonai\'s people take stormform he is the last listener in the warcamps.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'Bridge Four\'s singer, and a Truthwatcher.',
        abilities: 'Truthwatcher (corrupted) · Listener',
        aliases: 'Shen',
        bio: 'A listener who chose Bridge Four, and who could not draw Stormlight with them. In the occupation of Urithiru he bonds Tumi, a mistspren Enlightened by Sja-anat, and becomes a Truthwatcher.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  pattern: {
    early: {
      abilities: 'Cryptic',
      bio: 'A Cryptic who loves lies, and wants to understand them. He bonds Shallan, and hums whenever the truth is about to hurt productively.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  mraize: {
    early: {
      fact: 'Shallan\'s would-be master. A hunter who collects worlds like trophies.',
      abilities: 'Ghostblood, worldhopper',
      aliases: 'Mraize',
      bio: 'Ghostblood handler on Roshar: hunter, collector, and teacher of ugly lessons. He recruits Shallan as Veil, answers to his babsk Iyatil and to Thaidakar, and keeps trophies from more worlds than one on his walls.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  iyatil: {
    early: {
      bio: 'A masked worldhopper among the Ghostbloods who outranks Mraize on Roshar and is his babsk. She is not from Roshar, and she does not show her face.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  'ba-ado-mishram': {
    early: {
      fact: 'One of the Unmade, who once Connected the singers to forms of power.',
      aliases: 'BAM, Mishram, Ba-Ado-Mishram',
      bio: 'One of the Unmade, a highprincess of the enemy in the Desolations. During the False Desolation she Connected herself to the singers and gave them forms of power and Voidlight, in a way the Radiants never understood.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', fact: 'Connected the singers in the False Desolation; her sealing helped cause the Recreance.', aliases: 'BAM, Mishram, Ba-Ado-Mishram', bio: 'Most dangerous of the Unmade. During the False Desolation she Connected to the singers and granted them forms of power and Voidlight almost as a Shard would. Melishi and the Radiants sealed her in a gemstone; the shock to Connection helped kill spren bonds and push the Recreance.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  melishi: {
    early: {
      fact: 'A Bondsmith of the old Knights Radiant.',
      abilities: 'Bondsmith',
      bio: 'A Bondsmith of the old Knights Radiant, named in the records the new Radiants study.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', fact: 'The Bondsmith who sealed Ba-Ado-Mishram.', abilities: 'Bondsmith (the Sibling)', bio: 'A Bondsmith of the Recreance\'s generation, bonded to the Sibling, who captured Ba-Ado-Mishram in a gemstone.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  venli: {
    early: {
      fact: 'Eshonai\'s sister: a listener scholar who found one old form and wants more.',
      abilities: 'Listener scholar',
      aliases: 'Venli',
      bio: 'A listener scholar, Eshonai\'s younger sister, who found warform and keeps pushing her people toward the old forms of power, and toward the gods who gave them.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'Odium\'s envoy, carrying a spren she is not supposed to have.',
        abilities: 'Envoy · Willshaper (secretly)',
        aliases: 'Venli',
        bio: 'The listener who brought her people stormform, and lost her sister to it. Odium keeps her as his envoy to the waking singers, but a small lightspren, Timbre, has found her, and at the end of Oathbringer she swears an Ideal.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'The sister who chose a different song.',
        abilities: 'Willshaper Radiant',
        aliases: 'Last Listener',
        bio: 'Listener scholar who bargained toward stormform, lost her sister to it, and then took a different spren entirely. As a Willshaper and Raboniel\'s Voice in occupied Urithiru, she tries to build a singer future that is neither slavery nor Odium\'s script.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  leshwi: {
    early: {
      fact: 'A Heavenly One of the Fused, and Moash\'s commander.',
      bio: 'A Heavenly One of the Fused, who takes Moash into her service in occupied Alethkar and prefers a fight to a slaughter.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', bio: 'A Heavenly One of the Fused who prefers contested duels to slaughter. Spares and spars with Kaladin, sponsors Venli\'s dangerous double life, and treats honor as something even Odium\'s immortals can choose.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  'el-fused': {
    early: {
      bio: 'A Fused stripped of his title and his rhythms for insisting that humans should not be killed but reconditioned. At each rebirth he removes his carapace and replaces it with metal.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  thude: {
    early: {
      abilities: 'Listener warrior · warpair with Bila',
      // Coppermind: the escape into the chasms is Words of Radiance (i-11);
      // the remnant surviving, and Venli finding it, is Wind and Truth (ch. 56).
      bio: 'One of Eshonai\'s warriors, Bila\'s mate and warpair. When the listeners were ordered into stormform he refused, and fled into the chasms with seventeen hundred others.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  battar: {
    early: {
      bio: 'Herald of Counsel and Wisdom, patron of the Elsecallers. In the present age she works in Kharbranth as the ardent Dova, helping Taravangian\'s Diagram track the Death Rattles.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  lift: {
    early: {
      fact: 'A Reshi thief who glows when she eats, and does not like being told no.',
      abilities: 'Something the Nightwatcher gave her',
      aliases: 'Lift',
      bio: 'A Reshi thief who claims to be ten, eats everything, and calls the glow it gives her her awesomeness. She asked the Nightwatcher for something and got it. Breaking into the Azish palace, she brings a dying boy back to life, and he is made Prime.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'edgedancer',
        fact: 'An Edgedancer who remembers the people everyone forgets.',
        abilities: 'Edgedancer Radiant',
        aliases: 'Lift',
        bio: 'A Reshi thief bonded to Wyndle, a cultivationspren who wanted a gardener. In Yeddaw she outruns Darkness and his Skybreakers and swears to remember those who have been forgotten.',
      },
      { book: 'stormlight', arc: 'row', fact: 'A thief whose body turns food into Lifelight.', bio: 'A Reshi thief who asked the Old Magic to stay the same and received a metabolism that turns food into Lifelight. Edgedancer Ideals, Wyndle\'s complaining vines, and a stubborn compassion for the people empires forget.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  kalak: {
    early: {
      fact: 'One of the ten Heralds, who opens The Way of Kings walking away from a battlefield.',
      abilities: 'Herald · Honorblade',
      aliases: 'Kalak, Kelek',
      bio: 'One of the ten Heralds. In the Prelude he walks off the field of Aharietiam, and with the others leaves his Blade in the stone and Taln behind on Braize.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', aliases: 'Kelek, Kellai, Restares', bio: 'Herald of Resolute and Building, patron of the Willshapers. After Aharietiam he fled into Shadesmar and became High Judge of the honorspren at Lasting Integrity, and, as Restares, the leader of the Sons of Honor. Exhausted and afraid of Braize, he knows more about spren law and the ancient Radiants than almost anyone alive.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  chana: {
    early: {
      fact: 'Herald of the Common Man, patron of the Dustbringers.',
      bio: 'Herald of the Common Man and patron of the Dustbringers, fierce and protective in the Vorin stories: Chana help whoever stands between a mother and her own.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  pailiah: {
    early: {
      aliases: 'Pali, Pailiah\'Elin, Herald of Learned',
      bio: 'Herald of Learned and Giving, patron of the Truthwatchers. Like most of her peers she walked away from the Oathpact at Aharietiam and has spent the intervening millennia fractured. Sightings in the present day remain sparse and contested.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  fen: {
    early: {
      bio: 'Queen of Thaylenah during the True Desolation. Pragmatic, sharp-tongued, and unwilling to pawn her island for Alethi theater; becomes one of Dalinar\'s essential coalition partners.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  teft: {
    early: {
      abilities: 'Bridgeman · Bridge Four',
      bio: 'An older bridgeman who knows more about what is happening to Kaladin than he lets on, and becomes Bridge Four\'s sergeant.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', abilities: 'Windrunner squire', bio: 'Bridge Four\'s sergeant, raised among the Envisagers, who wanted the Radiants back. He trains the squires and keeps them standing.' },
      { book: 'stormlight', arc: 'oathbringer', bio: 'Bridge Four\'s sergeant, raised among the Envisagers, fighting a firemoss habit he cannot put down. At the end of Oathbringer he speaks his Ideals and bonds the honorspren Phendorana.' },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  rock: {
    early: {
      fact: 'Bridge Four\'s Horneater cook, who will not fight.',
      abilities: 'Cook · Bridge Four',
      bio: 'Numuhukumakiaki\'aialunamor: a huge Horneater cook on Bridge Four who sees spren nobody else sees and will not fight. His caste forbids it.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', bio: 'Numuhukumakiaki\'aialunamor, Horneater cook of Bridge Four, who sees spren when others cannot and will not fight. At Thaylen Field he takes up a bow at last, and kills Amaram.' },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  eshonai: {
    early: {
      fact: 'A Parshendi Shardbearer on the Shattered Plains.',
      abilities: 'Shardbearer',
      aliases: 'Eshonai',
      bio: 'A Parshendi Shardbearer in silver Plate, seven feet tall in it, who fights the Alethi on the plateaus.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', fact: 'The listener general who wanted to explore, and took stormform to save her people.', abilities: 'Shardbearer · stormform', bio: 'A listener general and Shardbearer who wanted to explore the world more than fight for it. To save her people she took the new form her sister found, and stormform took her.' },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  lopen: {
    early: {
      fact: 'One-armed Herdazian on Bridge Four, with a cousin for every occasion.',
      abilities: 'Bridgeman · Bridge Four',
      bio: 'A one-armed Herdazian on Bridge Four with an endless supply of cousins, nicknames and opinions, who refers to himself as the Lopen.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', fact: 'Herdazian, one-armed, then two.', abilities: 'Windrunner squire · Bridge Four', bio: 'A Herdazian on Bridge Four with cousins for every occasion. When he learns to drink in Stormlight, he grows his arm back.' },
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  syl: {
    early: {
      fact: 'A windspren who follows a slave around, and becomes more of a person every day.',
      abilities: 'Spren',
      bio: 'A small spren of the wind who takes an interest in a slave on a bridge crew, and becomes more of a person the longer she stays. She does not know what she is, and the not knowing frightens her.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', fact: 'Kaladin\'s spren. Ancient, loyal, and still learning what a joke is.', abilities: 'Honorspren, Windrunner bond', bio: 'An honorspren bonded to Kaladin. She dies when he breaks his oaths, and comes back when he remembers why he wanted to be good.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  gavilar: {
    early: {
      bio: 'King of Alethkar, who unified the princedoms with his brother Dalinar, and was assassinated by the Assassin in White on the night he signed a treaty with the Parshendi. He left his brother a message, written in his own blood.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', bio: 'King of Alethkar, who unified the princedoms with Dalinar as his knife and, in secret, was one of the Sons of Honor, trying to bring back the Heralds. Szeth killed him on the night of the treaty.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  dreder: {
    early: {
      fact: 'A man who knew Shallan\'s mother.',
      abilities: 'Unknown',
      bio: 'An associate of Shallan\'s mother, named in a letter Shallan finds among her father\'s things.',
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
  // Secret History (January 2016) came out four years before Rhythm of War,
  // and the last step a reader has reached wins. With Secret History as the
  // published step, a reader who had just finished it was told he is
  // Thaidakar. The Shadow is Secret History's; Thaidakar waits for Rhythm of War.
  kelsier: {
    early: {
      fact: 'The Survivor of Hathsin, building a crew to kill a god.',
      abilities: 'Mistborn',
      aliases: 'Survivor, Survivor of Hathsin',
      bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He is going to kill the Lord Ruler, and he has convinced a crew to help.',
    },
    steps: [
      {
        book: 'secrethistory', arc: 'secrethistory',
        fact: 'The Survivor of Hathsin, who refused to finish dying.',
        abilities: 'Mistborn, Cognitive Shadow',
        aliases: 'Survivor, Survivor of Hathsin',
        bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He died at the Lord Ruler\'s hand and refused to finish dying: he held Preservation for a moment, haunted the Cognitive Realm through the Final Empire\'s last days, and outlasted it.',
      },
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  // ── Mistborn Era 1: cards whose published text is a later book's ─────────
  dockson: {
    early: { bio: 'A plantation skaa who ran after Lord Devinshae raped and killed the girl he loved, and learned to hate the nobility with a clerk\'s precision. He and Kelsier were Luthadel\'s most infamous crewleaders; now Dockson keeps the crew paid, housed and pointed at the right keeps, the one man among them with no Allomancy at all.' },
    steps: [{ book: 'mistborn1', arc: 'woa', published: true }],
  },
  clubs: {
    early: { bio: 'Cladent Snapped as a Smoker in the Lord Ruler\'s army and came home with a scarred, limping leg and a carpentry shop that was really a coppercloud. He grumbles through every plan Kelsier makes, then follows it anyway, and keeps his nephew Spook close.' },
    steps: [{ book: 'mistborn1', arc: 'woa', published: true }],
  },
  oreseur: {
    early: {
      fact: 'Kelsier\'s kandra, playing the elderly Lord Renoux.',
      abilities: 'Kandra',
      bio: 'A kandra bound by Contract to wear Lord Renoux\'s identity for Kelsier\'s plan, and the keeper of what Kelsier meant to happen after he was gone.',
    },
    steps: [{ book: 'mistborn1', arc: 'woa', published: true }],
  },
  'straff-venture': {
    early: {
      fact: 'Lord of House Venture, Elend\'s father, and the man who runs the Pits\' atium for the Lord Ruler.',
      bio: 'Head of the most powerful Great House in Luthadel, a Tineye who flaunts his Allomancy, and a father who despises his heir\'s books. When the Lord Ruler falls he flees the city and leaves Elend behind.',
    },
    steps: [{ book: 'mistborn1', arc: 'woa', published: true }],
  },
  'jastes-lekal': {
    early: {
      fact: 'Elend\'s friend from House Lekal.',
      abilities: 'Noble heir',
      bio: 'The Lekal heir, one of the young nobles who drink wine with Elend and Telden at the balls and argue about the rights of men. He and Elend mean to be allies when they inherit.',
    },
    steps: [{ book: 'mistborn1', arc: 'woa', published: true }],
  },
  goradel: {
    early: {
      fact: 'The palace guard Vin talked out of a fight on the night of the Collapse.',
      bio: 'A skaa who joined the Lord Ruler\'s army to escape the fields. On guard at Kredik Shaw the night Vin went in, he took her offer instead of a fight, tore off his insignia, and led Elend down to the cells to get her out.',
    },
    steps: [{ book: 'mistborn1', arc: 'hoa', published: true }],
  },
  penrod: {
    early: {
      fact: 'The nobleman the Assembly made king when it deposed Elend.',
      bio: 'A minor lord who stayed in Luthadel after the Collapse and became the Assembly\'s patriarch. When the Assembly removed Elend, Penrod was made chancellor, then king, on votes Straff had bought.',
    },
    steps: [{ book: 'mistborn1', arc: 'hoa', published: true }],
  },
  'ashweather-cett': {
    early: { bio: 'Cett took the Western Dominance when the Lord Ruler fell, lost Fadrex City to the obligator Yomen, and marched on Luthadel for an atium cache Breeze had talked him into. He loses the bid for the capital and swears to Elend at Vin\'s insistence. His mouth is a weapon; his children are the rest of the arsenal.' },
    steps: [{ book: 'mistborn1', arc: 'hoa', published: true }],
  },
  kwaan: {
    early: {
      fact: 'The Terris Worldbringer who first named Alendi the Hero of Ages — then turned on him.',
      bio: 'A Worldbringer who met Alendi in the library of Khlennium and first proclaimed him the Hero of Ages. Alendi\'s logbook remembers the old man as a father figure who later denounced him before the Conclave and fled.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'woa',
        bio: 'The Worldbringer who proclaimed Alendi the Hero of Ages, then saw the prophecies the others quoted begin to change. He recanted, sent his nephew Rashek to stop Alendi at the Well, and carved his confession in steel because steel could not be altered. Sazed finds it a thousand years later.',
      },
      { book: 'mistborn1', arc: 'hoa', published: true },
    ],
  },
  alendi: {
    early: {
      bio: 'A blacksmith\'s son who became king of Khlennium and marched north to the Well of Ascension as the Hero of Ages. His logbook is the book Vin and Kelsier steal from Kredik Shaw. Rashek, his Terris packman, killed him at the Well and took the power himself.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'woa',
        bio: 'A blacksmith\'s son who became king of Khlennium and marched north as the Hero of Ages. Kwaan, who had proclaimed him, came to believe the prophecies were being changed and sent his nephew Rashek to stop him. Rashek killed Alendi at the Well and took the power himself.',
      },
      { book: 'mistborn1', arc: 'hoa', published: true },
    ],
  },
  elend: {
    early: {
      fact: 'Straff Venture\'s heir, who reads forbidden books at balls.',
      abilities: 'None (noble heir)',
      aliases: 'Elend',
      bio: 'The heir of House Venture, who skips the dancing to read philosophy the Ministry would burn and argues politics with Jastes Lekal and Telden Hasting over wine. He notices Valette Renoux because she is not like the other ladies at court.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'woa',
        fact: 'King in Luthadel, then emperor; Mistborn by the bead at the Well.',
        abilities: 'Mistborn',
        aliases: 'Emperor',
        bio: 'A scholar who took Luthadel\'s throne after the Collapse and wrote the clause his Assembly used to depose him. He survives the siege, marries Vin, and walks out of the Well\'s cavern a Mistborn and an emperor.',
      },
      { book: 'mistborn1', arc: 'hoa', published: true },
    ],
  },
  marsh: {
    early: {
      fact: 'Kelsier\'s brother, who went into the Steel Ministry as a spy.',
      abilities: 'Seeker, then Steel Inquisitor',
      bio: 'Kelsier\'s older brother, called Ironeyes for his stare, who led the skaa rebellion before Yeden. He goes into the Ministry as an acolyte to spy for the crew; the Ministry wanted Seekers and made him an Inquisitor. On the night Vin faces the Lord Ruler, he pulls the spikes that keep the other Inquisitors alive.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'hoa',
        fact: 'Kelsier\'s brother, an Inquisitor whose spikes let Ruin wear him.',
        bio: 'Made an Inquisitor by the Ministry he spied on, then worn by Ruin through his spikes. He led Sazed to Kwaan\'s steel, spiked Penrod, killed Goradel, and beheaded Elend at Hathsin, and kept just enough of himself to tear out Vin\'s earring.',
      },
      { book: 'mistborn2', arc: 'aol', published: true },
    ],
  },
  tensoon: {
    early: {
      fact: 'Straff Venture\'s kandra.',
      abilities: 'Kandra',
      aliases: 'TenSoon',
      bio: 'A kandra on Contract to Straff Venture, wearing a Hasting servant\'s bones when Elend walks in on his father\'s meeting.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'woa',
        fact: 'Zane\'s kandra, who killed OreSeur and took his place at Vin\'s side.',
        aliases: 'OreSeur (assumed)',
        abilities: 'Kandra, Third Generation',
        bio: 'A Third Generation kandra on Contract to Zane, who killed OreSeur and spent the siege in a wolfhound\'s bones as Vin\'s "OreSeur", reporting on her. He came to like her better than his master, broke his Contract to tell her the kandra\'s secret, and went home to answer for it.',
      },
      {
        book: 'mistborn1', arc: 'hoa',
        fact: 'The kandra who broke his Contract for Vin and stood trial for it.',
        abilities: 'Kandra, Third Generation (Blessings of Presence and Potency)',
        bio: 'Judged in the Trustwarren for breaking his Contract, sentenced to ChanGaar, and fled in his wolfhound bones to find Vin. He brought Sazed to the Homeland, and when Ruin seized his body he enacted the Resolution and pulled his own Blessings.',
      },
      { book: 'mistborn2', arc: 'sos', published: true },
    ],
  },
  spook: {
    early: {
      fact: 'Clubs\'s nephew, the crew\'s youngest, a Tineye.',
      abilities: 'Tineye',
      aliases: 'Spook, Lestibournes',
      bio: 'A boy from the Eastern Dominance who talks a street slang nobody else follows, sheltered by his uncle Clubs and running errands for the crew. His tin makes him their lookout.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'hoa',
        fact: 'Survivor of the Flames, who took Urteau back from the Citizen.',
        abilities: 'Tineye; pewter by a Hemalurgic spike',
        aliases: 'Lestibournes, Survivor of the Flames',
        bio: 'Sent north to watch Urteau, he took a sword-tip in a fire that turned out to be a Hemalurgic spike, and heard "Kelsier" telling him what to do. He tore it out, pulled the Citizen\'s too, and opened the cache that put water back in the canals.',
      },
      { book: 'mistborn2', arc: 'aol', published: true },
    ],
  },
  demoux: {
    early: {
      fact: 'A captain in Kelsier\'s skaa army, and its first believer.',
      abilities: 'Soldier',
      aliases: 'Demoux',
      bio: 'One of the first recruits in the Arguois caverns, made captain by Ham, and the man Kelsier picked to fight the dissenter Bilg — with help nobody saw.',
    },
    steps: [
      {
        book: 'mistborn1', arc: 'hoa',
        fact: 'Elend\'s general and a Survivorist preacher; one of the mistfallen.',
        abilities: 'Seer (atium Misting)',
        aliases: 'Demoux',
        bio: 'A captain of Kelsier\'s army who preached the Survivor at night in Luthadel, rose to general under Elend, and was struck down by the mists — which turned out to have Snapped him into a Seer.',
      },
      { book: 'stormlight', arc: 'twok', published: true },
    ],
  },
  felt: {
    early: {
      fact: 'A House Venture spy who watched Kelsier\'s crew for Elend.',
      abilities: 'Spy',
      bio: 'A Venture spy who tails Kelsier\'s crew and reports to Elend that they are a well-funded skaa thieving crew — which is how Elend learns Valette Renoux is not what she seems.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        bio: 'A House Venture spy who tailed Kelsier\'s crew for Elend, and who turns up, by Word of Brandon, as a scout on Roshar\'s Shattered Plains. A reminder that Scadrial\'s agents got off-world somehow.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  breeze: {
    early: { aliases: 'Breeze, Ladrian' },
    steps: [{ book: 'mistborn2', arc: 'sos', published: true }],
  },
  gemmel: {
    early: {
      bio: 'A half-mad Mistborn who took Kelsier on three months after the Pits, taught him steel and iron, and led him to Keep Shezler in Mantiz and a dead lord\'s notebook about an Eleventh Metal. He talks to a voice in his head, thinks himself invincible, and threw his student off a roof to see what he would do. Kelsier walks out of the apprenticeship a Mistborn and a weapon.',
    },
    steps: [{ book: 'secrethistory', arc: 'secrethistory', published: true }],
  },
  melaan: {
    early: {
      fact: 'A young kandra who believed TenSoon when the Homeland did not.',
      abilities: 'Kandra, Seventh Generation',
      aliases: 'MeLaan',
      bio: 'A Seventh Generation kandra in the Homeland. At TenSoon\'s trial she offered to help him escape and believed him when he said Vin had inherited the First Contract; when KanPaar seized the Homeland, she fetched the keys and freed the First Generation.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'sos',
        fact: 'Harmony\'s agent in a changing world.',
        aliases: 'Milan',
        bio: 'A Seventh Generation kandra who backed TenSoon at his trial in the Homeland and freed the First Generation when KanPaar turned on them. Three centuries later she is Harmony\'s hands in Elendel, introduces herself to Wax at a party as "Milan", and wears Governor Innate\'s bones in front of a riot.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  wax: {
    early: {
      aliases: 'Wax, Lord Ladrian',
      bio: 'A Coinshot and a Skimmer who spent twenty years as a lawman in the Roughs and came home to Elendel when his uncle died, to run a house sliding into debt. Lessie died in Bloody Tan\'s lair by Wax\'s own bullet. Five months later the Vanishers rob a wedding he is attending, and he stops pretending he is finished.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'sos',
        aliases: 'Wax, Lord Ladrian, Asinthew',
        bio: 'A Coinshot and a Skimmer who spent twenty years as a lawman in the Roughs, came home to Elendel when his uncle died, and found his uncle was Mister Suit. Hunting Bleeder, he hears Harmony through an earring and learns that Lessie was a kandra.',
      },
      {
        book: 'mistborn2', arc: 'bom',
        aliases: 'Wax, Lord Ladrian, Asinthew',
        bio: 'A Coinshot and a Skimmer who spent twenty years as a lawman in the Roughs, came home to Elendel when his uncle died, and found his uncle was Mister Suit. Harmony speaks to him through an earring; Lessie turned out to be a kandra; he marries Steris, and his sister shoots him at the Sovereign\'s temple.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  wayne: {
    early: {
      aliases: 'Wayne',
      bio: 'A Slider and a Bloodmaker with a hat for every accent. He rode with Wax in the Roughs, followed him to Elendel, and treats theft as trading as long as he leaves something in exchange.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'sos',
        bio: 'A Slider and a Bloodmaker with a hat for every accent, who shot Allriandre Durkel\'s father in a robbery at sixteen and has brought her money every month since. He rode with Wax in the Roughs, followed him to Elendel, and treats theft as trading as long as he leaves something in exchange.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  marasi: {
    early: {
      fact: 'A law student, a Pulser, and Steris\'s half-sister.',
      aliases: 'Marasi',
      bio: 'Lord Harms\'s illegitimate daughter and Steris\'s half-sister, raised in the Outer Estates, who came to the city to study legal justice and criminal behaviour and had read every report about Wax and Wayne before she met them. She can slow time around herself, which her family considered useless; she is also a very good shot.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'sos',
        aliases: 'Marasi',
        bio: 'Lord Harms\'s illegitimate daughter and Steris\'s half-sister, who studied legal justice and criminal behaviour and then went to work for Aradel as a constable and crime analyst. She works the Bleeder case from inside the constabulary, and argues with Reddi about how to talk to witnesses.',
      },
      {
        book: 'mistborn2', arc: 'bom',
        bio: 'Lord Harms\'s illegitimate daughter and Steris\'s half-sister, and a constable under Aradel and then Reddi. Sent after ReLuur\'s missing spike, she freed Allik from a Set cage, and at the Sovereign\'s temple she took up the Bands of Mourning and turned the fight.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  steris: {
    early: {
      aliases: 'Steris',
      bio: 'A woman who weaponises notebooks: she memorises social rules because they do not come to her, and keeps a contingency for every occasion. Her engagement to Wax is a contract her father negotiates, and she is the hostage the Vanishers choose at the Yomen-Ostlin wedding.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'bom',
        bio: 'A woman who weaponises notebooks: she memorises social rules because they do not come to her, and keeps a contingency for every occasion. Her marriage to Wax began as a contract and became the partnership that keeps House Ladrian solvent and alive.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  telsin: {
    early: {
      fact: 'Wax\'s sister, who was supposed to have died with their uncle.',
      aliases: 'Telsin',
      abilities: 'Unrevealed',
      bio: 'Wax\'s sister, who stayed in the Village when he left and was supposed to have died in the same carriage accident as their uncle Edwarn. When Wax confronts Edwarn, Edwarn tells him she is alive, the Set has her, and she is as good as dead if Wax kills him.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'bom',
        fact: 'Wax\'s sister, and the Set\'s Lady Sequence.',
        aliases: 'Lady Sequence',
        abilities: 'Hemalurgist',
        bio: 'Wax\'s sister, who stayed in the Village when he left and joined the Set as a young woman, bringing their uncle in for his money. She faked her death with Edwarn and played the Set\'s captive to control her brother; at the Sovereign\'s temple she shot him three times and took MeLaan\'s spikes. Wayne shot her on the skimmer and let her go.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  'edwarn-ladrian': {
    early: {
      bio: 'Wax\'s uncle, and the reason Wax came home: a carriage accident that Edwarn staged. As Mister Suit he paid the Vanishers, drained House Tekiel through the insurance companies the robberies broke, and moved the Ladrian money into the Set\'s accounts. He had raised his son Hinston to take the house and settled for Wax when disease took the boy.',
    },
    steps: [
      { book: 'mistborn2', arc: 'bom', published: true },
    ],
  },
  'gave-entrone': {
    early: {
      fact: 'A New Seran lord and amateur archaeologist with a name in ReLuur\'s notebook.',
      abilities: 'Noble',
      bio: 'A New Seran lord in textiles with an amateur\'s interest in archaeology, and one of the names in ReLuur\'s notebook of people connected to the Bands of Mourning. At Kelesina Shores\' party he insulted Wax to end the conversation, and when that failed he insulted Steris.',
    },
    steps: [
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  allik: {
    early: {
      bio: 'A twenty-two-year-old crewman of the airship Brunstell, which crashed near Dulsing while searching for the Sovereign\'s temple. Marasi and MeLaan found him in a Set cage; he flew them to the temple in a stolen skimmer and nearly froze when the Set took his heating medallion. Like every Malwish he wears a mask, and he gave his old cracked one to Marasi when the Brunstell went home.',
    },
    steps: [
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  // Warbreaker does not know where these go next. Roshar does.
  vasher: {
    early: {
      fact: 'A Returned in T\'Telir with a black sword that talks, trying to stop a war he once started.',
      aliases: 'Kalad the Usurper, Peacegiver the Blessed, Warbreaker the Peaceful, Tax',
      abilities: 'Returned, Awakener, Nightblood\'s co-creator',
      bio: 'One of the Five Scholars, who helped Shashara make Nightblood and then killed her with it. As Kalad he built the Phantoms and started the Manywar; as Peacegiver he ended it. Three hundred years later he is in T\'Telir with Awakened rope and cloth, trying to keep Hallandren from marching on Idris.',
    },
    steps: [{ book: 'stormlight', arc: 'wor', published: true }],
  },
  azure: {
    early: {
      fact: 'Idris\'s eldest princess, raised to marry the God King and then kept at home.',
      aliases: 'Princess of Idris',
      abilities: 'Awakener, Royal Locks',
      bio: 'Vivenna of Idris, trained all her life for a marriage her father gave to Siri instead. She follows her sister to T\'Telir, inherits Lemex\'s Breath, is used by Denth, and ends up on the streets with her hair sold. Vasher teaches her to Awaken; when the war is stopped she leaves Idris to travel with him.',
    },
    steps: [{ book: 'stormlight', arc: 'oathbringer', published: true }],
  },
  nightblood: {
    early: {
      fact: 'A thousand Breaths in a black sword, Commanded to destroy evil. It wants to help.',
      aliases: 'Nightblood',
      abilities: 'Awakened sword (Type IV), Destroy Evil',
      bio: 'Shashara and Vasher Awakened it from steel with a thousand Breaths and the Command "Destroy evil", without considering that a sword would not know what evil is. Drawn, it drinks its wielder\'s Breath; sheathed, it chatters, tempts the greedy and sickens the good. It still thinks Shashara is alive.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', aliases: 'Nightblood' },
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  edgli: {
    early: {
      fact: 'Vessel of Endowment. The voice the Returned hear before they come back.',
      bio: 'The Vessel of Endowment and the only Shard on Nalthis. She gives every Nalthian a Breath, offers the dead a chance to Return without pressing them, and the Tears of Edgli are named for her.',
    },
    steps: [{ book: 'stormlight', arc: 'oathbringer', published: true }],
  },
  // Sixth of the Dusk, before Isles of the Emberdark tells what came after.
  vathi: {
    early: {
      aliases: 'Vathi',
      abilities: 'Northern Interests Trading Company; bonded to Mirris',
      fact: 'A company noblewoman with an Aviar locator, lost on Patji.',
      bio: 'An educated Eelakin woman of the Northern Interests Trading Company, there more for science than profit. A deepwalker wipes out her scouting party on Patji; she survives the jungle well enough that Dusk thinks he is tracking an apprentice. At Patji\'s Eye she works out where Aviar get their talents, and back at the fortress she and Dusk recognise the Ones Above\'s gifts as a trap.',
    },
    steps: [{ book: 'emberdark', arc: 'emberdark', published: true }],
  },
  sak: {
    early: {
      fact: 'Dusk\'s other bird. Not an Aviar species, and she bestows a talent anyway.',
      bio: 'A black mainland bird with a damaged wing that Dusk raised on Patji, where she gained a talent nobody had seen: visions of the bonded person\'s corpse wherever death is waiting. Dusk kept her secret. When the company opens the Ones Above\'s machine, she sees the whole island die.',
    },
    steps: [{ book: 'emberdark', arc: 'emberdark', published: true }],
  },
  // Sel's two dead Vessels are named by a Way of Kings epigraph; their Shards
  // and the Dor come from Arcanum Unbounded.
  aona: {
    early: {
      fact: 'One of two Shardholders who settled on Sel. Rayse left both dead.',
      abilities: 'Shardholder',
      aliases: 'Aona',
      bio: 'Aona and Skai made their home on Sel together. After Rayse\'s visit both were dead, and what they held was Splintered.',
    },
    steps: [{ book: 'arcanum', arc: 'arcanum', published: true }],
  },
  skai: {
    early: {
      fact: 'One of two Shardholders who settled on Sel. Rayse left both dead.',
      abilities: 'Shardholder',
      aliases: 'Skai',
      bio: 'Skai and Aona made their home on Sel together. After Rayse\'s visit both were dead, and what they held was Splintered.',
    },
    steps: [{ book: 'arcanum', arc: 'arcanum', published: true }],
  },
  galladon: {
    early: {
      fact: 'A Dula farmer a few months into Elantris, and Raoden\'s first friend there.',
      aliases: 'Galladon',
      bio: 'A Dula farmer whose father was an Elantrian, so he knows the fallen city better than most. He trades thirty days of guidance for Raoden\'s food, grumbles through every hopeful plan, and keeps helping anyway — with his father\'s books, a garden, and a better head for AonDor than he admits.',
    },
    steps: [{ book: 'stormlight', arc: 'twok', published: true }],
  },
  dashe: {
    early: {
      fact: 'Karata\'s second-in-command, keeping the city\'s children safe.',
      abilities: 'Elantrian',
      bio: 'Karata\'s second in fallen Elantris, who helps keep the children\'s Roost safe and leads an unsanctioned raid on Aanden\'s gang. He brings Raoden word that Hrathen has been "healed" of the Shaod.',
    },
    steps: [{ book: 'elantris', arc: 'hope', published: true }],
  },
  // White Sand is three volumes, and Taldain is first seen off-world in
  // Secret History.
  khriss: {
    early: {
      fact: 'A Darkside duchess on Dayside to learn how her fiancé died.',
      aliases: 'Khrissalla, Khriss',
      abilities: 'Scholar',
      bio: 'Duchess Khrissalla of Elis, a university scholar from Darkside, crosses the terminal storm to Dayside with Baon, Cynder and Acron after Prince Gevalden is reported dead there. She wants the sand mages he went looking for, and she writes everything down.',
    },
    steps: [
      {
        book: 'secrethistory', arc: 'secrethistory',
        fact: 'A worldhopping scholar.',
        abilities: 'Worldhopper, scholar',
        bio: 'Khriss, now travelling the cosmere with Nazh. Kelsier finds the pair in Scadrial\'s Cognitive Realm, come to see what the death of a Shard looks like.',
      },
      { book: 'arcanum', arc: 'arcanum', published: true },
    ],
  },
  baon: {
    early: {
      fact: 'Khriss\'s bodyguard on Dayside: pistols, a goatee, and opinions.',
      aliases: 'Baon',
      abilities: 'Soldier, bodyguard',
      bio: 'A Darkside soldier Khriss hires to guard her crossing to Dayside. Perceptive, blunt and very good with a pistol, he keeps the expedition alive through Kerztian ambushes and Lossandin politics.',
    },
    steps: [
      {
        book: 'whitesand', arc: 'ws2',
        fact: 'Khriss\'s bodyguard, and the Dynasty\'s agent.',
        abilities: 'Soldier, Dynasty agent',
        bio: 'A Darkside soldier guarding Khriss on Dayside. When she recognises Elisian officer\'s pistols, he admits he killed Captain Deral and was sent by the Dynasty, and walks out.',
      },
      // The published card was gated on The Way of Kings (his cameo there),
      // which every White Sand reader has already read: Volume 1 readers were
      // told he is the Dynasty's agent and a sand master. Volume 3 publishes
      // it now, and the Volume 3 face's account is folded into the bio.
      { book: 'whitesand', arc: 'ws3', published: true },
    ],
  },
  sharezan: {
    early: {
      fact: 'Lossand\'s crime lord. Ais is sure he is the Lord Beggar.',
      aliases: 'Sharezan',
      abilities: 'Crime lord',
      bio: 'A crime lord running drug dens in Kezare, and the man Senior Trackt Ais has sworn to catch. His men kill six trackts in one raid, he walls a whole family into a closet, and he writes Ais letters about hers. She believes he is Nilto.',
    },
    steps: [{ book: 'whitesand', arc: 'ws3', published: true }],
  },
  elorin: {
    early: {
      fact: 'Praxton\'s undermastrell, who let Kenton run the Mastrell\'s Path.',
      aliases: 'Undermastrell Elorin',
      abilities: 'Sand master, undermastrell',
      bio: 'Undermastrell and assistant to Lord Mastrell Praxton. He reluctantly sponsors Kenton\'s run of the Mastrell\'s Path, worries over him through it, and urges him to stay away from the advancement ceremony.',
    },
    steps: [
      {
        book: 'whitesand', arc: 'ws2',
        fact: 'Back from the Kerla with his power burned out — he says.',
        bio: 'Praxton\'s old undermastrell. He says he survived the Kerla by overmastering until his power was gone, and Kenton takes him back as an assistant.',
      },
      { book: 'whitesand', arc: 'ws3', published: true },
    ],
  },
  gevalden: {
    early: {
      fact: 'Khriss\'s betrothed. She crosses a planet to learn how he died.',
      aliases: 'Gevin, Prince Gevalden',
      abilities: 'Darkside prince',
      bio: 'A prince of Elis and Khrissalla\'s fiancé, who went to Dayside chasing the sand mages of Darkside children\'s stories and was reported shot dead by Dynasty assassins. Khriss\'s expedition is grief disguised as research.',
    },
    steps: [{ book: 'whitesand', arc: 'ws3', published: true }],
  },
  nilto: {
    early: {
      fact: 'Lord Beggar of Kezare. Ais thinks Sharezan wears his face.',
      aliases: 'Lord Beggar',
      abilities: 'Lord Beggar',
      bio: 'The Lord Beggar of Kezare, face disfigured and wrapped, and a friend of the Darksider Loaten. Ais is certain he is the crime lord Sharezan.',
    },
    steps: [{ book: 'whitesand', arc: 'ws3', published: true }],
  },
  aarik: {
    early: {
      fact: 'Kenton\'s oldest friend, home from Darkside with a cape and a father who disowned him.',
      aliases: 'Aarik',
      abilities: 'Swordsman',
      bio: 'Kenton\'s childhood friend, disowned by his father, Lord General Raagent, and gone to Darkside for three years for reasons he only hints at. He turns up at the Diem the day after Kenton becomes acting Lord Mastrell: sceptical, lazy-seeming, and quick with a sword.',
    },
    steps: [{ book: 'whitesand', arc: 'ws3', published: true }],
  },
  acron: {
    early: {
      fact: 'Khriss\'s nervous anthropologist.',
      abilities: 'Darksider scholar',
      bio: 'A Darkside professor of anthropology on Khriss\'s expedition, nervous and bookish.',
    },
    steps: [{ book: 'whitesand', arc: 'ws3', published: true }],
  },
  // Elantris and The Emperor's Soul do not know where these two end up. The
  // Lost Metal does.
  shai: {
    early: {
      aliases: 'Wan ShaiLu',
      abilities: 'Forger',
      bio: 'A MaiPon Forger, among the best alive, caught in the Rose Palace after the Imperial Fool swapped her fake Moon Scepter for the real one and gave her up. Facing execution, she is offered a deal: Forge a new soul for the comatose Emperor Ashravan within his hundred days of mourning. She carries five Essence Marks that took eight years to make, writes him a soul with no backdoors in it, and walks out.',
    },
    steps: [
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  kaise: {
    early: {
      aliases: 'Kaise',
      abilities: 'Child',
      bio: 'Young daughter of Kiin and Daora, notable for a vocabulary that outruns her age and a habit of saying the quiet part loud. She and her brother Daorn orbit Sarene\'s stay in Kae with comic clarity. In a book about broken cities, Kaise is unbroken attention.',
    },
    steps: [
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  // Hoid is core: his card is on screen before any book. The published card
  // has Oathbringer's spren, Rhythm of War's refused Shard and The Sunlit
  // Man's Dawnshard in it, so it waits for The Sunlit Man.
  hoid: {
    early: {
      fact: 'A storyteller who is always somewhere important, and never says why.',
      abilities: 'Storytelling, disguise',
      aliases: 'Hoid',
      bio: 'A beggar in bandages, an informant with bad eyes, a fool at court: he wears whatever face a place needs, and his stories are never only stories. He is older than he looks, and he does not explain.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'twok',
        fact: 'The King\'s Wit, who is neither Alethi nor a fool.',
        abilities: 'Storytelling, disguise, a great deal of knowledge',
        aliases: 'Wit, Hoid, Roamer',
        bio: 'On Roshar he is the King\'s Wit, paid to insult lighteyes, and never quite answers what he is. He says he came to chase an old acquaintance and spends most of his time hiding from him. Sigzil was his apprentice, once.',
      },
      // Endowment's Oathbringer letter opens "Dearest Cephandrius".
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'The King\'s Wit, who is neither Alethi nor a fool.',
        abilities: 'Storytelling, disguise, a great deal of knowledge',
        aliases: 'Wit, Hoid, Roamer, Cephandrius',
        bio: 'On Roshar he is the King\'s Wit, paid to insult lighteyes, and never quite answers what he is. He says he came to chase an old acquaintance and spends most of his time hiding from him. Sigzil was his apprentice, once.',
      },
      { book: 'sunlit', arc: 'sunlit', published: true },
    ],
  },
  sigzil: {
    early: {
      fact: 'Hoid\'s apprentice, keeping Bridge Four\'s accounts.',
      abilities: 'Bridgeman, scholar',
      aliases: 'Sigzil',
      bio: 'An Azish man who apprenticed to Hoid and then to a bridge crew. He writes down what the others survive.',
    },
    // The Sunlit Man (2023) came out a year before Wind and Truth. With
    // Sunlit as the published step, its readers got Narak, Vienta, the Night
    // of Sorrows and Szeth's old highspren. Sunlit tells who Nomad is; Wind
    // and Truth tells how he got there. (Auxiliary, Coppermind: tsm 20, 28; sa5 147.)
    steps: [
      {
        book: 'sunlit', arc: 'sunlit',
        bio: 'Bridge Four\'s Azish Worldsinger and Hoid\'s apprentice. He becomes the man called Nomad: bonded to a highspren, Aux, hunted across the stars by the Night Brigade, and learning that skipping is not the same as escaping.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Coppermind: Design (sa3 98, sa4 80; yumi 5, 17, 21, 32, 33, ae; WoB 10746).
  // Komashi, the noodle shop and the disguise are Yumi's.
  design: {
    early: {
      fact: 'Hoid\'s Cryptic. She spoils his endings on purpose.',
      abilities: 'Cryptic, Lightweaver bond',
      aliases: 'Design',
      bio: 'The Cryptic Hoid found in Kholinar, near where Elhokar died, and bonded himself. She plays his flute without lips and considers surprises dumb.',
    },
    steps: [
      // Coppermind: "The Dog and the Dragon" is Rhythm of War ch. 80.
      {
        book: 'stormlight', arc: 'row',
        fact: 'Hoid\'s Cryptic. She spoils his endings on purpose.',
        abilities: 'Cryptic, Lightweaver bond',
        aliases: 'Design',
        bio: 'The Cryptic Hoid found in Kholinar, near where Elhokar died, and bonded himself. She plays his flute without lips, considers surprises dumb, and told Kaladin how the Dog and the Dragon ends before Hoid could.',
      },
      { book: 'yumi', arc: 'yumi', published: true },
    ],
  },
  // Isles of the Emberdark is Sixth of the Dusk retold and carried on five
  // years. The novella's cast keep the novella's card until it is read.
  dusk: {
    early: {
      fact: 'A man of Patji facing a sky full of other worlds.',
      abilities: 'Trapper, Aviar-bonded',
      aliases: 'Dusk',
      bio: 'A trapper of the Pantheon who trusts Aviar more than people and wants Patji left alone. Then the Company comes with Vathi and a machine from the Ones Above, and he has to decide whether First of the Sun can stay as it is in a cosmere that has already noticed it.',
    },
    steps: [
      { book: 'emberdark', arc: 'emberdark', published: true },
    ],
  },
  kokerlii: {
    early: {
      bio: 'A cheerful, chattering bird who stays close because he would not fit in with wild Aviar. His talent masks all mental activity near him, which on Patji, where deepwalkers and nightmaws hunt by thought, is the difference between a trapper and a skeleton; it weakens as he flies further off.',
    },
    steps: [
      { book: 'emberdark', arc: 'emberdark', published: true },
    ],
  },
  nazh: {
    early: {
      abilities: 'Worldhopper, mapmaker',
      bio: 'Khriss\'s long-suffering Threnodite agent: map thief, annotator, and professional complainer. If a chart in your edition has dry sarcasm in the margins, that is Nazh earning his keep.',
    },
    steps: [
      { book: 'emberdark', arc: 'emberdark', published: true },
    ],
  },
  frost: {
    early: {
      bio: 'Oldest dragon still corresponding with Hoid — mentor, critic, and Seventeenth Shard voice for non-intervention. He watches the Cosmere tilt toward war and still prefers letters to cataclysm.',
    },
    steps: [
      { book: 'emberdark', arc: 'emberdark', published: true },
    ],
  },
  crow: {
    early: {
      bio: 'Her verdant parasite stops anything that would break her skin and drinks her dry for it, and she has outlived the usual span by a year on stubbornness. She talked a merchant crew into piracy to dodge the king\'s war, then had Laggart sink the Oot\'s Dream so they would be deadrunners with nowhere left to go but the Crimson Sea. She meant to sell Tress to Xisis for a cure. Tress sold her first.',
    },
    steps: [
      { book: 'emberdark', arc: 'emberdark', published: true },
    ],
  },
  // Coppermind: Ulaam (mb7 12). The Lost Metal gives him one scene; Tress gives him a ship.
  ulaam: {
    early: {
      fact: 'A kandra. He and TenSoon took MeLaan aside about Wayne.',
      abilities: 'Kandra',
      aliases: 'Ulaam',
      bio: 'A kandra on Scadrial who, with TenSoon, warned MeLaan about her relationship with Wayne. That is the whole of what The Lost Metal says about him.',
    },
    steps: [
      { book: 'tress', arc: 'tress', published: true },
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
      { book: 'stormlight', arc: 'dawnshard', bio: 'A Thaylen merchant who lost the use of her legs in a fall on Relu-na, raised a larkin, and at Akinah became the bearer of the Dawnshard Change, which the Sleepless had guarded for millennia. It lies dormant in her, though she can sense life.' },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },

  // ── Found by `npm run audit:spoilers`: published cards a book early ───────
  // Each of these had no face, so its first book showed a later book's ending.
  // Coppermind: Dabbid (sa4); the occupation of Urithiru is Rhythm of War.
  dabbid: {
    early: {
      fact: 'Silent Bridge Four brother, shell-shocked from the runs.',
      abilities: 'Bridge Four',
      bio: 'Shell-shocked from the bridge runs and silent ever since, he stays easy to overlook.',
    },
    steps: [
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  // Coppermind: Eth dies in the Honorblade theft, Oathbringer interlude 14.
  eth: {
    early: {
      fact: 'Bridge Four, Mart\'s brother.',
      abilities: 'Bridge Four',
      bio: 'Mart\'s brother, and one of the men of Bridge Four.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  // Coppermind: the Third Ideal and Caelinora are Dawnshard (ch. 18); the
  // Thaylen patent with Rysn is Wind and Truth interlude 15.
  huio: {
    early: {
      fact: 'Lopen\'s cousin, and a cook.',
      abilities: 'Cook · Bridge Four',
      bio: 'One of Lopen\'s Herdazian cousins, short, bald and beefy, brought into Bridge Four late in 1173; he would rather be on kitchen duty with Rock, and improves Rock\'s recipes.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'dawnshard',
        fact: 'Lopen\'s cousin: a cook, and a Windrunner.',
        abilities: 'Windrunner of the Third Ideal (Caelinora) · cook',
        bio: 'One of Lopen\'s Herdazian cousins, short, bald and beefy, brought into Bridge Four late in 1173; he would rather be on kitchen duty with Rock, and improves Rock\'s recipes. Off Aimia he fought a yu-thorak to save the Wandersail, swore the Third Ideal to save Lopen, and summoned his honorspren Caelinora as a Shardhammer.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Coppermind: her hatred of humans and of Odium, and the Five, are Wind and Truth ch. 58.
  bila: {
    early: {
      fact: 'Thude\'s mate and warpair.',
      abilities: 'Listener warrior · warpair with Thude',
      bio: 'A listener warrior in Eshonai\'s own division, Thude\'s mate and warpair through the War of Reckoning.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Coppermind: his ashspren and his Surgebinding are Dawnshard ch. 3.
  'ral-na': {
    early: {
      abilities: 'King of Relu-na',
      bio: 'King of the Reshi people who live on Relu-na, a living greatshell island in the Reshi Sea. Vstim brought Rysn to trade with him, and she learned there what a fall costs.',
    },
    steps: [
      { book: 'stormlight', arc: 'dawnshard', published: true },
    ],
  },
  // Coppermind: the Black Fisher is a Death Rattle in The Way of Kings
  // (ch. 67 epigraph); that she is one of the Unmade is Oathbringer (ch. 62),
  // Odium's fear of her and the Elsegate are Wind and Truth (i-3, ch. 67).
  'dai-gonarthis': {
    early: {
      fact: 'The Black Fisher, named in a Death Rattle.',
      abilities: 'Unknown',
      bio: 'A name in the Death Rattles: a dying street juggler cried that the Black Fisher holds her sorrow and consumes it.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'oathbringer',
        fact: 'The Black Fisher: one of the Unmade.',
        bio: 'Called the Black Fisher, and one of the Unmade. Hessi wonders whether she scoured Aimia.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Coppermind: Masha's history of the Recreance is Oathbringer ch. 56; her
  // marriage, Stormfall and Knights of Wind and Truth are Wind and Truth epigraphs.
  'masha-daughter-shaliv': {
    early: {
      fact: 'A Shin scholar of the Recreance.',
      aliases: 'Masha',
      bio: 'A Shin scholar whose history of the Recreance Jasnah checks against Dalinar\'s visions.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Bleeder is Shadows of Self.
  'bloody-tan': {
    early: {
      bio: 'A slender, soft-spoken mortician who believed people were puppets and their deaths performances, and who killed at least eight of them in two months while lawmen and outlaws both hunted him. He stole Donal\'s bendalloy for the money, captured Lessie in his lair, and when Wax fired, yanked her into the path of the bullet. Wax shot him in the head.',
    },
    steps: [
      { book: 'mistborn2', arc: 'sos', published: true },
    ],
  },
  // The Unmade in Kholinar are Oathbringer.
  lhan: {
    early: {
      bio: 'A comfortably corrupt ardent in Aesudan\'s palace circle. His interlude with Pai sketches Kholinar\'s moral rot.',
    },
    steps: [
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
  // Aradel and Marasi are Shadows of Self; Marasi serving under Reddi is The Bands of Mourning.
  reddi: {
    early: {
      fact: 'A Fourth Octant constable, polite to Wax\'s face and less so behind it.',
      aliases: 'Reddi',
      bio: 'A short, lean constable with a drooping moustache, polite to Wax\'s face and less so behind it. He counted the casualties of the Yomen-Ostlin wedding for Brettin and was impressed in spite of himself.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'sos',
        fact: 'The constable who wanted Marasi\'s job.',
        aliases: 'Reddi, Mathieu Reddi',
        bio: 'A short, lean constable with a drooping moustache, polite to Wax\'s face and less so behind it. He counted the casualties of the Yomen-Ostlin wedding for Brettin and was impressed in spite of himself. He wanted to be Aradel\'s assistant; Aradel chose Marasi, and their rivalry — his confessions beaten out of suspects, hers coaxed — became part of how the Fourth Octant works.',
      },
      { book: 'mistborn2', arc: 'bom', published: true },
    ],
  },
  // Adolin and Shallan are Words of Radiance.
  janala: {
    early: {
      bio: 'A lighteyed woman briefly courted by Adolin in the warcamps.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  // Coppermind: in The Way of Kings Restares is a name — Gavilar, dying, asks
  // whether he sent the assassin (prologue), and Amaram takes Kaladin's Shards
  // because "Restares is right" (ch. 51). The Sons of Honor are Words of
  // Radiance (chs. 54, 88); Gavilar's place among them is Oathbringer (ch. 40).
  restares: {
    early: {
      fact: 'A name in Gavilar\'s last night, and the man Amaram says is right.',
      abilities: '—',
      bio: 'Dying, Gavilar wonders whether Restares sent his assassin. Amaram takes the Shards Kaladin won because, he says, Restares is right: this is what must be done.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        bio: 'Senior figure in the Sons of Honor, and the voice in the letters that push Amaram toward bringing back the Heralds by forcing a Desolation — Vorin nostalgia as apocalypse plan.',
      },
      { book: 'stormlight', arc: 'oathbringer', published: true },
    ],
  },
};
