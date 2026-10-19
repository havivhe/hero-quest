import type { Category, CategoryFilter } from '../game/types';

export interface CategoryInfo {
  id: CategoryFilter;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: (CategoryInfo & { id: Category })[] = [
  { id: 'heroes', name: 'גיבורים', icon: '🦸', description: 'כמה טוב אתם מכירים את הגיבורים?' },
  { id: 'villains', name: 'נבלים', icon: '🦹', description: 'האויבים הכי מסוכנים' },
  { id: 'movies', name: 'סרטים', icon: '🎬', description: 'שאלות על הסרטים הגדולים' },
  { id: 'stories', name: 'סיפורים', icon: '📖', description: 'סיפורי מקור ורגעים גדולים' },
  { id: 'mystery', name: 'מסתורין', icon: '🔮', description: 'חפצים, מקומות וסודות' },
];

export const ALL_CATEGORIES_INFO: CategoryInfo = {
  id: 'all',
  name: 'הכול מעורבב',
  icon: '🌀',
  description: 'שאלות מכל הקטגוריות',
};

export function getCategoryInfo(id: CategoryFilter): CategoryInfo {
  return id === 'all' ? ALL_CATEGORIES_INFO : CATEGORIES.find((c) => c.id === id)!;
}
