import { Vacuna, VacunaProps } from "../../entities/Vacuna";
import { IVacunaRepository } from "../../repositories/IVacunaRepository";

interface RegistrarVacunaRequest {
  animalId: string;
  nombreVacuna: string;
  fechaAplicacion: Date;
  proximaDosis?: Date | null;
}

export class RegistrarVacunaUseCase {
  constructor(private vacunaRepository: IVacunaRepository) {}

  async execute(request: RegistrarVacunaRequest): Promise<Vacuna> {
    // Validar que la fecha próxima sea posterior a la aplicación
    if (
      request.proximaDosis &&
      request.proximaDosis <= request.fechaAplicacion
    ) {
      throw new Error(
        "La próxima dosis debe ser posterior a la fecha de aplicación",
      );
    }

    const vacuna = new Vacuna(request);
    return await this.vacunaRepository.create(vacuna);
  }
}
