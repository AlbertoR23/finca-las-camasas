import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../src/context/ThemeContext";
import "./globals.css";
// ✅ Ruta corregida: se agrega /presentation/
import SWRegistration from "../src/presentation/components/SWRegistration";
import Script from "next/script";

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
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <Script
          src="//pl29279691.profitablecpmratenework.com/c6/d0/5c/c6d05c2958c1b6eaafeb46c25ff8ee25.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRegistration />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
