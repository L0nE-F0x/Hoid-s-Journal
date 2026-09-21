uniform float uTime;
/** Radians of drift at unit radius. Points further out lag, as rubble does. */
uniform float uSpin;
uniform float uViewHeight;
uniform float uPointSize;
uniform vec3  uCentre;

attribute float aRadius;
attribute float aAngle;
attribute float aHeight;
attribute float aSize;
attribute float aSeed;

varying float vBright;
varying float vSeed;

void main() {
  float ang = aAngle + uSpin / pow(aRadius, 1.5);
  vec3 p = uCentre + vec3(cos(ang) * aRadius, aHeight, sin(ang) * aRadius);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // projectionMatrix[1][1] is 1/tan(fov/2), so this is the same pixels-per-
  // world-unit the other point shaders get handed as a uniform, without
  // threading the camera through the orrery to fetch it.
  float sizeScale = 0.5 * uViewHeight * projectionMatrix[1][1];
  float dist = max(-mv.z, 0.001);
  float wanted = aSize * uPointSize * sizeScale / dist;
  float clamped = max(wanted, 1.0);
  gl_PointSize = min(clamped, 26.0);

  // A rock too far away to draw at its true size is dimmed rather than grown,
  // or pulling back turns the belt into a sheet of identical dots.
  vBright = clamp(wanted / clamped, 0.05, 1.0)
    * (0.65 + 0.35 * sin(aSeed * 37.0 + uTime * 0.6));
  vSeed = aSeed;
}
