uniform vec3 uColor;
uniform vec3 uSunPos;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vec3 n = normalize(vNormal);
  vec3 view = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(0.0, dot(n, view)), 3.2);
  vec3 toSun = normalize(uSunPos - vWorld);
  float sun = max(0.15, dot(n, toSun));
  float a = fres * uIntensity * sun;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor * a * 1.8, a);
}
