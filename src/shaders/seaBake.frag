#include "./lib/noise.glsl"

/**
 * The glass of the Cognitive expanse, as a swatch that meets itself on both
 * axes: a slow swell in red, the crazing in green.
 *
 * Baked once at boot. Marching this per pixel across a surface that fills the
 * lower half of the frame cost more than every planet, nebula and post pass
 * in the scene put together.
 */

varying vec2 vUv;

const float TAU = 6.28318530718;

void main() {
  // Sample the noise on a pair of circles, so the swatch has no seam.
  float a = vUv.x * TAU;
  float b = vUv.y * TAU;
  vec3 p = vec3(cos(a), sin(a), cos(b)) * 1.9 + vec3(0.0, 0.0, sin(b) * 1.9);
  float swell = fbm3(p * 1.6, 4, 2.05, 0.5) * 0.5 + 0.5;
  float craze = ridged(p * 5.2 + 17.0, 3, 2.1, 0.55);

  gl_FragColor = vec4(swell, craze, 0.0, 1.0);
}
