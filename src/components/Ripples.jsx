import { useEffect, useRef } from 'react';
import { onBeat } from '../lib/pulse.js';

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
        if (k >= 1) {
          ripples.splice(i, 1);
          continue;
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
        for (let i = 0; i < 2; i += 1) {
          const y = rect.height * Math.random() * 0.9;
          ripples.push({ x: Math.random() * rect.width, y, t: performance.now(), depth: 0.08 + (y / rect.height) * 0.25 });
        }
        while (ripples.length > 40) ripples.shift();
        if (!raf) raf = requestAnimationFrame(frame);
      }, 90);
    }

    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(rainTimer);
      offBeat();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [enabled, rain]);

  return <canvas ref={canvas} className="ripples" aria-hidden="true" />;
}
