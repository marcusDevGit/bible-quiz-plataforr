import { createServer } from "http";
import { app } from "./app";
import { initSocket } from "./socket";
import { prisma } from "./prisma/client";
import { logger } from "./observability/logger";

const server = createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info("server_started", {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info("server_shutdown_started", { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error("server_shutdown_timeout", { signal });
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(async (closeError) => {
    if (closeError) {
      logger.error("server_close_error", { error: closeError });
    }

    try {
      await prisma.$disconnect();
      logger.info("server_shutdown_completed", { signal });
      process.exit(closeError ? 1 : 0);
    } catch (dbError) {
      logger.error("prisma_disconnect_error", { error: dbError });
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", { error: reason });
});

process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", { error });
  void shutdown("uncaughtException");
});
