import { IAnimalRepository } from "@/src/core/repositories/IAnimalRepository";
import { Animal } from "@/src/core/entities/Animal";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";

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
  async create(animal: Animal): Promise<Animal> {
    const animalData = animal.toJSON();

    try {
      // Intentar operación online directamente
      const { data, error } = await this.supabase
        .from("animales")
        .insert([animalData])
        .select()
        .single();

      if (error) throw error;

      // Actualización incremental del caché (sin descargar todo de nuevo)
      const cached = await this.offlineStorage.getCachedData("animales");
      cached.push(data);
      await this.offlineStorage.cacheData("animales", cached);

      return Animal.fromSupabase(data);
    } catch (error) {
      console.error("🌐 Error de red, guardando animal offline...");

      // Generar un ID temporal si no tiene uno para IndexedDB
      const offlineId = animalData.id || crypto.randomUUID();
      const localData = { ...animalData, id: offlineId, pending: true };

      // 1. Encolar operación para SyncService
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "INSERT",
        data: localData,
      });

      // 2. Guardar en caché local para que aparezca en la lista
      const cached = await this.offlineStorage.getCachedData("animales");
      cached.push(localData);
      await this.offlineStorage.cacheData("animales", cached);

      return Animal.fromSupabase(localData);
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

  private mapToSupabaseFormat(animalData: Partial<Animal>) {
    const mapped: any = {};
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
