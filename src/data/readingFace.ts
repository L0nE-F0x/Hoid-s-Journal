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
  // Elantris and The Emperor's Soul do not know where these two end up. The
  // Lost Metal does.
  shai: {
    early: {
      aliases: 'Wan ShaiLu',
      abilities: 'Forger',
      bio: 'A Forger who rewrites objects — and herself — with stamps and research. Imprisoned to restore an emperor\'s soul, she walks out having forged a life the court cannot quite revoke.',
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
