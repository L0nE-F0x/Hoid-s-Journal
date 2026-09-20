# Cephandrius — design lock

Successor to Hoid's Journal (`ApexForge/cosmere-interactive-map`). That
directory is a museum piece. This one is the 100x.

Visual parent: **Aetherfield** — WebGL2, HDR post, glass instrument HUD,
store wall, title over a live scene.

## Locked product decisions

1. **Audience.** Rereaders first. Default is fully read. A spoiler gate exists
   for show-newcomers and first-timers, but the product is a journal, not a
   tutorial.
2. **First 20 seconds.** Nested cinematic: Roshar (highstorm) → Rosharan
   system → the Cosmere. Then the companion HUD. The picture is the database.
3. **Scope.** Every published world, nested (globe + surface + city). Not a slice.
4. **Pillars.** Orrery + time, spoiler companion, Arcanum, three Realms,
   Roshar surface, Scadrial surface (Catacendre map-swap), Codex, Lore Web.
5. **Art.** Globe textures stay procedural. Atlas world and city plates may
   use Isaac Stewart's cartography, always credited. No Coppermind portraits.

   One thing crosses that line on purpose, and narrowly: a world's *coastline*
   may be traced off its published plate into a 512×256 one-bit land mask
   (`npm run trace:coast`). Roshar's is classified off `roshar_full.jpg`;
   Scadrial's ash era off `final_empire.jpg`; the Basin era is polygons read
   off `scadrial_full.png`, because that plate prints inland seas in the same
   white as its land. Nothing of the artwork is reproduced — not a colour,
   not a line, not a label — only where the water stops, which is geography
   rather than art and is the same geography `Location.u/v` are already
   measured against. Everything the globe actually draws on top of it is
   still procedural. Without it the atlas showed Kholinar on Alethkar and
   the globe showed the same pin in open ocean, in one frame, six inches
   apart.
6. **Name.** Cephandrius — Hoid's Journal.

## Why v1 still matters

Preserve these *ideas*, not the machine:

- Spoiler-as-product (series arcs, publication-safe, "new this book")
- Time as the primary navigation, era-weighted so story years have screen time
- Three Realms as modes, not filters
- Canonicity badges and field-level speculation notes
- Per-world calendars; never invent a universal Cosmere year and pretend it
  is canon
- Surface Scan as a second scale (galaxy → continent → city)
- Deep links as a save state
- Hoid as the journal's voice, not a mascot

Throw away: globals, integer indices, Canvas2D + shadowBlur, Tailwind CDN,
duplicated `roshar/` tree, emoji-as-icon, Coppermind hotlinks.
Isaac Stewart maps are in the atlas, with credit.

## Technical spine

```
src/
  core/        App, CameraRig, store, urlState, persist
  data/        typed lore with stable string IDs, citations, spoiler arcs
  layout/      positions derived from data + time + realm
  cartography/ recipes.ts (the one description of a world), the CPU baker for
               the atlas panel, Stewart raster registry, city plans. No Three.
  render/      Three only. Orrery, Shadesmar, Spiritual, the GPU bakers, post
  shaders/     GLSL. lib/ is included, never copied
  ui/          DOM; never imports three
  styles/      one file per UI module
```

One recipe table, two bakers. `cartography/recipes.ts` is the only
description of what a world looks like. `render/planetBake.ts` renders it on
the GPU for the globe at two resolutions; `cartography/planetMap.ts` is its
CPU twin for the atlas panel, which cannot import Three. Change one without
the other and the plate and the globe start disagreeing about where a
continent is.

Anything that does not change per frame is baked once at boot: the sky, the
Spiritual field, Shadesmar's glass, the world plates. Marching a static field
per pixel per frame cost more than every planet and post pass combined.

- TypeScript, Vite 6, Three r180, `postprocessing`, `vite-plugin-glsl`
- No React. Vanilla DOM, Aetherfield-style `el()` helper
- PWA, relative `base: './'`
- Quality ladder: post/bloom first, globe tessellation last

## Nested scales

One world space. Systems sit hundreds of units apart. Planets orbit their
suns at tens of units. The camera *is* the zoom.

| Distance to subject | Scale | What resolves |
| --- | --- | --- |
| Cosmere | systems as jewels | suns, Investiture nebulae, labels |
| System | orrery | orbits, moons, perpendicularities |
| Globe | one world | atmosphere, weather, continents |
| Surface | projected atlas | locations, trails, era-true maps |
| City | nested layer | Stewart plates where we have them; original plates elsewhere |

`Esc` pops one scale. Deep link remembers scale + subject + year + realm.

## Realms

Each Realm is its own renderer and its own grade, not a filter on the orrery.

- **Physical** — the orrery. Worlds, moons, rings, orbits, nebulae.
- **Cognitive** — a bead ocean per system, the light of every mind over them,
  worldhopper roads, and the places that stand in Shadesmar itself:
  Silverlight, Celebrant, Lasting Integrity, the Ire Fortress, the Grand
  Knell, the perpendicularities from the far side, the three named Rosharan
  Expanses. Nothing over there is lit by a star, and the grade says so.
- **Spiritual** — not a map. One light Shattered into sixteen, threads of
  Connection between them, Splintered Shards drawn as the fragments they
  became, Connection / Identity / Fortune as great circles, the four
  Dawnshards on a wider and older ring. Pre-Shattering: Adonalsium whole.

## Time

Playhead is a *speculative alignment* used to drive the picture. Each world's
own calendar is what we print. Cross-world coincidence is badged
`speculation`. Era-weighted slider so Stormlight's years are not a 2-pixel
notch on ten millennia.

Scadrial's Catacendre is a **map swap**, not a filter: ash-choked Final
Empire becomes Harmony's basin.

## Spoiler model

`series` + `arcs` (Stormlight by book, Mistborn by book). An entity reveals
when `progress[series] >= requiredArc`. `book: 'core'` is always safe.
Reading Companion: "I am on *Words of Radiance*" syncs the universe to that
beat and chips anything new this arc.

## Art bible

Each world has a biome recipe for the *globe*. Recipes produce
equirectangular albedos, night lights, and clouds. Style: painterly
cartography, not photoreal Earth. Shard colour is the emissive accent.

The atlas is a different picture: Roshar and Scadrial world maps, and the
city plates listed in `src/cartography/officialMaps.ts`, are Isaac Stewart
rasters in `public/maps/`, always credited. They are not equirectangular —
do not drape them on the globe. Other worlds and remaining cities still
use the procedural atlas / `cityMap.ts`.

HUD chrome: a brass-and-glass instrument with a journal set into it. One
signal colour (cyan, meaning *state*) and one warm (gold, meaning *the
journal*). Hairline rules rather than borders, 2px corners rather than 12,
tracked small caps rather than capsules; a button's hover is a pen line under
the word. Headings, the wordmark, the year and the ticker are set in a book
face; the instrument stays in the grotesque. No gradients on controls — the
picture behind the glass is the decoration. Tokens live in
`src/styles/base.css` and nothing should hard-code a colour past them.

## Honest chronology

Brandon keeps cross-world dates fuzzy on purpose. Cephandrius will never
paper over that. The ticker may say "≈ Mistborn Era 1" while Roshar's card
still reads 1173.
