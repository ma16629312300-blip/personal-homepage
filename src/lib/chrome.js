/* 记录固定界面（左上日历、左下导航）实际占了多少位置，写成 CSS 变量：
   --hud-b：日历底边；--nav-t：导航顶边（都是距视口顶部的像素）。
   竖排大标题和正文据此自动避让，不再被日历压住或撞上导航。 */
export function installChromeVars() {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return () => {};
  const root = document.documentElement;
  let raf = 0;
  const measure = () => {
    raf = 0;
    const cal = document.querySelector('.cal');
    const nav = document.querySelector('.side-nav');
    if (cal) root.style.setProperty('--hud-b', `${Math.round(cal.getBoundingClientRect().bottom)}px`);
    if (nav) root.style.setProperty('--nav-t', `${Math.round(nav.getBoundingClientRect().top)}px`);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
  const ro = new ResizeObserver(schedule);
  const watch = () => {
    ['.cal', '.side-nav'].forEach((s) => { const el = document.querySelector(s); if (el) ro.observe(el); });
    schedule();
  };
  watch();
  const late = window.setTimeout(watch, 1200);
  window.addEventListener('resize', schedule);
  return () => {
    ro.disconnect();
    window.clearTimeout(late);
    window.removeEventListener('resize', schedule);
    if (raf) cancelAnimationFrame(raf);
  };
}
