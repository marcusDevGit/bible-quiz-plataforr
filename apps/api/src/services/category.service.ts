import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../error/app-error";
import { CategoryInput } from "@bible-quiz/shared-validation";

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async list() {
    return categoryRepository.listAll();
  }

  async create(data: CategoryInput) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new AppError("Já existe uma categoria com este nome.", 400);
    }
    return categoryRepository.create(data);
  }

  async update(id: string, data: CategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    const existingWithName = await categoryRepository.findByName(data.name);
    if (existingWithName && existingWithName.id !== id) {
      throw new AppError("Já existe outra categoria com este nome.", 400);
    }

    return categoryRepository.update(id, data);
  }

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError("Categoria não encontrada.", 404);
    }
    return categoryRepository.delete(id);
  }
}
