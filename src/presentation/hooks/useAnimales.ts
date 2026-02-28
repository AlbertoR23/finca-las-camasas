// src/presentation/hooks/useAnimales.ts
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

  // Usar useRef para mantener las mismas instancias entre renders
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
      console.log("🔄 Cargando animales...");
      const animalesObtenidos =
        await obtenerAnimalesUseCaseRef.current.execute();
      console.log("✅ Animales cargados:", animalesObtenidos.length);
      setAnimales(animalesObtenidos);
      setError(null);
    } catch (err) {
      console.error("❌ Error cargando animales:", err);
      setError(err instanceof Error ? err.message : "Error al cargar animales");
    } finally {
      setLoading(false);
    }
  }, []); // ← Vacío porque useRef mantiene las instancias estables

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
        console.log("🔄 Ejecutando caso de uso de creación...");

        const nuevoAnimal =
          await crearAnimalUseCaseRef.current.execute(animalData);

        // ✅ ACTUALIZACIÓN OPTIMISTA: No esperamos al reload, lo metemos directo al estado
        setAnimales((prev) => [...prev, nuevoAnimal as Animal]);

        console.log("✅ Interfaz actualizada con el nuevo animal");
        return nuevoAnimal;
      } catch (err) {
        console.error("❌ Error en el hook al crear animal:", err);
        setError(err instanceof Error ? err.message : "Error al crear animal");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [], // Eliminamos cargarAnimales de las dependencias para evitar renders infinitos
  );

  const eliminarAnimal = useCallback(
    async (id: string) => {
      try {
        await eliminarAnimalUseCaseRef.current.execute(id);
        cargarAnimales();
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
      const resultados =
        await animalRepositoryRef.current.findBySearchTerm(termino);
      setAnimales(resultados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar animales");
    } finally {
      setLoading(false);
    }
  }, []); // ← Vacío porque animalRepositoryRef es estable

  useEffect(() => {
    cargarAnimales();
  }, [cargarAnimales]); // ← Solo se ejecuta cuando cargarAnimales cambia (nunca)

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
