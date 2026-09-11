/**
 * The Spiritual Realm has no geography, so this is not a place — it is the
 * light everything is made of. Two baked plates, whole and Shattered,
 * sampled by a direction that turns slowly so the field drifts.
 */

uniform sampler2D uWholeMap;
uniform sampler2D uShatteredMap;
uniform float uIntensity;
uniform float uWhole;
uniform float uTime;

varying vec3 vDir;

const float TAU = 6.28318530718;
const float PI = 3.14159265359;

void main() {
  vec3 d = normalize(vDir);
  // Turn the lookup rather than the noise: the same drift for one rotation.
  float a = uTime * 0.006;
  d = vec3(d.x * cos(a) + d.z * sin(a), d.y, -d.x * sin(a) + d.z * cos(a));
  vec2 uv = vec2(
    atan(d.z, d.x) / TAU + 0.5,
    asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5
  );
  vec3 shattered = texture2D(uShatteredMap, uv).rgb;
  vec3 whole = texture2D(uWholeMap, uv).rgb;
  vec3 col = pow(mix(shattered, whole, uWhole), vec3(2.2));
  gl_FragColor = vec4(col * uIntensity, 1.0);
}
