import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import {
  COSMERE, inEra, scadrialBiome, type Belt, type Body, type CompanionStar,
} from '../data/index.ts';
import { keplerOffset } from '../layout/kepler.ts';
import type { Realm } from '../core/store.ts';
import { plateTint, recipeFor } from '../cartography/recipes.ts';
import planetVert from '../shaders/planet.vert';
import planetFrag from '../shaders/planet.frag';
import atmoVert from '../shaders/atmosphere.vert';
import atmoFrag from '../shaders/atmosphere.frag';
import moonFrag from '../shaders/moon.frag';
import sunVert from '../shaders/sun.vert';
import sunFrag from '../shaders/sun.frag';
import nebulaVert from '../shaders/nebula.vert';
import nebulaFrag from '../shaders/nebula.frag';
import ringVert from '../shaders/ring.vert';
import ringFrag from '../shaders/ring.frag';
import sporeVert from '../shaders/spore.vert';
import sporeFrag from '../shaders/spore.frag';
import beltVert from '../shaders/belt.vert';
import beltFrag from '../shaders/belt.frag';
import { PLATE_LARGE, PLATE_SMALL, planetPlates, seedFromId } from './planetBake.ts';

const _off = new THREE.Vector3();
const _partner = new THREE.Vector3();
const _sun = new THREE.Vector3();
/** Camera this close to a parent world is close enough to see its moons. */
const MOON_NEAR = 48;
const _world = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/** Which recipe a world wears at this point in its history. */
function biomeOf(body: Body, era: number, year?: number) {
  return body.id === 'scadrial' ? scadrialBiome(era, year) : body.biome;
}

export interface PickHit {
  kind: 'body' | 'system';
  id: string;
}

interface BodyNode {
  body: Body;
  mesh: THREE.Mesh;
  atmo: THREE.Mesh;
  ring: THREE.Mesh | null;
  mat: THREE.ShaderMaterial;
  atmoMat: THREE.ShaderMaterial;
  ringMat: THREE.ShaderMaterial | null;
  systemId: string;
  sunPos: THREE.Vector3;
  /** Which albedo is currently bound, so swaps can be spread over frames. */
  skin: string;
  trail: Line2;
  trailGeo: LineGeometry;
}

const SHADESMAR_SKY = '#8b6bd6';
const TRAIL_STEPS = 26;

/**
 * Fade the half of an orbit that is behind its own star.
 *
 * A closed curve drawn at one brightness has no depth in it: from outside the
 * orbital plane a ring reads as a decal laid over the sky rather than as a
 * path the camera is standing inside. Dimming the far half restores the read,
 * and costs one dot product.
 *
 * `LineMaterial` only publishes a world position under `WORLD_UNITS`, which
 * these lines deliberately do not use — world units would make orbit guides
 * thicken as you fly toward them, which is backwards. So the varying is
 * injected instead of switched on.
 *
 * `centre` is held by reference: planet orbits bake the system position into
 * their geometry and pass that fixed point, while a moon orbit is a ring at
 * the origin that gets moved onto its planet every frame, so it passes its own
 * `position` and stays correct for free.
 */
function fadeFarSide(mat: LineMaterial, centre: THREE.Vector3, floor: number): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uOrbitCentre = { value: centre };
    shader.uniforms.uFarFade = { value: floor };
    shader.vertexShader = `varying vec3 vOrbitWorld;\n${shader.vertexShader}`.replace(
      'void main() {',
      `void main() {
        vOrbitWorld = ( modelMatrix * vec4( position.y < 0.5 ? instanceStart : instanceEnd, 1.0 ) ).xyz;`,
    );
    shader.fragmentShader = [
      'uniform vec3 uOrbitCentre;',
      'uniform float uFarFade;',
      'varying vec3 vOrbitWorld;',
      shader.fragmentShader,
    ].join('\n').replace(
      'gl_FragColor = vec4( diffuseColor.rgb, alpha );',
      `vec3 toCam = normalize( cameraPosition - vOrbitWorld );
        vec3 outward = normalize( vOrbitWorld - uOrbitCentre );
        float nearness = dot( outward, toCam ) * 0.5 + 0.5;
        gl_FragColor = vec4( diffuseColor.rgb, alpha * mix( uFarFade, 1.0, nearness ) );`,
    );
  };
  // Without this the patched and unpatched LineMaterials hash to the same
  // program and whichever compiles first wins for both.
  mat.customProgramCacheKey = () => 'ceph-orbit-farfade';
}

export class Orrery {
  readonly group = new THREE.Group();

  private readonly renderer: THREE.WebGLRenderer;
  private readonly systemPos = new Map<string, THREE.Vector3>();
  private readonly bodyNodes = new Map<string, BodyNode>();
  private readonly suns = new Map<string, THREE.Mesh>();
  private readonly sunMats = new Map<string, THREE.ShaderMaterial>();
  private readonly companions: {
    system: string; star: CompanionStar; mesh: THREE.Mesh; mat: THREE.ShaderMaterial;
  }[] = [];
  private readonly nebulae: {
    mesh: THREE.Mesh; mat: THREE.ShaderMaterial; system: string; scale: number;
  }[] = [];
  private readonly orbitLines = new Map<string, Line2>();
  private readonly moonMeshes = new Map<string, THREE.Mesh>();
  private readonly moonMats = new Map<string, THREE.ShaderMaterial>();
  private readonly moonWorld = new Map<string, THREE.Vector3>();
  private readonly moonOrbits = new Map<string, Line2>();
  private readonly lunagrees: { moon: string; mesh: THREE.Mesh; mat: THREE.ShaderMaterial }[] = [];
  private readonly belts: { belt: Belt; points: THREE.Points; mat: THREE.ShaderMaterial }[] = [];
  private readonly bodyWorld = new Map<string, THREE.Vector3>();
  private readonly sphereHigh = new THREE.SphereGeometry(1, 128, 72);
  private readonly sphereMid = new THREE.SphereGeometry(1, 64, 40);
  private readonly sphereLow = new THREE.SphereGeometry(1, 28, 18);
  private readonly quad = new THREE.PlaneGeometry(2, 2);
  private sphere = this.sphereMid;
  private readonly moonGeo = new THREE.SphereGeometry(1, 32, 24);
  private spinLockId: string | null = null;
  private spinLock = 0;
  private lastBiome: 'scadrial-ash' | 'scadrial-basin' = 'scadrial-ash';
  private lastCognitive = false;
  private band: 'high' | 'medium' | 'low' = 'high';
  private viewport = new THREE.Vector2(1512, 900);
  /** The world in front of the camera, currently wearing its large plates. */
  private detailed: string | null = null;
  private nebulaSteps = 8;
  private blank: THREE.DataTexture | null = null;
  private lastTrailYear = Number.NaN;
  private lastTrailKey = '';

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    for (const s of COSMERE.systems) {
      this.systemPos.set(s.id, new THREE.Vector3(...s.position));
    }
    this.buildSuns();
    this.buildNebulae();
    this.buildBodies();
    this.buildOrbits();
    this.buildMoons();
    this.buildLunagrees();
    this.buildBelts();
  }

  /**
   * The bands of rubble and ice the star charts draw.
   *
   * One `Points` cloud per belt, scattered through an annulus and drifting
   * differentially in the vertex shader — the inside of a belt goes round
   * faster than the outside, and a belt turning as one rigid disc reads as a
   * decal. They are drawn inside their own system only: from the Cosmere the
   * whole system is a few pixels across and a thousand specks per star is
   * noise over the thing you are actually looking at.
   */
  private buildBelts(): void {
    for (const belt of COSMERE.belts) {
      const centre = this.systemPos.get(belt.system);
      if (!centre) continue;
      const comet = belt.kind === 'comet';
      // Per unit of circumference, not per belt: a comet belt out at 45 units
      // has twice the ring to fill that an asteroid belt at 24 does, and a
      // flat thousand specks each made the outer one look like a rumour.
      const mid = (belt.inner + belt.outer) * 0.5;
      const count = Math.round(mid * (comet ? 36 : 64));
      const radius = new Float32Array(count);
      const angle = new Float32Array(count);
      const height = new Float32Array(count);
      const size = new Float32Array(count);
      const seed = new Float32Array(count);
      const pos = new Float32Array(count * 3);
      const span = belt.outer - belt.inner;
      for (let i = 0; i < count; i++) {
        // Two uniforms averaged: denser through the middle of the band than
        // at either lip, which is how both charts draw them.
        const t = (Math.random() + Math.random()) * 0.5;
        radius[i] = belt.inner + span * t;
        angle[i] = Math.random() * Math.PI * 2;
        // Ice sits in a fat, untidy shell; rubble sits in a plane.
        const spread = comet ? span * 0.38 : span * 0.1;
        height[i] = (Math.random() + Math.random() + Math.random() - 1.5) * spread;
        // Sized so a typical speck lands at one or two pixels from the
        // distance a system is framed at, and a few of them at five. Ten
        // times smaller and the band is mathematically there and invisible.
        size[i] = (comet ? 0.17 : 0.21) * (0.45 + Math.pow(Math.random(), 2.4) * 2.1);
        seed[i] = Math.random();
        // Bounding sphere only: the vertex shader places every point itself.
        pos[i * 3] = centre.x;
        pos[i * 3 + 1] = centre.y;
        pos[i * 3 + 2] = centre.z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1));
      geo.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1));
      geo.setAttribute('aHeight', new THREE.BufferAttribute(height, 1));
      geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSpin: { value: 0 },
          uViewHeight: { value: this.viewport.y },
          uPointSize: { value: 1 },
          uCentre: { value: centre.clone() },
          uColor: { value: new THREE.Color(belt.color) },
          uOpacity: { value: 1 },
        },
        vertexShader: beltVert,
        fragmentShader: beltFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      points.renderOrder = -2;
      points.visible = false;
      points.userData = { kind: 'belt', id: belt.id };
      this.group.add(points);
      this.belts.push({ belt, points, mat });
    }
  }

  private buildSuns(): void {
    const star = (id: string, colour: THREE.Color, hot: THREE.Color) => new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 2.4 },
        uColor: { value: colour },
        uHot: { value: hot },
        uTime: { value: 0 },
        uSeed: { value: seedFromId(id) * 0.37 },
        uCoreRadius: { value: 0.15 },
        uFlare: { value: 0.55 },
        uCorona: { value: 1 },
        uGain: { value: 1 },
      },
      vertexShader: sunVert,
      fragmentShader: sunFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    for (const s of COSMERE.systems) {
      const colour = new THREE.Color(s.sunColor);
      const mat = star(s.id, colour, colour.clone().lerp(new THREE.Color(0xffffff), 0.78));
      const mesh = new THREE.Mesh(this.quad, mat);
      mesh.position.copy(this.systemPos.get(s.id)!);
      mesh.frustumCulled = false;
      mesh.renderOrder = 6;
      mesh.userData = { kind: 'system', id: s.id };
      this.group.add(mesh);
      this.suns.set(s.id, mesh);
      this.sunMats.set(s.id, mat);

      // Second stars. Taldain has the only pair canon gives us: a blue-white
      // supergiant at the centre and, twice as far out as the planet and on
      // the same bearing forever, a white dwarf inside a cloud of dust. The
      // dust is why the companion's disc is the grey and its core the white —
      // the Eye of Ridos is a faint thing seen through a veil.
      for (const c of s.companions ?? []) {
        const face = new THREE.Color(c.shroud ?? c.color);
        const cMat = star(c.id, face, new THREE.Color(c.color));
        cMat.uniforms.uFlare.value = 0.22;
        const cMesh = new THREE.Mesh(this.quad, cMat);
        cMesh.frustumCulled = false;
        cMesh.renderOrder = 6;
        cMesh.userData = { kind: 'system', id: s.id };
        this.group.add(cMesh);
        this.companions.push({ system: s.id, star: c, mesh: cMesh, mat: cMat });
      }
    }
  }

  private buildNebulae(): void {
    const geo = new THREE.SphereGeometry(1, 24, 18);
    for (const s of COSMERE.systems) {
      const centre = this.systemPos.get(s.id)!;
      const tint = new THREE.Color(s.nebula);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uCentre: { value: centre.clone() },
          uRadius: { value: 26 },
          uColor: { value: tint },
          uColor2: { value: tint.clone().lerp(new THREE.Color(s.sunColor), 0.6) },
          uSunPos: { value: centre.clone() },
          uTime: { value: 0 },
          uSeed: { value: seedFromId(s.id) * 0.21 },
          uDensity: { value: 1 },
          uSteps: { value: 10 },
          uOpacity: { value: 0.8 },
        },
        vertexShader: nebulaVert,
        fragmentShader: nebulaFrag,
        transparent: true,
        depthWrite: false,
        // Back faces march exactly the same ray as the front ones. Shading
        // both is double the cost for an identical pixel.
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(centre);
      mesh.scale.setScalar(26);
      mesh.renderOrder = -5;
      this.group.add(mesh);
      this.nebulae.push({ mesh, mat, system: s.id, scale: s.nebulaScale ?? 1 });
    }
  }

  /**
   * Ten gas giants named after the Vorin numerals share three bakes between
   * them and are told apart by a tint. Ten separate plate pairs for worlds
   * nobody lands on is memory spent on the wrong thing, and one bake for all
   * ten would make the outer system a row of identical blue marbles.
   */
  private plateSeed(body: Body): number {
    if (body.kind !== 'gas-giant') return seedFromId(body.id);
    return 11 + (seedFromId(body.id) % 3) * 29;
  }

  private plateTint(body: Body): THREE.Color {
    // Shared with the atlas baker, which has to apply the same multiplier or
    // the plate and the globe are different colours. See cartography/recipes.
    const [r, g, b] = plateTint(body.kind, body.color);
    return new THREE.Color(r, g, b);
  }

  /** A neutral 1×1 stand-in, so a world can exist before its plate does. */
  private blankPlate(): THREE.Texture {
    if (!this.blank) {
      const data = new Uint8Array([90, 90, 96, 255]);
      this.blank = new THREE.DataTexture(data, 1, 1);
      this.blank.needsUpdate = true;
    }
    return this.blank;
  }

  private makePlanetMat(body: Body): THREE.ShaderMaterial {
    const biome = biomeOf(body, 0);
    const recipe = recipeFor(biome);
    // Not baked here. Sixty-two render targets allocated inside one
    // constructor is the kind of spike that loses a context on an integrated
    // GPU; the per-frame rebind below spends them two at a time instead.
    const plates = {
      albedo: this.blankPlate(),
      data: this.blankPlate(),
      texel: new THREE.Vector2(1, 1),
    };
    // Each system's light carries its own star's colour, part way: full
    // saturation would repaint the world, none of it makes every sky the same.
    const sun = new THREE.Color(0xfff1d0);
    const star = COSMERE.systems.find((s) => s.id === body.system)?.sunColor;
    if (star) sun.lerp(new THREE.Color(star), 0.22);
    return new THREE.ShaderMaterial({
      uniforms: {
        uAlbedo: { value: plates.albedo },
        uData: { value: plates.data },
        uTexel: { value: plates.texel.clone() },
        uSunPos: { value: new THREE.Vector3() },
        uSunColor: { value: sun },
        uAtmosphere: { value: new THREE.Color(body.color) },
        uTime: { value: 0 },
        uHighstorm: { value: body.id === 'roshar' ? 1 : 0 },
        uCognitive: { value: 0 },
        uEmissive: { value: 0 },
        uEmissiveColor: { value: new THREE.Color(recipe.lightColor ?? body.color) },
        uNightLights: { value: recipe.lights },
        uClouds: { value: recipe.clouds },
        uCloudTint: { value: new THREE.Color(recipe.cloudTint ?? '#eef4ff') },
        uCloudSpin: { value: 0 },
        uRelief: { value: recipe.relief * 0.06 },
        uSpecular: { value: recipe.specular },
        uDetail: { value: 0.02 },
        uSeed: { value: seedFromId(body.id) * 0.41 },
        uTidal: { value: recipe.tidal },
        uRingShadow: { value: body.rings ? 0.7 : 0 },
        uRingAxis: { value: new THREE.Vector3(0, 1, 0) },
        uCentre: { value: new THREE.Vector3() },
        uRingInner: { value: body.rings?.inner ?? 0 },
        uRingOuter: { value: body.rings?.outer ?? 0 },
        uTint: { value: this.plateTint(body) },
      },
      vertexShader: planetVert,
      fragmentShader: planetFrag,
    });
  }

  private buildBodies(): void {
    for (const body of COSMERE.bodies) {
      const mat = this.makePlanetMat(body);
      const mesh = new THREE.Mesh(this.sphere, mat);
      mesh.scale.setScalar(body.radius);
      mesh.userData = { kind: 'body', id: body.id };
      mesh.renderOrder = 1;

      const gas = body.kind === 'gas-giant';
      const shell = gas ? 1.055 : 1.12;
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: {
          uCentre: { value: new THREE.Vector3() },
          uSunPos: { value: new THREE.Vector3() },
          uSunColor: { value: gas
            ? new THREE.Color(0xffffff).lerp(new THREE.Color(body.color), 0.45)
            : new THREE.Color(0xffffff) },
          uPlanetRadius: { value: body.radius },
          uAtmoRadius: { value: body.radius * shell },
          uDensity: { value: gas ? 1.5 : 1.25 },
          uFalloff: { value: gas ? 7.0 : 5.6 },
          uWavelength: { value: new THREE.Vector3(680, 550, 450) },
          uRayleigh: { value: 1.0 },
          uMie: { value: 0.22 },
          uMieG: { value: 0.76 },
          uSteps: { value: 10 },
          uLightSteps: { value: 5 },
          uIntensity: { value: gas ? 0.85 : 1.25 },
        },
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
      });
      const atmo = new THREE.Mesh(this.sphereLow, atmoMat);
      atmo.scale.setScalar(body.radius * shell);
      atmo.renderOrder = 3;
      atmo.userData = { kind: 'body', id: body.id };

      // Which worlds wear rings is canon, and it lives in the data with the
      // rest of the lore: the ten Rosharan gas giants have none, and Ralen,
      // Aagal Uch, three of the Drominad worlds and Canticle do. Canticle's
      // are the load-bearing ones — they light its night side.
      let ring: THREE.Mesh | null = null;
      let ringMat: THREE.ShaderMaterial | null = null;
      const spec = body.rings;
      if (spec) {
        const { inner, outer } = spec;
        ringMat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(spec.color) },
            uColor2: { value: new THREE.Color(spec.color2) },
            uSunPos: { value: new THREE.Vector3() },
            uCentre: { value: new THREE.Vector3() },
            uPlanetRadius: { value: body.radius },
            uInner: { value: inner * body.radius },
            uOuter: { value: outer * body.radius },
            uSeed: { value: seedFromId(body.id) * 0.13 },
            uOpacity: { value: 0.85 },
          },
          vertexShader: ringVert,
          fragmentShader: ringFrag,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.NormalBlending,
        });
        ring = new THREE.Mesh(
          new THREE.RingGeometry(inner * body.radius, outer * body.radius, 128, 1),
          ringMat,
        );
        ring.rotation.x = -Math.PI / 2 + (spec.tilt ?? 0.16);
        ring.renderOrder = 2;
        this.group.add(ring);
      }

      // Comet trail: the arc of orbit just behind the world, brightest at it.
      const trailGeo = new LineGeometry();
      trailGeo.setPositions(new Array(TRAIL_STEPS * 3).fill(0));
      trailGeo.setColors(new Array(TRAIL_STEPS * 3).fill(0));
      const trailMat = new LineMaterial({
        linewidth: 2.4,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        dashed: false,
      });
      trailMat.resolution.copy(this.viewport);
      const trail = new Line2(trailGeo, trailMat);
      trail.computeLineDistances();
      trail.frustumCulled = false;
      trail.renderOrder = 0;

      this.group.add(mesh, atmo, trail);
      const sunPos = this.systemPos.get(body.system)!;
      this.bodyNodes.set(body.id, {
        body, mesh, atmo, ring, mat, atmoMat, ringMat, systemId: body.system, sunPos,
        skin: '', trail, trailGeo,
      });
      this.bodyWorld.set(body.id, new THREE.Vector3());
    }
  }

  private buildOrbits(): void {
    for (const body of COSMERE.bodies) {
      const steps = 256;
      const pts: number[] = [];
      const sysPos = this.systemPos.get(body.system)!;
      // A double planet's ring is baked at the origin and carried onto its
      // partner every frame, the way a moon's is. Baking the star's position
      // into it would draw Komashi's loop around UTol's sun instead.
      const anchored = !!body.orbitAround;
      const ox = anchored ? 0 : sysPos.x;
      const oy = anchored ? 0 : sysPos.y;
      const oz = anchored ? 0 : sysPos.z;
      for (let i = 0; i <= steps; i++) {
        const year = (i / steps) / Math.max(0.0001, body.orbit.period);
        keplerOffset(body.orbit, year, _off);
        pts.push(_off.x + ox, _off.y + oy, _off.z + oz);
      }
      const geo = new LineGeometry();
      geo.setPositions(pts);
      const mat = new LineMaterial({
        color: new THREE.Color(body.color).getHex(),
        linewidth: 1.1,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      mat.resolution.copy(this.viewport);
      const line = new Line2(geo, mat);
      fadeFarSide(mat, anchored ? line.position : sysPos, 0.16);
      // Two tints per orbit. Up close, at system scale, the colour says which
      // world this ring belongs to and is worth reading. Pulled back to the
      // whole Cosmere there are twenty-eight of them over thirteen systems and
      // no one is tracing any single ellipse — at that range full saturation
      // is a spirograph laid over the sky, so the rings step back toward a
      // common cool tone and let the star clouds carry the frame.
      line.userData.base = new THREE.Color(body.color);
      line.userData.calm = new THREE.Color(body.color).lerp(new THREE.Color(0x93a8c6), 0.66);
      line.computeLineDistances();
      line.frustumCulled = false;
      line.renderOrder = -1;
      line.userData = { kind: 'orbit', id: body.id };
      this.group.add(line);
      this.orbitLines.set(body.id, line);
    }
  }

  private buildMoons(): void {
    for (const moon of COSMERE.moons) {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(moon.color) },
          uSunPos: { value: new THREE.Vector3() },
          uSeed: { value: seedFromId(moon.id) * 0.73 },
          uCraters: { value: moon.parent === 'lumar-world' ? 0.15 : 0.8 },
          uGlow: { value: moon.parent === 'lumar-world' ? 0.22 : 0.0 },
          uDetail: { value: 1 },
        },
        vertexShader: planetVert,
        fragmentShader: moonFrag,
      });
      const mesh = new THREE.Mesh(this.moonGeo, mat);
      mesh.scale.setScalar(moon.radius);
      mesh.userData = { kind: 'moon', id: moon.id };
      this.group.add(mesh);
      this.moonMeshes.set(moon.id, mesh);
      this.moonMats.set(moon.id, mat);
      this.moonWorld.set(moon.id, new THREE.Vector3());

      const steps = 96;
      const pts: number[] = [];
      for (let i = 0; i <= steps; i++) {
        keplerOffset(moon.orbit, (i / steps) / Math.max(0.0001, moon.orbit.period), _off);
        pts.push(_off.x, _off.y, _off.z);
      }
      const geo = new LineGeometry();
      geo.setPositions(pts);
      const lineMat = new LineMaterial({
        color: new THREE.Color(moon.color).getHex(),
        linewidth: 1.0,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      lineMat.resolution.copy(this.viewport);
      const line = new Line2(geo, lineMat);
      // The ring lives at the origin and is moved onto its planet each frame,
      // so its own position is the centre to fade around.
      fadeFarSide(lineMat, line.position, 0.24);
      line.computeLineDistances();
      line.frustumCulled = false;
      line.renderOrder = -1;
      line.visible = false;
      line.userData = { kind: 'moon-orbit', id: moon.id };
      this.group.add(line);
      this.moonOrbits.set(moon.id, line);
    }
  }

  /** Whether a belt's specks are currently drawn, so its name can follow. */
  beltShown(id: string): boolean {
    return this.belts.find((b) => b.belt.id === id)?.points.visible ?? false;
  }

  /** Where a second star has got to, for the name that rides it. */
  companionPosition(id: string): THREE.Vector3 | undefined {
    const c = this.companions.find((x) => x.star.id === id);
    return c?.mesh.visible ? c.mesh.position : undefined;
  }

  setViewport(w: number, h: number): void {
    this.viewport.set(w, h);
    for (const line of this.orbitLines.values()) {
      (line.material as LineMaterial).resolution.set(w, h);
    }
    for (const line of this.moonOrbits.values()) {
      (line.material as LineMaterial).resolution.set(w, h);
    }
    for (const node of this.bodyNodes.values()) {
      (node.trail.material as LineMaterial).resolution.set(w, h);
    }
  }

  /**
   * Lumar's twelve columns of falling spore. Geostationary, so each one
   * stands over the sea it makes and never moves off it — which is the whole
   * reason that world's oceans are twelve different colours.
   */
  private buildLunagrees(): void {
    const geo = new THREE.CylinderGeometry(1, 1, 1, 18, 1, true);
    for (const moon of COSMERE.moons) {
      if (moon.parent !== 'lumar-world') continue;
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(moon.color) },
          uTime: { value: 0 },
          uSeed: { value: seedFromId(moon.id) * 0.61 },
          uOpacity: { value: 1 },
        },
        vertexShader: sporeVert,
        fragmentShader: sporeFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      mesh.visible = false;
      this.group.add(mesh);
      this.lunagrees.push({ moon: moon.id, mesh, mat });
    }
  }

  bodyPosition(id: string): THREE.Vector3 | undefined {
    return this.bodyWorld.get(id);
  }

  moonPosition(id: string): THREE.Vector3 | undefined {
    return this.moonWorld.get(id);
  }

  moonShown(id: string): boolean {
    return this.moonMeshes.get(id)?.visible ?? false;
  }

  systemPosition(id: string): THREE.Vector3 | undefined {
    return this.systemPos.get(id);
  }

  /** Current rotation of a body about its axis. Surface pins ride this. */
  bodySpin(id: string): number {
    return this.bodyNodes.get(id)?.mesh.rotation.y ?? 0;
  }

  /**
   * Hold one body's rotation at a given angle. The atlas uses this to turn a
   * world until the place you picked is facing the camera, and keep it there.
   */
  setSpinLock(id: string | null, spin = 0): void {
    this.spinLockId = id;
    this.spinLock = spin;
  }

  /** Shader sample counts. Mesh LOD is per-body in `update`, not a global swap. */
  setQuality(band: 'high' | 'medium' | 'low'): void {
    this.band = band;
    const steps = band === 'low' ? 4 : band === 'medium' ? 6 : 8;
    const lightSteps = band === 'low' ? 2 : band === 'medium' ? 3 : 4;
    for (const node of this.bodyNodes.values()) {
      node.atmoMat.uniforms.uSteps.value = steps;
      node.atmoMat.uniforms.uLightSteps.value = lightSteps;
    }
    this.nebulaSteps = band === 'low' ? 4 : band === 'medium' ? 6 : 8;
    for (const m of this.moonMats.values()) {
      m.uniforms.uDetail.value = band === 'low' ? 0 : 1;
    }
  }

  update(year: number, realm: Realm, era: number, time: number, visual: {
    showOrbits: boolean;
    showMoons: boolean;
    showAtmospheres: boolean;
    showNebula: boolean;
    nebula: number;
    scale: string;
    focusedSystem: string | null;
    focusedBody: string | null;
    cameraDistance: number;
    cameraPos: THREE.Vector3;
  }): void {
    const shadesmar = realm === 'cognitive';
    const cognitive = shadesmar ? 1 : 0;
    const spiritual = realm === 'spiritual';
    this.group.visible = !spiritual;
    if (spiritual) return;

    const globe = visual.scale === 'globe' || visual.scale === 'surface' || visual.scale === 'city';

    // Only the world you are standing over is worth a 2048×1024 pair. Every
    // world at once is a gigabyte and a half of texture, which an integrated
    // part will page in and out rather than admit it cannot hold.
    const wantDetail = globe ? visual.focusedBody : null;
    if (wantDetail !== this.detailed) {
      this.detailed = wantDetail;
      const node = wantDetail ? this.bodyNodes.get(wantDetail) : null;
      if (node) node.skin = '';
      for (const other of this.bodyNodes.values()) {
        if (other !== node && other.skin.endsWith(`:${PLATE_LARGE}`)) other.skin = '';
      }
    }

    // Era and Realm both repaint worlds: the Catacendre is a map swap with a
    // sky to match, and Shadesmar is the same landmass read the other way.
    // Rebinding every albedo in one frame stalls, so spend a small budget.
    const biome = scadrialBiome(era, year);
    const flipped = biome !== this.lastBiome || shadesmar !== this.lastCognitive;
    this.lastBiome = biome;
    this.lastCognitive = shadesmar;
    let budget = flipped ? 4 : 2;
    // The world you are looking at cannot wait its turn behind ten gas giants.
    const queue = [...this.bodyNodes.values()].sort((a, b) => {
      const ax = a.body.id === visual.focusedBody ? 0 : a.body.system === visual.focusedSystem ? 1 : 2;
      const bx = b.body.id === visual.focusedBody ? 0 : b.body.system === visual.focusedSystem ? 1 : 2;
      return ax - bx;
    });
    for (const node of queue) {
      const kind = biomeOf(node.body, era, year);
      const want = node.body.id === this.detailed ? PLATE_LARGE : PLATE_SMALL;
      const skin = `${kind}:${shadesmar}:${want}`;
      if (node.skin === skin) continue;
      if (budget <= 0) continue;
      budget--;
      node.skin = skin;
      const size = node.body.id === this.detailed ? PLATE_LARGE : PLATE_SMALL;
      const plates = planetPlates(this.renderer, kind, this.plateSeed(node.body), shadesmar, size);
      const recipe = recipeFor(kind);
      node.mat.uniforms.uAlbedo.value = plates.albedo;
      node.mat.uniforms.uData.value = plates.data;
      node.mat.uniforms.uTexel.value.copy(plates.texel);
      node.mat.uniforms.uClouds.value = shadesmar ? 0 : recipe.clouds;
      node.mat.uniforms.uNightLights.value = shadesmar ? 0 : recipe.lights;
      node.mat.uniforms.uSpecular.value = recipe.specular;
      node.mat.uniforms.uTidal.value = shadesmar ? 0 : recipe.tidal;
      node.mat.uniforms.uRelief.value = recipe.relief * 0.06;
      const sky = shadesmar ? SHADESMAR_SKY
        : node.body.id === 'scadrial' && kind === 'scadrial-ash' ? '#c9a07a'
          : node.body.color;
      node.mat.uniforms.uAtmosphere.value.set(sky);
      node.atmoMat.uniforms.uSunColor.value.set(shadesmar ? SHADESMAR_SKY : 0xffffff);
    }

    // Surface detail is expensive and only pays off close up.
    const detail = this.band === 'low' ? 0
      : globe ? (this.band === 'high' ? 1 : 0.6)
        : visual.scale === 'system' ? 0.25 : 0;

    for (const node of this.bodyNodes.values()) {
      // A double planet rides its partner. The partner's own offset is
      // recomputed here rather than read out of `bodyWorld`, so this does not
      // depend on which of the two the loop reaches first. Canon has one such
      // pair — UTol and Komashi — and no chains of them.
      const partner = node.body.orbitAround ? this.bodyNodes.get(node.body.orbitAround) : null;
      keplerOffset(node.body.orbit, year, _off);
      _world.copy(node.sunPos).add(_off);
      if (partner) {
        keplerOffset(partner.body.orbit, year, _partner);
        _world.add(_partner);
      }
      node.mesh.position.copy(_world);
      node.atmo.position.copy(_world);
      this.bodyWorld.get(node.body.id)!.copy(_world);

      const inSystem = !visual.focusedSystem || node.body.system === visual.focusedSystem;
      const showBody = inEra(node.body, era) && (globe
        ? node.body.id === visual.focusedBody
        : visual.scale === 'cosmere' || inSystem);
      node.mesh.visible = showBody;
      const geo = globe && node.body.id === visual.focusedBody
        ? (this.band === 'low' ? this.sphereMid : this.sphereHigh)
        : visual.scale === 'system' && inSystem
          ? (this.band === 'low' ? this.sphereLow : this.sphereMid)
          : this.sphereLow;
      if (node.mesh.geometry !== geo) node.mesh.geometry = geo;

      _sun.copy(node.sunPos);
      const u = node.mat.uniforms;
      u.uSunPos.value.copy(_sun);
      u.uTime.value = time;
      u.uCognitive.value = cognitive;
      u.uDetail.value = showBody ? detail : 0;
      u.uCloudSpin.value = time * 0.012;
      u.uHighstorm.value = node.body.id === 'roshar' && realm === 'physical' && globe ? 1 : 0;
      const invested = node.body.kind === 'shardworld' && node.body.shards.length > 0 && realm === 'physical';
      u.uEmissive.value = invested ? 0.03 + 0.02 * Math.sin(time * 0.7) : 0;
      // Clouds are seven noise evals, twice. A Cosmere-scale marble does not pay it.
      u.uClouds.value = (shadesmar || visual.scale === 'cosmere' || !showBody)
        ? 0
        : recipeFor(biomeOf(node.body, era, year)).clouds;

      const a = node.atmoMat.uniforms;
      a.uCentre.value.copy(_world);
      a.uSunPos.value.copy(_sun);
      node.atmo.visible = showBody && visual.showAtmospheres && !shadesmar && (
        (globe && node.body.id === visual.focusedBody)
        || (visual.scale === 'system' && inSystem)
      );

      u.uCentre.value.copy(_world);
      if (node.ring && node.ringMat) {
        node.ring.position.copy(_world);
        node.ringMat.uniforms.uSunPos.value.copy(_sun);
        node.ringMat.uniforms.uCentre.value.copy(_world);
        // The ring was drawn only in-system and its shadow cast only on a
        // focused globe, which are mutually exclusive: you could see a ring
        // that threw nothing, or a shadow band from a ring that was not
        // there. Both, now, wherever the world is drawn.
        node.ring.visible = showBody && !shadesmar
          && (visual.scale === 'system' ? inSystem : node.body.id === visual.focusedBody);
        u.uRingShadow.value = node.ring.visible ? 0.7 : 0;
        // The mesh is tilted off the ecliptic, so its axis is its own +Z, in
        // world space. The shader marches world space; see planet.frag.
        node.ring.updateMatrixWorld();
        (u.uRingAxis.value as THREE.Vector3)
          .set(0, 0, 1).applyQuaternion(node.ring.quaternion).normalize();
      }

      node.mesh.rotation.y = this.spinLockId === node.body.id ? this.spinLock : time * 0.04;
    }

    this.updateTrails(year, visual.scale, visual.focusedSystem, realm, era);

    for (const moon of COSMERE.moons) {
      const mesh = this.moonMeshes.get(moon.id);
      const parent = this.bodyWorld.get(moon.parent);
      const at = this.moonWorld.get(moon.id);
      if (!mesh || !parent || !at) continue;
      const parentNode = this.bodyNodes.get(moon.parent);
      const parentLive = !!parentNode && inEra(parentNode.body, era);
      keplerOffset(moon.orbit, year, _off);
      at.copy(parent).add(_off);
      mesh.position.copy(at);
      const inSystem = visual.scale === 'system' && parentNode?.body.system === visual.focusedSystem;
      const onGlobe = globe && moon.parent === visual.focusedBody;
      const near = visual.cameraPos.distanceTo(parent) < MOON_NEAR;
      const on = visual.showMoons && parentLive && (onGlobe || inSystem || near);
      mesh.visible = on;
      const ring = this.moonOrbits.get(moon.id);
      if (ring) {
        ring.position.copy(parent);
        // The rings wait for the camera. Ky has four moons and Aagal Nod six,
        // and six concentric ellipses around a planet three pixels wide reads
        // as a target painted on the sky rather than as a moon system. The
        // moons themselves stay — they are dots, which is what the star
        // charts draw.
        ring.visible = on && (onGlobe || near) && visual.showOrbits && realm === 'physical';
      }
      if (!on) continue;
      mesh.rotation.y = time * 0.05 + seedFromId(moon.id);
      const sun = parentNode?.sunPos;
      const mat = this.moonMats.get(moon.id);
      if (sun && mat) mat.uniforms.uSunPos.value.copy(sun);
    }

    this.updateLunagrees(time, realm, visual.scale, visual.focusedSystem, visual.focusedBody, visual.showMoons, era);

    for (const b of this.belts) {
      const on = realm === 'physical' && visual.scale === 'system'
        && visual.focusedSystem === b.belt.system && inEra(b.belt, era);
      b.points.visible = on;
      if (!on) continue;
      const u = b.mat.uniforms;
      u.uTime.value = time;
      // Same playhead the planets run on, so the belt drifts with them.
      u.uSpin.value = year * 5.2;
      u.uViewHeight.value = this.viewport.y;
      u.uPointSize.value = this.band === 'low' ? 0.85 : 1;
      u.uOpacity.value = this.band === 'low' ? 0.78 : 1;
    }

    const orbitsOn = visual.showOrbits && realm === 'physical'
      && (visual.scale === 'cosmere' || visual.scale === 'system');
    for (const [id, line] of this.orbitLines) {
      const body = this.bodyNodes.get(id)?.body;
      const live = !!body && inEra(body, era);
      const own = !visual.focusedSystem || body?.system === visual.focusedSystem;
      line.visible = orbitsOn && own && live;
      if (!line.visible) continue;
      // A double planet's ring is drawn around its partner, wherever the two
      // of them have got to this year.
      if (body?.orbitAround) {
        const at = this.bodyWorld.get(body.orbitAround);
        if (at) line.position.copy(at);
      }
      const mat = line.material as LineMaterial;
      const close = visual.scale === 'system';
      mat.opacity = close ? 0.42 : 0.17;
      const tint = close ? line.userData.base : line.userData.calm;
      if (tint) mat.color.copy(tint as THREE.Color);
    }

    const lit = new Set<string>();
    for (const n of this.bodyNodes.values()) {
      if (inEra(n.body, era)) lit.add(n.body.system);
    }

    // At globe scale the local star is a bloom bomb a few units wide and the
    // nebula washes the whole frame. The planet is the subject: the shader
    // still lights it from the real sun position.
    for (const n of this.nebulae) {
      const inhabited = lit.has(n.system);
      const on = inhabited && visual.showNebula && !globe
        && (visual.scale !== 'system' || n.system === visual.focusedSystem);
      n.mesh.visible = on;
      if (!on) continue;
      const r = (shadesmar ? 28 : 26) * Math.max(0.35, visual.nebula) * n.scale;
      n.mesh.scale.setScalar(r);
      n.mat.uniforms.uRadius.value = r;
      n.mat.uniforms.uTime.value = time;
      // Inside a system the cloud is all around you; drop it so it does not
      // fog the worlds you came to look at.
      const inside = visual.scale === 'system' && visual.focusedSystem === n.system;
      n.mat.uniforms.uOpacity.value = (shadesmar ? 0.9 : 0.72) * visual.nebula * (inside ? 0.28 : 1);
      n.mat.uniforms.uDensity.value = shadesmar ? 1.45 : 1;
      // Thirteen overlapping volumes at Cosmere distance are each a few
      // hundred pixels across; they do not need the step count a close one
      // does, and together they are the most expensive thing in the frame.
      // Step count follows how large the cloud is on screen. Eighteen volumes
      // at Cosmere distance are each a small puff; the march that is right
      // when you are inside a system is wasted on a cloud forty pixels across.
      const dist = Math.max(8, visual.cameraPos.distanceTo(n.mesh.position));
      const px = (r / dist) * (this.viewport.y * 0.5) / Math.tan((52 * Math.PI) / 360);
      let steps = this.nebulaSteps;
      if (px < 80) steps = 2;
      else if (px < 160) steps = Math.min(steps, 3);
      else if (px < 320) steps = Math.min(steps, Math.max(4, steps - 2));
      n.mat.uniforms.uSteps.value = steps;
    }

    for (const [id, mesh] of this.suns) {
      const inhabited = lit.has(id);
      mesh.visible = inhabited && !globe && (visual.scale !== 'system' || id === visual.focusedSystem);
      const mat = this.sunMats.get(id)!;
      mat.uniforms.uTime.value = time;
      const focused = visual.focusedSystem === id;
      // A star seen from Shadesmar is a small, distant, unmoving thing — the
      // Cognitive Realm is not lit by it. This used to make suns *larger* over
      // there (3.1 against 2.35) with the nebulae brighter behind them, so the
      // Realm read as the Physical one turned up rather than as somewhere
      // else. What carries the light over there is minds, not stars.
      const size = visual.scale === 'system'
        ? (focused ? (shadesmar ? 1.5 : 3.6) : (shadesmar ? 1.1 : 2.6))
        : shadesmar ? 0.95 : 2.35;
      mat.uniforms.uSize.value = size;
      mat.uniforms.uCorona.value = shadesmar ? 0.12 : 1;
      mat.uniforms.uFlare.value = shadesmar ? 0.05 : (visual.scale === 'cosmere' ? 0.75 : 0.4);
      // How much of the billboard is photosphere rather than corona.
      //
      // `sun.frag` limb-darkens the disc and crawls convection cells across
      // it, and at 0.15 none of that was ever visible: the disc was a twelfth
      // of the quad and the star read as a white dot with a flare on it. From
      // the Cosmere a star *should* be a point, but standing inside a system
      // it is the thing everything else orbits, so the disc opens up and the
      // granulation finally has somewhere to live.
      mat.uniforms.uCoreRadius.value = visual.scale === 'system'
        ? (focused ? 0.34 : 0.24)
        : 0.15;
    }

    for (const c of this.companions) {
      const primary = this.suns.get(c.system);
      const centre = this.systemPos.get(c.system);
      if (!primary || !centre) continue;
      c.mesh.visible = primary.visible;
      if (!c.mesh.visible) continue;
      keplerOffset(c.star.orbit, year, _off);
      c.mesh.position.copy(centre).add(_off);
      const pMat = this.sunMats.get(c.system)!;
      const u = c.mat.uniforms;
      u.uTime.value = time;
      u.uSize.value = (pMat.uniforms.uSize.value as number) * c.star.size;
      u.uCorona.value = (pMat.uniforms.uCorona.value as number) * 0.7;
      u.uFlare.value = (pMat.uniforms.uFlare.value as number) * 0.4;
      u.uCoreRadius.value = pMat.uniforms.uCoreRadius.value;
      // A white dwarf behind a dust ring is not a second sun in the frame.
      u.uGain.value = shadesmar ? 0.5 : 0.62;
    }
  }

  /** Stand each spore column between its moon and the sea it falls into. */
  private updateLunagrees(
    time: number, realm: Realm, scale: string,
    focusedSystem: string | null, focusedBody: string | null, showMoons: boolean,
    era: number,
  ): void {
    const lumar = this.bodyWorld.get('lumar-world');
    const body = this.bodyNodes.get('lumar-world')?.body;
    const live = !!body && inEra(body, era);
    const here = (scale === 'system' && focusedSystem === 'lumar')
      || ((scale === 'globe' || scale === 'surface' || scale === 'city') && focusedBody === 'lumar-world');
    for (const row of this.lunagrees) {
      const moonPos = this.moonMeshes.get(row.moon)?.position;
      const on = live && !!lumar && !!body && !!moonPos && here && showMoons && realm === 'physical';
      row.mesh.visible = on;
      if (!on || !lumar || !body || !moonPos) continue;

      _off.subVectors(moonPos, lumar);
      const far = _off.length();
      _off.normalize();
      // From just above the sea to just under the moon.
      const from = body.radius * 0.99;
      const to = far - 0.16;
      const len = Math.max(0.01, to - from);
      _world.copy(lumar).addScaledVector(_off, from + len * 0.5);
      row.mesh.position.copy(_world);
      row.mesh.quaternion.setFromUnitVectors(_up, _off);
      // Wide where it meets the water, narrower under the moon.
      row.mesh.scale.set(body.radius * 0.17, len, body.radius * 0.17);
      row.mat.uniforms.uTime.value = time;
      row.mat.uniforms.uOpacity.value = scale === 'system' ? 0.7 : 1;
    }
  }

  /**
   * The arc an orbit has just travelled, drawn brightest at the world. Only
   * the system you are in gets one — thirteen comet tails at Cosmere scale is
   * a light show, not a map.
   */
  private updateTrails(
    year: number, scale: string, focusedSystem: string | null, realm: Realm, era: number,
  ): void {
    const on = realm === 'physical' && (scale === 'system' || scale === 'cosmere');
    const key = `${scale}:${focusedSystem ?? ''}:${realm}`;
    const yearStep = Number.isNaN(this.lastTrailYear) || Math.abs(year - this.lastTrailYear) > (scale === 'cosmere' ? 1.2 : 0.25);
    const rebuild = key !== this.lastTrailKey || yearStep;
    if (rebuild) {
      this.lastTrailYear = year;
      this.lastTrailKey = key;
    }
    const steps = scale === 'cosmere' ? 10 : TRAIL_STEPS;
    for (const node of this.bodyNodes.values()) {
      const mine = scale === 'system'
        ? node.body.system === focusedSystem
        : node.body.kind !== 'gas-giant';
      if (!on || !mine || !inEra(node.body, era)) { node.trail.visible = false; continue; }
      node.trail.visible = true;
      if (!rebuild) continue;
      const sysPos = node.sunPos;
      const span = 0.16 / Math.max(0.0001, node.body.orbit.period);
      const pts: number[] = [];
      const cols: number[] = [];
      const c = new THREE.Color(node.body.color);
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        keplerOffset(node.body.orbit, year - span * (1 - t), _off);
        pts.push(_off.x + sysPos.x, _off.y + sysPos.y, _off.z + sysPos.z);
        const k = Math.pow(t, 2.4) * 0.9;
        cols.push(c.r * k, c.g * k, c.b * k);
      }
      node.trailGeo.setPositions(pts);
      node.trailGeo.setColors(cols);
      node.trail.computeLineDistances();
    }
  }
}
