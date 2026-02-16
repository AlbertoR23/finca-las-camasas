import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // ✅ Configuración explícita de Turbopack
  turbopack: {
    // Configuración básica - vacía es suficiente para la mayoría de los casos
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  scope: '/',
  sw: 'sw.js',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60
          },
          networkTimeoutSeconds: 10,
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/ve\.dolarapi\.com\/.*$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'bcv-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60
          }
        }
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60
          }
        }
      }
    ]
  }
})(nextConfig);

export default pwaConfig;