varying vec3  vColor;
varying float vBright;
varying float vSpike;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(uv, uv);
  if (d2 > 1.0) discard;
  float d = sqrt(d2);

  float core = exp(-d2 * 22.0);
  float halo = pow(max(0.0, 1.0 - d), 3.7) * 0.34;

  float spikes = 0.0;
  float h = 0.0;
  float v = 0.0;
  if (vSpike > 0.001) {
    vec2 a = abs(uv);
    h = exp(-a.y * a.y * 340.0) * exp(-a.x * 2.6);
    v = exp(-a.x * a.x * 340.0) * exp(-a.y * 2.6);
    vec2 dg = abs(vec2(uv.x + uv.y, uv.x - uv.y) * 0.7071);
    float d1 = exp(-dg.x * dg.x * 900.0) * exp(-dg.y * 3.4);
    float d2s = exp(-dg.y * dg.y * 900.0) * exp(-dg.x * 3.4);
    spikes = (h + v + (d1 + d2s) * 0.35) * vSpike * 0.5;
  }

  float intensity = core + halo + spikes;
  vec3 col = vColor * intensity;
  col += vec3(0.22, 0.04, 0.0) * v * vSpike * 0.45;
  col += vec3(0.0, 0.06, 0.28) * h * vSpike * 0.45;
  col += vec3(1.0) * core * core * 0.62;
  col *= vBright;

  gl_FragColor = vec4(col, 1.0);
}
