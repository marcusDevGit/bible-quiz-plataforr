import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AchievementsService } from "../services/achievements.service";
import { StreakService } from "../services/streak.service";

const achievementsService = new AchievementsService();
const streakService = new StreakService();

const submitMatchSchema = z.object({
  score: z
    .number({
      required_error: "Pontuação inválida",
      invalid_type_error: "Pontuação inválida",
    })
    .min(0, "Pontuação inválida"),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "ID da pergunta inválido"),
        isCorrect: z.boolean(),
      }),
    )
    .optional(),
});

export class MatchController {
  async submitMatch(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const parsed = submitMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        return res.status(400).json({
          message: firstIssue?.message || "Dados da partida inválidos",
          errors: parsed.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      const { score, answers } = parsed.data;
      const xpGained = score * 15;

      const result = await prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            playerOne: userId,
            score: xpGained,
            winner: userId,
          },
        });

        if (answers && answers.length > 0) {
          await tx.matchQuestion.createMany({
            data: answers.map((ans) => ({
              matchId: match.id,
              questionId: ans.questionId,
              isCorrect: ans.isCorrect,
            })),
          });
        }

        const userRanking = await tx.ranking.upsert({
          where: { userId },
          update: {
            points: { increment: xpGained },
            wins: { increment: 1 },
          },
          create: {
            userId,
            points: xpGained,
            wins: 1,
            losses: 0,
          },
        });

        const totalQuestions = answers ? answers.length : 10;
        await achievementsService.checkMatchAchievements(
          userId,
          score,
          totalQuestions,
          tx,
        );
        const streakResult = await streakService.updateUserStreak(userId, tx);

        return { match, userRanking, streakResult };
      });
      return res.status(201).json({
        message: "Resultado registrado com sucesso!",
        xpGained,
        totalPoints: result.userRanking.points,
        currentStreak: result.streakResult.currentStreak,
        bestStreak: result.streakResult.bestStreak,
      });
    } catch (error: any) {
      console.error("Erro ao registrar partida:", error);
      return res
        .status(500)
        .json({ message: "Erro interno ao registrar partida" });
    }
  }
}
