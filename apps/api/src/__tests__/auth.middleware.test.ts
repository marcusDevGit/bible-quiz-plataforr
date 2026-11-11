import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import {
  authMiddleware,
  createRequireAdmin,
} from "../middlewares/auth.middleware";
import { JWT_SECRET } from "../config/env";
import { AppError } from "../error/app-error";

function createMockResponse() {
  let statusCode = 200;
  let body: unknown = undefined;

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      body = payload;
      return res;
    },
  } as unknown as Response;

  return {
    res,
    getStatus: () => statusCode,
    getBody: () => body,
  };
}

describe("authMiddleware & requireAdmin", () => {
  it("deve lançar AppError 401 quando o header Authorization não for enviado", () => {
    const req = { headers: {} } as Request;
    const { res } = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    assert.throws(
      () => authMiddleware(req, res, next),
      (err: unknown) => err instanceof AppError && err.statusCode === 401,
    );
    assert.equal(nextCalled, false);
  });

  it("deve lançar AppError 401 quando o token JWT for inválido", () => {
    const req = {
      headers: { authorization: "Bearer token_invalido_123" },
    } as Request;
    const { res } = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    assert.throws(
      () => authMiddleware(req, res, next),
      (err: unknown) => err instanceof AppError && err.statusCode === 401,
    );
    assert.equal(nextCalled, false);
  });

  it("deve popular req.user e chamar next() quando o JWT for válido", () => {
    const token = jwt.sign({ sub: "user-123", role: "ADMIN" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const { res } = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    authMiddleware(req, res, next);

    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, { id: "user-123", role: "ADMIN" });
    assert.equal((req as Request & { userId?: string }).userId, "user-123");
  });

  it("requireAdmin deve retornar 403 quando o usuário tiver role USER", async () => {
    const requireAdminForUser = createRequireAdmin(async () => ({
      role: "USER",
    }));

    const req = { user: { id: "user-1", role: "USER" } } as Request;
    const mockRes = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await requireAdminForUser(req, mockRes.res, next);

    assert.equal(nextCalled, false);
    assert.equal(mockRes.getStatus(), 403);
  });

  it("requireAdmin deve chamar next() quando o usuário tiver role ADMIN", async () => {
    const requireAdminForAdmin = createRequireAdmin(async () => ({
      role: "ADMIN",
    }));

    const req = { user: { id: "admin-1", role: "ADMIN" } } as Request;
    const mockRes = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await requireAdminForAdmin(req, mockRes.res, next);

    assert.equal(nextCalled, true);
    assert.equal(req.user?.role, "ADMIN");
  });
});
