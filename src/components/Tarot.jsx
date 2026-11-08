import { useEffect, useMemo } from 'react';
import { images } from '../data/sections.js';

/* 塔罗卡牌与“召唤”击碎效果。牌面素材未到位时，用代码画的星星 / 月亮占位。 */

function PlaceholderFace({ kind }) {
  return (
    <svg className="card__art" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="100" height="160" className="card__art-bg" />
      <rect x="0" y="108" width="100" height="52" className="card__art-sea" />
      {kind === 'star' ? (
        <g className="card__art-ink">
          <path d="M50 26 L55 50 L78 54 L55 58 L50 82 L45 58 L22 54 L45 50 Z" />
          {[[22, 30], [80, 26], [16, 74], [84, 78], [30, 96], [70, 98], [50, 12]].map(([x, y]) => (
            <path key={`${x}${y}`} d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z`} />
          ))}
          {[114, 120, 127, 135].map((y, i) => <rect key={y} x={44 - i * 4} y={y} width={12 + i * 8} height="1.6" />)}
        </g>
      ) : (
        <g className="card__art-ink">
          <circle cx="50" cy="48" r="24" />
          <rect x="18" y="70" width="10" height="40" />
          <rect x="72" y="70" width="10" height="40" />
          {[[36, 84, -8], [60, 92, 10], [46, 100, 4]].map(([x, y, r]) => (
            <rect key={x} x={x} y={y} width="12" height="14" className="card__art-frame" transform={`rotate(${r} ${x + 6} ${y + 7})`} />
          ))}
          <path d="M44 110 L56 110 L64 160 L36 160 Z" className="card__art-path" />
        </g>
      )}
      <rect x="3" y="3" width="94" height="154" className="card__art-border" />
    </svg>
  );
}

export function CardFace({ item }) {
  return (
    <div className="card__face">
      {item.face ? <img className="card__art" src={item.face} alt="" decoding="async" draggable="false" /> : <PlaceholderFace kind={item.faceKind} />}
      <span className="card__num">{item.arcana[0]}</span>
      <span className="card__name">
        <b>{item.arcana[1]}</b>
        <i>{item.arcana[2]}</i>
      </span>
      <span className="card__sheen" />
    </div>
  );
}

/* 把卡牌从中心辐射切成三角碎片，碎片向外飞散 */
export function Shatter({ rect, item, onDone, center = false }) {
  const shards = useMemo(() => {
    const n = 14;
    const cx = 46 + Math.random() * 8;
    const cy = 44 + Math.random() * 10;
    const border = [];
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const k = Math.min(Math.abs((dx > 0 ? 100 - cx : cx) / (dx || 1e-6)), Math.abs((dy > 0 ? 100 - cy : cy) / (dy || 1e-6)));
      border.push([cx + dx * k, cy + dy * k, a]);
    }
    return border.map((p, i) => {
      const q = border[(i + 1) % n];
      const mid = (p[2] + (i === n - 1 ? q[2] + Math.PI * 2 : q[2])) / 2;
      const dist = 120 + Math.random() * 180;
      return {
        clip: `polygon(${cx}% ${cy}%, ${p[0]}% ${p[1]}%, ${q[0]}% ${q[1]}%)`,
        tx: Math.cos(mid) * dist,
        ty: Math.sin(mid) * dist + 40,
        rot: (Math.random() - 0.5) * 220,
        delay: Math.random() * 0.06,
      };
    });
  }, []);

  useEffect(() => {
    const id = window.setTimeout(onDone, 620);
    return () => window.clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const style = center
    ? { left: '50%', top: '50%', width: 'min(34vh, 60vw)', aspectRatio: '5 / 8', translate: '-50% -50%' }
    : { left: rect.left, top: rect.top, width: rect.width, height: rect.height };

  return (
    <div className="shatter" style={style} aria-hidden="true">
      <span className="shatter__flash" />
      {shards.map((s, i) => (
        <div
          key={i}
          className="shatter__shard"
          style={{ clipPath: s.clip, '--tx': `${s.tx.toFixed(0)}px`, '--ty': `${s.ty.toFixed(0)}px`, '--rot': `${s.rot.toFixed(0)}deg`, '--delay': `${(0.1 + s.delay).toFixed(2)}s` }}
        >
          {item ? <CardFace item={item} /> : <div className="card__back" style={{ backgroundImage: `url(${images.cardBack})` }} />}
        </div>
      ))}
      <svg className="shatter__cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
        {shards.map((s, i) => {
          const m = s.clip.match(/polygon\(([\d.]+)% ([\d.]+)%, ([\d.]+)% ([\d.]+)%/);
          return m ? <line key={i} x1={m[1]} y1={m[2]} x2={m[3]} y2={m[4]} /> : null;
        })}
      </svg>
    </div>
  );
}
