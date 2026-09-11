varying vec3 vDir;

void main() {
  vDir = normalize(position);
  // Sky rides with the camera: translation is dropped, rotation kept.
  vec4 mv = viewMatrix * vec4(position + cameraPosition, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w;
}
