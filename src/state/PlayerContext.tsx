import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { setVibrationEnabled } from '../audio/haptics';
import { setMusicEnabled, setSoundEnabled } from '../audio/sound';
import { createProfile } from '../game/progress';
import type { PlayerProfile, Settings } from '../game/types';
import { clearSave, loadSave, SAVE_VERSION, writeSave } from '../storage/storage';

interface PlayerContextValue {
  profile: PlayerProfile | null;
  settings: Settings;
  /** Always returns the latest profile (safe inside event handlers). */
  getProfile: () => PlayerProfile | null;
  /** Replaces the profile and saves it immediately. */
  saveProfile: (profile: PlayerProfile) => void;
  startNewPlayer: (nickname: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadSave(), []);
  const [profile, setProfile] = useState<PlayerProfile | null>(initial.profile);
  const [settings, setSettings] = useState<Settings>(initial.settings);
  const profileRef = useRef(profile);
  const settingsRef = useRef(settings);

  const persist = useCallback(() => {
    writeSave({ version: SAVE_VERSION, profile: profileRef.current, settings: settingsRef.current });
  }, []);

  const saveProfile = useCallback(
    (next: PlayerProfile) => {
      profileRef.current = next;
      setProfile(next);
      persist();
    },
    [persist],
  );

  const startNewPlayer = useCallback(
    (nickname: string) => saveProfile(createProfile(nickname, Date.now())),
    [saveProfile],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settingsRef.current, ...patch };
      settingsRef.current = next;
      setSettings(next);
      persist();
    },
    [persist],
  );

  const resetProgress = useCallback(() => {
    clearSave();
    profileRef.current = null;
    setProfile(null);
    persist(); // keep the current settings
  }, [persist]);

  // Keep audio/vibration modules in sync with settings.
  useEffect(() => {
    setSoundEnabled(settings.sound);
    setMusicEnabled(settings.music);
    setVibrationEnabled(settings.vibration);
  }, [settings]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      profile,
      settings,
      getProfile: () => profileRef.current,
      saveProfile,
      startNewPlayer,
      updateSettings,
      resetProgress,
    }),
    [profile, settings, saveProfile, startNewPlayer, updateSettings, resetProgress],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
