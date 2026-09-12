/**
 * One-shot sky events. The Shattering is a ring that leaves Yolen and
 * crosses the Cosmere; other beats reuse the same mesh in a different colour.
 * Nothing here is marched — it is a few sprites and a ring.
 */
import * as THREE from 'three';
import type { CosmereEvent, SkyVisual } from '../data/events.ts';

const COLOUR: Record<SkyVisual, number> = {
  shatter: 0xffe08a,
  ash: 0x94a3b8,
  storm: 0x7dd3fc,
  dawn: 0xfde68a,
};

export class EventFx {
  readonly group = new THREE.Group();
  private readonly ring: THREE.Mesh;
  private readonly flash: THREE.Sprite;
  private t = 0;
  private playing = false;
  private kind: SkyVisual = 'shatter';

  constructor() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: COLOUR.shatter,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 96), ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    this.group.add(this.ring);

    const flashMat = new THREE.SpriteMaterial({
      color: COLOUR.shatter,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.flash = new THREE.Sprite(flashMat);
    this.flash.visible = false;
    this.group.add(this.flash);
  }

  play(event: CosmereEvent, origin: THREE.Vector3): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const kind = event.visual;
    if (!kind) return;
    this.kind = kind;
    this.t = 0;
    this.playing = true;
    this.ring.position.copy(origin);
    this.flash.position.copy(origin);
    const col = COLOUR[kind];
    (this.ring.material as THREE.MeshBasicMaterial).color.setHex(col);
    (this.flash.material as THREE.SpriteMaterial).color.setHex(col);
    this.ring.visible = true;
    this.flash.visible = true;
  }

  update(dt: number): void {
    if (!this.playing) return;
    this.t += dt;
    const u = this.t / 5.2;
    if (u >= 1) {
      this.playing = false;
      this.ring.visible = false;
      this.flash.visible = false;
      return;
    }
    const ease = 1 - (1 - u) * (1 - u);
    const reach = this.kind === 'shatter' ? 210 : this.kind === 'storm' ? 90 : 70;
    this.ring.scale.setScalar(2 + ease * reach);
    (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.72 * (1 - u) * (1 - u);
    const flash = u < 0.22 ? 1 - u / 0.22 : 0;
    this.flash.scale.setScalar(6 + flash * 28);
    (this.flash.material as THREE.SpriteMaterial).opacity = flash * 0.85;
  }
}
