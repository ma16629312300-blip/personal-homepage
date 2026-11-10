import { useEffect, useRef } from 'react';
import { onBeat } from '../lib/pulse.js';
import { sfx } from '../lib/sfx.js';

/* 水面涟漪：鼠标划过海面时荡开扁平的椭圆波纹。只在精确指针设备上启用，空闲时不占用动画帧。 */
export default function Ripples({ enabled, rain = false }) {
  const canvas = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const el = canvas.current;
    const ctx = el.getContext('2d');
    const ripples = [];
    let raf = 0;
    let last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
    };
    resize();

    const frame = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const r = ripples[i];
        const k = (now - r.t) / 1600;
        if (k < 0) continue;
        if (k >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        /* 石子落水：先溅起几滴水花，再荡开三圈涟漪 */
        if (r.drops) {
          const kd = (now - r.t) / 700;
          if (kd < 1) {
            ctx.fillStyle = `rgba(244, 245, 241, ${(0.9 * (1 - kd)).toFixed(3)})`;
            r.drops.forEach((d) => {
              const x = r.x + d.vx * kd * 60 * r.depth;
              const y = r.y - (d.vy * kd - 1.6 * kd * kd) * 40 * r.depth;
              ctx.beginPath();
              ctx.ellipse(x, y, 1.6 * r.depth + 0.6, 2.4 * r.depth + 0.8, 0, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }
        const rx = 14 + k * 120 * r.depth;
        ctx.strokeStyle = `rgba(244, 245, 241, ${(0.55 * (1 - k)).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        for (let j = 0; j < 2; j += 1) {
          const s = 1 - j * 0.38;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, rx * s, rx * s * 0.2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      raf = ripples.length ? requestAnimationFrame(frame) : 0;
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y < 0 || e.timeStamp - last < 110) return;
      last = e.timeStamp;
      ripples.push({ x: e.clientX - rect.left, y, t: performance.now(), depth: 0.35 + (y / rect.height) * 0.9 });
      if (ripples.length > 18) ripples.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    /* 鼓点：在月亮碎光带下方荡开一圈更大的涟漪 */
    const offBeat = onBeat((strength) => {
      const g = document.querySelector('.sea__glitter');
      const rect = el.getBoundingClientRect();
      if (!g || !rect.height) return;
      const gx = g.getBoundingClientRect();
      ripples.push({
        x: gx.left + gx.width / 2 - rect.left + (Math.random() - 0.5) * gx.width * 0.4,
        y: rect.height * (0.12 + Math.random() * 0.35),
        t: performance.now(),
        depth: 0.9 + strength,
      });
      if (ripples.length > 18) ripples.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    });

    /* 下雨：海面上不停冒出细小的雨点涟漪 */
    let rainTimer = 0;
    if (rain) {
      rainTimer = window.setInterval(() => {
        if (document.hidden) return;
        const rect = el.getBoundingClientRect();
        if (!rect.height) return;
        for (let i = 0; i < (fine ? 2 : 1); i += 1) {
          const y = rect.height * Math.random() * 0.9;
          ripples.push({ x: Math.random() * rect.width, y, t: performance.now(), depth: 0.08 + (y / rect.height) * 0.25 });
        }
        while (ripples.length > 40) ripples.shift();
        if (!raf) raf = requestAnimationFrame(frame);
      }, fine ? 90 : 200);
    }

    /* 点击海面扔一颗石子：点在按钮、文字框等可交互的东西上时不算 */
    const onClick = (e) => {
      if (e.target?.closest?.('a, button, input, textarea, label, [role="dialog"], .dlg, .pg-card, .stats, .about-tags, .contact-email')) return;
      const rect = el.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y < 6 || y > rect.height || e.clientX < rect.left || e.clientX > rect.right) return;
      const depth = 0.5 + (y / rect.height) * 1.1;
      const t = performance.now();
      const x = e.clientX - rect.left;
      const drops = Array.from({ length: 9 }, () => ({ vx: (Math.random() - 0.5) * 2.2, vy: 1.8 + Math.random() * 1.6 }));
      ripples.push({ x, y, t, depth: depth * 1.3, drops });
      ripples.push({ x, y, t: t + 160, depth });
      ripples.push({ x, y, t: t + 340, depth: depth * 0.75 });
      while (ripples.length > 40) ripples.shift();
      sfx('plop');
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('click', onClick);

    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(rainTimer);
      window.removeEventListener('click', onClick);
      offBeat();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [enabled, rain]);

  return <canvas ref={canvas} className="ripples" aria-hidden="true" />;
}
