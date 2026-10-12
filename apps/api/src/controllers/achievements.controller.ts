import { Request, Response } from "express";
import { AchievementsService } from "../services/achievements.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const achievementsService = new AchievementsService();

export class AchievementsController {
  async getAchievements(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const list = await achievementsService.getAchievementsList(userId);
      return res.status(200).json({ achievements: list });
    } catch (error: any) {
      console.error("Erro ao obter conquistas:", error);
      return res
        .status(500)
        .json({ message: "Erro interno ao obter conquistas" });
    }
  }
}
