#include "./lib/noise.glsl"

uniform vec3  uColor;
uniform vec3  uSunPos;
uniform float uSeed;
uniform float uCraters;
uniform float uGlow;
uniform float uDetail;

varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vObj;

/** Craters as an inverted-ridged field; cheap, and it reads at a few pixels. */
float surface(vec3 p) {
  // Maria first: broad dark plains. Then a sparse field of basins, thresholded
  // so they read as craters rather than as a wash of noise.
  float maria = warped(p * 1.9 + uSeed, 4, 0.6) * 0.5 + 0.5;
  float basins = ridged(p * 4.2 + uSeed * 2.0, 3, 2.1, 0.55);
  float pits = smoothstep(0.52, 0.93, basins);
  return mix(maria, maria * 0.62 + (1.0 - pits) * 0.52, uCraters);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 toSun = normalize(uSunPos - vWorld);
  vec3 view = normalize(cameraPosition - vWorld);

  float h = surface(vObj);
  vec3 albedo = uColor * (0.66 + 0.62 * h);

  if (uDetail > 0.01) {
    // Bump the normal off the same field so the terminator gets texture.
    vec3 up = abs(n.y) > 0.995 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
    vec3 east = normalize(cross(up, n));
    vec3 north = cross(n, east);
    float e = 0.06;
    float hx = surface(vObj + east * e);
    float hy = surface(vObj + north * e);
    n = normalize(n - (east * (hx - h) + north * (hy - h)) * 3.4 * uDetail);
  }

  float ndl = dot(n, toSun);
  // Airless body: hard terminator, a little bounce so the dark side reads.
  float lit = max(0.0, ndl) * 0.95 + 0.04;
  vec3 c = albedo * lit;

  float fres = pow(1.0 - max(0.0, dot(n, view)), 3.4);
  c += uColor * fres * 0.18 * max(0.0, ndl);
  c += uColor * uGlow;

  gl_FragColor = vec4(c, 1.0);
}
