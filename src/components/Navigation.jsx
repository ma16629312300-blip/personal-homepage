export default function Navigation({ sections, activeId, onSelect }) {
  return (
    <nav className="section-nav" aria-label="Main sections">
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          className="nav-button"
          style={{ '--index': index }}
          aria-pressed={section.id === activeId}
          onClick={() => onSelect(section.id)}
        >
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  );
}
