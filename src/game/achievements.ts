import { ACHIEVEMENTS } from '../config/achievements';
import type { AchievementContext } from './types';

/** Returns ids of achievements that are now unlocked but were not before. */
export function findNewAchievements(ctx: AchievementContext): string[] {
  return ACHIEVEMENTS.filter((a) => !ctx.profile.achievements[a.id] && a.isUnlocked(ctx)).map((a) => a.id);
}
