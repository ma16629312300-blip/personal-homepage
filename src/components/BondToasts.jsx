import { useEffect, useRef, useState } from 'react';
import { tr } from '../lib/i18n.js';
import { images } from '../data/sections.js';
import { BOND_EVENTS, MAX_RANK, onNotice, onRankUp } from '../lib/bond.js';
import { buzz, sfx } from '../lib/sfx.js';

/* 羁绊升级：P3 风格的 "COMMU RANK UP!!" 横幅，从左下斜切进来，停留几秒后离场 */
export function RankUp() {
  const [show, setShow] = useState(null);
  const timer = useRef(0);
  useEffect(() => {
    const off = onRankUp((rank, prev, event) => {
      sfx('rankUp');
      buzz([20, 40, 20, 40, 60]);
      setShow({ rank, prev, why: BOND_EVENTS[event], key: Date.now() });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShow(null), 3800);
    });
    return () => {
      off();
      window.clearTimeout(timer.current);
    };
  }, []);
  return (
    <>
      <p className="visually-hidden" role="status">
        {show ? `${tr('羁绊等级提升到')} ${show.rank === MAX_RANK ? tr('最高级') : show.rank}` : ''}
      </p>
      {show && (
        <div key={show.key} className="rankup" aria-hidden="true">
          <div className="rankup__band">
          <span className="rankup__card" style={{ backgroundImage: `url(${images.cardBack})` }} />
          <span className="rankup__text">
            <span className="rankup__kicker">0 · THE FOOL · tiaotiao</span>
            <strong className="rankup__title">{show.rank === MAX_RANK ? 'COMMU MAX!!' : 'COMMU RANK UP!!'}</strong>
            <span className="rankup__rank">
              RANK <b>{show.prev}</b> → <b>{show.rank === MAX_RANK ? 'MAX' : show.rank}</b>
              <em>{tr(show.why)}</em>
            </span>
          </span>
          </div>
        </div>
      )}
    </>
  );
}

/* 小提示条：找到卡牌、门出现 */
export function Notice() {
  const [msg, setMsg] = useState(null);
  const timer = useRef(0);
  useEffect(() => {
    const off = onNotice((text) => {
      setMsg({ text, key: Date.now() });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMsg(null), 3600);
    });
    return () => {
      off();
      window.clearTimeout(timer.current);
    };
  }, []);
  return (
    <p className="notice" role="status">
      {msg && <span key={msg.key}>{tr(msg.text)}</span>}
    </p>
  );
}
