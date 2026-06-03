export default function StageContent({ section }) {
  return (
    <section className="stage-content" aria-live="polite" key={section.id}>
      {section.parentId && (
        <a className="detail-back" href={`#${section.parentId}`}>
          返回有趣功能
        </a>
      )}
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
              {card.internalHref && (
                <a className="stage-card__link" href={card.internalHref}>
                  {card.action ?? '查看详情'}
                </a>
              )}
              {card.href && (
                <a className="stage-card__link" href={card.href} target="_blank" rel="noreferrer">
                  {card.action ?? '打开项目'}
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      {section.links?.length > 0 && (
        <div className="detail-actions" aria-label="项目链接">
          {section.links.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                target={link.download ? undefined : '_blank'}
                rel={link.download ? undefined : 'noreferrer'}
                download={link.download}
              >
                {link.label}
              </a>
            ) : (
              <span key={link.label} className="detail-actions__pending" aria-disabled="true">
                {link.label}
              </span>
            )
          )}
        </div>
      )}
    </section>
  );
}
