import { forwardRef, useMemo } from 'react';
import { motion, useTransform } from 'motion/react';
import Ripples from './Ripples.jsx';

/* 月光下的海：天空、远处港岛剪影、海面波纹、月光碎光带、上浮气泡。
   城市剪影随环形轨道横向平移，转向时像在转头看海。 */

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* 代码绘制的港岛剪影（素材到位前的版本）：长桥、楼群、钟楼、港口吊车 */
function Skyline() {
  const { far, near, lights } = useMemo(() => {
    const r = rng(7);
    const far = [];
    const near = [];
    const lights = [];
    let x = 0;
    while (x < 2400) {
      const w = 26 + r() * 50;
      const h = 30 + r() * 70;
      far.push(`M${x.toFixed(0)} 200V${(200 - h).toFixed(0)}H${(x + w).toFixed(0)}V200Z`);
      x += w + r() * 10;
    }
    x = 60;
    while (x < 2400) {
      const w = 22 + r() * 44;
      const h = 18 + r() * (r() > 0.85 ? 120 : 64);
      near.push(`M${x.toFixed(0)} 200V${(200 - h).toFixed(0)}H${(x + w).toFixed(0)}V200Z`);
      for (let k = 0; k < 3; k += 1) {
        if (r() > 0.5) lights.push([x + 4 + r() * (w - 8), 200 - 6 - r() * (h - 10)]);
      }
      x += w + 4 + r() * 18;
    }
    return { far, near, lights };
  }, []);
  return (
    <svg className="skyline__art" viewBox="0 0 2400 200" preserveAspectRatio="none">
      <path className="skyline__far" d={far.join('')} />
      <path className="skyline__near" d={near.join('')} />
      {lights.map(([lx, ly], i) => <rect key={i} className="skyline__light" x={lx.toFixed(0)} y={ly.toFixed(0)} width="3" height="3" />)}
    </svg>
  );
}


/* 影时间：海面上立起的棺材与暗红色的水洼 */
const COFFINS = [[12, 30, 0.55], [21, 18, 0.4], [33, 46, 0.8], [58, 22, 0.45], [70, 58, 1], [84, 34, 0.62], [93, 14, 0.36]];
function Coffins() {
  return (
    <div className="coffins">
      {COFFINS.map(([x, y, k], i) => (
        <div key={x} className="coffin" style={{ left: `${x}%`, top: `${y}%`, '--k': k, '--i': i }}>
          <span className="coffin__pool" />
          <svg viewBox="-30 -100 60 200">
            <path className="coffin__body" d="M-17 -100 L17 -100 L27 -58 L15 100 L-15 100 L-27 -58 Z" />
            <path className="coffin__edge" d="M17 -100 L27 -58 L15 100" />
            <path className="coffin__cross" d="M-2 -76 H2 V-30 H-2 Z M-12 -62 H12 V-58 H-12 Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

const BUBBLES = [
  [8, 14, 0, 16], [17, 8, -6, 21], [29, 11, -12, 18], [44, 6, -3, 24], [58, 12, -9, 19],
  [66, 7, -15, 23], [77, 10, -5, 17], [88, 14, -11, 22], [94, 6, -2, 26],
];

function Panorama({ src }) {
  return (
    <div className="panorama">
      <Skyline />
      <img className="panorama__city" src={src} alt="" decoding="async" draggable="false" />
    </div>
  );
}

const Sea = forwardRef(function Sea({ ring, tartarus, skyline, persona, reduce }, glitterRef) {
  const shift = useTransform(ring, (a) => {
    const v = ((((a / 72) * 34) % 170) + 170) % 170;
    return `${(-v).toFixed(2)}vw`;
  });
  return (
    <div className="sea" aria-hidden="true">
      <div className="sea__sky" />
      {tartarus && <img className="sea__tartarus" src={tartarus} alt="" decoding="async" />}
      {persona && <img className="sea__persona" src={persona} alt="" decoding="async" />}
      <div className="skyline">
        <motion.div className="skyline__track" style={{ x: shift }}>
          <div className="skyline__inner">
            <Panorama src={skyline} />
            <Panorama src={skyline} />
            <Panorama src={skyline} />
          </div>
        </motion.div>
      </div>
      <div className="sea__water">
        <motion.div className="sea__waves" style={{ x: shift }} />
        <div className="sea__glitter" ref={glitterRef}>
          <span />
        </div>
        <Ripples enabled={!reduce} />
        <Coffins />
      </div>
      <div className="bubbles">
        {BUBBLES.map(([x, s, delay, dur]) => (
          <i key={x} style={{ '--x': `${x}%`, '--s': `${s}px`, '--delay': `${delay}s`, '--dur': `${dur}s` }} />
        ))}
      </div>
    </div>
  );
});

export default Sea;
