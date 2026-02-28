"use client";

import { Cloud, CloudOff, CloudUpload, RefreshCw } from "lucide-react";
import { useSyncStatus } from "../../hooks/useSyncStatus";

export default function SyncIndicator() {
  const { isOnline, pendingCount, isSyncing, syncError } = useSyncStatus();

  // Caso 1: Error en la sincronización
  if (syncError) {
    return (
      <div
        className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md border border-red-200"
        title={syncError}
      >
        <CloudOff className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase">Error Sync</span>
      </div>
    );
  }

  // Caso 2: Está sincronizando activamente ahora mismo
  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md border border-blue-200">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-[10px] font-bold uppercase">Subiendo...</span>
      </div>
    );
  }

  // Caso 3: Hay datos pendientes por subir (Modo Offline o esperando red)
  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-2 text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-md border border-orange-200">
        <CloudUpload className="w-4 h-4 animate-bounce" />
        <span className="text-[10px] font-bold uppercase">
          {pendingCount} Pendientes
        </span>
      </div>
    );
  }

  // Caso 4: Offline pero sin datos pendientes
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200">
        <CloudOff className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase">Sin Red</span>
      </div>
    );
  }

  // Caso 5: Online y todo sincronizado (Estado ideal)
  return (
    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200">
      <Cloud className="w-4 h-4" /> {/* ✅ Cambiado a Cloud */}
      <span className="text-[10px] font-bold uppercase">Al Día</span>
    </div>
  );
}
