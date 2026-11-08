import { useEffect, useRef, useState } from 'react';
import { tr, useLang } from '../lib/i18n.js';
import { ambientOn, setAmbient } from '../lib/ambient.js';
import { X } from 'lucide-react';
import { randomDream, setDream, useDream } from '../lib/sky.js';
import { bond } from '../lib/bond.js';
import { sfx } from '../lib/sfx.js';

/* 蝴蝶之梦：停在右上角的蓝蝶。点它展开小菜单，临时改变天空的时段、季节和月相；
   "还原现实"回到真实的时间。只在当前标签页有效。 */
const ROWS = [
  { key: 'sky', zh: '时段', en: 'TIME', options: [['dawn', '清晨'], ['day', '白天'], ['dusk', '放学后'], ['night', '夜晚']] },
  { key: 'season', zh: '季节', en: 'SEASON', options: [['spring', '春'], ['summer', '夏'], ['autumn', '秋'], ['winter', '冬']] },
  { key: 'moon', zh: '月相', en: 'MOON', options: [['full', '满月'], ['new', '新月']] },
  { key: 'weather', zh: '天气', en: 'WEATHER', options: [['clear', '晴'], ['rain', '雨'], ['fog', '雾']] },
  { key: 'festival', zh: '节日', en: 'FESTIVAL', options: [['newyear', '元旦'], ['springfest', '春节'], ['midautumn', '中秋'], ['qixi', '七夕'], ['christmas', '圣诞']] },
];

export function ButterflyIcon() {
  return (
    <svg viewBox="-40 -32 80 64" aria-hidden="true">
      <g className="butterfly__wing butterfly__wing--l">
        <path d="M-2 -2 C-14 -30 -38 -30 -36 -10 C-35 2 -20 4 -4 2 Z" />
        <path d="M-3 3 C-20 6 -30 22 -18 28 C-10 31 -4 18 -2 6 Z" />
      </g>
      <g className="butterfly__wing butterfly__wing--r">
        <path d="M2 -2 C14 -30 38 -30 36 -10 C35 2 20 4 4 2 Z" />
        <path d="M3 3 C20 6 30 22 18 28 C10 31 4 18 2 6 Z" />
      </g>
      <path className="butterfly__body" d="M-1.2 -10 L1.2 -10 L1 16 L-1 16 Z" />
    </svg>
  );
}

export default function Dream() {
  const dream = useDream();
  useLang();
  const [amb, setAmb] = useState(ambientOn);
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const dreaming = Object.keys(dream).length > 0;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector('.dream-perch')?.focus();
      }
    };
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const choose = (key, value) => {
    sfx('select');
    setDream({ [key]: dream[key] === value ? 'auto' : value });
    bond('dream');
  };

  return (
    <div className="dream" ref={root}>
      <button
        type="button"
        className="dream-perch"
        data-dreaming={dreaming}
        aria-expanded={open}
        aria-controls="dream-menu"
        aria-label={tr('蓝蝶：改变天空、季节、月相、天气与节日')}
        onClick={() => {
          sfx(open ? 'hover' : 'select');
          setOpen(!open);
        }}
        onPointerEnter={() => sfx('hover')}
      >
        <ButterflyIcon />
      </button>
      {open && (
        <div className="dream-menu" id="dream-menu" role="group" aria-labelledby="dream-title">
          <header className="dream-menu__head">
            <h2 id="dream-title">
              BUTTERFLY DREAM <span>{tr('蝴蝶之梦')}</span>
            </h2>
            <button type="button" className="dream-menu__close" aria-label={tr('收起')} onClick={() => setOpen(false)}>
              <X size={16} aria-hidden="true" />
            </button>
          </header>
          {ROWS.map((row) => (
            <div key={row.key} className="dream-row" role="group" aria-label={tr(row.zh)}>
              <span className="dream-row__label">
                <b>{tr(row.zh)}</b>
                <i>{row.en}</i>
              </span>
              <span className="dream-row__opts">
                <button type="button" aria-pressed={!dream[row.key]} onClick={() => choose(row.key, 'auto')}>
                  {tr('现实')}
                </button>
                {row.options.map(([value, label]) => (
                  <button key={value} type="button" aria-pressed={dream[row.key] === value} onClick={() => choose(row.key, value)}>
                    {tr(label)}
                  </button>
                ))}
              </span>
            </div>
          ))}
          <div className="dream-menu__actions">
            <button
              type="button"
              className="dream-menu__shuffle"
              onClick={() => {
                sfx('whoosh');
                randomDream();
                bond('dream');
              }}
            >
              {tr('随机做个梦')}
            </button>
            <button
              type="button"
              className="dream-menu__wake"
              disabled={!dreaming}
              onClick={() => {
                sfx('select');
                setDream(null);
              }}
            >
              {tr('还原现实')}
            </button>
          </div>
          <div className="dream-menu__extra">
            <button
              type="button"
              aria-pressed={amb}
              onClick={() => {
                setAmbient(!amb);
                setAmb(!amb);
                sfx('select');
              }}
            >
              {tr('环境音')} {amb ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event('tt:photo'));
              }}
            >
              {tr('拍照模式')}
            </button>
          </div>
          <p className="dream-menu__note">{tr('只在这个页面里有效，关掉就会醒来。')}</p>
        </div>
      )}
      <p className="visually-hidden" role="status">
        {dreaming ? tr('正在蝴蝶之梦里，天空不是现实的时间') : ''}
      </p>
    </div>
  );
}
