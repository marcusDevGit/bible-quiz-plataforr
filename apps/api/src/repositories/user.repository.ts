import { prisma } from "../prisma/client";
import { RegisterInput } from "@bible-quiz/shared-validation";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        currentStreak: true,
        bestStreak: true,
        lastActiveDate: true,
        createdAt: true,
      },
    });
  }

  async create(data: RegisterInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });
      await tx.ranking.create({
        data: {
          userId: user.id,
          points: 0,
          wins: 0,
          losses: 0,
        },
      });
      return user;
    });
  }

  async update(
    id: string,
    data: { name?: string; password?: string; avatar?: string },
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
