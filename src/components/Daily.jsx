import { useEffect, useState } from 'react';
import { tr } from '../lib/i18n.js';
import { images, majorArcana, stats } from '../data/sections.js';
import { bond } from '../lib/bond.js';
import { useNow } from '../lib/sky.js';
import { sfx } from '../lib/sfx.js';

/* 每日塔罗：每位访客每天一张。用"日期 + 访客自己的随机种子"决定，同一天反复打开还是同一张。 */
const KEY = 'tiaotiao.daily.v1';
const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};
const write = (v) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* 存不住就只在本次有效 */
  }
};
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
function cardFor(day, seed) {
  let h = seed >>> 0;
  for (const c of day) h = Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0;
  return h % majorArcana.length;
}

export function DailyTarot() {
  const now = useNow();
  const day = dayKey(now);
  const [store, setStore] = useState(read);
  const [flipping, setFlipping] = useState(false);
  const drawn = store.day === day ? store.card : null;

  useEffect(() => {
    if (store.seed == null) {
      const next = { ...store, seed: Math.floor(Math.random() * 2 ** 31) };
      write(next);
      setStore(next);
    }
  }, [store]);

  const draw = () => {
    if (drawn != null) return;
    const card = cardFor(day, store.seed ?? 1);
    const next = { ...store, day, card };
    write(next);
    setStore(next);
    setFlipping(true);
    sfx('card');
    bond('daily');
    window.setTimeout(() => setFlipping(false), 900);
  };

  const a = drawn != null ? majorArcana[drawn] : null;
  return (
    <div className="pg-card pg-card--daily">
      <button
        type="button"
        className="card daily"
        data-drawn={a != null}
        data-flipping={flipping}
        onClick={draw}
        onPointerEnter={() => sfx('hover')}
        aria-label={a ? `${tr('今日塔罗：')}${a[0]} ${tr(a[2])}` : tr('抽一张今天的塔罗')}
      >
        <span className="daily__inner">
          <span className="daily__back" style={{ backgroundImage: `url(${images.cardBack})` }}>
            <span className="daily__ask">TAP</span>
          </span>
          <span className="daily__face" aria-hidden="true">
            {a && (
              <>
                <span className="daily__num">{a[0]}</span>
                <span className="daily__star" />
                <span className="daily__name">
                  <b>{a[1]}</b>
                  <i>{tr(a[2])}</i>
                </span>
              </>
            )}
          </span>
        </span>
      </button>
      <span className="pg-card__title">{tr('今日塔罗')}</span>
      <span className="pg-card__teaser" aria-live="polite">
        {a ? (
          <>
            <b className="daily__verdict">{tr(a[2])}</b>
            {tr(a[3])}
            <small className="daily__again">{tr('明天再来抽一张。')}</small>
          </>
        ) : (
          tr('每天可以抽一张，看看今天的运势。')
        )}
      </span>
    </div>
  );
}

/* 人物参数：仿 P3 的五维属性，页面停下时条格依次点亮 */
export function Stats() {
  return (
    <section className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="stats__title">
        PARAMETERS <span>{tr('人物参数')}</span>
      </h2>
      <ul className="stats__list">
        {stats.map((s, i) => (
          <li key={s.en} className="stat" style={{ '--i': i }}>
            <span className="stat__name">
              <b>{tr(s.zh)}</b>
              <i>{s.en}</i>
            </span>
            <span className="stat__bar" aria-hidden="true">
              {Array.from({ length: 6 }, (_, k) => (
                <i key={k} data-on={k < s.lv} style={{ '--k': k }} />
              ))}
            </span>
            <span className="stat__lv">{s.lv >= 6 ? 'MAX' : `Lv.${s.lv}`}</span>
            <span className="stat__note">「{tr(s.note)}」</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
