/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Obligatorio para Capacitor - genera carpeta 'out'
  output: "export",

  // ✅ Imágenes locales como estáticas (no optimizadas por Next)
  images: {
    unoptimized: true,
  },

  // ✅ Trailing slash para rutas relativas en APK
  trailingSlash: true,

  // ✅ Mejor rendimiento en producción
  swcMinify: true,

  // ✅ Eliminar console.log en producción (opcional)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ✅ Evitar errores de tipos en build (útil para APK)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Evitar errores de ESLint en build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
