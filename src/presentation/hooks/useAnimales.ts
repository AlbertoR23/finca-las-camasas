"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Animal } from "@/src/core/entities/Animal";
import { SupabaseAnimalRepository } from "@/src/infrastructure/repositories/supabase/SupabaseAnimalRepository";
import { CrearAnimalUseCase } from "@/src/core/use-cases/animales/crearAnimal.use-case";
import { ObtenerAnimalesUseCase } from "@/src/core/use-cases/animales/obtenerAnimales.use-case";
import { EliminarAnimalUseCase } from "@/src/core/use-cases/animales/eliminarAnimal.use-case";

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instancias estables para evitar recreaciones
  const animalRepo = useRef(new SupabaseAnimalRepository());

  const cargarAnimales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new ObtenerAnimalesUseCase(animalRepo.current);
      const data = await useCase.execute();
      setAnimales(data);
    } catch (err) {
      console.error("❌ Error cargando animales:", err);
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  const crearAnimal = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new CrearAnimalUseCase(animalRepo.current);
      const response = await useCase.execute(data);

      // Actualización optimista
      setAnimales((prev) => {
        // Evitar duplicados si el animal ya existe
        const existe = prev.some((a) => a.id === response.animal.id);
        if (existe) return prev;
        return [response.animal, ...prev];
      });

      return response.animal;
    } catch (err) {
      console.error("❌ Error creando animal:", err);
      setError(err instanceof Error ? err.message : "Error al crear");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarAnimal = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const useCase = new EliminarAnimalUseCase(animalRepo.current);
      await useCase.execute(id);

      // Actualización optimista
      setAnimales((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("❌ Error eliminando animal:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarAnimales = useCallback(async (termino: string) => {
    try {
      setLoading(true);
      setError(null);
      const resultados = await animalRepo.current.findBySearchTerm(termino);
      setAnimales(resultados);
    } catch (err) {
      console.error("❌ Error buscando:", err);
      setError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAnimales();

    const handleSyncComplete = () => {
      console.log("📡 Sincronización detectada, recargando...");
      cargarAnimales();
    };

    window.addEventListener("sync-complete", handleSyncComplete);
    return () =>
      window.removeEventListener("sync-complete", handleSyncComplete);
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
