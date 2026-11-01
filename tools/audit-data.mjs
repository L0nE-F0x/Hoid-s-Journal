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
  ['belt', C.belts],
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
for (const b of C.bodies) {
  if (b.orbitAround && !D.bodyById[b.orbitAround]) fail(`body:${b.id} orbitAround -> ${b.orbitAround}`);
  // A double planet riding a double planet is not a thing canon has, and the
  // orrery resolves exactly one level of it.
  if (b.orbitAround && D.bodyById[b.orbitAround]?.orbitAround) {
    fail(`body:${b.id} orbitAround -> ${b.orbitAround}, which itself orbits a partner`);
  }
}
for (const b of C.belts) {
  if (!systemIds.has(b.system)) fail(`belt:${b.id} system -> ${b.system}`);
  if (!(b.inner > 0 && b.outer > b.inner)) fail(`belt:${b.id} radii ${b.inner}..${b.outer}`);
  // A belt drawn over a planet's orbit is a belt in the wrong place.
  for (const body of C.bodies) {
    if (body.system !== b.system || body.orbitAround) continue;
    if (body.orbit.a > b.inner && body.orbit.a < b.outer) {
      fail(`belt:${b.id} (${b.inner}..${b.outer}) swallows body:${body.id} at a=${body.orbit.a}`);
    }
  }
}
for (const s of C.systems) {
  for (const c of s.companions ?? []) {
    if (D.loreById(c.id)) fail(`system:${s.id} companion ${c.id} collides with an entry id`);
  }
}
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

// --- pins land on the ground they name ---------------------------------------
// Where a world's coastline is traced off its published plate, `Location.u/v`
// and the mask are in the same 0–1, so a pin in the sea is a pin in the wrong
// place — or a place that really is at sea, which is why this reports rather
// than fails.
//
// The bar is well under a half. The mask is blurred before it is sampled, and
// a blur eats capes and isthmuses, which is exactly where a port sits: a
// coastal city reading 0.3 is on the coast, not in the water.
const { coastCoverage, hasCoast } = await (async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ceph-coast-'));
  const outfile = join(dir, 'coast.mjs');
  await build({
    entryPoints: [join(ROOT, 'src/cartography/coastlines.ts')],
    bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error',
  });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(dir, { recursive: true, force: true });
  return mod;
})();
/**
 * Checked against `roshar_full.jpg` at full resolution and correct as they are,
 * so the report can stay short enough to read. Seas and oceans are named as
 * seas; Fu Abra and the Purelake temple stand *in* the Purelake; Aimia and the
 * Reshi Isles are region pins among islands; Rishir's centre is land on the
 * plate and only reads wet because the mask is blurred, which eats capes.
 *
 * The Conventical of Seran sits on its own printed dot on `final_empire.jpg`,
 * right on the empire's dashed south-eastern border. The ash trace reads
 * everything beyond that border as sea — it is hatched land on the plate,
 * with the River Seran running through it — so the pin is right and the
 * mask is wrong there.
 *
 * Do not add to this list to silence a pin. Measure it off the plate first —
 * Kasitor, Cusicesh and Rit-vo-Ma were all genuinely in the wrong place, and
 * they were found because this report was short.
 */
const AT_SEA_ON_PURPOSE = new Set([
  'the-origin', 'reshi-isles', 'aimia', 'aimian-scouring', 'fu-abra', 'rishir',
  'tarat-sea', 'steamwater-ocean', 'reshi-sea', 'southern-depths', 'purelake-temple',
  'hammondar-bay', 'conventical-of-seran',
]);

const wet = [];
for (const l of C.locations) {
  const body = D.bodyById[l.body];
  // Scadrial is two worlds under one entry. `body.biome` is the static
  // `scadrial-ash`, but the mistborn1 pins are measured on `final_empire.jpg`
  // and the mistborn2 pins on `scadrial_full.png`, so each has to be judged
  // against its own era's coastline — otherwise the Southern Continent is
  // reported as drowning in the Final Empire's Southern Sea, which is a fact
  // about two different maps rather than about the pin.
  const biome = l.body === 'scadrial'
    ? (l.book === 'mistborn2' ? 'scadrial-basin' : 'scadrial-ash')
    : body?.biome;
  const coast = biome && RECIPES[biome]?.coast;
  if (!coast || !hasCoast(coast)) continue;
  if (l.realm === 'cognitive' || AT_SEA_ON_PURPOSE.has(l.id)) continue;
  const cov = coastCoverage(coast, l.u, l.v);
  if (cov < 0.18) wet.push(`${l.id} (${cov.toFixed(2)}) — ${l.name}`);
}
if (wet.length) {
  note(`pins in open water, not already checked off — measure each off the plate: ${wet.length}`);
  for (const w of wet) note(`    ${w}`);
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

// --- publication order ----------------------------------------------------
// Publication-safe progress reads PUB_BOOKS. Every arc must be there once, or
// a book falls back to the coarse series rule and leaks a whole later series.
{
  const listed = new Map();
  for (const b of D.PUB_BOOKS) {
    const k = `${b.series}:${b.arc}`;
    if (listed.has(k)) fail(`PUB_BOOKS lists ${k} twice`);
    listed.set(k, true);
    if (!D.seriesById[b.series]?.arcs.some((a) => a.id === b.arc)) fail(`PUB_BOOKS names ${k}, which no series has`);
  }
  for (const s of C.series ?? []) {
    for (const a of s.arcs) if (!listed.has(`${s.id}:${a.id}`)) fail(`PUB_BOOKS is missing ${s.id}:${a.id}`);
  }
  // The cases the coarse rule got wrong, pinned.
  const at = (series, arc) => D.publicationSafeProgress({ series, arc: D.seriesById[series].arcs.findIndex((x) => x.id === arc) });
  const es = at('emperorssoul', 'emperorssoul');
  if (es.mistborn2 !== 0) fail(`reading The Emperor's Soul should know only The Alloy of Law of Era 2 (got ${es.mistborn2})`);
  const twok = at('stormlight', 'twok');
  if (twok.mistborn2 !== -1) fail(`reading The Way of Kings should know nothing of Era 2 (got ${twok.mistborn2})`);
  const edge = at('stormlight', 'edgedancer');
  if (edge.mistborn2 !== 2 || edge.whitesand !== 0) fail(`reading Edgedancer: Era 2 through Bands, White Sand volume 1 (got ${edge.mistborn2}, ${edge.whitesand})`);
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
if (noMembers) {
  note(`organizations with no members: ${pct(noMembers, C.organizations.length)}`);
  note(`    ${C.organizations.filter((o) => !o.members?.length).map((o) => o.id).join(', ')}`);
}

// Counted the way the web builds it: hand-written relations, org rosters,
// home world, and `see[]` in either direction. A person with none of those
// is not on a web and the graph drops them.
const degree = new Map();
const bump = (id) => degree.set(id, (degree.get(id) ?? 0) + 1);
for (const r of D.RELATIONS) { bump(r.a.id); bump(r.b.id); }
for (const o of C.organizations) for (const m of o.members ?? []) { bump(o.id); bump(m); }
for (const [, rows] of ORDER) {
  for (const r of rows) for (const id of r.see ?? []) { bump(r.id); bump(id); }
}
for (const c of C.characters) if (D.bodyByName(c.origin)) bump(c.id);
const isolated = C.characters.filter((c) => !degree.has(c.id)).length;
if (isolated) note(`people with no Lore Web edge: ${pct(isolated, C.characters.length)}`);

// Two pins closer than this land on top of each other at every zoom.
//
// That is only a fault when the two are different places drawn on the same
// plate. A place inside another — a keep in Luthadel, the windblades in
// Kholinar, Stormseat under Narak — is meant to share its spot: it names the
// other as its `region` or points at it with `see`, or both sit in one named
// place whose own pin is right there. And two pins that are never drawn
// together are not a crowd at all: another Realm, or another era's plate
// (Scadrial's ash and basin pins are measured on two different maps, so
// their UVs coincide by accident). What is left is named, because a count
// with no names sent nobody to the plate.
const CROWD = 0.004;
const locByName = new Map(C.locations.map((l) => [l.name, l]));
const near = (a, b, d) => Math.abs(a.u - b.u) < d && Math.abs(a.v - b.v) < d;
const drawnTogether = (a, b) => {
  if ((a.realm ?? 'physical') !== (b.realm ?? 'physical')) return false;
  if (a.eraMaps && b.eraMaps && !a.eraMaps.some((m) => b.eraMaps.includes(m))) return false;
  const lo = Math.max(a.eraMin ?? -Infinity, b.eraMin ?? -Infinity);
  const hi = Math.min(a.eraMax ?? Infinity, b.eraMax ?? Infinity);
  return lo <= hi;
};
// Only a *place* can hold another at its own spot. A country or a sea pin
// belongs on its printed name, so Rall Elorim sitting on Iri's pin, or the
// Shattered Plains on Narak's, is still a fault. `canEnterCity` is the
// app's own test for a point rather than a region.
const point = (l) => D.canEnterCity(l);
const inside = (inner, outer) =>
  point(outer) && (inner.region === outer.name || !!inner.see?.includes(outer.id) || !!outer.see?.includes(inner.id));
const nested = (a, b) => {
  if (inside(a, b) || inside(b, a)) return true;
  const home = a.region && a.region === b.region ? locByName.get(a.region) : undefined;
  return !!home && point(home) && home.body === a.body && near(home, a, 0.016) && near(home, b, 0.016);
};
const byBody = new Map();
for (const l of C.locations) {
  if (!byBody.has(l.body)) byBody.set(l.body, []);
  byBody.get(l.body).push(l);
}
const crowded = [];
for (const ls of byBody.values()) {
  for (let i = 0; i < ls.length; i++) {
    for (let j = i + 1; j < ls.length; j++) {
      const a = ls[i];
      const b = ls[j];
      if (!near(a, b, CROWD) || !drawnTogether(a, b) || nested(a, b)) continue;
      crowded.push(`${a.id} ~ ${b.id} (${a.body})`);
    }
  }
}
if (crowded.length) {
  note(`different places within ${CROWD} uv of each other on one plate — measure one off it: ${crowded.length}`);
  for (const c of crowded) note(`    ${c}`);
}

// --- report ------------------------------------------------------------------
const counts = ORDER.map(([k, rows]) => `${rows.length} ${k}`).join(' · ');
console.log(`\n${counts}\n${D.RELATIONS.length} relations · ${D.ROUTES.length} routes\n`);

if (warn.length) {
  console.log('depth:');
  for (const w of warn) console.log(`  ${w}`);
  console.log('');
}

// The Catacendre tick is year -1, still inside era 2. The basin plate
// starts there. Era alone used to wait until year 0.
if (D.scadrialBiome(2, -100) !== 'scadrial-ash') fail('Final Empire year still on the ash plate');
if (D.scadrialBiome(2, -1) !== 'scadrial-basin') fail('Catacendre tick should swap to the basin plate');
if (D.scadrialBiome(3, 0) !== 'scadrial-basin') fail('Stormlight-era Scadrial is the basin');

const kal = D.COSMERE.characters.find((c) => c.id === 'kaladin');
const kalAt = kal && D.characterAt(kal, 3, D.fullProgress());
if (kalAt?.at !== 'urithiru') fail(`Kaladin at full read should stand at Urithiru, got ${kalAt?.at}`);
const early = D.publicationSafeProgress({ series: 'stormlight', arc: 0 });
const kalEarly = kal && D.characterAt(kal, 3, early);
if (kalEarly?.at !== 'warcamps') fail(`Kaladin on The Way of Kings should stand at the warcamps, got ${kalEarly?.at}`);
const face = kal && D.shownFace(kal, early);
if (face && /Wind and Truth|Fourth Ideal/.test(face.bio ?? '')) fail('Kaladin\'s Way of Kings card still tells the ending');

const took = D.RELATIONS.find((r) =>
  (r.a.id === 'taravangian' && r.b.id === 'honor') || (r.b.id === 'taravangian' && r.a.id === 'honor'));
if (!took) fail('missing Taravangian–Honor relation');
else if (took.arc !== 'wat') fail(`Taravangian took Honor is a Wind and Truth sentence, arc=${took.arc}`);
if (took && D.isVisible(took, early)) fail('Took Honor is visible during The Way of Kings');

if (fatal.length) {
  console.log(`${fatal.length} broken reference(s):`);
  for (const f of fatal) console.log(`  ${f}`);
  console.log('');
  process.exit(1);
}
console.log('every entry resolves and every reference points at something.\n');
