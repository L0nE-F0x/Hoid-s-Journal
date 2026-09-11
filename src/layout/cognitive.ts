import * as THREE from 'three';
import { hubById } from '../data/index.ts';

/**
 * Where a Cognitive site stands in the orrery's world space.
 *
 * Two kinds. A site anchored to one system (Celebrant, Lasting Integrity, the
 * Grand Knell) stands off that system's own subastral on a fixed bearing. A
 * site that belongs to no world (Silverlight) sits at the centroid of the
 * systems it is reachable from.
 *
 * Shadesmar's real distances are not to scale with the Physical Realm and
 * canon gives no coordinates, so these are a reading aid, not a claim.
 */
export function hubWorld(
  id: string,
  systemAt: (systemId: string) => THREE.Vector3 | undefined,
  out: THREE.Vector3,
): THREE.Vector3 | null {
  const hub = hubById[id];
  if (!hub) return null;

  if (hub.system) {
    const at = systemAt(hub.system);
    if (!at) return null;
    const r = hub.offset ?? 24;
    const a = hub.bearing ?? 0;
    return out.set(at.x + Math.cos(a) * r, at.y + (hub.rise ?? 0), at.z + Math.sin(a) * r);
  }

  const between = hub.between ?? [];
  out.set(0, 0, 0);
  let n = 0;
  for (const sys of between) {
    const p = systemAt(sys);
    if (!p) continue;
    out.add(p);
    n++;
  }
  if (!n) return null;
  return out.multiplyScalar(1 / n);
}
