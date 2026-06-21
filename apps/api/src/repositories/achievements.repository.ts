import { prisma } from "../prisma/client";
import { Rarity, Prisma } from "@prisma/client";

export class AchievementsRepository {
  async listAllWithUserStatus(userId: string) {
    return prisma.achievement.findMany({
      include: {
        users: {
          where: { userId },
        },
      },
      orderBy: { rarity: "asc" },
    });
  }

  async findByCode(code: string, tx: Prisma.TransactionClient = prisma) {
    return tx.achievement.findUnique({
      where: { code },
    });
  }

  async findUserAchievement(
    userId: string,
    achievementId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId },
      },
    });
  }

  async unlock(
    userId: string,
    achievementId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId },
      },
      update: {
        progress: 100,
      },
      create: {
        userId,
        achievementId,
        progress: 100,
      },
    });
  }

  async updateProgress(
    userId: string,
    achievementId: string,
    progress: number,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId },
      },
      update: { progress },
      create: {
        userId,
        achievementId,
        progress,
      },
    });
  }
}
