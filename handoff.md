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

**2026-09-11 (later) — globe framing shipped, first commit made.**

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
- Spoiler checklist with per-series arc steppers + publication-safe preset.
- Arcanum: 15 magics, Allomancy/Feruchemy/Surges/Heightenings tables.
- Codex search, name-ranked (exact “Roshar” no longer opens Ashyn).
- Surface atlas overlay: unwrapped biome map, labeled pins, highstorm band
  on Roshar, era-true character chips.
- Scadrial biome swap (ash → basin) when era ≥ 3.
- Character motes on their current world, sized to a few pixels at any scale.
  Shard lines Yolen → current seat.
- Panel-aware framing: `store.insets` (atlas = left/top, HUD = right/bottom)
  drives the camera's view offset and framing distance.
- Cognitive = shader invert + glints. Spiritual = 16 motes / Adonalsium core.
- Deep-link hash (`#y=&realm=&scale=&system=&body=`). Progress + visual in
  localStorage.
- PWA manifest exists. **No service worker yet.**
- Headless capture harness: `npm run shot` (`tools/screenshot.mjs`).
- Disclaimer on the title screen.

---

## Do next (priority order)

Work top-down. Do not start a city layer or a Lore Web while the atlas still
feels like a prototype.

### 1. Make the atlas the reread tool

This is why the owner still opens v1 mid-book.

- Clicking an atlas pin should **mean something on the globe** (spin/highlight
  the pin in 3D, not just select in the drawer).
- Scadrial Catacendre: scrub MB1 → MB2 and the **atlas map** must swap ash
  → basin with the matching pins (`eraMaps: 'ash'|'basin'`). Verify it, it
  is a must-ship pillar.
- Roshar highstorm on the atlas currently **repaints the whole map every
  frame**. Cache the base blit; only redraw the band + pins.
- Location coverage is a first pass. Add until each published world feels
  walkable: Sel (Arelon, Teod, Fjorden, Rose Empire), Nalthis (T'Telir,
  Idris, Court of Gods), Taldain Dayside/Darkside, Lumar's twelve seas,
  Threnody Homeland vs Forests, Canticle's race-the-dawn cities, Komashi
  Torio/Kilahito, First of the Sun Pantheon. UVs are **ours**, not Isaac's.
- City scale is specified (`scale: 'city'`) and empty. After continent
  pins feel good, original city plates (procedural or generated, never
  scans): Urithiru, Kholinar, Luthadel/Elendel, T'Telir, Elantris.

### 2. Clicking the Cosmere has to be reliable

- System suns vs planet meshes fight for picks at Cosmere distance.
- Double-click or a single confident click should dive system → globe.
- `Esc` pops city → surface → globe → system → Cosmere. Walk it. Fix
  whatever skips a level or gets stuck.
- Labels: system names at Cosmere distance, planet names in-system,
  location names on globe. They were oversized, then distance-culled.
  They still need a pass.

### 3. Three Realms as places, not filters

Physical orrery is the only one that currently feels like a world.

- **Cognitive:** bead-ocean planets (land → dark sea), Silverlight routes,
  cognitive entities stay bright, physical people dim. v1 had this. Shader
  invert is a placeholder.
- **Spiritual:** motes exist. Needs Connection/Fortune/Identity as a
  readable diagram, Pre-Shattering Adonalsium whole, post-Shattering 16
  sparks. Not a map.

### 4. Companion depth (the journal)

- Reading Companion “I am on *Words of Radiance*” → sync + **✦ new this
  arc** chips. `readingNow` is in the store; the UI does not drive it yet.
  Publication-safe preset exists but uses `readingNow` which is usually null,
  so it currently reveals **everything**.
- Codex: jump-to-location, jump-to-character (fly to their world this era).
  Magic hits already open Arcanum.
- Settings panel is coded in `modals.ts` but nothing in the HUD opens
  `panel: 'settings'`.
- Worldhopper trail when a character is selected (v1 dashed path across
  systems over eras).
- Perpendicularities as 3D markers, not just data (`src/data/locations.ts`
  `PERPS`).
- Investiture: shardworlds should *feel* Invested (already a v1 gem).

### 5. Data still thin vs the 100x brief

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

### 6. Ship path (do not skip forever)

- First git commit + GitHub remote.
- `public/og.jpg` (title over live Roshar). OG tags already expect it.
- Service worker + install prompt. Manifest is a stub.
- Netlify: `netlify.toml` is ready (`npm run build`, publish `dist`).
  No site yet.
- ~~Screenshot harness~~ **done** (`tools/screenshot.mjs`). Still want
  Aetherfield's interaction and bench harnesses.
- Adaptive quality ladder (nebula/bloom first, globe tessellation last).
- Mobile: atlas + HUD overlap. Aetherfield’s one-top-row / one-bottom-bar
  under 900px is the pattern.
- Audio: v1 had a soundtrack + procedural rumble that followed zoom/system.
  Differentiator vs Aetherfield. Not started.
- Lore Web (six degrees of Hoid): **after** 1–4. Physics graph in v1; do
  not copy the O(n²) canvas version.

---

## Known bugs / sharp edges

- `F` (frame the Cosmere) is still a fixed radius 268 with the systems
  bunched to one side of frame. Same treatment as the system framing would fix
  it: measure the spread, frame that.
- Roshar's title shot blows out to white on the sunward limb. Lighting/art,
  not framing.
- Time playhead is a fan axis. Printed dates must stay per-world. Cross-world
  coincidence is `speculation`.
- Atlas highstorm full-map repaint every frame on Roshar.
- The atlas measures its rect on every store-driven repaint (forced layout).
  Cheap today; if it shows up in a profile, move it to a ResizeObserver.
- Publication-safe preset without `readingNow` reveals all series.
- `layout/kepler.ts` imports Three. Fine for the renderer; UI must not
  import it. Cartography is the three-free path.
- `node_modules` may contain unused junk (Rapier showed up in a tree listing
  even though it is not a dependency). Do not add physics.
- No tests. Typecheck + `npm run shot` by eye.
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
