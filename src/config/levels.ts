/**
 * Level thresholds. Edit freely – keep the list sorted by minXp, starting at 0.
 */
export interface LevelConfig {
  level: number;
  title: string;
  minXp: number;
  icon: string;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, title: 'טירון', minXp: 0, icon: '🔰' },
  { level: 2, title: 'גיבור בהכשרה', minXp: 500, icon: '🥋' },
  { level: 3, title: 'גיבור צעיר', minXp: 1200, icon: '⭐' },
  { level: 4, title: 'מגן', minXp: 2200, icon: '🛡️' },
  { level: 5, title: 'נוקם', minXp: 3500, icon: '⚡' },
  { level: 6, title: 'שומר הגלקסיה', minXp: 5200, icon: '🌌' },
  { level: 7, title: 'אלוף העל', minXp: 7500, icon: '🏆' },
  { level: 8, title: 'מגן היקום', minXp: 10500, icon: '🪐' },
  { level: 9, title: 'גיבור אגדי', minXp: 14500, icon: '👑' },
  { level: 10, title: 'אגדת העל', minXp: 20000, icon: '🌟' },
];
