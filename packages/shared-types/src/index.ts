export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type UserRole = "USER" | "ADMIN";

export type Rarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string | null;
  currentStreak?: number;
  bestStreak?: number;
  lastActiveDate?: Date | string | null;
  createdAt: Date;
  updatedAt?: Date | string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Question {
  id: string;
  title: string;
  categoryId: string;
  difficulty: Difficulty;
  reference?: string | null;
  explanation?: string | null;
  xpReward?: number;
  difficultyScore?: number;
  tags?: string[];
  timesPlayed?: number;
  correctRate?: number;
  averageAnswerTime?: number;
  createdAt: Date;
  updatedAt?: Date | string;
}

export interface Alternative {
  id: string;
  questionId: string;
  description: string;
  isCorrect?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CheckAnswerResponse {
  questionId: string;
  isCorrect: boolean;
  correctAlternativeId: string | null;
  correctAlternative: string | null;
  explanation: string | null;
  reference: string | null;
}

export interface Match {
  id: string;
  playerOne: string;
  playerTwo?: string | null;
  winner?: string | null;
  score: number;
  createdAt: Date;
  updatedAt?: Date | string;
}

export interface MatchQuestion {
  id: string;
  matchId: string;
  questionId: string;
  isCorrect: boolean;
  createdAt?: Date | string;
}

export interface Ranking {
  id: string;
  userId: string;
  points: number;
  wins: number;
  losses: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Achievement {
  id: string;
  code?: string;
  name: string;
  description: string;
  rarity?: Rarity;
  xpReward?: number;
  icon: string;
  unlocked?: boolean;
  unlockedAt?: Date | string | null;
  progress?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  unlockedAt: Date | string;
}
