import { useEffect, useRef } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { images, sections } from '../data/sections.js';
import { useDarkHour } from '../lib/darkHour.js';
import { STEP, geom, mod, updateGeom } from '../lib/ring.js';
import { cycleOfWaxing, litOf, phaseName } from '../lib/moon.js';
import { homeCycle } from '../lib/sky.js';

/* 全站共享的月相钟。位置、大小、月相、指针都由环形轨道的角度插值得出：
   转场时月亮滑向新位置，月相连续盈亏，分针快进一圈。所有更新直接写 DOM，不触发 React 重渲染。 */

const R = 44;
/* 按周期位置 p 画受光部分：前半周期右侧受光（盈），后半周期左侧受光（亏） */
function moonPath(p) {
  const q = ((p % 1) + 1) % 1;
  const f = litOf(q);
  const rx = (R * Math.abs(1 - 2 * f)).toFixed(2);
  if (q <= 0.5) return `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} A${rx} ${R} 0 0 ${f < 0.5 ? 0 : 1} 0 ${-R}Z`;
  return `M0 ${-R} A${R} ${R} 0 0 0 0 ${R} A${rx} ${R} 0 0 ${f < 0.5 ? 1 : 0} 0 ${-R}Z`;
}
function remainArc(deg, r = 90) {
  const a = ((deg % 360) + 360) % 360;
  if (a < 0.5) return '';
  const t = (a * Math.PI) / 180;
  return `M${(r * Math.sin(t)).toFixed(2)} ${(-r * Math.cos(t)).toFixed(2)} A${r} ${r} 0 ${360 - a > 180 ? 1 : 0} 1 0 ${-r}`;
}
const toAngles = (h, m, s = 0) => ({ hr: ((h % 12) + m / 60 + s / 3600) * 30, mn: (m + s / 60) * 6, sc: s * 6 });
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

/* 各栏目的周期位置；首页是今天真实的月相 */
const CYCLE = {
  about: cycleOfWaxing(0.3),
  projects: 0.25,
  playground: cycleOfWaxing(0.76),
  contact: 0.5,
};
const cycleFor = (id) => (id === 'home' ? homeCycle() : CYCLE[id]);
const TIME = { about: [23, 12, 0], projects: [23, 36, 0], playground: [23, 48, 0], contact: [23, 59, 30] };

/* 各栏目的月亮布局（像素），桌面与手机分开 */
function layout(id, w, h, mobile) {
  const vw = w / 100;
  const vh = h / 100;
  if (!mobile) {
    switch (id) {
      case 'home': return { cx: 36 * vw + 38 * vh, cy: 48 * vh, d: 76 * vh };
      case 'about': {
        const W = Math.max(w, 1.777 * h);
        const H = W / 1.777;
        const left = (w - W) / 2;
        const top = (h - H) / 2;
        return { cx: left + 0.253 * W, cy: top + 0.452 * H, d: 0.24 * H };
      }
      case 'projects': return { cx: 54 * vw, cy: 19 * vh, d: 36 * vh };
      case 'playground': return { cx: 100 * vw, cy: 26 * vh, d: 60 * vh };
      default: return { cx: 53 * vw + 30 * vh, cy: 25 * vh, d: 60 * vh };
    }
  }
  const nav = 64;
  switch (id) {
    case 'home': return { cx: 26 * vw, cy: 41 * vh, d: 62 * vw };
    case 'about': {
      const W = 0.888 * h;
      const left = 50 * vw - 0.385 * W;
      return { cx: left + 0.253 * W, cy: 0.452 * 0.5 * h, d: 0.12 * h };
    }
    case 'playground': return { cx: 17 * vw, cy: 112 + 23 * vw, d: 44 * vw };
    case 'projects': return { cx: 37 * vw, cy: 22 * vh, d: 40 * vw };
    default: return { cx: 81 * vw, cy: 112 + 22 * vw, d: 44 * vw };
  }
}

const NUMERALS = ['XII', 'I', 'II', 'III', 'IV', 'V', null, 'VII', 'VIII', 'IX', 'X', 'XI'];
const ticks = Array.from({ length: 60 }, (_, i) => i);

export default function MoonClock({ ring, settled, reduce, onGeometry }) {
  const base = useRef({ key: '', size: 1 });
  const frame = useRef(0);
  const dark = useDarkHour();
  const wrap = useRef(null);
  const lit = useRef(null);
  const clip = useRef(null);
  const hand = { h: useRef(null), m: useRef(null), s: useRef(null) };
  const arc = useRef(null);
  const label = useRef(null);
  const labelZh = useRef(null);
  const spin = useMotionValue(0);
  const spinFrom = useRef(null);
  const contactStart = useRef(0);
  const darkRef = useRef(dark.active);
  darkRef.current = dark.active;

  const timeFor = (id) => {
    if (id === 'home') {
      const d = new Date();
      return toAngles(d.getHours(), d.getMinutes(), d.getSeconds());
    }
    if (id === 'contact' && contactStart.current) {
      const s = Math.min(60, 30 + (Date.now() - contactStart.current) / 1000);
      return toAngles(23, 59, Math.floor(s));
    }
    return toAngles(...TIME[id]);
  };

  const draw = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const f = ring.get() / STEP;
    const i0 = Math.floor(f);
    const t = smooth(f - i0);
    const A = sections[mod(i0, sections.length)].id;
    const B = sections[mod(i0 + 1, sections.length)].id;
    const la = layout(A, w, h, geom.mobile);
    const lb = layout(B, w, h, geom.mobile);
    const cx = lerp(la.cx, lb.cx, t);
    const cy = lerp(la.cy, lb.cy, t);
    const d = lerp(la.d, lb.d, t);
    /* 月亮固定按最大尺寸排版一次，转场时只用 transform 缩放和移动，
       不再每帧改宽高（每帧改宽高会让整个表盘重新排版和重绘，手机上很卡） */
    const key = `${w}x${h}${geom.mobile}`;
    if (base.current.key !== key) {
      base.current = { key, size: Math.max(...sections.map((sec) => layout(sec.id, w, h, geom.mobile).d)) };
      if (wrap.current) {
        wrap.current.style.width = `${base.current.size.toFixed(1)}px`;
        wrap.current.style.height = `${base.current.size.toFixed(1)}px`;
      }
    }
    if (wrap.current) {
      const k = d / base.current.size;
      wrap.current.style.transform = `translate3d(${(cx - d / 2).toFixed(1)}px, ${(cy - d / 2).toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
      wrap.current.style.opacity = '1';
    }
    onGeometry?.(cx, cy, d);

    /* 手机上转场途中月相每三帧才更新一次，减少重绘 */
    frame.current += 1;
    const moving = Math.abs(t) > 0.001 && Math.abs(t - 1) > 0.001;
    if (geom.mobile && moving && frame.current % 3) return;
    const phase = darkRef.current ? 0.5 : lerp(cycleFor(A), cycleFor(B), t);
    const path = moonPath(phase);
    lit.current?.setAttribute('d', path);
    clip.current?.setAttribute('d', path);
    const [en, zh] = phaseName(phase);
    if (label.current && label.current.textContent !== en) label.current.textContent = en;
    if (labelZh.current && labelZh.current.textContent !== zh) labelZh.current.textContent = zh;

    const ta = timeFor(A);
    const tb = timeFor(B);
    let hr = lerp(ta.hr, tb.hr, t);
    let mn = lerp(ta.mn, tb.mn, t) + 360 * t;
    let sc = lerp(ta.sc, tb.sc, t) + 720 * t;
    const k = spin.get();
    if (k > 0 && spinFrom.current) {
      const up = (v, turns) => Math.ceil(v / 360 + 0.0001) * 360 + turns * 360;
      const e = smooth(Math.min(1, k));
      hr = lerp(spinFrom.current.hr, up(spinFrom.current.hr, 0), e);
      mn = lerp(spinFrom.current.mn, up(spinFrom.current.mn, 2), e);
      sc = lerp(spinFrom.current.sc, up(spinFrom.current.sc, 3), e);
    }
    hand.h.current?.setAttribute('transform', `rotate(${hr.toFixed(2)})`);
    hand.m.current?.setAttribute('transform', `rotate(${mn.toFixed(2)})`);
    hand.s.current?.setAttribute('transform', `rotate(${sc.toFixed(2)})`);
    arc.current?.setAttribute('d', remainArc(hr));
  };

  useMotionValueEvent(ring, 'change', draw);
  useMotionValueEvent(spin, 'change', draw);

  useEffect(() => {
    updateGeom();
    draw();
    const id = window.setInterval(draw, 1000);
    const onResize = () => {
      updateGeom();
      draw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('resize', onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* 首页彩蛋：指针拨到零点 */
  useEffect(() => {
    dark.spinRef.current = (instant, done) => {
      spinFrom.current = timeFor('home');
      animate(spin, 1, { duration: instant ? 0 : 1.5, ease: 'linear', onComplete: done });
    };
    dark.spinRef.reset = () => {
      spin.set(0);
      spinFrom.current = null;
      draw();
    };
  }, [dark.spinRef, spin]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 联系页：在 23:59:30 停留 30 秒，秒针走到零点，自动进入影时间 */
  useEffect(() => {
    if (settled !== 'contact' || dark.active || reduce) {
      contactStart.current = 0;
      draw();
      return undefined;
    }
    contactStart.current = Date.now();
    const id = window.setTimeout(() => {
      spinFrom.current = toAngles(24, 0, 0);
      spin.set(1);
      dark.enterNow();
    }, 30000);
    return () => window.clearTimeout(id);
  }, [settled, dark.active, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="moon" ref={wrap} aria-hidden="true" style={{ opacity: 0 }}>
      <svg className="emblem" viewBox="-100 -100 200 200">
        <defs>
          <radialGradient id="moon-glow">
            <stop offset="0.45" className="emblem__glow-in" />
            <stop offset="1" className="emblem__glow-out" />
          </radialGradient>
          <clipPath id="moon-disc">
            <circle r={R} />
          </clipPath>
          <clipPath id="moon-clip">
            <path ref={clip} d={moonPath(0.1)} />
          </clipPath>
        </defs>
        <g className="emblem__orbit">
          <circle r="99" />
          {!reduce && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="240s" repeatCount="indefinite" />}
        </g>
        <circle className="emblem__ring" r="95" />
        <circle className="emblem__ring emblem__ring--inner" r="80" />
        <path ref={arc} className="emblem__remain" />
        {ticks.map((i) => (
          <line key={i} className={i % 5 === 0 ? 'emblem__tick emblem__tick--major' : 'emblem__tick'} x1="0" y1={i % 5 === 0 ? -83 : -86} x2="0" y2="-92" transform={`rotate(${i * 6})`} />
        ))}
        {NUMERALS.map((n, i) =>
          n ? (
            <text key={n} className="emblem__num" x={(70 * Math.sin((i * Math.PI) / 6)).toFixed(2)} y={(-70 * Math.cos((i * Math.PI) / 6) + 3.2).toFixed(2)} textAnchor="middle">{n}</text>
          ) : null,
        )}
        <circle className="emblem__halo" r="66" fill="url(#moon-glow)" />
        <g clipPath="url(#moon-disc)">
          <image href={images.moon} x={-R} y={-R} width={R * 2} height={R * 2} className="emblem__moon-earthshine" />
          <circle className="emblem__moon-dark" r={R} />
        </g>
        <g clipPath="url(#moon-clip)">
          <image href={images.moon} x={-R} y={-R} width={R * 2} height={R * 2} />
          <path ref={lit} className="emblem__moon-tint" d={moonPath(0.1)} />
        </g>
        <circle className="emblem__moon-edge" r={R} />
        <text ref={label} className="emblem__label" x="0" y="58" textAnchor="middle">NEW MOON</text>
        <text ref={labelZh} className="emblem__label-zh" x="0" y="68" textAnchor="middle">新月</text>
        <path ref={hand.h} className="emblem__hand" d="M-3.4 10 L-1.8 -40 L0 -48 L1.8 -40 L3.4 10 Z" />
        <path ref={hand.m} className="emblem__hand" d="M-2.4 12 L-1 -68 L0 -76 L1 -68 L2.4 12 Z" />
        <g ref={hand.s} className="emblem__second">
          <line x1="0" y1="18" x2="0" y2="-86" />
          <circle cy="14" r="2.6" />
        </g>
        <circle className="emblem__pin" r="3.2" />
      </svg>
    </div>
  );
}
