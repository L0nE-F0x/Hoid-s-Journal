uniform sampler2D uAlbedo;
uniform vec3 uSunPos;
uniform vec3 uSunColor;
uniform vec3 uAtmosphere;
uniform float uTime;
uniform float uHighstorm;
uniform float uCognitive;
uniform float uEmissive;
uniform vec3 uEmissiveColor;
uniform float uNightLights;

varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec3 n = normalize(vNormal);
  vec3 albedo = texture2D(uAlbedo, vUv).rgb;

  vec3 toSun = normalize(uSunPos - vWorld);
  float ndl = max(0.0, dot(n, toSun));
  float wrap = ndl * 0.72 + 0.28;
  vec3 lit = albedo * wrap * uSunColor;

  // Night side city / hion glow
  float night = pow(1.0 - ndl, 2.4);
  lit += uEmissiveColor * uNightLights * night * albedo.g;

  // Roshar highstorm: a moving storm front, not a hemisphere. Same 7% of the
  // circumference the atlas panel draws.
  if (uHighstorm > 0.001) {
    float lon = vUv.x + uTime * 0.022;
    float dx = abs(fract(lon) - 0.5);
    float band = smoothstep(0.035, 0.004, dx);
    float wall = smoothstep(0.010, 0.0, abs(dx - 0.006));
    float latFade = smoothstep(0.06, 0.20, vUv.y) * smoothstep(0.94, 0.78, vUv.y);
    lit += vec3(0.62, 0.84, 1.0) * band * latFade * uHighstorm * 0.34;
    lit += vec3(0.85, 0.95, 1.0) * wall * latFade * uHighstorm * 0.5;
  }

  // Limb lighting
  vec3 view = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(0.0, dot(n, view)), 2.6);
  lit += uAtmosphere * fres * 0.85;

  // Cognitive: the albedo already carries Shadesmar's reading of this world
  // (bead ocean where the land is). Light it flatter — there is no sun over
  // there — and let the beads catch a highlight.
  if (uCognitive > 0.001) {
    vec3 flatLit = albedo * (0.58 + 0.42 * ndl) + vec3(0.05, 0.03, 0.10);
    float glint = pow(max(0.0, dot(reflect(-toSun, n), view)), 26.0);
    flatLit += vec3(0.60, 0.42, 0.95) * glint * 0.55;
    lit = mix(lit, flatLit, uCognitive);
  }

  lit += uEmissiveColor * uEmissive;
  gl_FragColor = vec4(lit, 1.0);
}
