import { useEffect, useRef } from 'react';

/* 专属光标（只在电脑上）：跟随鼠标的小月亮光环；移到能点的东西上时放大，变成时钟刻度圈；按下时收紧。
   系统光标仍然保留，光环只是陪衬，不影响操作。 */
const HOT = 'a, button, [role="button"], input, label, .clock-hit, .meteor, .hcard, .pg-card';

export default function Cursor() {
  const ring = useRef(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const el = ring.current;
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    const tick = () => {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      el.dataset.on = 'true';
      el.dataset.hot = Boolean(e.target?.closest?.(HOT)).toString();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onDown = () => {
      el.dataset.down = 'true';
    };
    const onUp = () => {
      el.dataset.down = 'false';
    };
    const onLeave = () => {
      el.dataset.on = 'false';
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return (
    <div ref={ring} className="cursor" data-on="false" aria-hidden="true">
      <span className="cursor__ring" />
      <span className="cursor__moon" />
    </div>
  );
}
