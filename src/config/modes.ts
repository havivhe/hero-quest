import type { GameModeId, PowerId, QuestionType } from '../game/types';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  icon: string;
  description: string;
  /** Question types this mode draws from. */
  questionTypes: QuestionType[];
  /** Number of questions per mission (ignored for timed modes). */
  missionLength: number;
  /** Total mission time in seconds, or null if untimed. */
  timeLimitSec: number | null;
  /** Whether fast answers earn a speed bonus. */
  speedBonus: boolean;
  /** Powers shown in this mode. */
  powers: PowerId[];
}

/**
 * Game mode registry. New modes (e.g. Boss Battles) can be added here
 * together with a matching question view in src/components/game/.
 */
export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'multiple-choice',
    name: 'בחירה מרובה',
    icon: '🎯',
    description: 'שאלה וארבע תשובות – בחרו את הנכונה!',
    questionTypes: ['multiple-choice'],
    missionLength: 10,
    timeLimitSec: null,
    speedBonus: true,
    powers: ['spiderSense', 'secondChance'],
  },
  {
    id: 'who-am-i',
    name: 'מי אני?',
    icon: '🕵️',
    description: 'רמזים נחשפים אחד אחרי השני. פחות רמזים = יותר נקודות!',
    questionTypes: ['who-am-i'],
    missionLength: 5,
    timeLimitSec: null,
    speedBonus: false,
    powers: ['spiderSense', 'secondChance'],
  },
  {
    id: 'true-false',
    name: 'נכון / לא נכון',
    icon: '⚖️',
    description: 'נכון או לא נכון? תחליטו מהר!',
    questionTypes: ['true-false'],
    missionLength: 10,
    timeLimitSec: null,
    speedBonus: true,
    powers: ['secondChance'],
  },
  {
    id: 'speed',
    name: 'אתגר מהירות',
    icon: '⚡',
    description: '60 שניות – כמה שיותר תשובות נכונות!',
    questionTypes: ['multiple-choice', 'true-false'],
    missionLength: 0,
    timeLimitSec: 60,
    speedBonus: true,
    powers: ['spiderSense', 'timeBoost', 'secondChance'],
  },
  {
    id: 'mystery',
    name: 'משימת מסתורין',
    icon: '🔍',
    description: 'קראו את הרמזים בסיפור ופתרו את התעלומה',
    questionTypes: ['mystery'],
    missionLength: 5,
    timeLimitSec: null,
    speedBonus: false,
    powers: ['spiderSense', 'secondChance'],
  },
];

export const getMode = (id: GameModeId) => GAME_MODES.find((m) => m.id === id)!;
