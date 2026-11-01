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
  // Thaidakar is a Rhythm of War reveal and Secret History a later series
  // in publication order, so the Stormlight step comes first and Secret
  // History, the fuller story, publishes the card.
  kelsier: {
    early: {
      fact: 'The Survivor of Hathsin, building a crew to kill a god.',
      abilities: 'Mistborn',
      aliases: 'Survivor, Survivor of Hathsin',
      bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He is going to kill the Lord Ruler, and he has convinced a crew to help.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'row',
        fact: 'The Survivor of Hathsin — and Thaidakar of the Ghostbloods.',
        abilities: 'Mistborn, Cognitive Shadow',
        aliases: 'Survivor, Survivor of Hathsin, Thaidakar, Lord of Scars',
        bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He died at the Lord Ruler\'s hand, and the Ghostbloods\' Thaidakar turns out to be the same man. He cannot easily leave the Scadrian system.',
      },
      { book: 'secrethistory', arc: 'secrethistory', published: true },
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
      {
        book: 'whitesand', arc: 'ws3',
        fact: 'Khriss\'s guard and the Dynasty\'s agent — and, it turns out, a sand master.',
        abilities: 'Soldier, Dynasty agent, sand master',
        bio: 'Sent to judge whether sand masters threaten the Dynasty, he reports that they do not, since sand needs Dayside\'s sun, and takes his post with Khriss back. On the voyage home he passes the sand master\'s test with a massive release of power.',
      },
      { book: 'stormlight', arc: 'twok', published: true },
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
