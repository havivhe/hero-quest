interface StatChipProps {
  icon: string;
  label: string;
  value: string | number;
  tone?: 'gold' | 'fire' | 'blue' | 'purple';
}

export function StatChip({ icon, label, value, tone = 'blue' }: StatChipProps) {
  return (
    <div className={`stat-chip stat-chip--${tone}`}>
      <span className="stat-chip__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="stat-chip__text">
        <span className="stat-chip__value">{value}</span>
        <span className="stat-chip__label">{label}</span>
      </span>
    </div>
  );
}
