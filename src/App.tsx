import { useCallback, useEffect, useState } from 'react';
import { LevelUpModal } from './components/LevelUpModal';
import { getLevelForXp } from './game/levels';
import type { MissionConfig, MissionResult } from './game/types';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MissionEndScreen } from './screens/MissionEndScreen';
import { MissionSelectScreen } from './screens/MissionSelectScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { usePlayer } from './state/PlayerContext';

type Screen =
  | { name: 'home' }
  | { name: 'select' }
  | { name: 'game'; config: MissionConfig; runId: number }
  | { name: 'end'; result: MissionResult }
  | { name: 'achievements' }
  | { name: 'settings' };

const DEFAULT_MISSION: MissionConfig = { mode: 'multiple-choice', category: 'all', difficulty: 'easy' };

export default function App() {
  const { profile, settings, startNewPlayer, saveProfile, getProfile, updateSettings, resetProgress } = usePlayer();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [lastMission, setLastMission] = useState<MissionConfig>(DEFAULT_MISSION);

  // Scroll to top on every screen change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.name]);

  const startMission = useCallback((config: MissionConfig) => {
    setLastMission(config);
    setScreen({ name: 'game', config, runId: Date.now() });
  }, []);

  const handleFinish = useCallback((result: MissionResult) => setScreen({ name: 'end', result }), []);
  const goHome = useCallback(() => setScreen({ name: 'home' }), []);

  // Level-up celebration: shown on Home / Mission End when a new level hasn't been celebrated yet.
  const currentLevel = profile ? getLevelForXp(profile.xp) : null;
  const canCelebrate = screen.name === 'home' || screen.name === 'end';
  const levelToCelebrate =
    profile && currentLevel && canCelebrate && currentLevel.level > profile.celebratedLevel ? currentLevel : null;
  const dismissLevelUp = useCallback(() => {
    const p = getProfile();
    if (p) saveProfile({ ...p, celebratedLevel: getLevelForXp(p.xp).level });
  }, [getProfile, saveProfile]);

  if (!profile) {
    return (
      <div className="app">
        <WelcomeScreen
          onStart={(nickname) => {
            startNewPlayer(nickname);
            setScreen({ name: 'home' });
          }}
        />
      </div>
    );
  }

  let content;
  switch (screen.name) {
    case 'home':
      content = (
        <HomeScreen
          profile={profile}
          onPlay={() => setScreen({ name: 'select' })}
          onAchievements={() => setScreen({ name: 'achievements' })}
          onSettings={() => setScreen({ name: 'settings' })}
        />
      );
      break;
    case 'select':
      content = <MissionSelectScreen initial={lastMission} onStart={startMission} onBack={goHome} />;
      break;
    case 'game':
      content = <GameScreen key={screen.runId} config={screen.config} onFinish={handleFinish} onQuit={goHome} />;
      break;
    case 'end':
      content = (
        <MissionEndScreen
          result={screen.result}
          profile={profile}
          onPlayAgain={() => startMission(screen.result.config)}
          onChooseMission={() => setScreen({ name: 'select' })}
          onHome={goHome}
        />
      );
      break;
    case 'achievements':
      content = <AchievementsScreen profile={profile} onBack={goHome} />;
      break;
    case 'settings':
      content = (
        <SettingsScreen
          profile={profile}
          settings={settings}
          onChange={updateSettings}
          onReset={() => {
            resetProgress();
            setLastMission(DEFAULT_MISSION);
            setScreen({ name: 'home' });
          }}
          onBack={goHome}
        />
      );
      break;
  }

  return (
    <div className="app">
      {content}
      <LevelUpModal level={levelToCelebrate} onClose={dismissLevelUp} />
    </div>
  );
}
