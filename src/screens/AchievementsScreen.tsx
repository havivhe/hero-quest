import { ScreenHeader } from '../components/ScreenHeader';
import { ACHIEVEMENTS } from '../config/achievements';
import type { PlayerProfile } from '../game/types';

interface AchievementsScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

export function AchievementsScreen({ profile, onBack }: AchievementsScreenProps) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => profile.achievements[a.id]).length;
  return (
    <main className="screen screen--achievements">
      <ScreenHeader title="הישגים" onBack={onBack} />
      <p className="achievements__summary">
        פתחתם <strong>{unlockedCount}</strong> מתוך {ACHIEVEMENTS.length} הישגים
      </p>
      <ul className="achievement-list">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = !!profile.achievements[a.id];
          const progress = !unlocked && a.progress ? a.progress({ profile }) : null;
          return (
            <li key={a.id} className={`achievement ${unlocked ? 'achievement--unlocked' : 'achievement--locked'}`}>
              <span className="achievement__icon" aria-hidden="true">
                {unlocked ? a.icon : '🔒'}
              </span>
              <div className="achievement__body">
                <h2 className="achievement__name">{a.name}</h2>
                <p className="achievement__desc">{a.description}</p>
                {progress && (
                  <div className="mini-progress" aria-label={`התקדמות ${progress[0]} מתוך ${progress[1]}`}>
                    <div className="mini-progress__fill" style={{ width: `${(progress[0] / progress[1]) * 100}%` }} />
                    <span className="mini-progress__text">
                      {progress[0]}/{progress[1]}
                    </span>
                  </div>
                )}
              </div>
              <span className="achievement__status">{unlocked ? '✓ נפתח' : 'נעול'}</span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
