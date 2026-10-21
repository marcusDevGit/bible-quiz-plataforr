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
  name: string;
  title?: string;
  description: string;
  rarity: Rarity;
  xpReward: number;
  icon?: string;
  iconName?: string;
  unlocked?: boolean;
  unlockedAt?: string | null;
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
