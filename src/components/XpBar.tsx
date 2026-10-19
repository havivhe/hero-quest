import { getLevelProgress } from '../game/levels';

interface XpBarProps {
  xp: number;
  /** XP shown as "just earned" (highlighted segment). */
  gained?: number;
  compact?: boolean;
}

export function XpBar({ xp, gained = 0, compact = false }: XpBarProps) {
  const p = getLevelProgress(xp);
  const pct = Math.round(p.ratio * 100);
  return (
    <div className={`xp-bar ${compact ? 'xp-bar--compact' : ''}`}>
      <div className="xp-bar__labels">
        <span>
          {p.current.icon} רמה {p.current.level} · {p.current.title}
        </span>
        <span className="xp-bar__numbers">
          {p.next ? `${p.xpIntoLevel} / ${p.xpForNext} XP` : 'רמה מקסימלית!'}
        </span>
      </div>
      <div
        className="xp-bar__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="התקדמות לרמה הבאה"
      >
        <div className="xp-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      {p.next && (
        <div className="xp-bar__next">
          {gained > 0 && <span className="xp-bar__gained">+{gained} XP · </span>}
          עוד {p.next.minXp - xp} XP לרמה {p.next.level} ({p.next.title})
        </div>
      )}
    </div>
  );
}
