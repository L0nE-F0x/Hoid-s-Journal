/**
 * FPS bench at a few scales. Needs `npm run dev`.
 *
 *   npm run bench
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const URL = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://127.0.0.1:5174/';
const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sample(page, ms = 1800) {
  await sleep(400);
  const a = await page.evaluate(() => window.__ceph.store.state.stats.fps);
  await sleep(ms);
  const b = await page.evaluate(() => window.__ceph.store.state.stats.fps);
  return Math.round((a + b) / 2);
}

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
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
  await page.evaluate(() => {
    window.__ceph.ui?.enter();
    window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' });
  });
  await sleep(800);

  const rows = [];
  const run = async (name, fn) => {
    await page.evaluate(fn);
    await sleep(600);
    const fps = await sample(page);
    const info = await page.evaluate(() => {
      const s = window.__ceph.store.state;
      return { scale: s.scale, realm: s.realm, fps: Math.round(s.stats.fps) };
    });
    rows.push({ name, fps, ...info });
    console.log(`${String(fps).padStart(3)} fps  ${name}  (${info.realm}/${info.scale})`);
  };

  await run('Cosmere', () => window.__ceph.store.set('cameraCue', { kind: 'frame' }));
  await run('Rosharan system', () => window.__ceph.store.set('cameraCue', { kind: 'focus', id: 'rosharan', scale: 'system' }));
  await run('Roshar globe', () => window.__ceph.store.set('cameraCue', { kind: 'focus', id: 'roshar', scale: 'globe' }));
  await run('Urithiru city', () => window.__ceph.store.set('cameraCue', { kind: 'focus', id: 'urithiru', scale: 'city' }));
  await run('Shadesmar globe', () => window.__ceph.store.set('realm', 'cognitive'));
  await run('Shadesmar Cosmere', () => {
    window.__ceph.store.set('cameraCue', { kind: 'frame' });
    window.__ceph.store.set('realm', 'cognitive');
  });
  await run('Spiritual', () => window.__ceph.store.set('realm', 'spiritual'));

  const min = Math.min(...rows.map((r) => r.fps));
  console.log(`\nmin ${min} fps across ${rows.length} views`);
  process.exit(min < 20 ? 1 : 0);
} finally {
  await browser.close();
}
