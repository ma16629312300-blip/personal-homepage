export default function StageShell({ section, wipeActive, children }) {
  return (
    <main className="stage-shell" data-section={section.id} data-layout={section.layout} data-wipe={wipeActive}>
      <div className="stage-noise" aria-hidden="true" />
      <div className="stage-watermark" aria-hidden="true">
        {section.watermark}
      </div>
      <div className="stage-index" aria-hidden="true">
        {section.number}
      </div>
      <div className="panel-plane plane-a" aria-hidden="true" />
      <div className="panel-plane plane-b" aria-hidden="true" />
      <div className="panel-plane plane-c" aria-hidden="true" />
      <div className="stage-grid" aria-hidden="true" />
      <div className="stage-layout">{children}</div>
    </main>
  );
}
