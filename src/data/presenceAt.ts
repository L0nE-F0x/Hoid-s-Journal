/**
 * Where a book puts someone, when it actually says.
 *
 * A row here is copied onto that person's era. No row means the sky scatters
 * them on the world and does not pretend to know the street. `book` is set
 * when the move is published in a different series than the person's own.
 */
export interface PlaceBeat {
  era: number;
  at: string;
  arc?: string;
  book?: string;
}

export const PRESENCE_AT: Record<string, PlaceBeat[]> = {
  kaladin: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  shallan: [
    { era: 3, at: 'shattered-plains', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  dalinar: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  adolin: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  renarin: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  navani: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  jasnah: [
    { era: 3, at: 'kharbranth', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  teft: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'wor' },
  ],
  rock: [
    { era: 3, at: 'warcamps', arc: 'twok' },
    { era: 3, at: 'horneater-peaks', arc: 'row' },
  ],
  lift: [
    { era: 3, at: 'yeddaw', arc: 'edgedancer' },
    { era: 3, at: 'urithiru', arc: 'oathbringer' },
  ],
  eshonai: [{ era: 3, at: 'narak', arc: 'twok' }],
  venli: [
    { era: 3, at: 'narak', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'row' },
  ],
  taravangian: [
    { era: 3, at: 'kharbranth', arc: 'twok' },
    { era: 3, at: 'urithiru', arc: 'row' },
  ],
  sigzil: [{ era: 3, at: 'urithiru', arc: 'wor' }],
  galladon: [
    { era: 1, at: 'elantris-city' },
    { era: 3, at: 'purelake', book: 'stormlight', arc: 'twok' },
  ],
  vin: [{ era: 2, at: 'luthadel' }],
  elend: [{ era: 2, at: 'luthadel' }],
  kelsier: [{ era: 2, at: 'luthadel', arc: 'tfe' }],
  sazed: [{ era: 2, at: 'luthadel', arc: 'tfe' }],
  spook: [
    { era: 2, at: 'luthadel', arc: 'tfe' },
    { era: 2, at: 'urteau', arc: 'hoa' },
  ],
  'lord-ruler': [{ era: 2, at: 'luthadel' }],
  wax: [{ era: 4, at: 'elendel' }],
  wayne: [{ era: 4, at: 'elendel' }],
  marasi: [{ era: 4, at: 'elendel' }],
  steris: [{ era: 4, at: 'elendel' }],
  raoden: [{ era: 1, at: 'elantris-city' }],
  sarene: [{ era: 1, at: 'elantris-city' }],
  hrathen: [{ era: 1, at: 'elantris-city' }],
  siri: [{ era: 2, at: 'ttelir' }],
  susebron: [{ era: 2, at: 'ttelir' }],
  lightsong: [{ era: 2, at: 'ttelir' }],
  vasher: [{ era: 2, at: 'ttelir' }],
  azure: [
    { era: 2, at: 'ttelir' },
    { era: 3, at: 'kholinar', book: 'stormlight', arc: 'oathbringer' },
  ],
  kenton: [{ era: 2, at: 'kezare' }],
  yumi: [{ era: 4, at: 'torio' }],
  painter: [{ era: 4, at: 'kilahito' }],
  silence: [{ era: 2, at: 'forests-of-hell' }],
  dusk: [
    { era: 4, at: 'patji' },
    { era: 5, at: 'patji' },
  ],
};
