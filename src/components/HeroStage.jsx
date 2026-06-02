export default function HeroStage({ section }) {
  return (
    <aside className="hero-stage" aria-label="animated focal stage" data-section={section.id}>
      <div className="stage-grid" aria-hidden="true" />
      <div className="slash slash-one" aria-hidden="true" />
      <div className="slash slash-two" aria-hidden="true" />
      <div className="figure" aria-hidden="true">
        <div className="figure-head" />
        <div className="figure-hair" />
        <div className="figure-coat" />
        <div className="figure-scarf" />
      </div>
      <div className="particle particle-a" aria-hidden="true" />
      <div className="particle particle-b" aria-hidden="true" />
      <div className="particle particle-c" aria-hidden="true" />
      <strong>{section.label}</strong>
    </aside>
  );
}
