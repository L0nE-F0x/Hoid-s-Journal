/**
 * End-to-end interaction test.
 *
 *   npm run dev            # in one shell
 *   npm run test:interaction
 *
 * Drives real mouse and keyboard input through Chrome rather than poking the
 * store, because the interesting failures live between the two: picking a
 * planet that is a pixel wide, the camera framing into the rectangle the
 * panels leave, a pin on the map turning the globe to the place it names.
 * Exits non-zero on the first failure.
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1]]);
    return acc;
  }, []),
);
const URL = args.url ?? 'http://127.0.0.1:5174/';
const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wait for the damped camera to stop moving, rather than sleeping blindly.
 *
 * A pose that has not changed is only evidence of stillness if a frame has
 * actually run between the two samples. Without the frame counter this returns
 * during a long first frame — a shader compile, say — and every check after it
 * reads the state the app was in before the thing it is testing happened.
 */
async function settle(page, timeout = 12000) {
  const started = Date.now();
  let previous = null;
  let frames = -1;
  while (Date.now() - started < timeout) {
    const now = await page.evaluate(() => {
      const r = window.__ceph.app.rig;
      return {
        pose: [r.distance, ...r.target.toArray(), ...r.camera.position.toArray()]
          .map((n) => Math.round(n * 10) / 10).join(','),
        frame: window.__ceph.app.frameCount,
      };
    });
    if (now.pose === previous && now.frame > frames + 1) return true;
    previous = now.pose;
    frames = now.frame;
    await sleep(220);
  }
  return false;
}

const state = (page) => page.evaluate(() => ({ ...window.__ceph.store.state }));

/** Screen position of a world-space point the app can hand us. */
async function screenOf(page, expr) {
  return page.evaluate((code) => {
    const a = window.__ceph.app;
    // eslint-disable-next-line no-new-func
    const p = new Function('a', `return ${code}`)(a);
    if (!p) return null;
    const v = p.clone().project(a.camera);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
  }, expr);
}

/** Middle of the rectangle the panels leave the camera. */
async function freeCentre(page) {
  return page.evaluate(() => {
    const i = window.__ceph.store.state.insets;
    return {
      x: (i.left + (window.innerWidth - i.right)) / 2,
      y: (i.top + (window.innerHeight - i.bottom)) / 2,
    };
  });
}

async function clickLabel(page, re) {
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const b = [...document.querySelectorAll('button')].find((el) => {
      if (!rx.test(el.textContent ?? '')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });
    if (!b) return false;
    b.click();
    return true;
  }, re);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox', '--headless=new', '--enable-gpu', '--use-gl=angle',
      '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage', '--window-size=1512,900',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1512, height: 900, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
    check('boots', true);

    // Title → play, and skip the opening flight.
    check('title: enter', await clickLabel(page, 'enter the cosmere'));
    await page.evaluate(() => window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' }));
    await settle(page);
    let s = await state(page);
    check('title: shell is play', s.shell === 'play', s.shell);
    check('cinematic ends at Cosmere', s.scale === 'cosmere', s.scale);
    check('directory lists systems at Cosmere',
      await page.evaluate(() => !!document.querySelector('.ceph-directory.is-on')));

    // Hover is a tooltip. It must not open the info card or shove the sky.
    {
      const hoverAt = await screenOf(page, "a.orrery.systemPosition('taldainian')");
      if (hoverAt) await page.mouse.move(hoverAt.x, hoverAt.y);
      await sleep(280);
      s = await state(page);
      check('hover does not select', !s.selected, String(s.selected));
      check('hover does not claim a right inset', s.insets.right === 0, JSON.stringify(s.insets));
      await page.mouse.move(8, 8);
    }

    check('Help opens', await clickLabel(page, '^help$'));
    await sleep(200);
    check('Help is a panel', (await state(page)).panel === 'help', (await state(page)).panel);
    await page.keyboard.press('Escape');
    await sleep(150);
    check('Realms opens a picker', await clickLabel(page, '^realms$'));
    await sleep(200);
    check('Realms is a panel', (await state(page)).panel === 'realms', (await state(page)).panel);
    await page.keyboard.press('Escape');
    await sleep(150);
    check('Lore Web opens', await clickLabel(page, '^lore$'));
    await sleep(400);
    check('view is the Lore Web', (await state(page)).view === 'web', (await state(page)).view);
    const webBtn = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((el) => /^lore$/i.test(el.textContent ?? ''));
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    if (webBtn) await page.mouse.click(webBtn.x, webBtn.y);
    await sleep(200);
    check('Web still clicks over the graph', (await state(page)).view === 'sky', (await state(page)).view);
    await clickLabel(page, '^lore$');
    await sleep(200);
    await page.keyboard.press('Escape');
    await sleep(200);
    check('Esc leaves the Lore Web', (await state(page)).view === 'sky', (await state(page)).view);

    // Cosmere → system, by clicking the star itself.
    let at = await screenOf(page, "a.orrery.systemPosition('rosharan')");
    await page.mouse.click(at.x, at.y);
    await settle(page);
    s = await state(page);
    check('click a system dives to it', s.scale === 'system' && s.focusedSystem === 'rosharan',
      `${s.scale}/${s.focusedSystem}`);

    // System → globe, by clicking a planet that is a few pixels wide.
    at = await screenOf(page, "a.orrery.bodyPosition('roshar')");
    await page.mouse.click(at.x, at.y);
    await settle(page);
    s = await state(page);
    check('click a planet dives to its globe', s.scale === 'globe' && s.focusedBody === 'roshar',
      `${s.scale}/${s.focusedBody}`);

    // Framed in what the panels leave, not in the middle of the canvas.
    let centre = await freeCentre(page);
    at = await screenOf(page, "a.orrery.bodyPosition('roshar')");
    let off = Math.hypot(at.x - centre.x, at.y - centre.y);
    check('globe is framed in the free rectangle', off < 24, `${Math.round(off)}px off`);

    // Atlas pin → the globe turns to face it.
    const pin = await page.evaluate(() => {
      const c = document.querySelector('.ceph-atlas-canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      // Urithiru on Isaac Stewart's Roshar plate (3096×1800).
      return { x: r.left + r.width * 0.466, y: r.top + r.height * 0.638 };
    });
    check('atlas is open on a globe', !!pin);
    if (pin) {
      await page.mouse.click(pin.x, pin.y);
      await settle(page);
      s = await state(page);
      check('atlas pin selects its place', s.focusedLocation === 'urithiru' && s.scale === 'surface',
        `${s.scale}/${s.focusedLocation}`);
      centre = await freeCentre(page);
      at = await screenOf(page, "a.pins.markerPosition('urithiru')");
      off = at ? Math.hypot(at.x - centre.x, at.y - centre.y) : 999;
      check('the place it names faces the camera', off < 60, `${Math.round(off)}px off`);
      await page.mouse.click(pin.x, pin.y);
      await settle(page);
      s = await state(page);
      check('a second click opens the city plate', s.scale === 'city' && s.focusedLocation === 'urithiru',
        `${s.scale}/${s.focusedLocation}`);
      const plateTitle = await page.evaluate(() => document.querySelector('.ceph-atlas-title')?.textContent);
      check('city plate is titled for the place', plateTitle === 'Urithiru', String(plateTitle));
      const chip = await page.evaluate(() => {
        const b = [...document.querySelectorAll('.ceph-atlas-chip')]
          .find((n) => /gemstone|breakaway|oathgate/i.test(n.textContent || ''));
        if (!b) return false;
        b.click();
        return true;
      });
      await sleep(250);
      s = await state(page);
      check('a landmark on the plate selects', chip && s.selected && s.selected.startsWith('urithiru-'),
        s.selected);
      await page.keyboard.press('Escape');
      await settle(page);
      s = await state(page);
      check('Esc pops city → surface', s.scale === 'surface' && s.focusedLocation === 'urithiru',
        `${s.scale}/${s.focusedLocation}`);
    }

    // Esc walks back out, one scale at a time.
    const walk = [];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape');
      await settle(page);
      walk.push((await state(page)).scale);
    }
    check('Esc walks surface → globe → system → Cosmere',
      walk.join(',') === 'globe,system,cosmere', walk.join(','));

    // Realms.
    await page.keyboard.press('c');
    await sleep(700);
    s = await state(page);
    check('C enters the Cognitive Realm', s.realm === 'cognitive', s.realm);
    const silver = await page.evaluate(() => {
      const p = window.__ceph.app.presence.hubPosition('silverlight');
      return p ? p.length() > 1 : false;
    });
    check('Silverlight stands in Shadesmar', silver);
    await page.keyboard.press('v');
    await settle(page);
    s = await state(page);
    const spiritual = await page.evaluate(() => window.__ceph.app.spiritual.group.visible);
    check('V enters the Spiritual Realm', s.realm === 'spiritual' && spiritual, s.realm);
    await page.keyboard.press('v');
    await settle(page);
    check('V leaves it again', (await state(page)).realm === 'physical');

    // Every quality band must still reach the canvas. Disabling the last
    // pass once left the composer drawing into a buffer nobody read, which
    // looks exactly like a working app with the Cosmere missing.
    for (const band of ['low', 'medium', 'high', 'auto']) {
      const out = await page.evaluate((q) => {
        window.__ceph.store.set('visual', { ...window.__ceph.store.state.visual, quality: q });
        const passes = window.__ceph.app.post.composer.passes;
        const onScreen = passes.filter((p) => p.enabled && p.renderToScreen);
        return { n: onScreen.length, last: passes[passes.length - 1].enabled };
      }, band);
      check(`quality ${band} still reaches the canvas`, out.n === 1, `${out.n} passes render to screen`);
    }
    await page.evaluate(() => {
      window.__ceph.store.set('visual', { ...window.__ceph.store.state.visual, quality: 'auto' });
    });

    // Reading companion gates the sky.
    await page.evaluate(() => window.__ceph.store.set('panel', 'journal'));
    await sleep(400);
    const books = await page.evaluate(() => [...document.querySelectorAll('.ceph-book-title')].map((n) => n.textContent));
    check('Journal lists individual books', books.includes('The Way of Kings') && books.includes('The Alloy of Law') && books.includes('The Hope of Elantris'), String(books.length));
    const synced = await page.evaluate(() => {
      const sel = document.querySelector('.ceph-modal-card select');
      if (!sel) return null;
      sel.value = 'stormlight:twok';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
    await sleep(400);
    s = await state(page);
    check('reading companion syncs publication-safe',
      !!synced && s.readProgress.mistborn2 === -1 && s.readProgress.elantris >= 0,
      JSON.stringify({ mb2: s.readProgress.mistborn2, el: s.readProgress.elantris }));
    const restored = await page.evaluate(() => {
      const sel = document.querySelector('.ceph-modal-card select');
      if (!sel) return false;
      sel.value = '';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
    await sleep(400);
    s = await state(page);
    check('clearing the companion restores fully read',
      restored && s.readingNow === null && s.readProgress.mistborn2 >= 0,
      JSON.stringify({ now: s.readingNow, mb2: s.readProgress.mistborn2 }));
    await page.evaluate(() => window.__ceph.store.set('panel', 'none'));

    // Look chips must light when clicked — they used to patch state and stay dim.
    check('Settings opens', await clickLabel(page, '^settings$'));
    await sleep(200);
    const orbits = await page.evaluate(() => {
      const b = [...document.querySelectorAll('.ceph-chip')].find((el) => el.textContent === 'Orbits');
      if (!b) return null;
      const before = b.classList.contains('is-on');
      b.click();
      return { before, after: b.classList.contains('is-on') };
    });
    check('Settings toggle lights its chip', !!orbits && orbits.before !== orbits.after,
      JSON.stringify(orbits));
    if (orbits && orbits.before !== orbits.after) {
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('.ceph-chip')].find((el) => el.textContent === 'Orbits');
        b?.click();
      });
    }
    await page.keyboard.press('Escape');
    await sleep(150);

    const kept = await page.evaluate(() => {
      window.__ceph.store.set('panel', 'journal');
      window.__ceph.store.set('panel', 'nope');
      return window.__ceph.store.state.panel;
    });
    check('unknown panel ids are ignored', kept === 'journal', kept);
    await page.evaluate(() => window.__ceph.store.set('panel', 'none'));

    await page.evaluate(() => window.__ceph.store.set('realm', 'spiritual'));
    await sleep(250);
    const dirTab = await page.evaluate(() => {
      const b = [...document.querySelectorAll('.ceph-dir-tabs button')]
        .find((el) => el.textContent === 'Worlds');
      if (!b) return null;
      b.click();
      return document.querySelector('.ceph-directory .ceph-atlas-title')?.textContent ?? null;
    });
    check('Spiritual directory can leave the Shards tab', dirTab === 'Worlds', String(dirTab));
    const dawn = await page.evaluate(() => {
      const tab = [...document.querySelectorAll('.ceph-dir-tabs button')]
        .find((el) => el.textContent === 'Dawnshards');
      tab?.click();
      const row = document.querySelector('.ceph-dir-row');
      row?.click();
      const s = window.__ceph.store.state;
      return { realm: s.realm, selected: s.selected };
    });
    check('Dawnshards fly to the Spiritual Realm',
      dawn.realm === 'spiritual' && !!dawn.selected, JSON.stringify(dawn));
    await page.evaluate(() => {
      window.__ceph.store.set('selected', null);
      window.__ceph.store.set('realm', 'physical');
    });

    const term = await page.evaluate(() => {
      window.__ceph.store.set('panel', 'codex');
      return true;
    });
    await sleep(200);
    const termHit = await page.evaluate(() => {
      const input = document.querySelector('.ceph-modal-card input');
      if (!(input instanceof HTMLInputElement)) return null;
      input.value = 'investiture';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const row = [...document.querySelectorAll('.ceph-card')]
        .find((el) => /investiture/i.test(el.textContent || ''));
      row?.click();
      return {
        panel: window.__ceph.store.state.panel,
        selected: window.__ceph.store.state.selected,
        title: document.querySelector('.ceph-panel-drawer h2')?.textContent ?? null,
      };
    });
    check('a glossary hit opens a card',
      !!term && termHit?.selected === 'investiture' && termHit.title === 'Investiture',
      JSON.stringify(termHit));
    await page.evaluate(() => {
      window.__ceph.store.set('selected', null);
      window.__ceph.store.set('panel', 'none');
    });

    // A phone still leaves the world a band to live in.
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.evaluate(() => window.__ceph.store.set('cameraCue', { kind: 'focus', id: 'roshar', scale: 'globe' }));
    await settle(page);
    const band = await page.evaluate(() => {
      const i = window.__ceph.store.state.insets;
      return (window.innerHeight - i.top - i.bottom) / window.innerHeight;
    });
    check('phone leaves a viewing band', band > 0.25, `${Math.round(band * 100)}% of height`);
    const tools = await page.evaluate(() => {
      const el = document.querySelector('.ceph-tools');
      if (!(el instanceof HTMLElement)) return null;
      const style = getComputedStyle(el);
      return {
        overflow: style.overflowX,
        pointer: style.pointerEvents,
        scrollable: el.scrollWidth > el.clientWidth + 2,
      };
    });
    check('phone tool strip can scroll',
      !!tools && tools.overflow === 'auto' && tools.pointer !== 'none',
      JSON.stringify(tools));

    check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  } finally {
    await browser.close();
  }
}

await run();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
