// Core domain types shared by data, logic and UI.

export type Category = 'heroes' | 'villains' | 'movies' | 'stories' | 'mystery';
export type CategoryFilter = Category | 'all';
export type Difficulty = 'easy' | 'normal' | 'hard';

/** The kind of question as stored in the question bank. */
export type QuestionType = 'multiple-choice' | 'true-false' | 'who-am-i' | 'mystery';

/** The game mode the player picks. A mode draws from one or more question types. */
export type GameModeId = 'multiple-choice' | 'who-am-i' | 'true-false' | 'speed' | 'mystery';

export type PowerId = 'spiderSense' | 'timeBoost' | 'secondChance';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  /** All answer options. For true-false use TRUE_FALSE_ANSWERS. */
  answers: string[];
  /** Must be exactly equal to one of `answers`. */
  correctAnswer: string;
  explanation: string;
  basePoints: number;
  tags: string[];
  /** Who Am I?: hints revealed one by one. Mystery: story clues. */
  hints?: string[];
}

export interface MissionConfig {
  mode: GameModeId;
  category: CategoryFilter;
  difficulty: Difficulty;
}

export interface QuestionHistoryEntry {
  seen: number;
  correct: number;
  lastSeen: number;
}

export interface PlayerProfile {
  nickname: string;
  createdAt: number;
  xp: number;
  /** Mirrors the level derived from XP (kept for readability of saved data). */
  level: number;
  coins: number;
  totalScore: number;
  bestScore: number;
  bestStreak: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  perfectMissions: number;
  bestSpeedCorrect: number;
  categoryCorrect: Record<Category, number>;
  /** achievement id -> unlock timestamp */
  achievements: Record<string, number>;
  questionHistory: Record<string, QuestionHistoryEntry>;
  /** Highest level already celebrated with the Level Up modal. */
  celebratedLevel: number;
}

export interface Settings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
}

/** Data an achievement condition can look at. */
export interface AchievementContext {
  profile: PlayerProfile;
  /** Present only when a mission has just been completed. */
  mission?: { mode: GameModeId; correct: number; total: number };
}

/** Summary of a finished mission, used by the end screen and achievements. */
export interface MissionResult {
  config: MissionConfig;
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  xpEarned: number;
  coinsEarned: number;
  stars: number;
  newAchievements: string[];
  levelBefore: number;
}
