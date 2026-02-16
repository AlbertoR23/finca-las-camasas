import { Animal } from "@/src/core/entities/Animal";

export interface AnimalFormData {
  nombre: string;
  arete: string;
  nacimiento: string;
  sexo: "Macho" | "Hembra";
  padre_id: string;
  madre_id: string;
}

export interface AnimalFormProps {
  animales: Animal[];
  onSubmit: (data: Omit<AnimalFormData, "id">) => Promise<void>;
  onCancel?: () => void;
  initialData?: AnimalFormData;
  isEditing?: boolean;
}

export interface AnimalFormErrors {
  nombre?: string;
  arete?: string;
  nacimiento?: string;
  padre_id?: string;
  madre_id?: string;
}
