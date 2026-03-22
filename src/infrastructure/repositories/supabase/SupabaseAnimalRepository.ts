import { IAnimalRepository } from "@/src/core/repositories/IAnimalRepository";
import { Animal } from "@/src/core/entities/Animal";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";

interface AnimalInsert {
  id?: string;
  nombre: string;
  numero_arete: string;
  sexo: "Macho" | "Hembra";
  fecha_nacimiento: string;
  padre_id?: string | null;
  madre_id?: string | null;
  pending?: boolean;
  synced?: boolean;
}

export class SupabaseAnimalRepository implements IAnimalRepository {
  private supabase = createClient();
  private offlineStorage = OfflineStorageService.getInstance();

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
          item.nombre?.toLowerCase().includes(term.toLowerCase()) ||
          item.numero_arete?.toLowerCase().includes(term.toLowerCase())
      );
      return filtered.map((item) => Animal.fromSupabase(item));
    }
  }

  async create(animal: Animal): Promise<Animal> {
    const idTemporal = animal.id || crypto.randomUUID();

    const nuevoRegistro: AnimalInsert = {
      id: idTemporal,
      nombre: animal.nombre,
      numero_arete: animal.numeroArete,
      sexo: animal.sexo,
      fecha_nacimiento: animal.fechaNacimiento instanceof Date
        ? animal.fechaNacimiento.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      padre_id: animal.padreId || null,
      madre_id: animal.madreId || null,
      pending: true,
      synced: false,
    };

    try {
      if (navigator.onLine) {
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

        // Actualizar caché después de insert exitoso
        await this.updateCacheAfterOperation(data);
        return Animal.fromSupabase(data);
      }
      throw new Error("Offline");
    } catch (error) {
      console.warn("🌐 Guardando en cola offline...");

      // Guardar en cola
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "INSERT",
        data: nuevoRegistro,
      });

      // Actualizar caché inmediatamente
      const cached = await this.offlineStorage.getCachedData("animales");
      await this.offlineStorage.cacheData("animales", [
        nuevoRegistro,
        ...cached,
      ]);

      return Animal.fromSupabase(nuevoRegistro);
    }
  }

  async update(id: string, animalData: Partial<Animal>): Promise<Animal> {
    const updateData: any = {};
    if (animalData.nombre) updateData.nombre = animalData.nombre;
    if (animalData.numeroArete) updateData.numero_arete = animalData.numeroArete;
    if (animalData.sexo) updateData.sexo = animalData.sexo;
    if (animalData.padreId !== undefined) updateData.padre_id = animalData.padreId;
    if (animalData.madreId !== undefined) updateData.madre_id = animalData.madreId;

    if (animalData.fechaNacimiento) {
      updateData.fecha_nacimiento = animalData.fechaNacimiento instanceof Date
        ? animalData.fechaNacimiento.toISOString().split("T")[0]
        : animalData.fechaNacimiento;
    }

    try {
      if (navigator.onLine) {
        const { data, error } = await this.supabase
          .from("animales")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await this.updateCacheAfterOperation(data);
        return Animal.fromSupabase(data);
      }
      throw new Error("Offline");
    } catch (error) {
      console.warn("🔄 Encolando actualización offline...");

      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "UPDATE",
        data: { id, ...updateData, pending: true, synced: false },
      });

      // Actualizar caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      const index = cached.findIndex((item) => item.id === id);
      if (index >= 0) {
        cached[index] = { ...cached[index], ...updateData, pending: true };
        await this.offlineStorage.cacheData("animales", cached);
      }

      // Retornar versión actualizada
      const updated = cached.find((a) => a.id === id);
      return Animal.fromSupabase(updated || { id, ...updateData });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (navigator.onLine) {
        const { error } = await this.supabase
          .from("animales")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Actualizar caché después de eliminar
        const cached = await this.offlineStorage.getCachedData("animales");
        await this.offlineStorage.cacheData(
          "animales",
          cached.filter((a) => a.id !== id)
        );
        return;
      }
      throw new Error("Offline");
    } catch (error) {
      console.warn("🗑️ Encolando eliminación offline...");

      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "DELETE",
        data: { id, pending: true, synced: false },
      });

      // Actualizar caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      await this.offlineStorage.cacheData(
        "animales",
        cached.filter((a) => a.id !== id)
      );
    }
  }

  // Métodos privados de ayuda
  private async updateCacheAfterOperation(newData: any) {
    const cached = await this.offlineStorage.getCachedData("animales");
    const index = cached.findIndex((item) => item.id === newData.id);
    if (index >= 0) {
      cached[index] = newData;
    } else {
      cached.unshift(newData);
    }
    await this.offlineStorage.cacheData("animales", cached);
  }
}
