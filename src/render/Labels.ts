import * as THREE from 'three';
import { COSMERE, isVisible } from '../data/index.ts';
import type { Orrery } from './Orrery.ts';

interface Label {
  id: string;
  sprite: THREE.Sprite;
  kind: 'body' | 'system';
}

function makeLabel(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 96);
  ctx.font = '600 36px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export class Labels {
  readonly group = new THREE.Group();
  private readonly labels: Label[] = [];

  constructor() {
    for (const s of COSMERE.systems) {
      this.labels.push(this.make(s.id, s.name, '#9fb4d0', 'system'));
    }
    for (const b of COSMERE.bodies) {
      if (b.kind === 'gas-giant') continue;
      this.labels.push(this.make(b.id, b.name, b.color, 'body'));
    }
  }

  private make(id: string, name: string, color: string, kind: Label['kind']): Label {
    const mat = new THREE.SpriteMaterial({
      map: makeLabel(name, color),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(7.2, 1.35, 1);
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
        const s = Math.max(8, Math.min(120, dist * 0.14));
        l.sprite.scale.set(s, s * 0.19, 1);
      } else {
        const body = COSMERE.bodies.find((b) => b.id === l.id);
        const p = orrery.bodyPosition(l.id);
        if (!body || !p) { l.sprite.visible = false; continue; }
        const inScope = globe
          ? body.id === focusedBody
          : scale === 'system' && (!focusedSystem || body.system === focusedSystem);
        const dist = camera.position.distanceTo(p);
        l.sprite.visible = inScope && isVisible(body, progress) && dist < 160;
        l.sprite.position.copy(p);
        l.sprite.position.y += body.radius * 1.25 + 0.25;
        // Constant apparent size: a fixed floor turns into a billboard the
        // size of the planet once you are close enough to read one.
        const s = Math.max(0.5, Math.min(80, dist * 0.22));
        l.sprite.scale.set(s, s * 0.19, 1);
      }
    }
  }
}
