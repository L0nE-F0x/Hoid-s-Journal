#include "./lib/noise.glsl"

/** Ice and rubble in bands, lit from the star, and the planet's own shadow
 *  swept across it. Two-sided: the far side reads through the gaps. */

uniform vec3  uColor;
uniform vec3  uColor2;
uniform vec3  uSunPos;
uniform vec3  uCentre;
uniform float uPlanetRadius;
uniform float uInner;
uniform float uOuter;
uniform float uSeed;
uniform float uOpacity;

varying vec3 vWorld;
varying vec2 vUv;
varying vec3 vLocal;

void main() {
  float r = length(vLocal);
  float t = clamp((r - uInner) / max(0.0001, uOuter - uInner), 0.0, 1.0);

  // Banding: a few broad divisions plus fine structure.
  float bands = 0.5 + 0.5 * sin(t * 46.0 + uSeed * 9.0);
  float fine = 0.5 + 0.5 * sin(t * 190.0 + uSeed * 3.0);
  float gap = smoothstep(0.30, 0.35, abs(t - 0.42)) * smoothstep(0.10, 0.14, abs(t - 0.73));
  float dens = (0.34 + 0.70 * bands) * (0.70 + 0.32 * fine) * gap;
  dens *= smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.88, t);
  if (dens < 0.02) discard;

  vec3 toSun = normalize(uSunPos - vWorld);
  vec3 view = normalize(cameraPosition - vWorld);

  // Forward scattering: ring particles glow when you look through them at
  // the star, and go matte when the star is behind you.
  float mu = dot(view, -toSun);
  float forward = pow(max(0.0, mu), 3.0);

  // The planet's shadow: project this point onto the star-planet line.
  vec3 rel = vWorld - uCentre;
  float along = dot(rel, toSun);
  float perp = length(rel - toSun * along);
  float shadow = (along < 0.0 && perp < uPlanetRadius)
    ? smoothstep(uPlanetRadius, uPlanetRadius * 0.82, perp)
    : 0.0;

  vec3 col = mix(uColor, uColor2, t) * (0.85 + 1.05 * forward);
  col *= 1.0 - shadow * 0.92;

  float a = dens * uOpacity * (0.62 + 0.48 * forward) * (1.0 - shadow * 0.9);
  gl_FragColor = vec4(col * a, a);
}
