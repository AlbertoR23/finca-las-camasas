"use client";

import { useState, useEffect, useCallback } from "react";
import { QueueService } from "@/src/infrastructure/services/offline/queue.service";
import { SyncService } from "@/src/infrastructure/services/offline/sync.service";
import { useOfflineStatus } from "./useOfflineStatus";

export function useSyncStatus() {
  const {
    isOnline,
    wasOffline,
    pendingCount: offlinePending, // Datos detectados por el SW o IndexedDB
  } = useOfflineStatus();

  const [queueLength, setQueueLength] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Instancias de servicios (Singleton)
  const queueService = QueueService.getInstance();
  const syncService = SyncService.getInstance();

  /**
   * ✅ MEJORA: Escuchar cambios en la cola de IndexedDB de forma reactiva.
   * Esto mantiene el número de la nube actualizado al instante.
   */
  useEffect(() => {
    // Actualización inicial
    queueService.getQueueLength().then(setQueueLength);

    const unsubscribe = queueService.onQueueChange((count) => {
      setQueueLength(count);

      // ✅ Si recuperamos internet y hay cosas nuevas, disparamos sync automáticamente
      if (isOnline && count > 0 && !isSyncing) {
        forceSync();
      }
    });

    return unsubscribe;
  }, [isOnline]);

  /**
   * ✅ MEJORA: Sincronización forzada usando el SyncService optimizado.
   * Usamos el SyncService.sync() porque ese es el que ya limpia los campos 'pending'.
   */
  const forceSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    setSyncError(null);
    console.log("🚀 Forzando sincronización desde el UI...");

    try {
      // Llamamos al servicio maestro de sincronización
      await syncService.sync();

      setLastSyncTime(new Date());
      // Actualizamos la longitud de la cola después de sincronizar
      const finalCount = await queueService.getQueueLength();
      setQueueLength(finalCount);
    } catch (error) {
      console.error("❌ Error en forceSync:", error);
      setSyncError(
        error instanceof Error ? error.message : "Error de sincronización",
      );
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline]);

  // El total de pendientes es lo que hay en la cola de operaciones
  const pendingCount = Math.max(offlinePending, queueLength);

  return {
    isOnline,
    wasOffline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncError,
    forceSync,
    hasPending: pendingCount > 0,
  };
}
