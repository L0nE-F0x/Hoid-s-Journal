varying vec3 vColor;
varying float vBright;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(uv, uv);
  if (d2 > 1.0) discard;
  // A polynomial falloff, not exp and pow: this runs on every blended
  // fragment of every soul in the Realm.
  float f = 1.0 - d2;
  float core = f * f * f;
  float halo = f * 0.34;
  vec3 col = vColor * (core + halo) * vBright * 0.62;
  col += vec3(1.0) * core * core * 0.24 * vBright;
  gl_FragColor = vec4(col, 1.0);
}
