import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
const exe = ['/usr/bin/chromium','/usr/bin/google-chrome-stable'].find(existsSync);
const [u0,v0,u1,v1,out,scale] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: exe, headless: true,
  args: ['--no-sandbox','--headless=new','--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' });
const url = await page.evaluate(async (u0,v0,u1,v1,scale) => {
  const img = new Image(); img.src = 'maps/roshar_full.jpg'; await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const sx = u0*W, sy = v0*H, sw = (u1-u0)*W, sh = (v1-v0)*H;
  const c = document.createElement('canvas');
  c.width = Math.round(sw*scale); c.height = Math.round(sh*scale);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  // grid every 10% of the crop, to read coordinates off it
  ctx.strokeStyle = 'rgba(255,0,0,0.85)'; ctx.lineWidth = 1;
  ctx.font = '11px monospace'; ctx.fillStyle = 'red';
  for (let i = 1; i < 10; i++) {
    const x = c.width*i/10, y = c.height*i/10;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke();
    ctx.fillText(String(i), x+2, 12); ctx.fillText(String(i), 2, y-2);
  }
  return c.toDataURL('image/png');
}, +u0,+v0,+u1,+v1,+(scale||1));
writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
console.log(`wrote ${out}  (u ${u0}..${u1}, v ${v0}..${v1}; gridlines every 10%)`);
await browser.close();
