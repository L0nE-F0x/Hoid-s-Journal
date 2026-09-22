export type CanonLevel = 'canon' | 'wob' | 'speculation' | 'noncanon';

export interface Cited {
  canon: CanonLevel;
  sources: string[];
  fieldNotes?: Record<string, { canon: CanonLevel; note: string }>;
}

export type BodyKind =
  | 'shardworld' | 'minor-shardworld' | 'planet' | 'gas-giant' | 'dwarf-planet';

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

/**
 * A second star in the same system. Its orbit is measured from the system
 * centre, exactly like a planet's, so a companion that shares a planet's
 * `omega` and `period` stays on the same bearing forever — which is how
 * Taldain keeps one face to each of its two suns.
 */
export interface CompanionStar {
  id: string;
  name: string;
  color: string;
  /** Billboard size against the primary's. */
  size: number;
  orbit: Orbit;
  fact: string;
  /** A disc of dust around the star itself, as the Eye of Ridos wears. */
  shroud?: string;
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
  /** What canon calls the star, where canon names it at all. */
  starName?: string;
  /** What the star *is*: 'a large white star', 'a faint white dwarf'. */
  starDesc?: string;
  /** Second and further stars. The primary sits at `position`. */
  companions?: CompanionStar[];
  /**
   * Size of the Investiture cloud, against the standard 26 units. A system
   * canon names without describing has no Investiture we can claim for it,
   * and a full-sized cloud over a placeholder star says more than we know.
   */
  nebulaScale?: number;
  aliases?: string;
  /** One line for the system card, above the roster of worlds. */
  fact?: string;
  wiki?: string;
  sources?: string[];
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
  /** Other names a reader might search for. Space-thin, comma separated. */
  aliases?: string;
  see?: string[];
  wiki?: string;
  biome: BiomeKind;
  hasSurface: boolean;
  /**
   * A ring system, where canon gives the world one. Radii are multiples of
   * the body's own radius; the two colours are the bright inner band and the
   * dusty outer one.
   */
  rings?: { inner: number; outer: number; color: string; color2: string; tilt?: number };
  /**
   * Double planets. Two worlds close enough to swing around each other rather
   * than round the star separately — UTol and Komashi are the pair canon has.
   * The orbit is then measured from that partner, not from the sun.
   */
  orbitAround?: string;
  /** First playhead era this world exists as the thing we are drawing. */
  eraMin?: number;
  eraMax?: number;
}

export type BeltKind = 'asteroid' | 'comet';

/**
 * A belt of rubble or ice around a star. Not a body: it has no globe, no
 * surface and no card in the atlas — it is drawn as the band of specks the
 * Arcanum star charts show, and it exists because a system with a gap where
 * its asteroid belt should be is a system drawn wrong.
 */
export interface Belt extends Cited {
  id: string;
  name: string;
  system: string;
  book: string;
  arc?: string;
  kind: BeltKind;
  /** Inner and outer radius, system-local units — the same scale as `Orbit.a`. */
  inner: number;
  outer: number;
  color: string;
  fact: string;
  bio?: string;
  aliases?: string;
  see?: string[];
  wiki?: string;
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
  aliases?: string;
  see?: string[];
  wiki?: string;
  eras: ShardEra[];
}

export interface CharacterEra {
  era: number;
  system: string;
  body?: string;
  /**
   * A place on `body`, when a book names where they are. Absent means
   * "on this world" and the sky scatters them — it is not a coordinate.
   */
  at?: string;
  /**
   * This row applies once the reader has reached `arc`. `book` overrides the
   * person's own series when the move happens in a later publication.
   */
  arc?: string;
  book?: string;
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
  aliases?: string;
  see?: string[];
  wiki?: string;
  table?: {
    kind: string;
    cols: string[];
    rows: string[][];
    details?: string[];
    /**
     * Parallel to `rows`. A row with an arc stays off the table until the
     * reader has reached it on this magic's own book. Reread sees every row.
     */
    rowArc?: (string | undefined)[];
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
  aliases?: string;
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
  /**
   * The encyclopedia entry this mark *is*, when the place also has a pin on
   * the globe. Ids are unique across every kind, so a mark cannot simply reuse
   * the location's; this is how the plate hands the reader the fuller card.
   */
  entry?: string;
  u: number;
  v: number;
  color: string;
  desc: string;
  book?: string;
  arc?: string;
  /**
   * Coordinates measured on a Stewart file. `u`/`v` belong to the procedural
   * plate; a published raster does not share them. One entry per file, because
   * Luthadel's survey and the Kredik Shaw close-up are not the same picture.
   */
  on?: { file: string; u: number; v: number }[];
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
  aliases?: string;
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
  aliases?: string;
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
  aliases?: string;
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
  belts: Belt[];
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
