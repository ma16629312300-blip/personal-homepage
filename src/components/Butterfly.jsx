import { useEffect, useRef, useState } from 'react';

/* 天鹅绒房间的蓝蝶：栏目切换停稳后，偶尔从画面里缓缓飞过。至少间隔 25 秒，约一半概率出现。 */
export default function Butterfly({ settled, reduce }) {
  const [flight, setFlight] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    if (!settled || reduce) return undefined;
    const id = window.setTimeout(() => {
      const now = Date.now();
      if (now - last.current < 25000 || (last.current && Math.random() < 0.5)) return;
      last.current = now;
      setFlight((n) => n + 1);
    }, 900);
    return () => window.clearTimeout(id);
  }, [settled, reduce]);

  if (!flight) return null;
  return (
    <div key={flight} className="butterfly" data-route={flight % 2 ? 'a' : 'b'} aria-hidden="true">
      <svg viewBox="-40 -32 80 64">
        <g className="butterfly__wing butterfly__wing--l">
          <path d="M-2 -2 C-14 -30 -38 -30 -36 -10 C-35 2 -20 4 -4 2 Z" />
          <path d="M-3 3 C-20 6 -30 22 -18 28 C-10 31 -4 18 -2 6 Z" />
        </g>
        <g className="butterfly__wing butterfly__wing--r">
          <path d="M2 -2 C14 -30 38 -30 36 -10 C35 2 20 4 4 2 Z" />
          <path d="M3 3 C20 6 30 22 18 28 C10 31 4 18 2 6 Z" />
        </g>
        <path className="butterfly__body" d="M-1.2 -10 L1.2 -10 L1 16 L-1 16 Z" />
      </svg>
    </div>
  );
}
