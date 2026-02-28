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
        console.log("🌐 Red detectada, sincronizando...");
        this.sync();
      });
    }
  }

  async sync(): Promise<void> {
    if (this.isSyncing || typeof window === "undefined" || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    console.log("🔄 Iniciando sincronización...");

    try {
      // Verificar conexión real
      const { error: pingError } = await this.supabase
        .from("animales")
        .select("id")
        .limit(1);
      if (pingError) throw new Error("Sin conexión a Supabase");

      const pendingOps = await this.offlineStorage.getPendingOperations();
      console.log(`📋 Operaciones pendientes: ${pendingOps.length}`);

      for (const op of pendingOps) {
        try {
          await this.processOperation(op);
          if (op.id) {
            await this.offlineStorage.markOperationAsSynced(op.id);
          }
          console.log(`✅ Operación ${op.id} (${op.operation}) sincronizada`);
        } catch (error) {
          console.error(`❌ Error en operación ${op.id}:`, error);
        }
      }

      // Esperar para que Supabase indexe
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await this.offlineStorage.clearSyncedOperations();
      await this.refreshCache();

      window.dispatchEvent(new CustomEvent("sync-complete"));
      console.log("✅ Sincronización completada");
    } catch (error) {
      console.error("❌ Error en sincronización:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(op: PendingOperation): Promise<void> {
    const { table, operation, data } = op;

    // Eliminar campos internos antes de enviar a Supabase
    const { pending, synced, ...cleanData } = data;

    switch (operation) {
      case "INSERT":
        await this.supabase.from(table).insert([cleanData]);
        break;

      case "UPDATE":
        if (!cleanData.id) throw new Error("ID requerido para UPDATE");
        await this.supabase
          .from(table)
          .update(cleanData)
          .eq("id", cleanData.id);
        break;

      case "DELETE":
        if (!cleanData.id) throw new Error("ID requerido para DELETE");
        await this.supabase.from(table).delete().eq("id", cleanData.id);
        break;

      default:
        throw new Error(`Operación desconocida: ${operation}`);
    }
  }

  private async refreshCache(): Promise<void> {
    const tables = ["animales", "contabilidad", "registros_diarios", "vacunas"];
    console.log("📥 Refrescando caché local...");

    for (const table of tables) {
      try {
        const { data, error } = await this.supabase.from(table).select("*");
        if (!error && data) {
          await this.offlineStorage.cacheData(table, data);
        }
      } catch (e) {
        console.warn(`No se pudo refrescar ${table}`);
      }
    }
  }
}
