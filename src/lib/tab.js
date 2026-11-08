import { litOf } from './moon.js';

/* 浏览器标签页：图标是今天的月相（影时间里变绿），离开时标题会挽留一下 */
export function drawFavicon(p, dark) {
  try {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = dark ? '#03140c' : '#061c7a';
    g.beginPath();
    g.arc(32, 32, 31, 0, Math.PI * 2);
    g.fill();
    const R = 22;
    g.fillStyle = dark ? '#0b2a18' : '#0a2fc0';
    g.beginPath();
    g.arc(32, 32, R, 0, Math.PI * 2);
    g.fill();
    /* 受光部分：半圆 + 椭圆的组合 */
    const q = ((p % 1) + 1) % 1;
    /* 图标很小，细月牙至少画出 15% 的受光，免得看不见 */
    const lit = litOf(q);
    const f = lit > 0.02 ? Math.max(lit, 0.15) : lit;
    const rx = R * Math.abs(1 - 2 * f);
    const waxing = q <= 0.5;
    g.fillStyle = dark ? '#e3f35c' : '#f4f5f1';
    g.beginPath();
    g.arc(32, 32, R, -Math.PI / 2, Math.PI / 2, !waxing);
    g.ellipse(32, 32, rx, R, 0, Math.PI / 2, -Math.PI / 2, (f < 0.5) === waxing);
    g.fill();
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = c.toDataURL('image/png');
  } catch {
    /* 画不了就保留原图标 */
  }
}
