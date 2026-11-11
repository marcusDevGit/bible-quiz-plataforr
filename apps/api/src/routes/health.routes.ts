import { Request, Response, Router } from "express";
import { prisma } from "../prisma/client";
import { logger } from "../observability/logger";

export type DatabaseHealthChecker = () => Promise<{ latencyMs: number }>;

async function defaultDatabaseHealthCheck(): Promise<{ latencyMs: number }> {
  const startedAt = process.hrtime.bigint();
  await prisma.$queryRaw`SELECT 1`;
  const latencyMs = Number(
    (Number(process.hrtime.bigint() - startedAt) / 1_000_000).toFixed(2),
  );
  return { latencyMs };
}

/**
 * Handler de health check que valida o servidor HTTP e a conexão com o PostgreSQL.
 */
export function createHealthHandler(
  checkDatabase: DatabaseHealthChecker = defaultDatabaseHealthCheck,
) {
  return async function healthCheck(req: Request, res: Response) {
    const timestamp = new Date().toISOString();
    const uptimeSeconds = Math.floor(process.uptime());
    const environment = process.env.NODE_ENV || "development";

    try {
      const { latencyMs } = await checkDatabase();
      return res.status(200).json({
        status: "ok",
        timestamp,
        uptimeSeconds,
        environment,
        database: {
          status: "up",
          latencyMs,
        },
      });
    } catch (error) {
      logger.error("health_check_failed", {
        requestId: req.requestId,
        reason: error instanceof Error ? error.message : "Database check failed",
      });

      return res.status(503).json({
        status: "degraded",
        timestamp,
        uptimeSeconds,
        environment,
        database: {
          status: "down",
        },
      });
    }
  };
}

const healthRouter = Router();
healthRouter.get("/health", createHealthHandler());

export { healthRouter };

