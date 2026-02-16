import { Animal } from "@/src/core/entities/Animal";

export type SexoAnimal = "Macho" | "Hembra";

export interface AnimalStats {
  total: number;
  machos: number;
  hembras: number;
  promedioEdad: number;
  enProduccion: number;
}

export interface AnimalWithRelations extends Animal {
  padre?: Animal | null;
  madre?: Animal | null;
  hijos?: Animal[];
}

export interface AnimalFilters {
  sexo?: SexoAnimal;
  edadMin?: number;
  edadMax?: number;
  tienePadre?: boolean;
  tieneMadre?: boolean;
  searchTerm?: string;
}

export interface AnimalFormData {
  nombre: string;
  numeroArete: string;
  fechaNacimiento: string;
  sexo: SexoAnimal;
  padreId?: string | null;
  madreId?: string | null;
}

export interface AnimalResponse {
  success: boolean;
  data?: Animal;
  error?: string;
}

export interface AnimalesResponse {
  success: boolean;
  data?: Animal[];
  error?: string;
  total?: number;
}
