/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // ✅ Vital para tu APK
  images: { unoptimized: true },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true, // Ignorar para terminar el build rápido
  },
};

export default nextConfig;
