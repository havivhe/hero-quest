import { getHintMultiplier } from '../../game/scoring';
import { Button } from '../Button';

interface WhoAmIHintsProps {
  hints: string[];
  revealed: number;
  onReveal: () => void;
  canReveal: boolean;
}

/** Who Am I?: hints revealed one by one. */
export function WhoAmIHints({ hints, revealed, onReveal, canReveal }: WhoAmIHintsProps) {
  const pointsPct = Math.round(getHintMultiplier(revealed) * 100);
  const nextPct = Math.round(getHintMultiplier(revealed + 1) * 100);
  return (
    <div className="hints">
      <ol className="hints__list">
        {hints.map((hint, i) =>
          i < revealed ? (
            <li key={i} className="hints__item hints__item--shown">
              <span className="hints__num" aria-hidden="true">
                {i + 1}
              </span>
              {hint}
            </li>
          ) : (
            <li key={i} className="hints__item hints__item--locked" aria-label="רמז נעול">
              <span className="hints__num" aria-hidden="true">
                ?
              </span>
              רמז נעול 🔒
            </li>
          ),
        )}
      </ol>
      <div className="hints__footer">
        <span className="hints__value">שווי התשובה: {pointsPct}% מהנקודות</span>
        {revealed < hints.length && (
          <Button variant="secondary" onClick={onReveal} disabled={!canReveal}>
            💡 עוד רמז ({nextPct}%)
          </Button>
        )}
      </div>
    </div>
  );
}

/** Mystery Mission: a short "case file" of story clues. */
export function MysteryClues({ clues }: { clues: string[] }) {
  return (
    <div className="case-file">
      <div className="case-file__tab">📁 תיק חקירה</div>
      <ul className="case-file__list">
        {clues.map((clue, i) => (
          <li key={i} className="case-file__clue" style={{ animationDelay: `${0.15 + i * 0.35}s` }}>
            {clue}
          </li>
        ))}
      </ul>
    </div>
  );
}
