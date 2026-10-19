import { POWERS } from '../../config/powers';
import type { PowerId } from '../../game/types';

interface PowerBarProps {
  powers: PowerId[];
  coins: number;
  /** Whether each power can be used right now (ignoring coins). */
  usable: Record<PowerId, boolean>;
  /** Powers currently active (e.g. Second Chance armed). */
  active: Partial<Record<PowerId, boolean>>;
  onUse: (id: PowerId) => void;
}

export function PowerBar({ powers, coins, usable, active, onUse }: PowerBarProps) {
  return (
    <div className="power-bar">
      <div className="power-bar__coins" aria-label={`יש לכם ${coins} מטבעות גיבור`}>
        <span aria-hidden="true">🪙</span> {coins}
      </div>
      <div className="power-bar__list">
        {powers.map((id) => {
          const p = POWERS[id];
          const affordable = coins >= p.cost;
          const isActive = !!active[id];
          return (
            <button
              key={id}
              type="button"
              className={`power ${isActive ? 'power--active' : ''} ${!affordable ? 'power--poor' : ''} ${
                !usable[id] && !isActive ? 'power--unavailable' : ''
              }`}
              onClick={() => onUse(id)}
              aria-label={`${p.name}: ${p.description}. עולה ${p.cost} מטבעות${isActive ? '. פעיל עכשיו' : ''}`}
            >
              <span className="power__icon" aria-hidden="true">
                {p.icon}
              </span>
              <span className="power__name">{p.name}</span>
              <span className="power__cost">{isActive ? 'פעיל ✓' : `🪙 ${p.cost}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
