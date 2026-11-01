/**
 * Offline shell and install prompt. Both are no-ops in dev: a stale service
 * worker in front of the dev server is a bad afternoon.
 */
import { store } from './store.ts';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
let notify: (() => void) | null = null;

/** When this tab last reloaded for a new worker. Per tab, so sessionStorage. */
const RELOAD_KEY = 'ceph-sw-reload';
const RELOAD_GAP_MS = 60_000;

function reloadedRecently(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(RELOAD_KEY) ?? 0) < RELOAD_GAP_MS;
  } catch {
    return true; // no storage, no way to prove it is not a loop: do not reload
  }
}

/**
 * A new worker has taken this tab. Reload only while that costs the reader
 * nothing.
 *
 * On the boot screen or the title, the reload is the point: it swaps a shell
 * an old worker served for the new one. In play it is not — the hash keeps
 * the camera's target, but the open card, the panel, the Lore Web and the
 * cinematic already watched are gone, and the reader is back on the title.
 * The running page needs nothing more from the network that the new worker
 * cannot serve, and the next visit gets the new shell anyway, because
 * navigations are network-first.
 *
 * At most once a minute per tab, so two workers swapping places during a
 * deploy cannot bounce it.
 */
function onNewWorker(): void {
  if (store.state.shell === 'play' || reloadedRecently()) return;
  try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch { return; }
  window.location.reload();
}

/** The first visit was not controlled, so the worker never saw this build's
 *  files go by. Name them, so the next visit can open offline. */
function cacheThisBuild(worker: ServiceWorker | null): void {
  const urls = new Set<string>();
  for (const e of performance.getEntriesByType('resource')) urls.add(e.name);
  for (const s of document.querySelectorAll<HTMLScriptElement>('script[src]')) urls.add(s.src);
  for (const l of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"], link[rel="modulepreload"]')) urls.add(l.href);
  const build = [...urls].filter((u) => new URL(u, location.href).pathname.includes('/assets/'));
  if (build.length) worker?.postMessage({ type: 'cache-build', urls: build });
}

export function connectPwa(onChange?: () => void): void {
  notify = onChange ?? null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify?.();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify?.();
  });

  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) {
    // A worker left by `vite preview` on this origin would sit in front of
    // the dev server and serve yesterday's build.
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => void r.unregister()))
      .catch(() => undefined);
    return;
  }
  // The first install has no controller yet; reloading then would loop boot.
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', onNewWorker);
  }
  const register = () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: 'none',
    }).catch((err) => console.warn('[cephandrius] offline shell unavailable:', err));
    navigator.serviceWorker.ready.then((reg) => cacheThisBuild(reg.active)).catch(() => undefined);
  };
  // The app boots behind a dynamic import, so `load` has usually already gone.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

export function canInstall(): boolean {
  return deferred !== null;
}

export async function promptInstall(): Promise<void> {
  const e = deferred;
  if (!e) return;
  deferred = null;
  notify?.();
  await e.prompt();
  await e.userChoice.catch(() => undefined);
}
