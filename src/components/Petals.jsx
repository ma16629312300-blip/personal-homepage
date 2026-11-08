import { useMemo } from 'react';
import { useWorld } from '../lib/sky.js';

/* 随真实季节变化的飘落物：春樱、夏萤、秋叶、冬雪。
   春秋只在"学校"的几页（樱花道）出现，夏夜萤火与冬雪全站都有。 */
const COUNT = { spring: 18, summer: 16, autumn: 16, winter: 36 };

export default function Petals() {
  const { season } = useWorld();
  const items = useMemo(
    () =>
      /* 手机上数量减半，减轻转场时的负担 */
      Array.from({ length: Math.round(COUNT[season] * (window.matchMedia('(max-width: 760px), (max-width: 1100px) and (orientation: portrait)').matches ? 0.55 : 1)) }, (_, i) => ({
        x: season === 'spring' || season === 'autumn' ? 30 + Math.random() * 75 : Math.random() * 100,
        y: 40 + Math.random() * 55,
        s: season === 'winter' ? 3 + Math.random() * 5 : season === 'summer' ? 3 + Math.random() * 3 : 8 + Math.random() * 9,
        d: -Math.random() * 14,
        t: season === 'winter' ? 12 + Math.random() * 10 : season === 'summer' ? 5 + Math.random() * 6 : 10 + Math.random() * 8,
        w: season === 'winter' ? -(4 + Math.random() * 10) : -(18 + Math.random() * 30),
        r: Math.random() * 360,
        k: i % 3,
      })),
    [season],
  );
  return (
    <div className="petals" data-kind={season} aria-hidden="true">
      {items.map((p, i) => (
        <i
          key={`${season}-${i}`}
          className={`petal petal--${p.k}`}
          style={{
            '--x': `${p.x}%`,
            '--y': `${p.y}%`,
            '--s': `${p.s}px`,
            '--d': `${p.d}s`,
            '--t': `${p.t}s`,
            '--w': `${p.w}vw`,
            '--r': `${p.r}deg`,
          }}
        />
      ))}
    </div>
  );
}
