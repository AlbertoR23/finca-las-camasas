'use client';

import { useState, useEffect } from 'react';
import { OfflineStorageService } from '@/src/infrastructure/services/offline/offline-storage.service';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setTimeout(() => setWasOffline(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar operaciones pendientes
  useEffect(() => {
    const checkPending = async () => {
      try {
        const offlineStorage = OfflineStorageService.getInstance();
        const pending = await offlineStorage.getPendingOperations();
        setPendingCount(pending.length);
      } catch (error) {
        console.error('Error checking pending operations:', error);
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return { isOnline, wasOffline, pendingCount };
}
