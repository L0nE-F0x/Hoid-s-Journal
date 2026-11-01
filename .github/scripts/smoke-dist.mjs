/**
 * The production build, served the way Netlify serves it.
 *
 *   npm run build
 *   node .github/scripts/smoke-dist.mjs            # [--port 4319]
 *   CEPH_SLOW_RENDERER=1 node .github/scripts/smoke-dist.mjs   # as on CI
 *
 * `npm run dev` never reads netlify.toml and never registers the service
 * worker, so everything this file checks passes every other test and fails
 * only on the live site: a Content-Security-Policy that blanks the canvas, a
 * manifest sent as octet-stream, a worker that caches a 404 as the shell or
 * reloads a reader out of the middle of a session.
 *
 * It serves dist/ with the [[headers]] rules from netlify.toml and Netlify's
 * 404.html fallback, boots the build in headless Chrome, runs every check and
 * exits non-zero if any failed. No network beyond 127.0.0.1.
 */
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const ROOT = new URL('../..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const argv = process.argv.slice(2);
const PORT = Number(argv[argv.indexOf('--port') + 1] || 4319) || 4319;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = process.env.CHROME_PATH || BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found (set CHROME_PATH)');
if (!existsSync(join(DIST, 'index.html'))) throw new Error('No dist/ — run `npm run build` first');

let failed = 0;
function check(name, ok, detail = '') {
  if (!ok) failed++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── netlify.toml ────────────────────────────────────────────────────────────

/** Only the subset of TOML this repo writes: `[[headers]]`, `for = "…"`,
 *  `[headers.values]` and one `Key = "value"` per line. Anything else inside
 *  a header block is an error rather than a silently missing header. */
function headerRules(toml) {
  const rules = [];
  let rule = null;
  let section = '';
  toml.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    if (line.startsWith('[')) {
      section = line;
      if (line === '[[headers]]') rules.push((rule = { for: '', values: {} }));
      else if (line !== '[headers.values]') rule = null;
      return;
    }
    if (!rule) return;
    const m = line.match(/^([A-Za-z0-9_-]+)\s*=\s*"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$/);
    if (!m) throw new Error(`netlify.toml:${i + 1}: cannot read header line: ${line}`);
    if (section === '[headers.values]') rule.values[m[1]] = m[2];
    else if (m[1] === 'for') rule.for = m[2];
  });
  return rules.map((r) => ({
    ...r,
    re: new RegExp(`^${r.for.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`),
  }));
}

const RULES = headerRules(readFileSync(join(ROOT, 'netlify.toml'), 'utf8'));
const overlaps = new Set();

function headersFor(path) {
  const out = {};
  const seen = new Map();
  for (const r of RULES) {
    if (!r.re.test(path)) continue;
    for (const [k, v] of Object.entries(r.values)) {
      const key = k.toLowerCase();
      // Two rules setting one header on one path is not an override on
      // Netlify; the values are combined. Never rely on it.
      if (seen.has(key)) overlaps.add(`${path}: ${k} from "${seen.get(key)}" and "${r.for}"`);
      seen.set(key, r.for);
      out[key] = v;
    }
  }
  return out;
}

// ── a static server that behaves like Netlify for this site ────────────────

const TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=UTF-8',
  // What Netlify sends for it unless a header rule says otherwise (measured
  // on the live site, 2026-11-02).
  '.webmanifest': 'application/octet-stream',
};

function resolve(pathname) {
  let p = decodeURIComponent(pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(DIST, p));
  if (file !== DIST && !file.startsWith(DIST + sep)) return null;
  if (existsSync(file) && statSync(file).isFile()) return file;
  if (existsSync(`${file}.html`)) return `${file}.html`;
  return null;
}

/** Bytes appended to sw.js, to stand in for a deploy that changes it. */
let swRevision = '';
const requests = [];

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, ORIGIN);
  requests.push(pathname);
  const file = resolve(pathname);
  const status = file ? 200 : 404;
  const served = file ?? join(DIST, '404.html');
  let body = readFileSync(served);
  if (pathname === '/sw.js') body = Buffer.concat([body, Buffer.from(swRevision)]);
  const headers = {
    'content-type': TYPES[extname(served).toLowerCase()] ?? 'application/octet-stream',
    'accept-ranges': 'bytes',
    ...headersFor(pathname),
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (status === 200 && range) {
    const start = Number(range[1] || 0);
    const end = Math.min(range[2] ? Number(range[2]) : body.length - 1, body.length - 1);
    res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${body.length}` });
    res.end(req.method === 'HEAD' ? undefined : body.subarray(start, end + 1));
    return;
  }
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
});

const listen = () => new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const unlisten = () => new Promise((r) => { server.close(r); server.closeAllConnections(); });

// ── checks ──────────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(ORIGIN + path);
  await res.arrayBuffer();
  return res;
}

async function headerChecks() {
  console.log('headers');
  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  const entry = /src="\.?\/?(assets\/[^"]+\.js)"/.exec(html)?.[1];
  check('index.html names its entry chunk', Boolean(entry), entry);

  const root = await get('/');
  const csp = root.headers.get('content-security-policy') ?? '';
  check('the shell carries a Content-Security-Policy', csp.includes("script-src 'self'"), csp.slice(0, 60));
  check('the shell is revalidated on every load', /max-age=0/.test(root.headers.get('cache-control') ?? ''), root.headers.get('cache-control'));
  check('nosniff', root.headers.get('x-content-type-options') === 'nosniff');
  check('Permissions-Policy names no retired feature', !/interest-cohort/.test(root.headers.get('permissions-policy') ?? ''), root.headers.get('permissions-policy'));

  if (entry) {
    const asset = await get(`/${entry}`);
    check('hashed assets are immutable', /immutable/.test(asset.headers.get('cache-control') ?? ''), asset.headers.get('cache-control'));
  }
  const sw = await get('/sw.js');
  check('sw.js is never cached', /max-age=0/.test(sw.headers.get('cache-control') ?? ''), sw.headers.get('cache-control'));

  const manifest = await fetch(`${ORIGIN}/manifest.webmanifest`);
  check('the manifest is sent as a manifest', manifest.headers.get('content-type')?.startsWith('application/manifest+json'), manifest.headers.get('content-type'));
  const m = await manifest.json();
  const icons = [...(m.icons ?? []), ...(m.shortcuts ?? []).flatMap((s) => s.icons ?? []), ...(m.screenshots ?? [])];
  const missing = icons.filter((i) => !resolve(new URL(i.src, `${ORIGIN}/`).pathname));
  check('every image the manifest names exists', missing.length === 0, missing.map((i) => i.src).join(', '));
  check('the manifest offers a maskable icon', (m.icons ?? []).some((i) => /maskable/.test(i.purpose ?? '')));

  const lost = await get('/no-such-page');
  check('a missing page is a 404', lost.status === 404, String(lost.status));
  for (const p of ['/', '/index.html', '/404.html', '/sw.js', '/manifest.webmanifest', '/og.jpg',
    '/assets/x.js', '/maps/x.jpg', '/audio/x.mp3']) headersFor(p);
  check('no header is set twice on one path', overlaps.size === 0, [...overlaps].join('; '));
}

async function browserChecks() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    // CEPH_SLOW_RENDERER=1 draws on SwiftShader, the way CI does.
    args: [
      '--no-sandbox', '--headless=new', '--use-gl=angle', '--enable-unsafe-swiftshader',
      ...(process.env.CEPH_SLOW_RENDERER
        ? ['--use-angle=swiftshader', '--disable-gpu']
        : ['--enable-gpu', '--use-angle=gl-egl', '--ignore-gpu-blocklist']),
      '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required',
      '--window-size=1280,800',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      // The 404 page is meant to be a 404; Chrome reports that as an error.
      if (m.type() === 'error' && !m.location()?.url?.endsWith('/no-such-page')) errors.push(m.text());
    });
    await page.evaluateOnNewDocument(() => {
      window.__violations = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        window.__violations.push(`${e.effectiveDirective} ${e.blockedURI || 'inline'}`);
      });
    });

    const BOOT = Number(process.env.SMOKE_BOOT_MS ?? 180000);
    const ready = () => page.waitForFunction(
      () => window.__ceph?.store?.state?.ready === true, { timeout: BOOT, polling: 250 });
    const violations = () => page.evaluate(() => window.__violations ?? []);

    console.log('first visit');
    await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });
    await ready();
    check('boots under the production headers', true);
    let v = await violations();
    check('no CSP violation while booting', v.length === 0, v.join('; '));

    const f0 = await page.evaluate(() => window.__ceph.app.frameCount);
    await sleep(1500);
    const f1 = await page.evaluate(() => window.__ceph.app.frameCount);
    check('the renderer keeps drawing', f1 > f0, `${f0} → ${f1}`);
    // Read the canvas inside a frame, after the app's own rAF has drawn it
    // and before the buffer is handed to the compositor and cleared.
    const sky = await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => {
      const c = document.createElement('canvas');
      c.width = 160; c.height = 100;
      const g = c.getContext('2d');
      g.drawImage(document.getElementById('stage'), 0, 0, 160, 100);
      const d = g.getImageData(0, 0, 160, 100).data;
      let sum = 0;
      let sq = 0;
      const n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
        sum += l;
        sq += l * l;
      }
      const mean = sum / n;
      done({ mean: Math.round(mean * 10) / 10, sd: Math.round(Math.sqrt(sq / n - mean * mean) * 10) / 10 });
    })));
    // A canvas a CSP or a lost context blanked is one flat colour.
    check('the canvas has a picture on it', sky.sd > 1.5, JSON.stringify(sky));

    await page.waitForFunction(() => navigator.serviceWorker?.ready.then(() => true), { timeout: 30000 });
    const entry = await page.evaluate(() => document.querySelector('script[type=module][src]')?.src);
    const precached = await page.waitForFunction(async (src) => Boolean(await caches.match(src)),
      { timeout: 30000, polling: 500 }, entry).then(() => true, () => false);
    check('the first visit leaves the build it ran in the cache', precached, entry);

    console.log('second visit, controlled');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ready();
    check('the worker controls the page', await page.evaluate(() => Boolean(navigator.serviceWorker.controller)));
    await page.evaluate(() => {
      // On SwiftShader a frame takes a second; let the flight take real steps.
      window.__ceph.app.maxDt = 0.5;
      window.__ceph.ui?.enter();
      window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' });
      window.__ceph.store.patchVisual({ music: true });
      window.__ceph.store.set('cameraCue', { kind: 'focus', id: 'roshar', scale: 'surface' });
    });
    const plate = await page.waitForFunction(
      () => performance.getEntriesByType('resource').some((e) => e.name.includes('/maps/roshar_full')),
      { timeout: BOOT, polling: 500 }).then(() => true, () => false);
    check('an atlas plate loads through the worker', plate);
    const music = await page.waitForFunction(
      () => performance.getEntriesByType('resource').some((e) => e.name.includes('/audio/')),
      { timeout: 20000, polling: 500 }).then(() => true, () => false);
    check('the soundtrack loads', music);
    await sleep(1500);
    v = await violations();
    check('no CSP violation in play (plates, audio, panels)', v.length === 0, v.join('; '));
    check('no console or page errors in play', errors.length === 0, errors.slice(0, 4).join(' | '));
    errors.length = 0;

    console.log('update flow');
    // A new worker mid-session must not reload the reader out of what they
    // are doing. Stand in for a deploy by changing the worker's bytes.
    await page.evaluate(() => {
      window.__stay = true;
      window.__claims = 0;
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.__claims++; });
    });
    swRevision = '\n// smoke: deploy 2\n';
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    const claimed = await page.waitForFunction(() => window.__claims > 0, { timeout: 30000, polling: 250 })
      .then(() => true, () => false);
    await sleep(2000);
    const after = await page.evaluate(() => ({ stay: window.__stay === true, shell: window.__ceph?.store.state.shell }));
    check('a new worker takes the open tab', claimed);
    check('…and does not reload a reader in play', claimed && after.stay && after.shell === 'play', JSON.stringify(after));

    // On the title nothing is lost, so the tab takes the new shell — once.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ready();
    await page.evaluate(() => { window.__stay = true; });
    swRevision = '\n// smoke: deploy 3\n';
    const reloaded = page.waitForNavigation({ timeout: 30000 }).then(() => true, () => false);
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    check('a new worker reloads a tab still on the title', await reloaded);
    await ready();
    await page.evaluate(() => {
      window.__stay = true;
      window.__claims = 0;
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.__claims++; });
    });
    swRevision = '\n// smoke: deploy 4\n';
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    await page.waitForFunction(() => window.__claims > 0, { timeout: 30000, polling: 250 }).catch(() => {});
    await sleep(2000);
    check('…but never twice in a row', await page.evaluate(() => window.__stay === true).catch(() => false));

    check('no console or page errors across the updates', errors.length === 0, errors.slice(0, 4).join(' | '));
    errors.length = 0;

    console.log('404 and the shell');
    const res = await page.goto(`${ORIGIN}/no-such-page`, { waitUntil: 'load' });
    check('a mistyped path shows the 404 page', res?.status() === 404 && /Not in the journal/.test(await page.title()),
      `${res?.status()} "${await page.title()}"`);
    const shell = await page.evaluate(async () => (await (await caches.match('/index.html'))?.text()) ?? '');
    check('…and does not replace the cached shell', shell.includes('id="stage"'));
    v = await violations();
    check('the 404 page breaks no CSP rule', v.length === 0, v.join('; '));

    check('no console or page errors on the 404 page', errors.length === 0, errors.slice(0, 4).join(' | '));

    console.log('offline');
    await unlisten();
    await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    const offline = await ready().then(() => true, () => false);
    check('the journal opens with the server gone', offline);
  } finally {
    await browser.close();
  }
}

await listen();
try {
  await headerChecks();
  await browserChecks();
} finally {
  if (server.listening) await unlisten();
}
console.log(failed ? `\n${failed} check(s) failed` : '\nproduction build ok');
process.exit(failed ? 1 : 0);
