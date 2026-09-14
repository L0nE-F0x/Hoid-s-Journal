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

**2026-09-14 visual pass committed, NOT yet pushed.** Frame, globes,
Realms, labels and cards. Five commits on `master` ahead of origin —
`git push` is the deploy, so the live site is still showing `602b6b4`.

The owner is testing the live deploy and will report back. **That list is
the brief.** Do not restart the lore hunt from scratch.

Codex (`K` / Search) is the answer engine: question-shaped queries
("who is Thaidakar", "what is a metalmind"), alias hits (Wit → Hoid,
Thaidakar → Kelsier), filter chips, See-also chips on the overlay card.
Hard-refresh https://thecosmere.netlify.app; the service worker otherwise
keeps the old shell.

Git: `master` tracking https://github.com/L0nE-F0x/Hoid-s-Journal, **level
with origin**. Live site: https://thecosmere.netlify.app — **it deploys on
push, so `git push` is the deploy.**
**Do not edit the v1 repo** at `ApexForge/cosmere-interactive-map`.

```bash
cd /home/lonefox/Projects/Cephandrius
git pull
npm install
npm run dev              # http://127.0.0.1:5174

# Second shell. This is how you check visual work.
npm run shot -- --focus roshar --scale globe --out /tmp/roshar.png
npm run test:interaction # 56 checks through real mouse and keyboard
npm run audit:ui         # clicks every control, reports the ones that do nothing
npm run perf             # fps per Realm, expensive layers toggled off one at a time
```

**Do not verify visuals in a Chrome tab you are not looking at.** A
background tab throttles `requestAnimationFrame`, so damped camera flights
never converge and every screenshot lies. `tools/screenshot.mjs` drives
headless Chrome at 60fps and prints `fps`, `scale`, `body` and `insets`.

`window.__ceph = { store, app, ui, diagnose }` is the harness handle only.
`__ceph.diagnose()` prints the driver, the drawing buffer, the pixel ratio,
the program count and any fault — ask for it first when someone reports a
black sky.

Last known green: `npx tsc --noEmit` and
`npm run test:interaction` (**56/56**) with `npm run dev` already up,
then `git push` of `e120ebb`. Re-run those plus `npm run build` before
the next push.

---

## What the last session changed

**2026-09-14 visual pass (`65fa8fc` → `d491f70`, committed, not pushed).**
Lore and data untouched. Five things, each its own commit:

- **The frame.** The card is an overlay that reports no inset (product
  lock), so at globe scale the camera centred Roshar 196px — half the
  card's width — into it. Atlas, directory and card now share one 360px
  column on the left; the card stacks under whichever panel is open via
  `--ceph-col-bottom`. Clear picture 612px → 1128px. The lock still holds:
  the card calls no `setInset`, and it is the column's width, so the open
  panel's inset is already the truth. Art-bible drift fixed too — 8px radii
  and 999px capsules back to 2px and tracked caps; card fields reset from a
  grid of filled boxes to a catalogue plate on hairlines.
- **The globes.** Three recipe knobs meant something other than what they
  said. See *Sharp edges* — `ice`/`snow`, `flora`, and especially `clouds`,
  whose meaning changed for every world.
- **The Realms.** Suns were *larger* in Shadesmar than in the Physical
  Realm, against this file's own "nothing over there is lit by a star".
  They are small and dim there now and the soul field carries the light.
  Souls were also spread uniformly at random over thirteen systems, so
  Threnody shone like Roshar; they are weighted by charted places now.
- **Labels.** Names sat inside their own glow and nothing checked for
  collisions. Both fixed in `render/Labels.ts`, Cosmere scale only.
- **The interaction suite** had a moon check that clicked past the edge of
  the window. Not a product bug; the assertion was unsound.

Checked: `tsc --noEmit`, `npm run build`, `test:interaction` 56/56,
`npm run perf` flat against baseline, `audit:ui` (one dead control, see
below, pre-existing). Shots at globe/system/Cosmere in all three Realms.

**Lore note.** The Shard named **Reason** in `data/shards.ts` was checked
against a recollection of "Wisdom" and left alone — it carries a *Wind and
Truth* ch. 115 citation, which beats a guess. The Dawnshard entries are
honestly badged (`Change` canon, `Unite` WoB, the third "not ours to
invent") and needed nothing.

**Still open from the visual list.** Nothing on the original five. Not
attempted: godrays, depth of field, aurora (see *Renderer ideas not taken*).

## What the session before that changed

**2026-09-13 encyclopedia (`e120ebb`, pushed and live).** Graphics left alone.
v1 Battle Sim still out. Everything else v1 had for knowledge is here and
deeper: Codex filters, alias search, Coppermind *links* (not portraits),
organizations as a first-class roster.

- People 90 → ~424. Places 124 → ~301. Glossary 123 → ~323. Orders ~66.
  Magics 15 → 19 (Dakhor, ChayShan, Bloodsealing, sunhearts/Skipping).
- Bios on the original roster (`peopleBios.ts`) and on every new person.
- Codex is the reread companion: "who is Thaidakar", "Wit", "what is a
  metalmind". Overlay cards gained bio, era trail, orders, See-also, wiki.
- Directory gained Places and Orders. Lore Web / globe motes stay featured
  only (`isFeaturedPerson`), or 400 bridgemen become a marble bowl.
- Short search queries use word boundaries so "wit" does not hit "with".

---

### Graphics history (still true)

- **Worlds.** Every globe is baked on the GPU — an albedo plate and an
  (elevation, water, lights, roughness) plate — and lit by a shader with
  height-derived normals, a cloud deck that casts its own shadow, night-side
  city lights, ice, ring shadows and a soft terminator. Atmospheres are
  marched single scattering. Suns are limb-darkened photospheres with a
  moving corona. Nebulae are marched volumes. Five gas giants wear rings and
  the ten Vorin ones are ten colours over three shared bakes.
- **Shadesmar.** Its own renderer: a bead ocean per system, a soul field,
  worldhopper roads that pulse, fifteen named Cognitive sites with their own
  marker shapes, and a post grade of its own. Nothing over there is lit by a
  star any more.
- **Spiritual.** One light Shattered into sixteen, threads of Connection with
  pulses running them, Splintered Shards shown as the fragments they are,
  Connection / Identity / Fortune as great circles, four Dawnshards outside.
- **Lore.** Moons 5 → 22 (Lumar's twelve lunagrees rain into their seas).
  Seven dragons and the Sleepless, with their own Directory tab. Locations
  86 → 124. Glossary 82 → 123. Ten perpendicularities. Fifteen Cognitive
  sites.
- **Chrome.** One signal colour and one warm, hairline rules, a book face for
  the journal's own voice. The landing page is a title plate over a live sky
  with an epigraph and an index counted from the data. City plates are drawn
  plans on parchment.
- **Speed.** 18fps → 45–60 everywhere.

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
  collapse. Directory tabs: Systems, Worlds, Moons, People, Dragons, Places,
  Orders, Shards, Doors, Dawnshards.
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
- Reading Companion, Codex (alias + question search, filter chips), Arcanum
  (19 systems, tables), Share, time speed, galaxy minimap, soundtrack, PWA.
  Overlay cards show bio, era trail, orders, See-also chips, Coppermind text
  link (no portraits — product lock).
- Deep-link hash `#y=&realm=&scale=&system=&body=&loc=&reading=`.
- Harnesses: `npm run shot`, `npm run test:interaction` (56 checks),
  `npm run perf`, `npm run bench`.

### What the atlas holds

Counted from the data, 2026-09-13 encyclopedia pass:

| | |
| --- | --- |
| Systems | 13 |
| Worlds | 18 (plus 10 Rosharan gas giants) |
| Moons | 22 |
| Shards | 16 |
| People | ~424, including dragons, Heralds, Unmade, spren, vessels |
| Places | ~301 |
| Orders / groups | ~66 |
| Cognitive sites | 15 |
| Perpendicularities | 10 |
| Magic systems | 19, with tables |
| Glossary | ~323 terms |
| Dawnshards | 4 |
| Lore Web edges | ~210 named, plus origin/investiture/org membership |

New data files (concatenated in `src/data/index.ts`, first id wins except
glossary which keeps the later def):

```
src/data/peopleRoshar.ts
src/data/peopleScadrial.ts
src/data/peopleWorlds.ts
src/data/peopleBios.ts      overlay bios on the original 90
src/data/placesMore.ts
src/data/glossaryMore.ts
src/data/organizations.ts
src/data/orgsMore.ts
src/data/relationsMore.ts
src/data/search.ts          question strip + alias scoring
```

The sky and the Lore Web only draw *featured* people (named in a relation
or an order, plus dragons / Heralds / Unmade / spren / vessels / cognitive
travellers). Everyone else lives in Codex and Directory. Do not dump all
424 as globe motes or Web nodes.

## Known rough edges

The owner's handover note: *"there is lots of final polish in the UI, I've
found a bunch of things that don't work properly, buttons that don't click
etc."* They ran out of credits before listing them. **That list does not
exist** — treat the ones below as a starting point, not as the brief.

Found and fixed in the handover session, so you do not chase them again:

- The Lore Web had no zoom or pan. Auto-fit put a hundred and thirty nodes at
  about a third scale, below the threshold that reveals people's names, so
  those names were unreachable. Scroll and drag work now, with "Fit to frame"
  to hand control back.
- Something in the sweep took the whole page down once, hard enough that
  `window.__ceph` disappeared. `audit:ui` survives that now and names the
  control, but it did not reproduce on the second run. **If you see the app
  vanish after a click, that is real and unresolved.**

Found and fixed in the UI-polish session after that:

- Look-panel chips patched the store and never lit. Quality never changed its
  own label. Auto-rotate is title-only and is now disabled in play.
- "Not tracking a book" cleared `readingNow` and left publication-safe holes.
- The Spiritual directory snapped every paint back to Shards, so the other
  tabs looked dead. Dawnshards now fly there; a world/person row leaves it.
- Codex glossary hits selected an id the drawer did not know, so the click
  closed the panel onto nothing.
- The phone tool strip could not be swiped (`pointer-events: none` on the
  scroller). Lore Web legend sat on the timeline (`--ceph-tools-top` is 0).
- The Journal panel id is `journal`. Unknown ids are ignored; `spoilers`
  still aliases through. Icon buttons with a `title` get an `aria-label`.
- Lore Web pinch-zoom, and `+`/`−` at the ends of a series are disabled.
- The Lore Web canvas sat above the HUD in z-order, so every top-bar click
  while the graph was open was a miss. The atlas also stayed up over it.

Found and fixed in the lore / picking session after that:

- Empty Pre-Shattering rings labelled Lumar, Scadrian, UTol, Canticle. Most
  worlds existed before the Shattering; Scadrial is the exception. `systemOnTheMap`
  hides a star with nothing in orbit. Do not put `eraMin` on Lumar / Canticle /
  UTol / Komashi just because their books are late.
- Leaving the Spiritual Realm left Shadesmar with roads and no cities.
  Presence now sets `group.visible` every frame, the way Labels and Pins do.
- Moons only drew on a focused globe and picking never asked. They light
  in-system, on the globe, or when the camera is close. Click opens a card.
  Worlds pick at Cosmere if they fill the pointer. Dawnshards pick in Spiritual.

Open, leftover, not a brief:

- **Touch on the atlas and globe.** Pinch, long-press and drag-vs-tap are
  still unexercised. The Lore Web pinches.
- **Tab order** across the panels has never been checked.
- **More sky beats.** The Shattering ring is the first Cosmere-wide event;
  Catacendre / True Desolation can grow the same `EventFx` path
  (`src/render/EventFx.ts`, `src/data/events.ts`).
- **`npm run audit:ui`** only finds controls that change nothing at all.
  It reports one: Codex → `systemNalthian`. Pre-existing (it reported two
  before the 2026-09-14 pass), and probably its own 200ms window rather than
  a real dead button — `openId` on a system sets `selected` and a
  `cameraCue` the renderer consumes, and the damped flight has not changed
  `scale` yet when the audit samples. Worth confirming by hand before
  chasing it.

## Do next (priority order)

### 1. Whatever the owner found on the live deploy

That is the brief. They are testing Search as a reread companion and will
come back with a list.

### 2. Optional depth, only if a reread reaches for it

- Landmark UVs for the Stewart **city** rasters. The interaction test picks
  landmarks from the roster chips because those scans have no calibrated UVs.
  Do not "fix" that by guessing — measure them off the plates.
- Lore Web edges live in `relationships.ts` + `relationsMore.ts` (~210 named).
  Still only as good as the graph; add an edge when a reread reaches for it.
- Azimir has no Stewart plate. Worlds without one use `cityMap.ts`, which is
  now a real plan generator rather than a placeholder.

### 3. Renderer ideas not taken

Written down so the next session does not rediscover them:

- **Godrays** from the local star at system scale. `postprocessing` has
  `GodRaysEffect` but it wants one light mesh, and there are thirteen suns.
- **Depth of field** at globe scale. The risk is that it reads as a blur bug
  rather than as a lens.
- **Aurora** on the Invested worlds. Cheap in the planet shader, but it needs
  a canon check per world before it goes in.

## Sharp edges / do not re-break

- **`clouds` in a recipe is coverage, not opacity** (changed 2026-09-14).
  It used to scale the cloud field's alpha, which drew a half-transparent
  veil over the whole world at every value. It now moves where the field is
  cut, so the number is the fraction of sky with weather in it. Roshar and
  Nalthis were re-tuned by eye; **the other worlds inherited the new meaning
  untested** and a number or two may want a nudge. `gas` sets 0 and is not
  on this path.
- **`ice` is the polar cap; `snow` is the snowline.** They were one number,
  so any world with a cap had every ridge above elevation 0.58 bleached
  white — that was what made Roshar look like frost rather than stone.
  `snow` defaults to `ice * 0.30`.
- **`flora` mixes toward `floraColor`, it does not multiply.** A multiply can
  only drag a hue toward olive, so brown land could never grow green.
  `DEFAULT_FLORA` in `recipes.ts` is the one source of that default.
- **Change a baker, change its twin.** All three of the above landed in
  `shaders/planetBake.frag` *and* `cartography/planetMap.ts` together. The
  cloud change is `shaders/planet.frag`, which has no CPU twin — the atlas
  plate is unlit and has no weather.
- **Left-edge panels share one column.** `--ceph-col` / `--ceph-gut` in
  `base.css`. The journal card is that width and stacks under whichever
  panel is open, reading `--ceph-col-bottom`. If you make one of them wider
  without the others, the card will hang off the inset the camera was told
  about. The card still must not call `setInset` — that lock is intact and
  is why this works the way it does.
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
- **Exactly one enabled pass may render to the canvas, and there must always
  be one.** `EffectComposer.addPass` hands that job to whichever pass was
  added last. Disabling SMAA on the low quality band therefore left the whole
  chain drawing into a buffer nobody read: a black canvas over a working HUD
  at 132fps. `routeOutput()` in `post.ts` owns this, and
  `test:interaction` asserts it for every band.
- **A black sky with a working HUD can also be a lost WebGL context.** Every DOM panel
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
  Worlds, moons, hubs, shards and Dawnshards that exist in data are
  clickable. Moons light when you are in their system, on their globe,
  or the camera has come within `MOON_NEAR` of the parent — zooming
  into Roshar at Cosmere scale is enough. Clicking a moon opens its
  card and frames it.
- **Presence owns `group.visible`.** Labels and pins set it every frame;
  Presence did not. App hides the group in the Spiritual Realm, and a
  return to Shadesmar used to keep the roads and drop Silverlight,
  Celebrant, the Knell and the rest until a refresh. Do not hide that
  group without turning it back on.
- **Empty systems are not places.** `systemOnTheMap` hides the star,
  orbit, label, galaxy dot, directory row and Shadesmar disc when no
  in-era world remains. Scadrial is the one world built after the
  Shattering; do not put `eraMin` on Lumar / Canticle / UTol / Komashi
  just because their books are late. Named places still wait on the
  playhead. Coppermind: Cosmere (most planets existed and were named
  before the Shattering); Scadrian system (Scadrial did not).
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
- **Featured people only on the sky and Lore Web.** `isFeaturedPerson` in
  `data/index.ts`. Dumping all ~424 as globe motes or Web nodes is a marble
  bowl. Codex and Directory still list everyone.
- **Codex search.** Question words are stripped (`who is Thaidakar`).
  Aliases are first-class. Queries of three letters or fewer use word
  boundaries so `wit` does not hit `with`. Overlay cards must still set
  `selected` and close the panel — `test:interaction` asserts a glossary
  hit opens a drawer titled Investiture.

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
Timeline +/− changes speed. Gold ticks on the playhead are named beats
(Shattering, Catacendre, True Desolation…). `1`–`6` eras · `C` Cognitive ·
`V` Spiritual · `L` Lore Web · `M` galaxy chart · `K`/`/` Search · `H`/`?`
Help · `F` frame Cosmere · `Esc` pop scale / close panel / leave the Web /
close a card at Cosmere. Hover names a world; click opens the card.
Title: Enter the Cosmere · Hide what I have not read · Skip the flight.
Arcanum, Journal, Settings and Share are buttons. Soundtrack lives in
Settings. WASD/QE never open panels. Default playhead is Pre-Shattering.
In the Lore Web: scroll zooms, dragging the background pans, dragging a node
moves it, and "Fit to frame" returns to auto-fit.

---

## How we got here (so you do not undo it)

Condensed. The old thirteen-pass diary contradicted itself after the Stewart
lock flipped; this is the version that is true.

1. Globe framing, insets, sunward heading, `npm run shot`.
2. Atlas wired to the globe; pin z-sign; Catacendre map-swap; lighting.
3. Screen-space picking; Reading Companion actually sets `readingNow`.
4. Shadesmar as a baked place; Spiritual as its own camera stage.
5. Worldhopper trails, perpendicularities, phone layout, PWA, interaction test.
6. Continent recipes so land sits under the pins; deep links as save state.
7. City scale as a nested layer.
8. Thin-world places, Silverlight, doors on both sides, quality ladder.
9. Orbit-sized picking, directory, Help/Realms as real panels.
10. Denser companion, galaxy chart, Share, time speed.
11. Lore Web, soundtrack, Moons tab, labelled minimap.
12. Owner reversed the no-scans lock. Stewart plates into `public/maps/`,
    credited, pins recalibrated. Globe albedo stays procedural.
13. Map layers, more places, original logo on the title.
14. HUD overhaul (`2deaae5`). Hover was opening the info card and claiming a
    right inset, so the Cosmere jumped. Card is overlay-on-click.
15. **Overnight 2026-09-12** (`2deaae5` → `e396462`, 22 commits). Graphics
    overhaul, Shadesmar and the Spiritual Realm rebuilt as their own
    renderers, lore past v1 parity, new chrome and landing page, 18fps →
    45–60, city plates redrawn as plans. Pushed and live.
16. Two faults found after the deploy, both worth remembering. A reader on
    quality Low got a black canvas because the composer's only
    render-to-screen pass was the one the low band disabled. And a black sky
    with a working HUD is otherwise a lost WebGL context, which nothing used
    to report. Both are in *Sharp edges*.
17. **Handed over.** Owner is out of credits; the next session is a UI polish
    pass. See *Known rough edges*.
18. **2026-09-12 wrap** (`631fdb8` → `d05be1a`). UI polish and the owner's
    thirteen-item list: every Cosmere book in the Journal, Settings chips
    that light, title index off the disclaimer, surface zoom that moves,
    menus renamed, Music off the top bar, galaxy chart under the top bar,
    Cognitive sites that stay, playhead at Pre-Shattering, gold ticks and a
    Shattering ring, new OG card. Pushed and live. Interaction suite 46/46.
19. **Perf pass.** LOD by scale, no atmospheres/clouds/moons at Cosmere,
    trails throttled, HUD year ticks throttled, bloom/SMAA stepped down from
    HUGE/HIGH, Cognitive plates warmed after boot. 46/46 still.
20. **Timeline lore pass.** Places, doors, hubs and worlds now have `eraMin` /
    `eraMax`. Cultivation's perpendicularity, Silverlight, Luthadel, the
    sixteen Shards as sixteen — none of that is on the sky before the
    Shattering. `onTheMap()` is spoiler gate plus playhead. 49/49.
21. **Empty systems.** First lore pass hid planets and left rings. Coppermind:
    most worlds existed and were named before the Shattering; Scadrial did
    not. `systemOnTheMap`. `60e04b9`.
22. **Cognitive sites after Spiritual.** Presence never turned `group.visible`
    back on. `95c1e7a`.
23. **2026-09-12 wrap** (`60e04b9` → `3d5fa17`). Moons clickable, in the sky
    without opening the parent globe, Dawnshards pickable, gas-giant names
    in-system, Three Sisters lore and the fallen fourth moon under the
    Shattered Plains. Pushed and live. Interaction suite 56/56.
25. **2026-09-14 visual pass** (`65fa8fc` → `d491f70`). Frame reclaimed (the
    card was covering the world it described), three recipe knobs that meant
    the wrong thing, Shadesmar stopped being the Physical Realm brightened,
    labels that clear their glow and each other, cards set as catalogue
    plates. Lore and data untouched. 56/56, perf flat. **Committed, not
    pushed.**
24. **2026-09-13 encyclopedia** (`e120ebb`). People 90 → ~424, places 124 →
    ~301, glossary 123 → ~323, orders ~66. Codex answers aliases and
    questions. Overlay cards gained bio / See-also / Coppermind links (no
    portraits). Battle Sim still out. Graphics left alone. Pushed and live.
    Interaction suite 56/56.
