import {
  QuestionRepository,
  QuestionFilters,
} from "../repositories/question.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../error/app-error";
import { QuestionInput } from "@bible-quiz/shared-validation";

const questionRepository = new QuestionRepository();
const categoryRepository = new CategoryRepository();

export interface CheckAnswerResult {
  questionId: string;
  isCorrect: boolean;
  correctAlternativeId: string | null;
  correctAlternative: string | null;
  explanation: string | null;
  reference: string | null;
}

export function sanitizeQuestionForPlayer<
  T extends {
    explanation?: string;
    reference?: string;
    alternatives: Array<{
      id: string;
      questionId: string;
      description: string;
      isCorrect: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
  },
>(question: T) {
  const {
    explanation: _explanation,
    reference: _reference,
    ...questionWithoutAnswerKey
  } = question;

  return {
    ...questionWithoutAnswerKey,
    alternatives: question.alternatives.map(
      ({ isCorrect: _isCorrect, ...alt }) => alt,
    ),
  };
}

export function evaluateQuestionAnswer(
  question: {
    id: string;
    explanation?: string | null;
    reference?: string | null;
    alternatives: Array<{
      id: string;
      description: string;
      isCorrect: boolean;
    }>;
  },
  alternativeId?: string | null,
): CheckAnswerResult {
  const correctAlt = question.alternatives.find((alt) => alt.isCorrect);
  const chosen = alternativeId
    ? question.alternatives.find((alt) => alt.id === alternativeId)
    : undefined;
  const isCorrect = Boolean(chosen?.isCorrect);

  return {
    questionId: question.id,
    isCorrect,
    correctAlternativeId: correctAlt?.id ?? null,
    correctAlternative: correctAlt?.description ?? null,
    explanation: question.explanation ?? null,
    reference: question.reference ?? null,
  };
}

export class QuestionService {
  async list(filters: QuestionFilters, isAdmin = false) {
    const rawData = await questionRepository.list(filters);
    const total = await questionRepository.count(filters);
    const data = isAdmin ? rawData : rawData.map(sanitizeQuestionForPlayer);

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

  async getById(id: string, isAdmin = false) {
    const question = await questionRepository.findById(id);
    if (!question) {
      throw new AppError("Pergunta não encontrada.", 404);
    }
    return isAdmin ? question : sanitizeQuestionForPlayer(question);
  }

  async checkAnswer(
    questionId: string,
    alternativeId?: string | null,
  ): Promise<CheckAnswerResult> {
    const question = await questionRepository.findById(questionId);
    if (!question) {
      throw new AppError("Pergunta não encontrada.", 404);
    }

    return evaluateQuestionAnswer(question, alternativeId);
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
