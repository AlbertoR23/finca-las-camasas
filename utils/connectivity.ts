export interface ConnectivityInfo {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function getConnectivityInfo(): ConnectivityInfo {
  const info: ConnectivityInfo = {
    isOnline: navigator.onLine,
  };

  if ("connection" in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      info.connectionType = conn.type;
      info.effectiveType = conn.effectiveType;
      info.downlink = conn.downlink;
      info.rtt = conn.rtt;
      info.saveData = conn.saveData;
    }
  }

  return info;
}

export function isConnectionSlow(): boolean {
  if (!navigator.onLine) return false;

  if ("connection" in navigator) {
    const conn = (navigator as any).connection;
    if (conn && conn.effectiveType) {
      return ["slow-2g", "2g"].includes(conn.effectiveType);
    }
  }

  return false;
}

export function onOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
}

export function onOffline(callback: () => void): () => void {
  window.addEventListener("offline", callback);
  return () => window.removeEventListener("offline", callback);
}

export async function waitForOnline(timeout?: number): Promise<boolean> {
  if (navigator.onLine) return true;

  return new Promise((resolve) => {
    const timeoutId = timeout
      ? setTimeout(() => {
          cleanup();
          resolve(false);
        }, timeout)
      : undefined;

    const onlineHandler = () => {
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      window.removeEventListener("online", onlineHandler);
      if (timeoutId) clearTimeout(timeoutId);
    };

    window.addEventListener("online", onlineHandler);
  });
}
