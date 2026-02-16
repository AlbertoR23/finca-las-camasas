import { useState, useEffect, useCallback } from "react";
import { SupabaseFinanzaRepository } from "@/src/infrastructure/repositories/supabase/SupabaseFinanzaRepository";
import { CrearTransaccionUseCase } from "@/src/core/use-cases/finanzas/crearTransaccion.use-case";
import { ObtenerBalanceUseCase } from "@/src/core/use-cases/finanzas/obtenerBalance.use-case";
import { ConvertirMonedaUseCase } from "@/src/core/use-cases/finanzas/convertirMoneda.use-case";
import { Transaccion } from "@/src/core/entities/Transaccion";
import { BCVService } from "@/src/infrastructure/services/bcv/bcv.service";

export function useFinanzas() {
  const [finanzas, setFinanzas] = useState<Transaccion[]>([]);
  const [balance, setBalance] = useState({ ingresos: 0, gastos: 0, neto: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const finanzaRepository = new SupabaseFinanzaRepository();
  const bcvService = BCVService.getInstance();

  const cargarFinanzas = useCallback(async () => {
    try {
      setLoading(true);
      const transacciones = await finanzaRepository.findAll();
      setFinanzas(transacciones);

      const balanceUseCase = new ObtenerBalanceUseCase(finanzaRepository);
      const balanceData = await balanceUseCase.execute();
      setBalance(balanceData);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar finanzas");
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTransaccion = useCallback(
    async (data: {
      tipo: "ingreso" | "gasto";
      categoria: string;
      monto: number;
      descripcion?: string;
      moneda: "VES" | "USD";
    }) => {
      try {
        const useCase = new CrearTransaccionUseCase(finanzaRepository);
        await useCase.execute(data);
        await cargarFinanzas();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al crear transacción",
        );
        throw err;
      }
    },
    [cargarFinanzas],
  );

  const eliminarTransaccion = useCallback(
    async (id: string) => {
      try {
        await finanzaRepository.delete(id);
        await cargarFinanzas();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar transacción",
        );
        throw err;
      }
    },
    [cargarFinanzas],
  );

  const convertirMoneda = useCallback(
    async (monto: number, desde: "VES" | "USD", hasta: "VES" | "USD") => {
      const useCase = new ConvertirMonedaUseCase();
      return await useCase.execute(monto, desde, hasta);
    },
    [],
  );

  useEffect(() => {
    cargarFinanzas();
  }, [cargarFinanzas]);

  return {
    finanzas,
    balance,
    loading,
    error,
    crearTransaccion,
    eliminarTransaccion,
    convertirMoneda,
    refresh: cargarFinanzas,
  };
}
