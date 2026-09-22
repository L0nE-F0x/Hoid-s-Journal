# Hoid’s Journal — handoff

**Read this first.** Live top-of-todo across sessions.

Repo: `/home/lonefox/Projects/Cephandrius`
Remote: https://github.com/L0nE-F0x/Hoid-s-Journal (`master`)
Original v1 (museum, **do not edit**): `/home/lonefox/Projects/ApexForge/cosmere-interactive-map`
Visual/architecture parent: `/home/lonefox/Projects/Aetherfield`

Product name: **Hoid’s Journal** · live at **https://the-cosmere.com**
Unofficial fan project. Dragonsteel disclaimer stays on the title screen.

Architecture lock: `AGENTS.md` + `DESIGN.md`. This file is the live todo.

---

# ▶ START HERE — next session

**2026-09-22 pass is in the tree, not necessarily pushed.** Ten items from
the fresh audit:

1. City plates no longer paint world-map pins onto Stewart city art. Marks
   with `on: [{ file, u, v }]` were measured off the plate they name
   (Luthadel, Elendel's survey, Kholinar's palace, Kharbranth's view,
   Urithiru's section and oathgate ring). A layer with no measurement
   (Kredik Shaw close-up, the Elendel Lost Metal sheet, Thaylen, Fadrex,
   Urteau, New Seran, the Shattered Plains) shows the art and no dots.
2. `CharacterEra.at` places people a book actually locates. Opening them
   flies to that place and keeps their card. Everyone else still scatters.
3. Ash, storm, dawn and the contest are different skies, centred on the
   world they happen to. The Catacendre tick (year −1, still era 2) swaps
   Scadrial to the basin plate. Heraldic, Recreance, Alloy and the space age
   stay ticks: two dates are speculation, and the other two are not a detonation.
4. Sel, Lumar's rocks, Canticle's corridor, Ashyn and Braize follow the
   places already charted. Cloud coverage was re-read as coverage: Threnody
   mist, Komashi shroud, Ashyn ash, Canticle almost clear, water worlds less
   overcast. Roshar and Nalthis were left as previously tuned.
5. Relation sentences show on the card and on the Lore Web path. The ones
   that are later books (`relationArcs.ts`) stay hidden until that arc.
   `readingFace.ts` is the early card for the cast whose published bio
   already knows the ending. Fully read is the published text.
6. Old Magic, Yolish Lightweaving, Hion, ChayShan, Bloodsealing and
   Sunhearts have tables. Old Magic rows that spoil later Stormlight books
   wait for those books. Forgery no longer redefines Bloodsealing.
7. `[` and `]` move to the previous and next thing at the current scale.
   The atlas treats a drag as not a tap, a hold opens the card, and a coarse
   pointer gets a larger hit target. Pinch on the sky was already there.
8. Nebula march steps follow how large the cloud is on screen.
9. `.github/workflows/ci.yml` runs the typecheck, `audit:data`, and — with
   Chrome — cartography and interaction. `sw.js` is `ceph-v3` and fetches
   plates network-first. An open tab reloads when a new worker claims it.
10. The README counts match the data. **Miral is not in the journal.**
    *The Fires of December* publishes 6 October 2026. When it is out, and
    only then: a series entry, a body, a star marked as ours if the book
    never places it, and witchcraft as a magic. Do not write it from
    previews. The kite planet and Zidorna stay out. The Vanrial, the
    stormwardens, the Chorus and the Kerztian clergy stay empty.

Godrays, depth of field and aurora still need a decision each. Do not invent
members for the empty orders.

**The app is called Hoid’s Journal and lives at https://the-cosmere.com.**
Do not reintroduce "Cephandrius" as branding — it is Hoid’s own name, so the
old title said the same thing twice. It survives on purpose in exactly two
places: the lore (`characters.ts`, `glossaryMore.ts` — he really is called
that) and the epigraph signature, *"Cephandrius, in his own hand"*, which is
the joke. The working directory, the `ceph-` CSS prefix and `window.__ceph`
are all still called Cephandrius and that is deliberate: none of them are
user-visible and renaming them buys nothing but risk.

**The mark is the old app's icon**, inherited on purpose so the two apps read
as one thing: `public/logo.jpg` is the plate (it was a JPEG named `.png` for
seven months), `icon-192/512.png` are scaled from it by `npm run icons`, and
`public/mark.svg` is a hand-drawn reduction — hexagon, ring, four-point rose —
for the 16px tab, where the starfield turns to grey mush. The two are not
expected to match pixel for pixel.

**The SPA catch-all is gone from `netlify.toml` on purpose.** Routing is all
fragment (`/#body=roshar`), so `/*  ->  /index.html  200` never routed
anything; it only turned typos and missing plates into a 200 HTML page.
Unmatched paths now reach `404.html`.

Do not reopen a fourth classifier on `scadrial_full.png`. Edit the polygons.
Do not restart the audit or the lore checks.

**The star charts are done. Do not re-derive them.** Every system in
Arcanum Unbounded is now drawn entire — planets, moons, belts, dwarf
planets, second stars — and every count is sourced in the data. What canon
leaves unnamed (dwarf planets, the moons of Ky, Ralen, the two Aagals,
Farkeeper and the outer Drominad giants) is numbered, and each of those
cards carries a field note saying the numeral is ours. What canon does not
place at all (Dhatri, the Grand Apparatus, Mythos, Rellam, Bjendal) sits at
a star of our invention and says so on its own card. **Three things were
left out on purpose:** Miral (*The Fires of December*, 6 October 2026 — not
published, and the product lock is published worlds only), the kite planet
(canon gives it no name), and Zidorna (canon says it may not be a planet at
all).

**Laptop WebGL (this machine, not the app).** A title screen that says
"this browser is providing no WebGL at all" is Chrome's GPU process running
`--use-gl=disabled`. Hybrid Intel + NVIDIA 4050: the flags file pins Chrome
to Intel (`pci-0000:00:02.0-render` = `renderD128` this boot). If Chrome
starts on NVIDIA (`renderD129`), ANGLE `gl-egl` fails and Chrome disables GL
for the whole process — every tab, including the PWA. Fix: fully **Exit**
Chrome (not the tab), reopen via the "Google Chrome" launcher
(`google-chrome-intel`). The journal’s PWA desktop must go through that
wrapper; `/opt/google/chrome/google-chrome --app-id=…` skips
`~/.config/chrome-flags.conf`. Verified 2026-09-20 after a full quit.

Hard-refresh https://the-cosmere.com — the service worker keeps the
old shell.

---

**2026-09-20 visual pass is live.** The Shattering is a set-piece instead of
a growing circle, it no longer re-detonates on every era click, orbits have a
near side and a far side, the star has a disc, and the roads carry traffic.
Pins are beads, not confetti; first visit is Stormlight. Hard-refresh
https://the-cosmere.com — the service worker keeps the old shell.

**2026-09-15 audit pass is live.** Ten findings, ten fixed, pushed. The
owner asked for a deep audit (lore depth, lore accuracy, debugging,
visuals), then the ten best improvements, then all ten. Hard-refresh
https://the-cosmere.com — the service worker keeps the old shell,
and Roshar's globe actually looks like Roshar now.

**Do not restart the audit, and do not reopen the lore checks.** All three
were verified on 2026-09-15 and the data was right every time — see *Lore
checked*. The wet pins are measured and fixed too. Nothing from the audit is
outstanding; *Do next* is optional work only.

Three commits landed after the ten: `audit:ui` crawls by identity and restores
the whole scene (it had been clicking one button and printing another's name,
which is where three sessions of "Sixth of the Dusk does nothing" came from),
three Roshar pins that were genuinely in the sea were measured off the plate
and moved, and the lore checks came back clean.

**The headline:** Roshar's globe is Roshar now. It was twelve gaussian blobs,
and `Location.u/v` are 0–1 on the published plate, so the atlas put Kholinar
on Alethkar and the globe put the same pin in open ocean, side by side in one
frame. The coastline is traced off the plate; see *Sharp edges*.

Git: `master` tracking https://github.com/L0nE-F0x/Hoid-s-Journal, **level
with origin**. Live site: https://the-cosmere.com — **it deploys on
push, so `git push` is the deploy.**
**Do not edit the v1 repo** at `ApexForge/cosmere-interactive-map`.

```bash
cd /home/lonefox/Projects/Cephandrius
npm install
npm run dev              # http://127.0.0.1:5174

# Second shell. This is how you check anything.
npm run shot -- --focus roshar --scale globe --out /tmp/roshar.png
npm run test:interaction # 67 checks through real mouse and keyboard
npm run test:cartography # 17 checks that both bakers draw the same world
npm run audit:data       # referential integrity over src/data
npm run audit:ui         # clicks every control, reports the ones that do nothing
npm run perf             # fps per Realm, expensive layers toggled off one at a time
```

**Do not verify visuals in a Chrome tab you are not looking at.** A
background tab throttles `requestAnimationFrame`, so damped camera flights
never converge and every screenshot lies. `tools/screenshot.mjs` drives
headless Chrome at 60fps, waits for the flight to land, and **exits 2 if it
never does** — it used to write a plausible picture of the wrong place and
exit 0.

`window.__ceph = { store, app, ui, diagnose, bakePlanetMap, plateTint,
bodyById }` is the harness handle only. `__ceph.diagnose()` prints the driver,
the drawing buffer, the pixel ratio, the program count and any fault — ask for
it first when someone reports a black sky.

Last known green, all with `npm run dev` up: `npx tsc --noEmit`,
`test:interaction` **67/67**, `test:cartography` **17/17**, `audit:data`
clean, `audit:ui` 0 dead controls, `perf` 60fps everywhere except the
Cosmere frame, which is 51 (it was 53 over thirteen systems; it is eighteen
now, and the cost is the Investiture clouds).

---

## What the last session changed

**2026-09-21 rename, mark and share pass (pushed and live).** The owner was
consolidating two apps into one brand: the v1 map gives up its Netlify URL
and its icon, and the new atlas takes both. Renamed **Cephandrius — Hoid’s
Journal → Hoid’s Journal**, because Cephandrius *is* Hoid and the old name
said it twice.

- **Brand.** `src/ui/brand.ts` is still the single source: wordmark, the new
  gold sub-line *"Kept by a man with too many names"* (the old sub-line was
  the name and had nowhere to go), disclaimer. `<title>`, the manifest, the
  OG/Twitter block and the boot screen all follow it. Typographic apostrophe
  in display copy — a straight one reads as a tick at 48px.
- **Mark.** The v1 icon is now this app's icon everywhere. `logo.png` was a
  JPEG named `.png`, so it is `logo.jpg` now; `icon-192/512.png` are scaled
  from it by a rewritten `npm run icons` (ImageMagick, quantised: the 512
  went 340KB → 83KB). **The manifest no longer lists `mark.svg` first** —
  that entry, `sizes: any` and transparent, is why Android was drawing the
  journal on a white plate while v1 sat next to it full-bleed and dark.
- **Domain.** `the-cosmere.com`. A production build now always claims the
  canonical domain rather than `env.URL`, so the card does not name a
  `*.netlify.app`; previews still name themselves.
- **Share polish.** `og.jpg` re-rendered — settle 2400 → 9000, because 2400
  caught the camera mid-flight with the type washed out over a lit globe.
  Added `robots.txt`, `sitemap.xml`, a styled `404.html`, cache headers and
  `nosniff`/`Referrer-Policy`/`Permissions-Policy`.
- **Weight.** `roshar_full.jpg` was a **12MB PNG** wearing a `.jpg`
  extension. Re-encoded to real JPEG q88 at the *same* 3096×1800, so the
  `Location.u/v` calibration and the traced coastline are untouched.
  `public/maps` 26MB → 15MB. `Shadesmar_full.jpg` was the same trick, 1.2MB
  → 220KB.
- **Accessibility.** The scene canvas and the atlas plate canvas had no
  accessible name; both are `role="img"` now, the plate's label tracking its
  own heading.


**2026-09-21 star charts (`63403c1` → `92d85c1`, pushed and live).** The owner was
reading *Arcanum Unbounded*, got to the Selish system chart, and found one
planet in our Selish system where canon draws four, two belts, five moons
around Ralen alone and a dwarf world past the comet belt. The whole atlas
had the same hole. This pass fills it.

**Data.**

1. **Selish.** Donne/Doo inside Sel, an asteroid belt, Ky/Kii (four moons),
   Ralen/Raa (five moons, rings, largest), a comet belt, and the unnamed
   dwarf planet past it. The star is **Mashe**, which holds the Aon Ashe —
   light.
2. **Scadrian.** Aagal Nod, the Near Eye (blue, six moons, largest) and
   Aagal Uch, the Far Eye (red, rings, five moons), named by the Nelazan
   before the ashfalls; a comet belt and two unnamed dwarf planets past it.
   Scadrial was built after the Shattering — the rest of that system was
   Adonalsium's, so the Scadrian star now stands in era 0 and Scadrial does
   not. *That changed a test; see below.*
3. **Rosharan.** The asteroid belt that divides the three terrestrial worlds
   from the ten gas giants. **The gas giants lost their rings** — canon says
   none of the ten has a known moon or ring, and we had painted rings on
   five.
4. **Nalthian.** Farkeeper the Bright (red, six moons, largest) and
   Nightstar the Hidden (small, violet, far out), both titled like Returned
   because canon names them that way; a comet belt past Nightstar; and the
   cognitive anomaly that shares Nalthis's orbit, as a Shadesmar site.
5. **Threnodite.** Monody, Elegy (and **Coronach**, the system's only moon)
   and Purity, which is much larger and much further out than the other
   three. Three of the four are named for songs of mourning. The planet id
   is `elegy-planet`: a Charred on Canticle already owns `elegy`, and that
   is not a coincidence — Canticle was settled from Threnody.
6. **Drominad.** Fourth of the Sun (rings), the asteroid belt, and Fifth,
   Sixth and Seventh — three gas giants with three, four and four moons.
   Second and Third are water worlds with human societies, not the barren
   rocks we had. First of the Sun's moon has a canon name now: **First of
   the First**.
7. **Taldain.** A binary, at last: **AisDa** the blue-white supergiant at
   the centre and **the Eye of Ridos**, a white dwarf inside its Particulate
   Ring, twice as far out as the planet and on the same bearing forever —
   which puts Taldain exactly on the line between its two suns, where White
   Sand says it sits.
8. **UTol.** UTol and Komashi are a double planet now (`Body.orbitAround`),
   swinging around each other while the pair goes round a red-orange sun. So
   each hangs in the other's sky, which is what the daystar is. Their two
   invented moons are gone, and so is Braize's — the Rosharan system has
   exactly three moons in canon.
9. **Five worlds canon names and never places:** Dhatri (the aethers'
   homeworld), the Grand Apparatus, Mythos, Rellam and Bjendal. Each gets a
   star of our own with a thin Investiture cloud and a field note saying so.
   Rellam comes from *Elsecaller*, which is now in the Journal's book list.
10. **Lumar's aethers were swapped.** The Crimson Moon was described as
    roseite; crimson grows spikes (coral), roseite is the pink crystal over
    the Rose Sea. Each of the six named moons now names its sea.
11. **Stars have colour from canon** where canon gives it: Roshar's is
    white, Threnody's red, UTol's red-orange, and the Nalthian, Scadrian and
    Selish suns are yellow and much alike. The Investiture cloud is still
    the art device that tells systems apart at Cosmere distance.

**Renderer.**

- `Belt` is a new kind: a `Points` cloud per belt, scattered through an
  annulus and drifting *differentially* in the vertex shader (the inside of
  a belt goes round faster than the outside; a belt turning as one rigid
  disc reads as a decal). Drawn inside its own system only.
- Rings are data (`Body.rings`) instead of a hard-coded table in the
  renderer, which is why Canticle finally has the blue-and-gold rings that
  light its night side.
- `System.companions` puts second stars in the sky; `systemExtent` counts
  belts and companions, so a system frames its whole disc.
- Moon orbit rings wait for the camera now. Six concentric ellipses around
  a planet three pixels wide read as a target painted on the sky.
- **Taln's Scar** is in the starfield: a bowed swath of nine hundred deep
  red stars, laid over the field rather than added to it. It and Reya's Tear
  are both glossary entries.

**2026-09-20 wrap (`b061e11` → `c914f62`, pushed and live).** Three product
commits plus the laptop WebGL diagnosis:

1. **Ash-era Scadrial coastline.** The Final Empire plate's sea is a neutral
   slate, not blue. Tracer rule is warmth (`r - b < 14`). 29/29 mistborn1
   pins on land. `b061e11`.
2. **Basin-era coastline.** `scadrial_full.png` cannot be classified (inland
   seas are the same white as land). Polygons in `tools/trace-coast.mjs`;
   World / Basin / Starchart atlas tabs; 31 mistborn2 pins remasured onto
   that plate. Zero in open water. `0cbcbc7`.
3. **Pins and playhead.** Globe pins are lit beads faded by the planet's
   n·v (`src/shaders/pin.frag`). First visit is year 0 / era 3 (Stormlight).
   `c914f62`. Interaction **59/59**.
4. **Chrome on this laptop had WebGL off** from 18:52 until a full Exit.
   GPU process: `--use-gl=disabled --render-node-override=renderD129`
   (NVIDIA). Flags on disk already named Intel; Chrome had never reread
   them. The PWA desktop now goes through `google-chrome-intel`. Not an
   app bug — see *START HERE*.

**2026-09-20 visual pass (`474725f` → `923fd77`, pushed and live).**

**2026-09-20 visual pass (`474725f` → `923fd77`, pushed and live).**
Lore and data untouched. Four commits:

1. **The WebGL2 probe took the canvas the renderer was about to ask for.**
   `getContext('webgl2')` on `#stage` fixes that canvas's attributes forever,
   so everything Three asked for was silently discarded — measured, the
   renderer was running at `powerPreference: "default"` instead of
   `"high-performance"`, and with `antialias: true` against its own post
   chain, paying for an MSAA backbuffer nothing reads. The probe is on a
   throwaway canvas now. The boot error also distinguishes "only WebGL1" from
   "no WebGL at all" and names `chrome://gpu`.
2. **The Shattering was a flat ring and a square.** An untextured annulus in
   the XZ plane plus a `SpriteMaterial` with no map, which renders as an
   additive box. Now four layers: a flash with an anamorphic streak, sixteen
   comets leaving Yolen in the sixteen Shard colours from `SHARDS`, a
   shockwave drawn as a sphere seen only at its limb so it is a ring from any
   angle, and an ember. See *Sharp edges* for the two tuning traps.
3. **…and it happened on every era click.** The chips set
   `year = era.start + 1`, so Pre is -7999 and Post is -6999, and every Pre →
   Post crossed -7000 and re-killed Adonalsium. Passive crossings play once
   per session; clicking the beat in the HUD always replays. Both pinned by
   tests — the suite is 58 now.
4. **Orbits had no near side and no far side.** The half behind its own star
   fades, via a varying injected into `LineMaterial` (it only publishes a
   world position under `WORLD_UNITS`, which would make orbit guides thicken
   as you approach — backwards). At Cosmere scale the rings also step back to
   a common cool tone; twenty-eight saturated ellipses at a range where you
   trace none of them was a spirograph.
5. **A star was a dot with a flare on it.** `sun.frag` already limb-darkens
   and granulates; `uCoreRadius` was 0.15 at every scale, so the disc was a
   twelfth of the billboard and none of it showed. 0.34 focused at system
   scale, 0.24 not, 0.15 from the Cosmere where a star should be a point.
6. **The roads between worlds dimmed all at once.** A global opacity sine on
   the whole line reads as a lamp, not as traffic. Routes send packets down
   their length now. `LineMaterial` only exposes `vLineDistance` under
   `USE_DASH`, so the material is dashed for the varying and given a dash
   longer than any route with zero gap, making the dashing a no-op.

**Two things were looked at and deliberately left alone**, so they do not get
rediscovered: `atmosphere.frag` is a marched single-scattering model with
wavelength-dependent Rayleigh, a Mie term at g=0.76, analytic ground clipping
and a softened terminator, on a 12%-radius shell — it is working, and at 1:1
it plainly is. And the sun's granulation still will not read because the disc
saturates under `NoToneMapping`; making it read means re-grading every shot
in the app.

Build clean, 58/58 interaction, 17/17 cartography, `audit:data` clean, perf
60fps on every layer (cosmere 53, unchanged).

## What the session before that changed

**2026-09-15 audit pass (`2cd584c` → this handoff, pushed).**

Ten items, each its own commit, in dependency order:

1. **Forty-four entries could be searched but never opened.** `loreById` is
   the only door into the encyclopedia and returns the first kind that claims
   an id, and ids were not unique across kinds. Fifteen of nineteen magic
   systems were shadowed by a one-line glossary term of the same name, so
   clicking "Allomancy" gave a sentence instead of the metals table and
   `openId`'s `magic` branch was dead code. Thirteen organisations went the
   same way, plus four Cognitive sites and four perpendicularities. The rule
   is now one id, one entry, enforced by `audit:data`.
2. **`audit:data`** — referential integrity over `src/data/`, no browser.
   Fails on anything unreachable or dangling; reports depth.
3. **The globe and the atlas were drawing different planets.** Different noise
   functions, a second ice cap painted at render time forty degrees wider than
   the baked one, a per-world tint only one baker applied, two colour spaces.
   `planetMap.ts` is a line-for-line port of the shader now, and
   `test:cartography` holds them together.
4. **Every world card read "SHARDS honor, cultivation, odium".** Named,
   clickable chips.
5. **The Lore Web had never heard of 270 people.** The roster gate was a
   precomputed "featured" set; it is now "has an edge", `see[]` is drawn as
   its own soft layer, structural edges stopped borrowing other types' names,
   and twelve empty org rosters were filled. 265 nodes → ~535, with gridded
   repulsion so it still runs.
6. **A ring you could never see cast a shadow you could never see.** Rings
   drew at system scale, shadows at globe scale, mutually exclusive. Both are
   on together, and the shadow is in world space instead of half in each.
7. **Salas was labelled across the middle of the planet it was behind.**
   Ray-sphere occlusion, and declutter now runs on moons too.
8. **"City scale" was the same orbit with a different word in the breadcrumb.**
   0.74 of the frame against 0.86 — a five per cent dolly. City frames a cap
   now, at about 1.8 radii instead of 2.8.
9. **Kholinar was on Alethkar in the panel and in open ocean on the globe.**
   Roshar's coastline is traced off the plate. See *Sharp edges*.
10. **Places were a one-line roster.** All 300 have a bio and a region; all
    285 glossary terms have a category.

Also: the capture harness stopped lying (above); the card stopped parking on
the roster it was meant to sit under; `audit:ui` stopped reporting working
controls as dead — it indexed controls by position and re-rendered the panel
between clicks, so it was clicking one button and printing another's name.
That is where "Sixth of the Dusk does nothing" came from, three sessions
running. The rewrite crawls by identity instead, but the first crawl still
leaked: restore only re-ran `setup`, so clicking Lore left `view=web` and
every later click was a legend chip reported under "sky · city". Romance
(already `is-off` from an earlier scene) was named as taking the app down.
A targeted click of every legend chip at city scale does not; the original
run was also regenerating `coastlines.ts` under Vite at the same time.
Restore now closes overlays the scene did not ask for, skips the title
plate and the fault Reload, and waits out a HMR reload before calling
`__ceph` vanishing a crash.

**Lore fixes that fell out of it.** Silverlight had a pin on Yolen and stands
on no world. The Ire Fortress was anchored to Selish by the hub and Scadrial
by the location; the Ire are Elantrians, the fortress is in Scadrial's
subastral. The Set was carrying the id `ghostbloods-scadrial`, listed Wax as a
member and omitted Edwarn Ladrian, who founded it — and three Lore Web edges
named `edwarn`, an id that has never existed, so Wax against his own uncle was
missing from the web.

**The two follow-ups, both closed the same day.**

- **The three lore claims** flagged from memory were all checked and all three
  were correct as written. See *Lore checked* below.
- **The wet pins.** `audit:data` listed fourteen in open water and the first
  pass left every one alone, on the grounds that the mask is derived and the
  UVs are the record. Right instinct, wrong stopping point: the record is the
  *plate*, and the plate can be read at full resolution. Three were genuinely
  wrong and were measured and moved — Kasitor (a hundred per cent water for
  forty-one pixels, its printed dot forty-seven away on the headland),
  Cusicesh (sharing Kasitor's wrong coordinate; it belongs in the bay, so it
  went into the water there) and Rit-vo-Ma (an island people live on, in open
  sea; placed by component search, because two eyeballed guesses both landed
  in water). The other eleven are correct and are listed as such in
  `audit-data.mjs` so the report stays short.

**Still open, and deliberately not touched:**

- **Four organisations with no members** — the Vanrial, the stormwardens, the
  Chorus, the Kerztian clergy. No named member on the page; inventing one is
  worse than an empty field.
- **Scadrial's Basin coastline.** Done 2026-09-20. Both eras now have a
  traced mask; see *START HERE*. Do not reopen a classifier on
  `scadrial_full.png`.

  Worth keeping in mind generally: Roshar and Scadrial are the only two worlds
  with published plates (`officialMaps.ts`); every other world's atlas plate
  *is* the procedural bake, so its globe and its plate agree by construction
  and there is no drawn coastline to trace. Moons are a separate pipeline
  again — `moon.frag`, craters and maria, no recipe and no pins.

## Lore checked — all three claims were right, do not reopen them

The 2026-09-15 pass flagged three things from memory as needing a Coppermind
check. All three were checked on 2026-09-15 and the data was correct in every
case. Recorded here so nobody "fixes" any of them:

1. **The sixteenth Shard is `Reason`, not Wisdom.** *Wind and Truth* revealed
   the name and it is Reason. `shards.ts` was right and the doubt was wrong.
2. **Valor's Vessel is `Medelantorius`**, a dragon of Yolen, a warrior before
   the Shattering. She has her own Coppermind page. Right as written.
3. **The Shattered Plains' fourth moon is canon.** Metallic remnants of a moon
   that fell before Honor arrived; the metal is explicitly *not* aluminum and
   was called greater by Honor; the fragments shroud the Plains from the eyes
   of the Shards. The `canon` badge is correct.

## And the one before that

**2026-09-14 visual pass (`65fa8fc` → `992ad2d`, pushed and live).**
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

## And before that — the encyclopedia

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
| Name | Hoid’s Journal (renamed 2026-09-21; Cephandrius *is* Hoid, so the old name said it twice) |
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
- Harnesses: `npm run shot`, `npm run test:interaction` (59 checks),
  `npm run perf`, `npm run bench`.

### What the atlas holds

Counted from the data, 2026-09-21 (the title screen counts the same rows):

| | |
| --- | --- |
| Systems | 18 (13 canon, 5 for worlds canon names without placing) |
| Worlds | 32, plus 18 gas giants |
| Moons | 57 |
| Belts | 6 — three asteroid, three comet |
| Shards | 16 |
| People | 431, including dragons, Heralds, Unmade, spren, vessels |
| Places | 300, plus 39 city landmarks |
| Orders / groups | 66 |
| Cognitive sites | 16 |
| Perpendicularities | 10 |
| Magic systems | 19, with tables |
| Glossary | 287 terms |
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
- **`npm run audit:ui`** crawls by identity and restores the scene's
  `view` / `panel` / `realm`, not just `setup`. Last run: 0 fatal, 0 dead.
  An earlier crawl named the Lore Web's Romance chip as taking the app
  down; that was the sweep leaking into the graph, not the chip.

## Do next (priority order)

### 1. Nothing is outstanding from the audit pass

The ten items are done and pushed; the three lore checks came back clean; the
wet pins are measured and fixed. What follows is optional.

### 1b. The star charts are complete; three worlds wait on publication

*The Fires of December* (6 October 2026) puts Hoid on **Miral**, a world
where rivers of blood run from a dead Eidolith and the magic is called
witchcraft, and Valor held it once. When it is published, Miral needs a
series entry, a body and a star of its own — the same treatment Dhatri and
the Grand Apparatus got. The **kite planet** and **Zidorna** stay out until
canon gives one a name and the other a decision about whether it is a planet
at all.

Two more that are drawn but thin: **Ashyn** and **Braize** have surfaces and
no pins on them, and Ashyn at least has canon geography — floating cities,
a surface left volcanic by unguarded Surgebinding. Pins there would be
guesses about *where*, so they are not there yet.

### 2. Four organisations still have no members

The Vanrial, the stormwardens, the Chorus and the Kerztian clergy. Left empty
on purpose — no named member appears on the page for any of them. Fill one
only if a reread turns up a name; do not invent one.

### 3. Optional depth, only if a reread reaches for it

- Landmark UVs for the Stewart **city** rasters. The interaction test picks
  landmarks from the roster chips because those scans have no calibrated UVs.
  Do not "fix" that by guessing — measure them off the plates.
- Lore Web edges live in `relationships.ts` + `relationsMore.ts` (~210 named).
  Still only as good as the graph; add an edge when a reread reaches for it.
- Azimir has no Stewart plate. Worlds without one use `cityMap.ts`, which is
  now a real plan generator rather than a placeholder.

### 4. Visual findings from 2026-09-20 — both taken

- **Location pins.** Beads with hemisphere lighting, faded by the planet's
  n·v so they die at the limb and never stick out of the silhouette. Far-side
  pins are hidden (picking already skipped them). `src/shaders/pin.frag`.
- **Default year is 0 / era 3 (Stormlight).** Rereaders first: a first visit
  lands in a Cosmere that has already happened. The title cinematic is a
  highstorm; year 0 is when that storm is the story. Pre-Shattering is still
  on the playhead — scrub back, or click Pre. The Shattering still plays.

### 5. Renderer ideas not taken

Written down so the next session does not rediscover them:

- **Godrays** from the local star at system scale. `postprocessing` has
  `GodRaysEffect` but it wants one light mesh, and there are thirteen suns.
- **Depth of field** at globe scale. The risk is that it reads as a blur bug
  rather than as a lens.
- **Aurora** on the Invested worlds. Cheap in the planet shader, but it needs
  a canon check per world before it goes in.

## Sharp edges / do not re-break

- **A belt's specks are sized in world units, not pixels.** `belt.vert`
  turns `aSize` into pixels with `0.5 * uViewHeight * projectionMatrix[1][1]`
  — the same projection-correct scale the starfield uses. The first cut used
  sizes ten times too small: every rock clamped to the 1px floor, the
  brightness fell with it, and both Selish belts were mathematically present
  and completely invisible. If a belt disappears, check `aSize` first.
- **Belt density is per unit of circumference.** A comet belt at 45 units has
  twice the ring to fill that an asteroid belt at 24 does. A flat count per
  belt makes the outer ones look like a rumour.
- **Two rules keep the star charts honest, and `audit:data` enforces both.**
  A belt may not swallow a planet's orbit (`inner < a < outer` fails), and a
  double planet may not orbit another double planet — the orrery resolves
  exactly one level of `orbitAround`, recomputing the partner's own offset
  rather than reading last frame's position, so the two are order-independent.
- **Moon orbit rings are gated on the camera, not on the scale.** Ky has four
  moons and Aagal Nod six; six concentric ellipses around a three-pixel
  planet read as a target painted on the sky. The moons themselves stay at
  system scale — dots are what the charts draw.
- **The Scar is written over the last 900 stars of the field, not appended.**
  A red streak has to sit at the same distances as the sky it belongs to, or
  it parallaxes off it. `SCAR_COUNT` comes out of `COUNT`; it does not add
  to it.
- **`EventFx`'s `TRAIL` is a sampling rate, not a look.** Sixteen points
  stretched along a fast head read as a dotted line. The streak only closes
  up when the spacing drops below the point size, so `TRAIL` and `uLagSpan`
  are tuned against each other — do not lower one without checking the other.
- **A title screen that says "no WebGL at all" on this laptop is Chrome,
  not the app.** Hybrid Intel + NVIDIA. Flags pin Chrome to Intel via
  `pci-0000:00:02.0-render`. A process that started on NVIDIA (`renderD129`
  this boot) falls back to `--use-gl=disabled` for every window. Fully Exit
  Chrome and reopen via `google-chrome-intel`. The PWA Exec must use that
  wrapper; `/opt/google/chrome/google-chrome` skips `chrome-flags.conf`.
  `renderD*` numbers flip across boots — never pin by minor number.
- **Globe pins fade by the planet's n·v, not the billboard's.** A
  camera-facing disc at 1.015 radii sticks out of the limb; `uFacing` is the
  surface normal dotted with the view, and a pin with n·v < 0.04 is hidden.
  Picking already used the same test. Do not drop it to draw the far side.
- **Point sizes need the projection-correct scale.** `uSize` in
  `shardfall.vert` is a *world radius*, turned into pixels by
  `(height * 0.5) / tan(fov/2)` the way the starfield does it. Hardcoding a
  constant there gives heads two pixels wide at Cosmere scale, which is how
  the shards came out invisible the first time.
- **A patched `LineMaterial` needs its own `customProgramCacheKey`.** Orbits
  and routes both inject shader code via `onBeforeCompile`. Without a
  distinct cache key a patched and an unpatched material hash to the same
  program and whichever compiles first wins for both — including for lines
  that were never meant to be patched at all.
- **One id, one entry, across every kind.** `loreById` returns the first kind
  that claims an id, so a second claimant is written, indexed, searchable and
  unopenable. `audit:data` fails on it. When two things genuinely need the
  same name, suffix the second the way the files already do: `-perp` for a
  perpendicularity, `-cog` for a Cognitive twin, `-mark` for a city-plate
  mark. A mark that names a place with its own globe pin carries `entry`.
- **The plate pipeline has two conversions that look like bugs and are not.**
  `planetBake.ts` builds uniforms with `new THREE.Color(hex)
  .convertSRGBToLinear()`, and the constructor *already* converts — so every
  recipe colour is linearised twice. The albedo target is sRGB, so Three
  encodes on write. Both bakers do both; `planetMap.ts` says so at the top.
  Change either and `test:cartography` will tell you.
- **Do not put a large seed inside `sin()` or `fract()` in a shader.** `uSeed`
  runs to about sixteen hundred and 32-bit `sin()` of that is a number the
  driver may guess at: the same gas giant banded differently on different
  hardware and differently again on the CPU. Reduce into one turn first.
- **Roshar's coastline comes off the published plate**, not from `shape`
  blobs — `cartography/coastlines.ts`, regenerated by `npm run trace:coast`.
  It is a 512×256 one-bit land mask and nothing else of Stewart's artwork; see
  the note in `DESIGN.md` before widening that. The nine text rectangles in
  the tracer paint out lettering that sits on open water and will need
  revisiting only if the plate file changes, which it will not.
- **`audit:ui` finds controls by identity, not by index.** Clicking anything
  re-renders its panel and restoring the scene rebuilds it, and some rebuilds
  change how many controls are visible — the Journal's "Show everything" is
  disabled until a book is picked. Indexing by position meant clicking one
  button and printing another's name, for three sessions. Restore has to
  put `view` / `panel` / `realm` back to what the scene asked for, not just
  re-run `setup`, or a Lore click turns every later sky scene into a web
  sweep.

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
  Negating z mirrors every pin. **Character motes use it too** (2026-09-14):
  people stand on the surface at `radius * 1.015` riding `bodySpin()`, not on
  a halo around the world. Where a person's See-also names a place on the
  world they are on, that place's real UV is used; otherwise a stable hash of
  their id scatters them, which means "on this world" and is *not* a claim
  about where on it. `CharacterEra` has no location field — do not invent one.
- **A mote must never outgrow its world.** Mote size is a constant *screen*
  size (`d * 0.030`) capped at 0.62 world units, and Roshar's radius is 1.32:
  uncapped against the body, one person was half the size of the planet. The
  size is now also capped at `body.radius * 0.048`.
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
   `scadrial_full.png` 640×997. Other worlds sit on our procedural atlas.
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
Settings. WASD/QE never open panels. Default playhead is Stormlight (year 0). Pre-Shattering is still on the chips.
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
    plates. Lore and data untouched. 56/56, perf flat. Pushed and live.
24. **2026-09-13 encyclopedia** (`e120ebb`). People 90 → ~424, places 124 →
    ~301, glossary 123 → ~323, orders ~66. Codex answers aliases and
    questions. Overlay cards gained bio / See-also / Coppermind links (no
    portraits). Battle Sim still out. Graphics left alone. Pushed and live.
    Interaction suite 56/56.
