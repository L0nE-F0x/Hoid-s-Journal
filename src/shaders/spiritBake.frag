#include "./lib/noise.glsl"

/**
 * The Spiritual Realm's field of filaments, baked into one equirectangular
 * plate. Two variants: whole, and after the Shattering.
 */

uniform vec3  uWarm;
uniform vec3  uCool;
uniform float uWhole;

varying vec2 vUv;

const float TAU = 6.28318530718;
const float PI = 3.14159265359;

void main() {
  float lon = (vUv.x - 0.5) * TAU;
  float lat = (vUv.y - 0.5) * PI;
  float cl = cos(lat);
  vec3 d = normalize(vec3(cos(lon) * cl, sin(lat), sin(lon) * cl));

  // Filaments: ridged noise stretched along a drift, so the field reads as
  // threads of Connection rather than as cloud.
  vec3 q = d * 2.6;
  float warp = warped(q * 0.9, 4, 0.7);
  float strands = ridged(q * 3.2 + warp * 1.4, 4, 2.05, 0.55);
  float web = pow(smoothstep(0.62, 0.99, strands), 1.6);
  float haze = fbm3(d * 1.7 + 9.0, 4, 2.05, 0.5) * 0.5 + 0.5;

  // Everything leans toward one horizon: before the Shattering there is a
  // single source, and after it the memory of one.
  float toward = max(0.0, dot(d, normalize(vec3(0.0, 1.0, 0.35))));

  vec3 col = mix(uCool, uWarm, toward * 0.55 + web * 0.45);
  col *= (0.004 + 0.115 * web + 0.012 * haze);
  col += uWarm * pow(toward, 7.0) * (0.010 + 0.060 * uWhole);
  col += vec3(0.006, 0.008, 0.020);

  // Stored with a gamma so eight bits do not band the very dark end.
  gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}
