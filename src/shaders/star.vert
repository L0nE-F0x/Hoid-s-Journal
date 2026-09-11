uniform float uTime;
uniform float uSizeScale;
uniform float uStarSize;
uniform float uExposure;

attribute vec3 aColor;
attribute float aSize;
attribute float aBright;
attribute float aSeed;

varying vec3 vColor;
varying float vBright;
varying float vSpike;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(-mv.z, 0.001);
  float wanted = aSize * uStarSize * uSizeScale / dist;
  float clamped = max(wanted, 2.2);
  float bright = aBright * clamp(wanted / clamped, 0.04, 1.0);
  bright *= 1.0 + 0.18 * sin(uTime * 1.4 + aSeed * 240.0);
  gl_PointSize = min(clamped, 48.0);
  vSpike = smoothstep(3.0, 9.0, wanted) * smoothstep(0.6, 1.4, aBright);
  vColor = aColor;
  vBright = bright * uExposure;
}
