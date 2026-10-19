/** Original game logo – CSS emblem + title (no official artwork). */
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? 'logo--small' : ''}`}>
      <div className="logo__emblem" aria-hidden="true">
        <span className="logo__ring" />
        <span className="logo__star">★</span>
      </div>
      <h1 className="logo__title">
        <span className="logo__en">HERO QUEST</span>
        <span className="logo__he">מסע הגיבורים</span>
      </h1>
    </div>
  );
}
