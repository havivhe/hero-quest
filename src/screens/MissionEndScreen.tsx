import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { StarRating } from '../components/StarRating';
import { XpBar } from '../components/XpBar';
import { getAchievement } from '../config/achievements';
import { getCategoryInfo } from '../config/categories';
import { getDifficultyName } from '../config/difficulties';
import { getMode } from '../config/modes';
import { getLevelForXp } from '../game/levels';
import type { MissionResult, PlayerProfile } from '../game/types';

interface MissionEndScreenProps {
  result: MissionResult;
  profile: PlayerProfile;
  onPlayAgain: () => void;
  onChooseMission: () => void;
  onHome: () => void;
}

const HEADLINES = ['ממשיכים להתאמן! 💪', 'משימה הושלמה!', 'עבודה מצוינת!', 'ביצוע של גיבורי-על!'];

export function MissionEndScreen({ result, profile, onPlayAgain, onChooseMission, onHome }: MissionEndScreenProps) {
  const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const level = getLevelForXp(profile.xp);
  const leveledUp = level.level > result.levelBefore;
  const mode = getMode(result.config.mode);
  const category = getCategoryInfo(result.config.category);
  const perfect = result.total >= 10 && result.correct === result.total;

  return (
    <main className="screen screen--end">
      {(result.stars === 3 || leveledUp) && <Confetti count={45} />}

      <header className="end-header">
        <p className="end-header__mission">
          {mode.icon} {mode.name} · {category.name} · {getDifficultyName(result.config.difficulty)}
        </p>
        <h1 className="end-header__title">{perfect ? 'מושלם! 10/10 💯' : HEADLINES[result.stars]}</h1>
        <StarRating stars={result.stars} />
      </header>

      {leveledUp && (
        <div className="levelup-banner" role="status">
          <span className="levelup-banner__icon" aria-hidden="true">
            {level.icon}
          </span>
          <span>
            <strong>עליתם לרמה {level.level}!</strong> עכשיו אתם {level.title}
          </span>
        </div>
      )}

      <section className="card end-stats" aria-label="תוצאות המשימה">
        <div className="end-score">
          <span className="end-score__label">ניקוד</span>
          <span className="end-score__value">{result.score}</span>
        </div>
        <dl className="end-grid">
          <div>
            <dt>תשובות נכונות</dt>
            <dd>
              {result.correct} / {result.total}
            </dd>
          </div>
          <div>
            <dt>דיוק</dt>
            <dd>{accuracy}%</dd>
          </div>
          <div>
            <dt>רצף הכי ארוך</dt>
            <dd>🔥 {result.bestStreak}</dd>
          </div>
          <div>
            <dt>XP שהרווחתם</dt>
            <dd className="text-xp">+{result.xpEarned}</dd>
          </div>
          <div>
            <dt>מטבעות גיבור</dt>
            <dd className="text-gold">+{result.coinsEarned} 🪙</dd>
          </div>
          <div>
            <dt>מטבעות בסך הכול</dt>
            <dd>{profile.coins} 🪙</dd>
          </div>
        </dl>
      </section>

      <section className="card" aria-label="התקדמות ברמה">
        <XpBar xp={profile.xp} gained={result.xpEarned} />
      </section>

      {result.newAchievements.length > 0 && (
        <section className="card new-achievements" aria-labelledby="new-ach-title">
          <h2 id="new-ach-title" className="section-title">
            🏅 הישגים חדשים!
          </h2>
          <ul>
            {result.newAchievements.map((id) => {
              const a = getAchievement(id);
              if (!a) return null;
              return (
                <li key={id} className="new-achievement">
                  <span className="new-achievement__icon" aria-hidden="true">
                    {a.icon}
                  </span>
                  <span>
                    <strong>{a.name}</strong>
                    <br />
                    <small>{a.description}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="end-actions">
        <Button size="xl" block onClick={onPlayAgain}>
          🔁 עוד פעם!
        </Button>
        <div className="end-actions__row">
          <Button variant="secondary" size="lg" onClick={onChooseMission}>
            🎯 משימה אחרת
          </Button>
          <Button variant="secondary" size="lg" onClick={onHome}>
            🏠 מסך הבית
          </Button>
        </div>
      </div>
    </main>
  );
}
