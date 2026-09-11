/**
 * Single-scattering atmosphere, marched. Drawn on the FRONT faces of a shell
 * larger than the planet so the haze covers the disc as well as the limb; the
 * ray is clipped analytically where it meets the ground, which is what makes
 * the terminator go orange instead of simply fading out.
 */

uniform vec3  uCenter;
uniform vec3  uSunPos;
uniform vec3  uSunColor;
uniform float uPlanetRadius;
uniform float uAtmoRadius;
uniform float uDensity;
uniform float uFalloff;
uniform vec3  uWavelength;
uniform float uRayleigh;
uniform float uMie;
uniform float uMieG;
uniform int   uSteps;
uniform int   uLightSteps;
uniform float uIntensity;

varying vec3 vWorld;

/** (distance to the sphere, distance through it). x = -1 when there is no hit. */
vec2 raySphere(vec3 centre, float radius, vec3 ro, vec3 rd) {
  vec3 oc = ro - centre;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0, 0.0);
  h = sqrt(h);
  float near = -b - h;
  float far = -b + h;
  if (far < 0.0) return vec2(-1.0, 0.0);
  return vec2(max(near, 0.0), far - max(near, 0.0));
}

float densityAt(vec3 p) {
  float shell = max(0.0001, uAtmoRadius - uPlanetRadius);
  float h = (length(p - uCenter) - uPlanetRadius) / shell;
  h = clamp(h, 0.0, 1.0);
  return exp(-h * uFalloff) * (1.0 - h);
}

float opticalDepth(vec3 ro, vec3 rd, float len, int steps) {
  float step = len / float(max(steps - 1, 1));
  vec3 p = ro;
  float sum = 0.0;
  for (int i = 0; i < 12; i++) {
    if (i >= steps) break;
    sum += densityAt(p) * step;
    p += rd * step;
  }
  return sum;
}

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - cameraPosition);

  vec2 atmo = raySphere(uCenter, uAtmoRadius, ro, rd);
  if (atmo.x < 0.0 || atmo.y <= 0.0) discard;

  float len = atmo.y;
  vec2 ground = raySphere(uCenter, uPlanetRadius, ro, rd);
  if (ground.x >= 0.0) len = min(len, ground.x - atmo.x);
  if (len <= 0.0) discard;

  vec3 sunDir = normalize(uSunPos - uCenter);

  // Wavelength-dependent Rayleigh coefficients, plus a grey Mie term.
  vec3 kRayleigh = pow(vec3(400.0) / uWavelength, vec3(4.0)) * uRayleigh * uDensity;
  float kMie = uMie * uDensity;

  int steps = uSteps;
  float stepSize = len / float(max(steps - 1, 1));
  vec3 p = ro + rd * atmo.x;

  vec3 rayleighSum = vec3(0.0);
  float mieSum = 0.0;
  float viewDepth = 0.0;

  for (int i = 0; i < 16; i++) {
    if (i >= steps) break;
    float density = densityAt(p);
    viewDepth += density * stepSize;

    vec2 toSun = raySphere(uCenter, uAtmoRadius, p, sunDir);
    float sunDepth = opticalDepth(p, sunDir, toSun.y, uLightSteps);
    // Shadowed by the planet itself: the night side gets no in-scatter.
    vec2 block = raySphere(uCenter, uPlanetRadius, p, sunDir);
    float shadow = block.x >= 0.0 ? 0.0 : 1.0;
    // Soften the shadow edge so the terminator is a band, not a wall.
    float h = length(p - uCenter);
    float cosZen = dot(normalize(p - uCenter), sunDir);
    float soft = smoothstep(-0.12, 0.10, cosZen);
    shadow = max(shadow * soft, soft * soft * 0.25);

    vec3 tau = kRayleigh * (sunDepth + viewDepth) + vec3(kMie * 1.1 * (sunDepth + viewDepth));
    vec3 transmittance = exp(-tau) * shadow;

    rayleighSum += density * transmittance * stepSize;
    mieSum += density * (transmittance.r + transmittance.g + transmittance.b) / 3.0 * stepSize;

    p += rd * stepSize;
  }

  float mu = dot(rd, sunDir);
  float rayleighPhase = 3.0 / (16.0 * 3.14159265) * (1.0 + mu * mu);
  float g = uMieG;
  float g2 = g * g;
  float miePhase = 3.0 / (8.0 * 3.14159265)
    * ((1.0 - g2) * (1.0 + mu * mu))
    / ((2.0 + g2) * pow(1.0 + g2 - 2.0 * g * mu, 1.5));

  vec3 colour = (rayleighSum * kRayleigh * rayleighPhase + mieSum * kMie * miePhase)
    * uSunColor * uIntensity;

  float a = clamp(max(colour.r, max(colour.g, colour.b)), 0.0, 1.0);
  if (a < 0.002) discard;
  gl_FragColor = vec4(colour, a);
}
