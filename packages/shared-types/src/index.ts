export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  title: string;
  categoryId: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  createdAt: Date;
}

export interface Alternative {
  id: string;
  questionId: string;
  description: string;
  isCorrect: boolean;
}

export interface Match {
  id: string;
  playerOne: string;
  playerTwo?: string;
  winner?: string;
  score: number;
  createdAt: Date;
}

export interface Ranking {
  id: string;
  userId: string;
  points: number;
  wins: number;
  losses: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}
