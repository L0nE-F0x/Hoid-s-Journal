/**
 * Frame cost per Realm and scale, with the expensive layers taken away one at
 * a time.
 *
 *   npm run perf                      # against npm run dev on 5174
 *   npm run perf -- --url http://127.0.0.1:5182/
 *
 * Two columns. `fps` is what the reader would see, and it lies whenever
 * anything else is using the GPU — another tab, another agent, a video call.
 * `gpu ms` is the median GPU time of the post chain's render (which draws the
 * whole scene) measured with EXT_disjoint_timer_query_webgl2, which only
 * counts this page's own work; compare rows inside one run, not across runs.
 * Where the extension is missing the column reads `—`.
 *
 * Toggling a pass off by hand must keep exactly one pass drawing to the
 * canvas (AGENTS.md, invariant 4), or the row measures a frame drawn into a
 * buffer nobody reads. The two post rows re-route the output themselves.
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const URL = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://127.0.0.1:5174/';
const exe = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'].find(existsSync);
if (!exe) throw new Error('No chromium/chrome binary found');
const browser = await puppeteer.launch({ executablePath: exe, headless: true,
  args: ['--no-sandbox', '--headless=new', '--enable-gpu', '--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage', '--window-size=1512,900'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const page = await browser.newPage();
await page.setViewport({ width: 1512, height: 900 });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ceph !== undefined', { timeout: 60000, polling: 200 });
await page.evaluate(() => {
  window.__ceph.ui?.enter();
  window.__ceph.store.set('cameraCue', { kind: 'skip-cinematic' });
  window.__ceph.store.set('visual', { ...window.__ceph.store.state.visual, quality: 'high' });
  window.__ceph.store.set('chrome', { directory:false, minimap:false, timeline:false });
});
await sleep(4000);

// GPU time around the composer's render: the whole scene plus post.
const timed = await page.evaluate(() => {
  const gl = window.__ceph.app.renderer.getContext();
  const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  if (!ext) return false;
  const comp = window.__ceph.app.post.composer;
  const render = comp.render.bind(comp);
  const pending = [];
  window.__gpuMs = [];
  comp.render = (dt) => {
    for (let i = pending.length - 1; i >= 0; i--) {
      if (!gl.getQueryParameter(pending[i], gl.QUERY_RESULT_AVAILABLE)) continue;
      if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) window.__gpuMs.push(gl.getQueryParameter(pending[i], gl.QUERY_RESULT) / 1e6);
      gl.deleteQuery(pending[i]);
      pending.splice(i, 1);
    }
    const q = gl.createQuery();
    gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
    render(dt);
    gl.endQuery(ext.TIME_ELAPSED_EXT);
    pending.push(q);
  };
  return true;
});

const measure = () => page.evaluate(() => new Promise((res) => {
  window.__gpuMs = [];
  let n = 0;
  const t0 = performance.now();
  const tick = () => {
    n++;
    if (performance.now() - t0 < 1800) { requestAnimationFrame(tick); return; }
    const g = window.__gpuMs.slice().sort((a, b) => a - b);
    res({ fps: Math.round(n / ((performance.now() - t0) / 1000)), gpu: g.length ? g[g.length >> 1] : null });
  };
  requestAnimationFrame(tick);
}));
const set = (code) => page.evaluate(code);
const rows = [];
const row = async (name) => { await sleep(300); rows.push([name, await measure()]); };

await row('cosmere');
await set(`window.__ceph.store.set('visual', {...window.__ceph.store.state.visual, showNebula:false})`);
await row('cosmere - nebulae');
await set(`window.__ceph.store.set('visual', {...window.__ceph.store.state.visual, showNebula:true})`);
await set(`window.__ceph.store.set('realm','cognitive')`);
await sleep(2500);
await row('cognitive cosmere');
await set(`window.__ceph.app.shadesmar.souls.visible = false`);
await row('  - souls');
await set(`window.__ceph.app.shadesmar.souls.visible = true; for (const i of window.__ceph.app.shadesmar.islands) i.mesh.visible = false;`);
await row('  - islands');
await set(`for (const r of window.__ceph.app.shadesmar.routes) r.line.visible = false;`);
await row('  - routes too');
await set(`for (const i of window.__ceph.app.shadesmar.islands) i.mesh.visible = true; for (const r of window.__ceph.app.shadesmar.routes) r.line.visible = true;`);
await set(`window.__ceph.store.set('visual', {...window.__ceph.store.state.visual, showNebula:false})`);
await row('  - nebulae too');
await set(`window.__ceph.app.shadesmar.souls.visible = true; window.__ceph.store.set('visual', {...window.__ceph.store.state.visual, showNebula:true})`);
await set(`window.__ceph.store.set('realm','spiritual')`);
await sleep(2500);
await row('spiritual');
await set(`window.__ceph.store.set('realm','physical')`);
await sleep(1500);
await page.evaluate(() => window.__ceph.store.set('cameraCue', { kind: 'focus', id: 'roshar', scale: 'globe' }));
await sleep(4000);
await row('baseline globe');
await set(`window.__ceph.app.starfield.sky.visible = false`); await row('- sky dome');
await set(`window.__ceph.app.starfield.sky.visible = true; window.__ceph.store.set('visual', {...window.__ceph.store.state.visual, showAtmospheres:false})`); await row('- atmosphere');
await set(`window.__ceph.store.set('visual', {...window.__ceph.store.state.visual, showAtmospheres:true}); for (const n of window.__ceph.app.orrery.bodyNodes.values()) n.mat.uniforms.uDetail.value = 0`); await row('- surface detail');
await set(`for (const n of window.__ceph.app.orrery.bodyNodes.values()) n.mat.uniforms.uClouds.value = 0`); await row('- clouds too');
// The main pass takes over the canvas when SMAA goes, as routeOutput() does.
await set(`{ const p = window.__ceph.app.post.composer.passes; p[2].enabled = false; p[1].renderToScreen = true; }`); await row('- SMAA too');
await set(`{ const p = window.__ceph.app.post.composer.passes; p[1].enabled = false; p[0].renderToScreen = true; }`); await row('- all post too');
const fmt = (r) => `${String(r.fps).padStart(4)} fps  ${r.gpu == null ? '     —' : `${r.gpu.toFixed(1).padStart(6)} ms`}`;
console.log(`${'row'.padEnd(20)}  fps   gpu ms${timed ? '' : ' (no timer queries here)'}`);
console.log(rows.map(([n, r]) => n.padEnd(20) + fmt(r)).join('\n'));
await browser.close();
