export default function StageMenu({ sections, activeId, onSelect }) {
  return (
    <nav className="stage-menu" aria-label="Main sections">
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          className="stage-menu__item"
          style={{ '--item-index': index }}
          data-menu-section={section.id}
          aria-pressed={section.id === activeId}
          onClick={() => onSelect(section.id)}
        >
          <span className="stage-menu__number">{section.number}</span>
          <span className="stage-menu__glyph" aria-hidden="true" />
          <span className="stage-menu__title">{section.title}</span>
          <span className="stage-menu__label">{section.label}</span>
        </button>
      ))}
    </nav>
  );
}
