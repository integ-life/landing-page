// Retire the legacy Integ.Life PWA that previously lived on this origin.
// Keep this file at /service-worker.js so existing registrations can update.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

      await self.registration.unregister();

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      await Promise.all(
        windows.map((windowClient) => windowClient.navigate(windowClient.url)),
      );
    })(),
  );
});
