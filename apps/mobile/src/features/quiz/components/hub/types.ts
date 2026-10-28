import { MaterialIcons } from "@expo/vector-icons";

export interface QuizCategoryMeta {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  questionsCount: number;
  progressPercent: number;
  section: string;
}

export const STITCH_CATEGORIES: QuizCategoryMeta[] = [
  {
    id: "1",
    name: "Antigo Testamento",
    subtitle: "A Lei, Históricos, Poéticos e Profecias",
    badge: "35 Concluídos",
    badgeBg: "#e6e8ea",
    badgeColor: "#444651",
    iconName: "menu-book",
    iconBg: "#ffddb8",
    iconColor: "#855300",
    questionsCount: 45,
    progressPercent: 35,
    section: "Antigo Testamento",
  },
  {
    id: "2",
    name: "Novo Testamento",
    subtitle: "A Nova Aliança, Cartas Paulinas e Revelação",
    badge: "28 Concluídos",
    badgeBg: "#dce1ff",
    badgeColor: "#00164e",
    iconName: "church",
    iconBg: "#b6c4ff",
    iconColor: "#00236f",
    questionsCount: 52,
    progressPercent: 60,
    section: "Novo Testamento",
  },
  {
    id: "3",
    name: "Vida e Ensinos de Jesus",
    subtitle: "Parábolas, sermões, paixão e ressurreição",
    badge: "Popular ⭐",
    badgeBg: "#fea619",
    badgeColor: "#684000",
    iconName: "light-mode",
    iconBg: "#ffddb8",
    iconColor: "#855300",
    questionsCount: 24,
    progressPercent: 85,
    section: "Evangelhos",
  },
  {
    id: "4",
    name: "Profetas Bíblicos",
    subtitle: "De Isaías e Jeremias aos Doze Menores",
    badge: "Desafiador",
    badgeBg: "#ffdad6",
    badgeColor: "#93000a",
    iconName: "campaign",
    iconBg: "#e6e8ea",
    iconColor: "#00236f",
    questionsCount: 18,
    progressPercent: 15,
    section: "Profetas",
  },
  {
    id: "5",
    name: "Mulheres da Bíblia",
    subtitle: "Ester, Rute, Débora, Maria e heroínas da fé",
    badge: "Especial",
    badgeBg: "#6ffbbe",
    badgeColor: "#005236",
    iconName: "diversity-1",
    iconBg: "#bbf7d0",
    iconColor: "#004a31",
    questionsCount: 16,
    progressPercent: 50,
    section: "Personagens",
  },
  {
    id: "6",
    name: "Provérbios & Sabedoria",
    subtitle: "Máximas salomônicas, Eclesiastes e Jó",
    badge: "Sabedoria",
    badgeBg: "#ffddb8",
    badgeColor: "#653e00",
    iconName: "balance",
    iconBg: "#ffedd5",
    iconColor: "#855300",
    questionsCount: 20,
    progressPercent: 70,
    section: "Sabedoria",
  },
];

export const FILTER_PILLS = [
  "Todos",
  "Antigo Testamento",
  "Novo Testamento",
  "Evangelhos",
  "Profetas",
  "Personagens",
  "Parábolas",
  "Sabedoria",
];
