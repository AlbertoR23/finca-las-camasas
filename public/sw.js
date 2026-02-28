const CACHE_NAME = "finca-camasas-v1";

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ✅ FILTRO CRÍTICO: Solo procesar peticiones http o https
  // Esto ignora chrome-extension, data:, etc., y evita el error que tienes.
  if (!url.protocol.startsWith("http")) return;

  // Omitimos peticiones a Supabase (se manejan por tu IndexedDB)
  if (url.hostname.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Solo cacheamos respuestas exitosas
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si no hay red, intentamos servir el index para que cargue la interfaz
          return caches.match("/");
        });
    }),
  );
});

// Limpieza de cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
});
