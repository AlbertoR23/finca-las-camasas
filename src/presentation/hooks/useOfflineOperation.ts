// src/presentation/hooks/useOfflineOperation.ts
import { useState, useCallback, useEffect } from 'react';
import { OfflineStorageService } from '@/src/infrastructure/services/offline/offline-storage.service';
import { SyncService } from '@/src/infrastructure/services/offline/sync.service';

export function useOfflineOperation() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  
  const offlineStorage = OfflineStorageService.getInstance();
  const syncService = SyncService.getInstance();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncService.sync();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPending = async () => {
      const pending = await offlineStorage.getPendingOperations();
      setPendingCount(pending.length);
    };
    
    checkPending();
    const interval = setInterval(checkPending, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const executeWithOffline = useCallback(async (
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    data: any,
    onlineAction: () => Promise<any>
  ) => {
    if (isOnline) {
      // Con internet: ejecutar directamente
      return await onlineAction();
    } else {
      // Sin internet: encolar para después
      await offlineStorage.queueOperation({
        table,
        operation,
        data
      });
      
      // Guardar en caché local
      const cached = await offlineStorage.getCachedData(table);
      if (operation === 'INSERT') {
        cached.push({ ...data, pending: true });
      } else if (operation === 'UPDATE') {
        const index = cached.findIndex(item => item.id === data.id);
        if (index >= 0) {
          cached[index] = { ...cached[index], ...data, pending: true };
        }
      } else if (operation === 'DELETE') {
        const filtered = cached.filter(item => item.id !== data.id);
        await offlineStorage.cacheData(table, filtered);
      }
      
      return { pending: true, ...data };
    }
  }, [isOnline]);

  const forceSync = useCallback(async () => {
    await syncService.sync();
  }, []);

  return {
    isOnline,
    pendingCount,
    executeWithOffline,
    forceSync
  };
}