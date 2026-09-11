import * as THREE from 'three';
import { COSMERE, bodyById, isVisible } from '../data/index.ts';
import type { Orrery } from './Orrery.ts';

function uvOnSphere(u: number, v: number, radius: number, out: THREE.Vector3): THREE.Vector3 {
  const lat = (0.5 - v) * Math.PI;
  const lon = (u - 0.5) * Math.PI * 2;
  const cl = Math.cos(lat);
  return out.set(
    Math.cos(lon) * cl * radius,
    Math.sin(lat) * radius,
    Math.sin(lon) * cl * radius,
  );
}

const _off = new THREE.Vector3();

export class Pins {
  readonly group = new THREE.Group();
  readonly pickables: THREE.Mesh[] = [];

  constructor() {
    const geo = new THREE.SphereGeometry(0.05, 8, 6);
    for (const loc of COSMERE.locations) {
      const mat = new THREE.MeshBasicMaterial({ color: loc.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { kind: 'location', id: loc.id, body: loc.body };
      this.group.add(mesh);
      this.pickables.push(mesh);
    }
  }

  update(orrery: Orrery, progress: Record<string, number>, focusedBody: string | null, scale: string): void {
    const show = scale === 'globe' || scale === 'surface' || scale === 'city';
    this.group.visible = show;
    if (!show) return;
    for (const mesh of this.pickables) {
      const loc = COSMERE.locations.find((l) => l.id === mesh.userData.id);
      if (!loc) { mesh.visible = false; continue; }
      const body = bodyById[loc.body];
      const origin = orrery.bodyPosition(loc.body);
      const vis = !!body && !!origin && isVisible(loc, progress) && (!focusedBody || focusedBody === loc.body);
      mesh.visible = vis;
      if (!vis || !body || !origin) continue;
      uvOnSphere(loc.u, loc.v, body.radius * 1.03, _off);
      mesh.position.copy(origin).add(_off);
    }
  }
}
