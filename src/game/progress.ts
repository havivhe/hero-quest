/**
 * Pure functions that apply gameplay results to the saved player profile.
 * XP, coins and score are only ever added – never subtracted (except coins
 * spent on powers).
 */
import { SCORING } from '../config/scoring';
import { findNewAchievements } from './achievements';
import { getLevelForXp } from './levels';
import { getMissionCompletionBonus, getStarRating, type Reward } from './scoring';
import type { AchievementContext, MissionConfig, MissionResult, PlayerProfile, Question } from './types';

export function createProfile(nickname: string, now: number): PlayerProfile {
  return {
    nickname,
    createdAt: now,
    xp: 0,
    level: 1,
    coins: SCORING.startingCoins,
    totalScore: 0,
    bestScore: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    perfectMissions: 0,
    bestSpeedCorrect: 0,
    categoryCorrect: { heroes: 0, villains: 0, movies: 0, stories: 0, mystery: 0 },
    achievements: {},
    questionHistory: {},
    celebratedLevel: 1,
  };
}

function withXp(profile: PlayerProfile, addXp: number): PlayerProfile {
  const xp = profile.xp + addXp;
  return { ...profile, xp, level: getLevelForXp(xp).level };
}

export function unlockAchievements(
  profile: PlayerProfile,
  ctx: Omit<AchievementContext, 'profile'>,
  now: number,
): { profile: PlayerProfile; unlocked: string[] } {
  const unlocked = findNewAchievements({ ...ctx, profile });
  if (unlocked.length === 0) return { profile, unlocked };
  const achievements = { ...profile.achievements };
  for (const id of unlocked) achievements[id] = now;
  return { profile: { ...profile, achievements }, unlocked };
}

export function applyAnswer(
  profile: PlayerProfile,
  question: Question,
  correct: boolean,
  reward: Reward | null,
  streak: number,
  now: number,
): { profile: PlayerProfile; unlocked: string[] } {
  const prev = profile.questionHistory[question.id];
  let next: PlayerProfile = {
    ...profile,
    questionHistory: {
      ...profile.questionHistory,
      [question.id]: {
        seen: (prev?.seen ?? 0) + 1,
        correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
        lastSeen: now,
      },
    },
  };
  if (correct && reward) {
    next = withXp(next, reward.xp);
    next = {
      ...next,
      coins: next.coins + reward.coins,
      totalScore: next.totalScore + reward.points,
      correctAnswers: next.correctAnswers + 1,
      bestStreak: Math.max(next.bestStreak, streak),
      categoryCorrect: { ...next.categoryCorrect, [question.category]: next.categoryCorrect[question.category] + 1 },
    };
  } else {
    next = { ...next, wrongAnswers: next.wrongAnswers + 1 };
  }
  return unlockAchievements(next, {}, now);
}

export function spendCoins(profile: PlayerProfile, amount: number): PlayerProfile | null {
  if (profile.coins < amount) return null;
  return { ...profile, coins: profile.coins - amount };
}

export function refundCoins(profile: PlayerProfile, amount: number): PlayerProfile {
  return { ...profile, coins: profile.coins + amount };
}

export interface MissionSummaryInput {
  config: MissionConfig;
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  xpEarned: number;
  coinsEarned: number;
  timed: boolean;
  /** Achievements already unlocked during the mission. */
  unlockedDuringMission: string[];
  levelBefore: number;
}

export function applyMissionEnd(
  profile: PlayerProfile,
  input: MissionSummaryInput,
  now: number,
): { profile: PlayerProfile; result: MissionResult } {
  const perfect = !input.timed && input.total >= 10 && input.correct === input.total;
  const bonus = getMissionCompletionBonus(perfect);
  let next = withXp(profile, bonus.xp);
  next = {
    ...next,
    coins: next.coins + bonus.coins,
    gamesPlayed: next.gamesPlayed + 1,
    bestScore: Math.max(next.bestScore, input.score),
    perfectMissions: next.perfectMissions + (perfect ? 1 : 0),
    bestSpeedCorrect: input.config.mode === 'speed' ? Math.max(next.bestSpeedCorrect, input.correct) : next.bestSpeedCorrect,
  };
  const { profile: finalProfile, unlocked } = unlockAchievements(
    next,
    { mission: { mode: input.config.mode, correct: input.correct, total: input.total } },
    now,
  );
  return {
    profile: finalProfile,
    result: {
      config: input.config,
      score: input.score,
      correct: input.correct,
      total: input.total,
      bestStreak: input.bestStreak,
      xpEarned: input.xpEarned + bonus.xp,
      coinsEarned: input.coinsEarned + bonus.coins,
      stars: getStarRating(input.correct, input.total, input.timed),
      newAchievements: [...input.unlockedDuringMission, ...unlocked],
      levelBefore: input.levelBefore,
    },
  };
}
