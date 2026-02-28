export interface PendingOperation {
  id?: number;
  table: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private dbName = "FincaOfflineDB";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private constructor() {}

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Asegura que la base de datos esté abierta antes de operar.
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("pending_operations")) {
          const store = db.createObjectStore("pending_operations", { keyPath: "id", autoIncrement: true });
          store.createIndex("synced", "synced", { unique: false });
        }
        if (!db.objectStoreNames.contains("animales")) {
          db.createObjectStore("animales", { keyPath: "id" });
        }
      };
    });
  }

  async queueOperation(operation: Omit<PendingOperation, "id" | "timestamp" | "synced">): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_operations"], "readwrite");
      const store = transaction.objectStore("pending_operations");
      store.add({ ...operation, timestamp: Date.now(), synced: false });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPendingOperations(): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_operations"], "readonly");
      const store = transaction.objectStore("pending_operations");
      const request = store.getAll(); // Obtenemos todos para filtrar en JS (más seguro)
      request.onsuccess = () => {
        const all = request.result || [];
        // Filtramos manualmente para evitar el error 'not a valid key' de IDBKeyRange
        resolve(all.filter(op => op.synced === false || !op.synced));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(table: string, data: any[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      store.clear();
      if (data && data.length > 0) {
        data.forEach(item => store.add(item));
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCachedData(table: string): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], "readonly");
      const store = transaction.objectStore(table);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}
