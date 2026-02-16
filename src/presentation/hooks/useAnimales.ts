// src/presentation/hooks/useAnimales.ts
import { useState, useEffect, useCallback } from "react";
import { Animal } from "@/src/core/entities/Animal";
import { SupabaseAnimalRepository } from "@/src/infrastructure/repositories/supabase/SupabaseAnimalRepository";
import { CrearAnimalUseCase } from "@/src/core/use-cases/animales/crearAnimal.use-case";
import { ObtenerAnimalesUseCase } from "@/src/core/use-cases/animales/obtenerAnimales.use-case";
import { EliminarAnimalUseCase } from "@/src/core/use-cases/animales/eliminarAnimal.use-case";

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar repositorio y casos de uso
  const animalRepository = new SupabaseAnimalRepository();

  const obtenerAnimalesUseCase = new ObtenerAnimalesUseCase(animalRepository);
  const crearAnimalUseCase = new CrearAnimalUseCase(animalRepository);
  const eliminarAnimalUseCase = new EliminarAnimalUseCase(animalRepository);

  const cargarAnimales = useCallback(async () => {
    try {
      setLoading(true);
      const animalesObtenidos = await obtenerAnimalesUseCase.execute();
      setAnimales(animalesObtenidos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar animales");
    } finally {
      setLoading(false);
    }
  }, []);

  const crearAnimal = useCallback(
    async (animalData: {
      nombre: string;
      numeroArete: string;
      fechaNacimiento: Date;
      sexo: "Macho" | "Hembra";
      padreId?: string | null;
      madreId?: string | null;
    }) => {
      try {
        const resultado = await crearAnimalUseCase.execute(animalData);
        await cargarAnimales(); // Recargar la lista
        return resultado;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear animal");
        throw err;
      }
    },
    [cargarAnimales],
  );

  const eliminarAnimal = useCallback(
    async (id: string) => {
      try {
        await eliminarAnimalUseCase.execute(id);
        await cargarAnimales();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar animal",
        );
        throw err;
      }
    },
    [cargarAnimales],
  );

  const buscarAnimales = useCallback(async (termino: string) => {
    try {
      setLoading(true);
      const resultados = await animalRepository.findBySearchTerm(termino);
      setAnimales(resultados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar animales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAnimales();
  }, [cargarAnimales]);

  return {
    animales,
    loading,
    error,
    crearAnimal,
    eliminarAnimal,
    buscarAnimales,
    refresh: cargarAnimales,
  };
}
