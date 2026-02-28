import { IAnimalRepository } from "@/src/core/repositories/IAnimalRepository";
import { Animal } from "@/src/core/entities/Animal";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";

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
      await this.offlineStorage.cacheData("animales", data);
      return data.map((item) => Animal.fromSupabase(item));
    } catch (error) {
      console.warn("⚠️ Cargando animales desde IndexedDB");
      const cached = await this.offlineStorage.getCachedData("animales");
      return cached.map((item) => Animal.fromSupabase(item));
    }
  }

  async create(animalData: any): Promise<Animal> {
    const idTemporal = crypto.randomUUID();

    // ✅ Formateo estricto: De camelCase (Formulario) a snake_case (DB/IndexedDB)
    const nuevoRegistro = {
      id: idTemporal,
      nombre: animalData.nombre,
      numero_arete: animalData.numeroArete || animalData.numero_arete,
      sexo: animalData.sexo,
      fecha_nacimiento:
        animalData.fechaNacimiento instanceof Date
          ? animalData.fechaNacimiento.toISOString().split("T")[0]
          : animalData.fechaNacimiento,
      padre_id: animalData.padreId || null,
      madre_id: animalData.madreId || null,
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
        return Animal.fromSupabase(data);
      }
      throw new Error("Offline");
    } catch (error) {
      // Guardado Offline
      await this.offlineStorage.queueOperation({
        table: "animales",
        operation: "INSERT",
        data: nuevoRegistro,
      });
      // Actualización inmediata del caché
      const cached = await this.offlineStorage.getCachedData("animales");
      await this.offlineStorage.cacheData("animales", [
        nuevoRegistro,
        ...cached,
      ]);

      return Animal.fromSupabase(nuevoRegistro);
    }
  }

  async findBySearchTerm(term: string): Promise<Animal[]> {
    const cached = await this.offlineStorage.getCachedData("animales");
    const filtered = cached.filter(
      (item) =>
        item.nombre.toLowerCase().includes(term.toLowerCase()) ||
        item.numero_arete.toLowerCase().includes(term.toLowerCase()),
    );
    return filtered.map((item) => Animal.fromSupabase(item));
  }

  async findById(id: string): Promise<Animal | null> {
    return null;
  }
  async update(id: string, data: any): Promise<Animal> {
    return data;
  }
  async delete(id: string): Promise<void> {}
}
