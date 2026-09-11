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

  // Cognitive: invert land/sea, cool the palette, bead-sea glints
  if (uCognitive > 0.001) {
    vec3 inv = vec3(1.0) - albedo;
    vec3 shade = mix(lit, inv * 0.35 + vec3(0.08, 0.04, 0.18), uCognitive);
    float glint = pow(max(0.0, dot(reflect(-toSun, n), view)), 18.0);
    shade += vec3(0.55, 0.35, 0.9) * glint * uCognitive * 0.6;
    lit = shade;
  }

  lit += uEmissiveColor * uEmissive;
  gl_FragColor = vec4(lit, 1.0);
}
