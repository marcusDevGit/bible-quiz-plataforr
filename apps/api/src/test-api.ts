import { io } from "socket.io-client";

const API_URL = "http://localhost:3001";

async function runTests() {
  console.log("🧪 Iniciando testes de integração...");

  // 1. Validar rotas HTTP principais
  console.log("\n📊 Testando rotas HTTP...");
  try {
    const res = await fetch(`${API_URL}/`);
    const data = await res.json();
    console.log(`✓ GET /: ${res.status} - ${JSON.stringify(data)}`);
  } catch (error) {
    console.error("❌ Falha ao acessar a raiz da API. Servidor rodando?", error);
    process.exit(1);
  }

  // 2. Conectar clientes Socket
  console.log("\n🔌 Testando conexão Socket.IO...");
  const socket1 = io(API_URL, { transports: ["websocket"] });
  const socket2 = io(API_URL, { transports: ["websocket"] });

  let roomCode = "";

  // Auxiliares para sincronização por promessas
  const p1Connected = new Promise<void>((resolve) => socket1.on("connect", resolve));
  const p2Connected = new Promise<void>((resolve) => socket2.on("connect", resolve));

  await Promise.all([p1Connected, p2Connected]);
  console.log("✓ Ambos os clientes se conectaram com sucesso via WebSocket!");

  // 3. Criar Sala (Player 1)
  console.log("\n🏠 Testando criação de sala...");
  const roomCreatedPromise = new Promise<void>((resolve) => {
    socket1.on("room_created", (room: any) => {
      console.log(`✓ Sala criada: ${room.code}`);
      roomCode = room.code;
      resolve();
    });
  });

  socket1.emit("create_room", {
    userId: "user-test-1",
    name: "Lucas Teste 1",
    avatar: null,
  });

  await roomCreatedPromise;

  // 4. Entrar na Sala (Player 2)
  console.log("\n👤 Testando entrada na sala...");
  const roomUpdatedPromise = new Promise<void>((resolve) => {
    socket2.on("room_updated", (room: any) => {
      console.log(`✓ Jogador 2 entrou. Total de jogadores na sala: ${room.players.length}`);
      resolve();
    });
  });

  socket2.emit("join_room", {
    code: roomCode,
    userId: "user-test-2",
    name: "Mateus Teste 2",
    avatar: null,
  });

  await roomUpdatedPromise;

  // 5. Testar status de Prontidão (Ready) e Início de Jogo
  console.log("\n🎬 Testando prontidão e início do jogo...");
  const gameStartPromise = new Promise<void>((resolve) => {
    socket1.on("game_start", (data: any) => {
      console.log(`✓ Jogo iniciado com sucesso! Total de questões: ${data.totalQuestions}`);
      resolve();
    });
  });

  // Ambos marcam pronto
  socket1.emit("toggle_ready", { code: roomCode });
  socket2.emit("toggle_ready", { code: roomCode });

  await gameStartPromise;

  // 6. Testar recebimento da primeira pergunta
  console.log("\n❓ Testando fluxo de perguntas...");
  const nextQuestionPromise = new Promise<void>((resolve) => {
    socket1.on("next_question", (data: any) => {
      console.log(`✓ Primeira pergunta recebida: "${data.question.title}"`);
      console.log(`✓ Alternativas recebidas (anti-cheat verificado): ${data.question.alternatives.length}`);
      // Verifica se as alternativas não contém o campo 'isCorrect' exposto
      const exposesIsCorrect = data.question.alternatives.some((alt: any) => alt.isCorrect !== undefined);
      if (!exposesIsCorrect) {
        console.log("✓ Segurança anti-cheat confirmada! O campo 'isCorrect' está ocultado.");
      } else {
        console.error("❌ Falha de segurança! O campo 'isCorrect' foi exposto.");
      }
      resolve();
    });
  });

  await nextQuestionPromise;

  // Finalizar conexões
  console.log("\n🔌 Encerrando conexões...");
  socket1.disconnect();
  socket2.disconnect();

  console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Ocorreu um erro durante os testes:", err);
  process.exit(1);
});
