# Cephandrius — Hoid's Journal

An unofficial, spoiler-aware atlas of Brandon Sanderson's Cosmere.

You fly the Cosmere the way a worldhopper would: a highstorm on Roshar, pull
back through the ten gas giants, then the whole of creation — Scadrial's
mists, Nalthis' colour, the dark of Threnody — hanging in the same sky. Time
is an instrument. The three Realms are places. Magic is a set of tables you
can actually use while you reread.

This is the successor to the original Hoid's Journal, rebuilt from first
principles. The original is preserved untouched.

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
| Cosmere | Flyable 3D orrery of thirteen systems, with marched nebulae and a painted galaxy behind them |
| System | Kepler orbits, twenty-two moons, ringed gas giants, perpendicularities |
| Globe | A planet you can read: terrain, a cloud deck that casts shadows, night-side cities, ice, a marched atmosphere, and Roshar's highstorm crossing it |
| Surface | Continent and city atlas. Roshar and Scadrial use Isaac Stewart plates, credited. Other worlds are baked from the same recipes as their globes. |
| Time | Era-weighted playhead; per-world calendars stay honest |
| Realms | Physical, Cognitive and Spiritual, each with its own renderer and its own grade |
| Companion | Spoiler checklist, Codex, Arcanum, Lore Web |

### What is in it

Thirteen systems · eighteen worlds and ten Rosharan gas giants · twenty-two
moons · sixteen Shards · ninety people, seven of them dragons · a hundred
and twenty-four places · fifteen Cognitive sites · ten perpendicularities ·
fifteen magic systems with twelve tables · a hundred and twenty-three
glossary terms · four Dawnshards.

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
`WASD` fly, `Q`/`E` rise and fall, `Shift` faster.
`Space` play/pause time · `←` `→` step · `1`–`6` jump era.
Focusing a world holds the playhead; `Space` sets it running again.
`C` Cognitive · `V` Spiritual · `L` Lore Web · `M` galaxy · `/` search · `K` Codex.
In the Lore Web, scroll zooms and dragging the background pans.
`Esc` backs out a scale (city → surface → globe → system → Cosmere) or leaves the Web.
Hover names a world; click opens its card. WASD/QE fly and never open panels.
Arcanum, Music and Share are buttons. Official maps are credited on the atlas.

## Architecture

See `handoff.md` (live todo), `AGENTS.md` (invariants), and `DESIGN.md` (locks).

Worlds are baked on the GPU from one recipe table that both the renderer and
the atlas panel read, so a continent sits in the same place on the plate and
on the globe. The sky, the Spiritual field and Shadesmar's glass are baked
once at boot rather than marched per frame.

```bash
npm run shot -- --focus roshar --scale globe --out /tmp/roshar.png
npm run test:interaction   # 36 checks through real mouse and keyboard
npm run audit:ui           # clicks every control, reports the ones that do nothing
npm run perf               # fps per Realm, expensive layers toggled off one at a time
```

Run `perf` before and after any renderer change. `window.__ceph.diagnose()`
in the console prints the driver, drawing buffer, pixel ratio and program
count — the first thing to ask for when someone reports a black sky.
