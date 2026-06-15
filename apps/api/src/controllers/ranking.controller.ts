import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { log } from "console";

export class RankingController {
  async getGlobalRanking(req: Request, res: Response) {
    try {
      const topRankings = await prisma.ranking.findMany({
        take: 50,
        orderBy: {
          points: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });

      const formatterdRanking = topRankings.map((rank, index) => ({
        position: index + 1,
        id: rank.userId,
        name: rank.user.name,
        avatar: rank.user.avatar,
        points: rank.points,
      }));
      return res.json({ ranking: formatterdRanking });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Erro ao buscar ranking" });
    }
  }
}
