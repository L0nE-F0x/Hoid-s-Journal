#include "./lib/noise.glsl"

/**
 * The Spiritual Realm has no geography, so this is not a place — it is the
 * light everything is made of. A dome of drifting filaments, brightest toward
 * the centre of the diagram, so the sixteen motes have something to hang in.
 */

uniform float uTime;
uniform float uIntensity;
uniform vec3  uWarm;
uniform vec3  uCool;
uniform float uWhole;

varying vec3 vDir;

void main() {
  vec3 d = normalize(vDir);

  // Filaments: ridged noise stretched along a slow drift, so the field reads
  // as threads of Connection rather than as cloud.
  vec3 q = d * 2.6;
  q.y += uTime * 0.012;
  float warp = warped(q * 0.9, 4, 0.7);
  float strands = ridged(q * 3.2 + warp * 1.4, 4, 2.05, 0.55);
  float web = pow(smoothstep(0.62, 0.99, strands), 1.6);

  float haze = fbm3(d * 1.7 + 9.0, 4, 2.05, 0.5) * 0.5 + 0.5;

  // Everything leans toward one horizon: before the Shattering there is a
  // single source, and after it the memory of one.
  float toward = max(0.0, dot(d, normalize(vec3(0.0, 1.0, 0.35))));

  // Near-black, with light only where a filament runs. The Realm is made of
  // light but it is not a lit room; a bright field flattens every mote in it.
  vec3 col = mix(uCool, uWarm, toward * 0.55 + web * 0.45);
  col *= (0.004 + 0.115 * web + 0.012 * haze);
  col += uWarm * pow(toward, 7.0) * (0.010 + 0.060 * uWhole);
  col += vec3(0.006, 0.008, 0.020);

  gl_FragColor = vec4(col * uIntensity, 1.0);
}
