import { AchievementsRepository } from "../repositories/achievements.repository";
import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

const achievementsRepository = new AchievementsRepository();

export class AchievementsService {
  async getAchievementsList(userId: string) {
    const list = await achievementsRepository.listAllWithUserStatus(userId);
    return list.map((ach) => {
      const userStatus = ach.users[0];
      return {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        rarity: ach.rarity,
        xpReward: ach.xpReward,
        icon: ach.icon,
        progress: userStatus ? userStatus.progress : 0,
        unlocked: !!userStatus && userStatus.progress >= 100,
        unlockedAt: userStatus ? userStatus.unlockedAt : null,
      };
    });
  }

  async checkMatchAchievements(
    userId: string,
    lastMatchScore: number,
    lastMatchTotal: number,
    tx: Prisma.TransactionClient = prisma,
  ) {
    try {
      await this.checkFirstStep(userId, tx);
      await this.checkMasterGospels(userId, lastMatchScore, lastMatchTotal, tx);
      await this.checkWisdomOfSolomon(userId, tx);
      await this.checkProphetOfNations(userId, tx);
    } catch (error) {
      console.error("❌ Erro ao validar conquistas pós-partida:", error);
    }
  }

  private async checkFirstStep(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const code = "FIRST_STEP";
    const achievement = await achievementsRepository.findByCode(code, tx);
    if (!achievement) return;

    const userAch = await achievementsRepository.findUserAchievement(
      userId,
      achievement.id,
      tx,
    );
    if (userAch && userAch.progress >= 100) return;

    const totalQuestions = await tx.matchQuestion.count({
      where: {
        match: {
          OR: [{ playerOne: userId }, { playerTwo: userId }],
        },
      },
    });

    const progress = Math.min(100, Math.round((totalQuestions / 10) * 100));

    if (progress >= 100) {
      await achievementsRepository.unlock(userId, achievement.id, tx);

      await tx.ranking.update({
        where: { userId },
        data: { points: { increment: achievement.xpReward } },
      });
    } else {
      await achievementsRepository.updateProgress(
        userId,
        achievement.id,
        progress,
        tx,
      );
    }
  }

  private async checkMasterGospels(
    userId: string,
    score: number,
    total: number,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const code = "MASTER_GOSPELS";

    const achievement = await achievementsRepository.findByCode(code, tx);
    if (!achievement) return;

    const userAch = await achievementsRepository.findUserAchievement(
      userId,
      achievement.id,
      tx,
    );
    if (userAch && userAch.progress >= 100) return;

    const isPerfectMatch = score === total && total > 0;
    if (!isPerfectMatch) return;

    const correctQuestions = await tx.matchQuestion.findMany({
      where: {
        match: {
          OR: [{ playerOne: userId }, { playerTwo: userId }],
        },
        isCorrect: true,
      },
      include: { question: true },
    });

    const hasMateus = correctQuestions.some((mq) =>
      mq.question.reference.startsWith("Mateus"),
    );
    const hasMarcos = correctQuestions.some((mq) =>
      mq.question.reference.startsWith("Marcos"),
    );
    const hasLucas = correctQuestions.some((mq) =>
      mq.question.reference.startsWith("Lucas"),
    );
    const hasJoao = correctQuestions.some(
      (mq) =>
        mq.question.reference.startsWith("João") ||
        mq.question.reference.startsWith("Joao"),
    );

    if (hasMateus && hasMarcos && hasLucas && hasJoao) {
      await achievementsRepository.unlock(userId, achievement.id, tx);

      await tx.ranking.update({
        where: { userId },
        data: { points: { increment: achievement.xpReward } },
      });
    }
  }

  private async checkWisdomOfSolomon(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const code = "WISDOM_OF_SOLOMON";
    const achievement = await achievementsRepository.findByCode(code, tx);
    if (!achievement) return;
    const userAch = await achievementsRepository.findUserAchievement(
      userId,
      achievement.id,
      tx,
    );
    if (userAch && userAch.progress >= 100) return;
    const countSapienciais = await tx.matchQuestion.count({
      where: {
        match: {
          OR: [{ playerOne: userId }, { playerTwo: userId }],
        },
        isCorrect: true,
        question: {
          category: {
            name: {
              in: [
                "Provérbios",
                "Eclesiastes",
                "Sabedoria",
                "Cântico dos Cânticos",
                "Cânticos",
              ],
            },
          },
        },
      },
    });
    const progress = Math.min(Math.round((countSapienciais / 100) * 100), 100);
    if (progress >= 100) {
      await achievementsRepository.unlock(userId, achievement.id, tx);

      await tx.ranking.update({
        where: { userId },
        data: { points: { increment: achievement.xpReward } },
      });
    } else {
      await achievementsRepository.updateProgress(
        userId,
        achievement.id,
        progress,
        tx,
      );
    }
  }

  private async checkProphetOfNations(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const code = "PROPHET_OF_NATIONS";
    const achievement = await achievementsRepository.findByCode(code, tx);
    if (!achievement) return;

    const userAch = await achievementsRepository.findUserAchievement(
      userId,
      achievement.id,
      tx,
    );
    if (userAch && userAch.progress >= 100) return;

    const prophetFilter: Prisma.MatchQuestionWhereInput = {
      match: {
        OR: [{ playerOne: userId }, { playerTwo: userId }],
      },
      question: {
        category: {
          name: {
            in: ["Profetas", "Daniel", "Isaías", "Jeremias", "Ezequiel"],
          },
        },
      },
    };

    const [totalProphetQuestions, correctProphetQuestions] = await Promise.all([
      tx.matchQuestion.count({ where: prophetFilter }),
      tx.matchQuestion.count({ where: { ...prophetFilter, isCorrect: true } }),
    ]);

    if (totalProphetQuestions === 0) return;

    const accuracy = correctProphetQuestions / totalProphetQuestions;
    const targetQuestions = 10;
    const progress =
      totalProphetQuestions >= targetQuestions && accuracy >= 0.9
        ? 100
        : Math.min(
            99,
            Math.round(
              Math.min(totalProphetQuestions / targetQuestions, 1) *
                Math.min(accuracy / 0.9, 1) *
                100,
            ),
          );

    if (progress >= 100) {
      await achievementsRepository.unlock(userId, achievement.id, tx);

      await tx.ranking.update({
        where: { userId },
        data: { points: { increment: achievement.xpReward } },
      });
    } else {
      await achievementsRepository.updateProgress(
        userId,
        achievement.id,
        progress,
        tx,
      );
    }
  }
}
