import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import puppeteer from 'puppeteer-core';
const exe = ['/usr/bin/chromium','/usr/bin/google-chrome-stable','/usr/bin/google-chrome'].find(p=>require('fs').existsSync(p));
const browser = await puppeteer.launch({ executablePath: exe, headless: true,
  args: ['--no-sandbox','--headless=new','--enable-gpu','--use-gl=angle','--use-angle=gl-egl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--window-size=1200,700'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 700 });
const logs = [];
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
await page.evaluate(() => { window.__ceph.ui?.enter(); window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' }); });
await new Promise(r => setTimeout(r, 5000));
const out = await page.evaluate(process.argv[2] ?? '1');
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
console.log('--- logs ---\n' + logs.slice(-25).join('\n').slice(0,4000));
await browser.close();
