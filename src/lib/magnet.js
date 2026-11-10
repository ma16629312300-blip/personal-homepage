/* 磁吸按钮：鼠标靠近可点的按钮时，按钮被轻轻吸向鼠标；离开时弹回。只在电脑（精确指针）上启用。 */
const SELECTOR = '.btn, .vbtn, .evoker, .bgm-control__button, .dlg__choice, .dark-exit, .velvet__exit, .velvet__record, .dream-menu__actions button';
const PULL = 0.28;
const MAX = 10;

export function installMagnet() {
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let el = null;
  let raf = 0;
  let pos = { x: 0, y: 0 };
  const release = () => {
    if (!el) return;
    el.style.setProperty('--mx', '0px');
    el.style.setProperty('--my', '0px');
    el.removeAttribute('data-magnet');
    el = null;
  };
  const apply = () => {
    raf = 0;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = Math.max(-MAX, Math.min(MAX, (pos.x - (r.left + r.width / 2)) * PULL));
    const dy = Math.max(-MAX, Math.min(MAX, (pos.y - (r.top + r.height / 2)) * PULL));
    el.style.setProperty('--mx', `${dx.toFixed(1)}px`);
    el.style.setProperty('--my', `${dy.toFixed(1)}px`);
  };
  const onMove = (e) => {
    pos = { x: e.clientX, y: e.clientY };
    const t = e.target?.closest?.(SELECTOR);
    if (t !== el) {
      release();
      if (t && !t.disabled) {
        el = t;
        el.setAttribute('data-magnet', '');
      }
    }
    if (el && !raf) raf = requestAnimationFrame(apply);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', release);
  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', release);
    cancelAnimationFrame(raf);
    release();
  };
}
