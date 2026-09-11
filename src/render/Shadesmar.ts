import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { COSMERE, ROUTES, isVisible, systemExtent } from '../data/index.ts';
import shadesmarVert from '../shaders/shadesmar.vert';
import shadesmarFrag from '../shaders/shadesmar.frag';
import soulsVert from '../shaders/souls.vert';
import soulsFrag from '../shaders/souls.frag';

/**
 * The Cognitive Realm as somewhere you could stand: an expanse of black glass
 * under everything, bead oceans where the worlds are, and the lights of every
 * mind in the Cosmere hanging over it.
 *
 * The Physical Realm's orrery stays where it is — the same world space, read
 * the other way — so a system you know is a system you can still find.
 */

const MAX_SYSTEMS = 16;
const SOULS = 7000;
/** Half-width of the glass plane, in orrery units. */
const SEA = 1400;
const ROUTE_STEPS = 48;

const _v = new THREE.Vector3();

export class Shadesmar {
  readonly group = new THREE.Group();

  private readonly sea: THREE.Mesh;
  private readonly seaMat: THREE.ShaderMaterial;
  private readonly souls: THREE.Points;
  private readonly soulMat: THREE.ShaderMaterial;
  private readonly routes: { line: Line2; id: string }[] = [];
  private readonly systemPos = new Map<string, THREE.Vector3>();

  constructor() {
    for (const s of COSMERE.systems) {
      this.systemPos.set(s.id, new THREE.Vector3(...s.position));
    }

    // --- the glass ------------------------------------------------------
    const systems = Array.from({ length: MAX_SYSTEMS }, () => new THREE.Vector3());
    const tints = Array.from({ length: MAX_SYSTEMS }, () => new THREE.Color());
    const radii = new Array<number>(MAX_SYSTEMS).fill(0);
    COSMERE.systems.slice(0, MAX_SYSTEMS).forEach((s, i) => {
      systems[i]!.set(...s.position);
      tints[i]!.set(s.nebula);
      radii[i] = Math.max(12, systemExtent(s.id) * 0.9);
    });

    this.seaMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHorizon: { value: new THREE.Color(0x120b26) },
        uGlass: { value: new THREE.Color(0x0a0716) },
        uBead: { value: new THREE.Color(0x2a1a52) },
        uCount: { value: Math.min(MAX_SYSTEMS, COSMERE.systems.length) },
        uSystems: { value: systems },
        uTints: { value: tints },
        uRadii: { value: radii },
        uOpacity: { value: 1 },
        uFade: { value: 520 },
      },
      vertexShader: shadesmarVert,
      fragmentShader: shadesmarFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
    this.sea = new THREE.Mesh(new THREE.PlaneGeometry(SEA * 2, SEA * 2, 1, 1), this.seaMat);
    this.sea.rotation.x = -Math.PI / 2;
    this.sea.position.y = -3.2;
    this.sea.frustumCulled = false;
    this.sea.renderOrder = -4;
    this.group.add(this.sea);

    // --- the souls ------------------------------------------------------
    // Every mind in the Cosmere is a light over there. Dense around the
    // worlds, thinning to nothing in the space between.
    const pos = new Float32Array(SOULS * 3);
    const col = new Float32Array(SOULS * 3);
    const size = new Float32Array(SOULS);
    const seed = new Float32Array(SOULS);
    const drift = new Float32Array(SOULS);
    const list = COSMERE.systems;
    const tint = new THREE.Color();
    for (let i = 0; i < SOULS; i++) {
      const halo = i % 7 === 0;
      const sys = list[Math.floor(Math.random() * list.length)]!;
      const at = this.systemPos.get(sys.id)!;
      const spread = halo ? 260 : Math.max(14, systemExtent(sys.id)) * (0.5 + Math.random() * 1.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = spread * Math.pow(Math.random(), halo ? 0.6 : 0.45);
      pos[i * 3] = at.x + r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = at.y + r * Math.cos(phi) * 0.34;
      pos[i * 3 + 2] = at.z + r * Math.sin(phi) * Math.sin(theta);
      tint.set(sys.nebula).lerp(new THREE.Color(0xd8cfff), 0.35 + Math.random() * 0.5);
      col[i * 3] = tint.r;
      col[i * 3 + 1] = tint.g;
      col[i * 3 + 2] = tint.b;
      size[i] = 0.16 + Math.pow(Math.random(), 3.4) * 1.5;
      seed[i] = Math.random();
      drift[i] = 0.05 + Math.random() * 0.12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aDrift', new THREE.BufferAttribute(drift, 1));

    this.soulMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSizeScale: { value: 400 },
        uScale: { value: 1 },
      },
      vertexShader: soulsVert,
      fragmentShader: soulsFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.souls = new THREE.Points(geo, this.soulMat);
    this.souls.frustumCulled = false;
    this.souls.renderOrder = -3;
    this.group.add(this.souls);

    this.group.visible = false;
  }

  /** Screen-space line width needs the drawing buffer, same as the orrery. */
  setViewport(w: number, h: number): void {
    for (const r of this.routes) (r.line.material as LineMaterial).resolution.set(w, h);
  }

  /**
   * Routes are built lazily: the first Cognitive frame is the first time they
   * are wanted, and at that point the hub positions exist.
   */
  private ensureRoutes(hubAt: (id: string) => THREE.Vector3 | null): void {
    if (this.routes.length) return;
    for (const route of ROUTES) {
      const a = this.systemPos.get(route.from);
      const b = this.systemPos.get(route.to);
      if (!a || !b) continue;
      const via = route.via ? hubAt(route.via) : null;
      const mid = via ?? _v.copy(a).add(b).multiplyScalar(0.5).clone();
      // Quadratic through the waypoint, lifted so the road arcs over the sea.
      const lift = a.distanceTo(b) * 0.06;
      const pts: number[] = [];
      const cols: number[] = [];
      const tint = new THREE.Color(0xb39dfb);
      for (let i = 0; i < ROUTE_STEPS; i++) {
        const t = i / (ROUTE_STEPS - 1);
        const it = 1 - t;
        const x = it * it * a.x + 2 * it * t * mid.x + t * t * b.x;
        const y = it * it * a.y + 2 * it * t * mid.y + t * t * b.y + Math.sin(t * Math.PI) * lift;
        const z = it * it * a.z + 2 * it * t * mid.z + t * t * b.z;
        pts.push(x, y, z);
        // Bright at the ends, so a road reads as joining two places.
        const k = 0.35 + 0.65 * Math.abs(Math.cos(t * Math.PI));
        cols.push(tint.r * k, tint.g * k, tint.b * k);
      }
      const geo = new LineGeometry();
      geo.setPositions(pts);
      geo.setColors(cols);
      const mat = new LineMaterial({
        linewidth: 1.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      mat.resolution.set(window.innerWidth, window.innerHeight);
      const line = new Line2(geo, mat);
      line.computeLineDistances();
      line.frustumCulled = false;
      line.renderOrder = -2;
      this.group.add(line);
      this.routes.push({ line, id: route.id });
    }
  }

  update(
    time: number,
    visible: boolean,
    scale: string,
    height: number,
    fov: number,
    progress: Record<string, number>,
    hubAt: (id: string) => THREE.Vector3 | null,
  ): void {
    this.group.visible = visible;
    if (!visible) return;
    this.ensureRoutes(hubAt);

    const wide = scale === 'cosmere' || scale === 'system';
    this.seaMat.uniforms.uTime.value = time;
    // Inside a world the glass is under your feet, not a floor you look across.
    this.seaMat.uniforms.uOpacity.value = 1;
    this.seaMat.uniforms.uFade.value = scale === 'cosmere' ? 900 : 300;
    // Close to a world the beads are metres across and the plane turns into
    // a field of soft ovals behind the globe. The world is the subject there.
    this.sea.visible = wide;

    this.soulMat.uniforms.uTime.value = time;
    this.soulMat.uniforms.uSizeScale.value = (height * 0.5) / Math.tan((fov * Math.PI) / 360);
    this.soulMat.uniforms.uScale.value = wide ? 1 : 0.45;

    for (const row of this.routes) {
      const route = ROUTES.find((r) => r.id === row.id);
      const seen = route ? isVisible(route, progress) : false;
      row.line.visible = wide && seen;
      const mat = row.line.material as LineMaterial;
      // Traffic: the road brightens in pulses, so it reads as used.
      mat.opacity = 0.34 + 0.26 * (0.5 + 0.5 * Math.sin(time * 0.7 + row.id.length));
    }
  }
}
