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
2. **Lore is data, never positions.** `src/data/` describes worlds, shards,
   people, magic, time. Layout (where a planet sits this year, in this Realm)
   is derived in `src/layout/` and consumed by `src/render/`. Baking pixel
   coordinates into lore is how the v1 surface maps rotted.

## Product locks (do not quietly reverse)

- Rereaders first. Default progress is "fully read." First-run still offers a
  spoiler gate.
- Nested cinematic: planet → system → Cosmere, then the HUD.
- Every published world is in scope, nested (globe + surface).
- Globe textures stay procedural. Atlas plates may use Isaac Stewart
  cartography, credited. No Coppermind portraits.
- No battle simulator. The atlas is the product.
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
```

Do visual work through `npm run shot`, not by eyeballing a browser tab: a
background tab throttles `requestAnimationFrame` to a crawl, so damped camera
flights never converge and every screenshot lies. `window.__ceph`
(`{ store, app, ui }`) exists for the harness only.
