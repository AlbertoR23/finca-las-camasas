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

  public async processOperation(op: PendingOperation): Promise<void> {
    const { table, operation, data } = op;

    // ✅ MEJORA: Limpiar datos de UI antes de enviar a base de datos
    // Eliminamos 'pending' y otros campos locales que no existen en Supabase
    const { pending, ...cleanData } = data;

    switch (operation) {
      case "INSERT":
        // En INSERT, si el ID es temporal (UUID generado localmente),
        // Supabase lo aceptará si la columna es UUID, de lo contrario,
        // podrías querer eliminarlo para que Supabase genere uno nuevo.
        const { error: insError } = await this.supabase
          .from(table)
          .insert([cleanData]);
        if (insError) throw insError;
        break;

      case "UPDATE":
        if (!cleanData.id) throw new Error("Falta ID para actualizar");
        const { error: updError } = await this.supabase
          .from(table)
          .update(cleanData)
          .eq("id", cleanData.id);
        if (updError) throw updError;
        break;

      case "DELETE":
        if (!cleanData.id) throw new Error("Falta ID para eliminar");
        const { error: delError } = await this.supabase
          .from(table)
          .delete()
          .eq("id", cleanData.id);
        if (delError) throw delError;
        break;
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
