import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

// Cria o cliente Socket.IO singleton. autoConnect é falso por padrão
// para só iniciar conexão quando o usuário acessar a Arena de jogo.
export const socket: Socket = io(API_BASE_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log( ` 🟢 [Socket.IO] Conectado ao servidor! ID: ${socket.id}`)
});

socket.on("disconnect", (reason) => {
  console.log(`🔴 [Socket.IO] Desconectado: ${reason}`);
});
socket.on("connect_error", (error) => {
  console.warn(`⚠️ [Socket.IO] Erro de conexão: ${error.message}`);
});
