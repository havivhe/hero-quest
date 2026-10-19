import { useState } from 'react';
import { playSfx } from '../audio/sound';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { ALL_CATEGORIES_INFO, CATEGORIES, type CategoryInfo } from '../config/categories';
import { DIFFICULTIES } from '../config/difficulties';
import { GAME_MODES } from '../config/modes';
import type { MissionConfig } from '../game/types';

interface MissionSelectScreenProps {
  initial: MissionConfig;
  onStart: (config: MissionConfig) => void;
  onBack: () => void;
}

const CATEGORY_OPTIONS: CategoryInfo[] = [...CATEGORIES, ALL_CATEGORIES_INFO];

export function MissionSelectScreen({ initial, onStart, onBack }: MissionSelectScreenProps) {
  const [config, setConfig] = useState<MissionConfig>(initial);
  const set = (patch: Partial<MissionConfig>) => {
    playSfx('tap');
    setConfig((c) => ({ ...c, ...patch }));
  };

  return (
    <main className="screen screen--select">
      <ScreenHeader title="בחירת משימה" onBack={onBack} />

      <section className="select-section" aria-labelledby="mode-title">
        <h2 id="mode-title" className="section-title">
          1. סוג משחק
        </h2>
        <div className="mode-list" role="radiogroup" aria-labelledby="mode-title">
          {GAME_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={config.mode === m.id}
              className={`mode-card ${config.mode === m.id ? 'is-selected' : ''}`}
              onClick={() => set({ mode: m.id })}
            >
              <span className="mode-card__icon" aria-hidden="true">
                {m.icon}
              </span>
              <span className="mode-card__text">
                <span className="mode-card__name">{m.name}</span>
                <span className="mode-card__desc">{m.description}</span>
              </span>
              {config.mode === m.id && (
                <span className="check-badge" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="select-section" aria-labelledby="cat-title">
        <h2 id="cat-title" className="section-title">
          2. קטגוריה
        </h2>
        <div className="chip-grid" role="radiogroup" aria-labelledby="cat-title">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={config.category === c.id}
              className={`chip ${config.category === c.id ? 'is-selected' : ''}`}
              onClick={() => set({ category: c.id })}
            >
              <span className="chip__icon" aria-hidden="true">
                {c.icon}
              </span>
              {c.name}
              {config.category === c.id && <span className="visually-hidden"> (נבחר)</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="select-section" aria-labelledby="diff-title">
        <h2 id="diff-title" className="section-title">
          3. רמת קושי
        </h2>
        <div className="segmented" role="radiogroup" aria-labelledby="diff-title">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={config.difficulty === d.id}
              className={`segmented__btn ${config.difficulty === d.id ? 'is-selected' : ''}`}
              onClick={() => set({ difficulty: d.id })}
            >
              <span aria-hidden="true">{d.icon}</span> {d.name}
            </button>
          ))}
        </div>
      </section>

      <div className="sticky-cta">
        <Button size="xl" block onClick={() => onStart(config)}>
          יוצאים למשימה! ⚡
        </Button>
      </div>
    </main>
  );
}
