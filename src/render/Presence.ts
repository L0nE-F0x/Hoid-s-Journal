import * as THREE from 'three';
import { COSMERE, HUBS, bodyById, bodyByName, characterAt, hubById, isFeaturedPerson, isVisible, onTheMap } from '../data/index.ts';
import { keplerWorld } from '../layout/kepler.ts';
import { uvOnBody } from '../layout/surface.ts';
import { hubWorld } from '../layout/cognitive.ts';
import type { Orrery } from './Orrery.ts';
import { sunTexture } from './planetTextures.ts';
import sunVert from '../shaders/sun.vert';
import sunFrag from '../shaders/sun.frag';

const _off = new THREE.Vector3();

/**
 * A stable point on a sphere from a string. The same person lands in the same
 * place every frame, every era, and across reloads — a mote that wandered
 * would read as the person moving.
 */
function scatterUV(id: string): { u: number; v: number } {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const g = Math.imul(h ^ 0x9e3779b9, 2654435761) >>> 0;
  // Equal-area in latitude so a scatter does not bunch at the poles, then
  // pulled inside ±58°: nobody in the roster lives on an ice cap.
  const lat = Math.asin(((g / 4294967296) * 2 - 1) * 0.85);
  return { u: (h >>> 8) / 16777216, v: 0.5 - lat / Math.PI };
}

/** A name that stays legible at any distance. Drawn once, scaled per frame. */
function labelSprite(text: string, tint: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '600 40px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '2px';
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#0b0a16';
  ctx.fillText(text, 320, 66);
  ctx.shadowBlur = 0;
  ctx.fillStyle = tint;
  ctx.globalAlpha = 0.92;
  ctx.fillText(text, 320, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: false, depthWrite: false,
  }));
}

/**
 * Era-true character motes on their current world, and Shard lines from Yolen
 * to wherever the power sits this era.
 */
export class Presence {
  readonly group = new THREE.Group();
  private readonly chars: { id: string; mesh: THREE.Mesh; mat: THREE.ShaderMaterial; ch: (typeof COSMERE.characters)[number]; i: number }[] = [];
  /**
   * Where on a world a person stands.
   *
   * `CharacterEra` carries the body and nothing finer, so for most of the
   * roster there is no canonical spot. Two sources, in that order of honesty:
   * if a person's own See-also names a place on the world they are on, they
   * stand at its real coordinates — Dalinar at Urithiru. Otherwise they are
   * scattered from a hash of their id, which means "somewhere on this world"
   * and is not a claim about where.
   */
  private readonly placeById = new Map(COSMERE.locations.map((l) => [l.id, l]));
  private readonly knownSpot = new Map<string, { body: string; u: number; v: number }>();
  private readonly scatterSpot = new Map<string, { u: number; v: number }>();
  private readonly lines: { id: string; line: THREE.Line }[] = [];
  private readonly yolen = new THREE.Vector3();
  private readonly trail: THREE.Line;
  private readonly trailMat: THREE.LineDashedMaterial;
  private readonly stops: THREE.Mesh[] = [];
  private readonly hubs: { id: string; mesh: THREE.Mesh; halo: THREE.Sprite; label: THREE.Sprite; pos: THREE.Vector3 }[] = [];

  constructor() {
    // A person is a mote of light, not a marble. Flat discs at this size read
    // as confetti scattered over the world they are standing on.
    const quad = new THREE.PlaneGeometry(2, 2);
    for (const ch of COSMERE.characters) {
      this.scatterSpot.set(ch.id, scatterUV(ch.id));
      for (const ref of ch.see ?? []) {
        const loc = this.placeById.get(ref);
        if (loc) { this.knownSpot.set(ch.id, { body: loc.body, u: loc.u, v: loc.v }); break; }
      }
    }

    COSMERE.characters.forEach((ch, i) => {
      const colour = new THREE.Color(ch.color);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uSize: { value: 0.2 },
          uColor: { value: colour },
          uHot: { value: colour.clone().lerp(new THREE.Color(0xffffff), 0.30) },
          uTime: { value: 0 },
          uSeed: { value: Math.random() * 40 },
          uCoreRadius: { value: 0.26 },
          uFlare: { value: 0 },
          uCorona: { value: 0.5 },
          // A person is a light, not a star. Full gain blew every mote to
          // white and the streak pass smeared them across the frame.
          uGain: { value: 0.30 },
        },
        vertexShader: sunVert,
        fragmentShader: sunFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(quad, mat);
      mesh.userData = { kind: 'character', id: ch.id };
      this.group.add(mesh);
      this.chars.push({ id: ch.id, mesh, mat, ch, i });
    });

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

    const hubGeo: Record<string, THREE.BufferGeometry> = {
      city: new THREE.OctahedronGeometry(0.8, 0),
      fortress: new THREE.CylinderGeometry(0.34, 0.62, 1.5, 6),
      port: new THREE.ConeGeometry(0.62, 1.1, 5),
      pool: new THREE.TorusGeometry(0.62, 0.20, 8, 20),
      anomaly: new THREE.IcosahedronGeometry(0.8, 0),
      nexus: new THREE.OctahedronGeometry(0.8, 1),
    };
    for (const hub of HUBS) {
      const geometry = hubGeo[hub.kind] ?? hubGeo.city!;
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: hub.color, transparent: true, opacity: 0.95,
      }));
      if (hub.kind === 'pool') mesh.rotation.x = Math.PI / 2;
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sunTexture(hub.color),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }));
      const label = labelSprite(hub.name, hub.color);
      mesh.visible = false;
      halo.visible = false;
      label.visible = false;
      this.group.add(mesh, halo, label);
      this.hubs.push({ id: hub.id, mesh, halo, label, pos: new THREE.Vector3() });
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

  /** World position of a visible person, for picking the light itself. */
  positionOf(id: string): THREE.Vector3 | null {
    const row = this.chars.find((c) => c.id === id);
    if (!row?.mesh.visible) return null;
    return row.mesh.position;
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
    focusedSystem: string | null = null,
  ): void {
    // Labels and pins set group.visible every frame. This group was only
    // ever turned off (Spiritual hides it from App) and never on again, so
    // a visit to the Spiritual Realm left Shadesmar with roads and no cities.
    this.group.visible = true;
    const yolenPos = orrery.bodyPosition('yolen') ?? this.yolen;
    this.updateTrail(orrery, camera, progress, scale, selected);
    this.updateHubs(orrery, camera, progress, scale, cognitive, selected, focusedSystem, era);

    // On a surface scan the pins are the subject; a swarm of people-dots at
    // the same apparent size just competes with them.
    const motesOn = showCharacters && scale !== 'surface' && scale !== 'city' && scale !== 'cosmere';
    for (const row of this.chars) {
      const ch = row.ch;
      if (!motesOn || !isVisible(ch, progress) || !isFeaturedPerson(ch.id)) {
        row.mesh.visible = false;
        continue;
      }
      const at = characterAt(ch, era, progress);
      const bodyId = at?.body;
      const origin = bodyId ? orrery.bodyPosition(bodyId) : null;
      const body = bodyId ? bodyById[bodyId] : undefined;
      if (!origin || !body) { row.mesh.visible = false; continue; }
      if (scale === 'system' && focusedSystem && body.system !== focusedSystem) {
        row.mesh.visible = false;
        continue;
      }
      row.mesh.visible = true;
      // On the world, not in a halo around it. People used to ride a ring at
      // 1.55 radii that span with the playhead, which read as moons rather
      // than as anyone standing anywhere. Same convention as the surface pins
      // — `layout/surface.ts` matches SphereGeometry, and the spot rides the
      // body's own rotation so a person does not slide as the globe turns.
      const placed = at?.at ? this.placeById.get(at.at) : undefined;
      const known = this.knownSpot.get(ch.id);
      const spot = placed && placed.body === body.id
        ? placed
        : known && known.body === body.id
          ? known
          : this.scatterSpot.get(ch.id)!;
      uvOnBody(spot.u, spot.v, body.radius * 1.015, orrery.bodySpin(body.id), _off);
      row.mesh.position.copy(origin).add(_off);
      // A mote is a marker, not a world: hold it at a few pixels across, and
      // never let one grow past a fraction of the body it is standing on. The
      // screen-size term alone capped at 0.62 world units, which against
      // Roshar's radius of 1.32 made every person half the size of the planet.
      const d = camera.position.distanceTo(row.mesh.position);
      const s = Math.min(Math.min(0.62, Math.max(0.10, d * 0.030)), body.radius * 0.048);
      // In Shadesmar the cognitive ones are the locals; bodies are shadows.
      const here = !cognitive || ch.cognitive;
      row.mat.uniforms.uSize.value = s * (ch.cognitive ? 1.35 : 1) * (here ? 1 : 0.6);
      row.mat.uniforms.uTime.value = year;
      row.mat.uniforms.uCorona.value = here ? 0.55 : 0.2;
      row.mat.uniforms.uGain.value = here ? 0.30 : 0.12;
    }

    const linesOn = showShardLines && era > 0 && (scale === 'cosmere' || scale === 'system');
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
    return row?.mesh.visible ? row.pos : undefined;
  }

  private hubWorld(orrery: Orrery, id: string, into: THREE.Vector3): THREE.Vector3 | null {
    return hubWorld(id, (sys) => orrery.systemPosition(sys), into);
  }

  /**
   * The Cognitive sites: only in Shadesmar, and only at a distance where a
   * city between stars can still read as a city. A site anchored to one
   * system shows up as soon as you are in that system; the ones that belong
   * to no world are visible from anywhere in the sky.
   */
  private updateHubs(
    orrery: Orrery,
    camera: THREE.Camera,
    progress: Record<string, number>,
    scale: string,
    cognitive: boolean,
    selected: string | null,
    focusedSystem: string | null,
    era: number,
  ): void {
    const show = cognitive && scale !== 'city';
    for (const row of this.hubs) {
      const hub = hubById[row.id];
      const p = hub && onTheMap(hub, progress, era) ? this.hubWorld(orrery, hub.id, row.pos) : null;
      // Cosmere-famous sites (Silverlight, the Grand Knell, the Expanses) stay
      // up when you change scale. A pool beside one world waits until you are
      // in that system.
      const local = hub?.kind === 'pool' && !!hub.system;
      const inSystem = !hub?.system || scale === 'cosmere' || hub.system === focusedSystem;
      const near = !local || scale === 'system' || (scale === 'globe' && inSystem)
        || camera.position.distanceTo(row.pos) < 180;
      const on = show && !!p && inSystem && near;
      row.mesh.visible = on;
      row.halo.visible = on;
      row.label.visible = on;
      if (!on || !p) continue;
      row.mesh.position.copy(p);
      row.halo.position.copy(p);
      const d = camera.position.distanceTo(p);
      const s = Math.min(4.5, Math.max(0.8, d * (local ? 0.011 : 0.018)));
      const hot = selected === row.id;
      row.mesh.scale.setScalar(s * (hot ? 1.4 : 1));
      row.mesh.rotation.y += 0.004;
      row.halo.scale.setScalar(s * (hub?.kind === 'anomaly' ? 6.5 : 4.5));
      (row.halo.material as THREE.SpriteMaterial).opacity =
        (hot ? 0.85 : 0.5) * (hub?.kind === 'pool' ? 1.25 : 1);
      const ls = Math.max(local ? 14 : 10, Math.min(80, d * (local ? 0.13 : 0.12)));
      row.label.scale.set(ls, ls * 0.2, 1);
      row.label.position.copy(p);
      row.label.position.y += s * 2.2;
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
