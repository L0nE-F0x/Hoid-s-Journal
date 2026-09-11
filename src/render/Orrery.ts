import * as THREE from 'three';
import { COSMERE, scadrialBiome, type Body } from '../data/index.ts';
import { keplerOffset } from '../layout/kepler.ts';
import type { Realm } from '../core/store.ts';
import planetVert from '../shaders/planet.vert';
import planetFrag from '../shaders/planet.frag';
import atmoVert from '../shaders/atmosphere.vert';
import atmoFrag from '../shaders/atmosphere.frag';
import moonFrag from '../shaders/moon.frag';
import { planetTexture, seedFromId, sunTexture } from './planetTextures.ts';

const _off = new THREE.Vector3();
const _sun = new THREE.Vector3();
const _world = new THREE.Vector3();

export interface PickHit {
  kind: 'body' | 'system';
  id: string;
}

interface BodyNode {
  body: Body;
  mesh: THREE.Mesh;
  atmo: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  atmoMat: THREE.ShaderMaterial;
  systemId: string;
  sunPos: THREE.Vector3;
}

export class Orrery {
  readonly group = new THREE.Group();
  readonly pickables: THREE.Object3D[] = [];

  private readonly systemPos = new Map<string, THREE.Vector3>();
  private readonly bodyNodes = new Map<string, BodyNode>();
  private readonly sunSprites = new Map<string, THREE.Sprite>();
  private readonly nebulae: THREE.Sprite[] = [];
  private readonly orbitLines = new Map<string, THREE.Line>();
  private readonly moonMeshes = new Map<string, THREE.Mesh>();
  private readonly moonMats = new Map<string, THREE.ShaderMaterial>();
  private readonly bodyWorld = new Map<string, THREE.Vector3>();
  private readonly sphere = new THREE.SphereGeometry(1, 48, 32);
  private readonly moonGeo = new THREE.SphereGeometry(1, 16, 12);
  private spinLockId: string | null = null;
  private spinLock = 0;
  private scadrialTexAsh = planetTexture('scadrial-ash', 2);
  private scadrialTexBasin = planetTexture('scadrial-basin', 3);
  private lastBiome: 'scadrial-ash' | 'scadrial-basin' = 'scadrial-ash';

  constructor() {
    for (const s of COSMERE.systems) {
      this.systemPos.set(s.id, new THREE.Vector3(...s.position));
    }
    this.buildSuns();
    this.buildNebulae();
    this.buildBodies();
    this.buildOrbits();
    this.buildMoons();
  }

  private buildSuns(): void {
    for (const s of COSMERE.systems) {
      const mat = new THREE.SpriteMaterial({
        map: sunTexture(s.sunColor),
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      });
      const spr = new THREE.Sprite(mat);
      const p = this.systemPos.get(s.id)!;
      spr.position.copy(p);
      spr.scale.setScalar(2.35);
      spr.userData = { kind: 'system', id: s.id };
      this.group.add(spr);
      this.sunSprites.set(s.id, spr);
      this.pickables.push(spr);
    }
  }

  private buildNebulae(): void {
    for (const s of COSMERE.systems) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, s.nebula + '99');
      g.addColorStop(0.4, s.nebula + '33');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      });
      const spr = new THREE.Sprite(mat);
      spr.position.copy(this.systemPos.get(s.id)!);
      spr.scale.setScalar(28);
      spr.renderOrder = -1;
      this.group.add(spr);
      this.nebulae.push(spr);
    }
  }

  private makePlanetMat(body: Body): THREE.ShaderMaterial {
    const biome = body.id === 'scadrial' ? 'scadrial-ash' : body.biome;
    // Each system's light carries its own star's colour, part way: full
    // saturation would repaint the world, none of it makes every sky the same.
    const sun = new THREE.Color(0xfff1d0);
    const star = COSMERE.systems.find((s) => s.id === body.system)?.sunColor;
    if (star) sun.lerp(new THREE.Color(star), 0.45);
    return new THREE.ShaderMaterial({
      uniforms: {
        uAlbedo: { value: planetTexture(biome, seedFromId(body.id)) },
        uSunPos: { value: new THREE.Vector3() },
        uSunColor: { value: sun },
        uAtmosphere: { value: new THREE.Color(body.color) },
        uTime: { value: 0 },
        uHighstorm: { value: body.id === 'roshar' ? 1 : 0 },
        uCognitive: { value: 0 },
        uEmissive: { value: 0 },
        uEmissiveColor: { value: new THREE.Color(body.color) },
        uNightLights: { value: body.id === 'komashi' || body.id === 'scadrial' ? 0.8 : 0 },
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
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(body.color) },
          uSunPos: { value: new THREE.Vector3() },
          uIntensity: { value: body.kind === 'gas-giant' ? 0.55 : 0.85 },
        },
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      });
      const atmo = new THREE.Mesh(this.sphere, atmoMat);
      atmo.scale.setScalar(body.radius * 1.08);
      atmo.userData = { kind: 'body', id: body.id };
      this.group.add(mesh);
      this.group.add(atmo);
      this.pickables.push(mesh);
      const sunPos = this.systemPos.get(body.system)!;
      this.bodyNodes.set(body.id, {
        body, mesh, atmo, mat, atmoMat, systemId: body.system, sunPos,
      });
      this.bodyWorld.set(body.id, new THREE.Vector3());
    }
  }

  private buildOrbits(): void {
    for (const body of COSMERE.bodies) {
      const pts: THREE.Vector3[] = [];
      const steps = 96;
      for (let i = 0; i <= steps; i++) {
        const year = (i / steps) / Math.max(0.0001, body.orbit.period);
        keplerOffset(body.orbit, year, _off);
        pts.push(_off.clone());
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: body.color,
        transparent: true,
        opacity: 0.22,
      });
      const line = new THREE.Line(geo, mat);
      line.position.copy(this.systemPos.get(body.system)!);
      this.group.add(line);
      this.orbitLines.set(body.id, line);
    }
  }

  private buildMoons(): void {
    for (const moon of COSMERE.moons) {
      // Lit like a small world. Flat colour made them read as stickers pasted
      // over the planet, and the bloom pass turned each one into a lamp.
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(moon.color) },
          uSunPos: { value: new THREE.Vector3() },
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

  update(year: number, realm: Realm, era: number, time: number, visual: {
    showOrbits: boolean;
    showMoons: boolean;
    showAtmospheres: boolean;
    showNebula: boolean;
    scale: string;
    focusedSystem: string | null;
  }): void {
    const cognitive = realm === 'cognitive' ? 1 : 0;
    const spiritual = realm === 'spiritual';
    this.group.visible = !spiritual;

    // The Catacendre is a map swap, and the sky changes with it: ash haze
    // before, Harmony's blue after.
    const biome = scadrialBiome(era);
    if (biome !== this.lastBiome) {
      this.lastBiome = biome;
      const scad = this.bodyNodes.get('scadrial');
      if (scad) {
        const basin = biome === 'scadrial-basin';
        scad.mat.uniforms.uAlbedo.value = basin ? this.scadrialTexBasin : this.scadrialTexAsh;
        const sky = basin ? scad.body.color : '#c9a07a';
        scad.mat.uniforms.uAtmosphere.value.set(sky);
        scad.atmoMat.uniforms.uColor.value.set(sky);
      }
    }

    for (const node of this.bodyNodes.values()) {
      keplerOffset(node.body.orbit, year, _off);
      _world.copy(node.sunPos).add(_off);
      node.mesh.position.copy(_world);
      node.atmo.position.copy(_world);
      this.bodyWorld.get(node.body.id)!.copy(_world);

      _sun.copy(node.sunPos);
      node.mat.uniforms.uSunPos.value.copy(_sun);
      node.mat.uniforms.uTime.value = time;
      node.mat.uniforms.uCognitive.value = cognitive;
      node.mat.uniforms.uHighstorm.value = node.body.id === 'roshar' && realm === 'physical' ? 1 : 0;
      node.atmoMat.uniforms.uSunPos.value.copy(_sun);
      node.atmo.visible = visual.showAtmospheres;
      node.mesh.rotation.y = this.spinLockId === node.body.id ? this.spinLock : time * 0.04;
    }

    for (const moon of COSMERE.moons) {
      const mesh = this.moonMeshes.get(moon.id);
      const parent = this.bodyWorld.get(moon.parent);
      if (!mesh || !parent) continue;
      keplerOffset(moon.orbit, year, _off);
      mesh.position.copy(parent).add(_off);
      mesh.visible = visual.showMoons;
      const sun = this.bodyNodes.get(moon.parent)?.sunPos;
      const mat = this.moonMats.get(moon.id);
      if (sun && mat) mat.uniforms.uSunPos.value.copy(sun);
    }

    const orbitsOn = visual.showOrbits && realm === 'physical' && (visual.scale === 'cosmere' || visual.scale === 'system');
    for (const line of this.orbitLines.values()) line.visible = orbitsOn;
    // At globe scale the local sun sprite is a bloom bomb a few units wide and
    // the nebula washes the whole frame teal. The planet is the subject: the
    // shader still lights it from the real sun position.
    const globe = visual.scale === 'globe' || visual.scale === 'surface' || visual.scale === 'city';
    for (const n of this.nebulae) n.visible = visual.showNebula && !globe;
    for (const spr of this.sunSprites.values()) {
      spr.visible = !globe;
      spr.scale.setScalar(visual.scale === 'system' ? 2.8 : 2.35);
    }
  }
}


