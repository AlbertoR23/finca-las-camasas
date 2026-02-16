import { Animal } from "../../entities/Animal";

export class CalcularDesteteUseCase {
  execute(animal: Animal): Date {
    return animal.calcularFechaDestete();
  }
}

export class CalcularDesteteMasivoUseCase {
  execute(animales: Animal[]): Map<string, Date> {
    const resultados = new Map();
    animales.forEach((animal) => {
      resultados.set(animal.id!, animal.calcularFechaDestete());
    });
    return resultados;
  }
}
