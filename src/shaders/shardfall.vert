/** Sixteen comets, each a head and a lagging tail, all driven from one
 *  progress uniform. The tail is not simulated — every point walks the same
 *  path as its head with a head start subtracted, which is what makes a
 *  streak that stretches while it accelerates and closes up as it slows. */
uniform float uProgress;
uniform float uReach;
uniform float uSize;
uniform float uPixelScale;
uniform float uLagSpan;
uniform float uOpacity;

attribute vec3  aDir;
attribute vec3  aColor;
attribute float aLag;
attribute float aSeed;

varying vec3  vColor;
varying float vBright;

void main() {
  float s = clamp(uProgress - aLag * uLagSpan, 0.0, 1.0);

  // Hard out of the gate, then coasting — a shard thrown, not a rocket.
  float d = uReach * (1.0 - pow(1.0 - s, 2.6));

  // A little drift off the radial, or sixteen straight rays read as a decal
  // stuck to the screen rather than sixteen things with somewhere to be.
  vec3 side = normalize(cross(aDir, vec3(0.0, 1.0, 0.0)) + vec3(0.0001, 0.0, 0.0));
  vec3 p = position + aDir * d + side * sin(s * 2.4 + aSeed * 6.2831) * d * 0.055;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = max(-mv.z, 0.001);
  // uSize is a world radius; uPixelScale turns it into pixels the same way
  // the starfield does, or the heads come out two pixels wide at Cosmere scale.
  float taper = 1.0 - aLag * 0.74;
  gl_PointSize = clamp(uSize * taper * uPixelScale / dist, 1.0, 120.0);

  float born = smoothstep(0.0, 0.025, s);
  float die = 1.0 - smoothstep(0.52, 1.0, uProgress);
  vBright = born * die * taper * taper * uOpacity;
  vColor = aColor;
}
