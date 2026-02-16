// src/infrastructure/services/bcv/bcv.service.ts
export interface TasaBCV {
  value: number;
  fecha: Date;
  origen: "api" | "local" | "default";
}

export class BCVService {
  private static instance: BCVService;
  private readonly API_URL = "https://ve.dolarapi.com/v1/dolares/oficial";
  private readonly STORAGE_KEY = "tasaGuardada";
  private readonly TASA_DEFAULT = 100.0;

  private constructor() {}

  static getInstance(): BCVService {
    if (!BCVService.instance) {
      BCVService.instance = new BCVService();
    }
    return BCVService.instance;
  }

  async obtenerTasa(): Promise<TasaBCV> {
    try {
      const response = await fetch(this.API_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Error al obtener tasa del BCV");
      }

      const data = await response.json();

      if (data && data.promedio) {
        const tasa = {
          value: data.promedio,
          fecha: new Date(),
          origen: "api" as const,
        };

        // Guardar en localStorage para respaldo
        this.guardarTasaLocal(tasa.value);

        return tasa;
      }

      throw new Error("Formato de respuesta inválido");
    } catch (error) {
      return this.obtenerTasaRespaldo();
    }
  }

  private guardarTasaLocal(tasa: number): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, tasa.toString());
    }
  }

  private obtenerTasaRespaldo(): TasaBCV {
    if (typeof window !== "undefined") {
      const tasaGuardada = localStorage.getItem(this.STORAGE_KEY);
      if (tasaGuardada) {
        return {
          value: parseFloat(tasaGuardada),
          fecha: new Date(),
          origen: "local" as const,
        };
      }
    }

    return {
      value: this.TASA_DEFAULT,
      fecha: new Date(),
      origen: "default" as const,
    };
  }

  convertirADolares(montoBs: number, tasa: number): number {
    return montoBs / tasa;
  }

  convertirABolivares(montoUsd: number, tasa: number): number {
    return montoUsd * tasa;
  }
}
