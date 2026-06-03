export default function StageShell({ section, wipeActive, children }) {
  return (
    <main
      className="stage-shell"
      data-section={section.id}
      data-layout={section.layout}
      data-wipe={wipeActive}
      data-visual-system="lunar"
    >
      <div className="stage-noise" aria-hidden="true" />
      <div className="stage-watermark" aria-hidden="true">
        {section.watermark}
      </div>
      <div className="stage-index" aria-hidden="true">
        {section.number}
      </div>
      <div className="lunar-track track-a" aria-hidden="true" />
      <div className="lunar-track track-b" aria-hidden="true" />
      <div className="lunar-track track-c" aria-hidden="true" />
      <div className="lunar-arc arc-a" aria-hidden="true" />
      <div className="lunar-arc arc-b" aria-hidden="true" />
      <div className="stage-grid" aria-hidden="true" />
      <div className="stage-layout">{children}</div>
    </main>
  );
}
