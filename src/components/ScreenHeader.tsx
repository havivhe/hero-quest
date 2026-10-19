import { playSfx } from '../audio/sound';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  backLabel?: string;
}

export function ScreenHeader({ title, onBack, backLabel = 'חזרה' }: ScreenHeaderProps) {
  return (
    <header className="screen-header">
      <button
        type="button"
        className="icon-btn"
        onClick={() => {
          playSfx('tap');
          onBack();
        }}
        aria-label={backLabel}
      >
        <span aria-hidden="true">→</span>
      </button>
      <h1 className="screen-header__title">{title}</h1>
      <span className="screen-header__spacer" />
    </header>
  );
}
