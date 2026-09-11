uniform float uTime;
uniform float uSizeScale;
uniform float uScale;

attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;
attribute float aDrift;

varying vec3 vColor;
varying float vBright;

void main() {
  vec3 p = position;
  // Souls do not hold still. A slow lissajous keeps the field alive without
  // ever letting one wander far from the mind it belongs to.
  float t = uTime * aDrift;
  p += vec3(sin(t + aSeed * 12.0), sin(t * 0.73 + aSeed * 25.0), cos(t * 0.61 + aSeed * 7.0)) * 1.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(-mv.z, 0.001);
  float wanted = aSize * uScale * uSizeScale / dist;
  float clamped = max(wanted, 1.6);
  gl_PointSize = min(clamped, 26.0);
  float pulse = 0.62 + 0.38 * sin(uTime * 1.1 + aSeed * 40.0);
  vBright = clamp(wanted / clamped, 0.05, 1.0) * pulse;
  vColor = aColor;
}
