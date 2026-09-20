/**
 * A place-marker on a globe: a small bead sitting on the surface, not a
 * camera-facing sticker. The quad is a billboard (see sun.vert); the sphere
 * is implied by treating the disc as a hemisphere and lighting it.
 *
 * `uFacing` is n·v of the *planet* at this pin, not of the billboard. It
 * fades the marker out as it reaches the limb so a sprite cannot stick out
 * into space, and it is 0 on the far side so the globe occludes it even
 * when depth-test is a few centimetres off because of the 1.015 radius.
 */

uniform vec3  uColor;
uniform float uFacing;
uniform float uOpacity;
uniform float uHot;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float d = length(uv);
  if (d > 1.0) discard;

  // Hemisphere normal in billboard space: the pin is a bead, not a disc.
  float z = sqrt(max(0.0, 1.0 - d * d));
  vec3 n = normalize(vec3(uv, z));
  vec3 L = normalize(vec3(-0.32, 0.52, 0.78));
  float ndl = max(0.0, dot(n, L));
  float wrap = 0.28 + 0.72 * ndl;
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(0.0, dot(n, H)), 28.0);

  vec3 col = uColor * wrap;
  col += uColor * 0.12;
  col += vec3(1.0) * spec * (0.35 + 0.40 * uHot);
  // A hotter pin is the one you asked for: lift the core, not the whole disc.
  col += uColor * (1.0 - d) * 0.22 * uHot;

  // Soft coverage, not a cookie-cutter. Alpha is coverage.
  float a = smoothstep(1.0, 0.70, d);
  a *= uFacing * uOpacity;
  if (a < 0.02) discard;

  gl_FragColor = vec4(col, a);
}
