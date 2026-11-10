import { useEffect, useMemo } from 'react';
import { images } from '../data/sections.js';

/* 叙事化转场：首页 → 个人简介。
   ① 远景：单轨列车从右侧呼啸进站，减速停稳，中间车厢的车门停在画面正中；
   ② 镜头朝车门推进，切到车门特写；
   ③ 车门向两侧滑进车厢墙内，露出后面的列车车厢（个人简介页）；
   ④ 镜头穿门而入，转场结束。 */
const DOOR_X = 0.516; // 车门在远景图里的横向位置（占图宽）
const DOOR_Y = 0.73; // 车门中心的纵向位置（占图高）
const DOOR_H = 0.24; // 车门高度（占图高）
const RATIO = 724 / 2172;

const LENGTH = { arrive: 2500, depart: 2300, exit: 1900 };

export default function TrainArrive({ kind = 'arrive', onDone }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, LENGTH[kind]);
    return () => window.clearTimeout(id);
  }, [onDone, kind]);

  const vars = useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mobile = w < 761 || (w <= 1100 && h > w);
    const W = (mobile ? 3 : 1.5) * w;
    const H = W * RATIO;
    const close = (mobile ? 0.6 : 0.86) * h;
    const zoom = close / (DOOR_H * H);
    return {
      '--tw': `${W.toFixed(0)}px`,
      '--tl': `${(w / 2 - DOOR_X * W).toFixed(0)}px`,
      '--tt': `${(h * 0.52 - DOOR_Y * H).toFixed(0)}px`,
      '--zoom': zoom.toFixed(2),
      '--door-h': `${close.toFixed(0)}px`,
    };
  }, []);

  return (
    <div className="train" data-kind={kind} style={vars} aria-hidden="true">
      <div className="train__dim" />
      {kind !== 'exit' && <div className="train__streaks" />}
      {kind !== 'exit' && <img className="train__wide" src={images.monorail} alt="" draggable="false" />}
      <div className="train__close">
        <span className="train__wall train__wall--l" />
        <span className="train__wall train__wall--r" />
        <span className="train__door train__door--l" style={{ backgroundImage: `url(${images.trainDoors})` }} />
        <span className="train__door train__door--r" style={{ backgroundImage: `url(${images.trainDoors})` }} />
        <span className="train__glow" />
      </div>
    </div>
  );
}
