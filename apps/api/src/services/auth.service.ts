import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../error/app-error";
import { LoginInput, RegisterInput } from "@bible-quiz/shared-validation";
import { StreakService } from "./streak.service";
import { prisma } from "../prisma/client";

const userRepository = new UserRepository();
const streakService = new StreakService();
const JWT_SECRET = process.env.JWT_SECRET || "secret_Bible_DeveLop_amb";

export class AuthService {
  async register(data: RegisterInput) {
    const userExists = await userRepository.findByEmail(data.email);
    if (userExists) {
      throw new AppError("Este e-mail já está sendo utilizado.", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const streak = await streakService.updateUserStreak(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const userMatchWhere = {
      OR: [{ playerOne: userId }, { playerTwo: userId }],
    };

    const [
      recentMatchesRaw,
      totalMatches,
      ranking,
      totalAnswered,
      correctAnswers,
    ] = await Promise.all([
      prisma.match.findMany({
        where: userMatchWhere,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          p1: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          p2: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          matchQuestions: {
            select: {
              isCorrect: true,
            },
          },
        },
      }),
      prisma.match.count({ where: userMatchWhere }),
      prisma.ranking.findUnique({
        where: { userId },
        select: { points: true, wins: true, losses: true },
      }),
      prisma.matchQuestion.count({
        where: { match: userMatchWhere },
      }),
      prisma.matchQuestion.count({
        where: { match: userMatchWhere, isCorrect: true },
      }),
    ]);

    const recentMatches = recentMatchesRaw.map((m) => ({
      id: m.id,
      score: m.score,
      correctAnswers: m.matchQuestions.filter((mq) => mq.isCorrect).length,
      winner: m.winner,
      playerOne: m.playerOne,
      playerTwo: m.playerTwo,
      createdAt: m.createdAt,
      user1: m.p1,
      user2: m.p2,
      _count: {
        questions: m.matchQuestions.length,
        matchQuestions: m.matchQuestions.length,
      },
    }));

    const accuracy =
      totalAnswered > 0
        ? Math.round((correctAnswers / totalAnswered) * 100)
        : 0;

    const stats = {
      totalMatches,
      wins: ranking?.wins ?? 0,
      losses: ranking?.losses ?? 0,
      points: ranking?.points ?? 0,
      totalAnswered,
      correctAnswers,
      accuracy,
    };

    return {
      ...user,
      recentMatches,
      stats,
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; password?: string; avatar?: string },
  ) {
    const updateData: { name?: string; password?: string; avatar?: string } =
      {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }
    if (data.password !== undefined && data.password !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return userRepository.update(userId, updateData);
  }

  async getAdminStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalQuestions, matchesToday, totalMatches, totalUsers, recentMatchesRaw] =
      await Promise.all([
        prisma.question.count(),
        prisma.match.count({
          where: {
            createdAt: {
              gte: startOfToday,
            },
          },
        }),
        prisma.match.count(),
        prisma.user.count(),
        prisma.match.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            p1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            p2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        }),
      ]);

    const recentMatches = recentMatchesRaw.map((match) => ({
      id: match.id,
      score: match.score,
      winner: match.winner,
      createdAt: match.createdAt,
      user1: match.p1,
      user2: match.p2,
    }));

    return {
      totalQuestions,
      matchesToday,
      totalMatches,
      totalUsers,
      recentMatches,
    };
  }

  async listUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        currentStreak: true,
        bestStreak: true,
        createdAt: true,
        ranking: {
          select: {
            points: true,
            wins: true,
            losses: true,
          },
        },
        _count: {
          select: {
            matchesAsPlayer1: true,
            matchesAsPlayer2: true,
          },
        },
      },
    });

    return users.map((u) => {
      const totalMatches = u._count.matchesAsPlayer1 + u._count.matchesAsPlayer2;
      const points = u.ranking?.points ?? 0;
      const wins = u.ranking?.wins ?? 0;
      const losses = u.ranking?.losses ?? 0;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        currentStreak: u.currentStreak,
        bestStreak: u.bestStreak,
        createdAt: u.createdAt,
        points,
        wins,
        losses,
        totalMatches,
        matchesCount: totalMatches,
        matchesPlayed: totalMatches,
        ranking: {
          points,
          wins,
          losses,
        },
      };
    });
  }
}
