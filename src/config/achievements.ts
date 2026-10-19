import type { AchievementContext } from '../game/types';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  /** Placeholder icon (emoji) – can later be replaced with artwork. */
  icon: string;
  /** Unlock condition. */
  isUnlocked: (ctx: AchievementContext) => boolean;
  /** Optional progress display [current, target] for locked achievements. */
  progress?: (ctx: AchievementContext) => [number, number];
}

const EXPERT_TARGET = 25;

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_mission',
    name: 'משימה ראשונה',
    description: 'סיימו את המשימה הראשונה שלכם',
    icon: '🚀',
    isUnlocked: ({ profile }) => profile.gamesPlayed >= 1,
  },
  {
    id: 'streak_5',
    name: 'רצף של 5',
    description: '5 תשובות נכונות ברצף',
    icon: '🔥',
    isUnlocked: ({ profile }) => profile.bestStreak >= 5,
    progress: ({ profile }) => [Math.min(profile.bestStreak, 5), 5],
  },
  {
    id: 'streak_10',
    name: 'רצף של 10',
    description: '10 תשובות נכונות ברצף',
    icon: '☄️',
    isUnlocked: ({ profile }) => profile.bestStreak >= 10,
    progress: ({ profile }) => [Math.min(profile.bestStreak, 10), 10],
  },
  {
    id: 'perfect_10',
    name: 'מושלם 10/10',
    description: 'סיימו משימה של 10 שאלות בלי אף טעות',
    icon: '💯',
    isUnlocked: ({ profile, mission }) =>
      profile.perfectMissions > 0 || (!!mission && mission.total >= 10 && mission.correct === mission.total),
  },
  {
    id: 'hero_expert',
    name: 'מומחה גיבורים',
    description: `ענו נכון על ${EXPERT_TARGET} שאלות בקטגוריית גיבורים`,
    icon: '🦸',
    isUnlocked: ({ profile }) => profile.categoryCorrect.heroes >= EXPERT_TARGET,
    progress: ({ profile }) => [Math.min(profile.categoryCorrect.heroes, EXPERT_TARGET), EXPERT_TARGET],
  },
  {
    id: 'movie_expert',
    name: 'מומחה סרטים',
    description: `ענו נכון על ${EXPERT_TARGET} שאלות בקטגוריית סרטים`,
    icon: '🎬',
    isUnlocked: ({ profile }) => profile.categoryCorrect.movies >= EXPERT_TARGET,
    progress: ({ profile }) => [Math.min(profile.categoryCorrect.movies, EXPERT_TARGET), EXPERT_TARGET],
  },
  {
    id: 'speed_master',
    name: 'אלוף המהירות',
    description: 'ענו נכון על 15 שאלות באתגר מהירות אחד',
    icon: '⚡',
    isUnlocked: ({ profile }) => profile.bestSpeedCorrect >= 15,
    progress: ({ profile }) => [Math.min(profile.bestSpeedCorrect, 15), 15],
  },
  {
    id: 'villain_expert',
    name: 'צייד נבלים',
    description: `ענו נכון על ${EXPERT_TARGET} שאלות בקטגוריית נבלים`,
    icon: '🦹',
    isUnlocked: ({ profile }) => profile.categoryCorrect.villains >= EXPERT_TARGET,
    progress: ({ profile }) => [Math.min(profile.categoryCorrect.villains, EXPERT_TARGET), EXPERT_TARGET],
  },
  {
    id: 'mission_veteran',
    name: 'ותיק משימות',
    description: 'סיימו 10 משימות',
    icon: '🎖️',
    isUnlocked: ({ profile }) => profile.gamesPlayed >= 10,
    progress: ({ profile }) => [Math.min(profile.gamesPlayed, 10), 10],
  },
  {
    id: 'avenger_rank',
    name: 'דרגת נוקם',
    description: 'הגיעו לרמה 5',
    icon: '🏅',
    isUnlocked: ({ profile }) => profile.level >= 5,
    progress: ({ profile }) => [Math.min(profile.level, 5), 5],
  },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
