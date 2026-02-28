// src/infrastructure/services/offline/sync.service.ts
import {
  OfflineStorageService,
  PendingOperation,
} from "./offline-storage.service";
import { createClient } from "@/utils/supabase/client";

export class SyncService {
  private static instance: SyncService;
  private offlineStorage = OfflineStorageService.getInstance();
  private supabase = createClient();
  private isSyncing = false;

  private constructor() {
    this.setupNetworkListeners();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupNetworkListeners(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Red detectada, validando conexión real...");
        // Intentar sincronizar solo si realmente hay internet
        this.sync();
      });
    }
  }

  async sync(): Promise<void> {
    // Evitar múltiples sincronizaciones simultáneas o si no hay red real
    if (this.isSyncing || typeof window === "undefined" || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    console.log("🔄 Iniciando proceso de sincronización masiva...");

    try {
      // 1. Validar conexión real con un "ping" a Supabase antes de empezar
      const { error: pingError } = await this.supabase
        .from("animales")
        .select("id")
        .limit(1);
      if (pingError) throw new Error("No hay conexión real con Supabase");

      const pendingOps = await this.offlineStorage.getPendingOperations();
      console.log(
        `📋 Operaciones pendientes encontradas: ${pendingOps.length}`,
      );

      // 2. Procesar en orden secuencial (importante para mantener coherencia)
      for (const op of pendingOps) {
        try {
          await this.processOperation(op);
          await this.offlineStorage.markOperationAsSynced(op.id!);
          console.log(`✅ Operación ${op.id} (${op.operation}) sincronizada`);
        } catch (error) {
          // Si una falla, registramos el error pero seguimos con la siguiente
          console.error(
            `❌ Falló la operación ${op.id} en la tabla ${op.table}:`,
            error,
          );
        }
      }

      // 3. Limpiar la cola y refrescar la memoria local con datos del servidor
      await this.offlineStorage.clearSyncedOperations();
      await this.refreshCache();

      console.log(
        "✅ Sincronización de Finca las Camasas completada con éxito",
      );
    } catch (error) {
      console.error("❌ Abortando sincronización por fallo de red:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  public async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pending = await this.offlineStorage.getPendingOperations();
      if (pending.length === 0) return;

      for (const op of pending) {
        await this.processOperation(op);
      }

      // ✅ TIEMPO DE ESPERA: 2 segundos para asegurar que Supabase indexó los datos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await this.offlineStorage.clearSyncedOperations();
      await this.refreshCache();

      // ✅ Avisamos a los hooks que la sincronización terminó
      window.dispatchEvent(new CustomEvent("sync-complete"));
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      this.isSyncing = false;
    }
  }

  private async refreshCache(): Promise<void> {
    const tables = ["animales", "contabilidad", "registros_diarios", "vacunas"];
    console.log("📥 Refrescando caché local con datos frescos...");

    for (const table of tables) {
      try {
        const { data, error } = await this.supabase.from(table).select("*");
        if (!error && data) {
          await this.offlineStorage.cacheData(table, data);
        }
      } catch (e) {
        console.warn(`No se pudo refrescar la tabla ${table}`);
      }
    }
  }
}
