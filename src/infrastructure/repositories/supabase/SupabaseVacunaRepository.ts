import { IVacunaRepository } from "@/src/core/repositories/IVacunaRepository";
import { Vacuna } from "@/src/core/entities/Vacuna";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";
import { SyncService } from "../../services/offline/sync.service";

export class SupabaseVacunaRepository implements IVacunaRepository {
  private supabase = createClient();
  private offlineStorage = OfflineStorageService.getInstance();
  private syncService = SyncService.getInstance();

  private async enrichWithAnimalName(data: any[]): Promise<any[]> {
    for (const item of data) {
      if (item.animal_id) {
        const { data: animal } = await this.supabase
          .from("animales")
          .select("nombre")
          .eq("id", item.animal_id)
          .maybeSingle();
        item.animales = animal || { nombre: "Animal no encontrado" };
      }
    }
    return data;
  }

  private async enrichSingleWithAnimalName(item: any): Promise<any> {
    if (item?.animal_id) {
      const { data: animal } = await this.supabase
        .from("animales")
        .select("nombre")
        .eq("id", item.animal_id)
        .maybeSingle();
      item.animales = animal || { nombre: "Animal no encontrado" };
    }
    return item;
  }

  private mapToEntity(item: any): Vacuna {
    const mapFecha = (fechaStr: string | null): Date | null | undefined => {
      if (!fechaStr) return null;

      if (typeof fechaStr === "string") {
        return new Date(fechaStr + "T12:00:00");
      }
      const fecha = new Date(fechaStr);
      return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        12,
        0,
        0,
      );
    };

    return new Vacuna({
      id: item.id,
      animalId: item.animal_id,
      nombreVacuna: item.nombre_vacuna,
      fechaAplicacion: mapFecha(item.fecha_aplicacion) || new Date(),
      proximaDosis: mapFecha(item.proxima_dosis),
      animalNombre: item.animales?.nombre,
    });
  }

  private formatDateForSupabase(date: Date): string {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  }

  private async refreshCache(): Promise<void> {
    const { data } = await this.supabase.from("vacunas").select("*");
    if (data) {
      const enriched = await this.enrichWithAnimalName(data);
      await this.offlineStorage.cacheData("vacunas", enriched);
    }
  }

  async findAll(): Promise<Vacuna[]> {
    try {
      const { data, error } = await this.supabase
        .from("vacunas")
        .select("*")
        .order("fecha_aplicacion", { ascending: false });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        await this.offlineStorage.cacheData("vacunas", enriched);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      console.log("📦 Usando caché local para vacunas");
      const cached = await this.offlineStorage.getCachedData("vacunas");
      return cached.map((item) => this.mapToEntity(item));
    }
  }

  async findById(id: string): Promise<Vacuna | null> {
    try {
      const { data, error } = await this.supabase
        .from("vacunas")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const enriched = await this.enrichSingleWithAnimalName(data);
        return this.mapToEntity(enriched);
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData("vacunas");
      const found = cached.find((item) => item.id === id);
      return found ? this.mapToEntity(found) : null;
    }
  }

  async findByAnimalId(animalId: string): Promise<Vacuna[]> {
    try {
      const { data, error } = await this.supabase
        .from("vacunas")
        .select("*")
        .eq("animal_id", animalId)
        .order("fecha_aplicacion", { ascending: false });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData("vacunas");
      const filtered = cached.filter((item) => item.animal_id === animalId);
      return filtered.map((item) => this.mapToEntity(item));
    }
  }

  async findVencidas(): Promise<Vacuna[]> {
    try {
      const hoy = new Date();
      const hoyStr = this.formatDateForSupabase(hoy);

      const { data, error } = await this.supabase
        .from("vacunas")
        .select("*")
        .lt("proxima_dosis", hoyStr)
        .order("proxima_dosis", { ascending: true });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData("vacunas");
      const hoy = new Date();
      const filtered = cached.filter((item) => {
        if (!item.proxima_dosis) return false;
        const proxima = new Date(item.proxima_dosis);
        return proxima < hoy;
      });
      return filtered.map((item) => this.mapToEntity(item));
    }
  }

  async findProximasAVencer(dias: number = 7): Promise<Vacuna[]> {
    try {
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + dias);

      const hoyStr = this.formatDateForSupabase(hoy);
      const fechaLimiteStr = this.formatDateForSupabase(fechaLimite);

      const { data, error } = await this.supabase
        .from("vacunas")
        .select("*")
        .gte("proxima_dosis", hoyStr)
        .lte("proxima_dosis", fechaLimiteStr)
        .order("proxima_dosis", { ascending: true });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData("vacunas");
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + dias);

      const filtered = cached.filter((item) => {
        if (!item.proxima_dosis) return false;
        const proxima = new Date(item.proxima_dosis);
        return proxima >= hoy && proxima <= fechaLimite;
      });
      return filtered.map((item) => this.mapToEntity(item));
    }
  }

  async create(vacuna: Vacuna): Promise<Vacuna> {
    const vacunaData = {
      animal_id: vacuna.animalId,
      nombre_vacuna: vacuna.nombreVacuna,
      fecha_aplicacion: this.formatDateForSupabase(vacuna.fechaAplicacion),
      proxima_dosis: vacuna.proximaDosis
        ? this.formatDateForSupabase(vacuna.proximaDosis)
        : null,
    };

    if (navigator.onLine) {
      try {
        const { data, error } = await this.supabase
          .from("vacunas")
          .insert([vacunaData])
          .select()
          .single();

        if (error) throw error;

        await this.refreshCache();
        const enriched = await this.enrichSingleWithAnimalName(data);
        return this.mapToEntity(enriched);
      } catch (error) {
        console.error("Error online, pasando a offline:", error);
      }
    }

    console.log("📥 Encolando vacuna para guardar después");
    await this.offlineStorage.queueOperation({
      table: "vacunas",
      operation: "INSERT",
      data: vacunaData,
    });

    const animalesCache = await this.offlineStorage.getCachedData("animales");
    const animal = animalesCache.find((a: any) => a.id === vacuna.animalId);

    const tempId = "temp-" + Date.now();
    const tempData = {
      ...vacunaData,
      id: tempId,
      animales: { nombre: animal?.nombre || "Pendiente de sincronizar" },
    };

    const cached = await this.offlineStorage.getCachedData("vacunas");
    cached.push(tempData);
    await this.offlineStorage.cacheData("vacunas", cached);

    return new Vacuna({
      id: tempId,
      animalId: vacuna.animalId,
      nombreVacuna: vacuna.nombreVacuna,
      fechaAplicacion: vacuna.fechaAplicacion,
      proximaDosis: vacuna.proximaDosis,
      animalNombre: animal?.nombre || "Pendiente",
    });
  }

  async update(id: string, vacunaData: Partial<Vacuna>): Promise<Vacuna> {
    const updateData: any = {};
    if (vacunaData.animalId) updateData.animal_id = vacunaData.animalId;
    if (vacunaData.nombreVacuna)
      updateData.nombre_vacuna = vacunaData.nombreVacuna;
    if (vacunaData.fechaAplicacion) {
      updateData.fecha_aplicacion = this.formatDateForSupabase(
        vacunaData.fechaAplicacion,
      );
    }
    if (vacunaData.proximaDosis !== undefined) {
      updateData.proxima_dosis = vacunaData.proximaDosis
        ? this.formatDateForSupabase(vacunaData.proximaDosis)
        : null;
    }

    if (navigator.onLine) {
      try {
        const { data, error } = await this.supabase
          .from("vacunas")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await this.refreshCache();
        const enriched = await this.enrichSingleWithAnimalName(data);
        return this.mapToEntity(enriched);
      } catch (error) {
        console.error("Error online, pasando a offline:", error);
      }
    }

    await this.offlineStorage.queueOperation({
      table: "vacunas",
      operation: "UPDATE",
      data: { id, ...updateData },
    });

    const cached = await this.offlineStorage.getCachedData("vacunas");
    const index = cached.findIndex((item) => item.id === id);
    if (index >= 0) {
      cached[index] = { ...cached[index], ...updateData, pending: true };
      await this.offlineStorage.cacheData("vacunas", cached);
    }

    return new Vacuna({
      id,
      animalId: updateData.animal_id || "",
      nombreVacuna: updateData.nombre_vacuna || "",
      fechaAplicacion: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    if (navigator.onLine) {
      try {
        const { error } = await this.supabase
          .from("vacunas")
          .delete()
          .eq("id", id);

        if (error) throw error;

        await this.refreshCache();
        return;
      } catch (error) {
        console.error("Error online, pasando a offline:", error);
      }
    }

    await this.offlineStorage.queueOperation({
      table: "vacunas",
      operation: "DELETE",
      data: { id },
    });

    const cached = await this.offlineStorage.getCachedData("vacunas");
    const filtered = cached.filter((item) => item.id !== id);
    await this.offlineStorage.cacheData("vacunas", filtered);
  }
}
