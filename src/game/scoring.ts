import { SCORING } from '../config/scoring';

export function getStreakMultiplier(streak: number): number {
  for (const step of SCORING.streakMultipliers) {
    if (streak >= step.minStreak) return step.multiplier;
  }
  return 1;
}

/** Linear speed bonus: full bonus at 0s, nothing after the window. */
export function getSpeedBonus(answerTimeSec: number): number {
  const ratio = 1 - answerTimeSec / SCORING.speedBonusWindowSec;
  return Math.round(SCORING.maxSpeedBonus * Math.max(0, Math.min(1, ratio)));
}

export function getHintMultiplier(hintsRevealed: number): number {
  const list = SCORING.whoAmIHintMultipliers;
  const idx = Math.max(0, Math.min(list.length - 1, hintsRevealed - 1));
  return list[idx];
}

export interface CorrectAnswerInput {
  basePoints: number;
  /** Streak count INCLUDING this answer. */
  streak: number;
  /** Seconds taken to answer, or null when the mode has no speed bonus. */
  answerTimeSec: number | null;
  /** Who Am I? hints revealed, or null when not applicable. */
  hintsRevealed: number | null;
}

export interface Reward {
  points: number;
  speedBonus: number;
  multiplier: number;
  xp: number;
  coins: number;
}

export function calculateCorrectReward(input: CorrectAnswerInput): Reward {
  const hintMult = input.hintsRevealed == null ? 1 : getHintMultiplier(input.hintsRevealed);
  const speedBonus = input.answerTimeSec == null ? 0 : getSpeedBonus(input.answerTimeSec);
  const multiplier = getStreakMultiplier(input.streak);
  const points = Math.round((input.basePoints * hintMult + speedBonus) * multiplier);
  const xp = Math.round(points * SCORING.xpPerPoint);
  const coins = SCORING.coinsPerCorrect + (input.streak >= 3 ? SCORING.streakCoinBonus : 0);
  return { points, speedBonus, multiplier, xp, coins };
}

/** Wrong answers earn nothing – but never remove anything either. */
export const WRONG_REWARD: Reward = { points: 0, speedBonus: 0, multiplier: 1, xp: 0, coins: 0 };

export function getMissionCompletionBonus(perfect: boolean) {
  return {
    xp: SCORING.missionCompleteXp + (perfect ? SCORING.perfectMissionXp : 0),
    coins: SCORING.missionCompleteCoins + (perfect ? SCORING.perfectMissionCoins : 0),
  };
}

export function getStarRating(correct: number, total: number, timed: boolean): number {
  if (timed) {
    if (correct >= SCORING.speedStars.three) return 3;
    if (correct >= SCORING.speedStars.two) return 2;
    return correct > 0 ? 1 : 0;
  }
  if (total === 0) return 0;
  const accuracy = correct / total;
  if (accuracy >= SCORING.starAccuracy.three) return 3;
  if (accuracy >= SCORING.starAccuracy.two) return 2;
  return correct > 0 ? 1 : 0;
}
