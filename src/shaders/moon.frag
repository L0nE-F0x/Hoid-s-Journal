uniform vec3 uColor;
uniform vec3 uSunPos;

varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec3 n = normalize(vNormal);
  vec3 toSun = normalize(uSunPos - vWorld);
  float ndl = max(0.0, dot(n, toSun));
  // Airless body: hard terminator, a little bounce so the dark side reads.
  float lit = ndl * 0.92 + 0.05;
  vec3 c = uColor * lit;

  vec3 view = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(0.0, dot(n, view)), 3.4);
  c += uColor * fres * 0.16 * ndl;

  gl_FragColor = vec4(c, 1.0);
}
