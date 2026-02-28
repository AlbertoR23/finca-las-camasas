"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Animal } from "@/src/core/entities/Animal";
import { SupabaseAnimalRepository } from "@/src/infrastructure/repositories/supabase/SupabaseAnimalRepository";
import { CrearAnimalUseCase } from "@/src/core/use-cases/animales/crearAnimal.use-case";
import { ObtenerAnimalesUseCase } from "@/src/core/use-cases/animales/obtenerAnimales.use-case";
import { EliminarAnimalUseCase } from "@/src/core/use-cases/animales/eliminarAnimal.use-case";
import { useOfflineStatus } from "./useOfflineStatus";

// ✅ Tipo definido (elimina any)
interface AnimalData {
  nombre: string;
  numeroArete: string;
  fechaNacimiento: Date;
  sexo: "Macho" | "Hembra";
  padreId?: string | null;
  madreId?: string | null;
}

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isOnline } = useOfflineStatus();

  // Instancias estables
  const animalRepositoryRef = useRef(new SupabaseAnimalRepository());

  const obtenerAnimalesUseCaseRef = useRef(
    new ObtenerAnimalesUseCase(animalRepositoryRef.current),
  );
  const crearAnimalUseCaseRef = useRef(
    new CrearAnimalUseCase(animalRepositoryRef.current),
  );
  const eliminarAnimalUseCaseRef = useRef(
    new EliminarAnimalUseCase(animalRepositoryRef.current),
  );

  const cargarAnimales = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Sincronizando lista de animales...");

      const animalesObtenidos =
        await obtenerAnimalesUseCaseRef.current.execute();
      setAnimales(animalesObtenidos);
      setError(null);
    } catch (err) {
      console.error("❌ Error en useAnimales:", err);
      setError(err instanceof Error ? err.message : "Error al cargar animales");
    } finally {
      setLoading(false);
    }
  }, [obtenerAnimalesUseCaseRef]); // ✅ dependencia agregada

  const crearAnimal = useCallback(async (animalData: AnimalData) => {
    try {
      setLoading(true);
      setError(null);

      const resultado = await crearAnimalUseCaseRef.current.execute(animalData);
      const nuevoAnimal = resultado.animal;

      // ✅ Evitar duplicados
      setAnimales((prev) => {
        const existe = prev.some((a) => a.id === nuevoAnimal.id);
        if (existe) return prev;
        return [nuevoAnimal, ...prev];
      });

      return nuevoAnimal;
    } catch (err) {
      console.error("❌ Error en crearAnimal:", err);
      setError(err instanceof Error ? err.message : "Error al crear animal");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarAnimal = useCallback(
    async (id: string) => {
      // Guardar copia por si falla
      const animalEliminado = animales.find((a) => a.id === id);

      // ✅ Optimista
      setAnimales((prev) => prev.filter((a) => a.id !== id));

      try {
        await eliminarAnimalUseCaseRef.current.execute(id);
      } catch (err) {
        // ✅ Revertir si falla
        if (animalEliminado) {
          setAnimales((prev) => [...prev, animalEliminado]);
        }
        setError(
          err instanceof Error ? err.message : "Error al eliminar animal",
        );
        throw err;
      }
    },
    [animales],
  ); // ✅ depende de animales para revertir

  const buscarAnimales = useCallback(async (termino: string) => {
    try {
      setLoading(true);
      const resultados =
        await animalRepositoryRef.current.findBySearchTerm(termino);
      setAnimales(resultados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAnimales();

    const handleSyncComplete = () => {
      console.log("📡 Sincronización detectada: Refrescando UI...");
      cargarAnimales();
    };

    window.addEventListener("sync-complete", handleSyncComplete);

    return () => {
      window.removeEventListener("sync-complete", handleSyncComplete);
    };
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
