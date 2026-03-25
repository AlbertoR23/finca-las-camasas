// src/infrastructure/services/bcv/bcv.service.ts
export interface TasaBCV {
  value: number;
  fecha: Date;
  origen: "api" | "local" | "default";
  timestamp?: string;
}

export class BCVService {
  private static instance: BCVService;
  private readonly STORAGE_KEY = "tasaGuardada";
  private readonly TASA_DEFAULT = 396.37;
  private readonly MAX_REINTENTOS = 3;
  private readonly TIEMPO_REINTENTO = 2000;
  private ultimaActualizacionExitosa: Date | null = null;

  private constructor() {}

  static getInstance(): BCVService {
    if (!BCVService.instance) {
      BCVService.instance = new BCVService();
    }
    return BCVService.instance;
  }

  /**
   * ✅ AHORA llama a /api/bcv (tu propio endpoint)
   * El SW no interceptará esta petición porque está en NO_CACHE_PATTERNS
   */
  async obtenerTasa(forzar: boolean = false): Promise<TasaBCV> {
    // Cache de 5 minutos para evitar llamadas excesivas
    if (!forzar && this.ultimaActualizacionExitosa) {
      const minutosDesde =
        (Date.now() - this.ultimaActualizacionExitosa.getTime()) / (1000 * 60);
      if (minutosDesde < 5) {
        const tasaLocal = this.obtenerTasaRespaldo();
        if (tasaLocal.origen !== "default") {
          console.log(
            `⏱️ Usando tasa local (hace ${minutosDesde.toFixed(0)} min)`,
          );
          return tasaLocal;
        }
      }
    }

    try {
      console.log(`🌐 Solicitando tasa BCV directamente...`);

      // ✅ LLAMADA DIRECTA - el SW la excluye con NO_CACHE_PATTERNS
      const response = await fetch(
        "https://ve.dolarapi.com/v1/dolares/oficial",
        {
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();

      if (data && typeof data.promedio === "number") {
        const tasa = {
          value: data.promedio,
          fecha: new Date(),
          origen: "api" as const,
        };
        this.guardarTasaLocal(tasa.value);
        this.ultimaActualizacionExitosa = new Date();
        console.log(`✅ Tasa BCV: Bs ${tasa.value.toFixed(2)}`);
        return tasa;
      }

      throw new Error("Formato de respuesta inválido");
    } catch (error) {
      console.error("❌ Error:", error);
      return this.obtenerTasaRespaldo();
    }
  }
  private guardarTasaLocal(tasa: number, timestamp?: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify({
            value: tasa,
            timestamp: timestamp || new Date().toISOString(),
          }),
        );
      } catch (error) {
        console.error("Error guardando tasa:", error);
      }
    }
  }

  private obtenerTasaRespaldo(): TasaBCV {
    if (typeof window !== "undefined") {
      try {
        const tasaGuardada = localStorage.getItem(this.STORAGE_KEY);
        if (tasaGuardada) {
          const parsed = JSON.parse(tasaGuardada);
          const fecha = new Date(parsed.timestamp);
          const horasDesde = (Date.now() - fecha.getTime()) / (1000 * 60 * 60);

          console.log(
            `📦 Usando tasa guardada (hace ${horasDesde.toFixed(1)} horas)`,
          );
          return {
            value: parsed.value,
            fecha,
            origen: "local" as const,
          };
        }
      } catch (error) {
        console.error("Error leyendo localStorage:", error);
      }
    }

    console.log(`📊 Usando tasa por defecto: Bs ${this.TASA_DEFAULT}`);
    return {
      value: this.TASA_DEFAULT,
      fecha: new Date(),
      origen: "default" as const,
    };
  }

  async actualizarTasa(): Promise<TasaBCV> {
    return this.obtenerTasa(true);
  }

  convertirADolares(montoBs: number, tasa: number): number {
    return Number((montoBs / tasa).toFixed(2));
  }

  convertirABolivares(montoUsd: number, tasa: number): number {
    return Number((montoUsd * tasa).toFixed(2));
  }
}
