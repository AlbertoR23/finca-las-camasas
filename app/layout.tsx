import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finca las Camasas",
  description: "Sistema de Gestión Ganadera",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finca las Camasas"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finca las Camasas" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Registro del Service Worker */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(registration) {
                    console.log('✅ [PWA] Service Worker registrado:', registration.scope);
                    
                    // Detectar actualizaciones
                    registration.addEventListener('updatefound', function() {
                      const newWorker = registration.installing;
                      console.log('🔄 [PWA] Nueva versión del SW detectada');
                      
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('✨ [PWA] Nueva versión lista. Recarga para actualizar.');
                            // Opcional: mostrar notificación al usuario
                            if (confirm('Hay una nueva versión disponible. ¿Recargar ahora?')) {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      }
                    });
                    
                    // Verificar actualizaciones cada 1 hora
                    setInterval(function() {
                      registration.update();
                    }, 60 * 60 * 1000);
                  })
                  .catch(function(error) {
                    console.error('❌ [PWA] Error registrando SW:', error);
                  });
                
                // Manejar cuando el SW toma control
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  console.log('🔄 [PWA] SW actualizado, recargando...');
                  window.location.reload();
                });
              });

              // Eventos de conectividad
              window.addEventListener('online', function() {
                console.log('🌐 [PWA] Conexión restablecida');
                document.body.dispatchEvent(new CustomEvent('app-online'));
              });

              window.addEventListener('offline', function() {
                console.log('📡 [PWA] Sin conexión - modo offline activo');
                document.body.dispatchEvent(new CustomEvent('app-offline'));
              });
              
              // Log inicial de estado
              console.log('📊 [PWA] Estado inicial:', navigator.onLine ? 'Online' : 'Offline');
            } else {
              console.warn('⚠️ [PWA] Service Workers no soportados en este navegador');
            }
          `}
        </Script>

        {/* Fix para iOS PWA */}
        <Script id="ios-pwa-fix" strategy="afterInteractive">
          {`
            (function() {
              const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
              const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
              
              if (isIos && isStandalone) {
                console.log('🍎 [PWA] Modo iOS standalone detectado');
                
                // Prevenir que enlaces externos abran Safari
                document.addEventListener('click', function(e) {
                  const target = e.target.closest('a');
                  if (target && target.href && target.href.startsWith(window.location.origin)) {
                    e.preventDefault();
                    window.location = target.href;
                  }
                });
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}