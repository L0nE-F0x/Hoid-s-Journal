varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
/** Object space, so surface detail turns with the world instead of swimming. */
varying vec3 vObj;

void main() {
  vUv = uv;
  vObj = normalize(position);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
