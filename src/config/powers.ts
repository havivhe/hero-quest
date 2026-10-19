import type { PowerId } from '../game/types';

export interface PowerConfig {
  id: PowerId;
  name: string;
  icon: string;
  cost: number;
  description: string;
}

export const POWERS: Record<PowerId, PowerConfig> = {
  spiderSense: {
    id: 'spiderSense',
    name: 'חוש עכביש',
    icon: '🕷️',
    cost: 50,
    description: 'מעלים שתי תשובות לא נכונות',
  },
  timeBoost: {
    id: 'timeBoost',
    name: 'בוסט זמן',
    icon: '⏱️',
    cost: 75,
    description: 'מוסיף 15 שניות לשעון',
  },
  secondChance: {
    id: 'secondChance',
    name: 'הזדמנות שנייה',
    icon: '🛡️',
    cost: 100,
    description: 'אם תטעו – תקבלו עוד ניסיון',
  },
};

/** Seconds added by Time Boost. */
export const TIME_BOOST_SECONDS = 15;
