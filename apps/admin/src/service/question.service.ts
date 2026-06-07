// apps/admin/src/service/questions.service.ts

import { apiFetch } from "./api";
import type { Category } from "./categories.service";

// 1. Dificuldade (Enum espelhado do backend)
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// 2. Tipagem das Alternativas
export interface Alternative {
  id: string;
  description: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Tipagem principal da Pergunta
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

  // Estes são os relacionamentos que o Backend (Prisma) junta pra nós!
  category: Category;
  alternatives: Alternative[];
}

// 4. Tipagem da Paginação (envelope do backend)
export interface PaginatedQuestions {
  data: Question[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 5. O Serviço que conversa com a API (já aceitando paginação)
export async function getQuestions(
  page = 1,
  limit = 10,
): Promise<PaginatedQuestions> {
  return apiFetch<PaginatedQuestions>(`/questions?page=${page}&limit=${limit}`);
}

// --- MÉTODOS DE CRIAÇÃO (POST) ---
// 1. O Formato de Envio de uma Alternativa (Não precisa de ID nem Datas)
export interface AlternativeInput {
  description: string;
  isCorrect: boolean;
}

// 2. O Formato de Envio da Pergunta (O pacote completo que vai no Body)
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

// 3. A Função que faz a Mutação (POST)
export async function createQuestion(data: QuestionInput): Promise<Question> {
  return apiFetch<Question>("/questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
