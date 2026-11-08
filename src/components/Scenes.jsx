import { useEffect, useState } from 'react';
import { images } from '../data/sections.js';
import { useWorld } from '../lib/sky.js';

/* 随季节换装的图片：当季的那张淡入，上一季的淡出。只加载看到过的季节。 */
function Seasonal({ set, className }) {
  const { season } = useWorld();
  const [seen, setSeen] = useState(() => [season]);
  useEffect(() => {
    setSeen((list) => (list.includes(season) ? list : [...list, season]));
  }, [season]);
  return seen.map((k) => (
    <img key={k} className={`${className} season-img`} data-on={k === season} src={set[k]} alt="" decoding="async" draggable="false" />
  ));
}

/* 栏目场景：楼梯、窗户、天台栏杆。几何来自素材包 v4 的精确 SVG 坐标，颜色跟随主题变量。 */
const RISE = 128;
const RUN = 220;
const DX = 180;
const DY = -83.935378;
const steps = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, x: 160 + RUN * i, y: 1216 - RISE * i }));


/* 漂浮剪纸碎片：停下后的环境动态。每片的位置、大小、颜色、节奏各不相同，只在当前栏目播放 */
const SHAPES = ['polygon(0 30%, 100% 0, 70% 100%)', 'polygon(10% 0, 100% 40%, 60% 100%, 0 70%)', 'polygon(0 0, 100% 20%, 40% 100%)'];
export function Drift({ items, kind }) {
  return (
    <div className={`drift drift--${kind}`} aria-hidden="true">
      {items.map(([x, y, size, tone, delay, dur], i) => (
        <i
          key={i}
          className={`frag frag--${tone}`}
          style={{
            '--x': `${x}%`, '--y': `${y}%`, '--s': `${size}px`, '--delay': `${delay}s`, '--dur': `${dur}s`,
            clipPath: SHAPES[i % SHAPES.length],
          }}
        />
      ))}
    </div>
  );
}

const STAIR_DRIFT = [
  [8, 92, 14, 'ivory', 0, 11], [22, 80, 9, 'night', -3, 13], [34, 74, 12, 'coral', -6, 12],
  [46, 60, 8, 'ivory', -1.5, 10], [58, 52, 16, 'night', -8, 15], [70, 40, 10, 'ivory', -4, 12],
];
const PLATFORM_DRIFT = [
  [10, 30, 18, 'ivory', 0, 9], [24, 64, 11, 'night', -2, 11], [42, 18, 9, 'coral', -5, 10],
  [64, 8, 14, 'ivory', -3, 12], [80, 46, 10, 'night', -7, 13], [92, 22, 16, 'ivory', -1, 10], [52, 80, 8, 'ivory', -4, 9],
];

export function StairsScene({ figure, school }) {
  return (
    <>
    <Seasonal set={school} className="school-hill" />
    <div className="scene scene--stairs">
      <svg className="stairs" viewBox="0 0 2400 1600" aria-hidden="true">
        <polygon className="stairs__shadow" points="160,1408 1920,384 1960,432 200,1456" />
        {[...steps].reverse().map((s) => (
          <g key={s.id} className="step" style={{ '--i': s.id }}>
            <g transform={`translate(${s.x} ${s.y})`}>
              <polygon className="step__side" points={`0,0 ${RUN},0 ${RUN},64 0,192`} />
              <polygon className="step__riser" points={`0,0 ${DX},${DY} ${DX},${DY + RISE} 0,${RISE}`} />
              <polygon className="step__tread" points={`0,0 ${RUN},0 ${RUN + DX},${DY} ${DX},${DY}`} />
            </g>
          </g>
        ))}
      </svg>
      <Drift items={STAIR_DRIFT} kind="stairs" />
      <img className="scene-figure scene-figure--climb" src={figure} alt="" decoding="async" draggable="false" />
    </div>
    </>
  );
}

/* 夜间单轨车厢：车厢素材的三扇圆角窗是镂空的，窗外就是全站共享的海、港岛与月亮。
   人物坐在长椅上；一道窗外掠过的灯光周期性扫过车厢，表现列车在行驶。 */
export function CarriageScene({ figure, carriage, persona }) {
  return (
    <div className="scene scene--carriage">
      <img className="carriage" src={carriage} alt="" decoding="async" draggable="false" />
      <span className="carriage__sweep" />
      {persona && <img className="carriage__persona" src={persona} alt="" decoding="async" draggable="false" />}
      <img className="scene-figure scene-figure--seat-train" src={figure} alt="" decoding="async" draggable="false" />
    </div>
  );
}

/* 夜樱枝：伸入画面右上角，轻轻摇曳 */
export function SakuraBranch() {
  return <Seasonal set={images.sakuraSeasons} className="sakura-branch" />;
}

export function PlatformScene({ figure }) {
  return (
    <div className="scene scene--platform">
      <Drift items={PLATFORM_DRIFT} kind="platform" />
      <svg className="platform" viewBox="0 0 1000 1000" aria-hidden="true">
        <g className="platform__body">
          <polygon className="step__tread" points="600,620 2000,620 2140,555 740,555" />
          <polygon className="step__riser" points="600,620 2000,620 2000,1000 600,1000" />
          <polygon className="step__side" points="600,620 740,555 740,935 600,1000" />
          <rect className="platform__edge" x="600" y="618" width="1400" height="5" />
        </g>
      </svg>
      <img className="scene-figure scene-figure--seat" src={figure} alt="" decoding="async" draggable="false" />
    </div>
  );
}

export function RooftopScene() {
  const posts = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="scene scene--rooftop">
      <div className="clouds" aria-hidden="true">
        <i /><i /><i />
      </div>
      <svg className="railing" viewBox="0 0 2200 300" preserveAspectRatio="none" aria-hidden="true">
        {posts.map((i) => (
          <rect key={i} className="railing__post" x={20 + i * 100} y="40" width="14" height="260" style={{ '--i': i }} />
        ))}
        <rect className="railing__rail" x="0" y="150" width="2200" height="10" />
        <rect className="railing__top" x="0" y="24" width="2200" height="26" />
        <rect className="railing__glint" x="0" y="24" width="2200" height="4" />
      </svg>
    </div>
  );
}

export const SCENES = { about: CarriageScene, projects: StairsScene, playground: PlatformScene, contact: RooftopScene };
