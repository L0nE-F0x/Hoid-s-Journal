/**
 * One-shot sky events.
 *
 * The Shattering is the only set-piece in the atlas, so it is the only thing
 * here built as one. It runs in four layers that peak at different moments:
 *
 *   flash   a detonation at Yolen, gone inside a second
 *   shards  sixteen comets leaving in sixteen directions, each carrying the
 *           colour its Shard is drawn in everywhere else in the app
 *   shell   the front itself, a sphere seen only at its limb, so it reads as
 *           a ring from any angle instead of only from above
 *   ember   what is left glowing at the origin once the rest has gone
 *
 * The sixteen directions are fixed, not random: a Fibonacci sphere, so the
 * shards spread evenly and the same beat plays the same way every time.
 *
 * The other beats — ash, storm, dawn — are smaller and reuse the flash and
 * the shell without the shards. They are weather, not cosmology.
 */
import * as THREE from 'three';
import { COSMERE } from '../data/index.ts';
import type { CosmereEvent, SkyVisual } from '../data/events.ts';
import shockVert from '../shaders/shockwave.vert';
import shockFrag from '../shaders/shockwave.frag';
import shardVert from '../shaders/shardfall.vert';
import shardFrag from '../shaders/shardfall.frag';
import flashVert from '../shaders/flash.vert';
import flashFrag from '../shaders/flash.frag';

interface Beat {
  /** The body of the light: shell, flash, ember. */
  core: number;
  /** The hotter line riding the leading edge. */
  edge: number;
  /** How far the front travels, in world units. */
  reach: number;
  /** Seconds, end to end. */
  duration: number;
  /** Only the Shattering throws Shards. */
  shards: boolean;
}

const BEATS: Record<SkyVisual, Beat> = {
  shatter: { core: 0xffe2a4, edge: 0xfff8ec, reach: 212, duration: 5.6, shards: true },
  ash: { core: 0x94a3b8, edge: 0xd9e0ea, reach: 72, duration: 4.0, shards: false },
  storm: { core: 0x7dd3fc, edge: 0xe6f7ff, reach: 94, duration: 4.2, shards: false },
  dawn: { core: 0xfde68a, edge: 0xfffdf2, reach: 74, duration: 4.4, shards: false },
};

/**
 * Points per shard: one head plus the tail that lags behind it.
 *
 * This is a sampling rate, not a look. Sixteen points stretched over a fast
 * head read as a dotted line; the streak only closes up when the spacing
 * falls below the point size, so the count and `uLagSpan` are tuned together.
 */
const TRAIL = 40;

/**
 * Sixteen directions spread as evenly over a sphere as sixteen directions go.
 * Fixed seed, fixed result — the Shattering is a historical event and should
 * not be a different shape each time the playhead crosses it.
 */
function fibonacciSphere(n: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    out.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).normalize());
  }
  return out;
}

export class EventFx {
  readonly group = new THREE.Group();

  private readonly pivot = new THREE.Group();
  private readonly shell: THREE.Mesh;
  private readonly shellMat: THREE.ShaderMaterial;
  private readonly flash: THREE.Mesh;
  private readonly flashMat: THREE.ShaderMaterial;
  private readonly shards: THREE.Points;
  private readonly shardMat: THREE.ShaderMaterial;

  private t = 0;
  private playing = false;
  private beat: Beat = BEATS.shatter;

  constructor() {
    this.group.add(this.pivot);

    this.shellMat = new THREE.ShaderMaterial({
      vertexShader: shockVert,
      fragmentShader: shockFrag,
      uniforms: {
        uRadius: { value: 1 },
        uColor: { value: new THREE.Color(BEATS.shatter.core) },
        uEdge: { value: new THREE.Color(BEATS.shatter.edge) },
        uOpacity: { value: 0 },
        uSharp: { value: 4 },
        uTear: { value: 0.2 },
        uSeed: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.shell = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 44), this.shellMat);
    // The radius lives in the vertex shader, so the CPU-side bounds are a lie.
    this.shell.frustumCulled = false;
    this.shell.renderOrder = 3;
    this.shell.visible = false;
    this.pivot.add(this.shell);

    this.flashMat = new THREE.ShaderMaterial({
      vertexShader: flashVert,
      fragmentShader: flashFrag,
      uniforms: {
        uSize: { value: 1 },
        uColor: { value: new THREE.Color(BEATS.shatter.core) },
        uOpacity: { value: 0 },
        uSpike: { value: 0.5 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.flashMat);
    this.flash.frustumCulled = false;
    this.flash.renderOrder = 4;
    this.flash.visible = false;
    this.pivot.add(this.flash);

    // Sixteen shards, sixteen colours, taken from the same table the Shard
    // chips and the Spiritual Realm read — so the streak that leaves here in
    // Odium's red is the red the reader will meet again on Roshar.
    const dirs = fibonacciSphere(16);
    const colours = COSMERE.shards.map((s) => new THREE.Color(s.color));
    const count = 16 * TRAIL;
    const pos = new Float32Array(count * 3);
    const dir = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const lag = new Float32Array(count);
    const seed = new Float32Array(count);

    for (let s = 0; s < 16; s++) {
      const d = dirs[s]!;
      const c = colours[s % colours.length] ?? new THREE.Color(0xffffff);
      for (let k = 0; k < TRAIL; k++) {
        const i = s * TRAIL + k;
        // Every point sits at the origin; the vertex shader walks it out.
        pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
        dir[i * 3] = d.x; dir[i * 3 + 1] = d.y; dir[i * 3 + 2] = d.z;
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        lag[i] = k / (TRAIL - 1);
        seed[i] = s / 16;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aLag', new THREE.BufferAttribute(lag, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    this.shardMat = new THREE.ShaderMaterial({
      vertexShader: shardVert,
      fragmentShader: shardFrag,
      uniforms: {
        uProgress: { value: 0 },
        uReach: { value: BEATS.shatter.reach },
        uSize: { value: 3.8 },
        uPixelScale: { value: 820 },
        uLagSpan: { value: 0.055 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.shards = new THREE.Points(geo, this.shardMat);
    this.shards.frustumCulled = false;
    this.shards.renderOrder = 3;
    this.shards.visible = false;
    this.pivot.add(this.shards);
  }

  play(event: CosmereEvent, origin: THREE.Vector3): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const kind = event.visual;
    if (!kind) return;

    this.beat = BEATS[kind];
    this.t = 0;
    this.playing = true;
    this.pivot.position.copy(origin);

    const core = new THREE.Color(this.beat.core);
    const edge = new THREE.Color(this.beat.edge);
    (this.shellMat.uniforms.uColor!.value as THREE.Color).copy(core);
    (this.shellMat.uniforms.uEdge!.value as THREE.Color).copy(edge);
    (this.flashMat.uniforms.uColor!.value as THREE.Color).copy(core);
    this.shellMat.uniforms.uSeed!.value = Math.random();
    this.shardMat.uniforms.uReach!.value = this.beat.reach * 1.06;

    this.shell.visible = true;
    this.flash.visible = true;
    this.shards.visible = this.beat.shards;
  }

  update(dt: number, camera: THREE.Camera, height: number, fov: number): void {
    if (!this.playing) return;
    this.t += dt;
    const u = this.t / this.beat.duration;
    if (u >= 1) {
      this.playing = false;
      this.shell.visible = false;
      this.flash.visible = false;
      this.shards.visible = false;
      return;
    }

    // The front: quick off the mark, then coasting. The sharpness climbing
    // from 7 to 24 is what turns a lit balloon into a shockwave — early on the
    // limb is a broad bloom, and by the end only a hard ring survives.
    const travel = 1 - Math.pow(1 - u, 2.6);
    this.shellMat.uniforms.uRadius!.value = 1.5 + travel * this.beat.reach;
    this.shellMat.uniforms.uSharp!.value = 7.0 + u * 17.0;
    this.shellMat.uniforms.uTear!.value = 0.12 + u * 0.82;
    // Holds, then goes. A linear fade on an expanding shell looks like a leak.
    this.shellMat.uniforms.uOpacity!.value = 1.05 * Math.pow(1 - u, 2.2);

    // The detonation is measured in real seconds, not in fractions of the
    // beat: a flash that scales with duration stops being a flash.
    const ft = this.t;
    const rise = Math.min(1, ft / 0.06);
    const fall = Math.exp(-Math.max(0, ft - 0.06) * 2.2);
    const flash = rise * fall;
    // What is left burning at the origin once the blast has gone.
    const ember = Math.exp(-ft * 0.5) * 0.22 * (1 - u);
    this.flashMat.uniforms.uOpacity!.value = flash * 1.7 + ember;
    // Blooms, then collapses back to a scar rather than fading out at full size.
    const bloom = 1 - Math.exp(-ft * 6);
    const settle = 0.14 + 0.86 * Math.exp(-Math.max(0, ft - 0.45) * 0.9);
    this.flashMat.uniforms.uSize!.value =
      this.beat.reach * (0.05 + 0.44 * bloom * settle);
    this.flashMat.uniforms.uSpike!.value = 0.85 * flash;
    // Billboard by hand; this is a plane, not a sprite, so it can carry a
    // shader and an arbitrary size.
    this.flash.quaternion.copy(camera.quaternion);

    if (this.beat.shards) {
      // The shards leave a beat after the light does, and are gone before the
      // front is — they have somewhere to be.
      const sp = Math.min(1, Math.max(0, (u - 0.015) / 0.86));
      this.shardMat.uniforms.uProgress!.value = sp;
      this.shardMat.uniforms.uPixelScale!.value =
        (height * 0.5) / Math.tan((fov * Math.PI) / 360);
      this.shardMat.uniforms.uOpacity!.value = 1.35;
    }
  }

  dispose(): void {
    this.shell.geometry.dispose();
    this.shellMat.dispose();
    this.flash.geometry.dispose();
    this.flashMat.dispose();
    this.shards.geometry.dispose();
    this.shardMat.dispose();
  }
}
