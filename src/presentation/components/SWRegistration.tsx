"use client";
import { useEffect } from "react";

export default function SWRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Finca las Camasas: Offline Ready"))
        .catch((err) => console.error("❌ Error SW:", err));
    }
  }, []);
  return null;
}
