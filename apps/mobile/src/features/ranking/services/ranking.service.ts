import { apiFetch } from "@/services/api";

export interface RankingPlayer {
  position: number;
  id: string;
  name: string;
  avatar: string;
  points: number;
}

export const rankingService = {
  async getGlobalRanking(): Promise<RankingPlayer[]> {
    const response = await apiFetch<{ ranking: RankingPlayer[] }>(
      "/ranking/global",
    );
    return response.ranking;
  },
};
