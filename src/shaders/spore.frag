#include "./lib/noise.glsl"

/**
 * A lunagree: the column of aether spores falling from one of Lumar's twelve
 * geostationary moons into the sea it makes.
 *
 * The moons do not move relative to the ground, so the column does not
 * either — only the spores inside it fall. That is the whole reason Lumar's
 * seas are twelve different colours, and why leaving one is a voyage.
 */

uniform vec3  uColor;
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormal;

void main() {
  // vUv.y: 0 at the sea, 1 at the moon.
  float h = vUv.y;

  // Falling: the field scrolls down the column, fine enough to read as grain.
  vec3 q = vec3(vUv.x * 26.0, h * 16.0 - uTime * 0.55, uSeed);
  float grain = fbm3(q, 3, 2.07, 0.5) * 0.5 + 0.5;
  float veil = fbm3(vec3(vUv.x * 5.0, h * 3.0 - uTime * 0.12, uSeed + 4.0), 3, 2.05, 0.5) * 0.5 + 0.5;

  // Mostly empty. A column of spores is a rain, not a ramp.
  float fall = smoothstep(0.44, 0.80, grain) * 0.95 + smoothstep(0.40, 0.74, veil) * 0.55;

  // Ends: the moon crops it, the sea swallows it.
  float ends = smoothstep(0.0, 0.14, h) * smoothstep(1.0, 0.88, h);

  // Depth through the tube. Rendered on both walls, so the middle of the
  // silhouette has the most material behind it and the edges have none.
  vec3 view = normalize(cameraPosition - vWorld);
  float through = 1.0 - abs(dot(normalize(vNormal), view));

  float a = fall * ends * pow(through, 1.35) * uOpacity * 1.25;
  if (a < 0.004) discard;

  vec3 col = uColor * (0.5 + 0.8 * grain);
  col += vec3(1.0) * smoothstep(0.86, 1.0, grain) * 0.20;
  gl_FragColor = vec4(col * a, a);
}
