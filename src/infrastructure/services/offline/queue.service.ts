import { OfflineStorageService } from "./offline-storage.service";
import { SyncService } from "./sync.service";
import { QueueItem, QueueStatus } from "./types";

export class QueueService {
  private static instance: QueueService;
  private offlineStorage = OfflineStorageService.getInstance();
  private syncService = SyncService.getInstance();
  private processingQueue = false;
  private listeners: ((count: number) => void)[] = [];

  private constructor() {
    this.setupAutoSync();
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private setupAutoSync(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Conexión detectada, procesando cola...");
        this.processQueue();
      });
    }
  }

  async addToQueue(
    item: Omit<QueueItem, "id" | "timestamp" | "status">,
  ): Promise<void> {
    await this.offlineStorage.queueOperation({
      table: item.table,
      operation: item.operation,
      data: item.data,
    });
    this.notifyListeners();
  }

  async processQueue(): Promise<void> {
    if (this.processingQueue || !navigator.onLine) return;

    this.processingQueue = true;
    console.log("🔄 Procesando cola de operaciones...");

    try {
      const pendingOps = await this.offlineStorage.getPendingOperations();

      for (const op of pendingOps) {
        try {
          await this.syncService.processOperation(op);
          await this.offlineStorage.markOperationAsSynced(op.id!);
          console.log(`✅ Operación ${op.id} procesada`);
        } catch (error) {
          console.error(`❌ Error en operación ${op.id}:`, error);
        }
      }

      await this.offlineStorage.clearSyncedOperations();
      console.log("✅ Cola procesada completamente");
    } catch (error) {
      console.error("❌ Error procesando cola:", error);
    } finally {
      this.processingQueue = false;
      this.notifyListeners();
    }
  }

  async getQueueLength(): Promise<number> {
    const pending = await this.offlineStorage.getPendingOperations();
    return pending.length;
  }

  onQueueChange(callback: (count: number) => void): () => void {
    this.listeners.push(callback);
    this.getQueueLength().then(callback);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private async notifyListeners(): Promise<void> {
    const count = await this.getQueueLength();
    this.listeners.forEach((l) => l(count));
  }
}
