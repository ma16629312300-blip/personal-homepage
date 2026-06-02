import ProjectCard from './ProjectCard.jsx';

export default function SectionPanel({ section }) {
  return (
    <section className="section-panel" aria-live="polite" key={section.id}>
      <p className="panel-kicker">{section.kicker}</p>
      <h1>{section.title}</h1>
      <p className="panel-description">{section.description}</p>

      {section.tags?.length > 0 && (
        <div className="tag-row" aria-label="Tags">
          {section.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {section.cards?.length > 0 && (
        <div className="card-grid">
          {section.cards.map((card) => (
            <ProjectCard key={card.title} {...card} />
          ))}
        </div>
      )}
    </section>
  );
}
