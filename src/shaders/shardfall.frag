/** Same core-plus-halo build as the starfield, so a shard in flight sits in
 *  the same visual family as the sky it is crossing. */
varying vec3  vColor;
varying float vBright;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(uv, uv);
  if (d2 > 1.0) discard;

  float core = exp(-d2 * 15.0);
  float halo = pow(max(0.0, 1.0 - sqrt(d2)), 3.2) * 0.42;

  vec3 col = vColor * (core + halo);
  // The hottest part of anything this bright reads white, whatever colour it is.
  col += vec3(1.0) * core * core * 0.55;

  gl_FragColor = vec4(col * vBright, 1.0);
}
