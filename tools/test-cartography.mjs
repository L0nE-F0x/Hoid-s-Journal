/**
 * One recipe, two bakers. This is the thing that keeps them in step.
 *
 *   npm run dev            # in one shell
 *   npm run test:cartography
 *
 * `render/planetBake.ts` draws a world's plate on the GPU for the globe;
 * `cartography/planetMap.ts` draws the same plate on the CPU for the atlas,
 * which cannot import Three. Nothing but a convention has ever kept the two
 * agreeing, and they drifted: the globe painted a second ice cap over the
 * baked one, cut on a different variable at a different latitude, and the CPU
 * baker never applied the per-world tint that tells ten gas giants apart.
 *
 * Both are asked for the same world on the same grid, and the two plates are
 * blurred before they are compared. Blurred, because one runs at 32-bit and
 * the other at 64: on a high-contrast edge — the lip of an ice cap, a gas
 * giant's band boundary — a divergence in the fifth decimal of a noise field
 * moves the edge by a texel, and a texel of a hard edge is a difference of a
 * hundred and twenty. That is not drift, it is arithmetic.
 *
 * What survives a blur is everything worth holding: where the continents are,
 * how much of the world is ocean, how far the cap reaches, and what colour any
 * of it is. Every bug this was written for — a second ice cap forty degrees
 * wider than the baked one, a missing per-world tint, one baker on simplex and
 * the other on value noise, a colour space applied once instead of twice —
 * moves those numbers well past the bar.
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import process from 'node:process';

const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = process.env.CHROME_PATH || BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');
const URL = process.argv[2] ?? 'http://127.0.0.1:5174/';

/**
 * Mean absolute channel difference over the blurred plates, 0–255, and the
 * worst single latitude band. Calibrated against the bugs this exists to
 * catch, which all measured two to five times these: the second ice cap put
 * whole polar bands past 60, one baker on value noise and the other on simplex
 * put unshaped worlds past 40 everywhere, and a colour space applied once
 * instead of twice put every world past 45. What is left under the bar is
 * coastline fringe and band-edge jitter between 32-bit and 64-bit floats.
 */
const MEAN_TOLERANCE = 26;
const BAND_TOLERANCE = 55;
/**
 * How far the two plates may disagree about the brightness of their poles.
 * The cap is the thing that actually drifted, so it is asserted directly
 * rather than left to a mean that the polar texel-crowding drowns out.
 */
const POLAR_TOLERANCE = 12;

/** Worlds with a polar cap, and how wide the recipe says it is. */
const ICY = new Set(['roshar', 'scadrial-basin', 'sel', 'nalthis', 'threnody', 'yolen', 'barren', 'komashi']);

const WORLDS = [
  ['roshar', 'roshar', false],
  ['scadrial-ash', 'scadrial', false],
  ['scadrial-basin', 'scadrial', false],
  ['sel', 'sel', false],
  ['nalthis', 'nalthis', false],
  ['threnody', 'threnody', false],
  ['taldain', 'taldain', false],
  ['komashi', 'komashi', false],
  ['lumar', 'lumar-world', false],
  ['yolen', 'yolen', false],
  ['first-sun', 'first-of-the-sun', false],
  ['gas', 'jes', false],
  ['gas', 'vev', false],
  ['barren', 'braize', false],
  ['roshar', 'roshar', true],
  ['sel', 'sel', true],
];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [
    '--no-sandbox', '--headless=new', '--enable-gpu', '--use-gl=angle',
    '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader',
    '--disable-dev-shm-usage', '--window-size=1200,800',
  ],
});

let failures = 0;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
  await page.evaluate(() => {
    window.__ceph.ui?.enter();
    window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' });
  });

  for (const [kind, bodyId, cognitive] of WORLDS) {
    const r = await page.evaluate((kind, bodyId, cognitive) => {
      const { bakePlanetMap, app } = window.__ceph;
      // seedFromId is the same hash in both bakers; recompute it here rather
      // than export a third copy.
      let h = 0;
      for (let i = 0; i < bodyId.length; i++) h = (h * 33 + bodyId.charCodeAt(i)) >>> 0;
      const seed = (h % 97) + 1;

      const SIZE = 64;
      const gpu = app.samplePlate(kind, seed, cognitive, SIZE);

      // Untinted on both sides. The tint is not baked into the plate — the
      // globe applies it in `planet.frag` and the atlas applies it to the
      // canvas — so comparing a tinted plate against an untinted one would
      // only ever measure the tint. That it is the *same* tint is what
      // `plateTint` living in recipes.ts guarantees.
      const canvas = bakePlanetMap(kind, seed, gpu.width, gpu.height, cognitive);
      const ctx = canvas.getContext('2d');
      const cpu = ctx.getImageData(0, 0, gpu.width, gpu.height).data;

      // Box blur, wrapping in longitude, so an edge that moved by a texel is
      // not read as a plate that changed colour.
      const R = 3;
      const W = gpu.width;
      const H = gpu.height;
      const blur = (src) => {
        const out = new Float64Array(W * H * 3);
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            let r = 0; let g = 0; let b = 0; let n = 0;
            for (let dy = -R; dy <= R; dy++) {
              const sy = y + dy;
              if (sy < 0 || sy >= H) continue;
              for (let dx = -R; dx <= R; dx++) {
                const sx = (x + dx + W) % W;
                const i = (sy * W + sx) * 4;
                r += src[i]; g += src[i + 1]; b += src[i + 2]; n++;
              }
            }
            const o = (y * W + x) * 3;
            out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
          }
        }
        return out;
      };
      const a = blur(gpu.pixels);
      const c = blur(cpu);

      // Mean over the whole plate, and over each of eight latitude bands, so a
      // polar disagreement cannot hide behind an agreeing equator.
      const BANDS = 8;
      const bandSum = new Array(BANDS).fill(0);
      const bandN = new Array(BANDS).fill(0);
      let sum = 0;
      let n = 0;
      for (let y = 0; y < H; y++) {
        const band = Math.min(BANDS - 1, Math.floor((y / H) * BANDS));
        for (let x = 0; x < W; x++) {
          const o = (y * W + x) * 3;
          const d = (Math.abs(a[o] - c[o]) + Math.abs(a[o + 1] - c[o + 1])
            + Math.abs(a[o + 2] - c[o + 2])) / 3;
          sum += d; n++;
          bandSum[band] += d; bandN[band]++;
        }
      }
      // The cap gets its own number. A generic per-band mean is not tight
      // enough to catch a cap of the wrong size — the polar rows of an
      // equirectangular plate are a sliver of real surface and a lot of
      // texels, so the noise floor up there is high. This is the exact
      // quantity that broke: how bright the top and bottom of the plate are.
      const POLAR = Math.max(1, Math.round(H * 0.06));
      const polarMean = (src, rows) => {
        let t = 0; let k = 0;
        for (const y of rows) {
          for (let x = 0; x < W; x++) {
            const o = (y * W + x) * 3;
            t += (src[o] + src[o + 1] + src[o + 2]) / 3; k++;
          }
        }
        return t / k;
      };
      const top = [...Array(POLAR).keys()];
      const bottom = top.map((i) => H - 1 - i);
      const rows = [...top, ...bottom];

      return {
        mean: sum / n,
        bands: bandSum.map((s, i) => s / bandN[i]),
        polar: Math.abs(polarMean(a, rows) - polarMean(c, rows)),
      };
    }, kind, bodyId, cognitive);

    const worst = Math.max(...r.bands);
    const capOk = !ICY.has(kind) || cognitive || r.polar <= POLAR_TOLERANCE;
    const ok = r.mean <= MEAN_TOLERANCE && worst <= BAND_TOLERANCE && capOk;
    if (!ok) failures++;
    const label = `${kind}${cognitive ? ' · Shadesmar' : ''}`.padEnd(24);
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${label} mean ${r.mean.toFixed(1).padStart(5)}`
      + `  worst band ${worst.toFixed(1).padStart(5)}`
      + `  cap ${r.polar.toFixed(1).padStart(5)}`
      + `  (${r.bands.map((b) => b.toFixed(0)).join(' ')})`,
    );
  }
  // The tint is not baked. `planet.frag` multiplies the plate by it and the
  // atlas multiplies its canvas by it, so the plates above are compared
  // untinted — which means this is the only thing standing between a grey
  // atlas plate and a blue globe, the state Jes shipped in.
  const tint = await page.evaluate(() => {
    const { bakePlanetMap, plateTint, bodyById } = window.__ceph;
    const jes = bodyById.jes;
    const applied = plateTint(jes.kind, jes.color);
    const read = (canvas) => {
      const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0; let g = 0; let b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4;
      return [r / n, g / n, b / n];
    };
    const plain = read(bakePlanetMap('gas', 58, 128, 64, false));
    const tinted = read(bakePlanetMap('gas', 58, 128, 64, false, applied));
    return { applied, plain, tinted, kind: jes.kind };
  });
  const shifted = Math.abs(tint.tinted[2] - tint.plain[2]) + Math.abs(tint.tinted[0] - tint.plain[0]);
  const tintOk = tint.kind === 'gas-giant' && tint.applied[2] > tint.applied[0] && shifted > 12;
  if (!tintOk) failures++;
  console.log(
    `\n  ${tintOk ? 'PASS' : 'FAIL'}  the atlas applies the globe's own tint`
    + `  (jes ${tint.applied.map((v) => v.toFixed(2)).join('/')}, plate moves by ${shifted.toFixed(1)})`,
  );
} finally {
  await browser.close();
}

const checks = WORLDS.length + 1;
console.log(`\n${checks - failures}/${checks} checks pass`);
if (failures) {
  console.log('\nThe globe and the atlas are drawing different worlds. Both bakers read');
  console.log('cartography/recipes.ts; whatever one of them does that the other does not');
  console.log('is the bug. Per-latitude means are printed above, north to south.');
  process.exit(1);
}
