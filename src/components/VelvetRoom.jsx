import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { fusionCircle, guardians, images, sections } from '../data/sections.js';
import { FUSION_TOTAL, addFusionPair, bond, fusionPairs, useBond } from '../lib/bond.js';
import { buzz, sfx } from '../lib/sfx.js';
import Dialogue from './Dialogue.jsx';
import { useName } from '../lib/name.js';
import { tr, useLang } from '../lib/i18n.js';

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
  world: '世界，零时钟匠。所有走过的路，都在零点交汇。',
};
const WORLD = { id: 'world', arcana: guardians.world.arcana };

export default function VelvetRoom({ onRecord }) {
  const reduce = useReducedMotion();
  const bondState = useBond();
  const [pick, setPick] = useState(null);
  const [mode, setMode] = useState('view');
  const [sel, setSel] = useState([]);
  const [phase, setPhase] = useState(null);
  const [tried, setTried] = useState(() => fusionPairs().length);
  const timer = useRef(0);
  const root = useRef(null);
  const close = () => {
    window.location.hash = 'home';
  };

  useEffect(() => {
    sfx('door');
    const t = window.setTimeout(() => bond('velvet'), reduce ? 0 : 1600);
    const others = [...document.querySelectorAll('.app > :not(.velvet):not(.notice):not(.rankup):not(.record)')];
    others.forEach((el) => {
      el.inert = true;
    });
    const onKey = (e) => e.key === 'Escape' && !document.querySelector('.record') && close();
    window.addEventListener('keydown', onKey);
    const f = window.setTimeout(() => root.current?.querySelector('.dlg__box')?.focus({ preventScroll: true }), reduce ? 0 : 1500);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(f);
      window.clearTimeout(timer.current);
      others.forEach((el) => {
        el.inert = false;
      });
      window.removeEventListener('keydown', onKey);
    };
  }, [reduce]);

  const name = useName();
  useLang();
  const hasWorld = bondState.done.has('fusion');
  const cards = hasWorld ? [...sections, WORLD] : sections;
  const merging = phase === 'merge';
  const shown = mode === 'view' && !merging ? pick : null;

  const onCard = (id) => {
    if (merging) return;
    sfx('select');
    if (mode === 'fuse') {
      if (id === 'world') return;
      setSel((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length < 2 ? [...list, id] : [list[1], id]));
      return;
    }
    setPhase(null);
    setPick(pick === id ? null : id);
  };
  const startFuse = () => {
    setPick(null);
    setPhase(null);
    setSel([]);
    setMode('fuse');
    sfx('select');
  };
  const cancelFuse = () => {
    setMode('view');
    setSel([]);
  };
  /* 合成：两位守护灵被吸进法阵，闪光之后零时钟匠诞生 */
  const fuse = () => {
    if (sel.length < 2 || merging) return;
    setPhase('merge');
    sfx('fusion');
    buzz([30, 60, 30, 60, 200]);
    timer.current = window.setTimeout(
      () => {
        setTried(addFusionPair(sel[0], sel[1]));
        bond('fusion');
        setMode('view');
        setSel([]);
        setPick('world');
        setPhase('result');
      },
      reduce ? 0 : 1900,
    );
  };

  const lines = useMemo(() => {
    if (merging) return ['两张牌叠在了一起……'];
    if (mode === 'fuse') return [sel.length === 0 ? '选两张牌，把它们叠在法阵上。' : sel.length === 1 ? '再选一张。' : '准备好了。要开始吗？'];
    if (pick === 'world' && phase === 'result') return ['……零时钟匠。两段路交汇的地方，诞生了新的守护灵。', '十种组合，你已经试过 {n} 种。'];
    if (pick) return [CARD_LINES[pick], '守护着这张牌的，是「{g}」。'];
    return name ? ['……欢迎，{name}。没想到你真的找到了这扇门。', ...LINES.slice(1)] : LINES;
  }, [merging, mode, sel.length, pick, phase, name]);
  const choices = pick
    ? [{ label: '放回桌上', onClick: () => setPick(null) }]
    : [
        { label: '回到海边', href: '#home' },
        { label: '再听一遍', restart: true },
      ];
  const g = shown ? guardians[shown] : null;

  return (
    <div className="velvet" ref={root} role="dialog" aria-modal="true" aria-labelledby="velvet-title">
      <div className="velvet__room">
        <img className="velvet__bg" src={images.velvet} alt="" decoding="async" draggable="false" />
        <span className="velvet__lift velvet__lift--l" aria-hidden="true" />
        <span className="velvet__lift velvet__lift--r" aria-hidden="true" />
        <ol className="velvet__cards" data-dim={Boolean(shown) || mode === 'fuse'} aria-label={tr('收集到的牌')}>
          {cards.map((s, i) => {
            const on = mode === 'fuse' ? sel.includes(s.id) : pick === s.id;
            return (
              <li key={s.id} style={{ '--i': i, '--n': cards.length, '--d': Math.abs(i - (cards.length - 1) / 2) * 9 }}>
                <button
                  type="button"
                  className="vcard"
                  data-picked={on}
                  data-world={s.id === 'world'}
                  aria-pressed={on}
                  disabled={mode === 'fuse' && s.id === 'world'}
                  onClick={() => onCard(s.id)}
                  onPointerEnter={() => sfx('hover')}
                >
                  <span className="vcard__art" style={{ backgroundImage: `url(${images.cardBack})` }} aria-hidden="true" />
                  <span className="vcard__plate">
                    <b>{s.arcana[0]}</b>
                    <span>{s.arcana[1]}</span>
                    <i>{tr(s.arcana[2])}</i>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="velvet__veil" aria-hidden="true" />
      <div className="velvet__stage" aria-hidden="true">
        {(mode === 'fuse' || merging) && (
          <div className="fuse" data-go={merging}>
            <img className="fuse__circle" src={fusionCircle} alt="" draggable="false" />
            {sel[0] && <img key={sel[0]} className="fuse__g fuse__g--a" src={guardians[sel[0]].src} alt="" draggable="false" />}
            {sel[1] && <img key={sel[1]} className="fuse__g fuse__g--b" src={guardians[sel[1]].src} alt="" draggable="false" />}
            <span className="fuse__flash" />
          </div>
        )}
        {g && (
          <figure key={`${shown}-${phase}`} className="guardian" data-result={phase === 'result'}>
            {phase === 'result' && <img className="fuse__circle fuse__circle--after" src={fusionCircle} alt="" draggable="false" />}
            <img className="guardian__img" src={g.src} alt="" decoding="async" draggable="false" />
            <figcaption>
              <b>
                {g.arcana[0]} · {g.arcana[1]}
              </b>
              <strong>{tr(g.name)}</strong>
              <i>{g.en}</i>
            </figcaption>
          </figure>
        )}
      </div>
      <p className="visually-hidden" role="status">
        {g ? `${tr('守护灵')}：${tr(g.name)}` : ''}
      </p>
      <header className="velvet__title">
        <h2 id="velvet-title">
          VELVET ROOM <span>{tr('天鹅绒房间')}</span>
        </h2>
        <p>{tr('梦与现实、精神与物质的夹缝')}</p>
      </header>
      <button type="button" className="velvet__record" onClick={onRecord} onPointerEnter={() => sfx('hover')}>
        {tr('羁绊记录')}
      </button>
      <a className="velvet__exit" href="#home" onPointerEnter={() => sfx('hover')}>
        <X aria-hidden="true" size={18} />
        <span>{tr('离开房间')}</span>
      </a>
      <div className="velvet__dlg">
        <div className="velvet__actions">
          {mode === 'view' && !merging && (
            <button type="button" className="vbtn vbtn--primary" onClick={startFuse} onPointerEnter={() => sfx('hover')}>
              {tr(hasWorld ? '再合成一次' : '合成守护灵')}
              {hasWorld && (
                <small>
                  {tried} / {FUSION_TOTAL}
                </small>
              )}
            </button>
          )}
          {mode === 'fuse' && !merging && (
            <>
              <button type="button" className="vbtn vbtn--primary" disabled={sel.length < 2} onClick={fuse}>
                {tr('开始合成')}
              </button>
              <button type="button" className="vbtn" onClick={cancelFuse}>
                {tr('取消')}
              </button>
            </>
          )}
        </div>
        <Dialogue
          name="tiaotiao"
          lines={lines}
          vars={{ name: name || '', n: String(tried), g: g ? tr(g.name) : pick ? tr(guardians[pick].name) : '' }}
          choices={choices}
          active
          avatar={images.portrait}
        />
      </div>
    </div>
  );
}
