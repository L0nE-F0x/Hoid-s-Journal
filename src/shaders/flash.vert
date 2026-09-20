/** A quad the size of the blast. The mesh is turned to face the camera on the
 *  CPU each frame, so all this has to do is scale. */
uniform float uSize;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * uSize, 1.0);
}
