'use client';
import React, { useState } from 'react';
import { useOfflineStatus } from '@/src/presentation/hooks/useOfflineStatus';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // ✅ CORREGIDO: pendingCount declarado como number para evitar error TS2367
  const [pendingCount] = useState<number>(0); // Esto fuerza el tipo number

  // ✅ Mantiene la lógica original: no mostrar si siempre ha estado online
  if (isOnline && !wasOffline) return null;

  // Manejador de sincronización manual con feedback visual
  const handleManualSync = async () => {
    setIsSyncing(true);
    // Aquí iría la lógica real de sincronización
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div 
        className={`
          rounded-2xl shadow-2xl p-4 
          transition-all duration-500 ease-in-out
          ${isOnline 
            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300' 
            : 'bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300'
          }
          ${isOnline && wasOffline ? 'animate-slideInUp' : ''}
          ${!isOnline ? 'animate-slideInUp' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          {/* ICONO ANIMADO */}
          <div className="flex-shrink-0 pt-0.5">
            {isOnline ? (
              <div className="relative">
                <span className="text-2xl animate-bounceIn">✅</span>
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-30 animate-ping" />
              </div>
            ) : (
              <span className="text-2xl animate-wave">📡</span>
            )}
          </div>

          {/* CONTENIDO TEXTUAL */}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm leading-tight ${
              isOnline ? 'text-emerald-800' : 'text-amber-800'
            }`}>
              {isOnline ? '🎉 Conexión restablecida' : '⚠️ Sin conexión'}
            </p>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {isOnline 
                ? 'Todos tus cambios están a salvo' 
                : 'Guardamos tus cambios localmente'}
            </p>
            
            {/* ✅ CONTADOR CORREGIDO - TypeScript ya no da error */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-400">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-1.5 animate-pulse" />
                  {pendingCount} {pendingCount === 1 ? 'operación pendiente' : 'operaciones pendientes'}
                </span>
              </div>
            )}
          </div>

          {/* BOTÓN DE SINCRONIZACIÓN MANUAL */}
          {isOnline && wasOffline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl font-semibold text-xs
                transition-all duration-300 ease-out
                ${isSyncing 
                  ? 'bg-emerald-300 text-emerald-800 cursor-wait scale-95' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95'
                }
                shadow-md hover:shadow-lg transform
              `}
            >
              {isSyncing ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sync...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">🔄 Sincronizar</span>
              )}
            </button>
          )}

          {/* INDICADOR DE ESTADO VISUAL */}
          <div className={`
            w-3 h-3 rounded-full flex-shrink-0 mt-1
            ${isOnline 
              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' 
              : 'bg-amber-500 shadow-lg shadow-amber-500/50'
            }
          `} />
        </div>
      </div>
    </div>
  );
}