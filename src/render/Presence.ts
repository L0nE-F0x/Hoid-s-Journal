import * as THREE from 'three';
import { COSMERE, HUBS, ROUTES, bodyById, bodyByName, characterAt, hubById, isVisible } from '../data/index.ts';
import { keplerWorld } from '../layout/kepler.ts';
import type { Orrery } from './Orrery.ts';
import { sunTexture } from './planetTextures.ts';

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
  private readonly hubs: { id: string; mesh: THREE.Mesh; halo: THREE.Sprite; label: THREE.Sprite; pos: THREE.Vector3 }[] = [];
  private readonly routes: THREE.Line[] = [];

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

    const hubGeo = new THREE.SphereGeometry(0.7, 16, 12);
    for (const hub of HUBS) {
      const mesh = new THREE.Mesh(hubGeo, new THREE.MeshBasicMaterial({
        color: hub.color, transparent: true, opacity: 0.95,
      }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sunTexture(hub.color),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }));
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 96;
      const ctx = canvas.getContext('2d')!;
      ctx.font = '600 34px Inter, ui-sans-serif, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#eaf4ff';
      ctx.fillText(hub.name, 256, 48);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false,
      }));
      mesh.visible = false;
      halo.visible = false;
      label.visible = false;
      this.group.add(mesh, halo, label);
      this.hubs.push({ id: hub.id, mesh, halo, label, pos: new THREE.Vector3() });
    }
    for (const route of ROUTES) {
      const geo = new THREE.BufferGeometry().setAttribute(
        'position', new THREE.BufferAttribute(new Float32Array(9), 3),
      );
      const line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: 0xb39dfb, dashSize: 2.2, gapSize: 1.4, transparent: true, opacity: 0.45,
      }));
      line.visible = false;
      line.userData = { id: route.id };
      this.group.add(line);
      this.routes.push(line);
    }

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
    showCharacters = true,
    showShardLines = true,
  ): void {
    const yolenPos = orrery.bodyPosition('yolen') ?? this.yolen;
    this.updateTrail(orrery, camera, progress, scale, selected);
    this.updateHubs(orrery, camera, progress, scale, cognitive, selected);

    // On a surface scan the pins are the subject; a swarm of people-dots at
    // the same apparent size just competes with them.
    const motesOn = showCharacters && scale !== 'surface' && scale !== 'city';
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

    const linesOn = showShardLines && (scale === 'cosmere' || scale === 'system');
    for (const row of this.lines) {
      const sh = COSMERE.shards.find((s) => s.id === row.id);
      if (!sh) { row.line.visible = false; continue; }
      if (!isVisible(sh, progress) || era <= 0) { row.line.visible = false; continue; }
      const eraRow = sh.eras.find((e) => e.era === era) ?? sh.eras[sh.eras.length - 1];
      const dest = eraRow ? bodyByName(eraRow.loc) ?? bodyByName(sh.world) : bodyByName(sh.world);
      const destPos = dest ? orrery.bodyPosition(dest.id) : null;
      if (!destPos) { row.line.visible = false; continue; }
      const hot = selected === sh.id;
      // In Shadesmar the roads are worldhopper routes, not Shard-seat lines.
      row.line.visible = !cognitive && (linesOn || hot);
      const pos = row.line.geometry.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, yolenPos.x, yolenPos.y, yolenPos.z);
      pos.setXYZ(1, destPos.x, destPos.y, destPos.z);
      pos.needsUpdate = true;
      row.line.computeLineDistances();
      const mat = row.line.material as THREE.LineDashedMaterial;
      mat.opacity = hot ? 0.95 : linesOn ? 0.55 : 0;
      mat.dashSize = hot ? 0.4 : 0.8;
    }
  }

  /** Where a Cognitive hub is standing this frame. */
  hubPosition(id: string): THREE.Vector3 | undefined {
    const row = this.hubs.find((h) => h.id === id);
    return row?.mesh.visible ? row.pos : row?.pos;
  }

  private hubWorld(orrery: Orrery, id: string, into: THREE.Vector3): THREE.Vector3 | null {
    const hub = hubById[id];
    if (!hub) return null;
    into.set(0, 0, 0);
    let n = 0;
    for (const sys of hub.between) {
      const p = orrery.systemPosition(sys);
      if (!p) continue;
      into.add(p);
      n++;
    }
    if (!n) return null;
    return into.multiplyScalar(1 / n);
  }

  /**
   * Silverlight and the roads to it: only in Shadesmar, and only at a
   * distance where a city between stars can still be a city.
   */
  private updateHubs(
    orrery: Orrery,
    camera: THREE.Camera,
    progress: Record<string, number>,
    scale: string,
    cognitive: boolean,
    selected: string | null,
  ): void {
    const show = cognitive && (scale === 'cosmere' || scale === 'system');
    for (const row of this.hubs) {
      const hub = hubById[row.id];
      const p = hub && isVisible(hub, progress) ? this.hubWorld(orrery, hub.id, row.pos) : null;
      const on = show && !!p;
      row.mesh.visible = on;
      row.halo.visible = on;
      row.label.visible = on;
      if (!on || !p) continue;
      row.mesh.position.copy(p);
      row.halo.position.copy(p);
      const d = camera.position.distanceTo(p);
      const s = Math.min(4.5, Math.max(0.8, d * 0.018));
      const hot = selected === row.id;
      row.mesh.scale.setScalar(s * (hot ? 1.4 : 1));
      row.halo.scale.setScalar(s * 4.5);
      const ls = Math.max(8, Math.min(80, d * 0.12));
      row.label.scale.set(ls, ls * 0.19, 1);
      row.label.position.copy(p);
      row.label.position.y += s * 2.2;
    }
    for (let i = 0; i < this.routes.length; i++) {
      const line = this.routes[i]!;
      const route = ROUTES[i];
      if (!route || !show || !isVisible(route, progress)) { line.visible = false; continue; }
      const a = orrery.systemPosition(route.from);
      const b = orrery.systemPosition(route.to);
      if (!a || !b) { line.visible = false; continue; }
      const pos = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, a.x, a.y, a.z);
      if (route.via) {
        const mid = this.hubWorld(orrery, route.via, _off);
        if (mid) {
          pos.setXYZ(1, mid.x, mid.y, mid.z);
          pos.setXYZ(2, b.x, b.y, b.z);
          line.geometry.setDrawRange(0, 3);
        } else {
          pos.setXYZ(1, b.x, b.y, b.z);
          line.geometry.setDrawRange(0, 2);
        }
      } else {
        pos.setXYZ(1, b.x, b.y, b.z);
        line.geometry.setDrawRange(0, 2);
      }
      pos.needsUpdate = true;
      line.visible = true;
      line.computeLineDistances();
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
