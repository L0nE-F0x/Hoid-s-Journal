/**
 * Hoid's Journal offline shell.
 *
 * One rule per kind of request:
 *
 *   navigation    network first, so a deploy shows on the next visit; offline,
 *                 the cached shell. Only a navigation to the shell itself is
 *                 stored as the shell. It used to store every navigation, so a
 *                 mistyped URL (Netlify's 404 page) or og.jpg opened in a tab
 *                 became the page served offline.
 *   assets/       content-hashed: cache first, kept across deploys, and
 *                 bounded, oldest out first, because every deploy adds a set.
 *   maps/         plates are not hashed. Network first, so a replaced plate
 *                 shows; the cache only when offline. Bounded.
 *   audio/        left to the browser. Media asks in byte ranges, a 206 cannot
 *                 be cached (the put rejected on every play), and the
 *                 soundtrack is not worth an offline copy.
 *   the shell's   icons, mark, logo, manifest: served from the cache and
 *   own files     refreshed behind it, so a changed icon shows on the next
 *                 load without anyone renaming a cache.
 *   anything else untouched.
 *
 * The first visit is not controlled, so nothing it fetched passed through
 * here. `pwa.ts` posts the build's own files once the worker is ready, and
 * they are cached then; without that, offline worked only from the second
 * online visit on.
 */

/* Bump SHELL_CACHE when the list below changes. The asset and plate caches
   keep their names: their keys already say which version they hold. */
const SHELL_CACHE = 'ceph-shell-v4';
const ASSET_CACHE = 'ceph-assets-v1';
const PLATE_CACHE = 'ceph-plates-v1';
const KEEP = [SHELL_CACHE, ASSET_CACHE, PLATE_CACHE];
/** Entries, not bytes: a build is a handful of files, the plates are ~25. */
const LIMIT = { [ASSET_CACHE]: 60, [PLATE_CACHE]: 40 };

const SCOPE = new URL('./', self.location.href).pathname;
const SHELL_KEY = new URL('./index.html', self.location.href).href;
const STATIC = ['manifest.webmanifest', 'mark.svg', 'logo.jpg', 'icon-192.png', 'icon-512.png'];
const STATIC_PATHS = new Set(STATIC.map((f) => SCOPE + f));

const ok = (res) => res.status === 200 && res.type === 'basic';
const isShell = (path) => path === SCOPE || path === `${SCOPE}index.html`;

/** A redirected response cannot answer a navigation; store a plain copy. */
async function plain(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function trim(name) {
  const max = LIMIT[name];
  if (!max) return;
  const cache = await caches.open(name);
  const keys = await cache.keys();
  // keys() is in insertion order, so the front is the oldest deploy.
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

async function store(name, req, res) {
  const cache = await caches.open(name);
  await cache.put(req, res);
  await trim(name);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // One at a time: addAll is all-or-nothing, and one missing icon used to
    // leave the whole shell uncached.
    await Promise.allSettled([
      fetch(SCOPE, { cache: 'no-cache' }).then(async (res) => {
        if (ok(res)) await cache.put(SHELL_KEY, await plain(res));
      }),
      ...STATIC.map((f) => cache.add(SCOPE + f)),
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (!KEEP.includes(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

/** The page names the build it is running; keep those files. */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'cache-build' || !Array.isArray(data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(ASSET_CACHE);
    for (const href of data.urls) {
      const url = new URL(String(href), self.location.href);
      if (url.origin !== self.location.origin || !url.pathname.startsWith(`${SCOPE}assets/`)) continue;
      if (await cache.match(url.href)) continue;
      try {
        const res = await fetch(url.href);
        if (ok(res)) await cache.put(url.href, res);
      } catch { /* offline already; the next visit will try again */ }
    }
    await trim(ASSET_CACHE);
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        if (ok(fresh) && isShell(path)) {
          const copy = fresh.clone();
          event.waitUntil(plain(copy).then((res) => store(SHELL_CACHE, SHELL_KEY, res)));
        }
        return fresh;
      } catch {
        return (await caches.match(SHELL_KEY)) ?? Response.error();
      }
    })());
    return;
  }

  if (path.startsWith(`${SCOPE}audio/`) || req.headers.has('range')) return;

  if (path.startsWith(`${SCOPE}assets/`)) {
    event.respondWith((async () => {
      const hit = await caches.match(req, { cacheName: ASSET_CACHE });
      if (hit) return hit;
      const res = await fetch(req);
      if (ok(res)) event.waitUntil(store(ASSET_CACHE, req, res.clone()));
      return res;
    })());
    return;
  }

  if (path.startsWith(`${SCOPE}maps/`)) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (ok(res)) event.waitUntil(store(PLATE_CACHE, req, res.clone()));
        return res;
      } catch {
        return (await caches.match(req, { cacheName: PLATE_CACHE })) ?? Response.error();
      }
    })());
    return;
  }

  if (STATIC_PATHS.has(path)) {
    event.respondWith((async () => {
      const hit = await caches.match(req, { cacheName: SHELL_CACHE });
      const refresh = fetch(req).then((res) => {
        if (ok(res)) event.waitUntil(store(SHELL_CACHE, req, res.clone()));
        return res;
      });
      if (!hit) return refresh;
      event.waitUntil(refresh.catch(() => undefined));
      return hit;
    })());
  }
});
