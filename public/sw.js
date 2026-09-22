/**
 * Hoid's Journal offline shell.
 *
 * Built assets are content-hashed, so they are safe to keep forever and are
 * served cache-first. The HTML shell is network-first, so a deploy is picked
 * up as soon as the reader is online again.
 */
/* Bumped when the shell's own files change — the rename and the new mark
   would otherwise be served from an install made before them. */
const CACHE = 'ceph-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './mark.svg', './logo.jpg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        const cache = await caches.open(CACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch {
        return (await caches.match('./index.html')) ?? Response.error();
      }
    })());
    return;
  }

  const path = new URL(req.url).pathname;
  // Plates and the soundtrack are not content-hashed. Cache-first kept a
  // replaced map until the cache name changed, which is how a deploy lied.
  // Network first, and the week-long HTTP header still does the caching.
  const freshFirst = path.includes('/maps/') || path.includes('/audio/');

  event.respondWith((async () => {
    if (freshFirst) {
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (res.ok && res.type === 'basic') {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        return (await caches.match(req)) ?? Response.error();
      }
    }
    const hit = await caches.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
    }
    return res;
  })());
});
