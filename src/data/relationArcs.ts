/**
 * When a Lore Web sentence becomes true.
 *
 * Relations are stored with a series and, until this table, no arc, so the
 * web drew "Took Honor" for anyone who had opened The Way of Kings. A pair
 * listed here is stamped with that arc. Pairs that are already true in the
 * first book of their series are absent on purpose.
 */
export const RELATION_ARCS: { a: string; b: string; arc: string }[] = [
  // Stormlight — the bond, the marriage, the ascension
  { a: 'kaladin', b: 'honor', arc: 'wor' },
  { a: 'kaladin', b: 'syl', arc: 'wor' },
  { a: 'kaladin', b: 'windrunners', arc: 'wor' },
  { a: 'kaladin', b: 'leshwi', arc: 'row' },
  { a: 'dalinar', b: 'honor', arc: 'wor' },
  { a: 'dalinar', b: 'stormfather', arc: 'wor' },
  { a: 'dalinar', b: 'bondsmiths', arc: 'wor' },
  { a: 'adolin', b: 'shallan', arc: 'oathbringer' },
  { a: 'taravangian', b: 'cultivation', arc: 'oathbringer' },
  { a: 'taravangian', b: 'dalinar', arc: 'oathbringer' },
  { a: 'taravangian', b: 'odium', arc: 'wat' },
  { a: 'taravangian', b: 'honor', arc: 'wat' },
  { a: 'koravellium', b: 'taravangian', arc: 'wat' },
  { a: 'rysn', b: 'dawnshard-change', arc: 'dawnshard' },
  { a: 'sleepless-hordes', b: 'dawnshard-change', arc: 'dawnshard' },
  { a: 'rysn', b: 'nikli', arc: 'dawnshard' },
  { a: 'navani', b: 'sibling', arc: 'row' },
  { a: 'venli', b: 'timbre', arc: 'row' },
  // Mistborn — the ascensions are the last book, not the first
  { a: 'vin', b: 'preservation', arc: 'hoa' },
  { a: 'vin', b: 'elend', arc: 'woa' },
  { a: 'sazed', b: 'preservation', arc: 'hoa' },
  { a: 'sazed', b: 'ruin', arc: 'hoa' },
];
