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
          const store = db.createObjectStore("pending_operations", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("synced", "synced", { unique: false });
        }
        if (!db.objectStoreNames.contains("animales")) {
          db.createObjectStore("animales", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("contabilidad")) {
          db.createObjectStore("contabilidad", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("registros_diarios")) {
          db.createObjectStore("registros_diarios", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("vacunas")) {
          db.createObjectStore("vacunas", { keyPath: "id" });
        }
      };
    });
  }

  async queueOperation(
    operation: Omit<PendingOperation, "id" | "timestamp" | "synced">,
  ): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_operations"], "readwrite");
      const store = transaction.objectStore("pending_operations");
      const request = store.add({
        ...operation,
        timestamp: Date.now(),
        synced: false,
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(["pending_operations"], "readonly");
      const store = transaction.objectStore("pending_operations");
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result || [];
        resolve(all.filter((op) => !op.synced));
      };
    });
  }

  async markOperationAsSynced(id: number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_operations"], "readwrite");
      const store = transaction.objectStore("pending_operations");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const op = getRequest.result;
        if (op) {
          op.synced = true;
          store.put(op);
        }
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  async clearSyncedOperations(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(["pending_operations"], "readwrite");
      const store = transaction.objectStore("pending_operations");
      const index = store.index("synced");
      const request = index.openCursor(IDBKeyRange.only(true));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
      transaction.oncomplete = () => resolve();
    });
  }

  async cacheData(table: string, data: any[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      store.clear();
      if (data && data.length > 0) {
        data.forEach((item) => store.add(item));
      }
      transaction.oncomplete = () => resolve();
    });
  }

  async getCachedData(table: string): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([table], "readonly");
      const store = transaction.objectStore(table);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingOperations();
    return pending.length;
  }
}
