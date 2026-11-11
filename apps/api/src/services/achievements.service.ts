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
      await this.checkProgressionAndArenaMilestones(
        userId,
        lastMatchScore,
        lastMatchTotal,
        tx,
      );
      await this.checkBiblicalCategoryMilestones(userId, tx);
    } catch (error) {
      console.error("❌ Erro ao validar conquistas pós-partida:", error);
    }
  }

  private async updateOrUnlockByCode(
    userId: string,
    code: string,
    rawProgress: number,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const achievement = await achievementsRepository.findByCode(code, tx);
    if (!achievement) return;

    const userAch = await achievementsRepository.findUserAchievement(
      userId,
      achievement.id,
      tx,
    );
    if (userAch && userAch.progress >= 100) return;

    const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));

    if (progress >= 100) {
      await achievementsRepository.unlock(userId, achievement.id, tx);

      await tx.ranking.upsert({
        where: { userId },
        update: { points: { increment: achievement.xpReward } },
        create: { userId, points: achievement.xpReward },
      });
    } else if (progress > (userAch?.progress ?? 0)) {
      await achievementsRepository.updateProgress(
        userId,
        achievement.id,
        progress,
        tx,
      );
    }
  }

  private async checkProgressionAndArenaMilestones(
    userId: string,
    lastMatchScore: number,
    lastMatchTotal: number,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const userMatchFilter: Prisma.MatchWhereInput = {
      OR: [{ playerOne: userId }, { playerTwo: userId }],
    };

    const [
      totalMatches,
      multiplayerMatches,
      totalQuestions,
      correctQuestions,
      userRecord,
      rankingRecord,
    ] = await Promise.all([
      tx.match.count({ where: userMatchFilter }),
      tx.match.count({
        where: {
          ...userMatchFilter,
          playerTwo: { not: null },
        },
      }),
      tx.matchQuestion.count({ where: { match: userMatchFilter } }),
      tx.matchQuestion.count({
        where: { match: userMatchFilter, isCorrect: true },
      }),
      tx.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, bestStreak: true },
      }),
      tx.ranking.findUnique({
        where: { userId },
        select: { points: true, wins: true },
      }),
    ]);

    // Marcos de Partidas e Perfeição
    await this.updateOrUnlockByCode(
      userId,
      "FIRST_MATCH",
      (totalMatches / 1) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "VETERAN_PLAYER",
      (totalMatches / 25) * 100,
      tx,
    );
    if (lastMatchTotal > 0 && lastMatchScore === lastMatchTotal) {
      await this.updateOrUnlockByCode(userId, "PERFECT_SCORE", 100, tx);
    }

    // Marcos de Perguntas Respondidas e Acertadas
    await this.updateOrUnlockByCode(
      userId,
      "DEDICATED_STUDENT",
      (totalQuestions / 50) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "BIBLE_SCHOLAR",
      (totalQuestions / 100) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "THOUSAND_STEPS",
      (totalQuestions / 250) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "CENTURION_FAITH",
      (correctQuestions / 100) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "GRAND_THEOLOGIAN",
      (correctQuestions / 500) * 100,
      tx,
    );

    // Marcos de Ofensiva Diária (Streaks)
    const maxStreak = Math.max(
      userRecord?.currentStreak ?? 0,
      userRecord?.bestStreak ?? 0,
    );
    await this.updateOrUnlockByCode(userId, "STREAK_3", (maxStreak / 3) * 100, tx);
    await this.updateOrUnlockByCode(userId, "STREAK_7", (maxStreak / 7) * 100, tx);
    await this.updateOrUnlockByCode(
      userId,
      "STREAK_14",
      (maxStreak / 14) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "STREAK_30",
      (maxStreak / 30) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "STREAK_60",
      (maxStreak / 60) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "STREAK_100",
      (maxStreak / 100) * 100,
      tx,
    );

    // Marcos de Arena Multiplayer & Ranking
    const totalPoints = rankingRecord?.points ?? 0;
    const totalWins = rankingRecord?.wins ?? 0;

    await this.updateOrUnlockByCode(
      userId,
      "ARENA_DEBUT",
      (multiplayerMatches / 1) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "ARENA_CHAMPION",
      (totalWins / 10) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "ARENA_LEGEND",
      (totalWins / 50) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "XP_HUNTER",
      (totalPoints / 1000) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "XP_MASTER",
      (totalPoints / 5000) * 100,
      tx,
    );
  }

  private async checkBiblicalCategoryMilestones(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const baseCorrectFilter: Prisma.MatchQuestionWhereInput = {
      match: {
        OR: [{ playerOne: userId }, { playerTwo: userId }],
      },
      isCorrect: true,
    };

    const [torahCorrect, paulCorrect, kingsCorrect, revelationCorrect] =
      await Promise.all([
        tx.matchQuestion.count({
          where: {
            ...baseCorrectFilter,
            question: {
              category: {
                name: {
                  in: ["Pentateuco", "Patriarcas", "Antigo Testamento"],
                },
              },
            },
          },
        }),
        tx.matchQuestion.count({
          where: {
            ...baseCorrectFilter,
            question: {
              category: {
                name: {
                  in: ["Atos dos Apóstolos", "Cartas Paulinas", "Apóstolos"],
                },
              },
            },
          },
        }),
        tx.matchQuestion.count({
          where: {
            ...baseCorrectFilter,
            question: {
              category: {
                name: {
                  in: ["Juízes", "Reis", "Personagens Bíblicos"],
                },
              },
            },
          },
        }),
        tx.matchQuestion.count({
          where: {
            ...baseCorrectFilter,
            question: {
              category: {
                name: {
                  in: ["Apocalipse", "Milagres"],
                },
              },
            },
          },
        }),
      ]);

    await this.updateOrUnlockByCode(
      userId,
      "LAW_OF_MOSES",
      (torahCorrect / 15) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "APOSTLE_PAUL",
      (paulCorrect / 15) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "KINGS_AND_JUDGES",
      (kingsCorrect / 15) * 100,
      tx,
    );
    await this.updateOrUnlockByCode(
      userId,
      "REVELATION_SEER",
      (revelationCorrect / 10) * 100,
      tx,
    );
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
