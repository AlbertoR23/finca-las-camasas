import { OfflineStorageService } from './offline-storage.service';
import { createClient } from '../../../../utils/supabase/client';

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
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Conexión restablecida, sincronizando...');
        this.sync();
      });
    }
  }

  async sync(): Promise<void> {
    if (this.isSyncing || typeof window === 'undefined' || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Iniciando sincronización...');

    try {
      const pendingOps = await this.offlineStorage.getPendingOperations();
      
      for (const op of pendingOps) {
        try {
          await this.processOperation(op);
          await this.offlineStorage.markOperationAsSynced(op.id!);
        } catch (error) {
          console.error(`Error sincronizando operación ${op.id}:`, error);
        }
      }

      await this.offlineStorage.clearSyncedOperations();
      await this.refreshCache();
      
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(op: any): Promise<void> {
    const { table, operation, data } = op;

    switch (operation) {
      case 'INSERT':
        await this.supabase.from(table).insert([data]);
        break;
      case 'UPDATE':
        await this.supabase.from(table).update(data).eq('id', data.id);
        break;
      case 'DELETE':
        await this.supabase.from(table).delete().eq('id', data.id);
        break;
    }
  }

  private async refreshCache(): Promise<void> {
    const tables = ['animales', 'contabilidad', 'registros_diarios', 'vacunas'];
    
    for (const table of tables) {
      const { data } = await this.supabase.from(table).select('*');
      if (data) {
        await this.offlineStorage.cacheData(table, data);
      }
    }
  }
}
