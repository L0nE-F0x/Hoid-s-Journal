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
  // Mistborn Era 2 — Lessie is a Shadows of Self reveal; the wedding, the
  // Set's leadership and the Malwish are The Bands of Mourning; the rest is
  // The Lost Metal.
  { a: 'wax', b: 'paalm', arc: 'sos' },
  { a: 'paalm', b: 'innate', arc: 'sos' },
  { a: 'vwafendal', b: 'wax', arc: 'sos' },
  { a: 'aradel', b: 'marasi', arc: 'sos' },
  { a: 'reddi', b: 'marasi', arc: 'sos' },
  { a: 'wayne', b: 'allriandre', arc: 'sos' },
  { a: 'wax', b: 'steris', arc: 'bom' },
  { a: 'telsin', b: 'edwarn-ladrian', arc: 'bom' },
  { a: 'telsin', b: 'the-set', arc: 'bom' },
  { a: 'kelesina-shores', b: 'reluur', arc: 'bom' },
  { a: 'allik', b: 'jordis', arc: 'bom' },
  { a: 'wayne', b: 'marasi', arc: 'tlm' },
  { a: 'wayne', b: 'melaan', arc: 'tlm' },
  { a: 'marasi', b: 'allik', arc: 'tlm' },
  { a: 'ranette', b: 'jaxy', arc: 'tlm' },
  { a: 'wax', b: 'maxillium-ladrian', arc: 'tlm' },
  { a: 'steris', b: 'maxillium-ladrian', arc: 'tlm' },
  { a: 'wax', b: 'tindwyl-ladrian', arc: 'tlm' },
  { a: 'steris', b: 'tindwyl-ladrian', arc: 'tlm' },
  { a: 'armal', b: 'marasi', arc: 'tlm' },
  { a: 'dlavil', b: 'iyatil', arc: 'tlm' },
  { a: 'steris', b: 'varlance', arc: 'tlm' },
  { a: 'wayne', b: 'sazed', arc: 'tlm' },
  { a: 'wax', b: 'dumad', arc: 'tlm' },
  { a: 'wayne', b: 'getruda', arc: 'tlm' },
  { a: 'wayne', b: 'dumad', arc: 'tlm' },
  { a: 'wax', b: 'getruda', arc: 'tlm' },
  { a: 'marasi', b: 'granks', arc: 'tlm' },
  { a: 'marasi', b: 'gave-entrone', arc: 'tlm' },
  { a: 'marasi', b: 'shai', arc: 'tlm' },
  { a: 'marasi', b: 'twinsoul', arc: 'tlm' },
  { a: 'dlavil', b: 'marasi', arc: 'tlm' },
  { a: 'marasi', b: 'ghostbloods', arc: 'tlm' },
  { a: 'shai', b: 'ghostbloods', arc: 'tlm' },
  { a: 'kaise', b: 'ghostbloods', arc: 'tlm' },
  { a: 'twinsoul', b: 'ghostbloods', arc: 'tlm' },
  { a: 'telsin', b: 'autonomy', arc: 'tlm' },
  { a: 'bavadin', b: 'autonomy', arc: 'tlm' },
  { a: 'marasi', b: 'elendel-constabulary', arc: 'sos' },
  { a: 'wayne', b: 'elendel-constabulary', arc: 'tlm' },
  { a: 'gave-entrone', b: 'the-set', arc: 'tlm' },
  { a: 'irich', b: 'the-set', arc: 'bom' },
];
