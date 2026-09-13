import type { Organization } from './types.ts';

const C = 'canon' as const;

function org(
  id: string, name: string, color: string, book: string, kind: Organization['kind'],
  fact: string, extra: Partial<Organization> = {},
): Organization {
  return { id, name, color, book, kind, fact, canon: extra.canon ?? C, sources: extra.sources ?? [book], ...extra };
}

export const ORGS_MORE: Organization[] = [
  org('ardentia', 'The Ardentia', '#c4b5fd', 'stormlight', 'church',
    'Vorin ardents: priests, scholars and Soulcasters owned by princes yet sworn to the Almighty. They burn glyphwards while Radiants rewrite their theology.',
    {
      world: 'Roshar', wiki: 'Ardent',
      see: ['vorinism', 'vorin-church', 'soulcaster-device', 'navani'],
      bio: 'Ardents take vows that remove them from caste politics on paper and place them at the centre of it in practice. Male ardents may read; female ardents Soulcast food for armies. The return of the Knights Radiant is an existential paperwork problem.',
    }),
  org('stormwardens', 'Stormwardens', '#38bdf8', 'stormlight', 'guild',
    'Scholars who predict highstorms with charts the devout call almost blasphemous. Armies march on their numbers anyway.',
    {
      world: 'Roshar', wiki: 'Stormwarden',
      see: ['highstorm', 'vorinism', 'navani'],
    }),
  org('vorin-church', 'Vorin Church', '#818cf8', 'stormlight', 'church',
    'The institutional faith of Alethkar, Jah Keved and Kharbranth: Heralds, Callings, safehands and a hierarchy that outlived the truth of its own myths.',
    {
      world: 'Roshar', wiki: 'Vorinism',
      see: ['ardentia', 'vorinism', 'heralds'],
      members: [],
    }),
  org('house-venture', 'House Venture', '#64748b', 'mistborn1', 'house',
    'The most powerful great house of the Final Empire at its fall. Straff\'s brutality, Elend\'s books, and a keep full of secrets.',
    {
      world: 'Scadrial', wiki: 'House_Venture',
      members: ['elend', 'lord-ruler'],
      see: ['elend', 'noble-houses', 'final-empire'],
      bio: 'Venture money and Allomancy propped up the last years of the Lord Ruler\'s peace. Elend inherits the name and spends it trying not to inherit the methods.',
    }),
  org('house-ladrian', 'House Ladrian', '#fbbf24', 'mistborn2', 'house',
    'An Elendel house Wax returns to lead — ledgers, marriages, and the Roughs\' favourite lawman in a cravat.',
    {
      arc: 'aol', world: 'Scadrial', wiki: 'House_Ladrian',
      members: ['wax', 'telsin', 'steris'],
      see: ['wax', 'steris', 'ghostbloods-scadrial'],
    }),
  org('house-tekniel', 'House Tekiel', '#94a3b8', 'mistborn1', 'house',
    'A Final Empire great house, later an Elendel railway name. Tekiel trains and Tekiel pride keep showing up when freight goes missing.',
    {
      world: 'Scadrial', wiki: 'House_Tekiel',
      see: ['noble-houses', 'wax'],
    }),
  org('southern-scadrial', 'Southern Scadrial', '#f97316', 'mistborn2', 'nation',
    'The peoples below the equator who survived ice with medallions, ettmetal and the Sovereign\'s myths. Malwish masks are the face the north meets first.',
    {
      arc: 'bom', world: 'Scadrial', wiki: 'Southern_Scadrians',
      see: ['malwish', 'ettmetal', 'malwish-medallion', 'kelsier'],
      bio: 'Not a single state so much as a civilisation the Catacendre almost erased. Airships, masks and unsealed metalminds — and a religious memory of Kelsier that Elendel is not ready for.',
    }),
  org('terris-people', 'Terris', '#a3e635', 'mistborn1', 'nation',
    'The mountain people of Feruchemy, Keepers and Synod politics. The Lord Ruler tried to breed their power out; the bloodlines remembered anyway.',
    {
      world: 'Scadrial', wiki: 'Terris',
      members: ['sazed'],
      see: ['keepers', 'synod', 'feruchemy', 'sazed'],
    }),
  org('skaa-rebellion', 'Skaa rebellion', '#ef4444', 'mistborn1', 'crew',
    'The underground that Kelsier turns from despair into a knife at the Final Empire\'s throat. Yeden\'s army is only the loudest piece.',
    {
      world: 'Scadrial', wiki: 'Skaa_rebellion',
      members: ['kelsier', 'vin', 'breeze', 'ham', 'spook'],
      see: ['kelsiers-crew', 'skaa', 'final-empire'],
    }),
  org('canton-of-inquisition', 'Canton of Inquisition', '#111827', 'mistborn1', 'military',
    'The Steel Ministry\'s Spike-bearing police. Inquisitors hunt skaa Mistings and Keepers until Vin learns how to pull their linchpin spikes.',
    {
      world: 'Scadrial', wiki: 'Canton_of_Inquisition',
      members: ['marsh'],
      see: ['steel-ministry', 'inquisitor', 'hemalurgy', 'marsh'],
    }),
  org('last-legion', 'Last Legion', '#86efac', 'stormlight', 'military',
    'The listeners\' ancestors who fled their gods and settled the Shattered Plains. Songs remember what histories forgot.',
    {
      world: 'Roshar', wiki: 'Last_Legion',
      members: ['eshonai', 'venli', 'rlain'],
      see: ['listeners', 'listener-song', 'parshendi'],
    }),
  org('singers-nation', 'Singer nation (Urithiru / coalition)', '#4ade80', 'stormlight', 'nation',
    'Venli\'s project after stormform: singers who will not be Odium\'s property or humanity\'s slaves. Fragile, necessary, unfinished.',
    {
      arc: 'row', world: 'Roshar', wiki: 'Singer',
      members: ['venli', 'rlain', 'leshwi'],
      see: ['venli', 'listeners', 'fused'],
    }),
  org('iriali', 'The Iriali', '#fde047', 'stormlight', 'nation',
    'Golden-haired people of the Long Trail — seven Lands, a religion of experience, and a habit of leaving before the ending.',
    {
      world: 'Roshar', wiki: 'Iriali',
      see: ['yolish-lightweaving', 'hoid'],
      bio: 'They claim this Rosharan chapter is only one Land on a longer journey. By Wind and Truth the leaving begins again, Cosmere tickets included.',
    }),
  org('shin-stone-shamans', 'Shin stone shamans', '#e7e5e4', 'stormlight', 'church',
    'Religious rulers of Shinovar who keep Honorblades and call walking on stone a sin. They made Szeth Truthless.',
    {
      world: 'Roshar', wiki: 'Stone_Shamanism',
      members: ['szeth'],
      see: ['szeth', 'honorblade', 'truthless'],
    }),
  org('thaylen-guilds', 'Thaylen guilds', '#22d3ee', 'stormlight', 'guild',
    'Merchant houses and naval money that keep Thaylenah rich between storms. Rysn\'s career starts in their ledgers.',
    {
      world: 'Roshar', wiki: 'Thaylenah',
      members: ['rysn'],
      see: ['rysn', 'dawnshard'],
    }),
  org('azish-empire', 'Azish Empire', '#f59e0b', 'stormlight', 'nation',
    'Bureaucracy as statecraft: essays for elections, forms for miracles. Sigzil\'s homeland, and a coalition partner that files everything in triplicate.',
    {
      world: 'Roshar', wiki: 'Azir',
      members: ['sigzil'],
      see: ['sigzil', 'knights-radiant'],
    }),
  org('taldain-dynasty', 'Lossandin / Dynasty politics', '#fbbf24', 'whitesand', 'nation',
    'The Dayside power structure around Kezare — Taishin seats, merchant Trackts, and a Diem that must justify its existence each council session.',
    {
      world: 'Taldain', wiki: 'Lossand',
      members: ['kenton'],
      see: ['diem', 'kenton', 'sand-mastery'],
      sources: ['White Sand'],
    }),
  org('kerztian-clergy', 'Kerztian clergy', '#b45309', 'whitesand', 'church',
    'The Kerztian religious hierarchy that calls sand mastery unholy and would rather see the Diem buried than regulated.',
    {
      world: 'Taldain', wiki: 'Kerztian',
      see: ['diem', 'kenton', 'white-sand'],
      sources: ['White Sand'],
    }),
  org('eelakin-trappers', 'Eelakin trappers', '#166534', 'sixthofdusk', 'guild',
    'Solo hunters of the Pantheon islands who live by Aviar, instincts and the rule that partners get you killed. Dusk is their exemplar and their exception.',
    {
      world: 'First of the Sun', wiki: 'Eelakin',
      members: ['dusk'],
      see: ['dusk', 'aviar', 'patji-eye'],
    }),
  org('beacon-people', 'Beacon', '#fdba74', 'sunlit', 'nation',
    'A Canticle hover-city fleeing the sun and the Cinder King together. Refugees with sunhearts and a plan that needs Nomad\'s worst skills.',
    {
      arc: 'sunlit', world: 'Canticle', wiki: 'Beacon',
      see: ['hover-city', 'sunheart', 'union-canticle', 'sigzil'],
    }),
  org('union-canticle', 'Union', '#7f1d1d', 'sunlit', 'nation',
    'The Cinder King\'s city-state on Canticle: Charred enforcers, Chorus threats, and a monopoly on the dawn\'s leftovers.',
    {
      arc: 'sunlit', world: 'Canticle', wiki: 'Union_(Canticle)',
      see: ['cinder-king', 'charred', 'chorus', 'beacon-people'],
    }),
  org('painter-guild', 'Kilahito painters', '#e879f9', 'yumi', 'guild',
    'Nightmare painters of Kilahito who ink dreams before they reach sleepers. Stable work, unstable nights, hion overhead.',
    {
      arc: 'yumi', world: 'Komashi', wiki: 'Nightmare_painter',
      members: ['painter'],
      see: ['painter', 'bamboo-painting', 'nightmare', 'hion'],
    }),
  org('yoki-hijo-order', 'Yoki-hijo', '#f9a8d4', 'yumi', 'order',
    'Ritual stacking-priestesses of Torio who bind spirits into tools. The Father Machine tried to industrialise them out of meaning.',
    {
      arc: 'yumi', world: 'Komashi', wiki: 'Yoki-hijo',
      members: ['yumi'],
      see: ['yumi', 'father-machine', 'virtuosity-splinter'],
    }),
];
