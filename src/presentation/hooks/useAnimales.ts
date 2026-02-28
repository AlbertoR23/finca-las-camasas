"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Animal } from "@/src/core/entities/Animal";
import { SupabaseAnimalRepository } from "@/src/infrastructure/repositories/supabase/SupabaseAnimalRepository";
import { CrearAnimalUseCase } from "@/src/core/use-cases/animales/crearAnimal.use-case";
import { ObtenerAnimalesUseCase } from "@/src/core/use-cases/animales/obtenerAnimales.use-case";
import { EliminarAnimalUseCase } from "@/src/core/use-cases/animales/eliminarAnimal.use-case";
import { useOfflineStatus } from "./useOfflineStatus";

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtenemos el estado de conexión para saber cuándo refrescar
  const { isOnline } = useOfflineStatus();

  // Mantenemos instancias estables para proteger la RAM de 4GB
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

  /**
   * ✅ MEJORA: Carga de animales inteligente.
   * Evita limpiar el estado (setAnimales([])) para que los contadores no se pongan en 0/0.
   */
  const cargarAnimales = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Sincronizando lista de animales...");

      const animalesObtenidos =
        await obtenerAnimalesUseCaseRef.current.execute();

      // Solo actualizamos si hay cambios o es la carga inicial
      setAnimales(animalesObtenidos);
      setError(null);
    } catch (err) {
      console.error("❌ Error en useAnimales:", err);
      setError(err instanceof Error ? err.message : "Error al cargar animales");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ MEJORA: Registro con actualización optimista.
   * Crea una instancia real de Animal para evitar "NaN" en las fechas.
   */
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
        setLoading(true);
        const nuevoAnimal =
          await crearAnimalUseCaseRef.current.execute(animalData);

        // ✅ Cast seguro a Animal para asegurar que los métodos de la entidad existan
        const animalFinal =
          nuevoAnimal instanceof Animal ? nuevoAnimal : new Animal(nuevoAnimal);

        setAnimales((prev) => [animalFinal, ...prev]);
        console.log("✅ Registro añadido al estado local");
        return animalFinal;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear animal");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const eliminarAnimal = useCallback(async (id: string) => {
    try {
      await eliminarAnimalUseCaseRef.current.execute(id);
      // Filtramos localmente para respuesta inmediata
      setAnimales((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar animal");
      throw err;
    }
  }, []);

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

  /**
   * ✅ EFECTO MAESTRO: Escucha la sincronización de fondo.
   * Cuando el SyncService termina de subir datos a Supabase, este evento se dispara
   * y refresca la lista automáticamente.
   */
  useEffect(() => {
    // Carga inicial
    cargarAnimales();

    const handleSyncComplete = () => {
      console.log("📡 Sincronización detectada: Refrescando UI...");
      cargarAnimales();
    };

    // Escuchamos el evento personalizado que definimos en el SyncService
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
