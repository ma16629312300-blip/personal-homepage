export default function TransitionWipe({ active }) {
  return (
    <div className="transition-wipe" data-active={active ? 'true' : 'false'} data-testid="transition-wipe" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
