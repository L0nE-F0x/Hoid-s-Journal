# Cephandrius — working notes

**Live todo is `handoff.md`.** Read that first on a new session.

Unofficial Cosmere atlas. The original Hoid's Journal lives at
`/home/lonefox/Projects/ApexForge/cosmere-interactive-map` and must not be
edited from this project.

Visual and architectural parent: `/home/lonefox/Projects/Aetherfield`.

## Invariants

Breaking either of these is how this turns into a tangle:

1. **`src/ui/**` must not import `three` or anything in `src/render/**`.**
   The only channel between the UI and the renderer is `src/core/store.ts`.
   The UI mutates state, the renderer subscribes.
2. **Lore is data, never Cosmere layout.** `src/data/` describes worlds,
   shards, people, magic, time. Where a planet sits this year, in this Realm,
   is derived in `src/layout/` and consumed by `src/render/`. Baking orrery
   coordinates into lore is how the v1 surface maps rotted.

3. **One recipe table, two bakers.** `src/cartography/recipes.ts` is the only
   description of what a world looks like. `render/planetBake.ts` renders it
   on the GPU for the globe; `cartography/planetMap.ts` is its CPU twin for
   the atlas panel, which cannot import Three. Change one baker without the
   other and the plate and the globe start disagreeing about where a
   continent is.

   Atlas UVs (`Location.u/v`) *are* 0–1 on the plate currently shown, not on
   the globe. Roshar is calibrated to `public/maps/roshar_full.jpg`
   (3096×1800); Scadrial ash to `final_empire.jpg` (2048×1555) and basin to
   `elendel_basin.png` (795×1200). Other worlds sit on our procedural atlas.
   Globe albedo stays procedural, so a pin on the 3-D continent is
   approximate.

4. **Exactly one enabled pass renders to the canvas, and there is always
   one.** `postprocessing`'s `EffectComposer` hands that job to whichever
   pass was added last. Disabling the last pass therefore draws the whole
   chain into a buffer nobody reads — a black canvas over a working HUD.
   `routeOutput()` in `render/post.ts` owns it; `test:interaction` asserts it
   at every quality band.

## Product locks (do not quietly reverse)

- Rereaders first. Default progress is "fully read." First-run still offers a
  spoiler gate.
- Nested cinematic: planet → system → Cosmere, then the HUD.
- Every published world is in scope, nested (globe + surface + city).
- Globe textures stay procedural. Atlas plates may use Isaac Stewart
  cartography, credited. No Coppermind portraits.
- Public name: **Cephandrius — Hoid's Journal**.
- Unofficial fan project. Dragonsteel disclaimer on the title screen.

## Commands

```bash
npm install
npm run dev          # http://127.0.0.1:5174
npm run build        # tsc --noEmit + vite build

# Headless capture. Needs `npm run dev` running in another shell.
npm run shot -- --focus roshar --scale globe --out /tmp/roshar.png
npm run shot -- --intro --settle 8000 --out /tmp/intro.png
npm run shot -- --eval "__ceph.store.set('realm','cognitive')" --out /tmp/c.png

npm run test:interaction   # 32 checks through real mouse and keyboard
npm run perf               # fps per Realm, expensive layers toggled off
```

Do visual work through `npm run shot`, not by eyeballing a browser tab: a
background tab throttles `requestAnimationFrame` to a crawl, so damped camera
flights never converge and every screenshot lies. `window.__ceph`
(`{ store, app, ui }`) exists for the harness only.
