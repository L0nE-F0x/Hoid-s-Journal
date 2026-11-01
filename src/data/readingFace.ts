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
  // Aona and Skai: their names and their deaths are a Way of Kings letter;
  // Odium's hand is that letter's implication and Wind and Truth's statement.
  aona: {
    early: {
      fact: 'Vessel of Devotion. Long dead; Sel still runs on what she left.',
      bio: 'The original Vessel of Devotion, one of the Yolish who took up a Shard at the Shattering and went to Sel with Skai. She did not last. What she held, tangled with Dominion\'s power, is the Dor, and every Aon draws on it.',
    },
    steps: [
      { book: 'stormlight', arc: 'twok', published: true },
    ],
  },
  skai: {
    early: {
      fact: 'Vessel of Dominion. Long dead, beside Aona.',
      bio: 'The original Vessel of Dominion, who went to Sel with Aona and died there with her. Dominion is the other half of the Dor, and the skaze are its Splinters.',
    },
    steps: [
      { book: 'stormlight', arc: 'twok', published: true },
    ],
  },
  // "Lord of Scars" is Rhythm of War's name for him (ch. 82, 115) — the hint
  // Brandon pointed at for Thaidakar (WoB 15051) — so it waits for that book.
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
        fact: 'The Survivor. Death has not finished with him.',
        abilities: 'Mistborn, Cognitive Shadow',
        aliases: 'Survivor, Survivor of Hathsin',
        bio: 'A half-skaa Mistborn who walked into the Pits of Hathsin and walked out a religion. He died at the Lord Ruler\'s hand and refused to finish dying; for a little while he even held Preservation.',
      },
      {
        book: 'stormlight', arc: 'row',
        fact: 'The Survivor, and Thaidakar: master of the Ghostbloods.',
        abilities: 'Mistborn, Cognitive Shadow',
        aliases: 'Survivor, Thaidakar, Lord of Scars',
        bio: 'A half-skaa Mistborn who died at the Lord Ruler\'s hand and refused to finish dying. Three centuries on he is Thaidakar, master of the Ghostbloods — the Lord of Scars, Hoid calls him — and since he cannot leave Scadrial he runs Mraize and Iyatil by seon.',
      },
      { book: 'mistborn2', arc: 'tlm', published: true },
    ],
  },
  // The Purelake three — Grump, Thinker and Blunt in The Way of Kings
  // Interlude 1 — are Galladon, Demoux and Baon by Word of Brandon (10085,
  // 6683, 9208). Each one's own book does not know he will ever leave home.
  galladon: {
    early: {
      fact: 'A Dula in Elantris who teaches Raoden how to live there.',
      aliases: 'Galladon',
      abilities: 'Elantrian',
      bio: 'A Duladen farmer taken by the Shaod, who knows Elantris because his father was an Elantrian before him. He says "kolo?", calls people "sule", expects the worst, and helps build New Elantris anyway.',
    },
    steps: [
      { book: 'stormlight', arc: 'twok', published: true },
    ],
  },
  demoux: {
    early: {
      fact: 'A young captain in Kelsier\'s skaa army, and a believer.',
      aliases: 'Demoux',
      abilities: 'Soldier',
      bio: 'One of the skaa army\'s officers, and one of the first to believe in the Survivor.',
    },
    steps: [
      { book: 'stormlight', arc: 'twok', published: true },
    ],
  },
  baon: {
    early: {
      fact: 'Khriss\'s bodyguard on Dayside, and the Dynasty\'s man.',
      aliases: 'Baon',
      abilities: 'Soldier, marksman',
      bio: 'A Darksider soldier and crack shot who guards Khrissalla across the Kerla, and was sent by the Dynasty to judge whether the sand masters are a threat. He sees no conflict between the two jobs.',
    },
    steps: [
      { book: 'stormlight', arc: 'twok', published: true },
    ],
  },
  // Felt on Roshar is Word of Brandon (138, 9429) behind a name in Words of
  // Radiance ch. 81; the Ghostbloods and the Awakening are Wind and Truth.
  felt: {
    early: {
      fact: 'House Venture\'s best spy.',
      abilities: 'Spy, scout',
      bio: 'House Venture\'s spy, who works for a living and likes it. He watched Kelsier\'s crew for Elend and told him they were a well-funded, competent thieving crew — which is how Elend began to wonder about Valette Renoux.',
    },
    steps: [
      {
        book: 'stormlight', arc: 'wor',
        fact: 'House Venture\'s spy on Scadrial; three centuries later a Kholin scout on Roshar.',
        abilities: 'Spy, scout, worldhopper',
        bio: 'A Scadrian worldhopper (Word of Brandon). He spied for Elend in the Final Empire, and turns up on the Shattered Plains scouting for the Kholins.',
      },
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Coppermind: Iyatil (sa2 43, 54, 63, 88; sa5 28, 134; WoB 12733, 13475, 8134).
  iyatil: {
    early: {
      fact: 'Mraize\'s babsk among the Ghostbloods. The mask stays on.',
      abilities: 'Ghostblood, spy, worldhopper',
      bio: 'A small, masked woman who outranks Mraize and does not explain herself. The mask is carapace, painted, and growing into her skin; she will kill anyone who tries to take it off. After Narak she nearly killed Amaram with a blowgun.',
    },
    steps: [
      { book: 'stormlight', arc: 'wat', published: true },
    ],
  },
  // Zahel is Words of Radiance; that he is Vasher is Word of Brandon there and
  // plain by Rhythm of War.
  vasher: {
    early: {
      fact: 'A Returned who has lived too long, carrying a sword that talks.',
      aliases: 'Vasher, Warbreaker the Peaceful, Kalad',
      abilities: 'Returned, Awakener',
      bio: 'One of the Five Scholars, who made Nightblood with Shashara and once called himself Kalad. In T\'Telir he is a scruffy man in a cell who would rather nobody remembered any of that.',
    },
    steps: [
      { book: 'stormlight', arc: 'wor', published: true },
    ],
  },
  // Lady Sequence is The Bands of Mourning's twist (ch. 27); the Key and the
  // avatar are The Lost Metal.
  telsin: {
    early: {
      fact: 'Wax\'s sister. Their uncle says the Set is holding her.',
      abilities: 'Unknown',
      aliases: 'Telsin',
      bio: 'Wax\'s sister, nearly a stranger to him after twenty years of letters neither kept up. Edwarn tells Wax that if he moves against the Set, she is as good as dead.',
    },
    steps: [
      {
        book: 'mistborn2', arc: 'bom',
        fact: 'Wax\'s sister, and the Set\'s Lady Sequence.',
        abilities: 'Hemalurgic spikes: Coinshot, Bloodmaker, Leecher',
        aliases: 'Lady Sequence',
        bio: 'She played the Set\'s captive all the way to the temple, then shot her brother three times and took MeLaan\'s spikes. As Lady Sequence she outranks even Suit.',
      },
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
    steps: [
      // Coppermind: Sigzil (sa5 118, 146). Before the Sunlit step, so the
      // Sunlit card still wins once both are read.
      {
        book: 'stormlight', arc: 'wat',
        fact: 'Bridge Four\'s Worldsinger. He broke his bond to save his spren, and Hoid handed him a Dawnshard on the way out.',
        abilities: 'Windrunner (formerly); a Dawnshard',
        aliases: 'Sigzil',
        bio: 'An Azish man who apprenticed to Hoid and then to a bridge crew. On the last day he renounced his Windrunner oaths so Moash could not kill Vienta, and Hoid, about to be found by Retribution, pushed his Dawnshard into him and sent him into Shadesmar.',
      },
      { book: 'sunlit', arc: 'sunlit', published: true },
    ],
  },
  // Coppermind: Design (sa3 98, sa4 80; yumi 5, 17, 21, 32, 33, ae; WoB 10746).
  // Komashi, the noodle shop and the disguise are Yumi's.
  design: {
    early: {
      fact: 'Hoid\'s Cryptic. She spoils his endings on purpose.',
      abilities: 'Cryptic, Lightweaver bond',
      aliases: 'Design',
      bio: 'The Cryptic Hoid found in Kholinar, near where Elhokar died, and bonded himself. She plays his flute without lips, considers surprises dumb, and told Kaladin how the Dog and the Dragon ends before Hoid could.',
    },
    steps: [
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
  vathi: {
    early: {
      aliases: 'Vathi, Lady Vathi',
      abilities: 'Northern Interests Trading Company',
      bio: 'Eelakin like Dusk, but a homeisler, educated and endlessly curious, and a woman in a Company that expects her to be a clerk. She joined the Patji expedition for the science. A deepwalker took the rest of her team; she followed an Aviar locator to Dusk\'s safecamp and ended up in his trap. Together they crossed the island at night, found out why only Patji\'s birds gain talents, and worked out that the Ones Above\'s gift was a trap.',
    },
    steps: [
      { book: 'emberdark', arc: 'emberdark', published: true },
    ],
  },
  sak: {
    early: {
      bio: 'A small black bird from the mainland with a limp and a scarred wing, which is why Dusk took her to Patji as a chick and why she rides his shoulder. She ate the worms at Patji\'s Eye like any Aviar and came away with a talent nobody had seen: an image of your own corpse wherever death is waiting, a minute or so ahead. That a mainland bird could gain a talent at all was news, and Dusk kept her secret for years. When the Company opened the Ones Above\'s machine she saw the whole island die.',
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
      { book: 'stormlight', arc: 'dawnshard', published: true },
    ],
  },
};
