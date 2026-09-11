/**
 * The dome. Two baked plates — Physical and Cognitive — sampled by direction
 * and crossfaded. The field itself lives in `lib/skyfield.glsl` and is baked
 * once by `render/skyBake.ts`; marching it per pixel per frame cost more than
 * every planet, atmosphere and post pass in the scene put together.
 */

uniform sampler2D uPhysical;
uniform sampler2D uCognitiveMap;
uniform float uIntensity;
uniform float uCognitive;

varying vec3 vDir;

const float TAU = 6.28318530718;
const float PI = 3.14159265359;

void main() {
  vec3 d = normalize(vDir);
  vec2 uv = vec2(
    atan(d.z, d.x) / TAU + 0.5,
    asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5
  );
  // The plates carry no mips on purpose: at the wrap seam the screen-space
  // derivative jumps a whole texture width, and a mip chosen from that is a
  // bright stripe down the sky.
  vec3 phys = texture2D(uPhysical, uv).rgb;
  vec3 cog = texture2D(uCognitiveMap, uv).rgb;
  // Undo the storage gamma the baker applied.
  vec3 col = pow(mix(phys, cog, uCognitive), vec3(2.2));
  gl_FragColor = vec4(col * uIntensity, 1.0);
}
