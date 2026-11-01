import * as THREE from 'three';

/**
 * Build a scene's shader programs ahead of the frame that needs them, without
 * holding the main thread while the driver does it.
 *
 * Two things matter here, and the old warm-up got the first one wrong.
 *
 * **Compile into a render target.** Three keys a program on the output colour
 * space, which is the canvas's sRGB when nothing is bound and linear for any
 * render target. Nothing in this app draws straight to the canvas — the scene
 * goes into the post chain's buffer and every bake into its plate — so a
 * compile with no target bound builds a variant that is never drawn with. The
 * warm-up was doing exactly that: twenty-three programs at boot, every one of
 * them thrown away, and the real ones still compiled in the middle of the
 * first press of C or V.
 *
 * **Don't wait for it on the main thread.** With `KHR_parallel_shader_compile`
 * Three can ask whether a program is ready without blocking, and
 * `compileAsync` polls that. The planet baker alone took four seconds to link
 * on this laptop's integrated GPU, all of it a frozen boot screen.
 */
export function compileAsync(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Object3D,
  camera: THREE.Camera,
): Promise<void> {
  const target = new THREE.WebGLRenderTarget(1, 1);
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  let pending: Promise<unknown>;
  try {
    pending = renderer.compileAsync(scene, camera);
  } finally {
    renderer.setRenderTarget(prev);
    target.dispose();
  }
  return pending.then(() => undefined);
}
