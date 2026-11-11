import { apiFetch } from "@/services/api";

export interface QuestionResponse {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categoryId: string;
  category?: {
    id: string;
    name: string;
    icon: string;
  };
  reference?: string | null;
  explanation?: string | null;
  alternatives: { id: string; description: string; isCorrect?: boolean }[];
}

export interface CheckQuestionAnswerResponse {
  questionId: string;
  isCorrect: boolean;
  correctAlternativeId: string | null;
  correctAlternative: string | null;
  explanation: string | null;
  reference: string | null;
}

interface PaginatedQuestions {
  data: QuestionResponse[];
  meta: any;
}

// Representa a resposta de uma única questão durante a partida
export interface MatchAnswer {
  questionId: string;
  isCorrect: boolean;
  questionTitle?: string;
  reference?: string;
  explanation?: string;
  selectedAlternative?: string;
  correctAlternative?: string;
}

export const quizService = {
  async fetchRandomQuestions(
    limit: number = 10,
    categoryId?: string,
  ): Promise<QuestionResponse[]> {
    const query = categoryId
      ? `/questions?limit=50&categoryId=${encodeURIComponent(categoryId)}`
      : "/questions?limit=50";
    const response = await apiFetch<PaginatedQuestions>(query);

    const allQuestions = response.data || [];
    const filteredQuestions = categoryId
      ? allQuestions.filter((q) => q.categoryId === categoryId)
      : allQuestions;
    const pool = filteredQuestions.length > 0 ? filteredQuestions : allQuestions;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, limit);
  },

  async checkQuestionAnswer(
    questionId: string,
    alternativeId?: string | null,
  ): Promise<CheckQuestionAnswerResponse> {
    return apiFetch<CheckQuestionAnswerResponse>(
      `/questions/${encodeURIComponent(questionId)}/check`,
      {
        method: "POST",
        body: JSON.stringify({ alternativeId: alternativeId ?? null }),
      },
    );
  },

  async submitMatch(
    score: number,
    answers: MatchAnswer[],
  ): Promise<{ message: string; xpGained: number; totalPoints: number }> {
    return apiFetch<{ message: string; xpGained: number; totalPoints: number }>(
      "/match",
      {
        method: "POST",
        body: JSON.stringify({ score, answers }),
      },
    );
  },
};
