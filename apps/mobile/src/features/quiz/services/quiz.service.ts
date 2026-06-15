import { apiFetch } from "@/services/api";

export interface QuestionResponse {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categoryId: string;
  reference: string;
  explanation: string;
  alternatives: { id?: string; description: string; isCorrect: boolean }[];
}

interface PaginatedQuestions {
  data: QuestionResponse[];
  meta: any;
}

export const quizService = {
  async fetchRandomQuestions(limit: number = 10): Promise<QuestionResponse[]> {
    const response = await apiFetch<PaginatedQuestions>("/questions?limit=50");

    const allQuestions = response.data || [];

    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, limit);
  },
};
