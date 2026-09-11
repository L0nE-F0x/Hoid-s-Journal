import * as THREE from 'three';
import { COSMERE, isVisible } from '../data/index.ts';
import type { Orrery } from './Orrery.ts';

interface Label {
  id: string;
  sprite: THREE.Sprite;
  kind: 'body' | 'system';
}

/**
 * A name that holds up over a nebula. A blurred shadow is not enough on a
 * bright background — these get an ink outline as well, and systems are set
 * in the same tracked caps the chrome uses.
 */
function makeLabel(text: string, color: string, kind: 'body' | 'system'): THREE.CanvasTexture {
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
      this.labels.push(this.make(s.id, s.name, '#cdd8ea', 'system'));
    }
    for (const b of COSMERE.bodies) {
      if (b.kind === 'gas-giant') continue;
      this.labels.push(this.make(b.id, b.name, b.color, 'body'));
    }
  }

  private make(id: string, name: string, color: string, kind: Label['kind']): Label {
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
    return { id, sprite, kind };
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
  ): void {
    this.group.visible = show;
    if (!show) return;
    const globe = scale === 'globe' || scale === 'surface' || scale === 'city';
    for (const l of this.labels) {
      if (l.kind === 'system') {
        const sys = COSMERE.systems.find((s) => s.id === l.id);
        const p = orrery.systemPosition(l.id);
        if (!sys || !p || scale !== 'cosmere') { l.sprite.visible = false; continue; }
        const dist = camera.position.distanceTo(p);
        l.sprite.visible = isVisible(sys, progress);
        l.sprite.position.copy(p);
        l.sprite.position.y += 4.2;
        const s = Math.max(10, Math.min(140, dist * 0.20));
        l.sprite.scale.set(s, s * 0.175, 1);
      } else {
        const body = COSMERE.bodies.find((b) => b.id === l.id);
        const p = orrery.bodyPosition(l.id);
        if (!body || !p) { l.sprite.visible = false; continue; }
        // On a surface scan the place has the name; the world's own label just
        // rides off the top of the frame.
        const inScope = globe
          ? body.id === focusedBody && scale === 'globe'
          : scale === 'system' && (!focusedSystem || body.system === focusedSystem);
        const dist = camera.position.distanceTo(p);
        l.sprite.visible = inScope && isVisible(body, progress) && dist < 160;
        l.sprite.position.copy(p);
        l.sprite.position.y += body.radius * 1.25 + 0.25;
        // Constant apparent size: a fixed floor turns into a billboard the
        // size of the planet once you are close enough to read one.
        const s = Math.max(0.5, Math.min(80, dist * 0.22));
        l.sprite.scale.set(s, s * 0.175, 1);
      }
    }
  }
}
