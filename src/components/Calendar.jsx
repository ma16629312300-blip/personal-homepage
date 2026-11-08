import { useEffect, useState } from 'react';
import { moonCycle, phaseName } from '../lib/moon.js';
import { useDarkHour } from '../lib/darkHour.js';
import { ARCANA_IDS, MAX_RANK, useBond } from '../lib/bond.js';

/* P3 风格日历：月/日、星期、时段与今天真实的月相。日期变化时数字翻页。 */
const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function slotOf(h) {
  if (h >= 5 && h < 8) return ['EARLY MORNING', '清晨'];
  if (h >= 8 && h < 12) return ['MORNING', '上午'];
  if (h >= 12 && h < 13) return ['LUNCHTIME', '午休'];
  if (h >= 13 && h < 16) return ['AFTERNOON', '下午'];
  if (h >= 16 && h < 18) return ['AFTER SCHOOL', '放学后'];
  if (h >= 18 && h < 23) return ['EVENING', '夜晚'];
  return ['LATE NIGHT', '深夜'];
}

function MoonIcon({ p }) {
  const R = 9;
  const q = ((p % 1) + 1) % 1;
  const f = (1 - Math.cos(2 * Math.PI * q)) / 2;
  const rx = (R * Math.abs(1 - 2 * f)).toFixed(2);
  const d = q <= 0.5
    ? `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} A${rx} ${R} 0 0 ${f < 0.5 ? 0 : 1} 0 ${-R}Z`
    : `M0 ${-R} A${R} ${R} 0 0 0 0 ${R} A${rx} ${R} 0 0 ${f < 0.5 ? 1 : 0} 0 ${-R}Z`;
  return (
    <svg className="cal__moon" viewBox="-10 -10 20 20" aria-hidden="true">
      <circle r={R} className="cal__moon-dark" />
      <path d={d} className="cal__moon-lit" />
    </svg>
  );
}

export default function Calendar() {
  const dark = useDarkHour();
  const bondState = useBond();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const day = now.getDay();
  const [slotEn, slotZh] = dark.active ? ['DARK HOUR', '影时间'] : slotOf(now.getHours());
  const p = dark.active ? 0.5 : moonCycle(now);
  const [moonEn, moonZh] = dark.active ? ['FULL MOON', '满月'] : phaseName(p);
  const label = `${now.getMonth() + 1}月${now.getDate()}日 星期${WEEK_ZH[day]}，${slotZh}，今日月相${moonZh}；羁绊等级 ${bondState.rank}${bondState.cards.length ? `，已找到 ${bondState.cards.length} 张牌` : ''}`;

  return (
    <div className="cal" role="img" aria-label={label}>
      <div className="cal__date" key={`${m}${d}`}>
        <span className="cal__md">{m}<i>/</i>{d}</span>
        <span className={`cal__week${day === 0 || day === 6 ? ' cal__week--rest' : ''}`}>{WEEK[day]}</span>
      </div>
      <div className="cal__slot" key={slotEn}>
        <b>{slotZh}</b>
        <span>{slotEn}</span>
      </div>
      <div className="cal__phase">
        <MoonIcon p={p} />
        <span>{moonZh}</span>
        <i>{moonEn}</i>
      </div>
      <div className="cal__bond" key={`r${bondState.rank}`}>
        <span>COMMU</span>
        <b>RANK {bondState.rank === MAX_RANK ? 'MAX' : bondState.rank}</b>
        <span className="cal__pips" aria-hidden="true">
          {Array.from({ length: MAX_RANK }, (_, i) => (
            <i key={i} data-on={i < bondState.rank} />
          ))}
        </span>
        {bondState.cards.length > 0 && (
          <em>
            ✦ {bondState.cards.length}/{ARCANA_IDS.length}
          </em>
        )}
      </div>
    </div>
  );
}
