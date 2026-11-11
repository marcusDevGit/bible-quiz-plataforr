import { PrismaClient, Difficulty } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Iniciando atualização do banco com 103 perguntas e 4 alternativas (A, B, C, D)...",
  );

  // 1. Cadastrar / Atualizar Categorias
  const categoriesPath = path.join(
    __dirname,
    "../../../data/category_complete.json",
  );
  if (fs.existsSync(categoriesPath)) {
    const rawCategories = fs.readFileSync(categoriesPath, "utf-8");
    const { categories } = JSON.parse(rawCategories);
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name },
      });
    }
    console.log(`✓ ${categories.length} categorias sincronizadas.`);
  }

  // 2. Processar 103 Perguntas Completas com Alternativa "D"
  const questionsPath = path.join(
    __dirname,
    "../../../data/questions_complete.json",
  );
  const rawData = fs.readFileSync(questionsPath, "utf-8");
  const questionsData = JSON.parse(rawData);

  console.log(`Processando ${questionsData.length} perguntas completas...`);

  for (const item of questionsData) {
    const category = await prisma.category.upsert({
      where: { name: item.category },
      update: {},
      create: { name: item.category },
    });

    const difficultyMap: Record<string, Difficulty> = {
      EASY: Difficulty.EASY,
      MEDIUM: Difficulty.MEDIUM,
      HARD: Difficulty.HARD,
    };
    const difficulty = difficultyMap[item.difficulty] || Difficulty.EASY;

    // Upsert da Pergunta (cria ou atualiza os dados da pergunta)
    const question = await prisma.question.upsert({
      where: { id: item.id },
      update: {
        title: item.question,
        difficulty,
        categoryId: category.id,
        reference: item.reference,
        explanation: item.explanation,
        xpReward: item.xpReward,
        difficultyScore: item.difficultyScore,
        tags: item.tags,
      },
      create: {
        id: item.id,
        title: item.question,
        difficulty,
        categoryId: category.id,
        reference: item.reference,
        explanation: item.explanation,
        xpReward: item.xpReward,
        difficultyScore: item.difficultyScore,
        tags: item.tags,
      },
    });

    // Sincroniza as 4 alternativas: remove as antigas (A, B, C) e insere as 4 completas (A, B, C, D)
    await prisma.alternative.deleteMany({
      where: { questionId: question.id },
    });

    await prisma.alternative.createMany({
      data: item.alternatives.map((alt: any) => ({
        questionId: question.id,
        description: alt.description,
        isCorrect: alt.isCorrect,
      })),
    });
  }

  console.log(
    "✅ Todas as 103 perguntas atualizadas com sucesso com 4 alternativas!",
  );

  // 3. Garantir as 27 Conquistas do Catálogo no banco
  console.log("🏆 Populando as 27 conquistas do catálogo no banco de dados...");
  const achievements = [
    // Progressão & Marcos de Jogo
    {
      code: "FIRST_STEP",
      name: "Primeiro Passo",
      description: "Responder 10 perguntas.",
      rarity: "COMMON",
      xpReward: 50,
      icon: "first-step",
    },
    {
      code: "FIRST_MATCH",
      name: "Estreia na Jornada",
      description: "Concluir sua primeira partida de quiz.",
      rarity: "COMMON",
      xpReward: 50,
      icon: "first-match",
    },
    {
      code: "DEDICATED_STUDENT",
      name: "Estudante Dedicado",
      description: "Responder um total de 50 perguntas bíblicas.",
      rarity: "COMMON",
      xpReward: 100,
      icon: "dedicated-student",
    },
    {
      code: "BIBLE_SCHOLAR",
      name: "Estudioso das Escrituras",
      description: "Responder um total de 100 perguntas bíblicas.",
      rarity: "UNCOMMON",
      xpReward: 200,
      icon: "bible-scholar",
    },
    {
      code: "VETERAN_PLAYER",
      name: "Veterano da Palavra",
      description: "Concluir 25 partidas na plataforma.",
      rarity: "UNCOMMON",
      xpReward: 250,
      icon: "veteran-player",
    },
    {
      code: "PERFECT_SCORE",
      name: "Perfeição Bíblica",
      description: "Obter 100% de acerto em uma partida completa.",
      rarity: "RARE",
      xpReward: 300,
      icon: "perfect-score",
    },
    {
      code: "CENTURION_FAITH",
      name: "Centurião da Fé",
      description: "Acertar 100 perguntas bíblicas no total.",
      rarity: "RARE",
      xpReward: 350,
      icon: "centurion-faith",
    },
    {
      code: "THOUSAND_STEPS",
      name: "Peregrino Fiel",
      description: "Responder um total de 250 perguntas bíblicas.",
      rarity: "EPIC",
      xpReward: 600,
      icon: "thousand-steps",
    },
    {
      code: "GRAND_THEOLOGIAN",
      name: "Mestre Teólogo",
      description: "Acertar 500 perguntas bíblicas no total.",
      rarity: "MYTHIC",
      xpReward: 1500,
      icon: "grand-theologian",
    },

    // Consistência & Ofensiva Diária (Streaks)
    {
      code: "STREAK_3",
      name: "Chama Inicial",
      description: "Manter uma ofensiva diária de pelo menos 3 dias seguidos.",
      rarity: "COMMON",
      xpReward: 75,
      icon: "streak-3",
    },
    {
      code: "STREAK_7",
      name: "Semana Abençoada",
      description: "Manter uma ofensiva diária de pelo menos 7 dias seguidos.",
      rarity: "UNCOMMON",
      xpReward: 150,
      icon: "streak-7",
    },
    {
      code: "STREAK_14",
      name: "Quinzena Fiel",
      description: "Manter uma ofensiva diária de pelo menos 14 dias seguidos.",
      rarity: "RARE",
      xpReward: 300,
      icon: "streak-14",
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
      code: "STREAK_60",
      name: "Guardião do Templo",
      description: "Manter uma ofensiva diária de pelo menos 60 dias seguidos.",
      rarity: "EPIC",
      xpReward: 800,
      icon: "streak-60",
    },
    {
      code: "STREAK_100",
      name: "Coluna Inabalável",
      description: "Manter uma ofensiva histórica de 100 dias seguidos.",
      rarity: "MYTHIC",
      xpReward: 2000,
      icon: "streak-100",
    },

    // Arena Multiplayer & Ranking
    {
      code: "ARENA_DEBUT",
      name: "Guerreiro de Davi",
      description: "Disputar sua primeira batalha multiplayer 1v1 na Arena.",
      rarity: "COMMON",
      xpReward: 100,
      icon: "arena-debut",
    },
    {
      code: "XP_HUNTER",
      name: "Acumulador de Talentos",
      description: "Alcançar 1.000 XP acumulados no Ranking Geral.",
      rarity: "UNCOMMON",
      xpReward: 200,
      icon: "xp-hunter",
    },
    {
      code: "ARENA_CHAMPION",
      name: "Campeão da Arena",
      description: "Conquistar 10 vitórias registradas no Ranking.",
      rarity: "RARE",
      xpReward: 400,
      icon: "arena-champion",
    },
    {
      code: "XP_MASTER",
      name: "Príncipe da Aliança",
      description: "Alcançar 5.000 XP acumulados no Ranking Geral.",
      rarity: "EPIC",
      xpReward: 750,
      icon: "xp-master",
    },
    {
      code: "ARENA_LEGEND",
      name: "Lenda de Israel",
      description: "Conquistar 50 vitórias registradas no Ranking.",
      rarity: "LEGENDARY",
      xpReward: 1000,
      icon: "arena-legend",
    },

    // Conhecimento Bíblico Temático
    {
      code: "LAW_OF_MOSES",
      name: "Guardião da Torá",
      description: "Acertar 15 perguntas sobre o Pentateuco e Patriarcas.",
      rarity: "UNCOMMON",
      xpReward: 250,
      icon: "law-of-moses",
    },
    {
      code: "APOSTLE_PAUL",
      name: "Missionário aos Gentios",
      description: "Acertar 15 perguntas sobre Atos dos Apóstolos e Cartas Paulinas.",
      rarity: "RARE",
      xpReward: 350,
      icon: "apostle-paul",
    },
    {
      code: "KINGS_AND_JUDGES",
      name: "Cronista de Israel",
      description: "Acertar 15 perguntas sobre Juízes e Reis de Israel.",
      rarity: "RARE",
      xpReward: 350,
      icon: "kings-and-judges",
    },
    {
      code: "REVELATION_SEER",
      name: "Vidente de Patmos",
      description: "Acertar 10 perguntas sobre o Apocalipse e Milagres.",
      rarity: "EPIC",
      xpReward: 650,
      icon: "revelation-seer",
    },
    {
      code: "WISDOM_OF_SOLOMON",
      name: "Sabedoria de Salomão",
      description: "Domine os livros sapienciais.",
      rarity: "EPIC",
      xpReward: 750,
      icon: "wisdom-of-solomon",
    },
    {
      code: "MASTER_GOSPELS",
      name: "Mestre dos Evangelhos",
      description: "Obtenha domínio completo dos quatro Evangelhos.",
      rarity: "LEGENDARY",
      xpReward: 1000,
      icon: "master-gospels",
    },
    {
      code: "PROPHET_OF_NATIONS",
      name: "Profeta das Nações",
      description: "Complete os profetas com pelo menos 90% de aproveitamento.",
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
  }

  console.log("🌱 Seed concluído com sucesso!");
}

// 4. Invocação do main com tratamento de erro e desconexão segura do Prisma
main()
  .catch((e) => {
    console.error("❌ Erro durante a execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
