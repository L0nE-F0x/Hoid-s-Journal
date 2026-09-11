#include "./lib/skyfield.glsl"

/** One equirectangular plate of deep sky. Run twice: Physical, then Cognitive. */

uniform vec3  uBandTint;
uniform vec3  uDustTint;
uniform vec3  uGlowTint;
uniform float uCognitive;

varying vec2 vUv;

const float TAU = 6.28318530718;
const float PI = 3.14159265359;

void main() {
  float lon = (vUv.x - 0.5) * TAU;
  float lat = (vUv.y - 0.5) * PI;
  float cl = cos(lat);
  vec3 d = normalize(vec3(cos(lon) * cl, sin(lat), sin(lon) * cl));
  // Stored with a gamma so eight bits do not band the very dark end.
  gl_FragColor = vec4(pow(skyField(d, uBandTint, uDustTint, uGlowTint, uCognitive), vec3(1.0 / 2.2)), 1.0);
}
