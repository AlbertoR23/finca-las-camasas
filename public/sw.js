const CACHE_VERSION = 'v3';
const CACHE_NAME = `finca-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `supabase-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Archivos a cachear al instalar
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon.png'
];

// ========== INSTALACIÓN ==========
self.addEventListener('install', (event) => {
  console.log('[SW] 🔧 Instalando versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precacheando recursos esenciales');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] ✅ Recursos precacheados correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] ❌ Error precacheando:', error);
      })
  );
});

// ========== ACTIVACIÓN ==========
self.addEventListener('activate', (event) => {
  console.log('[SW] ⚡ Activando versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('finca-cache-') && cacheName !== CACHE_NAME) {
              console.log('[SW] 🗑️ Eliminando caché vieja:', cacheName);
              return caches.delete(cacheName);
            }
            if (cacheName.startsWith('supabase-api-') && cacheName !== API_CACHE_NAME) {
              console.log('[SW] 🗑️ Eliminando API caché vieja:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] ✅ Cachés limpias');
        return self.clients.claim();
      })
  );
});

// ========== ESTRATEGIAS DE CACHÉ ==========

// Network First para API de Supabase
function networkFirstSupabase(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(API_CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
          console.log('[SW] 💾 Cacheado:', request.url.substring(0, 80));
        });
      }
      return response;
    })
    .catch(() => {
      console.log('[SW] 📡 Sin red, buscando en caché:', request.url.substring(0, 80));
      return caches.match(request)
        .then((cached) => {
          if (cached) {
            console.log('[SW] ✅ Servido desde caché API');
            return cached;
          }
          console.log('[SW] ❌ No hay caché, mostrando offline');
          return caches.match(OFFLINE_URL);
        });
    });
}

// Cache First para recursos estáticos
function cacheFirstStatic(request) {
  return caches.match(request)
    .then((cached) => {
      if (cached) {
        console.log('[SW] 📦 Recurso desde caché:', request.url.substring(0, 50));
        return cached;
      }
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    });
}

// Network First para navegación - CRÍTICO PARA OFFLINE
function networkFirstNavigation(request) {
  return fetch(request)
    .then((response) => {
      // Cachear páginas exitosas
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    })
    .catch(() => {
      console.log('[SW] 🌐 Sin conexión, intentando caché o offline.html');
      
      // Primero intentar página cacheada
      return caches.match(request)
        .then((cached) => {
          if (cached) {
            console.log('[SW] ✅ Página cacheada disponible');
            return cached;
          }
          
          // Si no hay página cacheada, mostrar offline.html
          console.log('[SW] 📄 Mostrando offline.html');
          return caches.match(OFFLINE_URL)
            .then((offlinePage) => {
              if (offlinePage) {
                return offlinePage;
              }
              
              // Fallback final: HTML inline
              console.log('[SW] ⚠️ offline.html no encontrado, usando fallback');
              return new Response(
                `<!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      padding: 2rem;
                      text-align: center;
                    }
                    .icon { font-size: 5rem; margin-bottom: 1rem; }
                    h1 { font-size: 2rem; margin-bottom: 1rem; }
                    p { opacity: 0.9; margin-bottom: 2rem; }
                    button {
                      background: white;
                      color: #1B4332;
                      border: none;
                      padding: 1rem 2rem;
                      border-radius: 2rem;
                      font-weight: bold;
                      font-size: 1rem;
                      cursor: pointer;
                    }
                  </style>
                </head>
                <body>
                  <div>
                    <div class="icon">📡</div>
                    <h1>Sin conexión a Internet</h1>
                    <p>No hay conexión en este momento.</p>
                    <button onclick="window.location.reload()">🔄 Reintentar</button>
                  </div>
                  <script>
                    window.addEventListener('online', () => window.location.reload());
                  </script>
                </body>
                </html>`,
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/html; charset=utf-8'
                  })
                }
              );
            });
        });
    });
}

// ========== INTERCEPTAR PETICIONES ==========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones que no sean HTTP/HTTPS
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // 1. API de Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirstSupabase(request));
    return;
  }
  
  // 2. Navegación (páginas HTML)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  
  // 3. Recursos estáticos (imágenes, JS, CSS)
  if (request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }
  
  // 4. Otros: Network Only
  event.respondWith(fetch(request));
});

// ========== MENSAJES ==========
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

console.log('[SW] ✅ Service Worker cargado correctamente - Versión', CACHE_VERSION);