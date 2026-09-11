import * as THREE from 'three';
import { COSMERE, bodyById, bodyByName, characterAt, isVisible } from '../data/index.ts';
import { keplerWorld } from '../layout/kepler.ts';
import type { Orrery } from './Orrery.ts';

const _off = new THREE.Vector3();

/**
 * Era-true character motes on their current world, and Shard lines from Yolen
 * to wherever the power sits this era.
 */
export class Presence {
  readonly group = new THREE.Group();
  private readonly chars: { id: string; mesh: THREE.Mesh }[] = [];
  private readonly lines: { id: string; line: THREE.Line }[] = [];
  private readonly yolen = new THREE.Vector3();
  private readonly trail: THREE.Line;
  private readonly trailMat: THREE.LineDashedMaterial;
  private readonly stops: THREE.Mesh[] = [];

  constructor() {
    const geo = new THREE.SphereGeometry(0.08, 10, 8);
    for (const ch of COSMERE.characters) {
      const mat = new THREE.MeshBasicMaterial({
        color: ch.color,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { kind: 'character', id: ch.id };
      this.group.add(mesh);
      this.chars.push({ id: ch.id, mesh });
    }

    // Worldhopper trail: where one person has been, era by era.
    this.trailMat = new THREE.LineDashedMaterial({
      color: 0xffffff, dashSize: 1.6, gapSize: 1.0, transparent: true, opacity: 0.75,
    });
    this.trail = new THREE.Line(
      new THREE.BufferGeometry().setAttribute(
        'position', new THREE.BufferAttribute(new Float32Array(COSMERE.eras.length * 3), 3),
      ),
      this.trailMat,
    );
    this.trail.visible = false;
    this.group.add(this.trail);
    const stopGeo = new THREE.SphereGeometry(0.5, 12, 8);
    for (let i = 0; i < COSMERE.eras.length; i++) {
      const mesh = new THREE.Mesh(stopGeo, new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.9,
      }));
      mesh.visible = false;
      this.group.add(mesh);
      this.stops.push(mesh);
    }

    const yolen = COSMERE.systems.find((s) => s.id === 'yolish');
    if (yolen) this.yolen.set(...yolen.position);

    for (const sh of COSMERE.shards) {
      const geoLine = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3(),
      ]);
      const mat = new THREE.LineDashedMaterial({
        color: sh.color,
        dashSize: 0.8,
        gapSize: 0.45,
        transparent: true,
        opacity: 0.55,
      });
      const line = new THREE.Line(geoLine, mat);
      line.userData = { kind: 'shard', id: sh.id };
      this.group.add(line);
      this.lines.push({ id: sh.id, line });
    }
  }

  update(
    orrery: Orrery,
    camera: THREE.Camera,
    era: number,
    year: number,
    progress: Record<string, number>,
    scale: string,
    cognitive = false,
    selected: string | null = null,
  ): void {
    const yolenPos = orrery.bodyPosition('yolen') ?? this.yolen;
    this.updateTrail(orrery, camera, progress, scale, selected);

    // On a surface scan the pins are the subject; a swarm of people-dots at
    // the same apparent size just competes with them.
    const motesOn = scale !== 'surface' && scale !== 'city';
    for (const row of this.chars) {
      const ch = COSMERE.characters.find((c) => c.id === row.id);
      if (!motesOn || !ch || !isVisible(ch, progress)) { row.mesh.visible = false; continue; }
      const at = characterAt(ch, era);
      const bodyId = at?.body;
      const origin = bodyId ? orrery.bodyPosition(bodyId) : null;
      const body = bodyId ? bodyById[bodyId] : undefined;
      if (!origin || !body) { row.mesh.visible = false; continue; }
      row.mesh.visible = true;
      const i = COSMERE.characters.indexOf(ch);
      const a = year * 0.9 + i * 0.7;
      const r = body.radius * 1.55 + 0.25;
      _off.set(Math.cos(a) * r, Math.sin(a * 0.6) * body.radius * 0.35, Math.sin(a) * r);
      row.mesh.position.copy(origin).add(_off);
      // A mote is a marker, not a world: hold it at a few pixels across, or a
      // globe portrait turns into a bowl of marbles.
      const d = camera.position.distanceTo(row.mesh.position);
      const s = Math.min(1.2, Math.max(0.22, d * 0.061));
      // In Shadesmar the cognitive ones are the locals; bodies are shadows.
      const here = !cognitive || ch.cognitive;
      row.mesh.scale.setScalar(s * (ch.cognitive ? 1.35 : 1) * (here ? 1 : 0.6));
      (row.mesh.material as THREE.MeshBasicMaterial).opacity = here ? 0.95 : 0.3;
    }

    const linesOn = scale === 'cosmere' || scale === 'system';
    for (const row of this.lines) {
      const sh = COSMERE.shards.find((s) => s.id === row.id);
      if (!sh) { row.line.visible = false; continue; }
      if (!isVisible(sh, progress) || era <= 0) { row.line.visible = false; continue; }
      const eraRow = sh.eras.find((e) => e.era === era) ?? sh.eras[sh.eras.length - 1];
      const dest = eraRow ? bodyByName(eraRow.loc) ?? bodyByName(sh.world) : bodyByName(sh.world);
      const destPos = dest ? orrery.bodyPosition(dest.id) : null;
      if (!destPos) { row.line.visible = false; continue; }
      row.line.visible = linesOn;
      const pos = row.line.geometry.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, yolenPos.x, yolenPos.y, yolenPos.z);
      pos.setXYZ(1, destPos.x, destPos.y, destPos.z);
      pos.needsUpdate = true;
      row.line.computeLineDistances();
    }
  }

  /**
   * A selected worldhopper's path across the eras: each stop is that era's
   * world at that era's own year, so the shape is history, not this instant.
   */
  private updateTrail(
    orrery: Orrery,
    camera: THREE.Camera,
    progress: Record<string, number>,
    scale: string,
    selected: string | null,
  ): void {
    const ch = selected ? COSMERE.characters.find((c) => c.id === selected) : undefined;
    const on = !!ch && isVisible(ch, progress) && (scale === 'cosmere' || scale === 'system');
    this.trail.visible = on;
    for (const m of this.stops) m.visible = false;
    if (!on || !ch) return;

    const pos = this.trail.geometry.getAttribute('position') as THREE.BufferAttribute;
    let n = 0;
    for (const era of COSMERE.eras) {
      const row = ch.eras.find((e) => e.era === era.id);
      if (!row) continue;
      const body = row.body ? bodyById[row.body] : undefined;
      const sys = orrery.systemPosition(row.system);
      if (!sys) continue;
      if (body) keplerWorld(sys, body.orbit, era.start, _off);
      else _off.copy(sys);
      pos.setXYZ(n, _off.x, _off.y, _off.z);
      const stop = this.stops[n];
      if (stop) {
        stop.position.copy(_off);
        stop.visible = true;
        (stop.material as THREE.MeshBasicMaterial).color.set(ch.color);
        stop.scale.setScalar(Math.min(2.4, Math.max(0.3, camera.position.distanceTo(_off) * 0.012)));
      }
      n++;
    }
    if (n < 2) { this.trail.visible = false; return; }
    this.trail.geometry.setDrawRange(0, n);
    pos.needsUpdate = true;
    this.trail.geometry.computeBoundingSphere();
    this.trail.computeLineDistances();
    this.trailMat.color.set(ch.color);
  }
}
