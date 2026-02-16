export class LocalStorageService {
  private static instance: LocalStorageService;

  private constructor() {}

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error);
    }
  }

  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  }

  clear(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  }

  // Métodos específicos para la app
  guardarTasaBCV(tasa: number): void {
    this.setItem("tasaGuardada", {
      value: tasa,
      fecha: new Date().toISOString(),
    });
  }

  obtenerTasaBCV(): { value: number; fecha: Date } | null {
    const data = this.getItem<{ value: number; fecha: string }>("tasaGuardada");
    if (!data) return null;
    return {
      value: data.value,
      fecha: new Date(data.fecha),
    };
  }

  guardarPreferenciaMoneda(verEnDolares: boolean): void {
    this.setItem("preferenciaMoneda", verEnDolares);
  }

  obtenerPreferenciaMoneda(): boolean {
    return this.getItem<boolean>("preferenciaMoneda", false) || false;
  }
}
