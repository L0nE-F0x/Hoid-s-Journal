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
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';

/**
 * Anamorphic streaks. Bright pixels smear sideways the way they would through
 * a real lens, which is what sells a star as a light source rather than a
 * white dot. Sixteen taps on a decaying stride — cheap, and the bloom pass
 * after it does the rest.
 */
class StreakEffect extends Effect {
  constructor() {
    super('StreakEffect', /* glsl */ `
      uniform float uStrength;
      uniform float uThreshold;
      uniform vec3  uTint;
      uniform vec2  uTexel;

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 sum = vec3(0.0);
        float wsum = 0.0;
        for (int i = 1; i <= 16; i++) {
          float fi = float(i);
          float w = exp(-fi * fi * 0.011);
          float o = fi * fi * 0.42 * uTexel.x;
          vec3 a = texture2D(inputBuffer, uv + vec2(o, 0.0)).rgb;
          vec3 b = texture2D(inputBuffer, uv - vec2(o, 0.0)).rgb;
          sum += (max(a - uThreshold, 0.0) + max(b - uThreshold, 0.0)) * w;
          wsum += w * 2.0;
        }
        vec3 streak = sum / max(wsum, 0.0001) * uStrength;
        outputColor = vec4(inputColor.rgb + streak * uTint, inputColor.a);
      }
    `, {
      blendFunction: BlendFunction.SET,
      uniforms: new Map<string, THREE.Uniform>([
        ['uStrength', new THREE.Uniform(0.55)],
        ['uThreshold', new THREE.Uniform(1.05)],
        ['uTint', new THREE.Uniform(new THREE.Vector3(0.62, 0.78, 1.0))],
        ['uTexel', new THREE.Uniform(new THREE.Vector2(1 / 1512, 1 / 900))],
      ]),
    });
  }

  setTexel(w: number, h: number): void {
    (this.uniforms.get('uTexel')!.value as THREE.Vector2).set(1 / w, 1 / h);
  }
}

/**
 * Final grade. Split-toning plus a gentle S-curve, applied after tone mapping
 * so it shapes the picture the eye actually sees.
 */
class GradeEffect extends Effect {
  constructor() {
    super('GradeEffect', /* glsl */ `
      uniform float uSaturation;
      uniform float uContrast;
      uniform vec3  uShadow;
      uniform vec3  uHighlight;
      uniform vec3  uLift;

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = max(inputColor.rgb, 0.0);
        float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
        float w = 1.0 - smoothstep(0.30, 0.92, luma);
        c = mix(vec3(luma), c, 1.0 + uSaturation * w);
        c *= mix(uShadow, uHighlight, smoothstep(0.04, 0.72, luma));
        vec3 sc = clamp(c, 0.0, 1.0);
        c = mix(c, sc * sc * (3.0 - 2.0 * sc), uContrast);
        // A whisper of lift so the black is ink, never a dead buffer.
        c += uLift * (1.0 - smoothstep(0.0, 0.22, luma));
        outputColor = vec4(max(c, 0.0), inputColor.a);
      }
    `, {
      blendFunction: BlendFunction.SET,
      uniforms: new Map<string, THREE.Uniform>([
        ['uSaturation', new THREE.Uniform(0.30)],
        ['uContrast', new THREE.Uniform(0.22)],
        ['uShadow', new THREE.Uniform(new THREE.Color(0.80, 0.89, 1.16))],
        ['uHighlight', new THREE.Uniform(new THREE.Color(1.07, 1.00, 0.92))],
        ['uLift', new THREE.Uniform(new THREE.Color(0.010, 0.013, 0.028))],
      ]),
    });
  }
}

export interface PostChain {
  composer: EffectComposer;
  setBloom(intensity: number): void;
  setQuality(band: 'high' | 'medium' | 'low'): void;
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

  const streak = new StreakEffect();

  // Threshold sits above a fully lit planet: below ~0.6 the sunward half of
  // every globe fed the bloom and came back as a white wash.
  const bloom = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    intensity: 1.15,
    luminanceThreshold: 0.60,
    luminanceSmoothing: 0.34,
    mipmapBlur: true,
    radius: 0.86,
    levels: 9,
    kernelSize: KernelSize.HUGE,
  });

  const chromatic = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(0.00032, 0.00032),
    radialModulation: true,
    modulationOffset: 0.38,
  });

  const vignette = new VignetteEffect({ offset: 0.24, darkness: 0.66 });
  const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
  grain.blendMode.opacity.value = 0.024;

  const toneMapping = new ToneMappingEffect({
    mode: ToneMappingMode.AGX,
    resolution: 256,
    whitePoint: 6.0,
    middleGrey: 0.38,
  });

  const grade = new GradeEffect();
  composer.addPass(new EffectPass(camera, streak, bloom, chromatic, vignette, grain, toneMapping, grade));

  // Edges last, on the graded image. The globes are smooth spheres against a
  // near-black sky; without this every limb crawls.
  const smaa = new SMAAEffect({ preset: SMAAPreset.HIGH });
  const smaaPass = new EffectPass(camera, smaa);
  composer.addPass(smaaPass);

  return {
    composer,
    setBloom: (v) => { bloom.intensity = v * 1.15; },
    setQuality: (band) => {
      bloom.kernelSize = band === 'low' ? KernelSize.SMALL
        : band === 'medium' ? KernelSize.LARGE
          : KernelSize.HUGE;
      grain.blendMode.opacity.value = band === 'low' ? 0.01 : 0.024;
      chromatic.offset.set(
        band === 'low' ? 0 : 0.00032,
        band === 'low' ? 0 : 0.00032,
      );
      streak.blendMode.opacity.value = band === 'low' ? 0 : 1;
      (streak.uniforms.get('uStrength')!).value = band === 'low' ? 0 : band === 'medium' ? 0.35 : 0.55;
      smaaPass.enabled = band !== 'low';
    },
    setSize: (w, h) => {
      composer.setSize(w, h);
      streak.setTexel(w, h);
    },
    dispose: () => composer.dispose(),
  };
}
