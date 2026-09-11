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
| Cosmere | Flyable 3D orrery of every published system |
| System | Real orbits, moons, perpendicularities, Investiture |
| Globe | A planet you can read: atmosphere, weather, era |
| Surface | Continent and city atlas (original maps, not scans) |
| Time | Era-weighted playhead; per-world calendars stay honest |
| Realms | Physical / Cognitive / Spiritual as distinct spaces |
| Companion | Spoiler checklist, Codex, Arcanum |

## Controls

Drag to orbit · right/middle/shift-drag to pan · scroll to zoom.
`WASD` fly, `Q`/`E` rise and fall, `Shift` faster.
`Space` play/pause time · `←` `→` step · `1`–`6` jump era.
Focusing a world holds the playhead; `Space` sets it running again.
`C` Cognitive · `V` Spiritual · `/` search · `A` Arcanum · `K` Codex.
`Esc` backs out a scale (city → surface → globe → system → Cosmere).

## Architecture

See `handoff.md` (live todo), `AGENTS.md` (invariants), and `DESIGN.md` (locks).
