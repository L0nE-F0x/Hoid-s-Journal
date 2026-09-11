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
  { name: 'panel · journal', setup: (s) => s.set('panel', 'spoilers') },
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
  await page.evaluate(() => {
    window.__ceph.ui.enter();
    window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' });
  });
  await sleep(2200);
}

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
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1512, height: 900 });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await boot(page, URL);

    for (const scene of SCENES) {
      if (!(await alive(page))) await boot(page, URL);
      await page.evaluate(() => {
        const s = window.__ceph.store;
        s.set('panel', 'none');
        s.set('view', 'sky');
        s.set('realm', 'physical');
        s.set('selected', null);
      });
      await sleep(400);
      await page.evaluate(`(${scene.setup.toString()})(window.__ceph.store)`);
      await sleep(1400);

      const labels = await page.evaluate(() => {
        const out = [];
        for (const b of document.querySelectorAll('#ui-root button')) {
          const r = b.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          if (getComputedStyle(b).visibility === 'hidden') continue;
          const text = (b.textContent || '').trim().slice(0, 40);
          out.push({ text, title: b.title || '', cls: b.className });
        }
        return out;
      });

      for (let i = 0; i < labels.length; i++) {
        if (!(await alive(page))) await boot(page, URL);
        const before = await page.evaluate(() => ({
          state: JSON.stringify(window.__ceph.store.state),
          dom: document.getElementById('ui-root').innerHTML.length,
        }));
        const clicked = await page.evaluate((idx) => {
          const vis = [...document.querySelectorAll('#ui-root button')].filter((b) => {
            const r = b.getBoundingClientRect();
            return r.width >= 2 && r.height >= 2 && getComputedStyle(b).visibility !== 'hidden';
          });
          const b = vis[idx];
          if (!b) return false;
          b.click();
          return true;
        }, i);
        if (!clicked) continue;
        await sleep(200);

        // A control that takes the whole app with it is the loudest kind of
        // broken, and the sweep used to die on it instead of naming it.
        if (!(await alive(page))) {
          fatal.push(`${scene.name.padEnd(16)} ${(labels[i].text || '(icon)').padEnd(26)} ${labels[i].cls.slice(0, 46)}`);
          await boot(page, URL);
          await page.evaluate(`(${scene.setup.toString()})(window.__ceph.store)`);
          await sleep(900);
          continue;
        }

        const after = await page.evaluate(() => ({
          state: JSON.stringify(window.__ceph.store.state),
          dom: document.getElementById('ui-root').innerHTML.length,
        }));
        if (before.state === after.state && before.dom === after.dom) {
          dead.push(`${scene.name.padEnd(16)} ${(labels[i].text || '(icon)').padEnd(26)} ${labels[i].cls.slice(0, 46)}`);
        }
        // Put the scene back the way the sweep found it.
        await page.evaluate(`(${scene.setup.toString()})(window.__ceph.store)`);
        await sleep(140);
      }
    }
  } finally {
    await browser.close();
  }

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
