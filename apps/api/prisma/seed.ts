import { PrismaClient, Difficulty } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface JsonAlternative {
  description: string;
  isCorrect: boolean;
}

interface JsonStats {
  timesPlayed: number;
  correctRate: number;
  averageAnswerTime: number;
}
interface JsonQuestion {
  id: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  question: string;
  alternatives: JsonAlternative[];
  reference: string;
  explanation: string;
  xpReward: number;
  difficultyScore: number;
  tags: string[];
  stats?: JsonStats;
}
async function main() {
  console.log("🌱 Iniciando o seed do banco de dados com padrão completo...");
  // Caminho absoluto para os arquivos JSON
  const questionsPath = path.join(__dirname, "../../../data/questions.json");
  const rawData = fs.readFileSync(questionsPath, "utf-8");
  const questionsData: JsonQuestion[] = JSON.parse(rawData);
  console.log(`Encontradas ${questionsData.length} perguntas para processar.`);
  for (const item of questionsData) {
    // 1. Criar ou conectar a Categoria dinamicamente
    const category = await prisma.category.upsert({
      where: { name: item.category },
      update: {},
      create: {
        name: item.category,
      },
    });
    const difficultyMap: Record<string, Difficulty> = {
      EASY: Difficulty.EASY,
      MEDIUM: Difficulty.MEDIUM,
      HARD: Difficulty.HARD,
    };
    const difficulty = difficultyMap[item.difficulty] || Difficulty.EASY;
    // 2. Verificar se a pergunta já existe (pelo UUID ou título para evitar duplicação)
    const existingQuestion = await prisma.question.findUnique({
      where: { id: item.id },
    });
    if (!existingQuestion) {
      await prisma.question.create({
        data: {
          id: item.id,
          title: item.question,
          difficulty: difficulty,
          categoryId: category.id,
          reference: item.reference,
          explanation: item.explanation,
          xpReward: item.xpReward,
          difficultyScore: item.difficultyScore,
          tags: item.tags,
          timesPlayed: item.stats?.timesPlayed ?? 0,
          correctRate: item.stats?.correctRate ?? 0,
          averageAnswerTime: item.stats?.averageAnswerTime ?? 0,
          alternatives: {
            create: item.alternatives.map((alt) => ({
              description: alt.description,
              isCorrect: alt.isCorrect,
            })),
          },
        },
      });
      console.log(`✓ Pergunta criada: "${item.question.substring(0, 30)}..."`);
    } else {
      console.log(
        `- Pergunta já existe (pulando): "${item.question.substring(0, 30)}..."`,
      );
    }
  }

  // 🏆 1. Início da Carga de Conquistas (dentro do main)
  console.log("🏆 Populando conquistas no banco de dados...");
  const achievements = [
    {
      code: "FIRST_STEP",
      name: "Primeiro Passo",
      description: "Responder 10 perguntas.",
      rarity: "COMMON",
      xpReward: 50,
      icon: "first-step",
    },
    {
      code: "MASTER_GOSPELS",
      name: "Mestre dos Evangelhos",
      description:
        "Obtenha domínio completo dos quatro Evangelhos (Mateus, Marcos, Lucas e João).",
      rarity: "LEGENDARY",
      xpReward: 1000,
      icon: "master-gospels",
    },
    {
      code: "WISDOM_OF_SOLOMON",
      name: "Sabedoria de Salomão",
      description:
        "Domine os livros sapienciais (Provérbios, Eclesiastes, Sabedoria, Cânticos).",
      rarity: "EPIC",
      xpReward: 750,
      icon: "wisdom-of-solomon",
    },
    {
      code: "STREAK_30",
      name: "Sequência de 30 Dias",
      description: "Mantenha um streak diário maior ou igual a 30 dias.",
      rarity: "RARE",
      xpReward: 500,
      icon: "streak-30",
    },
    {
      code: "PROPHET_OF_NATIONS",
      name: "Profeta das Nações",
      description:
        "Complete Isaías, Jeremias, Ezequiel e Daniel com pelo menos 90% de aproveitamento.",
      rarity: "LEGENDARY",
      xpReward: 1000,
      icon: "prophet-of-nations",
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
        name: ach.name,
        description: ach.description,
        rarity: ach.rarity as any,
        xpReward: ach.xpReward,
        icon: ach.icon,
      },
      create: {
        code: ach.code,
        name: ach.name,
        description: ach.description,
        rarity: ach.rarity as any,
        xpReward: ach.xpReward,
        icon: ach.icon,
      },
    });
    console.log(`✓ Conquista registrada: "${ach.name}"`);
  }

  console.log("🌱 Seed concluído com sucesso!");
} // 2. Fim do main()

// 3. Orquestração de Erros e Desconexão
main()
  .catch((e) => {
    console.error("❌ Erro durante a execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
