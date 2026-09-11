import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
const exe = ['/usr/bin/chromium','/usr/bin/google-chrome-stable','/usr/bin/google-chrome'].find(p=>require('fs').existsSync(p));
const kind = process.argv[2] ?? 'roshar';
const out = process.argv[3] ?? '/tmp/plate.png';
const browser = await puppeteer.launch({ executablePath: exe, headless: true,
  args: ['--no-sandbox','--headless=new','--enable-gpu','--use-gl=angle','--use-angle=gl-egl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 700 });
page.on('pageerror', e => console.error('[err]', e.message));
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
 await page.evaluate((s) => { window.__plateSeedId = s; }, process.argv[4] ?? null);
const data = await page.evaluate(async ([kind]) => {
  const mod = await import('/src/render/planetBake.ts');
  const THREE = await import('/node_modules/three/build/three.module.js');
  const a = window.__ceph.app;
  const plates = mod.planetPlates(a.renderer, kind, mod.seedFromId(window.__plateSeedId || kind), false, 512);
  const draw = (tex) => {
    const w = 1024, h = 512;
    const rt = new THREE.WebGLRenderTarget(w, h, { colorSpace: THREE.SRGBColorSpace });
    const sc = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2,2), new THREE.MeshBasicMaterial({ map: tex }));
    sc.add(m);
    const prev = a.renderer.getRenderTarget();
    a.renderer.setRenderTarget(rt);
    a.renderer.render(sc, cam);
    const buf = new Uint8Array(w*h*4);
    a.renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    a.renderer.setRenderTarget(prev);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    // readRenderTargetPixels is bottom-up
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const s = ((h-1-y)*w+x)*4, d = (y*w+x)*4;
      img.data[d]=buf[s]; img.data[d+1]=buf[s+1]; img.data[d+2]=buf[s+2]; img.data[d+3]=255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  };
  return { albedo: draw(plates.albedo), data: draw(plates.data) };
}, [kind]);
writeFileSync(out, Buffer.from(data.albedo.split(',')[1], 'base64'));
writeFileSync(out.replace('.png','-data.png'), Buffer.from(data.data.split(',')[1], 'base64'));
console.log('wrote', out);
await browser.close();
