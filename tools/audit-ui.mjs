/**
 * Clicks every visible control in every panel and reports the ones that do
 * nothing.
 *
 *   npm run dev            # in one shell
 *   npm run audit:ui
 *
 * "Nothing" means: no change to the store, no change to the DOM, and no new
 * console error. That is not proof a control is broken — a toggle clicked
 * twice lands back where it started — but it is where to look first.
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');
const URL = process.argv[2] ?? 'http://127.0.0.1:5174/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A crawl can keep finding new controls; this is the stop. */
const MAX_CLICKS_PER_SCENE = 70;

/** Panels to open before sweeping, so their controls are in the DOM. */
const SCENES = [
  { name: 'sky · cosmere', setup: () => {} },
  { name: 'sky · globe', setup: (s) => s.set('cameraCue', { kind: 'focus', id: 'roshar', scale: 'globe' }) },
  { name: 'sky · surface', setup: (s) => s.set('cameraCue', { kind: 'focus', id: 'urithiru', scale: 'surface' }) },
  { name: 'sky · city', setup: (s) => s.set('cameraCue', { kind: 'focus', id: 'urithiru', scale: 'city' }) },
  { name: 'cognitive', setup: (s) => s.set('realm', 'cognitive') },
  { name: 'spiritual', setup: (s) => s.set('realm', 'spiritual') },
  { name: 'lore web', setup: (s) => s.set('view', 'web') },
  { name: 'panel · codex', setup: (s) => s.set('panel', 'codex') },
  { name: 'panel · arcanum', setup: (s) => s.set('panel', 'arcanum') },
  { name: 'panel · journal', setup: (s) => s.set('panel', 'journal') },
  { name: 'panel · realms', setup: (s) => s.set('panel', 'realms') },
  { name: 'panel · look', setup: (s) => s.set('panel', 'settings') },
  { name: 'panel · help', setup: (s) => s.set('panel', 'help') },
];

/** True when the page still has the app on it. */
async function alive(page) {
  try {
    return await page.evaluate(() => typeof window.__ceph !== 'undefined');
  } catch {
    return false;
  }
}

async function boot(page, URL) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
  // playIntro is queued on the next frame after __ceph exists. Skipping
  // before that frame is a no-op, and the flight then hushes the HUD so
  // globe/city/spiritual scenes look like three controls and a clean sweep.
  await page.evaluate(() => window.__ceph.ui.enter());
  await page.waitForFunction(
    () => window.__ceph.store.state.cinematic === true,
    { timeout: 8000, polling: 50 },
  ).catch(() => {});
  await page.evaluate(() => window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' }));
  await page.waitForFunction(
    () => window.__ceph.store.state.cinematic === false && window.__ceph.store.state.shell === 'play',
    { timeout: 8000 },
  );
  await sleep(400);
}

/**
 * Put the page back in the scene the sweep named, including the fields
 * `setup` does not mention. Without that, clicking Lore leaves `view=web`
 * and every later click is a legend chip reported under "sky · city".
 *
 * Panel scenes keep their panel (so Arcanum can grow a table); the Lore
 * Web scene keeps the graph. Everything else is closed.
 */
async function restoreScene(page, scene) {
  await page.evaluate((name) => {
    const s = window.__ceph.store;
    if (s.state.shell !== 'play') window.__ceph.ui.enter();
    s.set('selected', null);
    if (name !== 'lore web') s.set('view', 'sky');
    if (!name.startsWith('panel ·')) s.set('panel', 'none');
    if (name !== 'cognitive' && name !== 'spiritual') s.set('realm', 'physical');
  }, scene.name);
  await page.evaluate(`(${scene.setup.toString()})(window.__ceph.store)`);
}

/** Browser-side: walk visible play-shell buttons, skip title plate and Reload. */
const findTarget = (seen) => {
  const stable = (cls) => cls.split(/\s+/).filter((c) => c && !c.startsWith('is-')).sort().join(' ');
  const skip = (b) => {
    if (b.disabled) return true;
    if (b.closest('.ceph-title') || b.closest('.ceph-fault')) return true;
    const r = b.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return true;
    const cs = getComputedStyle(b);
    return cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none';
  };
  const done = new Set(seen);
  for (const b of document.querySelectorAll('#ui-root button')) {
    if (skip(b)) continue;
    const text = (b.textContent || '').trim().slice(0, 40);
    const key = `${text}|${stable(b.className)}`;
    if (done.has(key)) continue;
    return { key, text, cls: b.className, title: b.title || '' };
  }
  return null;
};
const clickTarget = (key) => {
  const stable = (cls) => cls.split(/\s+/).filter((c) => c && !c.startsWith('is-')).sort().join(' ');
  const skip = (b) => {
    if (b.disabled) return true;
    if (b.closest('.ceph-title') || b.closest('.ceph-fault')) return true;
    const r = b.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return true;
    const cs = getComputedStyle(b);
    return cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none';
  };
  for (const b of document.querySelectorAll('#ui-root button')) {
    if (skip(b)) continue;
    const text = (b.textContent || '').trim().slice(0, 40);
    if (`${text}|${stable(b.className)}` === key) { b.click(); return; }
  }
};

async function run() {
  const browser = await puppeteer.launch({
    executablePath, headless: true,
    args: ['--no-sandbox', '--headless=new', '--enable-gpu', '--use-gl=angle',
      '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage', '--window-size=1512,900'],
  });
  const dead = [];
  const fatal = [];
  const errors = [];
  const swept = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1512, height: 900 });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await boot(page, URL);

    for (const scene of SCENES) {
      if (!(await alive(page))) await boot(page, URL);
      await restoreScene(page, scene);
      // Scenes that fly the camera only finish opening their panels once the
      // flight settles. Too short a wait sweeps three controls and calls the
      // scene clean.
      await sleep(3200);
      if (/globe|surface|city/.test(scene.name)) {
        await page.waitForFunction(
          () => !!document.querySelector('.ceph-atlas.is-on'),
          { timeout: 8000 },
        ).catch(() => {});
      }

      /**
       * Crawl rather than iterate a list.
       *
       * The sweep used to sample every visible control once, then click them
       * by index. Clicking anything re-renders its panel, and restoring the
       * scene afterwards does not restore *everything* — open the Arcanum,
       * click a magic, and the table underneath is a different magic's rows
       * with different buttons on them. So by the third click the list was
       * stale and `vis[idx]` was a different button than the one whose name
       * got printed. That is where three sessions of "Sixth of the Dusk does
       * nothing" came from.
       *
       * Now: look at what is actually on screen, pick something not yet
       * visited, click that, and look again. A control is identified by its
       * text and its classes with the `is-` state classes stripped, because
       * those flip the moment a thing is selected.
       */
      const visited = new Set();
      let swept_n = 0;
      for (let step = 0; step < MAX_CLICKS_PER_SCENE; step++) {
        if (!(await alive(page))) await boot(page, URL);
        const target = await page.evaluate(findTarget, [...visited]);
        if (!target) break;
        visited.add(target.key);
        swept_n++;

        const before = await page.evaluate(() => ({
          state: JSON.stringify(window.__ceph.store.state),
          dom: document.getElementById('ui-root').innerHTML.length,
        }));
        await page.evaluate(clickTarget, target.key);
        await sleep(190);

        // A control that takes the whole app with it is the loudest kind of
        // broken, and the sweep used to die on it instead of naming it.
        if (!(await alive(page))) {
          // A Vite HMR reload (or the fault banner's Reload) comes back.
          // Wait once before calling it a crash.
          await sleep(2000);
          if (await alive(page)) {
            await boot(page, URL);
            await restoreScene(page, scene);
            await sleep(900);
            continue;
          }
          fatal.push(`${scene.name.padEnd(16)} ${(target.text || '(icon)').padEnd(26)} ${target.cls.slice(0, 46)}`);
          await boot(page, URL);
          await restoreScene(page, scene);
          await sleep(900);
          continue;
        }

        const after = await page.evaluate(() => ({
          state: JSON.stringify(window.__ceph.store.state),
          dom: document.getElementById('ui-root').innerHTML.length,
        }));
        let moved = before.state !== after.state || before.dom !== after.dom;
        if (!moved) {
          // A camera cue is consumed by the renderer over a damped flight, so
          // give the slow ones a second look before calling them dead.
          await sleep(900);
          const late = await page.evaluate(() => ({
            state: JSON.stringify(window.__ceph.store.state),
            dom: document.getElementById('ui-root').innerHTML.length,
          }));
          moved = before.state !== late.state || before.dom !== late.dom;
        }
        if (!moved) {
          dead.push(`${scene.name.padEnd(16)} ${(target.text || '(icon)').padEnd(26)} ${target.cls.slice(0, 46)}`);
        }

        await restoreScene(page, scene);
        await sleep(160);
      }
      swept.push(`${scene.name.padEnd(16)} ${swept_n} control(s)`);
    }
  } finally {
    await browser.close();
  }

  console.log('\nswept:');
  for (const line of swept) console.log('  ' + line);
  if (fatal.length) {
    console.log(`\n${fatal.length} control(s) TOOK THE APP DOWN when clicked:\n`);
    for (const f of fatal) console.log('  ' + f);
  }
  console.log(`\n${dead.length} control(s) changed nothing when clicked:\n`);
  for (const d of dead) console.log('  ' + d);
  if (errors.length) {
    console.log(`\n${errors.length} console error(s):`);
    for (const e of [...new Set(errors)].slice(0, 10)) console.log('  ' + e.slice(0, 180));
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
