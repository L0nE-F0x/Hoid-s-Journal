import * as THREE from 'three';

/**
 * Where an equirectangular (u, v) sits on a body, and where the camera has to
 * stand to look straight at it.
 *
 * The convention has to match `THREE.SphereGeometry` exactly or the pins drift
 * off the map they were placed on: that geometry lays texture u along
 * `x = -cos(2πu)`, `z = +sin(2πu)`, and v = 1 at the north pole. `spin` is the
 * body mesh's current rotation about Y.
 */
export function uvOnBody(
  u: number, v: number, radius: number, spin: number, out: THREE.Vector3,
): THREE.Vector3 {
  const lat = (0.5 - v) * Math.PI;
  const lon = (u - 0.5) * Math.PI * 2;
  const cl = Math.cos(lat);
  const x = Math.cos(lon) * cl * radius;
  const y = Math.sin(lat) * radius;
  const z = -Math.sin(lon) * cl * radius;
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  return out.set(x * c + z * s, y, -x * s + z * c);
}

/** Camera heading and elevation that put (u, v) in the middle of the frame. */
export function uvFacing(u: number, v: number, spin: number): { theta: number; phi: number } {
  const lat = (0.5 - v) * Math.PI;
  const lon = (u - 0.5) * Math.PI * 2;
  const cl = Math.cos(lat);
  const x = Math.cos(lon) * cl;
  const z = -Math.sin(lon) * cl;
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  return {
    theta: Math.atan2(x * c + z * s, -x * s + z * c),
    phi: Math.acos(Math.min(1, Math.max(-1, Math.sin(lat)))),
  };
}
