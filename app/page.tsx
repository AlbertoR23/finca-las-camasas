"use client";

import DashboardPage from "@/src/presentation/pages/DashboardPage";

// Este archivo ahora es solo un wrapper que importa el DashboardPage
// Toda la lógica compleja se movió a src/presentation/pages/DashboardPage.tsx
export default function Home() {
  return <DashboardPage />;
}
