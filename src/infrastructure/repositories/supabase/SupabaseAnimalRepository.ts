import { IAnimalRepository } from "@/src/core/repositories/IAnimalRepository";
import { Animal } from "@/src/core/entities/Animal";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";

// ✅ Tipos auxiliares para eliminar any
interface AnimalInsert {
  id?: string;
  nombre: string;
  numero_arete: string;
  sexo: "Macho" | "Hembra";
  fecha_nacimiento: string;
  padre_id?: string | null;
  madre_id?: string | null;
  pending?: boolean;
}

interface AnimalUpdate {
  nombre?: string;
  numero_arete?: string;
  sexo?: "Macho" | "Hembra";
  fecha_nacimiento?: string;
  padre_id?: string | null;
  madre_id?: string | null;
}

export class SupabaseAnimalRepository implements IAnimalRepository {
  private supabase = createClient();
  private offlineStorage = OfflineStorageService.getInstance();

  /**
   * Obtiene todos los animales priorizando la red,
   * pero cae al caché local instantáneamente si hay error.
   */
  async findAll(): Promise<Animal[]> {
    try {
      const { data, error } = await this.supabase
        .from("animales")
        .select("*")
        .order("nombre");

      if (error) throw error;

      if (data) {
        await this.offlineStorage.cacheData("animales", data);
        return data.map((item) => Animal.fromSupabase(item));
      }
      return [];
    } catch (error) {
      console.warn("⚠️ Modo Offline: Cargando animales desde IndexedDB");
      const cached = await this.offlineStorage.getCachedData("animales");
      return cached.map((item) => Animal.fromSupabase(item));
    }
  }

  async findById(id: string): Promise<Animal | null> {
    try {
      const { data, error } = await this.supabase
        .from("animales")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? Animal.fromSupabase(data) : null;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData("animales");
      const found = cached.find((item) => item.id === id);
      return found ? Animal.fromSupabase(found) : null;
    }
  }

  async findBySearchTerm(term: string): Promise<Animal[]> {
    try {
      const { data, error } = await this.supabase
        .from("animales")
        .select("*")
        .or(`nombre.ilike.%${term}%,numero_arete.ilike.%${term}%`);

      if (error) throw error;
      return data ? data.map((item) => Animal.fromSupabase(item)) : [];
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData("animales");
      const filtered = cached.filter(
        (item) =>
          item.nombre.toLowerCase().includes(term.toLowerCase()) ||
          item.numero_arete.toLowerCase().includes(term.toLowerCase()),
      );
      return filtered.map((item) => Animal.fromSupabase(item));
    }
  }

  /**
   * Crea un animal. Si falla la red, lo guarda localmente
   * y lo encola para sincronización posterior.
   */
  // ✅ CORREGIDO: Tipo definido en lugar de any
  async crear(animalData: {
    nombre: string;
    numeroArete: string;
    sexo: "Macho" | "Hembra";
    fechaNacimiento: Date;
    padreId?: string | null;
    madreId?: string | null;
  }): Promise<Animal> {
    // ✅ CORREGIDO: randomUUID con fallback
    const idTemporal =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Preparamos el objeto EXACTAMENTE como lo espera Supabase y tu UI
    const nuevoRegistro: AnimalInsert = {
      id: idTemporal,
      nombre: animalData.nombre,
      numero_arete: animalData.numeroArete,
      sexo: animalData.sexo,
      fecha_nacimiento: animalData.fechaNacimiento.toISOString().split("T")[0],
      padre_id: animalData.padreId || null,
      madre_id: animalData.madreId || null,
      pending: true, // ✅ Bandera crucial para la UI
    };

    try {
      if (navigator.onLine) {
        // ✅ CORREGIDO: this.supabase
        const { data, error } = await this.supabase
          .from("animales")
          .insert([
            {
              nombre: nuevoRegistro.nombre,
              numero_arete: nuevoRegistro.numero_arete,
              sexo: nuevoRegistro.sexo,
              fecha_nacimiento: nuevoRegistro.fecha_nacimiento,
              padre_id: nuevoRegistro.padre_id,
              madre_id: nuevoRegistro.madre_id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // ✅ Si la operación online funciona, cachear el resultado
        await this.updateLocalCacheAfterInsert(data);
        return Animal.fromSupabase(data);
      }

      // ✅ Si estamos offline, ir directamente al catch
      throw new Error("Offline");
    } catch (error) {
      console.warn("🌐 Guardando en cola offline...");

      // 1. Guardar en la cola de sincronización
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "INSERT",
        data: nuevoRegistro,
      });

      // 2. Actualizar caché local para que aparezca EN EL MOMENTO en la lista
      const cached = await this.offlineStorage.getCachedData("animales");
      // ✅ CORREGIDO: Evitar duplicados
      const existe = cached.some((item) => item.id === idTemporal);
      if (!existe) {
        await this.offlineStorage.cacheData("animales", [
          nuevoRegistro,
          ...cached,
        ]);
      }

      return Animal.fromSupabase(nuevoRegistro);
    }
  }

  async update(id: string, animalData: Partial<Animal>): Promise<Animal> {
    const updatePayload = this.mapToSupabaseFormat(animalData);

    try {
      const { data, error } = await this.supabase
        .from("animales")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar caché local de forma eficiente
      await this.updateLocalCache(id, data);

      return Animal.fromSupabase(data);
    } catch (error) {
      console.warn("🔄 Encolando actualización offline para animal:", id);

      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "UPDATE",
        data: { id, ...updatePayload },
      });

      await this.updateLocalCache(id, { ...updatePayload, pending: true });

      // Retornar entidad local para no romper la UI
      const cached = await this.offlineStorage.getCachedData("animales");
      const updated = cached.find((a) => a.id === id);
      if (!updated) throw new Error("Animal no encontrado en caché");
      return Animal.fromSupabase(updated);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("animales")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remover del caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      const filtered = cached.filter((item) => item.id !== id);
      await this.offlineStorage.cacheData("animales", filtered);
    } catch (error) {
      console.warn("🗑️ Encolando eliminación offline para:", id);

      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "DELETE",
        data: { id },
      });

      const cached = await this.offlineStorage.getCachedData("animales");
      const filtered = cached.filter((item) => item.id !== id);
      await this.offlineStorage.cacheData("animales", filtered);
    }
  }

  // --- MÉTODOS PRIVADOS DE AYUDA ---

  private async updateLocalCache(id: string, newData: any) {
    const cached = await this.offlineStorage.getCachedData("animales");
    const index = cached.findIndex((item) => item.id === id);
    if (index >= 0) {
      cached[index] = { ...cached[index], ...newData };
      await this.offlineStorage.cacheData("animales", cached);
    }
  }

  private async updateLocalCacheAfterInsert(newData: any) {
    const cached = await this.offlineStorage.getCachedData("animales");
    // ✅ Evitar duplicados
    const existe = cached.some((item) => item.id === newData.id);
    if (!existe) {
      await this.offlineStorage.cacheData("animales", [newData, ...cached]);
    }
  }

  // ✅ CORREGIDO: Tipo de retorno explícito
  private mapToSupabaseFormat(animalData: Partial<Animal>): AnimalUpdate {
    const mapped: AnimalUpdate = {};

    if (animalData.nombre) mapped.nombre = animalData.nombre;
    if (animalData.numeroArete) mapped.numero_arete = animalData.numeroArete;
    if (animalData.sexo) mapped.sexo = animalData.sexo;
    if (animalData.padreId !== undefined) mapped.padre_id = animalData.padreId;
    if (animalData.madreId !== undefined) mapped.madre_id = animalData.madreId;

    if (animalData.fechaNacimiento) {
      mapped.fecha_nacimiento = animalData.fechaNacimiento
        .toISOString()
        .split("T")[0];
    }
    return mapped;
  }
}
