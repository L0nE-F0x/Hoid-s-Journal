/**
 * A place-marker lies on the ground it names. The quad is oriented to the
 * planet's surface normal in Pins.ts, so toward the limb it foreshortens into
 * an ellipse the way a mark printed on a globe would, instead of standing up
 * off the surface as a sticker.
 */
uniform float uSize;
varying vec2 vUv;

void main() {
  vUv = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy * uSize, 0.0, 1.0);
}
