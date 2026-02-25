import { IAnimalRepository } from "@/src/core/repositories/IAnimalRepository";
import { Animal } from "@/src/core/entities/Animal";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";
import { SyncService } from "../../services/offline/sync.service";

export class SupabaseAnimalRepository implements IAnimalRepository {
  private supabase = createClient();
  private offlineStorage = OfflineStorageService.getInstance();
  private syncService = SyncService.getInstance();

  async findAll(): Promise<Animal[]> {
    try {
      // Intentar obtener de Supabase
      const { data, error } = await this.supabase
        .from("animales")
        .select("*")
        .order("nombre");

      if (!error && data) {
        // Guardar en caché para offline
        await this.offlineStorage.cacheData("animales", data);
        return data.map((item) => Animal.fromSupabase(item));
      }
      throw error;
    } catch (error) {
      console.log("Offline: usando caché local para animales");
      // Si falla, usar caché local
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

      if (!error && data) {
        return Animal.fromSupabase(data);
      }
      throw error;
    } catch (error) {
      // Buscar en caché local
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

      if (!error && data) {
        return data.map((item) => Animal.fromSupabase(item));
      }
      throw error;
    } catch (error) {
      // Filtrar en caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      const filtered = cached.filter(
        (item) =>
          item.nombre.toLowerCase().includes(term.toLowerCase()) ||
          item.numero_arete.toLowerCase().includes(term.toLowerCase()),
      );
      return filtered.map((item) => Animal.fromSupabase(item));
    }
  }

  async create(animal: Animal): Promise<Animal> {
    const animalData = animal.toJSON();

    if (!navigator.onLine) {
      // Modo offline: encolar operación
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "INSERT",
        data: animalData,
      });

      // Guardar en caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      cached.push({ ...animalData, pending: true });
      await this.offlineStorage.cacheData("animales", cached);

      return animal;
    }

    // Modo online: ejecutar directamente
    try {
      const { data, error } = await this.supabase
        .from("animales")
        .insert([animalData])
        .select()
        .single();

      if (error) throw new Error(`Error creating animal: ${error.message}`);

      // ✅ CORREGIDO: En lugar de vaciar el caché, obtener los datos actualizados
      const { data: allData } = await this.supabase
        .from("animales")
        .select("*")
        .order("nombre");

      if (allData) {
        await this.offlineStorage.cacheData("animales", allData);
      }

      return Animal.fromSupabase(data);
    } catch (error) {
      // Si falla la conexión durante la operación, encolar
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "INSERT",
        data: animalData,
      });
      return animal;
    }
  }

  async update(id: string, animalData: Partial<Animal>): Promise<Animal> {
    const updateData: {
      nombre?: string;
      numero_arete?: string;
      fecha_nacimiento?: string;
      sexo?: string;
      padre_id?: string | null;
      madre_id?: string | null;
    } = {};
    if (animalData.nombre) updateData.nombre = animalData.nombre;
    if (animalData.numeroArete)
      updateData.numero_arete = animalData.numeroArete;
    if (animalData.fechaNacimiento) {
      const fecha = animalData.fechaNacimiento;
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate()).padStart(2, "0");
      updateData.fecha_nacimiento = `${año}-${mes}-${dia}`;
    }
    if (animalData.sexo) updateData.sexo = animalData.sexo;
    if (animalData.padreId !== undefined)
      updateData.padre_id = animalData.padreId;
    if (animalData.madreId !== undefined)
      updateData.madre_id = animalData.madreId;

    if (!navigator.onLine) {
      // Modo offline
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "UPDATE",
        data: { id, ...updateData },
      });

      // Actualizar caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      const index = cached.findIndex((item) => item.id === id);
      if (index >= 0) {
        cached[index] = { ...cached[index], ...updateData, pending: true };
        await this.offlineStorage.cacheData("animales", cached);
      }

      return new Animal({
        id,
        nombre: updateData.nombre || "",
        numeroArete: updateData.numero_arete || "",
        fechaNacimiento: new Date(),
        sexo: (updateData.sexo as "Macho" | "Hembra") || "Hembra",
        padreId: updateData.padre_id,
        madreId: updateData.madre_id,
      });
    }

    try {
      const { data, error } = await this.supabase
        .from("animales")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Error updating animal: ${error.message}`);

      // ✅ CORREGIDO: Actualizar caché con datos frescos
      const { data: allData } = await this.supabase
        .from("animales")
        .select("*")
        .order("nombre");

      if (allData) {
        await this.offlineStorage.cacheData("animales", allData);
      }

      return Animal.fromSupabase(data);
    } catch (error) {
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "UPDATE",
        data: { id, ...updateData },
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (!navigator.onLine) {
      // Modo offline
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "DELETE",
        data: { id },
      });

      // Actualizar caché local
      const cached = await this.offlineStorage.getCachedData("animales");
      const filtered = cached.filter((item) => item.id !== id);
      await this.offlineStorage.cacheData("animales", filtered);
      return;
    }

    try {
      const { error } = await this.supabase
        .from("animales")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Error deleting animal: ${error.message}`);

      // ✅ CORREGIDO: Actualizar caché después de eliminar
      const { data: allData } = await this.supabase
        .from("animales")
        .select("*")
        .order("nombre");

      if (allData) {
        await this.offlineStorage.cacheData("animales", allData);
      }
    } catch (error) {
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "DELETE",
        data: { id },
      });
    }
  }
}
