// Kill-switch service worker: destroys any lingering old PWA service worker,
// clears all caches, and cleanly unregisters without forcing window reloads.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});
