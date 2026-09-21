uniform vec3  uColor;
uniform float uOpacity;

varying float vBright;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(uv, uv);
  if (d2 > 1.0) discard;
  float core = exp(-d2 * 5.5);
  // Rubble is not one colour. A little white in a fifth of it keeps the band
  // from reading as a printed stripe.
  vec3 tint = mix(uColor, vec3(1.0), 0.26 * fract(vSeed * 13.17));
  gl_FragColor = vec4(tint * core * vBright * uOpacity, core * uOpacity);
}
