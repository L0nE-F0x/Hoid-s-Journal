import * as THREE from 'three';
import { COSMERE, bodyById, eraAt, isVisible } from '../data/index.ts';
import { uvFacing } from '../layout/surface.ts';
import { CameraRig, type Waypoint } from './CameraRig.ts';
import { store, type CameraCue, type Scale } from './store.ts';
import { Labels } from '../render/Labels.ts';
import { Orrery } from '../render/Orrery.ts';
import { Pins } from '../render/Pins.ts';
import { Presence } from '../render/Presence.ts';
import { createPostChain, type PostChain } from '../render/post.ts';
import { Spiritual } from '../render/Spiritual.ts';
import { Starfield } from '../render/Starfield.ts';

const FOV = 52;
const CLICK_SLOP = 6;
/** Playhead years per second at rate 1. Slow enough that orbits drift. */
const YEARS_PER_SECOND = 0.08;
const _ride = new THREE.Vector3();
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
  private readonly post: PostChain;
  private readonly canvas: HTMLCanvasElement;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private pointerDown = { x: 0, y: 0, t: 0 };
  private lastPointer = { x: 0, y: 0 };
  private frames = 0;
  private fpsAccum = 0;
  private disposers: (() => void)[] = [];
  private hoverAnchor: ((p: { x: number; y: number } | null) => void) | undefined;
  private follow: { id: string; pos: THREE.Vector3; heading: number } | null = null;

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

    this.starfield = new Starfield();
    this.orrery = new Orrery();
    this.labels = new Labels();
    this.pins = new Pins();
    this.presence = new Presence();
    this.spiritual = new Spiritual();

    this.scene.add(this.starfield.points);
    this.scene.add(this.orrery.group);
    this.scene.add(this.labels.group);
    this.scene.add(this.pins.group);
    this.scene.add(this.presence.group);
    this.scene.add(this.spiritual.group);

    this.post = createPostChain(this.renderer, this.scene, this.camera);

    this.bind();
    this.resize();
    this.rig.setInputEnabled(false);
    this.rig.autoRotate = true;
    this.orrery.update(store.state.year, store.state.realm, store.state.era, 0, {
      showOrbits: true, showMoons: true, showAtmospheres: true, showNebula: true, scale: 'cosmere', focusedSystem: null,
    });

    this.disposers.push(store.on('cameraCue', (cue) => {
      if (cue) this.consumeCue(cue);
    }));
    this.disposers.push(store.on('shell', (shell) => {
      this.rig.setInputEnabled(shell === 'play');
      this.rig.autoRotate = store.state.visual.autoRotate && shell === 'title';
    }));
    this.disposers.push(store.on('visual', (v) => {
      this.rig.autoRotate = v.autoRotate && store.state.shell === 'title';
      this.post.setBloom(v.bloom);
    }));
    this.disposers.push(store.on('insets', (v) => this.rig.setInsets(v)));
    this.rig.setInsets(store.state.insets);
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
    const centre = new THREE.Vector3();
    let n = 0;
    for (const sys of COSMERE.systems) {
      const p = this.orrery.systemPosition(sys.id);
      if (!p) continue;
      centre.add(p);
      n++;
    }
    if (n) centre.multiplyScalar(1 / n);
    let spread = 40;
    for (const sys of COSMERE.systems) {
      const p = this.orrery.systemPosition(sys.id);
      if (p) spread = Math.max(spread, centre.distanceTo(p));
    }
    // The spread is a 3-D radius but the systems lie in a flattened plane seen
    // at an angle, so the on-screen width is roughly three quarters of it.
    this.rig.flyTo(centre, this.rig.framingDistance(spread * 0.78, 0.86, 'width'), damping);
    store.set('scale', 'cosmere');
    store.set('focusedSystem', null);
    store.set('focusedBody', null);
  }

  private focusId(id: string, scale: Scale): void {
    const loc = COSMERE.locations.find((l) => l.id === id);
    if (loc) { this.focusLocation(loc.id, loc.body, scale === 'city' ? 'city' : 'surface'); return; }
    const body = bodyById[id];
    if (body) {
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
      this.rig.flyTo(p, globe ? this.rig.framingDistance(body.radius) : 42, 2.0);
      return;
    }
    const sys = COSMERE.systems.find((s) => s.id === id);
    if (sys) {
      const p = this.orrery.systemPosition(id);
      if (!p) return;
      // Frame the whole disc, not a fixed distance: the Rosharan system runs
      // out to ten gas giants, the Scadrian one does not.
      const outer = COSMERE.bodies
        .filter((b) => b.system === id)
        .reduce((m, b) => Math.max(m, b.orbit.a), 8);
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
    this.canvas.addEventListener('pointerdown', down);
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointermove', move);
    this.disposers.push(() => {
      this.canvas.removeEventListener('pointerdown', down);
      this.canvas.removeEventListener('pointerup', up);
      this.canvas.removeEventListener('pointermove', move);
    });
  }

  private pickAt(cx: number, cy: number, click: boolean): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(
      [...this.orrery.pickables, ...this.pins.pickables, ...this.presence.pickables],
      false,
    );
    const hit = hits.find((h) => {
      const id = h.object.userData.id as string | undefined;
      const kind = h.object.userData.kind as string | undefined;
      if (!id || !kind) return false;
      if (kind === 'character') {
        const ch = COSMERE.characters.find((c) => c.id === id);
        return ch ? isVisible(ch, store.state.readProgress) : false;
      }
      if (kind === 'location') {
        const loc = COSMERE.locations.find((l) => l.id === id);
        return loc ? isVisible(loc, store.state.readProgress) : false;
      }
      if (kind === 'body') {
        const b = bodyById[id];
        return b ? isVisible(b, store.state.readProgress) : false;
      }
      const s = COSMERE.systems.find((x) => x.id === id);
      return s ? isVisible(s, store.state.readProgress) : false;
    });
    if (!hit) {
      store.set('hovered', null);
      this.hoverAnchor?.(null);
      if (click && store.state.scale === 'cosmere') {
        store.set('selected', null);
      }
      return;
    }
    const id = hit.object.userData.id as string;
    const kind = hit.object.userData.kind as 'body' | 'system' | 'location' | 'character';
    store.set('hovered', id);
    this.hoverAnchor?.({ x: cx, y: cy });
    if (!click) return;
    if (kind === 'character') {
      store.set('selected', id);
      return;
    }
    if (kind === 'location') {
      const loc = COSMERE.locations.find((l) => l.id === id);
      if (loc) this.focusLocation(loc.id, loc.body, 'surface');
      return;
    }
    if (kind === 'system') this.focusId(id, 'system');
    else {
      const next: Scale = store.state.scale === 'system' || store.state.scale === 'cosmere' ? 'globe' : 'surface';
      this.focusId(id, next);
    }
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
    this.rig.flyTo(p, this.rig.framingDistance(body.radius, 0.74), 2.0);
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.rig.setViewport(w, h);
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
        store.set('year', wrapped);
        const e = eraAt(wrapped);
        if (e !== s.era) store.set('era', e);
      }
    }

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
      scale: s.scale,
      focusedSystem: s.focusedSystem,
    });
    this.trackFocus(s.scale, s.focusedBody, s.focusedLocation, s.cinematic);

    this.rig.update(dt);
    store.set('viewHeading', this.rig.heading);

    this.labels.update(
      this.orrery, this.camera, s.readProgress, s.visual.showLabels, s.scale,
      s.focusedSystem, s.focusedBody,
    );
    this.pins.update(
      this.orrery, this.camera, s.readProgress, s.focusedBody, s.scale,
      s.hovered ?? s.focusedLocation,
    );
    this.presence.update(this.orrery, this.camera, s.era, s.year, s.readProgress, s.scale);
    this.spiritual.update(t, s.era, s.realm === 'spiritual');
    this.starfield.update(t, this.canvas.clientHeight, FOV, s.visual.starSize, s.visual.exposure);

    this.post.composer.render();

    this.frames++;
    this.fpsAccum += dt;
    if (this.fpsAccum >= 0.5) {
      store.state.stats.fps = this.frames / this.fpsAccum;
      store.state.stats.ms = (this.fpsAccum / this.frames) * 1000;
      store.touch('stats');
      this.frames = 0;
      this.fpsAccum = 0;
    }
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
