/**
 * Spoiler sweep over `src/data/`. No browser, no dev server.
 *
 *   npm run audit:spoilers            # fail on any hit not in the allow-list
 *   npm run audit:spoilers -- --all   # also print the allow-listed hits
 *   npm run audit:spoilers -- --faces # print every card's earliest face, to read
 *   npm run audit:spoilers -- --json  # open hits as JSON, for triage
 *
 * The product is "a reader who has finished book X never sees what a later
 * book reveals". `audit:data` checks that ids resolve; nothing checked that
 * the words on a card are words its reader has earned. This does, the blunt
 * way: for each book in publication order it builds the progress of someone
 * who has just finished that book and everything published before it, takes
 * the text every visible card would show them — the reading face where one
 * applies, else the published fields, plus relation sentences, Shard era rows,
 * table rows, field notes and the trail of places — and looks for
 *
 *  1. a name or alias of another entry that is not visible yet (a hidden
 *     person, place, term, order, Shard, alias on a later face, …);
 *  2. the title of a book not yet published at that point ("In Wind and
 *     Truth he…" on a card a Way of Kings reader opens);
 *  3. a hand-made list of reveal phrases, each gated on the book that earns
 *     it (Taravangian as Odium, the Contest's end, Kelsier as Thaidakar, …).
 *
 * It is a net, not a proof: a sentence can spoil without naming anything.
 * The reading faces are where that is handled; `--faces` prints them for a
 * human to read.
 *
 * Triage lives in `tools/audit-spoilers.allow.json`: a hit that is not a
 * leak (a common word, a name the card is allowed to say) is listed there
 * with the reason. An allow-list entry that no longer matches anything is
 * reported so the list cannot quietly rot.
 *
 * The publication order is written out here rather than taken from the app's
 * `publicationSafeProgress`, on purpose: the sweep tests the data against
 * the order the books actually came out in, so a bug in that function cannot
 * hide a leak in the data.
 */
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const ARGS = new Set(process.argv.slice(2));

async function loadData() {
  const dir = mkdtempSync(join(tmpdir(), 'ceph-spoilers-'));
  const outfile = join(dir, 'data.mjs');
  // The reading faces are not re-exported by the data index; the sweep reads
  // them directly to check their order.
  await build({
    stdin: {
      contents: "export * from './src/data/index.ts'; export { READING_FACES } from './src/data/readingFace.ts';",
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'error',
  });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(dir, { recursive: true, force: true });
  return mod;
}

const D = await loadData();
const C = D.COSMERE;

/**
 * Every Cosmere work, in the order it reached readers. Where two came out
 * together the collection follows its contents. `jak` was printed in 2014,
 * but the Journal files it after The Lost Metal inside Mistborn Era 2, and a
 * series' progress is one index, so it can only be read here.
 */
const PUBLISHED = [
  ['elantris', 'elantris'], // 2005
  ['mistborn1', 'tfe'], // 2006
  ['elantris', 'hope'], // 2006, on the web
  ['mistborn1', 'woa'], // 2007
  ['mistborn1', 'hoa'], // 2008
  ['warbreaker', 'warbreaker'], // 2009
  ['stormlight', 'twok'], // 2010
  ['eleventhmetal', 'eleventhmetal'], // 2011
  ['mistborn2', 'aol'], // 2011
  ['emperorssoul', 'emperorssoul'], // 2012
  ['shadowsforsilence', 'shadowsforsilence'], // 2013
  ['stormlight', 'wor'], // March 2014
  ['sixthofdusk', 'sixthofdusk'], // 2014
  ['mistborn2', 'sos'], // 2015
  ['mistborn2', 'bom'], // January 2016
  ['secrethistory', 'secrethistory'], // January 2016
  ['whitesand', 'ws1'], // 2016
  ['stormlight', 'edgedancer'], // November 2016, in Arcanum Unbounded
  ['arcanum', 'arcanum'], // November 2016
  ['stormlight', 'oathbringer'], // 2017
  ['whitesand', 'ws2'], // 2018
  ['whitesand', 'ws3'], // 2019
  ['stormlight', 'dawnshard'], // November 2020
  ['stormlight', 'row'], // November 2020
  ['mistborn2', 'tlm'], // 2022
  ['mistborn2', 'jak'],
  ['tress', 'tress'], // 2023
  ['yumi', 'yumi'], // 2023
  ['sunlit', 'sunlit'], // 2023
  ['elsecaller', 'elsecaller'], // 5 December 2024, the Story Deck
  ['kinglopen', 'kinglopen'], // 5 December 2024, the Story Deck
  ['stormlight', 'wat'], // 6 December 2024
  ['emberdark', 'emberdark'], // 2025
  ['fod', 'fod'], // 2026
];

const fatal = [];
for (const s of C.series) {
  for (const a of s.arcs) {
    if (!PUBLISHED.some(([sid, aid]) => sid === s.id && aid === a.id)) {
      fatal.push(`${s.id}/${a.id} is not in PUBLISHED: place it in publication order`);
    }
  }
}
for (const [sid, aid] of PUBLISHED) {
  const s = D.seriesById[sid];
  if (!s || !s.arcs.some((a) => a.id === aid)) fatal.push(`PUBLISHED names ${sid}/${aid}, which does not exist`);
}

function progressAfter(i) {
  const p = {};
  for (const s of C.series) p[s.id] = -1;
  for (let k = 0; k <= i; k++) {
    const [sid, aid] = PUBLISHED[k];
    p[sid] = Math.max(p[sid], D.bookArcIndex(sid, aid));
  }
  return p;
}

const titleOf = (sid, aid) => D.seriesById[sid]?.arcs.find((a) => a.id === aid)?.label ?? `${sid}/${aid}`;
const vis = (item, P) => D.isVisible(item, P);
const split = (s) => (s ?? '').split(/[,;·]/).map((x) => x.replace(/\([^)]*\)/g, '').trim()).filter(Boolean);

// --- every entry, with the gate the UI applies to it -------------------------

const landmarks = D.CITY_PLATES.flatMap((p) => p.landmarks);

/** [kind, rows, label(row)] in the order loreById resolves them. */
const KINDS = [
  ['body', C.bodies, (o) => o.name],
  ['moon', C.moons, (o) => o.name],
  ['belt', C.belts, (o) => o.name],
  ['system', C.systems, (o) => o.name],
  ['character', C.characters, (o) => o.name],
  ['location', C.locations, (o) => o.name],
  ['landmark', landmarks, (o) => o.name],
  ['hub', D.HUBS, (o) => o.name],
  ['dawnshard', D.DAWNSHARDS, (o) => o.name],
  ['shard', C.shards, (o) => o.name],
  ['term', C.glossary, (o) => o.term],
  ['org', C.organizations, (o) => o.name],
  ['magic', C.magics, (o) => o.name],
  ['perp', C.perps, (o) => o.name],
  ['event', D.COSMERE_EVENTS, (o) => o.name],
  ['route', D.ROUTES, () => null],
];

const locById = new Map(C.locations.map((l) => [l.id, l]));

function gateOf(kind, o) {
  if (kind === 'system') return { book: o.book };
  if (kind === 'landmark' && !o.book) return locById.get(o.city) ?? {};
  return o;
}

function earlyFace(c, face) {
  return face.fact !== c.fact || face.bio !== c.bio || face.aliases !== c.aliases || face.abilities !== c.abilities;
}

/** Names a visible entry puts in front of the reader at P. */
function namesOf(kind, o, P) {
  const out = [];
  const label = KINDS.find(([k]) => k === kind)[2](o);
  if (label) out.push(label);
  if (kind === 'character') {
    // Titles are read as text, not indexed as names: "Lord" is not Geoffrim Satin.
    out.push(...split(D.shownFace(o, P).aliases));
  } else {
    out.push(...split(o.aliases));
  }
  if (kind === 'system' && o.starName) out.push(o.starName);
  return out;
}

/**
 * The words a card shows at P, field by field. Mirrors `ui/loreCard.ts`,
 * the Arcanum panel, the Lore Web and the timeline, which are what a reader
 * actually reads.
 */
function textsOf(kind, o, P) {
  const t = [];
  const put = (field, text) => { if (text) t.push([field, String(text)]); };
  for (const [k, n] of Object.entries(o.fieldNotes ?? {})) put(`note.${k}`, n.note);
  switch (kind) {
    case 'character': {
      const face = D.shownFace(o, P);
      put('fact', face.fact);
      put('bio', face.bio);
      put('aliases', face.aliases);
      put('abilities', face.abilities);
      if (!earlyFace(o, face)) put('titles', o.titles);
      put('origin', o.origin);
      put('biology', o.biology);
      // "Where they have been": every era row the reader has reached.
      const rows = o.eras.filter((r) => !r.arc || vis({ book: r.book ?? o.book, arc: r.arc }, P));
      for (const r of rows) {
        if (r.at) {
          const l = locById.get(r.at);
          if (l) put(`trail.${r.era}`, l.name);
        } else if (r.body) {
          const b = D.bodyById[r.body];
          if (b) put(`trail.${r.era}`, b.name);
        }
      }
      break;
    }
    case 'body': {
      // A world's card reads through its reading face, as the app does.
      const face = D.shownWorld(o, P);
      put('fact', face.fact); put('bio', face.bio); put('aliases', o.aliases);
      put('species', face.species.join(', '));
      put('locations', split(o.locations).filter((name) => {
        const l = C.locations.find((x) => x.body === o.id && x.name.toLowerCase() === name.toLowerCase());
        return !l || vis(l, P);
      }).join(', '));
      put('sources', o.sources.join(' · '));
      break;
    }
    case 'moon': put('fact', o.fact); put('sources', o.sources.join(' · ')); break;
    case 'belt': put('fact', o.fact); put('bio', o.bio); put('sources', o.sources.join(' · ')); break;
    case 'system':
      put('fact', o.fact); put('star', o.starDesc); put('aliases', o.aliases);
      for (const c of o.companions ?? []) put(`companion.${c.id}`, `${c.name} — ${c.fact}`);
      put('sources', (o.sources ?? []).join(' · '));
      break;
    case 'location':
      put('desc', o.desc); put('bio', o.bio); put('region', o.region); put('aliases', o.aliases);
      break;
    case 'landmark': put('desc', o.desc); break;
    case 'hub': put('fact', o.fact); put('bio', o.bio); put('aliases', o.aliases); break;
    case 'dawnshard':
      put('fact', o.fact); put('bio', o.bio); put('holder', o.holder); put('command', o.command);
      break;
    case 'shard':
      put('desc', o.desc); put('bio', o.bio); put('intent', o.intent); put('aliases', o.aliases);
      put('world', o.world);
      for (const row of o.eras) {
        // ShardEra rows may grow their own gate; honour it if they have.
        if ((row.book || row.arc) && !vis({ book: row.book ?? o.book, arc: row.arc }, P)) continue;
        put(`era${row.era}.vessel`, row.vessel);
        put(`era${row.era}.loc`, row.loc);
      }
      break;
    case 'term':
      put('def', o.def); put('aliases', o.aliases); put('sources', o.sources.join(' · '));
      break;
    case 'org':
      put('fact', o.fact); put('bio', o.bio); put('aliases', o.aliases); put('world', o.world);
      put('sources', o.sources.join(' · '));
      break;
    case 'magic': {
      put('desc', o.desc); put('mechanics', o.mechanics); put('bio', o.bio); put('aliases', o.aliases);
      put('shard', o.shard); put('type', o.type);
      put('users', withoutHidden(o.users, P));
      (o.table?.rows ?? []).forEach((row, i) => {
        const arc = o.table.rowArc?.[i];
        if (arc && !vis({ book: o.book, arc }, P)) return;
        put(`table.${i}`, row.join(' | '));
      });
      break;
    }
    case 'perp': put('fact', o.fact); put('aliases', o.aliases); break;
    case 'event': put('name', o.name); put('fact', o.fact); break;
    case 'route': put('fact', o.fact); break;
  }
  return t;
}

/** `ui/loreCard.ts` `withoutHidden`, which the Users line goes through. */
function withoutHidden(text, P) {
  if (!text) return text;
  let out = text;
  const shown = C.characters.filter((c) => vis(c, P)).map((c) => c.name);
  const hidden = C.characters
    .filter((c) => c.name.length > 2 && !vis(c, P))
    .map((c) => c.name)
    .filter((name) => !shown.some((v) => v !== name && v.includes(name)))
    .sort((a, b) => b.length - a.length);
  for (const name of hidden) {
    if (!out.includes(name)) continue;
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out
      .replace(new RegExp(`,\\s*\\b${esc}\\b(\\s*\\([^)]*\\))?`, 'g'), '')
      .replace(new RegExp(`\\b${esc}\\b(\\s*\\([^)]*\\))?\\s*,\\s*`, 'g'), '')
      .replace(new RegExp(`\\b${esc}\\b(\\s*\\([^)]*\\))?`, 'g'), '');
  }
  return out.replace(/\s+—\s*$/, '').trim() || undefined;
}

// --- what the reader is shown at P -------------------------------------------

function* visibleEntries(P) {
  for (const [kind, rows] of KINDS) {
    for (const o of rows) {
      if (!vis(gateOf(kind, o), P)) continue;
      yield [kind, o];
    }
  }
}

/** A relation is drawn when it is visible and both of its ends are. */
function visibleRelations(P) {
  return D.RELATIONS.filter((r) => {
    if (!vis(r, P)) return false;
    for (const end of [r.a, r.b]) {
      const hit = D.loreById(end.id);
      if (!hit || !vis(gateOf(hit.kind, hit.obj), P)) return false;
    }
    return true;
  });
}

// --- names -------------------------------------------------------------------

/**
 * Titles and honorifics that start a name without being one, so the first
 * word of "Lord Ruler" or "King Lopen" is not taken for a person.
 */
const NOT_A_FIRST_NAME = new Set([
  'Lord', 'Lady', 'King', 'Queen', 'Prince', 'Princess', 'High', 'Highprince', 'Brother', 'Sister',
  'Mother', 'Father', 'Captain', 'Master', 'Mister', 'Miss', 'The', 'Old', 'Young', 'Great', 'First',
  'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Saint',
  'General', 'Sergeant', 'Lieutenant', 'Admiral', 'Doctor', 'Grand', 'Little', 'Big', 'Red', 'Black',
  'White', 'Blue', 'Green', 'God', 'Duke', 'Baron', 'Emperor', 'Empress', 'Lord-', 'Sir', 'Dame',
]);

/**
 * Single words that are English before they are names. A hidden alias like
 * "Radiant" or "Mother" is only taken for a name in the middle of a sentence,
 * where the capital means something; "Elder statesman of Arelon" is not Weonim.
 */
const DICT = (() => {
  try {
    return new Set(readFileSync('/usr/share/dict/cracklib-small', 'utf8').split('\n').filter((w) => /^[a-z]+$/.test(w)));
  } catch {
    return new Set();
  }
})();
const weak = (n) => !/\s/.test(n) && (DICT.has(n.toLowerCase()) || NOT_A_FIRST_NAME.has(n));

/** "The Lord Ruler" is indexed as "Lord Ruler"; "The Wind" stays whole, or every ship called Wind's Pleasure is her. */
function normName(n) {
  const m = n.match(/^(the|a|an) (.+)$/i);
  if (m && !weak(m[2])) return m[2];
  return n;
}

function nameSetAt(P) {
  const owners = new Map();
  const add = (raw, who) => {
    const n = raw && normName(raw);
    if (!n || n.length < 3 || NOT_A_FIRST_NAME.has(n)) return;
    // A proper name starts with a capital. "storyteller" and "unnamed" are descriptions.
    if (!/^[\p{Lu}\p{N}]/u.test(n)) return;
    if (!owners.has(n)) owners.set(n, new Set());
    owners.get(n).add(who);
  };
  for (const [kind, o] of visibleEntries(P)) {
    const who = `${kind}:${o.id ?? o.name}`;
    for (const n of namesOf(kind, o, P)) add(n, who);
    if (kind === 'character') {
      const first = o.name.split(/\s+/)[0];
      if (first !== o.name && first.length >= 4 && !weak(first)) add(first, who);
    }
  }
  return owners;
}

const ALL = (() => {
  const full = {};
  for (const s of C.series) full[s.id] = s.arcs.length - 1;
  return { P: full, names: nameSetAt(full) };
})();

// --- reveal phrases ----------------------------------------------------------

/**
 * Sentences that spoil without naming a hidden entry. Each is gated on the
 * book that earns it. `re` is tested against one field's text at a time.
 * `unless` exempts a field whose text says it some other way that is fine.
 */
const REVEALS = [
  // The Lord Ruler, Rashek and Alendi are the end of The Final Empire, and
  // Elantris readers have no Mistborn entries to see; nothing to gate there.
  // Mistborn Era 1
  { re: /\bKelsier\b[^.]*\b(Cognitive Shadow|refused to finish dying|survives?|still alive)\b/, book: 'secrethistory', arc: 'secrethistory', why: 'Kelsier survives as a Cognitive Shadow' },
  { re: /\bThaidakar\b[^.]*\bKelsier\b|\bKelsier\b[^.]*\bThaidakar\b|\bKelsier'?s Ghostbloods\b|\bKelsier\b[^.]*\bleads? the Ghostbloods\b/, book: 'stormlight', arc: 'row', why: 'Kelsier is Thaidakar' },
  { re: /\bSazed\b[^.]*\b(Harmony|ascend|takes up|Vessel)\b|\bHarmony\b[^.]*\bSazed\b/, book: 'mistborn1', arc: 'hoa', why: 'Sazed becomes Harmony' },
  { re: /\bVin\b[^.]*\b(dies|died|death|gives? her life|sacrific)/, book: 'mistborn1', arc: 'hoa', why: 'Vin dies' },
  { re: /\bElend\b[^.]*\b(dies|died|death|killed)\b/, book: 'mistborn1', arc: 'hoa', why: 'Elend dies' },
  { re: /\bCatacendre\b/, book: 'mistborn1', arc: 'hoa', why: 'the world is remade' },
  // Mistborn Era 2
  { re: /\bTrell\b[^.]*\bAutonomy\b|\bAutonomy\b[^.]*\bTrell\b/, book: 'mistborn2', arc: 'tlm', why: 'Trell is Autonomy' },
  { re: /\bDiscord\b/, book: 'mistborn2', arc: 'tlm', why: 'Harmony and Discord' },
  { re: /\bMoonlight\b[^.]*\bShai\b|\bShai\b[^.]*\bMoonlight\b/, book: 'mistborn2', arc: 'tlm', why: 'Moonlight is Shai' },
  // Warbreaker and after
  { re: /\bAzure\b[^.]*\bVivenna\b|\bVivenna\b[^.]*\bAzure\b/, book: 'stormlight', arc: 'oathbringer', why: 'Azure is Vivenna' },
  { re: /\bProphet\b[^.]*\bVasher\b|\bVasher\b[^.]*\bProphet\b/, book: 'fod', arc: 'fod', why: 'the Prophet is Vasher' },
  // Stormlight
  { re: /\bRetribution\b/, book: 'stormlight', arc: 'wat', why: 'Odium becomes Retribution' },
  { re: /\bKoravellium\b/, book: 'stormlight', arc: 'row', why: "Cultivation's Vessel's name" },
  { re: /\bTaravangian\b[^.]*\b(Odium|Vessel|ascen|took up|takes up)\b|\bOdium\b[^.]*\bTaravangian\b/, book: 'stormlight', arc: 'row', why: 'Taravangian becomes Odium' },
  { re: /\b(killed|kills|killing) Rayse\b|\bRayse\b[^.]*\b(dies|died|dead|killed|Splintered)\b/, book: 'stormlight', arc: 'row', why: 'Rayse is killed' },
  { re: /\bContest of Champions\b[^.]*\b(won|lost|ends|ended|outcome)\b|\bStormfall\b/, book: 'stormlight', arc: 'wat', why: "the Contest's outcome" },
  { re: /\bDalinar\b[^.]*\b(dies|died|death|renounce|Vessel of Honor|takes up Honor|took up Honor)\b/, book: 'stormlight', arc: 'wat', why: "Dalinar's fate" },
  { re: /\bHerald of Second Chances\b|\bKaladin\b[^.]*\b(Herald|Oathpact|Fifth Ideal)\b/, book: 'stormlight', arc: 'wat', why: 'Kaladin becomes a Herald' },
  { re: /\bKaladin\b[^.]*\bFourth Ideal\b/, book: 'stormlight', arc: 'row', why: "Kaladin's Fourth Ideal" },
  { re: /\bSzeth\b[^.]*\b(Fifth Ideal|right arm|arm)\b/, book: 'stormlight', arc: 'wat', why: "Szeth's Fifth Ideal and the arm" },
  { re: /\bSzeth\b[^.]*\bSkybreaker\b|\bSkybreaker\b[^.]*\bSzeth\b/, book: 'stormlight', arc: 'oathbringer', why: 'Szeth joins the Skybreakers' },
  { re: /\bSibling\b/, book: 'stormlight', arc: 'row', why: 'the Sibling' },
  { re: /\bBa-Ado-Mishram\b[^.]*\b(freed|released|free)\b|\b(freed|released|frees|releases) Ba-Ado-Mishram\b/, book: 'stormlight', arc: 'wat', why: "Ba-Ado-Mishram's release" },
  { re: /\bSleepless\b[^.]*\bDawnshard\b|\bDawnshard\b[^.]*\bSleepless\b/, book: 'stormlight', arc: 'dawnshard', why: "the Sleepless' Dawnshard" },
  { re: /\bJezrien\b[^.]*\b(dies|died|death|dead|killed|destroyed)\b|\b(killed|kills|kill) Jezrien\b/, book: 'stormlight', arc: 'oathbringer', why: "Jezrien's death" },
  { re: /\bStormfather\b[^.]*\b(destroyed|dies|died|killed)\b|\b(destroys|destroyed) the Stormfather\b/, book: 'stormlight', arc: 'wat', why: "the Stormfather's end" },
  // Odium Splintering Devotion, Dominion and Ambition is Arcanum Unbounded;
  // this is Odium itself coming apart.
  { re: /\bSplinter(s|ed|ing)? Odium\b|\bOdium (is|was) Splintered\b/, book: 'stormlight', arc: 'wat', why: "Odium's Splintering" },
  { re: /\bEverstorm\b/, book: 'stormlight', arc: 'wor', why: 'the Everstorm' },
  { re: /\bNightblood\b[^.]*\b(Rayse|Odium|killed a god|kills a god)\b/, book: 'stormlight', arc: 'row', why: 'Nightblood kills Rayse' },
  { re: /\bGavinor\b[^.]*\bchampion\b|\bchampion\b[^.]*\bGavinor\b/, book: 'stormlight', arc: 'wat', why: "Odium's champion" },
  { re: /\bMoash\b[^.]*\b(Elhokar|Vyre)\b|\bVyre\b/, book: 'stormlight', arc: 'oathbringer', why: 'Moash kills Elhokar, becomes Vyre' },
  { re: /\bTeft\b[^.]*\b(dies|died|death|killed|dead)\b|\b(killed|kills) Teft\b/, book: 'stormlight', arc: 'row', why: "Teft's death" },
  { re: /\bShallan\b[^.]*\bTestament\b/, book: 'stormlight', arc: 'row', why: 'Testament' },
  { re: /\bRenarin\b[^.]*\b(Truthwatcher|Glys|corrupted)\b/, book: 'stormlight', arc: 'oathbringer', why: "Renarin's bond" },
  { re: /\bJasnah\b[^.]*\b(queen|Queen)\b/, book: 'stormlight', arc: 'oathbringer', why: 'Jasnah becomes queen' },
  { re: /\bElhokar\b[^.]*\b(dies|died|death|killed|dead)\b/, book: 'stormlight', arc: 'oathbringer', why: "Elhokar's death" },
  { re: /\bWit\b[^.]*\bHoid\b|\bHoid\b[^.]*\bWit\b/, book: 'stormlight', arc: 'twok', why: 'Wit is Hoid' },
];

// --- the sweep ---------------------------------------------------------------

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const L = '(?<![\\p{L}\\p{N}])';
const R = '(?![\\p{L}\\p{N}])';

/** Book titles a card may not name before they exist, as reveal phrases. */
const TITLE_REVEALS = [];
for (const [sid, aid] of PUBLISHED) {
  const title = titleOf(sid, aid).replace(/^The /, '');
  TITLE_REVEALS.push({ re: new RegExp(`${L}(The )?${esc(title)}${R}`, 'u'), book: sid, arc: aid, why: `names the book ${titleOf(sid, aid)}`, title: true });
}

/** Fields that are sentences rather than lists of names. */
const PROSE = /^(fact|bio|desc|def|mechanics|note\..*|label|star|companion\..*|event|added|name)$/;

const hits = new Map();
function hit(key, field, term, why, at, text) {
  const id = `${key} ${field} ${term}`;
  if (hits.has(id)) return;
  hits.set(id, { key, field, term, why, at, text });
}

for (let i = 0; i < PUBLISHED.length; i++) {
  const P = progressAfter(i);
  const at = titleOf(...PUBLISHED[i]);
  const known = nameSetAt(P);
  // An alias a person's reading face is still holding back is hidden even if
  // another card carries it: the Wit term listing "Cephandrius" from The Way
  // of Kings told what Hoid's own card waits to say.
  // It stays known if a visible entry is called that, or a person's card is
  // already showing it: Odium the Shard is not Taravangian's alias.
  const vouched = new Set();
  for (const [kind, o] of visibleEntries(P)) {
    const label = KINDS.find(([k]) => k === kind)[2](o);
    if (label) vouched.add(normName(label));
    if (kind === 'character') for (const a of split(D.shownFace(o, P).aliases)) vouched.add(normName(a));
  }
  const heldBack = new Set();
  for (const c of C.characters) {
    if (!D.READING_FACES[c.id] || !vis(c, P)) continue;
    for (const a of split(c.aliases).map(normName)) {
      if (a.length >= 3 && /^[\p{Lu}\p{N}]/u.test(a) && !vouched.has(a) && !NOT_A_FIRST_NAME.has(a)) heldBack.add(a);
    }
  }
  for (const n of heldBack) {
    if (!ALL.names.has(n)) ALL.names.set(n, new Set());
    ALL.names.get(n).add('a reading face');
    known.delete(n);
  }
  const hidden = [...ALL.names.keys()].filter((n) => !known.has(n));
  hidden.sort((a, b) => b.length - a.length);
  // Book titles shield the words inside them: "Truth" in "Wind and Truth" is the title's.
  const knownSorted = [...known.keys(), ...PUBLISHED.map((b) => titleOf(...b))].sort((a, b) => b.length - a.length);
  const hiddenRe = hidden.length ? new RegExp(`${L}(${hidden.map(esc).join('|')})${R}`, 'gu') : null;
  const knownRe = new RegExp(`${L}(${knownSorted.map(esc).join('|')})${R}`, 'gu');

  const scan = (key, field, text) => {
    // A citation is not content: "Sources: Wind and Truth" says the book exists.
    if (field === 'sources') return;
    if (hiddenRe) {
      // A hidden name inside a known one ("Radiant" in "Knights Radiant") is the known one's.
      const spans = [];
      for (const m of text.matchAll(knownRe)) spans.push([m.index, m.index + m[0].length]);
      for (const m of text.matchAll(hiddenRe)) {
        const a = m.index, b = a + m[0].length;
        if (spans.some(([x, y]) => x <= a && b <= y && y - x > b - a)) continue;
        // A word that is also English counts only mid-sentence. Short list
        // fields ("Preservation & Ruin", "Vessel of Odium") have no sentences,
        // so every capital there is taken at its word.
        if (weak(m[1]) && PROSE.test(field) && /(^|[.!?:;—"“(]\s*)$/.test(text.slice(0, a))) continue;
        const owners = [...ALL.names.get(m[1])].join(', ');
        hit(key, field, m[1], `names ${owners}, not visible yet`, at, text);
      }
    }
    for (const r of [...REVEALS, ...TITLE_REVEALS]) {
      if (vis({ book: r.book, arc: r.arc }, P)) continue;
      const m = text.match(r.re);
      if (!m) continue;
      // "Oathbringer" the sword, "the Well of Ascension" the place: a title that
      // is also a name the reader already has is that name.
      if (r.title && known.has(m[0].replace(/^The /, '')) || r.title && known.has(m[0])) continue;
      hit(key, field, m[0], r.why, at, text);
    }
  };

  for (const [kind, o] of visibleEntries(P)) {
    const key = `${kind}:${o.id ?? o.name}`;
    for (const [field, text] of textsOf(kind, o, P)) scan(key, field, text);
  }
  for (const r of visibleRelations(P)) {
    scan(`relation:${r.a.id}~${r.b.id}`, 'label', r.label);
  }
  // The HUD's ticker and year label, shown to every reader. `chrono` is not displayed.
  for (const e of C.eras) {
    scan(`era:${e.id}`, 'event', e.event);
    scan(`era:${e.id}`, 'realDate', e.realDate);
  }
  for (const [sys, rows] of Object.entries(C.worldEpochs)) {
    if (!vis({ book: C.systems.find((x) => x.id === sys)?.book }, P)) continue;
    for (const r of rows) scan(`epoch:${sys}`, `era${r.era}`, r.date);
  }
  const [sid, aid] = PUBLISHED[i];
  const note = D.ARC_NOTES.find((n) => n.series === sid && n.arc === aid);
  if (note) {
    scan(`arcnote:${sid}/${aid}`, 'added', note.added);
    scan(`arcnote:${sid}/${aid}`, 'note', note.note);
  }
}

// --- every arc belongs to its book ---------------------------------------------

/**
 * `requiredArcIndex` treats an arc it cannot find in the book's series as the
 * first arc, and `isVisible` ignores the arc of anything filed under 'core'.
 * Both fail open: the entry shows from the start. The Dawnshard Commands were
 * 'core' with arc 'dawnshard'; `RELATION_ARCS` stamps its arc on every
 * relation between a pair, so a Sunlit Man relation took Wind and Truth's
 * 'wat' and showed from The Sunlit Man on.
 */
const arcProblem = (item) => {
  if (!item?.arc) return null;
  if (!item.book || item.book === 'core') return `arc '${item.arc}' on a 'core' entry, which isVisible ignores`;
  const sr = D.seriesById[item.book];
  if (!sr) return `book '${item.book}' is not a series`;
  if (!sr.arcs.some((a) => a.id === item.arc)) return `arc '${item.arc}' is not an arc of ${item.book}`;
  return null;
};
for (const [kind, rows] of KINDS) {
  for (const o of rows) {
    const why = arcProblem(gateOf(kind, o));
    if (why) fatal.push(`${kind}:${o.id ?? o.name}: ${why}`);
  }
}
for (const r of D.RELATIONS) {
  const why = arcProblem(r);
  if (why) fatal.push(`relation ${r.a.id}–${r.b.id} (${r.label}): ${why}`);
}
for (const c of C.characters) {
  for (const row of c.eras) {
    if (!row.arc) continue;
    const why = arcProblem({ book: row.book ?? c.book, arc: row.arc });
    if (why) fatal.push(`character:${c.id} era ${row.era} row: ${why}`);
  }
}
for (const m of C.magics) {
  (m.table?.rowArc ?? []).forEach((arc, i) => {
    const why = arc && arcProblem({ book: m.book, arc });
    if (why) fatal.push(`magic:${m.id} table row ${i}: ${why}`);
  });
}

// --- reading faces are in publication order -----------------------------------

/**
 * `shownFace` keeps the last step the reader has reached, in array order. A
 * step for a later book placed before one for an earlier book is therefore
 * skipped over by anyone who has read both, and worse, a `published` step
 * for the earlier book shows the whole card — later book and all — to someone
 * who has read only that one. Sigzil's and Kelsier's cards did exactly this.
 */
const pubIndex = (book, arc) => PUBLISHED.findIndex(([s, a]) => s === book && a === arc);
for (const [id, face] of Object.entries(D.READING_FACES)) {
  let last = -1;
  for (const step of face.steps) {
    const i = pubIndex(step.book, step.arc);
    if (i < 0) fatal.push(`reading face ${id}: step ${step.book}/${step.arc} is not a published book`);
    else if (i < last) fatal.push(`reading face ${id}: step ${step.book}/${step.arc} comes after a later book's step`);
    last = Math.max(last, i);
  }
}

// --- org rosters: a data rule the order card does not apply yet ---------------

/**
 * `orgsForCharacter` holds a membership back until the person↔order relation
 * is visible. The order's own card lists `members` by the person's gate
 * alone, so it can name a member before the book that makes them one. These
 * are reported, not failed: the fix belongs in the card, not in the data.
 */
const rosters = new Map();
for (let i = 0; i < PUBLISHED.length; i++) {
  const P = progressAfter(i);
  for (const o of C.organizations) {
    if (!vis(o, P)) continue;
    for (const mid of o.members ?? []) {
      const m = D.characterById[mid];
      if (!m || !vis(m, P)) continue;
      if (D.orgsForCharacter(mid, P).some((x) => x.id === o.id)) continue;
      const id = `${o.id} ${mid}`;
      if (!rosters.has(id)) rosters.set(id, titleOf(...PUBLISHED[i]));
    }
  }
}

// --- allow-list ----------------------------------------------------------------

const allowPath = join(ROOT, 'tools/audit-spoilers.allow.json');
const allowDoc = JSON.parse(readFileSync(allowPath, 'utf8'));
const allow = Array.isArray(allowDoc) ? allowDoc : allowDoc.allow;
const used = new Set();
function allowed(h) {
  for (let i = 0; i < allow.length; i++) {
    const a = allow[i];
    if (a.term !== h.term) continue;
    if (a.key && a.key !== h.key && !(a.key.endsWith('*') && h.key.startsWith(a.key.slice(0, -1)))) continue;
    if (a.field && a.field !== h.field && !(a.field.endsWith('*') && h.field.startsWith(a.field.slice(0, -1)))) continue;
    used.add(i);
    return a;
  }
  return null;
}

const open = [];
const triaged = [];
for (const h of hits.values()) (allowed(h) ? triaged : open).push(h);

const show = (h) => {
  const i = h.text.indexOf(h.term);
  const ctx = i < 0 ? h.text.slice(0, 140) : h.text.slice(Math.max(0, i - 70), i + h.term.length + 70);
  return `  ${h.key} ${h.field} — "${h.term}" (${h.why}) at ${h.at}\n      …${ctx.replace(/\s+/g, ' ')}…`;
};

if (ARGS.has('--faces')) {
  // The earliest face every card shows, with the book that first shows it.
  const seen = new Set();
  for (let i = 0; i < PUBLISHED.length; i++) {
    const P = progressAfter(i);
    for (const [kind, o] of visibleEntries(P)) {
      const key = `${kind}:${o.id ?? o.name}`;
      for (const [field, text] of textsOf(kind, o, P)) {
        const k = `${key}|${field}|${text}`;
        if (seen.has(k)) continue;
        seen.add(k);
        console.log(`${titleOf(...PUBLISHED[i])}\t${key}\t${field}\t${text}`);
      }
    }
  }
  process.exit(0);
}

if (ARGS.has('--json')) {
  // Open hits as JSON, for triage into the allow-list.
  console.log(JSON.stringify(open.map(({ key, field, term, why, at }) => ({ key, field, term, why, at })), null, 1));
  process.exit(0);
}
if (ARGS.has('--all')) {
  console.log(`allow-listed (${triaged.length}):`);
  for (const h of triaged) console.log(show(h));
}
if (rosters.size) {
  // Not fatal: the data is right (`orgsForCharacter` holds these back); the
  // order card and the Lore Web must ask it rather than list `members` raw.
  console.log(`warn: ${rosters.size} members of an order whose membership waits for a later book. The order card and the Lore Web must not list them until \`orgsForCharacter\` does:`);
  for (const [id, at] of rosters) console.log(`  ${id} at ${at}`);
}
const stale = allow.filter((_, i) => !used.has(i));
if (stale.length) {
  console.log(`warn: ${stale.length} allow-list entries match nothing; delete them:`);
  for (const a of stale) console.log(`  ${JSON.stringify(a)}`);
}
for (const f of fatal) console.log(`FAIL ${f}`);
if (open.length) {
  console.log(`\n${open.length} spoiler hits not in tools/audit-spoilers.allow.json:`);
  for (const h of open) console.log(show(h));
}
console.log(`\n${hits.size} hits across ${PUBLISHED.length} books: ${triaged.length} triaged, ${open.length} open.`);
if (open.length || fatal.length) process.exit(1);
console.log('no unlisted spoilers');
