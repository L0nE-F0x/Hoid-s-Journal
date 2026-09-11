import * as THREE from 'three';
import { COSMERE } from '../data/index.ts';

/**
 * Spiritual Realm is not a map. Sixteen motes around a unity core;
 * pre-Shattering, a single Adonalsium.
 */
export class Spiritual {
  readonly group = new THREE.Group();
  private readonly motes: THREE.Mesh[] = [];
  private readonly core: THREE.Mesh;
  private readonly words: THREE.Sprite[] = [];

  constructor() {
    const coreGeo = new THREE.SphereGeometry(2.4, 32, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffe9c2,
      transparent: true,
      opacity: 0.95,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.core);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      color: 0xffc070,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.7,
    }));
    glow.scale.setScalar(14);
    this.group.add(glow);

    for (let i = 0; i < COSMERE.shards.length; i++) {
      const sh = COSMERE.shards[i]!;
      const geo = new THREE.SphereGeometry(0.42, 16, 12);
      const mat = new THREE.MeshBasicMaterial({ color: sh.color });
      const mesh = new THREE.Mesh(geo, mat);
      this.group.add(mesh);
      this.motes.push(mesh);
    }

    for (const word of ['CONNECTION', 'FORTUNE', 'IDENTITY', 'INVESTITURE']) {
      this.words.push(this.wordSprite(word));
    }
    this.group.visible = false;
  }

  private wordSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '500 28px Inter, ui-sans-serif, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(186, 214, 255, 0.55)';
    ctx.fillText(text, 256, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    spr.scale.set(18, 2.2, 1);
    this.group.add(spr);
    return spr;
  }

  update(time: number, era: number, visible: boolean): void {
    this.group.visible = visible;
    if (!visible) return;
    const whole = era <= 0;
    this.core.scale.setScalar(whole ? 3.2 : 1.6);
    for (let i = 0; i < this.motes.length; i++) {
      const mesh = this.motes[i]!;
      mesh.visible = !whole;
      const a = time * 0.15 + (i / this.motes.length) * Math.PI * 2;
      const r = 8.5;
      mesh.position.set(Math.cos(a) * r, Math.sin(a * 0.7) * 1.4, Math.sin(a) * r);
    }
    this.words.forEach((w, i) => {
      const a = time * 0.08 + i * 1.1;
      w.position.set(Math.cos(a) * 16, (i - 1.5) * 3.5, Math.sin(a) * 16);
    });
  }
}
