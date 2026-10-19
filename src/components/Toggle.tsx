import { playSfx } from '../audio/sound';

interface ToggleProps {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  note?: string;
}

export function Toggle({ label, icon, checked, onChange, note }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle ${checked ? 'toggle--on' : ''}`}
      onClick={() => {
        onChange(!checked);
        playSfx('tap');
      }}
    >
      <span className="toggle__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="toggle__text">
        <span className="toggle__label">{label}</span>
        {note && <span className="toggle__note">{note}</span>}
      </span>
      <span className="toggle__state">{checked ? 'פועל' : 'כבוי'}</span>
      <span className="toggle__switch" aria-hidden="true">
        <span className="toggle__knob" />
      </span>
    </button>
  );
}
