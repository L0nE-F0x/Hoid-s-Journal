/**
 * Trace a coastline off a published plate into a mask both bakers can read.
 *
 *   npm run trace:coast              # rewrites src/cartography/coastlines.ts
 *   npm run trace:coast -- --preview /tmp   # and writes a PNG to look at
 *
 * Roshar's globe used to be twelve hand-tuned gaussian blobs, so the atlas
 * showed Kholinar on Alethkar and the globe showed the same pin in an ocean.
 * `Location.u/v` are 0–1 on the plate, and the globe reads the same 0–1 as
 * longitude and latitude, so a land mask sampled off the plate in plate
 * coordinates puts the coast under the pins by construction. Whether that is
 * a correct projection of Roshar is a question the plate already answered;
 * this only makes the globe agree with it.
 *
 * Classification is blue-dominance, then a sweep that drops land too small to
 * be an island and water too small to be a lake. Text is the only thing that
 * fools it — gold lettering over water is not blue — so the labels large
 * enough to survive the sweep are listed below as rectangles and painted out
 * first. They are stable: the plate is a file in this repo and will not move.
 *
 * Needs `npm run dev` running, because it decodes the image in the browser.
 */
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1]]);
    return acc;
  }, []),
);

const URL = args.url ?? 'http://127.0.0.1:5174/';
/** Working grid. Equirectangular, so 2:1 whatever the plate's own aspect. */
const WORK_W = 1536;
const WORK_H = 768;
/** Shipped grid. One bit per texel; the bakers blur it back into a coverage field. */
const OUT_W = 512;
const OUT_H = 256;

/**
 * Label blocks that sit on open water, in plate UV. Painted ocean before the
 * flood fill so the lettering does not come out as an archipelago.
 */
const ROSHAR_TEXT = [
  [0.010, 0.870, 0.205, 0.975],   // the "Roshar" title, bottom left
  [0.028, 0.025, 0.108, 0.425],   // "Endless Ocean", up the left edge
  [0.948, 0.250, 1.000, 0.680],   // "Ocean of Origins", down the right edge
  [0.725, 0.168, 0.912, 0.220],   // "Steamwater Ocean"
  [0.380, 0.030, 0.610, 0.095],   // "Northern Depths"
  [0.380, 0.885, 0.610, 0.965],   // "Southern Depths"
  [0.388, 0.178, 0.602, 0.232],   // "Reshi Isles"
  [0.412, 0.276, 0.570, 0.368],   // "Reshi Sea"
  [0.120, 0.455, 0.156, 0.650],   // "Aimian Sea", vertical
];

const PLATES = [
  {
    id: 'roshar',
    file: 'maps/roshar_full.jpg',
    erase: ROSHAR_TEXT,
    // Deep ocean is navy, shallows are cyan; land is tan, green or grey-brown.
    // Both waters are blue-dominant and no land on this plate is.
    rule: 'b - Math.max(r, g) > 10',
    // Below this many working texels, a landmass is a letter or a speck of
    // ink; below the second, a sea is a pinhole inside one.
    minIsland: 26,
    minLake: 14,
  },
];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--headless=new', '--disable-dev-shm-usage'],
});

const out = [];
try {
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  for (const plate of PLATES) {
    const r = await page.evaluate(async (plate, W, H, outW, outH) => {
      const img = new Image();
      img.src = plate.file;
      await img.decode();

      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      // Stretched to 2:1 on purpose: the plate's own 0–1 is what the pins use
      // and what the globe reads as longitude and latitude.
      ctx.drawImage(img, 0, 0, W, H);

      // Paint the lettering out before anything looks at colour.
      ctx.fillStyle = '#0a3a66';
      for (const [u0, v0, u1, v1] of plate.erase) {
        ctx.fillRect(u0 * W, v0 * H, (u1 - u0) * W, (v1 - v0) * H);
      }

      const px = ctx.getImageData(0, 0, W, H).data;
      const isBlue = new Uint8Array(W * H);
      const test = new Function('r', 'g', 'b', `return ${plate.rule};`);
      for (let i = 0; i < W * H; i++) {
        if (test(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])) isBlue[i] = 1;
      }

      // Land is simply what is not water. A flood fill from the border would
      // have been tidier against lettering, but Roshar's inland seas — the
      // Reshi Sea, the Purelake, the Tarat — are enclosed by their own coasts,
      // and a flood that cannot reach them fills them in as continent.
      const land = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) land[i] = isBlue[i] ? 0 : 1;

      // Sweep both ways: land too small to be an island is a letter or a speck
      // of ink, water too small to be a lake is a pinhole inside a letter.
      const sweep = (grid, want, minSize) => {
        const seen = new Uint8Array(W * H);
        let killed = 0;
        for (let s = 0; s < W * H; s++) {
          if (grid[s] !== want || seen[s]) continue;
          const comp = [s];
          seen[s] = 1;
          for (let k = 0; k < comp.length; k++) {
            const i = comp[k];
            const x = i % W;
            const y = (i / W) | 0;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
              const j = ny * W + nx;
              if (grid[j] === want && !seen[j]) { seen[j] = 1; comp.push(j); }
            }
          }
          if (comp.length < minSize) {
            for (const i of comp) grid[i] = want ? 0 : 1;
            killed++;
          }
        }
        return killed;
      };
      const dropped = sweep(land, 1, plate.minIsland) + sweep(land, 0, plate.minLake);

      // Box-average down to the shipped grid, then threshold at a half. One bit
      // per texel is plenty: the bakers blur it back into a coverage field and
      // the recipe's own noise puts the fractal detail back on the coast.
      const bits = new Uint8Array(outW * outH);
      const sx = W / outW;
      const sy = H / outH;
      let landCount = 0;
      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
          let n = 0; let t = 0;
          for (let j = Math.floor(y * sy); j < Math.floor((y + 1) * sy); j++) {
            for (let i = Math.floor(x * sx); i < Math.floor((x + 1) * sx); i++) {
              t += land[j * W + i]; n++;
            }
          }
          const on = t / Math.max(1, n) >= 0.5 ? 1 : 0;
          bits[y * outW + x] = on;
          landCount += on;
        }
      }

      // Pack to bytes, MSB first, and base64 it.
      const bytes = new Uint8Array((outW * outH) / 8);
      for (let i = 0; i < outW * outH; i++) {
        if (bits[i]) bytes[i >> 3] |= 0x80 >> (i & 7);
      }
      let bin = '';
      for (const b of bytes) bin += String.fromCharCode(b);

      // A picture of what we just decided, for a human to check.
      const pc = document.createElement('canvas');
      pc.width = outW; pc.height = outH;
      const pctx = pc.getContext('2d');
      const pim = pctx.createImageData(outW, outH);
      for (let i = 0; i < outW * outH; i++) {
        const v = bits[i] ? 232 : 24;
        pim.data[i * 4] = v; pim.data[i * 4 + 1] = v; pim.data[i * 4 + 2] = bits[i] ? 200 : 64;
        pim.data[i * 4 + 3] = 255;
      }
      pctx.putImageData(pim, 0, 0);

      return {
        b64: btoa(bin),
        land: landCount / (outW * outH),
        dropped,
        preview: pc.toDataURL('image/png'),
      };
    }, plate, WORK_W, WORK_H, OUT_W, OUT_H);

    console.log(
      `  ${plate.id.padEnd(10)} ${(r.land * 100).toFixed(1)}% land, `
      + `${r.dropped} speck(s) dropped, ${r.b64.length} chars`,
    );
    if (args.preview) {
      const path = `${args.preview}/coast-${plate.id}.png`;
      writeFileSync(path, Buffer.from(r.preview.split(',')[1], 'base64'));
      console.log(`  -> ${path}`);
    }
    out.push({ id: plate.id, b64: r.b64, land: r.land });
  }
} finally {
  await browser.close();
}

const body = out.map((o) => `  ${o.id}: '${o.b64}',`).join('\n');
writeFileSync('src/cartography/coastlines.ts', `/**
 * Land masks traced off the published plates by \`npm run trace:coast\`.
 * Generated — edit the tracer, not this file.
 *
 * One bit per texel on a ${OUT_W}x${OUT_H} equirectangular grid, MSB first,
 * base64. \`coastCoverage\` blurs it back into a smooth 0–1 field that
 * \`recipes.ts\` hands to both bakers in place of a world's \`shape\` blobs, so
 * the continent on the globe is the continent on the plate and a pin lands on
 * the ground it names.
 */

export const COAST_W = ${OUT_W};
export const COAST_H = ${OUT_H};

const PACKED: Record<string, string> = {
${body}
};

const fields = new Map<string, Float32Array>();

/**
 * Unpack and blur. The mask is one bit per texel and a hard edge would make a
 * coastline of staircases; three passes of a small box turn it into a
 * coverage field the recipe noise can then ruffle into something fractal.
 */
function fieldFor(id: string): Float32Array | null {
  const hit = fields.get(id);
  if (hit) return hit;
  const packed = PACKED[id];
  if (!packed) return null;

  const n = COAST_W * COAST_H;
  let src = new Float32Array(n);
  const bin = atob(packed);
  for (let i = 0; i < n; i++) {
    src[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  }

  let dst = new Float32Array(n);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < COAST_H; y++) {
      for (let x = 0; x < COAST_W; x++) {
        let t = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const sy = y + dy;
          if (sy < 0 || sy >= COAST_H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            // Longitude wraps; latitude does not.
            const sx = (x + dx + COAST_W) % COAST_W;
            t += src[sy * COAST_W + sx]!; k++;
          }
        }
        dst[y * COAST_W + x] = t / k;
      }
    }
    const swap = src; src = dst; dst = swap;
  }
  fields.set(id, src);
  return src;
}

/** Bilinear, wrapping in u. 0 is open ocean, 1 is deep inland. */
export function coastCoverage(id: string, u: number, v: number): number {
  const f = fieldFor(id);
  if (!f) return 0;
  const fx = u * COAST_W - 0.5;
  const fy = Math.min(COAST_H - 1, Math.max(0, v * COAST_H - 0.5));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const wrap = (x: number) => ((x % COAST_W) + COAST_W) % COAST_W;
  const row = (y: number) => Math.min(COAST_H - 1, Math.max(0, y)) * COAST_W;
  const a = f[row(y0) + wrap(x0)]!;
  const b = f[row(y0) + wrap(x0 + 1)]!;
  const c = f[row(y0 + 1) + wrap(x0)]!;
  const d = f[row(y0 + 1) + wrap(x0 + 1)]!;
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

/** The blurred field as bytes, for uploading to the GPU. */
export function coastBytes(id: string): Uint8Array | null {
  const f = fieldFor(id);
  if (!f) return null;
  const out = new Uint8Array(f.length);
  for (let i = 0; i < f.length; i++) out[i] = Math.round(f[i]! * 255);
  return out;
}

export function hasCoast(id: string): boolean {
  return id in PACKED;
}
`);
console.log('\nwrote src/cartography/coastlines.ts');
