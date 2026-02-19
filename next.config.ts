import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Turbopack para desarrollo (más rápido)
  // Webpack para producción (más compatible)
};

export default nextConfig;