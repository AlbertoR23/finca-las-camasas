import { IRegistroRepository } from "@/src/core/repositories/IRegistroRepository";
import { RegistroProduccion } from "@/src/core/entities/RegistroProduccion";
import { createClient } from "@/utils/supabase/client";
import { OfflineStorageService } from "../../services/offline/offline-storage.service";
import { SyncService } from "../../services/offline/sync.service";

export class SupabaseRegistroRepository implements IRegistroRepository {
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

  private mapToEntity(item: any): RegistroProduccion {
    const fechaStr = item.fecha;
    let fecha: Date;

    if (typeof fechaStr === "string") {
      fecha = new Date(fechaStr + "T12:00:00");
    } else {
      fecha = new Date(fechaStr);
      fecha = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        12,
        0,
        0,
      );
    }

    return new RegistroProduccion({
      id: item.id,
      animalId: item.animal_id,
      fecha: fecha,
      litrosLeche: item.litros_leche || 0,
      pesoKg: item.peso_kg || 0,
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
    const { data } = await this.supabase.from("registros_diarios").select("*");
    if (data) {
      const enriched = await this.enrichWithAnimalName(data);
      await this.offlineStorage.cacheData("registros_diarios", enriched);
    }
  }

  async findAll(): Promise<RegistroProduccion[]> {
    try {
      // Intento online
      const { data, error } = await this.supabase
        .from("registros_diarios")
        .select("*")
        .order("fecha", { ascending: false });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        await this.offlineStorage.cacheData("registros_diarios", enriched);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      console.log("📦 Usando caché local para registros");
      const cached =
        await this.offlineStorage.getCachedData("registros_diarios");
      return cached.map((item) => this.mapToEntity(item));
    }
  }

  async findById(id: string): Promise<RegistroProduccion | null> {
    try {
      const { data, error } = await this.supabase
        .from("registros_diarios")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const enriched = await this.enrichSingleWithAnimalName(data);
        return this.mapToEntity(enriched);
      }
      throw error;
    } catch (error) {
      const cached =
        await this.offlineStorage.getCachedData("registros_diarios");
      const found = cached.find((item) => item.id === id);
      return found ? this.mapToEntity(found) : null;
    }
  }

  async findByAnimalId(animalId: string): Promise<RegistroProduccion[]> {
    try {
      const { data, error } = await this.supabase
        .from("registros_diarios")
        .select("*")
        .eq("animal_id", animalId)
        .order("fecha", { ascending: false });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached =
        await this.offlineStorage.getCachedData("registros_diarios");
      const filtered = cached.filter((item) => item.animal_id === animalId);
      return filtered.map((item) => this.mapToEntity(item));
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RegistroProduccion[]> {
    try {
      const { data, error } = await this.supabase
        .from("registros_diarios")
        .select("*")
        .gte("fecha", this.formatDateForSupabase(startDate))
        .lte("fecha", this.formatDateForSupabase(endDate))
        .order("fecha", { ascending: false });

      if (!error && data) {
        const enriched = await this.enrichWithAnimalName(data);
        return enriched.map((item) => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached =
        await this.offlineStorage.getCachedData("registros_diarios");
      const filtered = cached.filter((item) => {
        const fecha = new Date(item.fecha);
        return fecha >= startDate && fecha <= endDate;
      });
      return filtered.map((item) => this.mapToEntity(item));
    }
  }

  async create(registro: RegistroProduccion): Promise<RegistroProduccion> {
    const registroData = {
      animal_id: registro.animalId,
      fecha: this.formatDateForSupabase(registro.fecha),
      litros_leche: registro.litrosLeche,
      peso_kg: registro.pesoKg,
    };

    // 🟢 MODO ONLINE
    if (navigator.onLine) {
      try {
        const { data, error } = await this.supabase
          .from("registros_diarios")
          .insert([registroData])
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

    // 🟡 MODO OFFLINE: Encolar operación
    console.log("📥 Encolando registro de producción para guardar después");
    await this.offlineStorage.queueOperation({
      table: "registros_diarios",
      operation: "INSERT",
      data: registroData,
    });

    // Obtener nombre del animal de caché si es posible
    const animalesCache = await this.offlineStorage.getCachedData("animales");
    const animal = animalesCache.find((a: any) => a.id === registro.animalId);

    const tempId = "temp-" + Date.now();
    const tempData = {
      ...registroData,
      id: tempId,
      animales: { nombre: animal?.nombre || "Pendiente de sincronizar" },
    };

    const cached = await this.offlineStorage.getCachedData("registros_diarios");
    cached.push(tempData);
    await this.offlineStorage.cacheData("registros_diarios", cached);

    return new RegistroProduccion({
      id: tempId,
      animalId: registro.animalId,
      fecha: registro.fecha,
      litrosLeche: registro.litrosLeche,
      pesoKg: registro.pesoKg,
      animalNombre: animal?.nombre || "Pendiente",
    });
  }

  async update(
    id: string,
    registroData: Partial<RegistroProduccion>,
  ): Promise<RegistroProduccion> {
    const updateData: any = {};
    if (registroData.animalId) updateData.animal_id = registroData.animalId;
    if (registroData.fecha)
      updateData.fecha = this.formatDateForSupabase(registroData.fecha);
    if (registroData.litrosLeche !== undefined)
      updateData.litros_leche = registroData.litrosLeche;
    if (registroData.pesoKg !== undefined)
      updateData.peso_kg = registroData.pesoKg;

    if (navigator.onLine) {
      try {
        const { data, error } = await this.supabase
          .from("registros_diarios")
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
      table: "registros_diarios",
      operation: "UPDATE",
      data: { id, ...updateData },
    });

    const cached = await this.offlineStorage.getCachedData("registros_diarios");
    const index = cached.findIndex((item) => item.id === id);
    if (index >= 0) {
      cached[index] = { ...cached[index], ...updateData, pending: true };
      await this.offlineStorage.cacheData("registros_diarios", cached);
    }

    return new RegistroProduccion({
      id,
      animalId: updateData.animal_id || "",
      fecha: new Date(),
      litrosLeche: updateData.litros_leche || 0,
      pesoKg: updateData.peso_kg || 0,
    });
  }

  async delete(id: string): Promise<void> {
    if (navigator.onLine) {
      try {
        const { error } = await this.supabase
          .from("registros_diarios")
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
      table: "registros_diarios",
      operation: "DELETE",
      data: { id },
    });

    const cached = await this.offlineStorage.getCachedData("registros_diarios");
    const filtered = cached.filter((item) => item.id !== id);
    await this.offlineStorage.cacheData("registros_diarios", filtered);
  }

  async getProduccionPromedio(
    animalId: string,
    days: number = 30,
  ): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const registros = await this.findByDateRange(startDate, endDate);
    const registrosAnimal = registros.filter(
      (r) => r.animalId === animalId && r.litrosLeche > 0,
    );

    if (registrosAnimal.length === 0) return 0;

    const total = registrosAnimal.reduce((sum, r) => sum + r.litrosLeche, 0);
    return total / registrosAnimal.length;
  }
}
