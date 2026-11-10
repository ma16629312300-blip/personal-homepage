import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useWorld } from '../lib/sky.js';
import { bond, notice } from '../lib/bond.js';
import { tr } from '../lib/i18n.js';
import { buzz, sfx } from '../lib/sfx.js';

/* 新月之夜的秘密：没有月光的晚上，偶尔有流星划过。追上一颗就可以许愿。
   愿望只存在访客自己的浏览器里。 */
const KEY = 'tiaotiao.wishes.v1';
function saveWish(text) {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    list.push({ text, at: Date.now() });
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-50)));
  } catch {
    /* ignore */
  }
}

export default function Meteors() {
  const reduce = useReducedMotion();
  const { lunar, sky, weather } = useWorld();
  const [stars, setStars] = useState([]);
  const [wish, setWish] = useState(false);
  const [draft, setDraft] = useState('');
  const seq = useRef(0);
  const input = useRef(null);
  const on = lunar === 'new' && sky === 'night' && weather !== 'rain' && !reduce;

  useEffect(() => {
    if (!on) {
      setStars([]);
      return undefined;
    }
    let t = 0;
    const spawn = () => {
      if (!document.hidden && !document.querySelector('.app[data-dark-hour="true"], .app[data-photo="true"], [role="dialog"]')) {
        seq.current += 1;
        const id = seq.current;
        setStars((list) => [...list.slice(-2), { id, x: 40 + Math.random() * 55, y: 4 + Math.random() * 22, len: 0.8 + Math.random() * 0.5 }]);
        window.setTimeout(() => setStars((list) => list.filter((s) => s.id !== id)), 3200);
      }
      t = window.setTimeout(spawn, 6000 + Math.random() * 8000);
    };
    t = window.setTimeout(spawn, 2500);
    return () => window.clearTimeout(t);
  }, [on]);

  useEffect(() => {
    if (wish) input.current?.focus();
  }, [wish]);

  const catchStar = (id) => {
    sfx('card');
    buzz(40);
    setStars((list) => list.map((s) => (s.id === id ? { ...s, caught: true } : s)));
    window.setTimeout(() => setWish(true), 450);
  };

  const close = () => {
    setWish(false);
    setDraft('');
  };

  return (
    <>
      {on && (
        <div className="meteors" aria-hidden={wish}>
          {stars.map((s) => (
            <button
              key={s.id}
              type="button"
              className="meteor"
              data-caught={Boolean(s.caught)}
              style={{ '--x': `${s.x}vw`, '--y': `${s.y}vh`, '--len': s.len }}
              aria-label={tr('追上这颗流星')}
              onClick={() => !s.caught && catchStar(s.id)}
            >
              <span className="meteor__tail" />
              <span className="meteor__head" />
            </button>
          ))}
        </div>
      )}
      {wish && (
        <div className="wish" role="dialog" aria-modal="true" aria-labelledby="wish-title" onPointerDown={(e) => e.target === e.currentTarget && close()}>
          <form
            className="wish__card"
            onSubmit={(e) => {
              e.preventDefault();
              const text = draft.trim();
              if (!text) return;
              saveWish(text);
              bond('wish');
              sfx('rankUp');
              close();
              notice(tr('愿望已经交给星星了。'));
            }}
            onKeyDown={(e) => e.key === 'Escape' && close()}
          >
            <p className="wish__kicker">SHOOTING STAR</p>
            <h2 id="wish-title">{tr('追上流星了。许个愿吧。')}</h2>
            <input
              ref={input}
              className="wish__input"
              value={draft}
              maxLength={40}
              placeholder={tr('悄悄写下来……')}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={tr('你的愿望')}
            />
            <p className="wish__note">{tr('愿望只留在你的浏览器里，谁也看不到。')}</p>
            <div className="wish__actions">
              <button type="submit" className="vbtn vbtn--primary" disabled={!draft.trim()}>
                {tr('许愿')}
              </button>
              <button type="button" className="vbtn" onClick={close}>
                {tr('算了')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
