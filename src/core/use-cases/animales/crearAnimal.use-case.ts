// src/core/use-cases/animales/crearAnimal.use-case.ts
import { Animal } from "../../entities/Animal";
import { IAnimalRepository } from "../../repositories/IAnimalRepository";

interface CrearAnimalRequest {
  nombre: string;
  numeroArete: string;
  fechaNacimiento: Date;
  sexo: "Macho" | "Hembra";
  padreId?: string | null;
  madreId?: string | null;
}

interface CrearAnimalResponse {
  animal: Animal;
  fechaDestete: Date;
}

export class CrearAnimalUseCase {
  constructor(private animalRepository: IAnimalRepository) {}

  async execute(request: CrearAnimalRequest): Promise<CrearAnimalResponse> {
    // Validaciones de negocio
    if (request.sexo === "Macho") {
      // Regla de negocio: Los machos no necesitan genealogía completa
      // pero podemos validar algo específico
    }

    // Crear la entidad (las validaciones de dominio ocurren en el constructor)
    const animal = new Animal(request);

    // Guardar en el repositorio
    const animalGuardado = await this.animalRepository.crear(animal);

    // Calcular fecha de destete (lógica de negocio pura)
    const fechaDestete = animalGuardado.calcularFechaDestete();

    return {
      animal: animalGuardado,
      fechaDestete,
    };
  }
}
