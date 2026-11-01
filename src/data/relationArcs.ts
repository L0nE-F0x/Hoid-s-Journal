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
  // Szeth: Kaladin meets him in Words of Radiance, which is also where Nale
  // revives him and hands him Nightblood; Edgedancer shows him a Skybreaker.
  { a: 'kaladin', b: 'szeth', arc: 'wor' },
  { a: 'nightblood', b: 'szeth', arc: 'wor' },
  { a: 'nale', b: 'szeth', arc: 'edgedancer' },
  // Adolin kills Sadeas in Oathbringer, not The Way of Kings
  { a: 'adolin', b: 'sadeas', arc: 'oathbringer' },
  // Azimir
  { a: 'shalash', b: 'taln', arc: 'oathbringer' },
  { a: 'shalash', b: 'jezrien', arc: 'wat' },
  { a: 'adolin', b: 'abidi', arc: 'wat' },
  { a: 'adolin', b: 'yanagawn', arc: 'wat' },
  { a: 'adolin', b: 'neziham', arc: 'wat' },
  { a: 'adolin', b: 'colot', arc: 'wat' },
  { a: 'adolin', b: 'hmask', arc: 'wat' },
  { a: 'adolin', b: 'zarb-kushkam', arc: 'wat' },
  { a: 'zarb-kushkam', b: 'gezamal-kushkam', arc: 'wat' },
  { a: 'may-aladar', b: 'aladar', arc: 'oathbringer' },
  { a: 'may-aladar', b: 'rahel', arc: 'wat' },
  { a: 'rahel', b: 'adolin', arc: 'wat' },
  { a: 'abidi', b: 'taln', arc: 'wat' },
  { a: 'maya', b: 'unoathed', arc: 'wat' },
  // Shinovar: Rhythm of War names Szeth's father; everything else is Wind and Truth
  { a: 'szeth', b: 'neturo', arc: 'row' },
  { a: 'szeth', b: 'zeenid', arc: 'wat' },
  { a: 'szeth', b: 'elid', arc: 'wat' },
  { a: 'neturo', b: 'zeenid', arc: 'wat' },
  { a: 'neturo', b: 'elid', arc: 'wat' },
  { a: 'zeenid', b: 'elid', arc: 'wat' },
  { a: 'neturo', b: 'sivi', arc: 'wat' },
  { a: 'ishar', b: 'szeth', arc: 'wat' },
  { a: 'ishar', b: 'neturo', arc: 'wat' },
  { a: 'ishar', b: 'sivi', arc: 'wat' },
  { a: 'pozen', b: 'szeth', arc: 'wat' },
  { a: 'moss-son-farrier', b: 'szeth', arc: 'wat' },
  { a: 'szeth', b: 'tuko', arc: 'wat' },
  { a: 'szeth', b: 'auxiliary', arc: 'wat' },
  { a: 'ishar', b: 'nale', arc: 'oathbringer' },
  { a: 'kaladin', b: 'ishar', arc: 'wat' },
  { a: 'kaladin', b: 'heralds', arc: 'wat' },
  { a: 'kaladin', b: 'jezrien', arc: 'wat' },
  // Mistborn — the ascensions are the last book, not the first
  { a: 'vin', b: 'preservation', arc: 'hoa' },
  { a: 'vin', b: 'elend', arc: 'woa' },
  { a: 'sazed', b: 'preservation', arc: 'hoa' },
  { a: 'sazed', b: 'ruin', arc: 'hoa' },
];
