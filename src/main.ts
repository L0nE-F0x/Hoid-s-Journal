import { App } from './core/App.ts';
import { connectSettingsPersistence, restoreSettings } from './core/persist.ts';
import { connectAudio } from './core/audio.ts';
import { connectPwa } from './core/pwa.ts';
import { store } from './core/store.ts';
import { connectUrlState } from './core/urlState.ts';
import { bakePlanetMap } from './cartography/planetMap.ts';
import { plateTint } from './cartography/recipes.ts';
import { bodyById, eraAt, fullProgress } from './data/index.ts';

interface UIHandles {
  setHoverAnchor(p: { x: number; y: number } | null): void;
  enter(): void;
  openTitle(): void;
  destroy(): void;
}

const boot = {
  root: document.getElementById('boot')!,
  fill: document.getElementById('boot-fill')!,
  label: document.getElementById('boot-label')!,
};

function setBoot(fraction: number, label: string): void {
  boot.fill.style.width = `${Math.round(fraction * 100)}%`;
  boot.label.textContent = label;
  store.set('loadProgress', fraction);
  store.set('loadLabel', label);
}

function bootError(message: string): void {
  boot.label.classList.add('error');
  boot.label.textContent = message;
  boot.fill.style.background = '#ff8f7a';
}

/**
 * Ask a scratch canvas, never `#stage`.
 *
 * `getContext` fixes a canvas's context attributes on the *first* call and
 * silently ignores the ones passed to every call after it. Probing the real
 * stage therefore handed Three a context it never asked for: `alpha: false`
 * and `powerPreference: 'high-performance'` were dropped on the floor, which
 * on a hybrid laptop is the difference between the discrete GPU and the
 * integrated one. Probe something disposable and let `App` open the only
 * context that matters.
 */
function webgl2Support(): { ok: true } | { ok: false; message: string } {
  const probe = document.createElement('canvas');
  // A document may only hold so many live contexts; hand each one back as
  // soon as it has answered the question.
  const release = (gl: WebGLRenderingContext | WebGL2RenderingContext): void => {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  const gl2 = probe.getContext('webgl2');
  if (gl2) {
    release(gl2);
    return { ok: true };
  }

  const gl1 = probe.getContext('webgl');
  if (gl1) {
    release(gl1);
    return {
      ok: false,
      message:
        'This needs WebGL2, and this browser offers only WebGL1 — usually a ' +
        'driver too old for it, or a software fallback standing in for the GPU.',
    };
  }

  return {
    ok: false,
    message:
      'This needs WebGL2, and this browser is providing no WebGL at all. ' +
      'Hardware acceleration is switched off, or the GPU process is not ' +
      'running. In Chrome, chrome://gpu will say which.',
  };
}

async function main(): Promise<void> {
  const canvas = document.getElementById('stage') as HTMLCanvasElement;
  const uiRoot = document.getElementById('ui-root')!;

  const support = webgl2Support();
  if (!support.ok) {
    bootError(support.message);
    return;
  }

  setBoot(0.15, 'Binding the journal');
  if (!Object.keys(store.state.readProgress).length) {
    store.state.readProgress = fullProgress();
  }
  restoreSettings();
  store.set('era', eraAt(store.state.year));

  let ui: UIHandles | null = null;
  try {
    setBoot(0.4, 'Inking the chrome');
    const mod = await import('./ui/index.ts');
    ui = mod.mountUI(uiRoot);
  } catch (err) {
    console.warn('[cephandrius] UI layer unavailable, renderer only:', err);
  }

  const deepLink = connectUrlState();
  connectSettingsPersistence();
  connectPwa(() => store.touch('panel'));
  connectAudio();

  setBoot(0.7, 'Lighting the systems');
  // The probe above proves the browser *can* make a context, not that it can
  // make this one. Under GPU memory pressure the real request is where it
  // gives out, and a bare Three exception is not a thing to show a reader.
  let app: App;
  try {
    app = new App(canvas, {
      onHoverAnchor: (p) => ui?.setHoverAnchor(p),
    });
  } catch (err) {
    console.error('[cephandrius] the renderer could not take the canvas:', err);
    bootError(
      'The GPU offered a test context and then refused the real one — usually ' +
      'memory pressure, or a driver that has fallen over. Reloading, or ' +
      'restarting the browser, normally clears it.'
    );
    return;
  }
  app.start();

  // Handle for the capture / interaction harnesses in tools/. Not a public API.
  (window as unknown as { __ceph: unknown }).__ceph = {
    store, app, ui, diagnose: () => app.diagnose(),
    // `test:cartography` needs both bakers in one page to compare them.
    bakePlanetMap, plateTint, bodyById,
  };

  setBoot(1, 'The Cosmere turns');
  requestAnimationFrame(() => {
    boot.root.classList.add('done');
    setTimeout(() => boot.root.remove(), 800);
    store.set('ready', true);
    // A shared link is a save state: fly to what it names instead of playing
    // the opening. The title stays up — that is where the disclaimer lives.
    if (deepLink) store.set('cameraCue', { kind: 'focus', id: deepLink.id, scale: deepLink.scale });
    else app.playIntro();
  });
}

main().catch((err) => {
  console.error(err);
  bootError(err instanceof Error ? err.message : String(err));
});
