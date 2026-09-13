export type CanonLevel = 'canon' | 'wob' | 'speculation' | 'noncanon';

export interface Cited {
  canon: CanonLevel;
  sources: string[];
  fieldNotes?: Record<string, { canon: CanonLevel; note: string }>;
}

export type BodyKind = 'shardworld' | 'minor-shardworld' | 'planet' | 'gas-giant';

export type BiomeKind =
  | 'roshar'
  | 'scadrial-ash'
  | 'scadrial-basin'
  | 'nalthis'
  | 'taldain'
  | 'sel'
  | 'threnody'
  | 'lumar'
  | 'canticle'
  | 'komashi'
  | 'yolen'
  | 'ashyn'
  | 'braize'
  | 'first-sun'
  | 'gas'
  | 'barren'
  | 'oceanic';

export interface Series {
  id: string;
  title: string;
  single?: boolean;
  arcs: { id: string; label: string }[];
}

export interface Era {
  id: number;
  name: string;
  start: number;
  event: string;
  realDate: string;
  chrono: string;
  canon: CanonLevel;
  sources: string[];
}

export interface System {
  id: string;
  name: string;
  sunColor: string;
  /** Designed Cosmere layout, not astronomy. */
  position: [number, number, number];
  book: string;
  nebula: string;
}

export interface Orbit {
  /** Semi-major axis in system-local units. */
  a: number;
  e: number;
  /** Inclination, radians. */
  i: number;
  omega: number;
  /** Revolutions per Cosmere playhead-year. */
  period: number;
}

export interface Body extends Cited {
  id: string;
  name: string;
  system: string;
  book: string;
  arc?: string;
  kind: BodyKind;
  color: string;
  orbit: Orbit;
  radius: number;
  shards: string[];
  magic: string[];
  species: string[];
  locations: string;
  fact: string;
  bio?: string;
  see?: string[];
  wiki?: string;
  biome: BiomeKind;
  hasSurface: boolean;
  /** First playhead era this world exists as the thing we are drawing. */
  eraMin?: number;
  eraMax?: number;
}

export interface Moon extends Cited {
  id: string;
  name: string;
  parent: string;
  book: string;
  color: string;
  orbit: Orbit;
  radius: number;
  fact: string;
  bio?: string;
  wiki?: string;
}

export interface ShardEra {
  era: number;
  status: 'whole' | 'splintered' | 'merged' | 'unknown';
  vessel: string;
  loc: string;
}

export interface Shard extends Cited {
  id: string;
  name: string;
  color: string;
  book: string;
  world: string;
  desc: string;
  bio?: string;
  intent?: string;
  see?: string[];
  wiki?: string;
  eras: ShardEra[];
}

export interface CharacterEra {
  era: number;
  system: string;
  body?: string;
}

/** What a person in the roster *is*. Drives the Directory's tabs. */
export type CharacterKind =
  | 'person'
  | 'dragon'
  | 'sleepless'
  | 'spren'
  | 'vessel'
  | 'herald'
  | 'unmade'
  | 'fused';

export interface Character extends Cited {
  id: string;
  name: string;
  color: string;
  book: string;
  arc?: string;
  aliases: string;
  origin: string;
  abilities: string;
  fact: string;
  /** Longer encyclopedia entry. The card shows this under the one-line fact. */
  bio?: string;
  /** Related entity ids (people, places, terms, orgs, shards). */
  see?: string[];
  /** Coppermind page title, not a portrait. */
  wiki?: string;
  titles?: string;
  /** Native to the Cognitive Realm, or a frequent traveller in it. */
  cognitive: boolean;
  eras: CharacterEra[];
  kind?: CharacterKind;
  /** For the ones who are not human, what they actually are. */
  biology?: string;
}

export interface Magic extends Cited {
  id: string;
  name: string;
  world: string;
  book: string;
  shard: string;
  color: string;
  type: string;
  desc: string;
  mechanics: string;
  users: string;
  bio?: string;
  see?: string[];
  wiki?: string;
  table?: {
    kind: string;
    cols: string[];
    rows: string[][];
    details?: string[];
  };
}

export type GlossaryCategory =
  | 'realmatic'
  | 'magic'
  | 'culture'
  | 'history'
  | 'creature'
  | 'object'
  | 'org'
  | 'people';

export interface GlossaryTerm extends Cited {
  id: string;
  term: string;
  book: string;
  arc?: string;
  def: string;
  aliases?: string;
  category?: GlossaryCategory;
  see?: string[];
  wiki?: string;
}

export interface Location extends Cited {
  id: string;
  name: string;
  body: string;
  book: string;
  arc?: string;
  /** Equirectangular 0..1. */
  u: number;
  v: number;
  color: string;
  icon: string;
  desc: string;
  bio?: string;
  region?: string;
  see?: string[];
  wiki?: string;
  realm?: 'physical' | 'cognitive';
  eraMaps?: string[];
  eraMin?: number;
  eraMax?: number;
}

/** A named feature on an original city plate. UVs are 0..1 on *our* plate. */
export interface CityLandmark {
  id: string;
  city: string;
  name: string;
  u: number;
  v: number;
  color: string;
  desc: string;
  book?: string;
  arc?: string;
}

export type CityKind =
  | 'urithiru'
  | 'kholinar'
  | 'kharbranth'
  | 'luthadel'
  | 'elendel'
  | 'elantris'
  | 'ttelir'
  | 'kilahito'
  | 'kezare'
  | 'hover';

export interface CityPlate {
  id: string;
  kind: CityKind;
  kicker: string;
  landmarks: CityLandmark[];
}

export interface Perpendicularity extends Cited {
  id: string;
  name: string;
  body: string;
  book: string;
  fact: string;
  /** Location id it sits at, when the geography is known. */
  at?: string;
  eraMin?: number;
  eraMax?: number;
}

export interface WorldEpoch {
  era: number;
  date: string;
  canon: CanonLevel;
}

export type HubKind = 'city' | 'fortress' | 'port' | 'pool' | 'anomaly' | 'nexus';

/**
 * A place in the Cognitive Realm that is not on a planet. Either it sits
 * between systems (Silverlight) and `between` averages their positions, or it
 * stands off one system's own subastral at `offset` units on `bearing`.
 */
export interface Hub extends Cited {
  id: string;
  name: string;
  color: string;
  book: string;
  arc?: string;
  kind: HubKind;
  fact: string;
  bio?: string;
  see?: string[];
  wiki?: string;
  /** System ids; layout averages their positions. Empty for anchored sites. */
  between?: string[];
  /** Anchor system, when this stands in one subastral rather than between. */
  system?: string;
  /** Orrery units from the anchor, and bearing in radians. */
  offset?: number;
  bearing?: number;
  /** Vertical offset, so a fortress and a port do not stack. */
  rise?: number;
  eraMin?: number;
  eraMax?: number;
}

/** A known Cognitive path between systems. */
export interface WorldhopperRoute {
  id: string;
  from: string;
  to: string;
  via?: string;
  book: string;
  arc?: string;
  fact: string;
  eraMin?: number;
  eraMax?: number;
}

export interface Dawnshard extends Cited {
  id: string;
  name: string;
  command: string;
  holder: string;
  book: string;
  arc?: string;
  fact: string;
  bio?: string;
  see?: string[];
  wiki?: string;
}

export type OrgKind =
  | 'secret'
  | 'order'
  | 'nation'
  | 'crew'
  | 'church'
  | 'guild'
  | 'species'
  | 'military'
  | 'house';

/**
 * A named group a reread actually asks about: Ghostbloods, Bridge Four,
 * the Diagram, a Radiant order. People still live in `characters`; this is
 * the org they belong to.
 */
export interface Organization extends Cited {
  id: string;
  name: string;
  color: string;
  book: string;
  arc?: string;
  world?: string;
  kind: OrgKind;
  fact: string;
  bio?: string;
  members?: string[];
  see?: string[];
  wiki?: string;
  eraMin?: number;
  eraMax?: number;
}

export interface ArcNote {
  series: string;
  arc: string;
  added: string;
  note: string;
}

export interface Cosmere {
  series: Series[];
  eras: Era[];
  systems: System[];
  bodies: Body[];
  moons: Moon[];
  shards: Shard[];
  characters: Character[];
  magics: Magic[];
  glossary: GlossaryTerm[];
  locations: Location[];
  organizations: Organization[];
  perps: Perpendicularity[];
  worldEpochs: Record<string, WorldEpoch[]>;
  timelineNote: string;
  pubOrder: string[];
}
