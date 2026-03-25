const CACHE_NAME = "finca-camasas-v3"; // ✅ Incrementar versión para forzar actualización

// URLs que NUNCA deben cachearse
const NO_CACHE_PATTERNS = [/\/api\//, /ve\.dolarapi\.com/, /supabase\.co/];

// Assets estáticos que sí se cachean
const STATIC_PATTERNS = [
  /\.(png|jpg|jpeg|svg|ico|woff2?)$/,
  /\/_next\/static\//,
];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith("http")) return;

  // APIs y datos dinámicos → SIEMPRE red primero
  if (NO_CACHE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => {
        return new Response(
          JSON.stringify({ success: false, error: "Sin conexión" }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    return;
  }

  // Assets estáticos → cache-first
  if (STATIC_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
        );
      }),
    );
    return;
  }

  // HTML, pages → network-first con fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached || caches.match("/")),
      ),
  );
});

self.addEventListener("install", (event) => {
  console.log("🔧 [SW] Instalando nueva versión...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("⚡ [SW] Activando nueva versión, limpiando cachés viejos...");
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => {
              console.log(`🗑️ [SW] Eliminando caché vieja: ${k}`);
              return caches.delete(k);
            }),
        ),
      )
      .then(() => {
        console.log("✅ [SW] Activación completa, tomando control...");
        return self.clients.claim();
      }),
  );
});
