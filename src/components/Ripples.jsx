import { useEffect, useRef } from 'react';

/* 水面涟漪：鼠标划过海面时荡开扁平的椭圆波纹。只在精确指针设备上启用，空闲时不占用动画帧。 */
export default function Ripples({ enabled }) {
  const canvas = useRef(null);

  useEffect(() => {
    if (!enabled || !window.matchMedia('(pointer: fine)').matches) return undefined;
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

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [enabled]);

  return <canvas ref={canvas} className="ripples" aria-hidden="true" />;
}
