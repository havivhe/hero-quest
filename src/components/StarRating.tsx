export function StarRating({ stars, max = 3 }: { stars: number; max?: number }) {
  return (
    <div className="stars" role="img" aria-label={`${stars} מתוך ${max} כוכבים`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`stars__star ${i < stars ? 'stars__star--on' : ''}`}
          style={{ animationDelay: `${0.3 + i * 0.25}s` }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}
