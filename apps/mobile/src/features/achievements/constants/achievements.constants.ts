import { MaterialIcons } from "@expo/vector-icons";
import { Rarity } from "../services/achievements.service";

// Paleta Sacred Wisdom por Raridade
export const RARITY_STYLES: Record<
  Rarity,
  { ring: string; bg: string; icon: string; label: string; labelColor: string }
> = {
  COMMON: { ring: "#c5c5d3", bg: "#f2f4f6", icon: "#757682", label: "Comum", labelColor: "#757682" },
  UNCOMMON: { ring: "#4edea3", bg: "#e6fff5", icon: "#00311f", label: "Incomum", labelColor: "#00311f" },
  RARE: { ring: "#b6c4ff", bg: "#dce1ff", icon: "#00236f", label: "Raro", labelColor: "#00236f" },
  EPIC: { ring: "#cf89ff", bg: "#f3e8ff", icon: "#6b21a8", label: "Épico", labelColor: "#6b21a8" },
  LEGENDARY: { ring: "#fea619", bg: "#fff4e0", icon: "#684000", label: "Lendário", labelColor: "#684000" },
  MYTHIC: { ring: "#ff6f6f", bg: "#fff0f0", icon: "#93000a", label: "Mítico", labelColor: "#93000a" },
};

// Ícones por código de conquista
export const ICON_MAP: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  FIRST_STEP: "verified",
  MASTER_GOSPELS: "menu-book",
  WISDOM_OF_SOLOMON: "auto-awesome",
  PROPHET_OF_NATIONS: "public",
  STREAK_30: "local-fire-department",
  THIRTY_DAY_STREAK: "local-fire-department",
};

export type AchievementCategory = "biblical" | "streak" | "multiplayer" | "progression" | "precision";

export interface AchievementGuide {
  category: AchievementCategory;
  categoryLabel: string;
  howToUnlock: string;
  relatedQuizName: string;
  targetRoute: string;
}

export const ACHIEVEMENT_GUIDES: Record<string, AchievementGuide> = {
  FIRST_STEP: {
    category: "progression",
    categoryLabel: "Progressão",
    howToUnlock: "Responda a 10 perguntas em qualquer quiz para registrar seu início de jornada.",
    relatedQuizName: "Quiz Individual Livre",
    targetRoute: "/quiz",
  },
  MASTER_GOSPELS: {
    category: "biblical",
    categoryLabel: "Conhecimento Bíblico",
    howToUnlock: "Obtenha 100% de acertos nas perguntas dos quatro Evangelhos (Mateus, Marcos, Lucas e João).",
    relatedQuizName: "Evangelhos & Novo Testamento",
    targetRoute: "/quiz",
  },
  WISDOM_OF_SOLOMON: {
    category: "biblical",
    categoryLabel: "Conhecimento Bíblico",
    howToUnlock: "Domine os livros sapienciais respondendo perguntas de Provérbios, Eclesiastes, Sabedoria e Cânticos.",
    relatedQuizName: "Salmos & Livros Sapienciais",
    targetRoute: "/quiz",
  },
  STREAK_30: {
    category: "streak",
    categoryLabel: "Consistência",
    howToUnlock: "Mantenha sua chama acesa respondendo a pelo menos um quiz diário durante 30 dias consecutivos.",
    relatedQuizName: "Quiz Diário da Ofensiva",
    targetRoute: "/quiz",
  },
  THIRTY_DAY_STREAK: {
    category: "streak",
    categoryLabel: "Consistência",
    howToUnlock: "Mantenha sua chama acesa respondendo a pelo menos um quiz diário durante 30 dias consecutivos.",
    relatedQuizName: "Quiz Diário da Ofensiva",
    targetRoute: "/quiz",
  },
  PROPHET_OF_NATIONS: {
    category: "biblical",
    categoryLabel: "Conhecimento Bíblico",
    howToUnlock: "Acerte pelo menos 90% das perguntas sobre os grandes profetas: Isaías, Jeremias, Ezequiel e Daniel.",
    relatedQuizName: "Profetas Maiores & Antigo Testamento",
    targetRoute: "/quiz",
  },
};

export const DEFAULT_GUIDE: AchievementGuide = {
  category: "biblical",
  categoryLabel: "Geral",
  howToUnlock: "Jogue partidas individuais ou na arena para avançar rumo ao desbloqueio desta medalha.",
  relatedQuizName: "Quiz Bíblico Geral",
  targetRoute: "/quiz",
};
