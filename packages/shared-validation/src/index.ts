import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const categorySchema = z.object({
  name: z.string().min(3, "O nome da categoria deve ter pelo menos 3 caracteres"),
});

export const alternativeSchema = z.object({
  description: z.string().min(1, "A descrição da alternativa não pode ser vazia"),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  title: z.string().min(5, "A pergunta deve ter pelo menos 5 caracteres"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    errorMap: () => ({ message: "Dificuldade inválida" }),
  }),
  categoryId: z.string().uuid("Categoria inválida"),
  reference: z.string().min(3, "A referência bíblica é obrigatória"),
  explanation: z.string().min(10, "A explicação deve ter pelo menos 10 caracteres"),
  xpReward: z.number().int().nonnegative("O XP de recompensa deve ser maior ou igual a zero"),
  difficultyScore: z.number().int().nonnegative("A pontuação de dificuldade deve ser maior ou igual a zero"),
  tags: z.array(z.string()).min(1, "Adicione pelo menos uma tag"),
  alternatives: z
    .array(alternativeSchema)
    .min(2, "A pergunta deve ter no mínimo 2 alternativas")
    .max(5, "A pergunta deve ter no máximo 5 alternativas")
    .refine(
      (alts) => alts.filter((a) => a.isCorrect).length === 1,
      "A pergunta deve ter exatamente uma alternativa correta"
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AlternativeInput = z.infer<typeof alternativeSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
