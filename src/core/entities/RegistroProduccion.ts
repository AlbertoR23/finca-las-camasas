export interface RegistroProduccionProps {
  id?: string;
  animalId: string;
  fecha: Date;
  litrosLeche?: number;
  pesoKg?: number;
  animalNombre?: string; // Para relaciones
}

export class RegistroProduccion {
  public readonly id?: string;
  public readonly animalId: string;
  public readonly fecha: Date;
  public readonly litrosLeche: number;
  public readonly pesoKg: number;
  public readonly animalNombre?: string;

  constructor(props: RegistroProduccionProps) {
    this.id = props.id;
    this.animalId = props.animalId;
    this.fecha = props.fecha || new Date();
    this.litrosLeche = props.litrosLeche || 0;
    this.pesoKg = props.pesoKg || 0;
    this.animalNombre = props.animalNombre;

    this.validate();
  }

  private validate(): void {
    if (!this.animalId) {
      throw new Error("El animal es requerido");
    }
    if (this.litrosLeche < 0) {
      throw new Error("Los litros no pueden ser negativos");
    }
    if (this.pesoKg < 0) {
      throw new Error("El peso no puede ser negativo");
    }
    if (this.litrosLeche === 0 && this.pesoKg === 0) {
      throw new Error("Debe registrar al menos litros o peso");
    }
  }

  public toJSON() {
    return {
      id: this.id,
      animalId: this.animalId,
      fecha: this.fecha.toISOString(),
      litrosLeche: this.litrosLeche,
      pesoKg: this.pesoKg,
      animalNombre: this.animalNombre,
    };
  }
}
