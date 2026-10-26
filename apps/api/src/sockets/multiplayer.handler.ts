import { Server, Socket } from "socket.io";
import { prisma } from "../prisma/client";

interface Player {
  socketId: string;
  userId: string;
  name: string;
  avatar: string | null;
  level?: number;
  ready: boolean;
  score: number;
  answers: { questionId: string; isCorrect: boolean }[];
}

interface Room {
  code: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  questions: any[];
  currentIndex: number;
  answerCount: number;
  theme?: string;
}

interface QueuePlayer {
  socketId: string;
  userId: string;
  name: string;
  avatar: string | null;
  level: number;
  joinedAt: number;
}

// Em memória - gerenciamento das salas de jogo
const rooms = new Map<string, Room>();
const quickMatchQueue: QueuePlayer[] = [];
const roomTimeouts = new Map<string, NodeJS.Timeout>();

// Auxiliar para gerar código de sala de 6 dígitos único
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code));
  return code;
}

export function registerMultiplayerHandlers(io: Server, socket: Socket) {
  // ─── PARTIDA RÁPIDA (MATCHMAKING) ──────────────────────────────────────────
  socket.on(
    "find_quick_match",
    async (data: {
      userId: string;
      name: string;
      avatar: string | null;
      level?: number;
    }) => {
      try {
        const { userId, name, avatar, level = 1 } = data;

        // Evita adicionar o mesmo jogador duas vezes na fila
        const existingIndex = quickMatchQueue.findIndex(
          (p) => p.userId === userId,
        );
        if (existingIndex !== -1) {
          quickMatchQueue.splice(existingIndex, 1);
        }

        // Tenta encontrar um adversário na fila com nível próximo (+/- 3 níveis)
        let opponentIndex = quickMatchQueue.findIndex(
          (p) => Math.abs(p.level - level) <= 3 && p.socketId !== socket.id,
        );

        // Se ninguém com nível próximo estiver esperando, pega o mais antigo da fila
        if (opponentIndex === -1) {
          opponentIndex = quickMatchQueue.findIndex(
            (p) => p.socketId !== socket.id,
          );
        }

        if (opponentIndex !== -1) {
          // Oponente encontrado! Remove da fila
          const opponent = quickMatchQueue.splice(opponentIndex, 1)[0];
          const code = generateRoomCode();

          const p1: Player = {
            socketId: opponent.socketId,
            userId: opponent.userId,
            name: opponent.name,
            avatar: opponent.avatar,
            level: opponent.level,
            ready: true, // Já entram prontos na partida rápida
            score: 0,
            answers: [],
          };

          const p2: Player = {
            socketId: socket.id,
            userId,
            name,
            avatar,
            level,
            ready: true,
            score: 0,
            answers: [],
          };

          const newRoom: Room = {
            code,
            players: [p1, p2],
            status: "waiting",
            questions: [],
            currentIndex: 0,
            answerCount: 0,
            theme: "Geral (Aleatório)",
          };

          rooms.set(code, newRoom);

          // Inscreve ambos os sockets na sala
          socket.join(code);
          const opponentSocket = io.sockets.sockets.get(opponent.socketId);
          if (opponentSocket) {
            opponentSocket.join(code);
          }

          console.log(
            `⚡ Partida Rápida iniciada: ${p1.name} vs ${p2.name} na sala ${code}`,
          );

          // Notifica ambos que a partida foi encontrada
          io.to(code).emit("quick_match_found", { code, room: newRoom });
          // Inicia a partida imediatamente!
          await startGame(io, newRoom);
        } else {
          // Nenhum oponente agora: coloca na fila e avisa que está buscando
          quickMatchQueue.push({
            socketId: socket.id,
            userId,
            name,
            avatar,
            level,
            joinedAt: Date.now(),
          });

          console.log(
            `⏳ ${name} (Nv. ${level}) entrou na fila de partida rápida.`,
          );
          socket.emit("searching_match", {
            message: "Procurando oponente do seu nível...",
          });
        }
      } catch (error) {
        console.error("Erro no matchmaking:", error);
        socket.emit("error", "Erro ao buscar partida rápida");
      }
    },
  );

  socket.on("cancel_quick_match", () => {
    const index = quickMatchQueue.findIndex((p) => p.socketId === socket.id);
    if (index !== -1) {
      const removed = quickMatchQueue.splice(index, 1)[0];
      console.log(`❌ ${removed.name} cancelou a busca de partida rápida.`);
    }
  });

  // ─── CRIAR SALA ────────────────────────────────────────────────────────────
  socket.on(
    "create_room",
    async (data: {
      userId: string;
      name: string;
      avatar: string | null;
      level?: number;
      theme?: string;
    }) => {
      try {
        const { userId, name, avatar, level = 1, theme } = data;
        const code = generateRoomCode();

        const newPlayer: Player = {
          socketId: socket.id,
          userId,
          name,
          avatar,
          level,
          ready: false,
          score: 0,
          answers: [],
        };

        const newRoom: Room = {
          code,
          players: [newPlayer],
          status: "waiting",
          questions: [],
          currentIndex: 0,
          answerCount: 0,
          theme: theme || "Geral (Aleatório)",
        };

        rooms.set(code, newRoom);
        socket.join(code);

        console.log(
          `🏠 Sala criada: ${code} por ${name} (Tema: ${newRoom.theme})`,
        );
        socket.emit("room_created", newRoom);
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        socket.emit("error", "Erro ao criar sala");
      }
    },
  );

  // ─── ENTRAR EM SALA ────────────────────────────────────────────────────────
  socket.on(
    "join_room",
    (data: {
      code: string;
      userId: string;
      name: string;
      avatar: string | null;
    }) => {
      try {
        const { code, userId, name, avatar } = data;
        const upperCode = code.toUpperCase();
        const room = rooms.get(upperCode);

        if (!room) {
          return socket.emit("error", "Sala não encontrada");
        }
        if (room.status !== "waiting") {
          return socket.emit("error", "Jogo já está em andamento");
        }
        if (room.players.length >= 2) {
          return socket.emit("error", "Sala cheia");
        }

        // Evita o mesmo usuário logado em duas abas entrarem como jogadores diferentes
        if (room.players.some((p) => p.userId === userId)) {
          return socket.emit("error", "Você já está na sala");
        }

        const newPlayer: Player = {
          socketId: socket.id,
          userId,
          name,
          avatar,
          ready: false,
          score: 0,
          answers: [],
        };

        room.players.push(newPlayer);
        socket.join(upperCode);

        console.log(`👤 Jogador ${name} entrou na sala ${upperCode}`);
        io.to(upperCode).emit("room_updated", room);
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        socket.emit("error", "Erro ao entrar na sala");
      }
    },
  );
  // ─── CONSULTAR / SINCRONIZAR SALA ──────────────────────────────────────────
  socket.on("get_room", (data: { code: string }) => {
    try {
      const upperCode = data.code.toUpperCase();
      const room = rooms.get(upperCode);

      if (!room) {
        return socket.emit("error", "Sala não encontrada");
      }
      // Garante que o socket está registrado na sala do socket.io
      socket.join(upperCode);
      // Devolve os dados atuais da sala para quem pediu
      socket.emit("room_updated", room);
    } catch (error) {
      console.error("Erro ao obter sala:", error);
      socket.emit("error", "Erro ao carregar dados da salas");
    }
  });

  // ─── OBTER PERGUNTA ATUAL (RECUPERAÇÃO) ────────────────────────────────────
  socket.on("get_current_question", (data: { code: string }) => {
    try {
      const upperCode = data.code.toUpperCase();
      const room = rooms.get(upperCode);
      if (!room || room.status !== "playing") return;
      const currentQuestion = room.questions[room.currentIndex];
      if (!currentQuestion) return;
      const safeAlternatives = currentQuestion.alternatives.map((alt: any) => ({
        id: alt.id,
        description: alt.description,
      }));
      socket.emit("next_question", {
        questionIndex: room.currentIndex,
        totalQuestions: room.questions.length,
        question: {
          id: currentQuestion.id,
          title: currentQuestion.title,
          category: currentQuestion.category,
          reference: currentQuestion.reference,
          alternatives: safeAlternatives,
        },
      });
    } catch (error) {
      console.error("Erro ao obter pergunta atual:", error);
    }
  });

  // ─── MARCAR PRONTIDÃO (READY) ──────────────────────────────────────────────
  socket.on("toggle_ready", async (data: { code: string }) => {
    try {
      const { code } = data;
      const upperCode = code.toUpperCase();
      const room = rooms.get(upperCode);

      if (!room) {
        return socket.emit("error", "Sala não encontrada");
      }

      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player) {
        return socket.emit("error", "Jogador não encontrado na sala");
      }

      player.ready = !player.ready;
      console.log(
        `Ready status updated for player ${player.name} in room ${upperCode}: ${player.ready}`,
      );
      io.to(upperCode).emit("room_updated", room);

      // Se todos estiverem prontos e houver pelo menos 2 jogadores, inicia o jogo
      const allReady = room.players.every((p) => p.ready);
      if (allReady && room.players.length >= 2 && room.status === "waiting") {
        await startGame(io, room);
      }
    } catch (error) {
      console.error("Erro ao alternar prontidão:", error);
      socket.emit("error", "Erro ao atualizar status");
    }
  });

  // ─── ENVIAR RESPOSTA DA QUESTÃO ────────────────────────────────────────────
  socket.on(
    "submit_answer",
    (data: { code: string; alternativeId: string }) => {
      try {
        const { code, alternativeId } = data;
        const upperCode = code.toUpperCase();
        const room = rooms.get(upperCode);

        if (!room || room.status !== "playing") {
          return socket.emit("error", "Sala não ativa ou jogo não iniciado");
        }

        const player = room.players.find((p) => p.socketId === socket.id);
        if (!player) {
          return socket.emit("error", "Jogador não encontrado");
        }

        const currentQuestion = room.questions[room.currentIndex];

        // Verifica se o jogador já respondeu esta questão
        const alreadyAnswered = player.answers.some(
          (ans) => ans.questionId === currentQuestion.id,
        );
        if (alreadyAnswered) {
          return socket.emit("error", "Você já respondeu esta pergunta");
        }

        // Encontra a alternativa e checa se está correta
        const alternative = currentQuestion.alternatives.find(
          (alt: any) => alt.id === alternativeId,
        );
        const isCorrect = !!(alternative && alternative.isCorrect);

        if (isCorrect) {
          player.score += 15; // Ganha 15 XP por resposta correta
        }

        player.answers.push({
          questionId: currentQuestion.id,
          isCorrect,
        });

        room.answerCount++;

        // Se todos os jogadores responderam antes do tempo acabar:
        if (room.answerCount >= room.players.length) {
          finishRound(io, room);
        }
      } catch (error) {
        console.error("Erro ao submeter resposta:", error);
        socket.emit("error", "Erro ao computar resposta");
      }
    },
  );

  // ─── SAIR DA SALA / DESCONEXÃO ─────────────────────────────────────────────
  socket.on("leave_room", (data: { code: string }) => {
    handlePlayerLeaving(io, socket, data.code);
  });

  socket.on("disconnecting", () => {
    // 1. Remove da fila de partida rápida se o jogador fechar o app enquanto buscava
    const queueIdx = quickMatchQueue.findIndex((p) => p.socketId === socket.id);
    if (queueIdx !== -1) {
      quickMatchQueue.splice(queueIdx, 1);
    }
    // Procura salas onde este socket está conectado
    for (const roomCode of socket.rooms) {
      if (rooms.has(roomCode)) {
        handlePlayerLeaving(io, socket, roomCode);
      }
    }
  });
}
// ─── INICIALIZAR PARTIDA (Reutilizável) ──────────────────────────────────────
async function startGame(io: Server, room: Room) {
  try {
    room.status = "playing";
    console.log(`🎬 Iniciando jogo na sala ${room.code} (Tema: ${room.theme})`);

    // Filtra perguntas pelo tema escolhido (ou geral)
    const whereClause: any = {};
    if (room.theme && room.theme !== "Geral (Aleatório)") {
      whereClause.category = { name: room.theme };
    }

    // Busca com offset aleatório para não repetir sempre as mesmas 10 perguntas
    const totalQuestions = await prisma.question.count({ where: whereClause });
    const skip =
      totalQuestions > 10
        ? Math.floor(Math.random() * (totalQuestions - 10))
        : 0;

    const questions = await prisma.question.findMany({
      where: whereClause,
      skip,
      take: 10,
      include: {
        alternatives: true,
        category: true,
      },
    });

    // Embaralha as perguntas
    room.questions = [...questions].sort(() => 0.5 - Math.random());
    room.currentIndex = 0;
    room.answerCount = 0;

    // Zera pontos e respostas dos jogadores para o início da partida
    room.players.forEach((p) => {
      p.score = 0;
      p.answers = [];
    });

    // Notifica os clientes que o jogo começou
    io.to(room.code).emit("game_start", {
      totalQuestions: room.questions.length,
    });

    // Aguarda 2 segundos para dar tempo de montar a tela do jogo e envia a primeira pergunta
    setTimeout(() => {
      if (room.status === "playing") {
        sendNextQuestion(io, room);
      }
    }, 2000);
  } catch (error) {
    console.error("Erro ao iniciar jogo:", error);
    io.to(room.code).emit("error", "Erro ao carregar perguntas da partida");
  }
}

// Função auxiliar para enviar a próxima pergunta sem expor qual é a correta
function sendNextQuestion(io: Server, room: Room) {
  // Limpa timer anterior se houver
  const prevTimeout = roomTimeouts.get(room.code);
  if (prevTimeout) {
    clearTimeout(prevTimeout);
  }
  const currentQuestion = room.questions[room.currentIndex];

  // Removemos a flag 'isCorrect' das alternativas enviadas para o app para evitar trapaças
  const safeAlternatives = currentQuestion.alternatives.map((alt: any) => ({
    id: alt.id,
    description: alt.description,
  }));

  io.to(room.code).emit("next_question", {
    questionIndex: room.currentIndex,
    totalQuestions: room.questions.length,
    question: {
      id: currentQuestion.id,
      title: currentQuestion.title,
      category: currentQuestion.category,
      reference: currentQuestion.reference,
      alternatives: safeAlternatives,
    },
  });

  // ⏱️ TIMER DO SERVIDOR (20s): Se alguém não responder a tempo, encerra a rodada
  const time = setTimeout(() => {
    if (room.status === "playing") {
      finishRound(io, room);
    }
  }, 16000);
  roomTimeouts.set(room.code, time);
}

// Função auxiliar para encerrar a rodada, pontuar e avançar
function finishRound(io: Server, room: Room) {
  // Limpa o timer para não disparar duas vezes
  const currentTimeout = roomTimeouts.get(room.code);
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    roomTimeouts.delete(room.code);
  }

  const currentQuestion = room.questions[room.currentIndex];
  if (!currentQuestion) return;

  // Garante que jogadores que não responderam fiquem com registro de resposta errada
  room.players.forEach((player) => {
    const answered = player.answers.some(
      (ans) => ans.questionId === currentQuestion.id,
    );
    if (!answered) {
      player.answers.push({
        questionId: currentQuestion.id,
        isCorrect: false,
      });
    }
  });

  const roundResults = room.players.map((p) => {
    const lastAns = p.answers.find((a) => a.questionId === currentQuestion.id);
    return {
      userId: p.userId,
      name: p.name,
      isCorrect: lastAns ? lastAns.isCorrect : false,
      score: p.score,
    };
  });

  io.to(room.code).emit("round_end", {
    correctAlternativeId: currentQuestion.alternatives.find(
      (alt: any) => alt.isCorrect,
    )?.id,
    explanation: currentQuestion.explanation,
    reference: currentQuestion.reference,
    results: roundResults,
  });

  // Espera 5 segundos para a leitura da explicação bíblica e passa para a próxima
  setTimeout(() => {
    if (room.status !== "playing") return;

    room.currentIndex++;
    room.answerCount = 0;

    if (room.currentIndex < room.questions.length) {
      sendNextQuestion(io, room);
    } else {
      endGame(io, room);
    }
  }, 5000);
}

// Função para encerrar a partida e consolidar pontos no banco (para partidas válidas)
async function endGame(io: Server, room: Room) {
  try {
    room.status = "finished";

    // Determina o vencedor
    const p1 = room.players[0];
    const p2 = room.players[1];

    let winnerId: string | null = null;
    if (p1 && p2) {
      if (p1.score > p2.score) {
        winnerId = p1.userId;
      } else if (p2.score > p1.score) {
        winnerId = p2.userId;
      }
    }

    // Persiste a partida no banco de dados
    if (p1 && p2) {
      await prisma.$transaction(async (tx) => {
        // Criar registro da partida
        const match = await tx.match.create({
          data: {
            playerOne: p1.userId,
            playerTwo: p2.userId,
            winner: winnerId,
            score: Math.max(p1.score, p2.score),
          },
        });

        // Salvar histórico de respostas de ambos
        const matchQuestionsData = [
          ...p1.answers.map((ans) => ({
            matchId: match.id,
            questionId: ans.questionId,
            isCorrect: ans.isCorrect,
          })),
          ...p2.answers.map((ans) => ({
            matchId: match.id,
            questionId: ans.questionId,
            isCorrect: ans.isCorrect,
          })),
        ];

        if (matchQuestionsData.length > 0) {
          await tx.matchQuestion.createMany({
            data: matchQuestionsData,
          });
        }

        // Atualiza rankings dos dois jogadores
        await tx.ranking.upsert({
          where: { userId: p1.userId },
          update: {
            points: { increment: p1.score },
            wins: { increment: winnerId === p1.userId ? 1 : 0 },
            losses: { increment: winnerId === p2.userId ? 1 : 0 },
          },
          create: {
            userId: p1.userId,
            points: p1.score,
            wins: winnerId === p1.userId ? 1 : 0,
            losses: winnerId === p2.userId ? 1 : 0,
          },
        });

        await tx.ranking.upsert({
          where: { userId: p2.userId },
          update: {
            points: { increment: p2.score },
            wins: { increment: winnerId === p2.userId ? 1 : 0 },
            losses: { increment: winnerId === p1.userId ? 1 : 0 },
          },
          create: {
            userId: p2.userId,
            points: p2.score,
            wins: winnerId === p2.userId ? 1 : 0,
            losses: winnerId === p1.userId ? 1 : 0,
          },
        });
      });
    }

    console.log(
      `🏁 Jogo finalizado na sala ${room.code}. Vencedor: ${winnerId}`,
    );
    io.to(room.code).emit("game_end", {
      players: room.players.map((p) => ({
        userId: p.userId,
        name: p.name,
        score: p.score,
      })),
      winnerId,
    });

    // Remove a sala da memória após a conclusão
    rooms.delete(room.code);
  } catch (error) {
    console.error("Erro ao finalizar jogo:", error);
    io.to(room.code).emit("error", "Erro ao finalizar jogo no banco");
  }
}

// Gerencia saída do jogador voluntária ou queda de conexão
function handlePlayerLeaving(io: Server, socket: Socket, code: string) {
  const upperCode = code.toUpperCase();
  const room = rooms.get(upperCode);

  if (!room) return;

  const leavingPlayer = room.players.find((p) => p.socketId === socket.id);
  if (!leavingPlayer) return;

  console.log(`🏃 Jogador ${leavingPlayer.name} saiu da sala ${upperCode}`);

  // Remove jogador do array
  room.players = room.players.filter((p) => p.socketId !== socket.id);
  socket.leave(upperCode);

  // Se a sala ficou vazia, remove ela da memória
  if (room.players.length === 0) {
    rooms.delete(upperCode);
    console.log(`🗑️ Sala ${upperCode} excluída por estar vazia`);
  } else {
    // Se o jogo estava rodando, encerra a partida por WO
    if (room.status === "playing") {
      room.status = "finished";
      const remainingPlayer = room.players[0];
      console.log(
        `🏆 Vitória por WO na sala ${upperCode} para ${remainingPlayer.name}`,
      );

      io.to(upperCode).emit("game_end", {
        players: room.players.map((p) => ({
          userId: p.userId,
          name: p.name,
          score: p.score,
        })),
        winnerId: remainingPlayer.userId,
        abandoned: true,
      });

      rooms.delete(upperCode);
    } else {
      // Se estava no lobby, apenas atualiza quem sobrou
      io.to(upperCode).emit("room_updated", room);
    }
  }
}
