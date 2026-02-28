"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Animal } from "@/src/core/entities/Animal";
import { SupabaseAnimalRepository } from "@/src/infrastructure/repositories/supabase/SupabaseAnimalRepository";
import { CrearAnimalUseCase } from "@/src/core/use-cases/animales/crearAnimal.use-case";
import { ObtenerAnimalesUseCase } from "@/src/core/use-cases/animales/obtenerAnimales.use-case";

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const animalRepo = useRef(new SupabaseAnimalRepository());

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const useCase = new ObtenerAnimalesUseCase(animalRepo.current);
      const data = await useCase.execute();
      setAnimales(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearAnimal = useCallback(async (data: any) => {
    try {
      const useCase = new CrearAnimalUseCase(animalRepo.current);
      const response = await useCase.execute(data);
      // Actualización optimista
      setAnimales((prev) => [response.animal, ...prev]);
      return response.animal;
    } catch (error) {
      console.error("Error en hook:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    cargar();
    // Escuchar evento de sincronización terminada
    window.addEventListener("sync-complete", cargar);
    return () => window.removeEventListener("sync-complete", cargar);
  }, [cargar]);

  return { animales, loading, crearAnimal, refresh: cargar };
}
