// Service Worker para Finca las Camasas - v5
// VERSIÓN PROBADA Y FUNCIONAL

const CACHE_VERSION = 'v5';
const CACHE_NAME = `finca-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `supabase-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Recursos críticos
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/',
  '/manifest.json',
  '/icon.png'
];

// ========== INSTALACIÓN ==========
self.addEventListener('install', (event) => {
  console.log('[SW v5] 🔧 Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW v5] Precacheando:', PRECACHE_URLS);
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW v5] ✅ Instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW v5] ❌ Error instalando:', error);
      })
  );
});

// ========== ACTIVACIÓN ==========
self.addEventListener('activate', (event) => {
  console.log('[SW v5] ⚡ Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW v5] 🗑️ Eliminando caché vieja:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW v5] ✅ Activado, tomando control');
        return self.clients.claim();
      })
  );
});

// ========== FETCH - ESTRATEGIA CRÍTICA ==========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // 1. NAVEGACIÓN (páginas HTML) - MÁS IMPORTANTE
  if (request.mode === 'navigate') {
    console.log('[SW v5] 🌐 Navegación detectada:', url.pathname);
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          console.log('[SW v5] ✅ Navegación exitosa');
          return response;
        })
        .catch((error) => {
          console.log('[SW v5] ❌ Sin red, sirviendo offline.html');
          
          return caches.match(OFFLINE_URL)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW v5] ✅ offline.html servido');
                return cachedResponse;
              }
              
              // Fallback final
              console.log('[SW v5] ⚠️ offline.html no encontrado, generando HTML');
              return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión</title>
                  <style>
                    body {
                      margin: 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
                      color: white;
                      font-family: system-ui, -apple-system, sans-serif;
                      text-align: center;
                      padding: 2rem;
                    }
                    .container { max-width: 500px; }
                    .icon { font-size: 5rem; margin-bottom: 1rem; }
                    h1 { font-size: 2rem; margin-bottom: 1rem; }
                    button {
                      background: white;
                      color: #1B4332;
                      border: none;
                      padding: 1rem 2rem;
                      border-radius: 2rem;
                      font-size: 1rem;
                      font-weight: bold;
                      cursor: pointer;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
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
                  headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache'
                  }
                }
              );
            });
        })
    );
    return;
  }
  
  // 2. API SUPABASE
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // 3. RECURSOS ESTÁTICOS
  if (request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, clone);
              });
            }
            return response;
          });
        })
    );
    return;
  }
  
  // 4. OTROS
  event.respondWith(fetch(request));
});

// ========== MENSAJES ==========
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW v5] ✅ Service Worker v5 cargado');