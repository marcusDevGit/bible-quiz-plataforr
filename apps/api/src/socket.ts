import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerMultiplayerHandlers } from "./sockets/multiplayer.handler";
import { JWT_SECRET } from "./config/env";
import { logger } from "./observability/logger";

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const rawToken = socket.handshake.auth?.token;
    if (rawToken && typeof rawToken === "string") {
      try {
        const cleanToken = rawToken.replace(/^Bearer\s+/i, "");
        const decoded = jwt.verify(cleanToken, JWT_SECRET) as {
          sub?: string;
          id?: string;
        };
        socket.data.userId = decoded.id || decoded.sub;
      } catch {
        logger.warn("socket_invalid_token", { socketId: socket.id });
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    logger.info("socket_connected", {
      socketId: socket.id,
      userId: socket.data.userId,
    });

    // Registra os handlers de eventos do multiplayer
    registerMultiplayerHandlers(io!, socket);

    socket.on("disconnect", (reason) => {
      logger.info("socket_disconnected", {
        socketId: socket.id,
        userId: socket.data.userId,
        reason,
      });
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO não foi inicializado!");
  }
  return io;
}
