export default function TransitionWipe({ active, section }) {
  return (
    <div className="transition-wipe" data-active={active ? 'true' : 'false'} data-testid="transition-wipe" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <strong className="transition-wipe__title" data-testid="transition-title">
        {section?.title}
      </strong>
      <em className="transition-wipe__label">{section?.label}</em>
    </div>
  );
}
