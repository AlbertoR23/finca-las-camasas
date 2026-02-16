// src/core/repositories/IAnimalRepository.ts
import { Animal } from "../entities/Animal";

export interface IAnimalRepository {
  findAll(): Promise<Animal[]>;
  findById(id: string): Promise<Animal | null>;
  findBySearchTerm(term: string): Promise<Animal[]>;
  create(animal: Animal): Promise<Animal>;
  update(id: string, animal: Partial<Animal>): Promise<Animal>;
  delete(id: string): Promise<void>;
}
