import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../error/app-error";
import { logger } from "../observability/logger";

interface BodyParserError extends Error {
  status?: number;
  type?: string;
}

const PRISMA_ERROR_MAP: Record<string, { statusCode: number; message: string }> = {
  P2002: {
    statusCode: 409,
    message: "Registro duplicado: valor único já existente",
  },
  P2025: {
    statusCode: 404,
    message: "Registro não encontrado",
  },
  P1001: {
    statusCode: 503,
    message: "Serviço temporariamente indisponível",
  },
  P1002: {
    statusCode: 503,
    message: "Serviço temporariamente indisponível",
  },
};

function sendErrorResponse(
  res: Response,
  statusCode: number,
  message: string,
  requestId?: string,
) {
  return res.status(statusCode).json({
    status: "error",
    message,
    ...(requestId ? { requestId } : {}),
  });
}

/**
 * Middleware global para padronização de respostas de erro e registro em log estruturado.
 */
export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId = req.requestId;

  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "validation_error",
      ...(requestId ? { requestId } : {}),
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return sendErrorResponse(res, error.statusCode, error.message, requestId);
  }

  const bodyError =
    typeof error === "object" && error !== null
      ? (error as BodyParserError)
      : undefined;
  if (
    bodyError?.type === "entity.parse.failed" ||
    (error instanceof SyntaxError && "body" in error)
  ) {
    return sendErrorResponse(
      res,
      400,
      "Corpo da requisição JSON inválido",
      requestId,
    );
  }

  if (bodyError?.type === "entity.too.large" || bodyError?.status === 413) {
    return sendErrorResponse(
      res,
      413,
      "Tamanho da requisição excede o limite permitido",
      requestId,
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[error.code];
    if (mapped) {
      logger.warn("prisma_known_error", {
        requestId,
        code: error.code,
        method: req.method,
        path: req.originalUrl || req.url,
      });
      return sendErrorResponse(res, mapped.statusCode, mapped.message, requestId);
    }
  }

  logger.error("unhandled_error", {
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    userId: req.user?.id,
    error,
  });

  return sendErrorResponse(res, 500, "Internal Server Error", requestId);
}
