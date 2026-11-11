import { describe, it, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import {
  QuestionService,
  evaluateQuestionAnswer,
  sanitizeQuestionForPlayer,
} from "../services/question.service";
import { QuestionRepository } from "../repositories/question.repository";
import { MatchController } from "../controllers/match.controller";
import { AchievementsService } from "../services/achievements.service";
import { prisma } from "../prisma/client";
import { AppError } from "../error/app-error";

const sampleQuestion = {
  id: "q-1",
  title: "Quem construiu a arca?",
  difficulty: "EASY" as const,
  categoryId: "cat-1",
  reference: "Gênesis 6:14",
  explanation: "Deus instruiu Noé a construir uma arca.",
  xpReward: 20,
  difficultyScore: 10,
  tags: ["noe", "arca"],
  timesPlayed: 0,
  correctRate: 0,
  averageAnswerTime: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: {
    id: "cat-1",
    name: "Patriarcas",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  alternatives: [
    {
      id: "alt-1",
      questionId: "q-1",
      description: "Moisés",
      isCorrect: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "alt-2",
      questionId: "q-1",
      description: "Noé",
      isCorrect: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

describe("Verificação de Questões, Sanitização e Integridade de Score", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("sanitizeQuestionForPlayer deve remover isCorrect, explanation e reference", () => {
    const sanitized = sanitizeQuestionForPlayer(sampleQuestion);

    assert.equal("explanation" in sanitized, false);
    assert.equal("reference" in sanitized, false);
    assert.equal(sanitized.alternatives.length, 2);
    assert.equal("isCorrect" in sanitized.alternatives[0], false);
    assert.equal("isCorrect" in sanitized.alternatives[1], false);
    assert.equal(sanitized.alternatives[1].description, "Noé");
  });

  it("evaluateQuestionAnswer deve validar alternativa correta, errada e pulo/timeout (null)", () => {
    const correctResult = evaluateQuestionAnswer(sampleQuestion, "alt-2");
    assert.equal(correctResult.isCorrect, true);
    assert.equal(correctResult.correctAlternativeId, "alt-2");
    assert.equal(correctResult.correctAlternative, "Noé");
    assert.equal(correctResult.reference, "Gênesis 6:14");
    assert.equal(
      correctResult.explanation,
      "Deus instruiu Noé a construir uma arca.",
    );

    const wrongResult = evaluateQuestionAnswer(sampleQuestion, "alt-1");
    assert.equal(wrongResult.isCorrect, false);
    assert.equal(wrongResult.correctAlternativeId, "alt-2");

    const timeoutResult = evaluateQuestionAnswer(sampleQuestion, null);
    assert.equal(timeoutResult.isCorrect, false);
    assert.equal(timeoutResult.correctAlternativeId, "alt-2");
  });

  it("QuestionService.checkAnswer deve retornar 404 quando a questão não existir", async () => {
    mock.method(QuestionRepository.prototype, "findById", async () => null);
    const service = new QuestionService();

    await assert.rejects(
      () => service.checkAnswer("id-inexistente", "alt-1"),
      (err: unknown) => err instanceof AppError && err.statusCode === 404,
    );
  });

  it("QuestionService.checkAnswer deve verificar a alternativa usando o repositório", async () => {
    mock.method(
      QuestionRepository.prototype,
      "findById",
      async () => sampleQuestion,
    );
    const service = new QuestionService();

    const result = await service.checkAnswer("q-1", "alt-2");
    assert.equal(result.questionId, "q-1");
    assert.equal(result.isCorrect, true);
    assert.equal(result.correctAlternativeId, "alt-2");
  });

  it("MatchController.submitMatch deve limitar score ao total real de acertos em answers", async () => {
    let recordedScore = -1;

    mock.method(
      AchievementsService.prototype,
      "ensureCatalogSeeded",
      async () => {},
    );

    mock.method(prisma, "$transaction", async (cb: (tx: unknown) => unknown) => {
      const fakeTx = {
        match: {
          create: async ({ data }: { data: { score: number } }) => {
            recordedScore = data.score;
            return { id: "match-1", ...data };
          },
          count: async () => 1,
        },
        matchQuestion: {
          createMany: async () => ({ count: 2 }),
          count: async () => 2,
          findMany: async () => [],
        },
        question: {
          findMany: async () => [],
        },
        ranking: {
          upsert: async () => ({ points: recordedScore, wins: 1, losses: 0 }),
          findUnique: async () => ({ points: recordedScore, wins: 1 }),
          update: async () => ({ points: recordedScore, wins: 1 }),
        },
        user: {
          findUnique: async () => ({
            currentStreak: 1,
            bestStreak: 1,
            lastActiveDate: new Date(),
          }),
          update: async () => ({
            currentStreak: 1,
            bestStreak: 1,
          }),
        },
        achievement: {
          count: async () => 27,
          findUnique: async () => null,
        },
        userAchievement: {
          findUnique: async () => null,
          upsert: async () => ({ progress: 0 }),
        },
      };
      return cb(fakeTx);
    });

    const controller = new MatchController();
    let statusCode = 0;
    let jsonBody: Record<string, unknown> = {};

    const req = {
      userId: "user-1",
      body: {
        score: 10, // Cliente enviou score inflado, mas answers tem apenas 1 acerto
        answers: [
          { questionId: "q-1", isCorrect: true },
          { questionId: "q-2", isCorrect: false },
        ],
      },
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      json(payload: Record<string, unknown>) {
        jsonBody = payload;
        return res;
      },
    } as unknown as Response;

    await controller.submitMatch(req, res);

    assert.equal(statusCode, 201);
    assert.equal(recordedScore, 15);
    assert.equal(jsonBody.xpGained, 15);
  });
});
