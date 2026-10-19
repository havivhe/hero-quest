export type AnswerState = 'idle' | 'correct' | 'wrong' | 'tried' | 'hidden' | 'dimmed';

interface AnswerButtonProps {
  label: string;
  marker: string;
  state: AnswerState;
  onSelect: () => void;
  big?: boolean;
}

const STATUS: Partial<Record<AnswerState, { icon: string; text: string }>> = {
  correct: { icon: '✓', text: 'נכון' },
  wrong: { icon: '✗', text: 'הבחירה שלכם' },
  tried: { icon: '✗', text: 'לא זה' },
  hidden: { icon: '🕸️', text: 'הוסר' },
};

export function AnswerButton({ label, marker, state, onSelect, big = false }: AnswerButtonProps) {
  const status = STATUS[state];
  const disabled = state !== 'idle';
  return (
    <button
      type="button"
      className={`answer answer--${state} ${big ? 'answer--big' : ''}`}
      onClick={onSelect}
      disabled={disabled}
      aria-label={status ? `${label} – ${status.text}` : label}
    >
      <span className="answer__marker" aria-hidden="true">
        {status ? status.icon : marker}
      </span>
      <span className="answer__label">{label}</span>
      {status && <span className="answer__status">{status.text}</span>}
    </button>
  );
}
