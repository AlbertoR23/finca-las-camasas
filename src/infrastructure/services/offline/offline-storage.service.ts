export interface PendingOperation {
  id?: number;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private dbName = 'FincaOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private constructor() {}

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Tabla para operaciones pendientes
        if (!db.objectStoreNames.contains('pending_operations')) {
          const store = db.createObjectStore('pending_operations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Tablas para datos cacheados
        if (!db.objectStoreNames.contains('animales')) {
          const animalStore = db.createObjectStore('animales', { keyPath: 'id' });
          animalStore.createIndex('nombre', 'nombre', { unique: false });
        }

        if (!db.objectStoreNames.contains('contabilidad')) {
          db.createObjectStore('contabilidad', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('registros_diarios')) {
          db.createObjectStore('registros_diarios', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('vacunas')) {
          db.createObjectStore('vacunas', { keyPath: 'id' });
        }
      };
    });
  }

  async queueOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_operations'], 'readwrite');
      const store = transaction.objectStore('pending_operations');
      
      const request = store.add({
        ...operation,
        timestamp: Date.now(),
        synced: false
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_operations'], 'readonly');
      const store = transaction.objectStore('pending_operations');
      const index = store.index('synced');
      
      // CORREGIDO: Usar IDBKeyRange.only(0) para false
      const range = IDBKeyRange.only(0); // 0 = false
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markOperationAsSynced(id: number): Promise<void> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_operations'], 'readwrite');
      const store = transaction.objectStore('pending_operations');
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          operation.synced = true;
          const updateRequest = store.put(operation);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cacheData(table: string, data: any[]): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      
      // Limpiar caché anterior
      store.clear();
      
      // Guardar nuevos datos
      if (data && data.length > 0) {
        data.forEach(item => {
          store.add(item);
        });
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCachedData(table: string): Promise<any[]> {
    if (!this.db) {
      await this.initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedOperations(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_operations'], 'readwrite');
      const store = transaction.objectStore('pending_operations');
      const index = store.index('synced');
      
      // CORREGIDO: Usar IDBKeyRange.only(1) para true
      const range = IDBKeyRange.only(1); // 1 = true
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingOperations();
    return pending.length;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
    
    const tables = ['pending_operations', 'animales', 'contabilidad', 'registros_diarios', 'vacunas'];
    
    for (const table of tables) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([table], 'readwrite');
        const store = transaction.objectStore(table);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}