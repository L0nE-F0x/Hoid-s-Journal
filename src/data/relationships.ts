/**
 * Typed edges for the Lore Web. Both ends must be spoiler-visible to draw.
 * Structural edges (origin, invested) are derived in the web, not listed here.
 */
export type RelKind = 'character' | 'shard' | 'body' | 'dawnshard';
export type RelType = 'family' | 'romance' | 'mentor' | 'ally' | 'rival' | 'bond' | 'vessel';

export interface Relation {
  a: { kind: RelKind; id: string };
  b: { kind: RelKind; id: string };
  type: RelType;
  label: string;
  book: string;
  canon?: 'canon' | 'wob';
}

export const REL_TYPES: Record<RelType, { label: string; color: string }> = {
  family: { label: 'Family', color: '#f472b6' },
  romance: { label: 'Romance', color: '#fb7185' },
  mentor: { label: 'Mentor', color: '#38bdf8' },
  ally: { label: 'Ally', color: '#4ade80' },
  rival: { label: 'Rivalry', color: '#ef4444' },
  bond: { label: 'Spren bond', color: '#a78bfa' },
  vessel: { label: 'Vessel', color: '#fbbf24' },
};

const C = 'canon' as const;
const W = 'wob' as const;

export const RELATIONS: Relation[] = [
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'shard', id: 'honor' }, type: 'bond', label: 'Windrunner', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'dalinar' }, b: { kind: 'shard', id: 'honor' }, type: 'bond', label: 'Bondsmith', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'jasnah' }, b: { kind: 'shard', id: 'cultivation' }, type: 'bond', label: 'Elsecaller', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'vin' }, b: { kind: 'shard', id: 'preservation' }, type: 'vessel', label: 'Held Preservation', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'sazed' }, b: { kind: 'shard', id: 'preservation' }, type: 'vessel', label: 'Harmony', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'sazed' }, b: { kind: 'shard', id: 'ruin' }, type: 'vessel', label: 'Harmony', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'taravangian' }, b: { kind: 'shard', id: 'odium' }, type: 'vessel', label: 'Odium → Retribution', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'taravangian' }, b: { kind: 'shard', id: 'honor' }, type: 'vessel', label: 'Took Honor', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'kelsier' }, b: { kind: 'character', id: 'marsh' }, type: 'family', label: 'Brothers', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'vin' }, b: { kind: 'character', id: 'elend' }, type: 'romance', label: 'Married', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'dalinar' }, b: { kind: 'character', id: 'adolin' }, type: 'family', label: 'Father & son', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'dalinar' }, b: { kind: 'character', id: 'renarin' }, type: 'family', label: 'Father & son', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'dalinar' }, b: { kind: 'character', id: 'navani' }, type: 'romance', label: 'Married', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'adolin' }, b: { kind: 'character', id: 'shallan' }, type: 'romance', label: 'Married', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'jasnah' }, b: { kind: 'character', id: 'dalinar' }, type: 'family', label: 'Niece & uncle', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'venli' }, b: { kind: 'character', id: 'eshonai' }, type: 'family', label: 'Sisters', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'hoid' }, b: { kind: 'character', id: 'sigzil' }, type: 'mentor', label: 'Mentor & apprentice', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'hoid' }, b: { kind: 'character', id: 'khriss' }, type: 'ally', label: 'Cosmere scholars', book: 'arcanum', canon: W },
  { a: { kind: 'character', id: 'khriss' }, b: { kind: 'character', id: 'nazh' }, type: 'ally', label: 'Scholar & agent', book: 'arcanum', canon: C },
  { a: { kind: 'character', id: 'vasher' }, b: { kind: 'character', id: 'azure' }, type: 'romance', label: 'Partners', book: 'warbreaker', canon: C },
  { a: { kind: 'character', id: 'kelsier' }, b: { kind: 'character', id: 'vin' }, type: 'mentor', label: 'Mentor & apprentice', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'hoid' }, b: { kind: 'shard', id: 'odium' }, type: 'rival', label: 'Opposes Odium', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'frost' }, b: { kind: 'character', id: 'hoid' }, type: 'ally', label: 'Old friends', book: 'core', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'moash' }, type: 'rival', label: 'Former friend', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'szeth' }, type: 'rival', label: 'Duelists', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'vin' }, b: { kind: 'character', id: 'lord-ruler' }, type: 'rival', label: 'Slew the Lord Ruler', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'teft' }, type: 'ally', label: 'Bridge Four', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'rock' }, type: 'ally', label: 'Bridge Four', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'rlain' }, type: 'ally', label: 'Bridge Four', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'sigzil' }, type: 'ally', label: 'Bridge Four', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'kaladin' }, b: { kind: 'character', id: 'lopen' }, type: 'ally', label: 'Bridge Four', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'wax' }, b: { kind: 'character', id: 'wayne' }, type: 'ally', label: 'Partners', book: 'mistborn2', canon: C },
  { a: { kind: 'character', id: 'wax' }, b: { kind: 'character', id: 'steris' }, type: 'romance', label: 'Married', book: 'mistborn2', canon: C },
  { a: { kind: 'character', id: 'wax' }, b: { kind: 'character', id: 'marasi' }, type: 'ally', label: 'Constabulary', book: 'mistborn2', canon: C },
  { a: { kind: 'character', id: 'sazed' }, b: { kind: 'character', id: 'kelsier' }, type: 'ally', label: "Survivor's crew", book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'marsh' }, b: { kind: 'shard', id: 'ruin' }, type: 'bond', label: 'Hemalurgically bound', book: 'mistborn1', canon: C },
  { a: { kind: 'character', id: 'hoid' }, b: { kind: 'character', id: 'kelsier' }, type: 'rival', label: 'Wary acquaintances', book: 'secrethistory', canon: C },
  { a: { kind: 'character', id: 'hoid' }, b: { kind: 'character', id: 'vasher' }, type: 'ally', label: 'Long acquaintance', book: 'warbreaker', canon: W },
  { a: { kind: 'character', id: 'rysn' }, b: { kind: 'dawnshard', id: 'dawnshard-change' }, type: 'bond', label: 'Bears Change', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'mraize' }, b: { kind: 'character', id: 'kelsier' }, type: 'ally', label: 'Ghostbloods', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'design' }, b: { kind: 'character', id: 'hoid' }, type: 'bond', label: "Hoid's spren", book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'nightblood' }, b: { kind: 'character', id: 'vasher' }, type: 'bond', label: 'Created Nightblood', book: 'warbreaker', canon: C },
  { a: { kind: 'character', id: 'nightblood' }, b: { kind: 'character', id: 'szeth' }, type: 'bond', label: 'Wields Nightblood', book: 'stormlight', canon: C },
  { a: { kind: 'character', id: 'frost' }, b: { kind: 'body', id: 'yolen' }, type: 'ally', label: 'Dragon of Yolen', book: 'core', canon: C },
  { a: { kind: 'character', id: 'xisis' }, b: { kind: 'body', id: 'lumar-world' }, type: 'ally', label: 'Under the Crimson Sea', book: 'tress', canon: C },
];
