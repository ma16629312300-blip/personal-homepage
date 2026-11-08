import { useEffect, useRef } from 'react';
import { useWorld } from '../lib/sky.js';

/* 天气与节日的画面层：雨、雾、烟花、银河、圣诞彩灯。全部用代码画。 */

/* 雨：前景斜雨（CSS），海面的雨点涟漪由 Ripples 负责 */
export function WeatherFront({ reduce }) {
  const { weather, festival } = useWorld();
  return (
    <>
      {weather === 'rain' && !reduce && (
        <div className="rain" aria-hidden="true">
          <span className="rain__layer rain__layer--far" />
          <span className="rain__layer rain__layer--near" />
        </div>
      )}
      {festival === 'christmas' && <Garland />}
    </>
  );
}

/* 雾：几条缓慢漂移的雾带，压在海平线附近 */
export function Fog() {
  return (
    <div className="fog" aria-hidden="true">
      <span className="fog__band fog__band--a" />
      <span className="fog__band fog__band--b" />
      <span className="fog__band fog__band--c" />
    </div>
  );
}

/* 圣诞彩灯：沿画面顶端垂下的一串小灯 */
function Garland() {
  const bulbs = Array.from({ length: 24 }, (_, i) => {
    const x = (i + 0.5) * (100 / 24);
    const t = (x % 25) / 25;
    const y = 20 + Math.sin(t * Math.PI) * 52;
    return { x, y, k: i % 4 };
  });
  return (
    <div className="garland" aria-hidden="true">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none">
        {[0, 25, 50, 75].map((x0) => (
          <path key={x0} d={`M${x0} 2 Q${x0 + 12.5} 12.4 ${x0 + 25} 2`} className="garland__wire" />
        ))}
      </svg>
      {bulbs.map((b, i) => (
        <i
          key={i}
          className={`garland__bulb garland__bulb--${b.k}`}
          style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${(i % 6) * 0.35}s` }}
        />
      ))}
    </div>
  );
}

/* 烟花：元旦与春节的夜空，在海平线上方随机绽放 */
export function Fireworks({ reduce }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduce) return undefined;
    const el = ref.current;
    const ctx = el.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const COLORS = ['244,245,241', '255,101,93', '120,170,255', '255,214,120'];
    let parts = [];
    let raf = 0;
    let next = 0;
    const resize = () => {
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
    };
    resize();
    const burst = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const x = w * (0.1 + Math.random() * 0.8);
      const y = h * (0.12 + Math.random() * 0.4);
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      const n = 46 + Math.floor(Math.random() * 24);
      const speed = 2.6 + Math.random() * 1.8;
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * Math.PI * 2;
        parts.push({ x, y, vx: Math.cos(a) * speed * (0.7 + Math.random() * 0.3), vy: Math.sin(a) * speed * (0.7 + Math.random() * 0.3), life: 1, c });
      }
    };
    const frame = (now) => {
      if (!document.hidden && now > next) {
        burst();
        next = now + 700 + Math.random() * 1300;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, el.clientWidth, el.clientHeight);
      parts = parts.filter((p) => p.life > 0);
      ctx.lineCap = 'round';
      parts.forEach((p) => {
        const ox = p.x;
        const oy = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.vx *= 0.978;
        p.vy *= 0.978;
        p.life -= 0.0105;
        const a = Math.max(0, p.life);
        ctx.strokeStyle = `rgba(${p.c},${a.toFixed(3)})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(ox - p.vx * 3, oy - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(${p.c},${(a * 0.25).toFixed(3)})`;
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduce]);
  return <canvas ref={ref} className="fireworks" aria-hidden="true" />;
}
