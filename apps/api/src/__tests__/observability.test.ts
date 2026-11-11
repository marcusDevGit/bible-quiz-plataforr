import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../observability/logger";
import {
  requestContextMiddleware,
  resolveRequestId,
} from "../middlewares/request-context.middleware";
import { notFoundMiddleware } from "../middlewares/not-found.middleware";
import { errorMiddleware } from "../middlewares/error-middleware";
import { createHealthHandler } from "../routes/health.routes";
import { AppError } from "../error/app-error";

function createMockResponse() {
  const emitter = new EventEmitter();
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown = undefined;

  const res = {
    get statusCode() {
      return statusCode;
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      body = payload;
      return res;
    },
    on(event: string, listener: (...args: unknown[]) => void) {
      emitter.on(event, listener);
      return res;
    },
    emitFinish() {
      emitter.emit("finish");
    },
  } as unknown as Response & { emitFinish: () => void };

  return {
    res,
    getStatus: () => statusCode,
    getBody: () => body,
    getHeader: (name: string) => headers[name.toLowerCase()],
  };
}

describe("Observability — Logger, Request Context, Health Check & Global Errors", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("logger deve emitir JSON estruturado e redigir campos sensíveis", () => {
    let logged = "";
    mock.method(console, "log", (msg: string) => {
      logged = msg;
    });

    logger.info("auth_attempt", {
      requestId: "req-123",
      password: "super-secret-password",
      token: "jwt-token-value",
      email: "user@example.com",
    });

    const parsed = JSON.parse(logged);
    assert.equal(parsed.level, "info");
    assert.equal(parsed.service, "bible-quiz-api");
    assert.equal(parsed.event, "auth_attempt");
    assert.equal(parsed.requestId, "req-123");
    assert.equal(parsed.password, "[REDACTED]");
    assert.equal(parsed.token, "[REDACTED]");
    assert.equal(parsed.email, "user@example.com");
  });

  it("resolveRequestId deve aceitar X-Request-Id válido e rejeitar valor malformado", () => {
    assert.equal(resolveRequestId("client-req_01"), "client-req_01");

    const generated = resolveRequestId("bad\nheader value");
    assert.match(generated, /^[0-9a-f-]{36}$/i);
  });

  it("requestContextMiddleware deve propagar X-Request-Id e registrar log ao finalizar", () => {
    let logged = "";
    mock.method(console, "log", (msg: string) => {
      logged = msg;
    });

    const req = {
      headers: { "x-request-id": "trace-abc-99" },
      method: "GET",
      originalUrl: "/health",
      url: "/health",
      user: { id: "user-1" },
    } as unknown as Request;
    const { res, getHeader } = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    requestContextMiddleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(req.requestId, "trace-abc-99");
    assert.equal(getHeader("x-request-id"), "trace-abc-99");

    res.status(200);
    res.emitFinish();

    const parsed = JSON.parse(logged);
    assert.equal(parsed.event, "http_request");
    assert.equal(parsed.requestId, "trace-abc-99");
    assert.equal(parsed.method, "GET");
    assert.equal(parsed.path, "/health");
    assert.equal(parsed.statusCode, 200);
    assert.equal(parsed.userId, "user-1");
    assert.equal(typeof parsed.durationMs, "number");
  });

  it("healthCheck deve retornar 200 com status ok quando banco responder", async () => {
    const handler = createHealthHandler(async () => ({ latencyMs: 4.2 }));
    const req = { requestId: "req-health-1" } as Request;
    const { res, getStatus, getBody } = createMockResponse();

    await handler(req, res);

    assert.equal(getStatus(), 200);
    const body = getBody() as Record<string, unknown>;
    assert.equal(body.status, "ok");
    assert.deepEqual(body.database, { status: "up", latencyMs: 4.2 });
  });

  it("healthCheck deve retornar 503 degraded sem vazar detalhes quando banco falhar", async () => {
    mock.method(console, "error", () => {});
    const handler = createHealthHandler(async () => {
      throw new Error("postgresql://user:secret@host/db unreachable");
    });
    const req = { requestId: "req-health-2" } as Request;
    const { res, getStatus, getBody } = createMockResponse();

    await handler(req, res);

    assert.equal(getStatus(), 503);
    const body = getBody() as Record<string, unknown>;
    assert.equal(body.status, "degraded");
    assert.deepEqual(body.database, { status: "down" });
    assert.equal(JSON.stringify(body).includes("secret"), false);
  });

  it("notFoundMiddleware deve retornar 404 em JSON padronizado com requestId", () => {
    const req = { requestId: "req-404" } as Request;
    const { res, getStatus, getBody } = createMockResponse();

    notFoundMiddleware(req, res);

    assert.equal(getStatus(), 404);
    assert.deepEqual(getBody(), {
      status: "error",
      message: "Rota não encontrada",
      requestId: "req-404",
    });
  });

  it("errorMiddleware deve padronizar ZodError, AppError, SyntaxError, Prisma P2002 e erro 500", () => {
    mock.method(console, "warn", () => {});
    mock.method(console, "error", () => {});
    const noopNext = (() => {}) as NextFunction;
    const baseReq = {
      requestId: "req-err-1",
      method: "POST",
      originalUrl: "/questions",
      url: "/questions",
    } as Request;

    // 1) ZodError
    const schemaResult = z.object({ name: z.string().min(3) }).safeParse({ name: "a" });
    assert.equal(schemaResult.success, false);
    const zodMock = createMockResponse();
    errorMiddleware(schemaResult.error as ZodError, baseReq, zodMock.res, noopNext);
    assert.equal(zodMock.getStatus(), 400);
    assert.equal((zodMock.getBody() as { status: string }).status, "validation_error");

    // 2) AppError
    const appMock = createMockResponse();
    errorMiddleware(new AppError("Não autorizado", 401), baseReq, appMock.res, noopNext);
    assert.equal(appMock.getStatus(), 401);
    assert.deepEqual(appMock.getBody(), {
      status: "error",
      message: "Não autorizado",
      requestId: "req-err-1",
    });

    // 3) JSON inválido (body-parser SyntaxError)
    const syntaxErr = Object.assign(new SyntaxError("Unexpected token"), {
      body: "{bad json",
    });
    const syntaxMock = createMockResponse();
    errorMiddleware(syntaxErr, baseReq, syntaxMock.res, noopNext);
    assert.equal(syntaxMock.getStatus(), 400);

    // 4) Prisma P2002 -> 409
    const prismaDup = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.14.0" },
    );
    const prismaMock = createMockResponse();
    errorMiddleware(prismaDup, baseReq, prismaMock.res, noopNext);
    assert.equal(prismaMock.getStatus(), 409);

    // 5) Erro inesperado -> 500 sem vazar mensagem interna
    const internalMock = createMockResponse();
    errorMiddleware(
      new Error("Crash interno com segredo"),
      baseReq,
      internalMock.res,
      noopNext,
    );
    assert.equal(internalMock.getStatus(), 500);
    assert.deepEqual(internalMock.getBody(), {
      status: "error",
      message: "Internal Server Error",
      requestId: "req-err-1",
    });
  });
});

