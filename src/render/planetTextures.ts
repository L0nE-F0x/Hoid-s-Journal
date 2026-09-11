import * as THREE from 'three';

/** Soft radial sprites: haloes, hub markers, Spiritual motes. Worlds are
 *  baked on the GPU in `planetBake.ts` and do not come through here. */
const cache = new Map<string, THREE.CanvasTexture>();

export function sunTexture(color: string): THREE.CanvasTexture {
  const key = `sun:${color}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.12, color);
  g.addColorStop(0.34, color + 'aa');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
