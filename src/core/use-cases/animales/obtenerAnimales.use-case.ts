import { IAnimalRepository } from "../../repositories/IAnimalRepository";
import { Animal } from "../../entities/Animal";

export class ObtenerAnimalesUseCase {
  constructor(private animalRepository: IAnimalRepository) {}

  async execute(): Promise<Animal[]> {
    return await this.animalRepository.findAll();
  }
}

export class ObtenerAnimalPorIdUseCase {
  constructor(private animalRepository: IAnimalRepository) {}

  async execute(id: string): Promise<Animal | null> {
    return await this.animalRepository.findById(id);
  }
}

export class BuscarAnimalesUseCase {
  constructor(private animalRepository: IAnimalRepository) {}

  async execute(termino: string): Promise<Animal[]> {
    return await this.animalRepository.findBySearchTerm(termino);
  }
}
