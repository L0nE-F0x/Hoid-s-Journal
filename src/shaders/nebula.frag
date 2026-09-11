#include "./lib/noise.glsl"

/**
 * The Investiture around a system, marched as a real volume rather than
 * painted as a radial gradient. Front-lit from the system's own star, so the
 * cloud has a near side and a far side and the camera can fly around it.
 */

uniform vec3  uCentre;
uniform float uRadius;
uniform vec3  uColor;
uniform vec3  uColor2;
uniform vec3  uSunPos;
uniform float uTime;
uniform float uSeed;
uniform float uDensity;
uniform int   uSteps;
uniform float uOpacity;

varying vec3 vWorld;

vec2 raySphere(vec3 centre, float radius, vec3 ro, vec3 rd) {
  vec3 oc = ro - centre;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0, 0.0);
  h = sqrt(h);
  float far = -b + h;
  if (far < 0.0) return vec2(-1.0, 0.0);
  return vec2(max(-b - h, 0.0), far - max(-b - h, 0.0));
}

float cloud(vec3 p) {
  vec3 q = (p - uCentre) / uRadius;
  float r = length(q);
  if (r > 1.0) return 0.0;
  float shell = pow(max(0.0, 1.0 - r), 1.6);
  vec3 n = q * 2.6 + vec3(uSeed * 4.0);
  n.y += uTime * 0.008;
  float f = warped(n, 4, 0.85);
  float wisp = ridged(n * 2.3 + 7.0, 3, 2.1, 0.55);
  float d = (f * 0.55 + 0.45) * 0.7 + wisp * 0.45;
  d = smoothstep(0.38, 0.95, d);
  // A hollow core: the star has cleared the middle.
  float core = smoothstep(0.02, 0.22, r);
  return d * shell * core;
}

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - cameraPosition);
  vec2 hit = raySphere(uCentre, uRadius, ro, rd);
  if (hit.x < 0.0 || hit.y <= 0.0) discard;

  int steps = uSteps;
  float stepSize = hit.y / float(max(steps, 1));
  // Dither the entry point so low step counts band into noise, not stripes.
  float jitter = hash13(vec3(gl_FragCoord.xy, 1.0));
  vec3 p = ro + rd * (hit.x + stepSize * jitter);

  vec3 accum = vec3(0.0);
  float alpha = 0.0;

  for (int i = 0; i < 16; i++) {
    if (i >= steps) break;
    float d = cloud(p) * uDensity;
    if (d > 0.001) {
      float r = length(p - uCentre) / uRadius;
      // Lit from the system's star: the inner cloud is hotter.
      vec3 tint = mix(uColor2, uColor, smoothstep(0.0, 0.8, r));
      float lightFall = 1.0 / (1.0 + r * r * 5.0);
      float a = d * stepSize * 0.22 * (1.0 - alpha);
      accum += tint * a * (0.45 + lightFall * 2.2);
      alpha += a;
      if (alpha > 0.96) break;
    }
    p += rd * stepSize;
  }

  alpha = clamp(alpha, 0.0, 1.0) * uOpacity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(accum * uOpacity, alpha);
}
