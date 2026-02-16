import { useState, useEffect, useCallback } from "react";
import { SupabaseRegistroRepository } from "@/src/infrastructure/repositories/supabase/SupabaseRegistroRepository";
import { RegistroProduccion } from "@/src/core/entities/RegistroProduccion";

export function useProduccion() {
  const [registros, setRegistros] = useState<RegistroProduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [produccionPromedio, setProduccionPromedio] = useState<
    Record<string, number>
  >({});

  const registroRepository = new SupabaseRegistroRepository();

  const cargarRegistros = useCallback(async () => {
    try {
      setLoading(true);
      const data = await registroRepository.findAll();
      setRegistros(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar registros",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const crearRegistro = useCallback(
    async (data: {
      animalId: string;
      litros?: number;
      peso?: number;
      fecha?: Date;
    }) => {
      try {
        const registro = new RegistroProduccion({
          animalId: data.animalId,
          fecha: data.fecha || new Date(),
          litrosLeche: data.litros || 0,
          pesoKg: data.peso || 0,
        });

        await registroRepository.create(registro);
        await cargarRegistros();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al crear registro",
        );
        throw err;
      }
    },
    [cargarRegistros],
  );

  const eliminarRegistro = useCallback(
    async (id: string) => {
      try {
        await registroRepository.delete(id);
        await cargarRegistros();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar registro",
        );
        throw err;
      }
    },
    [cargarRegistros],
  );

  const calcularPromedioAnimal = useCallback(
    async (animalId: string, dias: number = 30) => {
      try {
        const promedio = await registroRepository.getProduccionPromedio(
          animalId,
          dias,
        );
        setProduccionPromedio((prev) => ({ ...prev, [animalId]: promedio }));
        return promedio;
      } catch (err) {
        console.error("Error calculando promedio:", err);
        return 0;
      }
    },
    [],
  );

  const obtenerRegistrosPorAnimal = useCallback(
    (animalId: string) => {
      return registros.filter((r) => r.animalId === animalId);
    },
    [registros],
  );

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  return {
    registros,
    loading,
    error,
    produccionPromedio,
    crearRegistro,
    eliminarRegistro,
    calcularPromedioAnimal,
    obtenerRegistrosPorAnimal,
    refresh: cargarRegistros,
  };
}
