import { prisma } from "../prisma/client";
import { QuestionInput } from "@bible-quiz/shared-validation";

export interface QuestionFilters {
  categoryId?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  search?: string;
  page?: number;
  limit?: number;
}

export class QuestionRepository {
  async list(filters: QuestionFilters = {}) {
    const { categoryId, difficulty, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    return prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        alternatives: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async count(filters: QuestionFilters = {}) {
    const { categoryId, difficulty, search } = filters;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    return prisma.question.count({ where });
  }

  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
        alternatives: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async create(data: QuestionInput) {
    return prisma.question.create({
      data: {
        title: data.title,
        difficulty: data.difficulty,
        categoryId: data.categoryId,
        reference: data.reference,
        explanation: data.explanation,
        xpReward: data.xpReward,
        difficultyScore: data.difficultyScore,
        tags: data.tags,
        alternatives: {
          create: data.alternatives.map((alt) => ({
            description: alt.description,
            isCorrect: alt.isCorrect,
          })),
        },
      },
      include: {
        alternatives: true,
        category: true,
      },
    });
  }

  async update(id: string, data: QuestionInput) {
    return prisma.$transaction(async (tx) => {
      await tx.alternative.deleteMany({
        where: { questionId: id },
      });
      return tx.question.update({
        where: { id },
        data: {
          title: data.title,
          difficulty: data.difficulty,
          categoryId: data.categoryId,
          reference: data.reference,
          explanation: data.explanation,
          xpReward: data.xpReward,
          difficultyScore: data.difficultyScore,
          tags: data.tags,
          alternatives: {
            create: data.alternatives.map((alt) => ({
              description: alt.description,
              isCorrect: alt.isCorrect,
            })),
          },
        },
        include: {
          alternatives: true,
          category: true,
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }
}
