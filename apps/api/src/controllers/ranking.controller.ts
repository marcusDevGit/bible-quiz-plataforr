import { Request, Response } from "express";
import { prisma } from "../prisma/client";

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

  async getWeeklyRanking(req: Request, res: Response) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const topRankings = await prisma.match.groupBy({
        by: ["playerOne"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          score: true,
        },
        orderBy: {
          _sum: {
            score: "desc",
          },
        },
        take: 50,
      });

      const userIds = topRankings.map((r) => r.playerOne);

      const users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      const formattedRanking = topRankings
        .map((rank, index) => {
          const user = userMap.get(rank.playerOne);
          if (!user) return null;
          return {
            position: index + 1,
            id: rank.playerOne,
            name: user.name,
            avatar: user.avatar,
            points: rank._sum.score || 0,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      return res.json({ ranking: formattedRanking });
    } catch (error) {
      console.error("Erro ao obter ranking semanal:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar ranking semanal" });
    }
  }

  async getMonthlyRanking(req: Request, res: Response) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const topRankings = await prisma.match.groupBy({
        by: ["playerOne"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          score: true,
        },
        orderBy: {
          _sum: {
            score: "desc",
          },
        },
        take: 50,
      });

      const userIds = topRankings.map((r) => r.playerOne);

      const users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      const formattedRanking = topRankings
        .map((rank, index) => {
          const user = userMap.get(rank.playerOne);
          if (!user) return null;
          return {
            position: index + 1,
            id: rank.playerOne,
            name: user.name,
            avatar: user.avatar,
            points: rank._sum.score || 0,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      return res.json({ ranking: formattedRanking });
    } catch (error) {
      console.error("Erro ao obter ranking mensal:", error);
      return res.status(500).json({ message: "Erro ao buscar ranking mensal" });
    }
  }
}
