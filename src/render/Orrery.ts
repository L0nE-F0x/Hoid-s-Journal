import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { COSMERE, scadrialBiome, type Body } from '../data/index.ts';
import { keplerOffset } from '../layout/kepler.ts';
import type { Realm } from '../core/store.ts';
import { recipeFor } from '../cartography/recipes.ts';
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
import { PLATE_LARGE, PLATE_SMALL, planetPlates, seedFromId } from './planetBake.ts';

const _off = new THREE.Vector3();
const _sun = new THREE.Vector3();
const _world = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/** Which recipe a world wears at this point in its history. */
function biomeOf(body: Body, era: number) {
  return body.id === 'scadrial' ? scadrialBiome(era) : body.biome;
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

/** Gas giants that wear rings, and how wide. */
const RINGED: Record<string, [number, number, string, string]> = {
  jes: [1.62, 2.55, '#cfe0ff', '#6f8ebd'],
  vev: [1.55, 2.30, '#ffe3b0', '#b08a4e'],
  palah: [1.70, 2.72, '#e5ccff', '#8a6bb5'],
  betab: [1.58, 2.34, '#c5f2ff', '#5d97ad'],
  tanat: [1.66, 2.48, '#ffd2ac', '#a8663a'],
};

export class Orrery {
  readonly group = new THREE.Group();

  private readonly renderer: THREE.WebGLRenderer;
  private readonly systemPos = new Map<string, THREE.Vector3>();
  private readonly bodyNodes = new Map<string, BodyNode>();
  private readonly suns = new Map<string, THREE.Mesh>();
  private readonly sunMats = new Map<string, THREE.ShaderMaterial>();
  private readonly nebulae: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; system: string }[] = [];
  private readonly orbitLines = new Map<string, Line2>();
  private readonly moonMeshes = new Map<string, THREE.Mesh>();
  private readonly moonMats = new Map<string, THREE.ShaderMaterial>();
  private readonly lunagrees: { moon: string; mesh: THREE.Mesh; mat: THREE.ShaderMaterial }[] = [];
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
  private nebulaSteps = 9;

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
  }

  private buildSuns(): void {
    for (const s of COSMERE.systems) {
      const colour = new THREE.Color(s.sunColor);
      const hot = colour.clone().lerp(new THREE.Color(0xffffff), 0.78);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uSize: { value: 2.4 },
          uColor: { value: colour },
          uHot: { value: hot },
          uTime: { value: 0 },
          uSeed: { value: seedFromId(s.id) * 0.37 },
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
      const mesh = new THREE.Mesh(this.quad, mat);
      mesh.position.copy(this.systemPos.get(s.id)!);
      mesh.frustumCulled = false;
      mesh.renderOrder = 6;
      mesh.userData = { kind: 'system', id: s.id };
      this.group.add(mesh);
      this.suns.set(s.id, mesh);
      this.sunMats.set(s.id, mat);
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
      this.nebulae.push({ mesh, mat, system: s.id });
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
    if (body.kind !== 'gas-giant') return new THREE.Color(0xffffff);
    // Toward the world's own colour, but not all the way: the bands still
    // have to read as cloud rather than as a flat wash.
    return new THREE.Color(0xffffff).lerp(new THREE.Color(body.color), 0.88).multiplyScalar(1.15);
  }

  private makePlanetMat(body: Body): THREE.ShaderMaterial {
    const biome = biomeOf(body, 0);
    const recipe = recipeFor(biome);
    const plates = planetPlates(this.renderer, biome, this.plateSeed(body), false, PLATE_SMALL);
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
        uIce: { value: recipe.ice },
        uTidal: { value: recipe.tidal },
        uRingShadow: { value: RINGED[body.id] ? 0.7 : 0 },
        uRingAxis: { value: new THREE.Vector3(0, 1, 0) },
        uRingInner: { value: RINGED[body.id]?.[0] ?? 0 },
        uRingOuter: { value: RINGED[body.id]?.[1] ?? 0 },
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

      let ring: THREE.Mesh | null = null;
      let ringMat: THREE.ShaderMaterial | null = null;
      const spec = RINGED[body.id];
      if (spec) {
        const [inner, outer, c1, c2] = spec;
        ringMat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(c1) },
            uColor2: { value: new THREE.Color(c2) },
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
        ring.rotation.x = -Math.PI / 2 + 0.16;
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
        skin: `${biomeOf(body, 0)}:false:${PLATE_SMALL}`, trail, trailGeo,
      });
      this.bodyWorld.set(body.id, new THREE.Vector3());
    }
  }

  private buildOrbits(): void {
    for (const body of COSMERE.bodies) {
      const steps = 256;
      const pts: number[] = [];
      const sysPos = this.systemPos.get(body.system)!;
      for (let i = 0; i <= steps; i++) {
        const year = (i / steps) / Math.max(0.0001, body.orbit.period);
        keplerOffset(body.orbit, year, _off);
        pts.push(_off.x + sysPos.x, _off.y + sysPos.y, _off.z + sysPos.z);
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
      line.computeLineDistances();
      line.frustumCulled = false;
      line.renderOrder = -1;
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
    }
  }

  setViewport(w: number, h: number): void {
    this.viewport.set(w, h);
    for (const line of this.orbitLines.values()) {
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

  /** Globe tessellation and shader sample counts, last on the quality ladder. */
  setQuality(band: 'high' | 'medium' | 'low'): void {
    this.band = band;
    const geo = band === 'low' ? this.sphereLow : band === 'medium' ? this.sphereMid : this.sphereHigh;
    if (geo !== this.sphere) {
      this.sphere = geo;
      for (const node of this.bodyNodes.values()) node.mesh.geometry = geo;
    }
    const steps = band === 'low' ? 5 : band === 'medium' ? 8 : 12;
    const lightSteps = band === 'low' ? 3 : band === 'medium' ? 4 : 6;
    for (const node of this.bodyNodes.values()) {
      node.atmoMat.uniforms.uSteps.value = steps;
      node.atmoMat.uniforms.uLightSteps.value = lightSteps;
    }
    this.nebulaSteps = band === 'low' ? 5 : band === 'medium' ? 7 : 9;
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
    const biome = scadrialBiome(era);
    const flipped = biome !== this.lastBiome || shadesmar !== this.lastCognitive;
    this.lastBiome = biome;
    this.lastCognitive = shadesmar;
    let budget = flipped ? 4 : 2;
    for (const node of this.bodyNodes.values()) {
      const kind = biomeOf(node.body, era);
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
      node.mat.uniforms.uIce.value = shadesmar ? 0 : recipe.ice;
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
        : visual.scale === 'system' ? 0.25 : 0.05;

    for (const node of this.bodyNodes.values()) {
      keplerOffset(node.body.orbit, year, _off);
      _world.copy(node.sunPos).add(_off);
      node.mesh.position.copy(_world);
      node.atmo.position.copy(_world);
      this.bodyWorld.get(node.body.id)!.copy(_world);

      _sun.copy(node.sunPos);
      const u = node.mat.uniforms;
      u.uSunPos.value.copy(_sun);
      u.uTime.value = time;
      u.uCognitive.value = cognitive;
      u.uDetail.value = detail;
      u.uCloudSpin.value = time * 0.012;
      u.uHighstorm.value = node.body.id === 'roshar' && realm === 'physical' ? 1 : 0;
      const invested = node.body.kind === 'shardworld' && node.body.shards.length > 0 && realm === 'physical';
      u.uEmissive.value = invested ? 0.03 + 0.02 * Math.sin(time * 0.7) : 0;

      const a = node.atmoMat.uniforms;
      a.uCentre.value.copy(_world);
      a.uSunPos.value.copy(_sun);
      node.atmo.visible = visual.showAtmospheres && !shadesmar;

      if (node.ring && node.ringMat) {
        node.ring.position.copy(_world);
        node.ringMat.uniforms.uSunPos.value.copy(_sun);
        node.ringMat.uniforms.uCentre.value.copy(_world);
        node.ring.visible = !shadesmar && visual.scale !== 'cosmere';
        // Ring shadow only matters when you can see the planet.
        u.uRingShadow.value = node.ring.visible ? 0.7 : 0;
      }

      node.mesh.rotation.y = this.spinLockId === node.body.id ? this.spinLock : time * 0.04;
    }

    this.updateTrails(year, visual.scale, visual.focusedSystem, realm);

    for (const moon of COSMERE.moons) {
      const mesh = this.moonMeshes.get(moon.id);
      const parent = this.bodyWorld.get(moon.parent);
      if (!mesh || !parent) continue;
      keplerOffset(moon.orbit, year, _off);
      mesh.position.copy(parent).add(_off);
      // At Cosmere distance a moon is sub-pixel and only costs draw calls.
      mesh.visible = visual.showMoons && visual.scale !== 'cosmere'
        && (visual.scale !== 'system' || true);
      mesh.rotation.y = time * 0.05 + seedFromId(moon.id);
      const sun = this.bodyNodes.get(moon.parent)?.sunPos;
      const mat = this.moonMats.get(moon.id);
      if (sun && mat) mat.uniforms.uSunPos.value.copy(sun);
    }

    this.updateLunagrees(time, realm, visual.scale, visual.showMoons);

    const orbitsOn = visual.showOrbits && realm === 'physical'
      && (visual.scale === 'cosmere' || visual.scale === 'system');
    for (const [id, line] of this.orbitLines) {
      const body = this.bodyNodes.get(id)?.body;
      const own = !visual.focusedSystem || body?.system === visual.focusedSystem;
      line.visible = orbitsOn;
      const mat = line.material as LineMaterial;
      mat.opacity = visual.scale === 'system' ? (own ? 0.42 : 0.10) : 0.28;
    }

    // At globe scale the local star is a bloom bomb a few units wide and the
    // nebula washes the whole frame. The planet is the subject: the shader
    // still lights it from the real sun position.
    for (const n of this.nebulae) {
      const on = visual.showNebula && !globe;
      n.mesh.visible = on;
      if (!on) continue;
      const r = (shadesmar ? 28 : 26) * Math.max(0.35, visual.nebula);
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
      n.mat.uniforms.uSteps.value = visual.scale === 'cosmere' ? this.nebulaSteps - 3 : this.nebulaSteps;
    }

    for (const [id, mesh] of this.suns) {
      mesh.visible = !globe;
      const mat = this.sunMats.get(id)!;
      mat.uniforms.uTime.value = time;
      const focused = visual.focusedSystem === id;
      const size = visual.scale === 'system' ? (focused ? 3.6 : 2.6) : cognitive ? 3.1 : 2.35;
      mat.uniforms.uSize.value = size;
      mat.uniforms.uCorona.value = shadesmar ? 0.35 : 1;
      mat.uniforms.uFlare.value = visual.scale === 'cosmere' ? 0.75 : 0.4;
    }
  }

  /** Stand each spore column between its moon and the sea it falls into. */
  private updateLunagrees(time: number, realm: Realm, scale: string, showMoons: boolean): void {
    const lumar = this.bodyWorld.get('lumar-world');
    const body = this.bodyNodes.get('lumar-world')?.body;
    const close = scale === 'globe' || scale === 'surface' || scale === 'city' || scale === 'system';
    for (const row of this.lunagrees) {
      const moonPos = this.moonMeshes.get(row.moon)?.position;
      const on = !!lumar && !!body && !!moonPos && close && showMoons && realm === 'physical';
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
    year: number, scale: string, focusedSystem: string | null, realm: Realm,
  ): void {
    const on = realm === 'physical' && (scale === 'system' || scale === 'cosmere');
    for (const node of this.bodyNodes.values()) {
      const mine = scale === 'system'
        ? node.body.system === focusedSystem
        : node.body.kind !== 'gas-giant';
      if (!on || !mine) { node.trail.visible = false; continue; }
      const sysPos = node.sunPos;
      const span = 0.16 / Math.max(0.0001, node.body.orbit.period);
      const pts: number[] = [];
      const cols: number[] = [];
      const c = new THREE.Color(node.body.color);
      for (let i = 0; i < TRAIL_STEPS; i++) {
        const t = i / (TRAIL_STEPS - 1);
        keplerOffset(node.body.orbit, year - span * (1 - t), _off);
        pts.push(_off.x + sysPos.x, _off.y + sysPos.y, _off.z + sysPos.z);
        const k = Math.pow(t, 2.4) * 0.9;
        cols.push(c.r * k, c.g * k, c.b * k);
      }
      node.trailGeo.setPositions(pts);
      node.trailGeo.setColors(cols);
      node.trail.computeLineDistances();
      node.trail.visible = true;
    }
  }
}
