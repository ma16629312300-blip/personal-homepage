import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { BOND_EVENTS, BOND_HINTS, BOND_TOTAL, MAX_RANK, resetBond, resetFusion, useBond } from '../lib/bond.js';
import { setDream } from '../lib/sky.js';
import { sfx } from '../lib/sfx.js';
import { setName } from '../lib/name.js';
import { tr, useLang } from '../lib/i18n.js';

/* 羁绊记录：列出所有能做的事，做过的打勾，没做过的只给模糊提示。底部可以清除全部进度（点两次确认）。 */
export default function BondRecord({ onClose }) {
  const state = useBond();
  useLang();
  const [confirm, setConfirm] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    box.current?.querySelector('.record__close')?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  const wipe = () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    resetBond();
    resetFusion();
    try {
      window.localStorage.removeItem('tiaotiao.daily.v1');
    } catch {
      /* ignore */
    }
    setDream(null);
    setName(null);
    sfx('shatter');
    setConfirm(false);
  };

  return (
    <div className="record" role="dialog" aria-modal="true" aria-labelledby="record-title" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="record__box" ref={box}>
        <header className="record__head">
          <h2 id="record-title">
            COMMU RECORD <span>{tr('羁绊记录')}</span>
          </h2>
          <p className="record__rank">
            RANK <b>{state.rank === MAX_RANK ? 'MAX' : state.rank}</b>
            <span>
              {state.count} / {BOND_TOTAL}
            </span>
          </p>
          <button type="button" className="record__close" aria-label={tr('关闭羁绊记录')} onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <ul className="record__list">
          {Object.keys(BOND_EVENTS).map((key) => {
            const done = state.done.has(key);
            return (
              <li key={key} data-done={done}>
                <span className="record__mark" aria-hidden="true">{done ? '✓' : '？'}</span>
                <span className="record__text">{tr(done ? BOND_EVENTS[key] : BOND_HINTS[key])}</span>
                <span className="visually-hidden">{tr(done ? '（已完成）' : '（未完成）')}</span>
              </li>
            );
          })}
        </ul>
        <footer className="record__foot">
          <p>{tr('进度只保存在这个浏览器里。')}</p>
          <button type="button" className="record__wipe" data-confirm={confirm} onClick={wipe} onBlur={() => setConfirm(false)}>
            {tr(confirm ? '确定清除？再点一次' : '清除全部进度')}
          </button>
        </footer>
      </div>
    </div>
  );
}
