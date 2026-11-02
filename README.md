# Hoid’s Journal

An unofficial, spoiler-aware atlas of Brandon Sanderson's Cosmere.

You fly the Cosmere the way a worldhopper would: a highstorm on Roshar, pull
back through the ten gas giants, then the whole of creation — Scadrial's
mists, Nalthis' colour, the dark of Threnody — hanging in the same sky. Time
is an instrument. The three Realms are places. Magic is a set of tables you
can actually use while you reread.

Live at **[the-cosmere.com](https://the-cosmere.com)**.

Every published book is in, through *Wind and Truth*, *Isles of the
Emberdark* and *The Fires of December*. The lore is written from the books'
cited canon on the Coppermind, not from previews, and each fact waits for the
book that reveals it: tell the journal where you are, and it never shows you
more than you have read.

This is the successor to the original interactive Cosmere map, rebuilt from
first principles. The original is preserved untouched.

Source: [L0nE-F0x/Hoid-s-Journal](https://github.com/L0nE-F0x/Hoid-s-Journal).

**Not affiliated with Dragonsteel Entertainment or Brandon Sanderson.**
The Cosmere and all related names are their trademarks.

## Running it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5174](http://127.0.0.1:5174).

Netlify: connect this GitHub repo, branch `master`. The build is
`npm run build`, the publish directory is `dist`.

## What it is

| Layer | What you get |
| --- | --- |
| Cosmere | Flyable 3D orrery of nineteen systems, with marched nebulae and a painted galaxy behind them |
| System | Kepler orbits, fifty-seven moons, belts, ringed worlds, perpendicularities |
| Globe | A planet you can read: terrain, a cloud deck that casts shadows, night-side cities, ice, ringed gas giants that shadow themselves, a marched atmosphere, and Roshar's highstorm crossing it. Roshar's coastline is traced from the published map, so a pin sits on the ground it names |
| Surface | Continent and city atlas. Roshar and Scadrial use Isaac Stewart plates, credited. Other worlds are baked from the same recipes as their globes. |
| Time | Era-weighted playhead; per-world calendars stay honest |
| Realms | Physical, Cognitive and Spiritual, each with its own renderer and its own grade |
| Companion | Spoiler checklist, Codex, Arcanum, Lore Web |

### What is in it

Nineteen systems · thirty-three worlds and eighteen gas giants · fifty-seven
moons · six belts · sixteen Shards · five hundred and thirty-five people, seven
of them dragons · two hundred and eighty-six places, every one with a biography
· city-plate landmarks measured onto the Stewart plates that have them ·
seventeen Cognitive sites · twelve perpendicularities · eighty-six
organisations · twenty-one magic systems, each with a table · three hundred and
eighty-six glossary terms · four Dawnshards.

### The three Realms

**Physical** is the orrery. **Cognitive** is Shadesmar: a bead ocean over
each system's worlds, the light of every mind in the Cosmere hanging over
it, worldhopper roads between them, and the places that stand there —
Silverlight, Celebrant, Lasting Integrity, the Ire Fortress, the Grand
Knell, the three named Rosharan Expanses. **Spiritual** is not a map: one
light Shattered into sixteen, every piece still Connected, with the
Splintered ones shown as the fragments they are.

## Controls

Drag to orbit · right/middle/shift-drag to pan · scroll to zoom.
On a phone: drag the sky to orbit, pinch it to zoom the camera, long-press to open a card.
Pinch a card, panel or map plate to zoom the page; once it is zoomed, drag pans and pinch zooms back out.
`WASD` fly, `Q`/`E` rise and fall, `Shift` faster.
`Space` play/pause time · `←` `→` step · `1`–`6` jump era.
Focusing a world holds the playhead; `Space` sets it running again.
`C` Cognitive · `V` Spiritual · `L` Lore Web · `M` galaxy · `/` or `K` search the Codex.
`H` or `?` help · `F` frame the Cosmere · `[` `]` previous / next thing at this scale.
`Tab` walks every panel; on the atlas, arrow keys step through the pins and `Enter` goes there.
In the Lore Web, scroll zooms and dragging the background pans.
`Esc` backs out a scale (city → surface → globe → system → Cosmere) or leaves the Web.
Hover names a world; click opens its card. WASD/QE fly and never open panels.
Search, Arcanum, Journal, Realms, Settings, Lore, Help and Share are on the top bar; the
soundtrack is in Settings. Official maps are credited on the atlas.

## Architecture

See `handoff.md` (live todo), `AGENTS.md` (invariants), and `DESIGN.md` (locks).

Worlds are baked on the GPU from one recipe table that both the renderer and
the atlas panel read, so a continent sits in the same place on the plate and
on the globe — `npm run test:cartography` is what keeps that true. The sky,
the Spiritual field and Shadesmar's glass are baked once at boot rather than
marched per frame.

```bash
npm run shot -- --focus roshar --scale globe --out /tmp/roshar.png
npm run test:interaction   # checks through real mouse and keyboard
npm run test:cartography   # the globe and the atlas still draw the same world
npm run audit:data         # every id resolves, every reference points at something
npm run audit:spoilers     # no card shows a reader a word from a book they have not reached
npm run audit:ui           # clicks every control, reports the ones that do nothing
npm run build && node .github/scripts/smoke-dist.mjs   # the production build under the live headers
npm run perf               # fps per Realm, expensive layers toggled off one at a time
```

Run `perf` before and after any renderer change. `window.__ceph.diagnose()`
in the console prints the driver, drawing buffer, pixel ratio and program
count — the first thing to ask for when someone reports a black sky.
