export default function TransitionWipe({ active, section }) {
  return (
    <div
      className="transition-wipe"
      data-active={active ? 'true' : 'false'}
      data-testid="transition-wipe"
      aria-hidden="true"
    >
      {/* Diagonal wipe bars — P5 style */}
      <span />
      <span />
      <span />
      <span />

      {/* Section title — big dramatic reveal */}
      <strong className="transition-wipe__title" data-testid="transition-title">
        {section?.title}
      </strong>

      {/* Section label */}
      <em className="transition-wipe__label">{section?.label}</em>
    </div>
  );
}
