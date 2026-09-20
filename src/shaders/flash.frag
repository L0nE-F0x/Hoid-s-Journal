/** The detonation. Core, halo, and an anamorphic streak weighted to the
 *  horizontal — the asymmetry is what stops a bright spot reading as a
 *  sticker and starts it reading as a lens with too much light in it. */
uniform vec3  uColor;
uniform float uOpacity;
uniform float uSpike;

varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float d2 = dot(p, p);
  if (d2 > 1.0) discard;
  float d = sqrt(d2);

  float core = exp(-d2 * 26.0);
  float halo = pow(max(0.0, 1.0 - d), 3.4) * 0.30;

  vec2 a = abs(p);
  float h = exp(-a.y * a.y * 380.0) * exp(-a.x * 2.1);
  float v = exp(-a.x * a.x * 860.0) * exp(-a.y * 3.0);
  // The quad is clipped to a circle, and a streak still 12% bright when it
  // reaches that clip ends in a straight razor edge across the sky. Window it
  // out well inside the boundary so the flare ends because it ran out, not
  // because it hit the geometry.
  float spikes = (h + v * 0.42) * uSpike * smoothstep(1.0, 0.45, d);

  float i = (core + halo + spikes) * uOpacity;
  vec3 col = uColor * i;
  col += vec3(1.0) * core * core * uOpacity * 0.85;

  gl_FragColor = vec4(col, 1.0);
}
