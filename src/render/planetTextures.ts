import * as THREE from 'three';
import { bakePlanetMap, seedFromId } from '../cartography/planetMap.ts';
import type { BiomeKind } from '../data/types.ts';

export { seedFromId };

const cache = new Map<string, THREE.CanvasTexture>();

export function planetTexture(kind: BiomeKind, seed = 1): THREE.CanvasTexture {
  const key = `${kind}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = bakePlanetMap(kind, seed);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

export function sunTexture(color: string): THREE.CanvasTexture {
  const key = `sun:${color}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 8, S / 2, S / 2, S / 2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.18, color);
  g.addColorStop(0.45, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
