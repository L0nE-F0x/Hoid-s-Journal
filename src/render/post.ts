import * as THREE from 'three';
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  Effect,
  EffectComposer,
  EffectPass,
  KernelSize,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';

class GradeEffect extends Effect {
  constructor() {
    super('GradeEffect', /* glsl */ `
      uniform float uSaturation;
      uniform float uContrast;
      uniform vec3  uShadow;
      uniform vec3  uHighlight;

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = max(inputColor.rgb, 0.0);
        float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
        float w = 1.0 - smoothstep(0.30, 0.92, luma);
        c = mix(vec3(luma), c, 1.0 + uSaturation * w);
        c *= mix(uShadow, uHighlight, smoothstep(0.04, 0.72, luma));
        vec3 sc = clamp(c, 0.0, 1.0);
        c = mix(c, sc * sc * (3.0 - 2.0 * sc), uContrast);
        outputColor = vec4(max(c, 0.0), inputColor.a);
      }
    `, {
      blendFunction: BlendFunction.SET,
      uniforms: new Map<string, THREE.Uniform>([
        ['uSaturation', new THREE.Uniform(0.34)],
        ['uContrast', new THREE.Uniform(0.20)],
        ['uShadow', new THREE.Uniform(new THREE.Color(0.82, 0.90, 1.14))],
        ['uHighlight', new THREE.Uniform(new THREE.Color(1.06, 1.00, 0.93))],
      ]),
    });
  }
}

export interface PostChain {
  composer: EffectComposer;
  setBloom(intensity: number): void;
  setSize(width: number, height: number): void;
  dispose(): void;
}

export function createPostChain(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): PostChain {
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));

  // Threshold sits above a fully lit planet: below ~0.6 the sunward half of
  // every globe fed the bloom and came back as a white wash.
  const bloom = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    intensity: 0.95,
    luminanceThreshold: 0.62,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
    radius: 0.72,
    kernelSize: KernelSize.HUGE,
  });

  const chromatic = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(0.00028, 0.00028),
    radialModulation: true,
    modulationOffset: 0.42,
  });

  const vignette = new VignetteEffect({ offset: 0.26, darkness: 0.62 });
  const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
  grain.blendMode.opacity.value = 0.026;

  const toneMapping = new ToneMappingEffect({
    mode: ToneMappingMode.ACES_FILMIC,
    resolution: 256,
    whitePoint: 5.2,
    middleGrey: 0.42,
  });

  const grade = new GradeEffect();
  composer.addPass(new EffectPass(camera, bloom, chromatic, vignette, grain, toneMapping, grade));

  return {
    composer,
    setBloom: (v) => { bloom.intensity = v * 0.95; },
    setSize: (w, h) => composer.setSize(w, h),
    dispose: () => composer.dispose(),
  };
}
