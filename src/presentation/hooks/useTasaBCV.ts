import { useState, useEffect, useCallback } from "react";
import {
  BCVService,
  TasaBCV,
} from "@/src/infrastructure/services/bcv/bcv.service";

export function useTasaBCV() {
  const [tasa, setTasa] = useState<TasaBCV>({
    value: 311.88,
    fecha: new Date(),
    origen: "default",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bcvService = BCVService.getInstance();

  const cargarTasa = useCallback(async () => {
    try {
      setLoading(true);
      const nuevaTasa = await bcvService.obtenerTasa();
      setTasa(nuevaTasa);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tasa BCV");
    } finally {
      setLoading(false);
    }
  }, []);

  const convertirMoneda = useCallback(
    (monto: number, desde: "VES" | "USD", hasta: "VES" | "USD"): number => {
      if (desde === hasta) return monto;

      if (desde === "VES" && hasta === "USD") {
        return bcvService.convertirADolares(monto, tasa.value);
      } else {
        return bcvService.convertirABolivares(monto, tasa.value);
      }
    },
    [tasa.value],
  );

  const formatearMonto = useCallback(
    (monto: number, moneda: "VES" | "USD"): string => {
      const simbolo = moneda === "VES" ? "Bs" : "$";
      return `${simbolo} ${monto.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [],
  );

  useEffect(() => {
    cargarTasa();
    // Actualizar cada hora
    const interval = setInterval(cargarTasa, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cargarTasa]);

  return {
    tasa,
    loading,
    error,
    cargarTasa,
    convertirMoneda,
    formatearMonto,
    hayInternet: tasa.origen === "api",
  };
}
