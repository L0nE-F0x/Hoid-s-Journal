import * as THREE from 'three';
import { COSMERE, bodyById, isVisible } from '../data/index.ts';
import { uvOnBody } from '../layout/surface.ts';
import type { Orrery } from './Orrery.ts';

const _off = new THREE.Vector3();

/** A map marker: bright core, dark ring, so it reads on any terrain. */
function markerTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(32, 32, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(5,6,13,0.55)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(5,6,13,0.9)';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(32, 32, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function labelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '600 34px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#eaf4ff';
  ctx.fillText(text, 256, 48);
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Location markers on the focused globe. They are the same rows the atlas
 * panel draws, so a pin on the map and a pin on the world are one place.
 */
export class Pins {
  readonly group = new THREE.Group();
  private readonly markers: THREE.Sprite[] = [];

  private readonly label: THREE.Sprite;
  private labelId: string | null = null;

  constructor() {
    const map = markerTexture();
    for (const loc of COSMERE.locations) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map,
        color: new THREE.Color(loc.color),
        transparent: true,
      }));
      sprite.userData = { kind: 'location', id: loc.id, body: loc.body };
      this.group.add(sprite);
      this.markers.push(sprite);
    }

    this.label = new THREE.Sprite(new THREE.SpriteMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }));
    this.label.visible = false;
    this.group.add(this.label);
  }

  update(
    orrery: Orrery,
    camera: THREE.Camera,
    progress: Record<string, number>,
    focusedBody: string | null,
    scale: string,
    hot: string | null,
  ): void {
    const show = scale === 'globe' || scale === 'surface' || scale === 'city';
    this.group.visible = show;
    if (!show) return;

    let hotPos: THREE.Vector3 | null = null;
    let hotName: string | null = null;

    for (const sprite of this.markers) {
      const loc = COSMERE.locations.find((l) => l.id === sprite.userData.id);
      if (!loc) { sprite.visible = false; continue; }
      const body = bodyById[loc.body];
      const origin = orrery.bodyPosition(loc.body);
      const vis = !!body && !!origin && isVisible(loc, progress) &&
        (!focusedBody || focusedBody === loc.body);
      sprite.visible = vis;
      if (!vis || !body || !origin) continue;
      uvOnBody(loc.u, loc.v, body.radius * 1.015, orrery.bodySpin(loc.body), _off);
      sprite.position.copy(origin).add(_off);
      // Constant apparent size, so a pin stays a pin at every distance.
      const d = camera.position.distanceTo(sprite.position);
      const isHot = loc.id === hot;
      sprite.scale.setScalar(Math.min(1.2, Math.max(0.03, d * 0.017)) * (isHot ? 1.7 : 1));
      if (isHot) {
        hotPos = sprite.position;
        hotName = loc.name;
      }
    }

    if (hotName && hotPos) {
      if (this.labelId !== hot) {
        this.labelId = hot;
        const mat = this.label.material as THREE.SpriteMaterial;
        mat.map?.dispose();
        mat.map = labelTexture(hotName);
        mat.needsUpdate = true;
      }
      const d = camera.position.distanceTo(hotPos);
      const s = Math.max(0.2, Math.min(14, d * 0.26));
      this.label.scale.set(s, s * 0.19, 1);
      this.label.position.copy(hotPos);
      this.label.position.y += s * 0.13 + d * 0.012;
      this.label.visible = true;
    } else {
      this.label.visible = false;
    }
  }
}
