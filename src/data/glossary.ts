import type { GlossaryTerm } from './types.ts';

const C = 'canon' as const;

function t(id: string, term: string, book: string, def: string, sources: string[], arc?: string): GlossaryTerm {
  return { id, term, book, def, canon: C, sources, arc };
}

export const GLOSSARY: GlossaryTerm[] = [
  t('adonalsium', 'Adonalsium', 'core', 'The original divine power/being that was Shattered into the sixteen Shards.', ['Arcanum Unbounded']),
  t('shattering', 'The Shattering', 'core', 'The event in which sixteen conspirators killed Adonalsium, splitting its power into the sixteen Shards.', ['Arcanum Unbounded']),
  t('shard', 'Shard', 'core', 'One of sixteen fragments of Adonalsium\'s power, each an aspect/intent held by a Vessel.', ['Mistborn: Secret History', 'The Stormlight Archive']),
  t('vessel', 'Vessel', 'core', 'The person who holds a Shard. The Shard\'s intent slowly shapes and constrains them.', ['The Stormlight Archive']),
  t('investiture', 'Investiture', 'core', 'The fundamental magical power of the Cosmere — the substance of Adonalsium, Shards, spren, and all magic.', ['Arcanum Unbounded']),
  t('splinter', 'Splinter', 'core', 'A piece of a Shard\'s power given (or broken) into a self-aware or free-floating form — e.g. spren, seons.', ['Arcanum Unbounded']),
  t('sliver', 'Sliver', 'mistborn1', 'A being who held the full power of a Shard and then gave it up, retaining a sliver of that connection.', ['Mistborn: Secret History']),
  t('cognitive-shadow', 'Cognitive Shadow', 'mistborn1', 'An imprint of a person\'s mind sustained by Investiture after death — e.g. Kelsier, the Heralds, the Returned.', ['Mistborn: Secret History']),
  t('physical-realm', 'The Physical Realm', 'core', 'The realm of matter and the senses — the "normal" world the stories mostly take place in.', ['Arcanum Unbounded']),
  t('cognitive-realm', 'The Cognitive Realm (Shadesmar)', 'core', 'The realm of thought, where ideas and Connection manifest. Travelled between worlds by worldhoppers.', ['Arcanum Unbounded']),
  t('spiritual-realm', 'The Spiritual Realm', 'core', 'The timeless, placeless realm of Connection, Fortune and the soul — where everything is unified.', ['Arcanum Unbounded']),
  t('realmatic-theory', 'Realmatic Theory', 'core', 'The framework describing the three Realms and how Investiture and souls move between them.', ['Arcanum Unbounded']),
  t('perpendicularity', 'Perpendicularity', 'core', 'A place where Investiture pools so densely that the three Realms touch, allowing travel between worlds.', ['Arcanum Unbounded']),
  t('connection', 'Connection', 'core', 'A Spiritual-Realm bond between people, places, languages, or powers.', ['Arcanum Unbounded']),
  t('identity', 'Identity', 'core', 'A Spiritual attribute marking what is "you". Keying Identity lets others use your metalminds.', ['Mistborn Era 2']),
  t('fortune', 'Fortune', 'core', 'Future-sight/probability drawn from the Spiritual Realm, where time has little meaning.', ['Word of Brandon']),
  t('worldhopper', 'Worldhopper', 'core', 'Someone who travels between Cosmere worlds, usually via the Cognitive Realm and perpendicularities.', ['Arcanum Unbounded']),
  t('dawnshard', 'Dawnshard', 'stormlight', 'One of four primal Commands that Adonalsium used to create. Currently one is held by Rysn.', ['Dawnshard', 'The Stormlight Archive'], 'dawnshard'),
  t('retribution', 'Retribution', 'stormlight', 'The merged Shard of Honor and Odium, held by Taravangian after the Contest of Champions.', ['Wind and Truth'], 'wat'),
  t('simple-rules', 'The Simple Rules', 'shadowsforsilence', 'Threnodite laws for surviving Shades: don\'t kindle fire, don\'t shed blood, don\'t run at night.', ['Shadows for Silence']),
];
