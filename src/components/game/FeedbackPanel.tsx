import { useEffect } from 'react';
import type { AnswerFeedback } from '../../game/mission';
import { Button } from '../Button';

const CORRECT_TITLES = ['מעולה!', 'אלופים!', 'בול!', 'כוח-על!', 'גאונים!'];
const WRONG_TITLES = ['כמעט!', 'לא נורא!', 'ניסיון יפה!', 'לומדים ומתקדמים!'];

interface FeedbackPanelProps {
  feedback: AnswerFeedback;
  correctAnswer: string;
  explanation: string;
  streak: number;
  isLast: boolean;
  onNext: () => void;
  /** Speed mode: compact panel that continues automatically. */
  autoAdvanceMs?: number;
}

export function FeedbackPanel({
  feedback,
  correctAnswer,
  explanation,
  streak,
  isLast,
  onNext,
  autoAdvanceMs,
}: FeedbackPanelProps) {
  const titleList = feedback.correct ? CORRECT_TITLES : WRONG_TITLES;
  const title = titleList[(correctAnswer.length + streak) % titleList.length];

  useEffect(() => {
    if (!autoAdvanceMs) return;
    const t = window.setTimeout(onNext, autoAdvanceMs);
    return () => window.clearTimeout(t);
  }, [autoAdvanceMs, onNext]);

  const r = feedback.reward;
  return (
    <div className={`feedback feedback--${feedback.correct ? 'correct' : 'wrong'}`} role="status" aria-live="assertive">
      <div className="feedback__head">
        <span className="feedback__icon" aria-hidden="true">
          {feedback.correct ? '✓' : '💪'}
        </span>
        <div>
          <h2 className="feedback__title">
            {feedback.correct ? title : `✗ ${title}`}
          </h2>
          {!feedback.correct && (
            <p className="feedback__answer">
              התשובה הנכונה: <strong>{correctAnswer}</strong>
            </p>
          )}
        </div>
      </div>

      {feedback.correct && r && (
        <div className="feedback__rewards">
          <span className="reward reward--points">+{r.points} נקודות</span>
          <span className="reward reward--xp">+{r.xp} XP</span>
          <span className="reward reward--coins">+{r.coins} 🪙</span>
          {r.multiplier > 1 && <span className="reward reward--combo">🔥 x{r.multiplier}</span>}
          {r.speedBonus > 0 && <span className="reward reward--speed">⚡ +{r.speedBonus} מהירות</span>}
        </div>
      )}

      <p className="feedback__explanation">
        <span aria-hidden="true">💡 </span>
        {explanation}
      </p>

      <Button variant={feedback.correct ? 'success' : 'primary'} size="lg" block onClick={onNext}>
        {isLast ? 'לסיכום המשימה 🏁' : 'לשאלה הבאה ←'}
      </Button>
    </div>
  );
}
