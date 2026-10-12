import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { registerMultiplayerHandlers } from "./sockets/multiplayer.handler";

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
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
