import { apiFetch } from "@/services/api";

// Espelha o enum Rarity do backend (schema.prisma)
export type Rarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC";

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  rarity: Rarity;
  xpReward: number;
  iconName: string;
  // Presente quando o usuário desbloqueou a conquista
  unlockedAt?: string | null;
  // Presente quando a conquista tem progresso gradual
  progress?: number | null;
  goal?: number | null;
}

export interface AchievementsResponse {
  achievements: Achievement[];
}

export const achievementsService = {
  async getMyAchievements(): Promise<AchievementsResponse> {
    return apiFetch<AchievementsResponse>("/achievements");
  },
};
