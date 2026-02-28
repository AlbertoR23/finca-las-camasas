// app/sw.ts
// /// <reference lib="webworker" />
const CACHE_NAME = "finca-camasas-v1";

// Estrategia: Cache First para assets, Network First para la interfaz
self.addEventListener("fetch", (event) => {
  // Omitimos peticiones a Supabase (se manejan por tu IndexedDB)
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en caché, lo devolvemos
      if (response) return response;

      // Si no, lo buscamos en internet y lo guardamos para la próxima
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Si no hay internet y no está en caché, mostramos el index (para que cargue la UI)
          return caches.match("/");
        });
    }),
  );
});

// Limpieza de cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
});
