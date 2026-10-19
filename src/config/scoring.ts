/**
 * All scoring / reward numbers live here so they are easy to tune.
 */
export const SCORING = {
  /** Default points for a correct answer (questions may override via basePoints). */
  basePoints: 100,

  /** Max extra points for a fast answer (where the mode allows it). */
  maxSpeedBonus: 50,
  /** Answering within this many seconds earns some speed bonus (linear decay). */
  speedBonusWindowSec: 10,

  /** Streak multipliers – checked from the top down. */
  streakMultipliers: [
    { minStreak: 10, multiplier: 2 },
    { minStreak: 5, multiplier: 1.5 },
    { minStreak: 3, multiplier: 1.25 },
  ],

  /** Who Am I?: point multiplier by number of hints revealed (1, 2, 3, 4+). */
  whoAmIHintMultipliers: [1, 0.8, 0.6, 0.4],

  /** XP earned per correct answer = points * xpPerPoint. */
  xpPerPoint: 0.2,
  /** XP for finishing a mission. */
  missionCompleteXp: 50,
  /** Extra XP for a mission with no mistakes. */
  perfectMissionXp: 50,

  /** Hero Coins per correct answer. */
  coinsPerCorrect: 10,
  /** Extra coins per correct answer while on a streak of 3+. */
  streakCoinBonus: 5,
  /** Coins for finishing a mission. */
  missionCompleteCoins: 20,
  /** Extra coins for a mission with no mistakes. */
  perfectMissionCoins: 30,

  /** Coins a brand-new player starts with, so they can try a power. */
  startingCoins: 100,

  /** Star rating thresholds (accuracy 0..1) for normal missions. */
  starAccuracy: { three: 0.9, two: 0.6 },
  /** Star rating thresholds (correct answers) for the Speed Challenge. */
  speedStars: { three: 15, two: 8 },
} as const;
