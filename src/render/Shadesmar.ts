import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { COSMERE, ROUTES, onTheMap, systemExtent, systemOnTheMap } from '../data/index.ts';
import seaBakeFrag from '../shaders/seaBake.frag';
import bakeVert from '../shaders/planetBake.vert';
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

const SOULS = 4200;
const ROUTE_STEPS = 48;

const _v = new THREE.Vector3();

export class Shadesmar {
  readonly group = new THREE.Group();

  readonly islands: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; system: string }[] = [];
  readonly souls: THREE.Points;
  private readonly soulMat: THREE.ShaderMaterial;
  readonly routes: { line: Line2; id: string }[] = [];
  private readonly systemPos = new Map<string, THREE.Vector3>();

  constructor(renderer: THREE.WebGLRenderer) {
    for (const s of COSMERE.systems) {
      this.systemPos.set(s.id, new THREE.Vector3(...s.position));
    }

    // --- the bead oceans ------------------------------------------------
    // One island per system rather than a floor under the whole Cosmere.
    const glass = bakeGlassSwatch(renderer);
    const discGeo = new THREE.CircleGeometry(1, 72);
    for (const sys of COSMERE.systems) {
      const centre = this.systemPos.get(sys.id)!;
      const radius = Math.max(14, systemExtent(sys.id) * 1.08);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uGlass: { value: new THREE.Color(0x0c0820) },
          uBead: { value: new THREE.Color(0x241546) },
          uTint: { value: new THREE.Color(sys.nebula).multiplyScalar(0.5) },
          uRadius: { value: radius },
          uOpacity: { value: 1 },
          uGlassPlate: { value: glass },
          uPxScale: { value: 900 },
        },
        vertexShader: shadesmarVert,
        fragmentShader: shadesmarFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });
      const mesh = new THREE.Mesh(discGeo, mat);
      mesh.scale.setScalar(radius);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.copy(centre).setY(centre.y - 1.6);
      mesh.renderOrder = -4;
      this.group.add(mesh);
      this.islands.push({ mesh, mat, system: sys.id });
    }

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
    focusedSystem: string | null,
    height: number,
    fov: number,
    progress: Record<string, number>,
    era: number,
    hubAt: (id: string) => THREE.Vector3 | null,
  ): void {
    this.group.visible = visible;
    if (!visible) return;
    this.ensureRoutes(hubAt);

    const wide = scale === 'cosmere' || scale === 'system';
    for (const island of this.islands) {
      // Close to a world the beads are metres across and the disc turns into
      // a field of soft ovals behind the globe. The world is the subject there.
      //
      // Inside a system, only that system's own bead ocean is under your feet.
      // Every island at once put a dozen pale ellipses across the frame and
      // buried the landmarks standing on them.
      const mine = scale !== 'system' || island.system === focusedSystem;
      island.mesh.visible = wide && mine && systemOnTheMap(island.system, progress, era);
      island.mat.uniforms.uTime.value = time;
      island.mat.uniforms.uOpacity.value = scale === 'system' ? 0.85 : 1;
      island.mat.uniforms.uPxScale.value = (height * 0.5) / Math.tan((fov * Math.PI) / 360);
    }

    this.soulMat.uniforms.uTime.value = time;
    this.soulMat.uniforms.uSizeScale.value = (height * 0.5) / Math.tan((fov * Math.PI) / 360);
    this.soulMat.uniforms.uScale.value = wide ? 1 : 0.45;

    for (const row of this.routes) {
      const route = ROUTES.find((r) => r.id === row.id);
      const seen = route ? onTheMap(route, progress, era) : false;
      row.line.visible = wide && seen;
      const mat = row.line.material as LineMaterial;
      // Traffic: the road brightens in pulses, so it reads as used.
      mat.opacity = 0.34 + 0.26 * (0.5 + 0.5 * Math.sin(time * 0.7 + row.id.length));
    }
  }
}


/** The glass itself, as a swatch that meets itself on both axes. */
function bakeGlassSwatch(renderer: THREE.WebGLRenderer): THREE.Texture {
  const mat = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: bakeVert,
    fragmentShader: seaBakeFrag,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rt = new THREE.WebGLRenderTarget(512, 512, {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    generateMipmaps: true,
    depthBuffer: false,
    stencilBuffer: false,
    type: THREE.UnsignedByteType,
  });
  rt.texture.anisotropy = 4;
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(rt);
  renderer.render(scene, cam);
  renderer.setRenderTarget(prev);
  quad.geometry.dispose();
  mat.dispose();
  return rt.texture;
}
