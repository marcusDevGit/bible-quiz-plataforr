import { Request, Response } from "express";
import { prisma } from "../prisma/client";

async function getRankingByPeriod(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [p1Scores, p2Scores] = await Promise.all([
    prisma.match.groupBy({
      by: ["playerOne"],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        score: true,
      },
    }),
    prisma.match.groupBy({
      by: ["playerTwo"],
      where: {
        createdAt: {
          gte: startDate,
        },
        playerTwo: {
          not: null,
        },
      },
      _sum: {
        score: true,
      },
    }),
  ]);

  const pointsByUser = new Map<string, number>();

  for (const row of p1Scores) {
    pointsByUser.set(
      row.playerOne,
      (pointsByUser.get(row.playerOne) || 0) + (row._sum.score || 0),
    );
  }

  for (const row of p2Scores) {
    if (!row.playerTwo) continue;
    pointsByUser.set(
      row.playerTwo,
      (pointsByUser.get(row.playerTwo) || 0) + (row._sum.score || 0),
    );
  }

  const topEntries = Array.from(pointsByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  const userIds = topEntries.map(([userId]) => userId);

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

  return topEntries
    .map(([userId, points], index) => {
      const user = userMap.get(userId);
      if (!user) return null;
      return {
        position: index + 1,
        id: userId,
        name: user.name,
        avatar: user.avatar,
        points,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

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
      const formattedRanking = await getRankingByPeriod(7);
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
      const formattedRanking = await getRankingByPeriod(30);
      return res.json({ ranking: formattedRanking });
    } catch (error) {
      console.error("Erro ao obter ranking mensal:", error);
      return res.status(500).json({ message: "Erro ao buscar ranking mensal" });
    }
  }
}
