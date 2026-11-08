/* 真实月相：以 2000-01-06 18:14 UTC 的新月为基准，按朔望月推算。
   返回周期位置 p（0 新月 → 0.5 满月 → 1 下一个新月）。 */
const SYNODIC = 29.530588853;
const REF = Date.UTC(2000, 0, 6, 18, 14);

export function moonCycle(date = new Date()) {
  const days = (date.getTime() - REF) / 86400000;
  return (((days / SYNODIC) % 1) + 1) % 1;
}

/* 受光比例 0 → 1（满月），盈月的周期位置与受光比例互相换算 */
export const litOf = (p) => (1 - Math.cos(2 * Math.PI * p)) / 2;
export const cycleOfWaxing = (lit) => Math.acos(1 - 2 * lit) / (2 * Math.PI);

export function phaseName(p) {
  const q = ((p % 1) + 1) % 1;
  if (q < 0.03 || q > 0.97) return ['NEW MOON', '新月'];
  if (q < 0.22) return ['WAXING CRESCENT', '娥眉月'];
  if (q < 0.28) return ['FIRST QUARTER', '上弦月'];
  if (q < 0.47) return ['WAXING GIBBOUS', '盈凸月'];
  if (q < 0.53) return ['FULL MOON', '满月'];
  if (q < 0.72) return ['WANING GIBBOUS', '亏凸月'];
  if (q < 0.78) return ['LAST QUARTER', '下弦月'];
  return ['WANING CRESCENT', '残月'];
}
