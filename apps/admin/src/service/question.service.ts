import { apiFetch } from "./api";
import type { Category } from "./categories.service";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Alternative {
  id: string;
  description: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  categoryId: string;
  reference: string;
  explanation: string;
  xpReward: number;
  difficultyScore: number;
  tags: string[];
  timesPlayed: number;
  correctRate: number;
  averageAnswerTime: number;
  createdAt: string;
  updatedAt: string;

  category: Category;
  alternatives: Alternative[];
}
export interface PaginatedQuestions {
  data: Question[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getQuestions(
  page = 1,
  limit = 10,
): Promise<PaginatedQuestions> {
  return apiFetch<PaginatedQuestions>(`/questions?page=${page}&limit=${limit}`);
}

export interface AlternativeInput {
  description: string;
  isCorrect: boolean;
}
export interface QuestionInput {
  title: string;
  difficulty: Difficulty;
  categoryId: string;
  reference: string;
  explanation: string;
  xpReward: number;
  difficultyScore: number;
  tags: string[];
  alternatives: AlternativeInput[];
}

export async function createQuestion(data: QuestionInput): Promise<Question> {
  return apiFetch<Question>("/questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(
  id: string,
  data: QuestionInput,
): Promise<Question> {
  const response = await apiFetch<{ message: string; question: Question }>(
    `/questions/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
  return response.question;
}

export async function deleteQuestion(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/questions/${id}`, {
    method: "DELETE",
  });
}
