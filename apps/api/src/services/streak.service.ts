import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export class StreakService {
  async updateUserStreak(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<{ currentStreak: number; bestStreak: number }> {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, bestStreak: true, lastActiveDate: true },
    });

    if (!user) return { currentStreak: 0, bestStreak: 0 };

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (!user.lastActiveDate) {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          currentStreak: 1,
          bestStreak: Math.max(1, user.bestStreak),
          lastActiveDate: now,
        },
        select: { currentStreak: true, bestStreak: true },
      });
      await this.checkStreakAchievements(userId, 1, tx);
      return updated;
    }

    const lastStr = user.lastActiveDate.toISOString().slice(0, 10);

    // Se já teve atividade registrada hoje, não altera
    if (todayStr === lastStr) {
      return { currentStreak: user.currentStreak, bestStreak: user.bestStreak };
    }

    const todayDate = new Date(todayStr);
    const lastDate = new Date(lastStr);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let newCurrentStreak = 1;
    if (diffDays === 1) {
      // Dia consecutivo direto
      newCurrentStreak = user.currentStreak + 1;
    } else {
      // Sequência quebrada (> 1 dia)
      newCurrentStreak = 1;
    }

    const newBestStreak = Math.max(newCurrentStreak, user.bestStreak);

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastActiveDate: now,
      },
      select: { currentStreak: true, bestStreak: true },
    });

    await this.checkStreakAchievements(userId, newCurrentStreak, tx);
    return updated;
  }

  private async checkStreakAchievements(
    userId: string,
    currentStreak: number,
    tx: Prisma.TransactionClient,
  ) {
    try {
      // 1. Conquista de 30 Dias (STREAK_30)
      const ach30 = await tx.achievement.findUnique({
        where: { code: "STREAK_30" },
      });

      if (ach30) {
        const existingUserAch = await tx.userAchievement.findUnique({
          where: {
            userId_achievementId: { userId, achievementId: ach30.id },
          },
        });

        if (existingUserAch && existingUserAch.progress >= 100) {
          return;
        }

        const progress30 = Math.min(
          Math.round((currentStreak / 30) * 100),
          100,
        );
        if (progress30 >= 100) {
          await tx.userAchievement.upsert({
            where: {
              userId_achievementId: { userId, achievementId: ach30.id },
            },
            update: { progress: 100, unlockedAt: new Date() },
            create: {
              userId,
              achievementId: ach30.id,
              progress: 100,
              unlockedAt: new Date(),
            },
          });

          await tx.ranking.upsert({
            where: { userId },
            update: { points: { increment: ach30.xpReward } },
            create: {
              userId,
              points: ach30.xpReward,
              wins: 0,
              losses: 0,
            },
          });
        } else {
          await tx.userAchievement.upsert({
            where: {
              userId_achievementId: { userId, achievementId: ach30.id },
            },
            update: { progress: progress30 },
            create: { userId, achievementId: ach30.id, progress: progress30 },
          });
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar conquista de streak:", err);
    }
  }
}
