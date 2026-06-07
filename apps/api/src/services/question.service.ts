import {
  QuestionRepository,
  QuestionFilters,
} from "../repositories/question.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../error/app-error";
import { QuestionInput } from "@bible-quiz/shared-validation";

const questionRepository = new QuestionRepository();
const categoryRepository = new CategoryRepository();

export class QuestionService {
  async list(filters: QuestionFilters) {
    const data = await questionRepository.list(filters);
    const total = await questionRepository.count(filters);

    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getById(id: string) {
    const question = await questionRepository.findById(id);
    if (!question) {
      throw new AppError("Pergunta não encontrada.", 404);
    }
    return question;
  }

  async create(data: QuestionInput) {
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Categoria associada não encontrada.", 400);
    }
    return questionRepository.create(data);
  }

  async update(id: string, data: QuestionInput) {
    const question = await questionRepository.findById(id);
    if (!question) {
      throw new AppError("Pergunta não encontrada.", 404);
    }

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Categoria associada não encontrada.", 400);
    }

    return questionRepository.update(id, data);
  }

  async delete(id: string) {
    const question = await questionRepository.findById(id);
    if (!question) {
      throw new AppError("Pergunta não encontrada.", 404);
    }
    return questionRepository.delete(id);
  }
}
