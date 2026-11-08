import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { images, sections } from '../data/sections.js';
import { bond } from '../lib/bond.js';
import { sfx } from '../lib/sfx.js';
import Dialogue from './Dialogue.jsx';

/* 天鹅绒房间：集齐五张牌后从蓝门进入。房间缓缓下降，五张牌浮在圆桌上方，
   点牌听它的含义。全部是原创场景与台词。 */
const LINES = [
  '……欢迎。没想到你真的找到了这扇门。',
  '这里是夹在梦与现实之间的房间。',
  '你一路捡到的五张牌，就是你在这个网站里走过的路。',
  '谢谢你陪我把这些都看完。',
  '以后有新的东西，我会再放进这个房间。点一张牌，听听它的话吧。',
];
const CARD_LINES = {
  home: '愚者，一切的起点。你从那片海边出发，一路走到了这里。',
  about: '隐者，坐在末班车上的安静的人。其实一直在等有人来搭话。',
  projects: '战车，那段坡道还没走完。正式的项目会一个个摆上去。',
  playground: '星星，把小小的宇宙放进手心，是我最喜欢做的事。',
  contact: '恋人，天台上那封信随时都可以寄出。我会回的。',
};

export default function VelvetRoom({ onRecord }) {
  const reduce = useReducedMotion();
  const [pick, setPick] = useState(null);
  const root = useRef(null);
  const close = () => {
    window.location.hash = 'home';
  };

  useEffect(() => {
    sfx('door');
    const t = window.setTimeout(() => bond('velvet'), reduce ? 0 : 1600);
    const others = [...document.querySelectorAll('.app > :not(.velvet):not(.notice):not(.rankup)')];
    others.forEach((el) => {
      el.inert = true;
    });
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const f = window.setTimeout(() => root.current?.querySelector('.dlg__box')?.focus({ preventScroll: true }), reduce ? 0 : 1500);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(f);
      others.forEach((el) => {
        el.inert = false;
      });
      window.removeEventListener('keydown', onKey);
    };
  }, [reduce]);

  const picked = sections.find((s) => s.id === pick);
  const lines = useMemo(() => (picked ? [CARD_LINES[picked.id]] : LINES), [picked]);
  const choices = picked
    ? [{ label: '放回桌上', onClick: () => setPick(null) }]
    : [
        { label: '回到海边', href: '#home' },
        { label: '再听一遍', restart: true },
      ];

  return (
    <div className="velvet" ref={root} role="dialog" aria-modal="true" aria-labelledby="velvet-title">
      <div className="velvet__room">
        <img className="velvet__bg" src={images.velvet} alt="" decoding="async" draggable="false" />
        <span className="velvet__lift velvet__lift--l" aria-hidden="true" />
        <span className="velvet__lift velvet__lift--r" aria-hidden="true" />
        <ol className="velvet__cards" aria-label="收集到的五张牌">
          {sections.map((s, i) => (
            <li key={s.id} style={{ '--i': i, '--d': Math.abs(i - 2) * 9 }}>
              <button
                type="button"
                className="vcard"
                data-picked={pick === s.id}
                aria-pressed={pick === s.id}
                onClick={() => {
                  sfx('select');
                  setPick(pick === s.id ? null : s.id);
                }}
                onPointerEnter={() => sfx('hover')}
              >
                <span className="vcard__art" style={{ backgroundImage: `url(${images.cardBack})` }} aria-hidden="true" />
                <span className="vcard__plate">
                  <b>{s.arcana[0]}</b>
                  <span>{s.arcana[1]}</span>
                  <i>{s.arcana[2]}</i>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="velvet__veil" aria-hidden="true" />
      <header className="velvet__title">
        <h2 id="velvet-title">
          VELVET ROOM <span>天鹅绒房间</span>
        </h2>
        <p>梦与现实、精神与物质的夹缝</p>
      </header>
      <button type="button" className="velvet__record" onClick={onRecord} onPointerEnter={() => sfx('hover')}>
        羁绊记录
      </button>
      <a className="velvet__exit" href="#home" onPointerEnter={() => sfx('hover')}>
        <X aria-hidden="true" size={18} />
        <span>离开房间</span>
      </a>
      <div className="velvet__dlg">
        <Dialogue name="tiaotiao" lines={lines} choices={choices} active avatar={images.portrait} />
      </div>
    </div>
  );
}
