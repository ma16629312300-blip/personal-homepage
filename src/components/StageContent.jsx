export default function StageContent({ section }) {
  return (
    <section className="stage-content" aria-live="polite" key={section.id}>
      <p className="content-supertitle">{section.supertitle}</p>
      <h1>{section.title}</h1>
      <p className="content-label">{section.label}</p>
      <p className="content-subtitle">{section.subtitle}</p>
      <p className="content-copy">{section.copy}</p>

      {section.tags?.length > 0 && (
        <div className="content-tags" aria-label="标签">
          {section.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {section.cards?.length > 0 && (
        <div className="stage-cards">
          {section.cards.map((card) => (
            <article className="stage-card" key={card.title}>
              <p>{card.meta}</p>
              <h2>{card.title}</h2>
              <span>{card.text}</span>
              {card.href && (
                <a className="stage-card__link" href={card.href} target="_blank" rel="noreferrer">
                  {card.action ?? '打开项目'}
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
