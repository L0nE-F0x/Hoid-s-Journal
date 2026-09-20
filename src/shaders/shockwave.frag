#include "./lib/noise.glsl"

/** The front itself, drawn as a shell you only ever see edge-on.
 *
 *  A sphere lit this way is almost entirely invisible: the fragments facing
 *  the camera are rejected and only the limb survives, which is what makes a
 *  ring out of a solid. That rejection is also the whole performance story —
 *  at full reach this thing covers most of the screen, so the cheap rim test
 *  comes first and the noise is only paid for on the few pixels that live. */

uniform vec3  uColor;
uniform vec3  uEdge;
uniform float uOpacity;
uniform float uSharp;
uniform float uTear;
uniform float uSeed;

varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vDir;

void main() {
  vec3 view = normalize(cameraPosition - vWorld);
  float facing = abs(dot(normalize(vNormalW), view));
  float limb = 1.0 - facing;

  float rim = pow(limb, uSharp);
  if (rim < 0.004) discard;

  // The front is torn, not a soap bubble. Low octaves: this is silhouette
  // shape, and detail here reads as noise rather than structure.
  float n = fbm3(vDir * 2.6 + uSeed * 17.0, 3, 2.2, 0.52);
  rim *= mix(1.0, 0.45 + 0.85 * (n * 0.5 + 0.5), uTear);

  // A hotter, thinner line riding the very edge.
  float edge = pow(limb, uSharp * 3.4);

  vec3 col = mix(uColor, uEdge, clamp(edge * 1.5, 0.0, 1.0));
  float a = clamp(rim, 0.0, 1.0) * uOpacity;
  if (a < 0.003) discard;

  gl_FragColor = vec4(col * a, a);
}
