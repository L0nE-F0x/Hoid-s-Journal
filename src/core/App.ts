import * as THREE from 'three';
import { COSMERE, COSMERE_EVENTS, DAWNSHARDS, HUBS, bodyById, canEnterCity, characterAt, eraAt, hubById, isVisible, moonById, onTheMap, systemExtent, systemOnTheMap, yearToSlider } from '../data/index.ts';
import { uvFacing, uvOnBody } from '../layout/surface.ts';
import { hubWorld } from '../layout/cognitive.ts';
import { CameraRig, type Waypoint } from './CameraRig.ts';
import { store, type CameraCue, type Scale } from './store.ts';
import { Labels } from '../render/Labels.ts';
import { Orrery } from '../render/Orrery.ts';
import { Pins } from '../render/Pins.ts';
import { Presence } from '../render/Presence.ts';
import { createPostChain, type PostChain } from '../render/post.ts';
import { SPIRITUAL_RADIUS, Spiritual } from '../render/Spiritual.ts';
import { Shadesmar } from '../render/Shadesmar.ts';
import { Starfield } from '../render/Starfield.ts';
import { EventFx } from '../render/EventFx.ts';
import { planetPlates, PLATE_SMALL, seedFromId } from '../render/planetBake.ts';

const FOV = 52;
const CLICK_SLOP = 12;
/** Playhead years per second at rate 1. Slow enough that orbits drift. */
const YEARS_PER_SECOND = 0.08;
const _ride = new THREE.Vector3();
const _pick = new THREE.Vector3();
const _surf = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _hub = new THREE.Vector3();
/** How far from a subject a click still counts, in CSS pixels. */
const PICK_SLOP = 28;

type PickKind = 'system' | 'body' | 'location' | 'character' | 'shard' | 'hub' | 'moon' | 'dawnshard';
/** How far off the sun axis the camera stands. Bigger = more terminator. */
const GLOBE_SUN_OFFSET = 0.7;
const SURFACE_SUN_OFFSET = 0.95;

function isGlobeScale(scale: Scale): boolean {
  return scale === 'globe' || scale === 'surface' || scale === 'city';
}

export class App {
  readonly rig: CameraRig;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly starfield: Starfield;
  private readonly orrery: Orrery;
  private readonly labels: Labels;
  private readonly pins: Pins;
  private readonly presence: Presence;
  private readonly spiritual: Spiritual;
  private readonly shadesmar: Shadesmar;
  private readonly eventFx: EventFx;
  private readonly post: PostChain;
  private readonly canvas: HTMLCanvasElement;
  private readonly clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private pointerDown = { x: 0, y: 0, t: 0 };
  private lastPointer = { x: 0, y: 0 };
  private frames = 0;
  /** Monotonic frame counter. The test harness waits on this. */
  frameCount = 0;
  private fpsAccum = 0;
  private disposers: (() => void)[] = [];
  private hoverAnchor: ((p: { x: number; y: number } | null) => void) | undefined;
  private follow: { id: string; pos: THREE.Vector3; heading: number } | null = null;
  /** What the last framing asked for, so panels opening later can re-fit. */
  private framing: { radius: number; fill: number; commanded: number } | null = null;
  private autoBand: 'high' | 'medium' | 'low' = 'high';
  private fpsSlow = 0;
  private fpsFast = 0;
  private lastYear = store.state.year;
  private yearTick = Math.round(yearToSlider(store.state.year) * 1000);
  private warmQueue: { kind: string; seed: number; cognitive: boolean }[] = [];
  private lastWarm = 0;

  constructor(canvas: HTMLCanvasElement, opts: { onHoverAnchor?: (p: { x: number; y: number } | null) => void } = {}) {
    this.canvas = canvas;
    this.hoverAnchor = opts.onHoverAnchor;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setClearColor(0x04050b, 1);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.autoClear = true;

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 8000);
    this.rig = new CameraRig(this.camera, canvas);

    this.starfield = new Starfield(this.renderer);
    this.orrery = new Orrery(this.renderer);
    this.labels = new Labels();
    this.pins = new Pins();
    this.presence = new Presence();
    this.spiritual = new Spiritual(this.renderer);
    this.shadesmar = new Shadesmar(this.renderer);
    this.eventFx = new EventFx();

    this.scene.add(this.starfield.sky);
    this.scene.add(this.starfield.points);
    this.scene.add(this.orrery.group);
    this.scene.add(this.labels.group);
    this.scene.add(this.pins.group);
    this.scene.add(this.presence.group);
    this.scene.add(this.shadesmar.group);
    this.scene.add(this.spiritual.group);
    this.scene.add(this.eventFx.group);

    this.post = createPostChain(this.renderer, this.scene, this.camera);

    this.bind();
    this.resize();
    this.rig.setInputEnabled(false);
    this.rig.autoRotate = true;
    this.orrery.update(store.state.year, store.state.realm, store.state.era, 0, {
      showOrbits: true, showMoons: true, showAtmospheres: true, showNebula: true, nebula: 1,
      scale: 'cosmere', focusedSystem: null, focusedBody: null, cameraDistance: 260,
      cameraPos: this.camera.position,
    });

    this.disposers.push(store.on('cameraCue', (cue) => {
      if (cue) this.consumeCue(cue);
    }));
    this.disposers.push(store.on('skyEvent', (id) => {
      if (id) this.playSkyEvent(id);
    }));
    this.disposers.push(store.on('shell', (shell) => {
      this.rig.setInputEnabled(shell === 'play');
      this.rig.autoRotate = store.state.visual.autoRotate && shell === 'title';
    }));
    this.disposers.push(store.on('visual', (v) => {
      this.rig.autoRotate = v.autoRotate && store.state.shell === 'title';
      this.applyQuality();
    }));
    this.disposers.push(store.on('realm', (realm, prev) => {
      if (realm === 'spiritual') {
        this.rig.flyTo(
          new THREE.Vector3(),
          this.rig.framingDistance(SPIRITUAL_RADIUS, 0.85, 'width'),
          2.2,
        );
        this.rig.setAngles(Math.PI * 0.25, 1.18);
      } else if (prev === 'spiritual') {
        const body = store.state.focusedBody;
        const sys = store.state.focusedSystem;
        if (body) this.focusId(body, store.state.scale === 'cosmere' ? 'globe' : store.state.scale);
        else if (sys) this.focusId(sys, 'system');
        else this.frameCosmere(2.2);
      }
    }));
    this.disposers.push(store.on('insets', (v) => {
      this.rig.setInsets(v);
      this.refit();
    }));
    this.rig.setInsets(store.state.insets);
    this.applyQuality();
    this.warmUp();
    this.queuePlateWarm();
  }

  /**
   * Small plates for every world in both Realms, baked one pair per frame
   * after the intro so the first press of C does not hitch on a bake.
   */
  private queuePlateWarm(): void {
    const seen = new Set<string>();
    const jobs: { kind: string; seed: number; cognitive: boolean }[] = [];
    const push = (kind: string, seed: number, cognitive: boolean) => {
      const key = `${kind}:${seed}:${cognitive ? 'c' : 'p'}`;
      if (seen.has(key)) return;
      seen.add(key);
      jobs.push({ kind, seed, cognitive });
    };
    for (const body of COSMERE.bodies) {
      const seed = body.kind === 'gas-giant' ? 11 + (seedFromId(body.id) % 3) * 29 : seedFromId(body.id);
      if (body.id === 'scadrial') {
        push('scadrial-ash', seed, false);
        push('scadrial-basin', seed, false);
        push('scadrial-ash', seed, true);
        push('scadrial-basin', seed, true);
        continue;
      }
      push(body.biome, seed, false);
      push(body.biome, seed, true);
    }
    this.warmQueue = jobs;
  }

  /**
   * Compile every Realm's materials before the reader can ask for one.
   *
   * Shadesmar and the Spiritual Realm are hidden groups, so Three skips them
   * when it compiles the first frame — and then the press of C or V pays for
   * three new shader programs in the middle of a camera flight. On this
   * machine that stall was long enough to swallow the whole transition.
   */
  private warmUp(): void {
    const groups = [this.shadesmar.group, this.spiritual.group];
    const was = groups.map((g) => g.visible);
    for (const g of groups) g.visible = true;
    try {
      this.renderer.compile(this.scene, this.camera);
    } catch {
      // A driver that will not pre-compile is not a reason to refuse to boot.
    }
    groups.forEach((g, i) => { g.visible = was[i]!; });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    loop();
  }

  playIntro(): void {
    const roshar = this.orrery.bodyPosition('roshar') ?? new THREE.Vector3(74, 0, 31);
    const sys = this.orrery.systemPosition('rosharan') ?? new THREE.Vector3(74, 0, 31);
    const origin = new THREE.Vector3(0, 0, 0);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const waypoints: Waypoint[] = reduce
      ? [{ target: origin, radius: 260, phi: 0.95, theta: 0.7, duration: 0.4 }]
      : [
        { target: roshar.clone(), radius: 3.4, phi: 1.05, theta: 0.4, duration: 0.05 },
        { target: roshar.clone(), radius: 4.2, phi: 1.12, theta: 0.85, duration: 2.6 },
        { target: sys.clone(), radius: 48, phi: 1.05, theta: 1.6, duration: 4.2 },
        { target: origin, radius: 268, phi: 0.98, theta: 2.35, duration: 5.4 },
      ];
    store.set('cinematic', true);
    store.set('scale', 'globe');
    store.set('focusedBody', 'roshar');
    store.set('focusedSystem', 'rosharan');
    this.rig.playPath(waypoints, () => {
      store.set('cinematic', false);
      store.set('scale', 'cosmere');
      store.set('focusedBody', null);
      store.set('focusedSystem', null);
    });
  }

  private playSkyEvent(id: string): void {
    const ev = COSMERE_EVENTS.find((e) => e.id === id);
    if (!ev) return;
    if (store.state.skyEvent) store.set('skyEvent', null);
    this.lastYear = ev.year;
    const origin = this.orrery.bodyPosition('yolen')
      ?? this.orrery.systemPosition('yolish')
      ?? new THREE.Vector3();
    this.eventFx.play(ev, origin);
  }

  private consumeCue(cue: CameraCue): void {
    store.set('cameraCue', null);
    if (cue.kind === 'cinematic') { this.playIntro(); return; }
    if (cue.kind === 'skip-cinematic') {
      this.rig.skipCinematic();
      return;
    }
    if (cue.kind === 'frame') {
      this.frameCosmere(2.4);
      return;
    }
    if (cue.kind === 'pop') {
      this.popScale();
      return;
    }
    if (cue.kind === 'focus') this.focusId(cue.id, cue.scale);
  }

  private popScale(): void {
    const s = store.state;
    if (s.scale === 'city' && s.focusedLocation && s.focusedBody) {
      this.focusLocation(s.focusedLocation, s.focusedBody, 'surface');
      return;
    }
    if (s.scale === 'surface' || s.scale === 'city') {
      store.set('focusedLocation', null);
      if (s.focusedBody) this.focusId(s.focusedBody, 'globe');
      return;
    }
    if (s.scale === 'globe' && s.focusedSystem) {
      this.focusId(s.focusedSystem, 'system');
      return;
    }
    this.frameCosmere(2.2);
    store.set('selected', null);
  }

  /**
   * Frame every system, not a fixed radius around Yolen. The systems are not
   * centred on the origin, so a fixed 268 left half the sky empty and pushed
   * the far ones off the bottom of the frame.
   */
  private frameCosmere(damping: number): void {
    const { era, readProgress } = store.state;
    const live = COSMERE.systems.filter((sys) => systemOnTheMap(sys.id, readProgress, era));
    const centre = new THREE.Vector3();
    let n = 0;
    for (const sys of live) {
      const p = this.orrery.systemPosition(sys.id);
      if (!p) continue;
      centre.add(p);
      n++;
    }
    if (n) centre.multiplyScalar(1 / n);
    let spread = 40;
    for (const sys of live) {
      const p = this.orrery.systemPosition(sys.id);
      if (p) spread = Math.max(spread, centre.distanceTo(p));
    }
    // The spread is a 3-D radius but the systems lie in a flattened plane seen
    // at an angle, so the on-screen width is roughly three quarters of it.
    this.framing = null;
    this.rig.flyTo(centre, this.rig.framingDistance(spread * 0.78, 0.86, 'width'), damping);
    store.set('scale', 'cosmere');
    store.set('focusedSystem', null);
    store.set('focusedBody', null);
  }

  private focusMoon(id: string): void {
    const moon = moonById[id];
    if (!moon) return;
    const parent = bodyById[moon.parent];
    if (!parent) return;
    const st = store.state;
    if (!onTheMap(parent, st.readProgress, st.era)) return;
    const p = this.orrery.moonPosition(id);
    if (!p) return;
    store.set('focusedBody', parent.id);
    store.set('focusedSystem', parent.system);
    store.set('focusedLocation', null);
    store.set('selected', id);
    store.set('scale', 'globe');
    store.set('isPlaying', false);
    const radius = Math.max(moon.radius * 6, 2.4);
    const dist = this.rig.framingDistance(radius, 0.42);
    this.framing = { radius, fill: 0.42, commanded: dist };
    this.rig.flyTo(p, dist, 2.0);
  }

  private focusId(id: string, scale: Scale): void {
    const loc = COSMERE.locations.find((l) => l.id === id);
    if (loc) { this.focusLocation(loc.id, loc.body, scale === 'city' ? 'city' : 'surface'); return; }
    if (hubById[id]) { this.focusHub(id); return; }
    if (moonById[id]) { this.focusMoon(id); return; }
    const body = bodyById[id];
    if (body) {
      const st = store.state;
      if (!onTheMap(body, st.readProgress, st.era)) return;
      const p = this.orrery.bodyPosition(id);
      if (!p) return;
      const next: Scale = scale === 'cosmere' ? 'globe' : scale;
      const globe = isGlobeScale(next);
      // Panels react to these synchronously, so insets are current by the time
      // the framing distance below is measured.
      store.set('focusedBody', id);
      store.set('focusedSystem', body.system);
      store.set('selected', id);
      store.set('scale', next);
      // A world is a place to read, not a fairground ride: hold the playhead.
      if (globe) store.set('isPlaying', false);

      const sun = this.orrery.systemPosition(body.system);
      if (sun && globe) {
        // Sit on the sunward side, a little off-axis: lit face to the camera,
        // a terminator on one limb, and the sun itself well behind us.
        const dx = p.x - sun.x;
        const dz = p.z - sun.z;
        this.rig.setAngles(Math.atan2(dx, dz) + Math.PI - GLOBE_SUN_OFFSET, 1.02);
      }
      const fill = next === 'surface' ? 0.82 : 0.52;
      const dist = globe ? this.rig.framingDistance(body.radius, fill) : 42;
      this.framing = globe ? { radius: body.radius, fill, commanded: dist } : null;
      this.rig.flyTo(p, dist, 2.0);
      return;
    }
    const sys = COSMERE.systems.find((s) => s.id === id);
    if (sys) {
      const st = store.state;
      if (!systemOnTheMap(id, st.readProgress, st.era)) return;
      const p = this.orrery.systemPosition(id);
      if (!p) return;
      // Frame the whole disc, not a fixed distance: the Rosharan system runs
      // out to ten gas giants, the Scadrian one does not.
      const outer = COSMERE.bodies
        .filter((b) => b.system === id)
        .reduce((m, b) => Math.max(m, b.orbit.a), 8);
      this.framing = null;
      this.rig.flyTo(p, this.rig.framingDistance(outer * 0.95, 0.92), 2.1);
      store.set('focusedSystem', id);
      store.set('focusedBody', null);
      store.set('selected', id);
      store.set('scale', 'system');
    }
  }

  private bind(): void {
    const onResize = () => this.resize();
    window.addEventListener('resize', onResize);
    this.disposers.push(() => window.removeEventListener('resize', onResize));

    const down = (e: PointerEvent) => {
      this.pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const up = (e: PointerEvent) => {
      const dx = e.clientX - this.pointerDown.x;
      const dy = e.clientY - this.pointerDown.y;
      if (Math.hypot(dx, dy) > CLICK_SLOP) return;
      if (store.state.shell !== 'play') return;
      this.pickAt(e.clientX, e.clientY, true);
    };
    const move = (e: PointerEvent) => {
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;
      if (store.state.shell !== 'play') return;
      this.pickAt(e.clientX, e.clientY, false);
    };
    // A lost context leaves every DOM panel working over a black canvas,
    // which reads as "the app is fine, the Cosmere is missing". Say so.
    const lost = (e: Event) => {
      e.preventDefault();
      this.running = false;
      cancelAnimationFrame(this.raf);
      store.set('fault', 'The graphics context was lost. Reload to bring the sky back.');
    };
    const restored = () => {
      // Everything baked lives in render targets that the driver has thrown
      // away. Rebuilding them in place is a larger machine than this needs;
      // a reload is honest and takes a second.
      store.set('fault', 'The graphics context came back. Reload to rebuild the sky.');
    };
    this.canvas.addEventListener('webglcontextlost', lost);
    this.canvas.addEventListener('webglcontextrestored', restored);
    this.disposers.push(() => {
      this.canvas.removeEventListener('webglcontextlost', lost);
      this.canvas.removeEventListener('webglcontextrestored', restored);
    });

    this.canvas.addEventListener('pointerdown', down);
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointermove', move);
    this.disposers.push(() => {
      this.canvas.removeEventListener('pointerdown', down);
      this.canvas.removeEventListener('pointerup', up);
      this.canvas.removeEventListener('pointermove', move);
    });
  }

  /**
   * Screen-space picking. A raycast cannot hit a planet that is one pixel
   * across, which is most of them at Cosmere distance, and a sun sprite's
   * quad swallowed clicks meant for what was in front of it. So project the
   * candidates the current scale actually offers and take the nearest.
   *
   * A pointer inside a subject's own disc always beats a near miss, and among
   * those the nearest to the camera wins.
   */
  private pickAt(cx: number, cy: number, click: boolean): void {
    const rect = this.canvas.getBoundingClientRect();
    const px = cx - rect.left;
    const py = cy - rect.top;
    const s = store.state;
    const halfH = rect.height / 2;
    const tan = Math.tan((FOV * Math.PI) / 360);

    let best: { id: string; kind: PickKind; inside: boolean; d: number; far: number } | null = null;
    const consider = (id: string, kind: PickKind, pos: THREE.Vector3, radius: number) => {
      _pick.copy(pos).project(this.camera);
      if (_pick.z >= 1) return;
      const sx = (_pick.x * 0.5 + 0.5) * rect.width;
      const sy = (-_pick.y * 0.5 + 0.5) * rect.height;
      const d = Math.hypot(sx - px, sy - py);
      const far = this.camera.position.distanceTo(pos);
      const rPx = radius > 0 ? (radius / (far * tan)) * halfH : 0;
      const inside = d <= rPx;
      if (!inside && d > Math.max(PICK_SLOP, rPx + PICK_SLOP)) return;
      if (!best) { best = { id, kind, inside, d, far }; return; }
      if (inside !== best.inside) { if (inside) best = { id, kind, inside, d, far }; return; }
      const better = inside ? far < best.far : d < best.d;
      if (better) best = { id, kind, inside, d, far };
    };

    if (s.realm === 'spiritual') {
      if (s.era <= 0) {
        if (s.hovered) store.set('hovered', null);
        if (click) store.set('selected', null);
        return;
      }
      for (const sh of COSMERE.shards) {
        if (!isVisible(sh, s.readProgress)) continue;
        const p = this.spiritual.motePosition(sh.id);
        if (p) consider(sh.id, 'shard', p, 1.2);
      }
      for (const d of DAWNSHARDS) {
        if (!isVisible(d, s.readProgress)) continue;
        const p = this.spiritual.dawnPosition(d.id);
        if (p) consider(d.id, 'dawnshard', p, 1.4);
      }
      const shard = best as { id: string } | null;
      if (!shard) {
        if (s.hovered) store.set('hovered', null);
        if (click) store.set('selected', null);
        return;
      }
      store.set('hovered', shard.id);
      if (click) store.set('selected', shard.id);
      return;
    }

    const globe = isGlobeScale(s.scale);
    if (!globe) {
      for (const sys of COSMERE.systems) {
        if (!systemOnTheMap(sys.id, s.readProgress, s.era)) continue;
        const p = this.orrery.systemPosition(sys.id);
        if (!p) continue;
        // At Cosmere the orbit rings are the thing you see. A 1.6-unit sun
        // is a few pixels; the rings are the size of a hand. Click those.
        const r = s.scale === 'cosmere' ? systemExtent(sys.id) : 2.4;
        consider(sys.id, 'system', p, r);
      }
      if (s.realm === 'cognitive') {
        for (const hub of HUBS) {
          if (!onTheMap(hub, s.readProgress, s.era)) continue;
          const p = this.presence.hubPosition(hub.id);
          if (p) consider(hub.id, 'hub', p, 1.8);
        }
      }
    }
    for (const body of COSMERE.bodies) {
      if (globe && body.system !== s.focusedSystem) continue;
      if (!onTheMap(body, s.readProgress, s.era)) continue;
      const p = this.orrery.bodyPosition(body.id);
      if (p) consider(body.id, 'body', p, body.radius);
    }
    for (const moon of COSMERE.moons) {
      if (!this.orrery.moonShown(moon.id) || !isVisible(moon, s.readProgress)) continue;
      const parent = bodyById[moon.parent];
      if (parent && !onTheMap(parent, s.readProgress, s.era)) continue;
      const p = this.orrery.moonPosition(moon.id);
      if (p) consider(moon.id, 'moon', p, Math.max(moon.radius, 0.4));
    }
    if (globe && s.focusedBody) {
      const body = bodyById[s.focusedBody];
      const origin = this.orrery.bodyPosition(s.focusedBody);
      if (body && origin) {
        const spin = this.orrery.bodySpin(s.focusedBody);
        for (const loc of COSMERE.locations) {
          if (loc.body !== body.id || !onTheMap(loc, s.readProgress, s.era)) continue;
          if (s.realm === 'cognitive') {
            const door = COSMERE.perps.find((p) => p.at === loc.id);
            if (loc.realm !== 'cognitive' && !(door && onTheMap(door, s.readProgress, s.era))) continue;
          } else if (loc.realm === 'cognitive') continue;
          uvOnBody(loc.u, loc.v, body.radius * 1.015, spin, _surf);
          // Skip the far side: the globe is in the way.
          _toCam.copy(this.camera.position).sub(origin).sub(_surf).normalize();
          if (_toCam.dot(_surf.clone().normalize()) < 0.02) continue;
          consider(loc.id, 'location', _surf.add(origin), 0);
        }
      }
    }
    if (s.scale === 'system' || s.scale === 'globe') {
      for (const ch of COSMERE.characters) {
        if (!isVisible(ch, s.readProgress)) continue;
        const at = characterAt(ch, s.era);
        if (!at?.body) continue;
        if (globe && at.body !== s.focusedBody) continue;
        const origin = this.orrery.bodyPosition(at.body);
        if (!origin) continue;
        consider(ch.id, 'character', origin, 0);
      }
    }

    const hit = best as { id: string; kind: PickKind } | null;
    this.canvas.style.cursor = hit ? 'pointer' : 'grab';
    if (!hit) {
      if (s.hovered) store.set('hovered', null);
      this.hoverAnchor?.(null);
      if (click) store.set('selected', null);
      return;
    }
    store.set('hovered', hit.id);
    this.hoverAnchor?.({ x: cx, y: cy });
    if (!click) return;
    if (hit.kind === 'character') {
      store.set('selected', hit.id);
      return;
    }
    if (hit.kind === 'location') {
      const loc = COSMERE.locations.find((l) => l.id === hit.id);
      if (!loc) return;
      const dive = s.focusedLocation === loc.id
        && (s.scale === 'surface' || s.scale === 'city')
        && canEnterCity(loc, s.era, s.realm);
      this.focusLocation(loc.id, loc.body, dive ? 'city' : 'surface');
      return;
    }
    if (hit.kind === 'hub') {
      this.focusHub(hit.id);
      return;
    }
    if (hit.kind === 'moon') {
      this.focusMoon(hit.id);
      return;
    }
    if (hit.kind === 'dawnshard' || hit.kind === 'shard') {
      store.set('selected', hit.id);
      return;
    }
    if (hit.kind === 'system') {
      // Already inside it: one click keeps going, down to the nearest world.
      if (s.scale === 'system' && s.focusedSystem === hit.id) return;
      this.focusId(hit.id, 'system');
      return;
    }
    const next: Scale = s.focusedBody === hit.id && s.scale === 'globe' ? 'surface' : 'globe';
    this.focusId(hit.id, next);
  }

  /**
   * Panels can open after a subject is framed — a deep link lands before the
   * HUD exists — so re-fit when the free rectangle changes, unless the reader
   * has taken the zoom into their own hands since.
   */
  private refit(): void {
    const f = this.framing;
    if (!f) return;
    if (Math.abs(this.rig.goalDistance - f.commanded) > f.commanded * 0.02) {
      this.framing = null;
      return;
    }
    const want = this.rig.framingDistance(f.radius, f.fill);
    if (Math.abs(want - f.commanded) < 0.02) return;
    f.commanded = want;
    this.rig.setDistance(want);
  }

  /**
   * Turn the globe until a place on it is facing the camera, with the camera
   * still standing sunward so the place is lit. The camera solves the
   * latitude, the body's spin solves the longitude.
   */
  private focusLocation(id: string, bodyId: string, scale: Scale): void {
    const loc = COSMERE.locations.find((l) => l.id === id);
    const body = bodyById[bodyId];
    const p = this.orrery.bodyPosition(bodyId);
    if (!loc || !body || !p) return;
    store.set('focusedBody', bodyId);
    store.set('focusedSystem', body.system);
    store.set('focusedLocation', id);
    store.set('selected', id);
    store.set('scale', scale);
    store.set('isPlaying', false);

    const sun = this.orrery.systemPosition(body.system);
    const heading = sun ? Math.atan2(p.x - sun.x, p.z - sun.z) : 0;
    const theta = heading + Math.PI - SURFACE_SUN_OFFSET;
    const face = uvFacing(loc.u, loc.v, 0);
    this.orrery.setSpinLock(bodyId, theta - face.theta);
    // Soften a polar stare a little; a globe reads better near the equator.
    this.rig.setAngles(theta, Math.PI / 2 + (face.phi - Math.PI / 2) * 0.85);
    const fill = scale === 'city' ? 0.86 : 0.74;
    const dist = this.rig.framingDistance(body.radius, fill);
    this.framing = { radius: body.radius, fill, commanded: dist };
    this.rig.flyTo(p, dist, 2.0);
  }

  private focusHub(id: string): void {
    const hub = hubById[id];
    if (!hub) return;
    const p = new THREE.Vector3();
    if (!hubWorld(id, (sys) => this.orrery.systemPosition(sys), p)) return;
    store.set('selected', id);
    store.set('focusedBody', null);
    store.set('focusedLocation', null);
    store.set('scale', 'cosmere');
    store.set('realm', 'cognitive');
    const dist = this.rig.framingDistance(8, 0.45);
    this.framing = { radius: 8, fill: 0.45, commanded: dist };
    this.rig.flyTo(p, dist, 2.0);
  }

  /**
   * At globe scale the subject is a planet mid-orbit. Ride its frame: the pose
   * moves with it and turns with the sun, so the shot stays centred and lit
   * however fast the playhead runs. With a place on that planet selected, ride
   * its spin too, so the pin you clicked stays under the camera.
   */
  private trackFocus(
    scale: Scale,
    focusedBody: string | null,
    focusedLocation: string | null,
    cinematic: boolean,
  ): void {
    if (!focusedBody || cinematic || !isGlobeScale(scale)) {
      this.follow = null;
      this.orrery.setSpinLock(null);
      return;
    }
    const p = this.orrery.bodyPosition(focusedBody);
    if (!p) { this.follow = null; return; }
    const body = bodyById[focusedBody];
    const sun = body ? this.orrery.systemPosition(body.system) : undefined;
    const heading = sun ? Math.atan2(p.x - sun.x, p.z - sun.z) : 0;
    // A selected place keeps facing the camera: the body's spin tracks the
    // same sunward heading the camera rides, so the two never drift apart.
    const pin = scale === 'globe' ? null
      : COSMERE.locations.find((l) => l.id === focusedLocation && l.body === focusedBody);
    if (pin) {
      const face = uvFacing(pin.u, pin.v, 0);
      this.orrery.setSpinLock(focusedBody, heading + Math.PI - SURFACE_SUN_OFFSET - face.theta);
    } else {
      this.orrery.setSpinLock(null);
    }

    if (this.follow && this.follow.id === focusedBody) {
      _ride.subVectors(p, this.follow.pos);
      let turn = heading - this.follow.heading;
      if (turn > Math.PI) turn -= Math.PI * 2;
      else if (turn < -Math.PI) turn += Math.PI * 2;
      this.rig.ride(_ride, turn);
      this.follow.pos.copy(p);
      this.follow.heading = heading;
    } else {
      this.follow = { id: focusedBody, pos: p.clone(), heading };
    }
    this.rig.lockTarget(p);
  }

  private resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    // Budget the drawing buffer, not just the ratio. The post chain keeps
    // several full-resolution half-float buffers plus a bloom mip chain, so a
    // 1920x1200 screen at devicePixelRatio 2 asks for a 3840x2400 scene and
    // a few hundred megabytes of them. On an integrated GPU that is how a
    // context gets lost, and a lost context is a black sky with a working HUD.
    const MAX_PIXELS = 1920 * 1200;
    const want = Math.min(window.devicePixelRatio || 1, 2);
    const fit = Math.sqrt(MAX_PIXELS / Math.max(1, w * h));
    const dpr = Math.max(1, Math.min(want, fit));
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.rig.setViewport(w, h);
    this.orrery.setViewport(w * dpr, h * dpr);
    this.shadesmar.setViewport(w * dpr, h * dpr);
    this.spiritual.setViewport(w * dpr, h * dpr);
    this.post.setSize(w, h);
  }

  private frame(): void {
    const dt = Math.min(0.05, this.clock.getDelta());
    // Same origin the atlas panel uses, so Roshar's storm front sits at the
    // same longitude on the map as on the globe.
    const t = performance.now() / 1000;
    const s = store.state;

    if (s.shell === 'play' && s.isPlaying && !s.cinematic) {
      const next = s.year + s.timeRate * dt * YEARS_PER_SECOND;
      const wrapped = next > 1000 ? -8000 : next;
      if (wrapped !== s.year) {
        // The playhead ticks every frame. The HUD only cares when the slider
        // would move; notifying on every float wakes the timeline 60 times a
        // second and is a large part of the hitch.
        store.state.year = wrapped;
        const e = eraAt(wrapped);
        if (e !== s.era) store.set('era', e);
        const tick = Math.round(yearToSlider(wrapped) * 1000);
        if (tick !== this.yearTick) {
          this.yearTick = tick;
          store.touch('year');
        }
      }
    }
    const y = store.state.year;
    if (!s.cinematic && s.shell === 'play') {
      const live = store.state;
      const focused = live.focusedBody ? bodyById[live.focusedBody] : undefined;
      if (focused && !onTheMap(focused, live.readProgress, live.era)) {
        store.set('focusedBody', null);
        store.set('focusedLocation', null);
        if (live.focusedSystem && systemOnTheMap(live.focusedSystem, live.readProgress, live.era)) {
          this.focusId(live.focusedSystem, 'system');
        } else {
          this.frameCosmere(1.8);
        }
      } else if (live.focusedSystem && !systemOnTheMap(live.focusedSystem, live.readProgress, live.era)) {
        this.frameCosmere(1.8);
      }
    }
    if (!s.cinematic) {
      for (const ev of COSMERE_EVENTS) {
        if (ev.visual && this.lastYear < ev.year && y >= ev.year) this.playSkyEvent(ev.id);
      }
    }
    this.lastYear = y;
    this.eventFx.update(dt);

    // The opening pull-out crosses three scales. Derive the scale from how far
    // out the camera actually is, or the sky stays dressed for a close-up.
    if (s.cinematic) {
      const d = this.rig.distance;
      const flying: Scale = d < 12 ? 'globe' : d < 110 ? 'system' : 'cosmere';
      if (flying !== s.scale) store.set('scale', flying);
    }

    this.orrery.update(s.year, s.realm, s.era, t, {
      showOrbits: s.visual.showOrbits,
      showMoons: s.visual.showMoons,
      showAtmospheres: s.visual.showAtmospheres,
      showNebula: s.visual.showNebula,
      nebula: s.visual.nebula,
      scale: s.scale,
      focusedSystem: s.focusedSystem,
      focusedBody: s.focusedBody,
      cameraDistance: this.rig.distance,
      cameraPos: this.camera.position,
    });
    this.trackFocus(s.scale, s.focusedBody, s.focusedLocation, s.cinematic);

    this.rig.update(dt);
    store.state.viewHeading = this.rig.heading;

    if (
      this.warmQueue.length && !s.cinematic && s.shell === 'play'
      && dt < 0.017 && t - this.lastWarm > 0.08
    ) {
      this.lastWarm = t;
      const job = this.warmQueue.pop()!;
      planetPlates(this.renderer, job.kind, job.seed, job.cognitive, PLATE_SMALL);
    }

    this.labels.update(
      this.orrery, this.camera, s.readProgress,
      s.visual.showLabels && s.shell === 'play', s.scale,
      s.focusedSystem, s.focusedBody, s.era,
    );
    this.pins.update(
      this.orrery, this.camera, s.readProgress, s.focusedBody, s.scale,
      s.hovered ?? s.focusedLocation, s.realm, s.visual.showPerps, s.era,
    );
    this.presence.update(
      this.orrery, this.camera, s.era, s.year, s.readProgress, s.scale,
      s.realm === 'cognitive', s.selected,
      s.visual.showCharacters, s.visual.showShardLines,
      s.focusedSystem,
    );
    this.shadesmar.update(
      t, s.realm === 'cognitive' && !s.cinematic, s.scale, s.focusedSystem,
      this.canvas.clientHeight, FOV, s.readProgress, s.era,
      (id) => hubWorld(id, (sys) => this.orrery.systemPosition(sys), _hub),
    );
    this.spiritual.update(
      t, s.era, s.realm === 'spiritual', this.camera, s.readProgress, s.selected,
    );
    if (s.realm === 'spiritual') {
      // Nothing physical belongs in here, not even the names.
      this.labels.group.visible = false;
      this.pins.group.visible = false;
      this.presence.group.visible = false;
    } else {
      this.presence.group.visible = true;
    }
    this.starfield.update(
      t, this.canvas.clientHeight, FOV, s.visual.starSize, s.visual.exposure,
      s.realm === 'cognitive' ? 1 : 0,
    );

    this.post.setRealm(s.realm);
    this.post.composer.render();

    this.frames++;
    this.frameCount++;
    this.fpsAccum += dt;
    if (this.fpsAccum >= 0.5) {
      store.state.stats.fps = this.frames / this.fpsAccum;
      store.state.stats.ms = (this.fpsAccum / this.frames) * 1000;
      store.touch('stats');
      this.stepQuality(store.state.stats.fps);
      this.frames = 0;
      this.fpsAccum = 0;
    }
  }

  private stepQuality(fps: number): void {
    if (store.state.visual.quality !== 'auto') return;
    if (fps < 28) { this.fpsSlow++; this.fpsFast = 0; }
    else if (fps > 52) { this.fpsFast++; this.fpsSlow = 0; }
    else { this.fpsSlow = 0; this.fpsFast = 0; return; }
    let next = this.autoBand;
    if (this.fpsSlow > 4) next = this.autoBand === 'high' ? 'medium' : 'low';
    if (this.fpsFast > 8) next = this.autoBand === 'low' ? 'medium' : 'high';
    if (next === this.autoBand) return;
    this.autoBand = next;
    this.fpsSlow = 0;
    this.fpsFast = 0;
    this.applyQuality();
  }

  private applyQuality(): void {
    const v = store.state.visual;
    const band = v.quality === 'auto' ? this.autoBand : v.quality;
    const k = band === 'low' ? 0.4 : band === 'medium' ? 0.7 : 1;
    this.post.setBloom(v.bloom * k);
    this.post.setQuality(band);
    this.orrery.setQuality(band);
  }

  /**
   * What the renderer thinks it is. For a reader reporting a black sky: one
   * line that says which driver, whether the context is alive, and whether
   * any shader failed to build.
   */
  diagnose(): Record<string, unknown> {
    const gl = this.renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown',
      vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : 'unknown',
      contextLost: gl.isContextLost(),
      drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      pixelRatio: this.renderer.getPixelRatio(),
      programs: this.renderer.info.programs?.length ?? -1,
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      frames: this.frameCount,
      fps: Math.round(store.state.stats.fps),
      quality: store.state.visual.quality,
      band: this.autoBand,
      fault: store.state.fault,
    };
  }

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    for (const d of this.disposers) d();
    this.rig.dispose();
    this.post.dispose();
    this.renderer.dispose();
  }
}
