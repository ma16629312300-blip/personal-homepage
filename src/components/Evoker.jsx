import { tr } from '../lib/i18n.js';

/* 召唤器：点击后画面出现裂纹、卡牌碎裂，人格面具在主角身后浮现，并弹出召唤标签 */
export function EvokerButton({ onEvoke, disabled }) {
  return (
    <button type="button" className="evoker" onClick={onEvoke} disabled={disabled} aria-label={tr('召唤人格面具')}>
      <svg viewBox="0 0 48 28" aria-hidden="true">
        <path className="evoker__body" d="M4 6 H38 L44 9 V13 H22 L20 15 H16 L13 26 H5 L8 13 H4 Z" />
        <path className="evoker__hi" d="M6 8 H37" />
        <circle className="evoker__ring" cx="17" cy="17" r="3.4" />
      </svg>
      <span>EVOKE</span>
      <strong>{tr('召唤')}</strong>
    </button>
  );
}

export function EvokeCrack() {
  const rays = [-160, -118, -70, -32, 8, 46, 92, 134];
  return (
    <div className="evoke-crack" aria-hidden="true">
      <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice">
        {rays.map((a) => {
          const t = (a * Math.PI) / 180;
          const m = 34 + Math.abs(Math.sin(t * 3)) * 18;
          const k = (a % 3) * 6 - 6;
          return (
            <polyline
              key={a}
              points={`0,0 ${(Math.cos(t) * m).toFixed(1)},${(Math.sin(t) * m).toFixed(1)} ${(Math.cos(t + 0.12) * (m + 30) + k).toFixed(1)},${(Math.sin(t + 0.12) * (m + 30)).toFixed(1)} ${(Math.cos(t) * 140).toFixed(1)},${(Math.sin(t) * 140).toFixed(1)}`}
            />
          );
        })}
        <circle r="10" />
        <circle r="22" />
      </svg>
    </div>
  );
}

export function SummonLabel({ guardian }) {
  /* 影时间里召唤的仍是 HOROLOGIUM；平时召唤出当前页的守护灵 */
  if (guardian) {
    return (
      <div className="summon-label" aria-hidden="true">
        <span className="summon-label__kind">
          {guardian.arcana[0]} · {guardian.arcana[1]}
        </span>
        <strong className="summon-label__name">{guardian.en}</strong>
        <span className="summon-label__zh">{tr(guardian.name)}</span>
        <span className="summon-label__skill">
          <b>{guardian.skill[0]}</b> {tr(guardian.skill[1])}
        </span>
      </div>
    );
  }
  return (
    <div className="summon-label" aria-hidden="true">
      <span className="summon-label__kind">PERSONA</span>
      <strong className="summon-label__name">HOROLOGIUM</strong>
      <span className="summon-label__zh">{tr('时之守望者')}</span>
      <span className="summon-label__skill">
        <b>Midnight Hand</b> {tr('零时之针')}
      </span>
    </div>
  );
}

/* 守护灵从画面右侧浮现，几秒后随召唤一起退场 */
export function SummonGuardian({ guardian }) {
  return (
    <div className="summon-guardian" aria-hidden="true">
      <span className="summon-guardian__ring" />
      <img src={guardian.src} alt="" decoding="async" draggable="false" />
    </div>
  );
}
