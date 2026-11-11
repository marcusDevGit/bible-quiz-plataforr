import { AchievementsRepository } from "../repositories/achievements.repository";
import { prisma } from "../prisma/client";
import { Prisma, Rarity } from "@prisma/client";

const achievementsRepository = new AchievementsRepository();

const ACHIEVEMENTS_CATALOG: Array<{
  code: string;
  name: string;
  description: string;
  rarity: Rarity;
  xpReward: number;
  icon: string;
}> = [
  {
    code: "FIRST_STEP",
    name: "Primeiro Passo",
    description: "Responder 10 perguntas.",
    rarity: "COMMON",
    xpReward: 50,
    icon: "first-step",
  },
  {
    code: "FIRST_MATCH",
    name: "Estreia na Jornada",
    description: "Concluir sua primeira partida de quiz.",
    rarity: "COMMON",
    xpReward: 50,
    icon: "first-match",
  },
  {
    code: "DEDICATED_STUDENT",
    name: "Estudante Dedicado",
    description: "Responder um total de 50 perguntas bíblicas.",
    rarity: "COMMON",
    xpReward: 100,
    icon: "dedicated-student",
  },
  {
    code: "BIBLE_SCHOLAR",
    name: "Estudioso das Escrituras",
    description: "Responder um total de 100 perguntas bíblicas.",
    rarity: "UNCOMMON",
    xpReward: 200,
    icon: "bible-scholar",
  },
  {
    code: "VETERAN_PLAYER",
    name: "Veterano da Palavra",
    description: "Concluir 25 partidas na plataforma.",
    rarity: "UNCOMMON",
    xpReward: 250,
    icon: "veteran-player",
  },
  {
    code: "PERFECT_SCORE",
    name: "Perfeição Bíblica",
    description: "Obter 100% de acerto em uma partida completa.",
    rarity: "RARE",
    xpReward: 300,
    icon: "perfect-score",
  },
  {
    code: "CENTURION_FAITH",
    name: "Centurião da Fé",
    description: "Acertar 100 perguntas bíblicas no total.",
    rarity: "RARE",
    xpReward: 350,
    icon: "centurion-faith",
  },
  {
    code: "THOUSAND_STEPS",
    name: "Peregrino Fiel",
    description: "Responder um total de 250 perguntas bíblicas.",
    rarity: "EPIC",
    xpReward: 600,
    icon: "thousand-steps",
  },
  {
    code: "GRAND_THEOLOGIAN",
    name: "Mestre Teólogo",
    description: "Acertar 500 perguntas bíblicas no total.",
    rarity: "MYTHIC",
    xpReward: 1500,
    icon: "grand-theologian",
  },
  {
    code: "STREAK_3",
    name: "Chama Inicial",
    description: "Manter uma ofensiva diária de pelo menos 3 dias seguidos.",
    rarity: "COMMON",
    xpReward: 75,
    icon: "streak-3",
  },
  {
    code: "STREAK_7",
    name: "Semana Abençoada",
    description: "Manter uma ofensiva diária de pelo menos 7 dias seguidos.",
    rarity: "UNCOMMON",
    xpReward: 150,
    icon: "streak-7",
  },
  {
    code: "STREAK_14",
    name: "Quinzena Fiel",
    description: "Manter uma ofensiva diária de pelo menos 14 dias seguidos.",
    rarity: "RARE",
    xpReward: 300,
    icon: "streak-14",
  },
  {
    code: "STREAK_30",
    name: "Sequência de 30 Dias",
    description: "Mantenha um streak diário maior ou igual a 30 dias.",
    rarity: "RARE",
    xpReward: 500,
    icon: "streak-30",
  },
  {
    code: "STREAK_60",
    name: "Guardião do Templo",
    description: "Manter uma ofensiva diária de pelo menos 60 dias seguidos.",
    rarity: "EPIC",
    xpReward: 800,
    icon: "streak-60",
  },
  {
    code: "STREAK_100",
    name: "Coluna Inabalável",
    description: "Manter uma ofensiva histórica de 100 dias seguidos.",
    rarity: "MYTHIC",
    xpReward: 2000,
    icon: "streak-100",
  },
  {
    code: "ARENA_DEBUT",
    name: "Guerreiro de Davi",
    description: "Disputar sua primeira batalha multiplayer 1v1 na Arena.",
    rarity: "COMMON",
    xpReward: 100,
    icon: "arena-debut",
  },
  {
    code: "XP_HUNTER",
    name: "Acumulador de Talentos",
    description: "Alcançar 1.000 XP acumulados no Ranking Geral.",
    rarity: "UNCOMMON",
    xpReward: 200,
    icon: "xp-hunter",
  },
  {
    code: "ARENA_CHAMPION",
    name: "Campeão da Arena",
    description: "Conquistar 10 vitórias registradas no Ranking.",
    rarity: "RARE",
    xpReward: 400,
    icon: "arena-champion",
  },
  {
    code: "XP_MASTER",
    name: "Príncipe da Aliança",
    description: "Alcançar 5.000 XP acumulados no Ranking Geral.",
    rarity: "EPIC",
    xpReward: 750,
    icon: "xp-master",
  },
  {
    code: "ARENA_LEGEND",
    name: "Lenda de Israel",
    description: "Conquistar 50 vitórias registradas no Ranking.",
    rarity: "LEGENDARY",
    xpReward: 1000,
    icon: "arena-legend",
  },
  {
    code: "LAW_OF_MOSES",
    name: "Guardião da Torá",
    description: "Acertar 15 perguntas sobre o Pentateuco e Patriarcas.",
    rarity: "UNCOMMON",
    xpReward: 250,
    icon: "law-of-moses",
  },
  {
    code: "APOSTLE_PAUL",
    name: "Missionário aos Gentios",
    description:
      "Acertar 15 perguntas sobre Atos dos Apóstolos e Cartas Paulinas.",
    rarity: "RARE",
    xpReward: 350,
    icon: "apostle-paul",
  },
  {
    code: "KINGS_AND_JUDGES",
    name: "Cronista de Israel",
    description: "Acertar 15 perguntas sobre Juízes e Reis de Israel.",
    rarity: "RARE",
    xpReward: 350,
    icon: "kings-and-judges",
  },
  {
    code: "REVELATION_SEER",
    name: "Vidente de Patmos",
    description: "Acertar 10 perguntas sobre o Apocalipse e Milagres.",
    rarity: "EPIC",
    xpReward: 650,
    icon: "revelation-seer",
  },
  {
    code: "WISDOM_OF_SOLOMON",
    name: "Sabedoria de Salomão",
    description: "Domine os livros sapienciais.",
    rarity: "EPIC",
    xpReward: 750,
    icon: "wisdom-of-solomon",
  },
  {
    code: "MASTER_GOSPELS",
    name: "Mestre dos Evangelhos",
    description: "Obtenha domínio completo dos quatro Evangelhos.",
    rarity: "LEGENDARY",
    xpReward: 1000,
    icon: "master-gospels",
  },
  {
    code: "PROPHET_OF_NATIONS",
    name: "Profeta das Nações",
    description: "Complete os profetas com pelo menos 90% de aproveitamento.",
    rarity: "LEGENDARY",
    xpReward: 1000,
    icon: "prophet-of-nations",
  },
];

export class AchievementsService {
  private static catalogSynced = false;

  async ensureCatalogSeeded() {
    if (AchievementsService.catalogSynced) return;
    try {
      const currentCount = await prisma.achievement.count();
      if (currentCount < ACHIEVEMENTS_CATALOG.length) {
        for (const ach of ACHIEVEMENTS_CATALOG) {
          await prisma.achievement.upsert({
            where: { code: ach.code },
            update: {
              name: ach.name,
              description: ach.description,
              rarity: ach.rarity,
              xpReward: ach.xpReward,
              icon: ach.icon,
            },
            create: {
              code: ach.code,
              name: ach.name,
              description: ach.description,
              rarity: ach.rarity,
              xpReward: ach.xpReward,
              icon: ach.icon,
            },
          });
        }
      }
      AchievementsService.catalogSynced = true;
    } catch (error) {
      console.error("Erro ao sincronizar catálogo de conquistas:", error);
    }
  }

  async getAchievementsList(userId: string) {
    await this.ensureCatalogSeeded();
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
      await this.ensureCatalogSeeded();
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
