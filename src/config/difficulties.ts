import type { Difficulty } from '../game/types';

export const DIFFICULTIES: { id: Difficulty; name: string; icon: string }[] = [
  { id: 'easy', name: 'קל', icon: '🟢' },
  { id: 'normal', name: 'רגיל', icon: '🟡' },
  { id: 'hard', name: 'קשה', icon: '🔴' },
];

export const getDifficultyName = (id: Difficulty) => DIFFICULTIES.find((d) => d.id === id)!.name;
