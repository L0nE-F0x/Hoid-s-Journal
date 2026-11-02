/**
 * Pinch-zoom on a phone.
 *
 * The page zooms like any page: a pinch on a card, a panel or a map plate
 * magnifies it. The sky is the exception while the page is at 1×: a pinch
 * there dollies the camera, because that is what a pinch on a globe means.
 *
 * Once the page is zoomed, every surface hands its gestures back to the
 * browser (`html.ceph-zoomed` in base.css, and `CameraRig` ignores touch
 * then). Otherwise a reader who zoomed in on a card could not pan to the
 * rest of it, or pinch back out, without spinning the globe underneath.
 */
import { listen } from './dom.ts';

const ZOOMED = 1.05;

/** How far the reader has pinched the page in; 1 when they have not. */
export function pageZoom(): number {
  return window.visualViewport?.scale ?? 1;
}

/**
 * Call `fn` once a pinch has come to rest. A pinch reports dozens of steps;
 * whoever redraws for it wants the last one.
 */
export function onZoomSettled(fn: (scale: number) => void): () => void {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  let settle = 0;
  const off = listen(vv, 'resize', () => {
    window.clearTimeout(settle);
    settle = window.setTimeout(() => fn(vv.scale), 180);
  });
  return () => { off(); window.clearTimeout(settle); };
}

export function mountPageZoom(): { destroy(): void } {
  const vv = window.visualViewport;
  if (!vv) return { destroy() {} };
  const update = () => {
    document.documentElement.classList.toggle('ceph-zoomed', vv.scale > ZOOMED);
  };
  const off = listen(vv, 'resize', update);
  update();
  return {
    destroy() {
      off();
      document.documentElement.classList.remove('ceph-zoomed');
    },
  };
}
