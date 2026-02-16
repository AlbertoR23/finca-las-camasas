'use client';

import React from 'react';
import { useOfflineStatus } from '@/src/presentation/hooks/useOfflineStatus';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus();
  // Para este ejemplo, asumimos pendingCount = 0
  // En una implementación real, vendría de un hook
  const pendingCount = 0;

  if (isOnline && !wasOffline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div className={`rounded-2xl shadow-2xl p-4 transition-all duration-500 ${
        isOnline 
          ? 'bg-emerald-50 border border-emerald-200 translate-y-0 opacity-100' 
          : 'bg-amber-50 border border-amber-200 translate-y-0 opacity-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <div>
            <p className="font-bold text-sm">
              {isOnline ? 'Conexión restablecida' : 'Sin conexión'}
            </p>
            <p className="text-xs text-slate-600">
              {isOnline 
                ? 'Los datos se están sincronizando' 
                : 'Los cambios se guardarán cuando vuelvas a tener conexión'}
            </p>
            {pendingCount > 0 && (
              <p className="text-xs font-bold text-amber-600 mt-1">
                {pendingCount} operación(es) pendiente(s)
              </p>
            )}
          </div>
          {!isOnline && (
            <span className="text-2xl ml-auto">📡</span>
          )}
        </div>
      </div>
    </div>
  );
}
