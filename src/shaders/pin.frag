/**
 * A place-marker: a surveyor's mark, not a bead. A bright core and a thin
 * ring in the place's colour, set on an ink disc so a pale mark still reads on
 * a pale continent. The lit hemispheres this replaced were glossy, saturated
 * and fifty pixels across, and a few dozen of them on Alethkar looked like a
 * spilled jar of sweets rather than an atlas.
 *
 * `uFacing` is n·v of the *planet* at this pin. It fades the mark toward the
 * limb and is 0 on the far side, so the globe occludes it even where the
 * depth test is a hair off because of the 1.015 radius.
 *
 * Edges are antialiased on fwidth: the ring is two or three pixels wide at
 * globe scale, and a fixed smoothstep width either blurs it or aliases it.
 */

uniform vec3  uColor;
uniform float uFacing;
uniform float uOpacity;
uniform float uHot;

varying vec2 vUv;

float band(float d, float r0, float r1, float aa) {
  return smoothstep(r0 - aa, r0 + aa, d) * (1.0 - smoothstep(r1 - aa, r1 + aa, d));
}

void main() {
  float d = length(vUv);
  if (d > 1.0) discard;
  float aa = max(fwidth(d), 1e-4);

  // Pulled a little toward the journal's paper so twenty hues sit together.
  vec3 tint = mix(uColor, vec3(0.94, 0.92, 0.86), 0.2);
  vec3 ink = vec3(0.025, 0.03, 0.055);

  // The one you asked for opens its ring and lifts its core.
  float coreR = 0.30 + 0.07 * uHot;
  float core = 1.0 - smoothstep(coreR - aa, coreR + aa, d);
  float ring = band(d, 0.58, 0.74 + 0.08 * uHot, aa);
  float backing = 1.0 - smoothstep(0.92 - aa, 0.92 + aa, d);

  float mark = max(core, ring);
  vec3 col = mix(ink, tint, mark);
  col += tint * core * 0.3 * uHot;

  float a = max(backing * 0.6, mark);
  a *= uFacing * uOpacity;
  if (a < 0.02) discard;

  gl_FragColor = vec4(col, a);
}
