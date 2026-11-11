import { apiFetch } from "./api";

export interface RecentMatchUser {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface RecentMatch {
  id: string;
  score: number;
  createdAt: string;
  user1?: RecentMatchUser | null;
  user2?: RecentMatchUser | null;
}

export interface AdminStatsResponse {
  totalQuestions: number;
  matchesToday: number;
  totalMatches: number;
  totalUsers: number;
  recentMatches: RecentMatch[];
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  currentStreak?: number;
  bestStreak?: number;
  createdAt: string;
  points?: number;
  wins?: number;
  matchesPlayed?: number;
  ranking?: {
    points: number;
    wins: number;
    losses: number;
  } | null;
  _count?: {
    matchesAsPlayerOne?: number;
    matchesAsPlayerTwo?: number;
  };
}

export interface RankingItem {
  position: number;
  id: string;
  name: string;
  avatar?: string | null;
  points: number;
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiFetch<AdminStatsResponse>("/users/admin-stats");
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
  const response = await apiFetch<AdminUserItem[] | { users: AdminUserItem[] }>(
    "/users",
  );
  if (Array.isArray(response)) {
    return response;
  }
  return response.users || [];
}

export async function getAdminRanking(
  period: "global" | "weekly" | "monthly",
): Promise<RankingItem[]> {
  const response = await apiFetch<{ ranking: RankingItem[] }>(
    `/ranking/${period}`,
  );
  return response.ranking || [];
}
