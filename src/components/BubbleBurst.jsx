import { useEffect, useMemo, useRef, useState } from 'react';

/* 切换栏目时的粒子按目的地变化：去海边与列车是一阵气泡，进入学校是一阵被风吹过的樱花 */
const SCHOOL = new Set(['projects', 'playground', 'contact']);
export default function BubbleBurst({ route, reduce }) {
  const [burst, setBurst] = useState(0);
  const prev = useRef(route);

  useEffect(() => {
    if (prev.current === route) return;
    prev.current = route;
    if (!reduce) setBurst((n) => n + 1);
  }, [route, reduce]);

  const bubbles = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        x: Math.random() * 100,
        s: 4 + Math.random() * 14,
        d: Math.random() * 0.35,
        t: 0.9 + Math.random() * 0.7,
        w: (Math.random() - 0.5) * 6,
      })),
    [burst],
  );

  if (!burst) return null;
  const school = SCHOOL.has(route);
  return (
    <div key={burst} className={`bubble-burst${school ? ' bubble-burst--petals' : ''}`} aria-hidden="true">
      {bubbles.map((b, i) => (
        <i key={i} className={school ? `petal petal--${i % 3}` : undefined} style={{ '--x': `${b.x}%`, '--s': `${b.s}px`, '--d': `${b.d}s`, '--t': `${b.t}s`, '--w': `${b.w}vw`, '--y': `${(b.x * 0.7).toFixed(0)}vh` }} />
      ))}
    </div>
  );
}
