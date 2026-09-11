#include "./lib/noise.glsl"

/**
 * A star, not a glow sprite: limb-darkened photosphere, granulation, a corona
 * that actually moves, and the lens artefacts an instrument would give you.
 * The billboard is a fixed quad; everything here is in its local -1..1 space.
 */

uniform vec3  uColor;
uniform vec3  uHot;
uniform float uTime;
uniform float uSeed;
uniform float uCoreRadius;
uniform float uFlare;
uniform float uCorona;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float d = length(uv);
  if (d > 1.0) discard;

  float ang = atan(uv.y, uv.x);
  float core = uCoreRadius;

  // Photosphere: a hard-edged disc with limb darkening, and convection cells
  // crawling across it.
  float disc = smoothstep(core, core * 0.82, d);
  float mu = sqrt(max(0.0, 1.0 - min(1.0, d / core) * min(1.0, d / core)));
  float limb = 0.42 + 0.58 * pow(mu, 0.62);
  vec3 gran = vec3(0.0);
  if (disc > 0.001) {
    float g = fbm3(vec3(uv * 9.0, uTime * 0.08 + uSeed), 3, 2.1, 0.55);
    gran = mix(uColor, uHot, 0.55 + 0.45 * g) * limb * (0.92 + 0.22 * g);
  }

  // Corona: ridged filaments sheared around the disc, falling off with r^-2.
  float rr = max(d, core * 0.9);
  float fil = ridged(vec3(cos(ang) * 2.4, sin(ang) * 2.4, uTime * 0.05 + uSeed * 3.0) + rr * 1.6, 3, 2.1, 0.55);
  float coronaFall = core * core / (rr * rr);
  float corona = coronaFall * (0.35 + 0.85 * fil) * uCorona;
  corona *= smoothstep(1.0, 0.25, d);

  // Broad halo — the part that reads as brightness rather than shape.
  float halo = pow(max(0.0, 1.0 - d), 3.2) * 0.55 + exp(-d * d * 5.0) * 0.5;

  // Instrument artefacts: an anamorphic streak plus a four-point diffraction
  // cross. Kept subtle; the bloom pass will find them.
  float streak = 0.0;
  if (uFlare > 0.001) {
    vec2 a = abs(uv);
    float h = exp(-a.y * a.y * 900.0) * exp(-a.x * 1.9);
    float v = exp(-a.x * a.x * 1800.0) * exp(-a.y * 3.0);
    vec2 dg = abs(vec2(uv.x + uv.y, uv.x - uv.y) * 0.7071);
    float d1 = exp(-dg.x * dg.x * 2600.0) * exp(-dg.y * 3.6);
    float d2 = exp(-dg.y * dg.y * 2600.0) * exp(-dg.x * 3.6);
    streak = (h * 1.0 + v * 0.45 + (d1 + d2) * 0.28) * uFlare;
  }

  vec3 col = gran * disc;
  col += mix(uColor, uHot, 0.35) * corona;
  col += uColor * halo * 0.85;
  col += mix(uColor, vec3(1.0), 0.55) * streak;
  col += uHot * disc * 0.55;

  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  a = max(a, disc);
  gl_FragColor = vec4(col, a);
}
