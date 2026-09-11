import * as THREE from 'three';
import type { Orbit } from '../data/types.ts';

const _v = new THREE.Vector3();

export function keplerOffset(orbit: Orbit, year: number, out = _v): THREE.Vector3 {
  const M = year * orbit.period * Math.PI * 2 + orbit.omega;
  const a = orbit.a;
  const e = orbit.e;
  const r = e === 0 ? a : (a * (1 - e * e)) / (1 + e * Math.cos(M));
  const x = r * Math.cos(M);
  const z = r * Math.sin(M);
  const y = Math.sin(orbit.i) * r * 0.35;
  return out.set(x, y, z);
}

export function keplerWorld(
  systemPos: THREE.Vector3,
  orbit: Orbit,
  year: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  keplerOffset(orbit, year, out);
  return out.add(systemPos);
}
