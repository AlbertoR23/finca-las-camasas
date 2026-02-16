import { useState, useEffect, useCallback } from "react";
import { SupabaseVacunaRepository } from "@/src/infrastructure/repositories/supabase/SupabaseVacunaRepository";
import { RegistrarVacunaUseCase } from "@/src/core/use-cases/salud/registrarVacuna.use-case";
import { VerificarVacunasVencidasUseCase } from "@/src/core/use-cases/salud/verificarVacunasVencidas.use-case";
import { Vacuna } from "@/src/core/entities/Vacuna";
import { TelegramService } from "@/src/infrastructure/services/telegram/telegram.service";

export function useVacunas() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [vacunasVencidas, setVacunasVencidas] = useState<Vacuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vacunaRepository = new SupabaseVacunaRepository();
  const telegramService = TelegramService.getInstance();

  const cargarVacunas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vacunaRepository.findAll();
      setVacunas(data);

      const vencidas = await vacunaRepository.findVencidas();
      setVacunasVencidas(vencidas);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar vacunas");
    } finally {
      setLoading(false);
    }
  }, []);

  const crearVacuna = useCallback(
    async (data: {
      animalId: string;
      nombreVacuna: string;
      fechaAplicacion: Date;
      proximaDosis?: Date | null;
    }) => {
      try {
        const useCase = new RegistrarVacunaUseCase(vacunaRepository);
        await useCase.execute(data);
        await cargarVacunas();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear vacuna");
        throw err;
      }
    },
    [cargarVacunas],
  );

  const eliminarVacuna = useCallback(
    async (id: string) => {
      try {
        await vacunaRepository.delete(id);
        await cargarVacunas();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar vacuna",
        );
        throw err;
      }
    },
    [cargarVacunas],
  );

  const enviarAlertaTelegram = useCallback(async (vacuna: Vacuna) => {
    try {
      const alerta = {
        animalNombre: vacuna.animalNombre || "Desconocido",
        vacunaNombre: vacuna.nombreVacuna,
        fechaVencimiento: vacuna.proximaDosis || vacuna.fechaAplicacion,
        diasVencida: vacuna.estaVencida()
          ? Math.abs(vacuna.diasParaVencimiento() || 0)
          : undefined,
      };

      return await telegramService.enviarAlertaVacuna(alerta);
    } catch (err) {
      console.error("Error enviando alerta Telegram:", err);
      return false;
    }
  }, []);

  const verificarVencidas = useCallback(async () => {
    const useCase = new VerificarVacunasVencidasUseCase(vacunaRepository);
    const alertas = await useCase.execute();

    // Enviar alertas automáticas
    alertas.forEach((alerta) => {
      if (alerta.vacuna.estaVencida()) {
        enviarAlertaTelegram(alerta.vacuna);
      }
    });

    return alertas;
  }, [enviarAlertaTelegram]);

  useEffect(() => {
    cargarVacunas();
    // Verificar cada 6 horas
    const interval = setInterval(
      () => {
        verificarVencidas();
      },
      6 * 60 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [cargarVacunas, verificarVencidas]);

  return {
    vacunas,
    vacunasVencidas,
    loading,
    error,
    crearVacuna,
    eliminarVacuna,
    enviarAlertaTelegram,
    verificarVencidas,
    refresh: cargarVacunas,
  };
}
