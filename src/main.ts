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

async function main(): Promise<void> {
  const canvas = document.getElementById('stage') as HTMLCanvasElement;
  const uiRoot = document.getElementById('ui-root')!;

  if (!canvas.getContext('webgl2')) {
    bootError('This needs WebGL2, which this browser or GPU does not provide.');
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
  const app = new App(canvas, {
    onHoverAnchor: (p) => ui?.setHoverAnchor(p),
  });
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
