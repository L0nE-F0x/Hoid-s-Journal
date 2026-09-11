# Cephandrius — handoff

**Read this first.** Live top-of-todo across sessions.

Repo: `/home/lonefox/Projects/Cephandrius` (local git, **no remote yet**)
Original v1 (museum, **do not edit**): `/home/lonefox/Projects/ApexForge/cosmere-interactive-map`
Visual/architecture parent: `/home/lonefox/Projects/Aetherfield`

Product name: **Cephandrius — Hoid's Journal**
Unofficial fan project. Dragonsteel disclaimer stays on the title screen.

Architecture lock: `AGENTS.md` + `DESIGN.md`. This file is only the live todo.

---

# ▶ START HERE — next session

**2026-09-11 (later) — framing, the atlas link, picking, the reading
companion, both other Realms, a phone layout, the offline shell and an
interaction test. Ten commits, local only, no remote yet.**

The engine flies and a focused world now reads as a portrait. Open this file,
run the app, pick the highest item under **Do next**, ship it, verify with
`npm run shot`.

```bash
cd /home/lonefox/Projects/Cephandrius
npm install
npm run dev          # http://127.0.0.1:5174

# Second shell — this is how you check visual work:
npm run shot -- --focus ashyn --scale globe --out /tmp/ashyn.png
```

**Do not verify visuals in a foreground Chrome tab you are not looking at.**
A background tab throttles `requestAnimationFrame` to roughly one frame per
screenshot, so a damped camera flight never arrives and every capture shows a
half-finished move. That wasted most of a session. `tools/screenshot.mjs`
drives headless Chrome at 60fps and prints `fps`, `scale`, `body` and `insets`
with every shot.

`npx tsc --noEmit` and `npm run build` were clean when this was written.

Git: first commit is **done** (local `master`, still **no remote**).

## What changed this session

### Fifth pass — connections, phones, ship path

- **Worldhopper trails.** Selecting a person draws their path across the eras
  in their colour, each stop at that era's world in that era's own year.
- **Perpendicularities are visible.** Each one with known geography names the
  place it stands at, rings that pin on the globe, and shows in the drawer.
  Scadrial's two sit either side of the Catacendre, so the era moves the door.
- **A phone layout that leaves room for the world.** Panels now report the
  edge they cover *by name* and the store takes the union — one writer per
  edge did not survive panels that move between edges. Command band on top,
  timeline on the bottom, tools above it, atlas as a sheet between; the drawer
  stands down when it would only repeat what the atlas is naming.
- **Ship path:** `public/sw.js` (assets cache-first, shell network-first,
  production only), an install button in the Look panel, and `npm run og`
  which renders `public/og.jpg` from the real title screen.
- **`npm run test:interaction`:** 17 checks driving real mouse and keyboard
  through the whole flow. It exits non-zero, so it can gate work.

### Fourth pass — the other two Realms

- **Shadesmar is a place.** It was a shader inversion of the physical albedo.
  It now bakes a second reading of the same noise mask: the Physical Realm's
  land is a bead ocean, its seas are glass plains. The atlas panel draws the
  same map, titled `· Shadesmar`, so map and globe cannot disagree. Light goes
  flat with a bead glint, skies turn violet, physical people dim to shadows,
  cognitive ones stay bright. Albedo rebinds are spread a few bodies per frame
  so the switch does not stall; cognitive maps bake at half resolution.
- **The Spiritual Realm was broken**, not thin: a textureless sprite showing as
  a 2px orange square, motes sized for a camera that was never there, and the
  physical sky drawing over all of it. It is now a diagram with its own camera
  stage — unity core, sixteen named Shards in a ring, Connection / Fortune /
  Identity as labelled axes, per-era status on every mote (Splintered shrinks
  and dims, Harmony's merger sits larger), click-to-open in the drawer, and
  Adonalsium whole and alone before the Shattering. Leaving puts you back.
- Codex hits fly to the place, the person's world this era, or the world.
- The Look panel finally has a button in the HUD.

### Third pass — picking and the companion

- **Picking is screen-space now.** Project the candidates the current scale
  offers, take the nearest, prefer the subject whose disc the pointer is
  inside and then the nearest to camera. A raycast cannot hit a planet one
  pixel across, and the sun sprites' quads were swallowing clicks. Cosmere →
  system → globe → surface works on single clicks; `Esc` walks back out and
  clears the focus as it goes (verified, all four steps).
- **The publication-safe preset was a no-op.** It keyed off `readingNow`,
  which nothing set, so it revealed everything — in a spoiler-first product.
  The spoiler panel now has the Reading Companion: pick the book you are on,
  step the arc, and the journal syncs publication-safe. `✦ new this arc`
  chips appear in the drawer, the Codex and the atlas roster, and the beat
  shows in the HUD command panel.
- Publication order is per **series**, so a series that overlaps another's
  publication run is hidden wholesale. It errs toward hiding, which is the
  safe direction, but per-book ordering would be more honest. `PUB_ORDER` in
  `src/data/catalog.ts` is where that lives.
- The atlas now hangs off the command panel's measured bottom edge
  (`--ceph-command-bottom`) instead of a hard-coded 88px.

### Second pass — the atlas is now wired to the globe

- **Clicking a pin on the map turns the world to it.** The camera solves the
  latitude and the body's spin solves the longitude, with the camera standing
  sunward, so the place you picked faces you *and* is lit. Hovering the map
  highlights the same marker in 3-D; picking a marker in 3-D drives the map.
- `src/layout/surface.ts` is the single uv-to-body convention and it matches
  `THREE.SphereGeometry`. The old pin maths negated z, so every pin had been
  sitting at a mirrored longitude.
- Pins are camera-facing markers (bright core, dark ring) at constant apparent
  size. The hot one gets a 3-D name label.
- Atlas composes a map layer and a pin layer once per change and blits them;
  only the storm band is per-frame now. Map labels are placed with collision
  tests, so a crowded Alethkar drops names instead of stacking them.
- Atlas and renderer share a clock, so Roshar's storm front is at the same
  longitude on the map as on the globe.
- Catacendre verified end to end: MB1 gives the ash map, ash pins, ash sky and
  ash polar caps; MB2 gives the basin, the Wax & Wayne pins and Harmony's blue.
- Locations: 51 → 72. Added Rosharan regions (Iri, Herdaz, Marat, Tukar, Reshi
  Isles, New Natanan, Revolar, Babatharnam), Scadrian era pins (Vetitan,
  Weathering, Southern Continent), Sel (Duladel, JinDo, Dakhor), Nalthis
  (Court of the Gods, Tears of Edgli), Lossand, the Homeland, two more Lumar
  seas, Sori. Crowded pins were nudged apart; a proximity check is worth
  re-running when you add more.

**Three lighting bugs found while verifying, all of them global:**

- The atmosphere shell measured its rim against `+n` on back faces, where it
  is 1.0 across the whole disc. Every planet wore a flat wash of its own
  atmosphere colour. It is a rim now.
- Roshar's highstorm band covered a quarter of the planet's circumference.
  Now the same 7% front the atlas draws.
- Bloom threshold (0.34) sat below a fully lit planet, so the sunward half fed
  the bloom and came back white. Now 0.62.

Also: labels are sized to read and gated by scale, the Cosmere frames from the
centroid of the systems, and each system's starlight carries its star's colour.

### First pass — globe framing

- **Globe framing (old item 1) is fixed.** Root cause was not the camera
  offset: the playhead ran at 1.15 years/second while orbital periods are
  ~1 cycle/year, so a focused planet lapped its own orbit about twice a second
  and the damped camera chased it off-frame. Three parts:
  - `YEARS_PER_SECOND` is now `0.08`. Orbits drift instead of strobing, and
    idling no longer walks you from Stormlight into Mistborn Era 2 in eleven
    seconds.
  - `App.trackFocus` rides the subject's orbital frame: the pose moves with
    the planet and turns with the sun, so the shot stays centred and lit even
    with time playing.
  - Focusing a world **pauses the playhead** (`isPlaying = false`). Visible in
    the HUD play button, reversible with Space. Reverse it if you disagree —
    it is a product call, not a constraint.
- **`store.insets` is now real.** The atlas reports left/top, the HUD reports
  right/bottom, both measured from live rects. `CameraRig.setInsets` shifts the
  frustum with `setViewOffset` (negative offset slides the subject right — that
  is the sign that was wrong last time) and eases it, and
  `CameraRig.framingDistance` picks a distance from the *free* rectangle, so a
  planet fills the gap between the panels instead of hiding behind one.
- **Sun and nebula are hidden at globe scale.** The Ashyn white disk was the
  local sun sprite; the teal wash over every globe was the system nebula
  sprite. The planet shader still lights from the real sun position.
- Globe heading now stands on the *sunward* side, off-axis by 0.7 rad, so the
  lit face is to camera with a terminator on one limb.
- `CameraRig.setAngles` takes the short way round. Theta accumulates as you
  drag, so a raw `atan2` goal used to spin the camera through the Cosmere.
- Systems frame by their outer orbit, not a fixed 52 units, so Rosharan's ten
  gas giants are in shot.
- Character motes hold a constant few pixels instead of becoming bokeh
  bubbles bigger than the planet.
- Moons are lit (`src/shaders/moon.frag`); they were flat colour discs that
  bloom turned into lamps.
- Body labels no longer clamp to a minimum world size (a close planet's label
  was the size of the planet) and sit closer to the limb.
- The opening cinematic derives its scale from camera distance, so the sky is
  dressed for the scale you are actually at during the pull-out.
- **New: `tools/screenshot.mjs` + `npm run shot`** (puppeteer-core, system
  Chrome). `window.__ceph = { store, app, ui }` is its handle.

## Product locks (do not reverse)

Owner answered these. They are the spec.

| Lock | Decision |
| --- | --- |
| Audience | **Rereaders first.** Default progress = fully read. Spoiler gate exists for show-newcomers. |
| First 20s | Nested cinematic: **Roshar highstorm → Rosharan system → Cosmere**, then HUD |
| Scope | **Every published world, nested** (globe + surface). Not a slice. |
| Must-ship pillars | Orrery + time, spoiler companion, Arcanum, three Realms, Roshar surface, Scadrial Catacendre map-swap, Codex |
| Battle sim | **Cut.** Atlas is the product. |
| Lore Web | Not a refuse-to-ship pillar. After the atlas is stunning. |
| Art | **Original / procedural only.** No Isaac Stewart scans, no Coppermind portraits. |
| Name | Cephandrius — Hoid's Journal |
| Usage | Owner rereads with it for *all* of: where is everyone, planet-while-reading, magic tables, connections, vibe |

v1 ideas to keep: spoiler-as-product, era-weighted time, Realms as places,
canon badges, per-world calendars (never invent a universal year), Surface
Scan as a second scale, deep links, Hoid as the journal’s voice.

---

## What already works

- Vite 6 + TypeScript + Three r180 + `postprocessing` + GLSL. No React.
- Store wall: `src/ui/**` talks only to `src/core/store.ts`. Atlas draws maps
  via `src/cartography/planetMap.ts` (no Three).
- Live 3D Cosmere: 13 systems, Kepler orbits, moons, procedural globes,
  atmospheres, HDR bloom/ACES/grain/vignette.
- Title over a live Roshar globe. Skip button + Space.
- HUD: timeline (era-weighted), Pre/Post/MB1/SA/MB2/Far chips, ticker,
  Codex / Arcanum / Journal / Realms.
- Reading Companion: pick your book, step the arc, journal syncs
  publication-safe. Per-series steppers for manual overrides. ✦ chips mark
  what the current arc revealed.
- Arcanum: 15 magics, Allomancy/Feruchemy/Surges/Heightenings tables.
- Codex search, name-ranked (exact “Roshar” no longer opens Ashyn).
- Screen-space picking: single clicks dive Cosmere → system → globe →
  surface at any distance; `Esc` walks back out.
- Surface atlas overlay: unwrapped biome map, collision-placed labels,
  highstorm band on Roshar, era-true character chips. Pins are two-way: map to
  globe and globe to map.
- Scadrial biome swap (ash → basin, sky and caps with it) when era ≥ 3.
- Character motes on their current world, sized to a few pixels at any scale.
  Shard lines Yolen → current seat.
- Panel-aware framing: `store.insets` (atlas = left/top, HUD = right/bottom)
  drives the camera's view offset and framing distance.
- Cognitive Realm: a baked Shadesmar map (bead ocean / glass plains) on the
  globe and in the atlas. Spiritual Realm: a framed diagram — core, sixteen
  named Shards with per-era status, three axes, clickable.
- Deep-link hash (`#y=&realm=&scale=&system=&body=`). Progress + visual in
  localStorage.
- PWA: manifest, offline shell (`public/sw.js`), install prompt in Look.
- Harnesses: `npm run shot` (capture), `npm run test:interaction` (17 checks
  through real input), `npm run og` (social card).
- Disclaimer on the title screen.

---

## Do next (priority order)

Work top-down. Do not start a city layer or a Lore Web while the atlas still
feels like a prototype.

### 1. City scale, and the rest of the atlas

The map-to-globe link works. What is left is depth.

- City scale is specified (`scale: 'city'`) and **empty**. `Esc` already pops
  city → surface → globe. Original city plates (procedural or generated,
  never scans): Urithiru, Kholinar, Luthadel/Elendel, T'Telir, Elantris.
- Location coverage is better but still thin on Komashi, Canticle, Threnody
  and First of the Sun. Add only names you can source; the canon badge is
  supposed to mean something.
- The atlas map is procedural noise. It reads as a world but it is not *that*
  world: continents do not correspond to the pins on them. Deciding how far to
  take original cartography is the open product question here.

### 2. Realms: what is left

Both non-physical Realms are real places now. What is missing is connective
tissue, not the frame.

- **Cognitive:** Silverlight, and worldhopper routes between systems. The bead
  ocean reads well up close; at Cosmere distance the Realm barely changes.
- **Spiritual:** the three axes are labels, not yet meaning. A selected Shard
  could draw its Connection to the worlds it touches this era.
- Perpendicularities show in the Physical Realm only; they are doors, so
  they belong in Shadesmar too.

### 3. Companion depth (the journal)

- ~~Reading Companion + ✦ new this arc chips~~ **done.** What is missing is
  depth: `fieldNotes`, per-arc "what changed" summaries, and a way to see
  what a given arc *added* rather than only what it unlocked.
- Investiture: shardworlds should *feel* Invested (already a v1 gem).

### 4. Data still thin vs the 100x brief

Stable string IDs are the right model. Content is a port of v1 plus extra
pins, not an encyclopedia.

- Characters: 52, era→body. Need more worldhoppers and supporting cast,
  still spoiler-gated.
- Glossary ~20 terms. Want the v1 Codex density × 10, cited.
- Magic tables: Allomancy/Feruchemy/Surges/Heightenings are good.
  Hemalurgy, Voidbinding, Fabrials, AonDor, Forgery, Sand, Aviar, Aethers
  still lack interactive tables.
- Canon `fieldNotes` barely used. Keep the badge system honest.
- Dragons, Dawnshards, Sleepless from v1 are **not ported**.

### 5. Ship path (do not skip forever)

- First git commit + GitHub remote.
- ~~`public/og.jpg`~~ **done** — regenerate with `npm run og`.
- ~~Service worker + install prompt~~ **done**. The manifest still only has
  an SVG icon; real PNG icons would help install banners.
- Netlify: `netlify.toml` is ready (`npm run build`, publish `dist`).
  No site yet.
- ~~Screenshot and interaction harnesses~~ **done** (`npm run shot`,
  `npm run test:interaction`). A bench harness is still missing.
- Adaptive quality ladder (nebula/bloom first, globe tessellation last).
- Mobile: atlas + HUD overlap. Aetherfield’s one-top-row / one-bottom-bar
  under 900px is the pattern.
- Audio: v1 had a soundtrack + procedural rumble that followed zoom/system.
  Differentiator vs Aetherfield. Not started.
- Lore Web (six degrees of Hoid): **after** 1–4. Physics graph in v1; do
  not copy the O(n²) canvas version.

---

## Known bugs / sharp edges

- Cosmere framing uses a tuned 0.78 factor for the flattening of the system
  cloud. It is eyeballed; a real projected-bounds fit would be exact.
- Time playhead is a fan axis. Printed dates must stay per-world. Cross-world
  coincidence is `speculation`.
- The atlas measures its rect on every store-driven repaint (forced layout).
  Cheap today; if it shows up in a profile, move it to a ResizeObserver.
- Atlas pin UVs are placed by eye. Nothing stops two pins landing on top of
  each other in a future edit except the proximity check you run yourself.
- Publication-safe preset without `readingNow` reveals all series.
- `layout/kepler.ts` imports Three. Fine for the renderer; UI must not
  import it. Cartography is the three-free path.
- `node_modules` may contain unused junk (Rapier showed up in a tree listing
  even though it is not a dependency). Do not add physics.
- No unit tests. `npm run test:interaction` covers the flow end to end; the
  rest is typecheck plus `npm run shot` by eye.
- Original v1 Surface Scan used **copyrighted map rasters**. Never copy them
  into this repo. Recreate.

---

## Invariants (repeat so they are not lost)

1. **`src/ui/**` must not import `three` or `src/render/**`.** Store only.
2. **Lore is data, never positions.** No pixel coordinates in lore tables.
   Atlas UVs are 0..1 on *our* maps.
3. Do not edit `/home/lonefox/Projects/ApexForge/cosmere-interactive-map`.

---

## Controls (for whoever sits down)

Drag orbit · right/middle/shift pan · scroll zoom · WASD/QE fly.
Space play/pause time (skips cinematic if one is running). Focusing a world
pauses the playhead; Space restarts it and the camera rides the orbit.
`1`–`6` eras · `C` Cognitive · `V` Spiritual · `A` Arcanum · `K`/`/` Codex.
`F` frame Cosmere · `Esc` pop scale / close panel.
Title: Enter the Cosmere · I need spoilers hidden · Skip to the sky.
