import { IAnimalRepository } from '../../../core/repositories/IAnimalRepository';
import { Animal } from '../../../core/entities/Animal';
import { createClient } from '../../../../utils/supabase/client';

export class SupabaseAnimalRepository implements IAnimalRepository {
  private supabase = createClient();

  async findAll(): Promise<Animal[]> {
    const { data, error } = await this.supabase
      .from('animales')
      .select('*')
      .order('nombre');

    if (error) throw new Error(`Error fetching animals: ${error.message}`);
    
    return data.map(item => Animal.fromSupabase(item));
  }

  async findById(id: string): Promise<Animal | null> {
    const { data, error } = await this.supabase
      .from('animales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    
    return Animal.fromSupabase(data);
  }

  async findBySearchTerm(term: string): Promise<Animal[]> {
    const { data, error } = await this.supabase
      .from('animales')
      .select('*')
      .or(`nombre.ilike.%${term}%,numero_arete.ilike.%${term}%`);

    if (error) throw new Error(`Error searching animals: ${error.message}`);
    
    return data.map(item => Animal.fromSupabase(item));
  }

  async create(animal: Animal): Promise<Animal> {
    const animalData = animal.toJSON();
    const { data, error } = await this.supabase
      .from('animales')
      .insert([{
        nombre: animalData.nombre,
        numero_arete: animalData.numero_arete,
        fecha_nacimiento: animalData.fecha_nacimiento,
        sexo: animalData.sexo,
        padre_id: animalData.padre_id,
        madre_id: animalData.madre_id
      }])
      .select()
      .single();

    if (error) throw new Error(`Error creating animal: ${error.message}`);
    
    return Animal.fromSupabase(data);
  }

  async update(id: string, animalData: Partial<Animal>): Promise<Animal> {
    const updateData: any = {};
    if (animalData.nombre) updateData.nombre = animalData.nombre;
    if (animalData.numeroArete) updateData.numero_arete = animalData.numeroArete;
    if (animalData.fechaNacimiento) {
      const fecha = animalData.fechaNacimiento;
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      updateData.fecha_nacimiento = `${año}-${mes}-${dia}`;
    }
    if (animalData.sexo) updateData.sexo = animalData.sexo;
    if (animalData.padreId !== undefined) updateData.padre_id = animalData.padreId;
    if (animalData.madreId !== undefined) updateData.madre_id = animalData.madreId;

    const { data, error } = await this.supabase
      .from('animales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating animal: ${error.message}`);
    
    return Animal.fromSupabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('animales')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error deleting animal: ${error.message}`);
  }
}
