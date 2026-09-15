/**
 * Referential integrity over `src/data/`. No browser, no dev server.
 *
 *   npm run audit:data
 *
 * The lore is hand-written across eighteen files that point at each other by
 * id, and nothing in the type system checks that an id on the left is an id on
 * the right. A `see: ['veil']` that names nobody renders as no chip at all, so
 * the failure is silent — the entry just looks a little thin. This is the net
 * under that.
 *
 * It fails the build on anything that makes an entry unreachable or a link
 * dead; everything else it reports and lets through.
 */
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;

/** The UI cannot import TypeScript, and neither can node. Bundle it first. */
async function loadData() {
  const dir = mkdtempSync(join(tmpdir(), 'ceph-audit-'));
  const outfile = join(dir, 'data.mjs');
  await build({
    entryPoints: [join(ROOT, 'src/data/index.ts')],
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

const fatal = [];
const warn = [];
const fail = (s) => fatal.push(s);
const note = (s) => warn.push(s);

/**
 * `loreById` walks the kinds in this order and returns the first hit, so an id
 * that two kinds both claim resolves to whichever appears here first and the
 * rest cannot be opened at all. Kept in step with `data/index.ts` by the
 * ordering check below rather than by hope.
 */
const ORDER = [
  ['body', C.bodies],
  ['moon', C.moons],
  ['system', C.systems],
  ['character', C.characters],
  ['location', C.locations],
  ['landmark', D.CITY_PLATES.flatMap((p) => p.landmarks)],
  ['hub', D.HUBS],
  ['dawnshard', D.DAWNSHARDS],
  ['shard', C.shards],
  ['term', C.glossary],
  ['org', C.organizations],
  ['magic', C.magics],
  ['perp', C.perps],
];

// --- ids are unique inside a kind -------------------------------------------
for (const [kind, rows] of ORDER) {
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.id)) fail(`duplicate id in ${kind}: ${r.id}`);
    seen.add(r.id);
  }
}

// --- and every entry can actually be opened ---------------------------------
// `loreById` is the only door into the encyclopedia. An entry it cannot return
// is written, indexed, searchable and unreachable.
for (const [kind, rows] of ORDER) {
  for (const r of rows) {
    const hit = D.loreById(r.id);
    if (!hit) fail(`${kind}:${r.id} resolves to nothing`);
    else if (hit.kind !== kind) fail(`${kind}:${r.id} is shadowed by ${hit.kind}:${r.id}`);
  }
}

// --- cross-references point at something ------------------------------------
for (const [kind, rows] of ORDER) {
  for (const r of rows) {
    for (const id of r.see ?? []) {
      if (!D.loreById(id)) fail(`${kind}:${r.id} see[] -> ${id} (no such entry)`);
    }
  }
}
for (const o of C.organizations) {
  for (const m of o.members ?? []) {
    if (!D.characterById[m]) fail(`org:${o.id} members -> ${m} (no such person)`);
  }
}
for (const r of D.RELATIONS) {
  for (const end of [r.a, r.b]) {
    const bucket = ORDER.find(([k]) => k === end.kind)?.[1];
    if (!bucket) fail(`relation ${r.a.id}–${r.b.id}: unknown kind ${end.kind}`);
    else if (!bucket.some((x) => x.id === end.id)) {
      fail(`relation ${r.a.id}–${r.b.id}: ${end.kind}:${end.id} does not exist`);
    }
  }
  if (r.a.id === r.b.id) fail(`relation ${r.a.id} points at itself`);
}

// --- structural fields ------------------------------------------------------
const systemIds = new Set(C.systems.map((s) => s.id));
for (const b of C.bodies) {
  if (!systemIds.has(b.system)) fail(`body:${b.id} system -> ${b.system}`);
  for (const s of b.shards) {
    // Adonalsium is not one of the sixteen and has no Shard row; it is a
    // glossary term, and Yolen names it here on purpose.
    if (!D.shardById[s] && !D.glossaryById[s]) fail(`body:${b.id} shards -> ${s}`);
  }
  for (const m of b.magic) if (!D.magicById[m]) fail(`body:${b.id} magic -> ${m}`);
}
for (const m of C.moons) if (!D.bodyById[m.parent]) fail(`moon:${m.id} parent -> ${m.parent}`);
for (const l of C.locations) {
  if (!D.bodyById[l.body]) fail(`location:${l.id} body -> ${l.body}`);
  if (!(l.u >= 0 && l.u <= 1 && l.v >= 0 && l.v <= 1)) fail(`location:${l.id} uv ${l.u},${l.v}`);
}
for (const p of C.perps) {
  if (p.body && !D.bodyById[p.body]) fail(`perp:${p.id} body -> ${p.body}`);
  if (p.at && !D.locationById[p.at]) fail(`perp:${p.id} at -> ${p.at}`);
}
for (const h of D.HUBS) {
  for (const s of h.between ?? []) if (!systemIds.has(s)) fail(`hub:${h.id} between -> ${s}`);
  if (h.system && !systemIds.has(h.system)) fail(`hub:${h.id} system -> ${h.system}`);
}
for (const r of D.ROUTES) {
  for (const s of [r.from, r.to]) if (!systemIds.has(s)) fail(`route:${r.id} -> ${s}`);
}

// --- a world's plate has to exist --------------------------------------------
const { RECIPES } = await (async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ceph-recipes-'));
  const outfile = join(dir, 'recipes.mjs');
  await build({
    entryPoints: [join(ROOT, 'src/cartography/recipes.ts')],
    bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error',
  });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(dir, { recursive: true, force: true });
  return mod;
})();
for (const b of C.bodies) {
  if (!(b.biome in RECIPES)) fail(`body:${b.id} biome -> ${b.biome} (no recipe)`);
}

// --- spoiler gating ----------------------------------------------------------
for (const [kind, rows] of ORDER) {
  for (const r of rows) {
    if (!r.book || r.book === 'core') continue;
    const s = D.seriesById[r.book];
    if (!s) { fail(`${kind}:${r.id} book -> ${r.book}`); continue; }
    if (r.arc && !s.arcs.some((a) => a.id === r.arc)) fail(`${kind}:${r.id} arc -> ${r.arc} (not in ${r.book})`);
  }
}

// --- and a world's own timeline ----------------------------------------------
for (const c of C.characters) {
  for (const e of c.eras) {
    if (!systemIds.has(e.system)) fail(`character:${c.id} era ${e.era} system -> ${e.system}`);
    if (!e.body) continue;
    const b = D.bodyById[e.body];
    if (!b) { fail(`character:${c.id} era ${e.era} body -> ${e.body}`); continue; }
    if (b.system !== e.system) fail(`character:${c.id} era ${e.era}: ${e.body} is in ${b.system}`);
    if (b.eraMin != null && e.era < b.eraMin) fail(`character:${c.id} stands on ${e.body} at era ${e.era}, before it exists`);
    if (b.eraMax != null && e.era > b.eraMax) fail(`character:${c.id} stands on ${e.body} at era ${e.era}, after it ends`);
  }
}

// --- depth, reported but not fatal -------------------------------------------
const pct = (n, d) => `${n}/${d}`;
const noBio = C.locations.filter((l) => !l.bio).length;
if (noBio) note(`locations without a bio: ${pct(noBio, C.locations.length)}`);
const noRegion = C.locations.filter((l) => !l.region).length;
if (noRegion) note(`locations without a region: ${pct(noRegion, C.locations.length)}`);
const noCat = C.glossary.filter((g) => !g.category).length;
if (noCat) note(`glossary terms with no category (the Codex chips skip them): ${pct(noCat, C.glossary.length)}`);
const noMembers = C.organizations.filter((o) => !o.members?.length).length;
if (noMembers) note(`organizations with no members: ${pct(noMembers, C.organizations.length)}`);

const degree = new Map();
for (const r of D.RELATIONS) {
  degree.set(r.a.id, (degree.get(r.a.id) ?? 0) + 1);
  degree.set(r.b.id, (degree.get(r.b.id) ?? 0) + 1);
}
const isolated = C.characters.filter((c) => !degree.has(c.id)).length;
if (isolated) note(`people with no Lore Web edge: ${pct(isolated, C.characters.length)}`);

// Two pins closer than this land on top of each other at every zoom.
const byBody = new Map();
for (const l of C.locations) {
  if (!byBody.has(l.body)) byBody.set(l.body, []);
  byBody.get(l.body).push(l);
}
let crowded = 0;
for (const ls of byBody.values()) {
  for (let i = 0; i < ls.length; i++) {
    for (let j = i + 1; j < ls.length; j++) {
      if (Math.abs(ls[i].u - ls[j].u) < 0.004 && Math.abs(ls[i].v - ls[j].v) < 0.004) crowded++;
    }
  }
}
if (crowded) note(`pin pairs within 0.004 uv of each other: ${crowded}`);

// --- report ------------------------------------------------------------------
const counts = ORDER.map(([k, rows]) => `${rows.length} ${k}`).join(' · ');
console.log(`\n${counts}\n${D.RELATIONS.length} relations · ${D.ROUTES.length} routes\n`);

if (warn.length) {
  console.log('depth:');
  for (const w of warn) console.log(`  ${w}`);
  console.log('');
}

if (fatal.length) {
  console.log(`${fatal.length} broken reference(s):`);
  for (const f of fatal) console.log(`  ${f}`);
  console.log('');
  process.exit(1);
}
console.log('every entry resolves and every reference points at something.\n');
