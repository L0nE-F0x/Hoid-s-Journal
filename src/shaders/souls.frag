varying vec3 vColor;
varying float vBright;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(uv, uv);
  if (d2 > 1.0) discard;
  float core = exp(-d2 * 9.0);
  float halo = pow(max(0.0, 1.0 - sqrt(d2)), 2.4) * 0.4;
  vec3 col = vColor * (core + halo) * vBright * 0.55;
  col += vec3(1.0) * core * core * 0.22 * vBright;
  gl_FragColor = vec4(col, 1.0);
}
