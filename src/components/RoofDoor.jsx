import { useEffect } from 'react';
import { images } from '../data/sections.js';

/* 叙事化转场：有趣功能 → 联系我。
   画面切到楼梯间尽头的天台铁门，门缝漏着光；铁门被推开（以左侧门轴转开），
   门外就是天台的夜空，镜头穿门而出。 */
export default function RoofDoor({ onDone }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 2300);
    return () => window.clearTimeout(id);
  }, [onDone]);
  return (
    <div className="roof" aria-hidden="true">
      <div className="roof__scene">
        <div className="roof__wall" style={{ backgroundImage: `url(${images.stairwell})` }} />
        <span className="roof__light" />
        <span className="roof__door" style={{ backgroundImage: `url(${images.roofDoor})` }} />
      </div>
    </div>
  );
}
