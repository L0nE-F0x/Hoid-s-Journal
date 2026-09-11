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

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uBandTint: { value: new THREE.Color(0xbfd3ff) },
      uDustTint: { value: new THREE.Color(0x3a2a4a) },
      uGlowTint: { value: new THREE.Color(0xffd9a8) },
      uCognitive: { value: 0 },
    },
    vertexShader: bakeVert,
    fragmentShader: skyBakeFrag,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const physical = target(size, size / 2);
  const cognitive = target(size, size / 2);
  const prev = renderer.getRenderTarget();

  mat.uniforms.uCognitive.value = 0;
  renderer.setRenderTarget(physical);
  renderer.render(scene, cam);

  mat.uniforms.uCognitive.value = 1;
  renderer.setRenderTarget(cognitive);
  renderer.render(scene, cam);

  renderer.setRenderTarget(prev);
  quad.geometry.dispose();
  mat.dispose();

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

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uWarm: { value: new THREE.Color(0xffd9a0) },
      uCool: { value: new THREE.Color(0x5f7cc8) },
      uWhole: { value: 0 },
    },
    vertexShader: bakeVert,
    fragmentShader: spiritBakeFrag,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const shattered = target(size, size / 2);
  const whole = target(size, size / 2);
  const prev = renderer.getRenderTarget();

  mat.uniforms.uWhole.value = 0;
  renderer.setRenderTarget(shattered);
  renderer.render(scene, cam);

  mat.uniforms.uWhole.value = 1;
  renderer.setRenderTarget(whole);
  renderer.render(scene, cam);

  renderer.setRenderTarget(prev);
  quad.geometry.dispose();
  mat.dispose();

  spirit = { whole: whole.texture, shattered: shattered.texture };
  return spirit;
}
