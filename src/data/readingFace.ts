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
      { book: 'stormlight', arc: 'row', published: true },
    ],
  },
  taravangian: {
    early: {
      fact: 'King of Kharbranth. A hospital, a Diagram, and a mind that will not hold still.',
      abilities: 'The Diagram',
      aliases: 'Vargo',
      bio: 'King of Kharbranth, who keeps a hospital of the dying and writes down what they say. On his brilliant days he is the most frightening man in Roshar. On the others he weeps, and means it.',
    },
    steps: [
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
        bio: 'Highprince Dalinar\'s heir. He duels to strip Shards from the men who would not follow his father, and survives a four-on-one stacked against him because a bridgeman jumps into the ring. He is causally betrothed to Shallan Davar, and is beginning to suspect she is the best thing that ever happened to him.',
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
