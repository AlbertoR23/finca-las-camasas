import { useState, useEffect, useCallback, useRef } from "react";
import { BCVService, TasaBCV } from "@/src/infrastructure/services/bcv/bcv.service";

export function useTasaBCV() {
  const [tasa, setTasa] = useState<TasaBCV>({
    value: 311.88,
    fecha: new Date(),
    origen: "default",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  const bcvService = BCVService.getInstance();
  const intervalRef = useRef<NodeJS.Timeout>();

  const cargarTasa = useCallback(async (forzar: boolean = false): Promise<TasaBCV> => {
    try {
      setLoading(true);
      console.log(`🔄 ${forzar ? "FORZANDO" : "Cargando"} tasa...`);

      const nuevaTasa = await bcvService.obtenerTasa(forzar);
      setTasa(nuevaTasa);
      setUltimaActualizacion(new Date());
      setError(null);

      if (nuevaTasa.origen === "api") {
        console.log(`✅ API: Bs ${nuevaTasa.value.toFixed(2)}`);
      } else if (nuevaTasa.origen === "local") {
        console.log(`📦 Local: Bs ${nuevaTasa.value.toFixed(2)}`);
      }

      return nuevaTasa; // ✅ RETORNA LA TASA
    } catch (err) {
      console.error("❌ Error cargando tasa:", err);
      setError(err instanceof Error ? err.message : "Error al cargar tasa");
      throw err; // ✅ Lanza el error para que quien lo llama lo capture
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Al recuperar conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Conexión recuperada, actualizando tasa...");
      cargarTasa(true);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [cargarTasa]);

  // ✅ Al enfocar la ventana (cuando vuelves a la app)
  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ App enfocada, verificando tasa...");
      cargarTasa(true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [cargarTasa]);

  // ✅ Carga inicial y refresco periódico (cada 30 min)
  useEffect(() => {
    cargarTasa();

    intervalRef.current = setInterval(
      () => {
        console.log("⏰ Refresco programado");
        cargarTasa(true);
      },
      30 * 60 * 1000,
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cargarTasa]);

  // ✅ CORREGIDO: forzarActualizacion ahora RETORNA la tasa
  const forzarActualizacion = useCallback(async (): Promise<TasaBCV> => {
    console.log("🔧 Forzando actualización de tasa...");
    localStorage.removeItem("tasaGuardada");
    const nuevaTasa = await cargarTasa(true);
    return nuevaTasa;
  }, [cargarTasa]);

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
      return `${simbolo} ${monto.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [],
  );

  return {
    tasa,
    loading,
    error,
    ultimaActualizacion,
    cargarTasa,
    forzarActualizacion,
    convertirMoneda,
    formatearMonto,
    hayInternet: tasa.origen === "api",
  };
}
