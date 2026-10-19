import { unlockAudio } from '../audio/sound';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { StatChip } from '../components/StatChip';
import { XpBar } from '../components/XpBar';
import { ACHIEVEMENTS } from '../config/achievements';
import { getLevelForXp } from '../game/levels';
import type { PlayerProfile } from '../game/types';

interface HomeScreenProps {
  profile: PlayerProfile;
  onPlay: () => void;
  onAchievements: () => void;
  onSettings: () => void;
}

export function HomeScreen({ profile, onPlay, onAchievements, onSettings }: HomeScreenProps) {
  const level = getLevelForXp(profile.xp);
  const unlockedCount = ACHIEVEMENTS.filter((a) => profile.achievements[a.id]).length;

  return (
    <main className="screen screen--home">
      <Logo small />

      <section className="card hero-card" aria-label="הפרופיל שלכם">
        <div className="hero-card__top">
          <div className="hero-card__avatar" aria-hidden="true">
            {level.icon}
          </div>
          <div>
            <p className="hero-card__hello">שלום,</p>
            <h2 className="hero-card__name">{profile.nickname}</h2>
            <p className="hero-card__rank">
              רמה {level.level} · {level.title}
            </p>
          </div>
        </div>
        <XpBar xp={profile.xp} />
      </section>

      <div className="stat-row">
        <StatChip icon="🪙" label="מטבעות גיבור" value={profile.coins} tone="gold" />
        <StatChip icon="🔥" label="רצף שיא" value={profile.bestStreak} tone="fire" />
        <StatChip icon="🏆" label="שיא נקודות" value={profile.bestScore} tone="purple" />
      </div>

      <Button
        size="xl"
        block
        className="play-btn"
        onClick={() => {
          unlockAudio();
          onPlay();
        }}
      >
        <span className="play-btn__icon" aria-hidden="true">
          ▶
        </span>
        שחקו!
      </Button>

      <div className="home-actions">
        <Button variant="secondary" size="lg" onClick={onAchievements}>
          🏅 הישגים ({unlockedCount}/{ACHIEVEMENTS.length})
        </Button>
        <Button variant="secondary" size="lg" onClick={onSettings}>
          ⚙️ הגדרות
        </Button>
      </div>
    </main>
  );
}
