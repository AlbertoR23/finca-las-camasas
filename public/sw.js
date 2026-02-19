// Service Worker para Finca las Camasas
// Versión: 1.0.0

const CACHE_VERSION = 'v1';
const CACHE_NAME = `finca-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `supabase-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Recursos críticos a cachear en install
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon.png'
];

// === INSTALACIÓN ===
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precacheando recursos');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Instalación completa, activando...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error en instalación:', error);
      })
  );
});

// === ACTIVACIÓN ===
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('finca-cache-') && cacheName !== CACHE_NAME) {
              console.log('[SW] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
            if (cacheName.startsWith('supabase-api-') && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Eliminando caché API antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Tomando control de todas las páginas');
        return self.clients.claim();
      })
  );
});

// === ESTRATEGIA DE CACHEO ===

// Network First para API de Supabase
function networkFirstSupabase(request) {
  return fetch(request)
    .then((response) => {
      // Solo cachear respuestas exitosas
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
            console.log('[SW] ✅ Servido desde caché');
            return cached;
          }
          console.log('[SW] ❌ No hay caché disponible');
          return caches.match(OFFLINE_URL);
        });
    });
}

// Cache First para recursos estáticos
function cacheFirstStatic(request) {
  return caches.match(request)
    .then((cached) => {
      if (cached) {
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

// Network First para navegación
function networkFirstNavigation(request) {
  return fetch(request)
    .catch(() => {
      return caches.match(OFFLINE_URL)
        .then((response) => response || new Response('Offline', { status: 503 }));
    });
}

// === INTERCEPTAR PETICIONES ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones de extensiones del navegador
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

// === MENSAJES ===
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

console.log('[SW] Service Worker cargado correctamente');