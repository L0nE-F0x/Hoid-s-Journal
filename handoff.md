# Cephandrius — handoff

**Read this first.** Live top-of-todo across sessions.

Repo: `/home/lonefox/Projects/Cephandrius`
Remote: https://github.com/L0nE-F0x/Hoid-s-Journal (`master`)
Original v1 (museum, **do not edit**): `/home/lonefox/Projects/ApexForge/cosmere-interactive-map`
Visual/architecture parent: `/home/lonefox/Projects/Aetherfield`

Product name: **Cephandrius — Hoid's Journal**
Unofficial fan project. Dragonsteel disclaimer stays on the title screen.

Architecture lock: `AGENTS.md` + `DESIGN.md`. This file is the live todo.

---

# ▶ START HERE — next session

**2026-09-11 evening leave-off.** The atlas is in a good stopping place.
Isaac Stewart plates are in the atlas and credited. Lore Web, soundtrack,
directory, city scale, and Realms all ship. The owner is driving home;
this rewrite is so another agent can sit down tonight without reconstructing
the day from a stale diary.

Git: `master` tracking https://github.com/L0nE-F0x/Hoid-s-Journal.
Product code last landed in `3ce26e8` (Stewart layers + title logo); this
file is the evening pickup on top of that. **Do not edit the v1 repo.**
Pull before you start.

```bash
cd /home/lonefox/Projects/Cephandrius
git pull
npm install
npm run dev          # http://127.0.0.1:5174

# Second shell — this is how you check visual work:
npm run shot -- --focus roshar --scale globe --out /tmp/roshar.png
```

**Do not verify visuals in a Chrome tab you are not looking at.** A
background tab throttles `requestAnimationFrame`, so damped camera flights
never converge and every screenshot lies. `tools/screenshot.mjs` drives
headless Chrome at 60fps and prints `fps`, `scale`, `body`, and `insets`.
`window.__ceph = { store, app, ui }` is the harness handle only.

Last known green (before this docs-only commit): `npx tsc --noEmit`,
`npm run build`, and `npm run test:interaction` (**30/30**) with `npm run
dev` already up. Re-run those if you touch code.

---

## Product locks (do not reverse)

Owner answered these. They are the spec.

| Lock | Decision |
| --- | --- |
| Audience | **Rereaders first.** Default progress = fully read. Spoiler gate exists for show-newcomers. |
| First 20s | Nested cinematic: **Roshar highstorm → Rosharan system → Cosmere**, then HUD |
| Scope | **Every published world, nested** (globe + surface + city). Not a slice. |
| Pillars | Orrery + time, spoiler companion, Arcanum, three Realms, Roshar surface, Scadrial Catacendre map-swap, Codex, Lore Web |
| Art | **Globe textures stay procedural.** Atlas world and city plates may use Isaac Stewart cartography, **always credited** (`MAP_CREDIT` = "Cartography by Isaac Stewart"). No Coppermind portraits. |
| Name | Cephandrius — Hoid's Journal |
| Usage | Owner rereads with it for: where is everyone, planet-while-reading, magic tables, connections, vibe |

v1 ideas to keep: spoiler-as-product, era-weighted time, Realms as places,
canon badges, per-world calendars (never invent a universal year), Surface
Scan as a second scale, deep links, Hoid as the journal's voice.

---

## Where to look

```
src/core/store.ts          UI ↔ renderer wall. Nothing else.
src/cartography/           Atlas maps. No Three.
  officialMaps.ts          Stewart rasters + layers + MAP_CREDIT
  planetMap.ts             Procedural world atlas (non-Stewart worlds)
  cityMap.ts               Procedural city plates (Elantris, T'Telir, …)
src/data/locations.ts      Place UVs. Roshar/Scadrial calibrated to plates.
src/data/cities.ts         Landmark UVs on *our* procedural plates.
src/ui/atlas.ts            Blits official rasters or procedural canvases
src/ui/loreWeb.ts          2D force graph. No Three.
src/ui/brand.ts            Disclaimer includes Stewart credit
public/maps/               Stewart plates (~26MB). Already in git.
public/audio/soundtrack.mp3
public/logo.png            Title mark + apple-touch
```

---

## What already works

Treat this as current truth, not a wishlist.

- Vite 6 + TypeScript + Three r180 + `postprocessing` + GLSL. No React.
  Store wall: `src/ui/**` talks only to `src/core/store.ts`.
- Live 3D Cosmere: 13 systems, Kepler orbits, moons, procedural globes,
  atmospheres, HDR bloom/ACES/grain/vignette. Quality ladder (auto / high /
  medium / low).
- Nested cinematic, then HUD. Title over a live Roshar globe. Skip + Space.
  Original journal logo on the title (`public/logo.png`).
- Screen-space picking. At Cosmere you click the **orbit cloud** (outer
  world), not a 5-pixel star. HUD glass is `pointer-events: none` except
  interactive children. Single clicks dive Cosmere → system → globe →
  surface → city. `Esc` walks back out.
- Directory (left): Systems, Worlds, People, Shards, Doors, **Moons**.
  Search filters the current tab. Info card is a field grid with a colour
  swatch. Fly-to from a person or a system.
- Surface atlas: Roshar (physical + Shadesmar) and Scadrial (ash / basin,
  plus starchart / endpaper layers) are Stewart plates. Layer chips switch
  drawings. Pins two-way with the globe. Atlas width 480px. Credit line
  when an official plate is showing.
- City plates: Stewart rasters for Urithiru, Kholinar, Kharbranth, Thaylen
  City, Shattered Plains / Narak (with warcamp layers), Luthadel (survey /
  endpaper / Kredik Shaw), Elendel (basin / Lost Metal), Fadrex, Urteau,
  New Seran. Other plated cities (Elantris, T'Telir, Kilahito, Kezare,
  Beacon, Union, …) still use `cityMap.ts`. Places without a plate get a
  local crop of the world map.
- Scadrial Catacendre is a map swap (ash → basin, sky and caps with it).
- Cognitive: baked Shadesmar, Silverlight as a city in Shadesmar (not on a
  planet), worldhopper routes at Cosmere, perpendicularities as doors on
  both sides. Spiritual: framed diagram (core, sixteen named Shards, axes).
- Lore Web (`L` / Web button): force graph of people, shards, worlds,
  Dawnshards. Spoiler-gated. Click a node for the shortest path to Hoid.
  Drag to rearrange. Esc or Web again returns to the sky. `store.view` is
  `'sky' | 'web'`.
- Soundtrack (`Music` / Look). Off until asked. `public/audio/soundtrack.mp3`.
  Procedural rumble is separate, also off by default.
- Reading Companion, Codex, Arcanum (tables), Share (deep link), time
  speed +/−, labelled galaxy minimap (hidden on a phone).
- Deep-link hash `#y=&realm=&scale=&system=&body=&loc=&reading=`. Title
  screen still gates a shared link because that is where the disclaimer
  lives. Progress + visual in localStorage.
- PWA: `public/sw.js`, install in Look, `npm run icons` / `npm run og`.
- Harnesses: `npm run shot`, `npm run test:interaction` (30 checks),
  `npm run bench`.

---

## Do next (priority order)

The product is shippable locally. Do not invent a new pillar.

### 1. Put it on the internet — needs the owner

- GitHub remote is done: https://github.com/L0nE-F0x/Hoid-s-Journal
- `netlify.toml` is ready (`npm run build`, publish `dist`, Node 22).
  **Connect the GitHub repo in the Netlify UI.** There is no site yet.
  An agent cannot finish this without the owner's Netlify login.

### 2. Leftover copy (one line, if you touch UI)

Help still says "Official map scans are not used." That is false.
`src/ui/modals.ts` → `renderHelp`. The atlas already prints
`MAP_CREDIT` when a Stewart plate is up.

### 3. Optional depth, only if a reread reaches for it

- More Stewart city plates if they exist in v1 `assets/images` and are
  worth the bytes (Azimir has no plate yet). Do not re-copy rasters that
  are already in `public/maps/`.
- Worlds without Stewart plates still use our procedural atlas. That is
  fine.
- Landmark UVs in `src/data/cities.ts` were drawn for *our* procedural
  plates. On Stewart city rasters the interaction test selects landmarks
  from the roster chips, not by clicking a UV on the scan — the scans
  have no calibrated landmark UVs. Do not "fix" that by guessing.
- Glossary / characters can go denser. Keep the canonicity badge honest.

---

## Sharp edges / do not re-break

- **Globe vs atlas mismatch.** Roshar and Scadrial atlas UVs are on
  Stewart plates. Globe albedo is procedural, so a pin on the 3-D
  continent is approximate. Do not warp the globe shader to match the
  plate; the plates are not equirectangular.
- **Playhead.** `YEARS_PER_SECOND` is `0.08`. Focusing a world pauses
  time. The camera rides the orbital frame. Bumping the rate back up
  makes globes strobe and the damped camera miss.
- **Picking.** Cosmere hits use `systemExtent()` (orbit cloud). Do not
  go back to a tiny star sprite. HUD `.ceph-panel` must stay
  click-through except buttons / atlas / timeline / drawer.
- **Pin convention.** `src/layout/surface.ts` matches `THREE.SphereGeometry`.
  Negating z mirrors every pin.
- **Atmosphere.** Rim uses the correct facing; `+n` on back faces washed
  every globe. Bloom threshold is `0.62` — 0.34 whites out the sunward
  hemisphere.
- **Spoilers.** Publication-safe without `readingNow` reveals everything.
  The companion has to set it.
- **Share is a button.** `S` is not a shortcut (it stole WASD).
- **Framing.** Camera re-fits when HUD insets appear. Deep links must
  not frame before the free rectangle exists.
- **Help / interaction test.** City landmark click is a roster chip, not
  a click on the Stewart raster. Urithiru world-map UV is `0.466 / 0.638`
  on `roshar_full.jpg` (3096×1800).
- **Cosmere framing** uses a tuned 0.78 factor. Eyeballed.
- **Time** is a fan axis. Printed dates stay per-world. Cross-world
  coincidence is `speculation`.
- `layout/kepler.ts` imports Three. Fine for the renderer; UI must not.
- No unit tests. Flow is `test:interaction`; the rest is typecheck plus
  `npm run shot` by eye.
- `node_modules` may contain unused junk. Do not add a physics engine.

---

## Invariants (repeat so they are not lost)

1. **`src/ui/**` must not import `three` or `src/render/**`.** Store only.
   Lore Web is a 2D graph in the UI for this reason.
2. **Lore is data, never Cosmere layout.** Where a planet sits this year,
   in this Realm, is derived in `src/layout/`. Atlas UVs (`Location.u/v`)
   *are* 0–1 on the plate currently shown: Roshar → `roshar_full.jpg`
   3096×1800; Scadrial ash → `final_empire.jpg` 2048×1555; basin →
   `elendel_basin.png` 795×1200. Other worlds sit on our procedural atlas.
3. Do not edit `/home/lonefox/Projects/ApexForge/cosmere-interactive-map`.

---

## Controls (for whoever sits down)

Drag orbit · right/middle/shift pan · scroll zoom · WASD/QE fly.
Space play/pause time (skips cinematic if one is running). Focusing a world
pauses the playhead; Space restarts it and the camera rides the orbit.
Timeline +/− changes speed. `1`–`6` eras · `C` Cognitive · `V` Spiritual ·
`L` Lore Web · `A` Arcanum · `K`/`/` Codex · `H`/`?` Help · `F` frame
Cosmere · `Esc` pop scale / close panel / leave the Web.
Title: Enter the Cosmere · I need spoilers hidden · Skip to the sky.
Music is a button (Look also has the toggle). Share is a button.

---

## How we got here (so you do not undo it)

Condensed. The old thirteen-pass diary contradicted itself after the
Stewart lock flipped; this is the version that is true.

1. Globe framing, insets, sunward heading, `npm run shot`.
2. Atlas wired to the globe; pin z-sign; Catacendre map-swap; lighting
   (atmosphere rim, storm band, bloom).
3. Screen-space picking; Reading Companion actually sets `readingNow`.
4. Shadesmar as a baked place; Spiritual as its own camera stage.
5. Worldhopper trails, perpendicularities, phone layout, PWA, interaction
   test.
6. Continent recipes so land sits under the pins; deep links as save
   state; camera re-fits when HUD insets land.
7. City scale as a nested layer (procedural plates first).
8. Thin-world places, Silverlight, doors on both sides, Shard Connection,
   denser lore, icons, quality ladder, rumble, GitHub remote.
9. Orbit-sized picking, directory, Help/Realms as real panels — this is
   why clicks felt dead in an earlier screenshot.
10. Denser companion, galaxy chart, Share, time speed.
11. Lore Web, soundtrack, Moons tab, labelled minimap, logo as apple-touch.
    *At that moment Stewart rasters were still in the museum.*
12. Owner reversed the no-scans lock. Stewart plates copied into
    `public/maps/`, credited, pins recalibrated. Globe albedo stays
    procedural.
13. Map layers, more places (Rall Elorim, Kurth, Panatham, Conventical of
    Seran, Doxonar, Dryport), original logo on the title.
14. This file: evening pickup. No product change.
