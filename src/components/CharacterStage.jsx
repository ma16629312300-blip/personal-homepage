export default function CharacterStage({ section }) {
  return (
    <aside
      className="emblem-stage"
      aria-label="stage emblem"
      data-section={section.id}
      data-phase={section.moonPhase}
      data-orbit={section.moonOrbit}
    >
      <div className="emblem-beams" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="emblem-frame" aria-hidden="true">
        <div className="emblem-orbit orbit-a" />
        <div className="emblem-orbit orbit-b" />
        <div className="emblem-orbit orbit-c" />
        <div className="emblem-core">
          <span className="emblem-slice slice-a" />
          <span className="emblem-slice slice-b" />
          <span className="emblem-slice slice-c" />
          <span className="moon-disc">
            <span className="moon-shadow" />
            <span className="moon-shine" />
          </span>
          <span className="emblem-mark">TT / MOON</span>
        </div>
        <div className="emblem-radar">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="emblem-caption" aria-hidden="true">
        <span>{section.number}</span>
        <strong>{section.label}</strong>
      </div>
    </aside>
  );
}
