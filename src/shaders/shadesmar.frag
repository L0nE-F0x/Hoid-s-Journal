#include "./lib/noise.glsl"

/**
 * The Cognitive Realm as a place you could stand in: an expanse of black
 * glass, with a bead ocean where each system's worlds are and the lights of
 * those worlds laid down the glass as reflections.
 *
 * Shadesmar's geography is inverted — land over there is a sea of glass beads,
 * ocean is solid ground. So the space between systems is the floor, and the
 * systems themselves are the water.
 */

uniform float uTime;
uniform vec3  uHorizon;
uniform vec3  uGlass;
uniform vec3  uBead;
uniform int   uCount;
uniform vec3  uSystems[16];
uniform vec3  uTints[16];
uniform float uRadii[16];
uniform float uOpacity;
uniform float uFade;

varying vec3 vWorld;

void main() {
  vec3 view = cameraPosition - vWorld;
  float dist = length(view);
  vec3 rd = view / dist;

  // Grazing angles see a long way; steep ones see the floor right below.
  float graze = clamp(abs(rd.y), 0.0, 1.0);

  // Distance fade, so the plane ends in haze rather than a hard edge.
  float far = exp(-dist / uFade);
  if (far < 0.004) discard;

  vec2 p = vWorld.xz;

  // --- glass -------------------------------------------------------------
  // Fine crazing plus a broad swell. The swell moves; the crazing does not.
  float swell = fbm3(vec3(p * 0.010, uTime * 0.03), 4, 2.05, 0.5);
  float craze = ridged(vec3(p * 0.085, 17.0), 3, 2.1, 0.55);
  float facet = smoothstep(0.80, 0.99, craze);

  vec3 col = mix(uGlass, uHorizon, 1.0 - graze) * (0.45 + 0.50 * (swell * 0.5 + 0.5));
  col += vec3(0.20, 0.16, 0.36) * facet * (0.25 + 0.75 * graze) * 0.30;

  // A cold sheen off the surface, because glass is glass.
  float sheen = pow(1.0 - graze, 5.0);
  col += vec3(0.11, 0.10, 0.24) * sheen * 0.55;

  // --- the systems -------------------------------------------------------
  float bead = 0.0;
  vec3 lights = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    vec3 s = uSystems[i];
    float r = uRadii[i];
    float d = length(p - s.xz);

    // Bead ocean: where a system's worlds sit, the glass gives way.
    float edge = smoothstep(r * 1.12, r * 0.72, d);
    bead = max(bead, edge);

    // The system's light laid down the glass. Narrow across, long toward the
    // camera — a reflection, not a glow.
    float across = exp(-pow(d / max(r * 2.6, 0.001), 2.0));
    float streak = across / (1.0 + d * 0.02);
    lights += uTints[i] * streak * (0.20 + 0.55 * sheen) * 0.55;
  }

  if (bead > 0.001) {
    // Obsidian spheres, packed. Each catches a different sliver of the sky.
    vec2 cell = p * 1.9;
    vec2 id = floor(cell);
    vec2 f = fract(cell) - 0.5;
    float sphere = 1.0 - smoothstep(0.24, 0.48, length(f));
    float lit = hash13(vec3(id, 3.0));
    float roll = 0.5 + 0.5 * sin(uTime * 0.5 + lit * 30.0);
    vec3 beads = uBead * (0.32 + 0.55 * lit);
    beads += vec3(0.70, 0.60, 1.00) * sphere * (0.18 + 0.55 * lit * roll);
    col = mix(col, beads, bead * 0.9);
  }

  col += lights * (0.55 + 0.45 * bead);

  float a = clamp(max(col.r, max(col.g, col.b)) * 3.4, 0.0, 1.0) * far * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col * far, a);
}
