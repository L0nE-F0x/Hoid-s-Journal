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
/** 0 ring, 1 ash pall, 2 storm band, 3 dawn, 4 a short hard shock. */
uniform float uShape;

varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vDir;

void main() {
  vec3 view = normalize(cameraPosition - vWorld);
  float facing = abs(dot(normalize(vNormalW), view));
  float limb = 1.0 - facing;

  // Ash is a pall over the world, not a ring in the sky. The cap facing
  // the camera is the cloud; the limb is only a dirty edge.
  if (uShape > 0.5 && uShape < 1.5) {
    float n = fbm3(vDir * 3.2 + uSeed * 9.0, 3, 2.1, 0.5);
    float cap = pow(facing, 0.55) * (0.45 + 0.7 * (n * 0.5 + 0.5));
    float a = clamp(cap, 0.0, 1.0) * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, 1.0);
    return;
  }

  float rim = pow(limb, uSharp);
  if (rim < 0.004 && uShape < 2.5) discard;

  // The front is torn, not a soap bubble. Low octaves: this is silhouette
  // shape, and detail here reads as noise rather than structure.
  float n = fbm3(vDir * 2.6 + uSeed * 17.0, 3, 2.2, 0.52);
  rim *= mix(1.0, 0.45 + 0.85 * (n * 0.5 + 0.5), uTear);

  // A hotter, thinner line riding the very edge.
  // A highstorm is a wall, not a soap bubble: keep the latitude band.
  if (uShape > 1.5 && uShape < 2.5) rim *= smoothstep(0.62, 0.05, abs(vDir.y));
  // Dawn holds a sun in the middle of the shell after the ring has thinned.
  if (uShape > 2.5 && uShape < 3.5) rim = max(rim, pow(facing, 1.5) * 0.65);
  if (rim < 0.004) discard;

  float edge = pow(limb, uSharp * 3.4);

  vec3 col = mix(uColor, uEdge, clamp(edge * 1.5, 0.0, 1.0));
  float a = clamp(rim, 0.0, 1.0) * uOpacity;
  if (a < 0.003) discard;

  gl_FragColor = vec4(col * a, a);
}
