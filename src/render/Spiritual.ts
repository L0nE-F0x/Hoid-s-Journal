import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { COSMERE, DAWNSHARDS, isVisible } from '../data/index.ts';
import sunVert from '../shaders/sun.vert';
import sunFrag from '../shaders/sun.frag';
import skyVert from '../shaders/sky.vert';
import seaFrag from '../shaders/spiritsea.frag';
import { spiritPlates } from './skyBake.ts';

const RING = 18;
const DAWN_RING = 30;
const AXIS_RING = 25;
/** Half-extent of the whole diagram, for framing. */
export const SPIRITUAL_RADIUS = 33;
const THREAD_STEPS = 28;
/** Fragments a Splintered Shard breaks into. */
const SHARDS_OF = 9;

const AXES: { name: string; note: string; tilt: number }[] = [
  { name: 'CONNECTION', note: 'what a thing is bound to', tilt: 0 },
  { name: 'IDENTITY', note: 'what a thing is', tilt: Math.PI / 3 },
  { name: 'FORTUNE', note: 'what a thing will be', tilt: -Math.PI / 3 },
];

function textSprite(text: string, color: string, size: number, weight = 500, track = 4): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${weight} ${size}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${track}px`;
  ctx.shadowColor = 'rgba(0,0,0,0.92)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.fillText(text, 384, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: false, depthWrite: false,
  }));
}

/** A mote of raw Investiture. Same shader the stars use — it is the same thing. */
function mote(colour: string, corona: number): { mesh: THREE.Mesh; mat: THREE.ShaderMaterial } {
  const c = new THREE.Color(colour);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: 2 },
      uColor: { value: c },
      uHot: { value: c.clone().lerp(new THREE.Color(0xffffff), 0.72) },
      uTime: { value: 0 },
      uSeed: { value: Math.random() * 40 },
      uCoreRadius: { value: 0.18 },
      uFlare: { value: 0.22 },
      uCorona: { value: corona },
      uGain: { value: 1 },
    },
    vertexShader: sunVert,
    fragmentShader: sunFrag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  return { mesh, mat };
}

interface Mote {
  id: string;
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  label: THREE.Sprite;
  thread: Line2;
  threadGeo: LineGeometry;
  /** Splinters, shown instead of the mote when the Shard is broken. */
  shards: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial }[];
  pos: THREE.Vector3;
}

/**
 * The Spiritual Realm is not a map, so this is a diagram — but a diagram of
 * the thing the books actually describe: one light, Shattered into sixteen,
 * every piece still Connected to the others and to what it Invests.
 *
 * Before the Shattering there is one whole thing and no ring at all.
 */
export class Spiritual {
  readonly group = new THREE.Group();

  private readonly motes: Mote[] = [];
  private readonly core: THREE.Mesh;
  private readonly coreMat: THREE.ShaderMaterial;
  private readonly coreLabel: THREE.Sprite;
  private readonly coreNote: THREE.Sprite;
  private readonly sea: THREE.Mesh;
  private readonly seaMat: THREE.ShaderMaterial;
  private readonly axes: { ring: Line2; label: THREE.Sprite; note: THREE.Sprite; tilt: number }[] = [];
  private readonly dawn: { id: string; mesh: THREE.Mesh; mat: THREE.ShaderMaterial; label: THREE.Sprite }[] = [];
  private readonly worldChip: THREE.Sprite;
  private worldChipKey = '';

  constructor(renderer: THREE.WebGLRenderer) {
    // --- the light everything is made of --------------------------------
    const field = spiritPlates(renderer);
    this.seaMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uWholeMap: { value: field.whole },
        uShatteredMap: { value: field.shattered },
        uWhole: { value: 0 },
      },
      vertexShader: skyVert,
      fragmentShader: seaFrag,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    });
    this.sea = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), this.seaMat);
    this.sea.frustumCulled = false;
    this.sea.renderOrder = -1000;
    this.group.add(this.sea);

    // --- Adonalsium -----------------------------------------------------
    const core = mote('#ffdca8', 1.35);
    this.core = core.mesh;
    this.coreMat = core.mat;
    this.core.renderOrder = 4;
    this.group.add(this.core);
    this.coreLabel = textSprite('ADONALSIUM', 'rgba(255,238,205,0.95)', 44, 600, 8);
    this.coreNote = textSprite('one power, before anyone thought to divide it', 'rgba(214,224,248,0.62)', 26, 400, 1);
    this.group.add(this.coreLabel, this.coreNote);

    // --- the sixteen ----------------------------------------------------
    for (const sh of COSMERE.shards) {
      const m = mote(sh.color, 0.95);
      m.mesh.renderOrder = 3;
      const label = textSprite(sh.name.toUpperCase(), 'rgba(232,240,255,0.92)', 34, 600, 5);

      const threadGeo = new LineGeometry();
      threadGeo.setPositions(new Array(THREAD_STEPS * 3).fill(0));
      threadGeo.setColors(new Array(THREAD_STEPS * 3).fill(0));
      const threadMat = new LineMaterial({
        linewidth: 1.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      threadMat.resolution.set(window.innerWidth, window.innerHeight);
      const thread = new Line2(threadGeo, threadMat);
      thread.computeLineDistances();
      thread.frustumCulled = false;
      thread.renderOrder = 2;

      // A Splintered Shard is still all of its power — just not in one place.
      const shards: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial }[] = [];
      for (let i = 0; i < SHARDS_OF; i++) {
        const frag = mote(sh.color, 0.55);
        frag.mat.uniforms.uCoreRadius.value = 0.30;
        frag.mat.uniforms.uFlare.value = 0;
        frag.mesh.renderOrder = 3;
        frag.mesh.visible = false;
        this.group.add(frag.mesh);
        shards.push(frag);
      }

      this.group.add(m.mesh, label, thread);
      this.motes.push({
        id: sh.id, mesh: m.mesh, mat: m.mat, label, thread, threadGeo, shards,
        pos: new THREE.Vector3(),
      });
    }

    // --- the three axes, as great circles rather than sticks -------------
    for (const axis of AXES) {
      const pts: number[] = [];
      const cols: number[] = [];
      const tint = new THREE.Color(0x8fa8dd);
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(Math.cos(a) * AXIS_RING, 0, Math.sin(a) * AXIS_RING);
        const k = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(a * 3));
        cols.push(tint.r * k, tint.g * k, tint.b * k);
      }
      const geo = new LineGeometry();
      geo.setPositions(pts);
      geo.setColors(cols);
      const mat = new LineMaterial({
        linewidth: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.30,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      mat.resolution.set(window.innerWidth, window.innerHeight);
      const ring = new Line2(geo, mat);
      ring.computeLineDistances();
      ring.frustumCulled = false;
      ring.rotation.z = axis.tilt;
      ring.renderOrder = 1;
      const label = textSprite(axis.name, 'rgba(163,189,233,0.80)', 30, 500, 6);
      const note = textSprite(axis.note, 'rgba(150,170,210,0.52)', 22, 400, 0);
      this.group.add(ring, label, note);
      this.axes.push({ ring, label, note, tilt: axis.tilt });
    }

    // --- the Dawnshards, older than any of it ---------------------------
    for (const d of DAWNSHARDS) {
      const m = mote('#e9e3ff', 0.7);
      m.mat.uniforms.uCoreRadius.value = 0.24;
      m.mat.uniforms.uFlare.value = 0.45;
      m.mesh.renderOrder = 3;
      const label = textSprite(d.command === '—' ? 'DAWNSHARD' : d.command.toUpperCase(),
        'rgba(226,222,255,0.78)', 26, 500, 5);
      this.group.add(m.mesh, label);
      this.dawn.push({ id: d.id, mesh: m.mesh, mat: m.mat, label });
    }

    this.worldChip = textSprite('', 'rgba(226,238,255,0.9)', 30, 600, 3);
    this.worldChip.visible = false;
    this.group.add(this.worldChip);

    this.group.visible = false;
  }

  setViewport(w: number, h: number): void {
    for (const m of this.motes) (m.thread.material as LineMaterial).resolution.set(w, h);
    for (const a of this.axes) (a.ring.material as LineMaterial).resolution.set(w, h);
  }

  /** Where a Shard's mote is standing right now, for picking. */
  motePosition(id: string): THREE.Vector3 | undefined {
    return this.motes.find((m) => m.id === id)?.pos;
  }

  dawnPosition(id: string): THREE.Vector3 | undefined {
    return this.dawn.find((d) => d.id === id)?.mesh.position;
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
    const spin = time * 0.045;

    this.seaMat.uniforms.uTime.value = time;
    this.seaMat.uniforms.uWhole.value = whole ? 1 : 0;

    // --- the core --------------------------------------------------------
    this.coreMat.uniforms.uTime.value = time;
    this.coreMat.uniforms.uSize.value = whole ? 13 : 4.4;
    this.coreMat.uniforms.uCorona.value = whole ? 1.6 : 0.7;
    this.coreLabel.visible = whole;
    this.coreNote.visible = whole;
    if (whole) {
      const s = apparent(this.core.position, 0.058);
      this.coreLabel.scale.set(s * 6, s, 1);
      this.coreLabel.position.set(0, 11.5, 0);
      this.coreNote.scale.set(s * 6, s * 0.62, 1);
      this.coreNote.position.set(0, 9.0, 0);
    }

    // --- the sixteen -----------------------------------------------------
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i]!;
      const sh = COSMERE.shards[i]!;
      const seen = isVisible(sh, progress);
      const show = !whole && seen;

      const a = spin + (i / this.motes.length) * Math.PI * 2;
      m.pos.set(Math.cos(a) * RING, Math.sin(a * 2 + time * 0.1) * 2.4, Math.sin(a) * RING);

      const row = sh.eras.find((e) => e.era === era) ?? sh.eras[sh.eras.length - 1];
      const status = row?.status ?? 'whole';
      const broken = status === 'splintered';
      const hot = selected === sh.id;

      m.mesh.position.copy(m.pos);
      m.mesh.visible = show && !broken;
      m.mat.uniforms.uTime.value = time;
      m.mat.uniforms.uSize.value = (status === 'merged' ? 3.4 : 2.6) * (hot ? 1.35 : 1);
      m.mat.uniforms.uCorona.value = hot ? 1.5 : 0.95;

      // Splinters: the same power, scattered, orbiting where the Shard stood.
      for (let k = 0; k < m.shards.length; k++) {
        const frag = m.shards[k]!;
        frag.mesh.visible = show && broken;
        if (!frag.mesh.visible) continue;
        const fa = time * (0.25 + k * 0.045) + k * 2.1;
        const fr = 1.8 + (k % 3) * 0.9;
        frag.mesh.position.set(
          m.pos.x + Math.cos(fa) * fr,
          m.pos.y + Math.sin(fa * 1.7 + k) * fr * 0.6,
          m.pos.z + Math.sin(fa) * fr,
        );
        frag.mat.uniforms.uTime.value = time;
        frag.mat.uniforms.uSize.value = (0.7 + (k % 3) * 0.18) * (hot ? 1.4 : 1);
      }

      m.label.visible = show;
      if (show) {
        const s = apparent(m.pos, 0.042);
        m.label.scale.set(s * 6, s, 1);
        // Names sit outside the ring, and alternate up and down: sixteen of
        // them on one circle collide wherever the ring foreshortens.
        const out = RING + 6.4 + s * 1.5;
        const stagger = (i % 2 === 0 ? 1 : -1) * (2.4 + s * 0.55);
        m.label.position.set(Math.cos(a) * out, m.pos.y + stagger, Math.sin(a) * out);
      }

      // --- threads of Connection ----------------------------------------
      // Each Shard to the core, with a pulse running the length of it. This
      // is the whole point of the Realm: nothing in it is actually separate.
      m.thread.visible = show;
      if (show) {
        const pts: number[] = [];
        const cols: number[] = [];
        const c = new THREE.Color(sh.color);
        const phase = time * 0.35 + i * 0.4;
        for (let s = 0; s < THREAD_STEPS; s++) {
          const t = s / (THREAD_STEPS - 1);
          // Bow the thread out of the plane so sixteen of them do not overlay.
          const bow = Math.sin(t * Math.PI) * 3.2;
          pts.push(
            m.pos.x * t,
            m.pos.y * t + bow * Math.cos(a * 2 + i),
            m.pos.z * t + bow * Math.sin(a * 2 + i) * 0.4,
          );
          const pulse = Math.pow(Math.max(0, Math.sin((t - phase) * Math.PI * 2)), 12);
          const base = (broken ? 0.10 : 0.22) * (hot ? 2.4 : 1);
          const k = base + pulse * (hot ? 1.3 : 0.75);
          cols.push(c.r * k, c.g * k, c.b * k);
        }
        m.threadGeo.setPositions(pts);
        m.threadGeo.setColors(cols);
        m.thread.computeLineDistances();
      }
    }

    // --- axes ------------------------------------------------------------
    for (let i = 0; i < this.axes.length; i++) {
      const { ring, label, note, tilt } = this.axes[i]!;
      ring.visible = !whole;
      label.visible = !whole;
      note.visible = !whole;
      ring.rotation.y = spin * 0.35 + i * 0.7;
      ring.rotation.z = tilt;
      if (whole) continue;
      const a = -spin * 0.5 + (i / this.axes.length) * Math.PI * 2;
      const p = new THREE.Vector3(Math.cos(a) * AXIS_RING, (i - 1) * 5.5, Math.sin(a) * AXIS_RING);
      const s = apparent(p, 0.040);
      label.position.copy(p);
      label.scale.set(s * 6, s, 1);
      note.position.copy(p).setY(p.y - s * 0.95);
      note.scale.set(s * 6, s * 0.68, 1);
    }

    // --- Dawnshards ------------------------------------------------------
    for (let i = 0; i < this.dawn.length; i++) {
      const d = this.dawn[i]!;
      d.mesh.visible = true;
      const a = -spin * 0.7 + (i / this.dawn.length) * Math.PI * 2 + 0.4;
      const p = new THREE.Vector3(
        Math.cos(a) * DAWN_RING,
        Math.sin(a * 1.5) * 6.5 + (whole ? 0 : 3),
        Math.sin(a) * DAWN_RING,
      );
      d.mesh.position.copy(p);
      d.mat.uniforms.uTime.value = time;
      d.mat.uniforms.uSize.value = 2.0;
      const s = apparent(p, 0.034);
      d.label.position.copy(p).setY(p.y + 2.6 + s * 0.4);
      d.label.scale.set(s * 6, s, 1);
    }

    // --- a selected Shard shows what it is Connected to -------------------
    const picked = selected ? this.motes.find((m) => m.id === selected) : undefined;
    const sh = picked ? COSMERE.shards.find((s) => s.id === picked.id) : undefined;
    if (!whole && picked && sh && (picked.mesh.visible || picked.shards[0]?.mesh.visible)) {
      const row = sh.eras.find((e) => e.era === era) ?? sh.eras[sh.eras.length - 1];
      const where = row?.loc ?? sh.world;
      this.worldChip.visible = true;
      const key = `${sh.id}:${where}`;
      if (this.worldChipKey !== key) {
        this.worldChipKey = key;
        const mat = this.worldChip.material as THREE.SpriteMaterial;
        mat.map = (textSprite(where.toUpperCase(), sh.color, 30, 600, 3).material as THREE.SpriteMaterial).map;
        mat.needsUpdate = true;
      }
      const s = apparent(picked.pos, 0.034);
      this.worldChip.scale.set(s * 6, s, 1);
      this.worldChip.position.copy(picked.pos).multiplyScalar(1.30);
      this.worldChip.position.y -= 3.2;
    } else {
      this.worldChip.visible = false;
    }
  }
}
