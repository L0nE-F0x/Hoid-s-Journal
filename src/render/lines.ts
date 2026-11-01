import * as THREE from 'three';
import type { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

/**
 * Move a fat line's points without rebuilding it.
 *
 * `LineGeometry.setPositions` and `setColors` allocate a fresh instanced
 * buffer on every call, and `computeLineDistances` a third. Three keys GPU
 * buffers by attribute, so each of those is a new buffer created and
 * uploaded, while the one it replaced waits for the garbage collector. The
 * Spiritual Realm redrew sixteen threads that way every frame — forty-eight
 * buffers a frame, for lines that never change length.
 *
 * Writing into the buffer that is already there is the same picture for one
 * upload. When the point count has changed the old path still runs, so a
 * caller can never end up drawing a stale shape.
 */
export function rewriteLine(
  geo: LineGeometry,
  points: ArrayLike<number>,
  colors?: ArrayLike<number>,
): void {
  if (writeSegments(geo, 'instanceStart', points)) geo.computeBoundingSphere();
  else geo.setPositions(Array.from(points));
  if (colors && !writeSegments(geo, 'instanceColorStart', colors)) geo.setColors(Array.from(colors));
}

/**
 * A polyline [p0, p1, p2, …] as the segment pairs [p0, p1, p1, p2, …] the
 * instanced buffer holds. False if the buffer is missing or a different size.
 */
function writeSegments(geo: LineGeometry, name: string, src: ArrayLike<number>): boolean {
  const attr = geo.getAttribute(name) as THREE.InterleavedBufferAttribute | undefined;
  const buffer = attr?.data;
  const segments = src.length / 3 - 1;
  if (!buffer || segments < 1 || buffer.array.length !== segments * 6) return false;
  const out = buffer.array as Float32Array;
  for (let i = 0; i < segments; i++) {
    const o = i * 6;
    const p = i * 3;
    out[o] = src[p]!;
    out[o + 1] = src[p + 1]!;
    out[o + 2] = src[p + 2]!;
    out[o + 3] = src[p + 3]!;
    out[o + 4] = src[p + 4]!;
    out[o + 5] = src[p + 5]!;
  }
  buffer.needsUpdate = true;
  return true;
}

/**
 * Distance along a plain `THREE.Line`, for a dashed material, written into
 * the attribute it already has. `Line.computeLineDistances` makes a new one
 * each call, which for a line that moves every frame is a new GPU buffer
 * every frame.
 */
export function rewriteLineDistances(line: THREE.Line, count?: number): void {
  const geo = line.geometry;
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const n = count ?? pos.count;
  let dist = geo.getAttribute('lineDistance') as THREE.BufferAttribute | undefined;
  if (!dist || dist.count !== pos.count) {
    dist = new THREE.BufferAttribute(new Float32Array(pos.count), 1);
    geo.setAttribute('lineDistance', dist);
  }
  const out = dist.array as Float32Array;
  out[0] = 0;
  for (let i = 1; i < n; i++) {
    const dx = pos.getX(i) - pos.getX(i - 1);
    const dy = pos.getY(i) - pos.getY(i - 1);
    const dz = pos.getZ(i) - pos.getZ(i - 1);
    out[i] = out[i - 1]! + Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  dist.needsUpdate = true;
}
