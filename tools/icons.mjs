/**
 * Rasterise public/mark.svg into PNG install icons.
 *
 *   npm run icons
 */
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'public/mark.svg'), 'utf8');
const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--headless=new', '--disable-dev-shm-usage'],
});
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(
      `<html><body style="margin:0;background:#05060d">${svg.replace('<svg', `<svg width="${size}" height="${size}"`)}</body></html>`,
      { waitUntil: 'load' },
    );
    const buf = await page.screenshot({ type: 'png', omitBackground: false });
    const out = join(root, 'public', `icon-${size}.png`);
    writeFileSync(out, buf);
    console.log(`wrote ${out}`);
    await page.close();
  }
} finally {
  await browser.close();
}
