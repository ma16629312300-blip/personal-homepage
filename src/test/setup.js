import '@testing-library/jest-dom/vitest';

/* jsdom 没有 matchMedia，也不会真正播完动画。
   测试按桌面、精确指针、开启“减少动态效果”处理：栏目即时切换，同时覆盖这一模式。 */
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: query.includes('pointer: fine') || query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
