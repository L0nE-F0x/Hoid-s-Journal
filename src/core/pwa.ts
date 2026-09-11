/**
 * Offline shell and install prompt. Both are no-ops in dev: a stale service
 * worker in front of the dev server is a bad afternoon.
 */

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
let notify: (() => void) | null = null;

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

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const register = () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch((err) => console.warn('[cephandrius] offline shell unavailable:', err));
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
