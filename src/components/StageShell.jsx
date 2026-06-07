export default function StageShell({ section, wipeActive, children }) {
  return (
    <main
      className="stage-shell"
      data-section={section.id}
      data-layout={section.layout}
      data-wipe={wipeActive}
    >
      {/* Film grain */}
      <div className="stage-noise" aria-hidden="true" />

      {/* Motion lines */}
      <div className="motion-lines" aria-hidden="true" />

      {/* Diagonal accent panels */}
      <div className="diagonal-panel diagonal-panel--top" aria-hidden="true" />
      <div className="diagonal-panel diagonal-panel--bottom" aria-hidden="true" />

      {/* Watermark */}
      <div className="stage-watermark" aria-hidden="true">
        {section.watermark}
      </div>

      {/* Section number */}
      <div className="stage-index" aria-hidden="true">
        {section.number}
      </div>

      {/* Glow lines */}
      <div className="lunar-track track-a" aria-hidden="true" />
      <div className="lunar-track track-b" aria-hidden="true" />
      <div className="lunar-track track-c" aria-hidden="true" />

      {/* Clock rings */}
      <div className="clock-field clock-field-a" aria-hidden="true">
        <span className="clock-hand hand-hour" />
        <span className="clock-hand hand-minute" />
        <span className="clock-hand hand-second" />
      </div>
      <div className="clock-field clock-field-b" aria-hidden="true">
        <span className="clock-hand hand-hour" />
        <span className="clock-hand hand-minute" />
      </div>

      {/* Angular fragments */}
      <div className="archive-fragments" aria-hidden="true">
        <span className="fragment fragment-a" />
        <span className="fragment fragment-b" />
        <span className="fragment fragment-c" />
        <span className="fragment fragment-d" />
      </div>

      {/* Main layout */}
      <div className="stage-layout">{children}</div>
    </main>
  );
}
