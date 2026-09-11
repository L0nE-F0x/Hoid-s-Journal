/**
 * Headless capture harness. Visual work without it is guessing.
 *
 *   node tools/screenshot.mjs --out /tmp/shot.png
 *   node tools/screenshot.mjs --focus ashyn --scale globe --out /tmp/ashyn.png
 *   node tools/screenshot.mjs --eval "__ceph.store.set('realm','cognitive')"
 *
 * Assumes `npm run dev` is already up. Uses the system Chrome; falls back to
 * SwiftShader when the GPU path cannot start.
 */
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1]]);
    return acc;
  }, []),
);

const OUT = args.out ?? 'shot.png';
const URL = args.url ?? 'http://127.0.0.1:5174/';
const WIDTH = Number(args.width ?? 1512);
const HEIGHT = Number(args.height ?? 900);
const SETTLE = Number(args.settle ?? 2600);

const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

const GPU_FLAGS = [
  '--no-sandbox',
  '--headless=new',
  '--enable-gpu',
  '--use-gl=angle',
  '--use-angle=gl-egl',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader',
  '--disable-dev-shm-usage',
];
const SOFTWARE_FLAGS = [
  '--no-sandbox', '--headless=new', '--use-gl=angle',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage',
];

async function capture(flags, label) {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [...flags, `--window-size=${WIDTH},${HEIGHT}`],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    const logs = [];
    page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try {
      await page.waitForFunction('window.__ceph !== undefined', {
        timeout: Number(args.boot ?? 60000), polling: 200,
      });
    } catch {
      const bootLabel = await page.evaluate(() => document.getElementById('boot-label')?.textContent);
      console.error(`[${label}] BOOT STALLED. boot-label="${bootLabel}"`);
      await shoot(page);
      console.error('--- console ---\n' + logs.slice(-40).join('\n'));
      return false;
    }

    // The title plays a 12s nested cinematic on every visit. Captures of the
    // sky enter and skip it; --intro keeps the title up for landing shots.
    if (!args.intro) {
      await page.evaluate(() => {
        window.__ceph.ui?.enter();
        window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' });
      });
    }

    if (args.focus) {
      const scale = typeof args.scale === 'string' ? args.scale : 'globe';
      await page.evaluate((id, sc) => {
        window.__ceph.store.set('cameraCue', { kind: 'focus', id, scale: sc });
      }, args.focus, scale);
    }

    const script = args['eval-file']
      ? readFileSync(args['eval-file'], 'utf8')
      : typeof args.eval === 'string' ? args.eval : null;
    if (script) await page.evaluate(script);

    await new Promise((r) => setTimeout(r, SETTLE));

    const info = await page.evaluate(() => {
      const gl = document.getElementById('stage').getContext('webgl2');
      const dbg = gl?.getExtension('WEBGL_debug_renderer_info');
      const s = window.__ceph.store.state;
      return {
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown',
        fps: Math.round(s.stats.fps),
        scale: s.scale,
        body: s.focusedBody,
        loc: s.focusedLocation,
        insets: s.insets,
      };
    });

    await shoot(page);
    console.error(
      `[${label}] renderer=${info.renderer} fps=${info.fps} scale=${info.scale} ` +
      `body=${info.body} loc=${info.loc} insets=${JSON.stringify(info.insets)} -> ${OUT}`,
    );
    const noise = logs.filter((l) => !/vite|hmr/i.test(l));
    if (noise.length) console.error('--- console ---\n' + noise.slice(0, 30).join('\n'));
    return true;
  } finally {
    await browser.close();
  }
}

async function shoot(page) {
  const type = OUT.endsWith('.jpg') || OUT.endsWith('.jpeg') ? 'jpeg' : 'png';
  await page.screenshot({
    path: OUT,
    type,
    ...(type === 'jpeg' ? { quality: Number(args.quality ?? 88) } : {}),
  });
}

try {
  await capture(GPU_FLAGS, 'gpu');
} catch (err) {
  console.error('GPU path failed, retrying with SwiftShader:', err.message);
  await capture(SOFTWARE_FLAGS, 'swiftshader');
}
