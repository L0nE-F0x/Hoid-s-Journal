import * as THREE from 'three';
import type { ViewInsets } from './store.ts';

const NAV_KEYS = new Set([
  'w', 'a', 's', 'd', 'q', 'e', 'shift',
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  '=', '+', '-', '_',
]);

function isTyping(): boolean {
  const node = document.activeElement;
  if (!node) return false;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
    (node as HTMLElement).isContentEditable === true;
}

const EPS = 1e-5;
const MIN_PHI = 0.02;
const MAX_PHI = Math.PI - 0.02;
const approach = (dt: number, rate: number) => 1 - Math.exp(-dt * rate);

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export interface Waypoint {
  target: THREE.Vector3;
  radius: number;
  theta?: number;
  phi?: number;
  duration: number;
}

interface PathLeg {
  t: number;
  duration: number;
  from: { theta: number; phi: number; radius: number; target: THREE.Vector3 };
  to: { theta: number; phi: number; radius: number; target: THREE.Vector3 };
}

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly target = new THREE.Vector3();

  minRadius = 1.6;
  maxRadius = 520;
  autoRotate = false;
  autoRotateSpeed = 0.045;
  inputEnabled = true;

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (enabled) return;
    this.keys.clear();
    this.dragging = null;
    this.pointers.clear();
  }

  private readonly element: HTMLElement;
  private readonly goalTarget = new THREE.Vector3();

  private viewWidth = 1;
  private viewHeight = 1;
  private insets: ViewInsets = { left: 0, right: 0, top: 0, bottom: 0 };
  private offsetX = 0;
  private offsetY = 0;
  private goalOffsetX = 0;
  private goalOffsetY = 0;

  private theta = Math.PI * 0.28;
  private phi = Math.PI * 0.38;
  private radius = 240;
  private goalTheta = this.theta;
  private goalPhi = this.phi;
  private goalRadius = this.radius;

  private damping = 6.5;
  private goalDamping = 6.5;

  private dragging: 'orbit' | 'pan' | null = null;
  private lastX = 0;
  private lastY = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;
  private idleSince = performance.now();
  private readonly keys = new Set<string>();
  private disposers: (() => void)[] = [];
  private path: PathLeg[] = [];
  private pathIndex = 0;
  private onPathDone: (() => void) | null = null;

  constructor(camera: THREE.PerspectiveCamera, element: HTMLElement) {
    this.camera = camera;
    this.element = element;
    this.bind();
    this.applyImmediate();
  }

  get idleSeconds(): number { return (performance.now() - this.idleSince) / 1000; }
  get isCinematic(): boolean { return this.path.length > 0; }
  get distance(): number { return this.radius; }
  get heading(): number { return this.theta; }
  get elevation(): number { return this.phi; }

  private bind(): void {
    const el = this.element;
    const on = <K extends keyof HTMLElementEventMap>(
      type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, opts);
      this.disposers.push(() => el.removeEventListener(type, fn as EventListener));
    };

    on('pointerdown', (e) => {
      if (this.path.length) this.skipCinematic();
      if (!this.inputEnabled) return;
      el.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.poke();
      if (this.pointers.size === 1) {
        this.dragging = e.button === 2 || e.button === 1 || e.shiftKey ? 'pan' : 'orbit';
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      } else if (this.pointers.size === 2) {
        this.dragging = null;
        this.pinchDistance = this.currentPinch();
      }
    });

    on('pointermove', (e) => {
      const p = this.pointers.get(e.pointerId);
      if (p) { p.x = e.clientX; p.y = e.clientY; }
      if (this.pointers.size === 2) {
        const d = this.currentPinch();
        if (this.pinchDistance > 0 && d > 0) this.dolly(Math.pow(this.pinchDistance / d, 1.6));
        this.pinchDistance = d;
        this.poke();
        return;
      }
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.poke();
      if (this.dragging === 'orbit') {
        const k = 2.6 / el.clientHeight;
        this.goalTheta -= dx * k;
        this.goalPhi = clamp(this.goalPhi - dy * k, MIN_PHI, MAX_PHI);
      } else {
        this.pan(dx, dy);
      }
    });

    const end = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinchDistance = 0;
      if (this.pointers.size === 0) this.dragging = null;
    };
    on('pointerup', end);
    on('pointercancel', end);
    on('lostpointercapture', end);

    on('wheel', (e) => {
      if (!this.inputEnabled) return;
      e.preventDefault();
      this.poke();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      this.dolly(Math.exp(e.deltaY * unit * 0.0011));
    }, { passive: false });

    on('contextmenu', (e) => e.preventDefault());

    const keyDown = (e: KeyboardEvent) => {
      if (!this.inputEnabled || isTyping()) return;
      const k = e.key.toLowerCase();
      if (this.path.length && (NAV_KEYS.has(k) || k === 'escape' || k === ' ')) {
        this.skipCinematic();
        return;
      }
      if (!NAV_KEYS.has(k)) return;
      e.preventDefault();
      this.keys.add(k);
      this.poke();
    };
    const keyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
    const blur = () => this.keys.clear();
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', blur);
    this.disposers.push(() => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur);
    });
  }

  private applyKeys(dt: number): void {
    if (this.keys.size === 0) return;
    const fast = this.keys.has('shift') ? 2.6 : 1;
    const pan = this.radius * 0.85 * dt * fast;
    const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
    const up = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3().crossVectors(up, right).normalize();
    const k = this.keys;
    if (k.has('a') || k.has('arrowleft')) this.goalTarget.addScaledVector(right, -pan);
    if (k.has('d') || k.has('arrowright')) this.goalTarget.addScaledVector(right, pan);
    if (k.has('w') || k.has('arrowup')) this.goalTarget.addScaledVector(forward, pan);
    if (k.has('s') || k.has('arrowdown')) this.goalTarget.addScaledVector(forward, -pan);
    if (k.has('q')) this.goalTarget.addScaledVector(up, -pan);
    if (k.has('e')) this.goalTarget.addScaledVector(up, pan);
    if (k.has('=') || k.has('+')) this.dolly(Math.exp(-dt * 1.6));
    if (k.has('-') || k.has('_')) this.dolly(Math.exp(dt * 1.6));
    this.poke();
  }

  private currentPinch(): number {
    const [a, b] = [...this.pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private poke(): void { this.idleSince = performance.now(); }

  private dolly(factor: number): void {
    this.goalRadius = clamp(this.goalRadius * factor, this.minRadius, this.maxRadius);
  }

  private pan(dx: number, dy: number): void {
    const scale = (2 * this.radius * Math.tan((this.camera.fov * Math.PI) / 360)) / this.element.clientHeight;
    const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
    this.goalTarget.addScaledVector(right, -dx * scale);
    this.goalTarget.addScaledVector(up, dy * scale);
  }

  /** Canvas size in CSS pixels. */
  setViewport(width: number, height: number): void {
    this.viewWidth = Math.max(1, width);
    this.viewHeight = Math.max(1, height);
    this.refreshOffset();
  }

  /**
   * Panels report the edges they cover (`store.insets`). The camera keeps
   * rendering the whole canvas and shifts its frustum so the subject lands in
   * the middle of what is left, instead of behind the atlas.
   */
  setInsets(insets: ViewInsets): void {
    this.insets = insets;
    this.refreshOffset();
  }

  /** The rectangle of canvas the panels leave, in CSS pixels. */
  private freeRect(): { x0: number; x1: number; y0: number; y1: number } {
    const w = this.viewWidth;
    const h = this.viewHeight;
    let l = Math.max(0, this.insets.left);
    let r = Math.max(0, this.insets.right);
    let t = Math.max(0, this.insets.top);
    let b = Math.max(0, this.insets.bottom);
    const minW = w * 0.34;
    const minH = h * 0.34;
    if (w - l - r < minW) {
      const k = Math.max(0, w - minW) / Math.max(1, l + r);
      l *= k;
      r *= k;
    }
    if (h - t - b < minH) {
      const k = Math.max(0, h - minH) / Math.max(1, t + b);
      t *= k;
      b *= k;
    }
    return { x0: l, x1: w - r, y0: t, y1: h - b };
  }

  private refreshOffset(): void {
    const f = this.freeRect();
    this.goalOffsetX = (f.x0 + f.x1) / 2 - this.viewWidth / 2;
    this.goalOffsetY = (f.y0 + f.y1) / 2 - this.viewHeight / 2;
  }

  /**
   * Distance at which a sphere of `radius` fills `fill` of the free rectangle.
   * `axis` picks which side to fit: 'min' for a round subject, 'width' for a
   * wide flat one like the plane of the Cosmere.
   */
  /**
   * How far to stand so a sphere of `radius` fills `fill` of the free frame.
   *
   * `lift` is added before the clamps, for framing something that sits *on* a
   * body rather than being one: a city is a patch a tenth of a radius across,
   * and the distance that frames it has to be measured from the ground it
   * stands on, not from the planet's core.
   */
  framingDistance(radius: number, fill = 0.52, axis: 'min' | 'width' = 'min', lift = 0): number {
    const f = this.freeRect();
    const px = axis === 'width'
      ? Math.max(1, f.x1 - f.x0)
      : Math.max(1, Math.min(f.x1 - f.x0, f.y1 - f.y0));
    const tan = Math.tan((this.camera.fov * Math.PI) / 360);
    const d = (radius * this.viewHeight) / Math.max(0.05, fill * px * tan);
    return clamp(lift + Math.max(d, radius * 2.2), this.minRadius, this.maxRadius);
  }

  /**
   * Carry the whole pose along with a moving subject. A planet at globe scale
   * crosses its own orbit faster than a damped target can chase it, and the
   * sun swings round with it, so the frame rides the orbit instead.
   */
  ride(delta: THREE.Vector3, deltaTheta: number): void {
    this.target.add(delta);
    this.goalTarget.add(delta);
    this.theta += deltaTheta;
    this.goalTheta += deltaTheta;
  }

  /** The distance the rig is heading for, whoever last asked for it. */
  get goalDistance(): number { return this.goalRadius; }

  /** Change how far out we stand without touching where we are looking. */
  setDistance(distance: number, damping = 3.2): void {
    this.goalRadius = clamp(distance, this.minRadius, this.maxRadius);
    this.damping = damping;
    this.goalDamping = 6.5;
  }

  flyTo(point: THREE.Vector3, distance: number, damping = 2.2): void {
    this.path = [];
    this.goalTarget.copy(point);
    this.goalRadius = clamp(distance, this.minRadius, this.maxRadius);
    this.damping = damping;
    this.goalDamping = 6.5;
    this.poke();
  }

  /** Keep orbiting a moving point (a planet in flight) without changing distance. */
  lockTarget(point: THREE.Vector3): void {
    this.goalTarget.copy(point);
  }

  /**
   * Nested cinematic: a sequence of damped flights (planet → system → Cosmere).
   * Each waypoint is a smoothstep from the previous pose.
   */
  playPath(waypoints: Waypoint[], onDone?: () => void): void {
    if (waypoints.length === 0) return;
    this.onPathDone = onDone ?? null;
    this.path = [];
    let from = {
      theta: this.theta,
      phi: this.phi,
      radius: this.radius,
      target: this.target.clone(),
    };
    for (const w of waypoints) {
      const to = {
        theta: w.theta ?? this.theta + 0.85,
        phi: w.phi ?? this.phi,
        radius: w.radius,
        target: w.target.clone(),
      };
      this.path.push({ t: 0, duration: w.duration, from, to });
      from = {
        theta: to.theta,
        phi: to.phi,
        radius: to.radius,
        target: to.target.clone(),
      };
    }
    this.pathIndex = 0;
    const first = this.path[0]!;
    this.theta = first.from.theta;
    this.phi = first.from.phi;
    this.radius = first.from.radius;
    this.target.copy(first.from.target);
    this.goalTheta = this.theta;
    this.goalPhi = this.phi;
    this.goalRadius = this.radius;
    this.goalTarget.copy(this.target);
    this.applyImmediate();
  }

  skipCinematic(): void {
    if (!this.path.length) return;
    const last = this.path[this.path.length - 1]!;
    this.path = [];
    this.goalTheta = last.to.theta;
    this.goalPhi = last.to.phi;
    this.goalRadius = last.to.radius;
    this.goalTarget.copy(last.to.target);
    this.damping = 4.2;
    this.goalDamping = 6.5;
    const done = this.onPathDone;
    this.onPathDone = null;
    done?.();
    this.poke();
  }

  /** Theta accumulates as you drag, so aim at the nearest equivalent angle. */
  setAngles(theta: number, phi: number): void {
    const turn = Math.PI * 2;
    const delta = (((theta - this.theta + Math.PI) % turn) + turn) % turn - Math.PI;
    this.goalTheta = this.theta + delta;
    this.goalPhi = clamp(phi, MIN_PHI, MAX_PHI);
  }

  update(dt: number): void {
    const ok = approach(dt, 5.5);
    this.offsetX += (this.goalOffsetX - this.offsetX) * ok;
    this.offsetY += (this.goalOffsetY - this.offsetY) * ok;

    if (this.path.length) {
      const leg = this.path[this.pathIndex]!;
      leg.t = Math.min(1, leg.t + dt / leg.duration);
      const u = leg.t;
      const s = u * u * (3 - 2 * u);
      const a = leg.from;
      const b = leg.to;
      this.theta = a.theta + (b.theta - a.theta) * s;
      this.phi = a.phi + (b.phi - a.phi) * s;
      this.radius = a.radius + (b.radius - a.radius) * s;
      this.target.lerpVectors(a.target, b.target, s);
      this.goalTheta = this.theta;
      this.goalPhi = this.phi;
      this.goalRadius = this.radius;
      this.goalTarget.copy(this.target);
      this.applyImmediate();
      if (u >= 1) {
        this.pathIndex += 1;
        if (this.pathIndex >= this.path.length) {
          this.path = [];
          const done = this.onPathDone;
          this.onPathDone = null;
          done?.();
          this.poke();
        }
      }
      return;
    }

    this.applyKeys(dt);
    if (this.autoRotate && !this.dragging && this.idleSeconds > 2.5) {
      this.goalTheta += this.autoRotateSpeed * dt;
    }

    this.damping += (this.goalDamping - this.damping) * approach(dt, 1.4);
    const k = approach(dt, this.damping);
    this.theta += (this.goalTheta - this.theta) * k;
    this.phi += (this.goalPhi - this.phi) * k;
    this.radius += (this.goalRadius - this.radius) * k;
    this.target.lerp(this.goalTarget, k);
    this.applyImmediate();
  }

  private applyImmediate(): void {
    const sinPhi = Math.max(EPS, Math.sin(this.phi));
    this.camera.position.set(
      this.target.x + this.radius * sinPhi * Math.sin(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sinPhi * Math.cos(this.theta),
    );
    this.camera.lookAt(this.target);
    this.camera.near = Math.max(0.05, this.radius * 0.002);
    this.camera.far = Math.max(4000, this.radius * 8 + 2500);
    // Negative: pushing the frustum window left slides the subject right.
    if (Math.abs(this.offsetX) > 0.5 || Math.abs(this.offsetY) > 0.5) {
      this.camera.setViewOffset(
        this.viewWidth, this.viewHeight,
        -this.offsetX, -this.offsetY,
        this.viewWidth, this.viewHeight,
      );
    } else if (this.camera.view?.enabled) {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    for (const d of this.disposers) d();
  }
}
