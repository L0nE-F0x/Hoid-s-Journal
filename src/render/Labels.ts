import * as THREE from 'three';
import { COSMERE, inEra, isVisible, systemExtent, systemOnTheMap } from '../data/index.ts';
import type { Orrery } from './Orrery.ts';
import { SCAR_DIR } from './Starfield.ts';

interface Label {
  id: string;
  sprite: THREE.Sprite;
  kind: 'body' | 'system' | 'moon' | 'belt' | 'star' | 'scar';
  visibleItem: { book?: string; arc?: string };
  radius: number;
  system?: string;
  parent?: string;
  /** Belts only: the middle of the band, in system-local units. */
  band?: number;
}

/**
 * A name that holds up over a nebula. A blurred shadow is not enough on a
 * bright background — these get an ink outline as well, and systems are set
 * in the same tracked caps the chrome uses.
 */
function makeLabel(text: string, color: string, kind: Label['kind']): THREE.CanvasTexture {
  const W = 640;
  const H = 112;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  // Systems and the stars inside them share the chrome's tracked caps; the
  // worlds, moons and belts that orbit them are set like names.
  const caps = kind === 'system' || kind === 'star';
  const label = caps ? text.toUpperCase() : text;
  ctx.font = caps
    ? '500 32px Inter, ui-sans-serif, system-ui, sans-serif'
    : '600 38px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.letterSpacing = caps ? '5px' : '0.5px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(2,3,8,0.92)';
  ctx.shadowBlur = 16;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(2,3,8,0.88)';
  ctx.strokeText(label, W / 2, H / 2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillText(label, W / 2, H / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * A margin note, not a system name. Tracked caps, a short rule, no outline
 * heavy enough to compete with the worlds.
 */
function makeScarLabel(): THREE.CanvasTexture {
  const W = 640;
  const H = 96;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  const label = "TALN'S SCAR";
  ctx.font = '500 30px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.letterSpacing = '7px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(2,3,8,0.8)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(232, 210, 204, 0.94)';
  ctx.fillText(label, W / 2, H / 2 - 6);
  ctx.shadowBlur = 0;
  const ink = ctx.measureText(label).width;
  ctx.strokeStyle = 'rgba(196, 140, 128, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - ink * 0.22, H / 2 + 18);
  ctx.lineTo(W / 2 + ink * 0.22, H / 2 + 18);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** A label's ink box in NDC, used to keep two names off each other. */
interface Box { x: number; y: number; hw: number; hh: number; d: number; l: Label }

const _p = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _edge = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _toCentre = new THREE.Vector3();

/**
 * Is `target` hidden behind the sphere at `centre`, seen from `eye`?
 *
 * Label sprites are `depthTest: false` — they have to be, or a name is eaten
 * by the very thing it names — so nothing else stops a moon on the far side
 * of Roshar from writing "Salas" across the middle of the planet.
 */
function occluded(
  eye: THREE.Vector3, target: THREE.Vector3, centre: THREE.Vector3, radius: number,
): boolean {
  _toTarget.copy(target).sub(eye);
  const dist = _toTarget.length();
  if (dist < 1e-6) return false;
  _toTarget.multiplyScalar(1 / dist);
  _toCentre.copy(centre).sub(eye);
  const tca = _toCentre.dot(_toTarget);
  if (tca <= 0) return false;
  const d2 = _toCentre.lengthSq() - tca * tca;
  const r2 = radius * radius;
  if (d2 > r2) return false;
  const t0 = tca - Math.sqrt(r2 - d2);
  return t0 > 0 && t0 < dist;
}

export class Labels {
  readonly group = new THREE.Group();
  private readonly labels: Label[] = [];
  private readonly boxes: Box[] = [];
  private readonly scar: Label;

  constructor() {
    for (const s of COSMERE.systems) {
      this.labels.push(this.make(s.id, s.name, '#cdd8ea', 'system', s, 0));
    }
    for (const b of COSMERE.bodies) {
      this.labels.push(this.make(b.id, b.name, b.color, 'body', b, b.radius, b.system));
    }
    for (const m of COSMERE.moons) {
      const parent = COSMERE.bodies.find((b) => b.id === m.parent);
      this.labels.push(this.make(m.id, m.name, m.color, 'moon', m, m.radius, parent?.system, m.parent));
    }
    for (const b of COSMERE.belts) {
      const label = this.make(b.id, b.name, b.color, 'belt', b, 0, b.system);
      label.band = (b.inner + b.outer) * 0.5;
      this.labels.push(label);
    }
    // Canon names three stars: Mashe over Sel, and Taldain's AisDa and the
    // Eye of Ridos. Inside a system the star is the thing everything else is
    // going round, and it was the one body in the frame with no name on it.
    for (const s of COSMERE.systems) {
      if (s.starName) {
        this.labels.push(this.make(`star:${s.id}`, s.starName, s.sunColor, 'star',
          { book: s.book }, 0, s.id));
      }
      for (const c of s.companions ?? []) {
        this.labels.push(this.make(c.id, c.name, c.color, 'star', { book: s.book }, 0, s.id));
      }
    }
    const scarMat = new THREE.SpriteMaterial({
      map: makeScarLabel(),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const scarSprite = new THREE.Sprite(scarMat);
    scarSprite.visible = false;
    scarSprite.userData = { kind: 'scar', id: 'talns-scar' };
    this.group.add(scarSprite);
    this.scar = {
      id: 'talns-scar', sprite: scarSprite, kind: 'scar',
      visibleItem: { book: 'core' }, radius: 0,
    };
  }

  private make(
    id: string, name: string, color: string, kind: Label['kind'],
    visibleItem: { book?: string; arc?: string },
    radius: number,
    system?: string,
    parent?: string,
  ): Label {
    const mat = new THREE.SpriteMaterial({
      map: makeLabel(name, color, kind),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(7.2, 1.26, 1);
    sprite.userData = { kind, id };
    this.group.add(sprite);
    return { id, sprite, kind, visibleItem, radius, system, parent };
  }

  /**
   * One name per scale: systems out at Cosmere distance, planets inside a
   * system, and on a globe only the world you are actually reading. Location
   * names belong to the pins.
   */
  update(
    orrery: Orrery,
    camera: THREE.Camera,
    progress: Record<string, number>,
    show: boolean,
    scale: string,
    focusedSystem: string | null,
    focusedBody: string | null,
    era = 3,
  ): void {
    this.group.visible = show;
    if (!show) return;
    const globe = scale === 'globe' || scale === 'surface' || scale === 'city';
    for (const l of this.labels) {
      if (l.kind === 'system') {
        const p = orrery.systemPosition(l.id);
        if (!p || scale !== 'cosmere') { l.sprite.visible = false; continue; }
        const dist = camera.position.distanceTo(p);
        l.sprite.visible = systemOnTheMap(l.id, progress, era);
        l.sprite.position.copy(p);
        // Clear the system's own glow. A flat +4.2 put the name inside a cloud
        // some twenty-six units across, so every system was labelled through
        // its own light.
        l.sprite.position.y += systemExtent(l.id) * 0.62 + 4.2;
        const s = Math.max(10, Math.min(140, dist * 0.20));
        l.sprite.scale.set(s, s * 0.175, 1);
      } else if (l.kind === 'star') {
        const primary = l.id.startsWith('star:');
        const p = primary
          ? (l.system ? orrery.systemPosition(l.system) : undefined)
          : orrery.companionPosition(l.id);
        const on = !!p && scale === 'system' && focusedSystem === l.system
          && isVisible(l.visibleItem, progress);
        l.sprite.visible = on;
        if (!on || !p) continue;
        const dist = camera.position.distanceTo(p);
        l.sprite.position.copy(p);
        // Under the star, clear of the corona rather than inside it.
        l.sprite.position.y -= dist * (primary ? 0.085 : 0.045);
        const s = Math.max(1.4, Math.min(30, dist * 0.14));
        l.sprite.scale.set(s, s * 0.175, 1);
      } else if (l.kind === 'belt') {
        // A band has no one place to be named, so the name rides the lip of
        // it nearest the camera and stays legible from any angle.
        const centre = l.system ? orrery.systemPosition(l.system) : undefined;
        if (!centre || !orrery.beltShown(l.id)) { l.sprite.visible = false; continue; }
        _edge.copy(camera.position).sub(centre);
        _edge.y = 0;
        if (_edge.lengthSq() < 1e-6) _edge.set(1, 0, 0);
        _edge.normalize().multiplyScalar(l.band ?? 1);
        l.sprite.position.copy(centre).add(_edge);
        const dist = camera.position.distanceTo(l.sprite.position);
        l.sprite.visible = isVisible(l.visibleItem, progress);
        const s = Math.max(1.2, Math.min(28, dist * 0.13));
        l.sprite.scale.set(s, s * 0.175, 1);
      } else if (l.kind === 'moon') {
        const p = orrery.moonPosition(l.id);
        if (!p || !orrery.moonShown(l.id)) { l.sprite.visible = false; continue; }
        const dist = camera.position.distanceTo(p);
        let on = isVisible(l.visibleItem, progress) && dist < 70;
        // Not if the moon is round the back of its own world.
        if (on && l.parent) {
          const centre = orrery.bodyPosition(l.parent);
          const body = COSMERE.bodies.find((b) => b.id === l.parent);
          if (centre && body && occluded(camera.position, p, centre, body.radius)) on = false;
        }
        l.sprite.visible = on;
        l.sprite.position.copy(p);
        l.sprite.position.y += l.radius * 1.4 + 0.18;
        const s = Math.max(0.4, Math.min(36, dist * 0.18));
        l.sprite.scale.set(s, s * 0.175, 1);
      } else {
        const p = orrery.bodyPosition(l.id);
        if (!p) { l.sprite.visible = false; continue; }
        // On a surface scan the place has the name; the world's own label just
        // rides off the top of the frame. Gas giants keep a name in-system.
        const inScope = globe
          ? l.id === focusedBody && scale === 'globe'
          : scale === 'system' && (!focusedSystem || l.system === focusedSystem);
        const dist = camera.position.distanceTo(p);
        const body = COSMERE.bodies.find((b) => b.id === l.id);
        const close = dist < (body?.kind === 'gas-giant' ? 90 : 160);
        l.sprite.visible = inScope && isVisible(l.visibleItem, progress)
          && (!body || inEra(body, era)) && close;
        l.sprite.position.copy(p);
        l.sprite.position.y += l.radius * 1.25 + 0.25;
        const s = Math.max(0.5, Math.min(80, dist * 0.22));
        l.sprite.scale.set(s, s * 0.175, 1);
      }
    }
    // Systems at Cosmere distance, moons over a globe. Both are cases where a
    // handful of names project into the same few pixels; the difference is
    // that a system's neighbour is light years away and a moon's is one world
    // over, so the same test does for both.
    if (scale === 'cosmere') this.declutter(camera, 'system');
    else if (globe) this.declutter(camera, 'moon');
    this.placeScar(camera, scale);
  }

  /**
   * The name sits just above the rip, in screen space, and yields if a
   * system's own name already occupies that patch of sky.
   */
  private placeScar(camera: THREE.Camera, scale: string): void {
    const l = this.scar;
    if (scale !== 'cosmere') { l.sprite.visible = false; return; }
    camera.matrixWorld.extractBasis(_right, _up, _fwd);
    _p.copy(SCAR_DIR).multiplyScalar(1080);
    _edge.copy(_p).project(camera);
    // Off the frame, or behind the camera: the rip is not in this view.
    if (_edge.z >= 1 || Math.abs(_edge.x) > 1.05 || Math.abs(_edge.y) > 1.05) {
      l.sprite.visible = false;
      return;
    }
    // Just under the ribbon, unless that would leave the frame, in which
    // case it sits just over it. The rip is only a few degrees wide.
    const under = _edge.y - 0.07 > -0.86;
    l.sprite.position.copy(_p).addScaledVector(_up, 1080 * (under ? -0.075 : 0.075));
    _edge.copy(l.sprite.position).project(camera);
    const dist = camera.position.distanceTo(l.sprite.position);
    // The rip is out with the starfield, far past the systems, so a scale
    // that suits a nearby world would make this name a speck. Hold it at a
    // small constant size on the screen.
    const s = dist * 0.11;
    l.sprite.scale.set(s, s * (96 / 640), 1);
    l.sprite.visible = true;
    const halfW = l.sprite.scale.x * 0.28;
    const halfH = l.sprite.scale.y * 0.55;
    _toTarget.copy(l.sprite.position).addScaledVector(_right, halfW).project(camera);
    const hw = Math.abs(_toTarget.x - _edge.x);
    _toTarget.copy(l.sprite.position).addScaledVector(_up, halfH).project(camera);
    const hh = Math.abs(_toTarget.y - _edge.y);
    for (const other of this.labels) {
      if (other.kind !== 'system' || !other.sprite.visible) continue;
      _toCentre.copy(other.sprite.position).project(camera);
      const ohw = other.sprite.scale.x * 0.21;
      const ohh = other.sprite.scale.y * 0.55;
      _p.copy(other.sprite.position).addScaledVector(_right, ohw).project(camera);
      const ow = Math.abs(_p.x - _toCentre.x);
      _p.copy(other.sprite.position).addScaledVector(_up, ohh).project(camera);
      const oh = Math.abs(_p.y - _toCentre.y);
      if (Math.abs(_edge.x - _toCentre.x) < hw + ow && Math.abs(_edge.y - _toCentre.y) < hh + oh) {
        l.sprite.visible = false;
        return;
      }
    }
  }

  /**
   * Two systems hundreds of units apart can still project a few pixels apart,
   * and NALTHIAN drawn through OBRODAI is not a name either of them can be
   * read by. Project each label's ink box, walk them near-to-far, and drop the
   * ones that would land on a name already standing. The nearest wins, because
   * that is the one the reader is flying toward.
   */
  private declutter(camera: THREE.Camera, kind: Label['kind']): void {
    const boxes = this.boxes;
    boxes.length = 0;
    camera.matrixWorld.extractBasis(_right, _up, _fwd);
    for (const l of this.labels) {
      if (l.kind !== kind || !l.sprite.visible) continue;
      _p.copy(l.sprite.position).project(camera);
      if (_p.z >= 1) { l.sprite.visible = false; continue; }
      // The word is centred in a 640-wide plate and never fills it, so the ink
      // is a fraction of the sprite. Measure along the camera's own axes,
      // because a sprite always faces the viewer.
      const halfW = l.sprite.scale.x * 0.21;
      const halfH = l.sprite.scale.y * 0.55;
      _edge.copy(l.sprite.position).addScaledVector(_right, halfW).project(camera);
      const hw = Math.abs(_edge.x - _p.x);
      _edge.copy(l.sprite.position).addScaledVector(_up, halfH).project(camera);
      const hh = Math.abs(_edge.y - _p.y);
      boxes.push({
        x: _p.x, y: _p.y, hw, hh, l,
        d: camera.position.distanceToSquared(l.sprite.position),
      });
    }
    boxes.sort((a, b) => a.d - b.d);
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i]!;
      for (let j = 0; j < i; j++) {
        const b = boxes[j]!;
        if (!b.l.sprite.visible) continue;
        if (Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh) {
          a.l.sprite.visible = false;
          break;
        }
      }
    }
  }
}
