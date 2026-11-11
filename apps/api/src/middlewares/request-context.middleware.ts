import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../observability/logger";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9._-]{1,128}$/;

/**
 * Extrai um X-Request-Id seguro do header ou gera um novo UUID v4.
 */
export function resolveRequestId(headerValue: string | string[] | undefined): string {
  const candidate = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (candidate && SAFE_REQUEST_ID_REGEX.test(candidate.trim())) {
    return candidate.trim();
  }
  return randomUUID();
}

/**
 * Gera/propaga X-Request-Id e registra logs estruturados ao fim da requisição HTTP.
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = resolveRequestId(req.headers["x-request-id"]);
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(
      (Number(process.hrtime.bigint() - startedAt) / 1_000_000).toFixed(2),
    );
    const statusCode = res.statusCode;

    const payload = {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      userId: req.user?.id,
    };

    if (statusCode >= 500) {
      logger.error("http_request", payload);
    } else if (statusCode >= 400) {
      logger.warn("http_request", payload);
    } else {
      logger.info("http_request", payload);
    }
  });

  next();
}

