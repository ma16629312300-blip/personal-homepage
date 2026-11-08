import { useMemo } from 'react';

/* 夜樱花瓣：只在“学校”的几页（项目、有趣功能、联系）飘落 */
export default function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: 30 + Math.random() * 75,
        s: 8 + Math.random() * 9,
        d: -Math.random() * 14,
        t: 10 + Math.random() * 8,
        w: -(18 + Math.random() * 30),
        r: Math.random() * 360,
        k: i % 3,
      })),
    [],
  );
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p, i) => (
        <i
          key={i}
          className={`petal petal--${p.k}`}
          style={{ '--x': `${p.x}%`, '--s': `${p.s}px`, '--d': `${p.d}s`, '--t': `${p.t}s`, '--w': `${p.w}vw`, '--r': `${p.r}deg` }}
        />
      ))}
    </div>
  );
}
