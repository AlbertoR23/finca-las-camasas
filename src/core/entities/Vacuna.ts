export interface VacunaProps {
  id?: string;
  animalId: string;
  nombreVacuna: string;
  fechaAplicacion: Date;
  proximaDosis?: Date | null;
  animalNombre?: string; // Para relaciones
}

export class Vacuna {
  public readonly id?: string;
  public readonly animalId: string;
  public readonly nombreVacuna: string;
  public readonly fechaAplicacion: Date;
  public readonly proximaDosis?: Date | null;
  public readonly animalNombre?: string;

  constructor(props: VacunaProps) {
    this.id = props.id;
    this.animalId = props.animalId;
    this.nombreVacuna = props.nombreVacuna;
    this.fechaAplicacion = props.fechaAplicacion;
    this.proximaDosis = props.proximaDosis;
    this.animalNombre = props.animalNombre;

    this.validate();
  }

  private validate(): void {
    if (!this.animalId) {
      throw new Error("El animal es requerido");
    }
    if (!this.nombreVacuna || this.nombreVacuna.length < 2) {
      throw new Error("El nombre de la vacuna es requerido");
    }
    if (!this.fechaAplicacion) {
      throw new Error("La fecha de aplicación es requerida");
    }
  }

  public estaVencida(): boolean {
    if (!this.proximaDosis) return false;
    const hoy = new Date();
    return this.proximaDosis < hoy;
  }

  public diasParaVencimiento(): number | null {
    if (!this.proximaDosis) return null;
    const hoy = new Date();
    const diff = this.proximaDosis.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public toJSON() {
    return {
      id: this.id,
      animalId: this.animalId,
      nombreVacuna: this.nombreVacuna,
      fechaAplicacion: this.fechaAplicacion.toISOString(),
      proximaDosis: this.proximaDosis?.toISOString(),
      animalNombre: this.animalNombre,
      estaVencida: this.estaVencida(),
      diasParaVencimiento: this.diasParaVencimiento(),
    };
  }
}
