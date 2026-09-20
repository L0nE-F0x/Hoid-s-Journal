/** A unit sphere blown up in the vertex stage, so one geometry serves every
 *  radius the front passes through without a CPU-side rebuild. */
uniform float uRadius;

varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vDir;

void main() {
  vDir = normalize(position);
  vec4 world = modelMatrix * vec4(vDir * uRadius, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * vDir);
  gl_Position = projectionMatrix * viewMatrix * world;
}
