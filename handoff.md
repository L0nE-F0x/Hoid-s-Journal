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

**2026-09-12, overnight.** Owner asked for a graphics overhaul, Cognitive
Realm rebuilt, v1 lore parity, and a landing page that does not read as a
template. All four landed. 20 commits from `2deaae5` to the present, all
local — **nothing has been pushed**, so the live site is still the old build.

What changed, in one paragraph each:

- **Worlds.** Every globe is baked on the GPU — an albedo plate and an
  (elevation, water, lights, roughness) plate — and lit by a shader with
  height-derived normals, a cloud deck that casts its own shadow, night-side
  city lights, ice, ring shadows and a soft terminator. Atmospheres are
  marched single scattering. Suns are limb-darkened photospheres with a
  moving corona. Nebulae are marched volumes. Five gas giants wear rings.
- **Shadesmar.** Its own renderer: a bead ocean per system, a soul field,
  worldhopper roads that pulse, fifteen named Cognitive sites with their own
  marker shapes, and a post grade of its own. Nothing over there is lit by
  a star any more.
- **Spiritual.** One light Shattered into sixteen, threads of Connection
  with pulses running them, Splintered Shards shown as the fragments they
  are, Connection / Identity / Fortune as great circles, four Dawnshards on
  a wider ring.
- **Lore.** Moons 5 → 22 (Lumar's twelve lunagrees are the point). Seven
  dragons and the Sleepless in the roster with their own Directory tab.
  Locations 86 → 124. Glossary 82 → 123. Ten perpendicularities. Fifteen
  Cognitive sites.
- **Chrome.** One signal colour and one warm; hairline rules; a book face
  for the journal's own voice. The landing page is a title plate over a live
  sky with an epigraph and an index counted from the data.
- **Speed.** 18fps → 45–60 everywhere. The biggest single cause was not a
  shader: thirty-one worlds × two Realms × a 2048×1024 plate pair is 1.4 GB
  of texture, and an integrated GPU pages that rather than say so.

Git: `master` tracking https://github.com/L0nE-F0x/Hoid-s-Journal.
Live site (owner connected Netlify): https://thecosmere.netlify.app — it
deploys on push, so `git push` is the deploy. Nothing is pushed yet.
**Do not edit the v1 repo.** Pull before you start.

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

Last known green: `npx tsc --noEmit`, `npm run build`, and
`npm run test:interaction` (**32/32**) with `npm run dev` already up.
Re-run those if you touch code.

`npm run perf` prints frames per second at Cosmere, in Shadesmar, in the
Spiritual Realm and at globe scale, with the expensive layers toggled off
one at a time. Run it before and after any renderer change.

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
src/core/store.ts          UI ↔ renderer wall. chrome persisted with visual.
src/cartography/           Atlas maps. No Three.
  recipes.ts               One recipe per world. BOTH bakers read this.
  planetMap.ts             CPU twin of the GPU baker, for the atlas panel
  officialMaps.ts          Stewart rasters + layers + MAP_CREDIT
  cityMap.ts               Procedural city plates (Elantris, T'Telir, …)
src/render/planetBake.ts   GPU plates. Two tiers, LRU on the large one.
src/render/skyBake.ts      Sky and Spiritual field, baked once at boot.
src/render/Orrery.ts       Worlds, atmospheres, suns, nebulae, rings, orbits
src/render/Shadesmar.ts    Bead oceans, soul field, worldhopper roads
src/render/Spiritual.ts    Adonalsium, the sixteen, the axes, the Dawnshards
src/render/post.ts         AGX + bloom + streaks + SMAA, graded per Realm
src/shaders/lib/           noise.glsl and skyfield.glsl. Included, not copied.
src/layout/cognitive.ts    Where a Cognitive site stands. A reading aid.
src/data/locations.ts      Place UVs. Roshar/Scadrial calibrated to plates.
src/data/realms.ts         Cognitive sites, worldhopper routes, Dawnshards
src/data/cities.ts         Landmark UVs on *our* procedural plates.
src/ui/atlas.ts            Blits official rasters or procedural canvases
src/ui/hud.ts              Top bar, tooltip-on-hover, overlay card-on-click
src/ui/loreWeb.ts          2D force graph. No Three.
src/ui/brand.ts            Disclaimer includes Stewart credit
src/styles/base.css        The design tokens. One signal colour, one warm.
public/maps/               Stewart plates (~26MB). Already in git.
public/audio/soundtrack.mp3
public/logo.png            Title mark + apple-touch
```

---

## What already works

Treat this as current truth, not a wishlist.

- Vite 6 + TypeScript + Three r180 + `postprocessing` + GLSL. No React.
  Store wall: `src/ui/**` talks only to `src/core/store.ts`.
- **Worlds.** Plates are baked on the GPU from `cartography/recipes.ts`
  (`render/planetBake.ts`), two tiers: 1024×512 for every world, 2048×1024
  for the one you are standing over, three of those resident at a time. The
  planet shader does height-derived normals, clamped ocean glint, a cloud
  deck with its own shadow, night-side settlement lights, ice caps, ring
  shadows and a soft terminator with a starlight floor under it.
- **Atmosphere** is marched single scattering on the front faces of a shell,
  clipped at the ground, so the haze covers the disc and the terminator goes
  orange. Sample counts follow the quality band.
- **Sky** is two baked equirectangular plates (Physical and Cognitive) with
  a galactic band, dust lanes and emission regions, crossfaded by realm.
  Stars are 24,000 points on a blackbody distribution, clustered toward the
  band. Both bake once at boot; marching the field cost more than everything
  else in the scene put together.
- **Suns** are limb-darkened photospheres with granulation, a moving corona
  and instrument flare. **Nebulae** are marched volumes. **Orbits** are
  screen-width lines with a comet trail at the world. Five gas giants wear
  **rings** with a planet shadow swept across them.
- **Post:** AGX tone mapping, bloom, anamorphic streaks, chromatic
  aberration, vignette, grain, SMAA, and a grade that changes with the Realm.
- **Shadesmar** (`render/Shadesmar.ts`): a bead ocean per system, a soul
  field of 4,200 lights clustered on the worlds, worldhopper roads that
  pulse, and fifteen Cognitive sites from `data/realms.ts` — Silverlight,
  Celebrant, Lasting Integrity, the Ire Fortress, the Grand Knell, the
  perpendicularities from the Cognitive side, and the three named Rosharan
  Expanses. Placement is `layout/cognitive.ts` and says it is a reading aid.
- **Spiritual** (`render/Spiritual.ts`): Adonalsium whole before the
  Shattering, then sixteen motes with threads of Connection carrying pulses,
  Splintered Shards as nine orbiting fragments, the three axes as great
  circles, four Dawnshards on a wider ring.
- Nested cinematic, then HUD. Title plate over a live Roshar. Original
  journal logo, masked into a seal.
- Screen-space picking. At Cosmere you click the **orbit cloud**, not a
  5-pixel star. HUD glass is `pointer-events: none` except interactive
  children. Single clicks dive Cosmere → system → globe → surface → city.
  `Esc` walks back out. Hover is a tooltip; the card opens on **click** as
  an overlay and **must not** report camera insets.
- One top bar (wordmark, scale crumb, tools). Directory / timeline / galaxy
  collapse. Directory tabs: Systems, Worlds, Moons, People, Dragons, Shards,
  Doors, Dawnshards.
- Surface atlas: Roshar (physical + Shadesmar) and Scadrial (ash / basin,
  plus starchart / endpaper layers) are Stewart plates, credited. Everything
  else uses the CPU twin of the GPU baker in `cartography/planetMap.ts`, so
  the plate and the globe agree about where a continent is.
- City plates: Stewart rasters for Urithiru, Kholinar, Kharbranth, Thaylen
  City, Shattered Plains / Narak, Luthadel, Elendel, Fadrex, Urteau, New
  Seran. Others use `cityMap.ts`.
- Scadrial Catacendre is a map swap (ash → basin, sky and caps with it).
- Lore Web (`L`): force graph with a damped auto-fit, capped repulsion and
  bounded positions. Shards, worlds and Dawnshards stay labelled; people
  label on zoom or when on the path you asked for.
- Reading Companion, Codex, Arcanum (12 tables), Share, time speed, galaxy
  minimap, soundtrack, PWA.
- Deep-link hash `#y=&realm=&scale=&system=&body=&loc=&reading=`.
- Harnesses: `npm run shot`, `npm run test:interaction` (32 checks),
  `npm run perf`, `npm run bench`.

### What the atlas holds

| | |
| --- | --- |
| Systems | 13 |
| Worlds | 18 (plus 10 Rosharan gas giants) |
| Moons | 22 |
| Shards | 16 |
| People | 90, including 7 dragons and the Sleepless |
| Places | 124 |
| Cognitive sites | 15 |
| Perpendicularities | 10 |
| Magic systems | 15, with 12 tables |
| Glossary | 123 terms |
| Dawnshards | 4 |

## Do next (priority order)

The product is shippable. Do not invent a new pillar.

### 1. Push it

- GitHub: https://github.com/L0nE-F0x/Hoid-s-Journal
- Live: https://thecosmere.netlify.app (`npm run build`, `dist`, Node 22).
  After a `master` push, hard-refresh the site.
- `npm run og` regenerates the social card from the new title plate.

### 2. Optional depth, only if a reread reaches for it

- Landmark UVs for the Stewart **city** rasters. The interaction test picks
  landmarks from the roster chips because those scans have no calibrated
  UVs. Do not "fix" that by guessing — measure them off the plates.
- Azimir has no Stewart plate. Others without one use `cityMap.ts`, which
  is fine.
- More relations in `data/relationships.ts`. The Lore Web is only as good as
  its edges, and there are 61.
- Gas giants share one recipe with different seeds. Jes through Ishi could
  each get their own palette if a reread ever cares which is which.

### 3. Renderer ideas not taken

Written down so the next session does not rediscover them:

- **Godrays** from the local star at system scale. `postprocessing` has
  `GodRaysEffect` but it wants one light mesh, and there are thirteen suns.
- **Depth of field** at globe scale. Tried on paper, not built: the risk is
  it reads as a blur bug rather than as a lens.
- **Aurora** on the Invested worlds. Cheap in the planet shader, would need
  a canon check per world before it goes in.
- **Spore streams** from Lumar's twelve lunagrees down to their seas. The
  most lore-accurate showpiece left on the table.

## Sharp edges / do not re-break

- **Texture memory is the first thing to check when it is slow.** Plates are
  two-tier for a reason (`PLATE_SMALL` / `PLATE_LARGE` in `planetBake.ts`).
  Giving every world the large pair is 1.4 GB and the symptom is not an
  error, it is 3fps in Shadesmar.
- **Do not march a field that never changes.** The sky, the Spiritual field
  and Shadesmar's glass are baked. Each of them, marched per pixel per
  frame, cost more than every planet and post pass combined.
- **`fwidth` is not guaranteed** in a GLSL ES 1.00 fragment shader. Where it
  comes back zero, a mip fade never happens and a lattice becomes moiré.
  Measure the projected size from the depth and a pixel-scale uniform.
- **Disc geometry is unit-radius**, scaled by the model matrix. A shader
  reading `position.xy` gets 0..1, not world units. That bug hid two others
  before it was found.
- **A black sky with a working HUD is a lost WebGL context.** Every DOM panel
  keeps running, so it reads as "the app is fine, the Cosmere is missing".
  `webglcontextlost` is handled now and says so on screen; `__ceph.diagnose()`
  prints the driver, the drawing buffer, the program count and the fault.
- **Budget the drawing buffer, not just the pixel ratio.** The post chain
  holds several full-resolution half-float buffers and a bloom mip chain, so
  a 1920×1200 screen at devicePixelRatio 2 asks for 3840×2400 of each. The
  renderer caps the scene at about 2.3 megapixels for that reason.
- **Alpha is coverage, not brightness.** Deriving a transparent surface's
  alpha from its own colour lets any texture on it modulate opacity, and the
  tone curve's toe turns a quarter-stop of that into visible banding.

- **Globe vs atlas mismatch.** Roshar and Scadrial atlas UVs are on
  Stewart plates. Globe albedo is procedural, so a pin on the 3-D
  continent is approximate. Do not warp the globe shader to match the
  plate; the plates are not equirectangular.
- **Playhead.** `YEARS_PER_SECOND` is `0.08`. Focusing a world pauses
  time. The camera rides the orbital frame. Bumping the rate back up
  makes globes strobe and the damped camera miss.
- **Hover vs click.** Hover sets `hovered` and a tooltip only. The info
  card reads `selected`. The card is an overlay: it must never call
  `setInset`. That jump is what the 2026-09-12 recording showed.
- **WASD.** Fly keys are `w a s d q e`. HUD keydown returns before
  opening any panel on those letters. Arcanum is a button, not `A`.
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
`L` Lore Web · `M` galaxy chart · `K`/`/` Codex · `H`/`?` Help · `F` frame
Cosmere · `Esc` pop scale / close panel / leave the Web / close a card
at Cosmere. Hover names a world; click opens the card.
Title: Enter the Cosmere · I need spoilers hidden · Skip to the sky.
Arcanum, Journal, Music, Share are buttons. WASD/QE never open panels.

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
14. Docs pickup 2026-09-11 evening (`504ed6a`).
15. HUD overhaul (`2deaae5`). Hover was opening the info card and claiming
    a right inset, so the Cosmere jumped — recording
    `screenrecording-2026-09-12_00-02-54.mp4`. Card is overlay-on-click.
    WASD unstolen. Chrome collapsible. Look sliders. Denser lore.
    Owner: “that is MUUUUCH better.” This file: bedtime pickup.
