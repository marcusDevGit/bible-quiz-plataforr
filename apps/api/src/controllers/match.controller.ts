import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class MatchController {
  async submitMatch(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { score } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      if (score === undefined || typeof score !== "number") {
        return res.status(400).json({ message: "Pontuação inválida" });
      }

      const xpGained = score * 15;

      const result = await prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            playerOne: userId,
            score: xpGained,
            winner: userId,
          },
        });
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
        return { match, userRanking };
      });
      return res.status(201).json({
        message: "Resultado registrado com sucesso!",
        xpGained,
        totalPoints: result.userRanking.points,
      });
    } catch (error: any) {
      console.error("Erro ao registrar partida:", error);
      return res
        .status(500)
        .json({ message: "Erro interno ao registrar partida" });
    }
  }
}
