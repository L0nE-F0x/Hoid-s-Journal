import * as THREE from 'three';
import { COSMERE, inEra, isVisible, systemOnTheMap } from '../data/index.ts';
import type { Orrery } from './Orrery.ts';

interface Label {
  id: string;
  sprite: THREE.Sprite;
  kind: 'body' | 'system' | 'moon';
  visibleItem: { book?: string; arc?: string };
  radius: number;
  system?: string;
  parent?: string;
}

/**
 * A name that holds up over a nebula. A blurred shadow is not enough on a
 * bright background — these get an ink outline as well, and systems are set
 * in the same tracked caps the chrome uses.
 */
function makeLabel(text: string, color: string, kind: 'body' | 'system' | 'moon'): THREE.CanvasTexture {
  const W = 640;
  const H = 112;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  const label = kind === 'system' ? text.toUpperCase() : text;
  ctx.font = kind === 'system'
    ? '500 32px Inter, ui-sans-serif, system-ui, sans-serif'
    : '600 38px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.letterSpacing = kind === 'system' ? '5px' : '0.5px';
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

export class Labels {
  readonly group = new THREE.Group();
  private readonly labels: Label[] = [];

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
        l.sprite.position.y += 4.2;
        const s = Math.max(10, Math.min(140, dist * 0.20));
        l.sprite.scale.set(s, s * 0.175, 1);
      } else if (l.kind === 'moon') {
        const p = orrery.moonPosition(l.id);
        if (!p || !orrery.moonShown(l.id)) { l.sprite.visible = false; continue; }
        const dist = camera.position.distanceTo(p);
        l.sprite.visible = isVisible(l.visibleItem, progress) && dist < 70;
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
  }
}
