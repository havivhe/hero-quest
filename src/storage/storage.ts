/**
 * localStorage persistence. All saved data lives under one versioned key so it
 * can be migrated later (or swapped for a cloud backend) in one place.
 */
import { DEFAULT_SETTINGS } from '../config/settings';
import { createProfile } from '../game/progress';
import type { PlayerProfile, Settings } from '../game/types';

const STORAGE_KEY = 'hero-quest:save';
export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  profile: PlayerProfile | null;
  settings: Settings;
}

const emptySave = (): SaveData => ({ version: SAVE_VERSION, profile: null, settings: { ...DEFAULT_SETTINGS } });

/** Fills in fields missing from older saves so new features never crash old data. */
function migrateProfile(raw: Partial<PlayerProfile>): PlayerProfile {
  const base = createProfile(raw.nickname ?? 'גיבור', raw.createdAt ?? Date.now());
  return {
    ...base,
    ...raw,
    categoryCorrect: { ...base.categoryCorrect, ...(raw.categoryCorrect ?? {}) },
    achievements: { ...(raw.achievements ?? {}) },
    questionHistory: { ...(raw.questionHistory ?? {}) },
  };
}

export function loadSave(): SaveData {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return emptySave();
    const data = JSON.parse(text) as Partial<SaveData>;
    return {
      version: SAVE_VERSION,
      profile: data.profile && typeof data.profile.nickname === 'string' ? migrateProfile(data.profile) : null,
      settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
    };
  } catch {
    return emptySave();
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked (e.g. private mode) – the game still works for this session.
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
