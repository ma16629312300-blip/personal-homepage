import { useEffect, useState } from 'react';
import { moonCycle, phaseName } from '../lib/moon.js';
import { useDarkHour } from '../lib/darkHour.js';
import { ARCANA_IDS, MAX_RANK, useBond } from '../lib/bond.js';
import { FESTIVAL_NAMES, homeCycle, useWorld } from '../lib/sky.js';

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

const WEATHER_ZH = { clear: '晴', rain: '雨', fog: '雾' };
function WeatherIcon({ kind }) {
  return (
    <svg className="cal__wicon" viewBox="0 0 20 20" aria-hidden="true">
      {kind === 'clear' && (
        <g>
          <circle cx="10" cy="10" r="4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="10" y1="2" x2="10" y2="4.4" transform={`rotate(${a} 10 10)`} />
          ))}
        </g>
      )}
      {kind === 'rain' && (
        <g>
          <path d="M5 11 a3.5 3.5 0 0 1 1-6.8 a4.5 4.5 0 0 1 8.4 1.3 a2.8 2.8 0 0 1 0.6 5.5 Z" />
          <line x1="7" y1="13.5" x2="6" y2="17" />
          <line x1="10.5" y1="13.5" x2="9.5" y2="17" />
          <line x1="14" y1="13.5" x2="13" y2="17" />
        </g>
      )}
      {kind === 'fog' && (
        <g>
          <line x1="3" y1="7" x2="17" y2="7" />
          <line x1="5" y1="10.5" x2="15" y2="10.5" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </g>
      )}
    </svg>
  );
}

export default function Calendar({ onRecord }) {
  const dark = useDarkHour();
  const bondState = useBond();
  const { lunar, sky, skyForced, moonForced, dreaming, weather, festival } = useWorld();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const day = now.getDay();
  const SKY_SLOT = { dawn: ['EARLY MORNING', '清晨'], day: ['DAYTIME', '白天'], dusk: ['AFTER SCHOOL', '放学后'], night: ['EVENING', '夜晚'] };
  const [slotEn, slotZh] = dark.active ? ['DARK HOUR', '影时间'] : skyForced ? SKY_SLOT[sky] : slotOf(now.getHours());
  const p = dark.active ? 0.5 : moonForced ? homeCycle(now) : moonCycle(now);
  const [moonEn, moonZh] = dark.active ? ['FULL MOON', '满月'] : phaseName(p);
  const label = `${now.getMonth() + 1}月${now.getDate()}日 星期${WEEK_ZH[day]}，${slotZh}，今日月相${moonZh}，天气${WEATHER_ZH[weather]}${festival !== 'none' ? `，今天是${FESTIVAL_NAMES[festival]}` : ''}；羁绊等级 ${bondState.rank}${bondState.cards.length ? `，已找到 ${bondState.cards.length} 张牌` : ''}`;

  return (
    <div className="cal">
      <p className="visually-hidden">{label}</p>
      <div className="cal__date" key={`${m}${d}`} aria-hidden="true">
        <span className="cal__md">{m}<i>/</i>{d}</span>
        <span className={`cal__week${day === 0 || day === 6 ? ' cal__week--rest' : ''}`}>{WEEK[day]}</span>
      </div>
      <div className="cal__slot" key={slotEn} aria-hidden="true">
        <b>{slotZh}</b>
        <span>{slotEn}</span>
        {dreaming && !dark.active && <em className="cal__dream">梦境中</em>}
      </div>
      <div className="cal__phase" aria-hidden="true">
        <MoonIcon p={p} />
        <span>{moonZh}</span>
        <i>{moonEn}</i>
        {!dark.active && (
          <span className="cal__weather" data-weather={weather}>
            <WeatherIcon kind={weather} />
            {WEATHER_ZH[weather]}
          </span>
        )}
        {!dark.active && festival !== 'none' && <em className="cal__event cal__event--fest">{FESTIVAL_NAMES[festival]}</em>}
        {!dark.active && festival === 'none' && lunar === 'full' && <em className="cal__event">今夜满月</em>}
        {!dark.active && festival === 'none' && lunar === 'new' && <em className="cal__event">月隐之夜</em>}
      </div>
      <button type="button" className="cal__bond" key={`r${bondState.rank}`} onClick={onRecord} aria-label="打开羁绊记录">
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
      </button>
    </div>
  );
}
