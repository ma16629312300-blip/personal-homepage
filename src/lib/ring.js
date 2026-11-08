/* 环形轨道的几何参数。5 个栏目均匀分布，每站相隔 72°。
   数值存放在可变对象里，由动画值的变换函数读取，窗口尺寸变化时更新，不触发 React 重渲染。 */
export const STEP = 72;
export const geom = { R: 1100, scale: 1, mobile: false };

export function updateGeom() {
  const w = window.innerWidth;
  geom.mobile = window.matchMedia('(max-width: 760px), (max-width: 1100px) and (orientation: portrait)').matches;
  geom.R = geom.mobile ? w * 1.5 : w * 0.82;
  geom.scale = geom.mobile ? 0.42 : 1;
}

export const mod = (n, m) => ((n % m) + m) % m;
export const wrap180 = (v) => mod(v + 180, 360) - 180;

/* 让某一层沿环形轨道运动：d 为该层相对正文的深度（越大越靠前、半径越大、位移越多），
   spin 为自身朝向随轨道转动的比例，par 为指针视差幅度。静止时返回 none，保证正文不被变换。 */
export function orbit(r, d, spin, tx = 0, ty = 0, tiltY = 0, tiltX = 0) {
  const a = r * geom.scale;
  if (Math.abs(a) < 0.01 && Math.abs(tx) < 0.05 && Math.abs(ty) < 0.05 && Math.abs(tiltY) < 0.01 && Math.abs(tiltX) < 0.01) return 'none';
  const t = (a * Math.PI) / 180;
  const rad = geom.R + d;
  const x = Math.sin(t) * rad + tx;
  const z = (Math.cos(t) - 1) * rad;
  const ry = a * spin + tiltY;
  const rx = -Math.abs(a) * 0.06 + tiltX;
  return `translate3d(${x.toFixed(1)}px, ${ty.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
}

/* 转场进度：从一站走到下一站时 0→1（反向时 1→0），静止在站位上为 0 或 1 */
export function sweepProgress(a) {
  const r = mod(a, STEP);
  return r / STEP;
}

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
export const panelOpacity = (r) => 1 - smooth(6, 52, Math.abs(r));
