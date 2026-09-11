import * as THREE from 'three';
import { COSMERE, isVisible } from '../data/index.ts';
import { sunTexture } from './planetTextures.ts';

const RING = 17;
const AXIS_RING = 27;
/** Half-extent of the whole diagram, for framing. */
export const SPIRITUAL_RADIUS = 27;

const AXES = ['CONNECTION', 'FORTUNE', 'IDENTITY'];

function textSprite(text: string, color: string, size: number, weight = 500): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${weight} ${size}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: false, depthWrite: false,
  }));
}

interface Mote {
  id: string;
  mesh: THREE.Mesh;
  halo: THREE.Sprite;
  label: THREE.Sprite;
  pos: THREE.Vector3;
}

/**
 * The Spiritual Realm is not a map, so this is a diagram: a unity core, the
 * sixteen Shards around it, and the three axes the Realm is actually made of.
 * Before the Shattering there is one whole thing and no ring at all.
 */
export class Spiritual {
  readonly group = new THREE.Group();

  private readonly motes: Mote[] = [];
  private readonly core: THREE.Mesh;
  private readonly coreGlow: THREE.Sprite;
  private readonly coreLabel: THREE.Sprite;
  private readonly axes: { sprite: THREE.Sprite; line: THREE.Line }[] = [];
  private readonly bond: THREE.Line;
  private readonly worldChip: THREE.Sprite;
  private worldChipKey = '';

  constructor() {
    this.core = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff0d2, transparent: true, opacity: 0.95 }),
    );
    this.group.add(this.core);

    this.coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sunTexture('#ffd9a0'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.6,
    }));
    this.group.add(this.coreGlow);

    this.coreLabel = textSprite('ADONALSIUM', 'rgba(255,238,205,0.92)', 40, 600);
    this.group.add(this.coreLabel);

    for (const sh of COSMERE.shards) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 14),
        new THREE.MeshBasicMaterial({ color: sh.color, transparent: true, opacity: 0.95 }),
      );
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sunTexture(sh.color),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }));
      const label = textSprite(sh.name.toUpperCase(), 'rgba(226,238,255,0.85)', 34);
      this.group.add(mesh, halo, label);
      this.motes.push({ id: sh.id, mesh, halo, label, pos: new THREE.Vector3() });
    }

    for (let i = 0; i < AXES.length; i++) {
      const sprite = textSprite(AXES[i]!, 'rgba(150,180,225,0.62)', 30);
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0x6f8fc4, transparent: true, opacity: 0.22,
      }));
      this.group.add(sprite, line);
      this.axes.push({ sprite, line });
    }

    this.bond = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.85 }),
    );
    this.bond.visible = false;
    this.group.add(this.bond);
    this.worldChip = textSprite('', 'rgba(226,238,255,0.9)', 32, 600);
    this.worldChip.visible = false;
    this.group.add(this.worldChip);

    this.group.visible = false;
  }

  /** Where a Shard's mote is standing right now, for picking. */
  motePosition(id: string): THREE.Vector3 | undefined {
    return this.motes.find((m) => m.id === id)?.pos;
  }

  update(
    time: number,
    era: number,
    visible: boolean,
    camera: THREE.Camera,
    progress: Record<string, number>,
    selected: string | null,
  ): void {
    this.group.visible = visible;
    if (!visible) return;

    // Distance-invariant text: the reader may fly anywhere in here.
    const apparent = (at: THREE.Vector3, k: number) =>
      Math.max(0.6, camera.position.distanceTo(at) * k);

    const whole = era <= 0;
    const spin = time * 0.06;

    this.core.scale.setScalar(whole ? 3.4 : 1.5);
    this.coreGlow.scale.setScalar(whole ? 22 : 8);
    this.coreLabel.visible = whole;
    if (whole) {
      const s = apparent(this.core.position, 0.05);
      this.coreLabel.scale.set(s * 4, s, 1);
      this.coreLabel.position.set(0, 6.5, 0);
    }

    for (let i = 0; i < this.motes.length; i++) {
      const mote = this.motes[i]!;
      const sh = COSMERE.shards[i]!;
      const seen = isVisible(sh, progress);
      const show = !whole && seen;
      mote.mesh.visible = show;
      mote.halo.visible = show;
      mote.label.visible = show;
      if (!show) continue;

      const a = spin + (i / this.motes.length) * Math.PI * 2;
      mote.pos.set(Math.cos(a) * RING, Math.sin(a * 2) * 2.2, Math.sin(a) * RING);
      mote.mesh.position.copy(mote.pos);
      mote.halo.position.copy(mote.pos);

      const row = sh.eras.find((e) => e.era === era) ?? sh.eras[sh.eras.length - 1];
      const status = row?.status ?? 'whole';
      const hot = selected === sh.id;
      // A Splintered Shard is still there, just not a single thing any more.
      const size = status === 'splintered' ? 0.5 : status === 'merged' ? 1.25 : 1;
      mote.mesh.scale.setScalar(size * (hot ? 1.5 : 1));
      (mote.mesh.material as THREE.MeshBasicMaterial).opacity =
        status === 'splintered' ? 0.42 : 0.95;
      mote.halo.scale.setScalar(size * (hot ? 8 : 5.5));
      (mote.halo.material as THREE.SpriteMaterial).opacity =
        status === 'splintered' ? 0.22 : hot ? 0.8 : 0.5;

      // Labels fan outward from the core, so a ring of sixteen names stays
      // legible where the ring foreshortens.
      const s = apparent(mote.pos, 0.034);
      mote.label.scale.set(s * 4, s, 1);
      mote.label.position.set(
        Math.cos(a) * (RING + 3.2 + s * 1.6),
        mote.pos.y + size * 1.1 + s * 0.5,
        Math.sin(a) * (RING + 3.2 + s * 1.6),
      );
    }

    for (let i = 0; i < this.axes.length; i++) {
      const { sprite, line } = this.axes[i]!;
      const a = -spin * 0.5 + (i / this.axes.length) * Math.PI * 2;
      const x = Math.cos(a) * AXIS_RING;
      const z = Math.sin(a) * AXIS_RING;
      const y = (i - 1) * 4.5;
      sprite.position.set(x, y, z);
      const s = apparent(sprite.position, 0.04);
      sprite.scale.set(s * 4, s, 1);
      const pos = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, 0, 0, 0);
      pos.setXYZ(1, x * 0.94, y * 0.94, z * 0.94);
      pos.needsUpdate = true;
      line.geometry.computeBoundingSphere();
      sprite.visible = !whole;
      line.visible = !whole;
    }

    // A selected Shard draws Connection: a line to the core, and the world
    // it sits on this era — so the axes are not only labels.
    const picked = selected ? this.motes.find((m) => m.id === selected) : undefined;
    const sh = picked ? COSMERE.shards.find((s) => s.id === picked.id) : undefined;
    if (!whole && picked && sh && picked.mesh.visible) {
      const pos = this.bond.geometry.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, 0, 0, 0);
      pos.setXYZ(1, picked.pos.x, picked.pos.y, picked.pos.z);
      pos.needsUpdate = true;
      this.bond.geometry.computeBoundingSphere();
      this.bond.visible = true;
      (this.bond.material as THREE.LineBasicMaterial).color.set(sh.color);
      const row = sh.eras.find((e) => e.era === era) ?? sh.eras[sh.eras.length - 1];
      const where = row?.loc ?? sh.world;
      this.worldChip.visible = true;
      const key = `${sh.id}:${where}`;
      if (this.worldChipKey !== key) {
        this.worldChipKey = key;
        const mat = this.worldChip.material as THREE.SpriteMaterial;
        const chip = textSprite(where.toUpperCase(), sh.color, 30, 600);
        const next = (chip.material as THREE.SpriteMaterial).map;
        mat.map = next;
        mat.needsUpdate = true;
      }
      const s = apparent(picked.pos, 0.04);
      this.worldChip.scale.set(s * 5.2, s, 1);
      this.worldChip.position.copy(picked.pos).multiplyScalar(1.35);
      this.worldChip.position.y += 2.4;
    } else {
      this.bond.visible = false;
      this.worldChip.visible = false;
    }
  }
}
