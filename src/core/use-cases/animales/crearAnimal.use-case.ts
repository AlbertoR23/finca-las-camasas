import { Animal } from "../../entities/Animal";
import { IAnimalRepository } from "../../repositories/IAnimalRepository";

export class CrearAnimalUseCase {
  constructor(private animalRepository: IAnimalRepository) {}

  async execute(request: any) {
    // 1. Validaciones básicas de negocio
    if (!request.nombre || !request.numeroArete) {
      throw new Error("Datos incompletos");
    }

    // 2. Llamada al repositorio (Nombre unificado)
    const animalGuardado = await this.animalRepository.create(request);

    // 3. Lógica de negocio (Cálculo de destete)
    const fechaDestete = animalGuardado.calcularFechaDestete();

    return {
      animal: animalGuardado,
      fechaDestete,
    };
  }
}
