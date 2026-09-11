import * as THREE from 'three';
import { recipeFor, type Recipe } from '../cartography/recipes.ts';
import bakeVert from '../shaders/planetBake.vert';
import bakeFrag from '../shaders/planetBake.frag';

/**
 * Equirectangular plates baked on the GPU. Two draws per world — albedo, then
 * (elevation, water, lights, roughness) — into render targets the planet
 * shader samples. The CPU baker in `cartography/planetMap.ts` reads the same
 * recipes for the atlas panel, which cannot import Three.
 */

const MAX_BLOBS = 14;
const MAX_WEDGES = 12;

export interface PlanetPlates {
  albedo: THREE.Texture;
  data: THREE.Texture;
  texel: THREE.Vector2;
  recipe: ReturnType<typeof recipeFor>;
}

const cache = new Map<string, PlanetPlates>();
let quad: THREE.Mesh | null = null;
let scene: THREE.Scene | null = null;
let cam: THREE.OrthographicCamera | null = null;
let material: THREE.ShaderMaterial | null = null;

function colour(hex: string): THREE.Color {
  return new THREE.Color(hex).convertSRGBToLinear();
}

function ensureQuad(): THREE.ShaderMaterial {
  if (material) return material;
  material = new THREE.ShaderMaterial({
    uniforms: {
      uMode: { value: 0 },
      uSeed: { value: 0 },
      uLand: { value: new THREE.Color() },
      uLand2: { value: new THREE.Color() },
      uLand3: { value: new THREE.Color() },
      uOcean: { value: new THREE.Color() },
      uOceanDeep: { value: new THREE.Color() },
      uCap: { value: new THREE.Color() },
      uLightColor: { value: new THREE.Color() },
      uThreshold: { value: 0.5 },
      uWarp: { value: 2 },
      uRidges: { value: 0.4 },
      uRivers: { value: 0 },
      uIce: { value: 0 },
      uLights: { value: 0 },
      uFlora: { value: 0 },
      uBands: { value: 0 },
      uSplit: { value: 0 },
      uHion: { value: 0 },
      uTerminator: { value: 0 },
      uFain: { value: 0 },
      uCognitive: { value: 0 },
      uBlobCount: { value: 0 },
      uBlobs: { value: Array.from({ length: MAX_BLOBS }, () => new THREE.Vector4()) },
      uBlobW: { value: new Array<number>(MAX_BLOBS).fill(0) },
      uWedgeCount: { value: 0 },
      uWedges: { value: Array.from({ length: MAX_WEDGES }, () => new THREE.Color()) },
    },
    vertexShader: bakeVert,
    fragmentShader: bakeFrag,
    depthTest: false,
    depthWrite: false,
  });
  quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene = new THREE.Scene();
  scene.add(quad);
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return material;
}

function applyRecipe(mat: THREE.ShaderMaterial, r: Recipe, seed: number, cognitive: boolean): void {
  const u = mat.uniforms;
  u.uSeed.value = seed * 17.13;
  u.uLand.value.copy(colour(r.land));
  u.uLand2.value.copy(colour(r.land2));
  u.uLand3.value.copy(colour(r.land3 ?? r.land2));
  u.uOcean.value.copy(colour(r.ocean));
  u.uOceanDeep.value.copy(colour(r.oceanDeep ?? r.ocean));
  u.uCap.value.copy(colour(r.cap ?? '#e2e8f0'));
  u.uLightColor.value.copy(colour(r.lightColor ?? '#ffd79a'));
  u.uThreshold.value = r.threshold;
  u.uWarp.value = r.warp;
  u.uRidges.value = r.ridges ?? 0.4;
  u.uRivers.value = r.rivers ?? 0;
  u.uIce.value = r.ice ?? 0;
  u.uLights.value = r.lights ?? 0;
  u.uFlora.value = r.flora ?? 0;
  u.uBands.value = r.bands ? 1 : 0;
  u.uSplit.value = r.split ? 1 : 0;
  u.uHion.value = r.hion ? 1 : 0;
  u.uTerminator.value = r.terminator ? 1 : 0;
  u.uFain.value = r.fain ? 1 : 0;
  u.uCognitive.value = cognitive ? 1 : 0;

  const blobs = r.shape ?? [];
  u.uBlobCount.value = Math.min(MAX_BLOBS, blobs.length);
  for (let i = 0; i < MAX_BLOBS; i++) {
    const b = blobs[i];
    (u.uBlobs.value as THREE.Vector4[])[i]!.set(b?.[0] ?? 0, b?.[1] ?? 0, b?.[2] ?? 1, b?.[3] ?? 1);
    (u.uBlobW.value as number[])[i] = b?.[4] ?? 0;
  }
  const wedges = r.wedges ?? [];
  u.uWedgeCount.value = Math.min(MAX_WEDGES, wedges.length);
  for (let i = 0; i < MAX_WEDGES; i++) {
    (u.uWedges.value as THREE.Color[])[i]!.copy(colour(wedges[i] ?? '#000000'));
  }
}

function makeTarget(w: number, h: number, srgb: boolean): THREE.WebGLRenderTarget {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    generateMipmaps: true,
    depthBuffer: false,
    stencilBuffer: false,
    colorSpace: srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace,
    type: THREE.UnsignedByteType,
  });
  rt.texture.anisotropy = 8;
  return rt;
}

/**
 * Plates for one world. Cached: a realm flip or a Catacendre swap re-asks for
 * a different key, never a re-bake of one it already has.
 */
export function planetPlates(
  renderer: THREE.WebGLRenderer,
  kind: string,
  seed: number,
  cognitive: boolean,
  size = 1024,
): PlanetPlates {
  const key = `${kind}:${seed}:${size}${cognitive ? ':c' : ''}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const mat = ensureQuad();
  const recipe = recipeFor(kind);
  applyRecipe(mat, recipe, seed, cognitive);

  const W = size * 2;
  const H = size;
  const albedoRT = makeTarget(W, H, true);
  const dataRT = makeTarget(W, H, false);

  const prevTarget = renderer.getRenderTarget();
  const prevAuto = renderer.autoClear;
  renderer.autoClear = true;

  mat.uniforms.uMode.value = 0;
  renderer.setRenderTarget(albedoRT);
  renderer.render(scene!, cam!);

  mat.uniforms.uMode.value = 1;
  renderer.setRenderTarget(dataRT);
  renderer.render(scene!, cam!);

  renderer.setRenderTarget(prevTarget);
  renderer.autoClear = prevAuto;

  const plates: PlanetPlates = {
    albedo: albedoRT.texture,
    data: dataRT.texture,
    texel: new THREE.Vector2(1 / W, 1 / H),
    recipe,
  };
  cache.set(key, plates);
  return plates;
}

export function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return (h % 97) + 1;
}
