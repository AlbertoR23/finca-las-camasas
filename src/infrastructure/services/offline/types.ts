export interface QueueItem {
  id: string;
  table: "animales" | "contabilidad" | "registros_diarios" | "vacunas";
  operation: "INSERT" | "UPDATE" | "DELETE";
  data: Record<string, any>;
  timestamp: number;
  status: QueueStatus;
  retryCount?: number;
}

export type QueueStatus = "pending" | "processing" | "failed" | "completed";

export interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
  retryCount?: number;
}

export interface ConnectivityInfo {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime?: Date;
  lastOfflineTime?: Date;
  connectionType?: string;
  effectiveType?: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  failed: number;
  completed: number;
  oldestTimestamp?: number;
}
