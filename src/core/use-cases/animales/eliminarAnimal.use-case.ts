import { IAnimalRepository } from "../../repositories/IAnimalRepository";

export class EliminarAnimalUseCase {
  constructor(private animalRepository: IAnimalRepository) {}

  async execute(id: string): Promise<void> {
    // Validaciones de negocio antes de eliminar
    // Por ejemplo: verificar que no tenga registros asociados

    await this.animalRepository.delete(id);
  }
}
