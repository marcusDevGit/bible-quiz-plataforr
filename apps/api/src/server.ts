import { createServer } from "http";
import { app } from "./app";
import { initSocket } from "./socket";

const server = createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP e WebSockets rodando na porta ${PORT}`);
});
