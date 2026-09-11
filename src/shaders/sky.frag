#include "./lib/noise.glsl"

/**
 * The deep sky the Cosmere hangs in: a galactic band with dust lanes, a few
 * broad emission regions, and enough faint structure that the black between
 * the systems stops looking like a cleared buffer.
 *
 * Painted once on an inverted dome at infinity. No overdraw cost — it is the
 * background, and every planet writes depth over it.
 */

uniform float uTime;
uniform float uIntensity;
uniform vec3  uBandTint;
uniform vec3  uDustTint;
uniform vec3  uGlowTint;
uniform float uCognitive;

varying vec3 vDir;

void main() {
  vec3 d = normalize(vDir);

  // Galactic plane, tilted so it does not sit along the orrery's own ecliptic.
  vec3 pole = normalize(vec3(0.34, 0.86, -0.38));
  float lat = dot(d, pole);
  float band = exp(-lat * lat * 26.0);
  float wide = exp(-lat * lat * 5.0);

  // Structure along the band: a bulge in one direction, arms elsewhere.
  vec3 centre = normalize(vec3(-0.82, 0.16, 0.55));
  float toCore = max(0.0, dot(d, centre));
  float bulge = pow(toCore, 5.0);

  float f = warped(d * 3.1, 5, 0.9) * 0.5 + 0.5;
  float fine = fbm3(d * 11.0, 5, 2.07, 0.5) * 0.5 + 0.5;
  float lanes = ridged(d * 5.4 + 3.0, 4, 2.1, 0.55);

  float stars = band * (0.55 + 0.75 * f) * (0.35 + 0.9 * bulge);
  // Dust lanes cut the band rather than adding to it.
  float dust = smoothstep(0.55, 0.95, lanes) * band;

  vec3 col = uBandTint * stars * 0.115;
  col += uBandTint * wide * fine * 0.016;
  col += uGlowTint * bulge * band * 0.10;
  col = mix(col, col * uDustTint * 0.28, dust * 0.85);

  // Two broad emission regions away from the band, so the sky is not a
  // single stripe on black.
  vec3 e1 = normalize(vec3(0.72, -0.42, 0.55));
  vec3 e2 = normalize(vec3(-0.28, 0.62, 0.73));
  float n1 = pow(max(0.0, dot(d, e1)), 9.0) * (fbm3(d * 4.2 + 21.0, 4, 2.05, 0.5) * 0.5 + 0.5);
  float n2 = pow(max(0.0, dot(d, e2)), 12.0) * (fbm3(d * 5.6 + 44.0, 4, 2.05, 0.5) * 0.5 + 0.5);
  col += vec3(0.30, 0.12, 0.42) * n1 * 0.13;
  col += vec3(0.08, 0.26, 0.40) * n2 * 0.12;

  // A low floor so the frame never reads as pure black.
  col += vec3(0.0035, 0.0048, 0.0105) * (0.7 + 0.5 * fine);

  if (uCognitive > 0.001) {
    // Shadesmar's sky: a dark dome with a small hard sun and no stars worth
    // the name. Drain the band, keep a cold violet wash.
    float lum = dot(col, vec3(0.3, 0.6, 0.1));
    vec3 cog = mix(vec3(lum * 0.30), vec3(0.026, 0.018, 0.058), 0.80);
    cog += vec3(0.09, 0.06, 0.20) * pow(max(0.0, 1.0 - abs(lat)), 3.0) * 0.12;
    col = mix(col, cog, uCognitive);
  }

  gl_FragColor = vec4(col * uIntensity, 1.0);
}
