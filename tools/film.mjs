/**
 * Frame-exact recorder for trailers and promo stills.
 *
 *   node tools/film.mjs --script tools/trailer.mjs --out ~/Videos/hoids-journal
 *   node tools/film.mjs --script tools/trailer.mjs --out /tmp/t --only lumar,miral
 *   node tools/film.mjs --script tools/trailer.mjs --out /tmp/t --stills --width 2560 --height 1440
 *
 * Assumes `npm run dev` is already up. Same Chrome and GPU flags as
 * `screenshot.mjs`.
 *
 * Why not just record the screen: headless Chrome on this machine draws the
 * sky at 20 to 40 fps, so a real-time capture stutters and every damped
 * flight lands at a different moment on each take. Instead the page gets a
 * virtual clock before any of its own code runs: `performance.now`,
 * `Date.now`, `requestAnimationFrame` and timers all answer to it, and CSS
 * animations are paused and advanced by hand. The recorder steps it exactly
 * 1/fps, lets the app draw one frame, screenshots it and pipes the JPEG to
 * ffmpeg. However long a frame really takes, it is 16.7 ms in the film.
 *
 * Until `__film.start()` the clock passes real time through, so boot (which
 * awaits real timers and shader compiles) is untouched.
 *
 * A script module default-exports `{ shots, boot? }`. Each shot:
 *   name      file stem, and what --only matches
 *   setup     function run in the page before the shot (serialised; no closures)
 *   args      arguments for setup
 *   preroll   seconds simulated off camera after setup (default 0)
 *   until     page function; preroll keeps going past its length until true
 *   after     seconds more once until() holds, for a spin to reach speed
 *   duration  seconds captured (ignored for stills)
 *   frame     page function (t, duration) run every captured frame
 *   cards     [{ html, cls, from, to, fade, fadeIn, fadeOut, rise }] text
 *             over the picture; a 0 fade holds it across a cut
 *   still     true: one PNG after preroll instead of a clip
 *   dip       [inSeconds, outSeconds] fade from/to black at the ends
 */
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1] ?? true]);
    return acc;
  }, []),
);

if (typeof args.script !== 'string') throw new Error('--script <module> is required');
const OUT = resolve(typeof args.out === 'string' ? args.out : 'film');
const URL = args.url ?? 'http://127.0.0.1:5174/';
const WIDTH = Number(args.width ?? 1920);
const HEIGHT = Number(args.height ?? 1080);
const FPS = Number(args.fps ?? 60);
const CRF = Number(args.crf ?? 12);
const ONLY = typeof args.only === 'string' ? new Set(args.only.split(',')) : null;
const STILLS = Boolean(args.stills);
mkdirSync(OUT, { recursive: true });

const { default: script } = await import(pathToFileURL(resolve(args.script)).href);

const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = process.env.CHROME_PATH || BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

/** Runs before the app's first line. Everything time-shaped answers to `now`. */
function installClock() {
  const P = performance;
  const realNow = P.now.bind(P);
  const realDate = Date.now;
  const realRAF = window.requestAnimationFrame.bind(window);
  const realCAF = window.cancelAnimationFrame.bind(window);
  const realST = window.setTimeout.bind(window);
  const realCT = window.clearTimeout.bind(window);
  const realSI = window.setInterval.bind(window);
  const realCI = window.clearInterval.bind(window);

  let manual = false;
  let now = 0;
  let epoch = 0;
  let nextId = 1e9;
  const rafs = new Map();
  const timers = new Map();
  const held = new Set();

  P.now = () => (manual ? now : realNow());
  Date.now = () => (manual ? Math.round(epoch + now) : realDate());
  window.requestAnimationFrame = (cb) => {
    if (!manual) return realRAF(cb);
    const id = ++nextId;
    rafs.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => { if (!rafs.delete(id)) realCAF(id); };
  window.setTimeout = (cb, ms = 0, ...a) => {
    if (!manual || typeof cb !== 'function') return realST(cb, ms, ...a);
    const id = ++nextId;
    timers.set(id, { at: now + Math.max(0, Number(ms) || 0), cb, a });
    return id;
  };
  window.clearTimeout = (id) => { if (!timers.delete(id)) realCT(id); };
  window.setInterval = (cb, ms = 0, ...a) => {
    if (!manual || typeof cb !== 'function') return realSI(cb, ms, ...a);
    const id = ++nextId;
    const every = Math.max(1, Number(ms) || 0);
    timers.set(id, { at: now + every, cb, a, every });
    return id;
  };
  window.clearInterval = (id) => { if (!timers.delete(id)) realCI(id); };

  // CSS animations and transitions run on the compositor's clock, not ours.
  // Pause each one as it appears and push it forward by hand.
  const animate = (dt) => {
    const live = new Set(document.getAnimations());
    for (const a of live) {
      if (!held.has(a) && a.playState === 'running') { a.pause(); held.add(a); }
    }
    for (const a of held) {
      if (!live.has(a)) { held.delete(a); continue; }
      const end = a.effect?.getComputedTiming().endTime ?? Infinity;
      const t = Number(a.currentTime ?? 0) + dt;
      if (t >= end) { a.finish(); held.delete(a); } else a.currentTime = t;
    }
  };

  const layer = () => {
    let el = document.getElementById('film-layer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'film-layer';
      document.body.append(el);
    }
    return el;
  };

  window.__film = {
    get now() { return now; },
    start() {
      if (manual) return;
      now = realNow();
      epoch = realDate() - now;
      manual = true;
    },
    step(dt) {
      now += dt;
      for (;;) {
        let due = null;
        for (const entry of timers) if (entry[1].at <= now && (!due || entry[1].at < due[1].at)) due = entry;
        if (!due) break;
        const [id, t] = due;
        if (t.every) t.at += t.every; else timers.delete(id);
        try { t.cb(...t.a); } catch (e) { console.error(e); }
      }
      const q = [...rafs.values()];
      rafs.clear();
      for (const cb of q) {
        try { cb(now); } catch (e) { console.error(e); }
      }
      animate(dt);
    },
    /**
     * Resolves after two real compositor frames. Without it the screenshot
     * can race the canvas being presented and catch a tile of the previous
     * frame, or of nothing: one frame in forty had a dark rectangle in it.
     */
    presented() {
      return new Promise((ok) => realRAF(() => realRAF(() => ok())));
    },
    style(css) {
      let el = document.getElementById('film-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'film-style';
        document.head.append(el);
      }
      el.textContent = css;
    },
    /** cards: [{ key, html, cls, opacity, lift }] — the whole visible set. */
    cards(list) {
      const root = layer();
      const keep = new Set(list.map((c) => c.key));
      for (const el of [...root.children]) if (!keep.has(el.dataset.key)) el.remove();
      for (const c of list) {
        let el = root.querySelector(`[data-key="${c.key}"]`);
        if (!el) {
          el = document.createElement('div');
          el.dataset.key = c.key;
          el.className = `film-card ${c.cls ?? ''}`;
          el.innerHTML = c.html;
          root.append(el);
        }
        el.style.opacity = String(c.opacity);
        el.style.setProperty('--lift', `${c.lift}px`);
        el.style.setProperty('--p', String(c.progress));
      }
    },
    black(o) {
      let el = document.getElementById('film-black');
      if (!el) {
        el = document.createElement('div');
        el.id = 'film-black';
        el.style.cssText = 'position:fixed;inset:0;background:#000;pointer-events:none;z-index:2147483647';
        document.body.append(el);
      }
      el.style.opacity = String(o);
    },
  };
}

const GPU_FLAGS = [
  '--no-sandbox', '--headless=new', '--enable-gpu', '--use-gl=angle', '--use-angle=gl-egl',
  '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage',
  // A hidden page is still a page Chrome wants to throttle.
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
];

const smooth = (x) => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };

function cardStates(shot, t) {
  return (shot.cards ?? []).flatMap((c, i) => {
    const fade = c.fade ?? 0.45;
    const fadeIn = c.fadeIn ?? fade;
    const fadeOut = c.fadeOut ?? fade;
    const to = c.to ?? shot.duration;
    if (t < c.from || t > to) return [];
    const opacity = Math.min(
      fadeIn ? smooth((t - c.from) / fadeIn) : 1,
      fadeOut ? smooth((to - t) / fadeOut) : 1,
    );
    if (opacity <= 0) return [];
    const lift = fadeIn ? (1 - smooth((t - c.from) / (fadeIn * 2.2))) * (c.rise ?? 14) : 0;
    const progress = (t - c.from) / Math.max(0.001, to - c.from);
    return [{ key: `${shot.name}-${i}`, html: c.html, cls: c.cls, opacity, lift, progress }];
  });
}

function encoder(file) {
  const ff = spawn('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF),
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, fail) => ff.on('close', (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)))));
  return { ff, done };
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [...GPU_FLAGS, `--window-size=${WIDTH},${HEIGHT}`],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.evaluateOnNewDocument(installClock);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction('window.__ceph !== undefined && window.__ceph.store.state.ready', {
    timeout: 90000, polling: 200,
  });
  const renderer = await page.evaluate(() => {
    const gl = document.getElementById('stage').getContext('webgl2');
    const dbg = gl?.getExtension('WEBGL_debug_renderer_info');
    return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  console.error(`[film] ${WIDTH}x${HEIGHT}@${FPS} on ${renderer}`);

  await page.evaluate(() => window.__film.start());
  if (script.css) await page.evaluate((css) => window.__film.style(css), script.css);
  if (script.boot) await page.evaluate(script.boot, ...(script.bootArgs ?? []));

  const cdp = await page.createCDPSession();
  const step = (dt) => page.evaluate((ms) => window.__film.step(ms), dt * 1000);
  const presented = () => page.evaluate(() => window.__film.presented());

  const shots = script.shots.filter((s) => (STILLS ? s.still : !s.still) && (!ONLY || ONLY.has(s.name)));
  for (const shot of shots) {
    const started = Date.now();
    await page.evaluate(() => { window.__film.cards([]); window.__film.black(0); });
    if (shot.setup) await page.evaluate(shot.setup, ...(shot.args ?? []));

    // Off camera: let flights land and the scene settle. Steps are capped at
    // the app's own maxDt so nothing integrates differently from a real run.
    const pre = 1 / Math.max(FPS, 20);
    let t = 0;
    const preroll = shot.preroll ?? 0;
    const limit = preroll + (shot.until ? (shot.wait ?? 20) : 0);
    while (t < limit) {
      await step(pre);
      t += pre;
      if (t >= preroll && (!shot.until || await page.evaluate(shot.until))) break;
    }
    if (shot.until && t >= limit) console.error(`[film] ${shot.name}: until() never held; capturing anyway`);
    for (let a = 0; a < (shot.after ?? 0); a += pre) await step(pre);

    if (shot.still) {
      await step(1 / FPS);
      if (shot.frame) await page.evaluate(shot.frame, 0, 0);
      await page.evaluate((list) => window.__film.cards(list), cardStates({ ...shot, duration: 1 }, 0.5));
      await presented();
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(`${OUT}/${shot.name}.png`, Buffer.from(data, 'base64'));
      console.error(`[film] ${shot.name}.png  ${((Date.now() - started) / 1000).toFixed(1)}s`);
      continue;
    }

    const file = `${OUT}/${shot.name}.mp4`;
    const { ff, done } = encoder(file);
    const frames = Math.round(shot.duration * FPS);
    const [dipIn, dipOut] = shot.dip ?? [0, 0];
    for (let i = 0; i < frames; i++) {
      const ft = i / FPS;
      await step(1 / FPS);
      if (shot.frame) await page.evaluate(shot.frame, ft, shot.duration);
      const black = Math.max(
        dipIn ? 1 - smooth(ft / dipIn) : 0,
        dipOut ? 1 - smooth((shot.duration - ft - 1 / FPS) / dipOut) : 0,
      );
      await page.evaluate((list, b) => { window.__film.cards(list); window.__film.black(b); },
        cardStates(shot, ft), black);
      await presented();
      const { data } = await cdp.send('Page.captureScreenshot', {
        format: 'jpeg', quality: 96, optimizeForSpeed: true,
      });
      if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await done;
    console.error(`[film] ${shot.name}.mp4  ${frames} frames  ${((Date.now() - started) / 1000).toFixed(1)}s`);
  }
  if (errors.length) console.error('--- page errors ---\n' + [...new Set(errors)].slice(0, 20).join('\n'));
} finally {
  await browser.close();
}
