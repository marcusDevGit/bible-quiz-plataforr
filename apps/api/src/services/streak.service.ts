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
      const initialBest = Math.max(1, user.bestStreak);
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          currentStreak: 1,
          bestStreak: initialBest,
          lastActiveDate: now,
        },
        select: { currentStreak: true, bestStreak: true },
      });
      await this.checkStreakAchievements(userId, Math.max(1, initialBest), tx);
      return updated;
    }

    const lastStr = user.lastActiveDate.toISOString().slice(0, 10);

    // Se já teve atividade registrada hoje, não altera
    if (todayStr === lastStr) {
      await this.checkStreakAchievements(
        userId,
        Math.max(user.currentStreak, user.bestStreak),
        tx,
      );
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

    await this.checkStreakAchievements(
      userId,
      Math.max(newCurrentStreak, newBestStreak),
      tx,
    );
    return updated;
  }

  private async checkStreakAchievements(
    userId: string,
    effectiveStreak: number,
    tx: Prisma.TransactionClient,
  ) {
    const milestones = [
      { code: "STREAK_3", target: 3 },
      { code: "STREAK_7", target: 7 },
      { code: "STREAK_14", target: 14 },
      { code: "STREAK_30", target: 30 },
      { code: "STREAK_60", target: 60 },
      { code: "STREAK_100", target: 100 },
    ];

    try {
      for (const milestone of milestones) {
        const ach = await tx.achievement.findUnique({
          where: { code: milestone.code },
        });

        if (!ach) continue;

        const existingUserAch = await tx.userAchievement.findUnique({
          where: {
            userId_achievementId: { userId, achievementId: ach.id },
          },
        });

        if (existingUserAch && existingUserAch.progress >= 100) {
          continue;
        }

        const progress = Math.min(
          Math.round((effectiveStreak / milestone.target) * 100),
          100,
        );

        if (progress >= 100) {
          await tx.userAchievement.upsert({
            where: {
              userId_achievementId: { userId, achievementId: ach.id },
            },
            update: { progress: 100, unlockedAt: new Date() },
            create: {
              userId,
              achievementId: ach.id,
              progress: 100,
              unlockedAt: new Date(),
            },
          });

          await tx.ranking.upsert({
            where: { userId },
            update: { points: { increment: ach.xpReward } },
            create: {
              userId,
              points: ach.xpReward,
              wins: 0,
              losses: 0,
            },
          });
        } else {
          await tx.userAchievement.upsert({
            where: {
              userId_achievementId: { userId, achievementId: ach.id },
            },
            update: { progress },
            create: { userId, achievementId: ach.id, progress },
          });
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar conquista de streak:", err);
    }
  }
}
