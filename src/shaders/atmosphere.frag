uniform vec3 uColor;
uniform vec3 uSunPos;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  // Drawn on the BACK faces of a slightly larger shell, so the surface facing
  // the camera has its normal pointing away: the rim term has to be measured
  // against -n. Measured against +n it was 1.0 across the whole disc, which
  // laid a flat wash of atmosphere colour over every planet.
  vec3 n = normalize(vNormal);
  vec3 view = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(0.0, dot(-n, view)), 4.2);
  vec3 toSun = normalize(uSunPos - vWorld);
  float sun = max(0.12, dot(-n, toSun));
  float a = rim * uIntensity * sun;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor * a * 1.8, a);
}
