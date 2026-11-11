import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerMultiplayerHandlers } from "./sockets/multiplayer.handler";

const JWT_SECRET = process.env.JWT_SECRET || "secret_Bible_DeveLop_amb";

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
      } catch (err) {
        console.warn(`⚠️ Token JWT inválido no socket (${socket.id})`);
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Jogador conectado: ${socket.id}`);

    // Registra os handlers de eventos do multiplayer
    registerMultiplayerHandlers(io!, socket);

    socket.on("disconnect", () => {
      console.log(`🔌 Jogador desconectado: ${socket.id}`);
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
