import * as THREE from 'three';
import bakeVert from '../shaders/planetBake.vert';
import skyBakeFrag from '../shaders/skyBake.frag';
import spiritBakeFrag from '../shaders/spiritBake.frag';

/**
 * The deep sky, baked once into two equirectangular plates — Physical and
 * Cognitive — for the dome to sample.
 *
 * Marching the field per pixel per frame was the single most expensive thing
 * in the scene: a full-screen pass of thirty-odd noise evaluations, every
 * frame, for a picture that never changes.
 */
export interface SkyPlates {
  physical: THREE.Texture;
  cognitive: THREE.Texture;
}

let plates: SkyPlates | null = null;
let spirit: SpiritPlates | null = null;

/**
 * What to redraw when the WebGL context comes back.
 *
 * A lost context takes every render target's contents with it. Three
 * re-uploads anything it has the source for — geometry, canvases, data
 * textures — but a baked plate has no source, only the draw that made it, so
 * each baker leaves that draw here and `rebakeAll` runs them again into the
 * same targets. The textures keep their identity, so every material that
 * samples one is already pointing at the right object.
 */
const rebakes: ((renderer: THREE.WebGLRenderer) => void)[] = [];

export function onContextRestored(bake: (renderer: THREE.WebGLRenderer) => void): void {
  rebakes.push(bake);
}

export function rebakeAll(renderer: THREE.WebGLRenderer): void {
  for (const bake of rebakes) bake(renderer);
}

/**
 * Draw one full-screen material into each target in turn, running `before`
 * ahead of each draw, then put the renderer back and free the material.
 */
export function drawQuad(
  renderer: THREE.WebGLRenderer,
  mat: THREE.ShaderMaterial,
  passes: [THREE.WebGLRenderTarget, () => void][],
): void {
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const prev = renderer.getRenderTarget();
  for (const [rt, before] of passes) {
    before();
    renderer.setRenderTarget(rt);
    renderer.render(scene, cam);
  }
  renderer.setRenderTarget(prev);
  quad.geometry.dispose();
  mat.dispose();
}

function target(w: number, h: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    generateMipmaps: false,
    depthBuffer: false,
    stencilBuffer: false,
    type: THREE.UnsignedByteType,
  });
}

export function skyPlates(renderer: THREE.WebGLRenderer, size = 2048): SkyPlates {
  if (plates) return plates;
  const physical = target(size, size / 2);
  const cognitive = target(size, size / 2);
  const bake = (r: THREE.WebGLRenderer): void => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uBandTint: { value: new THREE.Color(0xbfd3ff) },
        uDustTint: { value: new THREE.Color(0x3a2a4a) },
        uGlowTint: { value: new THREE.Color(0xffd9a8) },
        uCognitive: { value: 0 },
        uOctaveZero: { value: 0 },
      },
      vertexShader: bakeVert,
      fragmentShader: skyBakeFrag,
      depthTest: false,
      depthWrite: false,
    });
    drawQuad(r, mat, [
      [physical, () => { mat.uniforms.uCognitive.value = 0; }],
      [cognitive, () => { mat.uniforms.uCognitive.value = 1; }],
    ]);
  };
  bake(renderer);
  onContextRestored(bake);
  plates = { physical: physical.texture, cognitive: cognitive.texture };
  return plates;
}

export interface SpiritPlates {
  whole: THREE.Texture;
  shattered: THREE.Texture;
}

/**
 * The Spiritual Realm's field, baked the same way and for the same reason:
 * thirty noise evaluations across the whole frame, every frame, for a picture
 * that only changes when the Shattering does.
 */
export function spiritPlates(renderer: THREE.WebGLRenderer, size = 1536): SpiritPlates {
  if (spirit) return spirit;
  const shattered = target(size, size / 2);
  const whole = target(size, size / 2);
  const bake = (r: THREE.WebGLRenderer): void => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uWarm: { value: new THREE.Color(0xffd9a0) },
        uCool: { value: new THREE.Color(0x5f7cc8) },
        uWhole: { value: 0 },
        uOctaveZero: { value: 0 },
      },
      vertexShader: bakeVert,
      fragmentShader: spiritBakeFrag,
      depthTest: false,
      depthWrite: false,
    });
    drawQuad(r, mat, [
      [shattered, () => { mat.uniforms.uWhole.value = 0; }],
      [whole, () => { mat.uniforms.uWhole.value = 1; }],
    ]);
  };
  bake(renderer);
  onContextRestored(bake);
  spirit = { whole: whole.texture, shattered: shattered.texture };
  return spirit;
}
