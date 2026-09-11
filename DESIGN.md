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
3. **Scope.** Every published world, nested (globe + surface). Not a slice.
4. **Pillars.** Orrery + time, spoiler companion, Arcanum, three Realms,
   Roshar surface, Scadrial surface (Catacendre map-swap), Codex. Lore Web
   is later. **Battle sim is cut.**
5. **Art.** Original and procedural only. No official map scans, no Coppermind
   portraits.
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
duplicated `roshar/` tree, emoji-as-icon, Coppermind hotlinks, battle sim.

## Technical spine

```
src/
  core/     App, CameraRig, store, urlState, persist
  data/     typed lore with stable string IDs, citations, spoiler arcs
  layout/   positions derived from data + time + realm
  render/   Three only
  shaders/  GLSL
  ui/       DOM; never imports three
  styles/   one file per UI module
```

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
| City | nested layer | original city plates |

`Esc` pops one scale. Deep link remembers scale + subject + year + realm.

## Realms

- **Physical** — the orrery.
- **Cognitive** — bead oceans where land was, Silverlight routes, cognitive
  entities stay bright.
- **Spiritual** — not a map. Connection, Fortune, Identity; sixteen motes
  around a unity core. Pre-Shattering: Adonalsium whole.

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

## Art bible (procedural)

Each world has a biome recipe, not a JPEG. Recipes produce equirectangular
albedos, night lights, clouds, and a surface atlas. Style: painterly
cartography, not photoreal Earth. Shard colour is the emissive accent.

HUD chrome: Aetherfield instrument (frosted glass, hairline, tracked labels)
tinted Honor-cyan / Odium-amber / Cultivation-green. Wordmark is a clipped
cyan→violet gradient, letter-spaced.

## Honest chronology

Brandon keeps cross-world dates fuzzy on purpose. Cephandrius will never
paper over that. The ticker may say "≈ Mistborn Era 1" while Roshar's card
still reads 1173.
