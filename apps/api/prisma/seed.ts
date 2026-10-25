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

  // 3. Garantir Conquistas no banco
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
      description: "Obtenha domínio completo dos quatro Evangelhos.",
      rarity: "LEGENDARY",
      xpReward: 1000,
      icon: "master-gospels",
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
