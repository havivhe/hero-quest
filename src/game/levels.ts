import { LEVELS, type LevelConfig } from '../config/levels';

export interface LevelProgress {
  current: LevelConfig;
  next: LevelConfig | null;
  /** XP gained inside the current level. */
  xpIntoLevel: number;
  /** XP needed to go from current level to the next (0 at max level). */
  xpForNext: number;
  /** 0..1 progress towards the next level (1 at max level). */
  ratio: number;
}

export function getLevelForXp(xp: number): LevelConfig {
  let result = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) result = lvl;
  }
  return result;
}

export function getLevelProgress(xp: number): LevelProgress {
  const current = getLevelForXp(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  if (!next) return { current, next, xpIntoLevel: xp - current.minXp, xpForNext: 0, ratio: 1 };
  const xpForNext = next.minXp - current.minXp;
  const xpIntoLevel = xp - current.minXp;
  return { current, next, xpIntoLevel, xpForNext, ratio: Math.min(1, xpIntoLevel / xpForNext) };
}
