import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.127:3001";

// Cria o cliente Socket.IO singleton. autoConnect é falso por padrão
// para só iniciar conexão quando o usuário acessar a Arena de jogo.
export const socket: Socket = io(API_BASE_URL, {
  autoConnect: false,
  transports: ["websocket"], // Garante conexões rápidas por websockets puros
});
