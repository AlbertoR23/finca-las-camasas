import { IFinanzaRepository } from '@/src/core/repositories/IFinanzaRepository';
import { Transaccion } from '@/src/core/entities/Transaccion';
import { createClient } from '@/utils/supabase/client';
import { OfflineStorageService } from '../../services/offline/offline-storage.service';
import { SyncService } from '../../services/offline/sync.service';

export class SupabaseFinanzaRepository implements IFinanzaRepository {
  private supabase = createClient();
  private offlineStorage = OfflineStorageService.getInstance();
  private syncService = SyncService.getInstance();

  private mapToEntity(item: any): Transaccion {
    const fechaStr = item.fecha;
    let fecha: Date;
    
    if (typeof fechaStr === 'string') {
      fecha = new Date(fechaStr + 'T12:00:00');
    } else {
      fecha = new Date(fechaStr);
      fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
    }

    const descripcion = item.descripcion || '';
    const tieneUSD = descripcion.includes('[Orig: USD');
    
    let monedaOriginal: 'VES' | 'USD' | undefined = undefined;
    let montoOriginal: number | undefined = undefined;
    
    if (tieneUSD) {
      monedaOriginal = 'USD';
      const match = descripcion.match(/Orig: USD ([\d.]+)/);
      if (match && match[1]) {
        montoOriginal = parseFloat(match[1]);
      }
    }

    return new Transaccion({
      id: item.id,
      tipo: item.tipo,
      categoria: item.categoria,
      monto: item.monto,
      descripcion: descripcion,
      fecha: fecha,
      monedaOriginal: monedaOriginal,
      montoOriginal: montoOriginal
    });
  }

  private formatDateForSupabase(date: Date): string {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  async findAll(): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('contabilidad')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data) {
        await this.offlineStorage.cacheData('contabilidad', data);
        return data.map(item => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      console.log('Offline: usando caché local para finanzas');
      const cached = await this.offlineStorage.getCachedData('contabilidad');
      return cached.map(item => this.mapToEntity(item));
    }
  }

  async findById(id: string): Promise<Transaccion | null> {
    try {
      const { data, error } = await this.supabase
        .from('contabilidad')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return this.mapToEntity(data);
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData('contabilidad');
      const found = cached.find(item => item.id === id);
      return found ? this.mapToEntity(found) : null;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('contabilidad')
        .select('*')
        .gte('fecha', this.formatDateForSupabase(startDate))
        .lte('fecha', this.formatDateForSupabase(endDate))
        .order('fecha', { ascending: false });

      if (!error && data) {
        return data.map(item => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData('contabilidad');
      const filtered = cached.filter(item => {
        const fecha = new Date(item.fecha);
        return fecha >= startDate && fecha <= endDate;
      });
      return filtered.map(item => this.mapToEntity(item));
    }
  }

  async findByTipo(tipo: 'ingreso' | 'gasto'): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('contabilidad')
        .select('*')
        .eq('tipo', tipo)
        .order('fecha', { ascending: false });

      if (!error && data) {
        return data.map(item => this.mapToEntity(item));
      }
      throw error;
    } catch (error) {
      const cached = await this.offlineStorage.getCachedData('contabilidad');
      const filtered = cached.filter(item => item.tipo === tipo);
      return filtered.map(item => this.mapToEntity(item));
    }
  }

  async create(transaccion: Transaccion): Promise<Transaccion> {
    const transaccionData = {
      tipo: transaccion.tipo,
      categoria: transaccion.categoria,
      monto: transaccion.monto,
      descripcion: transaccion.descripcion,
      fecha: this.formatDateForSupabase(transaccion.fecha)
    };

    if (!navigator.onLine) {
      await this.offlineStorage.queueOperation({
        table: 'contabilidad',
        operation: 'INSERT',
        data: transaccionData
      });

      const cached = await this.offlineStorage.getCachedData('contabilidad');
      cached.push({ ...transaccionData, id: 'temp-' + Date.now(), pending: true });
      await this.offlineStorage.cacheData('contabilidad', cached);

      return transaccion;
    }

    try {
      const { data, error } = await this.supabase
        .from('contabilidad')
        .insert([transaccionData])
        .select()
        .single();

      if (error) throw new Error(`Error creating transaction: ${error.message}`);
      
      await this.offlineStorage.cacheData('contabilidad', []);
      return this.mapToEntity(data);
    } catch (error) {
      await this.offlineStorage.queueOperation({
        table: 'contabilidad',
        operation: 'INSERT',
        data: transaccionData
      });
      return transaccion;
    }
  }

  async update(id: string, transaccionData: Partial<Transaccion>): Promise<Transaccion> {
    const updateData: any = {};
    if (transaccionData.tipo) updateData.tipo = transaccionData.tipo;
    if (transaccionData.categoria) updateData.categoria = transaccionData.categoria;
    if (transaccionData.monto) updateData.monto = transaccionData.monto;
    if (transaccionData.descripcion !== undefined) updateData.descripcion = transaccionData.descripcion;
    if (transaccionData.fecha) updateData.fecha = this.formatDateForSupabase(transaccionData.fecha);

    if (!navigator.onLine) {
      await this.offlineStorage.queueOperation({
        table: 'contabilidad',
        operation: 'UPDATE',
        data: { id, ...updateData }
      });

      const cached = await this.offlineStorage.getCachedData('contabilidad');
      const index = cached.findIndex(item => item.id === id);
      if (index >= 0) {
        cached[index] = { ...cached[index], ...updateData, pending: true };
        await this.offlineStorage.cacheData('contabilidad', cached);
      }

      return new Transaccion({
        id,
        tipo: updateData.tipo || 'gasto',
        categoria: updateData.categoria || '',
        monto: updateData.monto || 0,
        descripcion: updateData.descripcion || '',
        fecha: new Date()
      });
    }

    try {
      const { data, error } = await this.supabase
        .from('contabilidad')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Error updating transaction: ${error.message}`);
      
      await this.offlineStorage.cacheData('contabilidad', []);
      return this.mapToEntity(data);
    } catch (error) {
      await this.offlineStorage.queueOperation({
        table: 'contabilidad',
        operation: 'UPDATE',
        data: { id, ...updateData }
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (!navigator.onLine) {
      await this.offlineStorage.queueOperation({
        table: 'contabilidad',
        operation: 'DELETE',
        data: { id }
      });

      const cached = await this.offlineStorage.getCachedData('contabilidad');
      const filtered = cached.filter(item => item.id !== id);
      await this.offlineStorage.cacheData('contabilidad', filtered);
      return;
    }

    try {
      const { error } = await this.supabase
        .from('contabilidad')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Error deleting transaction: ${error.message}`);
      
      await this.offlineStorage.cacheData('contabilidad', []);
    } catch (error) {
      await this.offlineStorage.queueOperation({
        table: 'contabilidad',
        operation: 'DELETE',
        data: { id }
      });
    }
  }

  async getBalance(): Promise<{ ingresos: number; gastos: number; neto: number }> {
    const transacciones = await this.findAll();
    
    const balance = transacciones.reduce((acc, t) => {
      if (t.esIngreso()) {
        acc.ingresos += t.monto;
      } else {
        acc.gastos += t.monto;
      }
      return acc;
    }, { ingresos: 0, gastos: 0 });

    return {
      ...balance,
      neto: balance.ingresos - balance.gastos
    };
  }
}